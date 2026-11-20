/**
 * Seed.gs — UKRAINIAN LITERATURE (українська література). Everything that is special about this subject:
 * the ready-made tests, the AI prompt and which question types the editor offers.
 * Paste this as a SECOND script file (next to Code.gs), named "Seed".
 *
 * This subject is Ukrainian only: every test has langs: ['uk'] and every text is { uk: '…' }.
 * With one language on, students see no language switch.
 * The tests follow the school programme of Ukrainian literature (grades 5–11) and the НМТ topics.
 *
 * Grading notes (core norm_): letter case, punctuation and the kind of apostrophe (' ’ ʼ) are ignored,
 * so a "short" answer checks the letters only. Accepted answers list the usual equal forms
 * (with and without the first name, the pen name and the real name where both are taught).
 */

const SUBJECT = {
  key: 'ukrlit',
  name: { uk: 'Українська література', en: 'Ukrainian literature' },
  mode: 'switch',
  langs: ['uk'],                                        // Ukrainian only: no English, no language switch, no translation (core v5.2)
  qtypes: ['mc', 'match', 'short', 'num', 'open'],      // question types the editor offers
  formulas: false                                       // no maths: $ signs stay plain text
};

/** A Ukrainian-only text. */
function ul_(s) { return { uk: s }; }
/** Options as a list of Ukrainian strings → [{ uk }, …]. */
function ulOpts_(list) { return list.map(ul_); }
/** Matching pairs from [[left, right], …]. */
function ulPairs_(list) { return list.map(p => ({ l: ul_(p[0]), r: ul_(p[1]) })); }

const UL_MC = ul_('Частина 1 — Вибір відповіді');
const UL_ONE = ul_('Оберіть одну правильну відповідь.');
const UL_MATCH = ul_('Частина 2 — Встановіть відповідність');
const UL_PICK = ul_('Для кожного рядка оберіть правильну відповідь зі списку.');
const UL_SHORT = ul_('Частина 3 — Коротка відповідь');
const UL_SHORT_I = ul_('Напишіть слово, прізвище або число.');
const UL_OPEN = ul_('Частина 4 — Творче завдання');
const UL_OPEN_I = ul_('Напишіть відповідь 3–5 реченнями.');

