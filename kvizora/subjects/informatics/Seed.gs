/**
 * Seed.gs — INFORMATICS (Інформатика). Everything that is special about this subject:
 * the ready-made tests, the AI prompt and which question types the editor offers.
 * Paste this as a SECOND script file (next to Code.gs), named "Seed".
 *
 * Every text a student sees (and the test's name) is written in two languages: { uk: '…', en: '…' }.
 * Accepted answers are shared, so they list the Ukrainian and the English forms together.
 * Program code is shown as plain text (one line, statements split by "; ") or, when it needs
 * indentation, as a small inline SVG picture of the listing (INF_CODE_* below).
 * Number bases are written with Unicode subscripts: 1011₂, 25₁₀, FF₁₆. 1 Кбайт = 1024 байти (as in Ukrainian textbooks).
 */

const SUBJECT = {
  key: 'informatics',
  name: { uk: 'Інформатика', en: 'Computer Science' },
  mode: 'switch',                                       // the student switches the whole test between УКР and EN
  qtypes: ['mc', 'match', 'num', 'short', 'open'],      // question types the editor offers
  formulas: false                                       // no LaTeX: code is full of characters KaTeX would misread
};

/** Options written as two parallel lists → [{ uk, en }, …]. */
function infOpts_(uk, en) { return uk.map((u, i) => ({ uk: u, en: en[i] })); }

