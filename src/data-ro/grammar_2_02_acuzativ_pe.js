DE.grammar.push({
  id: "acuzativ_pe",
  title: "Винительный падеж и предлог pe",
  level: "A2",
  emoji: "🎯",
  summary: "Văd masa, но Îl văd pe Ion: люди в винительном — с pe и местоимением-«дублем»",
  content: `<p>В русском винительный падеж виден по окончанию: <i>вижу маму, Ивана</i>. В румынском существительное в винительном (<b>acuzativ</b>) выглядит <b>так же, как в именительном</b>: <b>Văd o casă.</b> — Я вижу дом. Но если дополнение — <b>конкретный человек</b>, перед ним ставится особый маркер <b>pe</b>.</p>

<h3>Когда нужен pe</h3>
<table>
<tr><th>Дополнение</th><th>pe?</th><th>Пример</th></tr>
<tr><td>предмет</td><td>нет</td><td>Văd masa. — Я вижу стол.</td></tr>
<tr><td>человек с именем, родственник</td><td>да</td><td>Îl văd pe Ion. — Я вижу Иона.</td></tr>
<tr><td>личное местоимение</td><td>да</td><td>Te aștept pe tine. — Жду тебя.</td></tr>
<tr><td>конкретный, известный человек</td><td>да</td><td>Îl caut pe medicul meu.</td></tr>
<tr><td>любой, неконкретный человек</td><td>нет</td><td>Caut un medic. — Ищу (какого-нибудь) врача.</td></tr>
<tr><td>питомец с кличкой</td><td>да</td><td>Îl plimb pe Rex. — Гуляю с Рексом.</td></tr>
</table>

<h3>Удвоение: îl … pe Ion</h3>
<p>Вместе с <b>pe</b> перед глаголом ставится короткое местоимение, которое «повторяет» дополнение — будто мы говорим «<i>его</i> вижу, Иона». Без него фраза звучит неправильно.</p>
<table>
<tr><th>Кого?</th><th>Местоимение</th><th>Пример</th></tr>
<tr><td>его (м. р.)</td><td><b>îl</b></td><td><b>Îl</b> aștept pe Andrei.</td></tr>
<tr><td>её (ж. р.)</td><td><b>o</b></td><td><b>O</b> aștept pe Maria.</td></tr>
<tr><td>их (м. р.)</td><td><b>îi</b></td><td><b>Îi</b> aștept pe prieteni.</td></tr>
<tr><td>их (ж. р.)</td><td><b>le</b></td><td><b>Le</b> aștept pe colege.</td></tr>
</table>

<p><b>Pe cine?</b> — Кого? (о людях). <b>Ce?</b> — Что? (о предметах).</p>
<div class="ex"><b>Pe cine aștepți? — Pe Ana.</b> — Кого ты ждёшь? — Ану.</div>
<div class="ex"><b>Ce cauți? — Cheile.</b> — Что ты ищешь? — Ключи.</div>
<div class="ex"><b>O iubesc pe mama.</b> — Я люблю маму.</div>
<div class="ex"><b>Pe Mihai îl cunosc de mult.</b> — Михая я знаю давно.</div>

<div class="warn">После <b>pe</b> существительное без определения теряет артикль: <b>Îl văd pe profesor</b> (не «pe profesorul»), но с определением артикль есть: <b>Îl văd pe profesorul nostru</b>. Имена и слова mama, tata не меняются: <b>o sun pe mama</b>.</div>

<div class="tip">Глаголы <b>a suna</b> (звонить) и <b>a ajuta</b> (помогать) в румынском требуют винительного, хотя в русском — дательный: <b>O sun pe Ana</b> — Я звоню Ане. <b>Îl ajut pe tata</b> — Я помогаю папе. И не путайте: <b>pe</b> ещё значит «на»: <i>Cartea e pe masă.</i></div>`,
  exercises: [
    { type: "choice", q: "___ văd pe Ion.", options: ["Îl", "O", "Le"], a: 0,
      explain: "Ion — мужчина, ед. ч., поэтому дублирующее местоимение îl: Îl văd pe Ion." },
    { type: "choice", q: "O aștept ___ Maria.", options: ["pe", "de", "la"], a: 0,
      explain: "Конкретный человек в роли прямого дополнения — с маркером pe: o … pe Maria." },
    { type: "choice", q: "Citesc ___.", options: ["cartea", "pe cartea", "pe carte"], a: 0,
      explain: "Книга — предмет, поэтому pe не нужен: Citesc cartea." },
    { type: "input", q: "___ cine aștepți?", a: ["pe"],
      explain: "Кого? о людях — Pe cine? Слово cine в винительном всегда с pe." },
    { type: "choice", q: "Îi duc ___ la școală.", options: ["pe copii", "copiii", "pe copiii"], a: 0,
      explain: "Конкретные люди — с pe и местоимением îi; после pe без определения артикль пропадает: pe copii." },
    { type: "choice", q: "Caut ___. (какого-нибудь врача)", options: ["un medic", "pe medic", "îl medic"], a: 0,
      explain: "Неконкретный человек («любой врач») — без pe и без удвоения: Caut un medic." },
    { type: "input", q: "Îl iubesc pe ___. (он)", a: ["el"],
      explain: "После pe — ударная форма местоимения: pe el (его)." },
    { type: "input", q: "Mă cunoști pe ___? (я)", a: ["mine"],
      explain: "Ударная форма «меня» после pe — mine: Mă cunoști pe mine?" },
    { type: "choice", q: "___ aștept pe prietene.", options: ["Le", "Îi", "O"], a: 0,
      explain: "Prietene — женский род, мн. ч., поэтому le: Le aștept pe prietene." },
    { type: "order", words: ["Îl", "sun", "pe", "Andrei"], ru: "Я звоню Андрею.",
      alts: [["pe", "Andrei", "Îl", "sun"]],
      explain: "a suna требует винительного: îl … pe Andrei. Можно вынести дополнение вперёд: Pe Andrei îl sun." },
    { type: "order", words: ["O", "ajut", "pe", "mama"], ru: "Я помогаю маме.",
      alts: [["pe", "mama", "O", "ajut"]],
      explain: "a ajuta — с винительным: o ajut pe mama. Порядок Pe mama o ajut тоже верен (акцент на маме)." },
    { type: "choice", q: "___ cauți? — Pe Mihai.", options: ["Pe cine", "Ce", "Cine"], a: 0,
      explain: "Ответ — человек в винительном (Pe Mihai), значит вопрос Pe cine? (кого?)." },
    { type: "input", q: "O văd ___ Elena în parc.", a: ["pe"],
      explain: "Elena — конкретный человек, прямое дополнение: o văd pe Elena." },
    { type: "choice", q: "Îl văd pe ___.", options: ["profesor", "profesorul", "profesorului"], a: 0,
      explain: "После предлога pe существительное без определения употребляется без артикля: pe profesor." }
  ]
});
