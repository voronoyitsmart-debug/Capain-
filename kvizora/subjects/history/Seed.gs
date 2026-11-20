/**
 * Seed.gs — HISTORY OF UKRAINE (історія України). Everything that is special about this subject:
 * the ready-made tests, the AI prompt and which question types the editor offers.
 * Paste this as a SECOND script file (next to Code.gs), named "Seed".
 *
 * This subject is Ukrainian only: every test has langs: ['uk'] and every text is { uk: '…' }.
 * Dates: "num" with tol 0 for a year; "match" for event ↔ year.
 */

const SUBJECT = {
  key: 'history',
  name: { uk: 'Історія України', en: 'History of Ukraine' },
  mode: 'switch',
  langs: ['uk'],
  qtypes: ['mc', 'match', 'fix', 'short', 'num', 'open'],
  formulas: false
};

function ua_(s) { return { uk: s }; }
function uaOpts_(list) { return list.map(ua_); }

const HU_MC = ua_('Частина 1 — Вибір відповіді');
const HU_ONE = ua_('Оберіть одну правильну відповідь.');
const HU_PICK = ua_('Для кожного рядка оберіть правильну відповідь зі списку.');
const HU_SHORT = ua_('Частина 3 — Коротка відповідь');
const HU_SHORT_I = ua_('Напишіть слово, ім’я або рік.');

const SEED_TESTS = [
  // ---- Grade 8: the Cossack era ----
  { title: ua_('Історія України 8 кл.: козацька доба'), open: true, content: { langs: ['uk'], sections: [
    { title: HU_MC, instructions: HU_ONE, questions: [
      { type: 'mc', q: ua_('Хто очолив Національно-визвольну війну українського народу середини XVII ст.?'),
        options: uaOpts_(['Петро Сагайдачний', 'Богдан Хмельницький', 'Іван Мазепа', 'Петро Дорошенко']), answer: 1 },
      { type: 'mc', q: ua_('У якому році відбулися битви під Жовтими Водами та Корсунем?'),
        options: uaOpts_(['1620', '1648', '1654', '1709']), answer: 1 },
      { type: 'mc', q: ua_('Хто заснував першу Запорозьку Січ на острові Мала Хортиця?'),
        options: uaOpts_(['Дмитро Вишневецький (Байда)', 'Северин Наливайко', 'Іван Сірко', 'Самійло Кішка']), answer: 0 },
      { type: 'mc', q: ua_('Під чиїм проводом козаки звитяжно воювали в Хотинській битві 1621 року?'),
        options: uaOpts_(['Івана Виговського', 'Петра Конашевича-Сагайдачного', 'Павла Полуботка', 'Кирила Розумовського']), answer: 1 },
      { type: 'mc', q: ua_('У якому місті 1654 року відбулася рада, що схвалила союз із Московським царством?'),
        options: uaOpts_(['Зборів', 'Біла Церква', 'Переяслав', 'Гадяч']), answer: 2 },
      { type: 'mc', q: ua_('Яка битва 1709 року завершилася поразкою шведсько-українського війська?'),
        options: uaOpts_(['Конотопська', 'Берестецька', 'Полтавська', 'Батозька']), answer: 2 },
      { type: 'mc', q: ua_('Хто є автором «Пактів і конституції прав і вольностей Війська Запорозького» (1710)?'),
        options: uaOpts_(['Пилип Орлик', 'Іван Мазепа', 'Іван Самойлович', 'Данило Апостол']), answer: 0 }
    ] },
    { title: ua_('Частина 2 — Встановіть відповідність'), instructions: HU_PICK, questions: [
      { type: 'match', q: ua_('Доберіть до кожної події рік.'),
        pairs: [
          { l: ua_('Зборівський договір'), r: ua_('1649') },
          { l: ua_('Білоцерківський договір'), r: ua_('1651') },
          { l: ua_('Гадяцький договір'), r: ua_('1658') },
          { l: ua_('Конотопська битва'), r: ua_('1659') },
          { l: ua_('Андрусівське перемир’я'), r: ua_('1667') }
        ] },
      { type: 'match', q: ua_('Доберіть до кожного поняття його значення.'),
        pairs: [
          { l: ua_('Реєстрові козаки'), r: ua_('Козаки, внесені до офіційного списку, які служили державі за платню') },
          { l: ua_('Курінь'), r: ua_('Військовий підрозділ і житло козаків на Січі') },
          { l: ua_('Клейноди'), r: ua_('Символи влади: булава, бунчук, печатка, корогва') },
          { l: ua_('Гетьман'), r: ua_('Виборний керівник козацького війська й держави') },
          { l: ua_('Січ'), r: ua_('Укріплений центр запорозького козацтва') }
        ] }
    ] },
    { title: HU_SHORT, instructions: HU_SHORT_I, questions: [
      { type: 'short', q: ua_('Яке місто було гетьманською столицею Богдана Хмельницького?'), accept: ['Чигирин'] },
      { type: 'short', q: ua_('Яке місто було гетьманською резиденцією Івана Мазепи?'), accept: ['Батурин'] },
      { type: 'num', q: ua_('У якому році за наказом Катерини II було зруйновано Запорозьку Січ?'), accept: ['1775'], tol: 0 }
    ] },
    { title: ua_('Частина 4 — Творче завдання'), instructions: ua_('Напишіть відповідь повністю.'), questions: [
      { type: 'open', q: ua_('Поясніть, чому Хмельниччину називають Національно-визвольною війною. Наведіть два аргументи.') }
    ] }
  ] } },

  // ---- Grades 10–11: the 20th century ----
  { title: ua_('Історія України 10–11 кл.: XX століття і незалежність'), folder: '', open: false, minutes: 30, content: { langs: ['uk'], sections: [
    { title: HU_MC, instructions: HU_ONE, questions: [
      { type: 'mc', q: ua_('Хто був головою Української Центральної Ради?'),
        options: uaOpts_(['Симон Петлюра', 'Михайло Грушевський', 'Павло Скоропадський', 'Володимир Винниченко']), answer: 1 },
      { type: 'mc', q: ua_('Який Універсал Центральної Ради проголосив незалежність УНР?'),
        options: uaOpts_(['I Універсал', 'II Універсал', 'III Універсал', 'IV Універсал']), answer: 3 },
      { type: 'mc', q: ua_('Коли було проголошено Акт злуки УНР і ЗУНР?'),
        options: uaOpts_(['22 січня 1918 р.', '22 січня 1919 р.', '1 листопада 1918 р.', '29 квітня 1918 р.']), answer: 1 },
      { type: 'mc', q: ua_('У яких роках радянська влада вчинила Голодомор-геноцид українського народу?'),
        options: uaOpts_(['1921–1923', '1932–1933', '1941–1944', '1946–1947']), answer: 1 },
      { type: 'mc', q: ua_('Коли сталася аварія на Чорнобильській АЕС?'),
        options: uaOpts_(['26 квітня 1986 р.', '24 серпня 1991 р.', '16 липня 1990 р.', '1 грудня 1991 р.']), answer: 0 },
      { type: 'mc', q: ua_('Коли Верховна Рада ухвалила Акт проголошення незалежності України?'),
        options: uaOpts_(['16 липня 1990 р.', '24 серпня 1991 р.', '1 грудня 1991 р.', '28 червня 1996 р.']), answer: 1 },
      { type: 'mc', q: ua_('Хто став першим Президентом України?'),
        options: uaOpts_(['Леонід Кучма', 'Леонід Кравчук', 'Віктор Ющенко', 'В’ячеслав Чорновіл']), answer: 1 }
    ] },
    { title: ua_('Частина 2 — Встановіть відповідність'), instructions: HU_PICK, questions: [
      { type: 'match', q: ua_('Доберіть до кожної події рік.'),
        pairs: [
          { l: ua_('Бій під Крутами'), r: ua_('1918') },
          { l: ua_('Проголошення незалежності Карпатської України'), r: ua_('1939') },
          { l: ua_('Підписання Будапештського меморандуму'), r: ua_('1994') },
          { l: ua_('Початок Революції Гідності'), r: ua_('2013') },
          { l: ua_('Помаранчева революція'), r: ua_('2004') }
        ] }
    ] },
    { title: HU_SHORT, instructions: HU_SHORT_I, questions: [
      { type: 'short', q: ua_('Як називався представницький орган (парламент) УНР у 1917–1918 роках?'),
        accept: ['Центральна Рада', 'Українська Центральна Рада', 'УЦР'] },
      { type: 'num', q: ua_('У якому році Верховна Рада ухвалила Конституцію України?'), accept: ['1996'], tol: 0 },
      { type: 'fix', q: ua_('Всеукраїнський референдум, що підтвердив незалежність України, відбувся 1 грудня 1990 року.'),
        accept: ['Всеукраїнський референдум, що підтвердив незалежність України, відбувся 1 грудня 1991 року.'],
        key: '1990 → 1991' }
    ] },
    { title: ua_('Частина 4 — Творче завдання'), instructions: ua_('Напишіть 3–5 речень.'), questions: [
      { type: 'open', q: ua_('Чому події 2013–2014 років називають Революцією Гідності? Що вони змінили в житті країни?') }
    ] }
  ] } }
];

