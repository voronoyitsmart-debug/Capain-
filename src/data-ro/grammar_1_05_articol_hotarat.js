DE.grammar.push({
  id: "articol_hotarat",
  title: "Определённый артикль (-ul, -le, -a, -ua)",
  level: "A1",
  emoji: "🎯",
  summary: "Артикль приклеивается к концу слова: pom → pomul, casă → casa, pomi → pomii",
  content: `<p>Определённый артикль значит «тот самый, известный» предмет. Главный сюрприз: он ставится <b>не перед словом, а в конце</b> и пишется слитно — как окончание. Русскому уху это даже привычно: слово просто меняет «хвост».</p>
<div class="ex"><b>un tren</b> — (какой-то) поезд → <b>trenul</b> — (этот) поезд</div>

<h3>Единственное число</h3>
<table>
<tr><th>Слово оканчивается на</th><th>Артикль</th><th>Примеры</th></tr>
<tr><td>согласную (м., ср.)</td><td><b>-ul</b></td><td>pom → pomul, tren → trenul</td></tr>
<tr><td>-u (м., ср.)</td><td><b>-l</b></td><td>birou → biroul, lucru → lucrul</td></tr>
<tr><td>-e (м., ср.)</td><td><b>-le</b></td><td>frate → fratele, nume → numele</td></tr>
<tr><td>-ă (м.: tată)</td><td><b>-l</b></td><td>tată → tatăl</td></tr>
<tr><td>-ă (ж.)</td><td><b>-a</b> вместо ă</td><td>casă → casa, masă → masa</td></tr>
<tr><td>-e (ж.)</td><td><b>+a</b></td><td>carte → cartea, floare → floarea</td></tr>
<tr><td>-ie (ж.)</td><td><b>-ia</b></td><td>familie → familia</td></tr>
<tr><td>ударное -ea, а также zi (ж.)</td><td><b>-ua</b></td><td>cafea → cafeaua, zi → ziua</td></tr>
</table>

<h3>Множественное число</h3>
<table>
<tr><th>Род</th><th>Артикль</th><th>Примеры</th></tr>
<tr><td>мужской (мн. ч. на -i)</td><td><b>+i</b></td><td>pomi → pomii, băieți → băieții, copii → copiii</td></tr>
<tr><td>женский и средний</td><td><b>+le</b></td><td>case → casele, cărți → cărțile, trenuri → trenurile</td></tr>
</table>

<h3>Когда ставить</h3>
<ul>
<li>Предмет известен: <b>Unde este trenul?</b> — Где (наш) поезд?</li>
<li>Общие понятия — часто там, где в русском нет ничего особенного: <b>Îmi place cafeaua.</b> — Я люблю кофе. <b>Viața e frumoasă.</b> — Жизнь прекрасна.</li>
<li>С притяжательными: <b>casa mea</b> — мой дом.</li>
</ul>
<div class="ex"><b>Cartea este pe masă.</b> — Книга на столе.</div>
<div class="ex"><b>Copiii sunt în parc.</b> — Дети в парке.</div>

<div class="warn">После предлогов (<b>pe, la, în, din</b>…) существительное без определения стоит <b>без</b> артикля: pe masă, la școală, în oraș. Если появляется определение — артикль возвращается: <b>pe masa mare</b>, <b>în orașul meu</b>. Исключение — <b>cu</b>: <b>cu trenul</b> (поездом), <b>cu mașina</b> (на машине).</div>

<div class="tip">Три «i» подряд — не опечатка: copil → copii (дети) → <b>copiii</b> (эти дети). А разговорное <b>tata</b> и <b>mama</b> — это тоже формы с артиклем: «папа», «мама» (наши).</div>`,
  exercises: [
    { type: "choice", q: "Unde este ___? (băiat)", options: ["băiatul", "băiatle", "băiata"], a: 0,
      explain: "Мужской род на согласную → -ul: băiat → băiatul." },
    { type: "input", q: "Unde este ___? (carte)", a: ["cartea"],
      explain: "Женский род на -e → добавляем -a: carte → cartea." },
    { type: "input", q: "Îmi place ___. (cafea)", a: ["cafeaua"],
      explain: "Ударное -ea → артикль -ua: cafea → cafeaua. Общие понятия по-румынски употребляются с артиклем." },
    { type: "choice", q: "___ este acasă. (frate)", options: ["Fratul", "Fratele", "Fratea"], a: 1,
      explain: "Мужской род на -e → -le: frate → fratele." },
    { type: "choice", q: "Unde sunt ___? (copii — дети)", options: ["copiile", "copiul", "copiii"], a: 2,
      explain: "Мужской род мн. ч. на -i → ещё одно -i: copii → copiii (три i)." },
    { type: "input", q: "___ sunt noi. (trenuri)", a: ["Trenurile"],
      explain: "Средний род во мн. ч. ведёт себя как женский → -le: trenuri → trenurile." },
    { type: "choice", q: "Copilul merge la ___. (школа)", options: ["școala", "școală", "școlii"], a: 1,
      explain: "После предлога без определения артикль не ставится: la școală. С определением — la școala nouă." },
    { type: "choice", q: "Vin cu ___. (поездом)", options: ["tren", "trenului", "trenul"], a: 2,
      explain: "Предлог cu — исключение: после него артикль ставится — cu trenul, cu mașina." },
    { type: "input", q: "___ este frumoasă. (zi)", a: ["Ziua"],
      explain: "zi — женский род, артикль -ua: zi → ziua." },
    { type: "input", q: "Unde sunt ___? (băieți)", a: ["băieții"],
      explain: "Мужской род мн. ч. → +i: băieți → băieții." },
    { type: "choice", q: "familie → ?", options: ["familiea", "familia", "familieua"], a: 1,
      explain: "Слова на -ie: -e заменяется на -a: familie → familia." },
    { type: "input", q: "___ lucrează aici. (tată)", a: ["Tatăl", "Tata"],
      explain: "tată — мужской род на -ă, артикль -l: tatăl. В разговоре так же правильно tata — «папа»." },
    { type: "order", words: ["Cartea", "este", "pe", "masă"], ru: "Книга на столе.",
      alts: [["pe", "masă", "este", "Cartea"]],
      explain: "Книга известная — cartea (с артиклем); после предлога pe без определения — masă без артикля." },
    { type: "order", words: ["Îmi", "place", "muzica", "românească"], ru: "Мне нравится румынская музыка.",
      alts: [["muzica", "românească", "Îmi", "place"]],
      explain: "Общее понятие — с определённым артиклем: muzica. Прилагательное стоит после существительного." }
  ]
});
