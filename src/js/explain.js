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

  // ---------- род существительного ----------
  gender(w) {
    const { art, lemma } = splitArticle(w.de);
    if (!art) return '';
    const l = lemma.toLowerCase();
    const R = [
      [/(ung|heit|keit|schaft|ion|tät|ik|ur|ei|enz|anz|ie)$/, 'die', 'Слова на -ung, -heit, -keit, -schaft, -ion, -tät, -ik, -ei, -ie почти всегда женского рода'],
      [/(chen|lein)$/, 'das', 'Уменьшительные на -chen и -lein — всегда das'],
      [/(ment|um|ma|nis|tum)$/, 'das', 'Слова на -ment, -um, -tum и многие на -nis — среднего рода'],
      [/^ge.*e$/, 'das', 'Собирательные слова на Ge-…-e обычно среднего рода (das Gemüse, das Gebäude)'],
      [/(ling|ismus|ich|ig|or|ist|ant|ent)$/, 'der', 'Суффиксы -ling, -ismus, -ig, -or, -ist, -ant обычно мужского рода'],
      [/(er)$/, 'der', 'Слова на -er (профессии, инструменты) часто мужского рода'],
      [/e$/, 'die', 'Около 90% слов на -e — женского рода']
    ];
    const lines = [];
    // сложное слово: род по последней части
    for (let k = 1; k < lemma.length - 2; k++) {
      const tail = lemma.slice(k).toLowerCase();
      const ta = C.nounArt[tail];
      if (ta && /^[a-zäöüß]/i.test(tail)) {
        const tl = tail.charAt(0).toUpperCase() + tail.slice(1);
        lines.push(ta === art ? `Сложное слово: род берётся от последней части — <b class="a-${ta}">${ta}</b> ${esc(tl)} → <b class="a-${art}">${art}</b> ${esc(lemma)}`
          : `Обычно род сложного слова берётся от последней части (${ta} ${esc(tl)}), но здесь — <b class="a-${art}">${art}</b>`);
        break;
      }
    }
    if (!lines.length) {
      const hit = R.find(([re]) => re.test(l));
      if (hit) lines.push(hit[1] === art ? hit[2] : `${hit[2]}, но <b>${esc(lemma)}</b> — исключение: <b class="a-${art}">${art}</b>`);
      else if (w.topic === 'calendar' && art === 'der') lines.push('Дни недели, месяцы и времена года — мужского рода');
      else lines.push(`Здесь правила нет — запомните слово вместе с артиклем и цветом: <b class="a-${art}">${art}</b> ${esc(lemma)} (${({ der: 'синий — мужской', die: 'красный — женский', das: 'зелёный — средний' })[art]} род)`);
    }
    return `<div class="why">${lines.map(x => `<div>💡 ${x}</div>`).join('')}</div>`;
  },

  // ---------- множественное число ----------
  plural(w) {
    const { art, lemma } = splitArticle(w.de);
    const pl = (w.pl || '').replace(/^die /, '');
    const plain = s => s.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/äu/g, 'au');
    const um = pl !== lemma && plain(pl).startsWith(plain(lemma)) && !pl.startsWith(lemma);
    let suf = '';
    if (pl === lemma) suf = '';
    else for (const s of ['nen', 'se', 'en', 'er', 'n', 'e', 's']) {
      if (pl.endsWith(s) && plain(pl.slice(0, -s.length)) === plain(lemma)) { suf = s; break; }
    }
    if (!suf && pl !== lemma && plain(pl) !== plain(lemma)) {
      return `<div class="why"><div>💡 ${esc(lemma)} → <b>${esc(pl)}</b>: особая форма множественного числа — её нужно запомнить.</div></div>`;
    }
    const RULE = {
      '': 'Слова мужского и среднего рода на -er, -el, -en, а также -chen и -lein во множественном числе не меняются',
      n: art === 'der' ? 'Слова мужского рода на -e (n-склонение: der Junge, der Kollege) получают -n' : 'Почти все слова женского рода получают -(e)n, а на -e — просто -n',
      en: 'Слова женского рода (особенно на -ung, -heit, -keit, -ion, -schaft) получают -en',
      nen: 'Женские формы на -in получают -nen: die Lehrerin → die Lehrerinnen',
      e: art === 'der' ? 'Многие слова мужского рода получают -e, часто с умлаутом: der Stuhl → die Stühle' : 'Окончание -e: многие односложные слова (der Tag → die Tage)',
      er: 'Односложные слова среднего рода часто получают -er с умлаутом: das Buch → die Bücher',
      s: 'Слова на гласную (кроме -e), сокращения и заимствования получают -s: das Auto → die Autos',
      se: 'Слова на -nis получают -se: das Ergebnis → die Ergebnisse'
    };
    const kind = (suf ? `окончание -${suf}` : 'без окончания') + (um ? ' + умлаут' : '');
    return `<div class="why"><div>💡 ${esc(lemma)} → <b>${esc(pl)}</b>: ${kind}.</div><div class="muted">${RULE[suf]}.</div></div>`;
  },

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
      const other = (C.byDe[gn] || [])[0] || C.words.find(x => norm(splitArticle(x.de).lemma) === gn && x !== w);
      if (q.nounCheck) {
        const { art, lemma } = splitArticle(w.de);
        const u = splitArticle(gn.replace(/^(der|die|das)(?=\S)/, '$1 '));
        if (norm(u.lemma) === norm(lemma) || gn === norm(lemma)) {
          out.push(u.art ? `Слово верное, но артикль другой: <b class="a-${art}">${art}</b> ${esc(lemma)}` : `Не хватает артикля: <b class="a-${art}">${art}</b> ${esc(lemma)}. Существительные учим сразу с артиклем.`);
          out.push(this.gender(w));
          return out.join('');
        }
      }
      if (other && other !== w) out.push(`<div class="why"><div>${deHTML(other)} — это «${esc(other.ru)}». Здесь нужно «${esc(w.ru)}».</div></div>`);
      out.push(this.diffBlock(given, q.answers[0]));
      if (w.t === 'n') out.push(this.gender(w));
      return out.join('');
    }
    if (q.verb) return this.diffBlock(given, q.answers[0]) + this.verb(q.verb, q.tense, q.person, given);
    return this.diffBlock(given, q.answers[0]);
  },

  // ---------- спряжение ----------
  verb(v, tense, p, given) {
    const PR = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];
    const lines = [];
    const gn = norm(given || '');
    const forms = tense === 'praet' ? v.praet : v.praes;
    if (tense !== 'perf' && gn) {
      const j = forms.findIndex(f => norm(f) === gn);
      if (j >= 0 && j !== p) lines.push(`«${esc(given)}» — это форма для <b>${PR[j]}</b>, а нужна для <b>${PR[p]}</b>.`);
      const other = tense === 'praes' ? v.praet : v.praes;
      if (other.some(f => norm(f) === gn)) lines.push(`«${esc(given)}» — форма ${tense === 'praes' ? 'прошедшего времени (Präteritum)' : 'настоящего времени (Präsens)'}.`);
    }
    const stem = v.inf.replace(/^sich /, '').split(' ')[0].replace(/(e?n)$/, '');
    if (tense === 'praes') {
      if (v.type === 'modal' || /^(sein|haben|werden|wissen)$/.test(v.inf)) lines.push(`${esc(v.inf)} — неправильный глагол, его формы нужно запомнить.`);
      else {
        lines.push('Окончания Präsens: ich -e, du -st, er/sie/es -t, wir -en, ihr -t, sie/Sie -en.');
        const duStem = v.praes[1].split(' ')[0].replace(/(e?st|t)$/, '');
        if ((p === 1 || p === 2) && duStem !== stem && !stem.startsWith(duStem)) lines.push(`У этого глагола в формах du и er/sie/es меняется корень: ${esc(v.inf)} → du ${esc(v.praes[1])}, er ${esc(v.praes[2])}.`);
        if (/[td]$/.test(stem) && (p === 1 || p === 2 || p === 4)) lines.push('Основа на -t/-d: перед окончанием добавляется -e- (du arbeitest, er findet).');
      }
      if (v.sep) lines.push(`Отделяемая приставка уходит в конец: ich ${esc(v.praes[0])}.`);
    } else if (tense === 'praet') {
      if (v.type === 'weak') lines.push('Слабый глагол: в Präteritum добавляется -te-: machen → machte. У ich и er/sie/es формы совпадают.');
      else lines.push(`Сильный/неправильный глагол: в Präteritum меняется корень (${esc(v.inf)} → ${esc(v.praet[0])}). У ich и er/sie/es окончания нет.`);
      if (v.sep) lines.push('Отделяемая приставка стоит в конце.');
    } else {
      const aux = v.perf.split(' ')[0];
      const part = v.perf.split(' ').slice(1).join(' ');
      if (/ist/.test(aux)) lines.push('Perfekt с <b>sein</b>: так образуют глаголы движения и изменения состояния (gehen, fahren, aufstehen, werden), а также sein и bleiben.');
      else lines.push('Perfekt с <b>haben</b>: так образует большинство глаголов, в том числе все возвратные и с прямым дополнением.');
      if (/ieren$/.test(v.inf)) lines.push(`Глаголы на -ieren образуют Partizip II без ge-: ${esc(part)}.`);
      else if (/^(be|ver|er|ent|emp|ge|zer|miss)/.test(v.inf.replace(/^sich /, '')) && !/^ge/.test(part)) lines.push(`Неотделяемая приставка — без ge-: ${esc(part)}.`);
      else if (v.sep) lines.push(`Отделяемая приставка: ge- встаёт внутрь: ${esc(part)}.`);
      else if (/t$/.test(part)) lines.push(`Слабый глагол: Partizip II по схеме ge-…-t (${esc(part)}).`);
      else lines.push(`Сильный глагол: Partizip II на -en, часто с другой гласной (${esc(part)}) — запомните.`);
    }
    return `<div class="why">${lines.map(x => `<div>💡 ${x}</div>`).join('')}</div>`;
  },

  // ---------- порядок слов ----------
  order(q, given) {
    const toks = q.tokens.map(t => t.replace(/[.,!?;:„“"]/g, ''));
    const low = toks.map(t => t.toLowerCase());
    const g = (given || []).map(t => t.replace(/[.,!?;:„“"]/g, ''));
    const lines = [];
    const k = g.findIndex((t, i) => t !== toks[i]);
    if (k >= 0 && g.length) lines.push(`Расхождение с ${k + 1}-го слова: у вас «${esc(g[k] || '…')}», а нужно «${esc(toks[k])}».`);
    const SUB = ['weil', 'dass', 'wenn', 'ob', 'obwohl', 'als', 'damit', 'bevor', 'nachdem', 'während', 'bis', 'seit', 'seitdem', 'sobald', 'falls', 'sodass', 'indem', 'solange', 'ehe'];
    const W = ['wer', 'was', 'wo', 'wann', 'wie', 'warum', 'woher', 'wohin', 'welcher', 'welche', 'welches', 'wen', 'wem', 'wieso', 'weshalb'];
    const sub = low.find((t, i) => SUB.includes(t) && i < low.length - 1);
    const rel = q.tokens.some((t, i) => /,$/.test(t) && ['der', 'die', 'das', 'den', 'dem', 'deren', 'dessen', 'denen'].includes(low[i + 1]));
    if (sub) lines.push(`В придаточном предложении после «${esc(sub)}» спрягаемый глагол стоит в самом конце.`);
    if (rel) lines.push('В относительном придаточном (после der/die/das через запятую) глагол тоже уходит в конец.');
    if (q.tail === '?') {
      if (W.includes(low[0]) || W.includes(low[1])) lines.push('Вопрос с вопросительным словом: сразу за ним идёт глагол, потом подлежащее.');
      else lines.push('Вопрос без вопросительного слова (ответ «да/нет») начинается с глагола.');
    } else if (!sub || low.indexOf(sub) > 0) {
      lines.push('В обычном предложении спрягаемый глагол стоит на 2-м месте. Если первым идёт не подлежащее (например, «Heute» или «Am Montag»), подлежащее встаёт после глагола.');
    }
    const AUX = /^(kann|kannst|können|könnt|muss|musst|müssen|müsst|will|willst|wollen|wollt|darf|darfst|dürfen|dürft|soll|sollst|sollen|sollt|möchte|möchtest|möchten|möchtet|habe|hast|hat|haben|habt|bin|bist|ist|sind|seid|werde|wirst|wird|werden|werdet|hatte|hattest|hatten|war|warst|waren|würde|würdest|würden)$/;
    const last = low[low.length - 1] || '';
    const lastTok = toks[toks.length - 1] || '';
    const verbLike = /^[a-zäöü]/.test(lastTok) && (/en$/.test(last) || /^ge.+(t|en)$/.test(last)) &&
      !/^(offen|trocken|eben|oben|unten|morgen|einen|keinen|meinen|deinen|seinen|ihren|unseren|diesen|den|wen|allen|vielen)$/.test(last);
    if (low.slice(0, -1).some(t => AUX.test(t)) && verbLike && !sub) lines.push(`Второй глагол (инфинитив или Partizip II) — «${esc(toks[toks.length - 1])}» — стоит в конце: так получается «рамка».`);
    if (['an', 'auf', 'aus', 'ein', 'mit', 'zu', 'ab', 'vor', 'nach', 'zurück', 'fern', 'los', 'weg', 'her', 'hin', 'fest', 'statt', 'teil', 'kennen'].includes(last) && !sub)
      lines.push(`Отделяемая приставка «${esc(toks[toks.length - 1])}» стоит в самом конце предложения.`);
    return `<div class="why">${lines.map(x => `<div>💡 ${x}</div>`).join('')}</div>`;
  }
};
function plainVowels(s) { return String(s).replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u'); }
