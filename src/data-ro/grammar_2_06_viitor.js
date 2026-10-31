DE.grammar.push({
  id: "viitor",
  title: "Будущее время (voi merge, o să merg)",
  level: "A2",
  emoji: "🔮",
  summary: "Книжное voi merge, разговорное o să merg и am să merg",
  content: `<p>В румынском три способа сказать о будущем. Все значат одно и то же — «я пойду / буду идти», — отличаются стилем.</p>

<table>
<tr><th>Лицо</th><th>Книжное<br>voi + инфинитив</th><th>Разговорное<br>o să + конъюнктив</th><th>Разговорное<br>am să + конъюнктив</th></tr>
<tr><td>eu</td><td><b>voi</b> merge</td><td>o să merg</td><td><b>am</b> să merg</td></tr>
<tr><td>tu</td><td><b>vei</b> merge</td><td>o să mergi</td><td><b>ai</b> să mergi</td></tr>
<tr><td>el / ea</td><td><b>va</b> merge</td><td>o să <b>meargă</b></td><td><b>are</b> să <b>meargă</b></td></tr>
<tr><td>noi</td><td><b>vom</b> merge</td><td>o să mergem</td><td><b>avem</b> să mergem</td></tr>
<tr><td>voi</td><td><b>veți</b> merge</td><td>o să mergeți</td><td><b>aveți</b> să mergeți</td></tr>
<tr><td>ei / ele</td><td><b>vor</b> merge</td><td>o să <b>meargă</b></td><td><b>au</b> să <b>meargă</b></td></tr>
</table>

<h3>1. voi, vei, va… + инфинитив</h3>
<p>Как русское «буду + инфинитив», только инфинитив без частицы a: <b>voi lucra, vei vedea, va fi</b>. Это стиль новостей, документов, письма.</p>

<h3>2. o să + конъюнктив — самое частое</h3>
<p><b>O</b> не меняется, меняется глагол — он стоит в конъюнктиве (форма как в настоящем времени, кроме 3-го лица): <b>o să fiu, o să ai, o să vină, o să facă</b>.</p>

<h3>3. am să + конъюнктив</h3>
<p>Тоже разговорное, часто с оттенком намерения или обещания: <b>Am să te sun.</b> — Я тебе позвоню. Вспомогательный — настоящее время a avea: am, ai, are, avem, aveți, au.</p>

<h3>Отрицание</h3>
<p><b>Nu voi merge. — N-o să merg. — N-am să merg.</b> — Я не пойду.</p>

<div class="ex"><b>Mâine o să plouă.</b> — Завтра будет дождь.</div>
<div class="ex"><b>Vom vedea.</b> — Посмотрим.</div>
<div class="ex"><b>Ce o să faci în vacanță?</b> — Что ты будешь делать в отпуске?</div>
<div class="ex"><b>Ai să vezi!</b> — Вот увидишь!</div>
<div class="ex"><b>Președintele va vizita Clujul.</b> — Президент посетит Клуж. (новости)</div>

<div class="tip">Не путайте: <b>voi merge</b> = «я пойду» (будущее), а <b>voi mergeți</b> = «вы идёте» (местоимение voi). Если сомневаетесь — говорите <b>o să</b>: это всегда звучит естественно. Кроме того, о планах часто говорят просто настоящим временем, как в русском: <b>Mâine plec la Brașov.</b> — Завтра я уезжаю в Брашов.</div>`,
  exercises: [
    { type: "choice", q: "Mâine ___ merge la mare. (eu, книжно)", options: ["voi", "va", "vor"], a: 0,
      explain: "Для eu книжное будущее — voi + инфинитив: voi merge." },
    { type: "choice", q: "Ei ___ veni diseară.", options: ["vor", "va", "vom"], a: 0,
      explain: "Для ei/ele — vor: vor veni. Va — для el/ea, vom — для noi." },
    { type: "input", q: "Noi ___ pleca mâine. (книжная форма)", a: ["vom"],
      explain: "Для noi — vom + инфинитив: vom pleca." },
    { type: "choice", q: "El o să ___ mâine. (a veni)", options: ["vină", "vine", "veni"], a: 0,
      explain: "После o să — конъюнктив; для el форма особая: să vină → o să vină." },
    { type: "input", q: "O să ___ acasă. (eu, a fi)", a: ["fiu"],
      explain: "Конъюнктив a fi для eu — să fiu, значит o să fiu." },
    { type: "choice", q: "Ce ___ faci mâine?", options: ["o să", "vei", "voi"], a: 0,
      explain: "Faci — форма конъюнктива (tu), она сочетается только с o să. С vei нужен инфинитив: vei face." },
    { type: "choice", q: "Ai să ___! (a vedea)", options: ["vezi", "vedea", "vei"], a: 0,
      explain: "После ai să — конъюнктив для tu: să vezi → Ai să vezi! (Вот увидишь!)" },
    { type: "input", q: "Ea ___ fi fericită. (книжно)", a: ["va"],
      explain: "Для el/ea книжное будущее — va + инфинитив: va fi." },
    { type: "choice", q: "___ să mai vin aici. (я больше не приду)", options: ["N-o", "Nu vom", "Nu va"], a: 0,
      explain: "Отрицание разговорного будущего: n-o să (= nu o să) + конъюнктив. Vom и va требуют инфинитива без să." },
    { type: "order", words: ["O", "să", "plouă", "mâine"], ru: "Завтра будет дождь.",
      alts: [["mâine", "O", "să", "plouă"]],
      explain: "o să + конъюнктив (să plouă) — неразрывный блок; mâine может стоять в начале или в конце." },
    { type: "order", words: ["Vom", "vedea", "ce", "facem"], ru: "Посмотрим, что будем делать.",
      explain: "vom + инфинитив vedea; после ce — настоящее время в значении будущего (facem)." },
    { type: "input", q: "Ei o să ___ curat. (a face)", a: ["facă"],
      explain: "Конъюнктив 3-го лица от a face — să facă, поэтому o să facă." },
    { type: "choice", q: "___ fi acasă diseară? (ты)", options: ["Vei", "Vă", "Va"], a: 0,
      explain: "Для tu книжное будущее — vei: vei fi. Vă — местоимение «вас/вам», va — для el/ea." }
  ]
});
