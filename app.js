/* js/util.js */
// Общие утилиты
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const sample = (a, n) => shuffle(a).slice(0, n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uniq = a => Array.from(new Set(a));
const DAY = 86400000;

function dayKey(d = new Date()) {
  const z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }

// Нормализация ответа: регистр, пробелы, конечная пунктуация, типографские кавычки
function norm(s) {
  return String(s || '').toLowerCase().replace(/[’`´]/g, "'").replace(/[„“”«»"]/g, '')
    .replace(/\s+/g, ' ').replace(/[.!?,;:]+$/g, '').trim();
}
// Замены для тех, у кого нет немецкой раскладки
function deUmlaut(s) { return s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss'); }
function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
// Проверка ввода: 'ok' | 'typo' | 'umlaut' | 'bad'
function checkAnswer(input, answers) {
  const x = norm(input);
  if (!x) return 'bad';
  const list = answers.map(norm);
  if (list.includes(x)) return 'ok';
  if (list.some(a => deUmlaut(a) === deUmlaut(x))) return 'umlaut';
  if (list.some(a => a.length > 4 && lev(a, x) === 1)) return 'typo';
  return 'bad';
}

const ART = { der: 'der', die: 'die', das: 'das' };
function splitArticle(de) {
  const m = /^(der|die|das) (.+)$/.exec(de);
  return m ? { art: m[1], lemma: m[2] } : { art: '', lemma: de };
}
function artClass(de) { const a = splitArticle(de).art; return a ? 'a-' + a : ''; }
// Слово с цветным артиклем
function deHTML(w) {
  if (w.t === 'n') {
    const { art, lemma } = splitArticle(w.de);
    if (art) return `<span class="art a-${art}">${art}</span> ${esc(lemma)}`;
  }
  return esc(w.de);
}
function plural(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const LEVEL_NAMES = { A1: 'Начальный', A2: 'Элементарный', B1: 'Средний', B2: 'Выше среднего', C1: 'Продвинутый' };

/* js/store.js */
// Прогресс пользователя: localStorage, всё в try/catch
const STORE_KEY = 'deutsch.v1';
const DEFAULT_STATE = () => ({
  v: 1,
  created: Date.now(),
  name: '',
  level: 'A1',
  xp: 0,
  days: {},          // 'YYYY-MM-DD' -> {xp, ans, ok, min}
  srs: {},           // key -> {b, due, ok, bad, last}
  mistakes: {},      // key -> {n, last}
  grammar: {},       // lessonId -> {best, done}
  tests: {},         // 'A1' -> {best, passed, date}
  placement: null,   // {level, date, score}
  reading: {},       // id -> {best}
  dialogues: {},     // id -> {best}
  fav: {},           // key -> 1
  ach: {},           // achievementId -> date
  best: {},          // рекорды: speed, match
  stats: { answers: 0, correct: 0, sessions: 0, perfect: 0 },
  lastTopic: null,
  settings: { goal: 50, rate: 0.9, voice: '', autoplay: true, sound: true, theme: 'system', showRu: true, newPerDay: 10 }
});

const Store = {
  state: null,
  load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { s = null; }
    const d = DEFAULT_STATE();
    if (!s || typeof s !== 'object') s = d;
    for (const k of Object.keys(d)) if (s[k] === undefined) s[k] = d[k];
    s.settings = Object.assign(d.settings, s.settings || {});
    s.stats = Object.assign(d.stats, s.stats || {});
    this.state = s;
    return s;
  },
  save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this.state)); } catch (e) { /* хранилище недоступно */ }
  },
  reset() { this.state = DEFAULT_STATE(); this.save(); },
  export() { return JSON.stringify(this.state); },
  import(json) {
    const s = JSON.parse(json);
    if (!s || typeof s !== 'object' || !s.srs) throw new Error('Это не похоже на файл прогресса');
    localStorage.setItem(STORE_KEY, JSON.stringify(s));
    this.load();
  },
  today() {
    const k = dayKey();
    if (!this.state.days[k]) this.state.days[k] = { xp: 0, ans: 0, ok: 0 };
    return this.state.days[k];
  },
  addXP(n) {
    if (n <= 0) return;
    this.state.xp += n;
    this.today().xp += n;
    this.save();
  },
  streak() {
    const days = this.state.days;
    let d = new Date(), n = 0;
    if (!(days[dayKey(d)] && days[dayKey(d)].xp > 0)) d = new Date(Date.now() - DAY);
    while (days[dayKey(d)] && days[dayKey(d)].xp > 0) { n++; d = new Date(d.getTime() - DAY); }
    return n;
  },
  bestStreak() {
    const keys = Object.keys(this.state.days).filter(k => this.state.days[k].xp > 0).sort();
    let best = 0, cur = 0, prev = null;
    for (const k of keys) {
      const t = new Date(k + 'T12:00:00').getTime();
      cur = prev && Math.round((t - prev) / DAY) === 1 ? cur + 1 : 1;
      best = Math.max(best, cur); prev = t;
    }
    return best;
  },

  // ---- Интервальное повторение (система Лейтнера) ----
  // коробки 0..6, интервалы в днях
  INTERVALS: [0, 0.5, 1, 3, 7, 16, 40],
  srsGet(key) { return this.state.srs[key]; },
  // grade: 0 — не знаю, 1 — трудно, 2 — знаю, 3 — легко
  srsGrade(key, grade) {
    const now = Date.now();
    const r = this.state.srs[key] || { b: 0, due: now, ok: 0, bad: 0, last: 0 };
    if (grade === 0) { r.b = Math.max(1, r.b - 2); r.bad++; r.due = now + 5 * 60000; }
    else {
      const isDue = r.due <= now || r.b === 0;
      if (grade === 1) r.b = Math.max(1, r.b);
      else if (isDue) r.b = Math.min(6, r.b + (grade === 3 ? 2 : 1));
      else if (r.b < 2) r.b++;
      r.ok++;
      const iv = this.INTERVALS[r.b] * (grade === 1 ? 0.5 : 1);
      r.due = now + iv * DAY;
    }
    r.last = now;
    this.state.srs[key] = r;
  },
  // результат ответа в упражнении (не карточке)
  srsAnswer(key, correct) { this.srsGrade(key, correct ? 2 : 0); },
  mastery(key) {  // 0 новое, 1 учу, 2-4 знаю, 5-6 выучено
    const r = this.state.srs[key];
    return r ? r.b : 0;
  },
  isKnown(key) { return this.mastery(key) >= 2; },
  isDue(key) { const r = this.state.srs[key]; return !!r && r.due <= Date.now(); },

  // ---- Ошибки ----
  mistake(key) {
    const m = this.state.mistakes[key] || { n: 0, last: 0 };
    m.n++; m.last = Date.now();
    this.state.mistakes[key] = m;
  },
  fixMistake(key) {
    const m = this.state.mistakes[key];
    if (!m) return;
    m.n--;
    if (m.n <= 0) delete this.state.mistakes[key];
  },

  // ---- Учёт ответов ----
  answer(correct) {
    const t = this.today();
    t.ans++; if (correct) t.ok++;
    this.state.stats.answers++; if (correct) this.state.stats.correct++;
  }
};

/* js/speech.js */
// Озвучка (Web Speech API) и звуки интерфейса
const Speech = {
  voices: [],
  ok: typeof window !== 'undefined' && 'speechSynthesis' in window,
  init() {
    if (!this.ok) return;
    const load = () => {
      this.voices = speechSynthesis.getVoices().filter(v => /^de(-|_|$)/i.test(v.lang));
    };
    load();
    speechSynthesis.onvoiceschanged = load;
  },
  // лучший голос: выбранный пользователем, затем «улучшенные», затем de-DE
  voice() {
    const s = Store.state.settings;
    if (s.voice) { const v = this.voices.find(v => v.voiceURI === s.voice); if (v) return v; }
    const score = v => (/premium|enhanced|neural|natural/i.test(v.name) ? 4 : 0) + (/de-DE/i.test(v.lang) ? 2 : 0) +
      (/anna|helena|petra|markus|yannick|google/i.test(v.name) ? 1 : 0);
    return this.voices.slice().sort((a, b) => score(b) - score(a))[0] || null;
  },
  // queue=true — не прерывать текущую речь
  say(text, opts = {}) {
    if (!this.ok || !text) return Promise.resolve();
    return new Promise(res => {
      if (!opts.queue) speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/\s*\(.*?\)\s*/g, ' ').replace(/\+ ?(Akk|Dat|Gen)\.?/g, ''));
      u.lang = 'de-DE';
      const v = this.voice(); if (v) u.voice = v;
      u.rate = (opts.rate || Store.state.settings.rate || 0.9) * (opts.slow ? 0.7 : 1);
      u.pitch = opts.pitch || 1;
      u.onend = u.onerror = () => res();
      speechSynthesis.speak(u);
      // iOS иногда «засыпает» — страховка
      setTimeout(res, 2000 + String(text).length * 120);
    });
  },
  stop() { if (this.ok) speechSynthesis.cancel(); }
};

const Sound = {
  ctx: null,
  tone(freqs, dur = 0.09, type = 'sine', vol = 0.06) {
    if (!Store.state.settings.sound) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const c = this.ctx; let t = c.currentTime;
      freqs.forEach(f => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 1.6);
        o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur * 1.7);
        t += dur;
      });
    } catch (e) { /* звук недоступен */ }
  },
  ok() { this.tone([660, 990]); },
  bad() { this.tone([220, 180], 0.12, 'triangle', 0.07); },
  done() { this.tone([523, 659, 784, 1047], 0.1); },
  tap() { this.tone([440], 0.03, 'sine', 0.03); }
};

/* js/icons.js */
// Набор линейных иконок (stroke = currentColor)
const _i = (d, extra = '') => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
const ICON = {
  home: _i('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-6h4v6"/>'),
  words: _i('<rect x="3" y="4" width="13" height="16" rx="2"/><path d="M8 4v16"/><path d="M19 7v13"/><path d="M11 9h2"/>'),
  grammar: _i('<path d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2Z"/><path d="M4 17a2 2 0 0 1 2-2h12"/><path d="M9 7h5M9 10.5h3"/>'),
  tests: _i('<path d="M9 4h6v3H9z"/><path d="M15 5h3v16H6V5h3"/><path d="m9 13 2 2 4-4"/>'),
  more: _i('<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>'),
  back: _i('<path d="m15 18-6-6 6-6"/>'),
  close: _i('<path d="M18 6 6 18M6 6l12 12"/>'),
  sound: _i('<path d="M4 9.5v5h4l5 4v-13l-5 4H4Z"/><path d="M16.5 9a4 4 0 0 1 0 6"/><path d="M19 6.5a7.5 7.5 0 0 1 0 11"/>'),
  slow: _i('<path d="M4 9.5v5h4l5 4v-13l-5 4H4Z"/><path d="M17 12h4"/>'),
  star: _i('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>'),
  flame: _i('<path d="M12 21c4 0 7-2.8 7-6.8 0-3.4-2.2-5.4-3.7-7.7-.4 1.8-1.3 3-2.6 3.6.3-3.1-.9-5.9-3.9-7.6.2 3-1.3 5-2.8 6.9C4.8 11 4.5 12.4 4.5 14c0 4.2 3.4 7 7.5 7Z"/>'),
  bolt: _i('<path d="M13 2 4 14h7l-1 8 9-12h-7Z"/>'),
  cards: _i('<rect x="6" y="3" width="12" height="16" rx="2" transform="rotate(8 12 11)"/><rect x="4" y="5" width="12" height="16" rx="2"/>'),
  ear: _i('<path d="M6 9a6 6 0 1 1 12 0c0 3-2 4-3 5.5S13.5 18 13 19.5a2.5 2.5 0 0 1-4.6.5"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2-1.5 3.5"/>'),
  pen: _i('<path d="m4 20 1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19Z"/><path d="m14 7 3 3"/>'),
  puzzle: _i('<path d="M9 3h3v2.5a1.5 1.5 0 0 0 3 0V3h4v5h-2.5a1.5 1.5 0 0 0 0 3H19v5h-4v-2.5a1.5 1.5 0 0 0-3 0V16H9v-4H6.5a1.5 1.5 0 0 1 0-3H9Z"/>'),
  pairs: _i('<rect x="3" y="4" width="7" height="7" rx="1.5"/><rect x="14" y="13" width="7" height="7" rx="1.5"/><path d="M10 7.5h4a3 3 0 0 1 3 3V13"/>'),
  timer: _i('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2h5"/>'),
  target: _i('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>'),
  gap: _i('<path d="M3 12h4M17 12h4"/><rect x="9" y="8" width="6" height="8" rx="1.5" stroke-dasharray="2 2"/>'),
  layers: _i('<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 13 9 5 9-5"/>'),
  book: _i('<path d="M3 5.5C5.5 4 9 4 12 6c3-2 6.5-2 9-.5V19c-2.5-1.5-6-1.5-9 .5-3-2-6.5-2-9-.5Z"/><path d="M12 6v13.5"/>'),
  chat: _i('<path d="M4 5h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="M19 9h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v3l-3.5-3H12"/>'),
  globe: _i('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/>'),
  verb: _i('<path d="M4 6h16M4 12h10M4 18h7"/><path d="m16 15 3 3 3-3"/>'),
  search: _i('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  chart: _i('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  trophy: _i('<path d="M8 4h8v5a4 4 0 0 1-8 0Z"/><path d="M8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4"/><path d="M12 13v4M8 21h8M9.5 17h5v4h-5z"/>'),
  gear: _i('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>'),
  redo: _i('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
  check: _i('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  x: _i('<path d="M18 6 6 18M6 6l12 12"/>'),
  play: _i('<path d="M7 4.5v15l12-7.5Z" fill="currentColor"/>'),
  stop: _i('<rect x="6" y="6" width="12" height="12" rx="1.5"/>'),
  eye: _i('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'),
  sparkle: _i('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
  copy: _i('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'),
  phrase: _i('<path d="M7 7h10M7 11h6"/><path d="M5 3h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6l-5 4v-4H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/>'),
  shuffle: _i('<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>'),
  heart: _i('<path d="M12 20s-7.5-4.6-9-9.5C2 6.9 4.4 4 7.5 4c2 0 3.4 1 4.5 2.6C13.1 5 14.5 4 16.5 4 19.6 4 22 6.9 21 10.5c-1.5 4.9-9 9.5-9 9.5Z"/>')
};

/* js/content.js */
// Индексы над учебными данными DE.*
const C = {
  words: [], byKey: {}, topics: [], topicById: {}, lex: {},
  tests: [], testByKey: {}, gex: {}, verbs: [], verbByInf: {},
  init() {
    const lvlOrder = l => LEVELS.indexOf(l);
    this.topics = DE.topics.slice().sort((a, b) => lvlOrder(a.level) - lvlOrder(b.level));
    for (const t of this.topics) {
      this.topicById[t.id] = t;
      t.words.forEach(w => {
        w.key = `w|${t.id}|${w.de}`;
        w.topic = t.id;
        this.words.push(w);
        this.byKey[w.key] = w;
        const { lemma } = splitArticle(w.de);
        const lk = lemma.toLowerCase().replace(/^sich /, '').replace(/ \+.*$/, '');
        if (!this.lex[lk]) this.lex[lk] = w;
      });
    }
    // Разговорник как «слова» для тренировки
    for (const p of DE.phrases) {
      p.words = p.items.map((it, i) => {
        const w = { de: it.de, ru: it.ru, t: 'phr', lvl: p.lvl, ex: it.de, exRu: it.ru, key: `p|${p.id}|${i}`, topic: 'ph:' + p.id };
        this.byKey[w.key] = w;
        return w;
      });
    }
    DE.tests.forEach(q => { q.key = 't|' + hash(q.q + '|' + q.options.join('|')); this.testByKey[q.key] = q; });
    this.tests = DE.tests;
    DE.grammar.forEach(g => g.exercises.forEach((x, i) => { x.key = `g|${g.id}|${i}`; x.lesson = g.id; this.gex[x.key] = x; }));
    this.grammar = DE.grammar.slice().sort((a, b) => lvlOrder(a.level) - lvlOrder(b.level));
    this.verbs = DE.verbs.slice().sort((a, b) => lvlOrder(a.lvl) - lvlOrder(b.lvl) || a.inf.localeCompare(b.inf, 'de'));
    this.verbs.forEach(v => {
      v.key = 'v|' + v.inf; this.verbByInf[v.inf] = v;
      const lk = v.inf.replace(/^sich /, '').toLowerCase();
      if (!this.lex[lk]) this.lex[lk] = { de: v.inf, ru: v.ru, t: 'v' };
      v.praes.concat(v.praet).forEach(f => { const k = f.split(' ')[0].toLowerCase(); if (!this.lex[k]) this.lex[k] = { de: v.inf, ru: v.ru, t: 'v', form: f }; });
    });
    for (const r of DE.reading) (r.glossary || []).forEach(g => { const k = g.de.toLowerCase(); if (!this.lex[k]) this.lex[k] = { de: g.de, ru: g.ru }; });
  },
  topicWords(id) {
    if (id === 'fav') return Object.keys(Store.state.fav).map(k => this.byKey[k]).filter(Boolean);
    if (id && id.startsWith('ph:')) { const p = DE.phrases.find(p => 'ph:' + p.id === id); return p ? p.words : []; }
    const t = this.topicById[id]; return t ? t.words : [];
  },
  topicProgress(id) {
    const ws = this.topicWords(id);
    let known = 0, started = 0;
    ws.forEach(w => { const m = Store.mastery(w.key); if (m >= 2) known++; if (m > 0) started++; });
    return { total: ws.length, known, started, pct: ws.length ? known / ws.length : 0 };
  },
  // Поиск перевода слова из текста
  lookup(token) {
    const t = token.toLowerCase().replace(/[^a-zäöüß-]/gi, '');
    if (!t) return null;
    if (this.lex[t]) return this.lex[t];
    const tries = [t.replace(/(en|n|e|s|er|es|em)$/, ''), t.replace(/e$/, ''), t + 'en', t + 'n'];
    for (const x of tries) if (this.lex[x]) return this.lex[x];
    return null;
  },
  wordOfDay() {
    const lvl = Store.state.level;
    const pool = this.words.filter(w => w.lvl === lvl && w.t !== 'phr');
    const list = pool.length ? pool : this.words;
    if (!list.length) return null;
    const n = parseInt(hash(dayKey()), 36);
    return list[n % list.length];
  },
  counts() {
    return { words: this.words.length, topics: this.topics.length, grammar: DE.grammar.length, tests: DE.tests.length,
      verbs: DE.verbs.length, reading: DE.reading.length, dialogues: DE.dialogues.length, phrases: DE.phrases.length };
  }
};

/* js/modes.js */
// Построители вопросов для движка упражнений
const PERSONS = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];
const Q = {
  // варианты-отвлекатели: тот же тип, другое значение
  distract(w, pool, field, n = 3) {
    const val = x => field === 'de' ? x.de : x.ru;
    const mine = norm(val(w));
    const seen = new Set([mine]);
    const out = [];
    const same = shuffle(pool.filter(x => x.t === w.t && x !== w));
    const rest = shuffle(C.words.filter(x => x.t === w.t && x !== w).slice(0, 4000));
    const any = shuffle(C.words.slice(0, 4000));
    for (const x of same.concat(rest, any)) {
      const v = norm(val(x));
      if (seen.has(v)) continue;
      seen.add(v); out.push(x);
      if (out.length >= n) break;
    }
    return out;
  },
  choiceFrom(correct, wrongs, extra = {}) {
    const opts = shuffle([correct].concat(wrongs));
    return Object.assign({ kind: 'choice', options: opts.map(o => o.opt), a: opts.indexOf(correct) }, extra);
  },
  deRu(w, pool) {
    const ws = this.distract(w, pool, 'ru');
    return this.choiceFrom({ opt: { html: esc(w.ru) } }, ws.map(x => ({ opt: { html: esc(x.ru) } })), {
      label: 'Выберите перевод', prompt: `<div class="q-word">${deHTML(w)}</div>`, say: w.de, autoplay: true,
      explain: this.wordExplain(w), key: w.key, srs: true, w
    });
  },
  ruDe(w, pool) {
    const ws = this.distract(w, pool, 'de');
    return this.choiceFrom({ opt: { html: deHTML(w), say: w.de } }, ws.map(x => ({ opt: { html: deHTML(x), say: x.de } })), {
      label: 'Как это по-немецки?', prompt: `<div class="q-word ru">${esc(w.ru)}</div>`,
      explain: this.wordExplain(w), key: w.key, srs: true, w, sayAfter: w.de
    });
  },
  listen(w, pool) {
    const ws = this.distract(w, pool, 'ru');
    return this.choiceFrom({ opt: { html: esc(w.ru) } }, ws.map(x => ({ opt: { html: esc(x.ru) } })), {
      label: 'Послушайте и выберите перевод', prompt: `<button class="big-audio" data-say>${ICON.sound}</button>`,
      say: w.de, autoplay: true, explain: this.wordExplain(w), key: w.key, srs: true, w, listen: true
    });
  },
  type(w) {
    const answers = [w.de];
    if (w.t === 'v') answers.push(w.de.replace(/ \+ .*$/, ''));
    if (w.t === 'phr') answers.push(w.de.replace(/[.!?]$/, ''));
    return {
      kind: 'input', label: w.t === 'n' ? 'Напишите по-немецки с артиклем' : 'Напишите по-немецки',
      prompt: `<div class="q-word ru">${esc(w.ru)}</div>`, answers, reveal: deHTML(w), say: w.de,
      explain: this.wordExplain(w), key: w.key, srs: true, w, nounCheck: w.t === 'n'
    };
  },
  article(w) {
    const { art, lemma } = splitArticle(w.de);
    const arts = ['der', 'die', 'das'];
    return {
      kind: 'choice', style: 'articles', label: 'Какой артикль?',
      prompt: `<div class="q-word">${esc(lemma)}</div><div class="q-sub">${esc(w.ru)}</div>`,
      options: arts.map(a => ({ html: a, cls: 'a-' + a })), a: arts.indexOf(art), sayAfter: w.de,
      explain: this.wordExplain(w) + (RULES.gender(lemma, art) || ''), key: w.key, srs: true, w
    };
  },
  pluralForms(w) {
    const { lemma } = splitArticle(w.de);
    const correct = w.pl.replace(/^die /, '');
    const uml = s => s.replace(/(au|a|o|u)(?=[^aouäöü]*$)/i, m => ({ a: 'ä', o: 'ö', u: 'ü', au: 'äu', A: 'Ä', O: 'Ö', U: 'Ü', Au: 'Äu' }[m] || m));
    const base = lemma.replace(/e$/, '');
    const cands = [lemma + 'e', lemma + 'en', lemma + 'n', lemma + 'er', lemma + 's', uml(lemma) + 'e', uml(lemma) + 'er', lemma, uml(lemma), base + 'en', lemma + 'nen'];
    const wrong = shuffle(uniq(cands).filter(c => c !== correct && c !== lemma + 'nn')).slice(0, 3);
    if (wrong.length < 3) return null;
    return this.choiceFrom({ opt: { html: 'die ' + esc(correct) } }, wrong.map(x => ({ opt: { html: 'die ' + esc(x) } })), {
      label: 'Множественное число', prompt: `<div class="q-word">${deHTML(w)}</div><div class="q-sub">${esc(w.ru)}</div>`,
      explain: `${deHTML(w)} → <b>${esc(w.pl)}</b>`, key: w.key, srs: true, w, sayAfter: w.pl
    });
  },
  canPlural(w) { return w.t === 'n' && w.pl && w.pl !== '-' && /^die \S+$/.test(w.pl) && !/\(Pl/.test(w.de); },
  gapToken(w) {
    if (!w.ex || w.t === 'phr') return null;
    let lemma = splitArticle(w.de).lemma.replace(/^sich /, '').replace(/ \+.*$/, '');
    if (/\s/.test(lemma)) return null;
    const toks = w.ex.split(/\s+/);
    const i = toks.findIndex(t => t.replace(/[.,!?;:„“"]/g, '').toLowerCase() === lemma.toLowerCase());
    return i < 0 ? null : { toks, i, lemma: toks[i].replace(/[.,!?;:„“"]/g, '') };
  },
  gap(w, pool) {
    const g = this.gapToken(w);
    if (!g) return null;
    const others = this.distract(w, pool, 'de').map(x => splitArticle(x.de).lemma.replace(/^sich /, '').replace(/ \+.*$/, ''))
      .filter(x => !/\s/.test(x) && x.toLowerCase() !== g.lemma.toLowerCase());
    if (others.length < 2) return null;
    const fix = s => /^[A-ZÄÖÜ]/.test(g.lemma) ? s.charAt(0).toUpperCase() + s.slice(1) : s;
    const sent = g.toks.map((t, j) => j === g.i ? t.replace(/[^.,!?;:„“"]+/, '<span class="gap">＿＿＿</span>') : esc(t)).join(' ');
    return this.choiceFrom({ opt: { html: esc(g.lemma) } }, others.slice(0, 3).map(x => ({ opt: { html: esc(fix(x)) } })), {
      label: 'Вставьте пропущенное слово', prompt: `<div class="q-sent">${sent}</div><div class="q-sub">${esc(w.exRu)}</div>`,
      explain: `<b>${esc(w.ex)}</b><br>${this.wordExplain(w)}`, key: w.key, srs: true, w, sayAfter: w.ex
    });
  },
  order(de, ru, key, opts = {}) {
    const m = /^(.*?)([.!?…]*)$/.exec(de.trim());
    const toks = m[1].split(/\s+/).filter(Boolean);
    if (toks.length < 3 || toks.length > 14) return null;
    return Object.assign({ kind: 'order', label: opts.listen ? 'Послушайте и соберите фразу' : 'Соберите предложение',
      prompt: opts.listen ? `<button class="big-audio" data-say>${ICON.sound}</button>` : `<div class="q-sub big">${esc(ru)}</div>`,
      tokens: toks, tail: m[2], ru, say: de, autoplay: !!opts.listen, key, srs: !!opts.srs, explain: opts.explain || '' }, opts.extra || {});
  },
  flash(w) { return { kind: 'flash', w, key: w.key, say: w.de }; },
  match(words) {
    return { kind: 'match', label: 'Найдите пары', pairs: words.map(w => ({ l: w.de, lh: deHTML(w), r: w.ru, key: w.key })) };
  },
  wordExplain(w) {
    let s = `${deHTML(w)} — ${esc(w.ru)}`;
    if (w.t === 'n' && w.pl && w.pl !== '-') s += ` <span class="muted">· мн. ${esc(w.pl)}</span>`;
    if (w.ex) s += `<div class="ex-line">${esc(w.ex)}<br><span class="muted">${esc(w.exRu || '')}</span></div>`;
    return s;
  },

  // Вопрос под уровень знания слова
  forWord(w, pool, mode) {
    pool = pool || C.topicWords(w.topic);
    const m = Store.mastery(w.key);
    const opts = [];
    const add = (f, wt = 1) => { for (let i = 0; i < wt; i++) opts.push(f); };
    if (mode) add(mode);
    else if (m <= 1) { add('deRu', 3); add('listen'); if (w.t === 'n') add('article', 2); }
    else if (m <= 3) { add('ruDe', 2); add('listen'); add('gap', 2); if (w.t === 'n') add('article'); if (this.canPlural(w)) add('plural'); add('deRu'); }
    else { add('type', 2); add('ruDe'); add('gap', 2); add('orderEx'); if (this.canPlural(w)) add('plural'); }
    for (const f of shuffle(opts)) {
      const q = this.make(f, w, pool);
      if (q) return q;
    }
    return this.deRu(w, pool);
  },
  make(f, w, pool) {
    switch (f) {
      case 'deRu': return this.deRu(w, pool);
      case 'ruDe': return this.ruDe(w, pool);
      case 'listen': return this.listen(w, pool);
      case 'type': return this.type(w);
      case 'article': return w.t === 'n' && splitArticle(w.de).art ? this.article(w) : null;
      case 'plural': return this.canPlural(w) ? this.pluralForms(w) : null;
      case 'gap': return this.gap(w, pool);
      case 'orderEx': return w.ex ? this.order(w.ex, w.exRu, w.key, { srs: true, extra: { w } }) : null;
      case 'dictation': return w.ex ? this.order(w.ex, w.exRu, w.key, { srs: true, listen: true, extra: { w } }) : null;
    }
    return null;
  },

  // ---- Грамматика и тесты ----
  fromExercise(x) {
    if (x.type === 'choice') {
      const opts = shuffle(x.options.map((o, i) => ({ o, i })));
      return { kind: 'choice', label: 'Выберите правильный вариант', prompt: `<div class="q-sent">${this.gapify(x.q)}</div>`,
        options: opts.map(o => ({ html: esc(o.o) })), a: opts.findIndex(o => o.i === x.a), explain: esc(x.explain || ''), key: x.key,
        sayAfter: x.q.includes('___') ? x.q.replace(/_{2,}/, x.options[x.a]) : null };
    }
    if (x.type === 'input') {
      return { kind: 'input', label: 'Впишите ответ', prompt: `<div class="q-sent">${this.gapify(x.q)}</div>`, answers: x.a,
        reveal: esc(x.a[0]), explain: esc(x.explain || ''), key: x.key, sayAfter: x.q.includes('___') ? x.q.replace(/_{2,}/, x.a[0]).replace(/\s*\(.*?\)\s*$/, '') : null };
    }
    if (x.type === 'order') {
      const de = x.words.join(' ');
      return this.order(de + (/[.!?]$/.test(de) ? '' : '.'), x.ru, x.key, { explain: esc(x.explain || '') }) ||
        { kind: 'order', label: 'Соберите предложение', prompt: `<div class="q-sub big">${esc(x.ru)}</div>`, tokens: x.words, tail: '', ru: x.ru, say: de, key: x.key, explain: esc(x.explain || '') };
    }
    return null;
  },
  gapify(q) { return esc(q).replace(/_{2,}/g, '<span class="gap">＿＿＿</span>').replace(/\n/g, '<br>'); },
  fromTest(t) {
    const opts = shuffle(t.options.map((o, i) => ({ o, i })));
    return { kind: 'choice', label: ({ grammar: 'Грамматика', vocab: 'Лексика', reading: 'Чтение', usage: 'Речевые ситуации' })[t.cat] || 'Вопрос',
      prompt: `<div class="q-sent">${this.gapify(t.q)}</div>`, options: opts.map(o => ({ html: esc(o.o) })),
      a: opts.findIndex(o => o.i === t.a), explain: esc(t.explain || ''), key: t.key, cat: t.cat, lvl: t.lvl };
  },
  fromQuiz(q, key) {
    const opts = shuffle(q.options.map((o, i) => ({ o, i })));
    return { kind: 'choice', label: 'Вопрос к тексту', prompt: `<div class="q-sent ru">${esc(q.q)}</div>`,
      options: opts.map(o => ({ html: esc(o.o) })), a: opts.findIndex(o => o.i === q.a), explain: esc(q.explain || ''), key };
  },

  // ---- Глаголы ----
  verbQ(v, tense, p) {
    tense = tense || pick(v.lvl === 'A1' ? ['praes', 'praes', 'perf'] : ['praes', 'praet', 'perf']);
    if (tense === 'perf') {
      const parts = v.perf.split(' ');
      const aux = parts[0], rest = parts.slice(1).join(' ');
      const answers = aux.includes('/') ? aux.split('/').map(a => a + ' ' + rest) : [v.perf];
      return { kind: 'input', label: 'Perfekt · er/sie/es', prompt: `<div class="q-word">${esc(v.inf)}</div><div class="q-sub">${esc(v.ru)} — «он ${esc(v.ru.split(',')[0])}» в прошедшем</div>`,
        answers, reveal: esc(v.perf), explain: `er ${esc(v.perf)}`, key: `v|${v.inf}|perf|2`, say: 'er ' + v.perf, prefix: 'er' };
    }
    p = p == null ? rnd(6) : p;
    const forms = tense === 'praes' ? v.praes : v.praet;
    const pron = ['ich', 'du', 'er', 'wir', 'ihr', 'sie'][p];
    return { kind: 'input', label: (tense === 'praes' ? 'Präsens' : 'Präteritum') + ' · ' + PERSONS[p],
      prompt: `<div class="q-word">${esc(v.inf)}</div><div class="q-sub">${esc(v.ru)}</div>`,
      answers: [forms[p]], reveal: `${pron} ${esc(forms[p])}`, explain: this.verbTable(v, tense), key: `v|${v.inf}|${tense}|${p}`, say: pron + ' ' + forms[p], prefix: pron };
  },
  verbTable(v, tense) {
    const forms = tense === 'praet' ? v.praet : v.praes;
    return `<table class="mini"><tbody>${PERSONS.map((p, i) => `<tr><td class="muted">${p}</td><td><b>${esc(forms[i])}</b></td></tr>`).join('')}</tbody></table>`;
  },

  // Восстановление вопроса по ключу (для «работы над ошибками»)
  fromKey(key) {
    const [t] = key.split('|');
    if (t === 'w' || t === 'p') { const w = C.byKey[key]; return w ? this.forWord(w) : null; }
    if (t === 'g') { const x = C.gex[key]; return x ? this.fromExercise(x) : null; }
    if (t === 't') { const x = C.testByKey[key]; return x ? this.fromTest(x) : null; }
    if (t === 'v') {
      const [, inf, tense, p] = key.split('|');
      const v = C.verbByInf[inf]; return v ? this.verbQ(v, tense, +p) : null;
    }
    return null;
  }
};

// Подсказки по роду существительных
const RULES = {
  gender(lemma, art) {
    const l = lemma.toLowerCase();
    const r = [
      [/(ung|heit|keit|schaft|ion|tät|ik|ur|ei|enz|anz)$/, 'die', 'Суффиксы -ung, -heit, -keit, -schaft, -ion, -tät, -ik, -ei почти всегда женского рода.'],
      [/(chen|lein)$/, 'das', 'Уменьшительные -chen и -lein — всегда das.'],
      [/(ment|um|ma)$/, 'das', 'Слова на -ment, -um часто среднего рода.'],
      [/(ling|ismus|ich|ig|or)$/, 'der', 'Суффиксы -ling, -ismus, -ig, -or обычно мужского рода.'],
      [/(er)$/, 'der', 'Профессии и инструменты на -er часто мужского рода.'],
      [/e$/, 'die', 'Многие слова на -e женского рода (около 90%).']
    ];
    for (const [re, a, tip] of r) if (re.test(l)) return a === art ? `<div class="tip-line">💡 ${tip}</div>` : '';
    return '';
  }
};

/* js/ui.js */
// Мелкие элементы интерфейса: тосты, модальные окна, конфетти
const UI = {
  toast(html, ms = 2600) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = html;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 400); }, ms);
  },
  // Своё окно подтверждения (confirm() в некоторых средах не работает)
  confirm(title, text, okLabel = 'Да', danger = false) {
    return new Promise(res => {
      const m = document.createElement('div');
      m.className = 'modal';
      m.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true">
        <h3>${title}</h3><p>${text}</p>
        <div class="row gap8 end"><button class="btn ghost" data-v="0">Отмена</button><button class="btn ${danger ? 'danger' : 'primary'}" data-v="1">${okLabel}</button></div></div>`;
      document.body.appendChild(m);
      m.addEventListener('click', e => {
        const b = e.target.closest('[data-v]');
        if (b || e.target === m) { m.remove(); res(!!(b && b.dataset.v === '1')); }
      });
    });
  },
  sheet(html) {
    const m = document.createElement('div');
    m.className = 'modal sheet-wrap';
    m.innerHTML = `<div class="sheet-card">${html}</div>`;
    document.body.appendChild(m);
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) m.remove(); });
    return m;
  },
  confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('canvas');
    c.className = 'confetti';
    document.body.appendChild(c);
    const W = c.width = innerWidth * devicePixelRatio, H = c.height = innerHeight * devicePixelRatio;
    const ctx = c.getContext('2d');
    const css = getComputedStyle(document.documentElement);
    const cols = ['--der', '--die', '--das', '--gold'].map(v => css.getPropertyValue(v).trim() || '#e0a020');
    const P = Array.from({ length: 140 }, () => ({ x: W / 2 + (Math.random() - .5) * W * .3, y: H * .35, vx: (Math.random() - .5) * 26, vy: -Math.random() * 30 - 8,
      s: (6 + Math.random() * 8) * devicePixelRatio, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: pick(cols) }));
    let f = 0;
    (function tick() {
      ctx.clearRect(0, 0, W, H);
      P.forEach(p => { p.vy += 1.1; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
      if (++f < 150) requestAnimationFrame(tick); else c.remove();
    })();
  },
  ring(pct, size = 64, stroke = 7, cls = '') {
    const r = (size - stroke) / 2, L = 2 * Math.PI * r, off = L * (1 - clamp(pct, 0, 1));
    return `<svg class="ring ${cls}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" class="ring-bg" fill="none"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" class="ring-fg" fill="none"
        stroke-dasharray="${L}" stroke-dashoffset="${off}" transform="rotate(-90 ${size / 2} ${size / 2})" stroke-linecap="round"/></svg>`;
  },
  dots(m) { // индикатор уровня знания слова, 0..6
    const n = m >= 5 ? 3 : m >= 2 ? 2 : m >= 1 ? 1 : 0;
    return `<span class="mdots m${n}" title="${['новое', 'учу', 'знаю', 'выучено'][n]}"><i></i><i></i><i></i></span>`;
  }
};

