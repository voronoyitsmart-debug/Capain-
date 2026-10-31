DE.grammar.push({
  id: "vorbire_indirecta",
  title: "Косвенная речь и согласование времён",
  level: "B2",
  emoji: "💬",
  summary: "A spus: «Vin.» → A spus că vine. Время не сдвигается, как и в русском",
  content: `<p>Хорошая новость для русскоязычных: в румынском, как и в русском, <b>нет обязательного сдвига времён</b> (как в английском). Время прямой речи сохраняется, меняются только лица, местоимения и иногда наречия.</p>

<h3>Утверждения: că</h3>
<table>
<tr><th>Прямая речь</th><th>Косвенная речь</th></tr>
<tr><td>«Sunt obosit», a spus Ion.</td><td>Ion a spus <b>că este</b> obosit.</td></tr>
<tr><td>«Am fost la Cluj», a spus Mihai.</td><td>Mihai a spus <b>că a fost</b> la Cluj.</td></tr>
<tr><td>«Vin mâine», a zis Ana.</td><td>Ana a zis <b>că vine / că va veni / că o să vină</b> mâine.</td></tr>
</table>
<p>Будущее можно передать любой формой будущего или настоящим. Имперфект (<i>a spus că era obosit</i>) тоже встречается в разговоре, но основной вариант — настоящее.</p>

<h3>Вопросы: dacă или вопросительное слово</h3>
<table>
<tr><th>Прямая речь</th><th>Косвенная речь</th></tr>
<tr><td>«Ai mâncat?»</td><td>M-a întrebat <b>dacă</b> am mâncat.</td></tr>
<tr><td>«Unde locuiești?»</td><td>M-a întrebat <b>unde</b> locuiesc.</td></tr>
<tr><td>«Când începe filmul?»</td><td>Ne-a întrebat <b>când</b> începe filmul.</td></tr>
</table>
<p>Общий вопрос (да/нет) вводится словом <b>dacă</b> = «ли». Специальные вопросы сохраняют вопросительное слово.</p>

<h3>Просьбы и приказы: să + конъюнктив</h3>
<div class="ex">«Închide fereastra!» → <b>Mi-a cerut să închid fereastra.</b> — Он попросил меня закрыть окно.</div>
<div class="ex">«Nu fuma aici!» → <b>Mi-a spus să nu fumez acolo.</b> — Он сказал мне не курить там.</div>
<div class="ex">«Vă rog să așteptați.» → <b>Secretara ne-a rugat să așteptăm.</b></div>

<h3>Что меняется</h3>
<p>Если пересказываем позже или в другом месте, сдвигаются указатели времени и места:</p>
<table>
<tr><th>Было</th><th>Стало</th></tr>
<tr><td>acum</td><td>atunci</td></tr>
<tr><td>aici</td><td>acolo</td></tr>
<tr><td>azi</td><td>în ziua aceea</td></tr>
<tr><td>mâine</td><td>a doua zi</td></tr>
<tr><td>ieri</td><td>cu o zi înainte</td></tr>
</table>
<p>Но если пересказ сделан на следующий день, логика простая: <i>Ieri Ana mi-a spus: «Plec mâine.»</i> → <b>Ana mi-a spus ieri că pleacă azi.</b></p>

<h3>Глаголы речи</h3>
<p><b>a spune, a zice</b> (сказать), <b>a afirma, a declara</b> (заявить), <b>a întreba</b> (спросить), <b>a răspunde</b> (ответить), <b>a ruga</b> (попросить), <b>a cere</b> (потребовать), <b>a explica</b> (объяснить).</p>

<div class="tip">В разговоре слухи передают частицей <span class="hl">cică</span> — «говорят, мол»: <i>Cică s-a mutat la București.</i> — Говорят, он переехал в Бухарест. В письменной речи — <i>se spune că, se pare că</i>.</div>`,
  exercises: [
    { type: "choice", q: "«Sunt obosit», a spus Ion. → Ion a spus că ___ obosit.", options: ["este", "a fost", "va fi"], a: 0,
      explain: "Время не сдвигается: настоящее в прямой речи остаётся настоящим — că este obosit." },
    { type: "input", q: "«Vin mâine», a zis Ana. → Ana a zis că ___ mâine. (a veni, наст. вр.)", a: ["vine"],
      explain: "Меняется только лицо: vin (я) → vine (она). Время сохраняется." },
    { type: "choice", q: "«Unde locuiești?» → M-a întrebat ___ locuiesc.", options: ["unde", "dacă", "că"], a: 0,
      explain: "Специальный вопрос сохраняет вопросительное слово: unde." },
    { type: "choice", q: "«Ai mâncat?» → M-a întrebat ___ am mâncat.", options: ["dacă", "că", "să"], a: 0,
      explain: "Общий вопрос (да/нет) вводится словом dacă — «ли»." },
    { type: "input", q: "«Închide fereastra!» → Mi-a cerut ___ fereastra. (2 слова)", a: ["să închid"],
      explain: "Приказ передаётся конструкцией să + конъюнктив; лицо меняется на «я»: să închid." },
    { type: "order", words: ["Mi-a", "spus", "că", "va", "veni", "mai", "târziu"], ru: "Он сказал мне, что придёт позже.",
      explain: "Утверждение вводится союзом că; будущее (va veni) сохраняется." },
    { type: "choice", q: "«Nu fuma aici!» → в косвенной речи:", options: ["Mi-a spus să nu fumez acolo.", "Mi-a spus că nu fumez acolo.", "Mi-a spus să nu fumezi acolo."], a: 0,
      explain: "Запрет → să nu + конъюнктив 1-го лица (fumez), aici → acolo." },
    { type: "input", q: "«Am fost la Cluj», a spus Mihai. → Mihai a spus că ___ la Cluj.", a: ["a fost"],
      explain: "Прошедшее сохраняется, меняется лицо: am fost → a fost." },
    { type: "choice", q: "Ieri Ana mi-a spus: «Plec mâine.» → Ana mi-a spus ieri că pleacă ___.", options: ["azi", "mâine", "ieri"], a: 0,
      explain: "«Завтра» для вчерашнего дня — это сегодня: pleacă azi." },
    { type: "order", words: ["M-a", "întrebat", "dacă", "știu", "românește"], ru: "Он спросил меня, знаю ли я румынский.",
      explain: "Общий вопрос в косвенной речи: dacă + глагол в нужном лице." },
    { type: "choice", q: "«Când începe filmul?» → Ne-a întrebat când ___ filmul.", options: ["începe", "a început", "să înceapă"], a: 0,
      explain: "Вопросительное слово сохраняется, время тоже: când începe." },
    { type: "input", q: "«Vă rog să așteptați», a zis secretara. → Secretara ne-a rugat ___. (2 слова)", a: ["să așteptăm"],
      explain: "Просьба → să + конъюнктив; «вы» в прямой речи — это «мы» в пересказе: să așteptăm." },
    { type: "choice", q: "«Cică s-a mutat la București.» Что значит cică?", options: ["говорят, мол", "потому что", "хотя"], a: 0,
      explain: "Cică — разговорная частица пересказа: «говорят, якобы»." }
  ]
});
