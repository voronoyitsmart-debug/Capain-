DE.grammar.push({
  id: "articol_nehotarat",
  title: "Неопределённый артикль un / o / niște",
  level: "A1",
  emoji: "📌",
  summary: "un băiat, o fată, un tren; мн. ч. — niște",
  content: `<p>В русском артиклей нет, так что это новая привычка. Неопределённый артикль значит «какой-то, один (из многих)»: мы упоминаем предмет впервые или не уточняем, какой именно. Он стоит <b>перед</b> словом.</p>

<table>
<tr><th></th><th>Мужской</th><th>Женский</th><th>Средний</th></tr>
<tr><td>Ед. ч.</td><td><b>un</b> băiat</td><td><b>o</b> fată</td><td><b>un</b> tren</td></tr>
<tr><td>Мн. ч.</td><td><b>niște</b> băieți</td><td><b>niște</b> fete</td><td><b>niște</b> trenuri</td></tr>
</table>

<p><b>un</b> — для мужского и среднего рода, <b>o</b> — для женского. Во множественном числе для всех родов — <b>niște</b> («несколько, какие-то»).</p>
<div class="ex"><b>Am un frate și o soră.</b> — У меня есть брат и сестра.</div>
<div class="ex"><b>Pe masă sunt niște cărți.</b> — На столе (лежат) какие-то книги.</div>
<div class="ex"><b>Vreau o cafea, vă rog.</b> — Мне кофе (одну чашку), пожалуйста.</div>

<p>Русский различает «какую-то» и «ту самую» книгу только по контексту, а румынский — артиклем: <b>Citesc o carte.</b> — Я читаю (какую-то) книгу. <b>Citesc cartea.</b> — Я читаю (ту самую) книгу. Определённый артикль (cartea) — тема следующего урока.</p>

<h3>niște = «немного»</h3>
<p>С неисчисляемыми словами в ед. ч. <b>niște</b> значит «немного, некоторое количество» — там, где в русском родительный падеж:</p>
<div class="ex"><b>Vreau niște apă.</b> — Я хочу воды.</div>
<div class="ex"><b>Cumpăr niște pâine.</b> — Я покупаю хлеба.</div>

<h3>Когда артикль НЕ нужен</h3>
<ul>
<li>Профессия и национальность после a fi: <b>Sunt profesor.</b> <b>Ea este româncă.</b> Но если есть прилагательное — артикль нужен: <b>Este un profesor bun.</b></li>
<li>В отрицании с «общими» понятиями: <b>Nu am timp.</b> — У меня нет времени. <b>Nu am mașină.</b> — У меня нет машины.</li>
<li>Во мн. ч. niște часто опускают: <b>Am prieteni în București.</b></li>
</ul>

<div class="warn">Артикль <b>un</b> и числительное <b>unu</b> — разные слова. Считаем: «unu, doi, trei», но перед существительным — <b>un</b> băiat. Женская форма — <b>o</b> (при счёте — una).</div>

<div class="tip">Запоминалка: <b>o</b> — как первая буква слова «она»: o fată, o casă, o carte. А в косвенных падежах артикль меняется (unui, unei, unor) — это тема уровня A2.</div>`,
  exercises: [
    { type: "choice", q: "Am ___ frate.", options: ["un", "o", "niște"], a: 0,
      explain: "frate (брат) — мужской род, ед. ч.: un frate." },
    { type: "choice", q: "Ea are ___ pisică.", options: ["un", "o", "niște"], a: 1,
      explain: "pisică (кошка) — женский род на -ă: o pisică." },
    { type: "input", q: "Vreau ___ cafea, vă rog. (одну чашку)", a: ["o"],
      explain: "cafea — женский род: o cafea — одна чашка кофе." },
    { type: "input", q: "Cumpăr ___ mere. (несколько)", a: ["niște"],
      explain: "Во мн. ч. неопределённый артикль — niște: niște mere (несколько яблок)." },
    { type: "choice", q: "Как сказать «Я учитель»?", options: ["Sunt o profesor.", "Sunt profesor.", "Sunt niște profesor."], a: 1,
      explain: "Профессия после a fi — без артикля: Sunt profesor. С прилагательным артикль нужен: Sunt un profesor bun." },
    { type: "choice", q: "___ tren", options: ["o", "niște", "un"], a: 2,
      explain: "tren — средний род; в ед. ч. он ведёт себя как мужской: un tren." },
    { type: "choice", q: "Pe masă sunt ___ cărți.", options: ["niște", "un", "o"], a: 0,
      explain: "cărți — мн. ч. (книги), поэтому niște. un и o — только для ед. ч." },
    { type: "input", q: "Am ___ prieten bun.", a: ["un"],
      explain: "prieten (друг) — мужской род: un prieten bun." },
    { type: "input", q: "Ei au ___ casă mare.", a: ["o"],
      explain: "casă — женский род: o casă mare." },
    { type: "choice", q: "Nu am ___. (у меня нет времени)", options: ["un timp", "o timp", "timp"], a: 2,
      explain: "В отрицании с общими понятиями артикль не ставится: Nu am timp." },
    { type: "choice", q: "Cumpăr ___ pâine. (немного хлеба)", options: ["un", "niște", "unei"], a: 1,
      explain: "С неисчисляемыми niște = «немного»: niște pâine — хлеба. pâine женского рода, поэтому un не подходит." },
    { type: "order", words: ["Vreau", "o", "cafea", "și", "un", "ceai"], ru: "Я хочу кофе и чай.",
      alts: [["Vreau", "un", "ceai", "și", "o", "cafea"]],
      explain: "cafea — женский род: o cafea; ceai — средний род: un ceai (două ceaiuri). Артикль стоит перед словом." },
    { type: "order", words: ["Am", "niște", "prieteni", "în", "București"], ru: "У меня есть друзья в Бухаресте.",
      alts: [["în", "București", "Am", "niște", "prieteni"]],
      explain: "prieteni — мн. ч., поэтому niște. Обстоятельство места может стоять и в начале: În București am niște prieteni." }
  ]
});
