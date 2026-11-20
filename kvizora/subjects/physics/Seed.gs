/**
 * Seed.gs — PHYSICS. Everything that is special about this subject:
 * the ready-made tests, the AI prompt and which question types the editor offers.
 * Paste this as a SECOND script file (next to Code.gs), named "Seed".
 *
 * Every text a student sees is written in two languages: { uk: '…', en: '…' }.
 * Formulas are written with LaTeX between $ signs, e.g. $F = ma$ or $E_k = \dfrac{mv^2}{2}$;
 * units are plain text outside the $ signs. The pages render formulas with KaTeX.
 */

const SUBJECT = {
  key: 'physics',
  name: { uk: 'Фізика', en: 'Physics' },
  mode: 'switch',                          // the student switches the whole test between УКР and EN
  qtypes: ['mc', 'num', 'match', 'short', 'open'],  // question types the editor offers (match: e.g. quantity ↔ unit)
  formulas: true                           // render $…$ with KaTeX
};

/**
 * Ready-made tests, grade 9 ("Рух і взаємодія. Закони збереження"), g = 10 N/kg.
 * Where a student may use g = 9.8 instead, both answers are accepted.
 * The first test is opened right away on a fresh install; the second starts as a draft.
 */
const SEED_TESTS = [
  { title: { uk: "Фізика, 9 клас — Рух і сили", en: "Physics, Grade 9 — Motion and Forces" }, folder: "9 клас", open: true, content: { langs: ['uk', 'en'], sections: [
    { title: { uk: "Частина 1 — Вибір відповіді", en: "Part 1 — Multiple choice" },
      instructions: { uk: "Оберіть одну правильну відповідь.", en: "Choose one correct answer." }, questions: [
      { type: "mc", q: { uk: "Яка одиниця прискорення в СІ?", en: "What is the SI unit of acceleration?" },
        options: [{ uk: "м/с", en: "m/s" }, { uk: "м/с²", en: "m/s²" }, { uk: "Н", en: "N" }, { uk: "км/год", en: "km/h" }], answer: 1 },
      { type: "mc", q: { uk: "Тіло рухається рівномірно і прямолінійно. Що можна сказати про його швидкість?", en: "A body moves uniformly in a straight line. What can you say about its velocity?" },
        options: [{ uk: "Вона не змінюється ні за модулем, ні за напрямком", en: "It changes neither in magnitude nor in direction" }, { uk: "Вона рівномірно збільшується", en: "It increases steadily" }, { uk: "Вона рівномірно зменшується", en: "It decreases steadily" }, { uk: "Змінюється лише її напрямок", en: "Only its direction changes" }], answer: 0 },
      { type: "mc", q: { uk: "Перший закон Ньютона ще називають законом ___.", en: "Newton’s first law is also called the law of ___." },
        options: [{ uk: "інерції", en: "inertia" }, { uk: "всесвітнього тяжіння", en: "universal gravitation" }, { uk: "збереження енергії", en: "conservation of energy" }, { uk: "Гука", en: "elasticity" }], answer: 0 },
      { type: "mc", q: { uk: "Яка формула виражає другий закон Ньютона?", en: "Which formula expresses Newton’s second law?" },
        options: ["$\\vec{F} = m\\vec{a}$", "$F = mv$", "$F = \\dfrac{m}{a}$", "$F = ma^2$"], answer: 0 },
      { type: "mc", q: { uk: "Ви штовхаєте стіну з силою 50 Н. З якою силою стіна діє на вас?", en: "You push a wall with a force of 50 N. What force does the wall exert on you?" },
        options: [{ uk: "0 Н", en: "0 N" }, { uk: "25 Н", en: "25 N" }, { uk: "50 Н, напрямленою до вас", en: "50 N, directed towards you" }, { uk: "100 Н", en: "100 N" }], answer: 2 }
    ] },
    { title: { uk: "Частина 2 — Розрахункові задачі", en: "Part 2 — Calculations" },
      instructions: { uk: "Введіть лише число в зазначених одиницях (кома чи крапка — неважливо). Вважайте $g = 10$ Н/кг.", en: "Type only the number in the given units (a comma or a dot is fine). Take $g = 10$ N/kg." }, questions: [
      { type: "num", q: { uk: "Автомобіль проїхав 150 км за 2 год. Яка його середня швидкість?", en: "A car travels 150 km in 2 h. What is its average speed?" },
        note: { uk: "Відповідь у км/год.", en: "Answer in km/h." }, accept: ["75"], tol: 0 },
      { type: "num", q: { uk: "Велосипедист рушає з місця з прискоренням $0{,}5$ м/с². Якої швидкості він набуде через 10 с?", en: "A cyclist starts from rest with an acceleration of $0.5$ m/s². What speed does the cyclist reach after 10 s?" },
        note: { uk: "Відповідь у м/с.", en: "Answer in m/s." }, accept: ["5"], tol: 0 },
      { type: "num", q: { uk: "Автомобіль, що рухався зі швидкістю 20 м/с, загальмував до повної зупинки за 4 с. Знайдіть модуль його прискорення.", en: "A car moving at 20 m/s brakes to a complete stop in 4 s. Find the magnitude of its acceleration." },
        note: { uk: "Відповідь у м/с².", en: "Answer in m/s²." }, accept: ["5"], tol: 0 },
      { type: "num", q: { uk: "Сила 12 Н надає тілу прискорення 3 м/с². Яка маса тіла?", en: "A force of 12 N gives a body an acceleration of 3 m/s². What is the mass of the body?" },
        note: { uk: "Відповідь у кг.", en: "Answer in kg." }, accept: ["4"], tol: 0 },
      { type: "num", q: { uk: "Тіло вільно падає без початкової швидкості протягом 2 с. Яку відстань воно пролетить? Опором повітря знехтуйте.", en: "A body falls freely from rest for 2 s. How far does it fall? Ignore air resistance." },
        note: { uk: "Відповідь у м.", en: "Answer in m." }, accept: ["20","19.6"], tol: 0 },
      { type: "num", q: { uk: "Яка сила тяжіння діє на тіло масою $2{,}5$ кг?", en: "What is the force of gravity on a body of mass $2.5$ kg?" },
        note: { uk: "Відповідь у Н.", en: "Answer in N." }, accept: ["25","24.5"], tol: 0 }
    ] },
    { title: { uk: "Частина 3 — Поясніть і розв’яжіть", en: "Part 3 — Explain and solve" },
      instructions: { uk: "Напишіть повну відповідь. Ці завдання вчитель перевіряє сам.", en: "Write a full answer. Your teacher marks these." }, questions: [
      { type: "open", q: { uk: "Автобус різко гальмує, і пасажирів «кидає» вперед. Поясніть, чому так відбувається, використовуючи поняття інерції.", en: "A bus brakes suddenly and the passengers lurch forward. Explain why this happens, using the idea of inertia." } },
      { type: "open", q: { uk: "Брусок масою 2 кг тягнуть по горизонтальному столу з силою 10 Н. Сила тертя дорівнює 4 Н. Знайдіть прискорення бруска. Запишіть «Дано», формули та обчислення.", en: "A 2 kg block is pulled along a horizontal table with a force of 10 N. The friction force is 4 N. Find the acceleration of the block. Write what is given, the formulas and your calculation." } }
    ] }
  ] } },

  { title: { uk: "Фізика, 9 клас — Робота, енергія, імпульс", en: "Physics, Grade 9 — Work, Energy and Momentum" }, folder: "9 клас", open: false, content: { langs: ['uk', 'en'], sections: [
    { title: { uk: "Частина 1 — Вибір відповіді", en: "Part 1 — Multiple choice" },
      instructions: { uk: "Оберіть одну правильну відповідь.", en: "Choose one correct answer." }, questions: [
      { type: "mc", q: { uk: "У яких одиницях вимірюють механічну роботу?", en: "What is the unit of mechanical work?" },
        options: [{ uk: "джоулях (Дж)", en: "joule (J)" }, { uk: "ватах (Вт)", en: "watt (W)" }, { uk: "ньютонах (Н)", en: "newton (N)" }, { uk: "паскалях (Па)", en: "pascal (Pa)" }], answer: 0 },
      { type: "mc", q: { uk: "За якою формулою обчислюють кінетичну енергію?", en: "Which formula gives kinetic energy?" },
        options: ["$E_k = \\dfrac{mv^2}{2}$", "$E_k = mgh$", "$E_k = mv$", "$E_k = Fs$"], answer: 0 },
      { type: "mc", q: { uk: "Як зміниться кінетична енергія тіла, якщо його швидкість збільшити у 2 рази?", en: "How does the kinetic energy of a body change if its speed is doubled?" },
        options: [{ uk: "збільшиться у 2 рази", en: "it doubles" }, { uk: "збільшиться у 4 рази", en: "it becomes 4 times greater" }, { uk: "не зміниться", en: "it does not change" }, { uk: "зменшиться у 2 рази", en: "it halves" }], answer: 1 },
      { type: "mc", q: { uk: "Коли м’яч вільно падає (без опору повітря), його…", en: "When a ball falls freely (no air resistance), its…" },
        options: [{ uk: "потенціальна енергія перетворюється на кінетичну", en: "potential energy turns into kinetic energy" }, { uk: "кінетична енергія перетворюється на потенціальну", en: "kinetic energy turns into potential energy" }, { uk: "повна механічна енергія зростає", en: "total mechanical energy increases" }, { uk: "повна механічна енергія зменшується", en: "total mechanical energy decreases" }], answer: 0 },
      { type: "mc", q: { uk: "Імпульс тіла визначають за формулою:", en: "The momentum of a body is given by:" },
        options: ["$\\vec{p} = m\\vec{v}$", "$\\vec{p} = m\\vec{a}$", "$p = Fs$", "$p = \\dfrac{mv^2}{2}$"], answer: 0 }
    ] },
    { title: { uk: "Частина 2 — Розрахункові задачі", en: "Part 2 — Calculations" },
      instructions: { uk: "Введіть лише число в зазначених одиницях (кома чи крапка — неважливо). Вважайте $g = 10$ Н/кг.", en: "Type only the number in the given units (a comma or a dot is fine). Take $g = 10$ N/kg." }, questions: [
      { type: "num", q: { uk: "Сила 20 Н переміщує тіло на 5 м у напрямку своєї дії. Яку роботу виконує ця сила?", en: "A force of 20 N moves a body 5 m in the direction of the force. How much work does the force do?" },
        note: { uk: "Відповідь у Дж.", en: "Answer in J." }, accept: ["100"], tol: 0 },
      { type: "num", q: { uk: "Двигун виконав роботу 6 кДж за 30 с. Яка його потужність?", en: "A motor does 6 kJ of work in 30 s. What is its power?" },
        note: { uk: "Відповідь у Вт.", en: "Answer in W." }, accept: ["200"], tol: 0 },
      { type: "num", q: { uk: "Тіло масою 2 кг рухається зі швидкістю 3 м/с. Яка його кінетична енергія?", en: "A body of mass 2 kg moves at 3 m/s. What is its kinetic energy?" },
        note: { uk: "Відповідь у Дж.", en: "Answer in J." }, accept: ["9"], tol: 0 },
      { type: "num", q: { uk: "Яка потенціальна енергія тіла масою 5 кг на висоті 4 м над землею?", en: "What is the potential energy of a 5 kg body at a height of 4 m above the ground?" },
        note: { uk: "Відповідь у Дж.", en: "Answer in J." }, accept: ["200","196"], tol: 0 },
      { type: "num", q: { uk: "М’яч падає з висоти 5 м без початкової швидкості. Яку швидкість він матиме біля землі? Опором повітря знехтуйте.", en: "A ball falls from rest from a height of 5 m. What is its speed just before it hits the ground? Ignore air resistance." },
        note: { uk: "Відповідь у м/с.", en: "Answer in m/s." }, accept: ["10","9.9"], tol: 0.05 },
      { type: "num", q: { uk: "Візок масою 2 кг рухається зі швидкістю 3 м/с і зчіплюється з нерухомим візком масою 1 кг. З якою швидкістю вони рухатимуться разом?", en: "A 2 kg cart moving at 3 m/s couples with a stationary 1 kg cart. At what speed do they move together?" },
        note: { uk: "Відповідь у м/с.", en: "Answer in m/s." }, accept: ["2"], tol: 0 },
      { type: "num", q: { uk: "Підйомний кран піднімає вантаж масою 500 кг на висоту 12 м за 30 с. Яку потужність розвиває кран?", en: "A crane lifts a 500 kg load to a height of 12 m in 30 s. What power does the crane develop?" },
        note: { uk: "Відповідь у Вт.", en: "Answer in W." }, accept: ["2000","1960"], tol: 0 }
    ] },
    { title: { uk: "Частина 3 — Термін", en: "Part 3 — Key term" },
      instructions: { uk: "Напишіть одне слово (українською або англійською).", en: "Write one word (in English or Ukrainian)." }, questions: [
      { type: "short", q: { uk: "Як називають фізичну величину, що дорівнює добутку маси тіла на його швидкість?", en: "What is the name of the physical quantity equal to the mass of a body times its velocity?" }, accept: ["імпульс","імпульс тіла","кількість руху","momentum"] }
    ] },
    { title: { uk: "Частина 4 — Поясніть", en: "Part 4 — Explain" },
      instructions: { uk: "Напишіть повну відповідь. Це завдання вчитель перевіряє сам.", en: "Write a full answer. Your teacher marks this one." }, questions: [
      { type: "open", q: { uk: "Опишіть, як перетворюється енергія, коли гойдалка рухається від найвищої точки до найнижчої і знову вгору. Чому з часом гойдалка зупиняється?", en: "Describe how energy changes as a swing moves from its highest point to its lowest point and up again. Why does the swing eventually stop?" } }
    ] }
  ] } }
];

