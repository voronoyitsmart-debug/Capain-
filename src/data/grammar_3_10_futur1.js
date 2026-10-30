DE.grammar.push({
  id: "futur1",
  title: "Будущее время (Futur I)",
  level: "B1",
  emoji: "🔮",
  summary: "Ich werde arbeiten / Ich arbeite morgen — будущее, обещания и предположения",
  content: `<p>В немецком о будущем можно говорить двумя способами: <b>Präsens + указание времени</b> и <b>Futur I</b>.</p>
<h3>1. Präsens для будущего — самый частый вариант</h3>
<p>Если из контекста ясно, что речь о будущем (morgen, nächste Woche, im Sommer…), немцы обычно используют просто настоящее время — как и мы в русском: «Завтра я <b>еду</b> в Берлин».</p>
<div class="ex"><b>Morgen fahre ich nach Berlin.</b> — Завтра я еду в Берлин.</div>
<div class="ex"><b>Nächstes Jahr machen wir einen Sprachkurs.</b> — В следующем году мы пойдём на языковые курсы.</div>
<h3>2. Futur I: werden + инфинитив</h3>
<p><span class="hl">werden</span> (спрягается, 2-е место) + <span class="hl">инфинитив</span> (в конце).</p>
<table>
<tr><th>Лицо</th><th>werden</th><th>Пример</th></tr>
<tr><td>ich</td><td>werde</td><td>ich werde arbeiten</td></tr>
<tr><td>du</td><td>wirst</td><td>du wirst arbeiten</td></tr>
<tr><td>er/sie/es</td><td>wird</td><td>er wird arbeiten</td></tr>
<tr><td>wir</td><td>werden</td><td>wir werden arbeiten</td></tr>
<tr><td>ihr</td><td>werdet</td><td>ihr werdet arbeiten</td></tr>
<tr><td>sie/Sie</td><td>werden</td><td>sie werden arbeiten</td></tr>
</table>
<p>В придаточном werden уходит в самый конец: <i>Ich glaube, dass es morgen regnen <b>wird</b>.</i> С модальным глаголом: <i>Du <b>wirst</b> das schaffen <b>können</b>.</i></p>
<h3>Когда нужен Futur I</h3>
<table>
<tr><th>Функция</th><th>Пример</th></tr>
<tr><td>Обещание, твёрдое намерение</td><td>Ich <b>werde</b> dich nie <b>vergessen</b>.</td></tr>
<tr><td>Прогноз (особенно без слова-маркера)</td><td>Es <b>wird</b> bald <b>regnen</b>.</td></tr>
<tr><td>Предположение о настоящем (+ wohl, sicher, vielleicht)</td><td>Er <b>wird</b> wohl krank <b>sein</b>. — Он, наверное, болен.</td></tr>
<tr><td>Строгое указание</td><td>Du <b>wirst</b> jetzt sofort ins Bett <b>gehen</b>!</td></tr>
</table>
<div class="ex"><b>Wo ist Anna? — Sie wird noch im Büro sein.</b> — Где Анна? — Она, наверное, ещё в офисе.</div>
<div class="ex"><b>Ich verspreche dir, ich werde pünktlich sein.</b> — Обещаю тебе, я буду вовремя.</div>
<div class="ex"><b>In zwanzig Jahren werden die Menschen anders leben.</b> — Через двадцать лет люди будут жить иначе.</div>
<div class="tip">💡 Русское «буду» почти как немецкое <b>werde</b>: «я <b>буду</b> работать» = «ich <b>werde</b> arbeiten». Разница: в немецком будущее время звучит как более <b>твёрдое</b> намерение или прогноз. Для простых планов на завтра хватит Präsens!</div>
<div class="warn">Не путай: <b>werden + инфинитив</b> = будущее (<i>Er wird lernen</i>), <b>werden + Partizip II</b> = пассив (<i>Er wird gelernt</i> — бессмыслица), <b>werden + прилагательное</b> = становиться (<i>Er wird müde</i>).</div>`,
  exercises: [
    { type: "choice", q: "Ich ___ dich morgen anrufen.", options: ["werde", "wird", "werdet"], a: 0,
      explain: "Futur I: werden для ich — werde, инфинитив anrufen в конце. «wird» — форма er/sie/es, «werdet» — ihr." },
    { type: "input", q: "Du ___ die Prüfung bestimmt bestehen. (werden)", a: ["wirst"],
      explain: "werden неправильный: du wirst (без -d-). Инфинитив bestehen стоит в конце." },
    { type: "order", words: ["Wir", "werden", "im", "Sommer", "nach", "Italien", "fahren"], ru: "Летом мы поедем в Италию.",
      alts: [["im", "Sommer", "werden", "Wir", "nach", "Italien", "fahren"]],
      explain: "werden на 2-м месте, инфинитив fahren в конце. На 1-е место можно вынести и im Sommer: «Im Sommer werden wir…»." },
    { type: "choice", q: "Es ist schon 10 Uhr. Peter ___ wohl noch schlafen.", options: ["wird", "werdet", "wurde"], a: 0,
      explain: "werden + wohl + инфинитив = предположение о настоящем («наверное, ещё спит»). «wurde» — Präteritum, с инфинитивом не сочетается." },
    { type: "input", q: "Ihr ___ das schon schaffen! (werden)", a: ["werdet"],
      explain: "werden для ihr — werdet; это ободряющее обещание «вы справитесь»." },
    { type: "choice", q: "Какое предложение — про будущее в Präsens?", options: ["Ich fahre jeden Tag Rad.", "Morgen fahre ich nach Hamburg.", "Ich bin nach Hamburg gefahren."], a: 1,
      explain: "Präsens + маркер времени (morgen) выражает будущее. «jeden Tag» — привычка в настоящем, «bin gefahren» — прошедшее." },
    { type: "order", words: ["Ich", "glaube,", "dass", "es", "morgen", "regnen", "wird"], ru: "Я думаю, что завтра будет дождь.",
      explain: "В придаточном с dass спрягаемый wird стоит в самом конце, после инфинитива regnen." },
    { type: "input", q: "Sie (она) ___ bestimmt bald kommen. (werden)", a: ["wird"],
      explain: "sie «она» — 3-е лицо ед. числа → wird. «werden» было бы для «они» или «Вы»." },
    { type: "choice", q: "Er wird morgen nach Hause ___.", options: ["gekommen", "kommen", "kommt"], a: 1,
      explain: "Futur I = werden + инфинитив (kommen). Partizip II gekommen с werden дал бы пассив, а спрягаемая форма kommt здесь лишняя." },
    { type: "choice", q: "«Er wird wohl im Büro sein.» Что это значит?", options: ["Он будет в офисе.", "Он, наверное, в офисе.", "Он был в офисе."], a: 1,
      explain: "Слово wohl превращает Futur I в предположение о настоящем: «он, наверное, (сейчас) в офисе»." },
    { type: "input", q: "Wann ___ ihr umziehen? (werden)", a: ["werdet"],
      explain: "ihr werdet; в вопросе с вопросительным словом спрягаемый глагол стоит сразу после wann, инфинитив umziehen — в конце." },
    { type: "order", words: ["Ich", "werde", "dich", "nie", "vergessen"], ru: "Я никогда тебя не забуду.",
      alts: [["nie", "werde", "Ich", "dich", "vergessen"], ["dich", "werde", "Ich", "nie", "vergessen"]],
      explain: "Обещание — Futur I: werde на 2-м месте, vergessen в конце. Для усиления на 1-е место можно поставить nie или dich." },
    { type: "choice", q: "Как естественнее сказать «Завтра я работаю»?", options: ["Morgen arbeite ich.", "Morgen werde ich gearbeitet.", "Morgen wurde ich arbeiten."], a: 0,
      explain: "Для простых планов с маркером времени хватает Präsens. «werde gearbeitet» — неверный пассив, «wurde arbeiten» — бессмыслица." }
  ]
});
