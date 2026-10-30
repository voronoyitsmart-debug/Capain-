DE.grammar.push({
  id: "plural",
  title: "Множественное число",
  level: "A1",
  emoji: "👥",
  summary: "Пять типов: -e, -(e)n, -er, без окончания, -s",
  content: `<p>Хорошая новость: артикль во множественном числе всегда один — <b>die</b>. Плохая: окончаний у самих слов пять типов, часто с умлаутом. Но есть надёжные подсказки!</p>

<table>
<tr><th>Тип</th><th>Кто обычно так образует</th><th>Примеры</th></tr>
<tr><td><b>-(e)n</b></td><td>почти все слова женского рода; -ung, -heit, -keit, -ion; м. р. на -e</td><td>die Frau → Frau<b>en</b>, die Lampe → Lampe<b>n</b>, die Zeitung → Zeitung<b>en</b>, der Junge → Junge<b>n</b></td></tr>
<tr><td><b>-e</b> (часто с умлаутом)</td><td>многие слова мужского рода; короткие слова</td><td>der Tag → Tag<b>e</b>, der Tisch → Tisch<b>e</b>, der Stuhl → St<b>ü</b>hl<b>e</b>, die Hand → H<b>ä</b>nd<b>e</b></td></tr>
<tr><td><b>-er</b> (с умлаутом, где можно)</td><td>многие короткие слова среднего рода</td><td>das Kind → Kind<b>er</b>, das Buch → B<b>ü</b>ch<b>er</b>, der Mann → M<b>ä</b>nn<b>er</b></td></tr>
<tr><td><b>—</b> (иногда только умлаут)</td><td>м. и ср. р. на -er, -el, -en, -chen, -lein</td><td>der Lehrer → Lehrer, das Zimmer → Zimmer, das Mädchen → Mädchen, der Vater → V<b>ä</b>ter</td></tr>
<tr><td><b>-s</b></td><td>слова на гласный (-a, -o, -i, -y), заимствования</td><td>das Auto → Auto<b>s</b>, das Hotel → Hotel<b>s</b>, das Handy → Handy<b>s</b>, die Oma → Oma<b>s</b></td></tr>
</table>

<div class="tip">Женщина-профессия удваивает «n»: <span class="hl">die Lehrerin → die Lehrerinnen</span>, die Freundin → die Freundinnen. Правило «-in → -innen» работает всегда.</div>

<h3>Без неопределённого артикля</h3>
<p>Как и в русском, «какие-то» предметы во мн. числе идут без артикля: <b>ein Kind</b> — ребёнок, <b>Kinder</b> — дети. Отрицание — <b>keine</b>: keine Kinder.</p>

<div class="ex"><b>Die Kinder spielen im Park.</b> — Дети играют в парке.</div>
<div class="ex"><b>Wir haben zwei Katzen.</b> — У нас две кошки. (die Katze → die Katzen)</div>
<div class="ex"><b>Die Bücher sind sehr alt.</b> — Книги очень старые.</div>

<div class="warn">Подсказки — это вероятность, а не закон. Поэтому в словаре слово учат тройкой: <b>der Stuhl, -¨e</b> = der Stuhl, die Stühle. Запись «-¨e» значит «умлаут + e».</div>`,
  exercises: [
    { type: "choice", q: "das Kind → die ___", options: ["Kinds", "Kinder", "Kinden"], a: 1,
      explain: "Короткие слова среднего рода часто берут -er: die Kinder." },
    { type: "input", q: "die Frau → die ___", a: ["Frauen"],
      explain: "Большинство слов женского рода получают -(e)n: die Frau → die Frauen." },
    { type: "input", q: "das Auto → die ___", a: ["Autos"],
      explain: "Слова на гласный (-o, -a, -i) и заимствования берут -s: das Auto → die Autos." },
    { type: "choice", q: "der Lehrer → die ___", options: ["Lehrer", "Lehrern", "Lehrers"], a: 0,
      explain: "Мужской род на -er: без окончания — die Lehrer." },
    { type: "choice", q: "das Buch → die ___", options: ["Buchs", "Büche", "Bücher"], a: 2,
      explain: "das Buch получает -er и умлаут: die Bücher." },
    { type: "input", q: "die Lehrerin → die ___", a: ["Lehrerinnen"],
      explain: "Суффикс -in во мн. числе → -innen (с двумя n): die Lehrerinnen." },
    { type: "order", words: ["Die", "Kinder", "spielen", "im", "Park"], ru: "Дети играют в парке.",
      alts: [["im", "Park", "spielen", "Die", "Kinder"]],
      explain: "die Kinder — мн. число от das Kind, поэтому глагол во мн. числе: spielen. Можно начать с места: Im Park spielen die Kinder." },
    { type: "choice", q: "der Tisch → die ___", options: ["Tische", "Tischen", "Tischer"], a: 0,
      explain: "Многие слова мужского рода берут -e: die Tische." },
    { type: "input", q: "die Zeitung → die ___", a: ["Zeitungen"],
      explain: "Слова на -ung всегда получают -en: die Zeitung → die Zeitungen." },
    { type: "choice", q: "das Mädchen → die ___", options: ["Mädchens", "Mädchen", "Mädchenen"], a: 1,
      explain: "Слова на -chen во мн. числе не меняются: die Mädchen." },
    { type: "choice", q: "der Stuhl → die ___", options: ["Stuhle", "Stühle", "Stühlen"], a: 1,
      explain: "der Stuhl получает -e и умлаут: die Stühle. -n появляется только в Dativ мн. числа (den Stühlen)." },
    { type: "input", q: "der Mann → die ___", a: ["Männer", "Maenner"],
      explain: "der Mann получает -er и умлаут: die Männer." },
    { type: "order", words: ["Wir", "haben", "zwei", "Katzen"], ru: "У нас две кошки.",
      explain: "die Katze → die Katzen (женский род → -n)." },
    { type: "choice", q: "der Bruder → die ___", options: ["Bruders", "Brüder", "Brudern"], a: 1,
      explain: "Мужской род на -er: окончания нет, но появляется умлаут — die Brüder." }
  ]
});
