DE.grammar.push({
  id: "separable_verbs",
  title: "Отделяемые и неотделяемые приставки",
  level: "A1",
  emoji: "✂️",
  summary: "Ich stehe um 7 Uhr auf — приставка «улетает» в конец",
  content: `<p>Многие немецкие глаголы имеют приставку, как русские «вс-тавать», «по-купать». Но некоторые немецкие приставки умеют <b>отделяться</b> и уходить в конец предложения.</p>

<h3>Отделяемые приставки</h3>
<p>Самые частые: <b>an, auf, aus, ein, mit, zu, vor, ab, weg, zurück, fern, los, nach</b>. Они ударные: <b>AUF</b>stehen, <b>EIN</b>kaufen.</p>
<table>
<tr><th>Инфинитив</th><th>Перевод</th><th>Präsens (приставка в конце)</th></tr>
<tr><td>aufstehen</td><td>вставать</td><td>Ich <b>stehe</b> um 7 Uhr <b>auf</b>.</td></tr>
<tr><td>einkaufen</td><td>делать покупки</td><td>Wir <b>kaufen</b> heute <b>ein</b>.</td></tr>
<tr><td>anrufen</td><td>звонить</td><td>Ich <b>rufe</b> dich morgen <b>an</b>.</td></tr>
<tr><td>fernsehen</td><td>смотреть телевизор</td><td>Er <b>sieht</b> jeden Abend <b>fern</b>.</td></tr>
<tr><td>mitkommen</td><td>идти вместе</td><td><b>Kommst</b> du <b>mit</b>?</td></tr>
<tr><td>anfangen</td><td>начинаться</td><td>Der Film <b>fängt</b> um acht <b>an</b>.</td></tr>
<tr><td>einladen</td><td>приглашать</td><td>Sie <b>lädt</b> uns <b>ein</b>.</td></tr>
<tr><td>aufräumen</td><td>убирать</td><td>Wann <b>räumst</b> du <b>auf</b>?</td></tr>
</table>

<div class="tip">Работает та же <b>рамка</b>, что и с модальными глаголами: глагол — на 2-м месте, приставка — в самом конце. А если в предложении есть модальный глагол, приставка остаётся <b>слитно</b> с инфинитивом: <span class="hl">Ich muss früh aufstehen.</span></div>

<p>Заметили? Изменения корня (fernsehen → er s<b>ie</b>ht, anfangen → er f<b>ä</b>ngt, einladen → sie l<b>ä</b>dt) сохраняются, как у обычных sehen, fangen, laden.</p>

<h3>Неотделяемые приставки</h3>
<p><b>be-, ge-, er-, ver-, zer-, ent-, emp-, miss-</b> — никогда не отделяются и не бывают ударными: be<b>ZAH</b>len, ver<b>STE</b>hen.</p>
<div class="ex"><b>Ich verstehe das nicht.</b> — Я этого не понимаю.</div>
<div class="ex"><b>Ich bekomme viele E-Mails.</b> — Я получаю много писем. (bekommen — «получать», не «становиться»!)</div>
<div class="ex"><b>Wir bezahlen zusammen.</b> — Мы платим вместе.</div>

<div class="warn">Как отличить? Отделяемая приставка — это отдельное «настоящее» слово (auf, aus, mit, an — предлоги и наречия). Неотделяемая сама по себе ничего не значит: «be», «ver», «er» отдельно не встречаются.</div>`,
  exercises: [
    { type: "order", words: ["Ich", "stehe", "um", "sieben", "Uhr", "auf"], ru: "Я встаю в семь часов.",
      alts: [["um", "sieben", "Uhr", "stehe", "Ich", "auf"]],
      explain: "aufstehen: спрягаемая часть stehe — на 2-м месте, приставка auf — в самом конце. Можно начать со времени: Um sieben Uhr stehe ich auf." },
    { type: "choice", q: "Как сказать «Мы сегодня делаем покупки»?", options: ["Wir einkaufen heute.", "Wir kaufen heute ein.", "Wir kaufen ein heute."], a: 1,
      explain: "einkaufen: kaufen на 2-м месте, приставка ein — в самом конце, после heute. «Wir einkaufen» — ошибка: в Präsens приставка отделяется." },
    { type: "input", q: "Der Film fängt um acht Uhr ___. (anfangen)", a: ["an"],
      explain: "anfangen: спрягаемая часть fängt на 2-м месте, приставка an — в конце." },
    { type: "input", q: "Ich rufe dich morgen ___. (anrufen)", a: ["an"],
      explain: "anrufen: rufe на 2-м месте, приставка an — в конце: Ich rufe dich morgen an." },
    { type: "choice", q: "Какой глагол НЕотделяемый?", options: ["aufmachen", "verstehen", "mitkommen"], a: 1,
      explain: "ver- — неотделяемая приставка: ich verstehe. auf- и mit- отделяются: ich mache auf, ich komme mit." },
    { type: "choice", q: "Ich ___ das nicht. (verstehen)", options: ["stehe ver", "verstehe", "verstehen"], a: 1,
      explain: "ver- не отделяется: Ich verstehe das nicht. «stehe ver» — ошибка, так ведут себя только отделяемые приставки." },
    { type: "order", words: ["Kommst", "du", "mit"], ru: "Ты пойдёшь с нами?",
      explain: "mitkommen: в вопросе да/нет Kommst — первым, приставка mit — в конце." },
    { type: "input", q: "Er ___ jeden Abend fern. (fernsehen)", a: ["sieht"],
      explain: "fernsehen: er sieht … fern. Корень меняется e → ie, как у sehen, а fern уходит в конец." },
    { type: "choice", q: "Ich muss morgen früh ___.", options: ["aufstehen", "stehe auf", "auf stehen"], a: 0,
      explain: "С модальным глаголом (muss) инфинитив стоит в конце и пишется слитно: aufstehen." },
    { type: "input", q: "Wir ___ dich zur Party ein. (einladen)", a: ["laden"],
      explain: "einladen: wir laden … ein. Приставка ein уже стоит в конце, в пропуск — только laden." },
    { type: "choice", q: "Где ударение в слове «aufstehen»?", options: ["AUF-stehen", "auf-STE-hen"], a: 0,
      explain: "Отделяемые приставки всегда ударные: AUFstehen, ANrufen." },
    { type: "choice", q: "Где ударение в слове «bezahlen»?", options: ["BE-zahlen", "be-ZAH-len"], a: 1,
      explain: "Неотделяемые приставки (be-, ver-, er-…) безударные: be-ZAH-len." },
    { type: "order", words: ["Wann", "räumst", "du", "dein", "Zimmer", "auf"], ru: "Когда ты уберёшь свою комнату?",
      explain: "aufräumen: W-слово (Wann), глагол räumst, подлежащее du, дополнение dein Zimmer, приставка auf — в самом конце." },
    { type: "input", q: "Ich ___ morgen ein Paket. (bekommen)", a: ["bekomme"],
      explain: "be- не отделяется: ich bekomme. (bekommen = получать, а не «становиться»!)" }
  ]
});
