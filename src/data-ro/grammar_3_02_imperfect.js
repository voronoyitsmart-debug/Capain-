DE.grammar.push({
  id: "imperfect",
  title: "Imperfect — прошедшее «процесс» (mergeam, eram)",
  level: "B1",
  emoji: "🎞️",
  summary: "Когда я был маленьким, я часто ходил… — Când eram mic, mergeam des…",
  content: `<p><b>Imperfect</b> — это прошедшее время для <b>фона, привычек и длительных действий</b>. Для русскоговорящего всё просто: imperfect примерно соответствует <b>несовершенному виду</b> («делал, ходил, был»), а perfect compus — чаще <b>совершенному</b> («сделал, пошёл»).</p>
<h3>Образование: одна простая форма без вспомогательного глагола</h3>
<table>
<tr><th></th><th>a lucra (I)</th><th>a merge (III)</th><th>a citi (IV)</th><th>a fi</th></tr>
<tr><td>eu</td><td>lucr<span class="hl">am</span></td><td>merg<span class="hl">eam</span></td><td>cit<span class="hl">eam</span></td><td>eram</td></tr>
<tr><td>tu</td><td>lucrai</td><td>mergeai</td><td>citeai</td><td>erai</td></tr>
<tr><td>el, ea</td><td>lucra</td><td>mergea</td><td>citea</td><td>era</td></tr>
<tr><td>noi</td><td>lucram</td><td>mergeam</td><td>citeam</td><td>eram</td></tr>
<tr><td>voi</td><td>lucrați</td><td>mergeați</td><td>citeați</td><td>erați</td></tr>
<tr><td>ei, ele</td><td>lucrau</td><td>mergeau</td><td>citeau</td><td>erau</td></tr>
</table>
<p>Глаголы на <b>-a</b> (и на <b>-î</b>: hotărî → hotăram) берут <b>-am, -ai, -a…</b>, все остальные — <b>-eam, -eai, -ea…</b> После гласной -i- пишется -iam: a locui → <b>locuiam</b>, a ști → <b>știam</b>. Полезные «неправильные»: a da → <b>dădeam</b>, a sta → <b>stăteam</b>, a face → <b>făceam</b>, a vrea → <b>voiam</b> (разг. vroiam), a avea → <b>aveam</b>.</p>
<div class="warn">Формы <b>eu</b> и <b>noi</b> совпадают: mergeam = «я шёл» и «мы шли». Смысл подскажет контекст или местоимение.</div>
<h3>Imperfect или perfect compus?</h3>
<table>
<tr><th>Imperfect (несов. вид)</th><th>Perfect compus (сов. вид)</th></tr>
<tr><td>Привычка: <i>În fiecare vară <b>mergeam</b> la mare.</i> — Каждое лето я ездил на море.</td><td>Один раз: <i>Anul trecut <b>am mers</b> la mare.</i> — В прошлом году я съездил на море.</td></tr>
<tr><td>Фон, процесс: <i><b>Citeam</b>…</i> — Я читал…</td><td>Событие на фоне: <i>…când <b>a sunat</b> telefonul.</i> — …когда зазвонил телефон.</td></tr>
<tr><td>Описание: <i><b>Era</b> frig și <b>ploua</b>.</i> — Было холодно, шёл дождь.</td><td>Результат: <i><b>Am terminat</b> lucrul.</i> — Я закончил работу.</td></tr>
</table>
<div class="ex"><b>Când eram copil, locuiam la țară.</b> — Когда я был ребёнком, я жил в деревне.</div>
<div class="ex"><b>Dormeam când ai sunat.</b> — Я спал, когда ты позвонил.</div>
<div class="ex"><b>Voiam să vă întreb ceva.</b> — Я хотел вас кое о чём спросить. (вежливо смягчает просьбу)</div>
<div class="tip">💡 Задайте вопрос по-русски: «что <b>делал</b>?» → imperfect; «что <b>сделал</b>?» → perfect compus. Сказки и воспоминания почти всегда начинаются с imperfect: <i>A fost odată… Era un împărat care avea trei fete.</i></div>`,
  exercises: [
    { type: "input", q: "Pe atunci noi ___ la Cluj. (a locui)", a: ["locuiam"],
      explain: "Длительное состояние в прошлом → imperfect. После гласной: locui + -am → locuiam." },
    { type: "input", q: "Tu ___ mereu obosit. (a fi)", a: ["erai"],
      explain: "Imperfect глагола a fi: eram, erai, era… «Ты всегда был уставшим» — состояние." },
    { type: "input", q: "Ei ___ fotbal în fiecare duminică. (a juca)", a: ["jucau"],
      explain: "Привычное действие («каждое воскресенье») → imperfect. Глагол на -a: juca + -u → jucau." },
    { type: "choice", q: "Ieri ___ un film foarte bun.", options: ["am văzut", "vedeam", "văd"], a: 0,
      explain: "Одно законченное событие вчера («посмотрел») → perfect compus." },
    { type: "choice", q: "În timp ce eu ___, ea se uita la televizor.", options: ["găteam", "am gătit", "gătesc"], a: 0,
      explain: "Два параллельных процесса в прошлом («пока я готовил, она смотрела») → оба в imperfect." },
    { type: "choice", q: "Eu ___ temele în fiecare seară. (a face)", options: ["făceam", "faceam", "făcam"], a: 0,
      explain: "A face → făceam: в основе появляется ă, окончание -eam как у всех глаголов не на -a." },
    { type: "order", words: ["Dormeam", "când", "ai", "sunat"], ru: "Я спал, когда ты позвонил.",
      alts: [["când", "ai", "sunat", "Dormeam"]],
      explain: "Фон (спал) — imperfect, событие (позвонил) — perfect compus. Придаточное может стоять и первым." },
    { type: "input", q: "___ să vă rog ceva. (a vrea, вежливо: «я хотел…»)", a: ["Voiam", "Vroiam"],
      explain: "Imperfect от a vrea смягчает просьбу: voiam (разговорное vroiam) = «я хотел»." },
    { type: "choice", q: "Bunicul meu ___ mereu povești. (a spune)", options: ["spunea", "spuneau", "spuneam"], a: 0,
      explain: "Подлежащее bunicul — 3 л. ед. ч.: spun- + -ea → spunea. Spuneau — «они», spuneam — «я/мы»." },
    { type: "input", q: "Afară ___ și era frig. (a ploua)", a: ["ploua"],
      explain: "Описание погоды в прошлом → imperfect: ploua — «шёл дождь»." },
    { type: "choice", q: "Când eram mic, ___ des la bunici. (a merge)", options: ["mergeam", "mergem", "voi merge"], a: 0,
      explain: "Привычка в детстве → imperfect mergeam. Mergem — настоящее время («идём»)." },
    { type: "input", q: "Voi ce ___ acolo? (a face)", a: ["făceați"],
      explain: "Imperfect 2 л. мн. ч.: făce- + -ați → făceați («что вы там делали?»)." },
    { type: "order", words: ["Pe", "vremuri", "bunicul", "lucra", "la", "fabrică"], ru: "В былые времена дедушка работал на фабрике.",
      alts: [["bunicul", "lucra", "la", "fabrică", "Pe", "vremuri"], ["bunicul", "Pe", "vremuri", "lucra", "la", "fabrică"]],
      explain: "Длительное занятие в прошлом → imperfect lucra. Обстоятельство pe vremuri можно поставить в начало или в конец." },
    { type: "choice", q: "Când eram student, ___ la cantină. (a mânca, eu)", options: ["mâncam", "mâncăm", "mâncai"], a: 0,
      explain: "Imperfect 1 л. ед. ч. глагола на -a: mânca + -m → mâncam. Mâncăm — настоящее время, mâncai — «ты ел»." }
  ]
});
