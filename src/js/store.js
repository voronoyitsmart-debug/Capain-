// Прогресс пользователя: localStorage, всё в try/catch
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
  adapt: { d: 1, ok: 0, bad: 0 },   // адаптивная сложность 0..4
  accepted: {},      // key -> ответы, которые пользователь отметил как верные
  badPairs: {},      // 'key|key' -> 1: эти слова не ставить вариантами друг к другу
  recent: [],        // последние тренировки: {lvl, pct, d, t}
  lvlHint: null,     // когда скрыта подсказка о смене уровня
  reports: [],
  settings: { goal: 50, rate: 0.9, voice: '', autoplay: true, sound: true, theme: 'system', showRu: true, newPerDay: 10, adaptive: true }
});

const Store = {
  state: null,
  load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(L.storeKey) || 'null'); } catch (e) { s = null; }
    const d = DEFAULT_STATE();
    if (!s || typeof s !== 'object') s = d;
    for (const k of Object.keys(d)) if (s[k] === undefined) s[k] = d[k];
    s.settings = Object.assign(d.settings, s.settings || {});
    s.stats = Object.assign(d.stats, s.stats || {});
    this.state = s;
    return s;
  },
  save() {
    try { localStorage.setItem(L.storeKey, JSON.stringify(this.state)); } catch (e) { /* хранилище недоступно */ }
  },
  reset() { this.state = DEFAULT_STATE(); this.save(); },
  export() { return JSON.stringify(this.state); },
  import(json) {
    const s = JSON.parse(json);
    if (!s || typeof s !== 'object' || !s.srs) throw new Error('Это не похоже на файл прогресса');
    localStorage.setItem(L.storeKey, JSON.stringify(s));
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
