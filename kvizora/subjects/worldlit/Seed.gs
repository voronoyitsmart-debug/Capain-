/**
 * Seed.gs — WORLD LITERATURE (зарубіжна література). Everything that is special about this subject:
 * the ready-made tests, the AI prompt and which question types the editor offers.
 * Paste this as a SECOND script file (next to Code.gs), named "Seed".
 *
 * Every text a student sees (and the test's name) is written in two languages: { uk: '…', en: '…' }.
 * Accepted answers are shared, so they list the Ukrainian and the English forms together.
 * Names and titles follow the Ukrainian school programme «Зарубіжна література» (5–11 кл.)
 * and the usual Ukrainian translations; English uses the original or the standard English titles.
 *
 * Grading notes (core norm_): letter case, punctuation, «quotes» and the kind of apostrophe (' ’ ʼ)
 * are ignored, so a "fix" or "short" answer checks the words only.
 */

const SUBJECT = {
  key: 'worldlit',
  name: { uk: 'Зарубіжна література', en: 'World literature' },
  mode: 'switch',                                  // the student switches the whole test between УКР and EN
  qtypes: ['mc', 'match', 'fix', 'short', 'num', 'open'],   // question types the editor offers
  formulas: false                                  // no maths: $ signs stay plain text
};

/** Options written as two parallel lists → [{ uk, en }, …]. */
function litOpts_(uk, en) { return uk.map((u, i) => ({ uk: u, en: en[i] })); }

const LIT_MC = { uk: 'Частина 1 — Вибір відповіді', en: 'Part 1 — Multiple choice' };
const LIT_ONE = { uk: 'Оберіть одну правильну відповідь.', en: 'Choose one correct answer.' };
const LIT_MATCH = { uk: 'Частина 2 — Встановіть відповідність', en: 'Part 2 — Matching' };
const LIT_PICK = { uk: 'Для кожного рядка оберіть правильну відповідь зі списку.', en: 'For each line, choose the correct answer from the list.' };
const LIT_FIX = { uk: 'Частина 3 — Знайди й виправ помилку', en: 'Part 3 — Find and fix the mistake' };
const LIT_FIX_I = { uk: 'У кожному твердженні є одна помилка. Замініть одне слово, щоб твердження стало правильним.', en: 'Each statement has one mistake. Change one word to make it correct.' };
const LIT_SHORT = { uk: 'Частина 4 — Коротка відповідь', en: 'Part 4 — Short answer' };
const LIT_SHORT_I = { uk: 'Напишіть ім’я, назву або число.', en: 'Write a name, a title or a number.' };
const LIT_OPEN = { uk: 'Частина 5 — Поміркуйте', en: 'Part 5 — Think and write' };
const LIT_OPEN_I = { uk: 'Напишіть 3–5 речень.', en: 'Write 3–5 sentences.' };

