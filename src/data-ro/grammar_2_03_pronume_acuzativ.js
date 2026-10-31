DE.grammar.push({
  id: "pronume_acuzativ",
  title: "Местоимения в винительном (mă, te, îl, o…)",
  level: "A2",
  emoji: "👉",
  summary: "Te iubesc, Îl cunosc, L-am văzut, am văzut-o; ударные: pe mine, cu tine",
  content: `<p>У румынских местоимений в винительном падеже (меня, тебя, его…) есть <b>две формы</b>: короткая (безударная) — стоит перед глаголом всегда, и ударная — для акцента и после предлогов.</p>

<table>
<tr><th>Кого?</th><th>Короткая</th><th>Ударная</th></tr>
<tr><td>меня</td><td><b>mă</b> (m-)</td><td>pe mine</td></tr>
<tr><td>тебя</td><td><b>te</b></td><td>pe tine</td></tr>
<tr><td>его</td><td><b>îl</b> (l-)</td><td>pe el</td></tr>
<tr><td>её</td><td><b>o</b></td><td>pe ea</td></tr>
<tr><td>нас</td><td><b>ne</b></td><td>pe noi</td></tr>
<tr><td>вас</td><td><b>vă</b> (v-)</td><td>pe voi / pe dumneavoastră</td></tr>
<tr><td>их (м.)</td><td><b>îi</b> (i-)</td><td>pe ei</td></tr>
<tr><td>их (ж.)</td><td><b>le</b></td><td>pe ele</td></tr>
</table>

<h3>Где стоит короткая форма</h3>
<p>Перед глаголом, после nu: <b>Te iubesc. Nu te înțeleg. Îl cunosc.</b> Короткую форму нельзя опустить, даже если есть ударная: <b>Te iubesc pe tine</b> (а не «Iubesc pe tine»).</p>
<div class="tip">Фраза <b>Mă cheamă Ana</b> устроена точно как русская «<i>Меня</i> зовут Ана»! А <b>Cum te cheamă?</b> — «Как тебя зовут?»</div>

<h3>В perfect compus — со вспомогательным глаголом через дефис</h3>
<table>
<tr><th>Пример</th><th>Перевод</th></tr>
<tr><td><b>M-a</b> văzut.</td><td>Он меня видел.</td></tr>
<tr><td><b>Te-am</b> sunat.</td><td>Я тебе звонил.</td></tr>
<tr><td><b>L-am</b> întâlnit.</td><td>Я его встретил.</td></tr>
<tr><td>Am văzut<b>-o</b>.</td><td>Я её видел. (o — после причастия!)</td></tr>
<tr><td><b>Ne-a</b> invitat.</td><td>Он нас пригласил.</td></tr>
<tr><td><b>V-am</b> așteptat.</td><td>Я вас ждал.</td></tr>
<tr><td><b>I-am</b> văzut. / <b>Le-am</b> văzut.</td><td>Я их видел (м. / ж.).</td></tr>
</table>
<div class="warn">Единственный «бунтарь» — <b>o</b>: она встаёт <b>после</b> причастия: <b>am văzut-o</b>, <b>a sunat-o</b>. Все остальные — перед: <b>l-am văzut</b>.</div>

<h3>Ударная форма</h3>
<p>Для акцента или противопоставления: <b>Pe tine te aștept, nu pe el.</b> После любых предлогов: <b>cu mine</b>, <b>pentru tine</b>, <b>fără el</b>, <b>despre ea</b>, <b>la noi</b>.</p>
<div class="ex"><b>Nu mă cunoaște nimeni aici.</b> — Меня здесь никто не знает.</div>
<div class="ex"><b>Vii cu mine?</b> — Пойдёшь со мной?</div>
<div class="ex"><b>Unde sunt copiii? — Nu i-am văzut.</b> — Где дети? — Я их не видел.</div>
<div class="ex"><b>Vă aștept la ora cinci.</b> — Жду вас в пять часов.</div>`,
  exercises: [
    { type: "choice", q: "Ana ___ sună în fiecare zi. (меня)", options: ["mă", "mine", "îmi"], a: 0,
      explain: "Перед глаголом — короткая форма винительного: mă. Mine — только с pe или предлогом, îmi — дательный." },
    { type: "choice", q: "___ cunosc pe Maria.", options: ["O", "Îl", "Le"], a: 0,
      explain: "Maria — она (ж. р., ед. ч.): короткая форма o." },
    { type: "input", q: "Nu ___ înțeleg. (тебя)", a: ["te"],
      explain: "«Тебя» перед глаголом — te; nu стоит перед местоимением: Nu te înțeleg." },
    { type: "input", q: "Mergi cu ___ la film? (я)", a: ["mine"],
      explain: "После предлога cu — ударная форма: cu mine (со мной)." },
    { type: "choice", q: "___ văzut ieri. (я его)", options: ["L-am", "Îl am", "Am îl"], a: 0,
      explain: "Перед am форма îl сокращается до l- и пишется через дефис: L-am văzut." },
    { type: "choice", q: "Pe Maria ___ ieri. (я её видел)", options: ["am văzut-o", "o am văzut", "am o văzut"], a: 0,
      explain: "Местоимение o в perfect compus ставится после причастия: am văzut-o." },
    { type: "choice", q: "___ aștept la ora cinci. (вас)", options: ["Vă", "Voi", "Pe voi"], a: 0,
      explain: "Перед глаголом — короткая форма vă. Pe voi без vă не употребляется." },
    { type: "input", q: "Copiii sunt în parc. ___ văd. (их, м. р.)", a: ["îi"],
      explain: "«Их» о мужском роде или смешанной группе — îi: Îi văd." },
    { type: "input", q: "Fetele sunt aici. ___ vezi? (их, ж. р.)", a: ["le"],
      explain: "«Их» о женском роде — le: Le vezi?" },
    { type: "order", words: ["Te", "iubesc", "pe", "tine"], ru: "Я люблю (именно) тебя.",
      alts: [["pe", "tine", "Te", "iubesc"]],
      explain: "Ударная форма pe tine добавляет акцент, но короткая te остаётся. Возможно и Pe tine te iubesc." },
    { type: "order", words: ["Nu", "mă", "cunoaște", "nimeni"], ru: "Меня никто не знает.",
      alts: [["nimeni", "Nu", "mă", "cunoaște"]],
      explain: "Блок nu + mă + глагол неразрывен; nimeni может стоять в конце или в начале: Nimeni nu mă cunoaște." },
    { type: "order", words: ["Ne", "așteaptă", "la", "gară"], ru: "Он ждёт нас на вокзале.",
      alts: [["la", "gară", "Ne", "așteaptă"]],
      explain: "Ne (нас) стоит прямо перед глаголом; обстоятельство la gară можно вынести вперёд." },
    { type: "choice", q: "Cum ___ cheamă? (тебя)", options: ["te", "tu", "îți"], a: 0,
      explain: "Как в русском «как тебя зовут» — винительный: te. Tu — именительный, îți — дательный." },
    { type: "input", q: "Vorbim despre ___. (он)", a: ["el"],
      explain: "После предлога despre — ударная форма: despre el (о нём)." }
  ]
});
