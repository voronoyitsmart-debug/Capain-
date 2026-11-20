'use strict';
// © Платон Вороний. All rights reserved. See LICENSE.
// The server side of both pages. The function names and replies match core/Code.gs, so the
// teacher and student pages work as they did on Apps Script; storage is SQLite, every teacher
// sees only their own tests, and the anti-cheating rules below are enforced here, not in the browser.
const crypto = require('crypto');
const { tx, code, token, sha, audit } = require('./db');
const { USER } = require('./errors');
const { plain } = require('./engine');
const gemini = require('./gemini');

// settings Code.gs does not know about; network: 'any' = from anywhere (internet), 'lan' = only in the school network.
// The security toggles below let the teacher pick, per test, which anti-cheating measures to apply (the «Безпека» section
// in the editor). Defaults match the old always-on behaviour, so tests made before this change keep every measure.
const EXTRA_DEFAULTS = { fullscreen: false, deviceLock: false, network: 'any', access: '', classes: [], guests: false, review: false, explain: {},
  deviceTrack: true, blockKeys: true, detectDevtools: true, watermark: true, multiTab: true,
  aiTrap: false };   // experimental, off by default: a hidden text meant to trip up an AI fed a screenshot of the test
const MAX_PHOTOS = 10;   // photos for one "test from photos" (pages of one worksheet)

