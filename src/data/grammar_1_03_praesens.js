DE.grammar.push({
  id: "praesens",
  title: "Настоящее время: правильные глаголы",
  level: "A1",
  emoji: "🕐",
  summary: "Основа + -e, -st, -t, -en, -t, -en",
  content: `<p>Почти все немецкие глаголы в начальной форме оканчиваются на <b>-en</b> (machen, wohnen) или <b>-n</b> (wandern). Отбросьте это окончание — получите <b>основу</b>: mach-, wohn-, lern-. К основе добавляем личные окончания.</p>

<table>
<tr><th>Лицо</th><th>Окончание</th><th>machen</th><th>wohnen</th></tr>
<tr><td>ich</td><td><b>-e</b></td><td>mache</td><td>wohne</td></tr>
<tr><td>du</td><td><b>-st</b></td><td>machst</td><td>wohnst</td></tr>
<tr><td>er / sie / es</td><td><b>-t</b></td><td>macht</td><td>wohnt</td></tr>
<tr><td>wir</td><td><b>-en</b></td><td>machen</td><td>wohnen</td></tr>
<tr><td>ihr</td><td><b>-t</b></td><td>macht</td><td>wohnt</td></tr>
<tr><td>sie / Sie</td><td><b>-en</b></td><td>machen</td><td>wohnen</td></tr>
</table>

<div class="tip">Запомните «скелет» окончаний: <span class="hl">e – st – t – en – t – en</span>. Формы wir, sie и Sie всегда совпадают с инфинитивом — их учить не надо!</div>

<h3>Основа на -t, -d (и -chn, -ffn, -gn)</h3>
<p>Сказать «arbeitst» трудно, поэтому вставляем <b>-e-</b> в формах du, er, ihr:</p>
<table>
<tr><th></th><th>arbeiten</th><th>finden</th><th>öffnen</th></tr>
<tr><td>du</td><td>arbeit<b>e</b>st</td><td>find<b>e</b>st</td><td>öffn<b>e</b>st</td></tr>
<tr><td>er / sie / es</td><td>arbeit<b>e</b>t</td><td>find<b>e</b>t</td><td>öffn<b>e</b>t</td></tr>
<tr><td>ihr</td><td>arbeit<b>e</b>t</td><td>find<b>e</b>t</td><td>öffn<b>e</b>t</td></tr>
</table>
<p>Так же: warten (du wartest), reden, kosten (es kostet), rechnen, regnen (es regnet).</p>

<h3>Основа на -s, -ß, -z, -x</h3>
<p>У du «s» уже есть в основе, поэтому добавляем только <b>-t</b>:</p>
<div class="ex"><b>heißen → du heißt</b> (не «heißst»), <b>tanzen → du tanzt</b>, <b>reisen → du reist</b>, <b>sitzen → du sitzt</b>.</div>

<h3>Одно время — много значений</h3>
<p>В немецком нет отдельного «продолжительного» времени. Präsens = «делаю», «сейчас делаю» и часто «сделаю/буду делать» (с указанием времени).</p>
<div class="ex"><b>Ich höre jetzt Musik.</b> — Я сейчас слушаю музыку.</div>
<div class="ex"><b>Morgen arbeite ich nicht.</b> — Завтра я не работаю (не буду работать).</div>
<div class="ex"><b>Wie heißt du? — Ich heiße Pavel.</b> — Как тебя зовут? — Меня зовут Павел.</div>`,
  exercises: [
    { type: "choice", q: "Ich ___ in Berlin. (wohnen)", options: ["wohne", "wohnst", "wohnt"], a: 0,
      explain: "ich → окончание -e: ich wohne. wohnst — для du, wohnt — для er/ihr." },
    { type: "input", q: "Du ___ Deutsch. (lernen)", a: ["lernst"],
      explain: "du → окончание -st: du lernst." },
    { type: "input", q: "Er ___ viel. (arbeiten)", a: ["arbeitet"],
      explain: "Основа arbeit- кончается на -t, поэтому перед -t вставляем -e-: er arbeitet (не «arbeitt»)." },
    { type: "choice", q: "Du ___ Max, oder? (heißen)", options: ["heißst", "heißt", "heißest"], a: 1,
      explain: "Основа heiß- уже кончается на -ß, поэтому у du добавляется только -t: du heißt (не «heißst»)." },
    { type: "input", q: "Wir ___ Fußball. (spielen)", a: ["spielen"],
      explain: "Форма wir совпадает с инфинитивом: wir spielen." },
    { type: "choice", q: "Ihr ___ auf den Bus. (warten)", options: ["wartt", "wartet", "warten"], a: 1,
      explain: "Основа wart- кончается на -t → вставляем -e-: ihr wartet. «warten» — форма для wir/sie." },
    { type: "order", words: ["Wir", "wohnen", "in", "München"], ru: "Мы живём в Мюнхене.",
      alts: [["in", "München", "wohnen", "Wir"]],
      explain: "Глагол wohnen стоит на втором месте: Wir wohnen in München. Можно начать с места — тогда подлежащее идёт после глагола: In München wohnen wir." },
    { type: "input", q: "Du ___ sehr gut. (tanzen)", a: ["tanzt"],
      explain: "Основа tanz- кончается на -z, поэтому у du только -t: du tanzt (не «tanzst»)." },
    { type: "choice", q: "Was ___ du am Abend? (machen)", options: ["macht", "machst", "machen"], a: 1,
      explain: "du → -st: du machst. macht — форма для er/ihr." },
    { type: "choice", q: "Es ___ heute. (regnen)", options: ["regnt", "regnet", "regnen"], a: 1,
      explain: "Основа regn- кончается на согласный + n, поэтому вставляем -e-: es regnet (иначе не выговорить «regnt»)." },
    { type: "input", q: "Er ___ das Fenster. (öffnen)", a: ["öffnet", "oeffnet"],
      explain: "Основа öffn- кончается на согласный + n → вставляем -e-: er öffnet." },
    { type: "order", words: ["Was", "machst", "du", "heute"], ru: "Что ты делаешь сегодня?",
      explain: "W-вопрос: вопросительное слово (Was), затем глагол (machst), затем подлежащее (du), затем остальное (heute)." },
    { type: "choice", q: "Как сказать «Я сейчас слушаю музыку»?", options: ["Ich bin hören Musik.", "Ich höre jetzt Musik.", "Ich hören jetzt Musik."], a: 1,
      explain: "В немецком нет продолжительного времени: «я сейчас слушаю» = просто Präsens ich höre. «Ich bin hören» — калька с английского, так нельзя." },
    { type: "input", q: "Das Buch ___ zehn Euro. (kosten)", a: ["kostet"],
      explain: "Основа kost- кончается на -t → вставляем -e-: es kostet." }
  ]
});
