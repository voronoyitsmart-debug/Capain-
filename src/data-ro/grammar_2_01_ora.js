DE.grammar.push({
  id: "ora",
  title: "Который час? (Cât e ceasul?)",
  level: "A1",
  emoji: "🕐",
  summary: "Cât e ceasul? — E ora trei și un sfert; la ora opt; de la nouă până la cinci",
  content: `<p>Спросить время: <b>Cât e ceasul?</b> (дословно «Сколько [показывают] часы?») или <b>Cât este ora?</b> Ответ: <b>E ora trei.</b> или короче: <b>E trei.</b> Ровно — <b>fix</b>: <b>E ora trei fix.</b></p>
<p>Слово <b>ora</b> («час») женского рода, поэтому: <b>ora unu</b> (не «una»!), но <b>ora două</b>, <b>ora douăsprezece</b>.</p>

<h3>Минуты: și (плюс) и fără (минус)</h3>
<table>
<tr><th>Время</th><th>По-румынски</th><th>Дословно</th></tr>
<tr><td>3:05</td><td>trei și cinci</td><td>три и пять</td></tr>
<tr><td>3:15</td><td>trei <b>și un sfert</b></td><td>три и четверть</td></tr>
<tr><td>3:20</td><td>trei și douăzeci</td><td>три и двадцать</td></tr>
<tr><td>3:30</td><td>trei <b>și jumătate</b></td><td>три и половина</td></tr>
<tr><td>3:40</td><td>patru fără douăzeci</td><td>четыре без двадцати</td></tr>
<tr><td>3:45</td><td>patru <b>fără un sfert</b></td><td>четыре без четверти</td></tr>
<tr><td>3:55</td><td>patru fără cinci</td><td>четыре без пяти</td></tr>
</table>

<div class="tip">Думайте как в математике: <b>și</b> = плюс, <b>fără</b> = минус. До половины называем <b>текущий</b> час: <b>trei și jumătate</b> = 3:30 (а не «половина третьего»!). После половины — <b>следующий</b> час с fără, совсем как наше «без четверти четыре» = <b>patru fără un sfert</b>.</div>

<p>Официально (вокзал, радио) — 24 часа и минуты: <b>ora paisprezece și treizeci</b> (14:30). С числами от 20 перед словом «minute» ставится <b>de</b>: <b>cinci minute</b>, но <b>douăzeci de minute</b>.</p>

<h3>Когда? — la ora…</h3>
<table>
<tr><th>По-румынски</th><th>По-русски</th></tr>
<tr><td>La ce oră?</td><td>В котором часу?</td></tr>
<tr><td><b>la</b> ora opt</td><td>в восемь часов</td></tr>
<tr><td>la șapte dimineața / la nouă seara</td><td>в семь утра / в девять вечера</td></tr>
<tr><td>la prânz / la miezul nopții</td><td>в полдень / в полночь</td></tr>
<tr><td><b>de la</b> nouă <b>până la</b> cinci</td><td>с девяти до пяти</td></tr>
<tr><td><b>pe la</b> ora șase</td><td>около шести, часов в шесть</td></tr>
</table>

<div class="ex"><b>Cât e ceasul? — E ora patru și un sfert.</b> — Который час? — Четверть пятого.</div>
<div class="ex"><b>Filmul începe la ora opt și jumătate.</b> — Фильм начинается в половине девятого.</div>
<div class="ex"><b>Lucrez de la nouă până la cinci.</b> — Я работаю с девяти до пяти.</div>
<div class="ex"><b>Ne vedem pe la șase.</b> — Увидимся около шести.</div>
<div class="ex"><b>Trenul pleacă la ora zece fără un sfert.</b> — Поезд отправляется без четверти десять.</div>`,
  exercises: [
    { type: "choice", q: "3:15 — E ora ___.", options: ["trei și un sfert", "patru și un sfert", "trei fără un sfert"], a: 0,
      explain: "До половины называем текущий час и прибавляем: trei și un sfert = три плюс четверть." },
    { type: "choice", q: "7:45 — E ora ___.", options: ["opt fără un sfert", "șapte fără un sfert", "opt și un sfert"], a: 0,
      explain: "После половины берём следующий час и вычитаем: opt fără un sfert = без четверти восемь." },
    { type: "input", q: "5:30 — E ora cinci și ___.", a: ["jumătate"],
      explain: "Половина — jumătate, и прибавляется к текущему часу: cinci și jumătate = 5:30." },
    { type: "choice", q: "1:00 — E ora ___.", options: ["unu", "una", "un"], a: 0,
      explain: "По норме говорят ora unu (числительное в форме счёта), хотя слово ora женского рода." },
    { type: "choice", q: "2:00 — E ora ___.", options: ["două", "doi", "doua"], a: 0,
      explain: "Ora — женского рода, поэтому două (ж. р.), а не doi." },
    { type: "input", q: "9:50 — E ora zece ___ zece.", a: ["fără"],
      explain: "9:50 — это десять без десяти: zece fără zece (fără = без, минус)." },
    { type: "choice", q: "Filmul începe ___ ora opt.", options: ["la", "în", "pe"], a: 0,
      explain: "Точное время отвечает на вопрос «когда?» с предлогом la: la ora opt." },
    { type: "input", q: "Lucrez de la ora nouă ___ la ora cinci.", a: ["până"],
      explain: "Промежуток времени: de la … până la … — с … до …" },
    { type: "order", words: ["La", "ce", "oră", "începe", "lecția?"], ru: "Во сколько начинается урок?",
      alts: [["lecția?", "La", "ce", "oră", "începe"]],
      explain: "Вопрос «в котором часу?» — La ce oră? Обычно он стоит в начале; в разговоре возможно и Lecția la ce oră începe?" },
    { type: "choice", q: "6:40 — E ora ___.", options: ["șapte fără douăzeci", "șase fără douăzeci", "șapte și douăzeci"], a: 0,
      explain: "6:40 = 7:00 минус 20 минут: șapte fără douăzeci." },
    { type: "choice", q: "00:00 — E ___.", options: ["miezul nopții", "mijlocul nopții", "jumătatea nopții"], a: 0,
      explain: "Полночь — устойчивое выражение miezul nopții (дословно «сердцевина ночи»); полдень — prânz или amiază." },
    { type: "input", q: "14:20 — E ora două și ___.", a: ["douăzeci", "douăzeci de minute"],
      explain: "В разговоре 14:20 = două și douăzeci; минуты просто прибавляются после și." },
    { type: "order", words: ["Lucrez", "de", "la", "nouă", "până", "la", "cinci"], ru: "Я работаю с девяти до пяти.",
      alts: [["de", "la", "nouă", "până", "la", "cinci", "Lucrez"]],
      explain: "de la nouă (с девяти) + până la cinci (до пяти). Промежуток можно вынести вперёд: De la nouă până la cinci lucrez." }
  ]
});
