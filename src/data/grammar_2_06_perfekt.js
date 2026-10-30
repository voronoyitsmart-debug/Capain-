DE.grammar.push({
  id: "perfekt",
  title: "Прошедшее время Perfekt",
  level: "A2",
  emoji: "⏪",
  summary: "haben/sein + Partizip II: ich habe gemacht, ich bin gefahren",
  content: `<p><b>Perfekt</b> — главное разговорное прошедшее время. Когда немец рассказывает, что он делал вчера, он почти всегда использует Perfekt.</p>

<h3>Формула</h3>
<p><b>haben / sein</b> (спрягается, 2-е место) + … + <b>Partizip II</b> (в самом конце).</p>
<div class="ex"><b>Ich habe gestern einen Film gesehen.</b> — Вчера я посмотрел фильм.</div>
<div class="ex"><b>Wir sind nach Hamburg gefahren.</b> — Мы поехали (съездили) в Гамбург.</div>

<h3>Как образовать Partizip II</h3>
<table>
<tr><th>Тип глагола</th><th>Схема</th><th>Примеры</th></tr>
<tr><td>слабые (правильные)</td><td><b>ge</b>- … -<b>t</b></td><td>machen → gemacht, kaufen → gekauft, arbeiten → gearbeitet</td></tr>
<tr><td>сильные (неправильные)</td><td><b>ge</b>- … -<b>en</b>, часто меняется гласная</td><td>sehen → gesehen, trinken → getrunken, schreiben → geschrieben</td></tr>
<tr><td>смешанные</td><td><b>ge</b>- … -<b>t</b> + смена гласной</td><td>bringen → gebracht, denken → gedacht, wissen → gewusst</td></tr>
<tr><td>отделяемые приставки</td><td>приставка + <b>ge</b> + корень</td><td>einkaufen → ein<b>ge</b>kauft, aufstehen → auf<b>ge</b>standen</td></tr>
<tr><td>на <b>-ieren</b></td><td><b>без ge-</b>, -t</td><td>studieren → studiert, telefonieren → telefoniert</td></tr>
<tr><td>неотделяемые приставки (be-, ver-, er-, ent-, emp-, ge-, zer-, miss-)</td><td><b>без ge-</b></td><td>besuchen → besucht, verstehen → verstanden, bekommen → bekommen</td></tr>
</table>

<div class="tip">Почему у studieren и besuchen нет ge-? Правило ударения: <b>ge-</b> добавляется, только если ударение падает на <b>первый слог</b>. В stu-<i>DIE</i>-ren и be-<i>SU</i>-chen ударение не на первом слоге — значит, ge- не нужен.</div>

<h3>haben или sein?</h3>
<table>
<tr><th>sein</th><th>haben</th></tr>
<tr><td>движение из точки А в точку Б: gehen, fahren, kommen, fliegen, laufen</td><td>большинство глаголов: machen, essen, lesen, kaufen, schlafen</td></tr>
<tr><td>изменение состояния: aufstehen, einschlafen, werden, sterben</td><td>все возвратные: sich waschen → ich habe mich gewaschen</td></tr>
<tr><td>исключения: sein, bleiben, passieren</td><td>глаголы с Akkusativ-дополнением</td></tr>
</table>

<div class="ex"><b>Er ist um sieben Uhr aufgestanden.</b> — Он встал в семь часов.</div>
<div class="ex"><b>Ich habe meine Oma besucht.</b> — Я навестил бабушку.</div>
<div class="ex"><b>Was ist passiert?</b> — Что случилось?</div>
<div class="ex"><b>Sie hat in Berlin Medizin studiert.</b> — Она изучала медицину в Берлине.</div>

<div class="warn">Partizip II всегда стоит <b>в конце</b> предложения, как закрывающая скобка: <i>Ich <b>habe</b> heute im Supermarkt Brot und Milch <b>gekauft</b>.</i></div>

<p>Сильные глаголы нужно учить сразу тремя формами: <b>gehen — ging — ist gegangen</b>. Смотрите таблицы спряжения в разделе «Глаголы».</p>`,
  exercises: [
    { type: "choice", q: "Ich ___ gestern Pizza gegessen.", options: ["bin", "habe", "hat"], a: 1,
      explain: "essen не выражает перемещения → Perfekt с haben; ich → habe. hat — для er/sie/es." },
    { type: "choice", q: "Wir ___ nach Berlin gefahren.", options: ["haben", "sind", "seid"], a: 1,
      explain: "fahren — движение из точки А в точку Б → Perfekt с sein; wir → sind. seid — для ihr." },
    { type: "input", q: "Er hat ein Buch ___. (lesen)", a: ["gelesen"],
      explain: "lesen — сильный глагол: Partizip II на -en — gelesen (не «gelest»)." },
    { type: "input", q: "Ich habe in München ___. (studieren)", a: ["studiert"],
      explain: "Глаголы на -ieren образуют Partizip II без ge-: studiert (не «gestudiert»)." },
    { type: "choice", q: "Partizip II от «besuchen»:", options: ["gebesucht", "besucht", "besuchen"], a: 1,
      explain: "Неотделяемая приставка be- → Partizip II без ge-: besucht." },
    { type: "input", q: "Sie ist um 7 Uhr ___. (aufstehen)", a: ["aufgestanden"],
      explain: "aufstehen: ge- встаёт между приставкой и корнем — auf + ge + standen; Perfekt с sein (ist)." },
    { type: "choice", q: "Ich ___ den Schlüssel vergessen.", options: ["bin", "habe", "war"], a: 1,
      explain: "vergessen — переходный глагол → Perfekt с haben; Partizip без ge- из-за приставки ver-." },
    { type: "order", words: ["Ich", "habe", "gestern", "viel", "gearbeitet"], ru: "Вчера я много работал.",
      alts: [["gestern", "habe", "Ich", "viel", "gearbeitet"]],
      explain: "haben на 2-м месте, Partizip II — в конце. Можно начать с gestern: Gestern habe ich viel gearbeitet." },
    { type: "input", q: "Wir haben im Supermarkt ___. (einkaufen)", a: ["eingekauft"],
      explain: "einkaufen: ge- между приставкой и корнем — ein + ge + kauft." },
    { type: "choice", q: "Partizip II от «trinken»:", options: ["getrinkt", "getrunken", "getrankt"], a: 1,
      explain: "trinken — сильный глагол: trinken — trank — getrunken (i → a → u)." },
    { type: "choice", q: "Er ___ zu Hause geblieben.", options: ["hat", "ist", "habt"], a: 1,
      explain: "bleiben — исключение: перемещения нет, но Perfekt с sein: er ist geblieben." },
    { type: "order", words: ["Hast", "du", "mich", "gestern", "angerufen"], ru: "Ты звонил мне вчера?",
      explain: "В вопросе да/нет hast на 1-м месте; anrufen → angerufen в конце предложения." },
    { type: "input", q: "Ich habe dich nicht ___. (verstehen)", a: ["verstanden"],
      explain: "ver- — неотделяемая приставка, поэтому без ge-: verstanden." },
    { type: "choice", q: "Wann ___ ihr nach Hause gekommen?", options: ["habt", "seid", "sind"], a: 1,
      explain: "kommen — движение → Perfekt с sein; ihr → seid (sind — для wir/sie)." }
  ]
});
