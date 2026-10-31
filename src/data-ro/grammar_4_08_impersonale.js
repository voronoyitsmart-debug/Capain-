DE.grammar.push({
  id: "impersonale",
  title: "Безличные конструкции",
  level: "B2",
  emoji: "🌫️",
  summary: "trebuie să, se poate, e nevoie de, se zice că, mi-e dor, mi-e frig",
  content: `<p>Безличные конструкции не имеют подлежащего-деятеля. Многие из них похожи на русские: «нужно», «можно», «мне холодно».</p>

<h3>1. trebuie să — «нужно, надо, должен»</h3>
<p><b>Trebuie</b> не меняется по лицам; лицо показывает глагол после <b>să</b>:</p>
<div class="ex"><b>Trebuie să plec.</b> — Мне нужно уйти. <b>Trebuie să plecăm.</b> — Нам нужно уйти.</div>
<table>
<tr><th>Время</th><th>Форма</th><th>Перевод</th></tr>
<tr><td>настоящее</td><td>trebuie să</td><td>нужно, должен</td></tr>
<tr><td>имперфект</td><td>trebuia să</td><td>нужно было, должен был</td></tr>
<tr><td>perfect compus</td><td>a trebuit să</td><td>пришлось</td></tr>
<tr><td>условное</td><td>ar trebui să</td><td>следовало бы</td></tr>
</table>
<p>С причастием — «нужно сделать» без указания, кем: <b>Trebuie făcut ceva.</b> — Надо что-то сделать.</p>
<div class="warn">«Noi trebuim», «ei trebuiesc să» — ошибка. Правильно: <i>noi trebuie să…, ei trebuie să…</i></div>

<h3>2. se poate, e nevoie, e bine/greu</h3>
<div class="ex"><b>Se poate să plouă.</b> — Возможно, пойдёт дождь. <b>Nu se poate!</b> — Нельзя! / Не может быть!</div>
<div class="ex"><b>E nevoie de ajutor.</b> — Нужна помощь. <b>Nu e nevoie să vii.</b> — Не нужно приходить.</div>
<div class="ex"><b>E greu să înveți o limbă nouă.</b> — Трудно учить новый язык.</div>
<p>После <b>nevoie</b>: существительное — с <b>de</b>, глагол — с <b>să</b>.</p>

<h3>3. se zice că, se spune că, se pare că</h3>
<div class="ex"><b>Se zice că va ploua.</b> — Говорят, будет дождь. <b>Se pare că ai dreptate.</b> — Кажется, ты прав.</div>
<p>Так же: <b>cum se spune…?</b> (как говорят…?), <b>aici nu se fumează</b> (здесь не курят).</p>

<h3>4. Дательный падеж: mi-e…</h3>
<p>Состояния выражаются как в русском «мне холодно»: краткое местоимение в дательном + <b>e</b> + слово.</p>
<table>
<tr><th>Кому</th><th>Форма</th><th>Примеры</th></tr>
<tr><td>мне</td><td>mi-e / îmi e</td><td>mi-e frig, mi-e foame, mi-e sete</td></tr>
<tr><td>тебе</td><td>ți-e / îți e</td><td>ți-e somn?</td></tr>
<tr><td>ему / ей</td><td>îi e</td><td>îi e frică de câini</td></tr>
<tr><td>нам</td><td>ne e</td><td>ne e dor de casă</td></tr>
<tr><td>вам</td><td>vă e</td><td>vă e cald?</td></tr>
<tr><td>им</td><td>le e</td><td>le e rușine</td></tr>
</table>
<p>Полезные выражения: <b>mi-e dor de</b> (скучаю по), <b>mi-e frică de</b> (боюсь), <b>mi-e rău</b> (мне плохо), <b>mi-e greu</b> (мне трудно). В прошлом: <i>mi-a fost dor, îmi era frig</i>. Сюда же: <b>mi se pare</b> (мне кажется), <b>îmi pare rău</b> (мне жаль).</p>

<div class="tip">Русское «я скучаю по тебе» — <span class="hl">mi-e dor de tine</span>, «я боюсь» — <span class="hl">mi-e frică</span>, «я хочу есть» — <span class="hl">mi-e foame</span>. Думайте конструкцией «мне …», а не «я …».</div>`,
  exercises: [
    { type: "choice", q: "Noi ___ să plecăm acum.", options: ["trebuie", "trebuim", "trebuiesc"], a: 0,
      explain: "Trebuie не спрягается: noi trebuie să plecăm. Лицо выражает глагол после să." },
    { type: "input", q: "___ dor de tine. (мне)", a: ["Mi-e", "Îmi e"],
      explain: "«Мне + dor»: дательное местоимение + e — mi-e dor (или полная форма îmi e dor)." },
    { type: "choice", q: "___ frig. (ей)", options: ["Îi e", "Mi-e", "Ea e"], a: 0,
      explain: "«Ей холодно» — дательный 3 л. ед. ч.: îi e frig." },
    { type: "choice", q: "E nevoie ___ ajutor.", options: ["de", "să", "că"], a: 0,
      explain: "После nevoie существительное присоединяется предлогом de: e nevoie de ajutor." },
    { type: "input", q: "Se ___ că va ploua mâine. (a zice)", a: ["zice"],
      explain: "Se zice că… — «говорят, что…»: безличное se + 3 л. ед. ч." },
    { type: "order", words: ["Aici", "nu", "se", "fumează"], ru: "Здесь не курят.",
      alts: [["nu", "se", "fumează", "Aici"]],
      explain: "Безличное se + 3 л. ед. ч.; отрицание nu стоит перед se." },
    { type: "choice", q: "Se ___ să întârzii puțin. (возможно)", options: ["poate", "pot", "poată"], a: 0,
      explain: "Безличное se poate să… = «возможно, что…»; глагол всегда в 3 л. ед. ч." },
    { type: "input", q: "Ieri ___ să plec mai devreme. (trebuie → имперфект)", a: ["trebuia"],
      explain: "Имперфект от trebuie — trebuia: «вчера мне нужно было уйти раньше»." },
    { type: "choice", q: "Cum ___ spune «спасибо» în română?", options: ["se", "să", "îl"], a: 0,
      explain: "Cum se spune…? — безличный вопрос «как говорят / как сказать…?»." },
    { type: "order", words: ["Ne", "e", "dor", "de", "casă"], ru: "Мы скучаем по дому.",
      explain: "Дословно «нам тоска по…»: дательное ne + e dor de = «мы скучаем по…»." },
    { type: "choice", q: "___ pare că ai dreptate.", options: ["Mi se", "Mă", "Mie e"], a: 0,
      explain: "«Мне кажется» — mi se pare: дательное mi + se pare." },
    { type: "input", q: "Ar ___ să vorbești cu el. (следовало бы)", a: ["trebui"],
      explain: "Условное наклонение от trebuie: ar trebui să — «следовало бы»." },
    { type: "choice", q: "Trebuie ___ ceva urgent!", options: ["făcut", "făcând", "fac"], a: 0,
      explain: "Trebuie + причастие (неизменяемое) = «надо сделать»: Trebuie făcut ceva." }
  ]
});
