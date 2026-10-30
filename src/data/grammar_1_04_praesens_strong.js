DE.grammar.push({
  id: "praesens_strong",
  title: "Глаголы с изменением корня",
  level: "A1",
  emoji: "🔄",
  summary: "e→i, e→ie, a→ä, au→äu: du sprichst, er fährt + wissen",
  content: `<p>Некоторые частые (сильные) глаголы в настоящем времени меняют гласный корня. Окончания при этом обычные, а меняются <b>только формы du и er/sie/es</b>.</p>

<table>
<tr><th>Тип</th><th>Инфинитив</th><th>ich</th><th>du</th><th>er / sie / es</th><th>wir</th></tr>
<tr><td><b>e → i</b></td><td>sprechen</td><td>spreche</td><td>spr<b>i</b>chst</td><td>spr<b>i</b>cht</td><td>sprechen</td></tr>
<tr><td><b>e → ie</b></td><td>sehen</td><td>sehe</td><td>s<b>ie</b>hst</td><td>s<b>ie</b>ht</td><td>sehen</td></tr>
<tr><td><b>a → ä</b></td><td>fahren</td><td>fahre</td><td>f<b>ä</b>hrst</td><td>f<b>ä</b>hrt</td><td>fahren</td></tr>
<tr><td><b>au → äu</b></td><td>laufen</td><td>laufe</td><td>l<b>äu</b>fst</td><td>l<b>äu</b>ft</td><td>laufen</td></tr>
</table>

<h3>Частые глаголы каждого типа</h3>
<ul>
<li><b>e → i:</b> sprechen (говорить), essen (есть: du <b>isst</b>, er <b>isst</b>), helfen (помогать), geben (давать), treffen (встречать: du <b>triffst</b>), nehmen (брать: du <b>nimmst</b>, er <b>nimmt</b>)</li>
<li><b>e → ie:</b> sehen (видеть), lesen (читать: du <b>liest</b>, er <b>liest</b>), empfehlen (рекомендовать)</li>
<li><b>a → ä:</b> fahren (ехать), schlafen (спать), tragen (нести, носить), waschen (мыть), halten (держать: du <b>hältst</b>, er <b>hält</b>)</li>
<li><b>au → äu:</b> laufen (бегать, идти пешком)</li>
</ul>

<div class="tip">Представьте, что <b>du</b> и <b>er</b> — два капризных брата: только им нужен «особый» корень. Ich, wir, ihr, sie — спокойные, у них всё как в инфинитиве: <span class="hl">ihr seht, ihr fahrt, ihr esst</span>.</div>

<div class="warn">У nehmen меняются и согласные: du <b>nimmst</b>, er <b>nimmt</b>. А у essen и lesen основа заканчивается на -s, поэтому du <b>isst</b>, du <b>liest</b> (как er).</div>

<h3>Особый глагол wissen (знать)</h3>
<table>
<tr><th>ich</th><th>du</th><th>er / sie / es</th><th>wir</th><th>ihr</th><th>sie / Sie</th></tr>
<tr><td><b>weiß</b></td><td><b>weißt</b></td><td><b>weiß</b></td><td>wissen</td><td>wisst</td><td>wissen</td></tr>
</table>
<p>Обратите внимание: у ich и er одинаковая форма <b>без окончания</b> — как у модальных глаголов. wissen = знать <b>факт</b> (что, где, когда), а «знать человека или место» — kennen.</p>

<div class="ex"><b>Du sprichst sehr gut Deutsch!</b> — Ты очень хорошо говоришь по-немецки!</div>
<div class="ex"><b>Er fährt morgen nach Hamburg.</b> — Завтра он едет в Гамбург.</div>
<div class="ex"><b>Was liest du gerade?</b> — Что ты сейчас читаешь?</div>
<div class="ex"><b>Ich weiß es nicht.</b> — Я этого не знаю.</div>`,
  exercises: [
    { type: "choice", q: "Du ___ gut Deutsch. (sprechen)", options: ["sprechst", "sprichst", "spricht"], a: 1,
      explain: "e → i у du: du sprichst. spricht — форма для er." },
    { type: "input", q: "Er ___ ein Buch. (lesen)", a: ["liest"],
      explain: "lesen меняет e → ie у du и er: er liest. Основа на -s, поэтому окончание только -t." },
    { type: "input", q: "Sie ___ nach Hamburg. (fahren, она)", a: ["fährt", "faehrt"],
      explain: "fahren меняет a → ä у du и er/sie/es: sie fährt." },
    { type: "choice", q: "Wir ___ Pizza. (essen)", options: ["isst", "essen", "esst"], a: 1,
      explain: "У wir корень не меняется: wir essen. isst — для du/er, esst — для ihr." },
    { type: "choice", q: "___ du, wo Anna wohnt?", options: ["Weißt", "Wisst", "Weiß"], a: 0,
      explain: "wissen: du weißt. weiß — для ich/er, wisst — для ihr." },
    { type: "input", q: "Ich ___ es nicht. (wissen)", a: ["weiß", "weiss"],
      explain: "wissen — особый глагол: ich weiß без окончания -e (как er weiß)." },
    { type: "input", q: "Du ___ zu lange. (schlafen)", a: ["schläfst", "schlaefst"],
      explain: "schlafen меняет a → ä у du: du schläfst." },
    { type: "choice", q: "Er ___ jeden Morgen. (laufen)", options: ["lauft", "läuft", "läufst"], a: 1,
      explain: "laufen меняет au → äu у du и er: er läuft. läufst — форма для du." },
    { type: "choice", q: "Was ___ du? (nehmen)", options: ["nehmst", "nimmst", "nimmt"], a: 1,
      explain: "nehmen меняет e → i и удваивает m: du nimmst. nimmt — форма для er." },
    { type: "input", q: "Ihr ___ den Film. (sehen)", a: ["seht"],
      explain: "У ihr корень не меняется: ihr seht (не «sieht» — это er)." },
    { type: "order", words: ["Was", "isst", "du", "gern"], ru: "Что ты любишь есть?",
      explain: "essen → du isst. gern = «с удовольствием, любить делать»." },
    { type: "choice", q: "Das Kind ___ der Mutter. (helfen)", options: ["helft", "hilft", "hilfst"], a: 1,
      explain: "helfen меняет e → i у er/sie/es: das Kind (es) hilft. hilfst — для du." },
    { type: "order", words: ["Fährst", "du", "morgen", "nach", "Berlin"], ru: "Ты завтра едешь в Берлин?",
      explain: "Вопрос без вопросительного слова: глагол на первом месте. fahren → du fährst." },
    { type: "input", q: "Du ___ mir das Buch. (geben)", a: ["gibst"],
      explain: "geben меняет e → i у du: du gibst." }
  ]
});
