DE.grammar.push({
  id: "temporal",
  title: "Временные придаточные",
  level: "B1",
  emoji: "⏱️",
  summary: "als, wenn, während, bevor, nachdem, seit, bis, sobald — «когда?» в сложных предложениях",
  content: `<p>Временные придаточные отвечают на вопрос «<b>когда?</b>». Как и во всех придаточных, спрягаемый глагол стоит <b>в конце</b>. Если придаточное стоит первым, главное начинается <b>с глагола</b>: <i>Als ich ankam, <b>regnete</b> es.</i></p>
<h3>Союзы</h3>
<table>
<tr><th>Союз</th><th>Значение</th><th>Пример</th></tr>
<tr><td><b>als</b></td><td>когда (один раз в прошлом)</td><td><b>Als</b> ich zehn war, zogen wir nach Köln.</td></tr>
<tr><td><b>wenn</b></td><td>когда (каждый раз; настоящее/будущее)</td><td><b>Wenn</b> es regnet, bleibe ich zu Hause.</td></tr>
<tr><td><b>während</b></td><td>пока, в то время как (одновременно)</td><td><b>Während</b> ich koche, hört er Musik.</td></tr>
<tr><td><b>bevor</b></td><td>перед тем как</td><td><b>Bevor</b> du gehst, mach das Licht aus.</td></tr>
<tr><td><b>nachdem</b></td><td>после того как</td><td><b>Nachdem</b> er gegessen hatte, schlief er ein.</td></tr>
<tr><td><b>seit(dem)</b></td><td>с тех пор как</td><td><b>Seit</b> ich in Berlin wohne, spreche ich besser Deutsch.</td></tr>
<tr><td><b>bis</b></td><td>до тех пор пока (не)</td><td>Warte hier, <b>bis</b> ich zurückkomme.</td></tr>
<tr><td><b>sobald</b></td><td>как только</td><td><b>Sobald</b> ich Zeit habe, rufe ich dich an.</td></tr>
</table>
<h3>als или wenn?</h3>
<p>Главная ловушка для русскоговорящих, ведь в русском и то, и другое — «когда».</p>
<table>
<tr><th></th><th>Один раз</th><th>Много раз (всегда, когда…)</th></tr>
<tr><td>Прошлое</td><td><b>als</b>: Als ich dich sah, war ich glücklich.</td><td><b>wenn</b>: Immer wenn ich dich sah, war ich glücklich.</td></tr>
<tr><td>Настоящее / будущее</td><td><b>wenn</b>: Wenn ich ankomme, rufe ich an.</td><td><b>wenn</b>: Wenn ich müde bin, trinke ich Kaffee.</td></tr>
</table>
<div class="tip">💡 Запоминалка: <b>als</b> = «тогда, однажды» — <b>одна точка</b> в прошлом. Всё остальное — <b>wenn</b>. Подсказка: если по-русски можно добавить «каждый раз, когда» — это wenn.</div>
<h3>Времена с nachdem</h3>
<p>Действие в придаточном с <b>nachdem</b> произошло раньше, поэтому время «сдвигается» на шаг назад:</p>
<ul>
<li>главное в <b>Präsens</b> → nachdem + <b>Perfekt</b>: <i>Nachdem ich gegessen habe, gehe ich spazieren.</i></li>
<li>главное в <b>Präteritum</b> → nachdem + <b>Plusquamperfekt</b>: <i>Nachdem ich gegessen hatte, ging ich spazieren.</i></li>
</ul>
<div class="ex"><b>Ich lese immer ein Buch, bevor ich einschlafe.</b> — Я всегда читаю книгу перед тем, как заснуть.</div>
<div class="ex"><b>Seit sie einen Hund hat, geht sie jeden Tag spazieren.</b> — С тех пор как у неё собака, она каждый день гуляет.</div>
<div class="ex"><b>Während die Kinder schliefen, räumten wir auf.</b> — Пока дети спали, мы убирались.</div>
<div class="warn"><b>während</b> и <b>bis</b> бывают и предлогами: <i>während <b>des</b> Films</i> (Genitiv), <i>bis Montag</i>. Союз — если за ним идёт целое предложение с глаголом в конце.</div>`,
  exercises: [
    { type: "choice", q: "___ ich ein Kind war, wohnte ich in Moskau.", options: ["Wenn", "Als", "Wann"], a: 1,
      explain: "Детство — один период в прошлом → als. wenn в прошлом — только для повторяющихся действий, wann — вопросительное слово." },
    { type: "choice", q: "Immer ___ ich Oma besuchte, backte sie Kuchen.", options: ["als", "wenn", "während"], a: 1,
      explain: "«Каждый раз, когда» в прошлом (immer) → wenn. als — только для однократного события." },
    { type: "input", q: "___ du Zeit hast, ruf mich bitte an! (как только)", a: ["Sobald", "Sowie"],
      explain: "«Как только» → sobald (реже sowie). Глагол hast стоит в конце придаточного." },
    { type: "order", words: ["Bevor", "ich", "esse,", "wasche", "ich", "mir", "die", "Hände"], ru: "Перед тем как поесть, я мою руки.",
      explain: "Придаточное с bevor стоит первым и занимает 1-е место, поэтому главное начинается с глагола: wasche ich…" },
    { type: "choice", q: "___ ich koche, deckt mein Mann den Tisch.", options: ["Während", "Nachdem", "Bis"], a: 0,
      explain: "Два действия происходят одновременно → während. nachdem — «после того как» (и требовал бы Perfekt), bis — «до тех пор пока»." },
    { type: "input", q: "Wir warten, ___ der Regen aufhört. (до тех пор пока)", a: ["bis"],
      explain: "«Ждать, пока не…» — bis. Русское «пока» здесь не während: ждём до момента, когда дождь кончится." },
    { type: "choice", q: "Nachdem er die Arbeit beendet ___, ging er nach Hause.", options: ["hat", "hatte", "ist"], a: 1,
      explain: "Главное в Präteritum (ging) → после nachdem Plusquamperfekt: hatte beendet. beenden образует Perfekt с haben, поэтому не ist." },
    { type: "input", q: "___ ich in Deutschland lebe, esse ich mehr Brot. (с тех пор как)", a: ["Seit", "Seitdem"],
      explain: "«С тех пор как» → seit или seitdem; оба союза равноправны. Глагол lebe стоит в конце придаточного." },
    { type: "order", words: ["Als", "wir", "ankamen,", "regnete", "es", "stark"], ru: "Когда мы приехали, шёл сильный дождь.",
      explain: "Однократное событие в прошлом → als. После придаточного главное начинается с глагола: regnete es." },
    { type: "choice", q: "___ ich nach Hause komme, mache ich zuerst Tee.", options: ["Als", "Wenn", "Wann"], a: 1,
      explain: "Настоящее время, регулярное действие → wenn. als употребляется только для прошлого, wann — в вопросах." },
    { type: "input", q: "Nachdem ich gefrühstückt ___, gehe ich zur Arbeit. (haben)", a: ["habe"],
      explain: "Главное в Präsens (gehe) → nachdem + Perfekt: habe gefrühstückt." },
    { type: "choice", q: "Ruf mich an, ___ du in Berlin bist.", options: ["sobald", "seit", "als"], a: 0,
      explain: "«Позвони, как только будешь в Берлине» → sobald. seit — «с тех пор как», als — прошлое." },
    { type: "order", words: ["Ich", "putze", "die", "Wohnung,", "bevor", "die", "Gäste", "kommen"], ru: "Я убираю квартиру, перед тем как придут гости.",
      explain: "bevor вводит придаточное, поэтому глагол kommen стоит в самом конце." }
  ]
});
