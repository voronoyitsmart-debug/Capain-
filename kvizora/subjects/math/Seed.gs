/**
 * Seed.gs — MATHS. Everything that is special about this subject:
 * the ready-made tests, the AI prompt and which question types the editor offers.
 * Paste this as a SECOND script file (next to Code.gs), named "Seed".
 *
 * Every text a student sees is written in two languages: { uk: '…', en: '…' }.
 * Formulas are written with LaTeX between $ signs, e.g. $\frac{3}{4}$ or $x^2$.
 * The pages render them with KaTeX.
 */

const SUBJECT = {
  key: 'math',
  name: { uk: 'Математика', en: 'Maths' },
  mode: 'switch',                          // the student switches the whole test between УКР and EN
  qtypes: ['mc', 'num', 'solve', 'short', 'open'],  // question types the editor offers ('solve': the student solves an equation step by step)
  formulas: true,                          // render $…$ with KaTeX
  // tools the teacher can give the students in a test (editor → "Інструменти для учнів"): each one on or off per test
  tools: ['calc', 'graph', 'ruler', 'protractor', 'formulas'],
  // the formula sheet students see when "formulas" is on (the teacher can replace it with their own in the editor); one formula per line
  formulaSheet: {
    uk: 'Квадратне рівняння: $ax^2+bx+c=0$\n' +
      'Дискримінант: $D=b^2-4ac$\n' +
      'Корені: $x_{1,2}=\\frac{-b\\pm\\sqrt{D}}{2a}$\n' +
      'Теорема Вієта: $x_1+x_2=-\\frac{b}{a}$, $x_1 x_2=\\frac{c}{a}$\n' +
      'Квадрат суми: $(a+b)^2=a^2+2ab+b^2$\n' +
      'Квадрат різниці: $(a-b)^2=a^2-2ab+b^2$\n' +
      'Різниця квадратів: $a^2-b^2=(a-b)(a+b)$\n' +
      'Степені: $a^m\\cdot a^n=a^{m+n}$, $(a^m)^n=a^{mn}$, $a^{-n}=\\frac{1}{a^n}$\n' +
      'Пропорція: $\\frac{a}{b}=\\frac{c}{d} \\Rightarrow ad=bc$\n' +
      'Теорема Піфагора: $c^2=a^2+b^2$\n' +
      'Площа трикутника: $S=\\frac{1}{2}ah$; кола: $S=\\pi r^2$; довжина кола: $C=2\\pi r$',
    en: 'Quadratic equation: $ax^2+bx+c=0$\n' +
      'Discriminant: $D=b^2-4ac$\n' +
      'Roots: $x_{1,2}=\\frac{-b\\pm\\sqrt{D}}{2a}$\n' +
      'Vieta\'s formulas: $x_1+x_2=-\\frac{b}{a}$, $x_1 x_2=\\frac{c}{a}$\n' +
      'Square of a sum: $(a+b)^2=a^2+2ab+b^2$\n' +
      'Square of a difference: $(a-b)^2=a^2-2ab+b^2$\n' +
      'Difference of squares: $a^2-b^2=(a-b)(a+b)$\n' +
      'Powers: $a^m\\cdot a^n=a^{m+n}$, $(a^m)^n=a^{mn}$, $a^{-n}=\\frac{1}{a^n}$\n' +
      'Proportion: $\\frac{a}{b}=\\frac{c}{d} \\Rightarrow ad=bc$\n' +
      'Pythagoras: $c^2=a^2+b^2$\n' +
      'Area of a triangle: $S=\\frac{1}{2}ah$; circle: $S=\\pi r^2$; circumference: $C=2\\pi r$'
  }
};

