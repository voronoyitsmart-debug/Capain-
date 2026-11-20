/**
 * Seed.gs — GEOGRAPHY. Everything that is special about this subject:
 * the ready-made tests, the AI prompt and which question types the editor offers.
 * Paste this as a SECOND script file (next to Code.gs), named "Seed".
 *
 * Every text a student sees (and the test's name) is written in two languages: { uk: '…', en: '…' }.
 * Accepted answers are shared, so they list the Ukrainian and the English forms together.
 * Ready-made tests follow the Ukrainian school course: grade 6 (general geography),
 * grade 7 (continents and oceans), grade 8 (physical geography of Ukraine).
 * Matching tasks: { type: 'match', q, pairs: [{ l: TEXT, r: TEXT }, …] } — one point per pair.
 * Pictures: img: 'https://…' or a small inline 'data:image/svg+xml;base64,…' (like the compass below).
 */

const SUBJECT = {
  key: 'geography',
  name: { uk: 'Географія', en: 'Geography' },
  mode: 'switch',                                  // the student switches the whole test between УКР and EN
  qtypes: ['mc', 'match', 'fix', 'short', 'num', 'open'],   // question types the editor offers
  formulas: false                                  // no KaTeX: geography texts use plain °, km, m
};

/** Options written as two parallel lists → [{ uk, en }, …]. */
function geoOpts_(uk, en) { return uk.map((u, i) => ({ uk: u, en: en[i] })); }

/** Compass rose: north is the red triangle at the top; 1 = E, 2 = S, 3 = W, 4 = NE, 5 = SW. Drawn for this test. */
const GEO_COMPASS_SVG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNjAgMjYwIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNSIgZm9udC13ZWlnaHQ9ImJvbGQiPgo8cmVjdCB3aWR0aD0iMjYwIiBoZWlnaHQ9IjI2MCIgZmlsbD0iI2ZmZiIvPgo8Y2lyY2xlIGN4PSIxMzAiIGN5PSIxMzAiIHI9IjkyIiBmaWxsPSIjZWFmNGZiIiBzdHJva2U9IiM0ZjhmYmYiIHN0cm9rZS13aWR0aD0iMiIvPgo8ZyBmaWxsPSIjMmY2YjlhIiBzdHJva2U9IiMxZDRhNmIiIHN0cm9rZS13aWR0aD0iMSI+Cjxwb2x5Z29uIHBvaW50cz0iMTMwLDQ4IDE0MCwxMjAgMTMwLDEzMCAxMjAsMTIwIi8+Cjxwb2x5Z29uIHBvaW50cz0iMjEyLDEzMCAxNDAsMTQwIDEzMCwxMzAgMTQwLDEyMCIvPgo8cG9seWdvbiBwb2ludHM9IjEzMCwyMTIgMTIwLDE0MCAxMzAsMTMwIDE0MCwxNDAiLz4KPHBvbHlnb24gcG9pbnRzPSI0OCwxMzAgMTIwLDEyMCAxMzAsMTMwIDEyMCwxNDAiLz4KPC9nPgo8ZyBmaWxsPSIjOWNjNGUwIiBzdHJva2U9IiMxZDRhNmIiIHN0cm9rZS13aWR0aD0iMSI+Cjxwb2x5Z29uIHBvaW50cz0iMTg4LDcyIDEzNiwxMjQgMTMwLDEzMCAxNDIsMTMwIi8+Cjxwb2x5Z29uIHBvaW50cz0iNzIsMTg4IDEyNCwxMzYgMTMwLDEzMCAxMTgsMTMwIi8+Cjxwb2x5Z29uIHBvaW50cz0iMTg4LDE4OCAxMzYsMTM2IDEzMCwxMzAgMTMwLDE0MiIvPgo8cG9seWdvbiBwb2ludHM9IjcyLDcyIDEyNCwxMjQgMTMwLDEzMCAxMzAsMTE4Ii8+CjwvZz4KPHRleHQgeD0iMTMwIiB5PSIyOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2MwMzkyYiIgZm9udC1zaXplPSIxMyI+4payPC90ZXh0Pgo8ZyBmaWxsPSIjZmZmIiBzdHJva2U9IiMyMjIiIHN0cm9rZS13aWR0aD0iMS41Ij4KPGNpcmNsZSBjeD0iMjM2IiBjeT0iMTMwIiByPSIxMyIvPjxjaXJjbGUgY3g9IjEzMCIgY3k9IjIzNiIgcj0iMTMiLz48Y2lyY2xlIGN4PSIyNCIgY3k9IjEzMCIgcj0iMTMiLz48Y2lyY2xlIGN4PSIyMDYiIGN5PSI1NCIgcj0iMTMiLz48Y2lyY2xlIGN4PSI1NCIgY3k9IjIwNiIgcj0iMTMiLz4KPC9nPgo8ZyBmaWxsPSIjMjIyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4KPHRleHQgeD0iMjM2IiB5PSIxMzUiPjE8L3RleHQ+PHRleHQgeD0iMTMwIiB5PSIyNDEiPjI8L3RleHQ+PHRleHQgeD0iMjQiIHk9IjEzNSI+MzwvdGV4dD48dGV4dCB4PSIyMDYiIHk9IjU5Ij40PC90ZXh0Pjx0ZXh0IHg9IjU0IiB5PSIyMTEiPjU8L3RleHQ+CjwvZz4KPC9zdmc+Cg==';

