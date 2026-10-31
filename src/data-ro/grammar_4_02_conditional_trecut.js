DE.grammar.push({
  id: "conditional_trecut",
  title: "Прошедшее условное: aș fi făcut",
  level: "B2",
  emoji: "🕰️",
  summary: "aș/ai/ar/am/ați/ar + fi + причастие: Dacă aș fi știut, aș fi venit.",
  content: `<p>В русском «бы» не различает время: «я бы пришёл» — и сейчас, и вчера. В румынском есть отдельная форма для <b>нереального прошлого</b> — <b>condiționalul perfect</b>: то, что могло случиться, но <i>не случилось</i>.</p>

<h3>Образование</h3>
<p>Вспомогательный глагол условного наклонения + <b>fi</b> + причастие. Причастие <b>не изменяется</b> (в отличие от пассива).</p>
<table>
<tr><th>Лицо</th><th>a face</th><th>a veni</th></tr>
<tr><td>eu</td><td><b>aș fi</b> făcut</td><td>aș fi venit</td></tr>
<tr><td>tu</td><td><b>ai fi</b> făcut</td><td>ai fi venit</td></tr>
<tr><td>el / ea</td><td><b>ar fi</b> făcut</td><td>ar fi venit</td></tr>
<tr><td>noi</td><td><b>am fi</b> făcut</td><td>am fi venit</td></tr>
<tr><td>voi</td><td><b>ați fi</b> făcut</td><td>ați fi venit</td></tr>
<tr><td>ei / ele</td><td><b>ar fi</b> făcut</td><td>ar fi venit</td></tr>
</table>
<p>Отрицание и местоимения стоят перед вспомогательным глаголом: <i>n-aș fi venit, l-aș fi văzut, mi-ar fi plăcut</i>.</p>

<h3>1. Нереальное условие в прошлом</h3>
<p>Форма стоит <b>в обеих частях</b>: и после <b>dacă</b>, и в главном предложении.</p>
<div class="ex"><b>Dacă aș fi știut, aș fi venit.</b> — Если бы я знал, я бы пришёл.</div>
<div class="ex"><b>Dacă ai fi plecat mai devreme, n-ai fi pierdut trenul.</b> — Если бы ты вышел раньше, ты бы не опоздал на поезд.</div>

<h3>2. Смешанный тип: прошлое → настоящее</h3>
<div class="ex"><b>Dacă aș fi învățat mai mult, acum aș vorbi fluent.</b> — Если бы я больше занимался (тогда), сейчас я бы говорил свободно.</div>

<h3>3. Упрёк и сожаление</h3>
<table>
<tr><th>Конструкция</th><th>Значение</th></tr>
<tr><td><b>Ar fi trebuit să</b> + conjunctiv</td><td>следовало бы (но не сделал)</td></tr>
<tr><td><b>Ar fi putut să</b> + conjunctiv</td><td>мог бы (но не сделал)</td></tr>
<tr><td><b>Mi-ar fi plăcut să</b>…</td><td>мне бы хотелось (тогда)…</td></tr>
</table>
<div class="ex"><b>Ar fi trebuit să mă suni.</b> — Тебе следовало мне позвонить.</div>

<h3>4. Непроверенная информация (в СМИ)</h3>
<p>В новостях ar fi + причастие означает «якобы, по имеющимся данным»:</p>
<div class="ex"><b>Suspectul ar fi fugit din țară.</b> — Подозреваемый, по некоторым данным, бежал из страны.</div>

<div class="tip">В живой речи вместо <span class="hl">Dacă aș fi știut, aș fi venit</span> часто говорят с имперфектом: <span class="hl">Dacă știam, veneam</span>. Понимать это нужно, но в письменной и официальной речи используйте aș fi + причастие.</div>`,
  exercises: [
    { type: "input", q: "Dacă aș fi știut, ___ venit. (eu)", a: ["aș fi"],
      explain: "Нереальное условие в прошлом: обе части в condițional perfect — aș fi venit." },
    { type: "choice", q: "Dacă ai fi plecat mai devreme, (tu) n-___ pierdut trenul.", options: ["ai fi", "ai", "vei fi"], a: 0,
      explain: "Главная часть тоже в прошедшем условном: n-ai fi pierdut. «N-ai pierdut» — простой факт, а не следствие." },
    { type: "choice", q: "Ar fi trebuit ___ mai devreme.", options: ["să pleci", "să plecat", "plecai"], a: 0,
      explain: "После ar fi trebuit идёт să + conjunctiv: ar fi trebuit să pleci — тебе следовало уйти раньше." },
    { type: "order", words: ["Dacă", "aș", "fi", "avut", "timp,", "aș", "fi", "venit"], ru: "Если бы у меня было время, я бы пришёл.",
      alts: [["aș", "fi", "venit", "Dacă", "aș", "fi", "avut", "timp,"]],
      explain: "Обе части — aș fi + причастие. Условную часть можно поставить и после главной." },
    { type: "input", q: "Noi ___ cumpărat casa, dar era prea scumpă. (мы бы купили)", a: ["am fi"],
      explain: "Для noi вспомогательный глагол am + fi: am fi cumpărat." },
    { type: "choice", q: "Conform presei, ministrul ___ demisionat ieri.", options: ["ar fi", "a fi", "ar"], a: 0,
      explain: "В новостях ar fi + причастие = «якобы, по данным СМИ»: ministrul ar fi demisionat." },
    { type: "choice", q: "Dacă aș fi învățat mai mult, acum ___ fluent.", options: ["aș vorbi", "aș fi vorbit", "vorbisem"], a: 0,
      explain: "Смешанный тип: условие в прошлом, следствие — сейчас («acum»), поэтому настоящее условное aș vorbi." },
    { type: "input", q: "Mi-___ plăcut să vin, dar am fost bolnav.", a: ["ar fi"],
      explain: "Mi-ar fi plăcut — «мне бы хотелось (тогда)»: ar fi + причастие, местоимение mi- перед вспомогательным глаголом." },
    { type: "order", words: ["N-aș", "fi", "crezut", "asta"], ru: "Я бы в это не поверил.",
      alts: [["asta", "N-aș", "fi", "crezut"]],
      explain: "Отрицание сливается со вспомогательным глаголом: n-aș fi crezut. Asta можно вынести вперёд для выразительности." },
    { type: "choice", q: "Разговорный эквивалент фразы «Dacă aș fi știut, aș fi venit»:", options: ["Dacă știam, veneam.", "Dacă știu, vin.", "Dacă știusem, venisem."], a: 0,
      explain: "В разговоре нереальное прошлое часто выражают имперфектом в обеих частях: Dacă știam, veneam." },
    { type: "input", q: "Ei ___ ajuns la timp dacă n-ar fi fost trafic.", a: ["ar fi"],
      explain: "3 л. мн. ч.: ar fi ajuns — «они бы успели» (но не успели)." },
    { type: "choice", q: "Dacă m-ai fi sunat, (eu) te-___ ajutat.", options: ["aș fi", "am", "aș"], a: 0,
      explain: "Следствие нереального условия в прошлом: te-aș fi ajutat. «Te-am ajutat» — факт, «te-aș ajutat» — неправильная форма." },
    { type: "order", words: ["Ar", "fi", "trebuit", "să", "mă", "suni"], ru: "Тебе следовало мне позвонить.",
      explain: "Упрёк: ar fi trebuit + să + conjunctiv (mă suni)." }
  ]
});
