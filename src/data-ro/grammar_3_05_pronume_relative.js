DE.grammar.push({
  id: "pronume_relative",
  title: "Относительные местоимения (care, pe care, căruia, al cărui, ce)",
  level: "B1",
  emoji: "🔗",
  summary: "omul care vine, filmul pe care l-am văzut, fata căreia i-am scris — «который»",
  content: `<p>Румынское <b>care</b> = русское «<b>который</b>». И как в русском, форма зависит от роли слова <b>внутри придаточного</b>: который / которого / которому / чей.</p>
<table>
<tr><th>Роль</th><th>Румынский</th><th>Пример</th></tr>
<tr><td>подлежащее (который)</td><td><b>care</b></td><td><i>Femeia <b>care</b> locuiește aici e medic.</i></td></tr>
<tr><td>с предлогом (с которым, в котором)</td><td><b>cu care, în care, despre care…</b></td><td><i>Orașul <b>în care</b> locuiesc e mic.</i></td></tr>
<tr><td>прямое дополнение (которого)</td><td><b>pe care</b> + дубль</td><td><i>Filmul <b>pe care l-am</b> văzut…</i></td></tr>
<tr><td>дательный (которому/которой/которым)</td><td><b>căruia / căreia / cărora</b> + дубль</td><td><i>Fata <b>căreia i-am</b> scris…</i></td></tr>
<tr><td>владелец (чей, чья)</td><td><b>al cărui, a cărei, ale căror…</b></td><td><i>Băiatul <b>al cărui</b> tată e medic…</i></td></tr>
</table>
<h3>Pe care — не забудьте дубль!</h3>
<p>После <b>pe care</b> в придаточном обязательно повторяется краткое местоимение: <b>l</b> (м. р.), <b>o</b> (ж. р.), <b>i</b> (м. мн.), <b>le</b> (ж. мн.).</p>
<div class="ex"><b>Omul pe care l-am întâlnit este medic.</b> — Человек, которого я встретил, — врач.</div>
<div class="ex"><b>Cartea pe care am citit-o e interesantă.</b> — Книга, которую я прочитал, интересная.</div>
<h3>Căruia / căreia / cărora</h3>
<p>Выбираем по роду и числу того, <b>к кому относится</b>: căruia — м. и ср. р. ед. ч., căreia — ж. р. ед. ч., cărora — мн. ч. Тоже с дублем (i / le).</p>
<div class="ex"><b>Prietenul căruia i-am dat cartea a plecat.</b> — Друг, которому я дал книгу, уехал.</div>
<h3>«Чей»: al cărui / a cărei…</h3>
<p>Здесь две «согласовки», как в «чья мама» по-русски:</p>
<ul>
<li><b>cărui / cărei / căror</b> — по владельцу (băiatul → cărui, fata → cărei, oamenii → căror);</li>
<li><b>al / a / ai / ale</b> — по тому, что принадлежит (tată → al, mamă → a, cărți → ale).</li>
</ul>
<div class="ex"><b>Fata a cărei mamă e profesoară…</b> — Девушка, чья мама учительница…</div>
<div class="ex"><b>Scriitorul ale cărui cărți le citesc…</b> — Писатель, чьи книги я читаю…</div>
<h3>Ce и ceea ce — «что»</h3>
<p><b>Ce</b> = «что» в значении «то, что»: <i>Nu înțeleg <b>ce</b> spui.</i> Когда «что» относится ко всему предыдущему предложению, говорят <b>ceea ce</b>: <i>A întârziat, <b>ceea ce</b> m-a supărat.</i> — Он опоздал, что меня расстроило.</p>
<div class="tip">💡 Мини-алгоритм: 1) Можно спросить «кто/что?» → <b>care</b>. 2) «Кого/что?» → <b>pe care</b> + l/o/i/le. 3) «Кому?» → <b>căruia/căreia/cărora</b> + i/le. 4) «Чей?» → <b>al cărui</b> и компания. Совсем как в русском!</div>`,
  exercises: [
    { type: "choice", q: "Femeia ___ locuiește aici e medic.", options: ["care", "pe care", "căreia"], a: 0,
      explain: "«Которая живёт» — подлежащее придаточного → просто care." },
    { type: "choice", q: "Filmul ___ l-am văzut ieri a fost bun.", options: ["pe care", "care", "căruia"], a: 0,
      explain: "«Который я посмотрел» — прямое дополнение → pe care + дубль l-." },
    { type: "input", q: "Cartea pe care am ___ e interesantă. (a citi + дубль «её»)", a: ["citit-o"],
      explain: "После pe care нужен дубль; o (ж. р.) в perfect compus ставится после причастия: am citit-o." },
    { type: "choice", q: "Prietenul ___ i-am dat cartea a plecat.", options: ["căruia", "căreia", "care"], a: 0,
      explain: "«Которому» (дательный), prietenul — м. р. ед. ч. → căruia." },
    { type: "input", q: "Colega ___ i-am trimis e-mailul nu a răspuns.", a: ["căreia"],
      explain: "«Которой» (дательный), colega — ж. р. ед. ч. → căreia + дубль i-." },
    { type: "choice", q: "Băiatul ___ tată este profesor e colegul meu.", options: ["al cărui", "a cărui", "al cărei"], a: 0,
      explain: "Владелец băiatul (м. р.) → cărui; принадлежит tată (м. р.) → al: al cărui." },
    { type: "choice", q: "Scriitoarea ___ cărți le citesc e din Iași.", options: ["ale cărei", "ale cărui", "a cărei"], a: 0,
      explain: "Владелец — scriitoarea (ж. р.) → cărei; cărți — ж. р. мн. ч. → ale: ale cărei." },
    { type: "input", q: "Orașul în ___ locuiesc e mic.", a: ["care"],
      explain: "После предлога всегда care: în care = «в котором»." },
    { type: "order", words: ["Omul", "pe", "care", "l-am", "întâlnit", "este", "medic"], ru: "Человек, которого я встретил, — врач.",
      alts: [["este", "medic", "Omul", "pe", "care", "l-am", "întâlnit"]],
      explain: "Pe care + l-am: прямое дополнение с обязательным дублем." },
    { type: "input", q: "Nu înțeleg ___ spui.", a: ["ce", "ceea ce"],
      explain: "«То, что ты говоришь» → ce (или полное ceea ce)." },
    { type: "choice", q: "A plecat fără să salute, ___ m-a supărat.", options: ["ceea ce", "care", "pe care"], a: 0,
      explain: "«Что» относится ко всей предыдущей фразе → ceea ce." },
    { type: "choice", q: "Copiii ___ le-am citit povestea au adormit.", options: ["cărora", "căruia", "care"], a: 0,
      explain: "«Которым» (дательный) и copiii во мн. ч. → cărora + дубль le-." },
    { type: "order", words: ["Aceasta", "este", "casa", "în", "care", "m-am", "născut"], ru: "Это дом, в котором я родился.",
      explain: "Предлог в стоит перед care: în care m-am născut — «в котором я родился»." }
  ]
});