/* js/engine.js */
// Движок учебной сессии: показывает вопросы, проверяет, ведёт счёт
const Engine = {
  s: null,
  start(cfg) {
    const qs = (cfg.questions || []).filter(Boolean);
    if (!qs.length && !cfg.gen) { UI.toast('Здесь пока нечего тренировать'); return; }
    Speech.stop();
    this.s = Object.assign({ mode: 'learn', requeue: true, xp: 5, title: 'Тренировка' }, cfg, {
      queue: qs.slice(), done: [], total: qs.length, correct: 0, combo: 0, maxCombo: 0, xpGained: 0,
      t0: Date.now(), cur: null, locked: false
    });
    let el = $('#session');
    if (!el) { el = document.createElement('div'); el.id = 'session'; document.body.appendChild(el); }
    el.innerHTML = `<div class="ses-top">
        <button class="icon-btn" id="ses-close" aria-label="Закрыть">${ICON.close}</button>
        <div class="ses-bar"><i id="ses-prog"></i></div>
        <div class="ses-meta" id="ses-meta"></div>
      </div>
      <div class="ses-body" id="ses-body"></div>
      <div class="ses-foot" id="ses-foot"></div>`;
    el.hidden = false;
    document.body.classList.add('in-session');
    $('#ses-close').onclick = () => this.quit();
    if (this.s.timeLimit) this.startTimer();
    this.next();
  },
  async quit() {
    const s = this.s;
    if (s && !s.finished && s.done.length > 2) {
      if (!(await UI.confirm('Закончить тренировку?', 'Прогресс по уже отвеченным вопросам сохранится.', 'Закончить'))) return;
    }
    this.close();
  },
  close() {
    Speech.stop();
    if (this.s && this.s.timer) clearInterval(this.s.timer);
    this.s = null;
    const el = $('#session'); if (el) { el.hidden = true; el.innerHTML = ''; }
    document.body.classList.remove('in-session');
    App.refresh();
  },
  startTimer() {
    const s = this.s;
    s.tEnd = Date.now() + s.timeLimit * 1000;
    const tick = () => {
      if (this.s !== s) return clearInterval(s.timer);
      const left = Math.max(0, Math.ceil((s.tEnd - Date.now()) / 1000));
      const m = $('#ses-meta');
      if (m) m.innerHTML = `<span class="timer ${left <= 10 ? 'hot' : ''}">${ICON.timer}${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}</span>`;
      if (left <= 0) { clearInterval(s.timer); this.finish(); }
    };
    tick();
    s.timer = setInterval(tick, 250);
  },
  progress() {
    const s = this.s;
    const p = s.gen ? (s.timeLimit ? 1 - (s.tEnd - Date.now()) / (s.timeLimit * 1000) : s.done.length / (s.totalHint || 30)) : s.done.length / (s.done.length + s.queue.length + (s.cur ? 1 : 0) || 1);
    $('#ses-prog').style.width = (clamp(p, 0, 1) * 100) + '%';
    if (!s.timeLimit) {
      const m = $('#ses-meta');
      m.innerHTML = s.combo >= 3 ? `<span class="combo">${ICON.bolt}${s.combo}</span>` : `<span class="count">${s.gen ? s.done.length + 1 : Math.min(s.done.length + 1, s.total) + '/' + s.total}</span>`;
    }
  },
  next() {
    const s = this.s; if (!s) return;
    s.locked = false;
    let q = s.gen ? s.gen() : s.queue.shift();
    if (!q) return this.finish();
    s.cur = q; q._t0 = Date.now();
    this.progress();
    const body = $('#ses-body'), foot = $('#ses-foot');
    foot.innerHTML = ''; foot.className = 'ses-foot';
    body.className = 'ses-body kind-' + q.kind;
    body.innerHTML = '';
    const r = this['r_' + q.kind];
    r.call(this, q, body, foot);
    body.scrollTop = 0;
    if (q.autoplay && Store.state.settings.autoplay && q.say) setTimeout(() => Speech.say(q.say), 200);
    $$('[data-say]', body).forEach(b => b.onclick = () => Speech.say(b.dataset.say || q.say));
  },
  head(q) {
    return `<div class="q-label">${q.label || ''}</div><div class="q-prompt">${q.prompt || ''}</div>`;
  },

  // ---------- Выбор варианта ----------
  r_choice(q, body) {
    body.innerHTML = this.head(q) + `<div class="opts ${q.style === 'articles' ? 'opts-art' : ''}">${q.options.map((o, i) =>
      `<button class="opt ${o.cls || ''}" data-i="${i}"><span class="opt-k">${i + 1}</span><span class="opt-t">${o.html}</span></button>`).join('')}</div>`;
    $$('.opt', body).forEach(b => b.onclick = () => this.pickChoice(q, +b.dataset.i));
  },
  pickChoice(q, i) {
    const s = this.s; if (s.locked) return;
    s.locked = true;
    const ok = i === q.a;
    const btns = $$('.opt', $('#ses-body'));
    if (s.mode === 'exam') {
      btns[i].classList.add('picked');
      return this.record(q, ok, q.options[i].html, () => setTimeout(() => this.next(), 220));
    }
    btns.forEach((b, j) => { b.disabled = true; if (j === q.a) b.classList.add('right'); else if (j === i) b.classList.add('wrong'); else b.classList.add('dim'); });
    this.record(q, ok, q.options[i].html);
    if (s.mode === 'speed') return setTimeout(() => this.next(), ok ? 280 : 900);
    this.feedback(q, ok, ok ? '' : `Правильно: <b>${q.options[q.a].html}</b>`);
  },

  // ---------- Ввод текста ----------
  r_input(q, body, foot) {
    body.innerHTML = this.head(q) + `
      <div class="inp-wrap">${q.prefix ? `<span class="inp-prefix">${esc(q.prefix)}</span>` : ''}
        <input id="ans" class="inp" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="Ваш ответ" aria-label="Ваш ответ"></div>
      <div class="uml">${['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map(c => `<button data-c="${c}">${c}</button>`).join('')}</div>`;
    foot.innerHTML = `<button class="btn ghost" id="dontknow">Не знаю</button><button class="btn primary grow" id="check">Проверить</button>`;
    const inp = $('#ans');
    $$('.uml button', body).forEach(b => b.onclick = e => {
      e.preventDefault();
      const p = inp.selectionStart ?? inp.value.length;
      inp.value = inp.value.slice(0, p) + b.dataset.c + inp.value.slice(inp.selectionEnd ?? p);
      inp.focus(); inp.setSelectionRange(p + 1, p + 1);
    });
    const submit = () => {
      if (this.s.locked) return;
      const v = inp.value;
      if (!v.trim()) { inp.focus(); return; }
      let res = checkAnswer(v, q.answers);
      let note = '';
      if (res === 'bad' && q.nounCheck) {
        const { art, lemma } = splitArticle(q.answers[0]);
        const u = splitArticle(norm(v).replace(/^(der|die|das)(?=\S)/, '$1 '));
        if (norm(u.lemma) === norm(lemma) || norm(v) === norm(lemma)) note = u.art ? `Слово верное, но артикль — <b class="a-${art}">${art}</b>` : `Не забудьте артикль: <b class="a-${art}">${art}</b>`;
      }
      const ok = res !== 'bad';
      if (res === 'typo') note = 'Засчитано, но есть опечатка';
      if (res === 'umlaut') note = 'Засчитано. Попробуйте писать умлауты: ä ö ü ß';
      this.s.locked = true;
      inp.disabled = true;
      inp.classList.add(ok ? 'right' : 'wrong');
      this.record(q, ok, esc(v));
      if (this.s.mode === 'exam') return this.next();
      this.feedback(q, ok, (ok && res === 'ok' ? '' : `Ответ: <b>${q.reveal}</b>`) + (note ? `<div class="note">${note}</div>` : ''), res === 'typo' || res === 'umlaut');
    };
    $('#check').onclick = submit;
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    $('#dontknow').onclick = () => { if (this.s.locked) return; this.s.locked = true; inp.disabled = true; this.record(q, false, '—'); this.feedback(q, false, `Ответ: <b>${q.reveal}</b>`); };
    setTimeout(() => inp.focus(), 60);
  },

  // ---------- Сборка предложения ----------
  r_order(q, body, foot) {
    const bank = shuffle(q.tokens.map((t, i) => ({ t, i })));
    // не показывать уже собранный порядок
    if (bank.length > 2 && bank.every((b, j) => b.i === j)) bank.push(bank.shift());
    body.innerHTML = this.head(q) + `<div class="ord-ans" id="ord-ans"></div><div class="ord-bank" id="ord-bank">${bank.map(b =>
      `<button class="tok" data-i="${b.i}">${esc(b.t)}</button>`).join('')}</div>`;
    foot.innerHTML = `<button class="btn ghost" id="dontknow">Не знаю</button><button class="btn primary grow" id="check" disabled>Проверить</button>`;
    const ans = $('#ord-ans'), bk = $('#ord-bank');
    const upd = () => { $('#check').disabled = bk.querySelectorAll('.tok:not(.used)').length > 0; };
    bk.addEventListener('click', e => {
      const b = e.target.closest('.tok'); if (!b || b.classList.contains('used') || this.s.locked) return;
      Sound.tap();
      b.classList.add('used');
      const c = document.createElement('button'); c.className = 'tok in'; c.textContent = b.textContent; c.dataset.i = b.dataset.i;
      ans.appendChild(c); upd();
    });
    ans.addEventListener('click', e => {
      const c = e.target.closest('.tok'); if (!c || this.s.locked) return;
      const src = bk.querySelector(`.tok.used[data-i="${c.dataset.i}"]`); if (src) src.classList.remove('used');
      c.remove(); upd();
    });
    const sentence = () => $$('.tok', ans).map(t => t.textContent).join(' ');
    $('#check').onclick = () => {
      if (this.s.locked) return;
      this.s.locked = true;
      const given = sentence();
      const ok = norm(given) === norm(q.tokens.join(' '));
      ans.classList.add(ok ? 'right' : 'wrong');
      this.record(q, ok, esc(given));
      if (this.s.mode === 'exam') return this.next();
      this.feedback(q, ok, ok ? '' : `Правильно: <b>${esc(q.tokens.join(' ') + q.tail)}</b>`, false, !ok);
    };
    $('#dontknow').onclick = () => { if (this.s.locked) return; this.s.locked = true; this.record(q, false, '—'); this.feedback(q, false, `Правильно: <b>${esc(q.tokens.join(' ') + q.tail)}</b>`); };
  },

  // ---------- Карточка ----------
  r_flash(q, body, foot) {
    const w = q.w;
    const tag = { n: 'существительное', v: 'глагол', adj: 'прилагательное', adv: 'наречие', phr: 'фраза', other: 'слово' }[w.t] || '';
    body.innerHTML = `<div class="flash" id="flash" tabindex="0" role="button" aria-label="Перевернуть карточку">
      <div class="flash-in">
        <div class="face front ${artClass(w.de)}">
          <div class="f-tag">${tag} · ${w.lvl}</div>
          <div class="f-word">${deHTML(w)}</div>
          ${w.t === 'n' && w.pl && w.pl !== '-' ? `<div class="f-pl">${esc(w.pl)}</div>` : ''}
          <div class="f-hint">Нажмите, чтобы перевернуть</div>
        </div>
        <div class="face back ${artClass(w.de)}">
          <div class="f-tag">${deHTML(w)}</div>
          <div class="f-ru">${esc(w.ru)}</div>
          ${w.ex && w.ex !== w.de ? `<div class="f-ex"><button class="mini-audio" data-say="${esc(w.ex)}">${ICON.sound}</button><div>${esc(w.ex)}<div class="muted">${esc(w.exRu || '')}</div></div></div>` : ''}
        </div>
      </div></div>
      <div class="row center gap8"><button class="btn round" data-say="${esc(w.de)}" aria-label="Послушать">${ICON.sound}</button>
      <button class="btn round" id="slow" aria-label="Медленно">${ICON.slow}</button></div>`;
    $('#slow').onclick = () => Speech.say(w.de, { slow: true });
    const flash = $('#flash');
    const flip = () => {
      flash.classList.toggle('flipped');
      if (flash.classList.contains('flipped') && !foot.innerHTML) {
        foot.className = 'ses-foot grades';
        foot.innerHTML = [['Не знаю', 0, 'g0'], ['Трудно', 1, 'g1'], ['Знаю', 2, 'g2'], ['Легко', 3, 'g3']].map(([l, g, c]) =>
          `<button class="btn grade ${c}" data-g="${g}">${l}</button>`).join('');
        $$('[data-g]', foot).forEach(b => b.onclick = () => this.grade(q, +b.dataset.g));
      }
    };
    flash.onclick = e => { if (!e.target.closest('[data-say]')) flip(); };
    flash.onkeydown = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); } };
    if (Store.state.settings.autoplay) setTimeout(() => Speech.say(w.de), 250);
  },
  grade(q, g) {
    const s = this.s; if (s.locked) return; s.locked = true;
    Store.srsGrade(q.key, g);
    const ok = g >= 2;
    Store.answer(ok);
    if (ok) { s.correct++; Store.fixMistake(q.key); this.gain(3); } else if (s.requeue && !q._re) { q._re = true; s.queue.push(Object.assign({}, q, { _re: true })); }
    s.done.push({ q, ok, given: ['не знаю', 'трудно', 'знаю', 'легко'][g] });
    Store.save();
    this.next();
  },

  // ---------- Пары ----------
  r_match(q, body) {
    const L = shuffle(q.pairs.map((p, i) => ({ i, h: p.lh || esc(p.l), say: p.l })));
    const R = shuffle(q.pairs.map((p, i) => ({ i, h: esc(p.r) })));
    body.innerHTML = this.head(q) + `<div class="match"><div class="mcol">${L.map(x => `<button class="mt" data-side="l" data-i="${x.i}" data-s="${esc(x.say)}">${x.h}</button>`).join('')}</div>
      <div class="mcol">${R.map(x => `<button class="mt" data-side="r" data-i="${x.i}">${x.h}</button>`).join('')}</div></div>`;
    let sel = null; const bad = new Set(); let left = q.pairs.length;
    body.querySelector('.match').addEventListener('click', e => {
      const b = e.target.closest('.mt'); if (!b || b.classList.contains('done')) return;
      if (b.dataset.side === 'l' && Store.state.settings.autoplay) Speech.say(b.dataset.s);
      if (!sel || sel.dataset.side === b.dataset.side) { $$('.mt.sel', body).forEach(x => x.classList.remove('sel')); sel = b; b.classList.add('sel'); return; }
      const a = sel; sel = null; a.classList.remove('sel');
      if (a.dataset.i === b.dataset.i) {
        [a, b].forEach(x => { x.classList.add('done'); x.disabled = true; });
        Sound.ok(); left--;
        if (!left) {
          q.pairs.forEach((p, i) => { const ok = !bad.has(i); this.record({ key: p.key, srs: true, kind: 'pair', label: p.l }, ok, '', null, true); });
          this.s.done.push({ q, ok: bad.size === 0, given: '' });
          setTimeout(() => this.next(), 450);
        }
      } else {
        bad.add(+a.dataset.i); bad.add(+b.dataset.i);
        [a, b].forEach(x => { x.classList.add('shake'); setTimeout(() => x.classList.remove('shake'), 400); });
        Sound.bad();
      }
    });
  },

  // ---------- Учёт ответа ----------
  record(q, ok, given, after, silent) {
    const s = this.s;
    Store.answer(ok);
    if (q.key) {
      if (q.srs) Store.srsAnswer(q.key, ok);
      if (ok) Store.fixMistake(q.key); else Store.mistake(q.key);
    }
    if (ok) {
      s.correct++; s.combo++; s.maxCombo = Math.max(s.maxCombo, s.combo);
      this.gain(s.xp + (s.combo > 0 && s.combo % 5 === 0 ? 5 : 0));
      if (s.mode !== 'exam' && !silent) Sound.ok();
    } else {
      s.combo = 0;
      if (s.mode !== 'exam' && !silent) Sound.bad();
      if (s.requeue && s.mode === 'learn' && !q._re && q.kind !== 'pair') { s.queue.push(Object.assign({}, q, { _re: true })); }
    }
    if (q.kind !== 'pair') s.done.push({ q, ok, given });
    Store.save();
    this.progress();
    if (after) after();
  },
  gain(n) { this.s.xpGained += n; Store.addXP(n); },

  feedback(q, ok, html, warn, allowOverride) {
    const foot = $('#ses-foot');
    foot.className = 'ses-foot fb ' + (ok ? (warn ? 'fb-warn' : 'fb-ok') : 'fb-bad');
    const title = ok ? pick(['Richtig!', 'Super!', 'Genau!', 'Toll!', 'Prima!', 'Klasse!']) : pick(['Nicht ganz', 'Leider falsch', 'Fast!']);
    const sayTxt = q.sayAfter || (q.kind === 'input' || q.kind === 'order' ? q.say : null);
    foot.innerHTML = `<div class="fb-box">
        <div class="fb-head"><span class="fb-ic">${ok ? ICON.check : ICON.x}</span><b>${title}</b>
        ${sayTxt ? `<button class="mini-audio" id="fb-say" aria-label="Послушать">${ICON.sound}</button>` : ''}</div>
        ${html ? `<div class="fb-ans">${html}</div>` : ''}
        ${q.explain ? `<div class="fb-ex">${q.explain}</div>` : ''}
      </div>
      <div class="row gap8">${allowOverride ? `<button class="btn ghost" id="override">Мой вариант тоже верен</button>` : ''}<button class="btn primary grow" id="next">Дальше</button></div>`;
    if (sayTxt) { $('#fb-say').onclick = () => Speech.say(sayTxt); if (ok && Store.state.settings.autoplay && !q.autoplay) Speech.say(sayTxt); }
    $('#next').onclick = () => this.next();
    if (allowOverride) $('#override').onclick = () => {
      const s = this.s, last = s.done[s.done.length - 1];
      if (last && !last.ok) {
        last.ok = true; s.correct++; Store.fixMistake(q.key);
        const i = s.queue.findIndex(x => x.key === q.key && x._re); if (i >= 0) s.queue.splice(i, 1);
      }
      this.next();
    };
    setTimeout(() => $('#next') && $('#next').focus({ preventScroll: true }), 50);
  },

  // ---------- Итоги ----------
  finish() {
    const s = this.s; if (!s || s.finished) return;
    s.finished = true;
    if (s.timer) clearInterval(s.timer);
    Speech.stop();
    const total = s.gen ? s.done.length : s.done.filter(d => !d.q._re).length;
    const firstTry = s.done.filter(d => !d.q._re);
    const correct = firstTry.filter(d => d.ok).length;
    const pct = total ? Math.round(correct / total * 100) : 0;
    const secs = Math.round((Date.now() - s.t0) / 1000);
    Store.state.stats.sessions++;
    if (pct === 100 && total >= 5) Store.state.stats.perfect++;
    Store.save();
    const res = { correct, total, pct, secs, xp: s.xpGained, maxCombo: s.maxCombo, done: s.done };
    const custom = s.onFinish ? s.onFinish(res) : null;
    Ach.check();
    if (pct >= 90 && total >= 5) { UI.confetti(); Sound.done(); }
    const wrong = s.done.filter(d => !d.ok && d.q.kind !== 'match' && d.q.kind !== 'flash');
    const uniqWrong = []; const seen = new Set();
    wrong.forEach(d => { const k = d.q.key || d.q.prompt; if (!seen.has(k)) { seen.add(k); uniqWrong.push(d); } });
    const verdict = pct >= 90 ? 'Ausgezeichnet!' : pct >= 70 ? 'Gut gemacht!' : pct >= 50 ? 'Nicht schlecht!' : 'Weiter üben!';
    const body = $('#ses-body'), foot = $('#ses-foot');
    $('#ses-prog').style.width = '100%';
    $('#ses-meta').innerHTML = '';
    body.className = 'ses-body result';
    body.innerHTML = `
      <div class="res-hero">
        <div class="res-ring">${UI.ring(pct / 100, 132, 12, pct >= 70 ? 'good' : pct >= 50 ? 'mid' : 'low')}<div class="res-pct">${s.gen ? correct : pct + '%'}<small>${s.gen ? 'верно' : `${correct} из ${total}`}</small></div></div>
        <h2>${verdict}</h2>
        ${custom && custom.headline ? `<p class="res-line">${custom.headline}</p>` : ''}
      </div>
      <div class="res-stats">
        <div><b>+${s.xpGained}</b><span>XP</span></div>
        <div><b>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</b><span>время</span></div>
        <div><b>${s.maxCombo}</b><span>серия</span></div>
      </div>
      ${custom && custom.html ? custom.html : ''}
      ${uniqWrong.length ? `<h3 class="res-h">Ошибки · ${uniqWrong.length}</h3><div class="res-list">${uniqWrong.slice(0, 40).map(d => this.reviewItem(d)).join('')}</div>` : ''}
      ${s.mode === 'exam' ? `<h3 class="res-h">Все ответы</h3><div class="res-list">${s.done.map(d => this.reviewItem(d)).join('')}</div>` : ''}`;
    foot.className = 'ses-foot';
    foot.innerHTML = `${s.retry ? `<button class="btn ghost" id="again">${ICON.redo} Ещё раз</button>` : ''}<button class="btn primary grow" id="fin">Готово</button>`;
    $('#fin').onclick = () => this.close();
    if (s.retry) $('#again').onclick = () => { const r = s.retry; this.close(); r(); };
  },
  reviewItem(d) {
    const q = d.q;
    let right = '';
    if (q.kind === 'choice') right = q.options[q.a].html;
    else if (q.kind === 'input') right = q.reveal;
    else if (q.kind === 'order') right = esc(q.tokens.join(' ') + q.tail);
    const prompt = q.kind === 'choice' && q.listen ? deHTML(q.w) : (q.prompt || '').replace(/<button[\s\S]*?<\/button>/g, q.say ? esc(q.say) : '');
    return `<div class="rv ${d.ok ? 'ok' : 'bad'}"><div class="rv-q">${prompt}</div>
      ${!d.ok && d.given ? `<div class="rv-a"><s>${d.given}</s></div>` : ''}<div class="rv-r">${ICON.check}<span>${right}</span></div>
      ${!d.ok && q.explain ? `<div class="rv-e">${q.explain}</div>` : ''}</div>`;
  }
};

