DE.grammar.push({
  id: "relative_clauses",
  title: "Относительные придаточные",
  level: "B1",
  emoji: "🔗",
  summary: "der Mann, der/den/dem/dessen… — «который» по-немецки",
  content: `<p>Относительное придаточное — это немецкое «<b>который</b>». Оно поясняет существительное и всегда отделяется <b>запятой</b>, а спрягаемый глагол уходит <b>в конец</b>.</p>
<div class="ex"><b>Das ist der Mann, der neben mir wohnt.</b> — Это мужчина, который живёт рядом со мной.</div>
<h3>Относительные местоимения</h3>
<p>Почти совпадают с определённым артиклем. Отличаются только выделенные формы.</p>
<table>
<tr><th></th><th>m</th><th>f</th><th>n</th><th>Pl</th></tr>
<tr><td>Nom</td><td>der</td><td>die</td><td>das</td><td>die</td></tr>
<tr><td>Akk</td><td>den</td><td>die</td><td>das</td><td>die</td></tr>
<tr><td>Dat</td><td>dem</td><td>der</td><td>dem</td><td><span class="hl">denen</span></td></tr>
<tr><td>Gen</td><td><span class="hl">dessen</span></td><td><span class="hl">deren</span></td><td><span class="hl">dessen</span></td><td><span class="hl">deren</span></td></tr>
</table>
<h3>Как выбрать форму — два шага</h3>
<ol>
<li><b>Род и число</b> берём из существительного, к которому относимся (der Mann → m).</li>
<li><b>Падеж</b> определяем по роли местоимения <b>внутри придаточного</b> — так же, как в русском: «мужчина, <i>которого</i> я вижу» (Akk), «<i>которому</i> я помогаю» (Dat).</li>
</ol>
<div class="ex"><b>Der Mann, den ich kenne, ist Arzt.</b> — Мужчина, которого я знаю, врач. (kennen + Akk)</div>
<div class="ex"><b>Die Kinder, denen ich helfe, sind nett.</b> — Дети, которым я помогаю, милые. (helfen + Dat)</div>
<div class="ex"><b>Die Frau, deren Auto kaputt ist, wartet auf den Bus.</b> — Женщина, чья машина сломалась, ждёт автобус.</div>
<h3>С предлогами</h3>
<p>Предлог стоит <b>перед</b> местоимением и определяет его падеж: <i>Die Stadt, <b>in der</b> ich wohne</i> (в котором), <i>der Freund, <b>mit dem</b> ich spiele</i>, <i>die Leute, <b>auf die</b> wir warten</i>.</p>
<h3>wo и was</h3>
<table>
<tr><th>Слово</th><th>Когда</th><th>Пример</th></tr>
<tr><td><b>wo</b></td><td>место (вместо in dem/in der)</td><td>die Stadt, <b>wo</b> ich wohne</td></tr>
<tr><td><b>was</b></td><td>после alles, nichts, etwas, das, viel и после целого предложения</td><td>Das ist <b>alles, was</b> ich weiß.</td></tr>
<tr><td><b>was</b></td><td>после превосходной степени (средний род)</td><td>das Beste, <b>was</b> mir passiert ist</td></tr>
</table>
<div class="ex"><b>Er hat die Prüfung bestanden, was mich sehr freut.</b> — Он сдал экзамен, что меня очень радует.</div>
<div class="tip">💡 <b>dessen/deren = «чей/чья/чьё»</b>. После них существительное идёт <b>без артикля</b>: <i>der Mann, dessen Sohn…</i> Форма зависит от «владельца»: мужчина/ребёнок → dessen, женщина/люди → deren.</div>
<div class="warn">Запятая обязательна, а глагол — в конце! <i>Das Buch, das ich gestern gekauft <b>habe</b>, ist toll.</i></div>`,
  exercises: [
    { type: "choice", q: "Das ist die Frau, ___ ich gestern gesehen habe.", options: ["der", "die", "den"], a: 1,
      explain: "die Frau — женский род; в придаточном sehen требует Akkusativ (кого я видел) → die. «den» — Akk мужского рода, «der» — Dativ женского." },
    { type: "input", q: "Der Mann, ___ ich geholfen habe, ist mein Nachbar.", a: ["dem", "welchem"],
      explain: "helfen требует Dativ (кому я помог), der Mann — мужской род → dem. «den» — частая ошибка: helfen не управляет Akkusativ." },
    { type: "choice", q: "Die Kinder, mit ___ ich spiele, sind sehr laut.", options: ["den", "denen", "die"], a: 1,
      explain: "mit всегда требует Dativ; Dativ мн. числа у относительного местоимения — denen (не den, как у артикля)." },
    { type: "input", q: "Das ist das Kind, ___ Mutter Ärztin ist.", a: ["dessen"],
      explain: "«чья мама» → Genitiv. Владелец das Kind — средний род → dessen (женский род и мн. число дали бы deren)." },
    { type: "choice", q: "Ich kenne eine Frau, ___ Sohn in Paris lebt.", options: ["dessen", "deren", "der"], a: 1,
      explain: "«чей сын» → Genitiv; форма зависит от владельца, а не от слова Sohn. Владелец — eine Frau → deren. «dessen» — для мужского/среднего рода." },
    { type: "order", words: ["Das", "ist", "der", "Film,", "den", "ich", "gesehen", "habe"], ru: "Это фильм, который я посмотрел.",
      explain: "der Film — мужской род, sehen + Akkusativ → den. В придаточном спрягаемый habe стоит в самом конце." },
    { type: "input", q: "Das ist alles, ___ ich weiß.", a: ["was"],
      explain: "После alles, nichts, etwas, vieles относительное слово — was. «das» здесь ошибка." },
    { type: "choice", q: "Berlin ist die Stadt, ___ ich geboren bin.", options: ["wo", "was", "die"], a: 0,
      explain: "Речь о месте («где я родился») → wo (= in der). «die» без предлога означало бы «которую», «was» не относится к городу." },
    { type: "input", q: "Der Stuhl, auf ___ du sitzt, ist alt.", a: ["dem", "welchem"],
      explain: "sitzen auf — «где?» → Dativ; der Stuhl — мужской род → auf dem. «auf den» был бы ответом на вопрос «куда?»." },
    { type: "choice", q: "Wie heißt der Kollege, ___ heute Geburtstag hat?", options: ["den", "der", "dem"], a: 1,
      explain: "В придаточном коллега — подлежащее (он сам «имеет» день рождения) → Nominativ der." },
    { type: "order", words: ["Die", "Leute,", "auf", "die", "wir", "warten,", "kommen", "spät"], ru: "Люди, которых мы ждём, приходят поздно.",
      explain: "warten auf + Akkusativ → auf die; предлог стоит перед местоимением. Придаточное вставлено внутрь, после него идёт глагол главного предложения kommen." },
    { type: "input", q: "Das ist das Beste, ___ ich je gegessen habe.", a: ["was"],
      explain: "После превосходной степени в среднем роде (das Beste) относительное слово — was, а не das." },
    { type: "choice", q: "Die Firma, für ___ er arbeitet, ist sehr groß.", options: ["die", "der", "deren"], a: 0,
      explain: "für всегда требует Akkusativ; die Firma — женский род → für die. «der» — Dativ, «deren» — Genitiv («чья»)." }
  ]
});
