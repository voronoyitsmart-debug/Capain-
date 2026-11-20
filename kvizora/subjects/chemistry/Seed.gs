/**
 * Seed.gs — CHEMISTRY. Everything that is special about this subject:
 * the ready-made tests, the AI prompt and which question types the editor offers.
 * Paste this as a SECOND script file (next to Code.gs), named "Seed".
 *
 * Every text a student sees is written in two languages: { uk: '…', en: '…' }.
 * Chemical formulas and equations use mhchem between $ signs: $\ce{H2SO4}$, $\ce{2H2 + O2 -> 2H2O}$.
 * Other math is plain LaTeX: $A_r$, $1s^2 2s^2$. The pages render them with KaTeX.
 */

const SUBJECT = {
  key: 'chemistry',
  name: { uk: 'Хімія', en: 'Chemistry' },
  mode: 'switch',                          // the student switches the whole test between УКР and EN
  qtypes: ['mc', 'num', 'chem', 'short', 'open'],  // question types the editor offers ('chem' = formula / equation)
  formulas: true                           // render $…$ with KaTeX (+ mhchem for \ce{…})
};

/** Ready-made tests. The first one is opened right away on a fresh install; the others start as drafts. */
const SEED_TESTS = [
  // ---------------------------------------------------------------- Test 1 — 8 клас
  { title: { uk: '8 клас · Будова атома і періодичний закон', en: 'Grade 8 · Atomic structure and the periodic law' }, open: true, minutes: 30, content: { langs: ['uk', 'en'], sections: [
    { title: { uk: 'Частина 1 — Вибір відповіді', en: 'Part 1 — Multiple choice' },
      instructions: { uk: 'Оберіть одну правильну відповідь.', en: 'Choose one correct answer.' }, questions: [
      { type: 'mc', q: { uk: 'Скільки протонів у ядрі атома Натрію ($\\ce{Na}$)?', en: 'How many protons are in the nucleus of a sodium atom ($\\ce{Na}$)?' },
        options: ['11', '23', '12', '1'], answer: 0 },
      { type: 'mc', q: { uk: 'Яка електронна конфігурація атома Магнію ($\\ce{Mg}$)?', en: 'What is the electron configuration of a magnesium atom ($\\ce{Mg}$)?' },
        options: ['$1s^2 2s^2 2p^6 3s^2$', '$1s^2 2s^2 2p^6 3s^1$', '$1s^2 2s^2 2p^6$', '$1s^2 2s^2 2p^6 3s^2 3p^2$'], answer: 0 },
      { type: 'mc', q: { uk: 'Ізотопи — це атоми одного елемента, що мають різну кількість…', en: 'Isotopes are atoms of the same element that have a different number of…' },
        options: [{ uk: 'нейтронів', en: 'neutrons' }, { uk: 'протонів', en: 'protons' }, { uk: 'електронів', en: 'electrons' }, { uk: 'енергетичних рівнів', en: 'energy levels' }], answer: 0 },
      { type: 'mc', q: { uk: 'Де в періодичній системі розташований елемент із протонним числом 17?', en: 'Where in the periodic table is the element with atomic number 17?' },
        options: [{ uk: '3-й період, VII група', en: 'Period 3, group VII' }, { uk: '2-й період, VII група', en: 'Period 2, group VII' },
          { uk: '3-й період, I група', en: 'Period 3, group I' }, { uk: '4-й період, VII група', en: 'Period 4, group VII' }], answer: 0 },
      { type: 'mc', q: { uk: 'Як змінюються металічні властивості елементів у періоді зліва направо?', en: 'How do the metallic properties of elements change across a period from left to right?' },
        options: [{ uk: 'послаблюються', en: 'they get weaker' }, { uk: 'посилюються', en: 'they get stronger' },
          { uk: 'не змінюються', en: 'they do not change' }, { uk: 'спочатку посилюються, потім послаблюються', en: 'first stronger, then weaker' }], answer: 0 },
      { type: 'mc', q: { uk: 'Який елемент має найбільший радіус атома?', en: 'Which element has the largest atomic radius?' },
        options: ['$\\ce{K}$', '$\\ce{Na}$', '$\\ce{Li}$', '$\\ce{Mg}$'], answer: 0 }
    ] },
    { title: { uk: 'Частина 2 — Числова відповідь', en: 'Part 2 — Number answer' },
      instructions: { uk: 'Введіть число. Одиниці можна не писати.', en: 'Type the number. Units are optional.' }, questions: [
      { type: 'num', q: { uk: 'Скільки нейтронів в атомі $^{35}_{17}\\mathrm{Cl}$?', en: 'How many neutrons are in the atom $^{35}_{17}\\mathrm{Cl}$?' }, accept: ['18'], tol: 0 },
      { type: 'num', q: { uk: 'Скільки електронів на зовнішньому енергетичному рівні атома Сульфуру ($\\ce{S}$)?', en: 'How many electrons are in the outer energy level of a sulfur atom ($\\ce{S}$)?' },
        accept: ['6'], tol: 0 },
      { type: 'num', q: { uk: 'Хлор має два ізотопи: $^{35}\\mathrm{Cl}$ (75 %) і $^{37}\\mathrm{Cl}$ (25 %). Обчисліть відносну атомну масу Хлору $A_r$.',
        en: 'Chlorine has two isotopes: $^{35}\\mathrm{Cl}$ (75 %) and $^{37}\\mathrm{Cl}$ (25 %). Calculate the relative atomic mass $A_r$ of chlorine.' }, accept: ['35.5'], tol: 0.05 }
    ] },
    { title: { uk: 'Частина 3 — Формули', en: 'Part 3 — Formulas' },
      instructions: { uk: 'Напишіть формулу. Індекси пишіть звичайними цифрами: H2O. Великі й малі літери важливі (Co ≠ CO).', en: 'Write the formula. Type subscripts as normal digits: H2O. Capital letters matter (Co ≠ CO).' }, questions: [
      { type: 'chem', q: { uk: 'Напишіть формулу вищого оксиду Сульфуру.', en: 'Write the formula of the highest oxide of sulfur.' }, accept: ['SO3'] },
      { type: 'chem', q: { uk: 'Напишіть формулу сполуки Натрію з Хлором.', en: 'Write the formula of the compound of sodium and chlorine.' }, accept: ['NaCl'] },
      { type: 'chem', q: { uk: 'Напишіть формулу леткої сполуки Нітрогену з Гідрогеном.', en: 'Write the formula of the volatile hydrogen compound of nitrogen.' }, accept: ['NH3', 'H3N'] }
    ] },
    { title: { uk: 'Частина 4 — Поясніть', en: 'Part 4 — Explain' },
      instructions: { uk: 'Дайте повну відповідь.', en: 'Give a full answer.' }, questions: [
      { type: 'open', q: { uk: 'Поясніть, чому Літій, Натрій і Калій мають подібні хімічні властивості. Як це пов’язано з будовою їхніх атомів?',
        en: 'Explain why lithium, sodium and potassium have similar chemical properties. How is this related to the structure of their atoms?' } }
    ] }
  ] } },

  // ---------------------------------------------------------------- Test 2 — 8–9 клас
  { title: { uk: '8–9 клас · Кількість речовини. Розрахунки за рівняннями', en: 'Grades 8–9 · Amount of substance. Calculations from equations' }, open: false, minutes: 40, content: { langs: ['uk', 'en'], sections: [
    { title: { uk: 'Частина 1 — Вибір відповіді', en: 'Part 1 — Multiple choice' },
      instructions: { uk: 'Оберіть одну правильну відповідь.', en: 'Choose one correct answer.' }, questions: [
      { type: 'mc', q: { uk: 'Яка одиниця вимірювання кількості речовини?', en: 'What is the unit of amount of substance?' },
        options: [{ uk: 'моль', en: 'mol' }, { uk: 'г/моль', en: 'g/mol' }, { uk: 'л', en: 'L' }, { uk: 'г', en: 'g' }], answer: 0 },
      { type: 'mc', q: { uk: 'Яка молярна маса сульфатної кислоти $\\ce{H2SO4}$?', en: 'What is the molar mass of sulfuric acid $\\ce{H2SO4}$?' },
        options: [{ uk: '98 г/моль', en: '98 g/mol' }, { uk: '96 г/моль', en: '96 g/mol' }, { uk: '49 г/моль', en: '49 g/mol' }, { uk: '100 г/моль', en: '100 g/mol' }], answer: 0 },
      { type: 'mc', q: { uk: 'Який об’єм займає 1 моль будь-якого газу за нормальних умов?', en: 'What volume does 1 mol of any gas occupy at standard conditions (STP)?' },
        options: [{ uk: '22,4 л', en: '22.4 L' }, { uk: '11,2 л', en: '11.2 L' }, { uk: '1 л', en: '1 L' }, { uk: '24 л', en: '24 L' }], answer: 0 },
      { type: 'mc', q: { uk: 'Доберіть коефіцієнти в схемі реакції: $\\ce{Al + O2 -> Al2O3}$', en: 'Choose the coefficients for the reaction: $\\ce{Al + O2 -> Al2O3}$' },
        options: ['4, 3, 2', '2, 3, 1', '4, 3, 1', '2, 1, 1'], answer: 0 },
      { type: 'mc', q: { uk: 'Яка з реакцій є реакцією розкладу?', en: 'Which of these is a decomposition reaction?' },
        options: ['$\\ce{CaCO3 -> CaO + CO2}$', '$\\ce{2H2 + O2 -> 2H2O}$', '$\\ce{Zn + 2HCl -> ZnCl2 + H2}$', '$\\ce{NaOH + HCl -> NaCl + H2O}$'], answer: 0 },
    ] },
    { title: { uk: 'Частина 2 — Розрахунки', en: 'Part 2 — Calculations' },
      instructions: { uk: 'Введіть число (можна з одиницями, напр. 20 г). $A_r$: H — 1, C — 12, O — 16, Na — 23, Mg — 24, S — 32, Ca — 40.',
        en: 'Type the number (units are fine, e.g. 20 g). $A_r$: H — 1, C — 12, O — 16, Na — 23, Mg — 24, S — 32, Ca — 40.' }, questions: [
      { type: 'num', q: { uk: 'Обчисліть молярну масу кальцій карбонату $\\ce{CaCO3}$ (г/моль).', en: 'Calculate the molar mass of calcium carbonate $\\ce{CaCO3}$ (g/mol).' }, accept: ['100'], tol: 0 },
      { type: 'num', q: { uk: 'Яка кількість речовини (моль) міститься у 36 г води $\\ce{H2O}$?', en: 'What amount of substance (mol) is in 36 g of water $\\ce{H2O}$?' }, accept: ['2'], tol: 0 },
      { type: 'num', q: { uk: 'Яку масу (г) має 0,5 моль натрій гідроксиду $\\ce{NaOH}$?', en: 'What is the mass (g) of 0.5 mol of sodium hydroxide $\\ce{NaOH}$?' }, accept: ['20'], tol: 0 },
      { type: 'num', q: { uk: 'Обчисліть масову частку Оксигену у воді $\\ce{H2O}$ (у %, до десятих).', en: 'Calculate the mass fraction of oxygen in water $\\ce{H2O}$ (in %, to one decimal place).' },
        accept: ['88.9'], tol: 0.1, note: { uk: 'Можна писати зі знаком % або без нього.', en: 'You may write it with or without the % sign.' } },
      { type: 'num', q: { uk: 'Яка маса (г) кисню потрібна для повного згоряння 4 г водню? $\\ce{2H2 + O2 -> 2H2O}$',
        en: 'What mass (g) of oxygen is needed to burn 4 g of hydrogen completely? $\\ce{2H2 + O2 -> 2H2O}$' }, accept: ['32'], tol: 0,
        note: { uk: 'Підказка: спершу знайдіть $n(\\ce{H2})$.', en: 'Hint: find $n(\\ce{H2})$ first.' } },
      { type: 'num', q: { uk: 'Який об’єм (л, н. у.) вуглекислого газу утвориться під час розкладу 50 г кальцій карбонату? $\\ce{CaCO3 -> CaO + CO2}$',
        en: 'What volume (L, STP) of carbon dioxide forms when 50 g of calcium carbonate decomposes? $\\ce{CaCO3 -> CaO + CO2}$' }, accept: ['11.2'], tol: 0.1 }
    ] },
    { title: { uk: 'Частина 3 — Рівняння реакцій', en: 'Part 3 — Chemical equations' },
      instructions: { uk: 'Пишіть формули звичайними символами: 2H2 + O2 = 2H2O. Стрілку можна писати як = або ->.', en: 'Type formulas with plain characters: 2H2 + O2 = 2H2O. Write the arrow as = or ->.' }, questions: [
      { type: 'chem', q: { uk: 'Яка речовина пропущена в рівнянні $\\ce{Zn + 2HCl -> ? + H2}$? Напишіть її формулу.',
        en: 'Which substance is missing in the equation $\\ce{Zn + 2HCl -> ? + H2}$? Write its formula.' }, accept: ['ZnCl2'] },
      { type: 'chem', q: { uk: 'Напишіть рівняння горіння метану $\\ce{CH4}$ у кисні (з коефіцієнтами).', en: 'Write the balanced equation for burning methane $\\ce{CH4}$ in oxygen.' },
        accept: ['CH4 + 2O2 = CO2 + 2H2O'] },
      { type: 'chem', q: { uk: 'Напишіть рівняння реакції нейтралізації натрій гідроксиду хлоридною кислотою.', en: 'Write the equation for the neutralisation of sodium hydroxide with hydrochloric acid.' },
        accept: ['NaOH + HCl = NaCl + H2O'] },
      { type: 'chem', q: { uk: 'Напишіть рівняння розкладу кальцій карбонату під час нагрівання.', en: 'Write the equation for the decomposition of calcium carbonate on heating.' },
        accept: ['CaCO3 = CaO + CO2'] }
    ] },
    { title: { uk: 'Частина 4 — Задача з розв’язанням', en: 'Part 4 — Problem with full working' },
      instructions: { uk: 'Запишіть дано, рівняння і розв’язання.', en: 'Write what is given, the equation and the solution.' }, questions: [
      { type: 'open', q: { uk: 'Яка маса магній оксиду утвориться під час згоряння 12 г магнію? $\\ce{2Mg + O2 -> 2MgO}$',
        en: 'What mass of magnesium oxide forms when 12 g of magnesium burns? $\\ce{2Mg + O2 -> 2MgO}$' } }
    ] }
  ] } }
];

