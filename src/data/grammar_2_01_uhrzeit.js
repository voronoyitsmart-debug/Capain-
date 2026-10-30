DE.grammar.push({
  id: "uhrzeit",
  title: "Который час? (Uhrzeit)",
  level: "A1",
  emoji: "🕐",
  summary: "Wie spät ist es? — halb acht, Viertel nach drei, um/von…bis, am/im",
  content: `<p>Спросить время можно двумя способами: <b>Wie spät ist es?</b> или <b>Wie viel Uhr ist es?</b> Ответ всегда начинается с <b>Es ist …</b></p>

<h3>Официальное время (вокзал, радио, расписание)</h3>
<p>Говорим просто: часы + <b>Uhr</b> + минуты. Используется 24-часовой формат.</p>
<table>
<tr><th>Время</th><th>Официально</th></tr>
<tr><td>8:00</td><td>acht Uhr</td></tr>
<tr><td>14:30</td><td>vierzehn Uhr dreißig</td></tr>
<tr><td>19:45</td><td>neunzehn Uhr fünfundvierzig</td></tr>
<tr><td>1:00</td><td><b>ein</b> Uhr (но: Es ist <b>eins</b>.)</td></tr>
</table>

<h3>Разговорное время (в жизни)</h3>
<p>В разговоре используют 12-часовой формат и слова <b>nach</b> (после), <b>vor</b> (до, без), <b>Viertel</b> (четверть), <b>halb</b> (половина).</p>
<table>
<tr><th>Время</th><th>Разговорно</th><th>Дословно</th></tr>
<tr><td>7:05</td><td>fünf nach sieben</td><td>пять после семи</td></tr>
<tr><td>7:15</td><td>Viertel nach sieben</td><td>четверть после семи</td></tr>
<tr><td>7:25</td><td>fünf vor halb acht</td><td>пять до половины восьмого</td></tr>
<tr><td>7:30</td><td><span class="hl">halb acht</span></td><td>половина восьмого</td></tr>
<tr><td>7:35</td><td>fünf nach halb acht</td><td>пять после половины восьмого</td></tr>
<tr><td>7:45</td><td>Viertel vor acht</td><td>без четверти восемь</td></tr>
<tr><td>7:50</td><td>zehn vor acht</td><td>без десяти восемь</td></tr>
</table>

<div class="tip"><b>halb acht = половина восьмого</b>, а НЕ «половина после восьми»! Здесь немецкий думает точно как русский: halb указывает на <b>следующий</b> час. «Viertel vor acht» — это наше «без четверти восемь».</div>

<div class="warn">Англоговорящие часто ошибаются: «half eight» в британском английском = 8:30, а немецкое <b>halb acht</b> = 7:30.</div>

<h3>Предлоги времени</h3>
<table>
<tr><th>Предлог</th><th>Когда</th><th>Пример</th></tr>
<tr><td><b>um</b></td><td>точное время (в … часов)</td><td>um 8 Uhr, um halb neun, um Mitternacht</td></tr>
<tr><td><b>von … bis</b></td><td>с … до</td><td>von 9 bis 17 Uhr</td></tr>
<tr><td><b>am</b></td><td>дни недели, части суток, даты</td><td>am Montag, am Morgen, am Abend</td></tr>
<tr><td><b>im</b></td><td>месяцы, времена года</td><td>im Mai, im Sommer, im Winter</td></tr>
<tr><td><b>in der</b></td><td>исключение: ночь</td><td>in der Nacht</td></tr>
</table>

<div class="ex"><b>Wie spät ist es? — Es ist Viertel nach drei.</b> — Который час? — Четверть четвёртого.</div>
<div class="ex"><b>Der Kurs beginnt um halb zehn.</b> — Курс начинается в половине десятого.</div>
<div class="ex"><b>Ich arbeite von acht bis vier.</b> — Я работаю с восьми до четырёх.</div>
<div class="ex"><b>Am Abend gehe ich ins Kino.</b> — Вечером я иду в кино.</div>
<div class="ex"><b>Im Sommer fahren wir ans Meer.</b> — Летом мы едем на море.</div>

<p>Запоминалка: <b>um</b> — для цифр на часах, <b>am</b> — для дней и частей дня, <b>im</b> — для месяцев и сезонов. Длиннее промежуток — «шире» предлог.</p>`,
  exercises: [
    { type: "choice", q: "Es ist 7:30. Разговорно: Es ist ___.", options: ["halb sieben", "halb acht", "sieben halb"], a: 1,
      explain: "halb указывает на следующий час: 7:30 = halb acht («половина восьмого»)." },
    { type: "choice", q: "Es ist 9:45. Разговорно: Es ist ___.", options: ["Viertel nach neun", "Viertel vor zehn", "Viertel vor neun"], a: 1,
      explain: "9:45 — без четверти десять: Viertel vor zehn. Viertel nach neun = 9:15, Viertel vor neun = 8:45." },
    { type: "input", q: "Der Kurs beginnt ___ 9 Uhr. (в)", a: ["um"],
      explain: "Точное время по часам — с предлогом um: um 9 Uhr. am/im с часами не употребляются." },
    { type: "input", q: "Ich arbeite von 8 ___ 17 Uhr. (до)", a: ["bis"],
      explain: "Промежуток времени: von … bis (с … до): von 8 bis 17 Uhr." },
    { type: "choice", q: "___ Abend sehe ich fern.", options: ["Am", "Im", "Um"], a: 0,
      explain: "Части суток — с am: am Morgen, am Abend. Um — только с точным временем." },
    { type: "choice", q: "___ Sommer fahren wir nach Italien.", options: ["Am", "Im", "Um"], a: 1,
      explain: "Времена года и месяцы — с im: im Sommer, im Mai. Am — для дней и частей суток." },
    { type: "choice", q: "___ der Nacht schlafe ich.", options: ["Am", "In", "Um"], a: 1,
      explain: "Исключение среди частей суток: in der Nacht (ночью), а не «am Nacht»." },
    { type: "input", q: "14:30 официально: vierzehn Uhr ___", a: ["dreißig", "dreissig"],
      explain: "Официально: часы + Uhr + минуты → vierzehn Uhr dreißig." },
    { type: "order", words: ["Der", "Zug", "fährt", "um", "halb", "neun"], ru: "Поезд отправляется в половине девятого.",
      alts: [["um", "halb", "neun", "fährt", "Der", "Zug"]],
      explain: "um + время; halb neun = 8:30 (половина девятого). Можно начать со времени: Um halb neun fährt der Zug." },
    { type: "choice", q: "Wie spät ist es? (1:00)", options: ["Es ist ein Uhr.", "Es ist eins Uhr.", "Es ist einer Uhr."], a: 0,
      explain: "Перед Uhr говорят ein: ein Uhr. Без Uhr — eins: Es ist eins." },
    { type: "choice", q: "Es ist 8:25. Разговорно: Es ist ___.", options: ["fünf nach halb acht", "fünf vor halb neun", "fünf vor halb acht"], a: 1,
      explain: "8:25 — за пять минут до половины девятого: fünf vor halb neun." },
    { type: "order", words: ["Wie", "spät", "ist", "es"], ru: "Который час?",
      explain: "Устойчивый вопрос: Wie spät ist es? (дословно «Как поздно это?»). Вариант: Wie viel Uhr ist es?" },
    { type: "input", q: "Es ist 6:15. — Es ist Viertel ___ sechs.", a: ["nach"],
      explain: "6:15 — четверть после шести: Viertel nach sechs. vor означало бы 5:45." },
    { type: "choice", q: "Wann hast du Zeit? — ___ Montag.", options: ["Am", "Im", "Um"], a: 0,
      explain: "Дни недели — с am: am Montag. Im — для месяцев и времён года, um — для часов." }
  ]
});
