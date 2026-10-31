DE.grammar.push({
  id: "nehotarate_negative",
  title: "Неопределённые и отрицательные местоимения (cineva, nimeni, nimic…)",
  level: "B1",
  emoji: "❓",
  summary: "cineva, ceva, nimeni, nimic, niciodată — и двойное отрицание: Nu vine nimeni",
  content: `<p>Здесь русскоговорящим повезло: румынское отрицание устроено <b>как русское</b>. «Никто <i>не</i> пришёл» — <b>Nimeni <i>nu</i> a venit</b>. Частица <b>nu</b> обязательна, даже если уже есть «никто/ничего» (в отличие от английского).</p>
<h3>Основная таблица</h3>
<table>
<tr><th></th><th>-то / -нибудь</th><th>угодно</th><th>ни-</th></tr>
<tr><td>кто</td><td><b>cineva</b> — кто-то</td><td><b>oricine</b> — кто угодно</td><td><b>nimeni</b> — никто</td></tr>
<tr><td>что</td><td><b>ceva</b> — что-то</td><td><b>orice</b> — что угодно</td><td><b>nimic</b> — ничего</td></tr>
<tr><td>где / куда</td><td><b>undeva</b> — где-то</td><td><b>oriunde</b> — где угодно</td><td><b>nicăieri</b> — нигде, никуда</td></tr>
<tr><td>когда</td><td><b>cândva</b> — когда-то</td><td><b>oricând</b> — когда угодно</td><td><b>niciodată</b> — никогда</td></tr>
<tr><td>какой</td><td><b>vreun / vreo</b> — какой-нибудь</td><td><b>orice</b> — любой</td><td><b>niciun / nicio</b> — ни один</td></tr>
</table>
<h3>Двойное отрицание — как в русском</h3>
<div class="ex"><b>Nu vine nimeni.</b> — Никто не приходит.</div>
<div class="ex"><b>Nu știu nimic despre asta.</b> — Я ничего об этом не знаю.</div>
<div class="ex"><b>Nu am fost niciodată la Roma.</b> — Я никогда не был в Риме.</div>
<div class="ex"><b>Nu am nicio problemă.</b> — У меня нет никаких проблем.</div>
<p>Если «никто» стоит в начале, nu всё равно нужно: <i><b>Nimeni nu</b> știe.</i> — Никто не знает.</p>
<h3>Nici — «тоже не», «ни… ни»</h3>
<p><i><b>Nici</b> eu nu știu.</i> — Я тоже не знаю. <i>Nu beau <b>nici</b> cafea, <b>nici</b> ceai.</i> — Я не пью ни кофе, ни чай. И снова — с nu, как в русском.</p>
<h3>Падежи</h3>
<ul>
<li>«Кого-то / никого» с глаголом → предлог <b>pe</b>: <i>Am văzut <b>pe cineva</b>. Nu am văzut <b>pe nimeni</b>.</i></li>
<li>«Кому-то / никому» → <b>cuiva / nimănui</b>: <i>Nu spune <b>nimănui</b>!</i> — Никому не говори!</li>
</ul>
<h3>Vreun / vreo — в вопросах</h3>
<p><b>Vreun</b> (м. и ср. р.) и <b>vreo</b> (ж. р.) = «какой-нибудь»: <i>Ai <b>vreo</b> întrebare?</i> — Есть какой-нибудь вопрос? <i>Ai <b>vreun</b> frate?</i> — У тебя есть брат?</p>
<div class="warn">Пишите <b>niciun, nicio</b> слитно — это современная норма. Раздельное «nici un» встречается в старых текстах.</div>
<div class="tip">💡 Схема-шпаргалка: <b>-va</b> = «-то» (cineva, ceva, undeva, cândva), <b>ori-</b> = «угодно» (oricine, orice), <b>ni-</b> = «ни-» и всегда вместе с <b>nu</b>. Переводите с русского «слово в слово» — почти всегда получится правильно!</div>`,
  exercises: [
    { type: "choice", q: "Nimeni ___ știe răspunsul.", options: ["nu", "nici", "niciodată"], a: 0,
      explain: "Даже если nimeni стоит в начале, нужно nu: Nimeni nu știe — «Никто не знает»." },
    { type: "input", q: "Nu am văzut ___. (никого)", a: ["pe nimeni"],
      explain: "«Никого» в роли дополнения → pe nimeni (pe нужен для людей)." },
    { type: "input", q: "Nu am mâncat ___ azi. (ничего)", a: ["nimic"],
      explain: "«Ничего» = nimic, и nu обязательно остаётся." },
    { type: "choice", q: "A sunat ___? (кто-нибудь)", options: ["cineva", "nimeni", "ceva"], a: 0,
      explain: "В утвердительном вопросе «кто-нибудь» → cineva. Nimeni требует nu, ceva — «что-то»." },
    { type: "input", q: "Nu am fost ___ în Spania. (никогда)", a: ["niciodată"],
      explain: "«Никогда» = niciodată, вместе с nu — как в русском." },
    { type: "choice", q: "Ai ___ întrebare? (какой-нибудь)", options: ["vreo", "vreun", "nicio"], a: 0,
      explain: "Întrebare — ж. р. → vreo. Nicio без nu в вопросе невозможно." },
    { type: "choice", q: "Nu am ___ problemă.", options: ["nicio", "niciun", "nici o"], a: 0,
      explain: "Problemă — ж. р. → nicio, и пишется слитно (современная норма)." },
    { type: "order", words: ["Nu", "vine", "nimeni", "la", "petrecere"], ru: "На вечеринку никто не придёт.",
      alts: [["nimeni", "Nu", "vine", "la", "petrecere"], ["la", "petrecere", "Nu", "vine", "nimeni"], ["la", "petrecere", "nimeni", "Nu", "vine"], ["Nu", "vine", "la", "petrecere", "nimeni"]],
      explain: "Двойное отрицание: nu + nimeni. Nimeni можно поставить и в начало: Nimeni nu vine." },
    { type: "input", q: "Nu spune ___! (никому)", a: ["nimănui"],
      explain: "«Никому» — дательный падеж от nimeni: nimănui." },
    { type: "choice", q: "Vreau să mănânc ___ dulce.", options: ["ceva", "nimic", "cineva"], a: 0,
      explain: "«Что-нибудь сладкое» → ceva dulce. Nimic требует nu, cineva — «кто-то»." },
    { type: "order", words: ["Nu", "știu", "nimic", "despre", "asta"], ru: "Я ничего об этом не знаю.",
      alts: [["despre", "asta", "Nu", "știu", "nimic"]],
      explain: "Nu перед глаголом + nimic после него. Despre asta можно вынести вперёд." },
    { type: "input", q: "Am lăsat cheile ___, dar nu știu unde. (где-то)", a: ["undeva"],
      explain: "«Где-то» = undeva (суффикс -va = «-то»)." },
    { type: "choice", q: "Poți să mă suni ___. (когда угодно)", options: ["oricând", "niciodată", "nicăieri"], a: 0,
      explain: "«Когда угодно» → oricând (приставка ori- = «угодно»)." },
    { type: "input", q: "În weekend nu mergem ___. (никуда)", a: ["nicăieri"],
      explain: "«Никуда / нигде» = nicăieri, вместе с nu." }
  ]
});
