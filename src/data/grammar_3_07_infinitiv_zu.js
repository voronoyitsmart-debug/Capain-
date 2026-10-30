DE.grammar.push({
  id: "infinitiv_zu",
  title: "Инфинитив с zu, um…zu, ohne…zu, statt…zu",
  level: "B1",
  emoji: "🎯",
  summary: "Ich habe Lust, zu tanzen; um… zu — чтобы; damit vs um…zu",
  content: `<p>Во многих конструкциях немецкий инфинитив требует частицы <span class="hl">zu</span>. Инфинитивная группа стоит <b>в конце</b> и обычно отделяется запятой.</p>
<div class="ex"><b>Ich habe keine Lust, heute zu kochen.</b> — У меня нет желания сегодня готовить.</div>
<h3>Когда нужен zu</h3>
<ul>
<li>после многих глаголов: <i>versuchen, vergessen, beginnen/anfangen, aufhören, hoffen, vorhaben, planen, sich freuen, erlauben, bitten</i></li>
<li>после выражений с существительными: <i>Lust haben, Zeit haben, keine Angst haben, die Möglichkeit haben</i></li>
<li>после <i>es ist + прилагательное</i>: <i>Es ist wichtig / schwer / schön, …zu…</i></li>
</ul>
<p><b>Без zu</b> — после модальных глаголов, а также после <i>werden, lassen, gehen, sehen, hören</i>: <i>Ich <b>kann</b> schwimmen. Wir <b>gehen</b> einkaufen.</i></p>
<h3>Где ставится zu</h3>
<table>
<tr><th>Глагол</th><th>с zu</th></tr>
<tr><td>lernen</td><td><b>zu</b> lernen</td></tr>
<tr><td>anrufen (отделяемый)</td><td>an<b>zu</b>rufen</td></tr>
<tr><td>einkaufen (отделяемый)</td><td>ein<b>zu</b>kaufen</td></tr>
<tr><td>verstehen (неотделяемый)</td><td><b>zu</b> verstehen</td></tr>
</table>
<p>У отделяемых глаголов <b>zu</b> вставляется <b>между приставкой и корнем</b> и пишется слитно.</p>
<h3>um…zu, ohne…zu, statt…zu</h3>
<table>
<tr><th>Конструкция</th><th>Значение</th><th>Пример</th></tr>
<tr><td><b>um … zu</b></td><td>чтобы (цель)</td><td>Ich lerne Deutsch, <b>um</b> in Wien <b>zu</b> arbeiten.</td></tr>
<tr><td><b>ohne … zu</b></td><td>не делая чего-то</td><td>Er ging weg, <b>ohne</b> Tschüss <b>zu</b> sagen.</td></tr>
<tr><td><b>(an)statt … zu</b></td><td>вместо того чтобы</td><td><b>Statt</b> zu lernen, sieht sie fern.</td></tr>
</table>
<h3>damit или um…zu?</h3>
<p>Оба означают «чтобы». Правило — по подлежащим:</p>
<ul>
<li><b>Одно и то же</b> лицо в обеих частях → <b>um…zu</b>: <i>Ich spare, um ein Auto zu kaufen.</i> (я коплю — я куплю)</li>
<li><b>Разные</b> лица → <b>damit</b> + придаточное с глаголом в конце: <i>Ich spare, damit meine Tochter studieren kann.</i> (я коплю — дочь учится)</li>
</ul>
<div class="ex"><b>Er spricht langsam, damit ihn alle verstehen.</b> — Он говорит медленно, чтобы все его понимали.</div>
<div class="ex"><b>Vergiss nicht, die Tür abzuschließen!</b> — Не забудь запереть дверь!</div>
<div class="tip">💡 Простой тест: можно ли по-русски сказать «чтобы <b>я</b>…» вместо «чтобы <b>он</b>…»? Если в обеих частях одно лицо — смело бери <b>um…zu</b>. Разные — <b>damit</b>.</div>
<div class="warn">После модальных zu НЕ нужен: <i>Ich muss zu arbeiten</i> ✗ → <b>Ich muss arbeiten</b> ✓.</div>`,
  exercises: [
    { type: "choice", q: "Ich habe keine Zeit, ins Kino ___.", options: ["gehen", "zu gehen", "zum gehen"], a: 1,
      explain: "После выражения «Zeit haben» нужен инфинитив с zu: zu gehen. «zum gehen» — неправильно (zum Gehen — это уже существительное)." },
    { type: "input", q: "Vergiss nicht, mich ___! (anrufen)", a: ["anzurufen"],
      explain: "vergessen требует zu; у отделяемого глагола zu встаёт между приставкой и корнем и пишется слитно: an-zu-rufen." },
    { type: "choice", q: "Wir können heute nicht ___.", options: ["zu kommen", "kommen", "um zu kommen"], a: 1,
      explain: "После модальных глаголов (können, müssen…) инфинитив стоит без zu." },
    { type: "order", words: ["Ich", "lerne", "Deutsch,", "um", "in", "Berlin", "zu", "studieren"], ru: "Я учу немецкий, чтобы учиться в Берлине.",
      explain: "Цель, и в обеих частях одно лицо (я учу — я буду учиться) → um … zu, инфинитив studieren в самом конце." },
    { type: "choice", q: "Ich gebe dir das Geld, ___ du ein Ticket kaufen kannst.", options: ["um", "damit", "statt"], a: 1,
      explain: "Подлежащие разные (ich даю — du покупаешь) → damit + придаточное. um … zu возможно только при одном и том же лице." },
    { type: "input", q: "Er ging, ohne ein Wort ___ ___. (sagen)", a: ["zu sagen"],
      explain: "«не сказав ни слова» → ohne … zu + инфинитив в конце: ohne ein Wort zu sagen." },
    { type: "choice", q: "___ zu arbeiten, spielt er Computerspiele.", options: ["Damit", "Statt", "Um"], a: 1,
      explain: "«Вместо того чтобы работать» → statt … zu. damit не сочетается с zu, а «Um zu arbeiten» означало бы «чтобы работать» — бессмыслица." },
    { type: "input", q: "Es ist wichtig, regelmäßig Sport ___ ___. (machen)", a: ["zu machen"],
      explain: "После «es ist + прилагательное» (wichtig, schwer…) — zu + инфинитив в конце." },
    { type: "order", words: ["Sie", "hat", "angefangen,", "Gitarre", "zu", "spielen"], ru: "Она начала играть на гитаре.",
      explain: "anfangen требует zu + инфинитив; инфинитивная группа стоит после запятой, spielen — в самом конце." },
    { type: "choice", q: "Ich spare Geld, ___ ein Auto zu kaufen.", options: ["damit", "um", "ohne"], a: 1,
      explain: "Цель и одно и то же лицо (я коплю — я куплю) → um … zu. После damit нужно было бы придаточное с подлежащим: damit ich … kaufe." },
    { type: "input", q: "Hast du Lust, heute Abend ___? (ausgehen)", a: ["auszugehen"],
      explain: "Lust haben требует zu; ausgehen — отделяемый глагол → aus-zu-gehen, слитно." },
    { type: "order", words: ["Er", "spricht", "langsam,", "damit", "wir", "alles", "verstehen"], ru: "Он говорит медленно, чтобы мы всё понимали.",
      explain: "Разные лица (er говорит — wir понимаем) → damit; в придаточном глагол verstehen стоит в конце." },
    { type: "choice", q: "Sie hofft, die Prüfung ___.", options: ["zu bestehen", "bezustehen", "bestehen zu"], a: 0,
      explain: "bestehen — глагол с неотделяемой приставкой be-, поэтому zu пишется отдельно перед ним: zu bestehen." }
  ]
});
