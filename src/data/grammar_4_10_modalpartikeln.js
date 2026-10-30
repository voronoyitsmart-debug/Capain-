DE.grammar.push({
  id: "modalpartikeln",
  title: "Модальные частицы (Modalpartikeln)",
  level: "B2",
  emoji: "🎭",
  summary: "doch, ja, mal, halt, eben, eigentlich, wohl, schon — эмоции в одном слове",
  content: `<p>Модальные частицы — маленькие слова, которые не меняют смысл предложения, но добавляют <b>эмоцию и отношение</b>: удивление, раздражение, уговоры, смягчение. Без них немецкая речь звучит сухо, как у робота. В русском похожую роль играют «же», «ведь», «-ка», «ну», «вообще-то».</p>
<h3>Главные частицы</h3>
<table>
<tr><th>Частица</th><th>Функция</th><th>Пример</th><th>По-русски</th></tr>
<tr><td><b>doch</b></td><td>уговор, упрёк, «ты же знаешь»</td><td>Komm <b>doch</b> mit!<br>Das weißt du <b>doch</b>!</td><td>Да пойдём же!<br>Ты же это знаешь!</td></tr>
<tr><td><b>ja</b></td><td>известный факт; удивление</td><td>Du weißt <b>ja</b>, wie er ist.<br>Das ist <b>ja</b> toll!</td><td>Ты ведь знаешь, какой он.<br>Вот это здорово!</td></tr>
<tr><td><b>mal</b></td><td>смягчает просьбу</td><td>Komm <b>mal</b> her!</td><td>Подойди-ка сюда!</td></tr>
<tr><td><b>halt / eben</b></td><td>смирение: «так уж есть»</td><td>Das ist <b>halt</b> so.<br>Dann nimm <b>eben</b> den Bus.</td><td>Ну что поделаешь.<br>Ну так поезжай на автобусе.</td></tr>
<tr><td><b>eigentlich</b></td><td>в вопросе: «кстати, вообще»</td><td>Wie heißt du <b>eigentlich</b>?</td><td>А как тебя вообще зовут?</td></tr>
<tr><td><b>wohl</b></td><td>предположение</td><td>Er ist <b>wohl</b> krank.</td><td>Он, наверное, болен.</td></tr>
<tr><td><b>schon</b></td><td>успокоение; «в принципе да, но…»</td><td>Das klappt <b>schon</b>!<br>Das ist <b>schon</b> gut, aber …</td><td>Всё получится!<br>Это, конечно, хорошо, но…</td></tr>
<tr><td><b>denn</b></td><td>интерес в вопросе</td><td>Was ist <b>denn</b> los?</td><td>Что же случилось?</td></tr>
</table>
<h3>Где они стоят</h3>
<ul>
<li>Только <b>в середине предложения</b> (Mittelfeld) — никогда на 1-м месте.</li>
<li>Обычно после спрягаемого глагола и местоимений: <i>Das hast <b>du</b> <b>ja</b> gut gemacht.</i></li>
<li>Они безударные. Под ударением многие из них меняют значение: <i>Ich komme DOCH!</i> = «И всё-таки я приду!»</li>
<li>Их можно сочетать: <b>doch mal</b>, <b>ja wohl</b>, <b>halt mal</b>. Порядок фиксирован: <i>Komm <b>doch mal</b> vorbei!</i> (не <i>mal doch</i>).</li>
</ul>
<div class="ex"><b>Kannst du mir mal helfen?</b> — Можешь мне помочь? (мягко, по-дружески)</div>
<div class="ex"><b>Du hast ja völlig recht.</b> — Ты ведь совершенно прав.</div>
<div class="ex"><b>Keine Sorge, das wird schon!</b> — Не волнуйся, всё наладится!</div>
<div class="ex"><b>Komm doch mal vorbei!</b> — Заходи как-нибудь!</div>
<div class="warn">Частицы нельзя переводить «в лоб». <i>Das ist ja toll</i> — это не «Это да здорово», а «Вот это здорово!». Переводите <b>интонацию</b>, а не слово.</div>
<div class="tip">Хотите звучать дружелюбнее — добавляйте <b>mal</b> в просьбы и <b>doch</b> в предложения: <i>Gib mir <b>mal</b> das Salz.</i> / <i>Setz dich <b>doch</b>!</i> Голый императив (<i>Gib mir das Salz!</i>) звучит резко, почти как приказ.</div>`,
  exercises: [
    { type: "choice", q: "Was ist ___ los? Du siehst so traurig aus.", options: ["denn", "mal", "halt"], a: 0,
      explain: "denn в вопросе выражает участие и интерес («что же случилось?»). mal и halt в вопросах с вопросительным словом так не употребляются." },
    { type: "choice", q: "Keine Sorge, das klappt ___! (успокоение)", options: ["schon", "mal", "eigentlich"], a: 0,
      explain: "schon в утверждении успокаивает: «всё получится, не волнуйся». eigentlich = «вообще-то», mal — для просьб." },
    { type: "choice", q: "Kannst du mir ___ helfen? (смягчение просьбы)", options: ["mal", "ja", "halt"], a: 0,
      explain: "mal смягчает просьбу («помоги-ка»). ja употребляется в утверждениях, а не в вопросах; halt выражает смирение." },
    { type: "choice", q: "Oh, das ist ___ eine tolle Überraschung! (удивление)", options: ["ja", "mal", "denn"], a: 0,
      explain: "ja в восклицании выражает удивление и радость: «вот это сюрприз!». denn — только в вопросах, mal — в просьбах." },
    { type: "input", q: "Komm ___ mit! Es wird bestimmt lustig. (уговаривание: «да пойдём же!»)", a: ["doch", "doch mal", "schon"],
      explain: "doch в императиве — дружеское уговаривание: «да пойдём же!». Близкий по смыслу вариант — нетерпеливое «Komm schon mit!»." },
    { type: "choice", q: "Er ist nicht gekommen. Er ist ___ krank. (предположение)", options: ["wohl", "mal", "eben"], a: 0,
      explain: "wohl = «наверное, вероятно» — предположение. eben означало бы «ну что поделаешь, он болен» (констатация, а не догадка)." },
    { type: "choice", q: "Wie heißt du ___? Ich habe deinen Namen vergessen.", options: ["eigentlich", "mal", "halt"], a: 0,
      explain: "eigentlich в вопросе = «а как вообще…?», смягчает и делает вопрос естественным. mal и halt в таком вопросе невозможны." },
    { type: "choice", q: "Ich habe keine Lust, aber das ist ___ so — man muss arbeiten.", options: ["halt", "mal", "denn"], a: 0,
      explain: "halt выражает смирение: «ну так уж есть». denn — частица вопросов, mal — просьб." },
    { type: "order", words: ["Das", "weißt", "du", "doch"], ru: "Ты же это знаешь.",
      alts: [["du", "weißt", "Das", "doch"]],
      explain: "doch = «же»: напоминание об известном. Частица стоит в середине предложения, после глагола и местоимений; на 1-м месте — das или du." },
    { type: "input", q: "Mach ___ das Fenster auf, bitte. (смягчение просьбы)", a: ["mal", "doch mal", "doch"],
      explain: "mal делает просьбу мягкой и дружеской («открой-ка»). Голый императив без частицы звучит резко." },
    { type: "order", words: ["Du", "hast", "ja", "völlig", "recht"], ru: "Ты ведь совершенно прав.",
      explain: "ja («ведь») стоит в середине предложения — после глагола hast и перед völlig recht." },
    { type: "choice", q: "Модальная частица НЕ может стоять…", options: ["на первом месте в предложении", "после спрягаемого глагола", "в середине предложения"], a: 0,
      explain: "Модальные частицы стоят только в середине предложения (Mittelfeld), обычно после глагола, и никогда не занимают 1-е место." },
    { type: "input", q: "Die Bahn fährt nicht? Dann nimm ___ den Bus! («ну раз так, что поделаешь»)", a: ["halt", "eben", "doch"],
      explain: "halt / eben выражают смирение: «ну так езжай на автобусе». doch тоже возможно — как дружеский совет." },
    { type: "order", words: ["Komm", "doch", "mal", "vorbei"], ru: "Заходи как-нибудь!",
      explain: "При сочетании частиц порядок фиксирован: doch всегда перед mal. Приставка vorbei — в конце." }
  ]
});
