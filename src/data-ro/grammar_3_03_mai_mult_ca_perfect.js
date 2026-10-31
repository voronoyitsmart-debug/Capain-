DE.grammar.push({
  id: "mai_mult_ca_perfect",
  title: "Mai-mult-ca-perfectul — давнопрошедшее (mersesem, fusesem)",
  level: "B1",
  emoji: "⏪",
  summary: "Când am ajuns, trenul plecase deja — действие раньше другого прошлого",
  content: `<p><b>Mai-mult-ca-perfectul</b> («более чем прошедшее») показывает, что одно действие в прошлом произошло <b>раньше другого</b> прошлого действия. В русском такой формы нет — мы говорим «уже» + прошедшее: «Когда я пришёл, поезд <i>уже ушёл</i>». Румын скажет <b>plecase</b>.</p>
<div class="ex"><b>Când am ajuns la gară, trenul plecase deja.</b> — Когда я добрался до вокзала, поезд уже ушёл.</div>
<p>Это <b>одно слово</b>, без вспомогательного глагола — как imperfect.</p>
<h3>Как образовать: от причастия (participiu)</h3>
<table>
<tr><th>Причастие</th><th>Правило</th><th>Результат (eu)</th></tr>
<tr><td>lucrat, văzut, citit, hotărât</td><td>убрать -t, добавить <b>-sem</b></td><td>lucra<span class="hl">sem</span>, văzu<span class="hl">sem</span>, citi<span class="hl">sem</span>, hotărâ<span class="hl">sem</span></td></tr>
<tr><td>mers, scris, spus, ajuns</td><td>добавить <b>-esem</b></td><td>mers<span class="hl">esem</span>, scris<span class="hl">esem</span>, spus<span class="hl">esem</span>, ajuns<span class="hl">esem</span></td></tr>
<tr><td>исключения</td><td>запомнить</td><td>a fi → <b>fusesem</b>, a avea → <b>avusesem</b>, a da → <b>dădusem</b>, a sta → <b>stătusem</b></td></tr>
</table>
<h3>Спряжение</h3>
<table>
<tr><th></th><th>a pleca</th><th>a merge</th><th>a fi</th></tr>
<tr><td>eu</td><td>plecasem</td><td>mersesem</td><td>fusesem</td></tr>
<tr><td>tu</td><td>plecaseși</td><td>merseseși</td><td>fuseseși</td></tr>
<tr><td>el, ea</td><td>plecase</td><td>mersese</td><td>fusese</td></tr>
<tr><td>noi</td><td>plecaserăm</td><td>merseserăm</td><td>fuseserăm</td></tr>
<tr><td>voi</td><td>plecaserăți</td><td>merseserăți</td><td>fuseserăți</td></tr>
<tr><td>ei, ele</td><td>plecaseră</td><td>merseseră</td><td>fuseseră</td></tr>
</table>
<p>Окончания: <b>-sem, -seși, -se, -serăm, -serăți, -seră</b>.</p>
<h3>Когда употребляется</h3>
<ul>
<li>Предшествование: <i>Am găsit cheile pe care le <b>pierdusem</b>.</i> — Я нашёл ключи, которые (до этого) потерял.</li>
<li>С «уже / ещё не / никогда»: <i>Nu mai <b>fusesem</b> niciodată acolo.</i> — Я никогда раньше там не бывал.</li>
<li>В пересказе, книгах, новостях: <i>Ea <b>plecase</b> înainte să sun eu.</i> — Она ушла до того, как я позвонил.</li>
</ul>
<h3>Три прошедших рядом</h3>
<table>
<tr><th>Время</th><th>Пример</th><th>Смысл</th></tr>
<tr><td>perfect compus</td><td><i>Am ajuns la gară.</i></td><td>Я добрался до вокзала (событие).</td></tr>
<tr><td>imperfect</td><td><i>Ploua.</i></td><td>Шёл дождь (фон в тот момент).</td></tr>
<tr><td>mai-mult-ca-perfect</td><td><i>Trenul plecase.</i></td><td>Поезд ушёл ещё раньше.</td></tr>
</table>
<div class="ex"><b>Eu mâncasem deja când ai venit.</b> — Я уже поел, когда ты пришёл.</div>
<div class="tip">💡 Ищите в окончании <b>«-se-»</b>: plecaSE, fuSEsem, merSEse. Это «сигнал прошлого в прошлом». В разговоре румыны часто заменяют эту форму на perfect compus + <i>deja</i>, но в текстах и на экзамене B1 её нужно узнавать и уметь образовать.</div>`,
  exercises: [
    { type: "choice", q: "Când am ajuns la cinema, filmul ___ deja. (a începe)", options: ["începuse", "începuseră", "începusem"], a: 0,
      explain: "Фильм начался раньше, чем мы пришли → mai-mult-ca-perfect, 3 л. ед. ч. (filmul — «он»): începuse." },
    { type: "input", q: "Eu ___ deja când ai sunat. (a mânca)", a: ["mâncasem"],
      explain: "Mâncat → убираем -t, добавляем -sem: mâncasem («я уже поел»)." },
    { type: "input", q: "Ei ___ la Paris înainte de 2010. (a fi)", a: ["fuseseră"],
      explain: "A fi — исключение: fusesem… 3 л. мн. ч. — fuseseră." },
    { type: "input", q: "Ea ___ scrisoarea înainte să plece. (a scrie)", a: ["scrisese"],
      explain: "Причастие на -s (scris) + -ese → scrisese." },
    { type: "choice", q: "Tu ___ filmul înainte? (a vedea)", options: ["văzuseși", "văzusești", "văzuseră"], a: 0,
      explain: "2 л. ед. ч.: văzu- + -seși → văzuseși. Văzuseră — «они видели»." },
    { type: "input", q: "Am găsit cheile pe care le ___ ieri. (a pierde, eu)", a: ["pierdusem"],
      explain: "Сначала потерял, потом нашёл → pierdut − t + sem = pierdusem." },
    { type: "order", words: ["Nu", "mai", "fusesem", "niciodată", "acolo"], ru: "Я никогда раньше там не бывал.",
      alts: [["Nu", "mai", "fusesem", "acolo", "niciodată"], ["niciodată", "Nu", "mai", "fusesem", "acolo"], ["acolo", "Nu", "mai", "fusesem", "niciodată"]],
      explain: "Fusesem — давнопрошедшее от a fi. Nu mai… niciodată = «никогда раньше не»." },
    { type: "choice", q: "Când a venit poliția, hoții ___. (a fugi)", options: ["fugiseră", "fugise", "fugiserăm"], a: 0,
      explain: "Воры сбежали до приезда полиции → fugiseră (hoții — 3 л. мн. ч.: -seră)." },
    { type: "input", q: "Voi ___ proiectul până vineri? (a termina)", a: ["terminaserăți"],
      explain: "2 л. мн. ч.: termina- + -serăți → terminaserăți." },
    { type: "choice", q: "El ___ deja la gară când l-am sunat. (a ajunge)", options: ["ajunsese", "ajunsesem", "ajungese"], a: 0,
      explain: "Причастие ajuns оканчивается на -s → + -ese; 3 л. ед. ч. — ajunsese (ajunsesem — «я»)." },
    { type: "order", words: ["Ea", "uitase", "cheile", "acasă"], ru: "Она (до этого) забыла ключи дома.",
      alts: [["Ea", "uitase", "acasă", "cheile"]],
      explain: "Uitat → uitase. Подлежащее ea в начале, дополнение и место можно поменять." },
    { type: "input", q: "Noi ___ un apartament înainte să ne mutăm. (a cumpăra)", a: ["cumpăraserăm"],
      explain: "1 л. мн. ч.: cumpăra- + -serăm → cumpăraserăm («мы (уже) купили квартиру до переезда»)." },
    { type: "choice", q: "Îmi ___ cartea înainte să plece în vacanță. (a da, el)", options: ["dăduse", "dase", "dădusem"], a: 0,
      explain: "A da — исключение: dădusem, dăduse… Подлежащее «он» → dăduse." }
  ]
});