/** Python listings drawn as pictures (indentation matters). Drawn for these tests. */
// s = 0 / for i in range(1, 5): / s = s + i / print(s)
const INF_CODE_LOOP = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNzUiIGhlaWdodD0iMTE2IiB2aWV3Qm94PSIwIDAgMjc1IDExNiIgZm9udC1mYW1pbHk9IkNvbnNvbGFzLE1lbmxvLG1vbm9zcGFjZSIgZm9udC1zaXplPSIxNyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgcng9IjgiIGZpbGw9IiNmNmY4ZmEiIHN0cm9rZT0iI2QwZDdkZSIvPjx0ZXh0IHg9IjEyIiB5PSIyNiIgZmlsbD0iIzhjOTU5ZiIgZm9udC1zaXplPSIxMyI+MTwvdGV4dD48dGV4dCB4PSIzNCIgeT0iMjYiIGZpbGw9IiMxZjIzMjgiIHhtbDpzcGFjZT0icHJlc2VydmUiPnMgPSAwPC90ZXh0Pjx0ZXh0IHg9IjEyIiB5PSI1MCIgZmlsbD0iIzhjOTU5ZiIgZm9udC1zaXplPSIxMyI+MjwvdGV4dD48dGV4dCB4PSIzNCIgeT0iNTAiIGZpbGw9IiMxZjIzMjgiIHhtbDpzcGFjZT0icHJlc2VydmUiPmZvciBpIGluIHJhbmdlKDEsIDUpOjwvdGV4dD48dGV4dCB4PSIxMiIgeT0iNzQiIGZpbGw9IiM4Yzk1OWYiIGZvbnQtc2l6ZT0iMTMiPjM8L3RleHQ+PHRleHQgeD0iMzQiIHk9Ijc0IiBmaWxsPSIjMWYyMzI4IiB4bWw6c3BhY2U9InByZXNlcnZlIj4gICAgcyA9IHMgKyBpPC90ZXh0Pjx0ZXh0IHg9IjEyIiB5PSI5OCIgZmlsbD0iIzhjOTU5ZiIgZm9udC1zaXplPSIxMyI+NDwvdGV4dD48dGV4dCB4PSIzNCIgeT0iOTgiIGZpbGw9IiMxZjIzMjgiIHhtbDpzcGFjZT0icHJlc2VydmUiPnByaW50KHMpPC90ZXh0Pjwvc3ZnPg==';
// x = int(input()) / if x % 2 == 0: / print("even") / else: / print("odd")
const INF_CODE_IF = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMzMiIGhlaWdodD0iMTQwIiB2aWV3Qm94PSIwIDAgMjMzIDE0MCIgZm9udC1mYW1pbHk9IkNvbnNvbGFzLE1lbmxvLG1vbm9zcGFjZSIgZm9udC1zaXplPSIxNyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgcng9IjgiIGZpbGw9IiNmNmY4ZmEiIHN0cm9rZT0iI2QwZDdkZSIvPjx0ZXh0IHg9IjEyIiB5PSIyNiIgZmlsbD0iIzhjOTU5ZiIgZm9udC1zaXplPSIxMyI+MTwvdGV4dD48dGV4dCB4PSIzNCIgeT0iMjYiIGZpbGw9IiMxZjIzMjgiIHhtbDpzcGFjZT0icHJlc2VydmUiPnggPSBpbnQoaW5wdXQoKSk8L3RleHQ+PHRleHQgeD0iMTIiIHk9IjUwIiBmaWxsPSIjOGM5NTlmIiBmb250LXNpemU9IjEzIj4yPC90ZXh0Pjx0ZXh0IHg9IjM0IiB5PSI1MCIgZmlsbD0iIzFmMjMyOCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+aWYgeCAlIDIgPT0gMDo8L3RleHQ+PHRleHQgeD0iMTIiIHk9Ijc0IiBmaWxsPSIjOGM5NTlmIiBmb250LXNpemU9IjEzIj4zPC90ZXh0Pjx0ZXh0IHg9IjM0IiB5PSI3NCIgZmlsbD0iIzFmMjMyOCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+ICAgIHByaW50KCJldmVuIik8L3RleHQ+PHRleHQgeD0iMTIiIHk9Ijk4IiBmaWxsPSIjOGM5NTlmIiBmb250LXNpemU9IjEzIj40PC90ZXh0Pjx0ZXh0IHg9IjM0IiB5PSI5OCIgZmlsbD0iIzFmMjMyOCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+ZWxzZTo8L3RleHQ+PHRleHQgeD0iMTIiIHk9IjEyMiIgZmlsbD0iIzhjOTU5ZiIgZm9udC1zaXplPSIxMyI+NTwvdGV4dD48dGV4dCB4PSIzNCIgeT0iMTIyIiBmaWxsPSIjMWYyMzI4IiB4bWw6c3BhY2U9InByZXNlcnZlIj4gICAgcHJpbnQoIm9kZCIpPC90ZXh0Pjwvc3ZnPg==';
// n = 1 / k = 0 / while n < 50: / n = n * 3 / k = k + 1 / print(k)
const INF_CODE_WHILE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOTAiIGhlaWdodD0iMTY0IiB2aWV3Qm94PSIwIDAgMTkwIDE2NCIgZm9udC1mYW1pbHk9IkNvbnNvbGFzLE1lbmxvLG1vbm9zcGFjZSIgZm9udC1zaXplPSIxNyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgcng9IjgiIGZpbGw9IiNmNmY4ZmEiIHN0cm9rZT0iI2QwZDdkZSIvPjx0ZXh0IHg9IjEyIiB5PSIyNiIgZmlsbD0iIzhjOTU5ZiIgZm9udC1zaXplPSIxMyI+MTwvdGV4dD48dGV4dCB4PSIzNCIgeT0iMjYiIGZpbGw9IiMxZjIzMjgiIHhtbDpzcGFjZT0icHJlc2VydmUiPm4gPSAxPC90ZXh0Pjx0ZXh0IHg9IjEyIiB5PSI1MCIgZmlsbD0iIzhjOTU5ZiIgZm9udC1zaXplPSIxMyI+MjwvdGV4dD48dGV4dCB4PSIzNCIgeT0iNTAiIGZpbGw9IiMxZjIzMjgiIHhtbDpzcGFjZT0icHJlc2VydmUiPmsgPSAwPC90ZXh0Pjx0ZXh0IHg9IjEyIiB5PSI3NCIgZmlsbD0iIzhjOTU5ZiIgZm9udC1zaXplPSIxMyI+MzwvdGV4dD48dGV4dCB4PSIzNCIgeT0iNzQiIGZpbGw9IiMxZjIzMjgiIHhtbDpzcGFjZT0icHJlc2VydmUiPndoaWxlIG4gJmx0OyA1MDo8L3RleHQ+PHRleHQgeD0iMTIiIHk9Ijk4IiBmaWxsPSIjOGM5NTlmIiBmb250LXNpemU9IjEzIj40PC90ZXh0Pjx0ZXh0IHg9IjM0IiB5PSI5OCIgZmlsbD0iIzFmMjMyOCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+ICAgIG4gPSBuICogMzwvdGV4dD48dGV4dCB4PSIxMiIgeT0iMTIyIiBmaWxsPSIjOGM5NTlmIiBmb250LXNpemU9IjEzIj41PC90ZXh0Pjx0ZXh0IHg9IjM0IiB5PSIxMjIiIGZpbGw9IiMxZjIzMjgiIHhtbDpzcGFjZT0icHJlc2VydmUiPiAgICBrID0gayArIDE8L3RleHQ+PHRleHQgeD0iMTIiIHk9IjE0NiIgZmlsbD0iIzhjOTU5ZiIgZm9udC1zaXplPSIxMyI+NjwvdGV4dD48dGV4dCB4PSIzNCIgeT0iMTQ2IiBmaWxsPSIjMWYyMzI4IiB4bWw6c3BhY2U9InByZXNlcnZlIj5wcmludChrKTwvdGV4dD48L3N2Zz4=';

