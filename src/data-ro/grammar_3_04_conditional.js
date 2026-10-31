DE.grammar.push({
  id: "conditional",
  title: "Условное наклонение (aș vrea, dacă aș avea…)",
  level: "B1",
  emoji: "🤔",
  summary: "Aș vrea o cafea. Dacă aș avea timp, aș merge — румынское «бы»",
  content: `<p><b>Condiționalul</b> — это румынское <b>«бы»</b>. Оно нужно для вежливых просьб, желаний и нереальных условий.</p>
<h3>Образование: aș, ai, ar… + инфинитив без «a»</h3>
<table>
<tr><th></th><th>вспом.</th><th>a vrea</th><th>a putea</th><th>a fi</th></tr>
<tr><td>eu</td><td><b>aș</b></td><td>aș vrea</td><td>aș putea</td><td>aș fi</td></tr>
<tr><td>tu</td><td><b>ai</b></td><td>ai vrea</td><td>ai putea</td><td>ai fi</td></tr>
<tr><td>el, ea</td><td><b>ar</b></td><td>ar vrea</td><td>ar putea</td><td>ar fi</td></tr>
<tr><td>noi</td><td><b>am</b></td><td>am vrea</td><td>am putea</td><td>am fi</td></tr>
<tr><td>voi / dvs.</td><td><b>ați</b></td><td>ați vrea</td><td>ați putea</td><td>ați fi</td></tr>
<tr><td>ei, ele</td><td><b>ar</b></td><td>ar vrea</td><td>ar putea</td><td>ar fi</td></tr>
</table>
<p>Отрицание: <i>nu aș</i> = <i>n-aș</i>. Местоимения стоят впереди: <i><b>Mi-ar</b> plăcea</i> (мне бы понравилось), <i><b>M-aș</b> bucura</i> (я был бы рад).</p>
<h3>1. Вежливость</h3>
<div class="ex"><b>Aș vrea o cafea, vă rog.</b> — Я бы хотел кофе, пожалуйста.</div>
<div class="ex"><b>Ați putea să mă ajutați?</b> — Не могли бы вы мне помочь?</div>
<div class="ex"><b>Ar trebui să te odihnești.</b> — Тебе следовало бы отдохнуть.</div>
<h3>2. Нереальное условие — «бы» в ОБЕИХ частях, как в русском</h3>
<div class="ex"><b>Dacă aș avea timp, aș merge la mare.</b> — Если бы у меня было время, я бы поехал на море.</div>
<p>Сравните с реальным условием — там обычное изъявительное наклонение, тоже как в русском:</p>
<table>
<tr><th>Реальное (если)</th><th>Нереальное (если бы)</th></tr>
<tr><td><i>Dacă <b>am</b> timp, <b>merg</b> la mare.</i><br>Если у меня есть время, я еду на море.</td><td><i>Dacă <b>aș avea</b> timp, <b>aș merge</b> la mare.</i><br>Если бы у меня было время, я бы поехал.</td></tr>
</table>
<h3>3. Прошедшее: aș fi + причастие</h3>
<p>Для упущенных возможностей: <i>aș fi venit</i> — я бы пришёл (но не пришёл).</p>
<div class="ex"><b>Dacă aș fi știut, aș fi venit.</b> — Если бы я знал, я бы пришёл.</div>
<div class="warn">Не путайте: <b>am</b> merge = «мы бы пошли», а <b>am</b> mers = «я пошёл / мы пошли». <b>Ai</b> vrea = «ты бы хотел», а <b>ai</b> vrut = «ты хотел». Решает форма глагола после вспомогательного: инфинитив → условное, причастие → прошедшее.</div>
<div class="tip">💡 Заучите три «волшебные» фразы для кафе, магазина и офиса: <b>Aș vrea…</b> (Я бы хотел…), <b>Ați putea…?</b> (Не могли бы вы…?), <b>Mi-ar plăcea…</b> (Мне бы хотелось…). Они сразу делают речь вежливой.</div>`,
  exercises: [
    { type: "choice", q: "___ o cafea, vă rog.", options: ["Aș vrea", "Aș vreau", "Aș vrut"], a: 0,
      explain: "Условное = aș + инфинитив без «a»: aș vrea. После aș не ставят ни личную форму, ни причастие." },
    { type: "input", q: "Dacă ___ bani, aș cumpăra o casă. (a avea, eu)", a: ["aș avea"],
      explain: "Нереальное условие: «бы» в обеих частях — dacă aș avea…, aș cumpăra." },
    { type: "input", q: "Ce ___ tu în locul meu? (a face)", a: ["ai face"],
      explain: "2 л. ед. ч.: ai + face → ai face («что бы ты сделал на моём месте?»)." },
    { type: "choice", q: "Dacă aș fi știut, ___ venit.", options: ["aș fi", "aș", "am"], a: 0,
      explain: "Прошедшее условное: aș fi + причастие → aș fi venit («я бы пришёл»)." },
    { type: "input", q: "___ să mă ajutați, vă rog? (a putea, вежливое «вы»)", a: ["Ați putea"],
      explain: "Вежливая просьба к «вы»: ați + putea → Ați putea…? («Не могли бы вы…?»)." },
    { type: "order", words: ["Mi-ar", "plăcea", "să", "merg", "la", "mare"], ru: "Мне бы хотелось поехать на море.",
      alts: [["la", "mare", "Mi-ar", "plăcea", "să", "merg"]],
      explain: "Mi-ar plăcea = «мне бы понравилось»: местоимение mi + ar сливаются через дефис." },
    { type: "choice", q: "Dacă ___ timp mâine, vin la tine. (реальное условие)", options: ["am", "aș avea", "aș fi avut"], a: 0,
      explain: "Во второй части обычное настоящее (vin) → условие реальное: dacă am timp — «если у меня будет время»." },
    { type: "input", q: "Noi ___ cu plăcere, dar nu putem. (a merge)", a: ["am merge"],
      explain: "1 л. мн. ч.: am + merge → am merge («мы бы с удовольствием пошли»)." },
    { type: "input", q: "___ să înveți mai mult. (a trebui — «тебе следовало бы»)", a: ["Ar trebui"],
      explain: "Совет: ar trebui să… — безличная форма 3 л. ед. ч. = «следовало бы»." },
    { type: "choice", q: "Dacă ar ploua, eu ___ acasă.", options: ["aș rămâne", "ar rămâne", "aș rămas"], a: 0,
      explain: "Подлежащее eu → aș; после aș — инфинитив rămâne." },
    { type: "order", words: ["Aș", "vrea", "un", "bilet", "pentru", "Brașov"], ru: "Я бы хотел билет до Брашова.",
      alts: [["un", "bilet", "pentru", "Brașov", "Aș", "vrea"]],
      explain: "Вежливая просьба начинается с Aș vrea…; дополнение можно вынести вперёд для акцента." },
    { type: "input", q: "Dacă ai fi plecat mai devreme, ___ la timp. (a ajunge, tu)", a: ["ai fi ajuns"],
      explain: "Нереальное условие в прошлом: ai fi + причастие ajuns → «ты бы успел»." },
    { type: "choice", q: "Ce ___ dacă ai câștiga la loto? (a face, tu)", options: ["ai face", "ai făcut", "faci"], a: 0,
      explain: "Гипотеза «если бы выиграл» → условное ai face. Ai făcut — прошедшее «ты сделал»." }
  ]
});
