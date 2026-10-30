DE.grammar.push({
  id: "konjunktiv2",
  title: "Сослагательное наклонение (Konjunktiv II)",
  level: "B1",
  emoji: "💭",
  summary: "würde, wäre, hätte, könnte — мечты, советы, вежливость и «если бы»",
  content: `<p><b>Konjunktiv II</b> — это немецкое «<b>бы</b>». Он нужен для нереальных ситуаций, желаний, советов и вежливых просьб.</p>
<h3>Формы</h3>
<p>Для большинства глаголов используется конструкция <span class="hl">würde + инфинитив</span> (в конце). Но у самых частых глаголов есть собственные формы — их используют вместо würde.</p>
<table>
<tr><th></th><th>werden → würde</th><th>sein → wäre</th><th>haben → hätte</th><th>können → könnte</th></tr>
<tr><td>ich</td><td>würde</td><td>wäre</td><td>hätte</td><td>könnte</td></tr>
<tr><td>du</td><td>würdest</td><td>wär(e)st</td><td>hättest</td><td>könntest</td></tr>
<tr><td>er/sie/es</td><td>würde</td><td>wäre</td><td>hätte</td><td>könnte</td></tr>
<tr><td>wir</td><td>würden</td><td>wären</td><td>hätten</td><td>könnten</td></tr>
<tr><td>ihr</td><td>würdet</td><td>wär(e)t</td><td>hättet</td><td>könntet</td></tr>
<tr><td>sie/Sie</td><td>würden</td><td>wären</td><td>hätten</td><td>könnten</td></tr>
</table>
<p>Так же: müssen → <b>müsste</b>, dürfen → <b>dürfte</b>, sollen → <b>sollte</b> (без умлаута!), wollen → <b>wollte</b>; часто ещё: wissen → wüsste, geben → es gäbe.</p>
<div class="tip">💡 Формула-подсказка: Präteritum + <b>умлаут</b> = Konjunktiv II: war → w<b>ä</b>re, hatte → h<b>ä</b>tte, konnte → k<b>ö</b>nnte, wurde → w<b>ü</b>rde.</div>
<h3>Когда употреблять</h3>
<table>
<tr><th>Функция</th><th>Пример</th></tr>
<tr><td>Вежливая просьба</td><td><b>Könnten Sie</b> mir bitte helfen? / <b>Würden Sie</b> das Fenster öffnen?</td></tr>
<tr><td>Вежливое желание</td><td>Ich <b>hätte gern</b> einen Kaffee.</td></tr>
<tr><td>Мечта</td><td>Ich <b>wäre</b> gern reich. / Ich <b>würde</b> gern nach Japan fahren.</td></tr>
<tr><td>Совет</td><td>Du <b>solltest</b> mehr schlafen. / An deiner Stelle <b>würde</b> ich zum Arzt gehen.</td></tr>
<tr><td>Нереальное условие</td><td><b>Wenn</b> ich Zeit <b>hätte</b>, <b>würde</b> ich dich besuchen.</td></tr>
<tr><td>Нереальное желание</td><td><b>Wenn</b> ich doch mehr Geld <b>hätte</b>!</td></tr>
</table>
<h3>«Если бы» — irreale Bedingung</h3>
<p>В придаточном с <b>wenn</b> глагол уходит в конец, затем после запятой — сразу глагол главного предложения:</p>
<div class="ex"><b>Wenn ich du wäre, würde ich das nicht machen.</b> — На твоём месте (если бы я был тобой) я бы этого не делал.</div>
<div class="ex"><b>Wenn es nicht regnen würde, könnten wir grillen.</b> — Если бы не шёл дождь, мы могли бы пожарить шашлыки.</div>
<div class="ex"><b>Ich würde gern mitkommen, aber ich muss arbeiten.</b> — Я бы с удовольствием пошёл с вами, но мне надо работать.</div>
<div class="warn">Не говори <i>«würde sein»</i> и <i>«würde haben»</i> — используй <b>wäre</b> и <b>hätte</b>. И не путай: <b>wurde</b> (Präteritum, «стал») ≠ <b>würde</b> («бы»).</div>`,
  exercises: [
    { type: "choice", q: "___ Sie mir bitte das Salz geben?", options: ["Könntet", "Könnten", "Konnten"], a: 1,
      explain: "Вежливая просьба на «Вы» — Konjunktiv II: Könnten Sie…? «Könntet» — форма для ihr, «Konnten» без умлаута — Präteritum («могли»)." },
    { type: "input", q: "Wenn ich Zeit ___, würde ich mitkommen. (haben)", a: ["hätte"],
      explain: "haben в Konjunktiv II — hätte (с умлаутом). «würde haben» так не говорят, а «hatte» — Präteritum." },
    { type: "choice", q: "Wenn ich reich ___, würde ich ein Haus kaufen.", options: ["war", "wäre", "würde"], a: 1,
      explain: "Нереальное условие: sein → wäre. «war» — реальное прошлое, «würde» без инфинитива здесь не работает." },
    { type: "order", words: ["Ich", "würde", "gern", "nach", "Spanien", "fahren"], ru: "Я бы с удовольствием поехал в Испанию.",
      alts: [["gern", "würde", "Ich", "nach", "Spanien", "fahren"], ["nach", "Spanien", "würde", "Ich", "gern", "fahren"]],
      explain: "würde стоит на 2-м месте, инфинитив fahren — в конце. На первое место можно поставить и gern, и nach Spanien." },
    { type: "input", q: "Du ___ mehr Wasser trinken. (sollen, совет)", a: ["solltest"],
      explain: "Совет выражается через sollte; у sollen нет умлаута в Konjunktiv II: du solltest." },
    { type: "choice", q: "Ich ___ gern ein Stück Kuchen.", options: ["hätte", "habe gehabt", "hatte"], a: 0,
      explain: "Вежливый заказ: Ich hätte gern… («Я бы хотел…»). «hatte» и «habe gehabt» — прошедшее время." },
    { type: "input", q: "An deiner Stelle ___ ich zum Arzt gehen. (werden, Konj. II)", a: ["würde"],
      explain: "Совет «на твоём месте я бы…»: würde + инфинитив gehen в конце. Не путай с wurde («стал»)." },
    { type: "choice", q: "Wenn wir ein Auto hätten, ___ wir ans Meer fahren.", options: ["können", "konnten", "könnten"], a: 2,
      explain: "Условие нереальное (hätten), поэтому и следствие в Konjunktiv II: könnten. «können» — реальность, «konnten» — Präteritum." },
    { type: "order", words: ["Wenn", "ich", "du", "wäre,", "würde", "ich", "das", "kaufen"], ru: "Если бы я был тобой, я бы это купил.",
      explain: "В придаточном с wenn глагол wäre стоит в конце; придаточное занимает 1-е место, поэтому würde идёт сразу после запятой." },
    { type: "input", q: "___ ihr uns morgen helfen? (können, вежливо)", a: ["Könntet"],
      explain: "Вежливая просьба к нескольким людям на «ты»: ihr könntet (könnte + -t)." },
    { type: "choice", q: "Как сказать «Если бы я был болен…»?", options: ["Wenn ich krank sein würde, …", "Wenn ich krank wäre, …", "Wenn ich krank war, …"], a: 1,
      explain: "Для sein используется собственная форма wäre, а не «sein würde». «Wenn ich krank war» — реальное прошлое («когда я болел»)." },
    { type: "input", q: "Wenn es doch nicht so kalt ___! (sein)", a: ["wäre"],
      explain: "Нереальное желание «если бы только…»: Wenn es doch … wäre! Глагол в конце, форма Konjunktiv II." },
    { type: "order", words: ["Würden", "Sie", "das", "Fenster", "schließen?"], ru: "Не закроете ли вы окно?",
      explain: "Вежливая просьба-вопрос: Würden Sie на первом месте, инфинитив schließen в конце." }
  ]
});
