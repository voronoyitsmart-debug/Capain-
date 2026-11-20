/**
 * Seed.gs — UKRAINIAN LANGUAGE (українська мова). Everything that is special about this subject:
 * the ready-made tests, the AI prompt and which question types the editor offers.
 * Paste this as a SECOND script file (next to Code.gs), named "Seed".
 *
 * This subject is Ukrainian only: every test has langs: ['uk'] and every text is { uk: '…' }.
 * With one language on, students see no language switch.
 * Spelling follows «Український правопис» (2019).
 *
 * Grading notes (core norm_): letter case, punctuation and the kind of apostrophe (' ’ ʼ) are ignored,
 * so a "fix" or "short" answer checks the letters only. Punctuation is tested with numbered places
 * ("write the numbers where commas go") or with "mc". Stress marks are not used in answers.
 */

const SUBJECT = {
  key: 'ukrainian',
  name: { uk: 'Українська мова', en: 'Ukrainian language' },
  mode: 'switch',
  langs: ['uk'],                                        // Ukrainian only: no English, no language switch, no translation (core v5.2)
  qtypes: ['mc', 'match', 'fix', 'short', 'num', 'open'],   // question types the editor offers
  formulas: false                                       // no maths: $ signs stay plain text
};

/** A Ukrainian-only text. */
function ua_(s) { return { uk: s }; }
/** Options as a list of Ukrainian strings → [{ uk }, …]. */
function uaOpts_(list) { return list.map(ua_); }

const UA_MC = ua_('Частина 1 — Вибір відповіді');
const UA_ONE = ua_('Оберіть одну правильну відповідь.');
const UA_PICK = ua_('Для кожного рядка оберіть правильну відповідь зі списку.');
const UA_FIX = ua_('Частина 3 — Знайди й виправ помилку');
const UA_FIX_I = ua_('У кожному реченні є одна орфографічна помилка. Перепишіть речення правильно.');

