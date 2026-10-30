DE.grammar.push({
  id: "reflexive",
  title: "Возвратные глаголы",
  level: "A2",
  emoji: "🪞",
  summary: "sich waschen, sich freuen — mich/dich/sich и mir/dir",
  content: `<p>Возвратные глаголы — это глаголы с <b>sich</b> («себя»). В русском мы прячем «себя» в окончание <b>-ся</b>: мыться = мыть себя. В немецком «себя» — отдельное слово, и оно меняется по лицам.</p>

<h3>Возвратные местоимения</h3>
<table>
<tr><th>Лицо</th><th>Akkusativ</th><th>Dativ</th><th>Пример</th></tr>
<tr><td>ich</td><td><b>mich</b></td><td><b>mir</b></td><td>ich wasche mich</td></tr>
<tr><td>du</td><td><b>dich</b></td><td><b>dir</b></td><td>du wäschst dich</td></tr>
<tr><td>er/sie/es</td><td><b>sich</b></td><td><b>sich</b></td><td>er wäscht sich</td></tr>
<tr><td>wir</td><td><b>uns</b></td><td><b>uns</b></td><td>wir waschen uns</td></tr>
<tr><td>ihr</td><td><b>euch</b></td><td><b>euch</b></td><td>ihr wascht euch</td></tr>
<tr><td>sie/Sie</td><td><b>sich</b></td><td><b>sich</b></td><td>sie waschen sich</td></tr>
</table>
<p>Akkusativ и Dativ отличаются только у <b>ich</b> и <b>du</b>. У 3-го лица и у Sie всегда <b>sich</b> (с маленькой буквы!).</p>

<h3>mich или mir?</h3>
<table>
<tr><th>Ситуация</th><th>Форма</th><th>Пример</th></tr>
<tr><td>других дополнений нет</td><td>Akkusativ: <b>mich / dich</b></td><td>Ich wasche <b>mich</b>. — Я моюсь.</td></tr>
<tr><td>есть ещё дополнение (что именно?)</td><td>Dativ: <b>mir / dir</b></td><td>Ich wasche <b>mir</b> die Hände. — Я мою (себе) руки.</td></tr>
</table>
<div class="tip">Правило «одного места»: в предложении может быть только одно прямое дополнение в Akkusativ. Если его уже заняли <i>die Hände</i> или <i>die Zähne</i>, то «себя» уходит в Dativ: Ich putze <b>mir</b> die Zähne. Ich ziehe <b>mir</b> die Jacke an.</div>

<h3>Частые возвратные глаголы</h3>
<table>
<tr><th>Глагол</th><th>Значение</th></tr>
<tr><td>sich freuen auf / über</td><td>радоваться (предстоящему / случившемуся)</td></tr>
<tr><td>sich interessieren für</td><td>интересоваться</td></tr>
<tr><td>sich treffen</td><td>встречаться</td></tr>
<tr><td>sich fühlen</td><td>чувствовать себя</td></tr>
<tr><td>sich beeilen</td><td>торопиться</td></tr>
<tr><td>sich anziehen / sich setzen</td><td>одеваться / садиться</td></tr>
<tr><td>sich erinnern an</td><td>вспоминать, помнить</td></tr>
<tr><td>sich ausruhen / sich entschuldigen</td><td>отдыхать / извиняться</td></tr>
</table>

<div class="warn">Не всё «-ся» = sich! учиться — <b>lernen</b>, смеяться — <b>lachen</b>, начинаться — <b>anfangen</b> (Der Film fängt an). И наоборот: отдыхать — <b>sich ausruhen</b>, представлять себе — <b>sich vorstellen</b>.</div>

<p>Место sich — сразу после спрягаемого глагола; при обратном порядке — после местоимения-подлежащего:</p>
<div class="ex"><b>Ich freue mich auf den Urlaub.</b> — Я с нетерпением жду отпуска.</div>
<div class="ex"><b>Heute ziehe ich mich warm an.</b> — Сегодня я оденусь тепло.</div>
<div class="ex"><b>Wir treffen uns um acht vor dem Kino.</b> — Мы встречаемся в восемь перед кинотеатром.</div>
<div class="ex"><b>Interessierst du dich für Fußball?</b> — Ты интересуешься футболом?</div>
<div class="ex"><b>Setzen Sie sich bitte!</b> — Садитесь, пожалуйста!</div>`,
  exercises: [
    { type: "choice", q: "Ich wasche ___ jeden Morgen.", options: ["mich", "mir", "sich"], a: 0,
      explain: "Других дополнений нет → возвратное местоимение в Akkusativ: mich. sich — только для er/sie/es/sie/Sie." },
    { type: "choice", q: "Ich wasche ___ die Hände.", options: ["mich", "mir", "sich"], a: 1,
      explain: "Akkusativ уже занят (die Hände — что мою?) → «себе» в Dativ: mir." },
    { type: "input", q: "Er freut ___ auf den Urlaub. (возвратное местоимение)", a: ["sich"],
      explain: "sich freuen auf + Akk; для 3-го лица (er) возвратное местоимение — sich." },
    { type: "input", q: "Wir treffen ___ um acht. (встречаемся — возвратное местоимение)", a: ["uns"],
      explain: "sich treffen (встречаться); для wir возвратное местоимение — uns. sich — только для 3-го лица и Sie." },
    { type: "choice", q: "Interessierst du ___ für Musik?", options: ["dich", "dir", "sich"], a: 0,
      explain: "sich interessieren für + Akk; других дополнений в Akk нет → du → dich. dir — Dativ, sich — 3-е лицо." },
    { type: "order", words: ["Ich", "ziehe", "mich", "schnell", "an"], ru: "Я быстро одеваюсь.",
      alts: [["schnell", "ziehe", "Ich", "mich", "an"]],
      explain: "sich anziehen: mich сразу после глагола (и подлежащего), приставка an — в конце." },
    { type: "choice", q: "Kannst du ___ das vorstellen?", options: ["dich", "dir", "sich"], a: 1,
      explain: "sich etwas vorstellen (представлять себе что-то): «что» = das (Akk), поэтому «себе» — Dativ: dir." },
    { type: "input", q: "Beeilt ___! Der Zug fährt gleich ab. (ihr)", a: ["euch"],
      explain: "Императив для ihr: Beeilt euch! Возвратное местоимение для ihr — euch." },
    { type: "choice", q: "Herr Braun, setzen Sie ___ bitte!", options: ["sich", "Sie", "Ihnen"], a: 0,
      explain: "Вежливая форма: Sie … sich (с маленькой буквы). «Setzen Sie Sie» — ошибка: возвратное местоимение для Sie — sich." },
    { type: "order", words: ["Ich", "freue", "mich", "auf", "das", "Wochenende"], ru: "Я жду не дождусь выходных.",
      alts: [["auf", "das", "Wochenende", "freue", "Ich", "mich"]],
      explain: "sich freuen auf + Akk — радоваться предстоящему. Глагол freue на 2-м месте, mich сразу после ich." },
    { type: "input", q: "Du putzt ___ die Zähne. (себе)", a: ["dir"],
      explain: "Есть дополнение die Zähne (Akk) → «себе» в Dativ: dir, а не dich." },
    { type: "choice", q: "Wie fühlst du ___ heute?", options: ["dir", "dich", "sich"], a: 1,
      explain: "sich fühlen — другого Akk-дополнения нет → du → dich. dir было бы, если бы Akkusativ был занят." },
    { type: "order", words: ["Erinnerst", "du", "dich", "an", "mich"], ru: "Ты меня помнишь?",
      explain: "sich erinnern an + Akk (an mich); в вопросе да/нет глагол erinnerst на 1-м месте, dich — после du." },
    { type: "choice", q: "Die Kinder ärgern ___ über das Wetter.", options: ["sich", "ihnen", "ihr"], a: 0,
      explain: "die Kinder = sie (они) → возвратное sich. ihnen — Dativ личного местоимения, не возвратное." }
  ]
});