// ---------- AI: photo(s) → chemistry test content ----------
// Code.gs adds the rules for the two languages after this text.
const AI_INSTRUCTIONS =
  'You convert a photo of a printed school CHEMISTRY test or worksheet page into structured JSON. ' +
  'Read every exercise on the page. Return ONLY JSON (no markdown fences, no commentary) shaped as: ' +
  '{"title": string, "sections": [{"title": TEXT, "instructions": TEXT, "questions": [Q, ...]}]}. ' +
  'Each Q is one of: ' +
  '{"type":"mc","q":TEXT,"options":[TEXT, TEXT, ...],"answer":<0-based index of the correct option>}; ' +
  '{"type":"num","q":TEXT,"accept":["the correct number"],"tol":<optional absolute tolerance number, default 0>}; ' +
  '{"type":"chem","q":TEXT (asks to write a chemical formula or equation),"accept":["H2SO4"] or ["2H2 + O2 = 2H2O"]}; ' +
  '{"type":"short","q":TEXT (asks for one exact word),"accept":["answer1","answer2"]}; ' +
  '{"type":"open","q":TEXT (a problem where the student must show working, write an equation or explain)}. ' +
  'CHEMISTRY FORMATTING: write chemical formulas, ions and equations with mhchem between single dollar signs, e.g. $\\ce{H2SO4}$, $\\ce{SO4^2-}$, $\\ce{2H2 + O2 -> 2H2O}$. ' +
  'Other math in LaTeX between dollar signs, e.g. $A_r$, $M(\\ce{H2O})$, $1s^2 2s^2 2p^6$, $^{35}_{17}\\mathrm{Cl}$. Keep normal words outside the dollar signs. ' +
  'ANSWERS: for "num", put the number in "accept" as a plain value WITHOUT dollar signs or units, e.g. "98", "0.5", "11.2". Use "tol" only when a rounded answer is expected (e.g. 0.1). ' +
  'For "chem", put the formula or equation in "accept" as plain text WITHOUT dollar signs or \\ce, with normal digits, "=" as the arrow and correct letter case. Spaces and the order of substances do not matter when checking. ' +
  'Prefer "num" for any question whose answer is a number, "chem" when the student must write a formula or an equation, "mc" when the page lists options, "open" for problems that ask to show working or explain. ' +
  'For "mc", "answer" MUST be the 0-based index of the correct option; if unsure, give your best guess. Keep the original wording, numbers and formulas from the page. ' +
  'Use standard Ukrainian school chemistry terms (e.g. "сульфатна кислота", "атом Оксигену", "кількість речовини"). Do not invent exercises that are not on the page.';
