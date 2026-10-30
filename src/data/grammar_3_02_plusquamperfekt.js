DE.grammar.push({
  id: "plusquamperfekt",
  title: "Предпрошедшее время (Plusquamperfekt)",
  level: "B1",
  emoji: "⏪",
  summary: "hatte gemacht, war gegangen — что случилось ещё раньше в прошлом",
  content: `<p><b>Plusquamperfekt</b> показывает действие, которое произошло <b>раньше другого действия в прошлом</b>. В русском такого отдельного времени нет — мы говорим «уже», «до этого», «перед этим».</p>
<div class="ex"><b>Als ich ankam, war der Zug schon abgefahren.</b> — Когда я пришёл, поезд уже ушёл.</div>
<p>Сначала поезд ушёл (Plusquamperfekt), потом я пришёл (Präteritum).</p>
<h3>Как образуется</h3>
<p>Очень просто: это Perfekt, но вспомогательный глагол стоит в <b>Präteritum</b>:</p>
<p><span class="hl">hatte / war + Partizip II</span></p>
<table>
<tr><th></th><th>Perfekt</th><th>Plusquamperfekt</th></tr>
<tr><td>с haben</td><td>ich <b>habe</b> gegessen</td><td>ich <b>hatte</b> gegessen</td></tr>
<tr><td>с sein</td><td>ich <b>bin</b> gegangen</td><td>ich <b>war</b> gegangen</td></tr>
</table>
<p>Выбор между haben и sein — тот же, что в Perfekt: <b>sein</b> — с глаголами движения и изменения состояния (gehen, fahren, kommen, einschlafen, sterben), а также bleiben, sein, werden, passieren.</p>
<table>
<tr><th>Лицо</th><th>machen</th><th>fahren</th></tr>
<tr><td>ich</td><td>hatte gemacht</td><td>war gefahren</td></tr>
<tr><td>du</td><td>hattest gemacht</td><td>warst gefahren</td></tr>
<tr><td>er/sie/es</td><td>hatte gemacht</td><td>war gefahren</td></tr>
<tr><td>wir</td><td>hatten gemacht</td><td>waren gefahren</td></tr>
<tr><td>ihr</td><td>hattet gemacht</td><td>wart gefahren</td></tr>
<tr><td>sie/Sie</td><td>hatten gemacht</td><td>waren gefahren</td></tr>
</table>
<h3>Типичная ситуация: nachdem</h3>
<p>Plusquamperfekt очень часто стоит в придаточном с <b>nachdem</b> («после того как»), а в главном — Präteritum:</p>
<div class="ex"><b>Nachdem sie gegessen hatte, ging sie spazieren.</b> — После того как она поела, она пошла гулять.</div>
<div class="ex"><b>Ich hatte den Film schon gesehen, deshalb blieb ich zu Hause.</b> — Я уже видел этот фильм, поэтому остался дома.</div>
<div class="ex"><b>Er war noch nie in Berlin gewesen.</b> — Он ещё ни разу не был в Берлине (до того момента).</div>
<h3>Где встречается</h3>
<p>В разговоре Plusquamperfekt используется не так часто — немцы просто говорят в Perfekt и добавляют <i>schon, vorher, davor</i>. Но в <b>рассказах, письмах, биографиях</b> и после <b>nachdem</b> он нужен постоянно. Сигнальные слова: <i>schon, bereits, vorher, davor, noch nie, nachdem</i>.</p>
<div class="ex"><b>Bevor er nach Deutschland kam, hatte er drei Jahre Deutsch gelernt.</b> — Прежде чем приехать в Германию, он три года учил немецкий.</div>
<div class="tip">💡 Представь ось времени: <b>Plusquamperfekt ← Präteritum/Perfekt ← сейчас</b>. Plusquamperfekt — «прошлое прошлого». Формула-запоминалка: «hatte/war + Partizip — шаг назад от прошлого».</div>
<div class="warn">Не смешивай: после <b>nachdem</b> в прошлом — <b>Plusquamperfekt</b>, а не Präteritum: <i>Nachdem er gegessen hatte…</i> ✓</div>`,
  exercises: [
    { type: "choice", q: "Als wir ins Kino kamen, ___ der Film schon begonnen.", options: ["hat", "hatte", "war"], a: 1,
      explain: "Фильм начался раньше, чем мы пришли (kamen) → Plusquamperfekt. beginnen образует Perfekt с haben → hatte begonnen; «war» не подходит, «hat» — это Perfekt, а не «прошлое прошлого»." },
    { type: "input", q: "Nachdem er nach Hause ___ ___, rief er seine Mutter an. (kommen)", a: ["gekommen war"],
      explain: "kommen — глагол движения, поэтому с sein: war gekommen. В придаточном с nachdem спрягаемый глагол war стоит в самом конце." },
    { type: "choice", q: "Sie war müde, weil sie schlecht ___ hatte.", options: ["geschlafen", "schlief", "schlafen"], a: 0,
      explain: "Plusquamperfekt = hatte + Partizip II: geschlafen. «schlief» — Präteritum, «schlafen» — инфинитив, с hatte они не сочетаются." },
    { type: "order", words: ["Ich", "hatte", "meinen", "Schlüssel", "vergessen"], ru: "Я (ещё до этого) забыл свой ключ.",
      alts: [["meinen", "Schlüssel", "hatte", "Ich", "vergessen"]],
      explain: "hatte стоит на 2-м месте, Partizip II vergessen — в конце. На первое место можно поставить и дополнение: «Meinen Schlüssel hatte ich vergessen»." },
    { type: "input", q: "Du ___ schon gegangen, als ich anrief. (sein, Präteritum)", a: ["warst"],
      explain: "gehen — глагол движения, Perfekt с sein → Plusquamperfekt: du warst gegangen. «hattest gegangen» — ошибка." },
    { type: "choice", q: "Wir ___ noch nie in Italien gewesen.", options: ["hatten", "waren", "wurden"], a: 1,
      explain: "sein образует Perfekt с sein (ist gewesen) → Plusquamperfekt: waren gewesen. «hatten gewesen» — типичная ошибка, «wurden» — от werden." },
    { type: "input", q: "Nachdem ihr die Hausaufgaben ___ ___, durftet ihr spielen. (machen)", a: ["gemacht hattet"],
      explain: "machen — с haben: ihr hattet gemacht. В придаточном спрягаемый hattet стоит после Partizip II, в самом конце." },
    { type: "choice", q: "Какое действие было раньше? «Nachdem sie geduscht hatte, frühstückte sie.»", options: ["завтрак", "душ", "одновременно"], a: 1,
      explain: "Plusquamperfekt (hatte geduscht) обозначает более раннее действие: сначала душ, потом завтрак (Präteritum frühstückte)." },
    { type: "order", words: ["Der", "Zug", "war", "schon", "abgefahren"], ru: "Поезд уже ушёл.",
      explain: "abfahren — глагол движения, поэтому war + abgefahren. war на 2-м месте, Partizip II в конце, schon — между ними." },
    { type: "input", q: "Er ___ das Buch schon gelesen. (haben, Präteritum)", a: ["hatte"],
      explain: "lesen образует Perfekt с haben → Plusquamperfekt: er hatte gelesen. У er нет окончания после -te." },
    { type: "choice", q: "Nachdem ich ___, ging ich ins Bett.", options: ["gegessen habe", "gegessen hatte", "aß"], a: 1,
      explain: "Главное предложение в Präteritum (ging), а nachdem обозначает более раннее действие → Plusquamperfekt: gegessen hatte. «gegessen habe» — Perfekt, «aß» — то же время, что и в главном." },
    { type: "order", words: ["Nachdem", "er", "gegessen", "hatte,", "las", "er", "die", "Zeitung"], ru: "После того как он поел, он стал читать газету.",
      explain: "В придаточном с nachdem hatte стоит в конце. Придаточное занимает 1-е место, поэтому главное начинается сразу с глагола: «…, las er die Zeitung»." }
  ]
});