const GEO_MC = { uk: 'Частина 1 — Вибір відповіді', en: 'Part 1 — Multiple choice' };
const GEO_ONE = { uk: 'Оберіть одну правильну відповідь.', en: 'Choose one correct answer.' };
const GEO_PICK = { uk: 'Для кожного рядка оберіть правильну відповідь зі списку.', en: 'For each line, choose the correct answer from the list.' };
const GEO_FIX = { uk: 'Частина 3 — Знайди й виправ помилку', en: 'Part 3 — Find and fix the mistake' };
const GEO_FIX_HOW = { uk: 'У кожному твердженні є одна помилка. Замініть одне слово, щоб твердження стало правильним.', en: 'Each statement has one mistake. Change one word to make it correct.' };
const GEO_OPEN = { uk: 'Напишіть 2–3 речення.', en: 'Write 2–3 sentences.' };

/** Ready-made tests. The first one is opened right away on a fresh install; the others start as drafts. */
const SEED_TESTS = [
  // ---- Grade 6: maps, the Earth and its spheres ----
  { title: { uk: 'Географія 6 кл.: карта, Земля та її оболонки', en: 'Geography Grade 6: Maps, the Earth and its spheres' }, open: true, content: { langs: ['uk', 'en'], sections: [
    { title: GEO_MC, instructions: GEO_ONE, questions: [
      { type: 'mc', q: { uk: 'Яка уявна лінія поділяє Землю на Північну і Південну півкулі?', en: 'Which imaginary line divides the Earth into the Northern and Southern Hemispheres?' },
        options: geoOpts_(['Нульовий (Гринвіцький) меридіан', 'Екватор', 'Північний тропік', 'Північне полярне коло'], ['Prime (Greenwich) meridian', 'Equator', 'Tropic of Cancer', 'Arctic Circle']), answer: 1 },
      { type: 'mc', q: { uk: 'Що показує масштаб карти?', en: 'What does the scale of a map show?' },
        options: geoOpts_(['Висоту місцевості над рівнем моря', 'У скільки разів відстані на карті зменшені порівняно з відстанями на місцевості', 'Напрямок на північ', 'Кількість населення'],
          ['The height of the land above sea level', 'How many times distances on the map are smaller than on the ground', 'The direction to the north', 'The number of people living there']), answer: 1 },
      { type: 'mc', q: { uk: 'Як називається внутрішня частина Землі, розташована в самому центрі планети?', en: 'What is the innermost part of the Earth, at the very centre of the planet, called?' },
        options: geoOpts_(['Земна кора', 'Мантія', 'Ядро', 'Літосфера'], ['Crust', 'Mantle', 'Core', 'Lithosphere']), answer: 2 },
      { type: 'mc', q: { uk: 'Який найнижчий шар атмосфери, у якому утворюються хмари й погода?', en: 'Which is the lowest layer of the atmosphere, where clouds and weather form?' },
        options: geoOpts_(['Стратосфера', 'Тропосфера', 'Мезосфера', 'Термосфера'], ['Stratosphere', 'Troposphere', 'Mesosphere', 'Thermosphere']), answer: 1 },
      { type: 'mc', q: { uk: 'Яким приладом вимірюють атмосферний тиск?', en: 'Which instrument measures atmospheric pressure?' },
        options: geoOpts_(['Термометр', 'Барометр', 'Гігрометр', 'Флюгер'], ['Thermometer', 'Barometer', 'Hygrometer', 'Weather vane']), answer: 1 },
      { type: 'mc', q: { uk: 'Як називається водна оболонка Землі?', en: 'What is the water shell (sphere) of the Earth called?' },
        options: geoOpts_(['Літосфера', 'Атмосфера', 'Гідросфера', 'Біосфера'], ['Lithosphere', 'Atmosphere', 'Hydrosphere', 'Biosphere']), answer: 2 },
      { type: 'mc', q: { uk: 'Як на топографічній карті називають лінії, що з’єднують точки з однаковою абсолютною висотою?', en: 'On a topographic map, what are the lines joining points of equal height above sea level called?' },
        options: geoOpts_(['Горизонталі (ізогіпси)', 'Паралелі', 'Меридіани', 'Ізобари'], ['Contour lines', 'Parallels', 'Meridians', 'Isobars']), answer: 0 }
    ] },
    { title: { uk: 'Частина 2 — Сторони горизонту', en: 'Part 2 — Compass directions' }, instructions: GEO_PICK, questions: [
      { type: 'match', img: GEO_COMPASS_SVG,
        q: { uk: 'Червоний трикутник угорі показує на північ. Яку сторону горизонту позначено кожним номером?', en: 'The red triangle at the top points north. Which direction is shown by each number?' },
        pairs: [
          { l: '1', r: { uk: 'Схід', en: 'East' } },
          { l: '2', r: { uk: 'Південь', en: 'South' } },
          { l: '3', r: { uk: 'Захід', en: 'West' } },
          { l: '4', r: { uk: 'Північний схід', en: 'North-east' } },
          { l: '5', r: { uk: 'Південний захід', en: 'South-west' } }
        ] },
      { type: 'match', q: { uk: 'Доберіть до кожної оболонки Землі її опис.', en: 'Match each sphere of the Earth to its description.' },
        pairs: [
          { l: { uk: 'Літосфера', en: 'Lithosphere' }, r: { uk: 'Тверда кам’яна оболонка: земна кора і верхня частина мантії', en: 'The solid rocky shell: the crust and the upper mantle' } },
          { l: { uk: 'Атмосфера', en: 'Atmosphere' }, r: { uk: 'Повітряна оболонка', en: 'The layer of air' } },
          { l: { uk: 'Гідросфера', en: 'Hydrosphere' }, r: { uk: 'Уся вода Землі: океани, річки, озера, льодовики', en: 'All the Earth’s water: oceans, rivers, lakes, glaciers' } },
          { l: { uk: 'Біосфера', en: 'Biosphere' }, r: { uk: 'Оболонка, заселена живими організмами', en: 'The shell where living things are found' } }
        ] }
    ] },
    { title: GEO_FIX, instructions: GEO_FIX_HOW, questions: [
      { type: 'fix', q: { uk: 'Паралелі з’єднують Північний і Південний полюси.', en: 'Parallels connect the North and South Poles.' },
        accept: ['Меридіани з’єднують Північний і Південний полюси.', 'Meridians connect the North and South Poles.'],
        key: 'Паралелі → Меридіани / Parallels → Meridians' },
      { type: 'fix', q: { uk: 'З підняттям угору в тропосфері температура повітря підвищується.', en: 'As you go up in the troposphere, the air temperature rises.' },
        accept: ['З підняттям угору в тропосфері температура повітря знижується.', 'З підняттям угору в тропосфері температура повітря понижується.', 'З підняттям угору в тропосфері температура повітря зменшується.',
          'As you go up in the troposphere, the air temperature falls.', 'As you go up in the troposphere, the air temperature drops.', 'As you go up in the troposphere, the air temperature decreases.'],
        key: 'підвищується → знижується / rises → falls' }
    ] },
    { title: { uk: 'Частина 4 — Задачі й коротка відповідь', en: 'Part 4 — Problems and short answers' },
      instructions: { uk: 'Напишіть число або одне-два слова.', en: 'Write a number or one or two words.' }, questions: [
      { type: 'num', q: { uk: 'Масштаб карти 1 : 50 000. Відстань між двома селами на карті — 4 см. Яка відстань між ними на місцевості (у кілометрах)?', en: 'The map scale is 1 : 50,000. Two villages are 4 cm apart on the map. How far apart are they on the ground (in kilometres)?' },
        accept: ['2'], tol: 0, note: { uk: 'Запишіть лише число кілометрів.', en: 'Write only the number of kilometres.' } },
      { type: 'num', q: { uk: 'Біля підніжжя гори температура повітря +20 °C. Яка температура на вершині заввишки 3000 м, якщо з підняттям на кожен кілометр вона знижується на 6 °C?', en: 'At the foot of a mountain the air temperature is +20 °C. What is the temperature at the 3000 m summit if it falls by 6 °C for every kilometre of height?' },
        accept: ['2', '+2'], tol: 0, note: { uk: 'Запишіть число градусів.', en: 'Write the number of degrees.' } },
      { type: 'num', q: { uk: 'Який азимут напрямку на схід (у градусах)?', en: 'What is the azimuth (bearing) of due east, in degrees?' }, accept: ['90'], tol: 0 },
      { type: 'short', q: { uk: 'Яким приладом визначають сторони горизонту?', en: 'Which instrument is used to find directions (north, south, east, west)?' },
        accept: ['компас', 'compass'] }
    ] },
    { title: { uk: 'Частина 5 — Поясніть', en: 'Part 5 — Explain' }, instructions: GEO_OPEN, questions: [
      { type: 'open', q: { uk: 'Чому на Землі відбувається зміна дня і ночі?', en: 'Why do day and night change on the Earth?' } }
    ] }
  ] } },

  // ---- Grade 7: continents and oceans ----
  { title: { uk: 'Географія 7 кл.: материки й океани', en: 'Geography Grade 7: Continents and oceans' }, folder: '', open: false, minutes: 25, content: { langs: ['uk', 'en'], sections: [
    { title: GEO_MC, instructions: GEO_ONE, questions: [
      { type: 'mc', q: { uk: 'Який материк найбільший за площею?', en: 'Which continent is the largest by area?' },
        options: geoOpts_(['Африка', 'Північна Америка', 'Євразія', 'Антарктида'], ['Africa', 'North America', 'Eurasia', 'Antarctica']), answer: 2 },
      { type: 'mc', q: { uk: 'Який материк найменший за площею?', en: 'Which continent is the smallest by area?' },
        options: geoOpts_(['Австралія', 'Антарктида', 'Південна Америка', 'Африка'], ['Australia', 'Antarctica', 'South America', 'Africa']), answer: 0 },
      { type: 'mc', q: { uk: 'Через який материк проходять екватор і обидва тропіки?', en: 'Which continent is crossed by the equator and both tropics?' },
        options: geoOpts_(['Південна Америка', 'Австралія', 'Африка', 'Євразія'], ['South America', 'Australia', 'Africa', 'Eurasia']), answer: 2 },
      { type: 'mc', q: { uk: 'Який океан найбільший і найглибший?', en: 'Which ocean is the largest and the deepest?' },
        options: geoOpts_(['Атлантичний', 'Індійський', 'Північний Льодовитий', 'Тихий'], ['Atlantic', 'Indian', 'Arctic', 'Pacific']), answer: 3 },
      { type: 'mc', q: { uk: 'Де розташована найглибша западина Світового океану?', en: 'Where is the deepest point of the World Ocean?' },
        options: geoOpts_(['Маріанський жолоб', 'Пуерто-Риканський жолоб', 'Яванський жолоб', 'Мертве море'], ['Mariana Trench', 'Puerto Rico Trench', 'Java (Sunda) Trench', 'Dead Sea']), answer: 0 },
      { type: 'mc', q: { uk: 'Яке озеро найглибше у світі?', en: 'Which lake is the deepest in the world?' },
        options: geoOpts_(['Вікторія', 'Байкал', 'Танганьїка', 'Верхнє'], ['Victoria', 'Baikal', 'Tanganyika', 'Superior']), answer: 1 },
      { type: 'mc', q: { uk: 'На якому материку немає постійного населення?', en: 'Which continent has no permanent population?' },
        options: geoOpts_(['Австралія', 'Антарктида', 'Африка', 'Південна Америка'], ['Australia', 'Antarctica', 'Africa', 'South America']), answer: 1 }
    ] },
    { title: { uk: 'Частина 2 — Встановіть відповідність', en: 'Part 2 — Matching' }, instructions: GEO_PICK, questions: [
      { type: 'match', q: { uk: 'Доберіть до кожного материка його найвищу вершину.', en: 'Match each continent to its highest peak.' },
        pairs: [
          { l: { uk: 'Євразія', en: 'Eurasia' }, r: { uk: 'Джомолунгма (Еверест)', en: 'Mount Everest (Chomolungma)' } },
          { l: { uk: 'Африка', en: 'Africa' }, r: { uk: 'Кіліманджаро', en: 'Kilimanjaro' } },
          { l: { uk: 'Південна Америка', en: 'South America' }, r: { uk: 'Аконкагуа', en: 'Aconcagua' } },
          { l: { uk: 'Північна Америка', en: 'North America' }, r: { uk: 'Деналі (Мак-Кінлі)', en: 'Denali (Mount McKinley)' } },
          { l: { uk: 'Австралія', en: 'Australia' }, r: { uk: 'Косцюшко', en: 'Mount Kosciuszko' } }
        ] },
      { type: 'match', q: { uk: 'На якому материку протікає кожна річка?', en: 'On which continent does each river flow?' },
        pairs: [
          { l: { uk: 'Амазонка', en: 'Amazon' }, r: { uk: 'Південна Америка', en: 'South America' } },
          { l: { uk: 'Ніл', en: 'Nile' }, r: { uk: 'Африка', en: 'Africa' } },
          { l: { uk: 'Міссісіпі', en: 'Mississippi' }, r: { uk: 'Північна Америка', en: 'North America' } },
          { l: { uk: 'Муррей', en: 'Murray' }, r: { uk: 'Австралія', en: 'Australia' } },
          { l: { uk: 'Янцзи', en: 'Yangtze' }, r: { uk: 'Євразія', en: 'Eurasia' } }
        ] }
    ] },
    { title: GEO_FIX, instructions: GEO_FIX_HOW, questions: [
      { type: 'fix', q: { uk: 'Найбільший за площею океан — Атлантичний.', en: 'The largest ocean by area is the Atlantic.' },
        accept: ['Найбільший за площею океан — Тихий.', 'The largest ocean by area is the Pacific.'],
        key: 'Атлантичний → Тихий / Atlantic → Pacific' },
      { type: 'fix', q: { uk: 'Пустеля Сахара розташована в Південній Америці.', en: 'The Sahara Desert is in South America.' },
        accept: ['Пустеля Сахара розташована в Африці.', 'Пустеля Сахара розташована у Африці.', 'The Sahara Desert is in Africa.'],
        key: 'Південній Америці → Африці / South America → Africa' }
    ] },
    { title: { uk: 'Частина 4 — Коротка відповідь', en: 'Part 4 — Short answer' },
      instructions: { uk: 'Напишіть одне-два слова.', en: 'Write one or two words.' }, questions: [
      { type: 'short', q: { uk: 'Яка найвища вершина світу?', en: 'What is the highest mountain in the world?' },
        accept: ['Джомолунгма', 'Еверест', 'гора Еверест', 'Everest', 'Mount Everest', 'Chomolungma', 'Qomolangma'] },
      { type: 'short', q: { uk: 'Яка найповноводніша річка світу?', en: 'Which river carries the most water in the world?' },
        accept: ['Амазонка', 'Amazon', 'the Amazon'] },
      { type: 'num', q: { uk: 'Скільки материків на Землі?', en: 'How many continents are there on the Earth (as taught in Ukrainian schools)?' }, accept: ['6'], tol: 0 }
    ] },
    { title: { uk: 'Частина 5 — Поясніть', en: 'Part 5 — Explain' }, instructions: GEO_OPEN, questions: [
      { type: 'open', q: { uk: 'Чому Антарктида — найхолодніший материк Землі?', en: 'Why is Antarctica the coldest continent on Earth?' } }
    ] }
  ] } },

  // ---- Grade 8: physical geography of Ukraine ----
  { title: { uk: 'Географія 8 кл.: природа України', en: 'Geography Grade 8: The nature of Ukraine' }, folder: '', open: false, minutes: 25, content: { langs: ['uk', 'en'], sections: [
    { title: GEO_MC, instructions: GEO_ONE, questions: [
      { type: 'mc', q: { uk: 'Яка найвища вершина України?', en: 'What is the highest peak in Ukraine?' },
        options: geoOpts_(['Роман-Кош', 'Говерла', 'Піп Іван', 'Петрос'], ['Roman-Kosh', 'Hoverla', 'Pip Ivan', 'Petros']), answer: 1 },
      { type: 'mc', q: { uk: 'Яка найдовша річка в межах України?', en: 'Which is the longest river within Ukraine?' },
        options: geoOpts_(['Дністер', 'Південний Буг', 'Дніпро', 'Десна'], ['Dniester', 'Southern Bug', 'Dnipro', 'Desna']), answer: 2 },
      { type: 'mc', q: { uk: 'Які моря омивають Україну?', en: 'Which seas wash the shores of Ukraine?' },
        options: geoOpts_(['Чорне й Азовське', 'Чорне й Балтійське', 'Азовське й Каспійське', 'Чорне й Середземне'], ['The Black Sea and the Sea of Azov', 'The Black Sea and the Baltic Sea', 'The Sea of Azov and the Caspian Sea', 'The Black Sea and the Mediterranean Sea']), answer: 0 },
      { type: 'mc', q: { uk: 'Яке озеро — найглибше природне озеро України?', en: 'Which is the deepest natural lake in Ukraine?' },
        options: geoOpts_(['Ялпуг', 'Світязь', 'Синевир', 'Сасик'], ['Yalpuh', 'Svitiaz', 'Synevyr', 'Sasyk']), answer: 1 },
      { type: 'mc', q: { uk: 'Який тип клімату переважає на більшій частині України?', en: 'Which climate type covers most of Ukraine?' },
        options: geoOpts_(['Помірно континентальний', 'Тропічний', 'Арктичний', 'Екваторіальний'], ['Temperate continental', 'Tropical', 'Arctic', 'Equatorial']), answer: 0 },
      { type: 'mc', q: { uk: 'У якому годинному поясі розташована Україна (стандартний час)?', en: 'Which time zone is Ukraine in (standard time)?' },
        options: geoOpts_(['Першому (UTC+1)', 'Другому (UTC+2)', 'Третьому (UTC+3)', 'Четвертому (UTC+4)'], ['First (UTC+1)', 'Second (UTC+2)', 'Third (UTC+3)', 'Fourth (UTC+4)']), answer: 1 },
      { type: 'mc', q: { uk: 'Яка природна зона займає північ України (Полісся)?', en: 'Which natural zone covers the north of Ukraine (Polissia)?' },
        options: geoOpts_(['Степ', 'Лісостеп', 'Мішані ліси', 'Пустеля'], ['Steppe', 'Forest-steppe', 'Mixed forests', 'Desert']), answer: 2 }
    ] },
    { title: { uk: 'Частина 2 — Встановіть відповідність', en: 'Part 2 — Matching' }, instructions: GEO_PICK, questions: [
      { type: 'match', q: { uk: 'Доберіть до кожного басейну (родовища) корисну копалину, якою він відомий.', en: 'Match each basin (deposit area) to the mineral it is known for.' },
        pairs: [
          { l: { uk: 'Донецький басейн (Донбас)', en: 'Donets Basin (Donbas)' }, r: { uk: 'Кам’яне вугілля', en: 'Hard coal' } },
          { l: { uk: 'Криворізький басейн (Кривбас)', en: 'Kryvyi Rih Basin (Kryvbas)' }, r: { uk: 'Залізні руди', en: 'Iron ore' } },
          { l: { uk: 'Нікопольський басейн', en: 'Nikopol Basin' }, r: { uk: 'Марганцеві руди', en: 'Manganese ore' } },
          { l: { uk: 'Прикарпаття (Калуш, Стебник)', en: 'Carpathian foreland (Kalush, Stebnyk)' }, r: { uk: 'Калійні солі', en: 'Potash salts' } }
        ] },
      { type: 'match', q: { uk: 'Доберіть до кожних гір їхню найвищу вершину.', en: 'Match each mountain range to its highest peak.' },
        pairs: [
          { l: { uk: 'Українські Карпати', en: 'Ukrainian Carpathians' }, r: { uk: 'Говерла (2061 м)', en: 'Hoverla (2061 m)' } },
          { l: { uk: 'Кримські гори', en: 'Crimean Mountains' }, r: { uk: 'Роман-Кош (1545 м)', en: 'Roman-Kosh (1545 m)' } }
        ] }
    ] },
    { title: GEO_FIX, instructions: GEO_FIX_HOW, questions: [
      { type: 'fix', q: { uk: 'Найвища вершина Кримських гір — Говерла.', en: 'The highest peak of the Crimean Mountains is Hoverla.' },
        accept: ['Найвища вершина Кримських гір — Роман-Кош.', 'The highest peak of the Crimean Mountains is Roman-Kosh.',
          'Найвища вершина Українських Карпат — Говерла.', 'The highest peak of the Ukrainian Carpathians is Hoverla.'],
        key: 'Говерла → Роман-Кош (або Кримських гір → Українських Карпат) / Hoverla → Roman-Kosh' },
      { type: 'fix', q: { uk: 'Найдовша притока Дніпра — Дністер.', en: 'The longest tributary of the Dnipro is the Dniester.' },
        accept: ['Найдовша притока Дніпра — Десна.', 'The longest tributary of the Dnipro is the Desna.'],
        key: 'Дністер → Десна / Dniester → Desna' }
    ] },
    { title: { uk: 'Частина 4 — Коротка відповідь', en: 'Part 4 — Short answer' },
      instructions: { uk: 'Напишіть число або одне-два слова.', en: 'Write a number or one or two words.' }, questions: [
      { type: 'num', q: { uk: 'Зі скількома державами Україна межує на суходолі?', en: 'How many countries does Ukraine share a land border with?' }, accept: ['7'], tol: 0 },
      { type: 'num', q: { uk: 'Яка висота Говерли (у метрах)?', en: 'How high is Hoverla (in metres)?' }, accept: ['2061'], tol: 0 },
      { type: 'short', q: { uk: 'Яке місто — столиця України?', en: 'What is the capital of Ukraine?' }, accept: ['Київ', 'Kyiv'] }
    ] },
    { title: { uk: 'Частина 5 — Поясніть', en: 'Part 5 — Explain' }, instructions: GEO_OPEN, questions: [
      { type: 'open', q: { uk: 'Чому на півдні України (у степу) мало лісів?', en: 'Why are there few forests in the south of Ukraine (in the steppe)?' } }
    ] }
  ] } }
];

