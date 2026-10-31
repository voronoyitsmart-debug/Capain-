DE.grammar.push({
  id: "a_fi_a_avea",
  title: "Личные местоимения, a fi и a avea",
  level: "A1",
  emoji: "👤",
  summary: "eu sunt, tu ești… / eu am, tu ai… — «быть» и «иметь»",
  content: `<p>Личные местоимения почти как в русском. Одно отличие: у «они» есть род. <b>ei</b> — мужчины или смешанная компания, <b>ele</b> — только женщины (или слова женского рода).</p>

<table>
<tr><th>Местоимение</th><th>Перевод</th><th>a fi (быть)</th><th>a avea (иметь)</th></tr>
<tr><td>eu</td><td>я</td><td><b>sunt</b></td><td><b>am</b></td></tr>
<tr><td>tu</td><td>ты</td><td><b>ești</b></td><td><b>ai</b></td></tr>
<tr><td>el / ea</td><td>он / она</td><td><b>este</b> (e)</td><td><b>are</b></td></tr>
<tr><td>noi</td><td>мы</td><td><b>suntem</b></td><td><b>avem</b></td></tr>
<tr><td>voi</td><td>вы</td><td><b>sunteți</b></td><td><b>aveți</b></td></tr>
<tr><td>ei / ele</td><td>они</td><td><b>sunt</b></td><td><b>au</b></td></tr>
<tr><td>dumneavoastră</td><td>Вы (вежл.)</td><td><b>sunteți</b></td><td><b>aveți</b></td></tr>
</table>

<h3>a fi — «быть», и он не пропадает</h3>
<p>По-русски мы говорим «я студент» без глагола. По-румынски глагол <b>a fi</b> обязателен: <b>Sunt student.</b> Зато местоимение обычно опускают — форма глагола и так показывает лицо. Местоимение ставят для акцента или противопоставления.</p>
<div class="ex"><b>Sunt din Rusia.</b> — Я из России.</div>
<div class="ex"><b>Ea este profesoară, el este medic.</b> — Она учительница, а он врач.</div>
<div class="ex"><b>E frig.</b> — Холодно. (<b>e</b> — краткая разговорная форма este)</div>

<h3>a avea — «у меня есть»</h3>
<p>Русское «у меня есть» по-румынски звучит как «я имею»: <b>Am o soră.</b> — У меня есть сестра. Возраст тоже «имеют»: <b>Am douăzeci de ani.</b> — Мне двадцать лет (дословно «имею 20 лет»).</p>
<div class="ex"><b>Ai timp?</b> — У тебя есть время?</div>
<div class="ex"><b>Câți ani are Ion?</b> — Сколько лет Иону?</div>
<div class="ex"><b>Avem un câine și o pisică.</b> — У нас есть собака и кошка.</div>

<div class="warn"><b>sunt</b> — это и «я есть», и «они есть». Различаем по контексту или по местоимению: <b>Eu sunt acasă</b> / <b>Ei sunt acasă</b>.</div>

<h3>Вежливое «Вы»</h3>
<p>С незнакомыми и старшими используют <b>dumneavoastră</b> (сокращённо <b>dvs.</b>) и глагол во 2-м лице мн. ч. — точно как русское «Вы»: <b>Dumneavoastră sunteți domnul Popescu?</b> — Вы господин Попеску?</p>

<div class="tip">«Мне 20 лет» = «<b>Am</b> 20 de ani», а не «Sunt 20». Представьте, что годы — это то, что у вас есть: у меня есть 20 лет. Ещё одна ловушка: «у него есть» — только <b>are</b>. Короткое «a» — это вспомогательный глагол прошедшего времени (a mers — он пошёл), его вы встретите позже.</div>`,
  exercises: [
    { type: "choice", q: "Eu ___ student.", options: ["sunt", "este", "ești"], a: 0,
      explain: "eu → sunt. este — для el/ea, ești — для tu." },
    { type: "choice", q: "Tu ___ din Moldova?", options: ["este", "ești", "sunt"], a: 1,
      explain: "tu → ești (читается [ешть])." },
    { type: "input", q: "Noi ___ acasă. (a fi)", a: ["suntem"],
      explain: "noi → suntem: мы дома." },
    { type: "input", q: "Ei ___ o mașină. (a avea)", a: ["au"],
      explain: "ei/ele → au: у них есть машина." },
    { type: "choice", q: "Ea ___ doi copii.", options: ["a", "are", "au"], a: 1,
      explain: "el/ea → are: у неё двое детей. «a» — вспомогательный глагол прошедшего времени, «au» — для ei/ele." },
    { type: "input", q: "Voi ___ timp? (a avea)", a: ["aveți"],
      explain: "voi → aveți: у вас есть время?" },
    { type: "choice", q: "Câți ani ___? (сколько тебе лет?)", options: ["ești", "ai", "are"], a: 1,
      explain: "Возраст «имеют»: Câți ani ai? — дословно «сколько лет ты имеешь?». tu → ai." },
    { type: "input", q: "___ douăzeci de ani. (мне 20 лет)", a: ["Am", "Eu am"],
      explain: "Мне 20 лет = Am douăzeci de ani — с глаголом a avea, а не a fi." },
    { type: "choice", q: "Ana și Maria? ___ sunt studente.", options: ["Ele", "Ei", "Voi"], a: 0,
      explain: "Речь только о женщинах — ele. ei — мужчины или смешанная группа." },
    { type: "choice", q: "Dumneavoastră ___ domnul Popescu?", options: ["este", "ești", "sunteți"], a: 2,
      explain: "Вежливое dumneavoastră сочетается с формой 2-го лица мн. ч.: sunteți — как русское «Вы»." },
    { type: "input", q: "Tu ___ un câine? (a avea)", a: ["ai"],
      explain: "tu → ai: у тебя есть собака?" },
    { type: "order", words: ["Eu", "am", "o", "soră"], ru: "У меня есть сестра.",
      explain: "«У меня есть» = eu am (я имею). Местоимение eu можно опустить: Am o soră." },
    { type: "order", words: ["Ana", "este", "acasă", "acum"], ru: "Ана сейчас дома.",
      alts: [["acum", "Ana", "este", "acasă"], ["Ana", "este", "acum", "acasă"], ["Ana", "acum", "este", "acasă"]],
      explain: "Глагол a fi обязателен: Ana este acasă. Наречие acum может стоять в начале, в конце или рядом с глаголом." },
    { type: "order", words: ["Ei", "sunt", "din", "România"], ru: "Они из Румынии.",
      explain: "ei → sunt. «Быть откуда-то» = a fi din: Sunt din Rusia, Ei sunt din România." }
  ]
});
