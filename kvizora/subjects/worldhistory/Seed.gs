/**
 * Seed.gs — WORLD HISTORY (всесвітня історія). Everything that is special about this subject:
 * the ready-made tests, the AI prompt and which question types the editor offers.
 * Paste this as a SECOND script file (next to Code.gs), named "Seed".
 *
 * Every text a student sees is written in two languages: { uk: '…', en: '…' }.
 * One ready-made test per grade of the Ukrainian school programme (6–11):
 * 6 — the ancient world, 7 — the Middle Ages, 8 — the early modern era (late 15th–18th c.),
 * 9 — the long 19th century (1815–1914), 10 — 1914–1945, 11 — 1945 to today.
 * Years BC are written "776 р. до н. е." / "776 BC" and only appear in "mc"/"match";
 * a "num" answer is always a plain year AD. Short answers are accepted in either language.
 */

const SUBJECT = {
  key: 'worldhistory',
  name: { uk: 'Всесвітня історія', en: 'World history' },
  mode: 'switch',                          // the student switches the whole test between УКР and EN
  qtypes: ['mc', 'match', 'short', 'num', 'fix', 'open'],
  formulas: false
};

function wh_(uk, en) { return { uk: uk, en: en }; }
function whOpts_(list) { return list.map(p => wh_(p[0], p[1])); }
function whPairs_(list) { return list.map(p => ({ l: wh_(p[0], p[1]), r: wh_(p[2], p[3]) })); }

const WH_MC = wh_('Частина 1 — Вибір відповіді', 'Part 1 — Multiple choice');
const WH_ONE = wh_('Оберіть одну правильну відповідь.', 'Choose one correct answer.');
const WH_MATCH = wh_('Частина 2 — Встановіть відповідність', 'Part 2 — Matching');
const WH_PICK = wh_('Для кожного рядка оберіть правильну відповідь зі списку.', 'For each row choose the correct answer from the list.');
const WH_SHORT = wh_('Частина 3 — Коротка відповідь', 'Part 3 — Short answer');
const WH_SHORT_I = wh_('Напишіть слово, назву або рік (рік — лише числом).', 'Write a word, a name or a year (a year as a number only).');
const WH_FIX_I = wh_('Знайдіть і виправте фактичну помилку в реченні. Перепишіть речення правильно.',
  'Find and correct the factual mistake in the sentence. Rewrite the sentence correctly.');
const WH_OPEN = wh_('Частина 4 — Творче завдання', 'Part 4 — Extended answer');
const WH_OPEN_I = wh_('Напишіть 3–5 речень. Це завдання вчитель перевіряє сам.', 'Write 3–5 sentences. Your teacher marks this task.');

