DE.grammar.push({
  id: "articles",
  title: "Артикли и род существительных",
  level: "A1",
  emoji: "📰",
  summary: "der, die, das; ein, eine — и как угадать род по окончанию",
  content: `<p>В немецком три рода, как в русском: мужской, женский и средний. Но род почти всегда виден не по самому слову, а по <b>артиклю</b> перед ним. И часто он <b>не совпадает</b> с русским: <i>die</i> Sonne (солнце — ср. р. в русском), <i>der</i> Mond (луна — ж. р.), <i>das</i> Mädchen (девочка!).</p>

<table>
<tr><th></th><th>Мужской</th><th>Женский</th><th>Средний</th><th>Мн. число</th></tr>
<tr><td>Определённый («этот, тот самый»)</td><td><b>der</b> Tisch</td><td><b>die</b> Lampe</td><td><b>das</b> Buch</td><td><b>die</b> Bücher</td></tr>
<tr><td>Неопределённый («какой-то, один»)</td><td><b>ein</b> Tisch</td><td><b>eine</b> Lampe</td><td><b>ein</b> Buch</td><td>— Bücher</td></tr>
</table>

<div class="ex"><b>Das ist ein Tisch. Der Tisch ist neu.</b> — Это стол. Стол новый.</div>
<div class="ex"><b>Hier ist eine Lampe. Die Lampe ist schön.</b> — Вот лампа. Лампа красивая.</div>
<p>Неопределённый артикль — когда предмет упоминается впервые или «какой-то один»; определённый — когда понятно, о каком именно идёт речь.</p>

<h3>Как угадать род: подсказки-окончания</h3>
<table>
<tr><th>Род</th><th>Окончания и группы</th><th>Примеры</th></tr>
<tr><td><b>die</b></td><td>-ung, -heit, -keit, -schaft, -ion, -tät, -ei, -ie, -ik; большинство на -e</td><td>die Zeitung, die Freiheit, die Universität, die Bäckerei, die Musik, die Lampe</td></tr>
<tr><td><b>das</b></td><td>-chen, -lein (уменьшительные), -um, -ment, большинство на -o; глаголы как существительные</td><td>das Mädchen, das Brötchen, das Museum, das Dokument, das Auto, das Essen</td></tr>
<tr><td><b>der</b></td><td>-er (люди, профессии), -ling, -ismus, -ist, -or; дни недели, месяцы, времена года</td><td>der Lehrer, der Frühling, der Tourist, der Motor, der Montag, der Mai</td></tr>
</table>

<div class="tip">Окончания <b>-chen</b> и <b>-lein</b> «побеждают» смысл: <span class="hl">das Mädchen</span>, <span class="hl">das Brötchen</span> — всегда средний род. А в сложном слове род определяет <b>последнее</b> слово: das Haus + die Tür = <span class="hl">die Haustür</span>.</div>

<div class="warn">Учите каждое существительное <b>сразу с артиклем</b>: не «Tisch», а «der Tisch». Помогает цветовой код: der — синий, die — красный, das — зелёный.</div>`,
  exercises: [
    { type: "choice", q: "___ Zeitung", options: ["der", "die", "das"], a: 1,
      explain: "Окончание -ung → всегда женский род: die Zeitung. Правило без исключений." },
    { type: "choice", q: "___ Mädchen", options: ["der", "die", "das"], a: 2,
      explain: "Окончание -chen → всегда средний род: das Mädchen, хотя это девочка. Грамматический род важнее смысла." },
    { type: "choice", q: "___ Lehrer", options: ["der", "die", "das"], a: 0,
      explain: "Профессии и деятели на -er — мужской род: der Lehrer. Женщина-учитель — die Lehrerin." },
    { type: "choice", q: "___ Information", options: ["der", "die", "das"], a: 1,
      explain: "Окончание -ion → всегда женский род: die Information (как die Situation, die Nation)." },
    { type: "input", q: "Das ist ___ Tisch. (неопределённый артикль)", a: ["ein"],
      explain: "der Tisch — мужской род, неопределённый артикль ein (без окончания). eine — только для женского рода." },
    { type: "input", q: "Das ist ___ Lampe. (неопределённый артикль)", a: ["eine"],
      explain: "die Lampe — женский род, поэтому eine Lampe." },
    { type: "choice", q: "___ Brötchen", options: ["der", "die", "das"], a: 2,
      explain: "Окончание -chen → средний род: das Brötchen (булочка)." },
    { type: "order", words: ["Das", "ist", "eine", "Frage"], ru: "Это вопрос.",
      explain: "die Frage (большинство слов на -e — женского рода) → eine Frage." },
    { type: "choice", q: "Kinderzimmer = die Kinder + das Zimmer. Какой артикль?", options: ["der", "die", "das"], a: 2,
      explain: "В сложных словах род по последнему слову: das Zimmer → das Kinderzimmer." },
    { type: "choice", q: "___ Montag", options: ["der", "die", "das"], a: 0,
      explain: "Дни недели (как и месяцы, времена года) — мужского рода: der Montag." },
    { type: "input", q: "Ich habe ___ Auto. (неопределённый артикль)", a: ["ein"],
      explain: "das Auto — средний род, неопределённый артикль ein (как у мужского рода)." },
    { type: "choice", q: "Какой артикль у всех существительных во множественном числе?", options: ["der", "die", "das"], a: 1,
      explain: "Во множественном числе определённый артикль всегда die: die Tische, die Bücher." },
    { type: "order", words: ["Hier", "ist", "ein", "Foto"], ru: "Вот фотография.",
      explain: "das Foto (слова на -o обычно среднего рода) → ein Foto." },
    { type: "input", q: "___ Universität (определённый артикль)", a: ["die"],
      explain: "Окончание -tät → женский род: die Universität." }
  ]
});
