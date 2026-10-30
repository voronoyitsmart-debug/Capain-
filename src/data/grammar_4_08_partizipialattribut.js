DE.grammar.push({
  id: "partizipialattribut",
  title: "Причастия и распространённое определение",
  level: "C1",
  emoji: "🌱",
  summary: "das schlafende Kind, das gekochte Ei, die schnell wachsende Stadt",
  content: `<p>Причастия в немецком часто работают как прилагательные и склоняются точно так же. А ещё перед ними можно «навесить» целую цепочку слов — получится <b>распространённое определение</b> (erweitertes Partizipialattribut). Это типичная черта научного и газетного стиля.</p>
<h3>Partizip I и Partizip II</h3>
<table>
<tr><th></th><th>Partizip I</th><th>Partizip II</th></tr>
<tr><td>Образование</td><td>Infinitiv + <b>d</b>: lachen<b>d</b>, schlafen<b>d</b></td><td>ge-…-t / ge-…-en: gekocht, geschrieben</td></tr>
<tr><td>Значение</td><td><b>активное</b>, одновременное действие («делающий»)</td><td><b>пассивное</b> или законченное действие («сделанный»)</td></tr>
<tr><td>Пример</td><td>das schlaf<b>ende</b> Kind — спящий ребёнок</td><td>das gekocht<b>e</b> Ei — сваренное яйцо</td></tr>
<tr><td>Как придаточное</td><td>das Kind, das schläft</td><td>das Ei, das gekocht wurde</td></tr>
</table>
<p>У глаголов движения с <b>sein</b> Partizip II имеет активный смысл: <i>der angekommene Zug</i> = der Zug, der angekommen ist (прибывший поезд).</p>
<h3>Распространённое определение</h3>
<p>Между артиклем и существительным может стоять целая группа слов — по сути, сжатое придаточное предложение:</p>
<table>
<tr><th>Придаточное</th><th>Распространённое определение</th></tr>
<tr><td>die Stadt, die schnell wächst</td><td>die <b>schnell wachsende</b> Stadt</td></tr>
<tr><td>der Kollege, der von allen geschätzt wird</td><td>der <b>von allen geschätzte</b> Kollege</td></tr>
<tr><td>das Museum, das gestern in Berlin eröffnet wurde</td><td>das <b>gestern in Berlin eröffnete</b> Museum</td></tr>
<tr><td>der Autor, der im Ausland lebt</td><td>der <b>im Ausland lebende</b> Autor</td></tr>
</table>
<h3>zu + Partizip I = «который нужно/можно»</h3>
<div class="ex"><b>die zu lösende Aufgabe</b> = die Aufgabe, die gelöst werden muss — задача, которую нужно решить.</div>
<div class="ex"><b>ein nicht zu unterschätzendes Problem</b> — проблема, которую нельзя недооценивать.</div>
<h3>Примеры</h3>
<div class="ex"><b>Wir sahen einen laut bellenden Hund.</b> — Мы увидели громко лающую собаку.</div>
<div class="ex"><b>Die vor kurzem renovierte Wohnung ist teuer.</b> — Недавно отремонтированная квартира дорогая.</div>
<div class="ex"><b>Er sprach mit dem seit Jahren in Deutschland lebenden Autor.</b> — Он поговорил с автором, который уже много лет живёт в Германии.</div>
<div class="warn">Причастие-определение склоняется как обычное прилагательное: <i>ein lachend<b>es</b> Kind, mit den lachend<b>en</b> Kindern</i>. Не забывайте окончания!</div>
<div class="tip">Как читать длинные конструкции: найдите <b>артикль</b>, затем прыгните к <b>существительному</b>, к которому он относится, и только потом читайте всё, что между ними. Переводите на русский через «который…» — это почти всегда звучит естественнее: <i>das gestern eröffnete Museum</i> → «музей, который открыли вчера».</div>`,
  exercises: [
    { type: "choice", q: "das ___ Kind (= das Kind, das schläft)", options: ["schlafende", "geschlafene", "schlafen"], a: 0,
      explain: "Ребёнок спит сам и сейчас (активное, одновременное действие) → Partizip I: schlafend + -e после das. Partizip II имел бы пассивный/законченный смысл." },
    { type: "choice", q: "die ___ Kartoffeln (= die Kartoffeln, die gekocht wurden)", options: ["kochenden", "gekochten", "kochten"], a: 1,
      explain: "Картофель сварили (пассивное, законченное действие) → Partizip II gekocht + -en (мн. ч. после die). «kochenden» = «кипящие», «kochten» — Präteritum." },
    { type: "input", q: "der ___ Zug (= der Zug, der gerade ankommt) (ankommen)", a: ["ankommende"],
      explain: "Происходит сейчас → Partizip I: ankommen + d = ankommend; после der в Nominativ → ankommende." },
    { type: "input", q: "Das ist ein sehr ___ Argument. (überzeugen → Partizip I)", a: ["überzeugendes", "ueberzeugendes"],
      explain: "Partizip I überzeugend склоняется как прилагательное: ein + средний род (das Argument) → -es." },
    { type: "order", words: ["die", "schnell", "wachsende", "Stadt"], ru: "быстро растущий город",
      explain: "Все поясняющие слова стоят между артиклем и причастием: наречие schnell — перед wachsende." },
    { type: "choice", q: "der Kollege, der von allen geschätzt wird → ?", options: ["der von allen geschätzte Kollege", "der von allen schätzende Kollege", "der geschätzte von allen Kollege"], a: 0,
      explain: "Пассивный смысл (его ценят) → Partizip II geschätzt; группа «von allen» стоит перед причастием. «schätzende» = «ценящий» — смысл обратный." },
    { type: "choice", q: "die zu ___ Aufgabe (= die Aufgabe, die gelöst werden muss)", options: ["lösende", "gelöste", "lösen"], a: 0,
      explain: "zu + Partizip I = «которую нужно/можно сделать»: die zu lösende Aufgabe. С Partizip II и инфинитивом эта конструкция не образуется." },
    { type: "order", words: ["das", "gestern", "eröffnete", "Museum"], ru: "открытый вчера музей",
      explain: "Музей открыли (пассив) → Partizip II eröffnet + -e. Обстоятельство gestern стоит перед причастием." },
    { type: "input", q: "Wir sahen einen laut ___ Hund. (bellen)", a: ["bellenden"],
      explain: "Собака лает сама → Partizip I bellend; einen — Akkusativ мужского рода → bellenden." },
    { type: "choice", q: "Что значит „der in Berlin lebende Künstler“?", options: ["der Künstler, der in Berlin lebt", "der Künstler, der in Berlin gelebt hat", "der Künstler, der Berlin liebt"], a: 0,
      explain: "Partizip I (lebend) обозначает одновременное действие — художник живёт в Берлине сейчас. Прошлое выразило бы придаточное, а не Partizip I." },
    { type: "choice", q: "die vor kurzem ___ Wohnung (= die renoviert wurde)", options: ["renovierte", "renovierende", "renovieren"], a: 0,
      explain: "Квартиру отремонтировали (пассив, завершено) → Partizip II renoviert + -e. «renovierende» = «ремонтирующая» — активный смысл." },
    { type: "order", words: ["der", "im", "Ausland", "lebende", "Autor"], ru: "автор, живущий за границей",
      explain: "Распространяющая группа im Ausland стоит между артиклем der и причастием lebende, а существительное — в самом конце." },
    { type: "input", q: "die ___ Kinder (= die Kinder, die lachen) (lachen)", a: ["lachenden"],
      explain: "Partizip I lachend; мн. число после die → окончание -en: die lachenden Kinder." }
  ]
});
