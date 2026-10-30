DE.grammar.push({
  id: "modal_verbs",
  title: "Модальные глаголы и рамка",
  level: "A1",
  emoji: "💪",
  summary: "können, müssen, wollen, dürfen, sollen, mögen/möchten + инфинитив в конце",
  content: `<p>Модальные глаголы выражают <b>отношение</b> к действию: могу, должен, хочу, можно… Они почти всегда работают в паре с другим глаголом в инфинитиве.</p>

<table>
<tr><th></th><th>können<br>мочь, уметь</th><th>müssen<br>должен, надо</th><th>wollen<br>хотеть</th><th>dürfen<br>можно (разрешено)</th><th>sollen<br>следует, велено</th><th>mögen<br>любить, нравиться</th><th>möchten<br>хотел бы</th></tr>
<tr><td>ich</td><td><b>kann</b></td><td><b>muss</b></td><td><b>will</b></td><td><b>darf</b></td><td><b>soll</b></td><td><b>mag</b></td><td>möchte</td></tr>
<tr><td>du</td><td>kannst</td><td>musst</td><td>willst</td><td>darfst</td><td>sollst</td><td>magst</td><td>möchtest</td></tr>
<tr><td>er/sie/es</td><td><b>kann</b></td><td><b>muss</b></td><td><b>will</b></td><td><b>darf</b></td><td><b>soll</b></td><td><b>mag</b></td><td>möchte</td></tr>
<tr><td>wir</td><td>können</td><td>müssen</td><td>wollen</td><td>dürfen</td><td>sollen</td><td>mögen</td><td>möchten</td></tr>
<tr><td>ihr</td><td>könnt</td><td>müsst</td><td>wollt</td><td>dürft</td><td>sollt</td><td>mögt</td><td>möchtet</td></tr>
<tr><td>sie/Sie</td><td>können</td><td>müssen</td><td>wollen</td><td>dürfen</td><td>sollen</td><td>mögen</td><td>möchten</td></tr>
</table>

<div class="tip">Две закономерности: 1) в ед. числе корень обычно меняется (k<b>ö</b>nnen → k<b>a</b>nn, m<b>ü</b>ssen → m<b>u</b>ss; не меняется только у sollen), а во мн. числе всё как в инфинитиве; 2) <span class="hl">ich = er</span>, и у них <b>нет окончания</b>: ich kann, er kann (не «er kannt»!). Исключение — möchten: ich/er möchte.</div>

<h3>Рамка предложения</h3>
<p>Модальный глагол стоит на <b>2-м месте</b> (спрягается), а смысловой глагол — <b>в самом конце</b> в инфинитиве. Получается «рамка», в которую вставляется всё остальное.</p>
<table>
<tr><th>1</th><th>2 (модальный)</th><th>середина</th><th>конец (инфинитив)</th></tr>
<tr><td>Ich</td><td><b>kann</b></td><td>sehr gut</td><td><b>schwimmen</b>.</td></tr>
<tr><td>Heute</td><td><b>muss</b></td><td>er lange</td><td><b>arbeiten</b>.</td></tr>
<tr><td>—</td><td><b>Kannst</b></td><td>du mir</td><td><b>helfen</b>?</td></tr>
</table>

<div class="ex"><b>Ich möchte einen Kaffee trinken.</b> — Я хотел бы выпить кофе.</div>
<div class="ex"><b>Hier darf man nicht rauchen.</b> — Здесь нельзя курить.</div>
<div class="ex"><b>Du sollst mehr Wasser trinken.</b> — Тебе следует пить больше воды (так сказал врач).</div>
<div class="ex"><b>Ich mag Pizza.</b> — Я люблю пиццу. (mögen чаще всего — без второго глагола)</div>

<div class="warn"><b>nicht müssen ≠ «нельзя»!</b> «Du musst nicht kommen» = тебе <b>не нужно</b> приходить. «Нельзя» = <b>nicht dürfen</b>: «Du darfst nicht kommen» — тебе нельзя приходить.</div>
<p><b>möchten</b> — вежливее, чем wollen: в кафе и магазине говорите «Ich möchte…», а не «Ich will…».</p>`,
  exercises: [
    { type: "choice", q: "Ich ___ gut schwimmen.", options: ["kann", "kanne", "könnt"], a: 0,
      explain: "können: ich kann — без окончания и без умлаута. könnt — форма для ihr." },
    { type: "input", q: "Du ___ heute arbeiten. (müssen)", a: ["musst"],
      explain: "müssen: у du умлаут пропадает — du musst (не «müsst», это ihr)." },
    { type: "choice", q: "Er ___ ein Eis essen. (хочет)", options: ["willt", "will", "wollt"], a: 1,
      explain: "wollen: er will — как ich, без окончания -t. wollt — форма для ihr." },
    { type: "order", words: ["Ich", "möchte", "einen", "Kaffee", "trinken"], ru: "Я хотел бы выпить кофе.",
      explain: "Модальный глагол möchte на 2-м месте, инфинитив trinken — в самом конце (рамка)." },
    { type: "choice", q: "Hier ___ man nicht rauchen. (запрещено)", options: ["darf", "muss", "mag"], a: 0,
      explain: "Запрет = nicht dürfen: Hier darf man nicht rauchen. «muss nicht» значит «не обязательно», а не «нельзя»." },
    { type: "input", q: "Wir ___ ins Kino gehen. (wollen)", a: ["wollen"],
      explain: "wir wollen — форма совпадает с инфинитивом; gehen стоит в конце." },
    { type: "order", words: ["Kannst", "du", "mir", "helfen"], ru: "Ты можешь мне помочь?",
      explain: "Вопрос да/нет: модальный глагол kannst первым, инфинитив helfen в конце. helfen + Dativ: mir." },
    { type: "choice", q: "Где стоит смысловой глагол в предложении с модальным глаголом?", options: ["на 2-м месте", "в конце", "сразу после модального глагола"], a: 1,
      explain: "Рамка: модальный глагол — на 2-м месте, смысловой глагол (инфинитив) — в самом конце: Ich kann gut schwimmen." },
    { type: "input", q: "___ ich hier parken? (dürfen)", a: ["Darf"],
      explain: "dürfen: ich darf (без окончания). Просьба о разрешении: Darf ich hier parken?" },
    { type: "choice", q: "Ich ___ Schokolade. (люблю)", options: ["mag", "mögt", "magst"], a: 0,
      explain: "mögen: ich mag (без окончания). magst — для du, mögt — для ihr." },
    { type: "choice", q: "Morgen ist Sonntag. Du ___ nicht früh aufstehen. (не нужно)", options: ["darfst", "musst", "kannst"], a: 1,
      explain: "nicht müssen = не нужно, не обязательно. «darfst nicht» значило бы «тебе нельзя»." },
    { type: "input", q: "Was ___ Sie trinken? (möchten)", a: ["möchten", "moechten"],
      explain: "Вежливое Sie → möchten (как инфинитив-форма wir/sie)." },
    { type: "order", words: ["Er", "muss", "heute", "lange", "arbeiten"], ru: "Сегодня ему нужно долго работать.",
      alts: [["heute", "muss", "Er", "lange", "arbeiten"]],
      explain: "muss — на 2-м месте, arbeiten — в конце. Если начать с heute, подлежащее er идёт после muss: Heute muss er lange arbeiten." },
    { type: "input", q: "Ihr ___ hier nicht spielen. (sollen)", a: ["sollt"],
      explain: "sollen: ihr sollt (окончание -t, как у обычных глаголов)." }
  ]
});
