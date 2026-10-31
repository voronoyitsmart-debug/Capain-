DE.grammar.push({
  id: "prezent_2",
  title: "Настоящее время: спряжения III–IV",
  level: "A1",
  emoji: "🏃",
  summary: "a merge — merg, a dormi — dorm, a citi — citesc, a hotărî — hotărăsc",
  content: `<p>Продолжаем: <b>III спряжение — на -e</b> (a merge), <b>IV — на -i и -î</b> (a dormi, a citi, a hotărî). В IV спряжении, как в I, есть глаголы с суффиксом — <b>-esc</b> (после -î — <b>-ăsc</b>).</p>

<table>
<tr><th></th><th>III: a merge (идти)</th><th>IV: a dormi (спать)</th><th>IV + -esc: a citi (читать)</th><th>IV + -ăsc: a hotărî (решать)</th></tr>
<tr><td>eu</td><td>merg</td><td>dorm</td><td>cit<b>esc</b></td><td>hotăr<b>ăsc</b></td></tr>
<tr><td>tu</td><td>merg<b>i</b></td><td>dorm<b>i</b></td><td>cit<b>ești</b></td><td>hotăr<b>ăști</b></td></tr>
<tr><td>el / ea</td><td>merg<b>e</b></td><td>d<b>oa</b>rm<b>e</b></td><td>cit<b>ește</b></td><td>hotăr<b>ăște</b></td></tr>
<tr><td>noi</td><td>merg<b>em</b></td><td>dorm<b>im</b></td><td>cit<b>im</b></td><td>hotăr<b>âm</b></td></tr>
<tr><td>voi</td><td>merg<b>eți</b></td><td>dorm<b>iți</b></td><td>cit<b>iți</b></td><td>hotăr<b>âți</b></td></tr>
<tr><td>ei / ele</td><td>merg</td><td>dorm</td><td>cit<b>esc</b></td><td>hotăr<b>ăsc</b></td></tr>
</table>

<h3>Спряжение III (-e)</h3>
<p>Окончания такие же, как во II: <b>—, -i, -e, -em, -eți, —</b>. Разница в ударении: во II — ve-<b>DEM</b>, в III — <b>MER</b>-gem (на основу). Частые глаголы: a face (fac, faci, face…), a scrie (scriu, scrii, scrie…), a pune, a spune, a înțelege.</p>
<div class="ex"><b>Merg la serviciu.</b> — Я иду на работу.</div>
<div class="ex"><b>Ce faci?</b> — Что делаешь? / Как дела?</div>

<h3>Спряжение IV (-i, -î)</h3>
<p>Без суффикса: a dormi, a auzi (aud, auzi, aude), a fugi. С суффиксом <b>-esc</b> — большинство: a citi, a vorbi, a locui (locuiesc), a iubi, a găsi. Глаголы на <b>-î</b> получают <b>-ăsc</b>: a hotărî, a urî.</p>
<div class="ex"><b>Vorbești românește?</b> — Ты говоришь по-румынски?</div>
<div class="ex"><b>Copilul doarme.</b> — Ребёнок спит.</div>
<div class="ex"><b>Locuim în Chișinău.</b> — Мы живём в Кишинёве.</div>

<div class="warn">Под ударением o превращается в <b>oa</b>: dorm → <b>doarme</b>. Похоже на русское «мочь — могу — можешь»: основа меняется, к этому быстро привыкаешь.</div>

<h3>Произношение</h3>
<p>merg [мерг], но mergi [мерджь], merge [ме́рдже]: g перед e/i звучит как «дж». Конечное -i почти не слышно: dormi [дормь].</p>

<div class="tip">Хорошая новость: во всех спряжениях, кроме глаголов типа lucrez, формы <b>eu</b> и <b>ei</b> совпадают: eu merg — ei merg, eu citesc — ei citesc. А в noi/voi суффикса -esc нет: citim, citiți.</div>`,
  exercises: [
    { type: "choice", q: "Eu ___ la școală. (a merge)", options: ["merge", "merg", "mergi"], a: 1,
      explain: "III спряжение: eu → основа без окончания: merg." },
    { type: "input", q: "Tu ___ românește? (a vorbi)", a: ["vorbești"],
      explain: "a vorbi — с суффиксом -esc: tu vorbești." },
    { type: "input", q: "El ___ o carte. (a citi)", a: ["citește"],
      explain: "a citi: el/ea → citește." },
    { type: "choice", q: "Copilul ___ acum. (a dormi)", options: ["dorme", "doarme", "dormește"], a: 1,
      explain: "a dormi без суффикса; под ударением o → oa: el doarme." },
    { type: "input", q: "Noi ___ mâine. (a hotărî)", a: ["hotărâm"],
      explain: "В noi/voi суффикса нет: hotărâm, hotărâți (â — внутри слова)." },
    { type: "choice", q: "Ce ___ tu? (a face)", options: ["face", "faci", "facești"], a: 1,
      explain: "a face — III спряжение: tu faci. Ce faci? — ещё и «Как дела?»." },
    { type: "choice", q: "Ei ___ la mare. (a merge)", options: ["merg", "merge", "mergesc"], a: 0,
      explain: "III спряжение: ei merg — совпадает с eu merg." },
    { type: "input", q: "Voi ___ bine? (a dormi)", a: ["dormiți"],
      explain: "IV спряжение: voi → -iți: dormiți." },
    { type: "choice", q: "Eu ___ acum. (a hotărî)", options: ["hotăresc", "hotărâsc", "hotărăsc"], a: 2,
      explain: "Глаголы на -î получают суффикс -ăsc: eu hotărăsc." },
    { type: "input", q: "Ea ___ o scrisoare. (a scrie)", a: ["scrie"],
      explain: "a scrie: eu scriu, tu scrii, el/ea scrie — совпадает с инфинитивом без «a»." },
    { type: "choice", q: "Ei ___ în Chișinău. (a locui)", options: ["locuiește", "locuiesc", "locuim"], a: 1,
      explain: "a locui — с -esc: ei locuiesc (= eu locuiesc). locuiește — для el/ea." },
    { type: "input", q: "Eu ___ muzica. (a auzi)", a: ["aud"],
      explain: "a auzi без суффикса: eu aud, tu auzi (d → z перед i)." },
    { type: "order", words: ["Noi", "citim", "o", "carte", "interesantă"], ru: "Мы читаем интересную книгу.",
      explain: "a citi: noi citim — без суффикса -esc. Прилагательное стоит после существительного." },
    { type: "order", words: ["Unde", "mergeți", "mâine?"], ru: "Куда вы идёте завтра?",
      alts: [["mâine?", "Unde", "mergeți"]],
      explain: "a merge: voi mergeți. Вопросительное слово обычно в начале; mâine можно вынести вперёд: Mâine unde mergeți?" }
  ]
});
