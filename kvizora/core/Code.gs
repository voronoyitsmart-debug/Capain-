/**
 * Online Tests — v4  (main logic, the same file for every subject)
 * ------------------------------------------------------------------
 * Teacher page:  <web app URL>?page=teacher     (asks for the PIN below)
 * Student link:  <web app URL>?t=<test id>      (copy it from the teacher page)
 * Plain link:    <web app URL>                  (shows the tests open right now)
 *
 * Tests are kept in the "Tests" sheet, answers in "Results". Answer keys never
 * leave the server. Set a teacher PIN here; the Gemini key is pasted on the page.
 *
 * Everything that differs between subjects (the ready-made tests, the AI prompt,
 * question types, formulas, how the two languages work) lives in Seed.gs.
 *
 * Two languages: every text a student sees (section title, instructions, question,
 * note, options) is stored as { uk: '…', en: '…' }. Answer keys are shared.
 *   mode 'switch'    — the student switches the whole test between the languages
 *                      the teacher turned on (maths, sciences…).
 *   mode 'translate' — the test stays in English; if the teacher allows it, the
 *                      student can open a Ukrainian translation of a question.
 *
 * Question types: mc, num, fix, short, open, match (pairs: left item → its right item,
 * 1 point per pair; the right column is shuffled on the server so the order never
 * gives the key away), solve (an equation or a system the student solves step by step
 * on the page: every step is checked, the roots are compared with the key — MathKit
 * at the end of this file). Any question may carry a picture (img: an https link or a
 * small inline data:image).
 *
 * Tools (SUBJECT.tools): calculator, graphs, ruler, protractor, formula sheet. The teacher
 * turns each one on or off per test (content.tools); the student opens them from the page.
 */

// ===== SETTINGS =====
const TEACHER_PIN = 'change-me-2026';   // the teacher types this to open the teacher page
// ====================

const GRACE_MS = 2 * 60 * 1000;   // answers sent up to 2 min late still count as on time

const TESTS_SHEET = 'Tests', RESULTS_SHEET = 'Results';
const T_HEAD = ['ID', 'Title', 'Class', 'Source', 'Status', 'Created', 'Updated', 'Settings', 'Content'];
const T = { ID: 1, TITLE: 2, FOLDER: 3, SOURCE: 4, STATUS: 5, CREATED: 6, UPDATED: 7, SETTINGS: 8, CONTENT: 9 };
const R_HEAD = ['ID', 'Test ID', 'Test', 'Started', 'Submitted', 'Name', 'Class', 'Status', 'Score', 'Max',
  'Deadline', 'Answers', 'Overrides', 'Activity'];
const R = { ID: 1, TEST: 2, TTITLE: 3, STARTED: 4, SUBMITTED: 5, NAME: 6, GROUP: 7, STATUS: 8, SCORE: 9, MAX: 10,
  DEADLINE: 11, ANSWERS: 12, OVERRIDES: 13, ACTIVITY: 14 };

// ---------- Web app entry ----------
function doGet(e) {
  const p = (e && e.parameter) || {};
  const page = p.page === 'teacher' ? 'Teacher' : 'Student';
  const t = HtmlService.createTemplateFromFile(page);
  t.testId = String(p.t || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 16);
  return t.evaluate()
    .setTitle(page === 'Teacher' ? 'Tests — Teacher' : 'Online Test')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ---------- helpers ----------
function ms_(v) { return v instanceof Date ? v.getTime() : (v ? new Date(v).getTime() || null : null); }
function json_(v, d) { try { const x = JSON.parse(v || ''); return x == null ? d : x; } catch (e) { return d; } }
function clean_(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ').trim().slice(0, max); }
function nameKey_(n) { return clean_(n, 80).toLowerCase().replace(/\s+/g, ' '); }
function rid_(n) { return Utilities.getUuid().replace(/-/g, '').slice(0, n || 10); }
function get_(r, c) { return r.v[c - 1]; }
function withLock_(fn) { const l = LockService.getScriptLock(); l.waitLock(25000); try { return fn(); } finally { l.releaseLock(); } }
function props_() { return PropertiesService.getScriptProperties(); }
function appUrl_() { try { return ScriptApp.getService().getUrl() || ''; } catch (e) { return ''; } }
/** A message the pages show to the person. The [#code] lets the page show it in Ukrainian or English. */
function uerr_(code, text) { return new Error('USER: ' + text + ' [#' + code + ']'); }
function checkPin_(pin) { if (String(pin || '') !== String(TEACHER_PIN)) { Utilities.sleep(800); throw uerr_('pin', 'Wrong PIN.'); } }

function sheetOf_(name, head) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(head); sh.setFrozenRows(1); sh.getRange(1, 1, 1, head.length).setFontWeight('bold'); }
  return sh;
}
function rowsOf_(sh, ncol) {
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, ncol).getValues().map((v, i) => ({ row: i + 2, v: v })).filter(r => r.v[0]);
}
function resultsSheet_() { return sheetOf_(RESULTS_SHEET, R_HEAD); }
function testsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const isNew = !ss.getSheetByName(TESTS_SHEET);
  const sh = sheetOf_(TESTS_SHEET, T_HEAD);
  if (isNew) seedTests_(sh, null);
  return sh;
}
function findTest_(sh, id) {
  const r = rowsOf_(sh, T_HEAD.length).filter(x => String(get_(x, T.ID)) === String(id))[0];
  if (!r) throw uerr_('not_found', 'This test was not found.');
  return r;
}

// ---------- subject (defined in Seed.gs) ----------
const QTYPES = ['mc', 'num', 'chem', 'fix', 'short', 'open', 'match', 'solve'];
const TOOLS = ['calc', 'graph', 'ruler', 'protractor', 'formulas'];
const MAX_CONTENT = 48000;   // one spreadsheet cell holds 50 000 characters
const LANGS = ['uk', 'en'];
function subject_() {
  const s = (typeof SUBJECT === 'object' && SUBJECT) ? SUBJECT : {};
  const qt = (Array.isArray(s.qtypes) ? s.qtypes : []).filter(x => QTYPES.indexOf(x) >= 0);
  return {
    key: clean_(s.key || 'tests', 30),
    name: { uk: clean_((s.name && s.name.uk) || 'Тести', 60), en: clean_((s.name && s.name.en) || 'Tests', 60) },
    mode: s.mode === 'translate' ? 'translate' : 'switch',
    qtypes: qt.length ? qt : ['mc', 'num', 'short', 'open'],
    formulas: s.formulas !== false,
    mcGap: !!s.mcGap,
    langs: subjLangs_(s),
    tools: (Array.isArray(s.tools) ? s.tools : []).filter(x => TOOLS.indexOf(x) >= 0),
    formulaSheet: s.formulaSheet ? loc_(s.formulaSheet, 6000) : null
  };
}
/** Languages the subject offers at all (SUBJECT.langs). Default: both; English tests: English. Ukrainian language: ['uk']. */
function subjLangs_(s) {
  if (s.mode === 'translate') return ['en'];
  const on = Array.isArray(s.langs) ? LANGS.filter(l => s.langs.indexOf(l) >= 0) : [];
  return on.length ? on : LANGS.slice();
}
/** Ready-made tests from Seed.gs (SEED_TESTS, or the older single SEED_CONTENT). */
function seedList_() {
  if (typeof SEED_TESTS !== 'undefined' && Array.isArray(SEED_TESTS)) return SEED_TESTS;
  if (typeof SEED_CONTENT !== 'undefined') return [{ title: 'Sample test', open: true, content: SEED_CONTENT }];
  return [];
}
/** Add ready-made tests. skipTitles: titles already in the library (they are not added twice). */
function seedTests_(sh, skipTitles) {
  const have = {}; (skipTitles || []).forEach(t => { have[String(t).toLowerCase()] = 1; });
  const now = Date.now(); let n = 0;
  seedList_().forEach(st => {
    const tl = st.title && typeof st.title === 'object' ? loc_(st.title, 140) : null;
    const content = normContent_(tl ? Object.assign({}, st.content, { title: tl }) : st.content);
    const title = (tl ? titleCol_(tl, content.langs) : clean_(st.title, 140)) || 'Sample test';
    if (have[title.toLowerCase()]) return;
    const s = normSettings_({ startMode: 'manual', endMode: 'manual', minutes: Number(st.minutes) || 0 });
    let status = 'draft';
    if (st.open && !skipTitles) { status = 'published'; s.opensAt = now - 1000; }   // first install: already open
    sh.appendRow([rid_(), title, clean_(st.folder, 60), 'sample', status, new Date(now), new Date(now),
      JSON.stringify(s), JSON.stringify(content)]);
    n++;
  });
  return n;
}

// ---------- settings & state ----------
function normSettings_(s) {
  s = s || {};
  const num = v => (v === null || v === '' || v === undefined || !isFinite(Number(v))) ? null : Number(v);
  return {
    startMode: s.startMode === 'time' ? 'time' : 'manual',
    endMode: ['manual', 'hours', 'time'].indexOf(s.endMode) >= 0 ? s.endMode : 'manual',
    opensAt: num(s.opensAt),
    closesAt: num(s.closesAt),
    stoppedAt: num(s.stoppedAt),
    hours: Math.max(0, Math.min(720, Number(s.hours) || 0)),
    minutes: Math.max(0, Math.min(600, Math.round(Number(s.minutes) || 0))),
    shuffleQ: s.shuffleQ !== false,
    shuffleO: s.shuffleO !== false,
    showScore: !!s.showScore,
    monitor: s.monitor !== false
  };
}
/** When the test closes (ms) or null. */
function closeAt_(s) {
  let c = null;
  if (s.endMode === 'time' && s.closesAt) c = s.closesAt;
  if (s.endMode === 'hours' && s.opensAt && s.hours) c = s.opensAt + s.hours * 3600000;
  if (s.stoppedAt && s.opensAt && s.stoppedAt >= s.opensAt) c = c ? Math.min(c, s.stoppedAt) : s.stoppedAt;
  return c;
}
function stateOf_(status, s, now) {
  if (status !== 'published') return 'draft';
  if (!s.opensAt) return 'waiting';           // published but not started yet
  if (now < s.opensAt) return 'scheduled';
  const c = closeAt_(s);
  if (c && now >= c) return 'closed';
  return 'open';
}

// ---------- two-language text ----------
const CYR_ = /[Ѐ-ӿ]/, LAT_ = /[A-Za-z]/;
/** True when a text has no words outside $…$ formulas (numbers, symbols): it reads the same in both languages. */
function neutral_(s) { const w = String(s).replace(/\$[^$]*\$/g, ''); return !CYR_.test(w) && !LAT_.test(w); }
/** Normalise a text to { uk, en }. An old plain string goes to the language it is written in. */
function loc_(v, max) {
  if (v && typeof v === 'object' && !Array.isArray(v)) return { uk: clean_(v.uk, max), en: clean_(v.en, max) };
  const s = clean_(v, max);
  if (!s) return { uk: '', en: '' };
  if (neutral_(s)) return { uk: s, en: s };
  if (subject_().mode === 'translate') return { uk: '', en: s };   // English tests: plain text is the English original
  const sl = subject_().langs; if (sl.length === 1) { const o = { uk: '', en: '' }; o[sl[0]] = s; return o; }   // one-language subject
  return CYR_.test(s) ? { uk: s, en: '' } : { uk: '', en: s };
}
function pick_(L, lang) { if (!L) return ''; const o = lang === 'uk' ? 'en' : 'uk'; return L[lang] || L[o] || ''; }
function anyText_(L) { return !!(L && (L.uk || L.en)); }
/** Languages the teacher turned on for this content. */
function contentLangs_(c) {
  if (subject_().mode === 'translate') return ['en'];
  const sl = subject_().langs;
  const on = (Array.isArray(c.langs) ? c.langs : []).filter(l => sl.indexOf(l) >= 0);
  return on.length ? sl.filter(l => on.indexOf(l) >= 0) : null;
}
/** Every { uk, en } text of a content object (for checks and translation). */
function eachText_(content, fn) {
  if (content.title) fn(content.title, { field: 'ttitle' });
  (content.sections || []).forEach((s, si) => {
    fn(s.title, { si: si, field: 'title' }); fn(s.instructions, { si: si, field: 'instructions' });
    s.questions.forEach((q, qi) => {
      fn(q.q, { si: si, qi: qi, field: 'q' }); fn(q.note, { si: si, qi: qi, field: 'note' });
      (q.options || []).forEach((o, oi) => fn(o, { si: si, qi: qi, field: 'options', oi: oi }));
      (q.pairs || []).forEach((p, pi) => { fn(p.l, { si: si, qi: qi, field: 'pairs', pi: pi, side: 'l' }); fn(p.r, { si: si, qi: qi, field: 'pairs', pi: pi, side: 'r' }); });
    });
  });
}