/** Ready-made tests. The first one is opened right away on a fresh install; the others start as drafts. */
const SEED_TESTS = [
  // ---- Grades 5–6: folklore, fairy tales, the first authors ----
  { title: ul_('Українська література 5–6 кл.: фольклор і літературна казка'), open: true, content: { langs: ['uk'], sections: [
    { title: UL_MC, instructions: UL_ONE, questions: [
      { type: 'mc', q: ul_('Хто автор казки «Фарбований Лис»?'),
        options: ulOpts_(['Леся Українка', 'Іван Франко', 'Тарас Шевченко', 'Василь Симоненко']), answer: 1 },
      { type: 'mc', q: ul_('Хто написав казку «Цар Плаксій та Лоскотон»?'),
        options: ulOpts_(['Василь Симоненко', 'Всеволод Нестайко', 'Іван Франко', 'Марко Вовчок']), answer: 0 },
      { type: 'mc', q: ul_('Чим народна казка відрізняється від літературної?'),
        options: ulOpts_(['Народна казка не має конкретного автора', 'Народна казка завжди віршована',
          'У народній казці немає чарівних подій', 'Народна казка завжди має сумний кінець']), answer: 0 },
      { type: 'mc', q: ul_('Як називається короткий влучний народний вислів повчального змісту?'),
        options: ulOpts_(['Прислів’я', 'Загадка', 'Легенда', 'Колядка']), answer: 0 },
      { type: 'mc', q: ul_('Яка пісня належить до зимового обрядового циклу?'),
        options: ulOpts_(['Щедрівка', 'Веснянка', 'Купальська пісня', 'Обжинкова пісня']), answer: 0 },
      { type: 'mc', q: ul_('Звідки родом Тарас Шевченко?'),
        options: ulOpts_(['З Моринців на Черкащині', 'З Нагуєвичів на Львівщині', 'З Полтави', 'З Новограда-Волинського']), answer: 0 },
      { type: 'mc', q: ul_('Про що розповідає вірш Т. Шевченка «Мені тринадцятий минало…»?'),
        options: ulOpts_(['Про дитинство й мить щастя пастушка, що змінилася смутком', 'Про подорож морем',
          'Про битву козаків із татарами', 'Про навчання в Петербурзі']), answer: 0 }
    ] },
    { title: UL_MATCH, instructions: UL_PICK, questions: [
      { type: 'match', q: ul_('Доберіть до кожного жанру фольклору його ознаку.'),
        pairs: ulPairs_([
          ['Казка', 'Розповідь про вигадані події з чарівними персонажами'],
          ['Легенда', 'Оповідь про незвичайні події, у які оповідач вірить, часто з поясненням походження чогось'],
          ['Загадка', 'Іносказальний опис предмета, який треба відгадати'],
          ['Прислів’я', 'Короткий повчальний вислів із завершеною думкою'],
          ['Колискова', 'Пісня, якою присипляють дитину']
        ]) },
      { type: 'match', q: ul_('Доберіть до кожного твору його автора.'),
        pairs: ulPairs_([
          ['«Фарбований Лис»', 'Іван Франко'],
          ['«Цар Плаксій та Лоскотон»', 'Василь Симоненко'],
          ['«Мені тринадцятий минало…»', 'Тарас Шевченко'],
          ['«Жаба і Віл»', 'Леонід Глібов']
        ]) }
    ] },
    { title: UL_SHORT, instructions: UL_SHORT_I, questions: [
      { type: 'short', q: ul_('Як звали Лиса, який став царем звірів у казці І. Франка?'),
        accept: ['Микита', 'Лис Микита'] },
      { type: 'short', q: ul_('Як називається повчальний висновок байки?'),
        accept: ['мораль', 'мораль байки'] },
      { type: 'num', q: ul_('Скільки років було героєві вірша Т. Шевченка «Мені тринадцятий минало…»? Напишіть число.'),
        accept: ['13'], tol: 0, note: ul_('Підказка в назві вірша.') }
    ] },
    { title: UL_OPEN, instructions: UL_OPEN_I, questions: [
      { type: 'open', q: ul_('Чого навчає казка «Фарбований Лис»? Наведіть приклад із твору.') }
    ] }
  ] } },

  // ---- Grades 7–8: the historical past in literature ----
  { title: ul_('Українська література 7–8 кл.: історичне минуле в літературі'), folder: '', open: false, minutes: 30, content: { langs: ['uk'], sections: [
    { title: UL_MC, instructions: UL_ONE, questions: [
      { type: 'mc', q: ul_('Проти кого боронять рідну землю тухольці в повісті І. Франка «Захар Беркут»?'),
        options: ulOpts_(['Проти монголо-татар', 'Проти шведів', 'Проти турків', 'Проти поляків']), answer: 0 },
      { type: 'mc', q: ul_('Як звали сина Захара Беркута, якого кохала Мирослава?'),
        options: ulOpts_(['Максим', 'Остап', 'Андрій', 'Тугар Вовк']), answer: 0 },
      { type: 'mc', q: ul_('Яким засобом тухольці перемогли ворожі війська?'),
        options: ulOpts_(['Затопили долину, загативши вихід із неї', 'Підпалили ліс', 'Покликали на допомогу князя', 'Отруїли криниці']), answer: 0 },
      { type: 'mc', q: ul_('Що таке дума?'),
        options: ulOpts_(['Ліро-епічний твір про історичні події, який виконували кобзарі', 'Коротка смішна пісня',
          'Обрядова пісня на весіллі', 'Прозова казка про тварин']), answer: 0 },
      { type: 'mc', q: ul_('Кому приписують пісню «Засвіт встали козаченьки»?'),
        options: ulOpts_(['Марусі Чурай', 'Лесі Українці', 'Марку Вовчку', 'Ліні Костенко']), answer: 0 },
      { type: 'mc', q: ul_('Який твір Т. Шевченка розповідає про Коліївщину?'),
        options: ulOpts_(['«Гайдамаки»', '«Катерина»', '«Кавказ»', '«Сон»']), answer: 0 }
    ] },
    { title: UL_MATCH, instructions: UL_PICK, questions: [
      { type: 'match', q: ul_('Доберіть до кожного персонажа повісті «Захар Беркут» його опис.'),
        pairs: ulPairs_([
          ['Захар Беркут', 'Мудрий старійшина громади Тухлі'],
          ['Максим', 'Хоробрий син старійшини'],
          ['Мирослава', 'Дочка боярина, що стала на бік тухольців'],
          ['Тугар Вовк', 'Боярин, який зрадив і перейшов до монголів'],
          ['Бурунда', 'Монгольський воєначальник']
        ]) },
      { type: 'match', q: ul_('Доберіть до кожного терміна його значення.'),
        pairs: ulPairs_([
          ['Повість', 'Епічний твір середнього обсягу'],
          ['Дума', 'Ліро-епічна пісня про історичні події'],
          ['Балада', 'Ліро-епічний твір із фантастичним або трагічним сюжетом'],
          ['Історична пісня', 'Пісня про реальні події та історичних осіб']
        ]) }
    ] },
    { title: UL_SHORT, instructions: UL_SHORT_I, questions: [
      { type: 'short', q: ul_('Як називалася гірська громада, про яку йдеться в повісті «Захар Беркут»?'),
        accept: ['Тухля', 'Тухольщина', 'Тухольська громада'] },
      { type: 'short', q: ul_('Як називали народних співців, що виконували думи під бандуру або кобзу?'),
        accept: ['кобзарі', 'кобзар', 'кобзарі й бандуристи', 'бандуристи'] },
      { type: 'num', q: ul_('Події «Захара Беркута» відбуваються під час монгольської навали. У якому році (за повістю) монголи прийшли в Карпати? Напишіть рік.'),
        accept: ['1241'], tol: 0 }
    ] },
    { title: UL_OPEN, instructions: UL_OPEN_I, questions: [
      { type: 'open', q: ul_('Чому Захар Беркут каже, що сила народу — у громаді? Поясніть своїми словами.') }
    ] }
  ] } },

  // ---- Grade 9: old literature, Kotliarevskyi, Shevchenko ----
  { title: ul_('Українська література 9 кл.: давня література, Котляревський, Шевченко'), folder: '', open: false, minutes: 30, content: { langs: ['uk'], sections: [
    { title: UL_MC, instructions: UL_ONE, questions: [
      { type: 'mc', q: ul_('Хто вважається автором «Повісті минулих літ»?'),
        options: ulOpts_(['Нестор Літописець', 'Ярослав Мудрий', 'Володимир Мономах', 'Григорій Сковорода']), answer: 0 },
      { type: 'mc', q: ul_('Про похід якого князя розповідає «Слово про похід Ігорів»?'),
        options: ulOpts_(['Новгород-Сіверського князя Ігоря Святославича', 'Київського князя Ігоря Рюриковича',
          'Князя Святослава Хороброго', 'Галицького князя Данила']), answer: 0 },
      { type: 'mc', q: ul_('Збірка Г. Сковороди, до якої входять його вірші, — це…'),
        options: ulOpts_(['«Сад божественних пісень»', '«Кобзар»', '«Зів’яле листя»', '«Сонячні кларнети»']), answer: 0 },
      { type: 'mc', q: ul_('Який твір вважають початком нової української літератури?'),
        options: ulOpts_(['«Енеїда» І. Котляревського', '«Кобзар» Т. Шевченка', '«Чорна рада» П. Куліша', '«Слово про похід Ігорів»']), answer: 0 },
      { type: 'mc', q: ul_('До якого жанру належить «Енеїда» І. Котляревського?'),
        options: ulOpts_(['Бурлескно-травестійна поема', 'Історичний роман', 'Соціально-побутова драма', 'Філософська байка']), answer: 0 },
      { type: 'mc', q: ul_('Кого кохає Наталка в п’єсі І. Котляревського «Наталка Полтавка»?'),
        options: ulOpts_(['Петра', 'Возного', 'Миколу', 'Макогоненка']), answer: 0 },
      { type: 'mc', q: ul_('Кому присвятив Т. Шевченко поему «Катерина»?'),
        options: ulOpts_(['Василеві Жуковському', 'Карлові Брюллову', 'Іванові Сошенку', 'Михайлові Щепкіну']), answer: 0 },
      { type: 'mc', q: ul_('У якому році вийшов перший «Кобзар» Т. Шевченка?'),
        options: ulOpts_(['1840', '1798', '1861', '1814']), answer: 0 }
    ] },
    { title: UL_MATCH, instructions: UL_PICK, questions: [
      { type: 'match', q: ul_('Доберіть до кожного твору його автора.'),
        pairs: ulPairs_([
          ['«Енеїда»', 'Іван Котляревський'],
          ['«Бджола і Шершень»', 'Григорій Сковорода'],
          ['«Заповіт»', 'Тарас Шевченко'],
          ['«Чорна рада»', 'Пантелеймон Куліш'],
          ['«Інститутка»', 'Марко Вовчок']
        ]) },
      { type: 'match', q: ul_('Доберіть до кожного персонажа твір, у якому він діє.'),
        pairs: ulPairs_([
          ['Еней', '«Енеїда»'],
          ['Возний Тетерваковський', '«Наталка Полтавка»'],
          ['Кирило Тур', '«Чорна рада»'],
          ['Ярославна', '«Слово про похід Ігорів»']
        ]) }
    ] },
    { title: UL_SHORT, instructions: UL_SHORT_I, questions: [
      { type: 'short', q: ul_('Яке справжнє прізвище письменниці Марко Вовчок?'),
        accept: ['Вілінська', 'Марія Вілінська', 'Марія Вілінська-Маркович', 'Вілінська-Маркович'] },
      { type: 'short', q: ul_('Як називається перший історичний роман в українській літературі (П. Куліш)?'),
        accept: ['Чорна рада', 'Чорна рада. Хроніка 1663 року'] },
      { type: 'num', q: ul_('Похід князя Ігоря, описаний у «Слові…», відбувся в … році. Напишіть рік.'),
        accept: ['1185'], tol: 0 }
    ] },
    { title: UL_OPEN, instructions: UL_OPEN_I, questions: [
      { type: 'open', q: ul_('Як ви розумієте заклик Т. Шевченка в «Заповіті»? Чому цей твір актуальний сьогодні?') }
    ] }
  ] } },

  // ---- Grades 10–11 / НМТ: from realism to the Executed Renaissance and beyond ----
  { title: ul_('Українська література 10–11 кл.: підготовка до НМТ'), folder: '', open: false, minutes: 40, content: { langs: ['uk'], sections: [
    { title: UL_MC, instructions: UL_ONE, questions: [
      { type: 'mc', q: ul_('У якому селі відбуваються події повісті І. Нечуя-Левицького «Кайдашева сім’я»?'),
        options: ulOpts_(['Семигори', 'Криворівня', 'Тухля', 'Піски']), answer: 0 },
      { type: 'mc', q: ul_('Хто автор роману «Хіба ревуть воли, як ясла повні?» (разом з Іваном Біликом)?'),
        options: ulOpts_(['Панас Мирний', 'Іван Нечуй-Левицький', 'Михайло Коцюбинський', 'Іван Франко']), answer: 0 },
      { type: 'mc', q: ul_('До якого жанру належить «Лісова пісня» Лесі Українки?'),
        options: ulOpts_(['Драма-феєрія', 'Історичний роман', 'Новела', 'Комедія']), answer: 0 },
      { type: 'mc', q: ul_('Головний герой новели В. Стефаника «Камінний хрест» — це…'),
        options: ulOpts_(['Іван Дідух', 'Іван Палійчук', 'Івоніка Федорчук', 'Степан Радченко']), answer: 0 },
      { type: 'mc', q: ul_('Провідний стиль творчості М. Коцюбинського («Intermezzo», «Тіні забутих предків»)?'),
        options: ulOpts_(['Імпресіонізм', 'Класицизм', 'Бароко', 'Соцреалізм']), answer: 0 },
      { type: 'mc', q: ul_('Яке місто є місцем дії роману В. Підмогильного «Місто»?'),
        options: ulOpts_(['Київ', 'Харків', 'Львів', 'Одеса']), answer: 0 },
      { type: 'mc', q: ul_('Чого прагне головний герой комедії М. Куліша «Мина Мазайло»?'),
        options: ulOpts_(['Змінити своє «немилозвучне» українське прізвище', 'Стати письменником',
          'Виїхати за кордон', 'Повернути родинну землю']), answer: 0 },
      { type: 'mc', q: ul_('Який твір Ліни Костенко є романом у віршах?'),
        options: ulOpts_(['«Маруся Чурай»', '«Записки українського самашедшого»', '«Сад нетанучих скульптур»', '«Неповторність»']), answer: 0 },
      { type: 'mc', q: ul_('Вірш із рядками «Як добре те, що смерті не боюсь я…» написав…'),
        options: ulOpts_(['Василь Стус', 'Павло Тичина', 'Максим Рильський', 'Микола Вінграновський']), answer: 0 }
    ] },
    { title: UL_MATCH, instructions: UL_PICK, questions: [
      { type: 'match', q: ul_('Доберіть до кожного твору його автора.'),
        pairs: ulPairs_([
          ['«Земля»', 'Ольга Кобилянська'],
          ['«Я (Романтика)»', 'Микола Хвильовий'],
          ['«Тигролови»', 'Іван Багряний'],
          ['«Собор»', 'Олесь Гончар'],
          ['«Сонячні кларнети»', 'Павло Тичина']
        ]) },
      { type: 'match', q: ul_('Доберіть до кожного псевдоніма справжнє ім’я письменника.'),
        pairs: ulPairs_([
          ['Леся Українка', 'Лариса Косач'],
          ['Панас Мирний', 'Панас Рудченко'],
          ['Олександр Олесь', 'Олександр Кандиба'],
          ['Остап Вишня', 'Павло Губенко'],
          ['Микола Хвильовий', 'Микола Фітільов']
        ]) },
      { type: 'match', q: ul_('Доберіть до кожного віршового розміру його схему (наголошений склад — «/», ненаголошений — «-»).'),
        pairs: ulPairs_([
          ['Ямб', '- /'],
          ['Хорей', '/ -'],
          ['Дактиль', '/ - -'],
          ['Амфібрахій', '- / -'],
          ['Анапест', '- - /']
        ]) }
    ] },
    { title: UL_SHORT, instructions: UL_SHORT_I, questions: [
      { type: 'short', q: ul_('Як звали головного героя повісті М. Коцюбинського «Тіні забутих предків»?'),
        accept: ['Іван', 'Іван Палійчук'], note: ul_('Героїня — Марічка.') },
      { type: 'short', q: ul_('Як називається лісова істота — головна героїня «Лісової пісні»?'),
        accept: ['Мавка'] },
      { type: 'short', q: ul_('Яким терміном називають покоління українських митців 1920–1930-х років, знищених тоталітарним режимом?'),
        accept: ['Розстріляне відродження', 'розстріляне відродження'] },
      { type: 'num', q: ul_('Скільки рядків має сонет? Напишіть число.'),
        accept: ['14'], tol: 0 }
    ] },
    { title: UL_OPEN, instructions: UL_OPEN_I, questions: [
      { type: 'open', q: ul_('У чому трагедія Мавки й Лукаша в «Лісовій пісні»? Висловіть свою думку з опорою на текст.') }
    ] }
  ] } }
];

