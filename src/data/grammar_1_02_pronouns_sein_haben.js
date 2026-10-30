DE.grammar.push({
  id: "pronouns_sein_haben",
  title: "Личные местоимения, sein и haben",
  level: "A1",
  emoji: "👤",
  summary: "ich, du, er… — ich bin, ich habe: два главных глагола",
  content: `<p>В русском мы говорим «Я студент» — без глагола. В немецком так нельзя: глагол <b>sein</b> (быть) нужен всегда. А «у меня есть» по-немецки — просто <b>ich habe</b> (я имею).</p>

<h3>Местоимения и спряжение</h3>
<table>
<tr><th>Лицо</th><th>Местоимение</th><th>sein (быть)</th><th>haben (иметь)</th></tr>
<tr><td>я</td><td><b>ich</b></td><td>bin</td><td>habe</td></tr>
<tr><td>ты</td><td><b>du</b></td><td>bist</td><td>hast</td></tr>
<tr><td>он / она / оно</td><td><b>er / sie / es</b></td><td>ist</td><td>hat</td></tr>
<tr><td>мы</td><td><b>wir</b></td><td>sind</td><td>haben</td></tr>
<tr><td>вы (группа «ты»)</td><td><b>ihr</b></td><td>seid</td><td>habt</td></tr>
<tr><td>они</td><td><b>sie</b></td><td>sind</td><td>haben</td></tr>
<tr><td>Вы (вежливо)</td><td><b>Sie</b></td><td>sind</td><td>haben</td></tr>
</table>

<div class="ex"><b>Ich bin Student.</b> — Я студент. (артикль перед профессией не нужен)</div>
<div class="ex"><b>Wir sind aus Russland.</b> — Мы из России.</div>
<div class="ex"><b>Hast du Zeit?</b> — У тебя есть время?</div>
<div class="ex"><b>Er hat Hunger.</b> — Он голоден. (дословно: «он имеет голод»)</div>

<h3>du, ihr или Sie?</h3>
<ul>
<li><b>du</b> — друзьям, родным, детям, коллегам «на ты».</li>
<li><b>ihr</b> — нескольким людям, с которыми вы «на ты».</li>
<li><b>Sie</b> (всегда с большой буквы!) — вежливо одному или нескольким: «Вы».</li>
</ul>

<h3>er, sie, es — и для вещей</h3>
<p>Местоимение выбирается по <b>роду слова</b>, а не по смыслу: der Tisch → <b>er</b>, die Lampe → <b>sie</b>, das Buch → <b>es</b>. Даже das Kind и das Mädchen → <b>es</b>.</p>
<div class="ex"><b>Der Tisch ist groß. Er ist neu.</b> — Стол большой. Он новый.</div>

<div class="tip">Три «sie» не страшны — подсказывает глагол: <span class="hl">sie ist</span> — она есть; <span class="hl">sie sind</span> — они есть; <span class="hl">Sie sind</span> — Вы есть (с большой буквы). В начале предложения помогает только контекст.</div>

<div class="warn">Не путайте: <b>ihr seid</b> (вы есть) и <b>ihr habt</b> (у вас есть). «seid» пишется через <b>d</b> — в отличие от <b>seit</b> («с, начиная с»).</div>`,
  exercises: [
    { type: "choice", q: "Ich ___ Anna.", options: ["bin", "ist", "bist"], a: 0,
      explain: "ich → bin: Ich bin Anna. ist — для er/sie/es, bist — для du." },
    { type: "choice", q: "Du ___ sehr nett.", options: ["bist", "ist", "seid"], a: 0,
      explain: "du → bist: Du bist sehr nett. seid — форма для ihr, ist — для er/sie/es." },
    { type: "input", q: "Wir ___ aus Russland. (sein)", a: ["sind"],
      explain: "wir → sind: Wir sind aus Russland. Та же форма у sie (они) и Sie (Вы)." },
    { type: "choice", q: "Er ___ ein Auto.", options: ["habt", "hat", "hast"], a: 1,
      explain: "er/sie/es → hat. hast — для du, habt — для ihr." },
    { type: "input", q: "Ihr ___ Hunger. (haben)", a: ["habt"],
      explain: "ihr → habt: Ihr habt Hunger (у вас голод = вы голодны). Не путайте с seid (sein)." },
    { type: "choice", q: "Как вежливо обратиться к незнакомому человеку («Вы»)?", options: ["ihr", "Sie", "du"], a: 1,
      explain: "Вежливое «Вы» — Sie, всегда с большой буквы. ihr — «вы» для нескольких друзей." },
    { type: "order", words: ["Ich", "bin", "Student"], ru: "Я студент.",
      explain: "В немецком глагол sein обязателен. Артикль перед профессией не ставится." },
    { type: "choice", q: "Maria? Sie ___ Lehrerin. (она)", options: ["sind", "ist", "bist"], a: 1,
      explain: "sie (она) → ist. sind было бы для sie (они) или Sie (Вы)." },
    { type: "choice", q: "Anna und Tom? Sie ___ Freunde. (они)", options: ["ist", "sind", "seid"], a: 1,
      explain: "sie (они) → sind. ist — для sie (она), seid — для ihr." },
    { type: "input", q: "Hast du Zeit? — Ja, ich ___ Zeit. (haben)", a: ["habe"],
      explain: "ich → habe: в ответе на «Hast du…?» говорим о себе — ich habe. hast — это форма для du." },
    { type: "input", q: "Der Tisch ist groß. ___ ist neu. (впишите личное местоимение)", a: ["er"],
      explain: "der Tisch — мужской род → er, даже если речь о предмете. «Es» здесь ошибка: род определяет артикль der." },
    { type: "choice", q: "Das Kind ist klein. ___ ist drei Jahre alt.", options: ["Er", "Sie", "Es"], a: 2,
      explain: "das Kind — средний род → es. Местоимение выбирается по роду слова, а не по полу ребёнка." },
    { type: "order", words: ["Hast", "du", "heute", "Zeit"], ru: "У тебя сегодня есть время?",
      explain: "В вопросе без вопросительного слова глагол стоит на первом месте." },
    { type: "input", q: "___ seid sehr freundlich. (вы — группа друзей)", a: ["ihr"],
      explain: "seid — форма глагола sein для ihr (вы — несколько друзей). Для Sie было бы sind." }
  ]
});
