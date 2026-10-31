DE.grammar.push({
  id: "conjunctiv_trecut",
  title: "Прошедший конъюнктив: să fi făcut",
  level: "B2",
  emoji: "⏮️",
  summary: "să fi + причастие — одна форма для всех лиц: Nu cred să fi plecat.",
  content: `<p><b>Conjunctivul perfect</b> выражает действие, которое (возможно) <b>уже совершилось</b> к моменту речи или к другому моменту. Хорошая новость: форма одна для всех лиц — <b>să fi + причастие</b>.</p>

<table>
<tr><th>Лицо</th><th>Настоящий конъюнктив</th><th>Прошедший конъюнктив</th></tr>
<tr><td>eu</td><td>să fac</td><td><b>să fi făcut</b></td></tr>
<tr><td>tu</td><td>să faci</td><td><b>să fi făcut</b></td></tr>
<tr><td>el / ea</td><td>să facă</td><td><b>să fi făcut</b></td></tr>
<tr><td>noi</td><td>să facem</td><td><b>să fi făcut</b></td></tr>
<tr><td>voi</td><td>să faceți</td><td><b>să fi făcut</b></td></tr>
<tr><td>ei / ele</td><td>să facă</td><td><b>să fi făcut</b></td></tr>
</table>
<p>Отрицание ставится между să и fi: <b>să nu fi venit</b>. Местоимения — тоже после să: <b>să-l fi văzut, să mă fi sunat, să-și fi luat</b>. Причастие не изменяется.</p>

<h3>Где используется</h3>
<p><b>1. Сомнение, отрицание мнения о прошлом</b> (nu cred, mă îndoiesc, nu-mi amintesc, e imposibil):</p>
<div class="ex"><b>Nu cred să fi plecat deja.</b> — Не думаю, что он уже ушёл.</div>
<div class="ex"><b>Nu-mi amintesc să-l fi văzut pe Ion la petrecere.</b> — Не помню, чтобы видел Иона на вечеринке.</div>
<p>Если между глаголом и să стоит подлежащее, используется <b>ca … să</b>: <i>Mă îndoiesc <b>ca</b> ei <b>să</b> fi terminat.</i></p>

<p><b>2. Логический вывод</b> с trebuie («должно быть»):</p>
<table>
<tr><th>Фраза</th><th>Смысл</th></tr>
<tr><td>Trebuie <b>să uite</b>.</td><td>Он должен забыть (обязанность).</td></tr>
<tr><td>Trebuie <b>să fi uitat</b>.</td><td>Он, должно быть, забыл (предположение).</td></tr>
</table>

<p><b>3. После fără să, înainte să</b> — «не сделав», когда важна завершённость:</p>
<div class="ex"><b>A plecat fără să-și fi luat la revedere.</b> — Он ушёл, даже не попрощавшись.</div>

<p><b>4. Сожаление и нереальное желание:</b></p>
<div class="ex"><b>Măcar să fi știut adevărul de la început!</b> — Хоть бы я знал правду с самого начала!</div>
<div class="ex"><b>Ar fi fost mai bine să nu fi spus nimic.</b> — Лучше было бы ничего не говорить.</div>

<p><b>5. Приблизительная оценка</b> в рассказе о прошлом:</p>
<div class="ex"><b>Să fi avut vreo zece ani când ne-am mutat.</b> — Мне было, наверное, лет десять, когда мы переехали.</div>

<div class="tip">Запомните одну формулу: <span class="hl">să fi + participiu</span> — никаких окончаний по лицам. Если хочется сказать «să fie făcut» — это уже пассив («чтобы было сделано»), а не прошедший конъюнктив.</div>`,
  exercises: [
    { type: "choice", q: "Nu cred ___ plecat deja.", options: ["să fi", "să fie", "să a"], a: 0,
      explain: "Прошедший конъюнктив: să fi + причастие. «Să fie» — настоящий конъюнктив глагола a fi." },
    { type: "input", q: "Ușa e deschisă. Trebuie să ___ uitat s-o închidă.", a: ["fi"],
      explain: "Trebuie să fi + причастие = «должно быть, (он) забыл» — логический вывод о прошлом." },
    { type: "choice", q: "Mă îndoiesc ca ei să ___ terminat la timp.", options: ["fi", "fie", "fii"], a: 0,
      explain: "В прошедшем конъюнктиве fi не изменяется по лицам: ei să fi terminat." },
    { type: "order", words: ["Trebuie", "să", "fi", "plecat", "deja"], ru: "Он, должно быть, уже ушёл.",
      alts: [["deja", "Trebuie", "să", "fi", "plecat"]],
      explain: "Trebuie să fi plecat — предположение о завершённом действии. Deja обычно ставится в конце." },
    { type: "input", q: "A plecat fără să-și ___ luat la revedere.", a: ["fi"],
      explain: "Fără să + прошедший конъюнктив: fără să-și fi luat la revedere — «даже не попрощавшись»." },
    { type: "choice", q: "Что значит «Trebuie să fi uitat»?", options: ["Он, должно быть, забыл.", "Он должен забыть.", "Он забудет."], a: 0,
      explain: "Trebuie + să fi + причастие выражает предположение о прошлом, а trebuie să uite — обязанность." },
    { type: "choice", q: "Să ___ fost pe la ora trei când a sunat.", options: ["fi", "fie", "fost"], a: 0,
      explain: "Приблизительная оценка в прошлом: să fi fost — «было, наверное, около трёх»." },
    { type: "input", q: "Măcar să ___ adevărul de la început! (a ști, прош. конъюнктив)", a: ["fi știut"],
      explain: "Нереальное желание о прошлом: măcar să fi știut — «хоть бы я знал»." },
    { type: "input", q: "Nu-mi amintesc să-l ___ pe Ion la petrecere. (a vedea, прош. конъюнктив)", a: ["fi văzut"],
      explain: "Nu-mi amintesc + să fi văzut: местоимение l- стоит после să: să-l fi văzut." },
    { type: "choice", q: "Выберите правильное отрицание:", options: ["Ar fi fost mai bine să nu fi spus nimic.", "Ar fi fost mai bine să fi nu spus nimic.", "Ar fi fost mai bine nu să fi spus nimic."], a: 0,
      explain: "Nu стоит между să и fi: să nu fi spus." },
    { type: "order", words: ["Nu", "cred", "să", "fi", "greșit"], ru: "Не думаю, что я ошибся.",
      explain: "Nu cred + să fi + причастие: сомнение в действии, которое уже произошло." },
    { type: "choice", q: "Era imposibil ca ea să ___ toate astea singură.", options: ["fi făcut", "fi făcută", "fie făcut"], a: 0,
      explain: "В активном прошедшем конъюнктиве причастие не согласуется: ea să fi făcut." },
    { type: "order", words: ["Să", "fi", "avut", "vreo", "zece", "ani"], ru: "Мне было, наверное, лет десять.",
      explain: "Să fi + причастие для приблизительной оценки в прошлом; vreo = «около, примерно»." }
  ]
});