const INF_MC = { uk: 'Частина 1 — Вибір відповіді', en: 'Part 1 — Multiple choice' };
const INF_ONE = { uk: 'Оберіть одну правильну відповідь.', en: 'Choose one correct answer.' };
const INF_PICK = { uk: 'Для кожного рядка оберіть відповідь зі списку.', en: 'For each line, choose the answer from the list.' };
const INF_OPEN = { uk: 'Напишіть повну відповідь. Ці завдання вчитель перевіряє сам.', en: 'Write a full answer. Your teacher marks these.' };

/**
 * Ready-made tests (Ukrainian НУШ informatics programme):
 * 5 клас — information, the computer, files and online safety (opened right away on a fresh install);
 * 7 клас — algorithms and Python; 8 клас — number systems, units of information, logic (drafts).
 */
const SEED_TESTS = [
  { title: { uk: 'Інформатика, 5 клас — Інформація, комп’ютер, безпека', en: 'Computer Science, Grade 5 — Information, the Computer, Safety' }, folder: '5 клас', open: true, content: { langs: ['uk', 'en'], sections: [
    { title: INF_MC, instructions: INF_ONE, questions: [
      { type: 'mc', q: { uk: 'Який пристрій призначений для введення даних у комп’ютер?', en: 'Which device is used to enter data into a computer?' },
        options: infOpts_(['Монітор', 'Клавіатура', 'Принтер', 'Колонки'], ['Monitor', 'Keyboard', 'Printer', 'Speakers']), answer: 1 },
      { type: 'mc', q: { uk: 'Який пристрій опрацьовує дані та виконує команди програм?', en: 'Which device processes data and carries out program instructions?' },
        options: infOpts_(['Процесор', 'Миша', 'Сканер', 'Навушники'], ['Processor (CPU)', 'Mouse', 'Scanner', 'Headphones']), answer: 0 },
      { type: 'mc', q: { uk: 'Що з переліченого — розширення імені файлу?', en: 'Which of these is a file name extension?' },
        options: ['.docx', 'C:\\', 'Документи / Documents', 'www'], answer: 0 },
      { type: 'mc', q: { uk: 'Який пароль найнадійніший?', en: 'Which password is the strongest?' },
        options: ['12345678', 'qwerty', 'Olena2014', 'k7#Rm!q2Vz'], answer: 3 },
      { type: 'mc', q: { uk: 'Вам прийшов лист: «Ви виграли телефон! Введіть пароль від пошти за посиланням». Що треба зробити?', en: 'You get a message: “You won a phone! Enter your e-mail password at this link.” What should you do?' },
        options: infOpts_(['Перейти за посиланням і ввести пароль', 'Переслати лист друзям', 'Не переходити за посиланням і сказати дорослим', 'Відповісти й попросити приз швидше'],
          ['Follow the link and enter the password', 'Forward the message to friends', 'Not follow the link and tell an adult', 'Reply and ask for the prize sooner']), answer: 2 },
      { type: 'mc', q: { uk: 'Яка інформація подана у звуковій формі?', en: 'Which information is presented as sound?' },
        options: infOpts_(['Фотографія', 'Пісня', 'Текст у книжці', 'Карта'], ['A photo', 'A song', 'Text in a book', 'A map']), answer: 1 }
    ] },
    { title: { uk: 'Частина 2 — Встановіть відповідність', en: 'Part 2 — Matching' }, instructions: INF_PICK, questions: [
      { type: 'match', q: { uk: 'Пристрій → для чого він.', en: 'Device → what it is for.' }, pairs: [
        { l: { uk: 'Клавіатура', en: 'Keyboard' }, r: { uk: 'введення даних', en: 'input' } },
        { l: { uk: 'Монітор', en: 'Monitor' }, r: { uk: 'виведення даних', en: 'output' } },
        { l: { uk: 'Флешка', en: 'USB flash drive' }, r: { uk: 'зберігання даних', en: 'storage' } },
        { l: { uk: 'Процесор', en: 'Processor (CPU)' }, r: { uk: 'опрацювання даних', en: 'processing' } }
      ] },
      { type: 'match', q: { uk: 'Розширення файлу → що в ньому зберігається.', en: 'File extension → what the file holds.' }, pairs: [
        { l: '.mp3', r: { uk: 'звук', en: 'sound' } },
        { l: '.jpg', r: { uk: 'зображення', en: 'picture' } },
        { l: '.txt', r: { uk: 'текст', en: 'text' } },
        { l: '.mp4', r: { uk: 'відео', en: 'video' } }
      ] }
    ] },
    { title: { uk: 'Частина 3 — Коротка відповідь', en: 'Part 3 — Short answer' },
      instructions: { uk: 'Напишіть одне слово або число (українською чи англійською).', en: 'Write one word or a number (in English or Ukrainian).' }, questions: [
      { type: 'short', q: { uk: 'Як називається найменша одиниця вимірювання кількості інформації?', en: 'What is the smallest unit for measuring an amount of information?' },
        accept: ['біт', 'bit', '1 біт', '1 bit'] },
      { type: 'num', q: { uk: 'Скільки бітів в 1 байті?', en: 'How many bits are there in 1 byte?' }, accept: ['8'], tol: 0 },
      { type: 'short', q: { uk: 'Як називають місце на диску, де зберігаються файли та інші папки? (одне слово)', en: 'What do we call the place on a disk that holds files and other folders? (one word)' },
        accept: ['папка', 'тека', 'каталог', 'директорія', 'folder', 'directory'] }
    ] },
    { title: { uk: 'Частина 4 — Поясніть', en: 'Part 4 — Explain' }, instructions: INF_OPEN, questions: [
      { type: 'open', q: { uk: 'Напишіть три правила безпечної поведінки в інтернеті й поясніть, навіщо кожне з них.', en: 'Write three rules for staying safe online and explain why each one matters.' } }
    ] }
  ] } },

  { title: { uk: 'Інформатика, 7 клас — Алгоритми і Python', en: 'Computer Science, Grade 7 — Algorithms and Python' }, folder: '7 клас', open: false, minutes: 30, content: { langs: ['uk', 'en'], sections: [
    { title: INF_MC, instructions: INF_ONE, questions: [
      { type: 'mc', q: { uk: 'Алгоритм — це…', en: 'An algorithm is…' },
        options: infOpts_(['скінченна послідовність команд, що веде до результату', 'будь-яка програма для малювання', 'пристрій для виведення даних', 'набір файлів на диску'],
          ['a finite sequence of instructions that leads to a result', 'any drawing program', 'an output device', 'a set of files on a disk']), answer: 0 },
      { type: 'mc', q: { uk: 'Алгоритм, у якому залежно від умови виконується одна з двох гілок, називається…', en: 'An algorithm in which one of two branches runs depending on a condition is called…' },
        options: infOpts_(['лінійним', 'з розгалуженням', 'циклічним', 'допоміжним'], ['linear', 'branching', 'looping', 'auxiliary']), answer: 1 },
      { type: 'mc', q: { uk: 'Що виведе програма? print(2 + 3 * 4)', en: 'What does the program print? print(2 + 3 * 4)' },
        options: ['20', '14', '24', '2 + 3 * 4'], answer: 1 },
      { type: 'mc', q: { uk: 'Що виведе програма? print("2" + "3")', en: 'What does the program print? print("2" + "3")' },
        options: ['5', '23', '"2" + "3"', { uk: 'помилку', en: 'an error' }], answer: 1 },
      { type: 'mc', q: { uk: 'Яким знаком у Python перевіряють, чи дорівнюють два значення одне одному?', en: 'Which operator checks in Python whether two values are equal?' },
        options: ['=', '==', '!=', '=>'], answer: 1 },
      { type: 'mc', img: INF_CODE_IF, q: { uk: 'Користувач увів 7. Що виведе програма на рисунку?', en: 'The user types 7. What does the program in the picture print?' },
        options: ['even', 'odd', '7', { uk: 'нічого', en: 'nothing' }], answer: 1 }
    ] },
    { title: { uk: 'Частина 2 — Що виведе програма?', en: 'Part 2 — What does the program print?' },
      instructions: { uk: 'Виконайте програму подумки й введіть лише число, яке вона виведе.', en: 'Run the program in your head and type only the number it prints.' }, questions: [
      { type: 'num', q: { uk: 'x = 5; x = x * 2 + 1; print(x)', en: 'x = 5; x = x * 2 + 1; print(x)' }, accept: ['11'], tol: 0 },
      { type: 'num', q: { uk: 'print(17 // 5)', en: 'print(17 // 5)' }, note: { uk: '// — цілочисельне ділення.', en: '// is integer (floor) division.' }, accept: ['3'], tol: 0 },
      { type: 'num', q: { uk: 'print(17 % 5)', en: 'print(17 % 5)' }, note: { uk: '% — остача від ділення.', en: '% is the remainder.' }, accept: ['2'], tol: 0 },
      { type: 'num', q: { uk: 'print(len("Kvizora"))', en: 'print(len("Kvizora"))' }, accept: ['7'], tol: 0 },
      { type: 'num', img: INF_CODE_LOOP, q: { uk: 'Що виведе програма на рисунку?', en: 'What does the program in the picture print?' }, accept: ['10'], tol: 0 },
      { type: 'num', img: INF_CODE_WHILE, q: { uk: 'Скільки разів виконається тіло циклу, тобто що виведе програма на рисунку?', en: 'How many times does the loop body run, i.e. what does the program in the picture print?' }, accept: ['4'], tol: 0 }
    ] },
    { title: { uk: 'Частина 3 — Команди Python', en: 'Part 3 — Python commands' }, instructions: INF_PICK, questions: [
      { type: 'match', q: { uk: 'Команда → що вона робить.', en: 'Command → what it does.' }, pairs: [
        { l: 'print()', r: { uk: 'виводить дані на екран', en: 'shows data on the screen' } },
        { l: 'input()', r: { uk: 'зчитує те, що ввів користувач', en: 'reads what the user types' } },
        { l: 'if … else', r: { uk: 'розгалуження', en: 'branching' } },
        { l: 'for … in range()', r: { uk: 'цикл із лічильником', en: 'counting loop' } },
        { l: 'while', r: { uk: 'цикл з умовою', en: 'loop with a condition' } }
      ] },
      { type: 'short', q: { uk: 'Якою функцією в Python перетворюють рядок "42" на ціле число 42? (лише назва)', en: 'Which Python function turns the string "42" into the integer 42? (name only)' },
        accept: ['int', 'int()'] }
    ] },
    { title: { uk: 'Частина 4 — Напишіть програму', en: 'Part 4 — Write a program' }, instructions: INF_OPEN, questions: [
      { type: 'open', q: { uk: 'Напишіть програму на Python, яка запитує два числа й виводить більше з них (або повідомлення «рівні», якщо вони однакові).', en: 'Write a Python program that asks for two numbers and prints the larger one (or the message “equal” if they are the same).' } }
    ] }
  ] } },

  { title: { uk: 'Інформатика, 8 клас — Системи числення, одиниці інформації, логіка', en: 'Computer Science, Grade 8 — Number Systems, Units of Information, Logic' }, folder: '8 клас', open: false, content: { langs: ['uk', 'en'], sections: [
    { title: INF_MC, instructions: INF_ONE, questions: [
      { type: 'mc', q: { uk: 'Скільки цифр використовує двійкова система числення?', en: 'How many digits does the binary number system use?' },
        options: ['1', '2', '8', '10'], answer: 1 },
      { type: 'mc', q: { uk: 'Вираз «A і B» (A AND B) істинний, коли…', en: 'The expression “A AND B” is true when…' },
        options: infOpts_(['істинне хоча б одне з A, B', 'істинні обидва: і A, і B', 'обидва хибні', 'A хибне'], ['at least one of A, B is true', 'both A and B are true', 'both are false', 'A is false']), answer: 1 },
      { type: 'mc', q: { uk: 'Чому дорівнює «не (5 > 3)» — not (5 > 3)?', en: 'What is not (5 > 3)?' },
        options: ['True', 'False', '5', '3'], answer: 1 },
      { type: 'mc', q: { uk: 'Що більше?', en: 'Which is the largest?' },
        options: ['1 Мбайт / 1 MB', '1000 Кбайт / 1000 KB', '8000 біт / 8000 bits', '1000 байт / 1000 bytes'], answer: 0 }
    ] },
    { title: { uk: 'Частина 2 — Обчисліть', en: 'Part 2 — Calculate' },
      instructions: { uk: 'Введіть лише число. 1 Кбайт = 1024 байти, 1 байт = 8 біт.', en: 'Type only the number. 1 KB = 1024 bytes, 1 byte = 8 bits.' }, questions: [
      { type: 'num', q: { uk: 'Переведіть 1011₂ у десяткову систему.', en: 'Convert 1011₂ to decimal.' }, accept: ['11'], tol: 0 },
      { type: 'num', q: { uk: 'Переведіть 25₁₀ у двійкову систему.', en: 'Convert 25₁₀ to binary.' }, note: { uk: 'Запишіть лише цифри 0 і 1.', en: 'Write only the digits 0 and 1.' }, accept: ['11001'], tol: 0 },
      { type: 'num', q: { uk: 'Переведіть FF₁₆ у десяткову систему.', en: 'Convert FF₁₆ to decimal.' }, accept: ['255'], tol: 0 },
      { type: 'num', q: { uk: 'Скільки байтів у 3 Кбайт?', en: 'How many bytes are there in 3 KB?' }, accept: ['3072'], tol: 0 },
      { type: 'num', q: { uk: 'Скільки різних значень можна закодувати 5 бітами?', en: 'How many different values can be encoded with 5 bits?' }, accept: ['32'], tol: 0 },
      { type: 'num', q: { uk: 'Повідомлення з 40 символів закодовано по 8 біт на символ. Скільки байтів воно займає?', en: 'A 40-character message uses 8 bits per character. How many bytes does it take?' }, accept: ['40'], tol: 0 }
    ] },
    { title: { uk: 'Частина 3 — Відповідність і термін', en: 'Part 3 — Matching and key term' }, instructions: INF_PICK, questions: [
      { type: 'match', q: { uk: 'Одиниця → скільки в ній менших одиниць.', en: 'Unit → how many smaller units it holds.' }, pairs: [
        { l: { uk: '1 байт', en: '1 byte' }, r: { uk: '8 біт', en: '8 bits' } },
        { l: { uk: '1 Кбайт', en: '1 KB' }, r: { uk: '1024 байти', en: '1024 bytes' } },
        { l: { uk: '1 Мбайт', en: '1 MB' }, r: { uk: '1024 Кбайт', en: '1024 KB' } },
        { l: { uk: '1 Гбайт', en: '1 GB' }, r: { uk: '1024 Мбайт', en: '1024 MB' } }
      ] },
      { type: 'short', q: { uk: 'Запишіть число 15₁₀ у шістнадцятковій системі.', en: 'Write 15₁₀ in hexadecimal.' }, accept: ['F', 'F16', '0xF'] }
    ] },
    { title: { uk: 'Частина 4 — Поясніть', en: 'Part 4 — Explain' }, instructions: INF_OPEN, questions: [
      { type: 'open', q: { uk: 'Покажіть крок за кроком, як перевести число 13₁₀ у двійкову систему, і перевірте відповідь зворотним переведенням.', en: 'Show step by step how to convert 13₁₀ to binary, then check your answer by converting it back.' } }
    ] }
  ] } }
];