// ---------- content model ----------
/** A picture under a question: an https link or a small inline image (data:image/…). '' if not valid. */
function cleanImg_(v) {
  const s = String(v == null ? '' : v).trim();
  if (/^https:\/\/[^\s"'<>]{4,2000}$/.test(s)) return s;
  if (s.length <= 20000 && /^data:image\/(png|jpeg|gif|webp|svg\+xml)(;base64)?,[^\s"'<>]+$/.test(s)) return s;
  return '';
}
function normQ_(q) {
  if (!q || typeof q !== 'object') return null;
  const type = QTYPES.indexOf(q.type) >= 0 ? q.type : 'short';
  const out = { id: /^[A-Za-z0-9]{3,16}$/.test(String(q.id || '')) ? String(q.id) : rid_(6),
    type: type, q: loc_(q.q, 1000), note: loc_(q.note, 300) };
  const img = cleanImg_(q.img); if (img) out.img = img;
  if (type === 'match') {
    // a pair needs text on both sides (in at least one language)
    out.pairs = (Array.isArray(q.pairs) ? q.pairs : []).map(p => ({ l: loc_(p && p.l, 200), r: loc_(p && p.r, 200) }))
      .filter(p => anyText_(p.l) && anyText_(p.r)).slice(0, 12);
    if (!out.pairs.length) return null;
  } else if (type === 'solve') {
    // eq: the equation, or several lines for a system; vars: the unknowns (found by themselves when empty);
    // accept: the teacher's own answer (else MathKit finds it); steps: 'off' | 'show' (the teacher sees the working) | 'grade' (+1 point for correct working)
    const eqs = Array.isArray(q.eq) ? q.eq : String(q.eq || '').split('\n');
    out.eq = eqs.map(x => clean_(x, 300)).filter(Boolean).slice(0, 4);
    if (!out.eq.length) return null;
    const vs = Array.isArray(q.vars) ? q.vars : String(q.vars || '').split(/[\s,;]+/);
    out.vars = vs.map(v => clean_(v, 2).toLowerCase()).filter(v => /^[a-z]$/.test(v)).slice(0, 3);
    const acc = Array.isArray(q.accept) ? q.accept : String(q.accept || '').split('\n');
    out.accept = acc.map(x => clean_(x, 200)).filter(Boolean).slice(0, 12);
    out.steps = ['off', 'show', 'grade'].indexOf(q.steps) >= 0 ? q.steps : 'show';
  } else if (type === 'mc') {
    out.options = (Array.isArray(q.options) ? q.options : []).map(o => loc_(o, 200)).filter(anyText_).slice(0, 8);
    const a = Number(q.answer);
    out.answer = (q.answer !== null && q.answer !== '' && Number.isInteger(a) && a >= 0 && a < out.options.length) ? a : null;
  } else if (type === 'num') {
    const acc = Array.isArray(q.accept) ? q.accept : String(q.accept || '').split('\n');
    out.accept = acc.map(x => clean_(x, 120)).filter(Boolean).slice(0, 20);
    const t = Number(q.tol);
    out.tol = (isFinite(t) && t >= 0) ? t : 0;   // absolute tolerance, 0 = exact value
  } else if (type === 'fix' || type === 'short' || type === 'chem') {
    const acc = Array.isArray(q.accept) ? q.accept : String(q.accept || '').split('\n');
    out.accept = acc.map(x => clean_(x, 500)).filter(Boolean).slice(0, 20);
    if (type === 'fix') out.key = clean_(q.key, 200);
  }
  if (!anyText_(out.q) && !(type === 'mc' && out.options.length) && type !== 'match' && type !== 'solve') return null;
  return out;
}
function normContent_(c) {
  c = c || {};
  const secs = (Array.isArray(c.sections) ? c.sections : []).map(s => ({
    title: loc_(s.title, 120), instructions: loc_(s.instructions, 400),
    questions: (Array.isArray(s.questions) ? s.questions : []).map(normQ_).filter(Boolean)
  })).filter(s => s.questions.length).slice(0, 30);
  const out = { sections: secs, allowTranslate: !!c.allowTranslate };
  const offer = subject_().tools;
  if (offer.length) {   // tools the teacher gave the students for this test; a custom formula sheet replaces the subject's
    out.tools = (Array.isArray(c.tools) ? c.tools : []).filter((x, i, a) => offer.indexOf(x) >= 0 && a.indexOf(x) === i);
    if (c.sheet && anyText_(loc_(c.sheet, 6000))) out.sheet = loc_(c.sheet, 6000);
  }
  const tl = c.title ? loc_(c.title, 140) : null;   // the test's name in both languages (older tests: only the sheet's Title column)
  if (tl && anyText_(tl)) out.title = tl;
  let langs = contentLangs_(c);
  if (!langs) {   // older tests: the languages that actually have text
    const has = { uk: false, en: false };
    eachText_(out, L => { if (L.uk && L.uk !== L.en) has.uk = true; if (L.en && L.en !== L.uk) has.en = true; });
    const sl = subject_().langs;
    langs = sl.filter(l => has[l]);
    if (!langs.length) langs = sl.slice();
  }
  out.langs = langs;
  return out;
}
function contentOf_(row) { return normContent_(json_(get_(row, T.CONTENT), { sections: [] })); }
/** The test's name as { uk, en }. An older test has only the Title column: it is shown as it is in both languages. */
function titlesOf_(row, content) {
  const col = String(get_(row, T.TITLE));
  const tl = content && content.title;
  return tl && anyText_(tl) ? { uk: pick_(tl, 'uk'), en: pick_(tl, 'en') } : { uk: col, en: col };
}
/** The Title column (one string, used by the sheet and the Results list) from a two-language name. */
function titleCol_(tl, langs) { return clean_(tl[(langs || [])[0]] || tl.uk || tl.en, 140); }
function countQ_(content) { return (content.sections || []).reduce((n, s) => n + s.questions.length, 0); }
/** Points a question is worth: a matching task gives one point per pair. */
function ptsOf_(q) { return q.type === 'open' ? 0 : q.type === 'match' ? Math.max(1, q.pairs.length) : q.type === 'solve' && q.steps === 'grade' ? 2 : 1; }
function maxScore_(content) {
  let m = 0;
  (content.sections || []).forEach(s => s.questions.forEach(q => { m += ptsOf_(q); }));
  return m;
}
/** Secret, stable order of a matching task's right column (shown order j → pair index perm[j]). */
function permFor_(id, n) {
  let h = 2166136261;
  (String(id) + '|' + permSalt_()).split('').forEach(ch => { h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; });
  const p = []; for (let i = 0; i < n; i++) p.push(i);
  for (let j = n - 1; j > 0; j--) { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; const k = h % (j + 1); const t = p[j]; p[j] = p[k]; p[k] = t; }
  if (n > 1 && p.every((v, i) => v === i)) p.push(p.shift());
  return p;
}
let PERM_SALT_ = null;
function permSalt_() {
  if (PERM_SALT_) return PERM_SALT_;
  const pr = props_(); let s = pr.getProperty('perm_salt');
  if (!s) { s = rid_(16); pr.setProperty('perm_salt', s); }
  return (PERM_SALT_ = s);
}
/** Texts missing in a language the teacher turned on: [{ lang, where }]. */
function missingTr_(content) {
  const out = [], langs = subject_().mode === 'translate' ? (content.allowTranslate ? ['uk'] : []) : content.langs;
  langs.forEach(lang => eachText_(content, (L, at) => {
    if (subject_().mode === 'translate' && at.field !== 'q' && at.field !== 'instructions') return;   // English tests translate questions only
    if (anyText_(L) && !L[lang]) out.push({ lang: lang, at: at });
  }));
  return out;
}

// ---------- grading ----------
const SUP_ = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁺': '+', '⁻': '-' };
const SUB_ = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', '₊': '+', '₋': '-' };
/** Parse a number: "3/4", "1,5", "2 1/2", "x=5", "-3.2", "50%", "3·10^8", "3×10⁸", "3e8", "1 000", "12 cm", "9,8 m/s^2", π. Returns { v, pct } or null. */
function parseNumRaw_(s) {
  s = String(s == null ? '' : s).trim().toLowerCase();
  if (!s) return null;
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, m => '^' + m.split('').map(ch => SUP_[ch]).join(''));   // 10⁻¹⁹ -> 10^-19, м/с² -> м/с^2
  s = s.replace(/^[a-zа-яіїєґ]\w*\s*=\s*/, '')     // drop a leading "x =" / "v="
       .replace(/[−–]/g, '-')                     // unicode minus / dash
       .replace(/\s+/g, ' ').trim();
  let pct = false;
  if (/%$/.test(s)) { pct = true; s = s.replace(/%$/, '').trim(); }
  if (/^-?\d{1,3}( \d{3})+([.,]\d+)?$/.test(s)) s = s.replace(/ /g, '');   // "1 000" thousands
  s = s.replace(/(\d),(\d)/g, '$1.$2');          // decimal comma -> dot (between digits)
  s = s.replace(/\bpi\b|π/g, String(Math.PI));
  const one = str => {
    let m;
    if ((m = /^(-?\d+(?:\.\d+)?)\s+(\d+)\s*\/\s*(\d+)$/.exec(str))) {   // mixed number "2 1/2"
      const whole = parseFloat(m[1]), num = parseFloat(m[2]), den = parseFloat(m[3]);
      return den !== 0 ? (whole < 0 ? -1 : 1) * (Math.abs(whole) + num / den) : null;
    }
    if ((m = /^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/.exec(str))) {   // fraction "3/4"
      const den = parseFloat(m[2]); return den !== 0 ? parseFloat(m[1]) / den : null;
    }
    if ((m = /^(-?\d+(?:\.\d+)?)\s*(?:[*×·x]\s*10\s*\^\s*\(?\s*(-?\d+)\s*\)?|e(-?\d+))$/.exec(str))) {   // 3·10^8, 3e8
      return parseFloat(m[1]) * Math.pow(10, parseInt(m[2] != null ? m[2] : m[3], 10));
    }
    if ((m = /^10\s*\^\s*\(?\s*(-?\d+)\s*\)?$/.exec(str))) return Math.pow(10, parseInt(m[1], 10));
    if (/^-?\d+(?:\.\d+)?$/.test(str)) return parseFloat(str);
    return null;
  };
  let v = one(s);
  if (v === null) {   // a number followed by a unit: "12 cm", "5 м/с", "20 °C"
    // the unit starts with a letter and may carry powers: "m/s^2", "дм3", "кг·м/с"
    const m = /^(.*\d)\s*([a-zа-яіїєґµΩ°][a-zа-яіїєґµΩ°²³0-9\/\^·.\s-]*)$/.exec(s);
    if (m) v = one(m[1].trim());
  }
  if (v === null || !isFinite(v)) return null;
  return { v: v, pct: pct };
}
function parseNum_(s) { const p = parseNumRaw_(s); return p ? (p.pct ? p.v / 100 : p.v) : null; }
/** Does the student's numeric answer match any accepted value within tolerance? "50%" and "50" both match 50%. */
function numMatch_(accept, tol, given) {
  const gp = parseNumRaw_(given);
  const vals = p => p.pct ? [p.v / 100, p.v] : [p.v];
  for (let i = 0; i < accept.length; i++) {
    const ap = parseNumRaw_(accept[i]);
    if (ap && gp) {
      const av = ap.pct ? ap.v / 100 : ap.v;
      const gs = (ap.pct || gp.pct) ? vals(gp).concat(ap.pct && !gp.pct ? [gp.v / 100] : []) : [gp.v];
      const as = ap.pct ? [av, ap.v] : [av];
      for (let a = 0; a < as.length; a++) for (let b = 0; b < gs.length; b++) {
        const t = tol > 0 ? tol : Math.max(1e-9, Math.abs(as[a]) * 1e-9);
        if (Math.abs(as[a] - gs[b]) <= t + 1e-12) return true;
      }
    } else if (norm_(accept[i]) && norm_(accept[i]).replace(/ /g, '') === norm_(given).replace(/ /g, '')) {
      return true;   // non-numeric exact match (e.g. "x>3", "no solution", "немає розв'язків")
    }
  }
  return false;
}
function norm_(s) {
  s = String(s || '').toLowerCase().replace(/[‘’ʼ`´]/g, "'").replace(/[–—]/g, ' ').replace(/ё/g, 'е');
  [[/\bi'm\b/g, 'i am'], [/\bdidn't\b/g, 'did not'], [/\baren't\b/g, 'are not'], [/\bisn't\b/g, 'is not'],
   [/\bwasn't\b/g, 'was not'], [/\bcan't\b/g, 'cannot'], [/\bdon't\b/g, 'do not'], [/\bdoesn't\b/g, 'does not'],
   [/\bit's\b/g, 'it is'], [/\bshe's\b/g, 'she is'], [/\bhe's\b/g, 'he is'], [/\bwind's\b/g, 'wind is']
  ].forEach(p => { s = s.replace(p[0], p[1]); });
  // keep Latin and Cyrillic letters, digits, apostrophes and a few symbols answers use (x>3, h2o)
  return s.replace(/[^a-z0-9Ѐ-ӿ'<>=+\-]+/g, ' ').replace(/\s+/g, ' ').trim();
}
// Cyrillic letters that look like Latin ones — students on a Ukrainian keyboard often type НСl or Н2О.
const HOMO_ = { 'А': 'A', 'В': 'B', 'С': 'C', 'Е': 'E', 'Н': 'H', 'І': 'I', 'К': 'K', 'М': 'M', 'О': 'O', 'Р': 'P', 'Т': 'T', 'Х': 'X',
  'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x', 'і': 'i' };
/**
 * Normalise a chemical formula or equation ("chem" answers). Letter case matters (CO ≠ Co).
 * Spaces, subscript digits, Cyrillic look-alikes, $\ce{…}$, ↑/↓ are ignored; "=", "->", "→" are the same arrow;
 * the order of substances on each side of an equation does not matter.
 */
function chemNorm_(s) {
  s = String(s == null ? '' : s);
  s = s.replace(/\$/g, '').replace(/\\ce\s*\{([\s\S]*)\}/g, '$1');
  s = s.replace(/[₀₁₂₃₄₅₆₇₈₉₊₋]/g, ch => SUB_[ch]).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/g, ch => SUP_[ch]);
  s = s.replace(/[АВСЕНІКМОРТХаеорсухі]/g, ch => HOMO_[ch]);
  s = s.replace(/[−–—]/g, '-').replace(/\s+/g, '').replace(/[↑↓]/g, '');
  s = s.replace(/<=+>|<-+>|⇄|⇌|↔/g, '⇌').replace(/-+>|=+>|⟶|→|⇒|=/g, '→');
  s = s.replace(/[·•⋅∙*]/g, '·');
  const arrow = s.indexOf('→') >= 0 ? '→' : s.indexOf('⇌') >= 0 ? '⇌' : '';
  if (arrow) {
    const sides = s.split(arrow);
    if (sides.length === 2) {
      s = sides.map(side => {
        const parts = side.split('+');
        if (parts.some(p => !p)) return side;   // ions like Na+ — compare as written
        return parts.map(p => p.replace(/^1(?=[A-Z(])/, '')).sort().join('+');
      }).join(arrow);
    }
  }
  return s;
}
/** A matching answer is stored as "j0,j1,…": for left item i, the shown index j of the chosen right item ('' = none). */
function parseMatch_(given) {
  return String(given == null ? '' : given).split(',').map(x => { x = x.trim(); return /^\d{1,2}$/.test(x) ? Number(x) : null; });
}
function gradeMatch_(q, given, ov) {
  const n = q.pairs.length, perm = permFor_(q.id, n), picks = parseMatch_(given);
  let got = 0;
  const items = q.pairs.map((p, i) => {
    const j = picks[i], has = j !== null && j !== undefined && j < n, k = has ? perm[j] : null;
    // the same right text twice (e.g. two organs of one system) counts as correct either way
    const ok = has && (k === i || (!!norm_(pick_(q.pairs[k].r, 'uk')) && norm_(pick_(q.pairs[k].r, 'uk')) === norm_(pick_(p.r, 'uk'))));
    if (ok) got++;
    return { l: p.l, given: has ? q.pairs[k].r : null, correct: p.r, ok: ok };
  });
  const auto = got === n;
  return { type: 'match', given: String(given == null ? '' : given), items: items, auto: auto, override: ov == null ? null : ov,
    ok: ov === true ? true : ov === false ? false : auto, pts: n, got: ov === true ? n : ov === false ? 0 : got, scored: true };
}
/** Grade one question given the student's raw answer and any teacher override. */
function gradeQ_(q, given, ov) {
  const r = gradeOne_(q, given, ov);
  if (r.pts === undefined) { r.pts = ptsOf_(q); r.got = r.scored && r.ok ? r.pts : 0; }
  return r;
}
/** The solution of a "solve" question (MathKit), kept for this run: grading a class re-uses it. */
const SOLVE_KEYS_ = {};
function solveKey_(q) {
  const k = JSON.stringify([q.eq, q.vars, q.accept]);
  if (!SOLVE_KEYS_[k]) { try { SOLVE_KEYS_[k] = MK.key(q.eq, q.vars, q.accept); } catch (e) { SOLVE_KEYS_[k] = { vars: [], sols: [], none: false, all: false, err: 'syntax' }; } }
  return SOLVE_KEYS_[k];
}
/** The key in a form people read: { vars, sols: [["2"], ["3"]], none, all, err }. */
function solveKeyShown_(K) { return { vars: K.vars, sols: K.sols.map(s => s.map(MK.fmt)), none: K.none, all: K.all, err: K.err }; }
/**
 * A "solve" answer is stored as JSON: { s: [step lines], r: roots (["6", "-1"]; a system: [["2", "3"]]), n: no roots, a: every number }.
 * 1 point for the right roots; with steps 'grade' one more for working where every step keeps the roots.
 */
function gradeSolve_(q, given, ov) {
  const raw = String(given == null ? '' : given), A = json_(raw, {}) || {};
  const K = solveKey_(q), multi = K.vars.length > 1;
  const lines = (Array.isArray(A.s) ? A.s : []).map(x => clean_(x, 300)).filter(Boolean).slice(0, 40);
  const steps = lines.map(line => { let st = 'bad'; try { st = K.err ? 'skip' : MK.checkLine(line, K); } catch (e) {} return { s: line, st: st }; });
  const rs = (Array.isArray(A.r) ? A.r : []).slice(0, 12)
    .map(x => multi ? (Array.isArray(x) ? x.slice(0, K.vars.length).map(y => clean_(y, 80)) : []) : clean_(Array.isArray(x) ? x[0] : x, 80))
    .filter(x => multi ? x.some(Boolean) : !!x);
  const none = !!A.n, all = !!A.a;
  let rootsOk = false;
  if (!K.err) {
    const sols = rs.map(x => multi ? K.vars.map((v, i) => MK.value(x[i])) : [MK.value(x)]);
    const readable = sols.every(t => t.every(v => isFinite(v)));
    if (K.none) rootsOk = none && !all && !rs.length;
    else if (K.all) rootsOk = all && !none && !rs.length;
    else rootsOk = !none && !all && rs.length > 0 && readable && MK.sameSols(sols, K.sols);
  }
  const pts = ptsOf_(q);
  const counted = steps.filter(x => x.st === 'ok' || x.st === 'extra').length;
  const workOk = counted > 0 && !steps.some(x => x.st === 'lost' || x.st === 'wrong' || x.st === 'bad');
  let got = (rootsOk ? 1 : 0) + (pts === 2 && workOk ? 1 : 0);
  const auto = got === pts;
  if (ov === true) got = pts; else if (ov === false) got = 0;
  return { type: 'solve', given: raw, eq: q.eq, steps: steps, roots: rs, none: none, all: all, key: solveKeyShown_(K), mode: q.steps,
    rootsOk: rootsOk, workOk: workOk, auto: auto, override: ov == null ? null : ov, ok: got === pts, pts: pts, got: got, scored: true };
}
function gradeOne_(q, given, ov) {
  if (q.type === 'open') return { type: 'open', given: String(given == null ? '' : given), scored: false };
  if (q.type === 'match') return gradeMatch_(q, given, ov);
  if (q.type === 'solve') return gradeSolve_(q, given, ov);
  if (q.type === 'mc') {
    const pick = (typeof given === 'number') ? given : null;
    const auto = pick !== null && pick === q.answer;
    const ok = ov === true ? true : ov === false ? false : auto;
    return { type: 'mc', pick: pick, given: pick === null ? null : (q.options[pick] || null),
      correct: q.answer === null ? null : q.options[q.answer], auto: auto, override: ov == null ? null : ov, ok: ok, scored: true };
  }
  if (q.type === 'num') {
    const g = String(given == null ? '' : given);
    const auto = !!g.trim() && numMatch_(q.accept, q.tol || 0, g);
    const ok = ov === true ? true : ov === false ? false : auto;
    return { type: 'num', given: g, accept: q.accept, tol: q.tol || 0, auto: auto, override: ov == null ? null : ov, ok: ok, scored: true };
  }
  if (q.type === 'chem') {
    const g = String(given == null ? '' : given), gn = chemNorm_(g);
    const auto = !!gn && q.accept.some(k => chemNorm_(k) === gn);
    const ok = ov === true ? true : ov === false ? false : auto;
    return { type: 'chem', given: g, accept: q.accept, auto: auto, override: ov == null ? null : ov, ok: ok, scored: true };
  }
  // fix / short — accepted answers may be written in either language
  const g = String(given == null ? '' : given), ng = norm_(g);
  const auto = !!ng && q.accept.some(k => norm_(k) === ng);
  const ok = ov === true ? true : ov === false ? false : auto;
  return { type: q.type, given: g, key: q.key || '', accept: q.accept,
    unchanged: q.type === 'fix' && (!ng || ng === norm_(q.q.en) || ng === norm_(q.q.uk)),
    auto: auto, override: ov == null ? null : ov, ok: ok, scored: true };
}
/** Grade a whole attempt. answers keyed by question id. overrides keyed by question id. */
function gradeAll_(content, answers, overrides) {
  answers = answers || {}; overrides = overrides || {};
  const sections = (content.sections || []).map(s => {
    const qs = s.questions.map(q => {
      const r = gradeQ_(q, answers[q.id], Object.prototype.hasOwnProperty.call(overrides, q.id) ? overrides[q.id] : null);
      r.id = q.id; r.q = q.q; return r;
    });
    return { title: s.title, instructions: s.instructions, scored: qs.reduce((n, x) => n + (x.scored ? x.pts : 0), 0),
      got: qs.reduce((n, x) => n + (x.scored ? x.got : 0), 0), questions: qs };
  });
  const score = sections.reduce((n, s) => n + s.got, 0);
  const max = sections.reduce((n, s) => n + s.scored, 0);
  return { sections: sections, score: score, max: max };
}

// ---------- activity (students agree to this on the intro screen) ----------
const ACT_KEYS = ['leftCount', 'leftMs', 'copyCount', 'pasteCount', 'translateCount'];
function cleanAct_(a) {
  a = a || {}; const o = {};
  ACT_KEYS.forEach(k => { o[k] = Math.max(0, Math.min(1e9, Math.round(Number(a[k]) || 0))); });
  o.langs = (Array.isArray(a.langs) ? a.langs : []).filter(l => LANGS.indexOf(l) >= 0).filter((l, i, arr) => arr.indexOf(l) === i);
  o.tools = {};   // how many times each tool was opened
  if (a.tools && typeof a.tools === 'object') TOOLS.forEach(k => { const n = Math.round(Number(a.tools[k]) || 0); if (n > 0) o.tools[k] = Math.min(n, 1e6); });
  o.log = (Array.isArray(a.log) ? a.log : []).slice(-80)
    .filter(e => e && ['leave', 'copy', 'paste', 'translate', 'tool'].indexOf(e.t) >= 0)
    .map(e => ({ t: e.t, at: Math.max(0, Math.round(Number(e.at) || 0)), d: Math.max(0, Math.round(Number(e.d) || 0)), x: clean_(e.x, 200) }));
  return o;
}
function secs_(ms) { const s = Math.round(ms / 1000); return s < 60 ? s + ' s' : Math.floor(s / 60) + ' min ' + (s % 60) + ' s'; }
function secsUk_(ms) { const s = Math.round(ms / 1000); return s < 60 ? s + ' с' : Math.floor(s / 60) + ' хв ' + (s % 60) + ' с'; }
/** Warnings for the teacher, in both languages: [{ level, en, uk }]. */
function flagsFor_(a, lateMs, sameName) {
  a = a || {}; const f = [];
  if (a.leftCount) f.push({ level: (a.leftCount >= 3 || a.leftMs > 30000) ? 'high' : 'warn',
    en: 'Left the test ' + a.leftCount + '× — away ' + secs_(a.leftMs || 0) + ' in total',
    uk: 'Виходив зі сторінки ' + a.leftCount + '× — разом ' + secsUk_(a.leftMs || 0) });
  if (a.copyCount) f.push({ level: 'warn', en: 'Copied text ' + a.copyCount + '×', uk: 'Копіював текст ' + a.copyCount + '×' });
  if (a.pasteCount) f.push({ level: 'warn', en: 'Tried to paste from outside ' + a.pasteCount + '× (blocked)', uk: 'Намагався вставити текст ' + a.pasteCount + '× (заблоковано)' });
  if (lateMs > GRACE_MS) f.push({ level: 'warn', en: 'Submitted ' + secs_(lateMs) + ' after the time limit', uk: 'Надіслав на ' + secsUk_(lateMs) + ' пізніше ліміту' });
  if (sameName > 1) f.push({ level: 'warn', en: 'This name has ' + sameName + ' attempts', uk: 'У цього імені ' + sameName + ' спроб(и)' });
  f.forEach(x => { x.text = x.en; });
  return f;
}

// ---------- public view of a test (no answers) ----------
/** A text as the student sees it: only the languages that are on; a missing translation shows the original, marked in m. */
function pubText_(L, langs) {
  const o = {}; let m = null;
  langs.forEach(l => { o[l] = L[l] || pick_(L, l); if (!L[l] && o[l]) (m = m || []).push(l); });
  if (m) o.m = m;
  return o;
}
function publicTest_(row) {
  const content = contentOf_(row);
  const s = normSettings_(json_(get_(row, T.SETTINGS), {}));
  const subj = subject_(), langs = content.langs;
  const P = L => pubText_(L, langs);
  const col = String(get_(row, T.TITLE)), tt = content.title || { uk: col, en: col };
  return {
    id: String(get_(row, T.ID)), title: col, titles: subj.mode === 'translate' ? { en: pick_(tt, 'en') } : P(tt),
    minutes: s.minutes, shuffleQ: s.shuffleQ, shuffleO: s.shuffleO, monitor: s.monitor,
    mode: subj.mode, langs: langs, formulas: subj.formulas,
    allowTranslate: subj.mode === 'translate' && content.allowTranslate,
    tools: toolsOf_(content), sheet: toolsOf_(content).indexOf('formulas') >= 0 ? P(formulaSheetOf_(content)) : null,
    sections: content.sections.map(sec => ({
      title: P(sec.title), instructions: P(sec.instructions),
      questions: sec.questions.map(q => {
        const o = { id: q.id, type: q.type, q: P(q.q), note: P(q.note) };
        if (q.img) o.img = q.img;
        if (q.type === 'mc') o.options = q.options.map(P);
        if (q.type === 'match') { const perm = permFor_(q.id, q.pairs.length); o.left = q.pairs.map(p => P(p.l)); o.right = perm.map(k => P(q.pairs[k].r)); }
        if (q.type === 'solve') { o.eq = q.eq; o.vars = solveKey_(q).vars; o.steps = q.steps; }   // the equation is the question; the roots stay here
        return o;
      })
    }))
  };
}
function langInfo_(content) {
  const subj = subject_();
  return { mode: subj.mode, langs: content.langs, formulas: subj.formulas, allowTranslate: subj.mode === 'translate' && content.allowTranslate, tools: toolsOf_(content) };
}
/** Tools the student may open in this test (only those the subject offers). */
function toolsOf_(content) { const offer = subject_().tools; return (content.tools || []).filter(x => offer.indexOf(x) >= 0); }
/** The formula sheet of a test: the teacher's own, else the subject's. */
function formulaSheetOf_(content) { return content.sheet && anyText_(content.sheet) ? content.sheet : (subject_().formulaSheet || { uk: '', en: '' }); }

// ======================================================================
//  STUDENT CALLS
// ======================================================================

/** Student opened a plain link with no test id: list tests open right now. */
function listOpenTests() {
  const now = Date.now();
  const out = rowsOf_(testsSheet_(), T_HEAD.length).map(r => {
    const s = normSettings_(json_(get_(r, T.SETTINGS), {}));
    return { id: String(get_(r, T.ID)), title: String(get_(r, T.TITLE)), titles: titlesOf_(r, contentOf_(r)), folder: String(get_(r, T.FOLDER)),
      state: stateOf_(String(get_(r, T.STATUS)), s, now) };
  }).filter(x => x.state === 'open');
  return { serverNow: now, tests: out, classes: getClasses_() };
}

/** Student opened ?t=id : timing + rules for the intro screen. */
function testInfo(testId) {
  const now = Date.now();
  const r = findTest_(testsSheet_(), testId);
  const s = normSettings_(json_(get_(r, T.SETTINGS), {}));
  const state = stateOf_(String(get_(r, T.STATUS)), s, now);
  const info = { serverNow: now, id: testId, title: String(get_(r, T.TITLE)), titles: titlesOf_(r, contentOf_(r)), state: state,
    opensAt: s.opensAt, closesAt: closeAt_(s), minutes: s.minutes, monitor: s.monitor, classes: getClasses_(),
    folder: String(get_(r, T.FOLDER)) };
  const li = langInfo_(contentOf_(r)); Object.keys(li).forEach(k => { info[k] = li[k]; });
  return info;
}

/** Student pressed Start. One attempt per name per test. */
function startAttempt(testId, name, group) {
  name = clean_(name, 80); group = clean_(group, 40);
  if (name.replace(/\s+/g, '').length < 2) throw uerr_('name', 'Please type your full name.');
  return withLock_(() => {
    const now = Date.now();
    const tr = findTest_(testsSheet_(), testId);
    const s = normSettings_(json_(get_(tr, T.SETTINGS), {}));
    const state = stateOf_(String(get_(tr, T.STATUS)), s, now);
    if (state === 'scheduled' || state === 'waiting' || state === 'draft') throw uerr_('not_open', 'The test has not opened yet.');
    if (state !== 'open') throw uerr_('closed', 'The test is closed.');
    const rs = resultsSheet_();
    const prev = rowsOf_(rs, R_HEAD.length).filter(r => String(get_(r, R.TEST)) === String(testId) && nameKey_(get_(r, R.NAME)) === nameKey_(name)).pop();
    if (prev) {
      if (get_(prev, R.SUBMITTED)) throw uerr_('already', 'This name has already submitted this test. Ask your teacher if you need another try.');
      return attemptPayload_(tr, prev, s, now);
    }
    let deadline = s.minutes ? now + s.minutes * 60000 : null;
    const c = closeAt_(s);
    if (c && (!deadline || deadline > c)) deadline = c;
    const id = rid_(12), seed = Math.floor(Math.random() * 2147483647) + 1;
    rs.appendRow([id, String(testId), String(get_(tr, T.TITLE)), new Date(now), '', name, group, 'In progress', '', '',
      deadline ? new Date(deadline) : '', JSON.stringify({ seed: seed }), '{}', '{}']);
    return { id: id, seed: seed, name: name, group: group, deadline: deadline, serverNow: now, test: publicTest_(tr) };
  });
}
function attemptPayload_(tr, rr, s, now) {
  const stored = json_(get_(rr, R.ANSWERS), {});
  return { id: String(get_(rr, R.ID)), seed: Number(stored.seed) || 1, name: String(get_(rr, R.NAME)),
    group: String(get_(rr, R.GROUP)), deadline: ms_(get_(rr, R.DEADLINE)), serverNow: now,
    test: publicTest_(tr), resume: stored.answers || null, resumeAct: json_(get_(rr, R.ACTIVITY), null) };
}
function findResult_(rs, id) {
  const r = rowsOf_(rs, R_HEAD.length).filter(x => String(get_(x, R.ID)) === String(id))[0];
  if (!r) throw uerr_('gone', 'This attempt no longer exists. Ask your teacher.');
  return r;
}
function sanitizeAns_(answers) {
  const o = {}; if (answers && typeof answers === 'object') {
    Object.keys(answers).slice(0, 500).forEach(k => {
      if (/^[A-Za-z0-9]{3,16}$/.test(k)) { const v = answers[k]; o[k] = typeof v === 'number' ? v : clean_(v, 6000); }   // a solve answer (JSON of steps) is longer
    });
  }
  return o;
}
function saveProgress(id, answers, activity) {
  return withLock_(() => {
    const rs = resultsSheet_(); const r = findResult_(rs, id);
    if (get_(r, R.SUBMITTED)) return { submitted: true, serverNow: Date.now() };
    const stored = json_(get_(r, R.ANSWERS), {}); stored.answers = sanitizeAns_(answers);
    rs.getRange(r.row, R.ANSWERS).setValue(JSON.stringify(stored));
    if (activity) rs.getRange(r.row, R.ACTIVITY).setValue(JSON.stringify(cleanAct_(activity)));
    return { ok: true, serverNow: Date.now(), deadline: ms_(get_(r, R.DEADLINE)) };
  });
}
function submitAttempt(id, answers, activity) {
  const clean = sanitizeAns_(answers), act = cleanAct_(activity);
  const out = withLock_(() => {
    const rs = resultsSheet_(); const r = findResult_(rs, id);
    if (get_(r, R.SUBMITTED)) return { already: true };
    const tr = findTest_(testsSheet_(), get_(r, R.TEST));
    const content = contentOf_(tr);
    const now = Date.now(), deadline = ms_(get_(r, R.DEADLINE));
    act.lateMs = deadline && now > deadline ? now - deadline : 0;
    const late = act.lateMs > GRACE_MS;
    const g = gradeAll_(content, clean, {});
    const stored = json_(get_(r, R.ANSWERS), {}); stored.answers = clean;
    rs.getRange(r.row, R.SUBMITTED, 1, 5).setValues([[new Date(now), get_(r, R.NAME), get_(r, R.GROUP), late ? 'Late' : 'Submitted', g.score]]);
    rs.getRange(r.row, R.MAX).setValue(g.max);
    rs.getRange(r.row, R.ANSWERS).setValue(JSON.stringify(stored));
    rs.getRange(r.row, R.ACTIVITY).setValue(JSON.stringify(act));
    const s = normSettings_(json_(get_(tr, T.SETTINGS), {}));
    return { score: g.score, max: g.max, showScore: s.showScore };
  });
  const res = { ok: true };
  if (out.showScore && !out.already) res.score = { score: out.score, max: out.max };
  return res;
}

/**
 * English tests: the student asks for the Ukrainian translation of one question.
 * Works only while the attempt is open and the teacher allowed it. Uses the saved
 * translation; if there is none, asks Gemini once and saves it into the test.
 */
function translateQuestion(attemptId, qid) {
  if (!/^[A-Za-z0-9]{3,16}$/.test(String(qid))) throw uerr_('bad_q', 'Bad question.');
  const rs = resultsSheet_(); const r = findResult_(rs, attemptId);
  if (get_(r, R.SUBMITTED)) throw uerr_('tr_off', 'Translation is not available.');
  const tr = findTest_(testsSheet_(), get_(r, R.TEST));
  const content = contentOf_(tr);
  if (subject_().mode !== 'translate' || !content.allowTranslate) throw uerr_('tr_off', 'Translation is not available.');
  let found = null;
  content.sections.forEach((s, si) => s.questions.forEach((q, qi) => { if (q.id === qid) found = { s: s, q: q, si: si, qi: qi }; }));
  if (!found) throw uerr_('bad_q', 'Bad question.');
  const needQ = !found.q.q.uk && !!found.q.q.en, needI = !found.s.instructions.uk && !!found.s.instructions.en;
  if (needQ || needI) {
    if (!getGeminiKey_()) throw uerr_('tr_off', 'Translation is not available.');
    const items = [];
    if (needQ) items.push({ text: found.q.q.en, to: 'uk' });
    if (needI) items.push({ text: found.s.instructions.en, to: 'uk' });
    const got = translateTexts_(items);
    if (needQ) found.q.q.uk = clean_(got[0], 1000);
    if (needI) found.s.instructions.uk = clean_(got[needQ ? 1 : 0], 400);
    withLock_(() => {   // save it into the test so the next student gets it without asking Gemini
      const row = findTest_(testsSheet_(), get_(r, R.TEST));   // re-read: the teacher may have edited meanwhile
      const c2 = contentOf_(row);
      const s2 = c2.sections[found.si], q2 = s2 && s2.questions[found.qi];
      if (!q2 || q2.id !== qid) return;
      if (needQ && !q2.q.uk) q2.q.uk = found.q.q.uk;
      if (needI && !s2.instructions.uk) s2.instructions.uk = found.s.instructions.uk;
      testsSheet_().getRange(row.row, T.CONTENT).setValue(JSON.stringify(c2));
    });
  }
  return { q: found.q.q.uk || '', instructions: found.s.instructions.uk || '', note: found.q.note.uk || '' };
}

// ======================================================================
//  TEACHER CALLS  (library, editor, schedule, results)
// ======================================================================

function listTests(pin) {
  checkPin_(pin);
  const now = Date.now();
  const rs = rowsOf_(resultsSheet_(), R_HEAD.length);
  const counts = {}, done = {};
  rs.forEach(r => { const t = String(get_(r, R.TEST)); counts[t] = (counts[t] || 0) + 1; if (get_(r, R.SUBMITTED)) done[t] = (done[t] || 0) + 1; });
  const tests = rowsOf_(testsSheet_(), T_HEAD.length).map(r => {
    const s = normSettings_(json_(get_(r, T.SETTINGS), {}));
    const content = contentOf_(r);
    const id = String(get_(r, T.ID));
    return { id: id, title: String(get_(r, T.TITLE)), titles: titlesOf_(r, content), folder: String(get_(r, T.FOLDER)), source: String(get_(r, T.SOURCE)),
      status: String(get_(r, T.STATUS)), state: stateOf_(String(get_(r, T.STATUS)), s, now),
      created: ms_(get_(r, T.CREATED)), updated: ms_(get_(r, T.UPDATED)),
      questions: countQ_(content), max: maxScore_(content), opensAt: s.opensAt, closesAt: closeAt_(s), minutes: s.minutes,
      langs: content.langs, allowTranslate: content.allowTranslate, missing: missingTr_(content).length,
      attempts: counts[id] || 0, submitted: done[id] || 0 };
  });
  return { serverNow: now, tests: tests, classes: getClasses_(), appUrl: appUrl_(), hasAiKey: !!getGeminiKey_(),
    subject: subject_(), samples: seedList_().length };
}

function getTest(pin, id) {
  checkPin_(pin);
  const r = findTest_(testsSheet_(), id);
  const s = normSettings_(json_(get_(r, T.SETTINGS), {}));
  const content = contentOf_(r);
  return { id: String(get_(r, T.ID)), title: String(get_(r, T.TITLE)), titles: titlesOf_(r, content), folder: String(get_(r, T.FOLDER)),
    source: String(get_(r, T.SOURCE)), status: String(get_(r, T.STATUS)),
    settings: s, content: content, closesAt: closeAt_(s),
    classes: getClasses_(), subject: subject_(), serverNow: Date.now(), appUrl: appUrl_() };
}

/** Create or replace a test's title, folder, content. Returns the id. title: a string or { uk, en }. */
function saveTest(pin, id, title, folder, content) {
  checkPin_(pin);
  folder = clean_(folder, 60);
  const c = normContent_(content);
  const tl = title && typeof title === 'object' ? loc_(title, 140) : null;
  if (tl && anyText_(tl)) c.title = tl;
  title = (tl ? titleCol_(tl, c.langs) : clean_(title, 140)) || (c.title ? titleCol_(c.title, c.langs) : '') || 'Untitled test';
  if (JSON.stringify(c).length > MAX_CONTENT) throw uerr_('too_big', 'This test is too long to save (a spreadsheet cell holds 50 000 characters). Split it into two tests or use smaller pictures.');
  if (folder) registerClass_(folder);
  return withLock_(() => {
    const sh = testsSheet_(); const now = new Date();
    if (id) {
      const r = findTest_(sh, id);
      sh.getRange(r.row, T.TITLE).setValue(title);
      sh.getRange(r.row, T.FOLDER).setValue(folder);
      sh.getRange(r.row, T.UPDATED).setValue(now);
      sh.getRange(r.row, T.CONTENT).setValue(JSON.stringify(c));
      return { id: String(id), ok: true, langs: c.langs };
    }
    const newId = rid_();
    const source = content && content.source === 'ai' ? 'ai' : 'manual';
    sh.appendRow([newId, title, folder, source, 'draft', now, now, JSON.stringify(normSettings_({})), JSON.stringify(c)]);
    return { id: newId, ok: true, langs: c.langs };
  });
}

function setStatus(pin, id, status) {
  checkPin_(pin);
  if (['draft', 'published'].indexOf(status) < 0) throw uerr_('bad', 'Bad status.');
  return withLock_(() => {
    const sh = testsSheet_(); const r = findTest_(sh, id);
    if (status === 'published' && countQ_(contentOf_(r)) === 0) throw uerr_('empty', 'Add at least one question before publishing.');
    sh.getRange(r.row, T.STATUS).setValue(status);
    if (status === 'published') {
      // Publishing opens the test right away, unless the teacher chose a scheduled start time.
      const s = normSettings_(json_(get_(r, T.SETTINGS), {}));
      if (s.startMode !== 'time' && !s.opensAt) { s.opensAt = Date.now(); s.stoppedAt = null; sh.getRange(r.row, T.SETTINGS).setValue(JSON.stringify(s)); }
    }
    sh.getRange(r.row, T.UPDATED).setValue(new Date());
    return { ok: true };
  });
}

/** Save schedule settings for a test. */
function saveTestSettings(pin, id, input) {
  checkPin_(pin);
  input = input || {};
  return withLock_(() => {
    const sh = testsSheet_(); const r = findTest_(sh, id);
    const cur = normSettings_(json_(get_(r, T.SETTINGS), {}));
    const next = normSettings_({
      startMode: input.startMode, endMode: input.endMode, hours: input.hours, minutes: input.minutes,
      closesAt: input.closesAt, shuffleQ: input.shuffleQ, shuffleO: input.shuffleO, showScore: input.showScore, monitor: input.monitor,
      opensAt: cur.opensAt, stoppedAt: cur.stoppedAt
    });
    if (next.startMode === 'time') next.opensAt = input.opensAt ? Number(input.opensAt) : cur.opensAt;
    if (next.endMode === 'time' && next.closesAt && next.opensAt && next.closesAt <= next.opensAt) throw uerr_('close_before_open', 'The closing time must be after the opening time.');
    sh.getRange(r.row, T.SETTINGS).setValue(JSON.stringify(next));
    sh.getRange(r.row, T.UPDATED).setValue(new Date());
    return { ok: true, settings: next, closesAt: closeAt_(next), state: stateOf_(String(get_(r, T.STATUS)), next, Date.now()), serverNow: Date.now() };
  });
}

/** Manual Start / Stop buttons. */
function startNow(pin, id) {
  checkPin_(pin);
  return withLock_(() => {
    const sh = testsSheet_(); const r = findTest_(sh, id);
    if (countQ_(contentOf_(r)) === 0) throw uerr_('empty', 'Add at least one question first.');
    const s = normSettings_(json_(get_(r, T.SETTINGS), {}));
    s.opensAt = Date.now(); s.stoppedAt = null;
    sh.getRange(r.row, T.STATUS).setValue('published');
    sh.getRange(r.row, T.SETTINGS).setValue(JSON.stringify(s));
    sh.getRange(r.row, T.UPDATED).setValue(new Date());
    return { ok: true };
  });
}
function stopNow(pin, id) {
  checkPin_(pin);
  return withLock_(() => {
    const sh = testsSheet_(); const r = findTest_(sh, id);
    const s = normSettings_(json_(get_(r, T.SETTINGS), {}));
    s.stoppedAt = Date.now();
    sh.getRange(r.row, T.SETTINGS).setValue(JSON.stringify(s));
    sh.getRange(r.row, T.UPDATED).setValue(new Date());
    return { ok: true };
  });
}

function deleteTest(pin, id) {
  checkPin_(pin);
  return withLock_(() => {
    const sh = testsSheet_(); sh.deleteRow(findTest_(sh, id).row);
    // leave results in place (they carry the test title) so marks are not lost
    return { ok: true };
  });
}

/** Add the ready-made tests from Seed.gs that are not in the library yet (for people updating an older version). */
function addSampleTests(pin) {
  checkPin_(pin);
  return withLock_(() => {
    const sh = testsSheet_();
    const titles = rowsOf_(sh, T_HEAD.length).map(r => String(get_(r, T.TITLE)));
    return { ok: true, added: seedTests_(sh, titles) };
  });
}

// ---------- results ----------
function getResults(pin, testId) {
  checkPin_(pin);
  const now = Date.now();
  const tr = findTest_(testsSheet_(), testId);
  const content = contentOf_(tr);
  const rows = rowsOf_(resultsSheet_(), R_HEAD.length).filter(r => String(get_(r, R.TEST)) === String(testId));
  const byName = {};
  rows.forEach(r => { const k = nameKey_(get_(r, R.NAME)); byName[k] = (byName[k] || 0) + 1; });
  const results = rows.map(r => {
    const stored = json_(get_(r, R.ANSWERS), {}); const answers = stored.answers || null;
    const submitted = ms_(get_(r, R.SUBMITTED)); const activity = json_(get_(r, R.ACTIVITY), {});
    return { id: String(get_(r, R.ID)), name: String(get_(r, R.NAME)), group: String(get_(r, R.GROUP)),
      started: ms_(get_(r, R.STARTED)), submitted: submitted, status: submitted ? String(get_(r, R.STATUS)) : 'In progress',
      grade: submitted && answers ? gradeAll_(content, answers, json_(get_(r, R.OVERRIDES), {})) : null,
      activity: { leftCount: activity.leftCount || 0, leftMs: activity.leftMs || 0, copyCount: activity.copyCount || 0, pasteCount: activity.pasteCount || 0,
        translateCount: activity.translateCount || 0, langs: Array.isArray(activity.langs) ? activity.langs : [], log: Array.isArray(activity.log) ? activity.log : [],
        tools: activity.tools && typeof activity.tools === 'object' ? activity.tools : {} },
      flags: flagsFor_(activity, activity.lateMs || 0, byName[nameKey_(get_(r, R.NAME))]) };
  });
  const s = normSettings_(json_(get_(tr, T.SETTINGS), {}));
  return { serverNow: now, title: String(get_(tr, T.TITLE)), titles: titlesOf_(tr, content), state: stateOf_(String(get_(tr, T.STATUS)), s, now),
    content: content, results: results, subject: subject_(), sheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl(), appUrl: appUrl_() };
}
function setOverride(pin, resultId, qid, value) {
  checkPin_(pin);
  if (!/^[A-Za-z0-9]{3,16}$/.test(String(qid))) throw uerr_('bad_q', 'Bad question.');
  return withLock_(() => {
    const rs = resultsSheet_(); const r = findResult_(rs, resultId);
    const stored = json_(get_(r, R.ANSWERS), {}); const answers = stored.answers;
    if (!answers) throw uerr_('not_submitted', 'Not submitted yet.');
    const tr = findTest_(testsSheet_(), get_(r, R.TEST));
    const content = contentOf_(tr);
    const ov = json_(get_(r, R.OVERRIDES), {});
    if (value === null) delete ov[qid]; else ov[qid] = !!value;
    const g = gradeAll_(content, answers, ov);
    rs.getRange(r.row, R.SCORE).setValue(g.score);
    rs.getRange(r.row, R.OVERRIDES).setValue(JSON.stringify(ov));
    return { ok: true };
  });
}
function deleteAttempt(pin, resultId) {
  checkPin_(pin);
  return withLock_(() => { const rs = resultsSheet_(); rs.deleteRow(findResult_(rs, resultId).row); return { ok: true }; });
}

// ---------- Classes (folders) the teacher manages ----------
function getClasses_() { const a = json_(props_().getProperty('classes'), []); return Array.isArray(a) ? a : []; }
function registerClass_(name) {
  name = clean_(name, 60); if (!name) return;
  const list = getClasses_(); if (list.some(c => c.toLowerCase() === name.toLowerCase())) return;
  list.push(name); props_().setProperty('classes', JSON.stringify(list.slice(0, 100)));
}
function listClasses(pin) { checkPin_(pin); return { classes: getClasses_() }; }
function saveClasses(pin, arr) {
  checkPin_(pin);
  const seen = {}, out = [];
  (Array.isArray(arr) ? arr : []).forEach(x => { const c = clean_(x, 60); if (c && !seen[c.toLowerCase()]) { seen[c.toLowerCase()] = 1; out.push(c); } });
  props_().setProperty('classes', JSON.stringify(out.slice(0, 100)));
  return { ok: true, classes: out };
}

// ======================================================================
//  AI (Google Gemini): test from photos, translations
// ======================================================================

// Gemini models tried in order; the first your key accepts is remembered.
const GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'];

function getGeminiKey_() { return props_().getProperty('gemini_key') || ''; }
function saveAiKey(pin, key) {
  checkPin_(pin);
  key = clean_(key, 200);
  props_().setProperty('gemini_key', key);
  return { ok: true, hasAiKey: !!key };
}

/** The language part of the AI prompt (added after the subject's AI_INSTRUCTIONS). */
function aiLangRules_(langs) {
  if (subject_().mode === 'translate') {
    return ' LANGUAGES: the test itself is in English. Write each question "q" and each section "instructions" as an object ' +
      '{"en": "the original English text", "uk": "a natural Ukrainian translation for students who need help"}. ' +
      'Options, "accept" and "key" stay plain English strings — never translate the options.';
  }
  langs = (langs && langs.length) ? langs : LANGS;
  if (langs.length === 1) {
    return ' LANGUAGE: write every text a student sees as an object {"' + langs[0] + '": "..."} in ' + (langs[0] === 'uk' ? 'Ukrainian' : 'English') + ' (translate if the page is in another language).';
  }
  return ' LANGUAGES: the test is shown in Ukrainian and English. Write EVERY text a student sees — section "title", "instructions", ' +
    'the test "title", question "q", "note", every option and both sides of every pair — as an object {"uk": "Ukrainian text", "en": "English text"}. ' +
    'Keep the page\'s own language word for word and translate it into the other one. Formulas between $…$, numbers and units stay identical in both. ' +
    '"accept" answers stay a plain list of strings; for a word answer list it in both languages.';
}

/**
 * Teacher calls this with one or more base64 images.
 * images: [{ dataUrl: "data:image/jpeg;base64,...." }, ...]; langs: which languages to make (['uk','en'] by default).
 * Returns normalized content for the editor to review (NOT saved yet).
 */
function generateFromPhotos(pin, images, extraNote, langs) {
  checkPin_(pin);
  const key = getGeminiKey_();
  if (!key) throw uerr_('no_key', 'Add your Gemini API key first (the "AI key" button).');
  if (!Array.isArray(images) || !images.length) throw uerr_('no_photo', 'Please attach at least one photo.');
  const sl = subject_().langs;
  langs = (Array.isArray(langs) ? langs : []).filter(l => sl.indexOf(l) >= 0);
  if (!langs.length) langs = sl.slice();

  const parts = [{ text: AI_INSTRUCTIONS + aiLangRules_(langs) + (extraNote ? ('\nExtra instructions from the teacher: ' + clean_(extraNote, 400)) : '') }];
  images.slice(0, 6).forEach(img => {
    const m = /^data:([^;]+);base64,(.+)$/.exec(String(img && img.dataUrl || ''));
    if (m) parts.push({ inline_data: { mime_type: m[1], data: m[2] } });
  });
  if (parts.length < 2) throw uerr_('bad_photo', 'Could not read the photo. Please try another image.');

  const body = JSON.stringify({
    contents: [{ parts: parts }],
    generationConfig: { temperature: 0.2, response_mime_type: 'application/json', maxOutputTokens: 16384 }
  });

  const result = callGemini_(key, body);
  let parsed;
  try { parsed = JSON.parse(stripFence_(result.text)); } catch (e) { throw uerr_('ai_unreadable', 'The AI reply could not be read. Please try again or use a clearer photo.'); }
  parsed.langs = subject_().mode === 'translate' ? ['en'] : langs;
  parsed.allowTranslate = subject_().mode === 'translate';
  const content = normContent_(parsed);
  if (countQ_(content) === 0) throw uerr_('ai_empty', 'No questions were found on the photo. Try a sharper, straight-on picture.');
  const title = typeof parsed.title === 'object' && parsed.title ? (parsed.title.uk || parsed.title.en) : parsed.title;
  return { ok: true, model: result.model, title: clean_(title, 140) || 'New test', content: content, warnings: contentWarnings_(content) };
}

/** Translate texts with Gemini. items: [{ text, to: 'uk'|'en' }] → array of strings (same order). */
function translateTexts_(items) {
  const key = getGeminiKey_();
  if (!key) throw uerr_('no_key', 'Add your Gemini API key first (the "AI key" button).');
  if (!items.length) return [];
  const prompt = 'Translate each item of the JSON array below for a school test. "to" is the target language: "uk" = Ukrainian, "en" = English. ' +
    'Keep everything between $…$ (LaTeX formulas) exactly as it is, keep numbers, units, chemical formulas and gaps written as ___ unchanged. ' +
    'Use the usual school terminology of that language. Return ONLY a JSON array of strings, the translations in the same order, nothing else.\n' +
    JSON.stringify(items.map(x => ({ to: x.to, text: x.text })));
  const body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1, response_mime_type: 'application/json', maxOutputTokens: 16384 } });
  const result = callGemini_(key, body);
  const arr = json_(stripFence_(result.text), null);
  if (!Array.isArray(arr) || arr.length !== items.length) throw uerr_('ai_unreadable', 'The AI reply could not be read. Please try again.');
  return arr.map(x => String(x == null ? '' : x));
}

/**
 * Editor button "Translate missing": fills every empty translation in the languages that are on.
 * Works on the editor's unsaved content and returns it (the teacher still reviews and saves).
 */
function autoTranslate(pin, content) {
  checkPin_(pin);
  const c = normContent_(content);
  const miss = missingTr_(c);
  if (!miss.length) return { ok: true, content: c, filled: 0 };
  const items = [], refs = [];
  miss.slice(0, 300).forEach(m => {
    const at = m.at, sec = at.field === 'ttitle' ? null : c.sections[at.si];
    const L = at.field === 'ttitle' ? c.title : at.field === 'title' || at.field === 'instructions' ? sec[at.field]
      : at.field === 'options' ? sec.questions[at.qi].options[at.oi]
      : at.field === 'pairs' ? sec.questions[at.qi].pairs[at.pi][at.side] : sec.questions[at.qi][at.field];
    const from = m.lang === 'uk' ? 'en' : 'uk';
    items.push({ text: L[from], to: m.lang }); refs.push({ L: L, lang: m.lang });
  });
  const out = [];
  for (let i = 0; i < items.length; i += 60) Array.prototype.push.apply(out, translateTexts_(items.slice(i, i + 60)));
  refs.forEach((r, i) => { r.L[r.lang] = clean_(out[i], 1000); });
  return { ok: true, content: normContent_(c), filled: refs.length, warnings: contentWarnings_(c) };
}

function stripFence_(t) {
  t = String(t || '').trim();
  const m = /```(?:json)?\s*([\s\S]*?)```/.exec(t);
  return (m ? m[1] : t).trim();
}

/** Try each model until one responds; remember the one that worked. */
function callGemini_(key, body) {
  const prefer = props_().getProperty('gemini_model');
  const order = prefer ? [prefer].concat(GEMINI_MODELS.filter(m => m !== prefer)) : GEMINI_MODELS.slice();
  let lastErr = '';
  for (let i = 0; i < order.length; i++) {
    const model = order[i];
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + encodeURIComponent(key);
    let resp;
    try { resp = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', payload: body, muteHttpExceptions: true }); }
    catch (e) { lastErr = String(e); continue; }
    const code = resp.getResponseCode(), txt = resp.getContentText();
    if (code === 200) {
      const data = json_(txt, null);
      const out = data && data.candidates && data.candidates[0] && data.candidates[0].content &&
        data.candidates[0].content.parts ? data.candidates[0].content.parts.map(p => p.text || '').join('') : '';
      if (!out) { lastErr = 'empty reply'; continue; }
      props_().setProperty('gemini_model', model);
      return { text: out, model: model };
    }
    // 404 = model name not available for this key; try the next. 400/403 = key problem; stop.
    if (code === 400 || code === 403) {
      const msg = (json_(txt, {}) && json_(txt, {}).error && json_(txt, {}).error.message) || 'request rejected';
      throw uerr_('ai_rejected', 'Gemini rejected the request (' + code + '): ' + String(msg).slice(0, 160));
    }
    lastErr = code + ' ' + txt.slice(0, 120);
  }
  throw uerr_('ai_unreachable', 'Could not reach Gemini (' + lastErr + '). Check the API key and try again.');
}

/** Flag questions the teacher should double-check: [{ uk, en }]. */
function contentWarnings_(content) {
  const w = [], subj = subject_();
  const add = (where, uk, en) => w.push({ uk: where.uk + ': ' + uk, en: where.en + ': ' + en });
  (content.sections || []).forEach((s, si) => s.questions.forEach((q, qi) => {
    const sec = pick_(s.title, 'uk') || ('Розділ ' + (si + 1)), secEn = pick_(s.title, 'en') || ('Section ' + (si + 1));
    const where = { uk: sec + ' П' + (qi + 1), en: secEn + ' Q' + (qi + 1) };
    if (q.type === 'mc') {
      if (q.answer === null) add(where, 'не позначено правильний варіант — оберіть його.', 'no correct option marked — please choose one.');
      if (q.options.length < 2) add(where, 'менше 2 варіантів.', 'fewer than 2 options.');
      if (subj.mcGap && pick_(q.q, 'en').indexOf('___') < 0) add(where, 'у реченні немає пропуску (___).', 'no gap (___) in the sentence.');
    }
    if (q.type === 'num') {
      if (!q.accept || !q.accept.length) add(where, 'немає правильної відповіді — додайте число.', 'no correct answer — add the number.');
      else if (q.accept.every(a => parseNum_(a) === null)) add(where, 'відповідь не є числом — перевірте її (або оберіть «Коротка відповідь»).', 'the answer is not a number — check it (or use "Short answer").');
    }
    if ((q.type === 'short' || q.type === 'fix' || q.type === 'chem') && (!q.accept || !q.accept.length)) add(where, 'немає прийнятної відповіді — додайте хоча б одну.', 'no accepted answer — add at least one.');
    if (q.type === 'match' && q.pairs.length < 2) add(where, 'для відповідності потрібно щонайменше 2 пари.', 'a matching task needs at least 2 pairs.');
    if (q.type === 'solve') {
      const K = solveKey_(q);
      if (K.err === 'need_answer') add(where, 'система не лінійна або має безліч розв’язків — впишіть відповідь вручну (поле «Відповідь»).', 'the system is not linear or has infinitely many solutions — type the answer yourself ("Answer" field).');
      else if (K.err === 'bad_accept') add(where, 'відповідь учителя не вдалося прочитати як число (напр. 3, -1/2, √2).', 'the teacher\'s answer could not be read as a number (e.g. 3, -1/2, √2).');
      else if (K.err) add(where, 'рівняння не вдалося прочитати: перевірте запис (напр. 2x+5=17, x^2-5x+6=0).', 'the equation could not be read: check it (e.g. 2x+5=17, x^2-5x+6=0).');
    }
  }));
  const miss = missingTr_(content);
  if (miss.length) {
    const ls = miss.map(m => m.lang).filter((l, i, a) => a.indexOf(l) === i).map(l => l.toUpperCase()).join(', ');
    w.push({ uk: 'Не перекладено текстів: ' + miss.length + ' (' + ls + '). Учні побачать мову оригіналу з позначкою. Кнопка «🌐 Перекласти відсутнє» заповнить їх.',
      en: miss.length + ' text(s) have no translation (' + ls + '). Students will see the original language, marked. The "🌐 Translate missing" button fills them in.' });
  }
  return w;
}

// ==== MATHKIT BEGIN — the same block is in Code.gs, Student.html and Teacher.html (tools/sync-mathkit.js copies it; do not edit the copies) ====
/**
 * MathKit: reads what a student types in maths ("2x+5=17", "x² − 5x + 6 = 0", "√(x+3) = x − 3", "x = ±3",
 * "(x+1)/2 = 3", "|x − 2| = 5", "2^x = 8"), draws it as LaTeX, evaluates it and finds the roots of an equation.
 * No eval(): a small parser of its own. Plain ES5, so it runs in Apps Script, on the Node server and in old phone browsers.
 *   MK.parseExpr(s)        → tree (throws Error with .mk = reason code)
 *   MK.parseLine(s)        → { kind: 'eqs', parts: [[side tree, side tree, …], …] } | { kind: 'note' }   (a step line)
 *   MK.tex(tree), MK.lineTex(s) → LaTeX for the preview
 *   MK.evalStr(s, env)     → number (NaN when it makes no sense)
 *   MK.key(eqs, vars, accept) → the solution of an equation or a system { vars, sols, none, all, err }
 *   MK.checkLine(s, key)   → 'ok' | 'extra' | 'lost' | 'wrong' | 'bad' | 'skip' | 'note'   (one step of a student's working)
 *   MK.sameSols(a, b)      → do two solution lists match
 */
var MK = (function () {
  'use strict';
  var FUNS = ['arcsin', 'arccos', 'arctan', 'arctg', 'sqrt', 'cbrt', 'root', 'sin', 'cos', 'tan', 'cot', 'ctg', 'abs', 'log', 'exp', 'tg', 'ln', 'lg'];
  var SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+' };
  var SUB = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
  var TOL = 1e-7;
  function fail(code) { var e = new Error('MK:' + code); e.mk = code; return e; }

  /** Tidy what was typed: LaTeX from the teacher, Unicode signs, decimal commas, Cyrillic х/у, superscripts. */
  function prep(s) {
    s = String(s == null ? '' : s).replace(/\$/g, ' ');
    var prev;
    do {   // LaTeX, innermost first
      prev = s;
      s = s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '(($1)/($2))')
           .replace(/\\sqrt\s*\[\s*3\s*\]\s*\{([^{}]*)\}/g, '∛($1)')
           .replace(/\\sqrt\s*\{([^{}]*)\}/g, '√($1)')
           .replace(/\^\s*\{([^{}]*)\}/g, '^($1)')
           .replace(/_\s*\{([^{}]*)\}/g, '_($1)')
           .replace(/\\left\s*\||\\right\s*\|/g, '|')
           .replace(/\\text\s*\{([^{}]*)\}/g, '$1');
    } while (s !== prev);
    s = s.replace(/\\left|\\right|\\,|\\;|\\!|\\quad/g, ' ').replace(/\\cdot|\\times|\\ast/g, '*').replace(/\\div/g, '/')
         .replace(/\\pm/g, '±').replace(/\\mp/g, '∓').replace(/\\pi/g, 'π').replace(/\\sqrt/g, '√')
         .replace(/\\(leq?|le)\b/g, '≤').replace(/\\(geq?|ge)\b/g, '≥').replace(/\\neq?\b/g, '≠')
         .replace(/\\(sin|cos|tan|tg|cot|ctg|log|ln|lg|exp|arcsin|arccos|arctan|arctg)\b/g, '$1')
         .replace(/\\/g, ' ').replace(/\{/g, '(').replace(/\}/g, ')');
    s = s.replace(/[−–—]/g, '-').replace(/[×·⋅∙•*]/g, '*').replace(/[÷:]/g, '/').replace(/[（]/g, '(').replace(/[）]/g, ')')
         .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, function (m) { return '^(' + m.split('').map(function (c) { return SUP[c]; }).join('') + ')'; })
         .replace(/[₀₁₂₃₄₅₆₇₈₉]+/g, function (m) { return '_' + m.split('').map(function (c) { return SUB[c]; }).join(''); })
         .replace(/(\d)\s*,\s*(?=\d)/g, function (m, d) { return /\s/.test(m) ? m : d + '.'; })
         .replace(/\*\*/g, '^').replace(/(^|[^a-zа-яіїєґ])х/gi, '$1x').replace(/(^|[^a-zа-яіїєґ])у/gi, '$1y')
         .replace(/[Хх](?![а-яіїєґ])/g, 'x').replace(/[Уу](?![а-яіїєґ])/g, 'y');
    return s.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  // ---------- tokens ----------
  function tokens(s) {
    var out = [], i = 0, m;
    while (i < s.length) {
      var c = s[i];
      if (c === ' ') { i++; continue; }
      if ((m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i)))) { out.push({ t: 'n', v: parseFloat(m[1]), s: m[1].replace(/\.$/, '') }); i += m[1].length; continue; }
      if ((m = /^[a-z]+/.exec(s.slice(i)))) {
        var w = m[0]; i += w.length;
        while (w) {
          var f = null;
          for (var k = 0; k < FUNS.length; k++) if (w.indexOf(FUNS[k]) === 0) { f = FUNS[k]; break; }
          if (f) { out.push({ t: 'f', v: f }); w = w.slice(f.length); }
          else if (w.indexOf('pi') === 0) { out.push({ t: 'c', v: 'pi' }); w = w.slice(2); }
          else { out.push({ t: 'v', v: w[0] }); w = w.slice(1); }
        }
        continue;
      }
      if ('+-*/^()|=_√∛π±∓,;'.indexOf(c) >= 0) { out.push({ t: c === 'π' ? 'c' : 'o', v: c === 'π' ? 'pi' : c }); i++; continue; }
      if ('<>≤≥≠'.indexOf(c) >= 0) throw fail('ineq');
      if (/[а-яіїєґ]/i.test(c)) throw fail('word');
      throw fail('char');
    }
    return out;
  }

  // ---------- parser (precedence: + − < × ÷ and implicit × < unary − < ^) ----------
  function Parser(toks) { this.k = toks; this.i = 0; this.abs = 0; }
  Parser.prototype.peek = function () { return this.k[this.i]; };
  Parser.prototype.is = function (v) { var t = this.k[this.i]; return !!t && t.t === 'o' && t.v === v; };
  Parser.prototype.next = function () { return this.k[this.i++]; };
  Parser.prototype.expr = function () {
    var a = this.term();
    while (this.is('+') || this.is('-')) { var op = this.next().v; a = { t: op, a: a, b: this.term() }; }
    return a;
  };
  Parser.prototype.startsAtom = function () {
    var t = this.peek(); if (!t) return false;
    if (t.t === 'n' || t.t === 'v' || t.t === 'c' || t.t === 'f') return true;
    if (t.t === 'o' && (t.v === '(' || t.v === '√' || t.v === '∛')) return true;
    if (t.t === 'o' && t.v === '|' && this.abs === 0) return true;   // "2|x|": an opening bar
    return false;
  };
  Parser.prototype.term = function () {
    var a = this.unary();
    for (;;) {
      if (this.is('*') || this.is('/')) { var op = this.next().v; a = { t: op, a: a, b: this.unary() }; }
      else if (this.startsAtom()) {
        var t = this.peek();
        if (t.t === 'n' && (a.t === 'n' || (a.t === '^' && a.b.t === 'n'))) throw fail('two_numbers');   // "2 3", "x^2 3"
        a = { t: '*', a: a, b: this.power(), imp: true };
      } else break;
    }
    return a;
  };
  Parser.prototype.unary = function () {
    if (this.is('-')) { this.next(); return { t: 'neg', a: this.unary() }; }
    if (this.is('+')) { this.next(); return this.unary(); }
    return this.power();
  };
  Parser.prototype.power = function () {
    var a = this.atom();
    if (this.is('^')) { this.next(); return { t: '^', a: a, b: this.unary() }; }
    return a;
  };
  Parser.prototype.group = function () {   // ( expr )
    this.next(); var a = this.expr();
    if (!this.is(')')) throw fail('paren');
    this.next(); a.par = true; return a;
  };
  Parser.prototype.atom = function () {
    var t = this.peek();
    if (!t) throw fail('end');
    if (t.t === 'n') {
      this.next();
      var nx = this.peek(); if (nx && nx.t === 'n') throw fail('two_numbers');
      return { t: 'n', v: t.v, s: t.s };
    }
    if (t.t === 'c') { this.next(); return { t: 'c', v: t.v }; }
    if (t.t === 'v') {
      this.next();
      if (this.is('_')) { this.next(); var ix = this.next(); if (!ix || (ix.t !== 'n' && ix.t !== 'v')) throw fail('sub'); }   // x₁ is x
      var d = this.peek(); if (d && d.t === 'n') throw fail('var_digit');   // "x2": write x^2 or 2x
      return { t: 'v', v: t.v };
    }
    if (t.t === 'o' && t.v === '(') return this.group();
    if (t.t === 'o' && t.v === '|') {
      this.next(); this.abs++; var a = this.expr(); this.abs--;
      if (!this.is('|')) throw fail('abs'); this.next();
      return { t: 'f', f: 'abs', a: a };
    }
    if (t.t === 'o' && (t.v === '√' || t.v === '∛')) {
      this.next();
      var arg = this.is('(') ? this.group() : this.atom();
      return { t: 'f', f: t.v === '√' ? 'sqrt' : 'cbrt', a: arg };
    }
    if (t.t === 'f') {
      this.next(); var f = t.v, base = null;
      if (f === 'tg') f = 'tan'; if (f === 'ctg') f = 'cot'; if (f === 'arctg') f = 'arctan';
      if (f === 'log' && this.is('_')) { this.next(); base = this.is('(') ? this.group() : this.atom(); }
      var pw = null;
      if ((f === 'sin' || f === 'cos' || f === 'tan' || f === 'cot') && this.is('^')) { this.next(); pw = this.atom(); }   // sin^2 x
      var x = this.is('(') ? this.group() : this.power();
      var node = { t: 'f', f: f, a: x };
      if (base) node.base = base;
      return pw ? { t: '^', a: node, b: pw } : node;
    }
    throw fail('syntax');
  };

  function parseExpr(s) {
    var p = new Parser(tokens(prep(s)));
    if (!p.k.length) throw fail('empty');
    var a = p.expr();
    if (p.i < p.k.length) { var t = p.peek(); throw fail(t.v === ')' ? 'paren' : t.v === '=' ? 'eq' : 'syntax'); }
    return a;
  }

  /** A step line → parts of an "or" (x = 2 або x = 3; x = ±3), each part a chain of equal sides (a = b = c). */
  var WORD_OR = /(^|[^a-zа-яіїєґ])(або|чи|or)(?=$|[^a-zа-яіїєґ])/gi;   // \b does not work with Cyrillic
  function parseLine(s) {
    // "… = 0 | :2" — a note of what was done to both sides; not part of the equation
    var raw = String(s == null ? '' : s).trim().replace(/\s\|\s*[:·*×\/÷]\s*[^|=]+$/, '').trim();
    if (!raw || /^(#|\/\/)/.test(raw)) return { kind: 'note' };
    // words (a comment like "Перевірка:" or "Відповідь") make it a note, except "або"/"or"/"і"
    var words = raw.replace(/\\[a-z]+/gi, ' ').replace(WORD_OR, '$1 ').replace(/(^|[^a-zа-яіїєґ])(і|й|та|and)(?=$|[^a-zа-яіїєґ])/gi, '$1 ').match(/[a-zа-яіїєґ]{2,}/gi) || [];
    var notes = words.filter(function (w) { return /[а-яіїєґ]/i.test(w) || ['the', 'so', 'then', 'check', 'answer', 'roots', 'root', 'no'].indexOf(w.toLowerCase()) >= 0; });
    if (notes.length) return { kind: 'note' };
    var body = raw.replace(WORD_OR, '$1\u0001').replace(/∨|;/g, '\u0001');
    var chunks = body.split('\u0001');
    var parts0 = [];
    chunks.forEach(function (c) {
      // "x = 2, x = 3": a comma between equations also means "or"
      var cs = c.split(/,(?!\d)/);
      if (cs.length > 1 && cs.every(function (z) { return z.indexOf('=') >= 0; })) parts0 = parts0.concat(cs); else parts0.push(c);
    });
    var parts = [];
    parts0.forEach(function (c) {
      c = c.trim(); if (!c) return;
      var list = [c];
      for (var n = 0; n < 2; n++) {   // up to two ± in one part
        var next = [];
        list.forEach(function (z) {
          var i = z.search(/[±∓]/);
          if (i < 0) next.push(z);
          else { var a = z[i] === '±' ? '+' : '-', b = z[i] === '±' ? '-' : '+'; next.push(z.slice(0, i) + a + z.slice(i + 1)); next.push(z.slice(0, i) + b + z.slice(i + 1)); }
        });
        list = next;
      }
      parts = parts.concat(list);
    });
    if (!parts.length) return { kind: 'note' };
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var sides = parts[i].split('=');
      if (sides.length < 2) return { kind: 'expr', tree: parseExpr(parts[i]) };
      out.push(sides.map(function (x) { if (!x.trim()) throw fail('side'); return parseExpr(x); }));
    }
    return { kind: 'eqs', parts: out };
  }

  // ---------- LaTeX ----------
  function num(s) { return String(s).replace(/\./g, '{,}'); }
  function tex(a) {
    var w = function (x, need) { var s = tex(x); return need ? '\\left(' + s + '\\right)' : s; };
    var lowAdd = function (x) { return x.t === '+' || x.t === '-'; };
    switch (a.t) {
      case 'n': return num(a.s != null ? a.s : a.v);
      case 'c': return '\\pi';
      case 'v': return a.v;
      case '+': return tex(a.a) + ' + ' + w(a.b, a.b.par && lowAdd(a.b));
      case '-': return tex(a.a) + ' - ' + w(a.b, lowAdd(a.b) || a.b.t === 'neg');
      case 'neg': return '-' + w(a.a, lowAdd(a.a) || a.a.t === 'neg');
      case '*':
        var l = w(a.a, lowAdd(a.a) || a.a.t === 'neg'), r = w(a.b, lowAdd(a.b) || a.b.t === 'neg');
        var implicit = a.imp && !(a.b.t === 'n' || (a.b.t === '^' && a.b.a.t === 'n'));
        return l + (implicit ? ' ' : ' \\cdot ') + r;
      case '/': return '\\frac{' + tex(a.a) + '}{' + tex(a.b) + '}';
      case '^': return '{' + w(a.a, a.a.t !== 'n' && a.a.t !== 'v' && a.a.t !== 'c' && !(a.a.t === 'f' && a.a.f === 'abs')) + '}^{' + tex(a.b) + '}';
      case 'f':
        if (a.f === 'sqrt') return '\\sqrt{' + tex(a.a) + '}';
        if (a.f === 'cbrt') return '\\sqrt[3]{' + tex(a.a) + '}';
        if (a.f === 'abs') return '\\left|' + tex(a.a) + '\\right|';
        var name = { sin: '\\sin', cos: '\\cos', tan: '\\operatorname{tg}', cot: '\\operatorname{ctg}', log: '\\log', ln: '\\ln', lg: '\\lg', exp: '\\exp',
          arcsin: '\\arcsin', arccos: '\\arccos', arctan: '\\operatorname{arctg}', root: '\\operatorname{root}' }[a.f] || a.f;
        return name + (a.base ? '_{' + tex(a.base) + '}' : '') + '\\left(' + tex(a.a) + '\\right)';
    }
    return '?';
  }
  function lineTex(s) {
    var L = parseLine(s);
    if (L.kind === 'note') return null;
    if (L.kind === 'expr') return tex(L.tree);
    return L.parts.map(function (p) { return p.map(tex).join(' = '); }).join('\\quad\\text{або}\\quad ');
  }

  // ---------- numbers ----------
  function powr(b, e) {
    var v = Math.pow(b, e);
    if (isNaN(v) && b < 0) {   // (-8)^(1/3) = -2: an odd root of a negative number
      for (var q = 3; q <= 15; q += 2) { var p = Math.round(e * q); if (Math.abs(p / q - e) < 1e-12 && p % 2 !== 0) return -Math.pow(-b, e); if (Math.abs(p / q - e) < 1e-12) return Math.pow(-b, e); }
    }
    return v;
  }
  function ev(a, env) {
    switch (a.t) {
      case 'n': return a.v;
      case 'c': return Math.PI;
      case 'v': return Object.prototype.hasOwnProperty.call(env, a.v) ? env[a.v] : (a.v === 'e' ? Math.E : NaN);
      case '+': return ev(a.a, env) + ev(a.b, env);
      case '-': return ev(a.a, env) - ev(a.b, env);
      case 'neg': return -ev(a.a, env);
      case '*': return ev(a.a, env) * ev(a.b, env);
      case '/': var d = ev(a.b, env); return d === 0 ? NaN : ev(a.a, env) / d;
      case '^': return powr(ev(a.a, env), ev(a.b, env));
      case 'f':
        var x = ev(a.a, env);
        switch (a.f) {
          case 'sqrt': return x < 0 ? NaN : Math.sqrt(x);
          case 'cbrt': return x < 0 ? -Math.pow(-x, 1 / 3) : Math.pow(x, 1 / 3);
          case 'abs': return Math.abs(x);
          case 'sin': return Math.sin(env.__deg ? x * Math.PI / 180 : x);
          case 'cos': return Math.cos(env.__deg ? x * Math.PI / 180 : x);
          case 'tan': var c = Math.cos(env.__deg ? x * Math.PI / 180 : x); return Math.abs(c) < 1e-15 ? NaN : Math.sin(env.__deg ? x * Math.PI / 180 : x) / c;
          case 'cot': var sn = Math.sin(env.__deg ? x * Math.PI / 180 : x); return Math.abs(sn) < 1e-15 ? NaN : Math.cos(env.__deg ? x * Math.PI / 180 : x) / sn;
          case 'arcsin': return Math.asin(x) * (env.__deg ? 180 / Math.PI : 1);
          case 'arccos': return Math.acos(x) * (env.__deg ? 180 / Math.PI : 1);
          case 'arctan': return Math.atan(x) * (env.__deg ? 180 / Math.PI : 1);
          case 'ln': return x <= 0 ? NaN : Math.log(x);
          case 'lg': return x <= 0 ? NaN : Math.log(x) / Math.LN10;
          case 'log':
            if (x <= 0) return NaN;
            if (!a.base) return Math.log(x) / Math.LN10;
            var b = ev(a.base, env); return (b <= 0 || b === 1) ? NaN : Math.log(x) / Math.log(b);
          case 'exp': return Math.exp(x);
        }
    }
    return NaN;
  }
  function varsOf(a, out) {
    out = out || {};
    if (!a) return out;
    if (a.t === 'v' && a.v !== 'e') out[a.v] = 1;
    if (a.a) varsOf(a.a, out); if (a.b) varsOf(a.b, out); if (a.base) varsOf(a.base, out);
    return out;
  }
  function evalStr(s, env) { try { return ev(parseExpr(s), env || {}); } catch (e) { return NaN; } }
  function close(a, b) { return Math.abs(a - b) <= 1e-6 * (1 + Math.abs(a) + Math.abs(b)); }
  /** Snap a root to a simple fraction when it is one (2.9999999999 → 3, 0.333333333 → 1/3). */
  function snap(r) {
    for (var q = 1; q <= 240; q++) { var p = Math.round(r * q); if (Math.abs(p / q - r) <= 1e-9 * (1 + Math.abs(r))) return p / q; }
    return r;
  }
  function fmt(r) {
    for (var q = 1; q <= 240; q++) {
      var p = Math.round(r * q);
      if (Math.abs(p / q - r) <= 1e-9 * (1 + Math.abs(r))) return q === 1 ? String(p) : p + '/' + q;
    }
    return String(Math.round(r * 1e6) / 1e6);
  }

  // ---------- roots of one equation in one variable ----------
  var MEMO = {}, MEMO_N = 0;
  function memo(key, fn) {
    if (Object.prototype.hasOwnProperty.call(MEMO, key)) return MEMO[key];
    if (MEMO_N > 4000) { MEMO = {}; MEMO_N = 0; }
    MEMO_N++; return (MEMO[key] = fn());
  }
  var GRID = null;
  function grid() {
    if (GRID) return GRID;
    var g = [], k;
    for (k = -2000; k <= 2000; k++) g.push(k / 20);                       // −100…100 every 0.05 (exact: k/20)
    for (k = -1000; k <= 1000; k++) if (Math.abs(k * 10) > 100) g.push(k * 10);   // −10 000…10 000 every 10
    g.sort(function (a, b) { return a - b; });
    return (GRID = g);
  }
  /** Roots of A = B in variable v: { all: true } for an identity, else { roots: [...] }. */
  function rootsPair(A, B, v) {
    return memo('r|' + v + '|' + JSON.stringify(A) + '=' + JSON.stringify(B), function () {
      var env = {};
      var f = function (x) { env[v] = x; var a = ev(A, env), b = ev(B, env); return { d: a - b, s: 1 + Math.abs(a) + Math.abs(b) }; };
      var G = grid(), F = [], fin = 0, zero = 0, i;
      for (i = 0; i < G.length; i++) {
        var r = f(G[i]); F.push(r);
        if (isFinite(r.d)) { fin++; if (Math.abs(r.d) <= TOL * r.s) zero++; }
      }
      if (fin > 20 && zero >= fin * 0.98) return { all: true, roots: [] };
      var roots = [], cand = 0;
      var add = function (x) {
        x = snap(x);
        for (var j = 0; j < roots.length; j++) if (Math.abs(roots[j] - x) <= 1e-7 * (1 + Math.abs(x))) return;
        roots.push(x);
      };
      for (i = 0; i < G.length; i++) {
        var cur = F[i];
        if (!isFinite(cur.d)) continue;
        if (Math.abs(cur.d) <= TOL * cur.s) { add(G[i]); continue; }
        var nx = F[i + 1];
        if (nx && isFinite(nx.d) && Math.abs(nx.d) > TOL * nx.s && (cur.d < 0) !== (nx.d < 0)) {   // sign change: bisect
          var lo = G[i], hi = G[i + 1], flo = cur.d;
          for (var it = 0; it < 90; it++) {
            var mid = (lo + hi) / 2, fm = f(mid);
            if (!isFinite(fm.d)) break;
            if ((fm.d < 0) === (flo < 0)) { lo = mid; flo = fm.d; } else hi = mid;
          }
          var m2 = (lo + hi) / 2, fr = f(m2);
          if (isFinite(fr.d) && Math.abs(fr.d) <= 1e-6 * fr.s) add(m2);   // not a pole
          continue;
        }
        // touching zero without crossing ((x − 2)² = 0): a local minimum of |f|
        var pv = F[i - 1];
        if (pv && nx && isFinite(pv.d) && isFinite(nx.d) && Math.abs(cur.d) < Math.abs(pv.d) && Math.abs(cur.d) <= Math.abs(nx.d) &&
            (pv.d < 0) === (cur.d < 0) && (nx.d < 0) === (cur.d < 0) && cand < 60) {
          cand++;
          var a = G[i - 1], b = G[i + 1], gr = (Math.sqrt(5) - 1) / 2;
          var c = b - gr * (b - a), d = a + gr * (b - a);
          for (var k2 = 0; k2 < 120; k2++) {
            var fc = Math.abs(f(c).d), fd = Math.abs(f(d).d);
            if (!(fc > fd)) { b = d; d = c; c = b - gr * (b - a); } else { a = c; c = d; d = a + gr * (b - a); }
          }
          var xm = (a + b) / 2, fx = f(xm);
          if (isFinite(fx.d) && Math.abs(fx.d) <= TOL * fx.s) add(xm);
        }
      }
      roots.sort(function (p, q) { return p - q; });
      return { roots: roots };
    });
  }
  function holds(L, env) {   // does a parsed step line hold at this point (any part; all links of its chain)
    return L.parts.some(function (p) {
      for (var i = 0; i + 1 < p.length; i++) {
        var a = ev(p[i], env), b = ev(p[i + 1], env);
        if (!isFinite(a) || !isFinite(b) || Math.abs(a - b) > TOL * 10 * (1 + Math.abs(a) + Math.abs(b))) return false;
      }
      return true;
    });
  }
  /** Roots of a step line in one variable: union over the "or" parts, intersection along a chain. */
  function lineRoots(L, v) {
    var all = false, roots = [];
    L.parts.forEach(function (p) {
      var cur = null;   // null = everything so far
      for (var i = 0; i + 1 < p.length; i++) {
        var r = rootsPair(p[i], p[i + 1], v);
        if (r.all) continue;
        cur = cur === null ? r.roots.slice() : cur.filter(function (x) { return r.roots.some(function (y) { return close(x, y); }); });
      }
      if (cur === null) all = true;
      else cur.forEach(function (x) { if (!roots.some(function (y) { return close(x, y); })) roots.push(x); });
    });
    return { all: all, roots: roots };
  }

  // ---------- systems of linear equations ----------
  function linSolve(eqs, vars) {
    var n = vars.length, rows = [];
    var at = function (A, B, pt) { var env = {}; vars.forEach(function (v, i) { env[v] = pt[i]; }); return ev(A, env) - ev(B, env); };
    for (var e = 0; e < eqs.length; e++) {
      var A = eqs[e][0], B = eqs[e][1], zero = [], i;
      for (i = 0; i < n; i++) zero.push(0);
      var f0 = at(A, B, zero), co = [];
      if (!isFinite(f0)) return null;
      for (i = 0; i < n; i++) { var u = zero.slice(); u[i] = 1; co.push(at(A, B, u) - f0); }
      for (var t = 0; t < 3; t++) {   // affine? (check at a few odd points)
        var pt = [], sum = f0;
        for (i = 0; i < n; i++) { pt.push(1.37 * (t + 1) - 2.11 * i + 0.5 * t * i); sum += co[i] * pt[i]; }
        var fv = at(A, B, pt);
        if (!isFinite(fv) || Math.abs(fv - sum) > 1e-7 * (1 + Math.abs(fv))) return null;
      }
      rows.push(co.concat([-f0]));
    }
    // Gaussian elimination
    var r = 0, piv = [];
    for (var c = 0; c < n && r < rows.length; c++) {
      var best = r;
      for (var k = r + 1; k < rows.length; k++) if (Math.abs(rows[k][c]) > Math.abs(rows[best][c])) best = k;
      if (Math.abs(rows[best][c]) < 1e-12) continue;
      var tmp = rows[r]; rows[r] = rows[best]; rows[best] = tmp;
      for (k = 0; k < rows.length; k++) if (k !== r) { var fct = rows[k][c] / rows[r][c]; for (var j = c; j <= n; j++) rows[k][j] -= fct * rows[r][j]; }
      piv.push(c); r++;
    }
    for (k = r; k < rows.length; k++) if (Math.abs(rows[k][n]) > 1e-9) return { none: true };
    if (r < n) return { inf: true };
    var sol = []; for (k = 0; k < n; k++) sol[piv[k]] = snap(rows[k][n] / rows[k][piv[k]]);
    return { sol: sol };
  }

  // ---------- the key of a "solve" question ----------
  var NONE_RE = /^(немає( коренів| розв'?’?ʼ?язків)?|коренів немає|розв'?’?ʼ?язків немає|no (real )?(roots|solutions?)|none|∅|\{\s*\})$/i;
  var ALL_RE = /^(будь-?яке( число)?|x\s*[—-]?\s*будь-?яке( число)?|безліч( розв'?’?ʼ?язків| коренів)?|all( real)?( numbers)?|any( number)?|r|ℝ|\(-?∞;\s*\+?∞\))$/i;
  function parseEqs(eqs) {
    return eqs.map(function (s) {
      var sides = String(s).split('=');
      if (sides.length !== 2) throw fail(sides.length < 2 ? 'no_eq' : 'many_eq');
      return [parseExpr(sides[0]), parseExpr(sides[1])];
    });
  }
  /** One value typed by the student or the teacher for a root ("6", "-3/4", "√2", "x = 1 + √3"). */
  function value(s) {
    s = String(s == null ? '' : s).trim().replace(/^[a-zа-яіїєґ]\s*(_?[0-9₀-₉]+)?\s*=\s*/i, '');
    if (!s) return NaN;
    var t;
    try { t = parseExpr(s); } catch (e) { return NaN; }
    var vs = varsOf(t); for (var k in vs) return NaN;
    return ev(t, {});
  }
  /** "x = 2; y = 3" or "2; 3" → values in the order of vars. */
  function tuple(s, vars) {
    var parts = String(s).split(/[;]|\bі\b|\band\b/), out = [], named = {};
    parts.forEach(function (p) {
      var m = /^\s*([a-zа-яіїєґ])\s*=\s*(.+)$/i.exec(prep(p));
      if (m) named[m[1]] = value(m[2]); else if (p.trim()) out.push(value(p));
    });
    return vars.map(function (v, i) { return Object.prototype.hasOwnProperty.call(named, v) ? named[v] : out[i]; });
  }
  /**
   * The solution of an equation (one string) or a system (several): { vars, sols: [[x], …] | [[x, y], …], none, all, err }.
   * accept: the teacher's own answer (overrides the computed one): ["2", "3"] for roots, ["x=1; y=2"] for a system,
   * ["немає"] / ["будь-яке"] for none / every number.
   */
  function key(eqs, vars, accept) {
    eqs = (Array.isArray(eqs) ? eqs : [eqs]).map(function (x) { return String(x || '').trim(); }).filter(Boolean);
    var out = { vars: [], sols: [], none: false, all: false, err: '' };
    if (!eqs.length) { out.err = 'no_eq'; return out; }
    var P;
    try { P = parseEqs(eqs); } catch (e) { out.err = e.mk || 'syntax'; return out; }
    var found = {};
    P.forEach(function (p) { varsOf(p[0], found); varsOf(p[1], found); });
    var vs = (Array.isArray(vars) && vars.length ? vars : Object.keys(found).sort()).map(function (v) { return String(v).toLowerCase().trim(); }).filter(function (v) { return /^[a-z]$/.test(v); });
    if (!vs.length) { out.err = 'no_var'; return out; }
    out.vars = vs;
    var acc = (accept || []).map(function (x) { return String(x || '').trim(); }).filter(Boolean);
    if (acc.length) {
      if (acc.length === 1 && NONE_RE.test(acc[0].replace(/[.!]$/, ''))) { out.none = true; return out; }
      if (acc.length === 1 && ALL_RE.test(acc[0].replace(/[.!]$/, ''))) { out.all = true; return out; }
      acc.forEach(function (a) {
        var t = vs.length === 1 ? [value(a)] : tuple(a, vs);
        if (t.some(function (x) { return !isFinite(x); })) out.err = 'bad_accept'; else out.sols.push(t);
      });
      return out;
    }
    if (vs.length === 1 && P.length === 1) {
      var r = rootsPair(P[0][0], P[0][1], vs[0]);
      if (r.all) out.all = true; else if (!r.roots.length) out.none = true;
      else out.sols = r.roots.map(function (x) { return [x]; });
      return out;
    }
    var ls = linSolve(P, vs);
    if (!ls) { out.err = 'need_answer'; return out; }   // not linear: the teacher gives the answer
    if (ls.none) out.none = true; else if (ls.inf) out.err = 'need_answer'; else out.sols = [ls.sol];
    return out;
  }
  function sameSols(a, b) {
    var has = function (X, s) { return X.some(function (t) { return t.length === s.length && t.every(function (x, i) { return close(x, s[i]); }); }); };
    return a.every(function (s) { return has(b, s); }) && b.every(function (s) { return has(a, s); });
  }
  /**
   * One line of the student's working, against the key.
   * ok: the same solutions; extra: every solution kept but new roots appeared (e.g. after squaring — check them);
   * lost: a solution no longer satisfies the line; wrong: neither; bad: cannot be read; skip: other letters (a substitution t = x²);
   * note: a comment or a line without "=".
   */
  function checkLine(s, K) {
    var L;
    try { L = parseLine(s); } catch (e) { return 'bad'; }
    if (L.kind !== 'eqs') return 'note';
    var lv = {};
    L.parts.forEach(function (p) { p.forEach(function (t) { varsOf(t, lv); }); });
    var names = Object.keys(lv);
    if (!names.length) {   // only numbers: a calculation like "4 + 2 = 6" — fine if true
      return holds(L, {}) ? 'note' : 'wrong';
    }
    if (names.some(function (v) { return K.vars.indexOf(v) < 0; })) return 'skip';
    var envOf = function (sol) { var env = {}; K.vars.forEach(function (v, i) { env[v] = sol[i]; }); return env; };
    var lost = K.sols.some(function (sol) { return !holds(L, envOf(sol)); });
    if (K.vars.length > 1) return lost ? 'lost' : 'ok';
    var v = K.vars[0], R = lineRoots(L, v);
    if (K.all) return R.all ? 'ok' : 'lost';
    if (R.all) return 'note';   // an identity, e.g. "x² − 5x + 6 = (x − 2)(x − 3)": a true statement, not a step
    var extra = R.roots.filter(function (x) { return !K.sols.some(function (s) { return close(s[0], x); }); });
    if (lost) return extra.length || K.sols.every(function (sol) { return !holds(L, envOf(sol)); }) ? 'wrong' : 'lost';
    return extra.length ? 'extra' : 'ok';
  }
  return { prep: prep, parseExpr: parseExpr, parseLine: parseLine, tex: tex, lineTex: lineTex, ev: ev, evalStr: evalStr, value: value,
    varsOf: varsOf, key: key, checkLine: checkLine, sameSols: sameSols, fmt: fmt, tuple: tuple, NONE_RE: NONE_RE, ALL_RE: ALL_RE,
    rootsPair: rootsPair };
})();
// ==== MATHKIT END ====
