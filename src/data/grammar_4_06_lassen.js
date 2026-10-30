DE.grammar.push({
  id: "lassen",
  title: "Глагол lassen во всех значениях",
  level: "B2",
  emoji: "✂️",
  summary: "оставлять, позволять, поручать (Ich lasse mein Auto reparieren), sich lassen",
  content: `<p><b>lassen</b> — один из самых многозначных глаголов. Он сильный: <i>lassen – ließ – hat gelassen</i>. В Präsens меняется гласная: <b>du lässt, er lässt</b>.</p>
<table>
<tr><th>Präsens</th><th>Präteritum</th></tr>
<tr><td>ich lasse</td><td>ich ließ</td></tr>
<tr><td>du lässt</td><td>du ließest</td></tr>
<tr><td>er/sie/es lässt</td><td>er ließ</td></tr>
<tr><td>wir lassen</td><td>wir ließen</td></tr>
<tr><td>ihr lasst</td><td>ihr ließt</td></tr>
<tr><td>sie/Sie lassen</td><td>sie ließen</td></tr>
</table>
<h3>Значения</h3>
<table>
<tr><th>Значение</th><th>Пример</th><th>Перевод</th></tr>
<tr><td>1. оставлять</td><td>Ich <b>lasse</b> den Schlüssel zu Hause.</td><td>Я оставляю ключ дома.</td></tr>
<tr><td>2. позволять</td><td>Die Eltern <b>lassen</b> das Kind lange fernsehen.</td><td>Родители разрешают ребёнку долго смотреть телевизор.</td></tr>
<tr><td>3. поручать (делать не самому)</td><td>Ich <b>lasse</b> mein Auto reparieren.</td><td>Я отдаю машину в ремонт.</td></tr>
<tr><td>4. давай (lass uns)</td><td><b>Lass uns</b> gehen!</td><td>Давай пойдём!</td></tr>
<tr><td>5. перестать, бросить</td><td><b>Lass</b> das! Er kann das Rauchen nicht <b>lassen</b>.</td><td>Прекрати! Он не может бросить курить.</td></tr>
<tr><td>6. sich lassen = «можно»</td><td>Das <b>lässt sich</b> machen.</td><td>Это можно сделать.</td></tr>
</table>
<h3>«Поручать» с собой: lassen + mir/mich</h3>
<p>Если что-то делают <b>с вами</b> или <b>для вас</b>, добавляйте возвратное местоимение:</p>
<div class="ex"><b>Ich lasse mir die Haare schneiden.</b> — Я стригусь (в парикмахерской).</div>
<div class="ex"><b>Er lässt sich einen Anzug machen.</b> — Ему шьют костюм на заказ.</div>
<h3>Perfekt: gelassen или lassen?</h3>
<p>Это ключевой момент! Если рядом есть <b>другой инфинитив</b> — используется <b>двойной инфинитив</b> (Ersatzinfinitiv), как у модальных глаголов.</p>
<table>
<tr><th>Без инфинитива</th><th>С инфинитивом</th></tr>
<tr><td>Ich habe den Schirm im Büro <b>gelassen</b>.</td><td>Ich habe mein Auto reparieren <b>lassen</b>.</td></tr>
<tr><td>Er hat mich in Ruhe <b>gelassen</b>.</td><td>Er hat mich lange warten <b>lassen</b>.</td></tr>
</table>
<p>В придаточном вспомогательный глагол встаёт <b>перед</b> двумя инфинитивами:</p>
<div class="ex"><b>…, weil ich mein Fahrrad habe reparieren lassen.</b> — …, потому что я отдал велосипед в ремонт.</div>
<div class="warn">Русское «я подстригся» почти всегда по-немецки <b>Ich habe mir die Haare schneiden lassen</b>. Фраза <i>Ich habe mir die Haare geschnitten</i> значит, что вы стриглись сами!</div>
<div class="tip">После <b>lassen</b> инфинитив идёт <b>без zu</b>, как после модальных глаголов. Запомните: lassen ведёт себя как «почти модальный» глагол — и в Perfekt тоже (habe … machen <b>lassen</b>).</div>`,
  exercises: [
    { type: "choice", q: "Ich ___ mir morgen die Haare schneiden.", options: ["lasse", "lässt", "lassen"], a: 0,
      explain: "Подлежащее ich → lasse. mir показывает, что стригут меня (в парикмахерской). «lässt» — форма du/er, «lassen» — wir/sie." },
    { type: "input", q: "Er ___ sein Handy oft im Auto liegen. (lassen, Präsens)", a: ["lässt", "laesst"],
      explain: "lassen меняет гласную в du/er: er lässt. Здесь значение «оставлять»: оставляет телефон лежать в машине." },
    { type: "choice", q: "Ich habe mein Fahrrad reparieren ___.", options: ["gelassen", "lassen", "lässt"], a: 1,
      explain: "Рядом есть другой инфинитив (reparieren) → двойной инфинитив: habe … reparieren lassen. «gelassen» — только когда второго инфинитива нет." },
    { type: "choice", q: "Ich habe meinen Regenschirm im Büro ___.", options: ["gelassen", "lassen", "gelasst"], a: 0,
      explain: "Второго инфинитива нет, значение «оставил» → обычное Partizip II gelassen. «gelasst» — неверная форма." },
    { type: "order", words: ["Lass", "uns", "ins", "Kino", "gehen"], ru: "Давай пойдём в кино.",
      explain: "Lass uns + инфинитив в конце = «давай(те) …». Инфинитив gehen без zu." },
    { type: "choice", q: "Что значит lassen в предложении „Meine Eltern lassen mich bis Mitternacht ausgehen.“?", options: ["разрешают", "заставляют", "оставляют"], a: 0,
      explain: "lassen + человек + инфинитив здесь = позволять: родители разрешают мне гулять до полуночи. Заставлять — zwingen." },
    { type: "input", q: "Das Problem lässt ___ leicht lösen.", a: ["sich"],
      explain: "sich lassen + инфинитив = «можно»: Das Problem lässt sich lösen = проблему можно решить." },
    { type: "order", words: ["Wir", "lassen", "unser", "Haus", "renovieren"], ru: "Мы делаем ремонт дома (силами мастеров).",
      alts: [["unser", "Haus", "lassen", "Wir", "renovieren"]],
      explain: "lassen + инфинитив = поручить работу другим. lassen на 2-м месте, renovieren — в конце." },
    { type: "choice", q: "___ mich in Ruhe! (обращение к одному другу)", options: ["Lass", "Lässt", "Lassen"], a: 0,
      explain: "Императив для du — lass (без умлаута и без -t). «Lassen» — только с Sie (Lassen Sie mich…)." },
    { type: "input", q: "Gestern ___ ich mein Auto waschen. (lassen, Präteritum)", a: ["ließ", "liess"],
      explain: "lassen — сильный глагол: Präteritum ich ließ (без окончания у ich)." },
    { type: "choice", q: "Kannst du das Rauchen nicht endlich ___?", options: ["lassen", "gelassen", "lässt"], a: 0,
      explain: "etwas lassen = бросить, перестать; после модального kannst нужен инфинитив lassen." },
    { type: "choice", q: "Er erzählt, dass er sich einen Anzug hat ___.", options: ["machen lassen", "lassen machen", "gemacht lassen"], a: 0,
      explain: "Двойной инфинитив: смысловой глагол machen, затем lassen. В придаточном hat стоит перед ними: hat machen lassen." },
    { type: "order", words: ["Der", "Lehrer", "ließ", "die", "Schüler", "früher", "nach", "Hause", "gehen"], ru: "Учитель отпустил учеников домой раньше.",
      alts: [["die", "Schüler", "ließ", "Der", "Lehrer", "früher", "nach", "Hause", "gehen"]],
      explain: "lassen = позволить: ließ на 2-м месте, инфинитив gehen — в конце. Если поставить früher на 1-е место, оно будет понято как «раньше, в прошлом»." }
  ]
});