// ---------- AI: photo(s) → Ukrainian literature test content ----------
// Code.gs adds the language rule after this text (with SUBJECT.langs = ['uk'] it is always "Ukrainian only").
const AI_INSTRUCTIONS =
  'You convert a photo of a printed school UKRAINIAN LITERATURE (українська література) test, quiz or worksheet page into structured JSON. ' +
  'The test is for Ukrainian schoolchildren and is written ONLY in Ukrainian: never add English texts or translations. ' +
  'Read every exercise on the page. Return ONLY JSON (no markdown fences, no commentary) shaped as: ' +
  '{"title": string, "sections": [{"title": TEXT, "instructions": TEXT, "questions": [Q, ...]}]}. ' +
  'Each Q is one of: ' +
  '{"type":"mc","q":TEXT,"options":[TEXT, TEXT, ...],"answer":<0-based index of the correct option>}; ' +
  '{"type":"short","q":TEXT,"accept":["answer","other correct forms"]} for a short answer (an author, a title, a character, a term); ' +
  '{"type":"num","q":TEXT,"accept":["1840"],"tol":0} when the answer is a number (a year, a number of lines or stanzas); ' +
  '{"type":"match","q":TEXT,"pairs":[{"l":TEXT,"r":TEXT}, ...]} for matching tasks (work ↔ author, character ↔ work, term ↔ definition, pen name ↔ real name): each pair is a left item and its correct right item; all right items must be different; ' +
  '{"type":"open","q":TEXT} for "explain / give your opinion / write an essay / analyse a poem" tasks with no single answer. ' +
  'Quotations from literary works must be copied exactly as printed. Titles of works go in «» quotes. Use the typographic apostrophe ’. ' +
  'In "accept" for short answers add equal variants: surname alone and with the first name (e.g. ["Франко", "Іван Франко", "І. Франко"]), a pen name and the real name if both are correct. ' +
  'For "mc", "answer" MUST be the 0-based index of the correct option; if the page does not mark it, use reliable knowledge of the Ukrainian school literature programme and of the НМТ. ' +
  'Never invent facts about authors or works; if you are not sure of a fact, prefer an "open" question. ' +
  'Keep the original wording from the page. Do not invent exercises that are not on the page.';