/** Ready-made tests. The first one is opened right away on a fresh install; the others start as drafts. */
const SEED_TESTS = [
  { title: 'Sample Math Test', open: true, content: { langs: ['uk', 'en'], sections: [
    { title: { uk: 'Частина 1 — Вибір відповіді', en: 'Part 1 — Multiple choice' },
      instructions: { uk: 'Оберіть правильну відповідь.', en: 'Choose the correct answer.' }, questions: [
      { type: 'mc', q: { uk: 'Скільки буде $7 \\times 8$?', en: 'What is $7 \\times 8$?' }, options: ['54', '56', '48', '64'], answer: 1 },
      { type: 'mc', q: { uk: 'Скоротіть дріб $\\frac{6}{9}$.', en: 'Simplify $\\frac{6}{9}$.' }, options: ['$\\frac{2}{3}$', '$\\frac{3}{2}$', '$\\frac{1}{3}$', '$\\frac{6}{9}$'], answer: 0 },
      { type: 'mc', q: { uk: 'Яке з чисел є простим?', en: 'Which number is a prime number?' }, options: ['21', '27', '29', '33'], answer: 2 },
      { type: 'mc', q: { uk: 'Знайдіть значення виразу $3^2 + 4^2$.', en: 'What is the value of $3^2 + 4^2$?' }, options: ['25', '49', '12', '14'], answer: 0 }
    ] },
    { title: { uk: 'Частина 2 — Коротка відповідь', en: 'Part 2 — Short answer' },
      instructions: { uk: 'Введіть число. Можна писати дроби, наприклад 3/4.', en: 'Type the number. Fractions like 3/4 are accepted.' }, questions: [
      { type: 'num', q: { uk: 'Обчисліть $15\\%$ від $200$.', en: 'Calculate $15\\%$ of $200$.' }, accept: ['30'], tol: 0 },
      { type: 'num', q: { uk: 'Розв’яжіть рівняння: $2x + 5 = 17$.', en: 'Solve for $x$:  $2x + 5 = 17$.' }, accept: ['6'], tol: 0 },
      { type: 'num', q: { uk: 'Скільки буде $\\frac{3}{4} + \\frac{1}{4}$?', en: 'What is $\\frac{3}{4} + \\frac{1}{4}$?' }, accept: ['1'], tol: 0 },
      { type: 'num', q: { uk: 'Округліть $3.14159$ до сотих.', en: 'Round $3.14159$ to two decimal places.' }, accept: ['3.14'], tol: 0 },
      { type: 'num', q: { uk: 'Прямокутник має сторони $5\\text{ см}$ і $8\\text{ см}$. Яка його площа в $\\text{см}^2$?',
        en: 'A rectangle is $5\\text{ cm}$ by $8\\text{ cm}$. What is its area in $\\text{cm}^2$?' }, accept: ['40'], tol: 0 }
    ] },
    { title: { uk: 'Частина 3 — Розв’язання', en: 'Part 3 — Show your working' },
      instructions: { uk: 'Запишіть повне розв’язання.', en: 'Write your full solution.' }, questions: [
      { type: 'open', q: { uk: 'Куртку за $80$ грн уцінили на $25\\%$. Поясніть крок за кроком, як знайти нову ціну.',
        en: 'A shop reduces an $80$ UAH jacket by $25\\%$. Explain step by step how you find the new price.' } }
    ] }
  ] } },

  { title: 'Дроби та відсотки / Fractions & percentages', folder: '', open: false, minutes: 20, content: { langs: ['uk', 'en'], sections: [
    { title: { uk: 'Частина 1 — Вибір відповіді', en: 'Part 1 — Multiple choice' },
      instructions: { uk: 'Оберіть одну правильну відповідь.', en: 'Choose one correct answer.' }, questions: [
      { type: 'mc', q: { uk: 'Який дріб дорівнює $0.25$?', en: 'Which fraction equals $0.25$?' }, options: ['$\\frac{1}{2}$', '$\\frac{1}{4}$', '$\\frac{2}{5}$', '$\\frac{1}{25}$'], answer: 1 },
      { type: 'mc', q: { uk: 'Який із дробів найбільший?', en: 'Which fraction is the largest?' }, options: ['$\\frac{2}{3}$', '$\\frac{3}{5}$', '$\\frac{5}{8}$', '$\\frac{7}{12}$'], answer: 0 },
      { type: 'mc', q: { uk: 'Скільки буде $\\frac{2}{3} \\cdot \\frac{9}{4}$?', en: 'What is $\\frac{2}{3} \\cdot \\frac{9}{4}$?' }, options: ['$\\frac{3}{2}$', '$\\frac{11}{7}$', '$\\frac{18}{7}$', '$\\frac{8}{27}$'], answer: 0 },
      { type: 'mc', q: { uk: 'Ціна зросла з $40$ грн до $50$ грн. На скільки відсотків?', en: 'A price went up from $40$ UAH to $50$ UAH. By what percentage?' }, options: ['$10\\%$', '$20\\%$', '$25\\%$', '$50\\%$'], answer: 2 }
    ] },
    { title: { uk: 'Частина 2 — Числова відповідь', en: 'Part 2 — Number answer' },
      instructions: { uk: 'Введіть відповідь числом: дріб (3/4), десятковий дріб (0,75) або відсоток (75%).', en: 'Type the answer as a number: a fraction (3/4), a decimal (0.75) or a percentage (75%).' }, questions: [
      { type: 'num', q: { uk: 'Обчисліть $\\frac{1}{2} + \\frac{1}{3}$.', en: 'Work out $\\frac{1}{2} + \\frac{1}{3}$.' }, accept: ['5/6'], tol: 0 },
      { type: 'num', q: { uk: 'Запишіть $\\frac{3}{8}$ десятковим дробом.', en: 'Write $\\frac{3}{8}$ as a decimal.' }, accept: ['0.375', '3/8'], tol: 0 },
      { type: 'num', q: { uk: 'Знайдіть $40\\%$ від $65$.', en: 'Find $40\\%$ of $65$.' }, accept: ['26'], tol: 0 },
      { type: 'num', q: { uk: 'Знайдіть число $x$, якщо $20\\%$ від нього дорівнює $9$.', en: '$20\\%$ of a number $x$ is $9$. Find $x$.' }, accept: ['45'], tol: 0 },
      { type: 'num', q: { uk: 'Скільки відсотків становить $\\frac{7}{20}$?', en: 'What percentage is $\\frac{7}{20}$?' }, accept: ['35%'], tol: 0,
        note: { uk: 'Можна писати зі знаком % або без нього.', en: 'You may write it with or without the % sign.' } },
      { type: 'num', q: { uk: 'Обчисліть $2\\frac{1}{2} - \\frac{3}{4}$.', en: 'Work out $2\\frac{1}{2} - \\frac{3}{4}$.' }, accept: ['1 3/4', '7/4'], tol: 0 }
    ] },
    { title: { uk: 'Частина 3 — Задача', en: 'Part 3 — Word problem' },
      instructions: { uk: 'Запишіть розв’язання і відповідь.', en: 'Write your solution and the answer.' }, questions: [
      { type: 'open', q: { uk: 'У класі $28$ учнів, $\\frac{3}{7}$ з них — хлопці. Скільки в класі дівчат? Поясніть.',
        en: 'There are $28$ students in a class and $\\frac{3}{7}$ of them are boys. How many girls are there? Explain.' } }
    ] }
  ] } },

  // Equations solved right on the page: the student writes the working line by line, every line is checked.
  { title: { uk: 'Рівняння', en: 'Equations' }, open: false, minutes: 40, content: { langs: ['uk', 'en'], tools: ['calc', 'graph', 'formulas'], sections: [
    { title: { uk: 'Частина 1 — Лінійні рівняння', en: 'Part 1 — Linear equations' },
      instructions: { uk: 'Розв’яжіть рівняння. Записуйте кожен крок у новому рядку, а корінь — у полі «Відповідь».', en: 'Solve the equation. Write each step on a new line and the root in the "Answer" box.' }, questions: [
      { type: 'solve', q: { uk: 'Розв’яжіть рівняння.', en: 'Solve the equation.' }, eq: ['3x - 7 = 2x + 5'], steps: 'grade' },
      { type: 'solve', q: { uk: 'Розв’яжіть рівняння.', en: 'Solve the equation.' }, eq: ['5(x - 2) = 3x + 4'], steps: 'grade' },
      { type: 'solve', q: { uk: 'Розв’яжіть рівняння з дробами.', en: 'Solve the equation with fractions.' }, eq: ['(x + 1)/3 = (x - 1)/2'], steps: 'grade',
        note: { uk: 'Помножте обидві частини на спільний знаменник.', en: 'Multiply both sides by the common denominator.' } }
    ] },
    { title: { uk: 'Частина 2 — Квадратні рівняння', en: 'Part 2 — Quadratic equations' },
      instructions: { uk: 'Знайдіть усі корені. Якщо коренів немає — позначте «Коренів немає».', en: 'Find all the roots. If there are none, tick "No roots".' }, questions: [
      { type: 'solve', q: { uk: 'Розв’яжіть рівняння.', en: 'Solve the equation.' }, eq: ['x^2 - 5x + 6 = 0'], steps: 'grade' },
      { type: 'solve', q: { uk: 'Розв’яжіть рівняння.', en: 'Solve the equation.' }, eq: ['x^2 = 49'], steps: 'show' },
      { type: 'solve', q: { uk: 'Розв’яжіть рівняння.', en: 'Solve the equation.' }, eq: ['2x^2 + 3x - 2 = 0'], steps: 'grade' },
      { type: 'solve', q: { uk: 'Розв’яжіть рівняння.', en: 'Solve the equation.' }, eq: ['x^2 + 4 = 0'], steps: 'show' }
    ] },
    { title: { uk: 'Частина 3 — Інші рівняння', en: 'Part 3 — Other equations' },
      instructions: { uk: 'Не забудьте перевірку: деякі корені можуть бути сторонніми.', en: 'Remember to check: some roots may be extraneous.' }, questions: [
      { type: 'solve', q: { uk: 'Розв’яжіть ірраціональне рівняння.', en: 'Solve the radical equation.' }, eq: ['√(x + 7) = x - 5'], steps: 'grade' },
      { type: 'solve', q: { uk: 'Розв’яжіть рівняння з модулем.', en: 'Solve the equation with an absolute value.' }, eq: ['|2x - 1| = 7'], steps: 'show' },
      { type: 'solve', q: { uk: 'Розв’яжіть показникове рівняння.', en: 'Solve the exponential equation.' }, eq: ['2^(x + 1) = 16'], steps: 'show' },
      { type: 'solve', q: { uk: 'Розв’яжіть систему рівнянь.', en: 'Solve the system of equations.' }, eq: ['x + y = 10', 'x - y = 4'], steps: 'grade' }
    ] }
  ] } }
];

