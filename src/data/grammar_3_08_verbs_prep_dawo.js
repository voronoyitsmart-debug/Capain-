DE.grammar.push({
  id: "verbs_prep_dawo",
  title: "Глаголы с предлогами и da-/wo-слова",
  level: "B1",
  emoji: "🧲",
  summary: "warten auf, sich freuen über — darauf, worauf, auf wen?",
  content: `<p>Многие немецкие глаголы «держат» при себе определённый предлог, и <b>падеж после него фиксирован</b>. Часто предлог не совпадает с русским: «ждать <b>кого-то</b>» — <i>warten <b>auf</b> + Akk</i>. Такие глаголы учат <b>вместе с предлогом и падежом</b>.</p>
<h3>Самые важные глаголы</h3>
<table>
<tr><th>Глагол</th><th>Предлог + падеж</th><th>Перевод</th></tr>
<tr><td>warten</td><td>auf + Akk</td><td>ждать кого-то/что-то</td></tr>
<tr><td>sich freuen</td><td>auf + Akk / über + Akk</td><td>ждать с радостью (будущее) / радоваться (уже есть)</td></tr>
<tr><td>denken</td><td>an + Akk</td><td>думать о</td></tr>
<tr><td>sich interessieren</td><td>für + Akk</td><td>интересоваться</td></tr>
<tr><td>sich ärgern</td><td>über + Akk</td><td>злиться на</td></tr>
<tr><td>sprechen</td><td>über + Akk / mit + Dat</td><td>говорить о / с кем-то</td></tr>
<tr><td>Angst haben</td><td>vor + Dat</td><td>бояться</td></tr>
<tr><td>teilnehmen</td><td>an + Dat</td><td>участвовать в</td></tr>
<tr><td>sich erinnern</td><td>an + Akk</td><td>вспоминать</td></tr>
<tr><td>träumen</td><td>von + Dat</td><td>мечтать о</td></tr>
<tr><td>fragen</td><td>nach + Dat</td><td>спрашивать о</td></tr>
<tr><td>sich kümmern</td><td>um + Akk</td><td>заботиться о</td></tr>
</table>
<h3>da- и wo-слова</h3>
<p>Если речь о <b>предмете или идее</b>, местоимение с предлогом заменяется одним словом:</p>
<ul>
<li><b>da + предлог</b> = «об этом, на это» — в утверждениях: <i>Ich warte darauf.</i></li>
<li><b>wo + предлог</b> = «о чём, на что» — в вопросах: <i>Worauf wartest du?</i></li>
</ul>
<p>Если предлог начинается с гласной, вставляется <b>-r-</b>: da<b>r</b>auf, da<b>r</b>über, wo<b>r</b>an, wo<b>r</b>um. Но: damit, dafür, davon, wovor, wofür.</p>
<table>
<tr><th></th><th>Предмет</th><th>Человек</th></tr>
<tr><td>Вопрос</td><td><b>Worauf</b> wartest du? — Auf den Bus.</td><td><b>Auf wen</b> wartest du? — Auf meinen Bruder.</td></tr>
<tr><td>Ответ</td><td>Ich warte <b>darauf</b>.</td><td>Ich warte <b>auf ihn</b>.</td></tr>
<tr><td>Вопрос</td><td><b>Wovon</b> träumst du?</td><td><b>Von wem</b> träumst du?</td></tr>
<tr><td>Ответ</td><td>Ich träume <b>davon</b>.</td><td>Ich träume <b>von ihr</b>.</td></tr>
</table>
<div class="ex"><b>Ich freue mich schon auf den Urlaub.</b> — Я уже радуюсь предстоящему отпуску.</div>
<div class="ex"><b>Woran denkst du? — An die Prüfung. Ich denke ständig daran.</b> — О чём ты думаешь? — Об экзамене. Я постоянно о нём думаю.</div>
<div class="ex"><b>Ich freue mich darauf, dich zu sehen.</b> — Я с нетерпением жду встречи с тобой.</div>
<p>Da-слово часто «анонсирует» придаточное или инфинитив: <i>Ich warte <b>darauf</b>, dass du anrufst.</i></p>
<div class="tip">💡 Правило «живое — неживое»: <b>человек</b> → предлог + местоимение (<i>auf wen? auf ihn</i>), <b>вещь/идея</b> → da-/wo-слово (<i>worauf? darauf</i>). И помни: <b>auf</b> — то, что будет (жду с радостью), <b>über</b> — то, что уже есть: <i>Ich freue mich <b>auf</b> das Geschenk</i> (ещё не получил) / <i><b>über</b> das Geschenk</i> (уже держу в руках).</div>`,
  exercises: [
    { type: "choice", q: "Ich warte ___ den Bus.", options: ["für", "auf", "an"], a: 1,
      explain: "warten всегда с auf + Akkusativ: auf den Bus. «für» — калька с английского (wait for), по-немецки это ошибка." },
    { type: "input", q: "Er interessiert sich ___ Fußball.", a: ["für"],
      explain: "sich interessieren für + Akkusativ — «интересоваться чем-то». В русском предлога нет, поэтому глагол надо учить вместе с für." },
    { type: "choice", q: "___ denkst du? — An meinen Urlaub.", options: ["Woran", "Wovon", "Daran"], a: 0,
      explain: "denken an → вопрос о предмете: wo + r + an = woran. «Wovon» — от другого предлога (von), «Daran» — не вопрос, а ответ («об этом»)." },
    { type: "input", q: "Ich freue mich ___ das Wochenende. (оно ещё впереди)", a: ["auf"],
      explain: "Радоваться тому, что ещё будет, — sich freuen auf. sich freuen über — о том, что уже случилось." },
    { type: "choice", q: "___ wartest du? — Auf meine Freundin.", options: ["Worauf", "Auf wen", "Auf was"], a: 1,
      explain: "Спрашиваем о человеке → предлог + wen: Auf wen? Worauf и разговорное «auf was» спрашивают о предметах." },
    { type: "order", words: ["Hast", "du", "Angst", "vor", "dem", "Hund?"], ru: "Ты боишься собаки?",
      explain: "Angst haben vor + Dativ → vor dem Hund. В вопросе без вопросительного слова глагол стоит на 1-м месте." },
    { type: "input", q: "Träumst du von einem Haus? — Ja, ich träume ___.", a: ["davon"],
      explain: "träumen von; о предмете (Haus) вместо «von ihm» говорят da-слово: davon." },
    { type: "choice", q: "Sie ärgert sich ___ das schlechte Wetter.", options: ["über", "auf", "vor"], a: 0,
      explain: "sich ärgern über + Akkusativ — «злиться на что-то». Русское «на» подсказывает auf, но это ошибка." },
    { type: "input", q: "___ sprecht ihr? — Über Politik.", a: ["Worüber"],
      explain: "sprechen über; вопрос о предмете → wo + über. Предлог начинается с гласной, поэтому вставляется -r-: worüber." },
    { type: "choice", q: "Denkst du oft an deine Oma? — Ja, ich denke oft ___.", options: ["daran", "an sie", "woran"], a: 1,
      explain: "Речь о человеке → предлог + личное местоимение: an sie. da-слово (daran) употребляют только для вещей и идей." },
    { type: "order", words: ["Ich", "erinnere", "mich", "gern", "daran"], ru: "Я с удовольствием вспоминаю об этом.",
      alts: [["daran", "erinnere", "Ich", "mich", "gern"], ["gern", "erinnere", "Ich", "mich", "daran"]],
      explain: "sich erinnern an + вещь → daran. Глагол erinnere на 2-м месте; на 1-м может стоять ich, daran или gern (тогда mich идёт сразу после ich)." },
    { type: "input", q: "Wir nehmen ___ dem Kurs teil.", a: ["an"],
      explain: "teilnehmen an + Dativ (an dem Kurs). Приставка teil уходит в конец, предлог an остаётся с дополнением." },
    { type: "choice", q: "Wer kümmert sich ___ die Kinder?", options: ["für", "um", "über"], a: 1,
      explain: "sich kümmern um + Akkusativ — «заботиться о ком-то». «für» и «über» с этим глаголом не употребляются." },
    { type: "order", words: ["Ich", "warte", "darauf,", "dass", "du", "anrufst"], ru: "Я жду, когда ты позвонишь.",
      explain: "warten auf → darauf «анонсирует» придаточное с dass, в котором глагол anrufst стоит в конце." }
  ]
});
