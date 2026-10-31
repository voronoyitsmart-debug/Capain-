/* js/util.js */
// Языковые пакеты регистрируются в LANGS, выбранный язык — в L (назначается при входе)
const LANGS = {};
let L = null;

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
  return String(s || '').toLowerCase().replace(/ş/g, 'ș').replace(/ţ/g, 'ț').replace(/[’`´]/g, "'").replace(/[„“”«»"]/g, '')
    .replace(/[.!?,;:…¿¡]+/g, ' ').replace(/\s+/g, ' ').trim();
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
// Проверка ввода: 'ok' | 'umlaut' (ae вместо ä) | 'noumlaut' (умлаут пропущен) | 'typo' | 'bad'.
// strict — без скидки на опечатки (грамматика и спряжение: там одна буква и есть суть задания)
function checkAnswer(input, answers, strict) {
  const x = norm(input);
  if (!x) return 'bad';
  const list = answers.map(norm);
  if (list.includes(x)) return 'ok';
  if (list.some(a => L.translit(a) === L.translit(x))) return 'umlaut';
  if (list.some(a => L.hasDiacritics(a) && L.plain(a) === L.plain(x))) return 'noumlaut';
  if (!strict && list.some(a => a.length > 4 && lev(a, x) === 1)) return 'typo';
  return 'bad';
}

const ART = { der: 'der', die: 'die', das: 'das' };
function splitArticle(de) {
  const m = /^(der|die|das) (.+)$/.exec(de);
  return m ? { art: m[1], lemma: m[2] } : { art: '', lemma: de };
}
function artClass(de) { const a = splitArticle(de).art; return a ? 'a-' + a : ''; }
// Слово с цветом рода (артикль для немецкого, un/o для румынского) — из языкового пакета
function deHTML(w) { return L.wordHTML(w); }
function wClass(w) { return L.wordClass(w); }
function plural(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const LEVEL_NAMES = { A1: 'Начальный', A2: 'Элементарный', B1: 'Средний', B2: 'Выше среднего', C1: 'Продвинутый' };

/* lang/de.js */
// Языковой пакет: немецкий. Всё, что зависит от языка: артикли, умлауты, спряжение,
// правила для объяснений ошибок и подписи интерфейса.
LANGS.de = {
  code: 'de',
  name: 'Deutsch Tag für Tag',
  storeKey: 'deutsch.v1',
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
  tenseOrder: ['praes', 'perf', 'praet'],   // от простого к сложному
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

/* lang/ro.js */
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

/* js/store.js */
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

/* js/speech.js */
// Озвучка (Web Speech API) и звуки интерфейса
const Speech = {
  voices: [],
  ok: typeof window !== 'undefined' && 'speechSynthesis' in window,
  init() {
    if (!this.ok) return;
    const load = () => {
      this.voices = speechSynthesis.getVoices().filter(v => L.voiceRe.test(v.lang));
    };
    load();
    speechSynthesis.onvoiceschanged = load;
  },
  // лучший голос: выбранный пользователем, затем «улучшенные», затем de-DE
  voice() {
    const s = Store.state.settings;
    if (s.voice) { const v = this.voices.find(v => v.voiceURI === s.voice); if (v) return v; }
    const score = v => (/premium|enhanced|neural|natural/i.test(v.name) ? 4 : 0) + (v.lang.replace('_', '-') === L.tts ? 2 : 0) +
      (L.voicePref.test(v.name) ? 1 : 0);
    return this.voices.slice().sort((a, b) => score(b) - score(a))[0] || null;
  },
  // queue=true — не прерывать текущую речь
  say(text, opts = {}) {
    if (!this.ok || !text) return Promise.resolve();
    return new Promise(res => {
      if (!opts.queue) speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/\s*\(.*?\)\s*/g, ' ').replace(/\+ ?(Akk|Dat|Gen)\.?/g, ''));
      u.lang = L.tts;
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

/* js/adapt.js */
// Адаптивная сложность: 0 (разминка) … 4 (эксперт).
// После верных ответов растёт, после ошибок — откатывается назад, после двух ошибок подряд — сильнее.
const Adapt = {
  LABELS: ['Разминка', 'Легко', 'Средне', 'Сложно', 'Эксперт'],
  st() {
    const s = Store.state;
    if (!s.adapt || typeof s.adapt.d !== 'number') s.adapt = { d: 1, ok: 0, bad: 0 };
    return s.adapt;
  },
  on() { return Store.state.settings.adaptive !== false; },
  level() { return this.on() ? clamp(Math.round(this.st().d), 0, 4) : 2; },
  label() { return this.LABELS[this.level()]; },
  // насколько хорошо выучено слово: 0 новое … 4 выучено
  tier(w) { const b = Store.mastery(w.key); return b <= 0 ? 0 : b === 1 ? 1 : b <= 3 ? 2 : b === 4 ? 3 : 4; },
  // итоговая сложность вопроса по слову: больше всего решает текущий уровень ученика, меньше — знание слова
  eff(w) {
    if (!this.on()) return clamp(this.tier(w) + 1, 0, 4);
    return clamp(Math.round(0.65 * this.st().d + 0.35 * this.tier(w) + 0.15), 0, 4);
  },
  options(eff) { return eff <= 0 ? 3 : eff >= 4 ? 5 : 4; },
  // учесть ответ. Верно — сложнее (быстрый ответ — ещё сложнее), ошибка — чуть проще.
  // Если реально трудно (две ошибки подряд или три из последних пяти) — откат на целый уровень.
  // Возвращает 'up' | 'down' | 'rollback' | null
  answer(ok, ms) {
    if (!this.on()) return null;
    const a = this.st(), before = this.level();
    a.hist = (a.hist || []).concat([ok ? 1 : 0]).slice(-6);
    if (ok) { a.ok++; a.bad = 0; a.d += ms && ms < 6000 ? 0.3 : 0.2; }
    else {
      a.bad++; a.ok = 0;
      const recent = a.hist.slice(-5), wrong = recent.filter(x => !x).length;
      if (a.bad >= 2 || (recent.length >= 4 && wrong >= 3)) {
        a.d = Math.max(0, Math.min(a.d, before) - 1);
        a.bad = 0; a.hist = [];
        return 'rollback';
      }
      a.d -= 0.35;
    }
    a.d = clamp(a.d, 0, 4);
    const after = this.level();
    return after > before ? 'up' : after < before ? 'down' : null;
  },
  dots(n = this.level()) {
    return `<span class="dbars" title="Сложность: ${this.LABELS[n]}" aria-label="Сложность: ${this.LABELS[n]}">${[0, 1, 2, 3, 4].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;
  },

  // ---- Подсказка о смене уровня (A1 → A2 и обратно) ----
  noteSession(res) {
    const s = Store.state;
    if (!res.total || res.total < 8) return;
    s.recent = (s.recent || []).concat([{ lvl: s.level, pct: res.pct, d: this.st().d, t: Date.now() }]).slice(-8);
  },
  suggestion() {
    const s = Store.state, i = LEVELS.indexOf(s.level);
    if (s.lvlHint && s.lvlHint.lvl === s.level && Date.now() - s.lvlHint.t < 3 * DAY) return null;
    const mine = (s.recent || []).filter(r => r.lvl === s.level);
    const last = mine.slice(-4);
    const avg = last.length ? last.reduce((a, r) => a + r.pct, 0) / last.length : 0;
    const test = s.tests[s.level];
    if (i < LEVELS.length - 1 && ((last.length >= 4 && avg >= 90 && this.st().d >= 3.2) || (test && test.passed))) {
      return { dir: 'up', to: LEVELS[i + 1], why: test && test.passed ? `Тест ${s.level} сдан` : `Последние тренировки — в среднем ${Math.round(avg)}%` };
    }
    const low = mine.slice(-3);
    const lowAvg = low.length ? low.reduce((a, r) => a + r.pct, 0) / low.length : 100;
    if (i > 0 && low.length >= 3 && lowAvg < 50) {
      return { dir: 'down', to: LEVELS[i - 1], why: `Последние тренировки — в среднем ${Math.round(lowAvg)}%` };
    }
    return null;
  },
  dismiss() { Store.state.lvlHint = { lvl: Store.state.level, t: Date.now() }; Store.save(); }
};

/* js/explain.js */
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

/* js/modes.js */
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
// Движок учебной сессии: показывает вопросы, проверяет, объясняет ошибки, подстраивает сложность
const Engine = {
  s: null,
  start(cfg) {
    const qs = (cfg.questions || []).filter(Boolean);
    if (!qs.length && !cfg.gen) { UI.toast('Здесь пока нечего тренировать'); return; }
    Speech.stop();
    this.s = Object.assign({ mode: 'learn', requeue: true, xp: 5, title: 'Тренировка' }, cfg, {
      queue: qs.slice(), done: [], total: qs.length, correct: 0, combo: 0, maxCombo: 0, xpGained: 0,
      t0: Date.now(), cur: null, locked: false, adaptive: false
    });
    let el = $('#session');
    if (!el) { el = document.createElement('div'); el.id = 'session'; document.body.appendChild(el); }
    el.innerHTML = `<div class="ses-top">
        <button class="icon-btn" id="ses-close" aria-label="Закрыть">${ICON.close}</button>
        <div class="ses-bar"><i id="ses-prog"></i></div>
        <div class="ses-diff" id="ses-diff"></div>
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
    const p = s.gen ? (s.timeLimit ? 1 - (s.tEnd - Date.now()) / (s.timeLimit * 1000) : s.done.length / (s.totalHint || 30))
      : s.done.length / (s.done.length + s.queue.length + (s.cur ? 1 : 0) || 1);
    $('#ses-prog').style.width = (clamp(p, 0, 1) * 100) + '%';
    if (!s.timeLimit) {
      $('#ses-meta').innerHTML = s.combo >= 3 ? `<span class="combo">${ICON.bolt}${s.combo}</span>`
        : `<span class="count">${s.gen ? s.done.length + 1 : Math.min(s.done.length + 1, s.total) + '/' + s.total}</span>`;
    }
    const d = $('#ses-diff');
    if (d) d.innerHTML = s.diffDots ? s.diffDots() : s.adaptive && Adapt.on() && s.mode === 'learn' ? Adapt.dots() : '';
  },
  next() {
    const s = this.s; if (!s) return;
    s.locked = false;
    let q = null;
    // вопросы по словам строятся в момент показа — с учётом текущей сложности
    while (!q) {
      let item = s.gen ? s.gen() : s.queue.shift();
      if (item === undefined || item === null) { if (s.gen || !s.queue.length) break; continue; }
      q = typeof item === 'function' ? item() : item;
      if (s.gen) break;
    }
    if (!q) return this.finish();
    if (q.adapt) s.adaptive = true;
    s.note = null;
    s.cur = q; q._t0 = Date.now();
    this.progress();
    const body = $('#ses-body'), foot = $('#ses-foot');
    foot.innerHTML = ''; foot.className = 'ses-foot';
    body.className = 'ses-body kind-' + q.kind;
    body.innerHTML = '';
    this['r_' + q.kind].call(this, q, body, foot);
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
      return this.record(q, ok, q.options[i].html, () => setTimeout(() => this.next(), 220), false, ok ? '' : this.choiceWhy(q, i));
    }
    btns.forEach((b, j) => { b.disabled = true; if (j === q.a) b.classList.add('right'); else if (j === i) b.classList.add('wrong'); else b.classList.add('dim'); });
    const why = ok ? '' : this.choiceWhy(q, i);
    this.record(q, ok, q.options[i].html, null, false, why);
    if (s.mode === 'speed') return setTimeout(() => this.next(), ok ? 280 : 1100);
    this.feedback(q, ok, ok ? '' : `Правильно: <b>${q.options[q.a].html}</b>` + why, false,
      !ok && q.style !== 'articles' ? { kind: 'choice', i } : null);
  },
  choiceWhy(q, i) {
    const w = Explain.choice(q, i);
    return w || `<div class="why"><div>Вы выбрали: <s>${q.options[i].html}</s></div></div>`;
  },

  // ---------- Ввод текста ----------
  r_input(q, body, foot) {
    body.innerHTML = this.head(q) + `
      <div class="inp-wrap">${q.prefix ? `<span class="inp-prefix">${esc(q.prefix)}</span>` : ''}
        <input id="ans" class="inp" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="Ваш ответ" aria-label="Ваш ответ"></div>
      <div class="uml">${L.chars.map(c => `<button data-c="${c}">${c}</button>`).join('')}</div>`;
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
      const r = this.checkInput(q, v);
      this.s.locked = true;
      inp.disabled = true;
      inp.classList.add(r.ok ? 'right' : 'wrong');
      const why = r.ok ? '' : (r.note ? `<div class="note">${r.note}</div>` : '') + Explain.input(q, v);
      this.record(q, r.ok, esc(v), null, false, why);
      if (this.s.mode === 'exam') return this.next();
      this.feedback(q, r.ok, (r.ok && !r.note ? '' : `Ответ: <b>${q.reveal}</b>`) + (r.ok && r.note ? `<div class="note">${r.note}</div>` : '') + why,
        r.warn, r.ok ? null : { kind: 'input', given: v });
    };
    $('#check').onclick = submit;
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    $('#dontknow').onclick = () => {
      if (this.s.locked) return; this.s.locked = true; inp.disabled = true;
      const why = q.verb ? Explain.verb(q.verb, q.tense, q.person, '') : (q.w && q.w.t === 'n' ? Explain.gender(q.w) : '');
      this.record(q, false, '—', null, false, why);
      this.feedback(q, false, `Ответ: <b>${q.reveal}</b>` + why);
    };
    setTimeout(() => inp.focus(), 60);
  },
  // проверка письменного ответа: точный ответ → принятые ранее → «мягкие» → синонимы
  checkInput(q, v) {
    let res = checkAnswer(v, q.answers, q.strict);
    if (res === 'ok') return { ok: true };
    if (res === 'noumlaut') return L.missingOk(q.strict) ? { ok: true, warn: true, note: L.ui.missing(q.answers[0]) } : { ok: false, note: L.ui.missing(q.answers[0]) };
    if (res === 'typo') return { ok: true, warn: true, note: 'Засчитано, но есть опечатка — сравните с ответом выше' };
    if (res === 'umlaut') return { ok: true, warn: true, note: L.ui.translitOk };
    if (q.accepted && q.accepted.length && checkAnswer(v, q.accepted, true) === 'ok') return { ok: true, note: 'Засчитано — этот вариант вы раньше отметили как верный' };
    for (const s of q.soft || []) if (['ok', 'umlaut'].includes(checkAnswer(v, [s.a], q.strict))) return { ok: true, warn: true, note: s.note };
    for (const x of q.synonyms || []) {
      if (['ok', 'umlaut'].includes(checkAnswer(v, C.variants(x.de), true))) return { ok: true, warn: true, note: `Тоже верно: ${deHTML(x)} — «${esc(x.ru)}». Здесь загадано слово ${deHTML(q.w)}.` };
    }
    return { ok: false };
  },

  // ---------- Сборка предложения ----------
  r_order(q, body, foot) {
    const bank = shuffle(q.tokens.map((t, i) => ({ t, i })));
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
    const right = esc(q.tokens.join(' ') + q.tail);
    $('#check').onclick = () => {
      if (this.s.locked) return;
      this.s.locked = true;
      const given = $$('.tok', ans).map(t => t.textContent);
      const g = norm(given.join(' '));
      let ok = g === norm(q.tokens.join(' ')), note = '';
      if (!ok && (q.alts || []).some(a => norm(a) === g)) { ok = true; note = `Тоже верно! Основной вариант: <b>${right}</b>`; }
      if (!ok && (q.accepted || []).includes(g)) { ok = true; note = 'Засчитано — этот вариант вы раньше отметили как верный'; }
      ans.classList.add(ok ? 'right' : 'wrong');
      const why = ok ? '' : Explain.order(q, given);
      this.record(q, ok, esc(given.join(' ')), null, false, why);
      if (this.s.mode === 'exam') return this.next();
      this.feedback(q, ok, (ok ? '' : `Правильно: <b>${right}</b>`) + (note ? `<div class="note">${note}</div>` : '') + why, false,
        ok ? null : { kind: 'order', given: given.join(' ') });
    };
    $('#dontknow').onclick = () => {
      if (this.s.locked) return; this.s.locked = true;
      const why = Explain.order(q, []);
      this.record(q, false, '—', null, false, why);
      this.feedback(q, false, `Правильно: <b>${right}</b>` + why);
    };
  },

  // ---------- Карточка ----------
  r_flash(q, body, foot) {
    const w = q.w;
    const tag = { n: 'существительное', v: 'глагол', adj: 'прилагательное', adv: 'наречие', phr: 'фраза', other: 'слово' }[w.t] || '';
    body.innerHTML = `<div class="flash" id="flash" tabindex="0" role="button" aria-label="Перевернуть карточку">
      <div class="flash-in">
        <div class="face front ${wClass(w)}">
          <div class="f-tag">${tag} · ${w.lvl}</div>
          <div class="f-word">${deHTML(w)}</div>
          ${w.t === 'n' && w.pl && w.pl !== '-' ? `<div class="f-pl">${esc(w.pl)}</div>` : ''}
          <div class="f-hint">Нажмите, чтобы перевернуть</div>
        </div>
        <div class="face back ${wClass(w)}">
          <div class="f-tag">${deHTML(w)}</div>
          <div class="f-ru">${esc(w.ru)}</div>
          ${w.ex && w.ex !== w.de ? `<div class="f-ex"><button class="mini-audio" data-say="${esc(w.ex)}">${ICON.sound}</button><div>${esc(w.ex)}<div class="muted">${esc(w.exRu || '')}</div></div></div>` : ''}
          ${w.t === 'n' ? Explain.gender(w) : ''}
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
    if (ok) { s.correct++; Store.fixMistake(q.key); this.gain(3); } else if (s.requeue && !q._re) { s.queue.push(Object.assign({}, q, { _re: true })); }
    s.done.push({ q, ok, given: ['не знаю', 'трудно', 'знаю', 'легко'][g] });
    Store.save();
    this.next();
  },

  // ---------- Пары ----------
  r_match(q, body) {
    const L = shuffle(q.pairs.map((p, i) => ({ i, h: p.lh || esc(p.l), say: p.l })));
    const R = shuffle(q.pairs.map((p, i) => ({ i, h: esc(p.r) })));
    body.innerHTML = this.head(q) + `<div class="match"><div class="mcol">${L.map(x => `<button class="mt" data-side="l" data-i="${x.i}" data-s="${esc(x.say)}">${x.h}</button>`).join('')}</div>
      <div class="mcol">${R.map(x => `<button class="mt" data-side="r" data-i="${x.i}">${x.h}</button>`).join('')}</div></div>
      <div class="match-why" id="match-why" aria-live="polite"></div>`;
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
        // объясняем, что на самом деле значит выбранная пара
        const l = a.dataset.side === 'l' ? a : b, r = a.dataset.side === 'r' ? a : b;
        const pl = q.pairs[+l.dataset.i], pr = q.pairs[+r.dataset.i];
        $('#match-why').innerHTML = `<b>${pl.lh || esc(pl.l)}</b> — «${esc(pl.r)}», а «${esc(pr.r)}» — <b>${pr.lh || esc(pr.l)}</b>`;
        Sound.bad();
      }
    });
  },

  // ---------- Учёт ответа ----------
  record(q, ok, given, after, silent, why) {
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
    // адаптивная сложность: верно — сложнее, ошибка — шаг назад, «реально трудно» — откат на уровень
    if (q.adapt && s.mode === 'learn' && !q._re) {
      const ch = Adapt.answer(ok, Date.now() - (q._t0 || Date.now()));
      if (ch === 'rollback') {
        this.notify({ type: 'down', text: `Похоже, сейчас трудно — откатываемся: ${Adapt.label()}` });
        // проблемное слово сразу спросим в самой лёгкой форме, а потом ещё раз — в конце
        if (q.w && !s.gen) s.queue.unshift(() => Object.assign(Q.deRu(q.w, C.topicWords(q.w.topic), 0), { _re: true, label: 'Повторим попроще' }));
      } else if (ch === 'up') this.notify({ type: 'up', text: `Сложнее ↑ ${Adapt.label()}` });
      else if (ch === 'down') this.notify({ type: 'down', text: `Проще ↓ ${Adapt.label()}` });
    }
    // собственная адаптивность режима (например, уроки грамматики)
    if (s.onAnswer && q.kind !== 'pair' && !q._re) { const r = s.onAnswer(q, ok); if (r) this.notify(r); }
    if (q.kind !== 'pair') s.done.push({ q, ok, given, why });
    Store.save();
    this.progress();
    if (after) after();
  },
  // сообщение о смене сложности: значок над вопросом и строка в разборе ответа
  notify(r) {
    const pill = document.createElement('span');
    pill.className = 'diff-pill ' + (r.type === 'up' ? 'up' : 'down');
    pill.textContent = r.text;
    $('#ses-body').prepend(pill);
    setTimeout(() => pill.remove(), 2600);
    if (this.s) this.s.note = r;
  },
  gain(n) { this.s.xpGained += n; Store.addXP(n); },

  feedback(q, ok, html, warn, override) {
    const foot = $('#ses-foot');
    foot.className = 'ses-foot fb ' + (ok ? (warn ? 'fb-warn' : 'fb-ok') : 'fb-bad');
    const title = ok ? (warn ? 'Засчитано' : pick(L.ui.praise)) : pick(L.ui.wrong);
    const sayTxt = q.sayAfter || (q.kind === 'input' || q.kind === 'order' ? q.say : null);
    const lesson = q.lesson && C.grammar.find(g => g.id === q.lesson);
    const canOverride = override && this.s.mode === 'learn';
    const note = this.s.note; this.s.note = null;
    foot.innerHTML = `<div class="fb-box">
        ${note ? `<div class="adapt-note ${note.type}">${esc(note.text)}</div>` : ''}
        <div class="fb-head"><span class="fb-ic">${ok ? ICON.check : ICON.x}</span><b>${title}</b>
        ${sayTxt ? `<button class="mini-audio" id="fb-say" aria-label="Послушать">${ICON.sound}</button>` : ''}</div>
        ${html ? `<div class="fb-ans">${html}</div>` : ''}
        ${q.explain ? `<div class="fb-ex">${q.explain}</div>` : ''}
      </div>
      <div class="row gap8 wrap">${canOverride ? `<button class="btn ghost sm" id="override">Мой ответ тоже верный</button>` : ''}
        ${lesson && !ok ? `<button class="btn ghost sm" id="rule">${ICON.grammar} Правило</button>` : ''}
        <button class="btn primary grow" id="next">Дальше</button></div>`;
    if (sayTxt) { $('#fb-say').onclick = () => Speech.say(sayTxt); if (ok && Store.state.settings.autoplay && !q.autoplay) Speech.say(sayTxt); }
    $('#next').onclick = () => this.next();
    if (lesson && !ok) $('#rule').onclick = () => {
      const m = UI.sheet(`<div class="sheet-h"><h3 class="display">${esc(lesson.title)}</h3><button class="icon-btn" data-close aria-label="Закрыть">${ICON.close}</button></div><div class="lesson-body">${lesson.content}</div>`);
      m.querySelector('.sheet-card').classList.add('tall');
    };
    if (canOverride) $('#override').onclick = () => this.override(q, override);
    setTimeout(() => $('#next') && $('#next').focus({ preventScroll: true }), 50);
  },
  // «Мой ответ тоже верный»: засчитываем и запоминаем, чтобы больше не считать это ошибкой
  override(q, o) {
    const s = this.s, st = Store.state, last = s.done[s.done.length - 1];
    if (o.kind === 'choice' && q.optWords && q.w) {
      st.badPairs = st.badPairs || {};
      st.badPairs[q.w.key + '|' + q.optWords[o.i].key] = 1;
    } else if (q.key && (o.kind === 'input' || o.kind === 'order')) {
      st.accepted = st.accepted || {};
      const list = st.accepted[q.key] = st.accepted[q.key] || [];
      const g = norm(o.given); if (!list.includes(g)) list.push(g);
    }
    st.reports = (st.reports || []).concat([{ key: q.key || '', given: o.given || (q.options && q.options[o.i] && q.options[o.i].html) || '', t: Date.now() }]).slice(-200);
    if (last && !last.ok) {
      last.ok = true; last.why = ''; s.correct++;
      if (q.key) { Store.fixMistake(q.key); if (q.srs) Store.srsGrade(q.key, 2); }
      const k = s.queue.findIndex(x => x.key === q.key && x._re); if (k >= 0) s.queue.splice(k, 1);
      if (q.adapt) { const a = Adapt.st(); a.d = clamp(a.d + 0.4, 0, 4); a.bad = 0; }
    }
    Store.save();
    UI.toast(o.kind === 'choice' ? 'Засчитано. Эти варианты больше не будут стоять вместе' : 'Засчитано. Этот ответ теперь будет приниматься', 2200);
    this.next();
  },

  // ---------- Итоги ----------
  finish() {
    const s = this.s; if (!s || s.finished) return;
    s.finished = true;
    if (s.timer) clearInterval(s.timer);
    Speech.stop();
    const firstTry = s.done.filter(d => !d.q._re);
    const total = s.gen ? s.done.length : firstTry.length;
    const correct = firstTry.filter(d => d.ok).length;
    const pct = total ? Math.round(correct / total * 100) : 0;
    const secs = Math.round((Date.now() - s.t0) / 1000);
    Store.state.stats.sessions++;
    if (pct === 100 && total >= 5) Store.state.stats.perfect++;
    const res = { correct, total, pct, secs, xp: s.xpGained, maxCombo: s.maxCombo, done: s.done };
    if (s.adaptive && s.mode === 'learn') Adapt.noteSession(res);
    Store.save();
    const custom = s.onFinish ? s.onFinish(res) : null;
    Ach.check();
    if (pct >= 90 && total >= 5) { UI.confetti(); Sound.done(); }
    const wrong = s.done.filter(d => !d.ok && d.q.kind !== 'match' && d.q.kind !== 'flash');
    const uniqWrong = []; const seen = new Set();
    wrong.forEach(d => { const k = d.q.key || d.q.prompt; if (!seen.has(k)) { seen.add(k); uniqWrong.push(d); } });
    const verdict = L.ui.verdict(pct);
    const sug = Adapt.suggestion();
    const body = $('#ses-body'), foot = $('#ses-foot');
    $('#ses-prog').style.width = '100%';
    $('#ses-meta').innerHTML = '';
    $('#ses-diff').innerHTML = '';
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
        <div>${s.adaptive && Adapt.on() ? `<b class="res-diff">${Adapt.dots()}</b><span>${Adapt.label()}</span>` : `<b>${s.maxCombo}</b><span>серия</span>`}</div>
      </div>
      ${sug ? Screens.levelCard(sug) : ''}
      ${custom && custom.html ? custom.html : ''}
      ${uniqWrong.length ? `<h3 class="res-h">Разбор ошибок · ${uniqWrong.length}</h3><div class="res-list">${uniqWrong.slice(0, 40).map(d => this.reviewItem(d)).join('')}</div>` : ''}
      ${s.mode === 'exam' ? `<h3 class="res-h">Все ответы</h3><div class="res-list">${s.done.map(d => this.reviewItem(d)).join('')}</div>` : ''}`;
    if (sug) Screens.bindLevelCard(body);
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
    const prompt = q.kind === 'choice' && q.listen ? deHTML(q.w) : (q.prompt || '').replace(/<button[\s\S]*?<\/button>/g, q.say ? esc(q.say) : '').replace(/<div class="q-hint">[\s\S]*?<\/div>/, '');
    return `<div class="rv ${d.ok ? 'ok' : 'bad'}"><div class="rv-q">${prompt}</div>
      ${!d.ok && d.given ? `<div class="rv-a">Ваш ответ: <s>${d.given}</s></div>` : ''}<div class="rv-r">${ICON.check}<span>${right}</span></div>
      ${!d.ok && d.why ? `<div class="rv-e">${d.why}</div>` : ''}
      ${!d.ok && q.explain && !q.w ? `<div class="rv-e">${q.explain}</div>` : ''}</div>`;
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
  // у каждого языка свои названия достижений
  applyTitles() { if (L.achTitles) ACH.forEach(a => { if (L.achTitles[a.id]) a.t = L.achTitles[a.id]; }); },
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
  get article() { return { t: L.ui.genderMode.t, d: L.ui.genderMode.d, ic: 'layers' }; },
  plural: { t: 'Мн. число', d: 'Формы plural', ic: 'shuffle' },
  gap: { t: 'Пропуски', d: 'Слово в контексте', ic: 'gap' },
  order: { t: 'Собери фразу', d: 'Порядок слов', ic: 'puzzle' },
  dictation: { t: 'Диктант', d: 'Услышь и собери', ic: 'ear' },
  match: { t: 'Пары', d: 'Найди соответствия', ic: 'pairs' },
  speed: { t: 'Скорость', d: '60 секунд', ic: 'timer' }
};

const Train = {
  // слова, подходящие для общего режима
  // уже начатые слова + слова не выше уровня пользователя
  globalPool(filter) {
    let started = C.words.filter(w => Store.mastery(w.key) > 0 && C.atLevel(w));
    if (filter) started = started.filter(filter);
    if (started.length >= 12) return started;
    const lv = Store.state.level;
    let lvl = C.words.filter(w => C.atLevel(w));
    if (filter) lvl = lvl.filter(filter);
    // сначала слова своего уровня, потом ниже
    const mine = lvl.filter(w => w.lvl === lv && !started.includes(w)), lower = lvl.filter(w => w.lvl !== lv && !started.includes(w));
    return started.concat(sample(mine, 30), sample(lower, 15));
  },
  // подбор слов для режима: сначала «срочные» и слабые
  pickWords(pool, n) {
    const now = Date.now();
    // сначала «срочные» и слабые, слова выше уровня пользователя — в последнюю очередь
    const score = w => { const r = Store.srsGet(w.key); const above = C.atLevel(w) ? 0 : 3;
      if (!r) return above + 1 + Math.random(); return above + (r.due <= now ? 0 : 2) + r.b * 0.3 + Math.random() * 0.8; };
    return pool.slice().sort((a, b) => score(a) - score(b)).slice(0, n);
  },
  // Вопросы строятся в момент показа (функции), чтобы учитывать сложность, набранную по ходу тренировки
  build(mode, pool, n) {
    const lazy = (ws, f) => ws.map(w => () => f(w) || Q.deRu(w, pool));
    switch (mode) {
      case 'flash': return this.pickWords(pool, Math.min(n || 15, pool.length)).map(w => Q.flash(w));
      case 'quiz': return lazy(this.pickWords(pool, n || 12), w => Adapt.eff(w) >= 2 || Math.random() < .4 ? Q.ruDe(w, pool) : Q.deRu(w, pool));
      case 'listen': return lazy(this.pickWords(pool, n || 12), w => Adapt.eff(w) >= 4 && Math.random() < .5 ? Q.make('typeListen', w, pool) : Q.listen(w, pool));
      case 'write': return lazy(this.pickWords(pool, n || 10), w => Q.type(w));
      case 'article': return this.pickWords(pool.filter(w => w.t === 'n' && L.gender(w)), n || 15).map(w => () => Q.article(w));
      case 'plural': return lazy(this.pickWords(pool.filter(w => Q.canPlural(w)), n || 12), w => Q.pluralForms(w));
      case 'gap': return lazy(this.pickWords(pool.filter(w => Q.gapToken(w)), n || 10), w => Q.gap(w, pool));
      case 'order': return lazy(this.pickWords(pool.filter(w => w.ex), n || 8), w => Q.make('orderEx', w, pool));
      case 'dictation': return lazy(this.pickWords(pool.filter(w => w.ex), n || 8), w => Q.make('dictation', w, pool));
      case 'match': {
        const out = []; let src = this.pickWords(pool, 30);
        while (out.length < 3 && src.length >= 4) {
          const set = Q.matchSet(src, 6);
          if (set.length < 4) break;
          out.push(Q.match(set));
          src = src.filter(w => !set.includes(w));
        }
        return out;
      }
      case 'mix': return this.pickWords(pool, n || 12).map(w => () => Q.forWord(w, pool));
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
    // если сейчас трудно — меньше новых слов, если легко — больше
    const per = [3, 4, 6, 7, 8][Adapt.level()];
    const want = Math.min(newLeft, per);
    let fresh = [];
    if (want) {
      const lv = s.level, li = LEVELS.indexOf(lv);
      const order = [];
      if (s.lastTopic && C.topicById[s.lastTopic] && LEVELS.indexOf(C.topicById[s.lastTopic].level) <= li) order.push(C.topicById[s.lastTopic]);
      C.topics.filter(t => t.level === lv).forEach(t => order.push(t));
      C.topics.filter(t => LEVELS.indexOf(t.level) < li).forEach(t => order.push(t));
      C.topics.forEach(t => order.push(t));
      // сначала слова ровно своего уровня, потом ниже; выше уровня — никогда
      for (const pass of [w => w.lvl === lv, w => LEVELS.indexOf(w.lvl) < li]) {
        for (const t of uniq(order)) {
          for (const w of t.words) {
            if (fresh.length >= want) break;
            if (!s.srs[w.key] && pass(w) && !fresh.includes(w)) fresh.push(w);
          }
          if (fresh.length >= want) break;
        }
        if (fresh.length >= want) break;
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
    dueWords.forEach((w, i) => { qs.splice(Math.min(qs.length, i * 2 + 1), 0, () => Q.forWord(w)); });
    // новое слово закрепляем сразу после знакомства: сначала узнать, затем вспомнить
    later.forEach(w => qs.push(() => Q.forWord(w, null, Adapt.level() >= 3 ? 'ruDe' : pick(['deRu', 'listen']))));
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
  // Урок грамматики подстраивается по ходу: выбор варианта → ввод ответа → порядок слов.
  // Верные ответы поднимают уровень заданий, две ошибки подряд возвращают к выбору варианта.
  grammar(id) {
    const g = C.grammar.find(x => x.id === id);
    const TYPES = ['choice', 'input', 'order'], NAMES = ['выбор варианта', 'ввод ответа', 'порядок слов'];
    const pools = { choice: [], input: [], order: [] };
    shuffle(g.exercises).forEach(x => (pools[x.type] || pools.choice).push(x));
    const prev = Store.state.grammar[id];
    let lvl = prev && prev.best >= 80 ? 1 : 0, bad = 0;
    const take = () => {
      const k = Math.round(clamp(lvl, 0, 2));
      const order = TYPES.map((t, i) => [Math.abs(i - k) + (i > k ? 0.1 : 0), t]).sort((a, b) => a[0] - b[0]).map(p => p[1]);
      for (const t of order) if (pools[t].length) return Q.fromExercise(pools[t].shift());
      return null;
    };
    Engine.start({
      title: g.title, questions: g.exercises.map(() => take), xp: 6, retry: () => this.grammar(id),
      diffDots: () => Adapt.dots(Math.round(clamp(lvl, 0, 2) * 2)),
      onAnswer: (q, ok) => {
        const before = Math.round(lvl);
        if (ok) {
          bad = 0; lvl = Math.min(2, lvl + 0.5);
          if (Math.round(lvl) > before) return { type: 'up', text: `Сложнее ↑ дальше: ${NAMES[Math.round(lvl)]}` };
        } else {
          bad++;
          if (bad >= 2 && lvl > 0) { lvl = 0; bad = 0; return { type: 'down', text: 'Похоже, трудно — вернёмся к выбору вариантов. Загляните в «Правило».' }; }
          lvl = Math.max(0, lvl - 0.5);
          if (Math.round(lvl) < before) return { type: 'down', text: `Проще ↓ дальше: ${NAMES[Math.round(lvl)]}` };
        }
        return null;
      },
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
    const PER = 8, NEED = 6;
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
  // Спряжение подстраивается: сначала настоящее время и частые лица, потом прошедшие, на высоком уровне — все времена
  verbs(list, title) {
    list = list && list.length ? list : C.verbs.filter(v => LEVELS.indexOf(v.lvl) <= LEVELS.indexOf(Store.state.level));
    if (!list.length) list = C.verbs;
    const qs = Array.from({ length: 12 }, () => {
      const v = pick(list);
      return () => {
        const lv = Adapt.level(), order = L.tenseOrder;
        const allowed = order.slice(0, [1, 1, 2, Math.min(3, order.length), order.length][lv]);
        const t = pick(allowed), T = L.tenses(v).find(x => x.id === t);
        const p = T && T.single ? null : lv <= 1 ? pick([0, 1, 2]) : rnd(6);
        return Object.assign(Q.verbQ(v, t, p), { adapt: true });
      };
    });
    Engine.start({ title: title || 'Спряжение глаголов', questions: qs, xp: 6, retry: () => this.verbs(list, title) });
  },
  verbAll(v) {
    const qs = shuffle(L.verbAll(v).map(([t, p]) => Q.verbQ(v, t, p)));
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
const greet = () => L.ui.greet(new Date().getHours());
const levelFilter = (cur, extra = []) => `<div class="chips" role="tablist">${[['all', 'Все']].concat(LEVELS.map(l => [l, l]), extra).map(([v, l]) =>
  `<button class="chip ${cur === v ? 'on' : ''}" data-filter="${v}">${l}</button>`).join('')}</div>`;

const Screens = {
  levelCard(sug) {
    return `<section class="card lvl-sug ${sug.dir}">
      <div class="eyebrow">${sug.dir === 'up' ? 'Пора двигаться дальше' : 'Можно сделать шаг назад'}</div>
      <b>${sug.dir === 'up' ? `Уровень ${Store.state.level} даётся легко. Перейти на ${sug.to}?` : `Уровень ${Store.state.level} пока тяжело даётся. Вернуться на ${sug.to}?`}</b>
      <small class="muted">${esc(sug.why)}. Новые слова и подборки будут уровня ${sug.to}.</small>
      <div class="row gap8 wrap"><button class="btn sm primary" data-lvlset="${sug.to}">Перейти на ${sug.to}</button><button class="btn sm ghost" data-lvlno>Позже</button></div>
    </section>`;
  },
  bindLevelCard(root) {
    $$('[data-lvlset]', root).forEach(b => b.onclick = () => { Store.state.level = b.dataset.lvlset; App.mem = {}; Store.save(); UI.toast(`Уровень ${b.dataset.lvlset} включён`); const c = b.closest('.lvl-sug'); if (c) c.remove(); if (!Engine.s) App.refresh(); });
    $$('[data-lvlno]', root).forEach(b => b.onclick = () => { Adapt.dismiss(); const c = b.closest('.lvl-sug'); if (c) c.remove(); });
  },
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
      ${(() => { const sg = Adapt.suggestion(); return sg ? Screens.levelCard(sg) : ''; })()}
      <button class="cta" data-run="smart">
        <div class="cta-t"><span class="eyebrow">Ежедневная тренировка</span>
          <b>${plan.due.length || plan.fresh.length ? 'Начать занятие' : 'Повторить слова'}</b>
          <span>${plan.due.length} на повторение · ${plan.fresh.length} ${plural(plan.fresh.length, 'новое слово', 'новых слова', 'новых слов')} · уровень ${s.level}</span>
          ${Adapt.on() ? `<span class="cta-diff">${Adapt.dots()} ${Adapt.label()}</span>` : ''}</div>
        <span class="cta-go">${ICON.play}</span>
      </button>
      ${wod ? `<section class="card wod ${wClass(wod)}">
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
    },
    mount(el) { Screens.bindLevelCard(el); }
  },

  // ================= СЛОВА =================
  words: {
    title: 'Слова',
    html(p) {
      const f = App.mem.wordsFilter || Store.state.level;
      const list = f === 'all' ? C.topics : C.topics.filter(t => t.level === f);
      const favN = Object.keys(Store.state.fav).length;
      return `<h1 class="display page-h">${L.ui.h.words}</h1><p class="lead">${C.words.length} слов в ${C.topics.length} темах · уровни A1–C1</p>
      <button class="search-fake" data-go="dict">${ICON.search}<span>Поиск по словарю</span></button>
      ${levelFilter(f)}
      ${favN ? `<button class="li fav-row" data-go="topic" data-id="fav"><span class="li-ic">${ICON.star}</span><span class="li-b"><b>Избранное</b><small>${favN} ${plural(favN, 'слово', 'слова', 'слов')}</small></span></button>` : ''}
      <div class="topics">${list.map(t => {
        const pr = C.topicProgress(t.id);
        return `<button class="topic" data-go="topic" data-id="${t.id}">
          <span class="t-emoji">${t.emoji}</span>
          <span class="t-b"><b>${esc(t.title)}</b><small>${esc(t.de || t.ro || '')}</small></span>
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
      const t = p.id === 'fav' ? { id: 'fav', title: 'Избранное', de: L.ui.h.topicFav, emoji: '⭐', level: Store.state.level } : C.topicById[p.id];
      if (!t) return '<p>Тема не найдена</p>';
      const ws = C.topicWords(t.id);
      const pr = C.topicProgress(t.id);
      const nouns = ws.filter(w => w.t === 'n').length;
      const modes = ['flash', 'quiz', 'listen', 'write', 'match', 'order', 'gap', 'dictation', 'speed'];
      if (nouns >= 4) modes.splice(3, 0, 'article', 'plural');
      const sort = App.mem.topicSort || 'list';
      let shown = ws.slice();
      if (sort === 'weak') shown.sort((a, b) => Store.mastery(a.key) - Store.mastery(b.key));
      if (sort === 'az') shown.sort((a, b) => L.lemma(a).localeCompare(L.lemma(b), L.code));
      return `<section class="topic-head">
        <span class="t-emoji big">${t.emoji}</span>
        <div><h1 class="display">${esc(t.title)}</h1><div class="muted">${esc(t.de || t.ro || '')} · ${lvlChip(t.level)}</div></div>
      </section>
      <div class="prog-line"><span><b>${pr.known}</b> из ${pr.total} выучено</span><span>${Math.round(pr.pct * 100)}%</span></div>${bar(pr.pct, 'thick')}
      <div class="lvl-dist">${LEVELS.map(l => { const n = ws.filter(w => w.lvl === l).length; return n ? `<span>${lvlChip(l)} ${n}</span>` : ''; }).join('')}
        ${ws.some(w => !C.atLevel(w)) ? `<small class="muted">Слова выше уровня ${Store.state.level} даются в последнюю очередь</small>` : ''}</div>
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
    return `<div class="wrow ${wClass(w)}">
      <button class="w-say" data-say="${esc(w.de)}" aria-label="Послушать">${ICON.sound}</button>
      <button class="w-main" data-word="${esc(w.key)}"><span class="w-de">${deHTML(w)}${w.t === 'n' && w.pl && w.pl !== '-' ? `<small> · ${esc(w.pl.replace(/^die /, ''))}</small>` : ''}</span>
        <span class="w-ru">${esc(w.ru)}${tp ? ` <small class="muted">· ${esc(tp.title)}</small>` : ''}</span></button>
      ${!C.atLevel(w) ? lvlChip(w.lvl) : ''}${UI.dots(Store.mastery(w.key))}
      <button class="w-fav ${fav ? 'faved' : ''}" data-fav="${esc(w.key)}" aria-label="В избранное">${ICON.star}</button>
    </div>`;
  },
  wordSheet(key) {
    const w = C.byKey[key]; if (!w) return;
    const r = Store.srsGet(key);
    const m = UI.sheet(`<div class="sheet-h ${wClass(w)}"><div class="f-word">${deHTML(w)}</div>
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
      return `<div class="search"><span>${ICON.search}</span><input id="q" type="search" placeholder="${L.ui.adjCap} или русское слово" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" value="${esc(App.mem.dictQ || '')}"></div>
        <div id="dres" class="wlist"></div>`;
    },
    mount(el) {
      const inp = $('#q', el), out = $('#dres', el);
      const all = C.words.concat(DE.phrases.flatMap(p => p.words));
      const run = () => {
        const q = norm(inp.value); App.mem.dictQ = inp.value;
        if (q.length < 2) { out.innerHTML = `<p class="muted pad">Введите хотя бы 2 буквы. В словаре ${all.length} слов и фраз.</p>`; return; }
        const qd = L.translit(q);
        const score = w => {
          const de = norm(w.de), lem = norm(L.lemma(w)), ru = norm(w.ru);
          if (lem === q || de === q || ru === q) return 0;
          if (lem.startsWith(q) || L.translit(lem).startsWith(qd) || L.plain(lem).startsWith(L.plain(q))) return 1;
          if (ru.split(/[,;]\s*/).some(x => x.startsWith(q))) return 1.5;
          if (de.includes(q) || L.translit(de).includes(qd) || L.plain(de).includes(L.plain(q))) return 2;
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
      const f = App.mem.gramFilter || Store.state.level;
      const st = Store.state.grammar;
      const done = C.grammar.filter(g => st[g.id] && st[g.id].done).length;
      return `<h1 class="display page-h">${L.ui.h.grammar}</h1><p class="lead">${C.grammar.length} уроков с объяснениями и упражнениями · пройдено ${done}</p>
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
      // примеры на изучаемом языке в уроке можно послушать по нажатию
      $$('.lesson-body .ex, .lesson-body td, .lesson-body b', el).forEach(n => {
        const txt = n.classList.contains('ex') ? (n.querySelector('b') || n).textContent : n.textContent;
        if (L.isTarget(txt)) {
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
      return `<h1 class="display page-h">${L.ui.h.tests}</h1><p class="lead">${L.ui.testsLead}</p>
      <button class="cta" data-run="placement"><div class="cta-t"><span class="eyebrow">${L.ui.placement}</span><b>Тест на определение уровня</b>
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
        <button class="li" data-run="verbs"><span class="li-ic">${ICON.verb}</span><span class="li-b"><b>Спряжение глаголов</b><small>${L.ui.verbTenses}</small></span></button>
        <button class="li" data-run="global:quiz"><span class="li-ic">${ICON.target}</span><span class="li-b"><b>Тест по словам</b><small>Слова вашего уровня и изучаемые</small></span></button>
        <button class="li" data-run="global:article"><span class="li-ic">${ICON.layers}</span><span class="li-b"><b>${L.ui.genderTest[0]}</b><small>${L.ui.genderTest[1]}</small></span></button>
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
      return `<h1 class="display page-h">${L.ui.h.more}</h1>
      <h2 class="sec">Практика</h2><div class="list">
        ${item('reading', 'book', 'Чтение', `${DE.reading.length} текстов A1–C1 с вопросами и озвучкой`)}
        ${item('dialogues', 'chat', 'Диалоги', `${DE.dialogues.length} живых диалогов и ролевые игры`)}
        ${item('phrases', 'phrase', 'Разговорник', `${DE.phrases.length} ситуаций, ${DE.phrases.reduce((a, p) => a + p.items.length, 0)} фраз`)}
        ${item('verbs', 'verb', 'Глаголы', `${C.verbs.length} таблиц спряжения`)}
        ${item('dict', 'search', 'Словарь', 'Поиск по всем словам')}
      </div>
      <h2 class="sec">Язык</h2><div class="list">${Object.keys(LANGS).filter(c => c !== L.code).map(c => `<a class="li" href="./?lang=${c}"><span class="li-ic"><span class="flag flag-${Boot.info[c].flag}" aria-hidden="true"><i></i><i></i><i></i></span></span><span class="li-b"><b>Перейти на ${Boot.info[c].ru.toLowerCase()}</b><small>${Boot.info[c].native} · отдельный прогресс</small></span></a>`).join('')}
        <a class="li" href="./"><span class="li-ic">${ICON.globe}</span><span class="li-b"><b>Экран выбора языка</b><small>Сейчас: ${Boot.info[L.code].ru.toLowerCase()}</small></span></a></div>
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
      const f = App.mem.verbFilter || Store.state.level;
      return `<h1 class="display page-h">${L.ui.h.verbs}</h1>
      <div class="search"><span>${ICON.search}</span><input id="vq" type="search" placeholder="Найти глагол" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(App.mem.verbQ || '')}"></div>
      ${levelFilter(f)}
      <button class="cta slim" data-run="verbs:${f}"><div class="cta-t"><b>Тренировать спряжение</b><span>${f === 'all' ? 'Глаголы до вашего уровня' : 'Глаголы уровня ' + f}</span></div><span class="cta-go">${ICON.play}</span></button>
      <div id="vlist" class="list"></div>`;
    },
    mount(el) {
      const f = App.mem.verbFilter || Store.state.level;
      $$('[data-filter]', el).forEach(b => b.onclick = () => { App.mem.verbFilter = b.dataset.filter; App.render(); });
      const inp = $('#vq', el), out = $('#vlist', el);
      const TYPES = { weak: 'слабый', strong: 'сильный', mixed: 'смешанный', modal: 'модальный', irregular: 'неправильный' };
      const run = () => {
        const q = norm(inp.value); App.mem.verbQ = inp.value;
        const ls = C.verbs.filter(v => (f === 'all' || v.lvl === f) && (!q || norm(v.inf).includes(q) || norm(v.ru).includes(q)));
        out.innerHTML = ls.map(v => `<button class="li" data-go="verb" data-id="${esc(v.inf)}"><span class="li-b"><b>${esc(v.inf)}</b><small>${esc(v.ru)} · ${TYPES[v.type] || ''}${v.sep ? ', отделяемый' : ''}</small></span>
          <span class="v-perf muted">${esc(L.verbSummary(v))}</span>${lvlChip(v.lvl)}</button>`).join('') || '<p class="muted pad">Не найдено</p>';
      };
      inp.oninput = run; run();
    }
  },
  verb: {
    title: p => p.id,
    html(p) {
      const v = C.verbByInf[p.id]; if (!v) return '<p>Не найдено</p>';
      return `<section class="topic-head"><div><h1 class="display">${esc(v.inf)}</h1><div class="muted">${esc(v.ru)} · ${lvlChip(v.lvl)}</div></div>
        <button class="btn round" data-say="${esc(v.inf)}">${ICON.sound}</button></section>
        ${L.verbView(v)}
        ${v.ex ? `<div class="card f-ex"><button class="mini-audio" data-say="${esc(v.ex)}">${ICON.sound}</button><div>${esc(v.ex)}<div class="muted">${esc(v.exRu || '')}</div></div></div>` : ''}
        <button class="cta slim" data-run="verb:${esc(v.inf)}"><div class="cta-t"><b>Тренировать этот глагол</b><span>${L.verbAll(v).length} заданий на все формы</span></div><span class="cta-go">${ICON.play}</span></button>
        <p class="muted small pad-x">Нажмите на форму, чтобы услышать её.</p>`;
    }
  },

  // ================= ЧТЕНИЕ =================
  reading: {
    title: 'Чтение',
    html() {
      const f = App.mem.readFilter || Store.state.level;
      const ls = DE.reading.filter(r => f === 'all' || r.lvl === f).sort((a, b) => LEVELS.indexOf(a.lvl) - LEVELS.indexOf(b.lvl));
      return `<h1 class="display page-h">${L.ui.h.reading}</h1>${levelFilter(f)}
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
      const f = App.mem.dialFilter || Store.state.level;
      const ls = DE.dialogues.filter(d => f === 'all' || d.lvl === f).sort((a, b) => LEVELS.indexOf(a.lvl) - LEVELS.indexOf(b.lvl));
      return `<h1 class="display page-h">${L.ui.h.dialogues}</h1>${levelFilter(f)}
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
      return `<h1 class="display page-h">${L.ui.h.phrases}</h1><p class="lead">Готовые фразы для реальных ситуаций</p>
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
      return `<h1 class="display page-h">${L.ui.h.stats}</h1>
      <div class="tiles">
        <div class="tile"><b>${s.xp}</b><span>XP всего</span></div>
        <div class="tile"><b>${Store.streak()}</b><span>серия · рекорд ${Store.bestStreak()}</span></div>
        <div class="tile"><b>${Ach.known()}</b><span>слов знаю</span></div>
        <div class="tile"><b>${acc}%</b><span>точность · ${s.stats.answers} ответов</span></div>
        <div class="tile"><b>${s.level}</b><span>мой уровень</span></div>
        <div class="tile"><b class="tile-diff">${Adapt.dots()}</b><span>сложность · ${Adapt.label()}</span></div>
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
      return `<h1 class="display page-h">${L.ui.h.ach}</h1><p class="lead">${Object.keys(s.ach).length} из ${ACH.length}</p>
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
      return `<h1 class="display page-h">${L.ui.h.settings}</h1>
      <div class="form">
        <label class="f-row"><span>Мой уровень</span>${seg('level', s.level, LEVELS.map(l => [l, l]))}</label>
        <label class="f-row"><span>Цель на день</span>${seg('goal', st.goal, [[20, '20'], [50, '50'], [100, '100'], [200, '200']])}<small class="muted">XP в день</small></label>
        <label class="f-row"><span>Новых слов в день</span>${seg('newPerDay', st.newPerDay, [[5, '5'], [10, '10'], [15, '15'], [25, '25']])}</label>
        <label class="f-row"><span>Тема</span>${seg('theme', st.theme, [['system', 'Авто'], ['light', 'Светлая'], ['dark', 'Тёмная']])}</label>
        <div class="f-row"><span>Скорость речи · <b id="rateV">${st.rate.toFixed(2)}</b></span><input type="range" id="rate" min="0.5" max="1.2" step="0.05" value="${st.rate}"></div>
        <div class="f-row"><span>Голос</span><select id="voice"><option value="">Автоматически</option>${voices.map(v => `<option value="${esc(v.voiceURI)}" ${st.voice === v.voiceURI ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</select>
          <button class="btn sm" data-say="${esc(L.ui.voiceTest)}">${ICON.sound} Проверить</button>
          ${!voices.length ? `<small class="muted">${L.ui.voiceMissing}</small>` : ''}</div>
        <label class="f-row sw"><span>Подстраивать сложность<small class="muted block">Сейчас: ${Adapt.label()}. Верные ответы — сложнее, ошибки — проще.</small></span><input type="checkbox" id="adaptive" ${st.adaptive !== false ? 'checked' : ''}></label>
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
      <div class="card small"><p><b>${L.name}</b> — ${c.words} слов в ${c.topics} темах, ${c.grammar} уроков грамматики, ${c.tests} тестовых вопросов, ${c.verbs} глаголов, ${c.reading} текстов, ${c.dialogues} диалогов, ${c.phrases} разделов разговорника.</p>
        <p class="muted">Работает без интернета после первого открытия. Совет: в Safari нажмите «Поделиться» → «На экран „Домой“».</p>
        <button class="btn danger" id="reset">Сбросить весь прогресс</button></div>`;
    },
    mount(el) {
      const s = Store.state, st = s.settings;
      $$('[data-set]', el).forEach(g => g.addEventListener('click', e => {
        const b = e.target.closest('[data-v]'); if (!b) return;
        e.preventDefault();
        const k = g.dataset.set, v = b.dataset.v;
        if (k === 'level') { s.level = v; App.mem = {}; } else st[k] = isNaN(+v) ? v : +v;
        Store.save(); if (k === 'theme') App.applyTheme(); App.render();
      }));
      $('#rate', el).oninput = e => { st.rate = +e.target.value; $('#rateV', el).textContent = st.rate.toFixed(2); Store.save(); };
      $('#rate', el).onchange = () => Speech.say(L.ui.greet(12)[0]);
      $('#voice', el).onchange = e => { st.voice = e.target.value; Store.save(); Speech.say(L.ui.greet(12)[0]); };
      $('#autoplay', el).onchange = e => { st.autoplay = e.target.checked; Store.save(); };
      $('#adaptive', el).onchange = e => { st.adaptive = e.target.checked; Store.save(); App.render(); };
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
    Ach.applyTitles();
    $('#brand-name').textContent = L.name;
    $('#brand-flag').className = 'flag flag-' + L.code;
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
// запуск — в boot.js (сначала выбор языка)

/* js/boot.js */
// Запуск: экран выбора языка, затем загрузка данных выбранного языка и приложения.
// Смена языка — перезагрузка страницы (?lang=…): данные языков никогда не смешиваются.
const Boot = {
  info: {
    de: { flag: 'de', native: 'Deutsch', ru: 'Немецкий' },
    ro: { flag: 'ro', native: 'Română', ru: 'Румынский' }
  },
  // краткая сводка прогресса по языку прямо из сохранённых данных
  stats(code) {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(LANGS[code].storeKey) || 'null'); } catch (e) { s = null; }
    if (!s || !s.days) return null;
    let d = new Date(), streak = 0;
    const has = x => s.days[dayKey(x)] && s.days[dayKey(x)].xp > 0;
    if (!has(d)) d = new Date(Date.now() - DAY);
    while (has(d)) { streak++; d = new Date(d.getTime() - DAY); }
    const known = Object.values(s.srs || {}).filter(r => r.b >= 2).length;
    return { xp: s.xp || 0, level: s.level || 'A1', streak, known };
  },
  start() {
    const want = new URLSearchParams(location.search).get('lang');
    if (want && LANGS[want]) return this.enter(want);
    this.showChooser();
  },
  showChooser() {
    $('#app').hidden = true;
    const el = document.createElement('div');
    el.id = 'chooser';
    el.className = 'chooser';
    el.innerHTML = `<div class="ch-in">
      <div class="ch-logo" aria-hidden="true"><i></i><i></i><i></i></div>
      <h1 class="display">Capain</h1>
      <p class="lead">Какой язык учим сегодня?</p>
      <div class="ch-list">${Object.keys(LANGS).map(code => {
        const i = this.info[code], st = this.stats(code);
        return `<button class="ch-card" data-lang="${code}">
          <span class="flag flag-${i.flag}" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="ch-b"><b>${i.native}</b><small>${i.ru}${st ? ` · уровень ${st.level}` : ''}</small>
            <span class="ch-st">${st ? `<span>${ICON.flame}${st.streak}</span><span>${ICON.words}${st.known}</span><span>${ICON.bolt}${st.xp} XP</span>` : '<span>Начать с нуля</span>'}</span></span>
          <span class="cta-go">${ICON.play}</span></button>`;
      }).join('')}</div>
      <p class="muted small">Прогресс по каждому языку хранится отдельно. Сменить язык можно в любой момент — нажмите на флаг вверху.</p>
    </div>`;
    document.body.appendChild(el);
    el.addEventListener('click', e => { const b = e.target.closest('[data-lang]'); if (b) this.enter(b.dataset.lang); });
  },
  enter(code) {
    L = LANGS[code];
    document.documentElement.lang = 'ru';
    const ch = $('#chooser');
    if (ch) ch.innerHTML = `<div class="ch-in"><p class="lead">Загружаем ${this.info[code].ru.toLowerCase()}…</p></div>`;
    const done = () => { if (ch) ch.remove(); $('#app').hidden = false; App.init(); };
    if (window.DE && window.DE.topics && window.DE.topics.length) return done();   // данные уже в странице (однофайловая версия)
    const sc = document.createElement('script');
    sc.src = `data-${code}.js?v=${window.CAPAIN_VER || ''}`;
    sc.onload = done;
    sc.onerror = () => { if (ch) ch.innerHTML = '<div class="ch-in"><p class="lead">Не удалось загрузить данные. Проверьте интернет и откройте приложение ещё раз.</p></div>'; };
    document.head.appendChild(sc);
  },
  switchTo(code) { location.href = './?lang=' + code; }
};
document.addEventListener('DOMContentLoaded', () => Boot.start());
