// Построители вопросов для движка упражнений
const Q = {
  accepted(key) { return (Store.state.accepted || {})[key] || []; },
  // Может ли x быть неверным вариантом к w: не тот же немецкий, не синоним, не отмеченный пользователем
  conflict(w, x) {
    if (x === w) return true;
    if (norm(x.de) === norm(w.de) || norm(L.lemma(x)) === norm(L.lemma(w))) return true;
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
      const wl = L.lemma(w), wa = L.gender(w);
      const score = x => (x.topic === w.topic ? 2 : 0) + (wa && L.gender(x) === wa ? 1 : 0) +
        (Math.abs(L.lemma(x).length - wl.length) <= 2 ? 1 : 0) + (L.lemma(x)[0] === wl[0] ? 1 : 0) + Math.random() * 1.5;
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
      qtype: 'ruDe', label: `Как это ${L.ui.inLang}?`, prompt: `<div class="q-word ru">${esc(w.ru)}</div>`, explain: this.wordExplain(w), sayAfter: w.de
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
    if (L.extraAnswers) L.extraAnswers(w).forEach(a => answers.push(a));
    const soft = L.soft(answers, w);
    const syn = C.synonyms(w).filter(x => !answers.some(a => norm(a) === norm(x.de)));
    let hint = '';
    if (!listen && eff <= 2 && w.t !== 'phr') hint = L.typeHint(w);
    return {
      kind: 'input', qtype: listen ? 'typeListen' : 'type',
      label: listen ? 'Послушайте и напишите' : (w.t === 'n' ? L.ui.typeNoun : `Напишите ${L.ui.inLang}`),
      prompt: listen ? `<button class="big-audio" data-say>${ICON.sound}</button><div class="q-sub">${w.t === 'n' ? 'С артиклем' : ''}</div>`
        : `<div class="q-word ru">${esc(w.ru)}</div>${hint ? `<div class="q-hint">${hint}</div>` : ''}`,
      answers: uniq(answers), soft, synonyms: syn, accepted: this.accepted(w.key), reveal: deHTML(w), say: w.de, autoplay: listen,
      explain: this.wordExplain(w), key: w.key, srs: true, adapt: true, w, nounCheck: w.t === 'n'
    };
  },
  article(w) {
    const g = L.gender(w), G = L.genders;
    return {
      kind: 'choice', style: 'articles', qtype: 'article', label: L.ui.genderQ,
      prompt: `<div class="q-word">${esc(L.lemma(w))}</div><div class="q-sub">${esc(w.ru)}</div>`,
      options: G.map(x => ({ html: x.html, cls: x.cls })), a: G.findIndex(x => x.id === g), sayAfter: w.de,
      explain: this.wordExplain(w) + Explain.gender(w), key: w.key, srs: true, adapt: true, w
    };
  },
  pluralForms(w, eff = Adapt.eff(w)) {
    const P = L.pluralOptions(w);
    const wrong = shuffle(P.wrong).slice(0, Adapt.options(eff) - 1);
    if (wrong.length < 2) return null;
    const opts = shuffle([P.correct].concat(wrong));
    return {
      kind: 'choice', qtype: 'plural', label: 'Множественное число', prompt: `<div class="q-word">${deHTML(w)}</div><div class="q-sub">${esc(w.ru)}</div>`,
      options: opts.map(x => ({ html: P.show(x) })), a: opts.indexOf(P.correct),
      explain: Explain.plural(w), key: w.key, srs: true, adapt: true, w, sayAfter: w.pl
    };
  },
  canPlural(w) { return L.canPlural(w); },
  // слово в примере: ищем начальную форму или (для румынского) форму с артиклем
  gapToken(w) {
    if (!w.ex || w.t === 'phr') return null;
    const toks = w.ex.split(/\s+/);
    const clean = t => t.replace(/[.,!?;:„“"]/g, '').toLowerCase();
    const forms = L.gapForms(w);
    for (let k = 0; k < forms.length; k++) {
      const f = (forms[k] || '').toLowerCase();
      if (!f || /\s/.test(f)) continue;
      const i = toks.findIndex(t => clean(t) === f);
      if (i >= 0) return { toks, i, k, lemma: toks[i].replace(/[.,!?;:„“"]/g, '') };
    }
    return null;
  },
  gap(w, pool, eff = Adapt.eff(w)) {
    const g = this.gapToken(w);
    if (!g) return null;
    const lem = x => L.gapForms(x)[g.k] || L.lemma(x);
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
      case 'article': return w.t === 'n' && L.gender(w) ? this.article(w) : null;
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
    const T = L.tenses(v);
    const t = T.find(x => x.id === (tense || L.pickTense(v))) || T[0];
    if (t.single) {
      const sg = t.single, key = `v|${v.inf}|${t.id}|${sg.p}`;
      return { kind: 'input', label: `${t.label} · ${L.persons[sg.p]}`, prompt: `<div class="q-word">${esc(v.inf)}</div><div class="q-sub">${esc(v.ru)}${sg.hint ? ' — ' + sg.hint : ''}</div>`,
        answers: sg.answers, accepted: this.accepted(key), reveal: sg.reveal, explain: `${esc(sg.prefix)} ${sg.reveal}`, key, say: sg.say, prefix: sg.prefix,
        verb: v, tense: t.id, person: sg.p, strict: true };
    }
    p = p == null ? rnd(6) : p;
    const pron = L.pron[p];
    return { kind: 'input', label: t.label + ' · ' + L.persons[p],
      prompt: `<div class="q-word">${esc(v.inf)}</div><div class="q-sub">${esc(v.ru)}</div>`,
      answers: [t.forms[p]], accepted: this.accepted(`v|${v.inf}|${t.id}|${p}`), reveal: `${esc(pron)} ${esc(t.forms[p])}`, explain: this.verbTable(t.forms),
      key: `v|${v.inf}|${t.id}|${p}`, say: pron + ' ' + t.forms[p], prefix: pron, verb: v, tense: t.id, person: p, strict: true };
  },
  verbTable(forms) {
    return `<table class="mini"><tbody>${L.persons.map((p, i) => `<tr><td class="muted">${p}</td><td><b>${esc(forms[i])}</b></td></tr>`).join('')}</tbody></table>`;
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
