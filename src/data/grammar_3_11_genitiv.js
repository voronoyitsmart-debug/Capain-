DE.grammar.push({
  id: "genitiv",
  title: "Родительный падеж (Genitiv)",
  level: "B1",
  emoji: "🔑",
  summary: "das Auto des Vaters, wegen des Wetters — чей? и предлоги с Genitiv",
  content: `<p><b>Genitiv</b> отвечает на вопрос <b>wessen?</b> — «чей?». Он показывает принадлежность, как русский родительный падеж: «машина <b>отца</b>» — <i>das Auto <b>des Vaters</b></i>. Genitiv-слово обычно стоит <b>после</b> существительного, как в русском.</p>
<h3>Формы артикля</h3>
<table>
<tr><th></th><th>m</th><th>f</th><th>n</th><th>Pl</th></tr>
<tr><td>определённый</td><td><b>des</b> Mann<b>es</b></td><td><b>der</b> Frau</td><td><b>des</b> Kind<b>es</b></td><td><b>der</b> Kinder</td></tr>
<tr><td>неопределённый</td><td><b>eines</b> Mann<b>es</b></td><td><b>einer</b> Frau</td><td><b>eines</b> Kind<b>es</b></td><td>— (von + Dat)</td></tr>
<tr><td>притяжательный</td><td><b>meines</b> Vater<b>s</b></td><td><b>meiner</b> Mutter</td><td><b>meines</b> Auto<b>s</b></td><td><b>meiner</b> Eltern</td></tr>
</table>
<p>Мужской и средний род получают на конце <b>-s</b> или <b>-es</b>:</p>
<ul>
<li><b>-es</b> — у односложных и на -s, -ß, -x, -z: des Mann<b>es</b>, des Hauses, des Fußes</li>
<li><b>-s</b> — у многосложных: des Vater<b>s</b>, des Computer<b>s</b>, des Wetter<b>s</b></li>
<li>«слабые» существительные получают <b>-en/-n</b>: des Student<b>en</b>, des Kolleg<b>en</b>, des Herr<b>n</b></li>
</ul>
<p>Женский род и множественное число окончания <b>не</b> получают.</p>
<h3>Имена собственные</h3>
<p>К имени просто добавляется <b>-s</b> (без апострофа!), и оно стоит <b>перед</b> существительным: <i><b>Annas</b> Bruder, <b>Peters</b> Auto, <b>Deutschlands</b> Hauptstadt</i>. Если имя кончается на -s/-z — апостроф: <i>Hans' Wohnung</i>.</p>
<h3>Предлоги с Genitiv</h3>
<table>
<tr><th>Предлог</th><th>Значение</th><th>Пример</th></tr>
<tr><td><b>wegen</b></td><td>из-за</td><td>Wegen des Regens bleiben wir zu Hause.</td></tr>
<tr><td><b>trotz</b></td><td>несмотря на</td><td>Trotz der Kälte gehen wir spazieren.</td></tr>
<tr><td><b>während</b></td><td>во время</td><td>Während des Urlaubs habe ich viel gelesen.</td></tr>
<tr><td><b>(an)statt</b></td><td>вместо</td><td>Statt eines Autos kaufe ich ein Fahrrad.</td></tr>
<tr><td><b>innerhalb / außerhalb</b></td><td>в течение, внутри / вне</td><td>innerhalb einer Woche</td></tr>
</table>
<div class="ex"><b>Das ist das Haus meiner Großeltern.</b> — Это дом моих бабушки и дедушки.</div>
<div class="ex"><b>Wegen der Arbeit habe ich keine Zeit.</b> — Из-за работы у меня нет времени.</div>
<div class="ex"><b>Trotz des schlechten Wetters war das Fest schön.</b> — Несмотря на плохую погоду, праздник был прекрасным.</div>
<div class="tip">💡 В разговорной речи Genitiv часто заменяют на <b>von + Dativ</b>: <i>das Auto <b>von meinem</b> Vater</i>, а после wegen/trotz иногда говорят Dativ: <i>wegen dem Wetter</i>. Понимать это нужно, но на экзамене и в письме используй Genitiv: <i>wegen <b>des</b> Wetters</i>. Помни сочетание «<b>des</b> … <b>-s</b>» — двойной сигнал для m/n.</div>
<div class="warn">Прилагательное в Genitiv после артикля всегда получает <b>-en</b>: <i>wegen des schlecht<b>en</b> Wetters, trotz der hoh<b>en</b> Preise</i>.</div>`,
  exercises: [
    { type: "choice", q: "Das ist das Auto ___ Vaters.", options: ["der", "des", "dem"], a: 1,
      explain: "«Машина (чья?) отца» → Genitiv мужского рода: des Vaters (артикль des + -s у существительного). «dem» — Dativ." },
    { type: "input", q: "Die Farbe ___ Hauses gefällt mir. (das)", a: ["des"],
      explain: "das Haus в Genitiv → des Hauses; у односложных существительных среднего рода окончание -es." },
    { type: "choice", q: "Die Tasche ___ Frau ist schwer.", options: ["des", "der", "die"], a: 1,
      explain: "Genitiv женского рода — der Frau (само существительное не меняется). «des» — только для m/n." },
    { type: "input", q: "___ des Regens bleiben wir zu Hause. (из-за)", a: ["Wegen", "Aufgrund", "Auf Grund"],
      explain: "«Из-за» → wegen + Genitiv (в официальном стиле также aufgrund). des Regens — Genitiv от der Regen." },
    { type: "choice", q: "Trotz ___ Kälte gehen wir schwimmen.", options: ["der", "die", "den"], a: 0,
      explain: "trotz требует Genitiv; die Kälte (f) → der Kälte. «die» — Nom/Akk, «den» — Akk m." },
    { type: "order", words: ["Das", "ist", "das", "Zimmer", "meines", "Bruders"], ru: "Это комната моего брата.",
      explain: "Определение в Genitiv стоит после существительного, как в русском: das Zimmer meines Bruders (meines + -s)." },
    { type: "input", q: "Während ___ Films hat er geschlafen. (der Film)", a: ["des"],
      explain: "Предлог während требует Genitiv: der Film → des Films." },
    { type: "choice", q: "Wie sagt man richtig?", options: ["Anna Bruder", "Annas Bruder", "der Annas Bruder"], a: 1,
      explain: "К имени добавляется -s без апострофа, и имя стоит перед существительным без артикля: Annas Bruder." },
    { type: "input", q: "Statt ___ Kaffees trinke ich Tee. (ein)", a: ["eines"],
      explain: "statt требует Genitiv; der Kaffee → eines Kaffees." },
    { type: "choice", q: "Das Büro des ___ ist im ersten Stock.", options: ["Chef", "Chefs", "Chefes"], a: 1,
      explain: "После des у существительного мужского рода нужно -s: des Chefs. Окончание -es пишут в основном у односложных слов на шипящие (des Hauses), «Chefes» не употребляется." },
    { type: "order", words: ["Wegen", "des", "Streiks", "fährt", "kein", "Zug"], ru: "Из-за забастовки не ходит ни один поезд.",
      alts: [["kein", "Zug", "fährt", "Wegen", "des", "Streiks"]],
      explain: "wegen + Genitiv (des Streiks). Глагол fährt на 2-м месте — после группы с предлогом или после подлежащего kein Zug." },
    { type: "input", q: "Das ist die Wohnung ___ Eltern. (meine)", a: ["meiner"],
      explain: "Genitiv множественного числа: meiner Eltern (окончание как у артикля der)." },
    { type: "choice", q: "Wegen des ___ Wetters fällt das Spiel aus.", options: ["schlechte", "schlechten", "schlechtes"], a: 1,
      explain: "После определённого артикля в Genitiv прилагательное всегда получает -en: des schlechten Wetters." },
    { type: "input", q: "Das ist das Fahrrad ___ Studenten. (der)", a: ["des"],
      explain: "der Student → des Studenten. Это «слабое» существительное: вместо -s оно получает -en." }
  ]
});