// ---------- AI: photo(s) → physics test content ----------
// Code.gs adds the rules for the two languages after this text.
const AI_INSTRUCTIONS =
  'You convert photos of a printed school PHYSICS test or worksheet into structured JSON. ' +
  'Read every exercise on the page. Return ONLY JSON (no markdown fences, no commentary) shaped as: ' +
  '{"title": string, "sections": [{"title": TEXT, "instructions": TEXT, "questions": [Q, ...]}]}. ' +
  'Each Q is one of: ' +
  '{"type":"mc","q":TEXT,"options":[TEXT, TEXT, ...],"answer":<0-based index of the correct option>}; ' +
  '{"type":"num","q":TEXT,"note":TEXT (the unit to answer in, e.g. "Answer in m/s."),"accept":["the correct answer","an equivalent form"],"tol":<optional absolute tolerance, default 0>}; ' +
  '{"type":"short","q":TEXT,"accept":["answer1","answer2"]} (only for a term or word answer); ' +
  '{"type":"open","q":TEXT} (a problem where the student must show working, explain, draw or describe; no single value). ' +
  'PHYSICS FORMATTING: write formulas, symbols with indices, vectors and powers of ten in LaTeX between single dollar signs, e.g. $F = ma$, $\\vec{v}$, $E_k = \\dfrac{mv^2}{2}$, $v_0$, $3\\cdot10^8$. ' +
  'Inside LaTeX use only Latin letters; a Ukrainian decimal comma is written {,} (e.g. $0{,}5$). ' +
  'Write units as plain text OUTSIDE the dollar signs, in the language of that text (Ukrainian: м, с, кг, Н, Дж, Вт, м/с, м/с²; English: m, s, kg, N, J, W, m/s, m/s²). ' +
  'ANSWERS: for "num", put the numeric answer in "accept" as a plain value WITHOUT units or dollar signs, in the unit the question asks for (e.g. "75", "0.5", "3e8"), and say that unit in "note". ' +
  'If the result depends on g, add both the value for g = 10 and for g = 9.8 to "accept", or set "tol". Use "tol" also when a rounded answer is expected. ' +
  'Prefer "num" for any question whose answer is a number, "mc" when the page lists options, "open" for problems that ask to show working, explain, draw a diagram or read a graph. ' +
  'For "mc", "answer" MUST be the 0-based index of the correct option; if unsure, give your best guess. Keep the original wording and numbers from the page. Do not invent exercises that are not on the page. ' +
  'If a question depends on a picture or graph, describe what is needed in words inside the question so the student can still answer.';