// ---------- AI: photo(s) → math test content ----------
// Code.gs adds the rules for the two languages after this text.
const AI_INSTRUCTIONS =
  'You convert a photo of a printed MATH test or worksheet page into structured JSON. ' +
  'Read every exercise on the page. Return ONLY JSON (no markdown fences, no commentary) shaped as: ' +
  '{"title": string, "sections": [{"title": TEXT, "instructions": TEXT, "questions": [Q, ...]}]}. ' +
  'Each Q is one of: ' +
  '{"type":"mc","q":TEXT,"options":[TEXT, TEXT, ...],"answer":<0-based index of the correct option>}; ' +
  '{"type":"num","q":TEXT,"accept":["the correct answer","an equivalent form"],"tol":<optional absolute tolerance number, default 0>}; ' +
  '{"type":"short","q":TEXT,"accept":["answer1","answer2"]}; ' +
  '{"type":"open","q":TEXT (a problem where the student must show working / explain; no single value)}; ' +
  '{"type":"solve","q":TEXT (e.g. "Solve the equation."),"eq":["the equation in plain text, e.g. 2x+5=17 or x^2-5x+6=0 or (x+1)/3=(x-1)/2; several strings for a system"],"steps":"grade"}. ' +
  'Use "solve" for every exercise that asks to solve an equation or a system of equations: write the equation in "eq" WITHOUT dollar signs, with ^ for powers, / for fractions, sqrt(...) for roots, |...| for absolute value. Do not give the roots (the program finds them). ' +
  'MATH FORMATTING: write every formula, fraction, exponent, root or symbol in LaTeX between single dollar signs, e.g. $\\frac{3}{4}$, $x^2$, $\\sqrt{16}$, $2x+5=17$, $15\\%$. Keep normal words outside the dollar signs. ' +
  'ANSWERS: for "num", put the numeric answer in "accept" as a plain value WITHOUT dollar signs or units, e.g. "30", "3/4", "6", "3.14". Add equivalent forms when useful (e.g. "0.75" and "3/4"). Use "tol" only when a rounded/approximate answer is expected (e.g. 0.01). ' +
  'Prefer "num" for any question whose answer is a number, "mc" when the page lists options, "open" for word problems that ask to show working or explain, and "short" only for a non-numeric exact answer. ' +
  'For "mc", "answer" MUST be the 0-based index of the correct option; if unsure, give your best guess. Keep the original wording and numbers from the page. Do not invent exercises that are not on the page.';
