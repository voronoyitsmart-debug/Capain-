DE.grammar.push({
  id: "negation",
  title: "Отрицание: nicht и kein",
  level: "A1",
  emoji: "🚫",
  summary: "kein — вместо ein и «пустого» артикля, nicht — для всего остального",
  content: `<p>В русском одно «не», а в немецком два инструмента: <b>kein</b> и <b>nicht</b>. Выбор зависит от того, что именно мы отрицаем.</p>

<h3>kein = «никакой, ни одного»</h3>
<p>Используется перед существительным с <b>неопределённым артиклем</b> (ein/eine) или <b>без артикля</b>. Изменяется точно как ein.</p>
<table>
<tr><th></th><th>Мужской</th><th>Женский</th><th>Средний</th><th>Мн. число</th></tr>
<tr><td>Nominativ</td><td>kein Hund</td><td>keine Katze</td><td>kein Auto</td><td>keine Kinder</td></tr>
<tr><td>Akkusativ</td><td><b>keinen</b> Hund</td><td>keine Katze</td><td>kein Auto</td><td>keine Kinder</td></tr>
</table>
<div class="ex"><b>Das ist ein Hund. → Das ist kein Hund.</b> — Это не собака.</div>
<div class="ex"><b>Ich habe Zeit. → Ich habe keine Zeit.</b> — У меня нет времени.</div>
<div class="ex"><b>Ich trinke keinen Kaffee.</b> — Я не пью кофе.</div>

<div class="tip">Запоминалка: <span class="hl">kein = k + ein</span>. Где в утверждении стоит <b>ein</b> (или ничего), там в отрицании — <b>kein</b>. Где стоит der/die/das, mein, имя — там <b>nicht</b>.</div>

<h3>nicht = «не»</h3>
<p>Отрицает глаголы, прилагательные, наречия, а также существительные с определённым артиклем, притяжательным местоимением или имена.</p>
<table>
<tr><th>Где стоит nicht</th><th>Пример</th></tr>
<tr><td>в конце, если отрицаем всё действие</td><td>Ich komme heute <b>nicht</b>. Ich verstehe das <b>nicht</b>.</td></tr>
<tr><td>перед прилагательным</td><td>Der Film ist <b>nicht</b> gut.</td></tr>
<tr><td>перед местом и направлением</td><td>Wir wohnen <b>nicht</b> in Berlin.</td></tr>
<tr><td>перед второй частью глагола</td><td>Ich kann <b>nicht</b> schwimmen.</td></tr>
<tr><td>перед словом, которое отрицаем особо</td><td>Das ist <b>nicht</b> mein Buch.</td></tr>
</table>

<h3>Ответ «doch»</h3>
<p>Если вопрос с отрицанием, а ответ положительный, говорят не «ja», а <b>doch</b>:</p>
<div class="ex"><b>Kommst du nicht mit? — Doch, ich komme mit!</b> — Ты не пойдёшь с нами? — Нет, пойду!</div>

<div class="warn">Не переводите русское «нет» дословно: «У меня нет машины» — не «Ich habe nicht Auto», а <b>Ich habe kein Auto</b>. А «nein» — только ответ «нет» на вопрос.</div>`,
  exercises: [
    { type: "choice", q: "Ich habe ___ Zeit.", options: ["nicht", "kein", "keine"], a: 2,
      explain: "Существительное без артикля отрицается через kein-; die Zeit — женский род → keine Zeit. nicht перед существительным без артикля здесь не ставят." },
    { type: "choice", q: "Das ist ___ gut.", options: ["nicht", "kein", "keine"], a: 0,
      explain: "gut — прилагательное, а прилагательные отрицаются с nicht. kein/keine — только перед существительными." },
    { type: "input", q: "Er hat ___ Auto. (отрицание: у него нет машины)", a: ["kein"],
      explain: "Существительное с ein отрицается через kein: ein Auto → kein Auto (средний род, Akkusativ без окончания). «nicht ein Auto» так не говорят." },
    { type: "input", q: "Ich trinke ___ Kaffee. (отрицание: я не пью кофе)", a: ["keinen"],
      explain: "der Kaffee — мужской род, после trinken Akkusativ → keinen Kaffee. «kein» было бы только в Nominativ." },
    { type: "choice", q: "Ich verstehe das ___.", options: ["nicht", "kein", "keine"], a: 0,
      explain: "Отрицаем действие (verstehen) — nicht стоит в конце, после дополнения das. kein не подходит: нет существительного." },
    { type: "order", words: ["Ich", "komme", "heute", "nicht"], ru: "Я сегодня не приду.",
      alts: [["heute", "komme", "Ich", "nicht"]],
      explain: "Отрицание всего действия: nicht в конце предложения, после обстоятельства времени. Можно начать с heute: Heute komme ich nicht." },
    { type: "choice", q: "Wir wohnen ___ in Berlin.", options: ["kein", "nicht", "keine"], a: 1,
      explain: "Перед указанием места (in Berlin) ставится nicht. kein/keine отрицают только существительные с ein или без артикля." },
    { type: "input", q: "Sie hat ___ Kinder. (отрицание: у неё нет детей)", a: ["keine"],
      explain: "Существительное во мн. числе без артикля отрицается через keine: keine Kinder." },
    { type: "choice", q: "Kommst du nicht mit? — ___, ich komme mit!", options: ["Ja", "Doch", "Nein"], a: 1,
      explain: "На отрицательный вопрос («Ты не идёшь?») утвердительно отвечают doch. Ja здесь неверно, Nein значило бы «нет, не иду»." },
    { type: "choice", q: "Das ist ___ Problem.", options: ["nicht", "kein", "keine"], a: 1,
      explain: "das Problem — средний род: ein Problem → kein Problem. keine — для женского рода и мн. числа." },
    { type: "order", words: ["Das", "ist", "nicht", "mein", "Buch"], ru: "Это не моя книга.",
      explain: "kein заменяет только ein или нулевой артикль; перед притяжательным mein ставится nicht: nicht mein Buch." },
    { type: "input", q: "Der Film ist ___ interessant. (отрицание: фильм неинтересный)", a: ["nicht"],
      explain: "Прилагательное отрицается словом nicht: nicht interessant. kein ставится только перед существительным." },
    { type: "choice", q: "Ist das ein Hund? — Nein, das ist ___ Hund, das ist eine Katze.", options: ["nicht", "kein", "keinen"], a: 1,
      explain: "Nominativ мужского рода: ein Hund → kein Hund (keinen — только в Akkusativ)." },
    { type: "input", q: "Ich habe ___ Geld. (отрицание: у меня нет денег)", a: ["kein"],
      explain: "das Geld без артикля отрицается через kein; средний род в Akkusativ — без окончания: kein Geld." }
  ]
});
