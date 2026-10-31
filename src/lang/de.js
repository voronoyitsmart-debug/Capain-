// Языковой пакет: немецкий. Всё, что зависит от языка: артикли, умлауты, спряжение,
// правила для объяснений ошибок и подписи интерфейса.
const L = {
  code: 'de',
  name: 'Deutsch Tag für Tag',
  storeKey: 'deutsch.v1',
  other: [{ flag: 'ro', t: 'Română zi de zi', d: 'Румынский язык — отдельный прогресс', href: 'ro/' }],
  tts: 'de-DE',
  voiceRe: /^de(-|_|$)/i,
  voicePref: /anna|helena|petra|markus|yannick|google/i,
  chars: ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'],
  persons: ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'],
  pron: ['ich', 'du', 'er', 'wir', 'ihr', 'sie'],
  ui: {
    inLang: 'по-немецки', adjCap: 'Немецкое', langGen: 'немецкого',
    greet(h) {
      if (h < 5) return ['Gute Nacht!', 'Доброй ночи'];
      if (h < 11) return ['Guten Morgen!', 'Доброе утро'];
      if (h < 18) return ['Guten Tag!', 'Добрый день'];
      if (h < 23) return ['Guten Abend!', 'Добрый вечер'];
      return ['Gute Nacht!', 'Доброй ночи'];
    },
    praise: ['Richtig!', 'Super!', 'Genau!', 'Toll!', 'Prima!', 'Klasse!'],
    wrong: ['Nicht ganz', 'Leider falsch'],
    verdict: pct => pct >= 90 ? 'Ausgezeichnet!' : pct >= 70 ? 'Gut gemacht!' : pct >= 50 ? 'Nicht schlecht!' : 'Weiter üben!',
    h: { words: 'Wortschatz', grammar: 'Grammatik', tests: 'Prüfungen', more: 'Mehr', verbs: 'Verben', reading: 'Lesen', dialogues: 'Dialoge',
      phrases: 'Sprachführer', stats: 'Statistik', ach: 'Erfolge', settings: 'Einstellungen', topicFav: 'Favoriten' },
    testsLead: 'Проверьте себя: тесты по уровням в формате Goethe / telc',
    placement: 'Einstufungstest',
    genderMode: { t: 'Der · Die · Das', d: 'Тренажёр артиклей' },
    genderTest: ['Артикли der · die · das', 'Самая частая ошибка — тренируйте отдельно'],
    genderQ: 'Какой артикль?',
    typeNoun: 'Напишите по-немецки с артиклем',
    voiceTest: 'Hallo! Ich helfe dir, Deutsch zu lernen.',
    voiceMissing: 'Немецкие голоса не найдены. На iPhone: Настройки → Универсальный доступ → Устный контент → Голоса → Немецкий.',
    missing: ans => `Не хватает умлаута: правильно <b>${esc(ans)}</b>. Умлаут меняет форму и смысл (schon — «уже», schön — «красивый»).`,
    translitOk: 'Засчитано. Попробуйте писать умлауты: ä ö ü ß',
    verbTenses: 'Präsens, Präteritum, Perfekt'
  },
  // правописание: ae/oe/ue/ss — допустимая замена умлаутов; пропуск умлаута — ошибка
  translit: s => s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss'),
  plain: s => s.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss'),
  hasDiacritics: s => /[äöü]/.test(s),
  missingOk: () => false,

  // ---- существительные ----
  genders: [{ id: 'der', html: 'der', cls: 'a-der' }, { id: 'die', html: 'die', cls: 'a-die' }, { id: 'das', html: 'das', cls: 'a-das' }],
  gender(w) { return w.t === 'n' ? splitArticle(w.de).art : ''; },
  lemma(w) { return splitArticle(w.de).lemma.replace(/^sich /, '').replace(/ \+.*$/, ''); },
  wordHTML(w) {
    if (w.t === 'n') {
      const { art, lemma } = splitArticle(w.de);
      if (art) return `<span class="art a-${art}">${art}</span> ${esc(lemma)}`;
    }
    return esc(w.de);
  },
  wordClass(w) { const a = this.gender(w); return a ? 'a-' + a : ''; },
  pluralShort(w) { return w.pl.replace(/^die /, ''); },
  canPlural(w) { return w.t === 'n' && w.pl && w.pl !== '-' && /^die \S+$/.test(w.pl) && !/\(Pl/.test(w.de); },
  pluralOptions(w) {
    const { lemma } = splitArticle(w.de);
    const correct = w.pl.replace(/^die /, '');
    const uml = s => s.replace(/(au|a|o|u)(?=[^aouäöü]*$)/i, m => ({ a: 'ä', o: 'ö', u: 'ü', au: 'äu', A: 'Ä', O: 'Ö', U: 'Ü', Au: 'Äu' }[m] || m));
    const base = lemma.replace(/e$/, '');
    const cands = [lemma + 'e', lemma + 'en', lemma + 'n', lemma + 'er', lemma + 's', uml(lemma) + 'e', uml(lemma) + 'er', lemma, uml(lemma), base + 'en', lemma + 'nen'];
    return { correct, wrong: uniq(cands).filter(c => c !== correct && c !== lemma + 'nn' && !/(.)\1\1/.test(c)), show: x => 'die ' + esc(x) };
  },
  // формы, которые могут встретиться в примере (для упражнения «пропуск»)
  gapForms(w) { return [this.lemma(w)]; },
  typeHint(w) {
    const { art, lemma } = splitArticle(w.de.replace(/\s*\(.*?\)/g, ''));
    return `Подсказка: ${art ? art + ' ' : ''}${esc(lemma.charAt(0))}${'·'.repeat(Math.max(0, lemma.length - 1))} (${lemma.length} букв)`;
  },
  // все допустимые написания ответа
  variants(de) {
    const out = new Set([de]);
    const noPar = de.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
    out.add(noPar);
    const noCase = noPar.replace(/\s*\+\s*(Akk|Dat|Gen)\.?/gi, '').trim();
    out.add(noCase);
    out.add(noCase.replace(/\b(etw|jdn|jdm|jds)\.\s*/g, '').replace(/\s+/g, ' ').trim());
    const m = /^(der|die|das)\/(der|die|das) (.+)$/.exec(noPar);
    if (m) { out.add(m[1] + ' ' + m[3]); out.add(m[2] + ' ' + m[3]); }
    const parts = noPar.split(/\s*(?:\/|,|;)\s*/).filter(Boolean);
    if (parts.length > 1 && parts.every(p => /^(der|die|das) /.test(p))) parts.forEach(p => out.add(p));
    return Array.from(out).filter(Boolean);
  },
  // ответы, которые засчитываются с пометкой
  soft(answers) {
    return answers.filter(a => /^sich /.test(a)).map(a => ({ a: a.replace(/^sich /, ''), note: `Засчитано, но глагол возвратный: <b>${esc(a)}</b>` }));
  },
  // поиск слова из текста в словаре
  lookupTries(t) { return [t.replace(/(en|n|e|s|er|es|em)$/, ''), t.replace(/e$/, ''), t + 'en', t + 'n']; },
  isTarget(txt) { return /[äöüßÄÖÜ]|\b(der|die|das|ich|du|er|sie|wir|ihr|ist|sind|habe|hat|nicht|ein|eine|den|dem|des)\b/i.test(txt) && !/[а-яё]/i.test(txt); },

  // ---- глаголы ----
  verbForms(v) { return v.praes.concat(v.praet); },
  verbSummary(v) { return v.perf; },
  tenses(v) {
    const parts = v.perf.split(' ');
    const aux = parts[0], rest = parts.slice(1).join(' ');
    return [
      { id: 'praes', label: 'Präsens', forms: v.praes },
      { id: 'praet', label: 'Präteritum', forms: v.praet },
      { id: 'perf', label: 'Perfekt', single: { p: 2, prefix: 'er', answers: aux.includes('/') ? aux.split('/').map(a => a + ' ' + rest) : [v.perf],
        reveal: esc(v.perf), say: 'er ' + v.perf, hint: 'напишите вспомогательный глагол и Partizip II' } }
    ];
  },
  pickTense(v) { return pick(v.lvl === 'A1' ? ['praes', 'praes', 'perf'] : ['praes', 'praet', 'perf']); },
  verbView(v) {
    return `<div class="table-wrap"><table class="conj"><thead><tr><th></th><th>Präsens</th><th>Präteritum</th></tr></thead><tbody>
      ${this.persons.map((x, i) => `<tr><td class="muted">${x}</td><td data-say="${esc(this.pron[i] + ' ' + v.praes[i])}"><b>${esc(v.praes[i])}</b></td><td data-say="${esc(this.pron[i] + ' ' + v.praet[i])}">${esc(v.praet[i])}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="kv"><div data-say="er ${esc(v.perf)}"><span>Perfekt</span><b>er ${esc(v.perf)}</b></div>
      ${v.imp ? `<div data-say="${esc(v.imp)}"><span>Imperativ</span><b>${esc(v.imp)}</b></div>` : ''}</div>`;
  },
  verbAll(v) { return [0, 1, 2, 3, 4, 5].map(p => ['praes', p]).concat([['praet', 0], ['praet', 3], ['perf', 2]]); },

  // если ответ — форма с другим артиклем или без него
  inputNoun(w, gn) {
    const { art, lemma } = splitArticle(w.de);
    const u = splitArticle(gn.replace(/^(der|die|das)(?=\S)/, '$1 '));
    if (norm(u.lemma) === norm(lemma) || gn === norm(lemma)) {
      return (u.art ? `Слово верное, но артикль другой: <b class="a-${art}">${art}</b> ${esc(lemma)}` : `Не хватает артикля: <b class="a-${art}">${art}</b> ${esc(lemma)}. Существительные учим сразу с артиклем.`) + this.explain.gender(w);
    }
    return '';
  },

  // ---- правила для объяснений ошибок ----
  explain: {
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
  }
};
function plainVowels(s) { return String(s).replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u'); }
