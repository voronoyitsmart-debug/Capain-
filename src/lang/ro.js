// Языковой пакет: румынский. Род (m/f/n) вместо артиклей der/die/das, диакритика ă â î ș ț,
// спряжение по временам prezent / perfect compus / imperfect / conjunctiv и правила для объяснений.
LANGS.ro = {
  code: 'ro',
  name: 'Română zi de zi',
  storeKey: 'romana.v1',
  tts: 'ro-RO',
  voiceRe: /^ro(-|_|$)/i,
  voicePref: /ioana|andrei|google/i,
  chars: ['ă', 'â', 'î', 'ș', 'ț', 'Ă', 'Â', 'Î', 'Ș', 'Ț'],
  persons: ['eu', 'tu', 'el/ea', 'noi', 'voi', 'ei/ele'],
  pron: ['eu', 'tu', 'el', 'noi', 'voi', 'ei'],
  ui: {
    inLang: 'по-румынски', adjCap: 'Румынское', langGen: 'румынского',
    greet(h) {
      if (h < 5) return ['Noapte bună!', 'Доброй ночи'];
      if (h < 11) return ['Bună dimineața!', 'Доброе утро'];
      if (h < 18) return ['Bună ziua!', 'Добрый день'];
      if (h < 23) return ['Bună seara!', 'Добрый вечер'];
      return ['Noapte bună!', 'Доброй ночи'];
    },
    praise: ['Corect!', 'Bravo!', 'Super!', 'Excelent!', 'Foarte bine!', 'Perfect!'],
    wrong: ['Nu chiar', 'Greșit'],
    verdict: pct => pct >= 90 ? 'Excelent!' : pct >= 70 ? 'Foarte bine!' : pct >= 50 ? 'Nu e rău!' : 'Mai exersează!',
    h: { words: 'Vocabular', grammar: 'Gramatică', tests: 'Teste', more: 'Mai mult', verbs: 'Verbe', reading: 'Lectură', dialogues: 'Dialoguri',
      phrases: 'Ghid de conversație', stats: 'Statistici', ach: 'Realizări', settings: 'Setări', topicFav: 'Favorite' },
    testsLead: 'Проверьте себя: тесты по уровням A1–C1 (по шкале CEFR)',
    placement: 'Test de plasare',
    genderMode: { t: 'Род: m · f · n', d: 'Мужской, женский, средний' },
    genderTest: ['Род существительных', 'Мужской, женский или средний (neutru)'],
    genderQ: 'Какой род?',
    typeNoun: 'Напишите по-румынски',
    voiceTest: 'Bună! Te ajut să înveți limba română.',
    voiceMissing: 'Румынские голоса не найдены. На iPhone: Настройки → Универсальный доступ → Устный контент → Голоса → Румынский (Ioana).',
    missing: ans => `Без диакритики: правильно <b>${esc(ans)}</b>. Диакритика различает слова (peste — «над», pește — «рыба»).`,
    translitOk: 'Засчитано',
    verbTenses: 'Prezent, perfect compus, imperfect, conjunctiv'
  },
  // без диакритики: в словах — засчитываем с пометкой, в грамматике и спряжении — ошибка
  translit: s => s,
  plain: s => s.replace(/[ăâ]/g, 'a').replace(/î/g, 'i').replace(/[șş]/g, 's').replace(/[țţ]/g, 't'),
  hasDiacritics: s => /[ăâîșțşţ]/.test(s),
  missingOk: strict => !strict,

  // ---- существительные ----
  genders: [
    { id: 'm', html: 'м. р.<small>un · doi</small>', cls: 'a-m' },
    { id: 'f', html: 'ж. р.<small>o · două</small>', cls: 'a-f' },
    { id: 'n', html: 'ср. р.<small>un · două</small>', cls: 'a-n' }
  ],
  gender(w) { return w.t === 'n' && ['m', 'f', 'n'].includes(w.g) ? w.g : ''; },
  lemma(w) {
    return String(w.de || '').replace(/\s*\([^)]*\)\s*/g, ' ').trim()
      .replace(/^a (se |își |își |-și )?/, '').replace(/^a-(și|și) /, '').trim();
  },
  pluralOnly(w) { return w.t === 'n' && (!w.pl || w.pl === '-') && /мн\./.test(w.ru); },
  wordHTML(w) {
    const g = this.gender(w);
    if (g && !this.pluralOnly(w)) return `<span class="art a-${g}">${g === 'f' ? 'o' : 'un'}</span> ${esc(w.de)}`;
    if (g) return `<span class="art a-${g}">${esc(w.de)}</span>`;
    return esc(w.de);
  },
  wordClass(w) { const g = this.gender(w); return g ? 'a-' + g : ''; },
  pluralShort(w) { return w.pl; },
  canPlural(w) { return w.t === 'n' && w.pl && w.pl !== '-' && !/\s/.test(w.pl) && !/\s/.test(w.de); },
  pluralOptions(w) {
    const lem = w.de, correct = w.pl;
    const stem = lem.replace(/(ea|ă|e|a|u)$/, '');
    const cands = [stem + 'e', stem + 'i', lem + 'uri', stem + 'uri', lem + 'i', lem + 'e', stem + 'ă', stem + 'ele', stem + 'ii', lem.replace(/ea$/, 'ele'), lem + 'le'];
    return { correct, wrong: uniq(cands).filter(c => c !== correct && c !== lem && c.length > 1), show: x => esc(x) };
  },
  // формы, которые могут встретиться в примере (для упражнения «пропуск»)
  gapForms(w) {
    const lem = this.lemma(w);
    if (w.t === 'n') return [lem, w.def, w.pl !== '-' ? w.pl : ''].filter(Boolean);
    if (w.t === 'adj' && w.forms) return w.forms.split(/,\s*/);
    if (w.t === 'v' && typeof C !== 'undefined' && C.verbByInf && C.verbByInf[w.de]) return [lem].concat(C.verbByInf[w.de].prez.map(f => f.split(' ').pop()));
    return [lem];
  },
  typeHint(w) {
    const lem = this.lemma(w), g = this.gender(w);
    return `Подсказка: ${g ? (g === 'f' ? 'o ' : 'un ') : ''}${esc(lem.charAt(0))}${'·'.repeat(Math.max(0, lem.length - 1))} (${lem.length} букв)`;
  },
  // все допустимые написания ответа
  variants(de) {
    const out = new Set([de]);
    const noPar = de.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
    out.add(noPar);
    if (/^a-și /.test(noPar)) out.add(noPar.replace(/^a-și /, 'a își '));
    if (/^a își /.test(noPar)) out.add(noPar.replace(/^a își /, 'a-și '));
    noPar.split(/\s*(?:\/|;)\s*/).filter(Boolean).forEach(p => out.add(p));
    return Array.from(out).filter(Boolean);
  },
  // существительное можно написать и с неопределённым артиклем
  extraAnswers(w) { const g = this.gender(w); return g && !this.pluralOnly(w) ? [(g === 'f' ? 'o ' : 'un ') + w.de] : []; },
  soft(answers) {
    return answers.filter(a => /^a /.test(a)).map(a => ({ a: a.replace(/^a /, ''), note: `Засчитано. Инфинитив пишется с частицей «a»: <b>${esc(a)}</b>` }));
  },
  // поиск слова из текста в словаре: снимаем артикль и окончания
  lookupTries(t) {
    const out = [];
    for (const e of ['ului', 'ilor', 'elor', 'urile', 'urilor', 'ul', 'le', 'lui', 'lor', 'uri', 'ei', 'ii', 'a', 'i', 'e']) {
      if (t.length > e.length + 2 && t.endsWith(e)) { const s = t.slice(0, -e.length); out.push(s, s + 'ă', s + 'e', s + 'u'); }
    }
    return out;
  },
  isTarget(txt) {
    return /[ăâîșțĂÂÎȘȚ]|\b(este|sunt|eu|tu|el|ea|noi|voi|nu|și|un|o|la|în|pe|cu|de|am|ai|are|mă|te)\b/i.test(txt) && !/[а-яё]/i.test(txt);
  },

  // ---- глаголы ----
  perfForms(v) { return v.perf || ['am', 'ai', 'a', 'am', 'ați', 'au'].map(a => a + ' ' + v.part); },
  verbForms(v) { return v.prez.concat(v.imperf); },
  verbSummary(v) { return this.perfForms(v)[0]; },
  tenses(v) {
    return [
      { id: 'prez', label: 'Prezent', forms: v.prez },
      { id: 'perf', label: 'Perfect compus', forms: this.perfForms(v) },
      { id: 'imperf', label: 'Imperfect', forms: v.imperf },
      { id: 'conj', label: 'Conjunctiv', single: { p: 2, prefix: 'el/ea', answers: [v.conj], reveal: esc(v.conj), say: v.conj, hint: 'напишите форму с «să»' } }
    ];
  },
  tenseOrder: ['prez', 'perf', 'imperf', 'conj'],   // от простого к сложному
  pickTense(v) {
    return pick(v.lvl === 'A1' ? ['prez', 'prez', 'perf'] : v.lvl === 'A2' ? ['prez', 'perf', 'perf', 'conj'] : ['prez', 'perf', 'imperf', 'conj']);
  },
  verbView(v) {
    const P = this.perfForms(v);
    return `<div class="table-wrap"><table class="conj"><thead><tr><th></th><th>Prezent</th><th>Perfect compus</th><th>Imperfect</th></tr></thead><tbody>
      ${this.persons.map((x, i) => `<tr><td class="muted">${x}</td><td data-say="${esc(this.pron[i] + ' ' + v.prez[i])}"><b>${esc(v.prez[i])}</b></td>
        <td data-say="${esc(this.pron[i] + ' ' + P[i])}">${esc(P[i])}</td><td data-say="${esc(this.pron[i] + ' ' + v.imperf[i])}">${esc(v.imperf[i])}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="kv"><div data-say="${esc(v.conj)}"><span>Conjunctiv · el/ea</span><b>${esc(v.conj)}</b></div>
      <div data-say="${esc(v.part)}"><span>Participiu</span><b>${esc(v.part)}</b></div>
      ${v.imp ? `<div data-say="${esc(v.imp)}"><span>Imperativ</span><b>${esc(v.imp)}</b></div>` : ''}</div>`;
  },
  verbAll(v) { return [0, 1, 2, 3, 4, 5].map(p => ['prez', p]).concat([['perf', 0], ['perf', 2], ['imperf', 0], ['imperf', 3], ['conj', 2]]); },

  // если вместо начальной формы написана форма с артиклем, мн. число или не тот un/o
  inputNoun(w, gn) {
    const g = this.gender(w), lem = w.de;
    if (w.def && gn === norm(w.def)) return `<div class="why"><div>💡 «${esc(w.def)}» — форма с определённым артиклем. Здесь нужна начальная форма: <b>${esc(lem)}</b>.</div></div>`;
    if (w.pl && w.pl !== '-' && gn === norm(w.pl)) return `<div class="why"><div>💡 «${esc(w.pl)}» — множественное число. Здесь нужно единственное: <b>${esc(lem)}</b>.</div></div>`;
    const m = /^(un|o) (.+)$/.exec(gn);
    if (m && norm(m[2]) === norm(lem) && g && (m[1] === 'o') !== (g === 'f')) {
      return `<div class="why"><div>Слово верное, но артикль другой: <b class="a-${g}">${g === 'f' ? 'o' : 'un'}</b> ${esc(lem)}.</div></div>` + this.explain.gender(w);
    }
    return '';
  },

  // ---- правила для объяснений ошибок ----
  explain: {
    gender(w) {
      const g = L.gender(w);
      if (!g) return '';
      const lem = w.de, pl = w.pl && w.pl !== '-' ? w.pl : '';
      const name = { m: 'мужского', f: 'женского', n: 'среднего' }[g];
      const lines = [];
      const vowelF = /(ă|ea|a|e)$/.test(lem);
      if (g === 'f' && vowelF) lines.push('Существительные на -ă, -e, -ea, -a почти всегда женского рода: o casă, o carte, o cafea.');
      else if (g === 'm' && /(ă|a)$/.test(lem)) lines.push(`На -ă/-a обычно женский род, но <b>${esc(lem)}</b> — мужского: это человек мужского пола (tată, papă, popă).`);
      else if (g === 'm' && /e$/.test(lem)) lines.push(`На -e бывает и мужской род: un ${esc(lem)}${pl ? ` — doi ${esc(pl)}` : ''} (как frate, câine, munte, pește).`);
      else if (g === 'n') lines.push(`Средний род (neutru) ведёт себя как мужской в ед. ч. и как женский во мн. ч.: un ${esc(lem)}${pl ? ` — două ${esc(pl)}` : ''}.${/uri$/.test(pl) ? ' Мн. ч. на -uri почти всегда означает средний род.' : ''}`);
      else if (g === 'm') lines.push(`Мужской род: un ${esc(lem)}${pl ? ` — doi ${esc(pl)}` : ''}. Мужского рода почти все слова о мужчинах и животных-самцах, многие деревья и названия месяцев.`);
      else if (g === 'f') lines.push(`Женский род: o ${esc(lem)}${pl ? ` — două ${esc(pl)}` : ''}.`);
      lines.push(`Проверка: m — un/doi, f — o/două, n — un/două. <b class="a-${g}">${esc(lem)}</b> — ${name} рода.`);
      return `<div class="why">${lines.map(x => `<div>💡 ${x}</div>`).join('')}</div>`;
    },
    plural(w) {
      const lem = w.de, pl = w.pl, g = L.gender(w);
      const lines = [`${esc(lem)} → <b>${esc(pl)}</b>`];
      if (/uri$/.test(pl)) lines.push('Окончание -uri — типично для среднего рода: tren → trenuri, lucru → lucruri.');
      else if (/ea$/.test(lem) && /ele$/.test(pl)) lines.push('Слова на -ea получают -ele: cafea → cafele, stea → stele.');
      else if (/i$/.test(pl) && g === 'm') lines.push('Мужской род получает -i: pom → pomi. Перед -i согласные часто меняются: t → ț (student → studenți), d → z (brad → brazi), s → ș, st → ști.');
      else if (/i$/.test(pl) && g === 'f') lines.push('Женский род на -e и часть слов на -ă получают -i: carte → cărți, bancă → bănci; гласная в корне может меняться (a → ă, oa → o).');
      else if (/e$/.test(pl) && g === 'f') lines.push('Многие слова женского рода на -ă получают -e: casă → case, fată → fete (с чередованием гласной).');
      else if (/e$/.test(pl) && g === 'n') lines.push('Средний род получает -e или -uri: scaun → scaune, oraș → orașe.');
      else lines.push('Особая форма множественного числа — её нужно запомнить.');
      const stem = s => s.replace(/(uri|ele|e|i|ă|a|u)$/, '');
      if (stem(pl) !== stem(lem) && !/uri$/.test(pl)) lines.push('Обратите внимание на чередование звуков в корне.');
      return `<div class="why">${lines.map((x, i) => `<div>${i ? '💡 ' : ''}${x}</div>`).join('')}</div>`;
    },
    verb(v, tense, p, given) {
      const PR = L.persons;
      const lines = [];
      const gn = norm(given || '');
      const T = L.tenses(v).find(t => t.id === tense);
      if (T && T.forms && gn) {
        const j = T.forms.findIndex(f => norm(f) === gn);
        if (j >= 0 && j !== p) lines.push(`«${esc(given)}» — это форма для <b>${PR[j]}</b>, а нужна для <b>${PR[p]}</b>.`);
        for (const o of L.tenses(v)) if (o.id !== tense && o.forms && o.forms.some(f => norm(f) === gn)) lines.push(`«${esc(given)}» — форма времени ${o.label}, а здесь нужно ${T.label}.`);
      }
      const ez = /(ez|esc|ăsc)$/.test(v.prez[0].split(' ').pop());
      if (tense === 'prez') {
        if (/^a (fi|avea|vrea|lua|da|sta|bea|ști|putea|veni|face|zice|duce|mânca)$/.test(v.inf)) lines.push(`${esc(v.inf)} — неправильный или частый глагол с особыми формами, их нужно запомнить.`);
        else if (ez) lines.push(`Глагол с суффиксом -ez/-esc: в ед. ч. и 3-м л. мн. ч. он добавляется (${esc(v.prez[0])}, ${esc(v.prez[1])}, ${esc(v.prez[2])}), а в «noi» и «voi» — нет (${esc(v.prez[3])}, ${esc(v.prez[4])}).`);
        else lines.push({ I: 'I спряжение (-a): eu cânt, tu cânți, el cântă, noi cântăm, voi cântați, ei cântă.', II: 'II спряжение (-ea): eu văd, tu vezi, el vede, noi vedem, voi vedeți, ei văd.',
          III: 'III спряжение (-e): eu merg, tu mergi, el merge, noi mergem, voi mergeți, ei merg.', IV: 'IV спряжение (-i/-î): eu dorm, tu dormi, el doarme, noi dormim, voi dormiți, ei dorm.' }[v.group] || '');
        if (p === 1 || p === 2) lines.push('В формах tu и el/ea корень часто меняется: port → porți → poartă, văd → vezi.');
      } else if (tense === 'perf') {
        lines.push(`Perfect compus = am, ai, a, am, ați, au + причастие <b>${esc(v.part)}</b>. Меняется только вспомогательный глагол.`);
        if (v.perf) lines.push('У возвратных глаголов местоимение сливается со вспомогательным: m-am, te-ai, s-a, ne-am, v-ați, s-au.');
        lines.push('Причастие: -a → -at (lucrat), -ea → -ut (văzut), -e → -s/-t/-ut (mers, fript, făcut), -i → -it (dormit), -î → -ât (hotărât).');
      } else if (tense === 'imperf') {
        lines.push('Imperfect: окончания -am, -ai, -a, -am, -ați, -au. Глаголы на -a: lucram, cântam; остальные: mergeam, vedeam, citeam.');
      } else if (tense === 'conj') {
        lines.push(`Conjunctiv в 3-м лице отличается от настоящего времени: у I спряжения окончание -e (să lucreze, să cânte), у остальных -ă (să meargă, să citească). Особые: să fie, să aibă, să vrea, să știe, să ia, să dea.`);
        if (!/^să /.test(gn) && gn) lines.push('Не забудьте частицу «să».');
      }
      return `<div class="why">${lines.filter(Boolean).map(x => `<div>💡 ${x}</div>`).join('')}</div>`;
    },
    order(q, given) {
      const toks = q.tokens.map(t => t.replace(/[.,!?;:„“"]/g, ''));
      const low = toks.map(t => t.toLowerCase());
      const g = (given || []).map(t => t.replace(/[.,!?;:„“"]/g, ''));
      const lines = [];
      const k = g.findIndex((t, i) => t !== toks[i]);
      if (k >= 0 && g.length) lines.push(`Расхождение с ${k + 1}-го слова: у вас «${esc(g[k] || '…')}», а нужно «${esc(toks[k])}».`);
      const CL = ['mă', 'te', 'îl', 'ne', 'vă', 'îi', 'le', 'îmi', 'îți', 'își', 'se', 'mi', 'ți', 'și'];
      const W = ['ce', 'cine', 'unde', 'când', 'cum', 'cât', 'câtă', 'câți', 'câte', 'care', 'încotro', 'de'];
      if (low.some(t => CL.includes(t) || /^(m|t|l|i|s|mi|ți|ni|vi|li|v|n)-/.test(t) || /-(l|o|i|le|mi|ți)$/.test(t)))
        lines.push('Безударные местоимения (mă, te, îl, o, îmi, îi, se…) стоят прямо перед глаголом: Îl văd. Mi-a spus. Te sun mâine.');
      if (low.includes('nu') || low.some(t => /^nu-/.test(t))) lines.push('Отрицание «nu» стоит перед глаголом и перед безударным местоимением: Nu îl văd (Nu-l văd).');
      if (low.includes('să')) lines.push('После «să» сразу идёт глагол (местоимение — между ними): să vin, să te văd.');
      if (q.tail === '?') {
        if (W.includes(low[0])) lines.push('В вопросе вопросительное слово стоит первым, за ним глагол: Unde lucrează Ana?');
        else lines.push('В вопросе «да/нет» порядок слов обычный — вопрос передаёт интонация: Ana lucrează azi?');
      }
      const adj = low.some(t => { const x = typeof C !== 'undefined' && C.lex[t]; return x && x.t === 'adj'; });
      if (adj) lines.push('Прилагательное обычно стоит после существительного: o casă mare, un om bun.');
      if (lines.length < 2) lines.push('Базовый порядок: подлежащее — глагол — дополнение (Ana citește o carte). Подлежащее-местоимение часто опускают: Citesc o carte.');
      return `<div class="why">${lines.map(x => `<div>💡 ${x}</div>`).join('')}</div>`;
    }
  },
  achTitles: {
    first: 'Primul pas', w10: 'Zece cuvinte', w50: 'Vocabular', w150: 'Șoarece de bibliotecă', w400: 'Lexicon', w1000: 'Maestrul cuvintelor',
    s3: 'Perseverență', s7: 'O săptămână', s30: 'Voință de fier', xp1k: 'O mie', xp5k: 'Cinci mii', perfect: 'Fără greșeli', perfect10: 'Perfecționist',
    gram3: 'Fan al gramaticii', gram15: 'Cunoscător', place: 'Test de plasare', tA1: 'A1 promovat', tA2: 'A2 promovat', tB1: 'B1 promovat',
    tB2: 'B2 promovat', tC1: 'C1 promovat', speed: 'Fulger', read5: 'Cititor pasionat', dial5: 'Vorbăreț', a100: 'O sută de răspunsuri',
    a1000: 'Harnic', night: 'Bufniță', early: 'Matinal'
  }
};
