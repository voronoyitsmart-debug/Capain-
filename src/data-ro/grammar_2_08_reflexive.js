DE.grammar.push({
  id: "reflexive",
  title: "Возвратные глаголы (mă spăl, îmi amintesc)",
  level: "A2",
  emoji: "🪞",
  summary: "a se spăla: mă spăl, te speli…; a-și aminti: îmi amintesc; m-am spălat",
  content: `<p>Русское <i>-ся</i> в румынском — отдельное местоимение <b>перед глаголом</b>, и оно меняется по лицам: «я моюсь» = <b>mă spăl</b>, «ты моешься» = <b>te speli</b>. В словаре такие глаголы пишутся с <b>se</b> или <b>-și</b>: a se spăla, a-și aminti.</p>

<h3>Два типа</h3>
<table>
<tr><th>Лицо</th><th>a se spăla (мыться)</th><th>a-și aminti (вспоминать)</th></tr>
<tr><td>eu</td><td><b>mă</b> spăl</td><td><b>îmi</b> amintesc</td></tr>
<tr><td>tu</td><td><b>te</b> speli</td><td><b>îți</b> amintești</td></tr>
<tr><td>el / ea</td><td><b>se</b> spală</td><td><b>își</b> amintește</td></tr>
<tr><td>noi</td><td><b>ne</b> spălăm</td><td><b>ne</b> amintim</td></tr>
<tr><td>voi</td><td><b>vă</b> spălați</td><td><b>vă</b> amintiți</td></tr>
<tr><td>ei / ele</td><td><b>se</b> spală</td><td><b>își</b> amintesc</td></tr>
</table>
<p>Тип <b>se</b> (винительный): a se trezi, a se îmbrăca, a se grăbi, a se simți, a se întâlni, a se uita, a se numi. Тип <b>-și</b> (дательный, «себе»): a-și aminti, a-și dori, a-și imagina, a-și cumpăra (себе), a-și face temele.</p>

<h3>Perfect compus</h3>
<table>
<tr><th>a se trezi</th><th>a-și aminti</th></tr>
<tr><td><b>m-am</b> trezit</td><td><b>mi-am</b> amintit</td></tr>
<tr><td><b>te-ai</b> trezit</td><td><b>ți-ai</b> amintit</td></tr>
<tr><td><b>s-a</b> trezit</td><td><b>și-a</b> amintit</td></tr>
<tr><td><b>ne-am</b> trezit</td><td><b>ne-am</b> amintit</td></tr>
<tr><td><b>v-ați</b> trezit</td><td><b>v-ați</b> amintit</td></tr>
<tr><td><b>s-au</b> trezit</td><td><b>și-au</b> amintit</td></tr>
</table>

<h3>Порядок слов</h3>
<p>Местоимение — перед глаголом: <b>Nu mă simt bine.</b> После să: <b>Trebuie să mă trezesc devreme.</b> В утвердительном повелительном — после, через дефис: <b>Spală-te! Grăbește-te!</b></p>

<div class="warn">Возвратность в русском и румынском совпадает не всегда! <b>a se uita</b> — смотреть, <b>a se gândi</b> — думать, <b>a se duce</b> — идти (уходить) — возвратные, а «смеяться» — <b>a râde</b>, «улыбаться» — <b>a zâmbi</b> — нет.</div>

<div class="ex"><b>Mă trezesc la șapte și mă spăl.</b> — Я просыпаюсь в семь и умываюсь.</div>
<div class="ex"><b>Cum te numești? — Mă numesc Ion.</b> — Как тебя зовут? — Меня зовут Ион.</div>
<div class="ex"><b>Ne întâlnim la cafenea.</b> — Встречаемся в кафе.</div>
<div class="ex"><b>Nu-mi amintesc numele lui.</b> — Я не помню, как его зовут.</div>

<div class="tip">Проверка «себя или себе?»: если по-русски можно сказать «мою <i>себя</i>» — тип se (mă spăl); если «желаю <i>себе</i>, покупаю <i>себе</i>» — тип -și (îmi doresc, îmi cumpăr).</div>`,
  exercises: [
    { type: "choice", q: "Dimineața ___ spăl pe față.", options: ["mă", "te", "se"], a: 0,
      explain: "Глагол spăl — форма eu, значит возвратное местоимение mă: mă spăl." },
    { type: "choice", q: "El ___ trezește la șapte.", options: ["se", "îl", "își"], a: 0,
      explain: "a se trezi в 3-м лице: se trezește. Îl — «его» (другого человека), își — дательный тип." },
    { type: "input", q: "Noi ___ întâlnim la cafenea.", a: ["ne"],
      explain: "Для noi возвратное местоимение — ne: ne întâlnim." },
    { type: "input", q: "Cum ___ numești? (ты)", a: ["te"],
      explain: "a se numi, лицо tu: te numești." },
    { type: "choice", q: "___ amintesc de vacanță. (я)", options: ["Îmi", "Mă", "Mie"], a: 0,
      explain: "a-și aminti — дательный тип: îmi amintesc." },
    { type: "choice", q: "Ea ___ dorește o mașină nouă.", options: ["își", "se", "îi"], a: 0,
      explain: "a-și dori («желать себе») — в 3-м лице își: își dorește. Îi значило бы «ей/ему» (другому)." },
    { type: "choice", q: "Ieri ___ trezit târziu. (я)", options: ["m-am", "mă am", "am mă"], a: 0,
      explain: "В perfect compus mă + am сливаются: m-am trezit." },
    { type: "input", q: "Ei ___ îmbrăcat repede. (они)", a: ["s-au"],
      explain: "se + au → s-au: s-au îmbrăcat." },
    { type: "choice", q: "___ amintit de mine? (ты)", options: ["Ți-ai", "Te-ai", "Îți ai"], a: 0,
      explain: "a-și aminti — дательный тип: îți + ai → ți-ai amintit." },
    { type: "order", words: ["Mă", "grăbesc", "la", "serviciu"], ru: "Я спешу на работу.",
      explain: "Возвратное местоимение mă стоит прямо перед глаголом: mă grăbesc." },
    { type: "order", words: ["Trebuie", "să", "ne", "odihnim"], ru: "Нам нужно отдохнуть.",
      explain: "После să возвратное местоимение идёт перед глаголом: să ne odihnim." },
    { type: "choice", q: "Copiii ___ uită la televizor.", options: ["se", "își", "îi"], a: 0,
      explain: "a se uita (смотреть) — тип se: copiii se uită." },
    { type: "input", q: "Spală-___ pe mâini! (ты)", a: ["te"],
      explain: "В утвердительном повелительном местоимение ставится после глагола через дефис: spală-te!" },
    { type: "choice", q: "Voi ___ simțiți bine?", options: ["vă", "ne", "se"], a: 0,
      explain: "Для voi возвратное местоимение — vă: vă simțiți." }
  ]
});
