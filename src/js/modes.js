// Построители вопросов для движка упражнений
const PERSONS = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];
const Q = {
  accepted(key) { return (Store.state.accepted || {})[key] || []; },
  // Может ли x быть неверным вариантом к w: не тот же немецкий, не синоним, не отмеченный пользователем
  conflict(w, x) {
    if (x === w) return true;
    if (norm(x.de) === norm(w.de) || norm(splitArticle(x.de).lemma) === norm(splitArticle(w.de).lemma)) return true;
    if (C.sameMeaning(w, x)) return true;
    const bp = Store.state.badPairs || {};
    return !!(bp[w.key + '|' + x.key] || bp[x.key + '|' + w.key]);
  },
  // Неверные варианты. hard — похожие (та же тема, тот же род, похожая длина), иначе — случайные
  distract(w, pool, field, n = 3, hard = false) {
    const val = x => field === 'de' ? x.de : x.ru;
    const seen = new Set([norm(val(w))]);
    const ok = x => x.t === w.t && !this.conflict(w, x);
    let cand = pool.filter(ok);
    if (cand.length < n * 2) cand = cand.concat(C.words.filter(x => ok(x) && !cand.includes(x)));
    if (cand.length < n) cand = cand.concat(C.words.filter(x => !this.conflict(w, x) && !cand.includes(x)));
    if (hard) {
      const wl = splitArticle(w.de).lemma, wa = splitArticle(w.de).art;
      const score = x => (x.topic === w.topic ? 2 : 0) + (wa && splitArticle(x.de).art === wa ? 1 : 0) +
        (Math.abs(splitArticle(x.de).lemma.length - wl.length) <= 2 ? 1 : 0) + (splitArticle(x.de).lemma[0] === wl[0] ? 1 : 0) + Math.random() * 1.5;
      cand = cand.map(x => [score(x), x]).sort((a, b) => b[0] - a[0]).slice(0, n * 3).map(p => p[1]);
    }
    const out = [];
    for (const x of shuffle(cand)) {
      const v = norm(val(x));
      if (seen.has(v)) continue;
      seen.add(v); out.push(x);
      if (out.length >= n) break;
    }
    return out;
  },
  // варианты-слова → вопрос с выбором; для объяснения ошибки запоминаем, какое слово стоит за вариантом
  wordChoice(w, wrongs, render, extra) {
    const opts = shuffle([w].concat(wrongs));
    return Object.assign({ kind: 'choice', options: opts.map(render), optWords: opts, a: opts.indexOf(w), w, key: w.key, srs: true, adapt: true }, extra);
  },
  deRu(w, pool, eff = Adapt.eff(w)) {
    const ws = this.distract(w, pool, 'ru', Adapt.options(eff) - 1, eff >= 3);
    return this.wordChoice(w, ws, x => ({ html: esc(x.ru) }), {
      qtype: 'deRu', label: 'Выберите перевод', prompt: `<div class="q-word">${deHTML(w)}</div>`, say: w.de, autoplay: true, explain: this.wordExplain(w)
    });
  },
  ruDe(w, pool, eff = Adapt.eff(w)) {
    const ws = this.distract(w, pool, 'de', Adapt.options(eff) - 1, eff >= 2);
    return this.wordChoice(w, ws, x => ({ html: deHTML(x) }), {
      qtype: 'ruDe', label: 'Как это по-немецки?', prompt: `<div class="q-word ru">${esc(w.ru)}</div>`, explain: this.wordExplain(w), sayAfter: w.de
    });
  },
  listen(w, pool, eff = Adapt.eff(w)) {
    const ws = this.distract(w, pool, 'ru', Adapt.options(eff) - 1, eff >= 3);
    return this.wordChoice(w, ws, x => ({ html: esc(x.ru) }), {
      qtype: 'listen', label: 'Послушайте и выберите перевод', prompt: `<button class="big-audio" data-say>${ICON.sound}</button>`,
      say: w.de, autoplay: true, explain: this.wordExplain(w), listen: true
    });
  },
  // Письменный ответ: принимаем варианты написания, alt из данных, синонимы и ответы, отмеченные пользователем
  type(w, eff = Adapt.eff(w), listen = false) {
    const answers = C.variants(w.de);
    (w.alt || []).forEach(a => C.variants(a).forEach(v => answers.push(v)));
    const soft = [];
    answers.slice().forEach(a => { if (/^sich /.test(a)) soft.push({ a: a.replace(/^sich /, ''), note: `Засчитано, но глагол возвратный: <b>${esc(a)}</b>` }); });
    const syn = C.synonyms(w).filter(x => !answers.some(a => norm(a) === norm(x.de)));
    let hint = '';
    if (!listen && eff <= 2 && w.t !== 'phr') {
      const { art, lemma } = splitArticle(w.de.replace(/\s*\(.*?\)/g, ''));
      hint = `Подсказка: ${art ? art + ' ' : ''}${esc(lemma.charAt(0))}${'·'.repeat(Math.max(0, lemma.length - 1))} (${lemma.length} букв)`;
    }
    return {
      kind: 'input', qtype: listen ? 'typeListen' : 'type',
      label: listen ? 'Послушайте и напишите' : (w.t === 'n' ? 'Напишите по-немецки с артиклем' : 'Напишите по-немецки'),
      prompt: listen ? `<button class="big-audio" data-say>${ICON.sound}</button><div class="q-sub">${w.t === 'n' ? 'С артиклем' : ''}</div>`
        : `<div class="q-word ru">${esc(w.ru)}</div>${hint ? `<div class="q-hint">${hint}</div>` : ''}`,
      answers: uniq(answers), soft, synonyms: syn, accepted: this.accepted(w.key), reveal: deHTML(w), say: w.de, autoplay: listen,
      explain: this.wordExplain(w), key: w.key, srs: true, adapt: true, w, nounCheck: w.t === 'n'
    };
  },
  article(w) {
    const { art, lemma } = splitArticle(w.de);
    const arts = ['der', 'die', 'das'];
    return {
      kind: 'choice', style: 'articles', qtype: 'article', label: 'Какой артикль?',
      prompt: `<div class="q-word">${esc(lemma)}</div><div class="q-sub">${esc(w.ru)}</div>`,
      options: arts.map(a => ({ html: a, cls: 'a-' + a })), a: arts.indexOf(art), sayAfter: w.de,
      explain: this.wordExplain(w) + Explain.gender(w), key: w.key, srs: true, adapt: true, w
    };
  },
  pluralForms(w, eff = Adapt.eff(w)) {
    const { lemma } = splitArticle(w.de);
    const correct = w.pl.replace(/^die /, '');
    const uml = s => s.replace(/(au|a|o|u)(?=[^aouäöü]*$)/i, m => ({ a: 'ä', o: 'ö', u: 'ü', au: 'äu', A: 'Ä', O: 'Ö', U: 'Ü', Au: 'Äu' }[m] || m));
    const base = lemma.replace(/e$/, '');
    const cands = [lemma + 'e', lemma + 'en', lemma + 'n', lemma + 'er', lemma + 's', uml(lemma) + 'e', uml(lemma) + 'er', lemma, uml(lemma), base + 'en', lemma + 'nen'];
    const wrong = shuffle(uniq(cands).filter(c => c !== correct && c !== lemma + 'nn' && !/(.)\1\1/.test(c))).slice(0, Adapt.options(eff) - 1);
    if (wrong.length < 2) return null;
    const opts = shuffle([correct].concat(wrong));
    return {
      kind: 'choice', qtype: 'plural', label: 'Множественное число', prompt: `<div class="q-word">${deHTML(w)}</div><div class="q-sub">${esc(w.ru)}</div>`,
      options: opts.map(x => ({ html: 'die ' + esc(x) })), a: opts.indexOf(correct),
      explain: Explain.plural(w), key: w.key, srs: true, adapt: true, w, sayAfter: w.pl
    };
  },
  canPlural(w) { return w.t === 'n' && w.pl && w.pl !== '-' && /^die \S+$/.test(w.pl) && !/\(Pl/.test(w.de); },
  gapToken(w) {
    if (!w.ex || w.t === 'phr') return null;
    const lemma = splitArticle(w.de).lemma.replace(/^sich /, '').replace(/ \+.*$/, '');
    if (/\s/.test(lemma)) return null;
    const toks = w.ex.split(/\s+/);
    const i = toks.findIndex(t => t.replace(/[.,!?;:„“"]/g, '').toLowerCase() === lemma.toLowerCase());
    return i < 0 ? null : { toks, i, lemma: toks[i].replace(/[.,!?;:„“"]/g, '') };
  },
  gap(w, pool, eff = Adapt.eff(w)) {
    const g = this.gapToken(w);
    if (!g) return null;
    const lem = x => splitArticle(x.de).lemma.replace(/^sich /, '').replace(/ \+.*$/, '');
    const others = this.distract(w, pool, 'de', 6, eff >= 3).filter(x => !/\s/.test(lem(x)) && lem(x).toLowerCase() !== g.lemma.toLowerCase()).slice(0, Adapt.options(eff) - 1);
    if (others.length < 2) return null;
    const fix = s => /^[A-ZÄÖÜ]/.test(g.lemma) ? s.charAt(0).toUpperCase() + s.slice(1) : s;
    const sent = g.toks.map((t, j) => j === g.i ? t.replace(/[^.,!?;:„“"]+/, '<span class="gap">＿＿＿</span>') : esc(t)).join(' ');
    const opts = shuffle([w].concat(others));
    return {
      kind: 'choice', qtype: 'gap', label: 'Вставьте пропущенное слово',
      prompt: `<div class="q-sent">${sent}</div><div class="q-sub">${esc(w.exRu)}</div>`,
      options: opts.map(x => ({ html: esc(x === w ? g.lemma : fix(lem(x))) })), optWords: opts, a: opts.indexOf(w),
      explain: `<b>${esc(w.ex)}</b><br>${this.wordExplain(w)}`, key: w.key, srs: true, adapt: true, w, sayAfter: w.ex
    };
  },
  order(de, ru, key, opts = {}) {
    const m = /^(.*?)([.!?…]*)$/.exec(de.trim());
    const toks = m[1].split(/\s+/).filter(Boolean);
    if (toks.length < 3 || toks.length > 14) return null;
    return Object.assign({
      kind: 'order', qtype: opts.listen ? 'dictation' : 'order', label: opts.listen ? 'Послушайте и соберите фразу' : 'Соберите предложение',
      prompt: opts.listen ? `<button class="big-audio" data-say>${ICON.sound}</button>` : `<div class="q-sub big">${esc(ru)}</div>`,
      tokens: toks, tail: m[2], ru, say: de, autoplay: !!opts.listen, key, srs: !!opts.srs, adapt: !!opts.srs,
      alts: (opts.alts || []).map(a => a.join(' ')), accepted: this.accepted(key), explain: opts.explain || ''
    }, opts.extra || {});
  },
  flash(w) { return { kind: 'flash', w, key: w.key, say: w.de }; },
  match(words) {
    return { kind: 'match', label: 'Найдите пары', pairs: words.map(w => ({ l: w.de, lh: deHTML(w), r: w.ru, key: w.key })) };
  },
  // пары без синонимов внутри одного раунда
  matchSet(src, n = 6) {
    const out = [];
    for (const w of src) {
      if (out.some(x => this.conflict(w, x) || norm(x.ru) === norm(w.ru))) continue;
      out.push(w);
      if (out.length >= n) break;
    }
    return out;
  },
  wordExplain(w) {
    let s = `${deHTML(w)} — ${esc(w.ru)}`;
    if (w.t === 'n' && w.pl && w.pl !== '-') s += ` <span class="muted">· мн. ${esc(w.pl)}</span>`;
    if (w.ex) s += `<div class="ex-line">${esc(w.ex)}<br><span class="muted">${esc(w.exRu || '')}</span></div>`;
    return s;
  },

  // Вопрос по слову: тип зависит от адаптивной сложности и того, насколько слово знакомо
  LADDER: [
    [['deRu', 3], ['article', 2], ['listen', 1]],
    [['deRu', 2], ['listen', 2], ['article', 2], ['ruDe', 1]],
    [['ruDe', 2], ['listen', 1], ['gap', 2], ['article', 1], ['plural', 1], ['type', 1]],
    [['gap', 2], ['type', 2], ['plural', 1], ['orderEx', 1], ['ruDe', 1]],
    [['type', 3], ['typeListen', 2], ['dictation', 1], ['orderEx', 1], ['gap', 1]]
  ],
  forWord(w, pool, mode) {
    pool = pool || C.topicWords(w.topic);
    if (!pool.length) pool = C.words;
    const eff = Adapt.eff(w);
    if (mode) { const q = this.make(mode, w, pool, eff); if (q) return q; }
    const opts = [];
    for (const [f, n] of this.LADDER[eff]) for (let i = 0; i < n; i++) opts.push(f);
    for (const f of shuffle(opts)) {
      const q = this.make(f, w, pool, eff);
      if (q) return q;
    }
    return this.deRu(w, pool, eff);
  },
  make(f, w, pool, eff = Adapt.eff(w)) {
    switch (f) {
      case 'deRu': return this.deRu(w, pool, eff);
      case 'ruDe': return this.ruDe(w, pool, eff);
      case 'listen': return this.listen(w, pool, eff);
      case 'type': return this.type(w, eff);
      case 'typeListen': return w.t === 'phr' || w.de.length > 40 ? null : this.type(w, eff, true);
      case 'article': return w.t === 'n' && splitArticle(w.de).art ? this.article(w) : null;
      case 'plural': return this.canPlural(w) ? this.pluralForms(w, eff) : null;
      case 'gap': return this.gap(w, pool, eff);
      case 'orderEx': return w.ex ? this.order(w.ex, w.exRu, w.key, { srs: true, extra: { w } }) : null;
      case 'dictation': return w.ex ? this.order(w.ex, w.exRu, w.key, { srs: true, listen: true, extra: { w } }) : null;
    }
    return null;
  },

  // ---- Грамматика и тесты ----
  fromExercise(x) {
    const extra = { key: x.key, lesson: x.lesson, explain: esc(x.explain || '') };
    if (x.type === 'choice') {
      const opts = shuffle(x.options.map((o, i) => ({ o, i })));
      return Object.assign({ kind: 'choice', label: 'Выберите правильный вариант', prompt: `<div class="q-sent">${this.gapify(x.q)}</div>`,
        options: opts.map(o => ({ html: esc(o.o) })), a: opts.findIndex(o => o.i === x.a),
        sayAfter: x.q.includes('___') ? x.q.replace(/_{2,}/, x.options[x.a]) : null }, extra);
    }
    if (x.type === 'input') {
      return Object.assign({ kind: 'input', strict: true, label: 'Впишите ответ', prompt: `<div class="q-sent">${this.gapify(x.q)}</div>`, answers: x.a,
        accepted: this.accepted(x.key), reveal: esc(x.a[0]), sayAfter: x.q.includes('___') ? x.q.replace(/_{2,}/, x.a[0]).replace(/\s*\(.*?\)\s*$/, '') : null }, extra);
    }
    if (x.type === 'order') {
      const de = x.words.join(' ');
      const full = de + (/[.!?]$/.test(de) ? '' : '.');
      return this.order(full, x.ru, x.key, { explain: extra.explain, alts: x.alts, extra: { lesson: x.lesson } }) ||
        Object.assign({ kind: 'order', label: 'Соберите предложение', prompt: `<div class="q-sub big">${esc(x.ru)}</div>`, tokens: x.words, tail: '', ru: x.ru, say: de,
          alts: (x.alts || []).map(a => a.join(' ')), accepted: this.accepted(x.key) }, extra);
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
      return { kind: 'input', label: 'Perfekt · er/sie/es', prompt: `<div class="q-word">${esc(v.inf)}</div><div class="q-sub">${esc(v.ru)} — напишите вспомогательный глагол и Partizip II</div>`,
        answers, accepted: this.accepted(`v|${v.inf}|perf|2`), reveal: esc(v.perf), explain: `er ${esc(v.perf)}`, key: `v|${v.inf}|perf|2`, say: 'er ' + v.perf, prefix: 'er',
        verb: v, tense: 'perf', person: 2, strict: true };
    }
    p = p == null ? rnd(6) : p;
    const forms = tense === 'praes' ? v.praes : v.praet;
    const pron = ['ich', 'du', 'er', 'wir', 'ihr', 'sie'][p];
    return { kind: 'input', label: (tense === 'praes' ? 'Präsens' : 'Präteritum') + ' · ' + PERSONS[p],
      prompt: `<div class="q-word">${esc(v.inf)}</div><div class="q-sub">${esc(v.ru)}</div>`,
      answers: [forms[p]], accepted: this.accepted(`v|${v.inf}|${tense}|${p}`), reveal: `${pron} ${esc(forms[p])}`, explain: this.verbTable(v, tense),
      key: `v|${v.inf}|${tense}|${p}`, say: pron + ' ' + forms[p], prefix: pron, verb: v, tense, person: p, strict: true };
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
