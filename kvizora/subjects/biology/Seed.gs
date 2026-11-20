/**
 * Seed.gs — BIOLOGY. Everything that is special about this subject:
 * the ready-made tests, the AI prompt and which question types the editor offers.
 * Paste this as a SECOND script file (next to Code.gs), named "Seed".
 *
 * Every text a student sees (and the test's name) is written in two languages: { uk: '…', en: '…' }.
 * Accepted answers are shared, so they list the Ukrainian and the English forms together.
 * Chemical formulas: plain Unicode (CO₂, H₂O) or KaTeX with mhchem, e.g. $\ce{C6H12O6}$.
 * Matching tasks: { type: 'match', q, pairs: [{ l: TEXT, r: TEXT }, …] } — one point per pair.
 * Pictures: img: 'https://…' or a small inline 'data:image/svg+xml;base64,…' (like the cell below).
 */

const SUBJECT = {
  key: 'biology',
  name: { uk: 'Біологія', en: 'Biology' },
  mode: 'switch',                                  // the student switches the whole test between УКР and EN
  qtypes: ['mc', 'match', 'fix', 'short', 'num', 'open'],   // question types the editor offers
  formulas: true                                   // render $…$ (and $\ce{…}$) with KaTeX
};

/** Options written as two parallel lists → [{ uk, en }, …]. */
function bioOpts_(uk, en) { return uk.map((u, i) => ({ uk: u, en: en[i] })); }