/* js/ach.js */
// Достижения
const ACH = [
  { id: 'first', t: 'Erster Schritt', d: 'Пройти первую тренировку', ic: '🌱', f: s => s.stats.sessions >= 1 },
  { id: 'w10', t: 'Zehn Wörter', d: 'Выучить 10 слов', ic: '🔤', f: () => Ach.known() >= 10 },
  { id: 'w50', t: 'Wortschatz', d: 'Выучить 50 слов', ic: '📗', f: () => Ach.known() >= 50 },
  { id: 'w150', t: 'Bücherwurm', d: 'Выучить 150 слов', ic: '🐛', f: () => Ach.known() >= 150 },
  { id: 'w400', t: 'Lexikon', d: 'Выучить 400 слов', ic: '📚', f: () => Ach.known() >= 400 },
  { id: 'w1000', t: 'Wortmeister', d: 'Выучить 1000 слов', ic: '🏛️', f: () => Ach.known() >= 1000 },
  { id: 's3', t: 'Dranbleiben', d: 'Серия 3 дня подряд', ic: '🔥', f: () => Store.bestStreak() >= 3 },
  { id: 's7', t: 'Eine Woche', d: 'Серия 7 дней подряд', ic: '📅', f: () => Store.bestStreak() >= 7 },
  { id: 's30', t: 'Eiserner Wille', d: 'Серия 30 дней подряд', ic: '🦾', f: () => Store.bestStreak() >= 30 },
  { id: 'xp1k', t: 'Tausend', d: 'Набрать 1000 XP', ic: '⚡', f: s => s.xp >= 1000 },
  { id: 'xp5k', t: 'Fünftausend', d: 'Набрать 5000 XP', ic: '🌩️', f: s => s.xp >= 5000 },
  { id: 'perfect', t: 'Fehlerfrei', d: 'Тренировка без единой ошибки', ic: '💎', f: s => s.stats.perfect >= 1 },
  { id: 'perfect10', t: 'Perfektionist', d: '10 тренировок без ошибок', ic: '👑', f: s => s.stats.perfect >= 10 },
  { id: 'gram3', t: 'Grammatikfan', d: 'Пройти 3 урока грамматики', ic: '🧩', f: s => Object.values(s.grammar).filter(g => g.done).length >= 3 },
  { id: 'gram15', t: 'Regelkenner', d: 'Пройти 15 уроков грамматики', ic: '📐', f: s => Object.values(s.grammar).filter(g => g.done).length >= 15 },
  { id: 'place', t: 'Standortbestimmung', d: 'Пройти тест на уровень', ic: '🧭', f: s => !!s.placement },
  { id: 'tA1', t: 'A1 bestanden', d: 'Сдать тест A1', ic: '🥉', f: s => s.tests.A1 && s.tests.A1.passed },
  { id: 'tA2', t: 'A2 bestanden', d: 'Сдать тест A2', ic: '🥈', f: s => s.tests.A2 && s.tests.A2.passed },
  { id: 'tB1', t: 'B1 bestanden', d: 'Сдать тест B1', ic: '🥇', f: s => s.tests.B1 && s.tests.B1.passed },
  { id: 'tB2', t: 'B2 bestanden', d: 'Сдать тест B2', ic: '🏅', f: s => s.tests.B2 && s.tests.B2.passed },
  { id: 'tC1', t: 'C1 bestanden', d: 'Сдать тест C1', ic: '🎓', f: s => s.tests.C1 && s.tests.C1.passed },
  { id: 'speed', t: 'Blitzschnell', d: '20 верных ответов в «Скорости»', ic: '⏱️', f: s => (s.best.speed || 0) >= 20 },
  { id: 'read5', t: 'Leseratte', d: 'Прочитать 5 текстов', ic: '📖', f: s => Object.keys(s.reading).length >= 5 },
  { id: 'dial5', t: 'Gesprächig', d: 'Разобрать 5 диалогов', ic: '💬', f: s => Object.keys(s.dialogues).length >= 5 },
  { id: 'a100', t: 'Hundert Antworten', d: 'Ответить на 100 вопросов', ic: '✅', f: s => s.stats.answers >= 100 },
  { id: 'a1000', t: 'Fleißig', d: 'Ответить на 1000 вопросов', ic: '🐝', f: s => s.stats.answers >= 1000 },
  { id: 'night', t: 'Nachteule', d: 'Заниматься после 23:00', ic: '🦉', f: () => new Date().getHours() >= 23 },
  { id: 'early', t: 'Frühaufsteher', d: 'Заниматься до 7:00', ic: '🌅', f: () => new Date().getHours() < 7 }
];
const Ach = {
  _known: null,
  known() { if (this._known == null) this._known = Object.values(Store.state.srs).filter(r => r.b >= 2).length; return this._known; },
  check() {
    this._known = null;
    const s = Store.state;
    const fresh = [];
    for (const a of ACH) {
      if (s.ach[a.id]) continue;
      let ok = false; try { ok = !!a.f(s); } catch (e) { ok = false; }
      if (ok) { s.ach[a.id] = Date.now(); fresh.push(a); }
    }
    if (fresh.length) {
      Store.save();
      fresh.forEach((a, i) => setTimeout(() => UI.toast(`<span class="t-ic">${a.ic}</span><div><b>${a.t}</b><br><small>${a.d}</small></div>`, 3200), 600 + i * 900));
    }
  }
};

