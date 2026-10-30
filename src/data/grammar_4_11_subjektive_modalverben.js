DE.grammar.push({
  id: "subjektive_modalverben",
  title: "Субъективные модальные глаголы и Futur II",
  level: "C1",
  emoji: "🕵️",
  summary: "Er muss krank sein. Sie soll reich sein. Er will es gewusst haben. Er wird es vergessen haben.",
  content: `<p>Модальные глаголы умеют не только выражать долг или желание (<b>объективное</b> значение), но и показывать, <b>насколько говорящий уверен</b> в информации или откуда он её знает (<b>субъективное</b> значение).</p>
<table>
<tr><th>Объективно</th><th>Субъективно</th></tr>
<tr><td>Er <b>muss</b> arbeiten. — Он должен работать.</td><td>Er <b>muss</b> krank sein. — Он, должно быть, болен.</td></tr>
<tr><td>Sie <b>soll</b> anrufen. — Ей велели позвонить.</td><td>Sie <b>soll</b> reich sein. — Говорят, она богата.</td></tr>
<tr><td>Er <b>will</b> Arzt werden. — Он хочет стать врачом.</td><td>Er <b>will</b> Arzt sein. — Он утверждает, что он врач.</td></tr>
</table>
<h3>Шкала уверенности</h3>
<table>
<tr><th>Глагол</th><th>Уверенность</th><th>Пример</th><th>Перевод</th></tr>
<tr><td>muss</td><td>≈ 90%</td><td>Er <b>muss</b> zu Hause sein.</td><td>Он наверняка дома.</td></tr>
<tr><td>dürfte</td><td>≈ 75%</td><td>Er <b>dürfte</b> zu Hause sein.</td><td>Он, вероятно, дома.</td></tr>
<tr><td>wird (wohl)</td><td>≈ 70%</td><td>Er <b>wird</b> (wohl) zu Hause sein.</td><td>Он, наверное, дома.</td></tr>
<tr><td>kann / könnte</td><td>≈ 50% / 30%</td><td>Er <b>kann/könnte</b> zu Hause sein.</td><td>Возможно, он дома.</td></tr>
<tr><td>kann nicht</td><td>0%</td><td>Das <b>kann nicht</b> sein!</td><td>Этого не может быть!</td></tr>
</table>
<p>Отдельно стоят глаголы <b>источника информации</b>:</p>
<ul>
<li><b>sollen</b> — «говорят, по слухам, сообщают» (информация от других): <i>Der Film <b>soll</b> gut sein.</i></li>
<li><b>wollen</b> — «утверждает о себе» (говорящий сомневается): <i>Er <b>will</b> perfekt Chinesisch sprechen.</i></li>
</ul>
<h3>Предположение о прошлом</h3>
<p>Формула: <span class="hl">модальный глагол + Partizip II + haben/sein</span> (Infinitiv Perfekt).</p>
<div class="ex"><b>Er muss krank gewesen sein.</b> — Он, должно быть, был болен.</div>
<div class="ex"><b>Sie soll im Lotto gewonnen haben.</b> — Говорят, она выиграла в лотерею.</div>
<div class="ex"><b>Er will es nicht gewusst haben.</b> — Он утверждает, что не знал этого.</div>
<div class="warn">Сравните: <b>Er hat arbeiten müssen.</b> — Ему пришлось работать (объективно, факт). <b>Er muss gearbeitet haben.</b> — Он, должно быть, работал (предположение). Разница — в форме инфинитива!</div>
<h3>Futur II: werden + Partizip II + haben/sein</h3>
<p>Futur II в живой речи почти всегда выражает <b>предположение о прошлом</b>, часто с <b>wohl</b>:</p>
<div class="ex"><b>Sie ist nicht da. Sie wird den Zug verpasst haben.</b> — Её нет. Наверное, она опоздала на поезд.</div>
<div class="ex"><b>Er wird wohl schon nach Hause gegangen sein.</b> — Он, видимо, уже ушёл домой.</div>
<p>Реже — действие, завершённое к моменту в будущем:</p>
<div class="ex"><b>Bis Montag werde ich den Bericht geschrieben haben.</b> — К понедельнику я напишу отчёт.</div>
<table>
<tr><th>Время предположения</th><th>Формула</th><th>Пример</th></tr>
<tr><td>о настоящем</td><td>werden + Infinitiv</td><td>Er <b>wird</b> krank <b>sein</b>.</td></tr>
<tr><td>о прошлом</td><td>werden + P II + haben/sein</td><td>Er <b>wird</b> krank <b>gewesen sein</b>.</td></tr>
</table>
<div class="tip">Запомните пару <b>soll</b> = «говорят (другие)», <b>will</b> = «говорит (он сам о себе)». Типичная фраза из новостей: <i>Der Täter <b>soll</b> durch das Fenster eingestiegen sein</i> — «по имеющимся данным, преступник проник через окно».</div>`,
  exercises: [
    { type: "choice", q: "Das Licht brennt. Er ___ zu Hause sein. (я почти уверен)", options: ["muss", "soll", "will"], a: 0,
      explain: "Вывод по признакам с высокой уверенностью (≈ 90%) → muss: «он наверняка дома». soll = «говорят», will = «он сам утверждает»." },
    { type: "choice", q: "Man sagt, sie ___ sehr reich sein. (по слухам)", options: ["soll", "will", "muss"], a: 0,
      explain: "Информация от других людей («говорят») → sollen. will означало бы, что она сама так утверждает." },
    { type: "input", q: "Er behauptet, er sei unschuldig. = Er ___ unschuldig sein.", a: ["will"],
      explain: "Субъективное wollen = человек утверждает что-то о себе самом, а говорящий сомневается." },
    { type: "choice", q: "Sie ist nicht da. Sie ___ den Zug verpasst haben. (Futur II, предположение)", options: ["wird", "würde", "wurde"], a: 0,
      explain: "Futur II = wird + Partizip II + haben — предположение о прошлом («наверное, опоздала»). wurde — Präteritum, würde — Konjunktiv II." },
    { type: "order", words: ["Er", "muss", "krank", "gewesen", "sein"], ru: "Он, должно быть, был болен.",
      explain: "Предположение о прошлом: muss + Infinitiv Perfekt (gewesen sein). muss на 2-м месте, sein — в самом конце." },
    { type: "input", q: "Sie ___ im Lotto gewonnen haben. (по слухам)", a: ["soll"],
      explain: "soll + Infinitiv Perfekt (gewonnen haben) = «говорят, что она выиграла»." },
    { type: "choice", q: "Что значит „Er will das nicht gewusst haben.“?", options: ["Он утверждает, что не знал этого.", "Он не хочет этого знать.", "Он не хотел этого знать."], a: 0,
      explain: "Субъективное wollen + Infinitiv Perfekt: он сам так утверждает (а говорящий сомневается). «Не хотел знать» было бы: Er wollte das nicht wissen." },
    { type: "choice", q: "Das ___ nicht wahr sein! (невозможно!)", options: ["kann", "soll", "will"], a: 0,
      explain: "kann nicht = 0% вероятности, «не может быть!». «Das soll nicht wahr sein» означало бы «говорят, это неправда»." },
    { type: "input", q: "Bis Montag ___ ich den Bericht geschrieben haben. (Futur II)", a: ["werde"],
      explain: "Futur II: werde + Partizip II + haben — действие, которое будет завершено к моменту в будущем (к понедельнику)." },
    { type: "choice", q: "Die Straße ist nass. Es ___ geregnet haben. (уверенный вывод)", options: ["muss", "soll", "will"], a: 0,
      explain: "Логический вывод по признакам (улица мокрая) → muss + Infinitiv Perfekt: «должно быть, шёл дождь»." },
    { type: "order", words: ["Sie", "wird", "wohl", "schon", "nach", "Hause", "gegangen", "sein"], ru: "Она, наверное, уже ушла домой.",
      explain: "Futur II + wohl = предположение о прошлом: wird на 2-м месте, в конце gegangen sein (gehen — с sein)." },
    { type: "choice", q: "Что значит „Er hat gestern lange arbeiten müssen.“?", options: ["Ему пришлось вчера долго работать.", "Он, должно быть, вчера долго работал.", "Говорят, он вчера долго работал."], a: 0,
      explain: "hat + инфинитив + müssen (Perfekt) — объективное значение, факт. Предположение звучало бы: Er muss lange gearbeitet haben." },
    { type: "input", q: "Er ___ etwa 40 Jahre alt sein. (Konj. II от dürfen — «вероятно»)", a: ["dürfte", "duerfte"],
      explain: "dürfte (Konjunktiv II от dürfen) = «вероятно, по всей видимости» (≈ 75%)." },
    { type: "choice", q: "Der Täter ___ durch das Fenster eingestiegen sein. (так сообщает полиция)", options: ["soll", "will", "muss"], a: 0,
      explain: "Информация из чужого источника (полиция) → sollen. will значило бы, что так утверждает сам преступник." }
  ]
});