/** Ready-made tests. The first one is opened right away on a fresh install; the others start as drafts. */
const SEED_TESTS = [
  // ---- Grade 6: word structure and spelling ----
  { title: ua_('Українська мова 6 кл.: будова слова й орфографія'), open: true, content: { langs: ['uk'], sections: [
    { title: UA_MC, instructions: UA_ONE, questions: [
      { type: 'mc', q: ua_('Яке слово є спільнокореневим до слова «вода»?'),
        options: uaOpts_(['водій', 'водяний', 'провідник', 'виводок']), answer: 1 },
      { type: 'mc', q: ua_('Яке слово НЕ має закінчення?'),
        options: uaOpts_(['пальто', 'стіл', 'земля', 'весна']), answer: 0,
        note: ua_('Пам’ятайте: нульове закінчення — це теж закінчення.') },
      { type: 'mc', q: ua_('У якому рядку всі слова написано правильно?'),
        options: uaOpts_(['м’ята, п’ять, сім’я', 'св’ято, м’яч, з’їзд', 'цв’ях, пір’я, б’ють', 'бур’ян, мавп’ячий, в’язати']), answer: 0 },
      { type: 'mc', q: ua_('У якому рядку в усіх словах на місці пропуску пишемо м’який знак?'),
        options: uaOpts_(['бат..ко, біл..ше, сіл..ський', 'кін..чик, ніч.., весіл..ля', 'їдал..ня, Хар..ків, різ..бяр', 'учител..ці, мен..ший, дон..ці']), answer: 0 },
      { type: 'mc', q: ua_('У якому слові на місці пропуску пишемо префікс с-?'),
        options: uaOpts_(['..казати', '..робити', '..бігти', '..лякати']), answer: 0 },
      { type: 'mc', q: ua_('У якому слові на місці пропуску пишемо префікс пре-?'),
        options: uaOpts_(['пр..красний', 'пр..бігти', 'пр..морський', 'пр..шити']), answer: 0 },
      { type: 'mc', q: ua_('У якому слові НЕ відбувається спрощення в групі приголосних?'),
        options: uaOpts_(['щасливий', 'проїзний', 'шістнадцять', 'серце']), answer: 2 }
    ] },
    { title: ua_('Частина 2 — Встановіть відповідність'), instructions: UA_PICK, questions: [
      { type: 'match', q: ua_('Доберіть до кожної частини слова її визначення.'),
        pairs: [
          { l: ua_('Корінь'), r: ua_('Спільна частина споріднених слів, у якій міститься основне лексичне значення') },
          { l: ua_('Префікс'), r: ua_('Значуща частина слова, що стоїть перед коренем') },
          { l: ua_('Суфікс'), r: ua_('Значуща частина слова, що стоїть після кореня і творить нові слова') },
          { l: ua_('Закінчення'), r: ua_('Змінна частина слова, що зв’язує його з іншими словами в реченні') },
          { l: ua_('Основа'), r: ua_('Частина змінного слова без закінчення') }
        ] },
      { type: 'match', q: ua_('Доберіть до кожного слова його корінь.'),
        pairs: [
          { l: ua_('підводний'), r: ua_('вод') },
          { l: ua_('безхмарний'), r: ua_('хмар') },
          { l: ua_('переліт'), r: ua_('літ') },
          { l: ua_('залізниця'), r: ua_('заліз') },
          { l: ua_('прикордонний'), r: ua_('кордон') }
        ] }
    ] },
    { title: UA_FIX, instructions: UA_FIX_I, questions: [
      { type: 'fix', q: ua_('Ми зустрілися на подвірї біля школи.'),
        accept: ['Ми зустрілися на подвір’ї біля школи.', 'Ми зустрілись на подвір’ї біля школи.'],
        key: 'подвірї → подвір’ї (апостроф після р у кінці складу)' },
      { type: 'fix', q: ua_('Над річкою стояв густий туман, і було дуже тіхо.'),
        accept: ['Над річкою стояв густий туман, і було дуже тихо.'],
        key: 'тіхо → тихо' },
      { type: 'fix', q: ua_('Учора в нас був дуже щастливий день.'),
        accept: ['Учора в нас був дуже щасливий день.', 'Вчора в нас був дуже щасливий день.', 'Учора у нас був дуже щасливий день.'],
        key: 'щастливий → щасливий (спрощення: ст + л → сл)' }
    ] },
    { title: ua_('Частина 4 — Коротка відповідь'), instructions: ua_('Напишіть одне слово, частину слова або число.'), questions: [
      { type: 'short', q: ua_('Запишіть корінь слова «прибережний».'),
        accept: ['береж', 'берег'], note: ua_('Пишіть лише літери кореня, без рисок.') },
      { type: 'short', q: ua_('Запишіть закінчення слова «книжками».'),
        accept: ['ами', '-ами'] },
      { type: 'num', q: ua_('Скільки звуків у слові «їжак»?'), accept: ['5'], tol: 0 }
    ] },
    { title: ua_('Частина 5 — Творче завдання'), instructions: ua_('Напишіть відповідь повністю.'), questions: [
      { type: 'open', q: ua_('Доберіть три спільнокореневі слова до слова «ліс» і запишіть, який у них корінь.') }
    ] }
  ] } },

  // ---- Grade 7: parts of speech, idioms, punctuation ----
  { title: ua_('Українська мова 7 кл.: частини мови, фразеологізми, пунктуація'), folder: '', open: false, minutes: 30, content: { langs: ['uk'], sections: [
    { title: UA_MC, instructions: UA_ONE, questions: [
      { type: 'mc', q: ua_('Яке слово є дієприкметником?'),
        options: uaOpts_(['зелений', 'позеленілий', 'зеленіючи', 'зелено']), answer: 1 },
      { type: 'mc', q: ua_('Яке слово є дієприслівником?'),
        options: uaOpts_(['написаний', 'написавши', 'написати', 'напис']), answer: 1 },
      { type: 'mc', q: ua_('Яке слово є прислівником?'),
        options: uaOpts_(['вранці', 'ранок', 'ранковий', 'ранній']), answer: 0 },
      { type: 'mc', q: ua_('Яке слово є займенником?'),
        options: uaOpts_(['ніхто', 'ніч', 'ніжний', 'ніколи']), answer: 0 },
      { type: 'mc', q: ua_('Яке слово є прийменником (службовою частиною мови)?'),
        options: uaOpts_(['біля', 'білий', 'біліти', 'біло']), answer: 0 },
      { type: 'mc', q: ua_('Яке слово є порядковим числівником?'),
        options: uaOpts_(['п’ятеро', 'п’ятий', 'п’ять', 'п’ятірка']), answer: 1 },
      { type: 'mc', q: ua_('У якому реченні пропущено кому? (Розділові знаки всередині речень не поставлено.)'),
        options: uaOpts_(['Учні сіли за парти і почали писати.', 'Сонце зійшло і в лісі защебетали птахи.', 'Ми бачили ліс і поле.', 'Діти гралися на подвір’ї до самого вечора.']), answer: 1 },
      { type: 'mc', q: ua_('У якому реченні правильно поставлено розділові знаки?'),
        options: uaOpts_(['Прочитавши книжку, Оксана поставила її на полицю.', 'Прочитавши книжку Оксана, поставила її на полицю.',
          'Прочитавши, книжку Оксана поставила на полицю.', 'Прочитавши книжку Оксана поставила, її на полицю.']), answer: 0 }
    ] },
    { title: ua_('Частина 2 — Встановіть відповідність'), instructions: UA_PICK, questions: [
      { type: 'match', q: ua_('Доберіть до кожного фразеологізму його значення.'),
        pairs: [
          { l: ua_('бити байдики'), r: ua_('ледарювати') },
          { l: ua_('пекти раків'), r: ua_('червоніти від сорому') },
          { l: ua_('накивати п’ятами'), r: ua_('утекти') },
          { l: ua_('як кіт наплакав'), r: ua_('дуже мало') },
          { l: ua_('хоч греблю гати'), r: ua_('дуже багато') },
          { l: ua_('тримати язик за зубами'), r: ua_('мовчати, не розголошувати таємниці') }
        ] },
      { type: 'match', q: ua_('Визначте, якою частиною мови є кожне слово.'),
        pairs: [
          { l: ua_('читаючи'), r: ua_('дієприслівник') },
          { l: ua_('прочитаний'), r: ua_('дієприкметник') },
          { l: ua_('читач'), r: ua_('іменник') },
          { l: ua_('читати'), r: ua_('дієслово') },
          { l: ua_('швидко'), r: ua_('прислівник') }
        ] }
    ] },
    { title: ua_('Частина 3 — Розділові знаки й орфографія'),
      instructions: ua_('У завданнях із цифрами запишіть номери місць, де потрібна кома, через кому (наприклад: 1, 3). В інших — перепишіть речення правильно.'), questions: [
      { type: 'short', q: ua_('Ліс(1) освітлений сонцем(2) радісно шумів(3) і вітав(4) нас.'),
        accept: ['1, 2', '12', '1 і 2', '1 та 2', '2, 1'], note: ua_('Дієприкметниковий зворот.') },
      { type: 'short', q: ua_('Повернувшись додому(1) хлопці(2) сіли(3) обідати(4) і відпочивати.'),
        accept: ['1'], note: ua_('Дієприслівниковий зворот.') },
      { type: 'fix', q: ua_('Учні уважно слухали вчителя, записуючі нове правило.'),
        accept: ['Учні уважно слухали вчителя, записуючи нове правило.'],
        key: 'записуючі → записуючи (дієприслівник має суфікс -учи)' },
      { type: 'fix', q: ua_('Не зважаючи на дощ, ми пішли до лісу.'),
        accept: ['Незважаючи на дощ, ми пішли до лісу.'],
        key: 'Не зважаючи → Незважаючи (прийменник пишемо разом)' },
      { type: 'short', q: ua_('Допишіть фразеологізм: «Працювати не покладаючи …»'),
        accept: ['рук'] }
    ] },
    { title: ua_('Частина 4 — Творче завдання'), instructions: ua_('Напишіть 1–2 речення.'), questions: [
      { type: 'open', q: ua_('Складіть речення з фразеологізмом «брати близько до серця» і поясніть його значення.') }
    ] }
  ] } }
];