/* js/train.js */
// Запуск тренировок разных типов
const MODES = {
  flash: { t: 'Карточки', d: 'Интервальное повторение', ic: 'cards' },
  quiz: { t: 'Выбор перевода', d: 'DE ↔ RU', ic: 'target' },
  listen: { t: 'Аудирование', d: 'Слушай и выбирай', ic: 'ear' },
  write: { t: 'Письмо', d: 'Напиши слово', ic: 'pen' },
  article: { t: 'Der · Die · Das', d: 'Тренажёр артиклей', ic: 'layers' },
  plural: { t: 'Мн. число', d: 'Формы plural', ic: 'shuffle' },
  gap: { t: 'Пропуски', d: 'Слово в контексте', ic: 'gap' },
  order: { t: 'Собери фразу', d: 'Порядок слов', ic: 'puzzle' },
  dictation: { t: 'Диктант', d: 'Услышь и собери', ic: 'ear' },
  match: { t: 'Пары', d: 'Найди соответствия', ic: 'pairs' },
  speed: { t: 'Скорость', d: '60 секунд', ic: 'timer' }
};

const Train = {
  // слова, подходящие для общего режима
  globalPool(filter) {
    const lv = LEVELS.indexOf(Store.state.level);
    let started = C.words.filter(w => Store.mastery(w.key) > 0);
    if (filter) started = started.filter(filter);
    if (started.length >= 12) return started;
    let lvl = C.words.filter(w => LEVELS.indexOf(w.lvl) <= lv);
    if (filter) lvl = lvl.filter(filter);
    return started.concat(sample(lvl.filter(w => !started.includes(w)), 40));
  },
  // подбор слов для режима: сначала «срочные» и слабые
  pickWords(pool, n) {
    const now = Date.now();
    const score = w => { const r = Store.srsGet(w.key); if (!r) return 1 + Math.random(); return (r.due <= now ? 0 : 2) + r.b * 0.3 + Math.random() * 0.8; };
    return pool.slice().sort((a, b) => score(a) - score(b)).slice(0, n);
  },
  build(mode, pool, n) {
    let ws;
    switch (mode) {
      case 'flash': return this.pickWords(pool, Math.min(n || 15, pool.length)).map(w => Q.flash(w));
      case 'quiz': ws = this.pickWords(pool, n || 12); return ws.map((w, i) => i % 2 ? Q.ruDe(w, pool) : Q.deRu(w, pool));
      case 'listen': return this.pickWords(pool, n || 12).map(w => Q.listen(w, pool));
      case 'write': return this.pickWords(pool, n || 10).map(w => Q.type(w));
      case 'article': return this.pickWords(pool.filter(w => w.t === 'n' && splitArticle(w.de).art), n || 15).map(w => Q.article(w));
      case 'plural': return this.pickWords(pool.filter(w => Q.canPlural(w)), n || 12).map(w => Q.pluralForms(w)).filter(Boolean);
      case 'gap': return this.pickWords(pool.filter(w => Q.gapToken(w)), n || 10).map(w => Q.gap(w, pool)).filter(Boolean);
      case 'order': return this.pickWords(pool.filter(w => w.ex), n || 8).map(w => Q.make('orderEx', w, pool)).filter(Boolean);
      case 'dictation': return this.pickWords(pool.filter(w => w.ex), n || 8).map(w => Q.make('dictation', w, pool)).filter(Boolean);
      case 'match': {
        const out = []; const src = this.pickWords(pool, 18);
        for (let i = 0; i + 4 <= src.length && out.length < 3; i += 6) out.push(Q.match(src.slice(i, i + 6)));
        return out;
      }
      case 'mix': return this.pickWords(pool, n || 12).map(w => Q.forWord(w, pool));
    }
    return [];
  },
  run(mode, pool, title, extra = {}) {
    if (mode === 'speed') return this.speed(pool, title);
    const qs = this.build(mode, pool);
    if (!qs.length) return UI.toast(mode === 'article' || mode === 'plural' ? 'В этой подборке нет подходящих существительных' : 'Недостаточно слов для этого режима');
    Engine.start(Object.assign({ title, questions: qs, xp: mode === 'flash' ? 3 : 5, retry: () => this.run(mode, pool, title, extra), requeue: mode !== 'match' }, extra));
  },
  topic(id, mode) {
    const pool = C.topicWords(id);
    if (!id.startsWith('ph:') && id !== 'fav') { Store.state.lastTopic = id; Store.save(); }
    this.run(mode, pool, (C.topicById[id] || {}).title || 'Тренировка');
  },
  global(mode) {
    const f = mode === 'article' ? (w => w.t === 'n') : mode === 'plural' ? (w => Q.canPlural(w)) : null;
    this.run(mode, this.globalPool(f), MODES[mode].t);
  },
  speed(pool, title) {
    pool = pool && pool.length >= 6 ? pool : this.globalPool();
    let last = null;
    Engine.start({
      title: title || 'Скорость', mode: 'speed', timeLimit: 60, xp: 2, requeue: false,
      gen: () => { let w; do { w = pick(pool); } while (w === last && pool.length > 1); last = w; return Math.random() < .5 ? Q.deRu(w, pool) : Q.ruDe(w, pool); },
      onFinish: r => {
        const best = Store.state.best.speed || 0;
        if (r.correct > best) { Store.state.best.speed = r.correct; Store.save(); return { headline: `Новый рекорд: <b>${r.correct}</b>!` }; }
        return { headline: `Рекорд: ${best}` };
      },
      retry: () => this.speed(pool, title)
    });
  },
  // Умная ежедневная тренировка
  smartPlan() {
    const now = Date.now(), s = Store.state;
    const due = Object.keys(s.srs).filter(k => (k[0] === 'w' || k[0] === 'p') && C.byKey[k] && s.srs[k].due <= now)
      .sort((a, b) => s.srs[a].due - s.srs[b].due);
    const today = Store.today();
    const newLeft = Math.max(0, s.settings.newPerDay - (today.nw || 0));
    let fresh = [];
    if (newLeft) {
      const order = [];
      if (s.lastTopic && C.topicById[s.lastTopic]) order.push(C.topicById[s.lastTopic]);
      const lv = s.level;
      C.topics.filter(t => t.level === lv).forEach(t => order.push(t));
      C.topics.filter(t => LEVELS.indexOf(t.level) < LEVELS.indexOf(lv)).forEach(t => order.push(t));
      C.topics.forEach(t => order.push(t));
      for (const t of uniq(order)) {
        for (const w of t.words) {
          if (LEVELS.indexOf(w.lvl) > LEVELS.indexOf(lv) + 1) continue;
          if (!s.srs[w.key]) fresh.push(w);
          if (fresh.length >= Math.min(newLeft, 6)) break;
        }
        if (fresh.length >= Math.min(newLeft, 6)) break;
      }
    }
    return { due, fresh };
  },
  smart() {
    const { due, fresh } = this.smartPlan();
    const dueWords = due.slice(0, 15).map(k => C.byKey[k]);
    const qs = [];
    const later = [];
    fresh.forEach(w => { qs.push(Q.flash(w)); later.push(w); });
    dueWords.forEach((w, i) => { qs.splice(Math.min(qs.length, i * 2 + 1), 0, Q.forWord(w)); });
    later.forEach(w => qs.push(Q.forWord(w, null, pick(['deRu', 'listen', 'deRu']))));
    if (!qs.length) {
      const pool = this.globalPool();
      return Engine.start({ title: 'Повторение', questions: this.build('mix', pool, 12), retry: () => this.smart() });
    }
    Engine.start({
      title: 'Ежедневная тренировка', questions: qs, retry: () => this.smart(),
      onFinish: () => { const t = Store.today(); t.nw = (t.nw || 0) + fresh.length; Store.save(); }
    });
  },
  mistakes() {
    const keys = Object.keys(Store.state.mistakes).sort((a, b) => Store.state.mistakes[b].last - Store.state.mistakes[a].last);
    const qs = keys.slice(0, 20).map(k => Q.fromKey(k)).filter(Boolean);
    if (!qs.length) return UI.toast('Ошибок нет — так держать!');
    Engine.start({ title: 'Работа над ошибками', questions: shuffle(qs), retry: () => this.mistakes() });
  },
  grammar(id) {
    const g = C.grammar.find(x => x.id === id);
    const qs = g.exercises.map(x => Q.fromExercise(x)).filter(Boolean);
    Engine.start({
      title: g.title, questions: shuffle(qs), xp: 6, retry: () => this.grammar(id),
      onFinish: r => {
        const st = Store.state.grammar[id] || { best: 0, done: false };
        st.best = Math.max(st.best, r.pct); if (r.pct >= 60) st.done = true;
        Store.state.grammar[id] = st; Store.save();
        return { headline: r.pct >= 60 ? 'Урок пройден ✓' : 'Для зачёта нужно 60% — попробуйте ещё раз' };
      }
    });
  },
  levelTest(lvl) {
    const qs = sample(C.tests.filter(t => t.lvl === lvl), 20).map(t => Q.fromTest(t));
    Engine.start({
      title: 'Тест ' + lvl, questions: qs, xp: 8, requeue: false, retry: () => this.levelTest(lvl),
      onFinish: r => this.saveTest(lvl, r)
    });
  },
  exam(lvl) {
    const qs = sample(C.tests.filter(t => t.lvl === lvl), 30).map(t => Q.fromTest(t));
    Engine.start({
      title: 'Экзамен ' + lvl, questions: qs, mode: 'exam', timeLimit: 20 * 60, xp: 10, requeue: false, retry: () => this.exam(lvl),
      onFinish: r => {
        const out = this.saveTest(lvl, r);
        out.html = this.catBreakdown(r);
        return out;
      }
    });
  },
  saveTest(lvl, r) {
    const st = Store.state.tests[lvl] || { best: 0, passed: false };
    st.best = Math.max(st.best, r.pct); st.date = Date.now();
    const passed = r.pct >= 70;
    if (passed) st.passed = true;
    Store.state.tests[lvl] = st; Store.save();
    return { headline: passed ? `Уровень ${lvl} подтверждён ✓` : `Для зачёта нужно 70%. Лучший результат: ${st.best}%` };
  },
  catBreakdown(r) {
    const cats = {};
    r.done.forEach(d => { const c = d.q.label; cats[c] = cats[c] || { ok: 0, n: 0 }; cats[c].n++; if (d.ok) cats[c].ok++; });
    return `<div class="cats">${Object.entries(cats).map(([c, v]) => `<div class="cat"><span>${c}</span><div class="bar"><i style="width:${v.ok / v.n * 100}%"></i></div><b>${v.ok}/${v.n}</b></div>`).join('')}</div>`;
  },
  placement() {
    const PER = 6, NEED = 4;
    let li = 0, inStage = 0, ok = 0, reached = -1;
    const used = new Set();
    const res = {};
    Engine.start({
      title: 'Тест на уровень', mode: 'exam', requeue: false, xp: 4, totalHint: PER * LEVELS.length,
      gen: () => {
        const s = Engine.s;
        if (inStage > 0) { const last = s.done[s.done.length - 1]; if (last && last.ok) ok++; }
        if (inStage === PER) {
          res[LEVELS[li]] = ok;
          if (ok >= NEED) { reached = li; li++; inStage = 0; ok = 0; if (li >= LEVELS.length) return null; }
          else return null;
        }
        const pool = C.tests.filter(t => t.lvl === LEVELS[li] && !used.has(t.key));
        if (!pool.length) return null;
        const t = pick(pool); used.add(t.key); inStage++;
        return Q.fromTest(t);
      },
      onFinish: r => {
        const lvl = reached < 0 ? 'A1' : LEVELS[Math.min(reached + (reached < 4 ? 1 : 0), 4)];
        const solid = reached < 0 ? 'ниже A1' : LEVELS[reached];
        Store.state.placement = { level: lvl, solid, date: Date.now(), res };
        Store.state.level = lvl; Store.save();
        return { headline: `Уверенно: <b>${solid}</b>. Рекомендуем заниматься на уровне <b>${lvl}</b>.`,
          html: `<div class="cats">${Object.entries(res).map(([l, v]) => `<div class="cat"><span>${l}</span><div class="bar"><i style="width:${v / PER * 100}%"></i></div><b>${v}/${PER}</b></div>`).join('')}</div>` };
      }
    });
  },
  verbs(list, title) {
    list = list && list.length ? list : C.verbs.filter(v => LEVELS.indexOf(v.lvl) <= LEVELS.indexOf(Store.state.level));
    if (!list.length) list = C.verbs;
    const qs = Array.from({ length: 12 }, () => Q.verbQ(pick(list)));
    Engine.start({ title: title || 'Спряжение глаголов', questions: qs, xp: 6, retry: () => this.verbs(list, title) });
  },
  verbAll(v) {
    const qs = shuffle([0, 1, 2, 3, 4, 5].map(p => Q.verbQ(v, 'praes', p)).concat([Q.verbQ(v, 'praet', 0), Q.verbQ(v, 'praet', 3), Q.verbQ(v, 'perf')]));
    Engine.start({ title: v.inf, questions: qs, xp: 5, retry: () => this.verbAll(v) });
  },
  reading(id) {
    const r = DE.reading.find(x => x.id === id);
    const qs = r.questions.map((q, i) => Q.fromQuiz(q, null));
    Engine.start({ title: r.title, questions: qs, xp: 8, requeue: false, retry: () => this.reading(id),
      onFinish: res => { const st = Store.state.reading[id] || { best: 0 }; st.best = Math.max(st.best, res.pct); Store.state.reading[id] = st; Store.save(); } });
  },
  dialogue(id) {
    const d = DE.dialogues.find(x => x.id === id);
    const qs = (d.quiz || []).map(q => Q.fromQuiz(q, null));
    Engine.start({ title: d.title, questions: qs, xp: 8, requeue: false, retry: () => this.dialogue(id),
      onFinish: res => { const st = Store.state.dialogues[id] || { best: 0 }; st.best = Math.max(st.best, res.pct); Store.state.dialogues[id] = st; Store.save(); } });
  },
  // Ролевая игра: выбрать свою реплику
  roleplay(id) {
    const d = DE.dialogues.find(x => x.id === id);
    const speakers = uniq(d.lines.map(l => l.s));
    const me = speakers[1] || speakers[0];
    const others = DE.dialogues.filter(x => x !== d).flatMap(x => x.lines.map(l => l.de));
    const qs = [];
    d.lines.forEach((l, i) => {
      if (l.s !== me || i === 0) return;
      const prev = d.lines[i - 1];
      const wrong = sample(others.filter(o => o !== l.de), 2);
      const opts = shuffle([l.de].concat(wrong));
      qs.push({ kind: 'choice', label: `Вы — ${esc(me)}. Что ответить?`,
        prompt: `<div class="bubble them"><b>${esc(prev.s)}</b>${esc(prev.de)}</div><div class="q-sub">Смысл ответа: ${esc(l.ru)}</div>`,
        say: prev.de, autoplay: true, options: opts.map(o => ({ html: esc(o) })), a: opts.indexOf(l.de), sayAfter: l.de, explain: esc(l.ru) });
    });
    Engine.start({ title: 'Ролевая игра', questions: qs, xp: 6, requeue: false, retry: () => this.roleplay(id) });
  },
  phrases(id, mode) { this.run(mode, C.topicWords('ph:' + id), 'Разговорник'); }
};

