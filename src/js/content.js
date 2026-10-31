// Индексы над учебными данными DE.*
const C = {
  words: [], byKey: {}, topics: [], topicById: {}, lex: {}, nounArt: {}, byDe: {},
  tests: [], testByKey: {}, gex: {}, verbs: [], verbByInf: {},
  init() {
    // словари без прототипа: слова вроде «constructor» не должны совпадать со служебными свойствами
    for (const k of ['byKey', 'topicById', 'lex', 'nounArt', 'byDe', 'testByKey', 'gex', 'verbByInf']) this[k] = Object.create(null);
    // в румынских данных текст на изучаемом языке лежит в поле ro — внутри приложения это поле de
    const fromRo = x => { if (x && x.ro !== undefined && x.de === undefined) x.de = x.ro; };
    DE.topics.forEach(t => t.words.forEach(fromRo));
    DE.dialogues.forEach(d => (d.lines || []).forEach(fromRo));
    DE.phrases.forEach(p => (p.items || []).forEach(fromRo));
    DE.reading.forEach(r => (r.glossary || []).forEach(fromRo));
    const lvlOrder = l => LEVELS.indexOf(l);
    this.topics = DE.topics.slice().sort((a, b) => lvlOrder(a.level) - lvlOrder(b.level));
    for (const t of this.topics) {
      this.topicById[t.id] = t;
      t.words.forEach(w => {
        w.key = `w|${t.id}|${w.de}`;
        w.topic = t.id;
        this.words.push(w);
        this.byKey[w.key] = w;
        w.mean = this.meanings(w.ru, true);
        w.meanStrict = this.meanings(w.ru, false);
        const nd = norm(w.de);
        (this.byDe[nd] = this.byDe[nd] || []).push(w);
        const wart = L.gender(w), lemma = L.lemma(w);
        if (w.t === 'n' && wart && !/\s/.test(lemma)) this.nounArt[lemma.toLowerCase()] = wart;
        const lk = lemma.toLowerCase();
        if (!this.lex[lk]) this.lex[lk] = w;
        (L.gapForms(w) || []).forEach(f => { const k = String(f || '').toLowerCase(); if (k && !this.lex[k]) this.lex[k] = w; });
      });
    }
    // Разговорник как «слова» для тренировки
    for (const p of DE.phrases) {
      p.words = p.items.map((it, i) => {
        const w = { de: it.de, ru: it.ru, t: 'phr', lvl: p.lvl, ex: it.de, exRu: it.ru, key: `p|${p.id}|${i}`, topic: 'ph:' + p.id };
        w.mean = this.meanings(w.ru, true); w.meanStrict = this.meanings(w.ru, false);
        this.byKey[w.key] = w;
        return w;
      });
    }
    DE.tests.forEach(q => { q.key = 't|' + hash(q.q + '|' + q.options.join('|')); this.testByKey[q.key] = q; });
    this.tests = DE.tests;
    DE.grammar.forEach(g => g.exercises.forEach((x, i) => { x.key = `g|${g.id}|${i}`; x.lesson = g.id; this.gex[x.key] = x; }));
    this.grammar = DE.grammar.slice().sort((a, b) => lvlOrder(a.level) - lvlOrder(b.level));
    this.verbs = DE.verbs.slice().sort((a, b) => lvlOrder(a.lvl) - lvlOrder(b.lvl) || a.inf.localeCompare(b.inf, L.code));
    this.verbs.forEach(v => {
      v.key = 'v|' + v.inf; this.verbByInf[v.inf] = v;
      const lk = v.inf.replace(/^(sich|a se|a)\s+/, '').toLowerCase();
      if (!this.lex[lk]) this.lex[lk] = { de: v.inf, ru: v.ru, t: 'v' };
      L.verbForms(v).forEach(f => { const k = f.split(' ')[0].toLowerCase(); if (!this.lex[k]) this.lex[k] = { de: v.inf, ru: v.ru, t: 'v', form: f }; });
    });
    for (const r of DE.reading) (r.glossary || []).forEach(g => { const k = g.de.toLowerCase(); if (!this.lex[k]) this.lex[k] = { de: g.de, ru: g.ru }; });
  },
  // Значения перевода: «есть, кушать (разг.)» → ['есть', 'кушать'].
  // loose — без уточнений в скобках (для отсева вариантов-синонимов), strict — с ними (для приёма ответа).
  meanings(ru, loose) {
    let s = String(ru || '').toLowerCase().replace(/ё/g, 'е');
    if (loose) s = s.replace(/\([^)]*\)/g, ' ');
    s = s.replace(/\b(что|кого|кому|чего|чем|о ком)-л(ибо)?\.?/g, ' ').replace(/[↔→«»"„“]/g, ' ');
    return s.split(/[,;\/]| или /).map(x => x.replace(/\s+/g, ' ').trim()).filter(x => x.length > 1);
  },
  // Совпадают ли значения двух слов (тогда одно нельзя давать неверным вариантом к другому)
  sameMeaning(a, b) {
    const A = a.mean || this.meanings(a.ru, true), B = b.mean || this.meanings(b.ru, true);
    for (const x of A) for (const y of B) {
      if (x === y) return true;
      if (x.length >= 6 && y.length >= 6 && x.slice(0, 5) === y.slice(0, 5)) return true;
    }
    return false;
  },
  // Синонимы для письменного ответа: тот же тип слова и совпадающее значение (с уточнениями)
  synonyms(w) {
    if (!w.meanStrict || !w.meanStrict.length) return [];
    const out = [];
    for (const x of this.words) {
      if (x === w || x.t !== w.t || norm(x.de) === norm(w.de)) continue;
      if (x.meanStrict.some(m => w.meanStrict.includes(m))) out.push(x);
    }
    return out;
  },
  // Все допустимые написания ответа — правила в языковом пакете
  variants(de) { return L.variants(de); },
  topicWords(id) {
    if (id === 'fav') return Object.keys(Store.state.fav).map(k => this.byKey[k]).filter(Boolean);
    if (id && id.startsWith('ph:')) { const p = DE.phrases.find(p => 'ph:' + p.id === id); return p ? p.words : []; }
    const t = this.topicById[id]; return t ? t.words : [];
  },
  // Слова не выше уровня пользователя
  atLevel(w, lvl) { return LEVELS.indexOf(w.lvl) <= LEVELS.indexOf(lvl || Store.state.level); },
  topicProgress(id) {
    const ws = this.topicWords(id);
    let known = 0, started = 0;
    ws.forEach(w => { const m = Store.mastery(w.key); if (m >= 2) known++; if (m > 0) started++; });
    return { total: ws.length, known, started, pct: ws.length ? known / ws.length : 0 };
  },
  // Поиск перевода слова из текста
  lookup(token) {
    const t = token.toLowerCase().replace(/[^a-zäöüßăâîșțş ţ-]/gi, '').replace(/ş/g, 'ș').replace(/ţ/g, 'ț');
    if (!t) return null;
    if (this.lex[t]) return this.lex[t];
    const tries = L.lookupTries(t);
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
