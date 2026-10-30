DE.grammar.push({
  id: "nebensatz_weil_dass",
  title: "Придаточные: weil, dass, wenn, ob",
  level: "A2",
  emoji: "🧩",
  summary: "…, weil ich krank bin — в придаточном глагол уходит в конец",
  content: `<p>Придаточное предложение (<b>Nebensatz</b>) начинается с подчинительного союза и отделяется <b>запятой</b>. Главное правило: спрягаемый глагол уходит <b>в самый конец</b>.</p>

<table>
<tr><th>Главное</th><th>,</th><th>Союз</th><th>Середина</th><th>Глагол (конец)</th></tr>
<tr><td>Ich bleibe zu Hause</td><td>,</td><td><b>weil</b></td><td>ich krank</td><td><b>bin</b>.</td></tr>
<tr><td>Ich glaube</td><td>,</td><td><b>dass</b></td><td>er heute</td><td><b>kommt</b>.</td></tr>
<tr><td>Ich weiß nicht</td><td>,</td><td><b>ob</b></td><td>sie Zeit</td><td><b>hat</b>.</td></tr>
</table>

<h3>Четыре важных союза</h3>
<table>
<tr><th>Союз</th><th>Значение</th><th>Пример</th></tr>
<tr><td><b>weil</b></td><td>потому что</td><td>…, weil der Bus Verspätung hat.</td></tr>
<tr><td><b>dass</b></td><td>что (не вопрос!)</td><td>Er sagt, dass er müde ist.</td></tr>
<tr><td><b>wenn</b></td><td>если; когда (повторяющееся)</td><td>Wenn es regnet, bleibe ich zu Hause.</td></tr>
<tr><td><b>ob</b></td><td>ли</td><td>Ich frage, ob du mitkommst.</td></tr>
</table>

<div class="tip"><b>ob = «ли».</b> Если в русском предложении есть частица «ли» — ставьте ob: «Я не знаю, придёт <b>ли</b> он» → <i>Ich weiß nicht, <b>ob</b> er kommt.</i> Без «ли» — «Я знаю, <b>что</b> он придёт» → <i>Ich weiß, <b>dass</b> er kommt.</i></div>

<h3>Сложные сказуемые</h3>
<p>Спрягаемая часть встаёт <b>последней</b>, после инфинитива или Partizip II:</p>
<div class="ex"><b>…, weil ich heute arbeiten muss.</b> — …потому что мне сегодня нужно работать.</div>
<div class="ex"><b>…, weil ich schlecht geschlafen habe.</b> — …потому что я плохо спал.</div>
<p>Отделяемая приставка в придаточном <b>снова прилипает</b> к глаголу:</p>
<div class="ex"><b>Ich freue mich, wenn du mich anrufst.</b> — Я радуюсь, когда ты мне звонишь. (anrufen: du rufst an → …, wenn du anrufst)</div>

<h3>Придаточное в начале</h3>
<p>Если придаточное стоит первым, оно занимает позицию 1. Значит, глагол главного предложения идёт сразу после запятой — получается «<b>глагол, глагол</b>»:</p>
<div class="ex"><b>Wenn ich Zeit habe, komme ich.</b> — Если у меня будет время, я приду.</div>
<div class="ex"><b>Weil es kalt ist, trage ich eine Mütze.</b> — Так как холодно, я ношу шапку.</div>

<div class="warn"><b>weil</b> vs <b>denn</b>: смысл одинаковый, порядок разный.<br>…, <b>denn</b> ich <b>bin</b> krank. (глагол на 2-м месте)<br>…, <b>weil</b> ich krank <b>bin</b>. (глагол в конце)</div>

<p>Запятая перед weil, dass, wenn, ob ставится <b>всегда</b> — как и в русском перед «что», «потому что», «если».</p>`,
  exercises: [
    { type: "choice", q: "Ich bleibe zu Hause, weil ___.", options: ["ich bin krank", "ich krank bin", "bin ich krank"], a: 1,
      explain: "После weil глагол уходит в конец: weil ich krank bin." },
    { type: "choice", q: "Ich weiß nicht, ___ er heute kommt. (придёт ли)", options: ["dass", "ob", "wenn"], a: 1,
      explain: "Косвенный вопрос «придёт ли» → ob. dass — «что», wenn — «если/когда»." },
    { type: "input", q: "Ich glaube, ___ das richtig ist. (что)", a: ["dass"],
      explain: "«что» (не вопрос, а содержание мысли) → dass; глагол ist в конце." },
    { type: "order", words: ["Ich", "lerne", "Deutsch,", "weil", "ich", "in", "Wien", "arbeiten", "möchte"], ru: "Я учу немецкий, потому что хочу работать в Вене.",
      explain: "В придаточном спрягаемый möchte — в самом конце, после инфинитива." },
    { type: "choice", q: "Wenn ich Zeit habe, ___.", options: ["ich komme", "komme ich", "ich kommen"], a: 1,
      explain: "Придаточное занимает позицию 1 → в главном глагол сразу после запятой: komme ich." },
    { type: "input", q: "Ruf mich an, ___ du in Berlin bist! (когда)", a: ["wenn"],
      explain: "«когда/если» в настоящем и будущем → wenn; глагол bist в конце придаточного. als — только для однократного прошлого." },
    { type: "choice", q: "Er sagt, dass ___.", options: ["er kommt morgen", "er morgen kommt", "kommt er morgen"], a: 1,
      explain: "dass → глагол в конец: dass er morgen kommt." },
    { type: "order", words: ["Weißt", "du,", "ob", "der", "Laden", "heute", "offen", "ist"], ru: "Ты не знаешь, открыт ли сегодня магазин?",
      alts: [["Weißt", "du,", "ob", "heute", "der", "Laden", "offen", "ist"]],
      explain: "ob = «ли»; глагол ist — в конце придаточного. Weißt du — вопрос, глагол на 1-м месте." },
    { type: "choice", q: "Ich bin müde, weil ich schlecht ___.", options: ["geschlafen habe", "habe geschlafen", "schlafe habe"], a: 0,
      explain: "Perfekt в придаточном: Partizip II, затем habe в самом конце." },
    { type: "input", q: "Ich frage ihn, ___ er Zeit hat. (есть ли)", a: ["ob"],
      explain: "Косвенный вопрос «есть ли» → ob; hat — в конце. dass здесь не подходит: это вопрос, а не утверждение." },
    { type: "choice", q: "Ich freue mich, wenn du ___.", options: ["anrufst", "rufst an", "an rufst"], a: 0,
      explain: "В придаточном отделяемая приставка не отделяется: anrufst." },
    { type: "order", words: ["Wenn", "es", "regnet,", "bleiben", "wir", "zu", "Hause"], ru: "Если идёт дождь, мы остаёмся дома.",
      explain: "Придаточное занимает 1-е место → «глагол, глагол»: regnet, bleiben; подлежащее wir — после bleiben." },
    { type: "choice", q: "Ich komme nicht, ___ ich arbeiten muss.", options: ["denn", "weil", "dass"], a: 1,
      explain: "Глагол muss стоит в конце → нужен weil. С denn было бы «denn ich muss arbeiten»." },
    { type: "input", q: "Es ist schön, ___ du hier bist. (что)", a: ["dass"],
      explain: "Es ist schön, dass… — «хорошо, что…»: dass, глагол bist в конце." }
  ]
});
