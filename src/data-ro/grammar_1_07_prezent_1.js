DE.grammar.push({
  id: "prezent_1",
  title: "Настоящее время: спряжения I–II",
  level: "A1",
  emoji: "🎵",
  summary: "a cânta — cânt, a lucra — lucrez, a vedea — văd",
  content: `<p>Румынские глаголы делятся на 4 спряжения по окончанию инфинитива: <b>I — -a</b> (a cânta), <b>II — -ea</b> (a vedea), <b>III — -e</b> (a merge), <b>IV — -i/-î</b> (a citi, a hotărî). В этом уроке — первые два.</p>

<table>
<tr><th></th><th>I: a cânta (петь)</th><th>I + -ez: a lucra (работать)</th><th>II: a vedea (видеть)</th></tr>
<tr><td>eu</td><td>cânt</td><td>lucr<b>ez</b></td><td>văd</td></tr>
<tr><td>tu</td><td>cânț<b>i</b></td><td>lucr<b>ezi</b></td><td>vez<b>i</b></td></tr>
<tr><td>el / ea</td><td>cânt<b>ă</b></td><td>lucr<b>ează</b></td><td>ved<b>e</b></td></tr>
<tr><td>noi</td><td>cânt<b>ăm</b></td><td>lucr<b>ăm</b></td><td>ved<b>em</b></td></tr>
<tr><td>voi</td><td>cânt<b>ați</b></td><td>lucr<b>ați</b></td><td>ved<b>eți</b></td></tr>
<tr><td>ei / ele</td><td>cânt<b>ă</b></td><td>lucr<b>ează</b></td><td>văd</td></tr>
</table>

<h3>Спряжение I: с суффиксом -ez и без</h3>
<p>Многие глаголы на -a в формах eu, tu, el, ei получают суффикс <b>-ez</b>: lucrez, dansez, studiez, desenez, telefonez. Это похоже на русские «танц<b>ую</b>, рис<b>ую</b>»: a dansa → dansez, a desena → desenez. Другие глаголы обходятся без суффикса: cânt, intru, aștept, mănânc. Какой тип у глагола — по инфинитиву не видно, поэтому запоминайте форму «eu».</p>
<div class="ex"><b>Lucrez la o bancă.</b> — Я работаю в банке.</div>
<div class="ex"><b>Maria cântă foarte frumos.</b> — Мария очень красиво поёт.</div>
<div class="ex"><b>Mănânc un măr.</b> — Я ем яблоко. (a mânca: mănânc, mănânci, mănâncă, mâncăm, mâncați, mănâncă)</div>

<div class="warn">В I спряжении формы <b>el/ea</b> и <b>ei/ele</b> совпадают: el cântă — ei cântă, ea lucrează — ele lucrează. Кто действует — понятно по подлежащему.</div>

<h3>Спряжение II (-ea)</h3>
<p>Окончания: <b>—, -i, -e, -em, -eți, —</b>. Ударение в noi/voi падает на окончание: ve-<b>DEM</b>, ve-<b>DEȚI</b>. Сюда же относятся a putea (pot, poți, poate…), a plăcea (îmi place), a tăcea. a avea — неправильный (am, ai, are…).</p>
<div class="ex"><b>Văd marea.</b> — Я вижу море.</div>
<div class="ex"><b>Vezi bine?</b> — Ты хорошо видишь?</div>

<h3>Чередования перед -i</h3>
<p>Как и во множественном числе существительных, перед <b>-i</b> во 2-м лице меняются согласные: <b>t → ț</b> (cânt → cânți), <b>d → z</b> (văd → vezi), <b>s → ș</b>. А в основе бывает ă/a: <b>văd</b>, но <b>vedem</b>.</p>

<div class="tip">Как в русском, местоимение обычно не нужно: окончание само говорит, кто действует. <b>Lucrăm.</b> — Мы работаем. <b>Cânți?</b> — Ты поёшь?</div>`,
  exercises: [
    { type: "choice", q: "Eu ___ la bancă. (a lucra)", options: ["lucru", "lucrez", "lucrează"], a: 1,
      explain: "a lucra спрягается с суффиксом -ez: eu lucrez. lucrează — форма для el/ea и ei/ele." },
    { type: "input", q: "Ea ___ frumos. (a cânta)", a: ["cântă"],
      explain: "I спряжение без суффикса: el/ea → основа + -ă: cântă." },
    { type: "input", q: "Noi ___ mult. (a lucra)", a: ["lucrăm"],
      explain: "В формах noi/voi суффикса -ez нет: lucrăm, lucrați." },
    { type: "choice", q: "Tu ___ bine? (a vedea)", options: ["vedi", "vezi", "văzi"], a: 1,
      explain: "tu → -i, и d перед i переходит в z: vezi." },
    { type: "input", q: "Ei ___ marea. (a vedea)", a: ["văd"],
      explain: "a vedea: ei văd — так же, как eu văd." },
    { type: "choice", q: "Voi ___ aici? (a lucra)", options: ["lucrezi", "lucrați", "lucrăm"], a: 1,
      explain: "voi → -ați: lucrați. lucrezi — для tu, lucrăm — для noi." },
    { type: "choice", q: "Maria ___ foarte bine. (a dansa)", options: ["dansează", "dansă", "danse"], a: 0,
      explain: "a dansa спрягается с -ez: el/ea dansează (как «танцует»)." },
    { type: "input", q: "Tu ___ o melodie. (a cânta)", a: ["cânți"],
      explain: "tu → -i, и t перед i переходит в ț: cânți." },
    { type: "choice", q: "Copiii ___ un film. (a vedea)", options: ["vede", "vedem", "văd"], a: 2,
      explain: "Copiii (дети) = ei → văd. vede — для el/ea, vedem — для noi." },
    { type: "input", q: "Eu ___ un măr. (a mânca)", a: ["mănânc"],
      explain: "a mânca — с чередованием в основе: eu mănânc, но noi mâncăm." },
    { type: "choice", q: "Noi ___ bine. (a vedea)", options: ["vedem", "vădem", "vedăm"], a: 0,
      explain: "II спряжение: noi → -em, в основе e: vedem." },
    { type: "input", q: "Voi ___ în fiecare zi? (a cânta)", a: ["cântați"],
      explain: "voi → -ați: cântați." },
    { type: "order", words: ["Eu", "lucrez", "la", "un", "magazin"], ru: "Я работаю в магазине.",
      explain: "Обычный порядок: подлежащее — глагол — обстоятельство. a lucra → eu lucrez." },
    { type: "order", words: ["Ce", "vezi", "acolo?"], ru: "Что ты там видишь?",
      explain: "Вопросительное слово ce — в начале, затем глагол (tu vezi) и наречие." }
  ]
});