/** Ready-made tests. The first one is opened right away on a fresh install; the others start as drafts. */
const SEED_TESTS = [
  // ---- Grades 5–6: fairy tales and adventure stories ----
  { title: { uk: 'Зарубіжна література 5–6 кл.: казки та пригоди', en: 'World literature Grades 5–6: Fairy tales and adventures' }, open: true, content: { langs: ['uk', 'en'], sections: [
    { title: LIT_MC, instructions: LIT_ONE, questions: [
      { type: 'mc', q: { uk: 'Хто написав казку «Снігова королева»?', en: 'Who wrote the fairy tale “The Snow Queen”?' },
        options: litOpts_(['Шарль Перро', 'Брати Грімм', 'Ганс Крістіан Андерсен', 'Льюїс Керролл'], ['Charles Perrault', 'The Brothers Grimm', 'Hans Christian Andersen', 'Lewis Carroll']), answer: 2 },
      { type: 'mc', q: { uk: 'Що потрапило Каєві в око й у серце в казці «Снігова королева»?', en: 'In “The Snow Queen”, what got into Kai’s eye and heart?' },
        options: litOpts_(['Сніжинка', 'Осколок чарівного дзеркала троля', 'Крижинка з палацу королеви', 'Порошинка з книжки'], ['A snowflake', 'A splinter of the troll’s magic mirror', 'A piece of ice from the queen’s palace', 'A speck of dust from a book']), answer: 1 },
      { type: 'mc', q: { uk: 'Яке значення має ім’я «Мауглі» мовою джунглів у творі Редьярда Кіплінга?', en: 'In Rudyard Kipling’s stories, what does the name “Mowgli” mean in the language of the jungle?' },
        options: litOpts_(['Жабеня', 'Вовченя', 'Мавпеня', 'Тигреня'], ['Little frog', 'Wolf cub', 'Little monkey', 'Tiger cub']), answer: 0 },
      { type: 'mc', q: { uk: 'Що Аліса побачила першим, перш ніж потрапити в Країну Див?', en: 'What did Alice see first, before she got into Wonderland?' },
        options: litOpts_(['Чеширського Кота на дереві', 'Білого Кролика з годинником', 'Капелюшника за столом', 'Королеву з картярами'], ['The Cheshire Cat in a tree', 'The White Rabbit with a watch', 'The Hatter at a table', 'The Queen with her playing cards']), answer: 1 },
      { type: 'mc', q: { uk: 'Яку роботу тітка Поллі доручила Томові Сойєру як покарання, а він зумів перетворити її на «привілей»?', en: 'What job did Aunt Polly give Tom Sawyer as a punishment, which he managed to turn into a “privilege”?' },
        options: litOpts_(['Прополоти город', 'Помити посуд', 'Побілити паркан', 'Наносити води'], ['Weed the garden', 'Wash the dishes', 'Whitewash the fence', 'Fetch water']), answer: 2 },
      { type: 'mc', q: { uk: 'На березі якої річки розташоване містечко, де живе Том Сойєр?', en: 'On which river is the little town where Tom Sawyer lives?' },
        options: litOpts_(['Міссісіпі', 'Темза', 'Дунай', 'Ніл'], ['The Mississippi', 'The Thames', 'The Danube', 'The Nile']), answer: 0 },
      { type: 'mc', q: { uk: 'Чим літературна казка відрізняється від народної?', en: 'How is a literary fairy tale different from a folk tale?' },
        options: litOpts_(['У ній немає чарів', 'Вона завжди написана віршами', 'Вона має відомого автора', 'Вона завжди коротша за народну'], ['It has no magic', 'It is always written in verse', 'It has a known author', 'It is always shorter than a folk tale']), answer: 2 }
    ] },
    { title: LIT_MATCH, instructions: LIT_PICK, questions: [
      { type: 'match', q: { uk: 'Доберіть до кожного автора його твір.', en: 'Match each author to their work.' },
        pairs: [
          { l: { uk: 'Ганс Крістіан Андерсен', en: 'Hans Christian Andersen' }, r: { uk: '«Снігова королева»', en: '“The Snow Queen”' } },
          { l: { uk: 'Редьярд Кіплінг', en: 'Rudyard Kipling' }, r: { uk: '«Мауглі» («Книга джунглів»)', en: '“Mowgli” (“The Jungle Book”)' } },
          { l: { uk: 'Льюїс Керролл', en: 'Lewis Carroll' }, r: { uk: '«Аліса в Країні Див»', en: '“Alice’s Adventures in Wonderland”' } },
          { l: { uk: 'Марк Твен', en: 'Mark Twain' }, r: { uk: '«Пригоди Тома Сойєра»', en: '“The Adventures of Tom Sawyer”' } },
          { l: { uk: 'Даніель Дефо', en: 'Daniel Defoe' }, r: { uk: '«Робінзон Крузо»', en: '“Robinson Crusoe”' } }
        ] },
      { type: 'match', q: { uk: 'Ким є кожен персонаж «Мауглі»?', en: 'Who is each character in the Mowgli stories?' },
        pairs: [
          { l: { uk: 'Багіра', en: 'Bagheera' }, r: { uk: 'Чорна пантера', en: 'A black panther' } },
          { l: { uk: 'Балу', en: 'Baloo' }, r: { uk: 'Ведмідь, учитель Закону Джунглів', en: 'A bear who teaches the Law of the Jungle' } },
          { l: { uk: 'Шер-Хан', en: 'Shere Khan' }, r: { uk: 'Тигр', en: 'A tiger' } },
          { l: { uk: 'Каа', en: 'Kaa' }, r: { uk: 'Пітон', en: 'A python' } },
          { l: { uk: 'Акела', en: 'Akela' }, r: { uk: 'Вовк, ватажок зграї', en: 'A wolf, leader of the pack' } }
        ] }
    ] },
    { title: LIT_FIX, instructions: LIT_FIX_I, questions: [
      { type: 'fix', q: { uk: 'Мауглі виховала зграя ведмедів.', en: 'Mowgli was raised by a pack of bears.' },
        accept: ['Мауглі виховала зграя вовків.', 'Mowgli was raised by a pack of wolves.'],
        key: 'ведмедів → вовків / bears → wolves' },
      { type: 'fix', q: { uk: 'Робінзон Крузо назвав свого друга Неділею.', en: 'Robinson Crusoe named his friend Sunday.' },
        accept: ['Робінзон Крузо назвав свого друга П’ятницею.', 'Robinson Crusoe named his friend Friday.'],
        key: 'Неділею → П’ятницею / Sunday → Friday' },
      { type: 'fix', q: { uk: 'Аліса потрапила в Країну Див через мишачу нору.', en: 'Alice got into Wonderland through a mouse hole.' },
        accept: ['Аліса потрапила в Країну Див через кролячу нору.', 'Alice got into Wonderland through a rabbit hole.'],
        key: 'мишачу → кролячу / mouse → rabbit' }
    ] },
    { title: LIT_SHORT, instructions: LIT_SHORT_I, questions: [
      { type: 'short', q: { uk: 'Як звали дівчинку, яка вирушила рятувати Кая?', en: 'What was the name of the girl who set off to rescue Kai?' },
        accept: ['Герда', 'Gerda'] },
      { type: 'short', q: { uk: 'Який персонаж «Аліси в Країні Див» умів зникати так, що залишалася тільки усмішка?', en: 'Which character in “Alice’s Adventures in Wonderland” could vanish so that only his grin remained?' },
        accept: ['Чеширський Кіт', 'Чеширський кот', 'Кіт', 'Cheshire Cat', 'The Cheshire Cat', 'Cat'] },
      { type: 'num', q: { uk: 'Скільки років Робінзон Крузо прожив на безлюдному острові? (повних років)', en: 'How many years did Robinson Crusoe live on the desert island? (whole years)' },
        accept: ['28'], tol: 0 }
    ] },
    { title: LIT_OPEN, instructions: LIT_OPEN_I, questions: [
      { type: 'open', q: { uk: 'Яка риса характеру допомогла Герді врятувати Кая? Поясніть свою думку прикладом з казки.', en: 'Which trait of character helped Gerda rescue Kai? Explain your opinion with an example from the tale.' } }
    ] }
  ] } },

  // ---- Grade 8: Antiquity and the Renaissance ----
  { title: { uk: 'Зарубіжна література 8 кл.: Античність і Відродження', en: 'World literature Grade 8: Antiquity and the Renaissance' }, folder: '', open: false, minutes: 30, content: { langs: ['uk', 'en'], sections: [
    { title: LIT_MC, instructions: LIT_ONE, questions: [
      { type: 'mc', q: { uk: 'Про яку подію розповідає поема Гомера «Іліада»?', en: 'Which event does Homer’s poem “The Iliad” tell about?' },
        options: litOpts_(['Похід аргонавтів', 'Троянську війну', 'Подвиги Геракла', 'Заснування Риму'], ['The voyage of the Argonauts', 'The Trojan War', 'The labours of Heracles', 'The founding of Rome']), answer: 1 },
      { type: 'mc', q: { uk: 'Яким віршовим розміром написані поеми Гомера?', en: 'In which metre are Homer’s poems written?' },
        options: litOpts_(['Ямбом', 'Хореєм', 'Гекзаметром', 'Верлібром'], ['Iambic metre', 'Trochaic metre', 'Dactylic hexameter', 'Free verse']), answer: 2 },
      { type: 'mc', q: { uk: 'Якого циклопа осліпив Одіссей?', en: 'Which Cyclops did Odysseus blind?' },
        options: litOpts_(['Поліфема', 'Гектора', 'Пріама', 'Ахілла'], ['Polyphemus', 'Hector', 'Priam', 'Achilles']), answer: 0 },
      { type: 'mc', q: { uk: 'У якому місті відбувається дія трагедії Вільяма Шекспіра «Ромео і Джульєтта»?', en: 'In which city is William Shakespeare’s tragedy “Romeo and Juliet” set?' },
        options: litOpts_(['Венеція', 'Флоренція', 'Лондон', 'Верона'], ['Venice', 'Florence', 'London', 'Verona']), answer: 3 },
      { type: 'mc', q: { uk: 'Хто таємно повінчав Ромео і Джульєтту?', en: 'Who secretly married Romeo and Juliet?' },
        options: litOpts_(['Меркуціо', 'Брат Лоренцо', 'Годувальниця', 'Тібальт'], ['Mercutio', 'Friar Laurence', 'The Nurse', 'Tybalt']), answer: 1 },
      { type: 'mc', q: { uk: 'З чим бився Дон Кіхот, вважаючи їх велетнями?', en: 'What did Don Quixote fight, believing they were giants?' },
        options: litOpts_(['З вітряками', 'З баранами', 'З млинарями', 'З деревами'], ['Windmills', 'Rams', 'Millers', 'Trees']), answer: 0 },
      { type: 'mc', q: { uk: 'Хто був провідником Данте в Пеклі й Чистилищі в «Божественній комедії»?', en: 'Who was Dante’s guide through Hell and Purgatory in “The Divine Comedy”?' },
        options: litOpts_(['Гомер', 'Петрарка', 'Вергілій', 'Беатріче'], ['Homer', 'Petrarch', 'Virgil', 'Beatrice']), answer: 2 }
    ] },
    { title: LIT_MATCH, instructions: LIT_PICK, questions: [
      { type: 'match', q: { uk: 'Доберіть до кожного автора його країну.', en: 'Match each author to their country.' },
        pairs: [
          { l: { uk: 'Гомер', en: 'Homer' }, r: { uk: 'Давня Греція', en: 'Ancient Greece' } },
          { l: { uk: 'Данте Аліг’єрі', en: 'Dante Alighieri' }, r: { uk: 'Італія', en: 'Italy' } },
          { l: { uk: 'Вільям Шекспір', en: 'William Shakespeare' }, r: { uk: 'Англія', en: 'England' } },
          { l: { uk: 'Мігель де Сервантес', en: 'Miguel de Cervantes' }, r: { uk: 'Іспанія', en: 'Spain' } }
        ] },
      { type: 'match', q: { uk: 'З якого твору кожен персонаж?', en: 'Which work is each character from?' },
        pairs: [
          { l: { uk: 'Пенелопа', en: 'Penelope' }, r: { uk: '«Одіссея»', en: '“The Odyssey”' } },
          { l: { uk: 'Гектор', en: 'Hector' }, r: { uk: '«Іліада»', en: '“The Iliad”' } },
          { l: { uk: 'Меркуціо', en: 'Mercutio' }, r: { uk: '«Ромео і Джульєтта»', en: '“Romeo and Juliet”' } },
          { l: { uk: 'Санчо Панса', en: 'Sancho Panza' }, r: { uk: '«Дон Кіхот»', en: '“Don Quixote”' } },
          { l: { uk: 'Беатріче', en: 'Beatrice' }, r: { uk: '«Божественна комедія»', en: '“The Divine Comedy”' } }
        ] }
    ] },
    { title: LIT_FIX, instructions: LIT_FIX_I, questions: [
      { type: 'fix', q: { uk: 'Ромео належав до роду Капулетті.', en: 'Romeo belonged to the Capulet family.' },
        accept: ['Ромео належав до роду Монтеккі.', 'Romeo belonged to the Montague family.'],
        key: 'Капулетті → Монтеккі / Capulet → Montague' },
      { type: 'fix', q: { uk: 'Одіссей повертався додому на острів Крит.', en: 'Odysseus was returning home to the island of Crete.' },
        accept: ['Одіссей повертався додому на острів Ітаку.', 'Одіссей повертався додому на острів Ітака.', 'Odysseus was returning home to the island of Ithaca.'],
        key: 'Крит → Ітаку / Crete → Ithaca' },
      { type: 'fix', q: { uk: 'Коня Дон Кіхота звали Буцефал.', en: 'Don Quixote’s horse was called Bucephalus.' },
        accept: ['Коня Дон Кіхота звали Росінант.', 'Don Quixote’s horse was called Rocinante.', 'Don Quixote’s horse was called Rosinante.'],
        key: 'Буцефал → Росінант / Bucephalus → Rocinante' }
    ] },
    { title: LIT_SHORT, instructions: LIT_SHORT_I, questions: [
      { type: 'short', q: { uk: 'Як звали дружину Одіссея, яка двадцять років чекала на нього?', en: 'What was the name of Odysseus’s wife, who waited twenty years for him?' },
        accept: ['Пенелопа', 'Penelope'] },
      { type: 'short', q: { uk: 'Як звали даму серця Дон Кіхота?', en: 'What was the name of Don Quixote’s lady love?' },
        accept: ['Дульсінея Тобоська', 'Дульсінея', 'Dulcinea del Toboso', 'Dulcinea'] },
      { type: 'num', q: { uk: 'Скільки рядків має сонет?', en: 'How many lines does a sonnet have?' },
        accept: ['14'], tol: 0 }
    ] },
    { title: LIT_OPEN, instructions: LIT_OPEN_I, questions: [
      { type: 'open', q: { uk: 'Чому образ Дон Кіхота називають «вічним»? Чи бувають «донкіхоти» сьогодні?', en: 'Why is Don Quixote called an “eternal” character? Are there “Don Quixotes” today?' } }
    ] }
  ] } },

  // ---- Grade 11: literature of the 20th century ----
  { title: { uk: 'Зарубіжна література 11 кл.: література XX століття', en: 'World literature Grade 11: Literature of the 20th century' }, folder: '', open: false, minutes: 30, content: { langs: ['uk', 'en'], sections: [
    { title: LIT_MC, instructions: LIT_ONE, questions: [
      { type: 'mc', q: { uk: 'На кого перетворився Грегор Замза в новелі Франца Кафки «Перевтілення»?', en: 'What did Gregor Samsa turn into in Franz Kafka’s “The Metamorphosis”?' },
        options: litOpts_(['На птаха', 'На величезну комаху', 'На собаку', 'На камінь'], ['A bird', 'A huge insect', 'A dog', 'A stone']), answer: 1 },
      { type: 'mc', q: { uk: 'Яку рибу спіймав старий Сантьяго в повісті Ернеста Хемінгуея «Старий і море»?', en: 'Which fish did old Santiago catch in Ernest Hemingway’s “The Old Man and the Sea”?' },
        options: litOpts_(['Акулу', 'Тунця', 'Марліна', 'Кита'], ['A shark', 'A tuna', 'A marlin', 'A whale']), answer: 2 },
      { type: 'mc', q: { uk: 'Як називають творчий принцип Хемінгуея, за яким головне залишається «під водою», у підтексті?', en: 'What is Hemingway’s principle of writing in which the main meaning stays “under water”, in the subtext, called?' },
        options: litOpts_(['Принцип айсберга', 'Потік свідомості', 'Магічний реалізм', 'Епічний театр'], ['The iceberg theory', 'Stream of consciousness', 'Magic realism', 'Epic theatre']), answer: 0 },
      { type: 'mc', q: { uk: 'Про яку війну розповідає роман Еріха Марії Ремарка «На Західному фронті без змін»?', en: 'Which war does Erich Maria Remarque’s novel “All Quiet on the Western Front” tell about?' },
        options: litOpts_(['Першу світову', 'Другу світову', 'Громадянську війну в США', 'Наполеонівські війни'], ['The First World War', 'The Second World War', 'The American Civil War', 'The Napoleonic Wars']), answer: 0 },
      { type: 'mc', q: { uk: 'До якого жанру належить роман Джорджа Орвелла «1984»?', en: 'Which genre does George Orwell’s novel “Nineteen Eighty-Four” belong to?' },
        options: litOpts_(['Утопія', 'Антиутопія', 'Детектив', 'Лицарський роман'], ['Utopia', 'Dystopia', 'Detective story', 'Chivalric romance']), answer: 1 },
      { type: 'mc', q: { uk: 'Для видання якого свого твору українською мовою (1947) Джордж Орвелл написав спеціальну передмову?', en: 'For the Ukrainian edition (1947) of which of his works did George Orwell write a special preface?' },
        options: litOpts_(['«1984»', '«Колгосп тварин»', '«Данина Каталонії»', '«Фунти лиха в Парижі і Лондоні»'], ['“Nineteen Eighty-Four”', '“Animal Farm”', '“Homage to Catalonia”', '“Down and Out in Paris and London”']), answer: 1 },
      { type: 'mc', q: { uk: 'Який художній метод характерний для оповідання Габріеля Гарсіа Маркеса «Стариган з крилами»?', en: 'Which literary method is typical of Gabriel García Márquez’s story “A Very Old Man with Enormous Wings”?' },
        options: litOpts_(['Класицизм', 'Сентименталізм', 'Магічний реалізм', 'Натуралізм'], ['Classicism', 'Sentimentalism', 'Magic realism', 'Naturalism']), answer: 2 }
    ] },
    { title: LIT_MATCH, instructions: LIT_PICK, questions: [
      { type: 'match', q: { uk: 'Доберіть до кожного автора його твір.', en: 'Match each author to their work.' },
        pairs: [
          { l: { uk: 'Франц Кафка', en: 'Franz Kafka' }, r: { uk: '«Перевтілення»', en: '“The Metamorphosis”' } },
          { l: { uk: 'Ернест Хемінгуей', en: 'Ernest Hemingway' }, r: { uk: '«Старий і море»', en: '“The Old Man and the Sea”' } },
          { l: { uk: 'Еріх Марія Ремарк', en: 'Erich Maria Remarque' }, r: { uk: '«На Західному фронті без змін»', en: '“All Quiet on the Western Front”' } },
          { l: { uk: 'Джордж Орвелл', en: 'George Orwell' }, r: { uk: '«1984»', en: '“Nineteen Eighty-Four”' } },
          { l: { uk: 'Альбер Камю', en: 'Albert Camus' }, r: { uk: '«Чума»', en: '“The Plague”' } }
        ] },
      { type: 'match', q: { uk: 'З якого твору кожен персонаж?', en: 'Which work is each character from?' },
        pairs: [
          { l: { uk: 'Грегор Замза', en: 'Gregor Samsa' }, r: { uk: '«Перевтілення»', en: '“The Metamorphosis”' } },
          { l: { uk: 'Манолін', en: 'Manolin' }, r: { uk: '«Старий і море»', en: '“The Old Man and the Sea”' } },
          { l: { uk: 'Пауль Боймер', en: 'Paul Bäumer' }, r: { uk: '«На Західному фронті без змін»', en: '“All Quiet on the Western Front”' } },
          { l: { uk: 'Вінстон Сміт', en: 'Winston Smith' }, r: { uk: '«1984»', en: '“Nineteen Eighty-Four”' } },
          { l: { uk: 'Доктор Ріє', en: 'Doctor Rieux' }, r: { uk: '«Чума»', en: '“The Plague”' } }
        ] }
    ] },
    { title: LIT_FIX, instructions: LIT_FIX_I, questions: [
      { type: 'fix', q: { uk: 'Дія роману «Чума» відбувається в місті Париж.', en: 'The novel “The Plague” is set in the city of Paris.' },
        accept: ['Дія роману «Чума» відбувається в місті Оран.', 'The novel “The Plague” is set in the city of Oran.'],
        key: 'Париж → Оран / Paris → Oran' },
      { type: 'fix', q: { uk: 'Старий Сантьяго був кубинським мисливцем.', en: 'Old Santiago was a Cuban hunter.' },
        accept: ['Старий Сантьяго був кубинським рибалкою.', 'Old Santiago was a Cuban fisherman.'],
        key: 'мисливцем → рибалкою / hunter → fisherman' },
      { type: 'fix', q: { uk: 'Перед перевтіленням Грегор Замза працював лікарем.', en: 'Before his metamorphosis, Gregor Samsa worked as a doctor.' },
        accept: ['Перед перевтіленням Грегор Замза працював комівояжером.', 'Before his metamorphosis, Gregor Samsa worked as a travelling salesman.', 'Before his metamorphosis, Gregor Samsa worked as a traveling salesman.', 'Before his metamorphosis, Gregor Samsa worked as a salesman.'],
        key: 'лікарем → комівояжером / doctor → travelling salesman' }
    ] },
    { title: LIT_SHORT, instructions: LIT_SHORT_I, questions: [
      { type: 'short', q: { uk: 'Хто в романі «1984» «стежить за тобою» з усіх плакатів?', en: 'In “Nineteen Eighty-Four”, who is “watching you” from every poster?' },
        accept: ['Старший Брат', 'Великий Брат', 'Big Brother'] },
      { type: 'short', q: { uk: 'Як називають покоління молодих людей, скалічених Першою світовою війною, про яке писали Ремарк і Хемінгуей?', en: 'What is the generation of young people crippled by the First World War, which Remarque and Hemingway wrote about, called?' },
        accept: ['втрачене покоління', 'загублене покоління', 'lost generation', 'the lost generation'] },
      { type: 'num', q: { uk: 'У якому році Ернест Хемінгуей отримав Нобелівську премію з літератури?', en: 'In which year did Ernest Hemingway receive the Nobel Prize in Literature?' },
        accept: ['1954'], tol: 0 }
    ] },
    { title: LIT_OPEN, instructions: LIT_OPEN_I, questions: [
      { type: 'open', q: { uk: '«Людину можна знищити, але її не можна перемогти». Як ці слова Сантьяго розкривають головну думку повісті «Старий і море»?', en: '“A man can be destroyed but not defeated.” How do Santiago’s words reveal the main idea of “The Old Man and the Sea”?' } }
    ] }
  ] } }
];