function now() { return Date.now(); }
function J(s, d) { try { const v = JSON.parse(s || ''); return v == null ? d : v; } catch (e) { return d; } }
/** «solve» roots as text: "x = 2; x = 3", "(x = 7; y = 3)", "коренів немає". given: the student's own roots (empty → ''). */
function solveText(k, given) {
  k = k || {}; const vars = k.vars && k.vars.length ? k.vars : ['x'];
  if (k.err) return '';
  if (k.none) return vars.length > 1 ? 'розв’язків немає' : 'коренів немає';
  if (k.all) return 'будь-яке число';
  const sols = (k.sols || []).map(s => Array.isArray(s) ? s : [s]);
  if (given && !sols.length) return '';
  return sols.map(s => vars.length > 1 ? '(' + vars.map((v, i) => v + ' = ' + (s[i] == null ? '' : s[i])).join('; ') + ')' : vars[0] + ' = ' + s[0]).join('; ');
}
/** One text of a { uk, en } pair (Ukrainian first). */
function txt(L) { return L && typeof L === 'object' ? String(L.uk || L.en || '') : String(L == null ? '' : L); }
function range(n) { const a = []; for (let i = 0; i < n; i++) a.push(i); return a; }
function shuffle(a) { for (let j = a.length - 1; j > 0; j--) { const k = crypto.randomInt(j + 1); const t = a[j]; a[j] = a[k]; a[k] = t; } return a; }
/** How classes are compared: "9-А", "9 а" and "9А" are the same class. */
function classKey(s) { return String(s || '').toLowerCase().replace(/[\s\-–—._/]+/g, ''); }
/** Absence in the gradebook: «н» (absent) or «нп» (absent for a good reason; the reason itself is never kept). Otherwise ''. */
function absence(g) {
  const v = String(g || '').toLowerCase().replace(/[\s.]/g, '');
  return v === 'н' || v === 'h' ? 'н' : v === 'нп' || v === 'н/п' || v === 'hп' ? 'нп' : '';
}
function checkDay(day) {
  day = String(day || ''); const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!d || +d[2] < 1 || +d[2] > 12 || +d[3] < 1 || +d[3] > 31) throw USER('bad_day', 'Choose a date.');
  return day;
}
function checkPeriod(p) {
  p = String(p || '').replace(/[\u0000-\u001f<>"]/g, '').replace(/\s+/g, ' ').trim();
  if (p === 'sem1' || p === 'sem2' || p === 'year') return p;
  if (/^th:.{1,60}$/.test(p) && p.slice(3).trim()) return 'th:' + p.slice(3).trim();
  throw USER('bad_period', 'Unknown period.');
}
/** The folder of a test copied from a colleague: it keeps the author's name. */
function bankFolder(author) { return ('Від колеги: ' + String(author || '')).slice(0, 60); }
function isLoopback(ip) { return !ip || /^(127\.|::1$|::ffff:127\.)/.test(ip); }

class Api {
  constructor(db, subjects, opts) {
    this.db = db; this.subjects = subjects; this.opts = opts || {};
  }

  // ---------- helpers ----------
  subj(key) { const S = this.subjects[key]; if (!S) throw USER('not_found', 'Unknown subject.', 404); return S; }
  /** A test as the row shape Code.gs functions expect (columns of the old "Tests" sheet). */
  row(t) { return { row: 0, v: [t.id, t.title, t.folder, t.source, t.status, t.created, t.updated, t.settings, t.content] }; }
  settingsOf(S, t) { return plain(S.ctx.normSettings_(J(t.settings, {}))); }
  extrasOf(t) { return cleanExtras(J(t.settings, {})); }
  contentOf(S, t) { return plain(S.ctx.normContent_(J(t.content, { sections: [] }))); }
  stateOf(S, t, n) { return S.ctx.stateOf_(t.status, S.ctx.normSettings_(J(t.settings, {})), n || now()); }
  ownTest(teacher, subject, id) {
    const t = this.db.prepare('SELECT * FROM tests WHERE id = ? AND teacher_id = ? AND subject = ?').get(String(id || ''), teacher.id, subject);
    if (!t) throw USER('not_found', 'This test was not found.', 404);
    return t;
  }
  newTestId() {
    for (;;) { const id = code(6); if (!this.db.prepare('SELECT 1 FROM tests WHERE id = ?').get(id) && !this.db.prepare('SELECT 1 FROM attempts WHERE test_id = ?').get(id)) return id; }
  }
  /** The teacher's own classes (saved from the teacher page). */
  ownClasses(teacherId) {
    const r = this.db.prepare('SELECT classes FROM teachers WHERE id = ?').get(teacherId);
    const a = J(r && r.classes, []); return Array.isArray(a) ? a : [];
  }
  /** Classes to choose from: the school's classes (made by the administrator) plus the teacher's own. */
  classesOf(teacherId) {
    const out = this.db.prepare('SELECT c.name FROM school_classes c JOIN teachers t ON t.school_id = c.school_id WHERE t.id = ?').all(teacherId).map(r => r.name).sort((a, b) => a.localeCompare(b, 'uk', { numeric: true }));
    const seen = {}; out.forEach(c => { seen[classKey(c)] = 1; });
    this.ownClasses(teacherId).forEach(c => { if (!seen[classKey(c)]) { seen[classKey(c)] = 1; out.push(c); } });
    return out;
  }
  registerClass(teacherId, S, name) {
    name = S.ctx.clean_(name, 60); if (!name) return;
    const list = this.ownClasses(teacherId);
    if (this.classesOf(teacherId).some(c => c.toLowerCase() === name.toLowerCase())) return;
    list.push(name);
    this.db.prepare('UPDATE teachers SET classes = ? WHERE id = ?').run(JSON.stringify(list.slice(0, 100)), teacherId);
  }
  appUrl(req) { return this.opts.appUrl ? this.opts.appUrl(req) : ''; }
  lanUrl() { return this.opts.lanUrl ? this.opts.lanUrl() : ''; }
  publicUrl() { return this.opts.publicUrl ? this.opts.publicUrl() : ''; }
  /** Wi-Fi-only tests can be opened and started only from the school network (or this computer). */
  checkNet(t, net) { if (net && !net.local && this.extrasOf(t).network === 'lan') throw USER('lan_only', 'This test can be taken only in the classroom network (school Wi-Fi).', 403); }
  aiKey(teacher) { return (teacher && teacher.ai_key) || this.opts.geminiKey || ''; }

  /** Add the subject's ready-made tests (Seed.gs) for this teacher. skipTitles: titles already there (not added twice). */
  seed(teacher, S, skipTitles) {
    const c = S.ctx, have = {}; (skipTitles || []).forEach(t => { have[String(t).toLowerCase()] = 1; });
    const n0 = now(); let n = 0;
    const ins = this.db.prepare('INSERT INTO tests (id, teacher_id, subject, title, folder, source, status, created, updated, settings, content) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
    plain(c.seedList_()).forEach(st => {
      const tl = st.title && typeof st.title === 'object' ? c.loc_(st.title, 140) : null;
      const content = c.normContent_(tl ? Object.assign({}, st.content, { title: tl }) : st.content);
      const title = (tl ? c.titleCol_(tl, content.langs) : c.clean_(st.title, 140)) || 'Sample test';
      if (have[title.toLowerCase()]) return;
      const s = plain(c.normSettings_({ startMode: 'manual', endMode: 'manual', minutes: Number(st.minutes) || 0 }));
      let status = 'draft';
      if (st.open && !skipTitles) { status = 'published'; s.opensAt = n0 - 1000; }   // first visit: already open, like a fresh install
      ins.run(this.newTestId(), teacher.id, S.key, title, c.clean_(st.folder, 60), 'sample', status, n0, n0, JSON.stringify(s), JSON.stringify(plain(content)));
      n++;
    });
    return n;
  }
  ensureSeeded(teacher, S) {
    const done = this.db.prepare('SELECT 1 FROM seeded WHERE teacher_id = ? AND subject = ?').get(teacher.id, S.key);
    if (done) return;
    tx(this.db, () => {
      this.db.prepare('INSERT OR IGNORE INTO seeded (teacher_id, subject) VALUES (?, ?)').run(teacher.id, S.key);
      this.seed(teacher, S, null);
    });
  }

  // ======================================================================
  //  TEACHER
  // ======================================================================

  /** Dashboard: every subject with this teacher's numbers. */
  dashboard(teacher) {
    Object.keys(this.subjects).forEach(k => this.ensureSeeded(teacher, this.subjects[k]));
    this.finalizeExpired(teacher.id);
    const n = now();
    const rows = this.db.prepare('SELECT * FROM tests WHERE teacher_id = ?').all(teacher.id);
    const sub = this.db.prepare('SELECT t.subject AS subject, COUNT(*) AS n FROM attempts a JOIN tests t ON t.id = a.test_id WHERE a.teacher_id = ? AND a.submitted IS NOT NULL GROUP BY t.subject').all(teacher.id);
    const subCount = {}; sub.forEach(r => { subCount[r.subject] = r.n; });
    return {
      teacher: { name: teacher.name, email: teacher.email, role: teacher.role || 'teacher', school: (this.db.prepare('SELECT name FROM schools WHERE id = ?').get(teacher.school_id || 0) || {}).name || '' },
      appUrl: this.appUrl(this._req), lanUrl: this.lanUrl(), publicUrl: this.publicUrl(), serverNow: n,
      subjects: Object.keys(this.subjects).map(k => {
        const S = this.subjects[k], mine = rows.filter(t => t.subject === k);
        return { key: k, icon: S.icon, name: S.info.name, mode: S.info.mode, tests: mine.length,
          open: mine.filter(t => this.stateOf(S, t, n) === 'open').length, submitted: subCount[k] || 0 };
      })
    };
  }

  listTests(teacher, S) {
    this.ensureSeeded(teacher, S);
    this.finalizeExpired(teacher.id);
    const c = S.ctx, n = now();
    const tests = this.db.prepare('SELECT * FROM tests WHERE teacher_id = ? AND subject = ?').all(teacher.id, S.key);
    const cnt = {};
    this.db.prepare('SELECT test_id, COUNT(*) AS n, COUNT(submitted) AS d FROM attempts WHERE teacher_id = ? GROUP BY test_id').all(teacher.id)
      .forEach(r => { cnt[r.test_id] = r; });
    return {
      serverNow: n, classes: this.classesOf(teacher.id), appUrl: this.appUrl(this._req), lanUrl: this.lanUrl(), publicUrl: this.publicUrl(), hasAiKey: !!this.aiKey(teacher), aiAck: !!teacher.ai_ack_at,
      subject: S.info, samples: c.seedList_().length,
      tests: tests.map(t => {
        const s = c.normSettings_(J(t.settings, {})), content = c.normContent_(J(t.content, { sections: [] })), row = this.row(t);
        return plain({ id: t.id, title: t.title, titles: c.titlesOf_(row, content), folder: t.folder, source: t.source,
          status: t.status, state: c.stateOf_(t.status, s, n), created: t.created, updated: t.updated,
          questions: c.countQ_(content), max: c.maxScore_(content), opensAt: s.opensAt, closesAt: c.closeAt_(s), minutes: s.minutes,
          langs: content.langs, allowTranslate: content.allowTranslate, missing: c.missingTr_(content).length,
          attempts: (cnt[t.id] && cnt[t.id].n) || 0, submitted: (cnt[t.id] && cnt[t.id].d) || 0, network: this.extrasOf(t).network, access: this.accessOf(t), guests: this.guestsOk(t), shared: !!t.shared });
      })
    };
  }

  getTest(teacher, S, id) {
    const t = this.ownTest(teacher, S.key, id), c = S.ctx;
    const s = c.normSettings_(J(t.settings, {})), content = c.normContent_(J(t.content, { sections: [] }));
    return plain({ id: t.id, title: t.title, titles: c.titlesOf_(this.row(t), content), folder: t.folder, source: t.source, status: t.status,
      settings: Object.assign(plain(s), this.extrasOf(t)), content: content, closesAt: c.closeAt_(s),
      classes: this.classesOf(teacher.id), subject: S.info, serverNow: now(), appUrl: this.appUrl(this._req) });
  }

  /**
   * Saving a test. In a «translate» subject (English) the Ukrainian translation students may open is made here, on the
   * teacher's side, and stored: students never trigger the AI themselves (the AI provider's terms do not allow apps
   * used by children to call it on their behalf). A failed translation does not stop the save.
   */
  async saveTest(teacher, S, id, title, folder, content, access) {
    const r = this.saveTestRow(teacher, S, id, title, folder, content, access);
    if (S.info.mode === 'translate') {
      try { r.translated = await this.fillStudentTranslations(teacher, S, r.id); } catch (e) { r.translated = 0; r.trError = String(e && e.message || e).replace(/^.*USER:\s*/, ''); }
    }
    return r;
  }
  /** The Ukrainian text of questions and instructions that only have English, for the student's «translation» button. */
  async fillStudentTranslations(teacher, S, id) {
    const c = S.ctx, t = this.ownTest(teacher, S.key, id);
    const cn = plain(c.normContent_(J(t.content, {})));
    if (!cn.allowTranslate) return 0;
    const refs = [];
    cn.sections.forEach((s, si) => {
      if (!s.instructions.uk && s.instructions.en) refs.push({ si: si, qi: -1, text: s.instructions.en });
      s.questions.forEach((q, qi) => {
        if (!q.q.uk && q.q.en) refs.push({ si: si, qi: qi, text: q.q.en });
        if (q.note && !q.note.uk && q.note.en) refs.push({ si: si, qi: qi, note: true, text: q.note.en });
      });
    });
    if (!refs.length) return 0;
    const tch = this.db.prepare('SELECT id, ai_key, ai_model FROM teachers WHERE id = ?').get(t.teacher_id);
    if (!this.aiKey(tch)) return 0;
    const ai = this.ai(tch, S), out = [];
    for (let i = 0; i < refs.length; i += 60) Array.prototype.push.apply(out, await gemini.translateTexts(ai, refs.slice(i, i + 60).map(x => ({ text: x.text, to: 'uk' }))));
    return tx(this.db, () => {   // re-read: the teacher may have edited the test meanwhile
      const t2 = this.db.prepare('SELECT * FROM tests WHERE id = ?').get(t.id); if (!t2) return 0;
      const c2 = plain(c.normContent_(J(t2.content, {}))); let n = 0;
      refs.forEach((r, i) => {
        const s2 = c2.sections[r.si]; if (!s2) return;
        if (r.qi < 0) { if (!s2.instructions.uk && s2.instructions.en === r.text) { s2.instructions.uk = c.clean_(out[i], 400); n++; } return; }
        const q2 = s2.questions[r.qi]; if (!q2) return;
        if (r.note) { if (q2.note && !q2.note.uk && q2.note.en === r.text) { q2.note.uk = c.clean_(out[i], 1000); n++; } return; }
        if (!q2.q.uk && q2.q.en === r.text) { q2.q.uk = c.clean_(out[i], 1000); n++; }
      });
      if (n) this.db.prepare('UPDATE tests SET content = ? WHERE id = ?').run(JSON.stringify(c2), t.id);
      return n;
    });
  }

  saveTestRow(teacher, S, id, title, folder, content, access) {
    const c = S.ctx;
    folder = c.clean_(folder, 60);
    let acc = null;   // the editor's «Хто може пройти тест»
    if (access && typeof access === 'object') {
      const ex = cleanExtras({ access: access.mode === 'all' ? 'all' : 'classes', classes: access.classes });
      if (ex.access === 'classes' && !ex.classes.length) throw USER('no_classes', 'Choose at least one class, or make the test common for the whole school.');
      acc = { access: ex.access, classes: ex.access === 'all' ? [] : ex.classes };
      folder = acc.classes.length ? c.clean_(acc.classes[0], 60) : '';
      acc.classes.forEach(x => this.registerClass(teacher.id, S, x));
    }
    const cn = c.normContent_(plain(content || {}));
    const tl = title && typeof title === 'object' ? c.loc_(plain(title), 140) : null;
    if (tl && c.anyText_(tl)) cn.title = tl;
    title = (tl ? c.titleCol_(tl, cn.langs) : c.clean_(title, 140)) || (cn.title ? c.titleCol_(cn.title, cn.langs) : '') || 'Untitled test';
    const json = JSON.stringify(plain(cn));
    if (json.length > 400000) throw USER('too_big', 'This test is too long to save. Split it into two tests or use smaller pictures.');
    if (folder) this.registerClass(teacher.id, S, folder);
    const n = now();
    if (id) {
      const t = this.ownTest(teacher, S.key, id);
      this.db.prepare('UPDATE tests SET title = ?, folder = ?, updated = ?, content = ? WHERE id = ?').run(title, folder, n, json, t.id);
      if (acc) this.writeSettings(t, plain(c.normSettings_(J(t.settings, {}))), Object.assign(this.extrasOf(t), acc));
      return { id: t.id, ok: true, langs: plain(cn.langs) };
    }
    const newId = this.newTestId();
    const source = content && content.source === 'ai' ? 'ai' : 'manual';
    this.db.prepare('INSERT INTO tests (id, teacher_id, subject, title, folder, source, status, created, updated, settings, content) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .run(newId, teacher.id, S.key, title, folder, source, 'draft', n, n, JSON.stringify(Object.assign(plain(c.normSettings_({})), EXTRA_DEFAULTS, acc || {})), json);
    return { id: newId, ok: true, langs: plain(cn.langs) };
  }

  writeSettings(t, s, extras) {
    this.db.prepare('UPDATE tests SET settings = ?, updated = ? WHERE id = ?').run(JSON.stringify(Object.assign(plain(s), extras)), now(), t.id);
  }

  /** Publishing an English test also makes the stored Ukrainian translation (tests from photos, ready-made and older tests). */
  async setStatus(teacher, S, id, status) {
    const r = this.setStatusRow(teacher, S, id, status);
    if (status === 'published' && S.info.mode === 'translate') { try { r.translated = await this.fillStudentTranslations(teacher, S, id); } catch (e) { r.translated = 0; } }
    return r;
  }
  setStatusRow(teacher, S, id, status) {
    if (['draft', 'published'].indexOf(status) < 0) throw USER('bad', 'Bad status.');
    return tx(this.db, () => {
      const t = this.ownTest(teacher, S.key, id), c = S.ctx;
      if (status === 'published' && c.countQ_(c.normContent_(J(t.content, {}))) === 0) throw USER('empty', 'Add at least one question before publishing.');
      this.db.prepare('UPDATE tests SET status = ?, updated = ? WHERE id = ?').run(status, now(), t.id);
      if (status === 'published') {   // publishing opens the test right away, unless a start time was chosen
        const s = plain(c.normSettings_(J(t.settings, {})));
        if (s.startMode !== 'time' && !s.opensAt) { s.opensAt = now(); s.stoppedAt = null; this.writeSettings(t, s, this.extrasOf(t)); }
      }
      return { ok: true };
    });
  }

  saveTestSettings(teacher, S, id, input) {
    input = input || {};
    return tx(this.db, () => {
      const t = this.ownTest(teacher, S.key, id), c = S.ctx;
      const cur = c.normSettings_(J(t.settings, {}));
      const next = plain(c.normSettings_({
        startMode: input.startMode, endMode: input.endMode, hours: input.hours, minutes: input.minutes,
        closesAt: input.closesAt, shuffleQ: input.shuffleQ, shuffleO: input.shuffleO, showScore: input.showScore, monitor: input.monitor,
        opensAt: cur.opensAt, stoppedAt: cur.stoppedAt
      }));
      if (next.startMode === 'time') next.opensAt = input.opensAt ? Number(input.opensAt) : cur.opensAt;
      // back to "start by hand": a start time still in the future would keep the test waiting for it
      else if (next.opensAt && next.opensAt > now()) { next.opensAt = null; next.stoppedAt = null; }
      if (next.endMode === 'time' && next.closesAt && next.opensAt && next.closesAt <= next.opensAt) throw USER('close_before_open', 'The closing time must be after the opening time.');
      const ex = this.extrasOf(t);
      Object.keys(EXTRA_DEFAULTS).forEach(k => { if (input[k] !== undefined) ex[k] = input[k]; });
      const extras = cleanExtras(ex);
      this.writeSettings(t, next, extras);
      return plain({ ok: true, settings: Object.assign({}, next, extras), closesAt: c.closeAt_(next), state: c.stateOf_(t.status, next, now()), serverNow: now() });
    });
  }

  startNow(teacher, S, id) {
    return tx(this.db, () => {
      const t = this.ownTest(teacher, S.key, id), c = S.ctx;
      if (c.countQ_(c.normContent_(J(t.content, {}))) === 0) throw USER('empty', 'Add at least one question first.');
      const s = plain(c.normSettings_(J(t.settings, {}))); s.opensAt = now(); s.stoppedAt = null;
      this.db.prepare('UPDATE tests SET status = ? WHERE id = ?').run('published', t.id);
      this.writeSettings(t, s, this.extrasOf(t));
      return { ok: true };
    });
  }
  stopNow(teacher, S, id) {
    return tx(this.db, () => {
      const t = this.ownTest(teacher, S.key, id);
      const s = plain(S.ctx.normSettings_(J(t.settings, {}))); s.stoppedAt = now();
      this.writeSettings(t, s, this.extrasOf(t));
      return { ok: true };
    });
  }
  deleteTest(teacher, S, id) {
    const t = this.ownTest(teacher, S.key, id);
    this.db.prepare('DELETE FROM tests WHERE id = ?').run(t.id);   // results stay (they keep the test title)
    this.db.prepare('DELETE FROM grades WHERE test_id = ?').run(t.id);
    return { ok: true };
  }
  addSampleTests(teacher, S) {
    return tx(this.db, () => {
      const titles = this.db.prepare('SELECT title FROM tests WHERE teacher_id = ? AND subject = ?').all(teacher.id, S.key).map(r => r.title);
      this.db.prepare('INSERT OR IGNORE INTO seeded (teacher_id, subject) VALUES (?, ?)').run(teacher.id, S.key);
      return { ok: true, added: this.seed(teacher, S, titles) };
    });
  }

  // ---------- the school's test bank: a teacher shares a test with the colleagues of the school; they copy it to themselves ----------
  // Only the test itself is shared (questions, answers, translations), never students' results; a copy keeps the author's name.
  bankId(t) { return sha('bank:' + t.id).slice(0, 20); }
  shareTest(teacher, S, id, on) {
    const t = this.ownTest(teacher, S.key, id);
    this.db.prepare('UPDATE tests SET shared = ? WHERE id = ?').run(on ? 1 : 0, t.id);
    audit(this.db, teacher.email, on ? 'test.share' : 'test.unshare', S.key + ' ' + t.id, '');
    return { ok: true, shared: !!on };
  }
  /** Shared tests of this subject by the other teachers of the teacher's school. */
  schoolBank(teacher, S) {
    const c = S.ctx;
    const rows = this.db.prepare("SELECT t.*, te.name AS author FROM tests t JOIN teachers te ON te.id = t.teacher_id WHERE t.shared = 1 AND t.subject = ? AND te.school_id = ? AND te.active = 1 AND t.teacher_id <> ? ORDER BY t.updated DESC LIMIT 300")
      .all(S.key, teacher.school_id || 0, teacher.id);
    const mine = {}; this.db.prepare("SELECT folder, title FROM tests WHERE teacher_id = ? AND subject = ? AND source = 'bank'").all(teacher.id, S.key).forEach(r => { mine[r.folder + '|' + r.title] = 1; });
    return { tests: rows.map(t => { const content = c.normContent_(J(t.content, { sections: [] }));
      return { bank: this.bankId(t), titles: plain(c.titlesOf_(this.row(t), content)), author: t.author, questions: c.countQ_(content), max: c.maxScore_(content), langs: content.langs, updated: t.updated,
        copied: !!mine[bankFolder(t.author) + '|' + t.title] }; }) };
  }
  copyFromBank(teacher, S, bank) {
    bank = String(bank || '').slice(0, 20);
    const t = this.db.prepare("SELECT t.*, te.name AS author FROM tests t JOIN teachers te ON te.id = t.teacher_id WHERE t.shared = 1 AND t.subject = ? AND te.school_id = ? AND te.active = 1 AND t.teacher_id <> ?")
      .all(S.key, teacher.school_id || 0, teacher.id).filter(x => this.bankId(x) === bank)[0];
    if (!t) throw USER('bank_none', 'This test is no longer shared.', 404);
    const c = S.ctx, n0 = now(), id = this.newTestId();
    const content = plain(c.normContent_(J(t.content, { sections: [] })));
    const st = plain(c.normSettings_({ startMode: 'manual', endMode: 'manual', minutes: c.normSettings_(J(t.settings, {})).minutes || 0 }));
    this.db.prepare('INSERT INTO tests (id, teacher_id, subject, title, folder, source, status, created, updated, settings, content) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .run(id, teacher.id, S.key, t.title, bankFolder(t.author), 'bank', 'draft', n0, n0, JSON.stringify(st), JSON.stringify(content));
    audit(this.db, teacher.email, 'test.copy', S.key + ' ' + t.id + ' → ' + id + ' (' + t.author + ')', '');
    return { ok: true, id: id };
  }

  // ---------- results ----------
  /** Attempts whose time ran out (+ grace) but the student never pressed "Submit" (closed the tab, lost the connection):
   *  the answers saved so far are graded, so the teacher gets a score instead of "In progress" for ever. */
  finalizeExpired(teacherId) {
    const n = now();
    const rows = this.db.prepare('SELECT * FROM attempts WHERE teacher_id = ? AND submitted IS NULL AND deadline IS NOT NULL AND deadline < ?')
      .all(teacherId, n - this.graceMs());
    rows.forEach(a => {
      const t = this.db.prepare('SELECT * FROM tests WHERE id = ?').get(a.test_id), S = t && this.subjects[t.subject];
      if (!S) return;
      const c = S.ctx, act = J(a.activity, {});
      act.lateMs = n - a.deadline; act.auto = 1;
      const g = c.gradeAll_(c.normContent_(J(t.content, {})), J(a.answers, {}), {});
      this.db.prepare('UPDATE attempts SET submitted = ?, status = ?, score = ?, max = ?, activity = ? WHERE id = ? AND submitted IS NULL')
        .run(a.deadline, 'Late', g.score, g.max, JSON.stringify(act), a.id);
    });
  }
  graceMs() { const k = Object.keys(this.subjects)[0]; return (k && this.subjects[k].x.GRACE_MS) || 120000; }

  getResults(teacher, S, testId) {
    const t = this.ownTest(teacher, S.key, testId), c = S.ctx, n = now();
    this.finalizeExpired(teacher.id);
    const content = c.normContent_(J(t.content, { sections: [] }));
    const rows = this.db.prepare('SELECT * FROM attempts WHERE test_id = ? AND teacher_id = ? ORDER BY started').all(t.id, teacher.id);
    const byName = {}; rows.forEach(r => { byName[r.name_key] = (byName[r.name_key] || 0) + 1; });
    const ex = this.extrasOf(t), track = ex.deviceTrack;
    const results = rows.map(r => {
      const answers = J(r.answers, null), activity = J(r.activity, {});
      const flags = plain(c.flagsFor_(activity, activity.lateMs || 0, byName[r.name_key])).concat(autoFlags(activity), extraFlags(activity.extra), track ? deviceFlags(r, rows) : [], netFlags(r, ex));
      return {
        id: r.id, name: r.name, group: r.grp, started: r.started, submitted: r.submitted || null,
        status: r.submitted ? r.status : 'In progress',
        grade: r.submitted && answers ? plain(c.gradeAll_(content, answers, J(r.overrides, {}))) : null,
        activity: { leftCount: activity.leftCount || 0, leftMs: activity.leftMs || 0, copyCount: activity.copyCount || 0, pasteCount: activity.pasteCount || 0,
          translateCount: activity.translateCount || 0, langs: Array.isArray(activity.langs) ? activity.langs : [], log: Array.isArray(activity.log) ? activity.log : [],
          tools: activity.tools && typeof activity.tools === 'object' ? activity.tools : {} },
        flags: flags, device: track ? deviceInfo(r) : null, review: r.review == null ? null : !!r.review
      };
    });
    return { serverNow: n, title: t.title, titles: plain(c.titlesOf_(this.row(t), content)), state: this.stateOf(S, t, n),
      content: plain(content), results: results, subject: S.info, review: ex.review, explained: Object.keys(ex.explain).length, sheetUrl: '/app/export/' + S.key + '/' + t.id + '.csv', appUrl: this.appUrl(this._req) };
  }

  // ---------- the students' review of their mistakes ----------
  /** One student: true = may see the review now, false = never, null = as the test says (after it is closed). */
  setReview(teacher, S, resultId, value) {
    const r = this.db.prepare('SELECT id, test_id FROM attempts WHERE id = ? AND teacher_id = ?').get(String(resultId || ''), teacher.id);
    if (!r) throw USER('gone', 'This attempt no longer exists.');
    this.ownTest(teacher, S.key, r.test_id);
    this.db.prepare('UPDATE attempts SET review = ? WHERE id = ?').run(value === true ? 1 : value === false ? 0 : null, r.id);
    return { ok: true, review: value === true ? true : value === false ? false : null };
  }
  /** Short AI explanations of the right answers, made on the teacher's side and stored with the test. */
  async explainTest(teacher, S, testId) {
    const t = this.ownTest(teacher, S.key, testId), c = S.ctx, ai = this.ai(teacher, S);
    const content = plain(c.normContent_(J(t.content, { sections: [] }))), langs = content.langs && content.langs.length ? content.langs : ['uk'];
    const ans = q => q.type === 'mc' ? (q.answer == null ? '' : txt(q.options[q.answer])) : q.type === 'match' ? q.pairs.map(p => txt(p.l) + ' → ' + txt(p.r)).join('; ')
      : q.type === 'solve' ? q.eq.join('; ') + ' → ' + solveText(plain(c.solveKeyShown_(c.solveKey_(q))))
      : (q.accept || [])[0] || q.key || '';
    const items = [], refs = [];
    content.sections.forEach(sec => sec.questions.forEach(q => {
      if (q.type === 'open' || !ans(q)) return;
      langs.forEach(L => { items.push({ lang: L, q: (q.q[L] || txt(q.q)).slice(0, 800), answer: ans(q).slice(0, 400) }); refs.push({ id: q.id, L: L }); });
    }));
    if (!items.length) throw USER('ai_empty', 'There are no questions with a right answer to explain.');
    const out = [];
    for (let i = 0; i < items.length; i += 40) Array.prototype.push.apply(out, await gemini.explainAnswers(ai, items.slice(i, i + 40)));
    return tx(this.db, () => {
      const t2 = this.ownTest(teacher, S.key, testId), ex = this.extrasOf(t2);
      refs.forEach((r, i) => { ex.explain[r.id] = ex.explain[r.id] || { uk: '', en: '' }; ex.explain[r.id][r.L] = out[i]; });
      this.writeSettings(t2, plain(c.normSettings_(J(t2.settings, {}))), cleanExtras(ex));
      return { ok: true, explained: Object.keys(cleanExtras(ex).explain).length };
    });
  }
  reviewOpen(S, t, a, n) {
    if (!a || !a.submitted || a.review === 0) return false;
    if (a.review === 1) return true;
    return this.extrasOf(t).review && S.ctx.stateOf_(t.status, S.ctx.normSettings_(J(t.settings, {})), n) === 'closed';
  }
  /** A signed-in student's own review: every question, the student's answer, the right one, and why. */
  studentReview(st, testId) {
    const t = this.testByCode(testId), S = this.subjects[t.subject], c = S.ctx, n = now();
    const a = this.db.prepare('SELECT * FROM attempts WHERE test_id = ? AND student_id = ? AND submitted IS NOT NULL ORDER BY started DESC LIMIT 1').get(t.id, st.id);
    if (!this.reviewOpen(S, t, a, n)) throw USER('no_review', 'The teacher has not opened the review of this test yet.', 403);
    const content = c.normContent_(J(t.content, { sections: [] })), g = plain(c.gradeAll_(content, J(a.answers, {}), J(a.overrides, {})));
    const ex = this.extrasOf(t), qs = {}; plain(content).sections.forEach(s => s.questions.forEach(q => { qs[q.id] = q; }));
    const right = (q, r) => q.type === 'mc' ? r.correct : q.type === 'match' ? null : q.type === 'open' ? null : q.type === 'solve' ? solveText(r.key) : (q.accept || [])[0] || q.key || '';
    return { title: plain(c.titlesOf_(this.row(t), content)), score: g.score, max: g.max, subject: S.info.name, langs: plain(content.langs || ['uk']),
      sections: g.sections.map(s => ({ title: s.title, questions: s.questions.map(r => {
        const q = qs[r.id] || {};
        return { type: r.type, q: r.q, img: q.img || '', ok: r.scored ? !!r.ok : null, got: r.got || 0, pts: r.pts || 0,
          given: r.type === 'match' ? null : r.type === 'solve' ? solveText({ vars: (r.key || {}).vars, sols: r.roots, none: r.none, all: r.all }, true) : r.given, right: right(q, r),
          steps: r.type === 'solve' && r.mode !== 'off' ? r.steps : null, items: r.type === 'match' ? r.items : null,
          note: q.note || null, why: ex.explain[r.id] || null };
      }) })) };
  }

  setOverride(teacher, S, resultId, qid, value) {
    if (!/^[A-Za-z0-9]{3,16}$/.test(String(qid))) throw USER('bad_q', 'Bad question.');
    return tx(this.db, () => {
      const r = this.db.prepare('SELECT * FROM attempts WHERE id = ? AND teacher_id = ?').get(String(resultId), teacher.id);
      if (!r) throw USER('gone', 'This attempt no longer exists.');
      const answers = J(r.answers, null);
      if (!r.submitted || !answers) throw USER('not_submitted', 'Not submitted yet.');
      const t = this.ownTest(teacher, S.key, r.test_id);
      const ov = J(r.overrides, {});
      if (value === null) delete ov[qid]; else ov[qid] = !!value;
      const g = S.ctx.gradeAll_(S.ctx.normContent_(J(t.content, {})), answers, ov);
      this.db.prepare('UPDATE attempts SET score = ?, overrides = ? WHERE id = ?').run(g.score, JSON.stringify(ov), r.id);
      return { ok: true };
    });
  }
  deleteAttempt(teacher, S, resultId) {
    this.db.prepare('DELETE FROM attempts WHERE id = ? AND teacher_id = ?').run(String(resultId), teacher.id);
    return { ok: true };
  }

  /** CSV of a test's results (the "Spreadsheet" button). */
  exportCsv(teacher, S, testId) {
    const res = this.getResults(teacher, S, testId);
    const head = ['Name', 'Class', 'Status', 'Score', 'Max', 'Started', 'Submitted', 'Left page (times)', 'Away (s)', 'Copied', 'Paste tries', 'Device', 'Browser', 'IP', 'Warnings'];
    const iso = ms => ms ? new Date(ms).toISOString().replace('T', ' ').slice(0, 19) : '';
    const lines = [head].concat(res.results.map(r => { const d = r.device || { label: '', browser: '', os: '', ip: '' };
      return [r.name, r.group, r.status, r.grade ? r.grade.score : '', r.grade ? r.grade.max : '',
      iso(r.started), iso(r.submitted), r.activity.leftCount, Math.round(r.activity.leftMs / 1000), r.activity.copyCount, r.activity.pasteCount,
      d.label, d.browser + ' / ' + d.os, d.ip, r.flags.map(f => f.uk).join(' | ')]; }));
    return '﻿' + lines.map(l => l.map(v => { v = String(v == null ? '' : v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; }).join(',')).join('\r\n');
  }

  // ---------- classes, AI key ----------
  // ---------- gradebook: a class × this teacher's tests of one subject ----------
  /** The school's classes with how many students each has (for the gradebook's class picker). */
  gradeClasses(teacher) {
    const cnt = {}, grp = {};
    this.db.prepare('SELECT class_name, subgroup FROM students WHERE active = 1 AND school_id = ?').all(teacher.school_id || 0).forEach(r => {
      const k = classKey(r.class_name); cnt[k] = (cnt[k] || 0) + 1;
      if (r.subgroup) { grp[k] = grp[k] || {}; grp[k][r.subgroup] = (grp[k][r.subgroup] || 0) + 1; }
    });
    return { classes: this.classesOf(teacher.id).map(c => ({ name: c, students: cnt[classKey(c)] || 0,
      groups: Object.keys(grp[classKey(c)] || {}).map(Number).sort().map(g => ({ group: g, students: grp[classKey(c)][g] })) })).filter(c => c.students) };
  }
  /** group: 0 = the whole class, 1/2/… = only that group of the class (the administrator splits a class into groups). */
  gradebook(teacher, S, cls, group) {
    const c = S.ctx, k = classKey(cls), g = Math.max(0, Math.floor(Number(group) || 0));
    if (!k) throw USER('cls_none', 'Choose a class.');
    this.finalizeExpired(teacher.id);
    const students = this.db.prepare('SELECT id, name, login, class_name, subgroup FROM students WHERE school_id = ?').all(teacher.school_id || 0).filter(x => classKey(x.class_name) === k && (!g || x.subgroup === g))
      .sort((a, b) => a.name.localeCompare(b.name, 'uk'));
    const ids = {}; students.forEach(x => { ids[x.id] = 1; });
    const attempts = {}; this.db.prepare('SELECT * FROM attempts WHERE teacher_id = ? AND student_id IS NOT NULL ORDER BY started').all(teacher.id)
      .forEach(a => { if (ids[a.student_id]) attempts[a.test_id + '|' + a.student_id] = a; });
    const grades = {}; this.db.prepare('SELECT * FROM grades WHERE teacher_id = ?').all(teacher.id).forEach(g => { grades[g.test_id + '|' + g.student_id] = g; });
    const tests = this.db.prepare('SELECT * FROM tests WHERE teacher_id = ? AND subject = ? ORDER BY created').all(teacher.id, S.key)
      .filter(t => this.forClass(t, { class_name: cls, school_id: teacher.school_id }) && (t.status === 'published' || students.some(x => attempts[t.id + '|' + x.id])));
    // the dated view: a lesson mark per day (day_marks), and each test on its day (when it opened, or when the first student handed it in)
    const days = {}; this.db.prepare('SELECT student_id, day, grade, note FROM day_marks WHERE teacher_id = ? AND subject = ?').all(teacher.id, S.key)
      .forEach(m => { if (ids[m.student_id]) (days[m.student_id] = days[m.student_id] || {})[m.day] = { grade: m.grade, note: m.note }; });
    const testAt = t => { const s = c.normSettings_(J(t.settings, {})); if (s.opensAt) return Number(s.opensAt);
      const sub = students.map(x => attempts[t.id + '|' + x.id]).filter(a => a && a.submitted).map(a => a.submitted); return sub.length ? Math.min.apply(null, sub) : t.created; };
    const topics = {}; this.db.prepare('SELECT day, topic FROM day_topics WHERE teacher_id = ? AND subject = ? AND cls = ? AND grp = ?').all(teacher.id, S.key, k, g).forEach(r => { topics[r.day] = r.topic; });
    const finals = {}, periods = {}; this.db.prepare('SELECT student_id, period, grade FROM final_marks WHERE teacher_id = ? AND subject = ?').all(teacher.id, S.key)
      .forEach(m => { if (!ids[m.student_id]) return; (finals[m.student_id] = finals[m.student_id] || {})[m.period] = m.grade; if (m.period.indexOf('th:') === 0) periods[m.period] = 1; });
    return {
      cls: cls, group: g, subject: S.info, topics: topics, themes: Object.keys(periods).sort(),
      hw: this.learn ? this.learn.forGradebook(teacher, S.key, cls, g) : { tasks: [], marks: {} },   // homework marks («🎓 Навчання»), on the due day
      tests: tests.map(t => { const content = c.normContent_(J(t.content, { sections: [] })); return { id: t.id, titles: plain(c.titlesOf_(this.row(t), content)), max: c.maxScore_(content), common: this.accessOf(t).mode === 'all', at: testAt(t) }; }),
      students: students.map(x => ({ id: x.id, name: x.name, login: x.login, group: x.subgroup || 0, days: days[x.id] || {}, finals: finals[x.id] || {}, cells: tests.map(t => {
        const a = attempts[t.id + '|' + x.id], g = grades[t.id + '|' + x.id], cell = { grade: g ? g.grade : '', note: g ? g.note : '' };
        if (a) {
          cell.status = a.submitted ? a.status : 'In progress'; cell.attempt = a.id;
          if (a.submitted) { const gr = c.gradeAll_(c.normContent_(J(t.content, {})), J(a.answers, {}), J(a.overrides, {})); cell.score = gr.score; cell.max = gr.max;
            cell.suggest = gr.max ? Math.max(1, Math.min(12, Math.round(gr.score / gr.max * 12))) : null; }
        }
        return cell;
      }) }))
    };
  }
  /** One mark: 1–12, or a short word («н», «зар.»), or '' to clear. */
  setGrade(teacher, S, testId, studentId, grade, note) {
    const t = this.ownTest(teacher, S.key, testId);
    const st = this.db.prepare('SELECT id, class_name FROM students WHERE id = ? AND school_id = ?').get(Number(studentId) || 0, teacher.school_id || 0);
    if (!st) throw USER('st_none', 'This student was not found.', 404);
    grade = String(grade == null ? '' : grade).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 12);
    if (/^\d+$/.test(grade) && (Number(grade) < 1 || Number(grade) > 12)) throw USER('bad_grade', 'A mark is from 1 to 12.');
    note = String(note == null ? '' : note).replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, 200);
    if (!grade && !note) this.db.prepare('DELETE FROM grades WHERE test_id = ? AND student_id = ?').run(t.id, st.id);
    else this.db.prepare('INSERT INTO grades (test_id, student_id, teacher_id, grade, note, updated) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (test_id, student_id) DO UPDATE SET grade = excluded.grade, note = excluded.note, teacher_id = excluded.teacher_id, updated = excluded.updated')
      .run(t.id, st.id, teacher.id, grade, note, now());
    return { ok: true, grade: grade, note: note };
  }

  /** A lesson mark in the dated gradebook: day = YYYY-MM-DD, mark 1–12 or a short word («н»); '' clears it. */
  setDayMark(teacher, S, studentId, day, grade, note) {
    const st = this.db.prepare('SELECT id FROM students WHERE id = ? AND school_id = ?').get(Number(studentId) || 0, teacher.school_id || 0);
    if (!st) throw USER('st_none', 'This student was not found.', 404);
    day = String(day || ''); const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
    if (!d || isNaN(Date.UTC(+d[1], +d[2] - 1, +d[3])) || +d[2] < 1 || +d[2] > 12 || +d[3] < 1 || +d[3] > 31) throw USER('bad_day', 'Choose a date.');
    grade = String(grade == null ? '' : grade).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 12);
    if (/^\d+$/.test(grade) && (Number(grade) < 1 || Number(grade) > 12)) throw USER('bad_grade', 'A mark is from 1 to 12.');
    grade = absence(grade) || grade;
    note = String(note == null ? '' : note).replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, 200);
    if (!grade && !note) this.db.prepare('DELETE FROM day_marks WHERE teacher_id = ? AND subject = ? AND student_id = ? AND day = ?').run(teacher.id, S.key, st.id, day);
    else this.db.prepare('INSERT INTO day_marks (teacher_id, subject, student_id, day, grade, note, updated) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT (teacher_id, subject, student_id, day) DO UPDATE SET grade = excluded.grade, note = excluded.note, updated = excluded.updated')
      .run(teacher.id, S.key, st.id, day, grade, note, now());
    return { ok: true, day: day, grade: grade, note: note };
  }

  /** The lesson's topic on a day, for the class (or one group of it); '' clears it. */
  setDayTopic(teacher, S, cls, group, day, topic) {
    const k = classKey(cls), g = Math.max(0, Math.floor(Number(group) || 0));
    if (!k) throw USER('cls_none', 'Choose a class.');
    day = checkDay(day);
    topic = String(topic == null ? '' : topic).replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
    if (!topic) this.db.prepare('DELETE FROM day_topics WHERE teacher_id = ? AND subject = ? AND cls = ? AND grp = ? AND day = ?').run(teacher.id, S.key, k, g, day);
    else this.db.prepare('INSERT INTO day_topics (teacher_id, subject, cls, grp, day, topic, updated) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT (teacher_id, subject, cls, grp, day) DO UPDATE SET topic = excluded.topic, updated = excluded.updated')
      .run(teacher.id, S.key, k, g, day, topic, now());
    return { ok: true, day: day, topic: topic };
  }

  /**
   * A mark for a period, always set by the teacher (the page only shows the average as a hint):
   * period 'sem1' | 'sem2' | 'year' | 'th:<topic>' («тематична»); grade 1–12, «зар.», «н/а» or '' to clear.
   */
  setFinalMark(teacher, S, studentId, period, grade) {
    const st = this.db.prepare('SELECT id FROM students WHERE id = ? AND school_id = ?').get(Number(studentId) || 0, teacher.school_id || 0);
    if (!st) throw USER('st_none', 'This student was not found.', 404);
    period = checkPeriod(period);
    grade = String(grade == null ? '' : grade).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 12);
    if (/^\d+$/.test(grade) && (Number(grade) < 1 || Number(grade) > 12)) throw USER('bad_grade', 'A mark is from 1 to 12.');
    if (!grade) this.db.prepare('DELETE FROM final_marks WHERE teacher_id = ? AND subject = ? AND student_id = ? AND period = ?').run(teacher.id, S.key, st.id, period);
    else this.db.prepare('INSERT INTO final_marks (teacher_id, subject, student_id, period, grade, updated) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (teacher_id, subject, student_id, period) DO UPDATE SET grade = excluded.grade, updated = excluded.updated')
      .run(teacher.id, S.key, st.id, period, grade, now());
    return { ok: true, period: period, grade: grade };
  }

  /** A «тематична» column with no marks yet is kept by the page; renaming moves the marks of this class (or group). */
  renameTheme(teacher, S, cls, group, from, to) {
    from = checkPeriod(from); to = checkPeriod(to);
    if (from.indexOf('th:') || to.indexOf('th:')) throw USER('bad_period', 'Only a topic column can be renamed.');
    const gb = this.gradebook(teacher, S, cls, group), ids = gb.students.map(x => x.id);
    if (gb.students.some(x => x.finals[to] && x.finals[from])) throw USER('period_taken', 'A column with this name already has marks.');
    tx(this.db, () => ids.forEach(id => this.db.prepare('UPDATE final_marks SET period = ? WHERE teacher_id = ? AND subject = ? AND student_id = ? AND period = ?').run(to, teacher.id, S.key, id, from)));
    return { ok: true };
  }

  /**
   * The gradebook of a class as a spreadsheet (CSV, «;» and a BOM so Excel opens it in Ukrainian): every day with its marks,
   * absences, the average, the period marks. For moving the marks to the school's official journal («Мрія» and others). Logged.
   */
  exportGradebook(teacher, S, cls, group) {
    const gb = this.gradebook(teacher, S, cls, group);
    const day = ms => { const d = new Date(ms); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    const set = {}, testDay = gb.tests.map(t => { const d = day(t.at); set[d] = 1; return d; }), hwDay = {};
    (gb.hw.tasks || []).forEach(h => { hwDay[h.id] = day(h.due); set[hwDay[h.id]] = 1; });
    Object.keys(gb.topics).forEach(d => { set[d] = 1; });
    gb.students.forEach(x => Object.keys(x.days).forEach(d => { set[d] = 1; }));
    const days = Object.keys(set).sort(), label = d => d.slice(8, 10) + '.' + d.slice(5, 7);
    const per = ['sem1', 'sem2', 'year'], PER = { sem1: 'І семестр', sem2: 'ІІ семестр', year: 'Річна' };
    const head = ['№', 'Учень'].concat(days.map(d => label(d) + (gb.topics[d] ? ' ' + gb.topics[d] : '')), ['н', 'нп', 'Середня'], gb.themes.map(t => 'Тематична: ' + t.slice(3)), per.map(p => PER[p]));
    const lines = [head].concat(gb.students.map((x, i) => {
      const nums = [], absent = { н: 0, нп: 0 };
      const cells = days.map(d => {
        const out = [];
        gb.tests.forEach((t, j) => { if (testDay[j] === d && x.cells[j].grade) out.push(x.cells[j].grade); });
        (gb.hw.tasks || []).forEach(h => { const m = (gb.hw.marks[x.id] || {})[h.id]; if (hwDay[h.id] === d && m && m.grade) out.push(m.grade); });
        const m = x.days[d]; if (m && m.grade) out.push(m.grade);
        out.forEach(g => { if (/^\d+$/.test(g)) nums.push(Number(g)); else if (absent[absence(g)] != null) absent[absence(g)]++; });
        return out.join(' ');
      });
      const avg = nums.length ? (Math.round(nums.reduce((a, b) => a + b, 0) / nums.length * 10) / 10).toString().replace('.', ',') : '';
      return [i + 1, x.name].concat(cells, [absent['н'] || '', absent['нп'] || '', avg], gb.themes.map(t => x.finals[t] || ''), per.map(p => x.finals[p] || ''));
    }));
    audit(this.db, teacher.email, 'gradebook.export', S.key + ' ' + gb.cls + (gb.group ? ' гр.' + gb.group : '') + ' (' + gb.students.length + ')', this._req && this._req.net ? this._req.net.ip : '');
    const csv = '﻿' + lines.map(l => l.map(v => { v = String(v == null ? '' : v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; }).join(';')).join('\r\n');
    return { name: 'journal-' + S.key + '-' + classKey(gb.cls).replace(/[^a-z0-9Ѐ-ӿ]/g, '') + (gb.group ? '-g' + gb.group : '') + '.csv', csv: csv };
  }

  /**
   * A teacher's request: how one student of the school is doing in every subject (tests of this school's teachers, handed in)
   * and which topics are not understood yet (tests and parts under 60 %, with the questions that went wrong). Logged.
   */
  studentReport(teacher, S, studentId) {
    const st = this.db.prepare('SELECT id, name, class_name, school_id FROM students WHERE id = ? AND school_id = ?').get(Number(studentId) || 0, teacher.school_id || 0);
    if (!st) throw USER('st_none', 'This student was not found.', 404);
    // only those who teach the student (a test of theirs for the student's class, or a work of the student) and the school's administrator
    const teaches = teacher.role === 'owner' || teacher.role === 'admin' || !!this.db.prepare('SELECT 1 FROM attempts WHERE teacher_id = ? AND student_id = ? LIMIT 1').get(teacher.id, st.id) ||
      this.db.prepare('SELECT * FROM tests WHERE teacher_id = ?').all(teacher.id).some(t => { const a = this.accessOf(t); return a.mode === 'classes' && a.classes.some(c => classKey(c) === classKey(st.class_name)); })
      || (!!this.learn && this.learn.teaches(teacher, st))   // or homework for the student's class («🎓 Навчання»)
      || !!this.db.prepare('SELECT 1 FROM day_marks WHERE teacher_id = ? AND student_id = ? UNION SELECT 1 FROM final_marks WHERE teacher_id = ? AND student_id = ? LIMIT 1').get(teacher.id, st.id, teacher.id, st.id);   // or marks in the journal
    if (!teaches) throw USER('not_your_student', 'Only teachers of this student and the school administrator can see the report.', 403);
    this.finalizeExpired(teacher.id);
    const r = this.reportOf(st);
    audit(this.db, teacher.email, 'student.report', st.name + ' (' + st.class_name + ')', '');
    return r;
  }
  /** The report itself (no access check here: studentReport for staff, the parent's page for one student). */
  reportOf(st) {
    const rows = this.db.prepare('SELECT a.*, t.subject, t.title AS ttitle, t.content AS tcontent, t.id AS tid, t.created AS tcreated, t.teacher_id AS tteacher FROM attempts a JOIN tests t ON t.id = a.test_id JOIN teachers te ON te.id = t.teacher_id ' +
      'WHERE a.student_id = ? AND a.submitted IS NOT NULL AND te.school_id = ? ORDER BY a.submitted').all(st.id, st.school_id);
    const marks = {}; this.db.prepare('SELECT test_id, grade FROM grades WHERE student_id = ?').all(st.id).forEach(g => { marks[g.test_id] = g.grade; });
    const dayMarks = this.db.prepare('SELECT subject, grade FROM day_marks WHERE student_id = ?').all(st.id);
    const hw = this.learn ? this.learn.forReport(st) : {};   // homework: given, handed in, marks
    const pct = (got, max) => max ? Math.round(got / max * 100) : null;
    const GENERIC = /^(частина|розділ|part|section)\b/i;
    const subjects = Object.keys(this.subjects).map(key => {
      const S2 = this.subjects[key], c = S2.ctx, mine = rows.filter(r => r.subject === key);
      const h = hw[key] || null;
      const nums = mine.map(r => marks[r.tid]).concat(dayMarks.filter(m => m.subject === key).map(m => m.grade)).concat(h ? h.marks : []).filter(g => /^\d+$/.test(g)).map(Number);
      const absent = { n: 0, np: 0 }; dayMarks.forEach(m => { if (m.subject !== key) return; const x = absence(m.grade); if (x === 'н') absent.n++; else if (x === 'нп') absent.np++; });
      if (!mine.length && !nums.length && !h && !absent.n && !absent.np) return null;
      let got = 0, max = 0;
      const topics = mine.map(r => {
        const content = c.normContent_(J(r.tcontent, { sections: [] })), gr = c.gradeAll_(content, J(r.answers, {}), J(r.overrides, {}));
        got += gr.score; max += gr.max;
        const title = txt(plain(c.titlesOf_(this.row({ id: r.tid, title: r.ttitle }), content))) || r.ttitle;
        const parts = gr.sections.filter(x => x.scored && pct(x.got, x.scored) < 60 && txt(x.title) && !GENERIC.test(txt(x.title).trim()))
          .map(x => ({ title: txt(x.title).slice(0, 120), pct: pct(x.got, x.scored) }));
        const wrong = [];
        gr.sections.forEach(x => x.questions.forEach(q => { if (q.scored && q.got < q.pts) wrong.push(txt(q.q).replace(/\s+/g, ' ').slice(0, 160)); }));
        return { test: r.tid, title: String(title).slice(0, 140), at: r.submitted, pct: pct(gr.score, gr.max), mark: marks[r.tid] || '', parts: parts, wrong: wrong.length, examples: wrong.slice(0, 3) };
      });
      const p = pct(got, max), half = Math.floor(topics.length / 2);
      const avgOf = a => { const v = a.filter(t => t.pct != null); return v.length ? v.reduce((n, t) => n + t.pct, 0) / v.length : null; };
      const early = avgOf(topics.slice(0, half)), late = avgOf(topics.slice(half));
      return { key: key, icon: S2.icon, name: S2.info.name, tests: topics.length, pct: p, hw: h ? { given: h.given, done: h.done } : null, absent: absent,
        avgMark: nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length * 10) / 10 : null,
        level: p == null ? '' : p >= 85 ? 'excellent' : p >= 70 ? 'good' : p >= 50 ? 'fair' : 'weak',
        trend: topics.length >= 4 && early != null && late != null ? (late - early >= 10 ? 'up' : early - late >= 10 ? 'down' : 'flat') : '',
        weak: topics.filter(t => t.pct != null && t.pct < 60).sort((a, b) => a.pct - b.pct), topics: topics };
    }).filter(Boolean);
    return { student: { id: st.id, name: st.name, cls: st.class_name }, made: now(), subjects: subjects };
  }

  listClasses(teacher) { return { classes: this.classesOf(teacher.id) }; }
  saveClasses(teacher, S, arr) {
    const seen = {}, out = [];
    // the school's classes are always there (the administrator manages them); only the teacher's own extra ones are saved
    this.db.prepare('SELECT c.name FROM school_classes c JOIN teachers t ON t.school_id = c.school_id WHERE t.id = ?').all(teacher.id).forEach(r => { seen[classKey(r.name)] = 1; });
    (Array.isArray(arr) ? arr : []).forEach(x => { const c = S.ctx.clean_(x, 60); if (c && !seen[classKey(c)]) { seen[classKey(c)] = 1; out.push(c); } });
    this.db.prepare('UPDATE teachers SET classes = ? WHERE id = ?').run(JSON.stringify(out.slice(0, 100)), teacher.id);
    return { ok: true, classes: this.classesOf(teacher.id) };
  }
  saveAiKey(teacher, S, key) {
    key = S.ctx.clean_(key, 200);
    this.db.prepare('UPDATE teachers SET ai_key = ?, ai_model = ? WHERE id = ?').run(key, '', teacher.id);
    teacher.ai_key = key;
    return { ok: true, hasAiKey: !!this.aiKey(teacher) };
  }
  ai(teacher, S) {
    const key = this.aiKey(teacher);
    if (!key) throw USER('no_key', 'Add your Gemini API key first (the "AI key" button), or set GEMINI_API_KEY on the server.');
    const fetcher = this.opts.geminiCall || gemini.callGemini;
    return { call: body => fetcher(key, body, plain(S.x.GEMINI_MODELS), teacher && teacher.ai_model,
      m => { if (teacher) this.db.prepare('UPDATE teachers SET ai_model = ? WHERE id = ?').run(m, teacher.id); }) };
  }

  async generateFromPhotos(teacher, S, images, extraNote, langs) {
    const c = S.ctx, ai = this.ai(teacher, S);
    // once per teacher: no students' work or names to the AI, every AI question is checked (the «Тест із фото» dialog asks)
    if (!teacher.ai_ack_at) throw USER('ai_ack', 'Confirm the AI rules first (the box in the «Test from photos» window).');
    if (!Array.isArray(images) || !images.length) throw USER('no_photo', 'Please attach at least one photo.');
    const sl = plain(S.info.langs || S.x.LANGS);
    langs = (Array.isArray(langs) ? langs : []).filter(l => sl.indexOf(l) >= 0);
    if (!langs.length) langs = sl.slice();
    const many = images.length > 1 ? '\nThere are ' + Math.min(images.length, MAX_PHOTOS) + ' photos: they are consecutive pages of ONE test. Make one test with the questions of all pages, in page order.' : '';
    const parts = [{ text: S.x.AI_INSTRUCTIONS + c.aiLangRules_(langs) + many + (extraNote ? ('\nExtra instructions from the teacher: ' + c.clean_(extraNote, 400)) : '') }];
    images.slice(0, MAX_PHOTOS).forEach(img => {
      const m = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(String(img && img.dataUrl || ''));
      if (m) parts.push({ inline_data: { mime_type: m[1], data: m[2] } });
    });
    if (parts.length - 1 < Math.min(images.length, MAX_PHOTOS)) throw USER('bad_photo', 'Some photos could not be read (' + (Math.min(images.length, MAX_PHOTOS) - parts.length + 1) + '). Remove them or choose other images.');
    if (parts.length < 2) throw USER('bad_photo', 'Could not read the photo. Please try another image.');
    const body = JSON.stringify({ contents: [{ parts: parts }], generationConfig: { temperature: 0.2, response_mime_type: 'application/json', maxOutputTokens: 16384 } });
    const result = await ai.call(body);
    let parsed;
    try { parsed = JSON.parse(gemini.stripFence(result.text)); } catch (e) { throw USER('ai_unreadable', 'The AI reply could not be read. Please try again or use a clearer photo.'); }
    if (!parsed || typeof parsed !== 'object') throw USER('ai_unreadable', 'The AI reply could not be read. Please try again or use a clearer photo.');
    parsed.langs = S.info.mode === 'translate' ? ['en'] : langs;
    parsed.allowTranslate = S.info.mode === 'translate';
    const content = c.normContent_(parsed);
    if (c.countQ_(content) === 0) throw USER('ai_empty', 'No questions were found on the photo. Try a sharper, straight-on picture.');
    const title = typeof parsed.title === 'object' && parsed.title ? (parsed.title.uk || parsed.title.en) : parsed.title;
    return plain({ ok: true, model: result.model, title: c.clean_(title, 140) || 'New test', content: content, warnings: c.contentWarnings_(content) });
  }

  async autoTranslate(teacher, S, content) {
    const c = S.ctx;
    const cn = c.normContent_(plain(content || {}));
    const miss = plain(c.missingTr_(cn));
    if (!miss.length) return plain({ ok: true, content: cn, filled: 0 });
    const ai = this.ai(teacher, S);
    const items = [], refs = [];
    miss.slice(0, 300).forEach(m => {
      const at = m.at, sec = at.field === 'ttitle' ? null : cn.sections[at.si];
      const L = at.field === 'ttitle' ? cn.title : at.field === 'title' || at.field === 'instructions' ? sec[at.field]
        : at.field === 'options' ? sec.questions[at.qi].options[at.oi]
        : at.field === 'pairs' ? sec.questions[at.qi].pairs[at.pi][at.side] : sec.questions[at.qi][at.field];
      items.push({ text: L[m.lang === 'uk' ? 'en' : 'uk'], to: m.lang }); refs.push({ L: L, lang: m.lang });
    });
    const out = [];
    for (let i = 0; i < items.length; i += 60) Array.prototype.push.apply(out, await gemini.translateTexts(ai, items.slice(i, i + 60)));
    refs.forEach((r, i) => { r.L[r.lang] = c.clean_(out[i], 1000); });
    return plain({ ok: true, content: c.normContent_(cn), filled: refs.length, warnings: c.contentWarnings_(cn) });
  }

  // ======================================================================
  //  STUDENT
  // ======================================================================

  /**
   * The student's home page: every subject, and in each the published tests set for the student's class
   * (by any teacher), with the student's own result. A subject without tests is shown with ❌ by the page.
   */
  studentHome(st) {
    const n = now(), k = classKey(st.class_name);
    const mine = {}; this.db.prepare('SELECT * FROM attempts WHERE student_id = ? ORDER BY started').all(st.id).forEach(a => { mine[a.test_id] = a; });
    const grades = {}; this.db.prepare("SELECT test_id, grade FROM grades WHERE student_id = ? AND grade <> ''").all(st.id).forEach(g => { grades[g.test_id] = g.grade; });
    const tests = k ? this.db.prepare("SELECT t.*, te.name AS tname FROM tests t JOIN teachers te ON te.id = t.teacher_id WHERE t.status = 'published' AND te.active = 1").all()
      .filter(t => this.subjects[t.subject] && this.forClass(t, st)) : [];
    const ORDER = { open: 0, scheduled: 1, waiting: 2, closed: 3 };
    return {
      student: { name: st.name, login: st.login, cls: st.class_name, school: (this.db.prepare('SELECT name FROM schools WHERE id = ?').get(st.school_id || 0) || {}).name || '' }, serverNow: n,
      parent: require('./parents').isOn(this.db, st.school_id) ? require('./parents').statusOf(this.db, st.id) : null,   // the parents' code (shown in «Профіль»)
      subjects: Object.keys(this.subjects).filter(key => !this.subjectOff(st, key)).map(key => {
        const S = this.subjects[key], c = S.ctx;
        const list = tests.filter(t => t.subject === key).map(t => {
          const s = c.normSettings_(J(t.settings, {})), content = c.normContent_(J(t.content, { sections: [] })), a = mine[t.id];
          const out = { id: t.id, titles: plain(c.titlesOf_(this.row(t), content)), teacher: t.tname, state: c.stateOf_(t.status, s, n),
            opensAt: s.opensAt || null, closesAt: c.closeAt_(s) || null, minutes: s.minutes || 0, questions: c.countQ_(content),
            mine: a ? (a.submitted ? 'done' : 'started') : '', common: this.accessOf(t).mode === 'all' };
          const gr = grades[t.id]; if (gr) out.grade = gr;
          if (this.reviewOpen(S, t, a, n)) out.review = true;
          if (a && a.submitted && s.showScore) {
            const g = c.gradeAll_(content, J(a.answers, {}), J(a.overrides, {}));
            out.score = { score: g.score, max: g.max };
          }
          return out;
        }).filter(x => x.state !== 'waiting' || x.mine)
          .sort((x, y) => ((x.mine === 'done') - (y.mine === 'done')) || (ORDER[x.state] - ORDER[y.state]) || String(x.titles.uk).localeCompare(String(y.titles.uk), 'uk'));
        return { key: key, icon: S.icon, name: S.info.name, tests: list };
      })
    };
  }

  testByCode(id) {
    const t = this.db.prepare('SELECT * FROM tests WHERE id = ?').get(String(id || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16));
    if (!t || !this.subjects[t.subject]) throw USER('not_found', 'This test was not found.', 404);
    return t;
  }

  testInfo(id, net, st) {
    const t = this.testByCode(id), S = this.subjects[t.subject], c = S.ctx, n = now();
    this.checkNet(t, net);
    if (st) this.checkClass(t, st);
    else if (!this.guestsOk(t)) throw USER('auth', 'Please log in.', 401);
    const s = c.normSettings_(J(t.settings, {})), content = c.normContent_(J(t.content, { sections: [] }));
    const info = plain({ serverNow: n, id: t.id, title: t.title, titles: c.titlesOf_(this.row(t), content), state: c.stateOf_(t.status, s, n),
      opensAt: s.opensAt, closesAt: c.closeAt_(s), minutes: s.minutes, monitor: s.monitor, classes: this.classesOf(t.teacher_id),
      folder: t.folder, subject: { key: S.key, name: S.info.name } });
    const ex = this.extrasOf(t);
    const sc = this.db.prepare('SELECT s.name FROM teachers t JOIN schools s ON s.id = t.school_id WHERE t.id = ?').get(t.teacher_id);
    Object.assign(info, plain(c.langInfo_(content)), { fullscreen: ex.fullscreen, deviceTrack: !!(ex.deviceTrack || ex.deviceLock), school: sc ? sc.name : '' });
    if (st) { const a = this.db.prepare('SELECT submitted FROM attempts WHERE test_id = ? AND student_id = ? ORDER BY started DESC LIMIT 1').get(t.id, st.id); info.mine = a ? (a.submitted ? 'done' : 'started') : ''; }
    return info;
  }

  /** Without an account: «🌍 Кожний бажаючий» (access 'all') is open to anyone who types a name; a class test only when the teacher also allowed guests. */
  guestsOk(t) { return !!this.extrasOf(t).guests || this.accessOf(t).mode === 'all'; }
  /** Who may take a test: { mode: 'all' } — any student of the school, or { mode: 'classes', classes: [...] } — only those classes. */
  accessOf(t) {
    const ex = this.extrasOf(t);
    const classes = ex.classes.length ? ex.classes : (t.folder ? [t.folder] : []);
    const mode = ex.access === 'all' || !classes.length ? 'all' : 'classes';
    return { mode: mode, classes: mode === 'all' ? [] : classes };
  }
  /** Can this student ({ class_name, school_id }) take test t? Only tests of teachers of the student's own school: «common» = the whole school. */
  forClass(t, st) {
    const te = this.db.prepare('SELECT school_id FROM teachers WHERE id = ?').get(t.teacher_id);
    if (!te || !st || te.school_id !== st.school_id) return false;
    if (this.subjectOff(st, t.subject)) return false;
    const a = this.accessOf(t); return a.mode === 'all' || a.classes.some(c => classKey(c) === classKey(st.class_name));
  }
  /** The school's administrator can turn a subject off for a class: its students neither see it nor open its tests. */
  subjectOff(st, subject) {
    const k = classKey(st && st.class_name); if (!k) return false;
    const row = this.db.prepare('SELECT name, subjects_off FROM school_classes WHERE school_id = ?').all(st.school_id || 0).filter(r => classKey(r.name) === k)[0];
    return !!row && J(row.subjects_off, []).indexOf(subject) >= 0;
  }
  /** A test for chosen classes opens only for the students of those classes (the link / QR does not help anybody else). */
  checkClass(t, student) {
    if (this.subjectOff(student, t.subject)) throw USER('subject_off', 'This subject is not available for your class.', 403);
    if (!this.forClass(t, student)) throw USER('wrong_class', 'This test is for another class.', 403);
  }

  /**
   * Student pressed Start. Name and class come from the student's account (whatever the page sends is ignored).
   * One attempt per account per test; a started attempt can be continued from any device the student signs in on.
   */
  startAttempt(id, name, group, fp, who) {
    const st = who && who.student;
    const t0 = this.testByCode(id), S = this.subjects[t0.subject], c = S.ctx;
    // without an account only when the teacher allowed it for this test: then the student types name and class
    if (!st && !this.guestsOk(t0)) throw USER('auth', 'Please log in.', 401);
    if (st) { name = c.clean_(st.name, 80); group = c.clean_(st.class_name, 40); }
    else {
      name = c.clean_(name, 80); group = c.clean_(group, 40);
      if (name.replace(/\s+/g, '').length < 2) throw USER('name', 'Please type your full name.');
    }
    // device data only when the teacher turned «Записувати пристрій та IP» on (or «one device = one attempt», which needs it).
    // A guest (no account) still gets a browser cookie, set only now, after the notice: it is how the page can be
    // reopened on the same device, and nothing else is recorded about the device.
    const ex0 = this.extrasOf(t0), track = ex0.deviceTrack || ex0.deviceLock;
    let raw = /^[A-Za-z0-9_-]{20,64}$/.test(who.devId || '') ? who.devId : '';
    if (!raw && (track || !st) && who.setDev) raw = who.setDev();
    const dev = track ? cleanFp(fp) : {}, fpHash = track ? fpHashOf(dev) : '', devId = raw && (track || !st) ? sha('dev|' + raw) : '';
    const ip = track ? who.ip || '' : '';
    return tx(this.db, () => {
      const n = now(), t = this.testByCode(id);
      this.checkNet(t, who);
      if (st) this.checkClass(t, st);
      else if (!this.guestsOk(t)) throw USER('auth', 'Please log in.', 401);
      const s = c.normSettings_(J(t.settings, {})), state = c.stateOf_(t.status, s, n);
      if (state === 'scheduled' || state === 'waiting' || state === 'draft') throw USER('not_open', 'The test has not opened yet.');
      if (state !== 'open') throw USER('closed', 'The test is closed.');
      const key = st ? '#s' + st.id : c.nameKey_(name);
      const prev = st ? this.db.prepare('SELECT * FROM attempts WHERE test_id = ? AND (student_id = ? OR name_key = ?) ORDER BY started DESC LIMIT 1').get(t.id, st.id, key)
        : this.db.prepare('SELECT * FROM attempts WHERE test_id = ? AND name_key = ? AND student_id IS NULL ORDER BY started DESC LIMIT 1').get(t.id, key);
      if (prev) {
        if (prev.submitted) throw USER('already', st ? 'You have already submitted this test. Ask your teacher if you need another try.' : 'This name has already submitted this test. Ask your teacher if you need another try.');
        // a guest's attempt (no account) can be continued only from the same device: nobody can take over a name
        if (!st && !((devId && prev.dev_id === devId) || (fpHash && prev.fp_hash === fpHash && prev.ip === ip))) throw USER('busy', 'This name already has the test open on another device. Ask your teacher.');
        return this.payload(S, t, prev, n);
      }
      if (this.extrasOf(t).deviceLock) {
        const other = this.db.prepare('SELECT name FROM attempts WHERE test_id = ? AND name_key <> ? AND ((dev_id <> \'\' AND dev_id = ?) OR (fp_hash <> \'\' AND fp_hash = ? AND ip = ?))')
          .get(t.id, key, devId, fpHash, ip);
        if (other) throw USER('device', 'This test was already taken on this device. Ask your teacher.');
      }
      let deadline = s.minutes ? n + s.minutes * 60000 : null;
      const cl = c.closeAt_(s);
      if (cl && (!deadline || deadline > cl)) deadline = cl;
      const pub = plain(c.publicTest_(this.row(t)));
      const plan = makePlan(pub, s);
      const aid = token(12);
      this.db.prepare(`INSERT INTO attempts (id, test_id, teacher_id, ttitle, started, name, name_key, grp, status, deadline, answers, plan, dev_id, fp_hash, fp, ip, ua, via, student_id)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(aid, t.id, t.teacher_id, t.title, n, name, key, group, 'In progress', deadline, '{}',
        JSON.stringify(plan), devId, fpHash, JSON.stringify(dev), ip, track ? String(who.ua || '').slice(0, 400) : '', who.local === false ? 'internet' : 'lan', st ? st.id : null);
      return this.payload(S, t, this.db.prepare('SELECT * FROM attempts WHERE id = ?').get(aid), n);
    });
  }
  /** What the student page needs: the test without keys, in this attempt's own order. */
  payload(S, t, a, n) {
    const plan = J(a.plan, {}), pub = applyPlan(plain(S.ctx.publicTest_(this.row(t))), plan);
    const content = S.ctx.normContent_(J(t.content, {}));
    const stored = J(a.answers, {});
    const act = J(a.activity, null);
    const ex = this.extrasOf(t);
    return { id: a.id, seed: 1, name: a.name, group: a.grp, deadline: a.deadline, serverNow: n, test: pub,
      resume: Object.keys(stored).length ? toShown(stored, plan, content) : null, resumeAct: act, pos: a.max_pos || 0,
      fullscreen: ex.fullscreen,
      ac: { blockKeys: ex.blockKeys, detectDevtools: ex.detectDevtools, watermark: ex.watermark, multiTab: ex.multiTab, aiTrap: ex.aiTrap } };
  }

  attemptRow(id) {
    const a = this.db.prepare('SELECT * FROM attempts WHERE id = ?').get(String(id || ''));
    if (!a) throw USER('gone', 'This attempt no longer exists. Ask your teacher.');
    return a;
  }
  /** Only the student who started an attempt can save, submit or translate in it. */
  checkOwner(id, student) {
    const a = this.db.prepare('SELECT student_id FROM attempts WHERE id = ?').get(String(id || ''));
    // a guest attempt (test open without an account) is reached by its own long random id, like before accounts existed
    if (a && a.student_id != null && (!student || a.student_id !== student.id)) throw USER('gone', 'This attempt no longer exists. Ask your teacher.', 403);
  }
  /** Merge answers from the page into the stored ones. Questions the student already moved past are locked. */
  mergeAnswers(S, t, a, answers, pos, n) {
    const plan = J(a.plan, {}), content = S.ctx.normContent_(J(t.content, {}));
    const stored = J(a.answers, {}), order = Array.isArray(plan.flat) ? plan.flat : [];
    const late = a.deadline && n > a.deadline + S.x.GRACE_MS;
    if (late) return { answers: stored, maxPos: a.max_pos };   // after the time limit nothing changes any more
    const incoming = toCanonical(plain(S.ctx.sanitizeAns_(answers)), plan, content);
    const locked = {}; order.slice(0, a.max_pos).forEach(q => { locked[q] = 1; });
    Object.keys(incoming).forEach(k => { if (!locked[k]) stored[k] = incoming[k]; });
    const p = Math.max(0, Math.min(order.length, Math.floor(Number(pos) || 0)));
    return { answers: stored, maxPos: Math.max(a.max_pos, p) };
  }
  cleanActivity(S, activity) {
    const act = plain(S.ctx.cleanAct_(activity));
    act.extra = cleanExtra(activity && activity.extra);
    return act;
  }

  /** A Wi-Fi-only test answered from outside the school network is not refused (the work is not lost) but shown to the teacher. */
  noteOutside(t, a, net) {
    if (net && !net.local && this.extrasOf(t).network === 'lan') this.db.prepare('UPDATE attempts SET outside = outside + 1 WHERE id = ?').run(a.id);
  }

  saveProgress(id, answers, activity, pos, net) {
    return tx(this.db, () => {
      const a = this.attemptRow(id), n = now();
      if (a.submitted) return { submitted: true, serverNow: n };
      const t = this.testByCode(a.test_id), S = this.subjects[t.subject];
      this.noteOutside(t, a, net);
      const m = this.mergeAnswers(S, t, a, answers, pos, n);
      this.db.prepare('UPDATE attempts SET answers = ?, max_pos = ? WHERE id = ?').run(JSON.stringify(m.answers), m.maxPos, a.id);
      if (activity) this.db.prepare('UPDATE attempts SET activity = ? WHERE id = ?').run(JSON.stringify(this.cleanActivity(S, activity)), a.id);
      return { ok: true, serverNow: n, deadline: a.deadline };
    });
  }

  submitAttempt(id, answers, activity, pos, net) {
    const out = tx(this.db, () => {
      const a = this.attemptRow(id), n = now();
      if (a.submitted) return { already: true };
      const t = this.testByCode(a.test_id), S = this.subjects[t.subject], c = S.ctx;
      this.noteOutside(t, a, net);
      const m = this.mergeAnswers(S, t, a, answers, pos, n);
      const act = this.cleanActivity(S, activity);
      act.lateMs = a.deadline && n > a.deadline ? n - a.deadline : 0;
      const late = act.lateMs > S.x.GRACE_MS;
      const g = c.gradeAll_(c.normContent_(J(t.content, {})), m.answers, {});
      this.db.prepare('UPDATE attempts SET submitted = ?, status = ?, score = ?, max = ?, answers = ?, activity = ?, max_pos = ? WHERE id = ?')
        .run(n, late ? 'Late' : 'Submitted', g.score, g.max, JSON.stringify(m.answers), JSON.stringify(act), m.maxPos, a.id);
      const s = c.normSettings_(J(t.settings, {}));
      return { score: g.score, max: g.max, showScore: s.showScore };
    });
    const res = { ok: true };
    if (out.showScore && !out.already) res.score = { score: out.score, max: out.max };
    return res;
  }

  /** English tests: the Ukrainian translation of one question (saved one, or Gemini once, then saved into the test). */
  /** The stored Ukrainian translation of one question (made by the teacher's side when the test was saved; no AI call here). */
  translateQuestion(attemptId, qid) {
    if (!/^[A-Za-z0-9]{3,16}$/.test(String(qid))) throw USER('bad_q', 'Bad question.');
    const a = this.attemptRow(attemptId);
    if (a.submitted) throw USER('tr_off', 'Translation is not available.');
    const t = this.testByCode(a.test_id), S = this.subjects[t.subject], c = S.ctx;
    const content = plain(c.normContent_(J(t.content, {})));
    if (S.info.mode !== 'translate' || !content.allowTranslate) throw USER('tr_off', 'Translation is not available.');
    let found = null;
    content.sections.forEach(s => s.questions.forEach(q => { if (q.id === qid) found = { s: s, q: q }; }));
    if (!found) throw USER('bad_q', 'Bad question.');
    if (!found.q.q.uk && found.q.q.en) throw USER('tr_off', 'There is no translation for this question.');
    return { q: found.q.q.uk || '', instructions: found.s.instructions.uk || '', note: found.q.note.uk || '' };
  }
}

// ---------- per-attempt shuffle (done here, so the page never decides the order) ----------
/** plan: q = question order per section, o = shown→original option index (mc), r = shown→canonical right item (match), flat = question ids in shown order. */
function makePlan(pub, s) {
  const plan = { q: [], o: {}, r: {}, flat: [] };
  pub.sections.forEach(sec => {
    const idx = range(sec.questions.length); if (s.shuffleQ) shuffle(idx);
    plan.q.push(idx);
    sec.questions.forEach(q => {
      if (q.type === 'mc') { const p = range(q.options.length); if (s.shuffleO) shuffle(p); plan.o[q.id] = p; }
      if (q.type === 'match') plan.r[q.id] = shuffle(range(q.right.length));   // every student gets their own order
    });
    idx.forEach(i => plan.flat.push(sec.questions[i].id));
  });
  return plan;
}
const fits = (p, n) => Array.isArray(p) && p.length === n;
function applyPlan(pub, plan) {
  pub.sections.forEach((sec, si) => {
    const order = plan.q && plan.q[si];
    if (fits(order, sec.questions.length)) sec.questions = order.map(i => sec.questions[i]);
    sec.questions.forEach(q => {
      const o = plan.o && plan.o[q.id], r = plan.r && plan.r[q.id];
      if (q.type === 'mc' && fits(o, q.options.length)) q.options = o.map(i => q.options[i]);
      if (q.type === 'match' && fits(r, q.right.length)) q.right = r.map(j => q.right[j]);
    });
  });
  pub.shuffleQ = false; pub.shuffleO = false;   // already shuffled: the page shows it as it is
  return pub;
}
function qIndex(content) { const m = {}; content.sections.forEach(s => s.questions.forEach(q => { m[q.id] = q; })); return m; }
/** Page answers (shown positions) → stored answers (original positions), dropping anything that is not a question of this test. */
function toCanonical(ans, plan, content) {
  const Q = qIndex(content), out = {};
  Object.keys(ans).forEach(k => {
    const q = Q[k], v = ans[k]; if (!q) return;
    if (q.type === 'mc') {
      const o = plan.o && plan.o[k], n = q.options.length;
      if (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < n) out[k] = fits(o, n) ? o[v] : v;
    } else if (q.type === 'match') {
      const r = plan.r && plan.r[k], n = q.pairs.length;
      out[k] = String(v).split(',').slice(0, n).map(x => { x = x.trim(); if (!/^\d{1,2}$/.test(x) || Number(x) >= n) return ''; return fits(r, n) ? r[Number(x)] : Number(x); }).join(',');
    } else if (typeof v === 'string') out[k] = v;
  });
  return out;
}
function toShown(ans, plan, content) {
  const Q = qIndex(content), out = {};
  Object.keys(ans).forEach(k => {
    const q = Q[k], v = ans[k]; if (!q) return;
    if (q.type === 'mc') { const o = plan.o && plan.o[k]; out[k] = fits(o, q.options.length) ? o.indexOf(v) : v; if (out[k] < 0) delete out[k]; }
    else if (q.type === 'match') { const r = plan.r && plan.r[k]; out[k] = String(v).split(',').map(x => x === '' ? '' : fits(r, q.pairs.length) ? r.indexOf(Number(x)) : Number(x)).map(x => x === -1 ? '' : x).join(','); }
    else out[k] = v;
  });
  return out;
}

// ---------- device fingerprint ----------
// 'fonts' and 'audio' removed on purpose (data minimisation): font enumeration / audio fingerprinting are the most
// invasive signals and add little over canvas + webgl + screen. The device link relies on the cookie, IP and the rest.
const FP_KEYS = ['ua', 'platform', 'lang', 'langs', 'tz', 'tzo', 'screen', 'avail', 'depth', 'dpr', 'cores', 'mem', 'touch', 'canvas', 'webgl', 'webglv', 'cookies'];
function cleanFp(fp) {
  const o = {};
  if (fp && typeof fp === 'object') FP_KEYS.forEach(k => { if (fp[k] != null) o[k] = String(fp[k]).slice(0, 300); });
  return o;
}
function fpHashOf(fp) {
  const keys = FP_KEYS.filter(k => fp[k]);
  if (keys.length < 4) return '';   // nothing useful came (blocked script): no fingerprint rather than a shared empty one
  return sha('fp|' + keys.map(k => k + '=' + fp[k]).join('|'));
}
function uaInfo(ua) {
  ua = String(ua || '');
  const b = /Edg\/(\d+)/.exec(ua) ? 'Edge ' + /Edg\/(\d+)/.exec(ua)[1] : /OPR\/(\d+)/.exec(ua) ? 'Opera ' + /OPR\/(\d+)/.exec(ua)[1]
    : /Firefox\/(\d+)/.exec(ua) ? 'Firefox ' + /Firefox\/(\d+)/.exec(ua)[1] : /Chrome\/(\d+)/.exec(ua) ? 'Chrome ' + /Chrome\/(\d+)/.exec(ua)[1]
    : /Version\/(\d+).*Safari/.exec(ua) ? 'Safari ' + /Version\/(\d+)/.exec(ua)[1] : 'Browser';
  const os = /Android ([\d.]+)/.exec(ua) ? 'Android ' + /Android ([\d.]+)/.exec(ua)[1] : /iPhone|iPad/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows'
    : /CrOS/.test(ua) ? 'ChromeOS' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '?';
  return { browser: b, os: os };
}
function deviceInfo(r) {
  const fp = J(r.fp, {}), u = uaInfo(r.ua || fp.ua);
  return { label: r.fp_hash ? 'D-' + r.fp_hash.slice(0, 5).toUpperCase() : '—', browser: u.browser, os: u.os,
    screen: fp.screen || '', tz: fp.tz || '', ip: r.ip || '', cookie: r.dev_id ? 'B-' + r.dev_id.slice(0, 5).toUpperCase() : '—', via: r.via || '' };
}
function who(list) { return list.map(o => o.name + (o.grp ? ' (' + o.grp + ')' : '')).join(', '); }
/** Other attempts at this test that came from the same browser / device / network. A signal for the teacher, not proof. */
function deviceFlags(r, rows) {
  const others = rows.filter(o => o.id !== r.id), seen = {}, f = [];
  const take = list => list.filter(o => !seen[o.id] && (seen[o.id] = 1));
  const sameDev = take(others.filter(o => r.dev_id && o.dev_id === r.dev_id));
  if (sameDev.length) f.push({ level: 'high', uk: 'Той самий браузер (cookie), що й у: ' + who(sameDev), en: 'Same browser (cookie) as: ' + who(sameDev) });
  const sameFpIp = take(others.filter(o => r.fp_hash && o.fp_hash === r.fp_hash && !isLoopback(r.ip) && o.ip === r.ip));
  if (sameFpIp.length) f.push({ level: 'high', uk: 'Той самий пристрій (відбиток + IP), що й у: ' + who(sameFpIp), en: 'Same device (fingerprint + IP) as: ' + who(sameFpIp) });
  const sameFp = take(others.filter(o => r.fp_hash && o.fp_hash === r.fp_hash));
  if (sameFp.length) f.push({ level: 'warn', uk: 'Такий самий відбиток пристрою, як у: ' + who(sameFp) + ' (однакові комп’ютери в класі теж можуть збігатися)',
    en: 'Same device fingerprint as: ' + who(sameFp) + ' (identical lab computers can match too)' });
  const sameIp = take(others.filter(o => !isLoopback(r.ip) && o.ip === r.ip));
  if (sameIp.length) f.push({ level: 'warn', uk: 'Та сама IP-адреса (' + r.ip + '), що й у: ' + who(sameIp), en: 'Same IP address (' + r.ip + ') as: ' + who(sameIp) });
  f.forEach(x => { x.text = x.en; });
  return f;
}

function cleanExtras(raw) {
  raw = raw || {};
  const on = (v) => v === undefined ? true : !!v;   // the security toggles default to on when a test predates them
  return { fullscreen: !!raw.fullscreen, deviceLock: !!raw.deviceLock, guests: !!raw.guests, network: 'any',   // the «classroom Wi-Fi only» mode was removed: everybody has an account now; old tests count as «from anywhere»
    deviceTrack: on(raw.deviceTrack), blockKeys: on(raw.blockKeys), detectDevtools: on(raw.detectDevtools),
    watermark: on(raw.watermark), multiTab: on(raw.multiTab), aiTrap: !!raw.aiTrap,
    // after the test is closed, students see where they went wrong (the teacher can also allow / forbid it per student)
    review: !!raw.review, explain: cleanExplain(raw.explain),
    // who may take the test: 'classes' (only the chosen classes) or 'all' (any student of the school); '' = older test, decided by its class
    access: raw.access === 'all' || raw.access === 'classes' ? raw.access : '',
    classes: (Array.isArray(raw.classes) ? raw.classes : []).map(c => String(c == null ? '' : c).replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60)).filter(Boolean).slice(0, 50) };
}
/** Explanations of the right answers, per question id: { qid: { uk, en } }. */
function cleanExplain(x) {
  const out = {}, s = v => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000b-\u001f<>]/g, '').trim().slice(0, 600);
  if (x && typeof x === 'object') Object.keys(x).slice(0, 400).forEach(k => { if (/^[A-Za-z0-9]{3,16}$/.test(k) && x[k]) { const v = { uk: s(x[k].uk), en: s(x[k].en) }; if (v.uk || v.en) out[k] = v; } });
  return out;
}
function netFlags(r, ex) {
  const f = [];
  if (ex.network === 'lan' && r.via === 'internet') f.push({ level: 'high', uk: 'Почав тест не з мережі класу', en: 'Started outside the classroom network' });
  if (r.outside) f.push({ level: 'high', uk: 'Надсилав відповіді не з мережі класу: ' + r.outside + '×', en: 'Sent answers from outside the classroom network: ' + r.outside + '×' });
  f.forEach(x => { x.text = x.en; });
  return f;
}

function autoFlags(act) {
  if (!act || !act.auto) return [];
  return [{ level: 'warn', uk: 'Не натиснув «Надіслати»: час вийшов, зараховано відповіді, збережені до кінця часу', en: 'Did not press Submit: the time ran out, the answers saved until then were graded',
    text: 'Did not press Submit: the time ran out, the answers saved until then were graded' }];
}

// ---------- extra activity the page reports (full screen, blocked shortcuts) ----------
const EXTRA_KEYS = ['fsExit', 'ctxMenu', 'keys', 'devtools', 'drop', 'multiTab'];
function cleanExtra(x) {
  x = x && typeof x === 'object' ? x : {}; const o = {};
  EXTRA_KEYS.forEach(k => { o[k] = Math.max(0, Math.min(1e6, Math.round(Number(x[k]) || 0))); });
  return o;
}
function extraFlags(x) {
  x = cleanExtra(x); const f = [];
  if (x.fsExit) f.push({ level: x.fsExit >= 2 ? 'high' : 'warn', uk: 'Виходив із повноекранного режиму ' + x.fsExit + '×', en: 'Left full screen ' + x.fsExit + '×' });
  if (x.devtools) f.push({ level: 'high', uk: 'Схоже, відкривав інструменти розробника (код елемента): ' + x.devtools + '×', en: 'Looks like developer tools were opened: ' + x.devtools + '×' });
  if (x.keys) f.push({ level: 'warn', uk: 'Натискав заборонені клавіші (F12, Ctrl+U, друк тощо): ' + x.keys + '× (заблоковано)', en: 'Pressed blocked keys (F12, Ctrl+U, print…): ' + x.keys + '× (blocked)' });
  if (x.ctxMenu) f.push({ level: 'warn', uk: 'Намагався відкрити контекстне меню: ' + x.ctxMenu + '× (заблоковано)', en: 'Tried to open the context menu: ' + x.ctxMenu + '× (blocked)' });
  if (x.multiTab) f.push({ level: 'high', uk: 'Тест було відкрито ще в одній вкладці/вікні', en: 'The test was open in another tab/window too' });
  if (x.drop) f.push({ level: 'warn', uk: 'Намагався перетягнути текст у відповідь: ' + x.drop + '× (заблоковано)', en: 'Tried to drag text into an answer: ' + x.drop + '× (blocked)' });
  f.forEach(y => { y.text = y.en; });
  return f;
}

module.exports = { Api, makePlan, applyPlan, toCanonical, toShown, cleanFp, fpHashOf, deviceFlags };