/* js/screens.js */
// Экраны приложения. Каждый экран: { title, html(params), mount(el, params) }
const lvlChip = l => `<span class="lvl lvl-${l}">${l}</span>`;
const bar = (p, cls = '') => `<div class="pbar ${cls}"><i style="width:${Math.round(clamp(p, 0, 1) * 100)}%"></i></div>`;
const modeTile = (run, m, extra = '') => `<button class="mode" data-run="${run}"><span class="mode-ic">${ICON[MODES[m].ic]}</span><span class="mode-t">${MODES[m].t}</span><span class="mode-d">${extra || MODES[m].d}</span></button>`;
const greet = () => {
  const h = new Date().getHours();
  if (h < 5) return ['Gute Nacht!', 'Доброй ночи'];
  if (h < 11) return ['Guten Morgen!', 'Доброе утро'];
  if (h < 18) return ['Guten Tag!', 'Добрый день'];
  if (h < 23) return ['Guten Abend!', 'Добрый вечер'];
  return ['Gute Nacht!', 'Доброй ночи'];
};
const levelFilter = (cur, extra = []) => `<div class="chips" role="tablist">${[['all', 'Все']].concat(LEVELS.map(l => [l, l]), extra).map(([v, l]) =>
  `<button class="chip ${cur === v ? 'on' : ''}" data-filter="${v}">${l}</button>`).join('')}</div>`;

