DE.grammar.push({
  id: "conjunctions",
  title: "Сочинительные союзы",
  level: "A2",
  emoji: "🔗",
  summary: "und, aber, oder, denn, sondern — «позиция 0», порядок слов не меняется",
  content: `<p>Сочинительные союзы соединяют два <b>главных</b> предложения. Их главная особенность: они стоят на <b>позиции 0</b> — то есть <b>не считаются</b> при подсчёте мест. После них идёт обычный порядок слов, глагол остаётся на 2-м месте.</p>

<table>
<tr><th>Позиция 0</th><th>Позиция 1</th><th>Позиция 2 (глагол)</th><th>Остальное</th></tr>
<tr><td>—</td><td>Ich</td><td><b>bin</b></td><td>müde,</td></tr>
<tr><td><span class="hl">aber</span></td><td>ich</td><td><b>arbeite</b></td><td>noch.</td></tr>
<tr><td><span class="hl">denn</span></td><td>morgen</td><td><b>habe</b></td><td>ich eine Prüfung.</td></tr>
</table>

<h3>Пять союзов</h3>
<table>
<tr><th>Союз</th><th>Значение</th><th>Пример</th></tr>
<tr><td><b>und</b></td><td>и, а</td><td>Ich koche, und du deckst den Tisch.</td></tr>
<tr><td><b>aber</b></td><td>но</td><td>Das Hotel ist schön, aber es ist teuer.</td></tr>
<tr><td><b>oder</b></td><td>или</td><td>Kommst du mit, oder bleibst du hier?</td></tr>
<tr><td><b>denn</b></td><td>потому что, ведь</td><td>Ich esse nichts, denn ich habe keinen Hunger.</td></tr>
<tr><td><b>sondern</b></td><td>а (после отрицания)</td><td>Er kommt nicht heute, sondern morgen.</td></tr>
</table>

<div class="tip">Запоминалка <b>ADUSO</b>: <b>A</b>ber, <b>D</b>enn, <b>U</b>nd, <b>S</b>ondern, <b>O</b>der — эти пять сидят «на скамейке запасных» (позиция 0) и в игре за места не участвуют.</div>

<h3>aber или sondern?</h3>
<p>Оба переводятся как «но/а», но <b>sondern</b> ставится только после отрицания (<i>nicht, kein</i>) и <b>заменяет</b> неверное на верное: «не А, а Б». <b>aber</b> — просто противопоставление.</p>
<div class="ex"><b>Das ist kein Tee, sondern Kaffee.</b> — Это не чай, а кофе. (замена)</div>
<div class="ex"><b>Ich habe kein Auto, aber ich habe ein Fahrrad.</b> — У меня нет машины, но есть велосипед. (противопоставление)</div>

<div class="warn"><b>denn</b> и <b>weil</b> оба значат «потому что», но работают по-разному! После <b>denn</b> порядок обычный: <i>…, denn ich <b>bin</b> krank.</i> После <b>weil</b> глагол уходит в конец: <i>…, weil ich krank <b>bin</b>.</i> (см. урок о придаточных).</div>

<p>Если подлежащее в обеих частях одинаковое, после <b>und</b>, <b>aber</b>, <b>oder</b> его можно опустить:</p>
<div class="ex"><b>Ich stehe auf und dusche.</b> — Я встаю и принимаю душ.</div>
<div class="ex"><b>Wir gehen ins Kino, und dann essen wir Pizza.</b> — Мы идём в кино, а потом едим пиццу. (<i>dann</i> — НЕ союз, а наречие, оно занимает позицию 1!)</div>

<p>Запятая: перед <b>aber, denn, sondern</b> — всегда; перед <b>und, oder</b> — обычно нет (можно поставить, если соединяются два полных предложения).</p>`,
  exercises: [
    { type: "choice", q: "Ich bleibe zu Hause, ___ ich bin krank.", options: ["weil", "denn", "dass"], a: 1,
      explain: "После союза стоит обычный порядок (ich bin) → denn. С weil было бы «weil ich krank bin»." },
    { type: "choice", q: "Ich wohne nicht in Berlin, ___ in Hamburg.", options: ["aber", "sondern", "oder"], a: 1,
      explain: "После отрицания (nicht) «не А, а Б» → sondern. aber значит «но», без замены одного на другое." },
    { type: "order", words: ["Ich", "bin", "müde,", "aber", "ich", "arbeite", "noch"], ru: "Я устал, но ещё работаю.",
      explain: "aber — позиция 0, дальше обычный порядок: ich arbeite noch." },
    { type: "choice", q: "Ich komme mit, denn ___.", options: ["ich habe Zeit", "habe ich Zeit", "ich Zeit habe"], a: 0,
      explain: "denn стоит на позиции 0 и не влияет на порядок слов: подлежащее + глагол — ich habe Zeit." },
    { type: "input", q: "Trinkst du Tee ___ Kaffee? (или)", a: ["oder"],
      explain: "«или» — oder (позиция 0, порядок слов не меняет)." },
    { type: "choice", q: "Das ist kein Hund, ___ eine Katze.", options: ["aber", "sondern", "und"], a: 1,
      explain: "Отрицание kein + замена одного другим («не собака, а кошка») → sondern." },
    { type: "input", q: "Sie wohnt in Köln, ___ sie arbeitet in Bonn. (но)", a: ["aber"],
      explain: "Противопоставление без отрицания и замены → aber: живёт в Кёльне, но работает в Бонне." },
    { type: "order", words: ["Wir", "gehen", "ins", "Kino,", "und", "dann", "essen", "wir", "Pizza"], ru: "Мы идём в кино, а потом едим пиццу.",
      alts: [["Wir", "gehen", "ins", "Kino,", "und", "wir", "essen", "dann", "Pizza"]],
      explain: "und — позиция 0; dann занимает позицию 1, поэтому глагол essen перед подлежащим wir. Так же верно: …, und wir essen dann Pizza." },
    { type: "choice", q: "Ich habe Hunger, aber ___.", options: ["ich habe kein Geld", "habe ich kein Geld", "ich kein Geld habe"], a: 0,
      explain: "aber — позиция 0, порядок слов прямой: ich habe kein Geld. Глагол в конце — только после weil/dass." },
    { type: "input", q: "Er spricht nicht Englisch, ___ Spanisch. (не А, а Б)", a: ["sondern"],
      explain: "«не А, а Б» (nicht Englisch, sondern Spanisch) → sondern." },
    { type: "choice", q: "Какое слово НЕ стоит на позиции 0?", options: ["aber", "denn", "weil"], a: 2,
      explain: "weil — подчинительный союз: он отправляет глагол в конец предложения." },
    { type: "order", words: ["Er", "kommt", "heute", "nicht,", "denn", "er", "ist", "krank"], ru: "Он сегодня не придёт, потому что он болен.",
      alts: [["heute", "kommt", "Er", "nicht,", "denn", "er", "ist", "krank"]],
      explain: "denn + обычный порядок: er ist krank. Главное предложение можно начать с heute: Heute kommt er nicht, …" },
    { type: "choice", q: "Möchtest du ins Kino gehen ___ zu Hause bleiben?", options: ["oder", "aber", "denn"], a: 0,
      explain: "Выбор между вариантами («пойти в кино или остаться дома») → oder." },
    { type: "input", q: "Ich mag Äpfel ___ Bananen. (и)", a: ["und"],
      explain: "«и» — und: Äpfel und Bananen." }
  ]
});
