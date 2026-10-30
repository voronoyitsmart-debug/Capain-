DE.grammar.push({
  id: "konjunktiv2_past",
  title: "Konjunktiv II прошедшего времени",
  level: "B2",
  emoji: "⏪",
  summary: "hätte gemacht, wäre gekommen, hätte machen sollen, als ob …",
  content: `<p>Konjunktiv II прошедшего времени нужен, когда мы говорим о <b>нереальном прошлом</b>: что могло бы случиться, но не случилось. По-русски это «если бы … , то … бы» о прошлом, сожаления и упрёки.</p>
<h3>Образование</h3>
<p><span class="hl">hätte / wäre + Partizip II</span>. Выбор между hätte и wäre — такой же, как haben/sein в Perfekt.</p>
<table>
<tr><th>Perfekt (реальность)</th><th>Konjunktiv II Vergangenheit</th></tr>
<tr><td>Ich <b>habe</b> das gewusst.</td><td>Ich <b>hätte</b> das gewusst.</td></tr>
<tr><td>Er <b>ist</b> gekommen.</td><td>Er <b>wäre</b> gekommen.</td></tr>
<tr><td>Wir <b>sind</b> geblieben.</td><td>Wir <b>wären</b> geblieben.</td></tr>
</table>
<table>
<tr><th>Лицо</th><th>haben</th><th>sein</th></tr>
<tr><td>ich</td><td>hätte</td><td>wäre</td></tr>
<tr><td>du</td><td>hättest</td><td>wär(e)st</td></tr>
<tr><td>er/sie/es</td><td>hätte</td><td>wäre</td></tr>
<tr><td>wir / sie / Sie</td><td>hätten</td><td>wären</td></tr>
<tr><td>ihr</td><td>hättet</td><td>wär(e)t</td></tr>
</table>
<h3>Нереальное условие</h3>
<div class="ex"><b>Wenn ich Zeit gehabt hätte, wäre ich gekommen.</b> — Если бы у меня было время, я бы пришёл.</div>
<div class="ex"><b>Hätte ich das gewusst, hätte ich dir geholfen.</b> — Знай я это, я бы тебе помог. (без wenn — глагол на 1-м месте)</div>
<h3>Сожаления и упрёки</h3>
<div class="ex"><b>Hätte ich doch mehr gelernt!</b> — Если бы я только больше учился!</div>
<div class="ex"><b>Wenn du nur früher angerufen hättest!</b> — Если бы ты только позвонил раньше!</div>
<h3>С модальными глаголами: двойной инфинитив</h3>
<p><span class="hl">hätte + Infinitiv + Modalverb (Inf.)</span> — модальный глагол стоит в форме инфинитива, а не Partizip II!</p>
<table>
<tr><th>Пример</th><th>Перевод</th></tr>
<tr><td>Du <b>hättest</b> früher kommen <b>sollen</b>.</td><td>Тебе следовало прийти раньше.</td></tr>
<tr><td>Ich <b>hätte</b> das machen <b>können</b>.</td><td>Я мог бы это сделать.</td></tr>
<tr><td>Wir <b>hätten</b> nicht so viel essen <b>dürfen</b>.</td><td>Нам не стоило столько есть.</td></tr>
</table>
<div class="warn">В придаточном <b>hätte</b> встаёт <b>перед</b> двумя инфинитивами, а не в самый конец: <i>…, dass ich mehr <b>hätte</b> lernen sollen.</i></div>
<h3>als ob / als — «как будто»</h3>
<p>Для нереального сравнения: <b>als ob</b> + глагол в конце, или <b>als</b> + глагол сразу после него.</p>
<div class="ex"><b>Er tut so, als ob er nichts gehört hätte.</b> — Он делает вид, будто ничего не слышал.</div>
<div class="ex"><b>Sie sieht aus, als hätte sie nicht geschlafen.</b> — Она выглядит так, будто не спала.</div>
<div class="tip">Простой лайфхак: возьмите обычное Perfekt и замените <b>habe/bin</b> на <b>hätte/wäre</b> — получите «бы» в прошлом. <i>Ich bin geblieben</i> → <i>Ich wäre geblieben</i> («я бы остался»). Форма <b>würde</b> здесь не нужна!</div>`,
  exercises: [
    { type: "choice", q: "Wenn ich das gewusst ___, wäre ich nicht gekommen.", options: ["hätte", "wäre", "würde"], a: 0,
      explain: "wissen образует Perfekt с haben (habe gewusst) → в Konjunktiv II прошедшего: hätte gewusst. würde с Partizip II здесь не используется." },
    { type: "choice", q: "Wenn du früher losgefahren ___, hättest du den Zug erreicht.", options: ["hättest", "wärst", "würdest"], a: 1,
      explain: "losfahren — глагол движения, Perfekt с sein (bist losgefahren) → wärst losgefahren. «hättest losgefahren» — ошибка выбора вспомогательного глагола." },
    { type: "input", q: "Du ___ mich anrufen sollen! (haben, Konj. II)", a: ["hättest", "haettest"],
      explain: "Упрёк «тебе следовало бы…»: hätte + инфинитив + sollen (двойной инфинитив). Для du — hättest." },
    { type: "order", words: ["Ich", "hätte", "dir", "gern", "geholfen"], ru: "Я бы охотно тебе помог.",
      alts: [["gern", "hätte", "Ich", "dir", "geholfen"], ["dir", "hätte", "Ich", "gern", "geholfen"]],
      explain: "hätte на 2-м месте, Partizip II geholfen — в конце. На 1-м месте может стоять ich, gern или (с акцентом) dir." },
    { type: "choice", q: "Er tut so, als ob er mich nicht gesehen ___.", options: ["würde", "hätte", "wäre"], a: 1,
      explain: "als ob требует сослагательного наклонения; sehen образует Perfekt с haben → hätte gesehen. «würde gesehen» и «wäre gesehen» не образуют прошедшего времени." },
    { type: "input", q: "Wir ___ fast zu spät gekommen. (sein, Konj. II)", a: ["wären", "waeren"],
      explain: "kommen — Perfekt с sein → wären gekommen. «Fast wären wir…» = «мы чуть не опоздали» (но не опоздали)." },
    { type: "choice", q: "Sie sieht aus, als ___ sie die ganze Nacht nicht geschlafen.", options: ["hätte", "ob", "wäre"], a: 0,
      explain: "Сокращённое «als» без ob: глагол идёт сразу после als. schlafen — с haben → hätte geschlafen. «als ob» потребовал бы глагол в конце." },
    { type: "order", words: ["Hätte", "ich", "doch", "mehr", "gelernt"], ru: "Если бы я только больше учился!",
      explain: "Нереальное желание без wenn: hätte стоит на 1-м месте, частица doch усиливает сожаление, Partizip II — в конце." },
    { type: "choice", q: "Ich weiß, dass ich mehr ___.", options: ["hätte lernen sollen", "lernen sollen hätte", "hätte sollen lernen"], a: 0,
      explain: "Особое правило: при двойном инфинитиве в придаточном hätte стоит перед обоими инфинитивами, а модальный глагол — в самом конце: hätte lernen sollen." },
    { type: "input", q: "Ohne deine Hilfe ___ ich die Prüfung nicht bestanden. (haben)", a: ["hätte", "haette"],
      explain: "«Без твоей помощи» = нереальное условие (ты помог). bestehen — с haben → hätte … bestanden." },
    { type: "choice", q: "An deiner Stelle ___ ich das nicht gesagt.", options: ["hätte", "wäre", "würde"], a: 0,
      explain: "sagen образует Perfekt с haben → hätte gesagt («я бы этого не сказал»). «würde gesagt» — неверная форма." },
    { type: "order", words: ["Wenn", "es", "nicht", "geregnet", "hätte,", "wären", "wir", "gewandert"], ru: "Если бы не шёл дождь, мы бы пошли в поход.",
      explain: "В придаточном с wenn hätte стоит в конце. Придаточное занимает 1-е место, поэтому главное начинается с глагола: wären wir gewandert (wandern — с sein)." },
    { type: "input", q: "Das ___ man besser machen können. (haben)", a: ["hätte", "haette"],
      explain: "hätte + инфинитив + können = «можно было бы (но не сделали)». Модальный глагол стоит в инфинитиве, а не gekonnt." }
  ]
});