const SEED_TESTS = [
  // ---- Grade 6: the ancient world ----
  { title: wh_('Всесвітня історія, 6 клас — Стародавній світ', 'World History, Grade 6 — The Ancient World'), folder: '6 клас', open: true,
    content: { langs: ['uk', 'en'], sections: [
    { title: WH_MC, instructions: WH_ONE, questions: [
      { type: 'mc', q: wh_('Де виникло клинописне письмо?', 'Where did cuneiform writing appear?'),
        options: whOpts_([['У Стародавньому Єгипті', 'In Ancient Egypt'], ['У Месопотамії (Шумері)', 'In Mesopotamia (Sumer)'],
          ['У Стародавньому Китаї', 'In Ancient China'], ['У Стародавній Греції', 'In Ancient Greece']]), answer: 1 },
      { type: 'mc', q: wh_('Кого називають «батьком історії»?', 'Who is called “the father of history”?'),
        options: whOpts_([['Геродота', 'Herodotus'], ['Гомера', 'Homer'], ['Сократа', 'Socrates'], ['Арістотеля', 'Aristotle']]), answer: 0 },
      { type: 'mc', q: wh_('Коли, за переказами, відбулися перші Олімпійські ігри?', 'When, according to tradition, were the first Olympic Games held?'),
        options: whOpts_([['753 р. до н. е.', '753 BC'], ['776 р. до н. е.', '776 BC'], ['490 р. до н. е.', '490 BC'], ['336 р. до н. е.', '336 BC']]), answer: 1 },
      { type: 'mc', q: wh_('За якого державного діяча афінська демократія досягла найбільшого розквіту?', 'Under which statesman did Athenian democracy reach its peak?'),
        options: whOpts_([['Солона', 'Solon'], ['Перікла', 'Pericles'], ['Олександра Македонського', 'Alexander the Great'], ['Драконта', 'Draco']]), answer: 1 },
      { type: 'mc', q: wh_('Хто став першим римським імператором?', 'Who became the first Roman emperor?'),
        options: whOpts_([['Гай Юлій Цезар', 'Gaius Julius Caesar'], ['Октавіан Август', 'Octavian Augustus'], ['Нерон', 'Nero'], ['Ромул', 'Romulus']]), answer: 1 },
      { type: 'mc', q: wh_('Де стоїть піраміда фараона Хеопса?', 'Where does the pyramid of Pharaoh Khufu (Cheops) stand?'),
        options: whOpts_([['У Гізі (Єгипет)', 'In Giza (Egypt)'], ['У Вавилоні', 'In Babylon'], ['В Афінах', 'In Athens'], ['У Римі', 'In Rome']]), answer: 0 },
      { type: 'mc', q: wh_('У якій битві 490 р. до н. е. афіняни перемогли персів?', 'In which battle of 490 BC did the Athenians defeat the Persians?'),
        options: whOpts_([['Марафонській', 'Marathon'], ['Саламінській', 'Salamis'], ['Під Каннами', 'Cannae'], ['При Фермопілах', 'Thermopylae']]), answer: 0 },
      { type: 'mc', q: wh_('Правитель якої держави уклав одне з найдавніших зведень законів — закони Хаммурапі?', 'Which state was ruled by Hammurabi, the author of one of the oldest law codes?'),
        options: whOpts_([['Вавилону', 'Babylon'], ['Спарти', 'Sparta'], ['Карфагена', 'Carthage'], ['Трої', 'Troy']]), answer: 0 },
      { type: 'mc', q: wh_('У якій країні виник буддизм?', 'In which country did Buddhism originate?'),
        options: whOpts_([['У Стародавній Індії', 'In Ancient India'], ['У Стародавньому Єгипті', 'In Ancient Egypt'], ['У Стародавньому Римі', 'In Ancient Rome'], ['У Персії', 'In Persia']]), answer: 0 }
    ] },
    { title: WH_MATCH, instructions: WH_PICK, questions: [
      { type: 'match', q: wh_('Доберіть до кожної цивілізації її досягнення.', 'Match each civilisation with its achievement.'),
        pairs: whPairs_([
          ['Стародавній Єгипет', 'Ancient Egypt', 'Ієрогліфи й піраміди', 'Hieroglyphs and pyramids'],
          ['Месопотамія', 'Mesopotamia', 'Клинопис і закони Хаммурапі', 'Cuneiform and the Code of Hammurabi'],
          ['Фінікія', 'Phoenicia', 'Алфавіт, від якого походять грецький і латинський', 'The alphabet behind the Greek and Latin ones'],
          ['Стародавній Китай', 'Ancient China', 'Папір і Великий мур', 'Paper and the Great Wall'],
          ['Стародавній Рим', 'Ancient Rome', 'Акведуки й римське право', 'Aqueducts and Roman law']
        ]) },
      { type: 'match', q: wh_('Доберіть до кожного грецького бога сферу, якою він опікувався.', 'Match each Greek god with what they ruled over.'),
        pairs: whPairs_([
          ['Зевс', 'Zeus', 'Верховний бог, громовержець', 'King of the gods, the thunderer'],
          ['Посейдон', 'Poseidon', 'Море', 'The sea'],
          ['Афіна', 'Athena', 'Мудрість і справедлива війна', 'Wisdom and just war'],
          ['Аїд', 'Hades', 'Підземне царство мертвих', 'The underworld of the dead'],
          ['Деметра', 'Demeter', 'Землеробство й родючість', 'Farming and fertility']
        ]) }
    ] },
    { title: WH_SHORT, instructions: WH_SHORT_I, questions: [
      { type: 'short', q: wh_('У долині якої річки виникла єгипетська цивілізація?', 'In the valley of which river did Egyptian civilisation arise?'),
        accept: ['Ніл', 'Нілу', 'річка Ніл', 'Nile', 'the Nile', 'Nile River'] },
      { type: 'short', q: wh_('Як називали правителя Стародавнього Єгипту?', 'What was the ruler of Ancient Egypt called?'),
        accept: ['фараон', 'фараоном', 'pharaoh', 'a pharaoh', 'the pharaoh'] },
      { type: 'num', q: wh_('У якому році нашої ери припинила існування Західна Римська імперія?', 'In what year AD did the Western Roman Empire fall?'),
        accept: ['476'], tol: 0 }
    ] },
    { title: WH_OPEN, instructions: WH_OPEN_I, questions: [
      { type: 'open', q: wh_('Яке досягнення стародавніх цивілізацій, на вашу думку, найбільше впливає на наше життя сьогодні? Поясніть чому.',
        'Which achievement of the ancient civilisations do you think affects our life most today? Explain why.') }
    ] }
  ] } },

  // ---- Grade 7: the Middle Ages ----
  { title: wh_('Всесвітня історія, 7 клас — Середні віки', 'World History, Grade 7 — The Middle Ages'), folder: '7 клас', open: false, minutes: 30,
    content: { langs: ['uk', 'en'], sections: [
    { title: WH_MC, instructions: WH_ONE, questions: [
      { type: 'mc', q: wh_('Яке місто було столицею Візантійської імперії?', 'Which city was the capital of the Byzantine Empire?'),
        options: whOpts_([['Рим', 'Rome'], ['Константинополь', 'Constantinople'], ['Афіни', 'Athens'], ['Александрія', 'Alexandria']]), answer: 1 },
      { type: 'mc', q: wh_('Хто заснував іслам?', 'Who founded Islam?'),
        options: whOpts_([['Пророк Мухаммад', 'The Prophet Muhammad'], ['Харун ар-Рашид', 'Harun al-Rashid'], ['Саладін', 'Saladin'], ['Сулейман Пишний', 'Suleiman the Magnificent']]), answer: 0 },
      { type: 'mc', q: wh_('Чим завершилася битва при Гастінгсі 1066 р.?', 'What was the result of the Battle of Hastings in 1066?'),
        options: whOpts_([['Нормандський герцог Вільгельм завоював Англію', 'Duke William of Normandy conquered England'],
          ['Франки зупинили арабів', 'The Franks stopped the Arabs'], ['Почалася Столітня війна', 'The Hundred Years’ War began'],
          ['Хрестоносці захопили Єрусалим', 'The crusaders took Jerusalem']]), answer: 0 },
      { type: 'mc', q: wh_('Який папа римський закликав до Першого хрестового походу (1095 р.)?', 'Which pope called for the First Crusade (1095)?'),
        options: whOpts_([['Григорій VII', 'Gregory VII'], ['Урбан II', 'Urban II'], ['Інокентій III', 'Innocent III'], ['Лев III', 'Leo III']]), answer: 1 },
      { type: 'mc', q: wh_('Що сталося з християнською церквою в 1054 р.?', 'What happened to the Christian Church in 1054?'),
        options: whOpts_([['Вона розкололася на католицьку й православну', 'It split into the Catholic and the Orthodox Churches'],
          ['Почалася Реформація', 'The Reformation began'], ['Її визнали державною релігією Риму', 'It became the state religion of Rome'],
          ['Відбувся перший хрестовий похід', 'The first crusade took place']]), answer: 0 },
      { type: 'mc', q: wh_('Між якими країнами точилася Столітня війна (1337–1453)?', 'Which countries fought the Hundred Years’ War (1337–1453)?'),
        options: whOpts_([['Англією і Францією', 'England and France'], ['Францією та Іспанією', 'France and Spain'],
          ['Англією та Шотландією', 'England and Scotland'], ['Священною Римською імперією та Францією', 'The Holy Roman Empire and France']]), answer: 0 },
      { type: 'mc', q: wh_('Хто завоював Константинополь, поклавши край Візантійській імперії?', 'Who conquered Constantinople, ending the Byzantine Empire?'),
        options: whOpts_([['Хрестоносці', 'The crusaders'], ['Монголи', 'The Mongols'], ['Турки-османи', 'The Ottoman Turks'], ['Араби', 'The Arabs']]), answer: 2 },
      { type: 'mc', q: wh_('Який документ 1215 р. обмежив владу англійського короля?', 'Which document of 1215 limited the power of the English king?'),
        options: whOpts_([['Велика хартія вольностей', 'Magna Carta'], ['Золота була', 'The Golden Bull'], ['Салічна правда', 'Salic Law'], ['Кодекс Юстиніана', 'The Code of Justinian']]), answer: 0 }
    ] },
    { title: WH_MATCH, instructions: WH_PICK, questions: [
      { type: 'match', q: wh_('Доберіть до кожного історичного діяча його вчинок.', 'Match each historical figure with their deed.'),
        pairs: whPairs_([
          ['Карл Великий', 'Charlemagne', 'Створив імперію франків і був коронований імператором', 'Built the Frankish Empire and was crowned emperor'],
          ['Юстиніан I', 'Justinian I', 'Звів римське право в єдиний кодекс, збудував Софію Константинопольську', 'Collected Roman law into one code, built Hagia Sophia'],
          ['Вільгельм Завойовник', 'William the Conqueror', 'Завоював Англію в 1066 р.', 'Conquered England in 1066'],
          ['Жанна д’Арк', 'Joan of Arc', 'Звільнила Орлеан від англійців', 'Freed Orléans from the English'],
          ['Чингісхан', 'Genghis Khan', 'Об’єднав монгольські племена й заснував Монгольську імперію', 'United the Mongol tribes and founded the Mongol Empire']
        ]) },
      { type: 'match', q: wh_('Доберіть до кожного поняття його значення.', 'Match each term with its meaning.'),
        pairs: whPairs_([
          ['Феод', 'Fief', 'Земельне володіння, отримане за службу', 'Land granted in return for service'],
          ['Васал', 'Vassal', 'Феодал, який отримав землю від сеньйора й служив йому', 'A noble who held land from a lord and served him'],
          ['Цех', 'Craft guild', 'Об’єднання ремісників однієї професії', 'A union of craftsmen of one trade'],
          ['Лицар', 'Knight', 'Професійний воїн-вершник', 'A professional mounted warrior'],
          ['Університет', 'University', 'Об’єднання викладачів і студентів для навчання наук', 'A community of teachers and students for higher learning']
        ]) }
    ] },
    { title: WH_SHORT, instructions: WH_SHORT_I, questions: [
      { type: 'num', q: wh_('У якому році Карла Великого коронували імператором?', 'In what year was Charlemagne crowned emperor?'),
        accept: ['800'], tol: 0 },
      { type: 'num', q: wh_('У якому році впав Константинополь?', 'In what year did Constantinople fall?'),
        accept: ['1453'], tol: 0 },
      { type: 'short', q: wh_('Як називалися військові походи західноєвропейських лицарів на Близький Схід, щоб звільнити Єрусалим?',
        'What were the military campaigns of Western European knights to the Middle East to free Jerusalem called?'),
        accept: ['хрестові походи', 'хрестовий похід', 'crusades', 'the crusades', 'crusade'] }
    ] },
    { title: wh_('Частина 4 — Виправте помилку', 'Part 4 — Correct the mistake'), instructions: WH_FIX_I, questions: [
      { type: 'fix', q: wh_('Столітня війна точилася між Англією та Іспанією.', 'The Hundred Years’ War was fought between England and Spain.'),
        accept: ['Столітня війна точилася між Англією та Францією.', 'Столітня війна точилася між Англією і Францією.',
          'The Hundred Years’ War was fought between England and France.'],
        key: 'Іспанією → Францією / Spain → France' }
    ] },
    { title: wh_('Частина 5 — Творче завдання', 'Part 5 — Extended answer'), instructions: WH_OPEN_I, questions: [
      { type: 'open', q: wh_('Опишіть один день із життя середньовічного селянина, ремісника або лицаря.', 'Describe a day in the life of a medieval peasant, craftsman or knight.') }
    ] }
  ] } },

  // ---- Grade 8: the early modern era ----
  { title: wh_('Всесвітня історія, 8 клас — Ранній Новий час', 'World History, Grade 8 — The Early Modern Era'), folder: '8 клас', open: false, minutes: 30,
    content: { langs: ['uk', 'en'], sections: [
    { title: WH_MC, instructions: WH_ONE, questions: [
      { type: 'mc', q: wh_('Чия експедиція здійснила першу навколосвітню подорож (1519–1522)?', 'Whose expedition made the first voyage around the world (1519–1522)?'),
        options: whOpts_([['Фернана Магеллана', 'Ferdinand Magellan'], ['Васко да Гами', 'Vasco da Gama'], ['Христофора Колумба', 'Christopher Columbus'], ['Джеймса Кука', 'James Cook']]), answer: 0 },
      { type: 'mc', q: wh_('Хто започаткував Реформацію, оприлюднивши 95 тез у 1517 р.?', 'Who started the Reformation by publishing the 95 Theses in 1517?'),
        options: whOpts_([['Жан Кальвін', 'John Calvin'], ['Мартін Лютер', 'Martin Luther'], ['Еразм Роттердамський', 'Erasmus of Rotterdam'], ['Ігнатій Лойола', 'Ignatius of Loyola']]), answer: 1 },
      { type: 'mc', q: wh_('Хто винайшов у Європі друкарський верстат із рухомими літерами?', 'Who invented the printing press with movable type in Europe?'),
        options: whOpts_([['Йоганн Гутенберг', 'Johannes Gutenberg'], ['Галілео Галілей', 'Galileo Galilei'], ['Леонардо да Вінчі', 'Leonardo da Vinci'], ['Іван Федоров', 'Ivan Fedorov']]), answer: 0 },
      { type: 'mc', q: wh_('Хто автор картини «Мона Ліза» («Джоконда»)?', 'Who painted the “Mona Lisa”?'),
        options: whOpts_([['Мікеланджело', 'Michelangelo'], ['Рафаель Санті', 'Raphael'], ['Леонардо да Вінчі', 'Leonardo da Vinci'], ['Сандро Боттічеллі', 'Sandro Botticelli']]), answer: 2 },
      { type: 'mc', q: wh_('Хто очолив парламентську армію під час Англійської революції XVII ст. і став лордом-протектором?', 'Who led the Parliamentary army in the 17th-century English Revolution and became Lord Protector?'),
        options: whOpts_([['Олівер Кромвель', 'Oliver Cromwell'], ['Карл I', 'Charles I'], ['Вільгельм Оранський', 'William of Orange'], ['Генріх VIII', 'Henry VIII']]), answer: 0 },
      { type: 'mc', q: wh_('Який мир 1648 р. завершив Тридцятилітню війну?', 'Which peace of 1648 ended the Thirty Years’ War?'),
        options: whOpts_([['Вестфальський', 'The Peace of Westphalia'], ['Версальський', 'The Treaty of Versailles'], ['Аугсбурзький', 'The Peace of Augsburg'], ['Паризький', 'The Treaty of Paris']]), answer: 0 },
      { type: 'mc', q: wh_('У якій країні почався промисловий переворот?', 'In which country did the Industrial Revolution begin?'),
        options: whOpts_([['У Франції', 'France'], ['В Англії', 'England'], ['В Іспанії', 'Spain'], ['У Нідерландах', 'The Netherlands']]), answer: 1 },
      { type: 'mc', q: wh_('Яка подія 14 липня 1789 р. стала початком Французької революції?', 'Which event on 14 July 1789 marked the start of the French Revolution?'),
        options: whOpts_([['Страта короля', 'The execution of the king'], ['Взяття Бастилії', 'The storming of the Bastille'],
          ['Скликання Генеральних штатів', 'The calling of the Estates-General'], ['Коронація Наполеона', 'The coronation of Napoleon']]), answer: 1 },
      { type: 'mc', q: wh_('Хто став першим президентом США?', 'Who became the first President of the USA?'),
        options: whOpts_([['Томас Джефферсон', 'Thomas Jefferson'], ['Авраам Лінкольн', 'Abraham Lincoln'], ['Джордж Вашингтон', 'George Washington'], ['Бенджамін Франклін', 'Benjamin Franklin']]), answer: 2 }
    ] },
    { title: WH_MATCH, instructions: WH_PICK, questions: [
      { type: 'match', q: wh_('Доберіть до кожного вченого чи мореплавця його досягнення.', 'Match each scientist or navigator with their achievement.'),
        pairs: whPairs_([
          ['Микола Коперник', 'Nicolaus Copernicus', 'Геліоцентрична система світу', 'The heliocentric system of the world'],
          ['Галілео Галілей', 'Galileo Galilei', 'Спостереження неба в телескоп', 'Observing the sky through a telescope'],
          ['Ісаак Ньютон', 'Isaac Newton', 'Закон всесвітнього тяжіння', 'The law of universal gravitation'],
          ['Джеймс Уатт', 'James Watt', 'Удосконалена парова машина', 'An improved steam engine'],
          ['Христофор Колумб', 'Christopher Columbus', 'Відкриття Америки для європейців', 'Reaching America for Europeans']
        ]) },
      { type: 'match', q: wh_('Доберіть до кожного мислителя доби Просвітництва його ідею.', 'Match each Enlightenment thinker with their idea.'),
        pairs: whPairs_([
          ['Джон Локк', 'John Locke', 'Природні права людини: життя, свобода, власність', 'Natural rights: life, liberty and property'],
          ['Шарль Монтеск’є', 'Montesquieu', 'Поділ влади на законодавчу, виконавчу й судову', 'Separation of powers into legislative, executive and judicial'],
          ['Жан-Жак Руссо', 'Jean-Jacques Rousseau', 'Суспільний договір і народний суверенітет', 'The social contract and popular sovereignty'],
          ['Вольтер', 'Voltaire', 'Віротерпимість і свобода слова', 'Religious tolerance and freedom of speech']
        ]) }
    ] },
    { title: WH_SHORT, instructions: WH_SHORT_I, questions: [
      { type: 'short', q: wh_('Як називають добу в європейській культурі XIV–XVI ст., коли відроджували античну спадщину?', 'What is the period in European culture of the 14th–16th centuries that revived the heritage of antiquity called?'),
        accept: ['Відродження', 'Ренесанс', 'доба Відродження', 'епоха Відродження', 'Renaissance', 'the Renaissance'] },
      { type: 'num', q: wh_('У якому році ухвалили Декларацію незалежності США?', 'In what year was the US Declaration of Independence adopted?'),
        accept: ['1776'], tol: 0 }
    ] },
    { title: wh_('Частина 4 — Виправте помилку', 'Part 4 — Correct the mistake'), instructions: WH_FIX_I, questions: [
      { type: 'fix', q: wh_('Христофор Колумб досяг берегів Америки в 1498 році.', 'Christopher Columbus reached the shores of America in 1498.'),
        accept: ['Христофор Колумб досяг берегів Америки в 1492 році.', 'Христофор Колумб досяг берегів Америки у 1492 році.',
          'Christopher Columbus reached the shores of America in 1492.'],
        key: '1498 → 1492' }
    ] },
    { title: wh_('Частина 5 — Творче завдання', 'Part 5 — Extended answer'), instructions: WH_OPEN_I, questions: [
      { type: 'open', q: wh_('Як Великі географічні відкриття змінили життя людей у Європі та Америці?', 'How did the Age of Discovery change people’s lives in Europe and America?') }
    ] }
  ] } },

  // ---- Grade 9: the long 19th century (1815–1914) ----
  { title: wh_('Всесвітня історія, 9 клас — XIX століття', 'World History, Grade 9 — The 19th Century'), folder: '9 клас', open: false, minutes: 30,
    content: { langs: ['uk', 'en'], sections: [
    { title: WH_MC, instructions: WH_ONE, questions: [
      { type: 'mc', q: wh_('У якій битві 1815 р. Наполеон зазнав остаточної поразки?', 'In which battle of 1815 was Napoleon finally defeated?'),
        options: whOpts_([['Під Аустерліцом', 'Austerlitz'], ['Під Ватерлоо', 'Waterloo'], ['Під Бородіном', 'Borodino'], ['Під Лейпцигом', 'Leipzig']]), answer: 1 },
      { type: 'mc', q: wh_('Який міжнародний конгрес 1814–1815 рр. установив новий порядок у Європі після наполеонівських війн?', 'Which international congress of 1814–1815 set up a new order in Europe after the Napoleonic Wars?'),
        options: whOpts_([['Віденський', 'The Congress of Vienna'], ['Берлінський', 'The Congress of Berlin'], ['Паризький', 'The Congress of Paris'], ['Празький', 'The Congress of Prague']]), answer: 0 },
      { type: 'mc', q: wh_('Кого називають «залізним канцлером», який об’єднав Німеччину?', 'Who is called the “Iron Chancellor” who unified Germany?'),
        options: whOpts_([['Отто фон Бісмарка', 'Otto von Bismarck'], ['Вільгельма II', 'Wilhelm II'], ['Клеменса Меттерніха', 'Klemens von Metternich'], ['Фрідріха II', 'Frederick II']]), answer: 0 },
      { type: 'mc', q: wh_('Хто з цих діячів відомий як герой об’єднання Італії, ватажок походу «тисячі червоносорочечників»?', 'Which of these figures is a hero of Italian unification who led the “Expedition of the Thousand” (the Redshirts)?'),
        options: whOpts_([['Джузеппе Гарібальді', 'Giuseppe Garibaldi'], ['Беніто Муссоліні', 'Benito Mussolini'], ['Наполеон III', 'Napoleon III'], ['Луї Блан', 'Louis Blanc']]), answer: 0 },
      { type: 'mc', q: wh_('Хто був президентом США під час Громадянської війни (1861–1865)?', 'Who was President of the USA during the Civil War (1861–1865)?'),
        options: whOpts_([['Джордж Вашингтон', 'George Washington'], ['Авраам Лінкольн', 'Abraham Lincoln'], ['Теодор Рузвельт', 'Theodore Roosevelt'], ['Улісс Грант', 'Ulysses Grant']]), answer: 1 },
      { type: 'mc', q: wh_('Хто автори «Маніфесту Комуністичної партії» (1848)?', 'Who wrote “The Communist Manifesto” (1848)?'),
        options: whOpts_([['Карл Маркс і Фрідріх Енгельс', 'Karl Marx and Friedrich Engels'], ['Адам Сміт і Девід Рікардо', 'Adam Smith and David Ricardo'],
          ['Роберт Оуен і Шарль Фур’є', 'Robert Owen and Charles Fourier'], ['Володимир Ленін і Лев Троцький', 'Vladimir Lenin and Leon Trotsky']]), answer: 0 },
      { type: 'mc', q: wh_('У якій країні відбулися реформи Мейдзі (з 1868 р.)?', 'In which country did the Meiji reforms take place (from 1868)?'),
        options: whOpts_([['У Китаї', 'China'], ['У Японії', 'Japan'], ['В Індії', 'India'], ['У Кореї', 'Korea']]), answer: 1 },
      { type: 'mc', q: wh_('Як назвали хвилю революцій 1848–1849 рр. у Європі?', 'What is the wave of revolutions of 1848–1849 in Europe called?'),
        options: whOpts_([['«Весна народів»', 'The “Springtime of Nations”'], ['«Оксамитові революції»', 'The “Velvet Revolutions”'],
          ['«Славна революція»', 'The “Glorious Revolution”'], ['«Сто днів»', 'The “Hundred Days”']]), answer: 0 }
    ] },
    { title: WH_MATCH, instructions: WH_PICK, questions: [
      { type: 'match', q: wh_('Доберіть до кожного винахідника чи вченого його досягнення.', 'Match each inventor or scientist with their achievement.'),
        pairs: whPairs_([
          ['Томас Едісон', 'Thomas Edison', 'Практична лампа розжарювання', 'A practical incandescent light bulb'],
          ['Александр Белл', 'Alexander Graham Bell', 'Телефон', 'The telephone'],
          ['Карл Бенц', 'Karl Benz', 'Автомобіль із двигуном внутрішнього згоряння', 'A car with an internal combustion engine'],
          ['Луї Пастер', 'Louis Pasteur', 'Вакцина проти сказу й пастеризація', 'The rabies vaccine and pasteurisation'],
          ['Чарлз Дарвін', 'Charles Darwin', 'Теорія походження видів шляхом природного добору', 'The theory of evolution by natural selection']
        ]) },
      { type: 'match', q: wh_('Доберіть до кожного року подію.', 'Match each year with an event.'),
        pairs: whPairs_([
          ['1815', '1815', 'Битва під Ватерлоо', 'The Battle of Waterloo'],
          ['1848', '1848', 'Початок «Весни народів»', 'The start of the “Springtime of Nations”'],
          ['1861', '1861', 'Скасування кріпацтва в Російській імперії', 'Serfdom abolished in the Russian Empire'],
          ['1865', '1865', 'Завершення Громадянської війни в США', 'The end of the American Civil War'],
          ['1871', '1871', 'Проголошення Німецької імперії', 'The German Empire proclaimed']
        ]) }
    ] },
    { title: WH_SHORT, instructions: WH_SHORT_I, questions: [
      { type: 'short', q: wh_('Як називають добу правління британської королеви Вікторії (1837–1901)?', 'What is the period of Queen Victoria’s reign in Britain (1837–1901) called?'),
        accept: ['Вікторіанська епоха', 'вікторіанська доба', 'вікторіанська ера', 'Victorian era', 'the Victorian era', 'Victorian age', 'the Victorian age'] },
      { type: 'num', q: wh_('У якому році відкрили Суецький канал?', 'In what year was the Suez Canal opened?'),
        accept: ['1869'], tol: 0 }
    ] },
    { title: wh_('Частина 4 — Виправте помилку', 'Part 4 — Correct the mistake'), instructions: WH_FIX_I, questions: [
      { type: 'fix', q: wh_('Громадянська війна в США завершилася перемогою Півдня.', 'The American Civil War ended with the victory of the South.'),
        accept: ['Громадянська війна в США завершилася перемогою Півночі.', 'The American Civil War ended with the victory of the North.'],
        key: 'Півдня → Півночі / South → North' }
    ] },
    { title: wh_('Частина 5 — Творче завдання', 'Part 5 — Extended answer'), instructions: WH_OPEN_I, questions: [
      { type: 'open', q: wh_('Який винахід XIX ст. найбільше змінив повсякденне життя людей? Поясніть свій вибір.', 'Which invention of the 19th century changed people’s everyday life the most? Explain your choice.') }
    ] }
  ] } },

  // ---- Grade 10: 1914–1945 ----
  { title: wh_('Всесвітня історія, 10 клас — Світ у 1914–1945 рр.', 'World History, Grade 10 — The World in 1914–1945'), folder: '10 клас', open: false, minutes: 35,
    content: { langs: ['uk', 'en'], sections: [
    { title: WH_MC, instructions: WH_ONE, questions: [
      { type: 'mc', q: wh_('Що стало приводом до Першої світової війни?', 'What was the immediate cause of the First World War?'),
        options: whOpts_([['Убивство ерцгерцога Франца Фердинанда в Сараєві', 'The assassination of Archduke Franz Ferdinand in Sarajevo'],
          ['Напад Німеччини на Польщу', 'Germany’s invasion of Poland'], ['Революція в Росії', 'The revolution in Russia'],
          ['Потоплення «Титаніка»', 'The sinking of the Titanic']]), answer: 0 },
      { type: 'mc', q: wh_('Які країни утворили Антанту?', 'Which countries formed the Entente?'),
        options: whOpts_([['Велика Британія, Франція, Росія', 'Britain, France, Russia'], ['Німеччина, Австро-Угорщина, Італія', 'Germany, Austria-Hungary, Italy'],
          ['США, Японія, Китай', 'The USA, Japan, China'], ['Німеччина, Італія, Японія', 'Germany, Italy, Japan']]), answer: 0 },
      { type: 'mc', q: wh_('Який мирний договір 1919 р. підбив підсумки Першої світової війни для Німеччини?', 'Which peace treaty of 1919 settled the results of the First World War for Germany?'),
        options: whOpts_([['Версальський', 'The Treaty of Versailles'], ['Брестський', 'The Treaty of Brest-Litovsk'], ['Вестфальський', 'The Peace of Westphalia'], ['Мюнхенська угода', 'The Munich Agreement']]), answer: 0 },
      { type: 'mc', q: wh_('Яка подія 1929 р. започаткувала Велику депресію?', 'Which event of 1929 started the Great Depression?'),
        options: whOpts_([['Крах Нью-Йоркської фондової біржі', 'The crash of the New York Stock Exchange'], ['Прихід Гітлера до влади', 'Hitler coming to power'],
          ['Кінець Першої світової війни', 'The end of the First World War'], ['Створення Ліги Націй', 'The founding of the League of Nations']]), answer: 0 },
      { type: 'mc', q: wh_('Який президент США запровадив «Новий курс» для подолання кризи?', 'Which US president introduced the “New Deal” to fight the crisis?'),
        options: whOpts_([['Франклін Делано Рузвельт', 'Franklin D. Roosevelt'], ['Вудро Вільсон', 'Woodrow Wilson'], ['Гаррі Трумен', 'Harry Truman'], ['Герберт Гувер', 'Herbert Hoover']]), answer: 0 },
      { type: 'mc', q: wh_('Яка угода 23 серпня 1939 р. між СРСР і Німеччиною містила таємний протокол про поділ Східної Європи?', 'Which agreement of 23 August 1939 between the USSR and Germany had a secret protocol dividing Eastern Europe?'),
        options: whOpts_([['Пакт Молотова — Ріббентропа', 'The Molotov–Ribbentrop Pact'], ['Мюнхенська угода', 'The Munich Agreement'],
          ['Антикомінтернівський пакт', 'The Anti-Comintern Pact'], ['Атлантична хартія', 'The Atlantic Charter']]), answer: 0 },
      { type: 'mc', q: wh_('Де 6 червня 1944 р. висадилися війська союзників, відкривши Другий фронт?', 'Where did the Allied troops land on 6 June 1944, opening the Second Front?'),
        options: whOpts_([['У Нормандії', 'In Normandy'], ['На Сицилії', 'In Sicily'], ['У Норвегії', 'In Norway'], ['У Греції', 'In Greece']]), answer: 0 },
      { type: 'mc', q: wh_('На яке японське місто США скинули першу атомну бомбу?', 'On which Japanese city did the USA drop the first atomic bomb?'),
        options: whOpts_([['Хіросіма', 'Hiroshima'], ['Нагасакі', 'Nagasaki'], ['Токіо', 'Tokyo'], ['Осака', 'Osaka']]), answer: 0 }
    ] },
    { title: WH_MATCH, instructions: WH_PICK, questions: [
      { type: 'match', q: wh_('Доберіть до кожного лідера країну чи рух, який він очолював під час Другої світової війни.', 'Match each leader with the country or movement they led in the Second World War.'),
        pairs: whPairs_([
          ['Вінстон Черчилль', 'Winston Churchill', 'Велика Британія', 'Great Britain'],
          ['Франклін Рузвельт', 'Franklin Roosevelt', 'США', 'The USA'],
          ['Адольф Гітлер', 'Adolf Hitler', 'Німеччина', 'Germany'],
          ['Беніто Муссоліні', 'Benito Mussolini', 'Італія', 'Italy'],
          ['Шарль де Голль', 'Charles de Gaulle', 'Рух «Вільна Франція»', 'The Free French movement']
        ]) }
    ] },
    { title: WH_SHORT, instructions: WH_SHORT_I, questions: [
      { type: 'num', q: wh_('У якому році почалася Перша світова війна?', 'In what year did the First World War begin?'), accept: ['1914'], tol: 0 },
      { type: 'num', q: wh_('У якому році закінчилася Друга світова війна?', 'In what year did the Second World War end?'), accept: ['1945'], tol: 0 },
      { type: 'short', q: wh_('Як називався блок Німеччини, Австро-Угорщини, Османської імперії та Болгарії в Першій світовій війні?', 'What was the bloc of Germany, Austria-Hungary, the Ottoman Empire and Bulgaria in the First World War called?'),
        accept: ['Четверний союз', 'Центральні держави', 'Quadruple Alliance', 'the Quadruple Alliance', 'Central Powers', 'the Central Powers'] }
    ] },
    { title: wh_('Частина 4 — Виправте помилку', 'Part 4 — Correct the mistake'), instructions: WH_FIX_I, questions: [
      { type: 'fix', q: wh_('Друга світова війна почалася 1 вересня 1939 року нападом Німеччини на Францію.', 'The Second World War began on 1 September 1939 with Germany’s invasion of France.'),
        accept: ['Друга світова війна почалася 1 вересня 1939 року нападом Німеччини на Польщу.',
          'The Second World War began on 1 September 1939 with Germany’s invasion of Poland.'],
        key: 'Францію → Польщу / France → Poland' }
    ] },
    { title: wh_('Частина 5 — Творче завдання', 'Part 5 — Extended answer'), instructions: WH_OPEN_I, questions: [
      { type: 'open', q: wh_('Чому Ліга Націй не змогла запобігти Другій світовій війні? Наведіть два-три аргументи.', 'Why did the League of Nations fail to prevent the Second World War? Give two or three reasons.') }
    ] }
  ] } },

  // ---- Grade 11: 1945 to today ----
  { title: wh_('Всесвітня історія, 11 клас — Світ після 1945 р.', 'World History, Grade 11 — The World after 1945'), folder: '11 клас', open: false, minutes: 35,
    content: { langs: ['uk', 'en'], sections: [
    { title: WH_MC, instructions: WH_ONE, questions: [
      { type: 'mc', q: wh_('У якому році створено Організацію Північноатлантичного договору (НАТО)?', 'In what year was the North Atlantic Treaty Organization (NATO) founded?'),
        options: whOpts_([['1945', '1945'], ['1949', '1949'], ['1955', '1955'], ['1961', '1961']]), answer: 1 },
      { type: 'mc', q: wh_('Яка програма США допомогла відбудувати економіку Західної Європи після війни?', 'Which US programme helped rebuild the economy of Western Europe after the war?'),
        options: whOpts_([['План Маршалла', 'The Marshall Plan'], ['Доктрина Монро', 'The Monroe Doctrine'], ['«Новий курс»', 'The New Deal'], ['План Дауеса', 'The Dawes Plan']]), answer: 0 },
      { type: 'mc', q: wh_('Яка подія 1962 р. поставила світ на межу ядерної війни між США і СРСР?', 'Which event of 1962 brought the world to the brink of nuclear war between the USA and the USSR?'),
        options: whOpts_([['Карибська (Кубинська ракетна) криза', 'The Cuban Missile Crisis'], ['Корейська війна', 'The Korean War'],
          ['Берлінська блокада', 'The Berlin Blockade'], ['Війна у В’єтнамі', 'The Vietnam War']]), answer: 0 },
      { type: 'mc', q: wh_('Хто першим ступив на поверхню Місяця (1969)?', 'Who was the first person to walk on the Moon (1969)?'),
        options: whOpts_([['Ніл Армстронг', 'Neil Armstrong'], ['Юрій Гагарін', 'Yuri Gagarin'], ['Базз Олдрін', 'Buzz Aldrin'], ['Джон Гленн', 'John Glenn']]), answer: 0 },
      { type: 'mc', q: wh_('Коли впав Берлінський мур?', 'When did the Berlin Wall fall?'),
        options: whOpts_([['13 серпня 1961 р.', '13 August 1961'], ['9 листопада 1989 р.', '9 November 1989'], ['3 жовтня 1990 р.', '3 October 1990'], ['26 грудня 1991 р.', '26 December 1991']]), answer: 1 },
      { type: 'mc', q: wh_('Який договір започаткував Європейський Союз?', 'Which treaty established the European Union?'),
        options: whOpts_([['Маастрихтський', 'The Maastricht Treaty'], ['Римський', 'The Treaty of Rome'], ['Лісабонський', 'The Treaty of Lisbon'], ['Гельсінський заключний акт', 'The Helsinki Final Act']]), answer: 0 },
      { type: 'mc', q: wh_('Хто став першим темношкірим президентом Південно-Африканської Республіки після скасування апартеїду?', 'Who became the first Black president of South Africa after apartheid ended?'),
        options: whOpts_([['Нельсон Мандела', 'Nelson Mandela'], ['Мартін Лютер Кінг', 'Martin Luther King'], ['Кофі Аннан', 'Kofi Annan'], ['Барак Обама', 'Barack Obama']]), answer: 0 },
      { type: 'mc', q: wh_('Яка держава припинила існування в грудні 1991 р.?', 'Which state ceased to exist in December 1991?'),
        options: whOpts_([['СРСР', 'The USSR'], ['Чехословаччина', 'Czechoslovakia'], ['НДР', 'East Germany (GDR)'], ['Югославія', 'Yugoslavia']]), answer: 0 }
    ] },
    { title: WH_MATCH, instructions: WH_PICK, questions: [
      { type: 'match', q: wh_('Доберіть до кожної організації її опис.', 'Match each organisation with its description.'),
        pairs: whPairs_([
          ['ООН', 'The UN', 'Всесвітня організація для підтримання миру й безпеки', 'A worldwide organisation to keep peace and security'],
          ['НАТО', 'NATO', 'Військово-політичний союз країн Північної Америки та Європи', 'A military and political alliance of North American and European countries'],
          ['Європейський Союз', 'The European Union', 'Політичний та економічний союз європейських держав', 'A political and economic union of European states'],
          ['Організація Варшавського договору', 'The Warsaw Pact', 'Військовий блок соціалістичних країн на чолі з СРСР', 'A military bloc of socialist countries led by the USSR'],
          ['ЮНЕСКО', 'UNESCO', 'Організація ООН з питань освіти, науки й культури', 'The UN organisation for education, science and culture']
        ]) },
      { type: 'match', q: wh_('Доберіть до кожного діяча його роль в історії.', 'Match each figure with their role in history.'),
        pairs: whPairs_([
          ['Махатма Ганді', 'Mahatma Gandhi', 'Ненасильницька боротьба за незалежність Індії', 'Non-violent struggle for India’s independence'],
          ['Мартін Лютер Кінг', 'Martin Luther King', 'Рух за громадянські права темношкірих у США', 'The civil rights movement in the USA'],
          ['Нельсон Мандела', 'Nelson Mandela', 'Боротьба проти апартеїду в ПАР', 'The struggle against apartheid in South Africa'],
          ['Михайло Горбачов', 'Mikhail Gorbachev', 'Політика «перебудови» в СРСР', 'The policy of perestroika in the USSR']
        ]) }
    ] },
    { title: WH_SHORT, instructions: WH_SHORT_I, questions: [
      { type: 'num', q: wh_('У якому році створено Організацію Об’єднаних Націй?', 'In what year was the United Nations founded?'), accept: ['1945'], tol: 0 },
      { type: 'short', q: wh_('Як називають протистояння США і СРСР після Другої світової війни без прямої війни між ними?', 'What is the confrontation between the USA and the USSR after the Second World War, without a direct war between them, called?'),
        accept: ['холодна війна', 'холодною війною', 'Cold War', 'the Cold War'] }
    ] },
    { title: wh_('Частина 4 — Виправте помилку', 'Part 4 — Correct the mistake'), instructions: WH_FIX_I, questions: [
      { type: 'fix', q: wh_('Маастрихтський договір про створення Європейського Союзу підписали в 1957 році.', 'The Maastricht Treaty establishing the European Union was signed in 1957.'),
        accept: ['Маастрихтський договір про створення Європейського Союзу підписали в 1992 році.',
          'Маастрихтський договір про створення Європейського Союзу підписали у 1992 році.',
          'The Maastricht Treaty establishing the European Union was signed in 1992.'],
        key: '1957 → 1992' }
    ] },
    { title: wh_('Частина 5 — Творче завдання', 'Part 5 — Extended answer'), instructions: WH_OPEN_I, questions: [
      { type: 'open', q: wh_('Чому падіння Берлінського муру вважають символом завершення холодної війни?', 'Why is the fall of the Berlin Wall seen as a symbol of the end of the Cold War?') }
    ] }
  ] } }
];