const Screens = {
  // ================= ГЛАВНАЯ =================
  home: {
    title: 'Главная',
    html() {
      const s = Store.state, t = Store.today(), [g, gr] = greet();
      const streak = Store.streak();
      const goal = s.settings.goal, pct = t.xp / goal;
      const plan = Train.smartPlan();
      const known = Ach.known();
      const wod = C.wordOfDay();
      const mist = Object.keys(s.mistakes).length;
      const nextLesson = C.grammar.find(x => x.level === s.level && !(s.grammar[x.id] && s.grammar[x.id].done)) || C.grammar.find(x => !(s.grammar[x.id] && s.grammar[x.id].done));
      const last = s.lastTopic && C.topicById[s.lastTopic];
      return `
      <section class="hero">
        <div class="hero-txt"><div class="eyebrow">${gr}</div><h1 class="display">${g}</h1>
          <button class="lvl-pick" data-go="settings">Уровень ${lvlChip(s.level)} <small>${LEVEL_NAMES[s.level]}</small></button></div>
        <div class="goal">${UI.ring(pct, 84, 8, pct >= 1 ? 'good' : '')}<div class="goal-t"><b>${t.xp}</b><small>из ${goal} XP</small></div></div>
      </section>
      <div class="stats3">
        <div class="st ${streak ? 'hot' : ''}">${ICON.flame}<b>${streak}</b><span>${plural(streak, 'день', 'дня', 'дней')} подряд</span></div>
        <div class="st">${ICON.words}<b>${known}</b><span>слов знаю</span></div>
        <div class="st">${ICON.bolt}<b>${s.xp}</b><span>всего XP</span></div>
      </div>
      <button class="cta" data-run="smart">
        <div class="cta-t"><span class="eyebrow">Ежедневная тренировка</span>
          <b>${plan.due.length || plan.fresh.length ? 'Начать занятие' : 'Повторить слова'}</b>
          <span>${plan.due.length} на повторение · ${plan.fresh.length} ${plural(plan.fresh.length, 'новое слово', 'новых слова', 'новых слов')}</span></div>
        <span class="cta-go">${ICON.play}</span>
      </button>
      ${wod ? `<section class="card wod ${artClass(wod.de)}">
        <div class="row between"><span class="eyebrow">Слово дня · ${wod.lvl}</span>
          <div class="row gap8"><button class="icon-btn" data-say="${esc(wod.de)}" aria-label="Послушать">${ICON.sound}</button>
          <button class="icon-btn ${s.fav[wod.key] ? 'faved' : ''}" data-fav="${esc(wod.key)}" aria-label="В избранное">${ICON.star}</button></div></div>
        <div class="wod-w">${deHTML(wod)}</div>
        <div class="wod-ru">${esc(wod.ru)}${wod.pl && wod.pl !== '-' ? ` <span class="muted">· ${esc(wod.pl)}</span>` : ''}</div>
        ${wod.ex ? `<div class="wod-ex"><button class="mini-audio" data-say="${esc(wod.ex)}">${ICON.sound}</button><div>${esc(wod.ex)}<div class="muted">${esc(wod.exRu)}</div></div></div>` : ''}
      </section>` : ''}
      <h2 class="sec">Тренажёры</h2>
      <div class="modes">
        ${['flash', 'article', 'listen', 'speed', 'order', 'match', 'write', 'gap'].map(m => modeTile('global:' + m, m)).join('')}
      </div>
      <h2 class="sec">Продолжить</h2>
      <div class="list">
        ${last ? `<button class="li" data-go="topic" data-id="${last.id}"><span class="li-ic emoji">${last.emoji}</span><span class="li-b"><b>${esc(last.title)}</b><small>${C.topicProgress(last.id).known} из ${last.words.length} слов</small>${bar(C.topicProgress(last.id).pct)}</span></button>` : ''}
        ${nextLesson ? `<button class="li" data-go="lesson" data-id="${nextLesson.id}"><span class="li-ic">${ICON.grammar}</span><span class="li-b"><b>${esc(nextLesson.title)}</b><small>Грамматика · ${nextLesson.level}</small></span>${lvlChip(nextLesson.level)}</button>` : ''}
        ${mist ? `<button class="li" data-run="mistakes"><span class="li-ic warn">${ICON.redo}</span><span class="li-b"><b>Работа над ошибками</b><small>${mist} ${plural(mist, 'ошибка', 'ошибки', 'ошибок')} ждут исправления</small></span></button>` : ''}
        ${!s.placement ? `<button class="li" data-run="placement"><span class="li-ic">${ICON.target}</span><span class="li-b"><b>Определить свой уровень</b><small>Адаптивный тест, 10–30 вопросов</small></span></button>` : ''}
        <button class="li" data-go="reading"><span class="li-ic">${ICON.book}</span><span class="li-b"><b>Чтение</b><small>${DE.reading.length} текстов с вопросами</small></span></button>
        <button class="li" data-go="dialogues"><span class="li-ic">${ICON.chat}</span><span class="li-b"><b>Диалоги</b><small>${DE.dialogues.length} ситуаций с озвучкой</small></span></button>
      </div>`;
    }
  },

  // ================= СЛОВА =================
  words: {
    title: 'Слова',
    html(p) {
      const f = p.filter || App.mem.wordsFilter || 'all';
      const list = f === 'all' ? C.topics : C.topics.filter(t => t.level === f);
      const favN = Object.keys(Store.state.fav).length;
      return `<h1 class="display page-h">Wortschatz</h1><p class="lead">${C.words.length} слов в ${C.topics.length} темах · уровни A1–C1</p>
      <button class="search-fake" data-go="dict">${ICON.search}<span>Поиск по словарю</span></button>
      ${levelFilter(f)}
      ${favN ? `<button class="li fav-row" data-go="topic" data-id="fav"><span class="li-ic">${ICON.star}</span><span class="li-b"><b>Избранное</b><small>${favN} ${plural(favN, 'слово', 'слова', 'слов')}</small></span></button>` : ''}
      <div class="topics">${list.map(t => {
        const pr = C.topicProgress(t.id);
        return `<button class="topic" data-go="topic" data-id="${t.id}">
          <span class="t-emoji">${t.emoji}</span>
          <span class="t-b"><b>${esc(t.title)}</b><small>${esc(t.de)}</small></span>
          <span class="t-f">${lvlChip(t.level)}<small>${pr.known}/${pr.total}</small></span>
          ${bar(pr.pct)}
        </button>`;
      }).join('')}</div>`;
    },
    mount(el) {
      $$('[data-filter]', el).forEach(b => b.onclick = () => { App.mem.wordsFilter = b.dataset.filter; App.render(); });
    }
  },

  topic: {
    title: p => p.id === 'fav' ? 'Избранное' : (C.topicById[p.id] || {}).title,
    html(p) {
      const t = p.id === 'fav' ? { id: 'fav', title: 'Избранное', de: 'Favoriten', emoji: '⭐', level: Store.state.level } : C.topicById[p.id];
      if (!t) return '<p>Тема не найдена</p>';
      const ws = C.topicWords(t.id);
      const pr = C.topicProgress(t.id);
      const nouns = ws.filter(w => w.t === 'n').length;
      const modes = ['flash', 'quiz', 'listen', 'write', 'match', 'order', 'gap', 'dictation', 'speed'];
      if (nouns >= 4) modes.splice(3, 0, 'article', 'plural');
      const sort = App.mem.topicSort || 'list';
      let shown = ws.slice();
      if (sort === 'weak') shown.sort((a, b) => Store.mastery(a.key) - Store.mastery(b.key));
      if (sort === 'az') shown.sort((a, b) => splitArticle(a.de).lemma.localeCompare(splitArticle(b.de).lemma, 'de'));
      return `<section class="topic-head">
        <span class="t-emoji big">${t.emoji}</span>
        <div><h1 class="display">${esc(t.title)}</h1><div class="muted">${esc(t.de)} · ${lvlChip(t.level)}</div></div>
      </section>
      <div class="prog-line"><span><b>${pr.known}</b> из ${pr.total} выучено</span><span>${Math.round(pr.pct * 100)}%</span></div>${bar(pr.pct, 'thick')}
      <button class="cta slim" data-run="topic:${t.id}:mix"><div class="cta-t"><b>Учить тему</b><span>Смешанная тренировка по уровню знания</span></div><span class="cta-go">${ICON.play}</span></button>
      <div class="modes">${modes.map(m => modeTile(`topic:${t.id}:${m}`, m)).join('')}</div>
      <div class="row between sec-row"><h2 class="sec">Слова · ${ws.length}</h2>
        <div class="seg sm">${[['list', 'по теме'], ['weak', 'слабые'], ['az', 'А–Я']].map(([v, l]) => `<button class="${sort === v ? 'on' : ''}" data-sort="${v}">${l}</button>`).join('')}</div></div>
      <div class="wlist">${shown.map(w => Screens.wordRow(w)).join('')}</div>`;
    },
    mount(el) { $$('[data-sort]', el).forEach(b => b.onclick = () => { App.mem.topicSort = b.dataset.sort; App.render(); }); }
  },
  wordRow(w, showTopic) {
    const fav = Store.state.fav[w.key];
    const tp = showTopic && C.topicById[w.topic];
    return `<div class="wrow ${artClass(w.de)}">
      <button class="w-say" data-say="${esc(w.de)}" aria-label="Послушать">${ICON.sound}</button>
      <button class="w-main" data-word="${esc(w.key)}"><span class="w-de">${deHTML(w)}${w.t === 'n' && w.pl && w.pl !== '-' ? `<small> · ${esc(w.pl.replace(/^die /, ''))}</small>` : ''}</span>
        <span class="w-ru">${esc(w.ru)}${tp ? ` <small class="muted">· ${esc(tp.title)}</small>` : ''}</span></button>
      ${UI.dots(Store.mastery(w.key))}
      <button class="w-fav ${fav ? 'faved' : ''}" data-fav="${esc(w.key)}" aria-label="В избранное">${ICON.star}</button>
    </div>`;
  },
  wordSheet(key) {
    const w = C.byKey[key]; if (!w) return;
    const r = Store.srsGet(key);
    const m = UI.sheet(`<div class="sheet-h ${artClass(w.de)}"><div class="f-word">${deHTML(w)}</div>
      <button class="icon-btn" data-close aria-label="Закрыть">${ICON.close}</button></div>
      <div class="f-ru">${esc(w.ru)}</div>
      ${w.t === 'n' && w.pl ? `<div class="muted">Мн. число: <b>${w.pl === '-' ? 'нет' : esc(w.pl)}</b></div>` : ''}
      ${w.ex ? `<div class="f-ex"><button class="mini-audio" data-say="${esc(w.ex)}">${ICON.sound}</button><div>${esc(w.ex)}<div class="muted">${esc(w.exRu)}</div></div></div>` : ''}
      <div class="row gap8 wrap"><button class="btn" data-say="${esc(w.de)}">${ICON.sound} Слушать</button>
      <button class="btn" data-sayslow="${esc(w.de)}">${ICON.slow} Медленно</button>
      <button class="btn ${Store.state.fav[key] ? 'faved' : ''}" data-fav="${esc(key)}">${ICON.star} Избранное</button></div>
      <div class="muted small">${r ? `Верно ${r.ok} · ошибок ${r.bad} · ${['новое', 'учу', 'знаю', 'знаю', 'знаю', 'выучено', 'выучено'][r.b]}` : 'Ещё не изучалось'}</div>`);
    App.bindCommon(m);
    Speech.say(w.de);
  },

  // ================= СЛОВАРЬ =================
  dict: {
    title: 'Словарь',
    html() {
      return `<div class="search"><span>${ICON.search}</span><input id="q" type="search" placeholder="Немецкое или русское слово" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" value="${esc(App.mem.dictQ || '')}"></div>
        <div id="dres" class="wlist"></div>`;
    },
    mount(el) {
      const inp = $('#q', el), out = $('#dres', el);
      const all = C.words.concat(DE.phrases.flatMap(p => p.words));
      const run = () => {
        const q = norm(inp.value); App.mem.dictQ = inp.value;
        if (q.length < 2) { out.innerHTML = `<p class="muted pad">Введите хотя бы 2 буквы. В словаре ${all.length} слов и фраз.</p>`; return; }
        const qd = deUmlaut(q);
        const score = w => {
          const de = norm(w.de), lem = norm(splitArticle(w.de).lemma), ru = norm(w.ru);
          if (lem === q || de === q || ru === q) return 0;
          if (lem.startsWith(q) || deUmlaut(lem).startsWith(qd)) return 1;
          if (ru.split(/[,;]\s*/).some(x => x.startsWith(q))) return 1.5;
          if (de.includes(q) || deUmlaut(de).includes(qd)) return 2;
          if (ru.includes(q)) return 3;
          return 9;
        };
        const res = all.map(w => [score(w), w]).filter(x => x[0] < 9).sort((a, b) => a[0] - b[0]).slice(0, 60);
        const verbs = C.verbs.filter(v => norm(v.inf).includes(q) || norm(v.ru).includes(q)).slice(0, 6);
        out.innerHTML = (verbs.length ? `<div class="vchips">${verbs.map(v => `<button class="chip" data-go="verb" data-id="${esc(v.inf)}">${ICON.verb} ${esc(v.inf)}</button>`).join('')}</div>` : '') +
          (res.length ? res.map(([, w]) => Screens.wordRow(w, true)).join('') : `<p class="muted pad">Ничего не найдено</p>`);
        App.bindCommon(out);
      };
      inp.oninput = run; run();
      setTimeout(() => inp.focus(), 100);
    }
  },

  // ================= ГРАММАТИКА =================
  grammar: {
    title: 'Грамматика',
    html(p) {
      const f = App.mem.gramFilter || 'all';
      const st = Store.state.grammar;
      const done = C.grammar.filter(g => st[g.id] && st[g.id].done).length;
      return `<h1 class="display page-h">Grammatik</h1><p class="lead">${C.grammar.length} уроков с объяснениями и упражнениями · пройдено ${done}</p>
      ${levelFilter(f)}
      ${LEVELS.filter(l => f === 'all' || f === l).map(l => {
        const ls = C.grammar.filter(g => g.level === l);
        if (!ls.length) return '';
        return `<h2 class="sec">${lvlChip(l)} ${LEVEL_NAMES[l]}</h2><div class="list">${ls.map((g, i) => {
          const s = st[g.id];
          return `<button class="li" data-go="lesson" data-id="${g.id}"><span class="li-num ${s && s.done ? 'done' : ''}">${s && s.done ? ICON.check : i + 1}</span>
            <span class="li-b"><b>${esc(g.title)}</b><small>${esc(g.summary)}</small></span>${s ? `<span class="pct">${s.best}%</span>` : ''}</button>`;
        }).join('')}</div>`;
      }).join('')}`;
    },
    mount(el) { $$('[data-filter]', el).forEach(b => b.onclick = () => { App.mem.gramFilter = b.dataset.filter; App.render(); }); }
  },
  lesson: {
    title: p => (C.grammar.find(g => g.id === p.id) || {}).title,
    html(p) {
      const i = C.grammar.findIndex(g => g.id === p.id), g = C.grammar[i];
      if (!g) return '<p>Урок не найден</p>';
      const st = Store.state.grammar[g.id];
      const prev = C.grammar[i - 1], next = C.grammar[i + 1];
      return `<article class="lesson">
        <div class="eyebrow">${lvlChip(g.level)} Урок грамматики ${st && st.done ? '· пройден ✓' : ''}</div>
        <h1 class="display">${esc(g.title)}</h1>
        <p class="lead">${esc(g.summary)}</p>
        <div class="lesson-body">${g.content}</div>
      </article>
      <button class="cta" data-run="grammar:${g.id}"><div class="cta-t"><span class="eyebrow">Практика · ${g.exercises.length} заданий</span><b>${st ? 'Повторить упражнения' : 'Закрепить на практике'}</b>${st ? `<span>Лучший результат: ${st.best}%</span>` : ''}</div><span class="cta-go">${ICON.play}</span></button>
      <div class="row between gap8 pager">
        ${prev ? `<button class="btn ghost" data-go="lesson" data-id="${prev.id}" data-replace="1">${ICON.back} ${esc(prev.title.split('(')[0].trim())}</button>` : '<span></span>'}
        ${next ? `<button class="btn ghost right" data-go="lesson" data-id="${next.id}" data-replace="1">${esc(next.title.split('(')[0].trim())} <span class="flip">${ICON.back}</span></button>` : ''}
      </div>`;
    },
    mount(el) {
      // немецкие примеры в уроке можно послушать по нажатию
      $$('.lesson-body .ex, .lesson-body td, .lesson-body b', el).forEach(n => {
        const txt = n.classList.contains('ex') ? (n.querySelector('b') || n).textContent : n.textContent;
        if (/[äöüßÄÖÜ]|\b(der|die|das|ich|du|er|sie|wir|ihr|ist|sind|habe|hat|nicht|ein|eine|den|dem|des)\b/i.test(txt) && !/[а-яё]/i.test(txt)) {
          n.classList.add('speakable'); n.onclick = e => { e.stopPropagation(); Speech.say(txt.replace(/[—–].*$/, '')); };
        }
      });
    }
  },

  // ================= ТЕСТЫ =================
  tests: {
    title: 'Тесты',
    html() {
      const s = Store.state;
      const mist = Object.keys(s.mistakes).length;
      return `<h1 class="display page-h">Prüfungen</h1><p class="lead">Проверьте себя: тесты по уровням в формате Goethe / telc</p>
      <button class="cta" data-run="placement"><div class="cta-t"><span class="eyebrow">Einstufungstest</span><b>Тест на определение уровня</b>
        <span>${s.placement ? `Последний результат: уровень ${s.placement.solid}, рекомендован ${s.placement.level}` : 'Адаптивный: от A1 до C1, пока получается'}</span></div><span class="cta-go">${ICON.target}</span></button>
      <h2 class="sec">По уровням</h2>
      <div class="lvl-grid">${LEVELS.map(l => {
        const t = s.tests[l]; const n = C.tests.filter(x => x.lvl === l).length;
        return `<div class="lvl-card ${t && t.passed ? 'passed' : ''}">
          <div class="row between"><span class="lvl-big">${l}</span>${t && t.passed ? `<span class="badge ok">${ICON.check} сдан</span>` : ''}</div>
          <small>${LEVEL_NAMES[l]} · ${n} вопросов в банке</small>
          ${t ? `<div class="muted small">Лучший: ${t.best}%</div>${bar(t.best / 100)}` : ''}
          <div class="row gap8"><button class="btn sm primary" data-run="test:${l}" ${n < 5 ? 'disabled' : ''}>Тест · 20</button>
          <button class="btn sm" data-run="exam:${l}" ${n < 10 ? 'disabled' : ''}>Экзамен</button></div></div>`;
      }).join('')}</div>
      <p class="muted small pad-x">Тест — 20 вопросов с разбором после каждого ответа. Экзамен — 30 вопросов за 20 минут, без подсказок, разбор в конце. Зачёт от 70%.</p>
      <h2 class="sec">Ещё проверки</h2>
      <div class="list">
        <button class="li" data-run="mistakes"><span class="li-ic warn">${ICON.redo}</span><span class="li-b"><b>Работа над ошибками</b><small>${mist ? `${mist} ${plural(mist, 'вопрос', 'вопроса', 'вопросов')} для повторения` : 'Ошибок пока нет'}</small></span></button>
        <button class="li" data-run="verbs"><span class="li-ic">${ICON.verb}</span><span class="li-b"><b>Спряжение глаголов</b><small>Präsens, Präteritum, Perfekt</small></span></button>
        <button class="li" data-run="global:quiz"><span class="li-ic">${ICON.target}</span><span class="li-b"><b>Тест по словам</b><small>Слова вашего уровня и изучаемые</small></span></button>
        <button class="li" data-run="global:article"><span class="li-ic">${ICON.layers}</span><span class="li-b"><b>Артикли der · die · das</b><small>Самая частая ошибка — тренируйте отдельно</small></span></button>
        <button class="li" data-run="global:speed"><span class="li-ic">${ICON.timer}</span><span class="li-b"><b>Скорость · 60 секунд</b><small>Рекорд: ${s.best.speed || 0}</small></span></button>
      </div>`;
    }
  },

  // ================= ЕЩЁ =================
  more: {
    title: 'Ещё',
    html() {
      const item = (go, ic, t, d) => `<button class="li" data-go="${go}"><span class="li-ic">${ICON[ic]}</span><span class="li-b"><b>${t}</b><small>${d}</small></span></button>`;
      const achN = Object.keys(Store.state.ach).length;
      return `<h1 class="display page-h">Mehr</h1>
      <h2 class="sec">Практика</h2><div class="list">
        ${item('reading', 'book', 'Чтение', `${DE.reading.length} текстов A1–C1 с вопросами и озвучкой`)}
        ${item('dialogues', 'chat', 'Диалоги', `${DE.dialogues.length} живых диалогов и ролевые игры`)}
        ${item('phrases', 'phrase', 'Разговорник', `${DE.phrases.length} ситуаций, ${DE.phrases.reduce((a, p) => a + p.items.length, 0)} фраз`)}
        ${item('verbs', 'verb', 'Глаголы', `${C.verbs.length} таблиц спряжения`)}
        ${item('dict', 'search', 'Словарь', 'Поиск по всем словам')}
      </div>
      <h2 class="sec">Прогресс</h2><div class="list">
        ${item('stats', 'chart', 'Статистика', 'Активность, точность, слова по уровням')}
        ${item('achievements', 'trophy', 'Достижения', `${achN} из ${ACH.length} получено`)}
        ${item('settings', 'gear', 'Настройки', 'Цель, озвучка, тема, резервная копия')}
      </div>`;
    }
  },

  // ================= ГЛАГОЛЫ =================
  verbs: {
    title: 'Глаголы',
    html() {
      const f = App.mem.verbFilter || 'all';
      return `<h1 class="display page-h">Verben</h1>
      <div class="search"><span>${ICON.search}</span><input id="vq" type="search" placeholder="Найти глагол" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(App.mem.verbQ || '')}"></div>
      ${levelFilter(f)}
      <button class="cta slim" data-run="verbs:${f}"><div class="cta-t"><b>Тренировать спряжение</b><span>${f === 'all' ? 'Глаголы до вашего уровня' : 'Глаголы уровня ' + f}</span></div><span class="cta-go">${ICON.play}</span></button>
      <div id="vlist" class="list"></div>`;
    },
    mount(el) {
      const f = App.mem.verbFilter || 'all';
      $$('[data-filter]', el).forEach(b => b.onclick = () => { App.mem.verbFilter = b.dataset.filter; App.render(); });
      const inp = $('#vq', el), out = $('#vlist', el);
      const TYPES = { weak: 'слабый', strong: 'сильный', mixed: 'смешанный', modal: 'модальный', irregular: 'неправильный' };
      const run = () => {
        const q = norm(inp.value); App.mem.verbQ = inp.value;
        const ls = C.verbs.filter(v => (f === 'all' || v.lvl === f) && (!q || norm(v.inf).includes(q) || norm(v.ru).includes(q)));
        out.innerHTML = ls.map(v => `<button class="li" data-go="verb" data-id="${esc(v.inf)}"><span class="li-b"><b>${esc(v.inf)}</b><small>${esc(v.ru)} · ${TYPES[v.type] || ''}${v.sep ? ', отделяемый' : ''}</small></span>
          <span class="v-perf muted">${esc(v.perf)}</span>${lvlChip(v.lvl)}</button>`).join('') || '<p class="muted pad">Не найдено</p>';
      };
      inp.oninput = run; run();
    }
  },
  verb: {
    title: p => p.id,
    html(p) {
      const v = C.verbByInf[p.id]; if (!v) return '<p>Не найдено</p>';
      const pr = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];
      const sp = ['ich', 'du', 'er', 'wir', 'ihr', 'sie'];
      return `<section class="topic-head"><div><h1 class="display">${esc(v.inf)}</h1><div class="muted">${esc(v.ru)} · ${lvlChip(v.lvl)}</div></div>
        <button class="btn round" data-say="${esc(v.inf)}">${ICON.sound}</button></section>
        <div class="table-wrap"><table class="conj"><thead><tr><th></th><th>Präsens</th><th>Präteritum</th></tr></thead><tbody>
        ${pr.map((x, i) => `<tr><td class="muted">${x}</td><td data-say="${esc(sp[i] + ' ' + v.praes[i])}"><b>${esc(v.praes[i])}</b></td><td data-say="${esc(sp[i] + ' ' + v.praet[i])}">${esc(v.praet[i])}</td></tr>`).join('')}
        </tbody></table></div>
        <div class="kv"><div data-say="er ${esc(v.perf)}"><span>Perfekt</span><b>er ${esc(v.perf)}</b></div>
        ${v.imp ? `<div data-say="${esc(v.imp)}"><span>Imperativ</span><b>${esc(v.imp)}</b></div>` : ''}</div>
        ${v.ex ? `<div class="card f-ex"><button class="mini-audio" data-say="${esc(v.ex)}">${ICON.sound}</button><div>${esc(v.ex)}<div class="muted">${esc(v.exRu || '')}</div></div></div>` : ''}
        <button class="cta slim" data-run="verb:${esc(v.inf)}"><div class="cta-t"><b>Тренировать этот глагол</b><span>9 заданий на все формы</span></div><span class="cta-go">${ICON.play}</span></button>
        <p class="muted small pad-x">Нажмите на форму, чтобы услышать её.</p>`;
    }
  },

  // ================= ЧТЕНИЕ =================
  reading: {
    title: 'Чтение',
    html() {
      const f = App.mem.readFilter || 'all';
      const ls = DE.reading.filter(r => f === 'all' || r.lvl === f).sort((a, b) => LEVELS.indexOf(a.lvl) - LEVELS.indexOf(b.lvl));
      return `<h1 class="display page-h">Lesen</h1>${levelFilter(f)}
      <div class="list">${ls.map(r => { const st = Store.state.reading[r.id];
        return `<button class="li" data-go="text" data-id="${r.id}"><span class="li-ic emoji">${r.emoji || '📄'}</span><span class="li-b"><b>${esc(r.title)}</b><small>${esc(r.ru)} · ${r.text.split(/\s+/).length} слов</small></span>
        ${st ? `<span class="pct">${st.best}%</span>` : ''}${lvlChip(r.lvl)}</button>`; }).join('')}</div>`;
    },
    mount(el) { $$('[data-filter]', el).forEach(b => b.onclick = () => { App.mem.readFilter = b.dataset.filter; App.render(); }); }
  },
  text: {
    title: p => (DE.reading.find(r => r.id === p.id) || {}).title,
    html(p) {
      const r = DE.reading.find(x => x.id === p.id); if (!r) return '';
      const paras = r.text.split(/\n\s*\n/).map(par => `<p>${par.split(/(\s+)/).map(tok => /\s+/.test(tok) ? tok : `<span class="tw">${esc(tok)}</span>`).join('')}</p>`).join('');
      return `<article class="reader">
        <div class="eyebrow">${lvlChip(r.lvl)} ${esc(r.ru)}</div>
        <h1 class="display">${esc(r.title)}</h1>
        <div class="row gap8"><button class="btn" id="readall">${ICON.play} Слушать текст</button><button class="btn ghost" id="readstop">${ICON.stop} Стоп</button></div>
        <div class="reader-body">${paras}</div>
        <p class="muted small">Нажмите на слово, чтобы услышать и увидеть перевод.</p>
        ${r.glossary && r.glossary.length ? `<h2 class="sec">Словарик</h2><div class="gloss">${r.glossary.map(g => `<button data-say="${esc(g.de)}"><b>${esc(g.de)}</b><span>${esc(g.ru)}</span></button>`).join('')}</div>` : ''}
      </article>
      <button class="cta" data-run="reading:${r.id}"><div class="cta-t"><span class="eyebrow">${r.questions.length} вопросов</span><b>Проверить понимание</b></div><span class="cta-go">${ICON.play}</span></button>`;
    },
    mount(el, p) {
      const r = DE.reading.find(x => x.id === p.id);
      let stop = false;
      $('#readall', el).onclick = async () => {
        stop = false;
        const ps = $$('.reader-body p', el);
        for (const n of ps) {
          if (stop) break;
          n.classList.add('reading');
          const sents = n.textContent.match(/[^.!?]+[.!?]*["“”]?/g) || [n.textContent];
          for (const s of sents) { if (stop) break; await Speech.say(s, { queue: true }); }
          n.classList.remove('reading');
        }
      };
      $('#readstop', el).onclick = () => { stop = true; Speech.stop(); $$('.reading', el).forEach(n => n.classList.remove('reading')); };
      $('.reader-body', el).addEventListener('click', e => {
        const t = e.target.closest('.tw'); if (!t) return;
        const word = t.textContent.replace(/[.,!?;:„“"()«»—–]/g, '');
        Speech.say(word);
        $$('.tw.on', el).forEach(x => x.classList.remove('on')); t.classList.add('on');
        const hit = C.lookup(word) || (r.glossary || []).find(g => g.de.toLowerCase() === word.toLowerCase());
        UI.toast(`<b>${esc(word)}</b>${hit ? ` — ${esc(hit.ru)}${hit.de && norm(hit.de) !== norm(word) ? ` <small>(${esc(hit.de)})</small>` : ''}` : ' <small>· нет в словаре</small>'}`, 2200);
      });
      App.onLeave = () => { stop = true; Speech.stop(); };
    }
  },

  // ================= ДИАЛОГИ =================
  dialogues: {
    title: 'Диалоги',
    html() {
      const f = App.mem.dialFilter || 'all';
      const ls = DE.dialogues.filter(d => f === 'all' || d.lvl === f).sort((a, b) => LEVELS.indexOf(a.lvl) - LEVELS.indexOf(b.lvl));
      return `<h1 class="display page-h">Dialoge</h1>${levelFilter(f)}
      <div class="list">${ls.map(d => { const st = Store.state.dialogues[d.id];
        return `<button class="li" data-go="dialogue" data-id="${d.id}"><span class="li-ic emoji">${d.emoji || '💬'}</span><span class="li-b"><b>${esc(d.title)}</b><small>${esc(d.context || '')}</small></span>
        ${st ? `<span class="pct">${st.best}%</span>` : ''}${lvlChip(d.lvl)}</button>`; }).join('')}</div>`;
    },
    mount(el) { $$('[data-filter]', el).forEach(b => b.onclick = () => { App.mem.dialFilter = b.dataset.filter; App.render(); }); }
  },
  dialogue: {
    title: p => (DE.dialogues.find(d => d.id === p.id) || {}).title,
    html(p) {
      const d = DE.dialogues.find(x => x.id === p.id); if (!d) return '';
      const sp = uniq(d.lines.map(l => l.s));
      const showRu = Store.state.settings.showRu;
      return `<section class="topic-head"><span class="t-emoji big">${d.emoji || '💬'}</span><div><h1 class="display">${esc(d.title)}</h1><div class="muted">${lvlChip(d.lvl)} ${esc(d.context || '')}</div></div></section>
      <div class="row gap8 wrap"><button class="btn sm" id="playall">${ICON.play} Слушать</button><button class="btn sm ghost" id="stopall" aria-label="Стоп">${ICON.stop}</button>
        <button class="btn sm ghost" id="toggleRu">${ICON.eye} ${showRu ? 'Скрыть перевод' : 'Показать перевод'}</button></div>
      <div class="chat ${showRu ? '' : 'no-ru'}">${d.lines.map((l, i) => `<button class="bubble ${sp.indexOf(l.s) % 2 ? 'me' : 'them'}" data-line="${i}">
        <b>${esc(l.s)}</b>${esc(l.de)}<span class="b-ru">${esc(l.ru)}</span></button>`).join('')}</div>
      <div class="row gap8 stack-sm">
        ${d.quiz && d.quiz.length ? `<button class="cta grow" data-run="dialogue:${d.id}"><div class="cta-t"><b>Вопросы</b><span>${d.quiz.length} на понимание</span></div><span class="cta-go">${ICON.play}</span></button>` : ''}
        <button class="cta grow alt" data-run="roleplay:${d.id}"><div class="cta-t"><b>Ролевая игра</b><span>Говорите за «${esc(sp[1] || sp[0])}»</span></div><span class="cta-go">${ICON.chat}</span></button>
      </div>`;
    },
    mount(el, p) {
      const d = DE.dialogues.find(x => x.id === p.id);
      const sp = uniq(d.lines.map(l => l.s));
      let stop = false;
      const pitch = s => [1, 0.8, 1.2, 0.95][sp.indexOf(s) % 4];
      $$('.bubble', el).forEach(b => b.onclick = () => { const l = d.lines[+b.dataset.line]; Speech.say(l.de, { pitch: pitch(l.s) }); });
      $('#playall', el).onclick = async () => {
        stop = false;
        for (const [i, l] of d.lines.entries()) {
          if (stop) break;
          const b = $(`[data-line="${i}"]`, el); b.classList.add('reading'); b.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          await Speech.say(l.de, { pitch: pitch(l.s), queue: true });
          b.classList.remove('reading');
        }
      };
      $('#stopall', el).onclick = () => { stop = true; Speech.stop(); $$('.reading', el).forEach(n => n.classList.remove('reading')); };
      $('#toggleRu', el).onclick = () => { Store.state.settings.showRu = !Store.state.settings.showRu; Store.save(); App.render(); };
      App.onLeave = () => { stop = true; Speech.stop(); };
    }
  },

  // ================= РАЗГОВОРНИК =================
  phrases: {
    title: 'Разговорник',
    html() {
      const ls = DE.phrases.slice().sort((a, b) => LEVELS.indexOf(a.lvl) - LEVELS.indexOf(b.lvl));
      return `<h1 class="display page-h">Sprachführer</h1><p class="lead">Готовые фразы для реальных ситуаций</p>
      <div class="topics">${ls.map(p => { const pr = C.topicProgress('ph:' + p.id);
        return `<button class="topic" data-go="phraseset" data-id="${p.id}"><span class="t-emoji">${p.emoji || '💬'}</span>
        <span class="t-b"><b>${esc(p.title)}</b><small>${p.items.length} фраз</small></span><span class="t-f">${lvlChip(p.lvl)}<small>${pr.known}/${pr.total}</small></span>${bar(pr.pct)}</button>`; }).join('')}</div>`;
    }
  },
  phraseset: {
    title: p => (DE.phrases.find(x => x.id === p.id) || {}).title,
    html(p) {
      const ph = DE.phrases.find(x => x.id === p.id); if (!ph) return '';
      return `<section class="topic-head"><span class="t-emoji big">${ph.emoji || '💬'}</span><div><h1 class="display">${esc(ph.title)}</h1><div class="muted">${lvlChip(ph.lvl)} ${ph.items.length} фраз</div></div></section>
      <div class="modes">${['flash', 'quiz', 'listen', 'order'].map(m => modeTile(`phr:${ph.id}:${m}`, m)).join('')}</div>
      <div class="wlist">${ph.words.map(w => Screens.wordRow(w)).join('')}</div>`;
    }
  },

  // ================= СТАТИСТИКА =================
  stats: {
    title: 'Статистика',
    html() {
      const s = Store.state;
      const acc = s.stats.answers ? Math.round(s.stats.correct / s.stats.answers * 100) : 0;
      // 14 дней XP
      const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(Date.now() - (13 - i) * DAY); const k = dayKey(d); return { k, d, xp: (s.days[k] || {}).xp || 0 }; });
      const max = Math.max(s.settings.goal, ...days.map(d => d.xp));
      const wd = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      const goalY = 100 - s.settings.goal / max * 100;
      // тепловая карта 18 недель
      const weeks = 18, start = new Date(); start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - (weeks - 1) * 7);
      const cells = [];
      for (let i = 0; i < weeks * 7; i++) { const d = new Date(start.getTime() + i * DAY); const k = dayKey(d); const xp = (s.days[k] || {}).xp || 0; cells.push({ k, xp, future: d > new Date() }); }
      const lvlOf = xp => xp <= 0 ? 0 : xp < s.settings.goal * 0.5 ? 1 : xp < s.settings.goal ? 2 : xp < s.settings.goal * 2 ? 3 : 4;
      const byLvl = LEVELS.map(l => { const ws = C.words.filter(w => w.lvl === l); const k = ws.filter(w => Store.isKnown(w.key)).length; return { l, n: ws.length, k }; });
      const boxes = [0, 0, 0, 0]; Object.values(s.srs).forEach(r => boxes[r.b >= 5 ? 3 : r.b >= 2 ? 2 : r.b >= 1 ? 1 : 0]++);
      return `<h1 class="display page-h">Statistik</h1>
      <div class="tiles">
        <div class="tile"><b>${s.xp}</b><span>XP всего</span></div>
        <div class="tile"><b>${Store.streak()}</b><span>серия · рекорд ${Store.bestStreak()}</span></div>
        <div class="tile"><b>${Ach.known()}</b><span>слов знаю</span></div>
        <div class="tile"><b>${acc}%</b><span>точность · ${s.stats.answers} ответов</span></div>
      </div>
      <h2 class="sec">XP за 14 дней</h2>
      <div class="card chart"><div class="bars" role="img" aria-label="XP по дням">
        ${goalY < 85 ? `<div class="goal-line" style="top:${goalY}%"><span>цель ${s.settings.goal}</span></div>` : ''}
        ${days.map(d => `<button class="bcol" data-tip="${d.d.getDate()}.${d.d.getMonth() + 1}: ${d.xp} XP"><i style="height:${d.xp / max * 100}%" class="${d.xp >= s.settings.goal ? 'met' : ''}"></i><span>${wd[d.d.getDay()]}</span></button>`).join('')}
      </div><div class="chart-tip muted small" id="tip">Нажмите на столбик, чтобы увидеть значение</div></div>
      <h2 class="sec">Активность</h2>
      <div class="card"><div class="heat-wrap"><div class="heat">${cells.map(c => `<i class="h${c.future ? 'f' : lvlOf(c.xp)}" title="${c.k}: ${c.xp} XP"></i>`).join('')}</div></div>
        <div class="heat-leg muted small">меньше <i class="h0"></i><i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i> больше</div></div>
      <h2 class="sec">Слова по уровням</h2>
      <div class="card cats">${byLvl.map(x => `<div class="cat"><span>${lvlChip(x.l)}</span>${bar(x.n ? x.k / x.n : 0)}<b>${x.k}/${x.n}</b></div>`).join('')}</div>
      <h2 class="sec">Интервальное повторение</h2>
      <div class="tiles four">${['новые', 'учу', 'знаю', 'выучено'].map((l, i) => `<div class="tile"><b>${i === 0 ? C.words.length - Object.keys(s.srs).filter(k => k[0] === 'w').length : boxes[i]}</b><span>${l}</span></div>`).join('')}</div>`;
    },
    mount(el) { $$('.bcol', el).forEach(b => b.onclick = () => { $('#tip', el).textContent = b.dataset.tip; $$('.bcol.on', el).forEach(x => x.classList.remove('on')); b.classList.add('on'); }); }
  },
  achievements: {
    title: 'Достижения',
    html() {
      const s = Store.state;
      return `<h1 class="display page-h">Erfolge</h1><p class="lead">${Object.keys(s.ach).length} из ${ACH.length}</p>
      <div class="ach">${ACH.map(a => `<div class="ach-i ${s.ach[a.id] ? 'got' : ''}"><span class="ach-ic">${a.ic}</span><b>${a.t}</b><small>${a.d}</small>
        ${s.ach[a.id] ? `<small class="muted">${new Date(s.ach[a.id]).toLocaleDateString('ru-RU')}</small>` : ''}</div>`).join('')}</div>`;
    }
  },

  // ================= НАСТРОЙКИ =================
  settings: {
    title: 'Настройки',
    html() {
      const st = Store.state.settings, s = Store.state;
      const seg = (name, cur, opts) => `<div class="seg" data-set="${name}">${opts.map(([v, l]) => `<button class="${String(cur) === String(v) ? 'on' : ''}" data-v="${v}">${l}</button>`).join('')}</div>`;
      const voices = Speech.voices;
      const c = C.counts();
      return `<h1 class="display page-h">Einstellungen</h1>
      <div class="form">
        <label class="f-row"><span>Мой уровень</span>${seg('level', s.level, LEVELS.map(l => [l, l]))}</label>
        <label class="f-row"><span>Цель на день</span>${seg('goal', st.goal, [[20, '20'], [50, '50'], [100, '100'], [200, '200']])}<small class="muted">XP в день</small></label>
        <label class="f-row"><span>Новых слов в день</span>${seg('newPerDay', st.newPerDay, [[5, '5'], [10, '10'], [15, '15'], [25, '25']])}</label>
        <label class="f-row"><span>Тема</span>${seg('theme', st.theme, [['system', 'Авто'], ['light', 'Светлая'], ['dark', 'Тёмная']])}</label>
        <div class="f-row"><span>Скорость речи · <b id="rateV">${st.rate.toFixed(2)}</b></span><input type="range" id="rate" min="0.5" max="1.2" step="0.05" value="${st.rate}"></div>
        <div class="f-row"><span>Голос</span><select id="voice"><option value="">Автоматически</option>${voices.map(v => `<option value="${esc(v.voiceURI)}" ${st.voice === v.voiceURI ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</select>
          <button class="btn sm" data-say="Hallo! Ich helfe dir, Deutsch zu lernen.">${ICON.sound} Проверить</button>
          ${!voices.length ? '<small class="muted">Немецкие голоса не найдены. На iPhone: Настройки → Универсальный доступ → Устный контент → Голоса → Немецкий.</small>' : ''}</div>
        <label class="f-row sw"><span>Автоматически озвучивать</span><input type="checkbox" id="autoplay" ${st.autoplay ? 'checked' : ''}></label>
        <label class="f-row sw"><span>Звуки ответов</span><input type="checkbox" id="sound" ${st.sound ? 'checked' : ''}></label>
      </div>
      <h2 class="sec">Резервная копия</h2>
      <div class="card">
        <p class="small muted">Прогресс хранится только на этом устройстве. Скопируйте код, чтобы перенести его или сохранить.</p>
        <div class="row gap8 wrap"><button class="btn" id="exp">${ICON.copy} Скопировать прогресс</button><button class="btn" id="imp">Вставить прогресс</button></div>
        <textarea id="bk" rows="3" hidden placeholder="Вставьте сюда скопированный код прогресса"></textarea>
        <button class="btn primary" id="impgo" hidden>Загрузить</button>
      </div>
      <h2 class="sec">О приложении</h2>
      <div class="card small"><p><b>Deutsch Tag für Tag</b> — ${c.words} слов в ${c.topics} темах, ${c.grammar} уроков грамматики, ${c.tests} тестовых вопросов, ${c.verbs} глаголов, ${c.reading} текстов, ${c.dialogues} диалогов, ${c.phrases} разделов разговорника.</p>
        <p class="muted">Работает без интернета после первого открытия. Совет: в Safari нажмите «Поделиться» → «На экран „Домой“».</p>
        <button class="btn danger" id="reset">Сбросить весь прогресс</button></div>`;
    },
    mount(el) {
      const s = Store.state, st = s.settings;
      $$('[data-set]', el).forEach(g => g.addEventListener('click', e => {
        const b = e.target.closest('[data-v]'); if (!b) return;
        e.preventDefault();
        const k = g.dataset.set, v = b.dataset.v;
        if (k === 'level') s.level = v; else st[k] = isNaN(+v) ? v : +v;
        Store.save(); if (k === 'theme') App.applyTheme(); App.render();
      }));
      $('#rate', el).oninput = e => { st.rate = +e.target.value; $('#rateV', el).textContent = st.rate.toFixed(2); Store.save(); };
      $('#rate', el).onchange = () => Speech.say('Guten Tag!');
      $('#voice', el).onchange = e => { st.voice = e.target.value; Store.save(); Speech.say('Guten Tag!'); };
      $('#autoplay', el).onchange = e => { st.autoplay = e.target.checked; Store.save(); };
      $('#sound', el).onchange = e => { st.sound = e.target.checked; Store.save(); };
      $('#exp', el).onclick = () => {
        const data = Store.export();
        const ta = $('#bk', el);
        const fallback = () => { ta.hidden = false; ta.value = data; ta.select(); UI.toast('Выделите и скопируйте текст'); };
        try { navigator.clipboard.writeText(data).then(() => UI.toast('Прогресс скопирован')).catch(fallback); } catch (e) { fallback(); }
      };
      $('#imp', el).onclick = () => { const ta = $('#bk', el); ta.hidden = false; ta.value = ''; $('#impgo', el).hidden = false; ta.focus(); };
      $('#impgo', el).onclick = async () => {
        if (!(await UI.confirm('Загрузить прогресс?', 'Текущий прогресс на этом устройстве будет заменён.', 'Загрузить'))) return;
        try { Store.import($('#bk', el).value.trim()); UI.toast('Прогресс загружен'); App.applyTheme(); App.render(); } catch (e) { UI.toast('Не получилось: ' + esc(e.message)); }
      };
      $('#reset', el).onclick = async () => {
        if (!(await UI.confirm('Сбросить прогресс?', 'Все слова, результаты тестов и достижения будут удалены. Это нельзя отменить.', 'Сбросить', true))) return;
        Store.reset(); App.applyTheme(); App.tab('home'); UI.toast('Прогресс сброшен');
      };
    }
  }
};

/* js/app.js */
// Навигация, вкладки и общий обработчик действий
const TABS = [['home', 'Главная', 'home'], ['words', 'Слова', 'words'], ['grammar', 'Грамматика', 'grammar'], ['tests', 'Тесты', 'tests'], ['more', 'Ещё', 'more']];
const App = {
  stack: [], cur: 'home', mem: {}, onLeave: null,
  init() {
    Store.load();
    C.init();
    Speech.init();
    this.applyTheme();
    $('#tabs').innerHTML = TABS.map(([id, l, ic]) => `<button data-tab="${id}" aria-label="${l}">${ICON[ic]}<span>${l}</span></button>`).join('');
    $('#tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) this.tab(b.dataset.tab); });
    $('#back').innerHTML = ICON.back;
    $('#back').onclick = () => this.back();
    document.addEventListener('click', e => this.handle(e));
    document.addEventListener('keydown', e => {
      const s = Engine.s; if (!s) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const n = +e.key;
      if (n >= 1 && n <= 4 && s.cur && s.cur.kind === 'choice' && !s.locked) { const b = $$('.opt')[n - 1]; if (b) b.click(); }
      if (e.key === 'Enter' && $('#next')) { e.preventDefault(); $('#next').click(); }
    });
    matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => this.applyTheme());
    const start = (location.hash || '').replace('#', '');
    this.tab(TABS.some(t => t[0] === start) ? start : 'home');
    setTimeout(() => Ach.check(), 1200);
  },
  applyTheme() {
    const t = Store.state.settings.theme;
    if (t === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
    const dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    const m = $('meta[name="theme-color"]'); if (m) m.content = dark ? '#101218' : '#f2f3f6';
  },
  tab(id) {
    this.stack = [{ name: id, p: {} }];
    this.render();
  },
  go(name, p = {}, replace) {
    if (replace) this.stack[this.stack.length - 1] = { name, p };
    else this.stack.push({ name, p });
    this.render();
    window.scrollTo(0, 0);
  },
  back() { if (this.stack.length > 1) { this.stack.pop(); this.render(true); } },
  refresh() { this.render(true); },
  render(keepScroll) {
    if (this.onLeave) { try { this.onLeave(); } catch (e) { } this.onLeave = null; }
    const top = this.stack[this.stack.length - 1];
    const scr = Screens[top.name];
    const y = window.scrollY;
    const view = $('#view');
    view.innerHTML = scr.html(top.p);
    view.className = 'view scr-' + top.name;
    const title = typeof scr.title === 'function' ? scr.title(top.p) : scr.title;
    $('#ttl').textContent = title || '';
    const deep = this.stack.length > 1;
    $('#back').hidden = !deep;
    $('#top').classList.toggle('deep', deep);
    const root = this.stack[0].name;
    $$('#tabs [data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === root));
    if (scr.mount) scr.mount(view, top.p);
    this.bindCommon(view);
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  },
  bindCommon(root) {
    $$('[data-fav]', root).forEach(b => b.onclick = e => {
      e.stopPropagation();
      const k = b.dataset.fav, f = Store.state.fav;
      if (f[k]) delete f[k]; else f[k] = 1;
      Store.save();
      $$(`[data-fav="${CSS.escape(k)}"]`).forEach(x => x.classList.toggle('faved', !!f[k]));
      UI.toast(f[k] ? 'Добавлено в избранное' : 'Убрано из избранного', 1400);
    });
  },
  handle(e) {
    const say = e.target.closest('[data-say]');
    if (say && !say.closest('#ses-body')) { e.stopPropagation(); Speech.say(say.dataset.say); return; }
    const slow = e.target.closest('[data-sayslow]');
    if (slow) { Speech.say(slow.dataset.sayslow, { slow: true }); return; }
    const word = e.target.closest('[data-word]');
    if (word) { Screens.wordSheet(word.dataset.word); return; }
    const go = e.target.closest('[data-go]');
    if (go) { const m = go.closest('.modal'); if (m) m.remove(); this.go(go.dataset.go, { id: go.dataset.id }, !!go.dataset.replace); return; }
    const run = e.target.closest('[data-run]');
    if (run) { this.run(run.dataset.run); return; }
  },
  run(cmd) {
    const [a, b, c] = cmd.split(':');
    switch (a) {
      case 'smart': return Train.smart();
      case 'global': return Train.global(b);
      case 'topic': return Train.topic(b, c);
      case 'phr': return Train.phrases(b, c);
      case 'mistakes': return Train.mistakes();
      case 'grammar': return Train.grammar(b);
      case 'test': return Train.levelTest(b);
      case 'exam': return Train.exam(b);
      case 'placement': return Train.placement();
      case 'verbs': return Train.verbs(b && b !== 'all' ? C.verbs.filter(v => v.lvl === b) : null);
      case 'verb': return Train.verbAll(C.verbByInf[cmd.slice(5)]);
      case 'reading': return Train.reading(b);
      case 'dialogue': return Train.dialogue(b);
      case 'roleplay': return Train.roleplay(b);
    }
  }
};
document.addEventListener('DOMContentLoaded', () => App.init());