// ---------- AI: photo(s) → Ukrainian language test content ----------
// Code.gs adds the language rule after this text (with SUBJECT.langs = ['uk'] it is always "Ukrainian only").
const AI_INSTRUCTIONS =
  'You convert a photo of a printed school UKRAINIAN LANGUAGE (українська мова) test or worksheet page into structured JSON. ' +
  'The test is for Ukrainian schoolchildren and is written ONLY in Ukrainian: never add English texts or translations. ' +
  'Read every exercise on the page. Return ONLY JSON (no markdown fences, no commentary) shaped as: ' +
  '{"title": string, "sections": [{"title": TEXT, "instructions": TEXT, "questions": [Q, ...]}]}. ' +
  'Each Q is one of: ' +
  '{"type":"mc","q":TEXT,"options":[TEXT, TEXT, ...],"answer":<0-based index of the correct option>}; ' +
  '{"type":"fix","q":TEXT (a sentence or word with ONE spelling mistake, copied exactly WITH the mistake),"accept":["the corrected sentence", "another correct variant"],"key":"wrong → right (rule)"}; ' +
  '{"type":"short","q":TEXT,"accept":["answer","other correct forms"]} for a one-word answer (a root, an ending, a part of speech, a missing word of an idiom); ' +
  '{"type":"num","q":TEXT,"accept":["5"],"tol":0} when the answer is a number (how many sounds, letters, syllables); ' +
  '{"type":"match","q":TEXT,"pairs":[{"l":TEXT,"r":TEXT}, ...]} for matching tasks (idiom ↔ meaning, word ↔ part of speech, term ↔ definition): each pair is a left item and its correct right item; ' +
  '{"type":"open","q":TEXT} for "write / make up a sentence / explain / parse" tasks with no single answer. ' +
  'COPY EXACTLY: keep words with gaps ("пр..красний", "бат..ко") and deliberate mistakes as printed — never correct the task text itself. ' +
  'Use the typographic apostrophe ’ (м’ята, п’ять). Follow «Український правопис» (2019) and the terminology of Ukrainian school textbooks. ' +
  'PUNCTUATION: answers are compared without punctuation marks, so for "put the commas" tasks either use "mc" (choose the correctly punctuated sentence) ' +
  'or keep the numbered places from the page and use "short" with the numbers as the answer, e.g. accept ["1, 3", "13", "1 і 3"]. ' +
  'STRESS (наголос): do not use stress marks in "accept"; turn stress tasks into "mc" with the stressed vowel written as a capital letter (кропИва). ' +
  'In "accept" for fix give the whole corrected sentence; for short add common equal variants (with and without a hyphen: "ами", "-ами"). ' +
  'For "mc", "answer" MUST be the 0-based index of the correct option; if the page does not mark it, use your knowledge of Ukrainian grammar and spelling. ' +
  'Keep the original wording from the page. Do not invent exercises that are not on the page.';