// Code, numbers and file names are the same in both languages: a plain string in options or
// matching pairs is written into both, so the editor does not report them as untranslated.
(function infBothLangs_() {
  const both = t => typeof t === 'string' ? { uk: t, en: t } : t;
  SEED_TESTS.forEach(t => t.content.sections.forEach(s => s.questions.forEach(q => {
    if (q.options) q.options = q.options.map(both);
    if (q.pairs) q.pairs = q.pairs.map(p => ({ l: both(p.l), r: both(p.r) }));
  })));
})();

// ---------- AI: photo(s) → informatics test content ----------
// Code.gs adds the rules for the two languages after this text.
const AI_INSTRUCTIONS =
  'You convert photos of a printed school COMPUTER SCIENCE (informatics) test or worksheet into structured JSON. ' +
  'Read every exercise on the page. Return ONLY JSON (no markdown fences, no commentary) shaped as: ' +
  '{"title": string, "sections": [{"title": TEXT, "instructions": TEXT, "questions": [Q, ...]}]}. ' +
  'Each Q is one of: ' +
  '{"type":"mc","q":TEXT,"options":[TEXT, TEXT, ...],"answer":<0-based index of the correct option>}; ' +
  '{"type":"num","q":TEXT,"note":TEXT (optional),"accept":["the correct number"],"tol":0} (the answer is one number, e.g. what a program prints, a conversion to decimal, a number of bytes); ' +
  '{"type":"match","q":TEXT,"pairs":[{"l":TEXT,"r":TEXT}, ...]} (2-12 pairs, e.g. command ↔ meaning, device ↔ purpose); ' +
  '{"type":"short","q":TEXT,"accept":["answer1","answer2"]} (a term, a command name, a hexadecimal number); ' +
  '{"type":"open","q":TEXT} (write a program, draw a flowchart, explain; no single value). ' +
  'CODE: the page shows text, not formulas — never use dollar signs or LaTeX. Copy program code exactly (Python unless the page says otherwise); ' +
  'line breaks are not shown, so write a short program on one line with statements separated by "; " and describe indented blocks in words if needed. ' +
  'Keep code, keywords and program output identical in both languages; translate only the surrounding words. ' +
  'NUMBER SYSTEMS: write the base as a Unicode subscript (1011₂, 25₁₀, FF₁₆). Binary answers go in "num" as digits only ("11001"); hexadecimal answers go in "short" in capitals ("FF"). ' +
  'Units: 1 Кбайт = 1024 байти (1 KB = 1024 bytes) unless the page says otherwise; write units as text in the language of that text. ' +
  'For "mc", "answer" MUST be the 0-based index of the correct option; if unsure, give your best guess (check program output by tracing it). ' +
  'Keep the original wording and numbers from the page. Do not invent exercises that are not on the page. ' +
  'If a question depends on a picture or flowchart, describe what is needed in words inside the question so the student can still answer.';