/** Plant cell with parts numbered 1–5 (wall, membrane, vacuole, chloroplast, nucleus). Drawn for this test. */
const BIO_CELL_SVG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzODAgMjQwIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9ImJvbGQiPgo8cmVjdCB3aWR0aD0iMzgwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2ZmZiIvPgo8cmVjdCB4PSI0MCIgeT0iMjAiIHdpZHRoPSIyNjAiIGhlaWdodD0iMjAwIiByeD0iMTgiIGZpbGw9IiNkNGViYjUiIHN0cm9rZT0iIzRmN2QyNSIgc3Ryb2tlLXdpZHRoPSI5Ii8+CjxyZWN0IHg9IjUyIiB5PSIzMiIgd2lkdGg9IjIzNiIgaGVpZ2h0PSIxNzYiIHJ4PSIxMCIgZmlsbD0iI2VlZjhlMiIgc3Ryb2tlPSIjOWNjNDZiIiBzdHJva2Utd2lkdGg9IjIiLz4KPGVsbGlwc2UgY3g9IjE4NSIgY3k9IjEyMiIgcng9IjcyIiByeT0iNTIiIGZpbGw9IiNjZmU2ZjYiIHN0cm9rZT0iIzRmOGZiZiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9Ijk1IiBjeT0iNzIiIHI9IjI0IiBmaWxsPSIjZGNjNmVjIiBzdHJva2U9IiM2ZjQ2OTIiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSI5OSIgY3k9Ijc0IiByPSI3IiBmaWxsPSIjNmY0NjkyIi8+CjxnIGZpbGw9IiM1YWEwMmMiIHN0cm9rZT0iIzJmNmIxMiIgc3Ryb2tlLXdpZHRoPSIxLjUiPgo8ZWxsaXBzZSBjeD0iODgiIGN5PSIxNzgiIHJ4PSIxNiIgcnk9IjgiLz4KPGVsbGlwc2UgY3g9IjI2MiIgY3k9IjY0IiByeD0iMTYiIHJ5PSI4IiB0cmFuc2Zvcm09InJvdGF0ZSgyNSAyNjIgNjQpIi8+CjxlbGxpcHNlIGN4PSIyNjIiIGN5PSIxODIiIHJ4PSIxNiIgcnk9IjgiIHRyYW5zZm9ybT0icm90YXRlKC0yMCAyNjIgMTgyKSIvPgo8ZWxsaXBzZSBjeD0iMTYwIiBjeT0iMTk0IiByeD0iMTYiIHJ5PSI4Ii8+CjwvZz4KPGcgc3Ryb2tlPSIjMjIyIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0iIzIyMiI+CjxsaW5lIHgxPSIzMDAiIHkxPSI0OCIgeDI9IjM0MiIgeTI9IjQ4Ii8+PGNpcmNsZSBjeD0iMzAwIiBjeT0iNDgiIHI9IjMiLz4KPGxpbmUgeDE9IjI4OCIgeTE9IjExOCIgeDI9IjM0MiIgeTI9IjExOCIvPjxjaXJjbGUgY3g9IjI4OCIgY3k9IjExOCIgcj0iMyIvPgo8bGluZSB4MT0iMjMwIiB5MT0iMTQwIiB4Mj0iMzQyIiB5Mj0iMTYyIi8+PGNpcmNsZSBjeD0iMjMwIiBjeT0iMTQwIiByPSIzIi8+CjxsaW5lIHgxPSIyNzAiIHkxPSIxODUiIHgyPSIzNDIiIHkyPSIyMDUiLz48Y2lyY2xlIGN4PSIyNzAiIGN5PSIxODUiIHI9IjMiLz4KPGxpbmUgeDE9IjcyIiB5MT0iNzIiIHgyPSIyMiIgeTI9IjcyIi8+PGNpcmNsZSBjeD0iNzIiIGN5PSI3MiIgcj0iMyIvPgo8L2c+CjxnIGZpbGw9IiNmZmYiIHN0cm9rZT0iIzIyMiIgc3Ryb2tlLXdpZHRoPSIxLjUiPgo8Y2lyY2xlIGN4PSIzNTQiIGN5PSI0OCIgcj0iMTEiLz48Y2lyY2xlIGN4PSIzNTQiIGN5PSIxMTgiIHI9IjExIi8+PGNpcmNsZSBjeD0iMzU0IiBjeT0iMTYyIiByPSIxMSIvPjxjaXJjbGUgY3g9IjM1NCIgY3k9IjIwNSIgcj0iMTEiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjcyIiByPSIxMSIvPgo8L2c+CjxnIGZpbGw9IiMyMjIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPgo8dGV4dCB4PSIzNTQiIHk9IjUzIj4xPC90ZXh0Pjx0ZXh0IHg9IjM1NCIgeT0iMTIzIj4yPC90ZXh0Pjx0ZXh0IHg9IjM1NCIgeT0iMTY3Ij4zPC90ZXh0Pjx0ZXh0IHg9IjM1NCIgeT0iMjEwIj40PC90ZXh0Pjx0ZXh0IHg9IjEyIiB5PSI3NyI+NTwvdGV4dD4KPC9nPgo8L3N2Zz4K';
const BIO_PICK = { uk: 'Для кожного рядка оберіть правильну відповідь зі списку.', en: 'For each line, choose the correct answer from the list.' };

const BIO_MC = { uk: 'Частина 1 — Вибір відповіді', en: 'Part 1 — Multiple choice' };
const BIO_ONE = { uk: 'Оберіть одну правильну відповідь.', en: 'Choose one correct answer.' };

