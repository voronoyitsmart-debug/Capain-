DE.grammar.push({
  id: "konjunktiv1",
  title: "Konjunktiv I и косвенная речь",
  level: "B2",
  emoji: "📰",
  summary: "Er sagt, er sei krank / habe keine Zeit; замена на Konjunktiv II",
  content: `<p><b>Konjunktiv I</b> — форма для <b>косвенной речи</b>. Ею говорящий показывает: «я лишь передаю чужие слова и не ручаюсь за их правдивость». Её постоянно встречаешь в новостях, газетах, официальных текстах.</p>
<div class="ex">Er sagt: „Ich <b>bin</b> krank.“ → <b>Er sagt, er sei krank.</b> — Он говорит, что болен.</div>
<h3>Образование</h3>
<p>Основа инфинитива + окончания <b>-e, -est, -e, -en, -et, -en</b>. На практике чаще всего нужна форма <b>3-го лица ед. ч.</b> — она всегда оканчивается на <b>-e</b>.</p>
<table>
<tr><th>Лицо</th><th>sein</th><th>haben</th><th>kommen</th><th>können</th></tr>
<tr><td>ich</td><td>sei</td><td>habe*</td><td>komme*</td><td>könne</td></tr>
<tr><td>du</td><td>sei(e)st</td><td>habest</td><td>kommest</td><td>könnest</td></tr>
<tr><td>er/sie/es</td><td><b>sei</b></td><td><b>habe</b></td><td><b>komme</b></td><td><b>könne</b></td></tr>
<tr><td>wir</td><td>seien</td><td>haben*</td><td>kommen*</td><td>können*</td></tr>
<tr><td>ihr</td><td>seiet</td><td>habet</td><td>kommet</td><td>könnet</td></tr>
<tr><td>sie/Sie</td><td>seien</td><td>haben*</td><td>kommen*</td><td>können*</td></tr>
</table>
<p>* — форма совпадает с индикативом. Тогда её <b>заменяют на Konjunktiv II</b>, чтобы было видно, что это косвенная речь:</p>
<div class="ex">Sie sagen: „Wir haben keine Zeit.“ → <b>Sie sagen, sie hätten keine Zeit.</b> (не <i>sie haben</i>)</div>
<div class="ex">Sie sagen: „Wir kommen morgen.“ → <b>Sie sagen, sie würden morgen kommen.</b></div>
<h3>Времена в косвенной речи</h3>
<table>
<tr><th>Прямая речь</th><th>Косвенная речь</th></tr>
<tr><td>„Ich arbeite viel.“</td><td>Er sagt, er <b>arbeite</b> viel. (настоящее)</td></tr>
<tr><td>„Ich habe gearbeitet / arbeitete.“</td><td>Er sagt, er <b>habe gearbeitet</b>. (прошедшее)</td></tr>
<tr><td>„Ich bin gefahren.“</td><td>Er sagt, er <b>sei gefahren</b>. (прошедшее)</td></tr>
<tr><td>„Ich werde kommen.“</td><td>Er sagt, er <b>werde kommen</b>. (будущее)</td></tr>
</table>
<p>Для прошлого есть только одна форма: <b>habe/sei + Partizip II</b> — неважно, было ли в прямой речи Präteritum или Perfekt.</p>
<h3>Вопросы и просьбы</h3>
<ul>
<li>Вопрос без вопр. слова → <b>ob</b>: <i>Sie fragt, <b>ob</b> ich Zeit hätte.</i></li>
<li>Вопрос с вопр. словом → то же слово: <i>Er fragt, <b>wann</b> der Zug komme.</i></li>
<li>Просьба/приказ → <b>sollen</b> (приказ) или <b>mögen</b> (вежливая просьба): „Warten Sie!“ → <i>Er sagt, ich <b>solle</b> warten.</i></li>
</ul>
<p>Союз <b>dass</b> можно использовать, тогда глагол уходит в конец: <i>Er sagt, <b>dass</b> er krank <b>sei</b>.</i></p>
<div class="warn">Не забывайте менять местоимения, как в русском: „<b>Ich</b> bin müde“ → Sie sagt, <b>sie</b> sei müde.</div>
<div class="ex"><b>Laut Polizei sei der Täter geflohen.</b> — По данным полиции, преступник скрылся.</div>
<div class="tip">Главные «звёзды» Konjunktiv I, которые надо узнавать мгновенно: <b>sei, habe, werde, könne, müsse, wisse, gebe</b>. В разговорной речи немцы часто используют вместо них Konjunktiv II или даже индикатив, но в письменном и деловом языке Konjunktiv I обязателен — его ждут на экзаменах B2 и C1.</div>`,
  exercises: [
    { type: "choice", q: "Er sagt, er ___ krank. (Konjunktiv I)", options: ["sei", "seid", "seien"], a: 0,
      explain: "Konjunktiv I от sein для er — sei. «seid» — индикатив для ihr, «seien» — Konjunktiv I для wir/sie." },
    { type: "input", q: "Sie sagt, sie ___ keine Zeit. (haben, Konj. I)", a: ["habe"],
      explain: "3-е л. ед. ч. Konjunktiv I = основа + -e: hab-e. Отличается от индикатива hat, поэтому замена на hätte не нужна." },
    { type: "choice", q: "Die Kinder sagen, sie ___ keinen Hunger. (нужна форма, отличная от индикатива)", options: ["haben", "hätten", "habe"], a: 1,
      explain: "Konjunktiv I «sie haben» совпадает с индикативом, поэтому берём Konjunktiv II: hätten. «habe» — форма ед. числа." },
    { type: "input", q: "Der Minister erklärte, er ___ nichts davon gewusst. (haben, Konj. I)", a: ["habe"],
      explain: "Прошлое в косвенной речи = Konjunktiv I от haben/sein + Partizip II: er habe gewusst." },
    { type: "order", words: ["Sie", "behauptet,", "sie", "sei", "nie", "in", "Paris", "gewesen"], ru: "Она утверждает, что никогда не была в Париже.",
      alts: [["Sie", "behauptet,", "sie", "sei", "in", "Paris", "nie", "gewesen"]],
      explain: "Косвенная речь без dass: sei на 2-м месте, Partizip II gewesen — в конце (прошлое = sei + Partizip II)." },
    { type: "choice", q: "Er erzählt, er ___ gestern nach Hause gelaufen.", options: ["habe", "sei", "seien"], a: 1,
      explain: "laufen — глагол движения, Perfekt с sein → er sei gelaufen. «seien» — мн. число." },
    { type: "input", q: "„Ich komme morgen.“ → Er sagt, er ___ morgen. (Konj. I)", a: ["komme"],
      explain: "Konjunktiv I для er = основа + -e: komm-e. Индикатив был бы kommt." },
    { type: "choice", q: "„Hast du Zeit?“ → Sie fragt, ___ ich Zeit hätte.", options: ["dass", "ob", "wenn"], a: 1,
      explain: "Вопрос без вопросительного слова (да/нет) передаётся через ob («ли»). dass — для утверждений, wenn — «если/когда»." },
    { type: "choice", q: "Er sagt: „Treiben Sie mehr Sport!“ → Er sagt, ich ___ mehr Sport treiben.", options: ["solle", "sollen", "sollt"], a: 0,
      explain: "Императив в косвенной речи передаётся через sollen; Konjunktiv I для ich — solle." },
    { type: "input", q: "Laut Polizei ___ der Täter geflohen. (sein, Konj. I)", a: ["sei"],
      explain: "Журналист передаёт чужие данные и не ручается за них → Konjunktiv I. fliehen — с sein → sei geflohen." },
    { type: "choice", q: "Meine Eltern sagten, sie ___ morgen kommen. (нужна форма, отличная от индикатива)", options: ["werden", "würden", "werde"], a: 1,
      explain: "Konjunktiv I «sie werden» совпадает с индикативом → заменяем на Konjunktiv II: würden. «werde» — ед. число." },
    { type: "order", words: ["Er", "sagt,", "dass", "er", "keine", "Zeit", "habe"], ru: "Он говорит, что у него нет времени.",
      explain: "С союзом dass спрягаемый глагол habe уходит в самый конец придаточного." },
    { type: "input", q: "Sie meint, du ___ recht. (haben, du)", a: ["habest", "hättest", "haettest"],
      explain: "Konjunktiv I «du habest» звучит очень книжно, поэтому обычно используют hättest. Оба варианта правильны." },
    { type: "choice", q: "Какая форма — Konjunktiv I от können (er)?", options: ["könne", "könnte", "kann"], a: 0,
      explain: "Konjunktiv I = основа инфинитива + -e: könne. könnte — Konjunktiv II (от Präteritum konnte), kann — индикатив." }
  ]
});