// ---------- AI: photo(s) → world literature test content ----------
// Code.gs adds the rules for the two languages after this text.
const AI_INSTRUCTIONS =
  'You convert a photo of a printed school WORLD LITERATURE (зарубіжна література) test or worksheet page into structured JSON. ' +
  'Read every exercise on the page. Return ONLY JSON (no markdown fences, no commentary) shaped as: ' +
  '{"title": string, "sections": [{"title": TEXT, "instructions": TEXT, "questions": [Q, ...]}]}. ' +
  'Each Q is one of: ' +
  '{"type":"mc","q":TEXT,"options":[TEXT, TEXT, ...],"answer":<0-based index of the correct option>}; ' +
  '{"type":"fix","q":TEXT (a statement that contains ONE factual mistake),"accept":["the corrected statement in Ukrainian","the corrected statement in English"],"key":"what was wrong"}; ' +
  '{"type":"short","q":TEXT,"accept":["answer in Ukrainian","answer in English","common variants"]} for a short answer (an author, a character, a title, a literary term); ' +
  '{"type":"num","q":TEXT,"accept":["14"],"tol":0} when the answer is a number (a year, a count); ' +
  '{"type":"match","q":TEXT,"pairs":[{"l":TEXT,"r":TEXT}, ...]} for matching tasks (author ↔ work, character ↔ work, term ↔ definition, quotation ↔ character): each pair is a left item and its correct right item; ' +
  '{"type":"open","q":TEXT} for "explain / describe / compare / write your opinion" questions with no single answer. ' +
  'NAMES: write authors, characters and titles as in Ukrainian school translations for Ukrainian (Ганс Крістіан Андерсен, «Ромео і Джульєтта»), ' +
  'and with the original or standard English names and titles for English (Hans Christian Andersen, “Romeo and Juliet”). ' +
  'ANSWERS: "accept" is shared by both languages, so always list both the Ukrainian and the English forms, plus short forms (a first name alone, a surname alone) when they are clearly correct. ' +
  'For "mc", "answer" MUST be the 0-based index of the correct option; if the page does not mark it, use your knowledge of the work. ' +
  'Keep the original wording from the page. Do not invent exercises that are not on the page.';