/** Ready-made tests. The first one is opened right away on a fresh install; the others start as drafts. */
const SEED_TESTS = [
  // ---- Grade 9: the cell and photosynthesis ----
  { title: { uk: 'Біологія 9 кл.: клітина і фотосинтез', en: 'Biology Grade 9: The cell and photosynthesis' }, open: true, content: { langs: ['uk', 'en'], sections: [
    { title: BIO_MC, instructions: BIO_ONE, questions: [
      { type: 'mc', q: { uk: 'Який органоїд здійснює фотосинтез?', en: 'Which organelle carries out photosynthesis?' },
        options: bioOpts_(['Мітохондрія', 'Хлоропласт', 'Рибосома', 'Комплекс Гольджі'], ['Mitochondrion', 'Chloroplast', 'Ribosome', 'Golgi apparatus']), answer: 1 },
      { type: 'mc', q: { uk: 'У якому органоїді утворюється більша частина АТФ клітини?', en: 'Which organelle produces most of the cell’s ATP?' },
        options: bioOpts_(['Ядро', 'Лізосома', 'Мітохондрія', 'Вакуоля'], ['Nucleus', 'Lysosome', 'Mitochondrion', 'Vacuole']), answer: 2 },
      { type: 'mc', q: { uk: 'Яка структура є в клітинах рослин, але відсутня в клітинах тварин?', en: 'Which structure is found in plant cells but not in animal cells?' },
        options: bioOpts_(['Клітинна мембрана', 'Рибосоми', 'Клітинна стінка з целюлози', 'Цитоплазма'], ['Cell membrane', 'Ribosomes', 'Cellulose cell wall', 'Cytoplasm']), answer: 2 },
      { type: 'mc', q: { uk: 'На яких органоїдах синтезуються білки?', en: 'On which organelles are proteins made?' },
        options: bioOpts_(['На рибосомах', 'На лізосомах', 'На вакуолях', 'На центріолях'], ['Ribosomes', 'Lysosomes', 'Vacuoles', 'Centrioles']), answer: 0 },
      { type: 'mc', q: { uk: 'Який газ рослини виділяють під час фотосинтезу?', en: 'Which gas do plants release during photosynthesis?' },
        options: bioOpts_(['Вуглекислий газ (CO₂)', 'Кисень (O₂)', 'Азот (N₂)', 'Водень (H₂)'], ['Carbon dioxide (CO₂)', 'Oxygen (O₂)', 'Nitrogen (N₂)', 'Hydrogen (H₂)']), answer: 1 },
      { type: 'mc', q: { uk: 'Як називається зелений пігмент, що поглинає світло для фотосинтезу?', en: 'What is the green pigment that absorbs light for photosynthesis called?' },
        options: bioOpts_(['Гемоглобін', 'Хлорофіл', 'Меланін', 'Каротин'], ['Haemoglobin', 'Chlorophyll', 'Melanin', 'Carotene']), answer: 1 },
      { type: 'mc', q: { uk: 'Чим клітини бактерій відрізняються від клітин рослин і тварин?', en: 'How do bacterial cells differ from plant and animal cells?' },
        options: bioOpts_(['У них немає клітинної мембрани', 'У них немає рибосом', 'У них немає оформленого ядра', 'У них немає цитоплазми'],
          ['They have no cell membrane', 'They have no ribosomes', 'They have no true nucleus', 'They have no cytoplasm']), answer: 2 }
    ] },
    { title: { uk: 'Частина 2 — Будова клітини', en: 'Part 2 — Parts of the cell' }, instructions: BIO_PICK, questions: [
      { type: 'match', img: BIO_CELL_SVG,
        q: { uk: 'Подивіться на малюнок рослинної клітини. Яка частина позначена кожним номером?', en: 'Look at the picture of a plant cell. Which part is shown by each number?' },
        pairs: [
          { l: '1', r: { uk: 'Клітинна стінка', en: 'Cell wall' } },
          { l: '2', r: { uk: 'Клітинна мембрана', en: 'Cell membrane' } },
          { l: '3', r: { uk: 'Вакуоля', en: 'Vacuole' } },
          { l: '4', r: { uk: 'Хлоропласт', en: 'Chloroplast' } },
          { l: '5', r: { uk: 'Ядро', en: 'Nucleus' } }
        ] },
      { type: 'match', q: { uk: 'Доберіть до кожного органоїда його функцію.', en: 'Match each organelle to its job.' },
        pairs: [
          { l: { uk: 'Ядро', en: 'Nucleus' }, r: { uk: 'Зберігає спадкову інформацію (ДНК) і керує життям клітини', en: 'Stores genetic information (DNA) and controls the cell' } },
          { l: { uk: 'Мітохондрія', en: 'Mitochondrion' }, r: { uk: 'Вивільняє енергію під час клітинного дихання', en: 'Releases energy in cellular respiration' } },
          { l: { uk: 'Рибосома', en: 'Ribosome' }, r: { uk: 'Синтезує білки', en: 'Makes proteins' } },
          { l: { uk: 'Хлоропласт', en: 'Chloroplast' }, r: { uk: 'Здійснює фотосинтез', en: 'Carries out photosynthesis' } },
          { l: { uk: 'Клітинна мембрана', en: 'Cell membrane' }, r: { uk: 'Регулює, що надходить у клітину і виходить з неї', en: 'Controls what enters and leaves the cell' } }
        ] }
    ] },
    { title: { uk: 'Частина 3 — Знайди й виправ помилку', en: 'Part 3 — Find and fix the mistake' },
      instructions: { uk: 'У кожному твердженні є одна помилка. Замініть одне слово, щоб твердження стало правильним.', en: 'Each statement has one mistake. Change one word to make it correct.' }, questions: [
      { type: 'fix', q: { uk: 'Фотосинтез відбувається в мітохондріях.', en: 'Photosynthesis takes place in the mitochondria.' },
        accept: ['Фотосинтез відбувається в хлоропластах.', 'Фотосинтез відбувається у хлоропластах.', 'Photosynthesis takes place in the chloroplasts.', 'Photosynthesis takes place in chloroplasts.'],
        key: 'мітохондріях → хлоропластах / mitochondria → chloroplasts' },
      { type: 'fix', q: { uk: 'Клітини тварин мають клітинну стінку з целюлози.', en: 'Animal cells have a cell wall made of cellulose.' },
        accept: ['Клітини рослин мають клітинну стінку з целюлози.', 'Plant cells have a cell wall made of cellulose.'],
        key: 'тварин → рослин / Animal → Plant' },
      { type: 'fix', q: { uk: 'Під час фотосинтезу рослини поглинають кисень.', en: 'During photosynthesis, plants absorb oxygen.' },
        accept: ['Під час фотосинтезу рослини поглинають вуглекислий газ.', 'Під час фотосинтезу рослини виділяють кисень.',
          'During photosynthesis, plants absorb carbon dioxide.', 'During photosynthesis, plants release oxygen.'],
        key: 'кисень → вуглекислий газ (або поглинають → виділяють) / oxygen → carbon dioxide (or absorb → release)' }
    ] },
    { title: { uk: 'Частина 4 — Коротка відповідь', en: 'Part 4 — Short answer' },
      instructions: { uk: 'Напишіть одне-два слова.', en: 'Write one or two words.' }, questions: [
      { type: 'short', q: { uk: 'Який вуглевод утворюється під час фотосинтезу?', en: 'Which sugar is made during photosynthesis?' },
        accept: ['глюкоза', 'glucose'] },
      { type: 'short', q: { uk: 'Як називається процес, під час якого клітина розщеплює глюкозу з участю кисню й вивільняє енергію?', en: 'What is the process in which a cell breaks down glucose using oxygen to release energy?' },
        accept: ['клітинне дихання', 'дихання', 'аеробне дихання', 'cellular respiration', 'respiration', 'aerobic respiration'] }
    ] },
    { title: { uk: 'Частина 5 — Поясніть', en: 'Part 5 — Explain' },
      instructions: { uk: 'Напишіть 2–3 речення.', en: 'Write 2–3 sentences.' }, questions: [
      { type: 'open', q: { uk: 'Чому фотосинтез важливий для життя на Землі?', en: 'Why is photosynthesis important for life on Earth?' } }
    ] }
  ] } },

  // ---- Grade 8: human organ systems ----
  { title: { uk: 'Біологія 8 кл.: системи органів людини', en: 'Biology Grade 8: Human organ systems' }, folder: '', open: false, minutes: 25, content: { langs: ['uk', 'en'], sections: [
    { title: BIO_MC, instructions: BIO_ONE, questions: [
      { type: 'mc', q: { uk: 'Який орган перекачує кров по всьому тілу?', en: 'Which organ pumps blood around the body?' },
        options: bioOpts_(['Легені', 'Серце', 'Печінка', 'Нирки'], ['Lungs', 'Heart', 'Liver', 'Kidneys']), answer: 1 },
      { type: 'mc', q: { uk: 'Де в легенях відбувається газообмін?', en: 'Where in the lungs does gas exchange take place?' },
        options: bioOpts_(['У трахеї', 'У бронхах', 'В альвеолах', 'У гортані'], ['Trachea', 'Bronchi', 'Alveoli', 'Larynx']), answer: 2 },
      { type: 'mc', q: { uk: 'Які клітини крові переносять кисень?', en: 'Which blood cells carry oxygen?' },
        options: bioOpts_(['Еритроцити', 'Лейкоцити', 'Тромбоцити', 'Лімфоцити'], ['Red blood cells (erythrocytes)', 'White blood cells (leucocytes)', 'Platelets', 'Lymphocytes']), answer: 0 },
      { type: 'mc', q: { uk: 'Де відбувається основне перетравлення їжі та всмоктування поживних речовин?', en: 'Where does most digestion and absorption of nutrients take place?' },
        options: bioOpts_(['У шлунку', 'У тонкому кишечнику', 'У товстому кишечнику', 'У стравоході'], ['Stomach', 'Small intestine', 'Large intestine', 'Oesophagus']), answer: 1 },
      { type: 'mc', q: { uk: 'Які органи очищують кров і утворюють сечу?', en: 'Which organs filter the blood and produce urine?' },
        options: bioOpts_(['Нирки', 'Легені', 'Серце', 'Підшлункова залоза'], ['Kidneys', 'Lungs', 'Heart', 'Pancreas']), answer: 0 },
      { type: 'mc', q: { uk: 'Що є основною структурною й функціональною одиницею нервової системи?', en: 'What is the basic structural and functional unit of the nervous system?' },
        options: bioOpts_(['Нейрон', 'Нефрон', 'Альвеола', 'Еритроцит'], ['Neuron', 'Nephron', 'Alveolus', 'Red blood cell']), answer: 0 },
      { type: 'mc', q: { uk: 'Який гормон знижує рівень глюкози в крові?', en: 'Which hormone lowers the blood glucose level?' },
        options: bioOpts_(['Адреналін', 'Інсулін', 'Глюкагон', 'Тироксин'], ['Adrenaline', 'Insulin', 'Glucagon', 'Thyroxine']), answer: 1 }
    ] },
    { title: { uk: 'Частина 2 — Встановіть відповідність', en: 'Part 2 — Matching' }, instructions: BIO_PICK, questions: [
      { type: 'match', q: { uk: 'До якої системи органів належить кожен орган?', en: 'Which organ system does each organ belong to?' },
        pairs: [
          { l: { uk: 'Серце', en: 'Heart' }, r: { uk: 'Кровоносна система', en: 'Circulatory system' } },
          { l: { uk: 'Легені', en: 'Lungs' }, r: { uk: 'Дихальна система', en: 'Respiratory system' } },
          { l: { uk: 'Шлунок', en: 'Stomach' }, r: { uk: 'Травна система', en: 'Digestive system' } },
          { l: { uk: 'Нирки', en: 'Kidneys' }, r: { uk: 'Сечовидільна система', en: 'Urinary (excretory) system' } },
          { l: { uk: 'Головний мозок', en: 'Brain' }, r: { uk: 'Нервова система', en: 'Nervous system' } }
        ] },
      { type: 'match', q: { uk: 'Доберіть до кожного типу кровоносних судин його функцію.', en: 'Match each type of blood vessel to its job.' },
        pairs: [
          { l: { uk: 'Артерії', en: 'Arteries' }, r: { uk: 'Несуть кров від серця до органів', en: 'Carry blood away from the heart to the organs' } },
          { l: { uk: 'Вени', en: 'Veins' }, r: { uk: 'Несуть кров від органів до серця', en: 'Carry blood from the organs back to the heart' } },
          { l: { uk: 'Капіляри', en: 'Capillaries' }, r: { uk: 'Забезпечують обмін речовин між кров’ю і тканинами', en: 'Exchange substances between the blood and the tissues' } }
        ] }
    ] },
    { title: { uk: 'Частина 3 — Коротка відповідь', en: 'Part 3 — Short answer' },
      instructions: { uk: 'Напишіть число або одне-два слова.', en: 'Write a number or one or two words.' }, questions: [
      { type: 'num', q: { uk: 'Скільки камер має серце людини?', en: 'How many chambers does the human heart have?' }, accept: ['4'], tol: 0 },
      { type: 'short', q: { uk: 'Який газ ми видихаємо в більшій кількості, ніж вдихаємо?', en: 'Which gas do we breathe out in larger amounts than we breathe in?' },
        accept: ['вуглекислий газ', 'карбон(IV) оксид', 'карбон діоксид', 'діоксид карбону', 'carbon dioxide', 'CO2', 'CO₂'],
        note: { uk: 'Можна написати назву або формулу.', en: 'You may write the name or the formula.' } },
      { type: 'fix', q: { uk: 'Вени несуть кров від серця до органів.', en: 'Veins carry blood away from the heart to the organs.' },
        note: { uk: 'Знайдіть помилку і замініть одне слово.', en: 'Find the mistake and change one word.' },
        accept: ['Артерії несуть кров від серця до органів.', 'Arteries carry blood away from the heart to the organs.'],
        key: 'Вени → Артерії / Veins → Arteries' }
    ] },
    { title: { uk: 'Частина 4 — Поясніть', en: 'Part 4 — Explain' },
      instructions: { uk: 'Напишіть 2–3 речення.', en: 'Write 2–3 sentences.' }, questions: [
      { type: 'open', q: { uk: 'Поясніть, як дихальна і кровоносна системи разом доставляють кисень до клітин тіла.', en: 'Explain how the respiratory and circulatory systems work together to deliver oxygen to the body’s cells.' } }
    ] }
  ] } }
];

