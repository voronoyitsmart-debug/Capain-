DE.grammar.push({
  id: "negatie_intrebari",
  title: "Отрицание nu и вопросы",
  level: "A1",
  emoji: "❓",
  summary: "Nu știu. Nu văd nimic. Ce? Cine? Unde? Când? Cum? Cât? De ce?",
  content: `<p>Отрицание и вопросы в румынском устроены почти как в русском — это одна из самых лёгких тем!</p>

<h3>Отрицание: nu перед глаголом</h3>
<p>Частица <b>nu</b> ставится прямо перед глаголом, как русское «не»: <b>Nu sunt acasă.</b> — Я не дома. Слово nu означает и «нет»: <b>Nu, nu știu.</b> — Нет, я не знаю.</p>
<div class="ex"><b>Nu înțeleg.</b> — Я не понимаю.</div>
<div class="ex"><b>Nu am timp.</b> — У меня нет времени.</div>
<p>В разговоре nu сливается с глаголом: <b>n-am</b> (= nu am), <b>n-ai</b>, <b>nu-i</b> (= nu este).</p>

<h3>Двойное отрицание — как в русском</h3>
<p>В отличие от английского, в румынском «никто, ничего, никогда» требуют <b>nu</b> при глаголе — ровно как у нас:</p>
<table>
<tr><th>Слово</th><th>Перевод</th><th>Пример</th></tr>
<tr><td>nimic</td><td>ничего</td><td>Nu văd nimic. — Я ничего не вижу.</td></tr>
<tr><td>nimeni</td><td>никто</td><td>Nimeni nu știe. — Никто не знает.</td></tr>
<tr><td>niciodată</td><td>никогда</td><td>Nu beau niciodată cafea. — Я никогда не пью кофе.</td></tr>
<tr><td>nicăieri</td><td>нигде, никуда</td><td>Nu merg nicăieri. — Я никуда не иду.</td></tr>
</table>

<h3>Вопросы</h3>
<p>Вопрос «да/нет» задаётся интонацией, порядок слов не меняется: <b>Ai timp?</b> — У тебя есть время? Вопросительные слова ставятся в начало:</p>
<table>
<tr><th>Слово</th><th>Перевод</th><th>Пример</th></tr>
<tr><td><b>ce</b></td><td>что</td><td>Ce faci? — Что делаешь?</td></tr>
<tr><td><b>cine</b></td><td>кто</td><td>Cine este acolo? — Кто там?</td></tr>
<tr><td><b>unde</b></td><td>где, куда</td><td>Unde locuiești? Unde mergi?</td></tr>
<tr><td><b>de unde</b></td><td>откуда</td><td>De unde ești? — Откуда ты?</td></tr>
<tr><td><b>când</b></td><td>когда</td><td>Când vii? — Когда ты придёшь?</td></tr>
<tr><td><b>cum</b></td><td>как</td><td>Cum te cheamă? — Как тебя зовут?</td></tr>
<tr><td><b>cât / câtă / câți / câte</b></td><td>сколько</td><td>Cât costă? Câți ani ai?</td></tr>
<tr><td><b>de ce</b></td><td>почему</td><td>De ce înveți româna? — Pentru că… (потому что…)</td></tr>
<tr><td><b>care</b></td><td>который, какой</td><td>Care este numele tău?</td></tr>
</table>

<div class="warn">Русское «сколько» не меняется, а румынское <b>согласуется</b> с существительным, как прилагательное: <b>cât</b> timp, <b>câtă</b> apă, <b>câți</b> ani (м. мн.), <b>câte</b> cărți (ж. и ср. мн.). Просто о цене — «Cât costă?».</div>

<div class="tip">«Unde» = и «где», и «куда»: Unde ești? — Где ты? Unde mergi? — Куда идёшь? Одно слово вместо двух. А «откуда» — просто добавьте de: <b>De unde?</b></div>`,
  exercises: [
    { type: "choice", q: "Как сказать «Я не понимаю»?", options: ["Înțeleg nu.", "Nu înțeleg.", "Nu nu înțeleg."], a: 1,
      explain: "nu ставится прямо перед глаголом: Nu înțeleg." },
    { type: "input", q: "___ ești? — Sunt Ana.", a: ["Cine"],
      explain: "Спрашиваем о человеке — cine (кто)." },
    { type: "input", q: "___ locuiești? — În Iași.", a: ["Unde"],
      explain: "Ответ — место, значит, вопрос unde (где)." },
    { type: "choice", q: "___ costă? — Zece lei.", options: ["Câți", "Câte", "Cât"], a: 2,
      explain: "О цене спрашивают Cât costă? — без существительного используется форма cât." },
    { type: "choice", q: "___ ani ai?", options: ["Cât", "Câți", "Câte"], a: 1,
      explain: "an — мужской род, мн. ч. ani: câți ani." },
    { type: "choice", q: "___ ești trist? — Pentru că plouă.", options: ["Cum", "Ce", "De ce"], a: 2,
      explain: "Ответ «Pentru că…» (потому что) — значит, вопрос de ce (почему)." },
    { type: "input", q: "___ te cheamă? — Mă cheamă Ion.", a: ["Cum"],
      explain: "Cum te cheamă? — Как тебя зовут? Как и в русском, вопрос начинается с «как» — cum." },
    { type: "choice", q: "Как сказать «Я ничего не вижу»?", options: ["Văd nimic.", "Nu văd ceva.", "Nu văd nimic."], a: 2,
      explain: "Двойное отрицание, как в русском: nu + nimic." },
    { type: "input", q: "___ vii acasă? — Diseară.", a: ["Când"],
      explain: "Ответ — время (diseară — сегодня вечером), значит, când (когда)." },
    { type: "input", q: "___ faci? — Citesc.", a: ["Ce"],
      explain: "Спрашиваем о действии/предмете — ce (что)." },
    { type: "choice", q: "Câte ___ ai?", options: ["surori", "frați", "ani"], a: 0,
      explain: "câte — для женского и среднего рода во мн. ч.: câte surori. С frați и ani нужно câți." },
    { type: "order", words: ["Nu", "vorbesc", "bine", "românește"], ru: "Я не очень хорошо говорю по-румынски.",
      alts: [["Nu", "vorbesc", "românește", "bine"]],
      explain: "nu — перед глаголом. Наречия bine и românește стоят после глагола." },
    { type: "order", words: ["De", "ce", "nu", "vii", "la", "petrecere?"], ru: "Почему ты не приходишь на вечеринку?",
      explain: "Вопросительное de ce — в начале, затем nu перед глаголом." },
    { type: "order", words: ["Nimeni", "nu", "știe"], ru: "Никто не знает.",
      alts: [["nu", "știe", "Nimeni"]],
      explain: "Двойное отрицание: nimeni + nu, как в русском «никто не». Возможно и «Nu știe nimeni»." }
  ]
});