// ---------- AI: photo(s) → geography test content ----------
// Code.gs adds the rules for the two languages after this text.
const AI_INSTRUCTIONS =
  'You convert a photo of a printed school GEOGRAPHY test or worksheet page into structured JSON. ' +
  'Read every exercise on the page. Return ONLY JSON (no markdown fences, no commentary) shaped as: ' +
  '{"title": string, "sections": [{"title": TEXT, "instructions": TEXT, "questions": [Q, ...]}]}. ' +
  'Each Q is one of: ' +
  '{"type":"mc","q":TEXT,"options":[TEXT, TEXT, ...],"answer":<0-based index of the correct option>}; ' +
  '{"type":"fix","q":TEXT (a statement that contains ONE factual mistake),"accept":["the corrected statement in Ukrainian","the corrected statement in English"],"key":"what was wrong"}; ' +
  '{"type":"short","q":TEXT,"accept":["answer in Ukrainian","answer in English","common synonyms"]} for a one- or two-word answer (a place name, a term, an instrument); ' +
  '{"type":"num","q":TEXT,"accept":["2"],"tol":0} when the answer is a number (map scale problems, heights, temperatures, azimuths, coordinates in degrees); ' +
  '{"type":"match","q":TEXT,"pairs":[{"l":TEXT,"r":TEXT}, ...]} for matching tasks (continent ↔ peak, river ↔ continent, basin ↔ mineral, number on a map ↔ name): each pair is a left item and its correct right item; ' +
  '{"type":"open","q":TEXT} for "explain / describe / compare" questions with no single answer. ' +
  'MAPS AND PICTURES: you cannot copy maps or pictures. Still create the task (for a map with numbered objects: "match" with the numbers on the left) and keep the words "on the map" in the question; the teacher attaches the picture in the editor. ' +
  'NAMES: use the standard Ukrainian school spelling of geographic names (Дніпро, Говерла, Джомолунгма) and the usual English spelling (Dnipro, Hoverla, Everest); in "accept" list both and common variants (Еверест, Everest). ' +
  'Numbers: in "num" write only the number; put the unit (km, m, °C, °) in the question text. ' +
  'ANSWERS: "accept" is shared by both languages, so always list both the Ukrainian and the English forms. ' +
  'For "mc", "answer" MUST be the 0-based index of the correct option; if the page does not mark it, use your geography knowledge. ' +
  'Keep the original wording from the page. Do not invent exercises that are not on the page.';