// ---------- AI: photo(s) → biology test content ----------
// Code.gs adds the rules for the two languages after this text.
const AI_INSTRUCTIONS =
  'You convert a photo of a printed school BIOLOGY test or worksheet page into structured JSON. ' +
  'Read every exercise on the page. Return ONLY JSON (no markdown fences, no commentary) shaped as: ' +
  '{"title": string, "sections": [{"title": TEXT, "instructions": TEXT, "questions": [Q, ...]}]}. ' +
  'Each Q is one of: ' +
  '{"type":"mc","q":TEXT,"options":[TEXT, TEXT, ...],"answer":<0-based index of the correct option>}; ' +
  '{"type":"fix","q":TEXT (a statement that contains ONE factual mistake),"accept":["the corrected statement in Ukrainian","the corrected statement in English"],"key":"what was wrong"}; ' +
  '{"type":"short","q":TEXT,"accept":["answer in Ukrainian","answer in English","common synonyms"]} for a one- or two-word answer (a term, an organ, a process); ' +
  '{"type":"num","q":TEXT,"accept":["4"],"tol":0} when the answer is a number; ' +
  '{"type":"match","q":TEXT,"pairs":[{"l":TEXT,"r":TEXT}, ...]} for matching tasks (term ↔ definition, organ ↔ function, number on a diagram ↔ name of the part): each pair is a left item and its correct right item; ' +
  '{"type":"open","q":TEXT} for "explain / describe / compare" questions with no single answer. ' +
  'PICTURES: you cannot copy pictures. Still create the task (for a labelled diagram: "match" with the numbers on the left) and keep the words "on the picture" in the question; the teacher attaches the picture in the editor. ' +
  'TERMS: use the standard terminology of Ukrainian school biology textbooks for Ukrainian, and of school biology for English. ' +
  'Write chemical formulas with Unicode subscripts (CO₂, H₂O, C₆H₁₂O₆); in "accept" add the plain form too (CO2). ' +
  'ANSWERS: "accept" is shared by both languages, so always list both the Ukrainian and the English forms. ' +
  'For "mc", "answer" MUST be the 0-based index of the correct option; if the page does not mark it, use your biology knowledge. ' +
  'Keep the original wording from the page. Do not invent exercises that are not on the page.';
