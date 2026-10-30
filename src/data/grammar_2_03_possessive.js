DE.grammar.push({
  id: "possessive",
  title: "Притяжательные местоимения",
  level: "A2",
  emoji: "👪",
  summary: "mein, dein, sein, ihr, unser, euer, Ihr — в Nom, Akk и Dat",
  content: `<p>Притяжательные местоимения отвечают на вопрос «чей?». Сначала выбираем <b>слово по владельцу</b>, потом ставим <b>окончание по предмету</b> — так же, как у артикля <b>ein/kein</b>.</p>

<h3>Шаг 1: кто владелец?</h3>
<table>
<tr><th>Лицо</th><th>Местоимение</th><th>Перевод</th></tr>
<tr><td>ich</td><td><b>mein</b></td><td>мой</td></tr>
<tr><td>du</td><td><b>dein</b></td><td>твой</td></tr>
<tr><td>er / es</td><td><b>sein</b></td><td>его</td></tr>
<tr><td>sie (она)</td><td><b>ihr</b></td><td>её</td></tr>
<tr><td>wir</td><td><b>unser</b></td><td>наш</td></tr>
<tr><td>ihr (вы, мн.)</td><td><b>euer</b></td><td>ваш</td></tr>
<tr><td>sie (они)</td><td><b>ihr</b></td><td>их</td></tr>
<tr><td>Sie (Вы)</td><td><b>Ihr</b></td><td>Ваш</td></tr>
</table>

<h3>Шаг 2: окончание по предмету (на примере mein)</h3>
<table>
<tr><th></th><th>m</th><th>f</th><th>n</th><th>Pl</th></tr>
<tr><td>Nom</td><td>mein</td><td>mein<b>e</b></td><td>mein</td><td>mein<b>e</b></td></tr>
<tr><td>Akk</td><td>mein<b>en</b></td><td>mein<b>e</b></td><td>mein</td><td>mein<b>e</b></td></tr>
<tr><td>Dat</td><td>mein<b>em</b></td><td>mein<b>er</b></td><td>mein<b>em</b></td><td>mein<b>en</b> …n</td></tr>
</table>
<p>Те же окончания у всех: dein<b>en</b>, sein<b>em</b>, ihr<b>er</b>, unser<b>e</b>…</p>

<div class="warn"><b>euer</b> теряет -e-, если есть окончание: eu<b>re</b> Mutter, eu<b>ren</b> Vater, eu<b>rem</b> Kind. Но: euer Haus (без окончания).</div>

<div class="ex"><b>Das ist mein Bruder und das ist meine Schwester.</b> — Это мой брат, а это моя сестра.</div>
<div class="ex"><b>Ich suche meinen Schlüssel.</b> — Я ищу свой ключ. (der Schlüssel → Akk: meinen)</div>
<div class="ex"><b>Er spricht mit seiner Mutter.</b> — Он разговаривает со своей мамой. (mit + Dat, f → seiner)</div>
<div class="ex"><b>Frau Weber, ist das Ihr Koffer?</b> — Госпожа Вебер, это Ваш чемодан?</div>

<div class="tip">В немецком <b>нет слова «свой»</b>! Вместо него — местоимение владельца:<br>
Он любит <i>свою</i> маму → Er liebt <b>seine</b> Mutter.<br>
Она любит <i>свою</i> маму → Sie liebt <b>ihre</b> Mutter.<br>
Мы любим <i>свою</i> маму → Wir lieben <b>unsere</b> Mutter.</div>

<p>Слово <b>ihr</b> многозначно: «её», «их», а с большой буквы <b>Ihr</b> — «Ваш». Смысл понятен из контекста: <i>Anna und ihr Mann</i> (Анна и её муж), <i>die Kinder und ihre Eltern</i> (дети и их родители).</p>`,
  exercises: [
    { type: "choice", q: "Das ist ___ Bruder. (ich)", options: ["mein", "meine", "meinen"], a: 0,
      explain: "der Bruder, Nominativ (Das ist …), мужской род → mein без окончания. meinen — Akkusativ, meine — женский род." },
    { type: "choice", q: "Anna sucht ___ Schlüssel. (der Schlüssel)", options: ["ihr", "ihren", "seinen"], a: 1,
      explain: "Владелец — Anna (она) → ihr; der Schlüssel в Akkusativ (suchen + Akk) → ihren. seinen — если бы владелец был мужчиной." },
    { type: "input", q: "Peter ruft ___ Mutter an. (его)", a: ["seine"],
      explain: "Владелец — Peter → sein; die Mutter — женский род, Akkusativ → seine." },
    { type: "choice", q: "Wir besuchen ___ Großeltern.", options: ["unser", "unsere", "unseren"], a: 1,
      explain: "die Großeltern — мн. число, besuchen + Akkusativ → unsere. unseren было бы для мужского рода в Akk или Dativ мн. числа." },
    { type: "input", q: "Ist das ___ Auto? (ihr — вы, мн.)", a: ["euer"],
      explain: "das Auto, Nominativ, средний род → euer (без окончания, -e- не выпадает)." },
    { type: "choice", q: "Wo ist ___ Lehrerin? (ihr — вы, мн.)", options: ["euer", "eure", "euren"], a: 1,
      explain: "die Lehrerin → окончание -e, и euer теряет -e-: eure." },
    { type: "input", q: "Ich helfe ___ Vater. (mein)", a: ["meinem"],
      explain: "helfen + Dativ, мужской род → meinem." },
    { type: "choice", q: "Sie spricht mit ___ Schwester. (её)", options: ["ihre", "ihrer", "seiner"], a: 1,
      explain: "mit + Dativ, die Schwester — женский род → ihrer. seiner — если бы речь шла о его сестре." },
    { type: "order", words: ["Das", "ist", "unser", "Haus"], ru: "Это наш дом.",
      explain: "das Haus, Nominativ (Das ist …), средний род → unser без окончания." },
    { type: "choice", q: "Herr Müller, ist das ___ Koffer? (Ваш)", options: ["Ihr", "dein", "Ihren"], a: 0,
      explain: "К господину Мюллеру обращаются на Sie → Ihr (с большой буквы); der Koffer после «ist das» — Nominativ, без окончания. Ihren — Akkusativ, dein — на «ты»." },
    { type: "input", q: "Die Kinder spielen mit ___ Freunden. (их)", a: ["ihren"],
      explain: "Владельцы — die Kinder (они) → ihr; mit + Dativ мн. ч. → ihren." },
    { type: "order", words: ["Ich", "liebe", "meine", "Familie"], ru: "Я люблю свою семью.",
      alts: [["meine", "Familie", "liebe", "Ich"]],
      explain: "Русское «свою» переводится по владельцу: ich → meine (die Familie, Akk). «seine» здесь было бы ошибкой." },
    { type: "choice", q: "Er gibt ___ Kind ein Eis. (его)", options: ["seinem", "seinen", "sein"], a: 0,
      explain: "Кому? — Dativ, das Kind — средний род → seinem. ein Eis — что? (Akkusativ)." },
    { type: "input", q: "Hast du ___ Handy? (твой; das Handy)", a: ["dein"],
      explain: "das Handy — средний род, в Akkusativ не меняется → dein (без окончания)." }
  ]
});