// ---------- AI: photo(s) → World history test content ----------
const AI_INSTRUCTIONS =
  'You convert a photo of a printed school WORLD HISTORY (всесвітня історія) test or worksheet page into structured JSON. ' +
  'The test is for Ukrainian schoolchildren (grades 6–11). Read every exercise on the page. ' +
  'Return ONLY JSON (no markdown fences, no commentary) shaped as: ' +
  '{"title": TEXT, "sections": [{"title": TEXT, "instructions": TEXT, "questions": [Q, ...]}]}. ' +
  'Each Q is one of: ' +
  '{"type":"mc","q":TEXT,"options":[TEXT, TEXT, ...],"answer":<0-based index of the correct option>}; ' +
  '{"type":"match","q":TEXT,"pairs":[{"l":TEXT,"r":TEXT}, ...]} for matching tasks (event ↔ year, person ↔ deed, civilisation ↔ achievement); ' +
  '{"type":"short","q":TEXT,"accept":["answer","other correct forms"]} for a name, place or term; ' +
  '{"type":"num","q":TEXT,"accept":["1789"],"tol":0} when the answer is a year AD or another number (years BC go to "mc" or "match"); ' +
  '{"type":"fix","q":TEXT (a statement with ONE factual mistake),"accept":["the corrected statement"],"key":"wrong → right"}; ' +
  '{"type":"open","q":TEXT} for "explain / compare / work with a source" tasks with no single answer. ' +
  'Use the terminology and the Ukrainian spelling of names from current Ukrainian school textbooks; write years BC as "776 р. до н. е." / "776 BC". ' +
  'In "accept" list common equal variants (with and without first name). ' +
  'For "mc", "answer" MUST be the 0-based index of the correct option; if the page does not mark it, use your history knowledge. ' +
  'Keep the original wording from the page. Do not invent exercises that are not on the page.';
