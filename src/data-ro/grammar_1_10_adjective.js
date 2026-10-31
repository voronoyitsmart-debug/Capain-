DE.grammar.push({
  id: "adjective",
  title: "Прилагательные: согласование и место",
  level: "A1",
  emoji: "🎨",
  summary: "o casă frumoasă, băieți frumoși — 4 формы, место после существительного",
  content: `<p>Как и в русском, прилагательное <b>согласуется</b> с существительным в роде и числе: красивый — красивая — красивые. Главное отличие: в румынском оно обычно стоит <b>после</b> существительного.</p>
<div class="ex"><b>o casă mare</b> — большой дом (дословно «дом большой»)</div>
<div class="ex"><b>un băiat înalt</b> — высокий мальчик</div>

<h3>Четыре формы</h3>
<table>
<tr><th>м. ед.</th><th>ж. ед.</th><th>м. мн.</th><th>ж. мн.</th><th>Перевод</th></tr>
<tr><td>frumos</td><td>frumoasă</td><td>frumoși</td><td>frumoase</td><td>красивый</td></tr>
<tr><td>bun</td><td>bună</td><td>buni</td><td>bune</td><td>хороший</td></tr>
<tr><td>înalt</td><td>înaltă</td><td>înalți</td><td>înalte</td><td>высокий</td></tr>
<tr><td>nou</td><td>nouă</td><td>noi</td><td>noi</td><td>новый</td></tr>
<tr><td>mic</td><td>mică</td><td>mici</td><td>mici</td><td>маленький</td></tr>
<tr><td>românesc</td><td>românească</td><td>românești</td><td>românești</td><td>румынский</td></tr>
<tr><td>mare</td><td>mare</td><td>mari</td><td>mari</td><td>большой</td></tr>
<tr><td>verde</td><td>verde</td><td>verzi</td><td>verzi</td><td>зелёный</td></tr>
</table>
<p>Прилагательные на <b>-e</b> (mare, verde, dulce) имеют всего две формы: ед. ч. и мн. ч. Как и у существительных, перед -i бывают чередования: înalt → înalți, verde → verzi.</p>

<h3>Средний род</h3>
<p>Средний род и тут «двуликий»: в ед. ч. — мужская форма, во мн. ч. — женская.</p>
<div class="ex"><b>un oraș frumos — două orașe frumoase</b></div>
<div class="ex"><b>un tren nou — trenuri noi</b></div>

<h3>Артикль и место</h3>
<p>Артикль приклеивается к существительному, прилагательное идёт следом: <b>casa mare</b> — (этот) большой дом. После глагола a fi прилагательное тоже согласуется: <b>Casele sunt mari.</b> — Дома большие. <b>Fata este frumoasă.</b> — Девушка красивая.</p>
<p>Перед существительным прилагательное ставят редко — для эмоции или в стихах: <b>o frumoasă zi</b>. А вот слова количества стоят впереди: <b>mulți</b> oameni, <b>alt</b> oraș, <b>fiecare</b> zi.</p>

<div class="warn">Цвета и национальности — только после существительного: <b>o mașină roșie</b>, <b>o limbă străină</b>, <b>muzica românească</b>.</div>

<div class="tip">Легко запомнить порядок: в румынском сначала <b>что</b>, потом <b>какое</b> — «дом большой», «кофе чёрный» (cafea neagră). А форму прилагательного подсказывает артикль: o → -ă, niște + ж. р. → -e.</div>`,
  exercises: [
    { type: "choice", q: "o fată ___", options: ["frumos", "frumoasă", "frumoși"], a: 1,
      explain: "fată — женский род ед. ч.: frumoasă." },
    { type: "input", q: "niște băieți ___ (înalt)", a: ["înalți"],
      explain: "Мужской род мн. ч. → -i, t → ț: înalți." },
    { type: "input", q: "o casă ___ (mic)", a: ["mică"],
      explain: "Женский род ед. ч. → -ă: mică." },
    { type: "choice", q: "două trenuri ___", options: ["nou", "noi", "nouă"], a: 1,
      explain: "tren — средний род; во мн. ч. прилагательное берёт женскую форму: trenuri noi." },
    { type: "choice", q: "un oraș ___", options: ["frumoasă", "frumoase", "frumos"], a: 2,
      explain: "Средний род в ед. ч. — как мужской: un oraș frumos." },
    { type: "choice", q: "multe orașe ___", options: ["frumoși", "frumoase", "frumos"], a: 1,
      explain: "Средний род во мн. ч. — как женский: orașe frumoase." },
    { type: "input", q: "niște flori ___ (alb)", a: ["albe"],
      explain: "floare — женский род, мн. ч. flori → albe." },
    { type: "choice", q: "o mașină ___ (mare)", options: ["mari", "mară", "mare"], a: 2,
      explain: "mare имеет только две формы: mare (ед. ч.) и mari (мн. ч.). Формы «mară» нет." },
    { type: "input", q: "doi câini ___ (mare)", a: ["mari"],
      explain: "Мн. ч. от mare — mari (для обоих родов)." },
    { type: "choice", q: "Как сказать «красная машина»?", options: ["o mașină roșie", "o roșie mașină", "o mașină roșu"], a: 0,
      explain: "Цвет — после существительного и в женском роде: o mașină roșie." },
    { type: "input", q: "o limbă ___ (românesc)", a: ["românească"],
      explain: "românesc → в женском роде românească: limba românească." },
    { type: "choice", q: "Prăjiturile sunt ___.", options: ["bună", "buni", "bune"], a: 2,
      explain: "prăjitură — женский род, мн. ч. prăjituri → bune." },
    { type: "order", words: ["Am", "o", "casă", "mare", "și", "frumoasă"], ru: "У меня большой и красивый дом.",
      alts: [["Am", "o", "casă", "frumoasă", "și", "mare"]],
      explain: "Прилагательные после существительного, обе в женском роде, потому что casă — женского рода." },
    { type: "order", words: ["Copiii", "sunt", "foarte", "fericiți"], ru: "Дети очень счастливы.",
      explain: "После a fi прилагательное согласуется с подлежащим: copiii (м. мн.) → fericiți." }
  ]
});
