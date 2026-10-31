DE.grammar.push({
  id: "conjunctiv",
  title: "Конъюнктив (să merg, să meargă)",
  level: "A2",
  emoji: "🤞",
  summary: "Vreau să merg, trebuie să plece: să + форма глагола; 3-е лицо — особое",
  content: `<p>Там, где в русском стоит инфинитив («хочу <i>пойти</i>», «надо <i>работать</i>»), румынский почти всегда использует <b>конъюнктив</b> — частицу <b>să</b> + личную форму глагола: <b>Vreau să merg.</b> — дословно «Хочу, чтобы я пошёл».</p>

<h3>Образование</h3>
<p>Для eu, tu, noi, voi форма <b>совпадает с настоящим временем</b>. Особая только форма <b>3-го лица</b> (el, ea, ei, ele — одинаковая для ед. и мн. ч.).</p>
<table>
<tr><th>Лицо</th><th>a lucra</th><th>a merge</th><th>a fi</th></tr>
<tr><td>eu</td><td>să lucrez</td><td>să merg</td><td>să fiu</td></tr>
<tr><td>tu</td><td>să lucrezi</td><td>să mergi</td><td>să fii</td></tr>
<tr><td>el / ea</td><td>să <b>lucreze</b></td><td>să <b>meargă</b></td><td>să <b>fie</b></td></tr>
<tr><td>noi</td><td>să lucrăm</td><td>să mergem</td><td>să fim</td></tr>
<tr><td>voi</td><td>să lucrați</td><td>să mergeți</td><td>să fiți</td></tr>
<tr><td>ei / ele</td><td>să <b>lucreze</b></td><td>să <b>meargă</b></td><td>să <b>fie</b></td></tr>
</table>

<h3>3-е лицо: el … → să …</h3>
<table>
<tr><th>Настоящее (el)</th><th>Конъюнктив</th></tr>
<tr><td>lucrează, cântă, pleacă</td><td>să lucreze, să cânte, să plece</td></tr>
<tr><td>merge, face, vede</td><td>să meargă, să facă, să vadă</td></tr>
<tr><td>citește, doarme</td><td>să citească, să doarmă</td></tr>
<tr><td>are, vine, este</td><td>să <b>aibă</b>, să <b>vină</b>, să <b>fie</b></td></tr>
<tr><td>scrie, știe, bea, ia, dă</td><td>să scrie, să știe, să bea, să ia, să dea</td></tr>
</table>
<div class="tip">Правило-качели: <b>-ă и -e меняются местами</b>. Было на -ă → станет на -e (cântă → să cânte, lucrează → să lucreze); было на -e → станет на -ă (merge → să meargă, face → să facă, citește → să citească).</div>

<h3>Когда нужен конъюнктив</h3>
<ul>
<li>после <b>vreau, trebuie, pot, încerc, îmi place, a hotărî</b>: <b>Pot să vin.</b> (или Pot veni.)</li>
<li><b>trebuie</b> не меняется: <b>Trebuie să plec.</b> — Мне надо уйти. <b>Trebuie să pleci.</b> — Тебе надо уйти.</li>
<li><b>ca să</b> — чтобы: <b>Învăț ca să vorbesc bine.</b></li>
<li>предложение, вопрос-совет: <b>Să mergem!</b> — Пойдём! <b>Să-l sun?</b> — Мне ему позвонить?</li>
</ul>
<div class="warn">Если желает один, а делает другой — меняется лицо после să: <b>Vreau să merg</b> (я хочу пойти) ↔ <b>Vreau să mergi</b> (я хочу, чтобы ты пошёл). В русском здесь нужно «чтобы», в румынском — то же să!</div>

<div class="ex"><b>Vreau să învăț limba română.</b> — Я хочу выучить румынский.</div>
<div class="ex"><b>Copiii trebuie să doarmă.</b> — Детям надо спать.</div>
<div class="ex"><b>Mama vrea să fie totul perfect.</b> — Мама хочет, чтобы всё было идеально.</div>`,
  exercises: [
    { type: "choice", q: "Vreau ___ acasă. (я — пойти)", options: ["să merg", "să merge", "merg"], a: 0,
      explain: "После vreau — конъюнктив; для eu форма как в настоящем времени: să merg." },
    { type: "choice", q: "El trebuie să ___.", options: ["plece", "pleacă", "pleca"], a: 0,
      explain: "3-е лицо: pleacă → să plece (-ă меняется на -e)." },
    { type: "input", q: "Vreau ca el să ___ aici. (a fi)", a: ["fie"],
      explain: "Конъюнктив a fi в 3-м лице — să fie." },
    { type: "input", q: "Copiii trebuie să ___. (a dormi)", a: ["doarmă"],
      explain: "doarme → să doarmă: -e меняется на -ă; форма 3-го лица одинакова для ед. и мн. ч." },
    { type: "choice", q: "Ea vrea să ___ o carte. (a citi)", options: ["citească", "citește", "citi"], a: 0,
      explain: "citește → să citească: глаголы на -ește дают -ească." },
    { type: "choice", q: "Poți să mă ___? (a ajuta)", options: ["ajuți", "ajuta", "ajută"], a: 0,
      explain: "Помогать будешь ты, поэтому после să — форма tu: să ajuți." },
    { type: "input", q: "Trebuie să ___. (noi, a mânca)", a: ["mâncăm"],
      explain: "Для noi конъюнктив совпадает с настоящим временем: să mâncăm." },
    { type: "choice", q: "Nu vreau ca ea să ___ tristă.", options: ["fie", "este", "fi"], a: 0,
      explain: "После să нужен конъюнктив a fi — fie; este — изъявительное наклонение, fi — инфинитив." },
    { type: "choice", q: "Mama vrea ca noi să ___ devreme. (a veni)", options: ["venim", "vină", "veniți"], a: 0,
      explain: "Приходить будем мы — форма noi: să venim. Vină — 3-е лицо, veniți — voi." },
    { type: "input", q: "Ei trebuie să ___ mâine. (a lucra)", a: ["lucreze"],
      explain: "lucrează → să lucreze: -ă меняется на -e." },
    { type: "order", words: ["Vreau", "să", "învăț", "limba", "română"], ru: "Я хочу выучить румынский язык.",
      explain: "vreau + să + глагол в лице eu (învăț); să всегда стоит прямо перед глаголом." },
    { type: "order", words: ["Trebuie", "să", "plecăm", "acum"], ru: "Нам нужно уходить сейчас.",
      alts: [["acum", "Trebuie", "să", "plecăm"]],
      explain: "trebuie не изменяется, лицо показывает глагол после să (plecăm — мы). Acum можно поставить в начало." },
    { type: "choice", q: "Trebuie să ___ răbdare. (он, a avea)", options: ["aibă", "are", "avea"], a: 0,
      explain: "Неправильная форма: a avea в 3-м лице конъюнктива — să aibă." },
    { type: "choice", q: "Ce vrei să ___? (ты, a face)", options: ["faci", "face", "facă"], a: 0,
      explain: "Делать будешь ты — форма tu: să faci. Facă — 3-е лицо." }
  ]
});
