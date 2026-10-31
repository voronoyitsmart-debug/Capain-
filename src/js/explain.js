// Объяснения ошибок: почему ответ неверный и какое правило здесь работает
const Explain = {
  // ---------- посимвольное сравнение ----------
  diff(given, correct) {
    const a = String(given), b = String(correct);
    const A = a.toLowerCase(), B = b.toLowerCase();
    const n = A.length, m = B.length;
    if (n * m > 40000) return { g: esc(a), c: esc(b) };
    const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
      L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    let i = 0, j = 0, g = '', c = '';
    while (i < n || j < m) {
      if (i < n && j < m && A[i] === B[j]) { g += esc(a[i]); c += esc(b[j]); i++; j++; }
      else if (j < m && (i >= n || L[i][j + 1] >= L[i + 1][j])) { c += `<ins>${esc(b[j]) === ' ' ? '␣' : esc(b[j])}</ins>`; j++; }
      else { g += `<del>${esc(a[i]) === ' ' ? '␣' : esc(a[i])}</del>`; i++; }
    }
    return { g, c };
  },
  diffBlock(given, correct) {
    const d = this.diff(given, correct);
    return `<div class="dif"><div><span class="muted">Ваш ответ</span><b class="dif-g">${d.g}</b></div><div><span class="muted">Правильно</span><b class="dif-c">${d.c}</b></div></div>`;
  },

  // правила зависят от языка — они в языковом пакете (lang/*.js)
  gender(w) { return L.explain.gender(w); },
  plural(w) { return L.explain.plural(w); },
  verb(v, tense, p, given) { return L.explain.verb(v, tense, p, given); },
  order(q, given) { return L.explain.order(q, given); },

  // ---------- выбор варианта ----------
  choice(q, i) {
    const x = q.optWords && q.optWords[i];
    const chosen = q.options[i].html;
    if (!x) return `<div class="why"><div>Вы выбрали: <s>${chosen}</s></div></div>`;
    const w = q.w;
    switch (q.qtype) {
      case 'deRu': case 'listen':
        return `<div class="why"><div>«${esc(x.ru)}» — это ${deHTML(x)}, а ${deHTML(w)} — «${esc(w.ru)}».</div></div>`;
      case 'ruDe':
        return `<div class="why"><div>${deHTML(x)} означает «${esc(x.ru)}», а «${esc(w.ru)}» — ${deHTML(w)}.</div></div>`;
      case 'gap':
        return `<div class="why"><div>«${chosen}» — «${esc(x.ru)}». По смыслу предложения («${esc(w.exRu)}») нужно ${deHTML(w)} — «${esc(w.ru)}».</div></div>`;
    }
    return '';
  },

  // ---------- письменный ответ ----------
  input(q, given) {
    const out = [];
    if (q.w) {
      const w = q.w;
      const gn = norm(given);
      const other = (C.byDe[gn] || [])[0] || C.words.find(x => norm(L.lemma(x)) === gn && x !== w);
      if (w.t === 'n') { const n = L.inputNoun(w, gn); if (n) return n; }
      if (other && other !== w) out.push(`<div class="why"><div>${deHTML(other)} — это «${esc(other.ru)}». Здесь нужно «${esc(w.ru)}».</div></div>`);
      out.push(this.diffBlock(given, q.answers[0]));
      if (w.t === 'n') out.push(this.gender(w));
      return out.join('');
    }
    if (q.verb) return this.diffBlock(given, q.answers[0]) + this.verb(q.verb, q.tense, q.person, given);
    return this.diffBlock(given, q.answers[0]);
  }
};