// ---------- AI: photo(s) → History of Ukraine test content ----------
const AI_INSTRUCTIONS =
  'You convert a photo of a printed school HISTORY OF UKRAINE (історія України) test or worksheet page into structured JSON. ' +
  'The test is for Ukrainian schoolchildren and is written ONLY in Ukrainian: never add English texts or translations. ' +
  'Read every exercise on the page. Return ONLY JSON (no markdown fences, no commentary) shaped as: ' +
  '{"title": string, "sections": [{"title": TEXT, "instructions": TEXT, "questions": [Q, ...]}]}. ' +
  'Each Q is one of: ' +
  '{"type":"mc","q":TEXT,"options":[TEXT, TEXT, ...],"answer":<0-based index of the correct option>}; ' +
  '{"type":"match","q":TEXT,"pairs":[{"l":TEXT,"r":TEXT}, ...]} for matching tasks (event ↔ year, person ↔ deed, term ↔ meaning); ' +
  '{"type":"short","q":TEXT,"accept":["answer","other correct forms"]} for a name, place or term; ' +
  '{"type":"num","q":TEXT,"accept":["1648"],"tol":0} when the answer is a year or another number; ' +
  '{"type":"fix","q":TEXT (a statement with ONE factual mistake),"accept":["the corrected statement"],"key":"wrong → right"}; ' +
  '{"type":"open","q":TEXT} for "explain / compare / work with a source" tasks with no single answer. ' +
  'Tasks "arrange in chronological order" become "match" (event ↔ its year) or "mc". ' +
  'Use the terminology and dates of current Ukrainian school history textbooks; use the typographic apostrophe ’. ' +
  'In "accept" list common equal variants (with and without first name: "Богдан Хмельницький", "Хмельницький"). ' +
  'For "mc", "answer" MUST be the 0-based index of the correct option; if the page does not mark it, use your history knowledge. ' +
  'Keep the original wording from the page. Do not invent exercises that are not on the page.';
