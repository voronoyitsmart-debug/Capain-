DE.grammar.push({
  id: "participiu_adjectival",
  title: "Причастие как прилагательное и причастные обороты",
  level: "C1",
  emoji: "✍️",
  summary: "cartea scrisă de Eminescu, frunze căzute, odată terminată lucrarea",
  content: `<p>Румынское причастие (participiu) — не только часть perfect compus. Оно легко становится <b>прилагательным</b>: стоит после существительного и согласуется с ним в роде и числе.</p>

<h3>Четыре формы причастия</h3>
<table>
<tr><th>Глагол</th><th>м. р. ед.</th><th>ж. р. ед.</th><th>м. р. мн.</th><th>ж. р. мн.</th></tr>
<tr><td>a lucra</td><td>lucrat</td><td>lucrată</td><td>lucrați</td><td>lucrate</td></tr>
<tr><td>a face</td><td>făcut</td><td>făcută</td><td>făcuți</td><td>făcute</td></tr>
<tr><td>a citi</td><td>citit</td><td>citită</td><td>citiți</td><td>citite</td></tr>
<tr><td>a scrie</td><td>scris</td><td>scrisă</td><td>scriși</td><td>scrise</td></tr>
<tr><td>a sparge</td><td>spart</td><td>spartă</td><td>sparți</td><td>sparte</td></tr>
</table>
<p>В мужском множественном <b>-t → -ți</b>, <b>-s → -și</b>: făcuți, scriși.</p>

<h3>Причастный оборот</h3>
<p>Причастие с зависимыми словами (часто с <b>de</b> = «кем») — аналог русского причастного оборота:</p>
<div class="ex"><b>o carte scrisă de un autor român</b> — книга, написанная румынским автором</div>
<div class="ex"><b>Romanul scris de Rebreanu a devenit celebru.</b> — Роман, написанный Ребряну, стал знаменитым.</div>

<h3>Значение: пассивное или результативное</h3>
<p>От переходных глаголов причастие пассивное (<i>scrisoarea trimisă</i> — отправленное письмо). От непереходных глаголов движения и состояния — <b>активное</b>, результат:</p>
<div class="ex"><b>frunzele căzute</b> — опавшие листья; <b>studenții veniți din Moldova</b> — студенты, приехавшие из Молдовы; <b>copiii răniți</b> — раненые дети.</div>

<div class="warn">Русские действительные причастия настоящего времени («читающий», «работающий») причастием <b>не</b> переводятся. Используйте придаточное с <b>care</b>: <i>omul care citește ziarul</i> — человек, читающий газету.</div>

<h3>Обособленный оборот с odată</h3>
<p>Конструкция <b>odată + причастие</b> = «как только / после того как». Причастие согласуется с существительным оборота:</p>
<div class="ex"><b>Odată terminată lucrarea, am plecat acasă.</b> — Как только работа была закончена, я ушёл домой.</div>
<div class="ex"><b>Odată ajunși acasă, copiii s-au culcat.</b> — Придя домой, дети легли спать.</div>
<p>Можно и без odată, в книжном стиле: <i>Terminată lucrarea, am plecat.</i></p>

<h3>Отрицание приставкой ne-</h3>
<p><b>ne-</b> + причастие = «не-…-нный»: <i>o problemă nerezolvată</i> (нерешённая проблема), <i>o carte necitită</i>, <i>un oaspete nepoftit</i> (незваный гость).</p>

<div class="tip">Не путайте <span class="hl">odată</span> (слитно: «как только; однажды; когда-то») и <span class="hl">o dată</span> (раздельно: «один раз»). Проверка: если можно сказать «de două ori» (два раза) — пишите раздельно: <i>Am fost la Paris o dată.</i></div>`,
  exercises: [
    { type: "choice", q: "Am citit o carte ___ de un autor român.", options: ["scrisă", "scris", "scrise"], a: 0,
      explain: "Carte — ж. р. ед. ч., причастие согласуется: scrisă." },
    { type: "input", q: "Ferestrele ___ trebuie reparate. (a sparge)", a: ["sparte"],
      explain: "Ferestre — ж. р. мн. ч.: spart → sparte («разбитые окна»)." },
    { type: "input", q: "Copiii ___ au fost duși la spital. (a răni)", a: ["răniți"],
      explain: "Copii — м. р. мн. ч.: rănit → răniți (t → ț)." },
    { type: "choice", q: "Odată ___ lucrarea, am plecat acasă.", options: ["terminată", "terminat", "terminate"], a: 0,
      explain: "В обороте с odată причастие согласуется с lucrarea (ж. р. ед. ч.): terminată." },
    { type: "choice", q: "Как перевести «человек, читающий газету»?", options: ["omul care citește ziarul", "omul citit ziarul", "omul cititor ziarul"], a: 0,
      explain: "Действительное причастие настоящего времени передаётся придаточным с care." },
    { type: "order", words: ["Odată", "ajunși", "acasă,", "copiii", "s-au", "culcat"], ru: "Придя домой, дети легли спать.",
      explain: "Odată + причастие; ajunși согласуется с copiii (м. р. мн. ч.)." },
    { type: "choice", q: "Toamna, aleea e plină de frunze ___. (a cădea)", options: ["căzute", "căzuți", "căzând"], a: 0,
      explain: "Frunze — ж. р. мн. ч.: căzut → căzute. От непереходного глагола причастие активное: «опавшие»." },
    { type: "input", q: "Avem încă multe probleme ___. (нерешённые: ne- + a rezolva)", a: ["nerezolvate"],
      explain: "Ne- + причастие, согласованное с probleme (ж. р. мн. ч.): nerezolvate." },
    { type: "choice", q: "Am fost la Paris doar ___.", options: ["o dată", "odată", "o-dată"], a: 0,
      explain: "«Один раз» пишется раздельно: o dată (можно заменить на «de două ori»)." },
    { type: "choice", q: "___ semnat contractul, începem lucrul.", options: ["Odată", "O dată", "Dată"], a: 0,
      explain: "«Как только» — слитно: odată + причастие (semnat согласуется с contractul, ср. р. ед. ч.)." },
    { type: "order", words: ["Romanul", "scris", "de", "Rebreanu", "a", "devenit", "celebru"], ru: "Роман, написанный Ребряну, стал знаменитым.",
      explain: "Причастный оборот стоит сразу после существительного: romanul scris de Rebreanu." },
    { type: "input", q: "Studenții ___ din Moldova locuiesc în cămin. (a veni — «приехавшие»)", a: ["veniți"],
      explain: "Venit → veniți (м. р. мн. ч.); от непереходного a veni причастие имеет активное значение." },
    { type: "choice", q: "Cartofii ___ sunt delicioși.", options: ["prăjiți", "prăjit", "prăjite"], a: 0,
      explain: "Cartofi — м. р. мн. ч.: prăjit → prăjiți." }
  ]
});
