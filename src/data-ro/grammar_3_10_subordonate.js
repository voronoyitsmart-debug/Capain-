DE.grammar.push({
  id: "subordonate",
  title: "Придаточные предложения (că, să, dacă, deși, încât, ca să)",
  level: "B1",
  emoji: "🪢",
  summary: "Știu că vine. Vreau să vină. Nu știu dacă vine — союзы сложного предложения",
  content: `<p>Хорошая новость: порядок слов в румынском придаточном <b>такой же, как в главном</b> (никаких «глагол в конец», как в немецком). Нужно лишь выбрать правильный союз.</p>
<h3>Главные союзы</h3>
<table>
<tr><th>Союз</th><th>Значение</th><th>Пример</th></tr>
<tr><td><b>că</b></td><td>что (факт)</td><td><i>Știu <b>că</b> vine.</i> — Я знаю, что он придёт.</td></tr>
<tr><td><b>să</b></td><td>чтобы; желание, необходимость</td><td><i>Vreau <b>să</b> vină.</i> — Я хочу, чтобы он пришёл.</td></tr>
<tr><td><b>dacă</b></td><td>1) ли; 2) если</td><td><i>Nu știu <b>dacă</b> vine.</i> — Не знаю, придёт ли он.<br><i><b>Dacă</b> plouă, rămânem acasă.</i></td></tr>
<tr><td><b>când</b></td><td>когда</td><td><i>Te sun <b>când</b> ajung.</i> — Позвоню, когда доберусь.</td></tr>
<tr><td><b>pentru că</b> (fiindcă, deoarece)</td><td>потому что</td><td><i>Nu vin <b>pentru că</b> sunt bolnav.</i></td></tr>
<tr><td><b>deși</b> (cu toate că)</td><td>хотя</td><td><i><b>Deși</b> era obosit, a lucrat până seara.</i></td></tr>
<tr><td><b>încât</b> (atât de… încât)</td><td>так… что (следствие)</td><td><i>Era atât de cald, <b>încât</b> nu puteam dormi.</i></td></tr>
<tr><td><b>ca să</b></td><td>чтобы (цель)</td><td><i>Învăț <b>ca să</b> trec examenul.</i> — Учусь, чтобы сдать экзамен.</td></tr>
</table>
<h3>Că или să? — как «что» и «чтобы»</h3>
<p>Русский помогает: если по-русски «<b>что</b>» — берём <b>că</b> + обычное время; если «<b>чтобы</b>» (или инфинитив) — берём <b>să</b> + конъюнктив.</p>
<div class="ex"><b>Mi-a spus că vine.</b> — Он сказал мне, что придёт.</div>
<div class="ex"><b>Mi-a spus să vin.</b> — Он сказал мне, чтобы я пришёл (велел прийти).</div>
<h3>Dacă = «ли» и «если»</h3>
<p>Русское «ли» в косвенном вопросе переводится через <b>dacă</b>: <i>Întreabă-l <b>dacă</b> are timp.</i> — Спроси его, есть ли у него время.</p>
<h3>Ca să и pentru că</h3>
<p>Не путайте цель и причину: <b>ca să</b> — «чтобы» (зачем?), <b>pentru că</b> — «потому что» (почему?). Подлежащее можно вставить между частями: <i>Îți explic <b>ca</b> tu <b>să</b> înțelegi.</i></p>
<div class="warn">Запятые: в отличие от русского, перед <b>că, să, dacă</b> (ли), когда они идут после главного, запятая <b>не ставится</b>: <i>Știu că ai dreptate.</i> Если придаточное стоит первым — запятая нужна: <i>Dacă vrei, vin.</i></div>
<div class="tip">💡 Мини-словарик для перевода «в лоб»: что = <b>că</b>, чтобы = <b>să / ca să</b>, ли = <b>dacă</b>, хотя = <b>deși</b>, потому что = <b>pentru că</b>, так что = <b>încât</b>.</div>`,
  exercises: [
    { type: "choice", q: "Știu ___ ai dreptate.", options: ["că", "să", "ca să"], a: 0,
      explain: "«Знаю, что ты прав» — факт → că + изъявительное наклонение." },
    { type: "choice", q: "Vreau ___ vii la mine.", options: ["să", "că", "dacă"], a: 0,
      explain: "Желание («хочу, чтобы ты пришёл») → să + конъюнктив." },
    { type: "choice", q: "Nu știu ___ vine mâine. (придёт ли)", options: ["dacă", "că", "să"], a: 0,
      explain: "Русское «ли» в косвенном вопросе = dacă." },
    { type: "input", q: "Învăț româna ___ lucrez în România. (чтобы — 2 слова)", a: ["ca să"],
      explain: "Цель («зачем?») → ca să + конъюнктив." },
    { type: "input", q: "Nu am venit ___ eram bolnav. (потому что)", a: ["pentru că", "fiindcă", "deoarece", "căci", "întrucât"],
      explain: "Причина («почему?») → pentru că (или fiindcă, deoarece)." },
    { type: "choice", q: "___ era foarte obosit, a lucrat până seara.", options: ["Deși", "Pentru că", "Ca să"], a: 0,
      explain: "Уступка: «хотя устал, работал до вечера» → deși." },
    { type: "input", q: "Era atât de cald, ___ nu puteam dormi.", a: ["încât"],
      explain: "Следствие после atât de… → încât («так жарко, что…»)." },
    { type: "choice", q: "Mi-a spus ___ vin mâine. (велел мне прийти)", options: ["să", "că", "dacă"], a: 0,
      explain: "«Сказал, чтобы я пришёл» — побуждение → să." },
    { type: "order", words: ["Cred", "că", "ai", "dreptate"], ru: "Я думаю, что ты прав.",
      explain: "Главное предложение + că + придаточное; запятая перед că не нужна." },
    { type: "order", words: ["Dacă", "plouă,", "rămânem", "acasă"], ru: "Если пойдёт дождь, мы останемся дома.",
      alts: [["rămânem", "acasă", "Dacă", "plouă,"]],
      explain: "Условие с dacă может стоять и первым (тогда с запятой), и вторым." },
    { type: "input", q: "Te sun ___ ajung acasă. (когда)", a: ["când"],
      explain: "Время → când. После când румыны часто используют настоящее время: când ajung." },
    { type: "order", words: ["Am", "venit", "ca", "să", "te", "ajut"], ru: "Я пришёл, чтобы тебе помочь.",
      alts: [["ca", "să", "te", "ajut", "Am", "venit"]],
      explain: "Цель → ca să te ajut. Придаточное цели можно вынести вперёд для акцента." },
    { type: "input", q: "Te ajut, ___ nu am timp. (хотя)", a: ["deși", "cu toate că"],
      explain: "Уступка («хотя») → deși или cu toate că." },
    { type: "choice", q: "Întreabă-l ___ are timp. (есть ли)", options: ["dacă", "că", "ca să"], a: 0,
      explain: "Косвенный вопрос «есть ли у него время» → dacă." }
  ]
});
