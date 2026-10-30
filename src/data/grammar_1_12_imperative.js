DE.grammar.push({
  id: "imperative",
  title: "Повелительное наклонение",
  level: "A1",
  emoji: "❗",
  summary: "Komm! Kommt! Kommen Sie! — просьбы и команды",
  content: `<p>Императив нужен для просьб, советов и инструкций: «Иди!», «Идите!», «Подождите, пожалуйста». В немецком три основные формы — для <b>du</b>, <b>ihr</b> и <b>Sie</b>. Глагол всегда стоит <b>на первом месте</b>.</p>

<h3>Как образовать</h3>
<table>
<tr><th>Кому</th><th>Как</th><th>kommen</th><th>machen</th><th>sprechen</th></tr>
<tr><td><b>du</b></td><td>форма du без -st и без «du»</td><td>Komm!</td><td>Mach!</td><td>Sprich!</td></tr>
<tr><td><b>ihr</b></td><td>форма ihr без «ihr»</td><td>Kommt!</td><td>Macht!</td><td>Sprecht!</td></tr>
<tr><td><b>Sie</b></td><td>инфинитив + Sie</td><td>Kommen Sie!</td><td>Machen Sie!</td><td>Sprechen Sie!</td></tr>
</table>
<div class="ex"><b>Komm bitte her!</b> — Иди, пожалуйста, сюда!</div>
<div class="ex"><b>Macht die Hausaufgaben!</b> — Делайте домашнее задание! (детям)</div>
<div class="ex"><b>Warten Sie bitte!</b> — Подождите, пожалуйста!</div>

<h3>Особенности формы du</h3>
<ul>
<li><b>e → i / ie</b> сохраняется: du sprichst → <b>Sprich!</b>, du liest → <b>Lies!</b>, du nimmst → <b>Nimm!</b>, du gibst → <b>Gib!</b>, du hilfst → <b>Hilf!</b></li>
<li><b>a → ä</b> исчезает: du fährst → <b>Fahr!</b>, du schläfst → <b>Schlaf!</b></li>
<li>Основа на <b>-t, -d</b> и т. п. получает <b>-e</b>: <b>Warte!</b>, <b>Arbeite!</b>, <b>Öffne!</b></li>
<li>Отделяемая приставка — в конце: <b>Steh auf!</b>, <b>Mach die Tür zu!</b>, <b>Ruf mich an!</b></li>
</ul>

<h3>sein и haben — особые</h3>
<table>
<tr><th></th><th>du</th><th>ihr</th><th>Sie</th></tr>
<tr><td>sein</td><td><b>Sei!</b></td><td><b>Seid!</b></td><td><b>Seien Sie!</b></td></tr>
<tr><td>haben</td><td>Hab! / Habe!</td><td>Habt!</td><td>Haben Sie!</td></tr>
</table>
<div class="ex"><b>Sei nicht so laut!</b> — Не шуми так!</div>
<div class="ex"><b>Hab keine Angst!</b> — Не бойся!</div>

<div class="tip">Есть ещё форма для «давай(те)!»: <span class="hl">Gehen wir!</span> — Пойдём(те)! Слова <b>bitte</b>, <b>mal</b> и <b>doch</b> смягчают просьбу: «Komm doch mal!» звучит дружелюбно, а «Komm!» — резко.</div>

<div class="warn">В форме du местоимение не ставится: не «Komm du!», а просто <b>Komm!</b> А в форме Sie местоимение обязательно: <b>Kommen Sie!</b></div>`,
  exercises: [
    { type: "choice", q: "(du) ___ bitte langsam! (sprechen)", options: ["Sprechst", "Sprich", "Spricht"], a: 1,
      explain: "Императив du: du sprichst − st → Sprich! Смена e → i сохраняется. Spricht — форма er, не императив." },
    { type: "input", q: "___ Sie bitte! (warten)", a: ["Warten"],
      explain: "Вежливый императив: инфинитив на 1-м месте + Sie — Warten Sie bitte!" },
    { type: "input", q: "(ihr) ___ leise! (sein)", a: ["Seid"],
      explain: "sein — неправильный: ihr → Seid! (как ihr seid)." },
    { type: "choice", q: "(du) ___ nicht so laut! (sein)", options: ["Bist", "Sei", "Seid"], a: 1,
      explain: "sein — неправильный: императив du — Sei! Seid — для ihr, Bist — не императив." },
    { type: "order", words: ["Mach", "die", "Tür", "zu"], ru: "Закрой дверь.",
      explain: "zumachen: в императиве Mach — первым, приставка zu — в конце." },
    { type: "input", q: "(du) ___ das Buch! (lesen)", a: ["Lies"],
      explain: "du liest → Lies! Смена e → ie сохраняется, окончания нет." },
    { type: "choice", q: "(du) ___ langsam! (fahren)", options: ["Fähr", "Fahr", "Fährst"], a: 1,
      explain: "Умлаут a → ä в императиве исчезает: Fahr! (в отличие от e → i: Sprich!)." },
    { type: "input", q: "(ihr) ___ die Hausaufgaben! (machen)", a: ["Macht"],
      explain: "Императив ihr = форма ihr без местоимения: ihr macht → Macht!" },
    { type: "choice", q: "(du) ___ auf mich! (warten)", options: ["Wartest", "Warte", "Wartet"], a: 1,
      explain: "Основа на -t → нужна -e: Warte! (Wartet — форма ihr.)" },
    { type: "order", words: ["Kommen", "Sie", "bitte", "herein"], ru: "Входите, пожалуйста.",
      alts: [["bitte", "Kommen", "Sie", "herein"]],
      explain: "Вежливая форма: глагол + Sie; приставка herein — в конце. bitte может стоять после Sie или в самом начале." },
    { type: "input", q: "(du) ___ keine Angst! (haben)", a: ["Hab", "Habe"],
      explain: "haben: императив du — Hab! (или Habe!). «Hast» — не императив." },
    { type: "choice", q: "Как вежливо сказать «Садитесь, пожалуйста»?", options: ["Setz dich bitte!", "Setzen Sie sich bitte!", "Setzt euch bitte!"], a: 1,
      explain: "Вежливая форма: Setzen Sie sich! (Setz dich — для du, Setzt euch — для ihr)." },
    { type: "input", q: "(du) ___ mir bitte! (helfen)", a: ["Hilf"],
      explain: "du hilfst − st → Hilf! Смена e → i сохраняется." },
    { type: "order", words: ["Ruf", "mich", "morgen", "an"], ru: "Позвони мне завтра.",
      explain: "anrufen: в императиве Ruf — первым, приставка an — в самом конце." }
  ]
});
