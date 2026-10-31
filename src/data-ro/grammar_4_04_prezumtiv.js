DE.grammar.push({
  id: "prezumtiv",
  title: "Предположительное наклонение (prezumtiv)",
  level: "B2",
  emoji: "🤔",
  summary: "O fi acasă. Va fi plecat. O fi știind. — «наверное, должно быть»",
  content: `<p><b>Prezumtivul</b> — наклонение предположения: говорящий не уверен, а только догадывается. По-русски это «наверное», «должно быть», «интересно, …». Формы строятся на основе будущего времени глагола <b>a fi</b>.</p>

<h3>Вспомогательный глагол: книжный и разговорный</h3>
<table>
<tr><th>Лицо</th><th>Книжная форма</th><th>Разговорная форма</th></tr>
<tr><td>eu</td><td>voi fi</td><td>oi fi</td></tr>
<tr><td>tu</td><td>vei fi</td><td>oi fi / ăi fi</td></tr>
<tr><td>el / ea</td><td>va fi</td><td>o fi</td></tr>
<tr><td>noi</td><td>vom fi</td><td>om fi</td></tr>
<tr><td>voi</td><td>veți fi</td><td>oți fi</td></tr>
<tr><td>ei / ele</td><td>vor fi</td><td>or fi</td></tr>
</table>

<h3>Три основных типа</h3>
<table>
<tr><th>Тип</th><th>Схема</th><th>Пример</th></tr>
<tr><td>с a fi (сейчас)</td><td>o fi + сущ./прил./наречие</td><td><b>O fi acasă.</b> — Наверное, он дома.</td></tr>
<tr><td>настоящее</td><td>o fi + герундий</td><td><b>O fi știind.</b> — Он, наверное, знает.</td></tr>
<tr><td>прошедшее</td><td>o fi / va fi + причастие</td><td><b>Va fi plecat.</b> — Он, должно быть, ушёл.</td></tr>
</table>

<div class="ex"><b>Nu răspunde la telefon. O fi dormind.</b> — Не отвечает. Наверное, спит.</div>
<div class="ex"><b>Ion n-a venit. O fi uitat de întâlnire.</b> — Ион не пришёл. Наверное, забыл о встрече.</div>
<div class="ex"><b>Ce-o fi făcând Maria acum?</b> — Интересно, что сейчас делает Мария?</div>
<div class="ex"><b>Unde or fi copiii?</b> — Где же, интересно, дети?</div>

<h3>Вопросы-размышления</h3>
<p>В вопросах с <b>cine, ce, unde, cum</b> предположительное наклонение звучит как «интересно, …» или «кто бы это мог быть?»: <i>Cine o fi la ușă la ora asta?</i> — Кто бы это мог быть в такой час?</p>

<h3>Внимание: совпадение с будущим</h3>
<p>Форма <b>va fi plecat</b> совпадает с предбудущим временем (viitor anterior). Различает контекст:</p>
<table>
<tr><th>Фраза</th><th>Значение</th></tr>
<tr><td>Până diseară, Ion <b>va fi plecat</b>.</td><td>К вечеру Ион уже уедет (будущее).</td></tr>
<tr><td>E liniște. Ion <b>va fi plecat</b> deja.</td><td>Тихо. Ион, должно быть, уже ушёл (предположение).</td></tr>
</table>

<h3>Синонимы</h3>
<p>То же можно сказать и проще: <i>probabil că e acasă, poate că știe, trebuie să fi plecat</i>. Но prezumtiv короче и очень естественно звучит в разговоре.</p>

<div class="tip">Начните с самого частого: <span class="hl">o fi</span> + что угодно. «O fi obosit» (наверное, устал), «O fi adevărat» (может, и правда), «Ce-o fi?» (что бы это значило?). Книжные формы va fi … встретите в литературе и прессе.</div>`,
  exercises: [
    { type: "choice", q: "Nu răspunde la telefon. ___ dormind.", options: ["O fi", "Este", "A fost"], a: 0,
      explain: "Предположение о действии сейчас: o fi + герундий (dormind) — «наверное, спит»." },
    { type: "input", q: "Unde ___ fi telefonul meu? (разг., 3 л. ед. ч.)", a: ["o"],
      explain: "Разговорная форма 3 л. ед. ч. — o fi: «Где же мой телефон?»" },
    { type: "choice", q: "Ion n-a venit. ___ uitat de întâlnire.", options: ["O fi", "O să", "Ar"], a: 0,
      explain: "Предположение о прошлом: o fi + причастие (uitat) — «наверное, забыл»." },
    { type: "choice", q: "«Ce-o fi făcând Maria acum?» означает:", options: ["Интересно, что сейчас делает Мария?", "Что Мария сделает завтра?", "Что Мария сделала вчера?"], a: 0,
      explain: "O fi + герундий — предположение о настоящем; в вопросе — «интересно, …»." },
    { type: "input", q: "Profesorul ___ fi știind răspunsul. (книжная форма, 3 л. ед. ч.)", a: ["va"],
      explain: "Книжная форма предположительного наклонения: va fi + герундий — «профессор, наверное, знает ответ»." },
    { type: "order", words: ["O", "fi", "acasă", "la", "ora", "asta"], ru: "В это время он, наверное, дома.",
      alts: [["la", "ora", "asta", "O", "fi", "acasă"]],
      explain: "O fi + обстоятельство места = «наверное, находится». Обстоятельство времени можно вынести вперёд." },
    { type: "choice", q: "Что значит va fi plecat в «Până diseară, Ion va fi plecat»?", options: ["К вечеру Ион уже уедет.", "Ион, наверное, сейчас уехал.", "Ион уехал бы."], a: 0,
      explain: "С «până diseară» это предбудущее время (viitor anterior): действие завершится к моменту в будущем." },
    { type: "input", q: "Probabil că e obosit. = ___ obosit. (разг. предположение, 2 слова)", a: ["O fi"],
      explain: "Probabil că e … = o fi …: короткая разговорная замена." },
    { type: "input", q: "Unde ___ fi copiii acum? (3 л. мн. ч.)", a: ["or", "vor"],
      explain: "Copiii — мн. ч.: разговорное or fi или книжное vor fi." },
    { type: "order", words: ["Va", "fi", "plecat", "deja", "de", "acasă"], ru: "Он, должно быть, уже ушёл из дома.",
      explain: "Книжная форма предположения о прошлом: va fi + причастие (plecat)." },
    { type: "choice", q: "___ fi greșit și noi. (разг.: «может, и мы ошиблись»)", options: ["Om", "Oți", "Or"], a: 0,
      explain: "Разговорная форма для noi — om fi; oți — для voi, or — для ei." },
    { type: "input", q: "Nu știu, ___ fi având tu dreptate. (разг., 2 л. ед. ч.)", a: ["oi", "ăi"],
      explain: "Для tu в разговоре — oi fi или ăi fi: «Не знаю, может, ты и прав»." }
  ]
});
