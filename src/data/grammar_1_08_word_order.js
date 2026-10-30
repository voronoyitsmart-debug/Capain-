DE.grammar.push({
  id: "word_order",
  title: "Порядок слов: глагол на 2-м месте",
  level: "A1",
  emoji: "🧩",
  summary: "Глагол — на 2-м месте, инверсия, W-вопросы и вопросы «да/нет»",
  content: `<p>В русском порядок слов почти свободный: «Я завтра еду», «Завтра я еду», «Еду я завтра». В немецком есть железное правило: в повествовательном предложении спрягаемый глагол стоит на <b>втором месте</b>.</p>

<h3>Второе место ≠ второе слово</h3>
<p>«Место» — это смысловой блок. «Am Wochenende» — два слова, но одно место.</p>
<table>
<tr><th>Позиция 1</th><th>Позиция 2 (глагол)</th><th>Остальное</th></tr>
<tr><td>Ich</td><td><b>fahre</b></td><td>morgen nach Berlin.</td></tr>
<tr><td>Morgen</td><td><b>fahre</b></td><td>ich nach Berlin.</td></tr>
<tr><td>Am Wochenende</td><td><b>spielen</b></td><td>wir Fußball.</td></tr>
<tr><td>Meine Schwester</td><td><b>wohnt</b></td><td>in Wien.</td></tr>
</table>

<div class="tip">Представьте глагол как <b>стрелку весов</b>: она всегда посередине, на 2-м месте. Если на 1-е место «садится» что-то другое (время, место), подлежащее «перепрыгивает» за глагол. Это называется <span class="hl">инверсия</span>: Heute <b>gehe ich</b> ins Kino.</div>

<h3>Вопросы с вопросительным словом (W-Fragen)</h3>
<p>Схема: <b>W-слово + глагол + подлежащее…?</b></p>
<table>
<tr><th>W-слово</th><th>Перевод</th><th>Пример</th></tr>
<tr><td>wer</td><td>кто</td><td>Wer ist das?</td></tr>
<tr><td>was</td><td>что</td><td>Was machst du?</td></tr>
<tr><td>wo / woher / wohin</td><td>где / откуда / куда</td><td>Woher kommst du?</td></tr>
<tr><td>wann</td><td>когда</td><td>Wann beginnt der Kurs?</td></tr>
<tr><td>wie / wie viel</td><td>как / сколько</td><td>Wie heißt du?</td></tr>
<tr><td>warum</td><td>почему</td><td>Warum lernst du Deutsch?</td></tr>
</table>

<h3>Вопросы «да / нет»</h3>
<p>Вопросительного слова нет — глагол встаёт на <b>первое</b> место:</p>
<div class="ex"><b>Du wohnst in Berlin. → Wohnst du in Berlin?</b> — Ты живёшь в Берлине?</div>
<div class="ex"><b>Sprichst du Deutsch? — Ja, ein bisschen.</b> — Ты говоришь по-немецки? — Да, немного.</div>

<h3>Союзы und, aber, oder, denn</h3>
<p>Они стоят на «нулевой» позиции и порядок не меняют:</p>
<div class="ex"><b>Ich trinke Tee, aber mein Mann trinkt Kaffee.</b> — Я пью чай, а мой муж пьёт кофе.</div>
<div class="ex"><b>Und dann gehe ich nach Hause.</b> — И потом я иду домой. (und — 0, dann — 1, gehe — 2)</div>

<div class="warn">Типичная ошибка русскоговорящих: «Heute ich gehe…». Правильно: <b>Heute gehe ich…</b> — глагол не уступает второе место никому!</div>`,
  exercises: [
    { type: "choice", q: "Heute ___ ins Kino.", options: ["ich gehe", "gehe ich", "ich gehen"], a: 1,
      explain: "На 1-м месте heute → инверсия: глагол на 2-м месте, подлежащее после него: Heute gehe ich. «ich gehe» после heute — ошибка." },
    { type: "choice", q: "Wo ___?", options: ["du wohnst", "wohnst du", "wohnen du"], a: 1,
      explain: "W-вопрос: W-слово + глагол + подлежащее: Wo wohnst du? «wohnen» не согласуется с du." },
    { type: "order", words: ["Wo", "wohnst", "du"], ru: "Где ты живёшь?",
      explain: "W-слово (Wo), глагол (wohnst), подлежащее (du)." },
    { type: "order", words: ["Morgen", "fahre", "ich", "nach", "Berlin"], ru: "Завтра я еду в Берлин.",
      alts: [["ich", "fahre", "Morgen", "nach", "Berlin"], ["nach", "Berlin", "fahre", "ich", "Morgen"]],
      explain: "Morgen на 1-м месте → глагол fahre на 2-м, ich сразу после него. Так же верно: Ich fahre morgen nach Berlin — главное, чтобы глагол был вторым." },
    { type: "input", q: "___ kommst du? — Aus Russland.", a: ["Woher"],
      explain: "Ответ «Aus Russland» (из России) отвечает на вопрос «откуда?» — woher. Wo — «где», wohin — «куда»." },
    { type: "choice", q: "Какое предложение правильное?", options: ["Am Abend ich lese ein Buch.", "Am Abend lese ich ein Buch.", "Am Abend lese ein Buch ich."], a: 1,
      explain: "«Am Abend» — 1-е место, lese — 2-е, ich — сразу за глаголом." },
    { type: "order", words: ["Sprichst", "du", "Deutsch"], ru: "Ты говоришь по-немецки?",
      explain: "Вопрос «да/нет»: глагол на 1-м месте, затем подлежащее: Sprichst du Deutsch?" },
    { type: "input", q: "___ heißt du? — Ich heiße Olga.", a: ["Wie"],
      explain: "«Как тебя зовут?» = Wie heißt du? (дословно «как ты называешься»). «Was heißt du» — ошибка." },
    { type: "input", q: "___ ist das? — Das ist mein Bruder.", a: ["Wer"],
      explain: "Ответ — человек (mein Bruder), поэтому вопрос «кто?» — wer. Was спрашивает о предметах." },
    { type: "choice", q: "Какое предложение правильное?", options: ["Und dann ich gehe nach Hause.", "Und dann gehe ich nach Hause.", "Und gehe ich dann nach Hause."], a: 1,
      explain: "und — нулевая позиция, dann — 1-я, глагол gehe — 2-я." },
    { type: "input", q: "___ beginnt der Kurs? — Um neun Uhr.", a: ["Wann"],
      explain: "Ответ «Um neun Uhr» — время, вопрос «когда?» — wann. Wie spät — «который час»." },
    { type: "order", words: ["Am", "Wochenende", "spielen", "wir", "Fußball"], ru: "На выходных мы играем в футбол.",
      alts: [["wir", "spielen", "Am", "Wochenende", "Fußball"], ["wir", "spielen", "Fußball", "Am", "Wochenende"], ["Fußball", "spielen", "wir", "Am", "Wochenende"]],
      explain: "«Am Wochenende» — одна позиция (1-е место), глагол spielen — 2-е, подлежащее wir — сразу за ним. Можно начать и с wir: Wir spielen am Wochenende Fußball." },
    { type: "choice", q: "Где стоит глагол в вопросе без вопросительного слова (да/нет)?", options: ["на 1-м месте", "на 2-м месте", "в конце"], a: 0,
      explain: "В вопросе да/нет глагол стоит первым: Kommst du heute? На 2-м месте он в утверждении и W-вопросе." },
    { type: "order", words: ["Warum", "lernst", "du", "Deutsch"], ru: "Почему ты учишь немецкий?",
      explain: "W-вопрос: Warum + глагол (lernst) + подлежащее (du) + дополнение (Deutsch)." }
  ]
});
