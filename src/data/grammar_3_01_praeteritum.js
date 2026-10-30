DE.grammar.push({
  id: "praeteritum",
  title: "Простое прошедшее (Präteritum)",
  level: "B1",
  emoji: "📜",
  summary: "ich machte, ich ging, ich dachte — прошедшее время для рассказов и текстов",
  content: `<p><b>Präteritum</b> — второе прошедшее время в немецком. По смыслу оно почти не отличается от Perfekt («я сделал / я делал»), но отличается <b>стилем</b>: Präteritum — время <b>письменных рассказов</b>, книг, новостей и сказок, а Perfekt — время разговора.</p>
<div class="ex"><b>Es war einmal ein König.</b> — Жил-был король.</div>
<h3>1. Слабые глаголы: основа + -te</h3>
<p>Правильные (слабые) глаголы получают суффикс <span class="hl">-te</span> и личные окончания. Формы <b>ich</b> и <b>er/sie/es</b> совпадают и не имеют окончания после -te.</p>
<table>
<tr><th></th><th>machen</th><th>arbeiten</th><th>gehen (сильный)</th></tr>
<tr><td>ich</td><td>mach<b>te</b></td><td>arbeit<b>ete</b></td><td>ging</td></tr>
<tr><td>du</td><td>mach<b>test</b></td><td>arbeit<b>etest</b></td><td>ging<b>st</b></td></tr>
<tr><td>er/sie/es</td><td>mach<b>te</b></td><td>arbeit<b>ete</b></td><td>ging</td></tr>
<tr><td>wir</td><td>mach<b>ten</b></td><td>arbeit<b>eten</b></td><td>ging<b>en</b></td></tr>
<tr><td>ihr</td><td>mach<b>tet</b></td><td>arbeit<b>etet</b></td><td>ging<b>t</b></td></tr>
<tr><td>sie/Sie</td><td>mach<b>ten</b></td><td>arbeit<b>eten</b></td><td>ging<b>en</b></td></tr>
</table>
<p>Если основа кончается на <b>-t, -d</b> или труднопроизносимое сочетание, вставляется <b>-e-</b>: arbeit<b>e</b>te, red<b>e</b>te, öffn<b>e</b>te.</p>
<h3>2. Сильные глаголы: меняется корень</h3>
<p>Сильные глаголы <b>не берут -te</b>, зато меняют корневую гласную. Их формы нужно учить (это вторая форма в «тройке»: gehen – <b>ging</b> – gegangen).</p>
<table>
<tr><th>Инфинитив</th><th>Präteritum</th><th>Перевод</th></tr>
<tr><td>sein</td><td>war</td><td>быть</td></tr>
<tr><td>haben</td><td>hatte</td><td>иметь</td></tr>
<tr><td>werden</td><td>wurde</td><td>становиться</td></tr>
<tr><td>kommen</td><td>kam</td><td>приходить</td></tr>
<tr><td>sehen</td><td>sah</td><td>видеть</td></tr>
<tr><td>fahren</td><td>fuhr</td><td>ехать</td></tr>
<tr><td>finden</td><td>fand</td><td>находить</td></tr>
<tr><td>schreiben</td><td>schrieb</td><td>писать</td></tr>
<tr><td>sprechen</td><td>sprach</td><td>говорить</td></tr>
<tr><td>bleiben</td><td>blieb</td><td>оставаться</td></tr>
</table>
<h3>3. Смешанные глаголы: и -te, и смена корня</h3>
<p>Небольшая группа: <b>denken → dachte, bringen → brachte, kennen → kannte, wissen → wusste, nennen → nannte, rennen → rannte</b>. Модальные глаголы тоже берут -te и <b>теряют умлаут</b>: können → konnte, müssen → musste, dürfen → durfte, mögen → mochte, wollen → wollte, sollen → sollte.</p>
<h3>4. Когда что употреблять?</h3>
<ul>
<li><b>В разговоре</b> — Perfekt: <i>Ich habe gestern Pizza gegessen.</i></li>
<li><b>Но даже в разговоре</b> — Präteritum у <b>sein, haben, werden</b>, модальных глаголов и часто у <i>es gab</i>: <i>Ich war krank. Ich hatte keine Zeit. Ich musste arbeiten.</i></li>
<li><b>В письменных текстах</b> (рассказ, статья, биография) — Präteritum почти у всех глаголов.</li>
</ul>
<div class="ex"><b>Gestern war ich müde, deshalb konnte ich nicht kommen.</b> — Вчера я устал, поэтому не смог прийти.</div>
<div class="ex"><b>Er öffnete die Tür und sah einen Fremden.</b> — Он открыл дверь и увидел незнакомца.</div>
<div class="ex"><b>Wir wussten nicht, wo sie wohnte.</b> — Мы не знали, где она жила.</div>
<div class="tip">💡 Отделяемые приставки в Präteritum уходят в конец, как в Präsens: <b>Der Zug kam pünktlich an.</b> А формы <b>ich</b> и <b>er</b> всегда одинаковы: <i>ich kam = er kam, ich machte = er machte</i>. Запомни: «Präteritum — это время сказок и газет».</div>
<div class="warn">Не добавляй -te к сильным глаголам: <i>gehte</i> ✗ → <b>ging</b> ✓.</div>`,
  exercises: [
    { type: "choice", q: "Gestern ___ ich keine Zeit.", options: ["habe", "hatte", "hattete"], a: 1,
      explain: "«Gestern» требует прошедшего времени: haben → hatte. «habe» — настоящее время, а «hattete» — ошибка: в hatte уже есть -te." },
    { type: "input", q: "Wir ___ den ganzen Tag im Garten. (arbeiten, Präteritum)", a: ["arbeiteten"],
      explain: "Основа arbeit- кончается на -t, поэтому вставляется -e-: arbeit-e-te-n. «arbeitten» без -e- невозможно произнести." },
    { type: "choice", q: "Als Kind ___ er oft Fußball.", options: ["spielte", "spielt", "spielen"], a: 0,
      explain: "«Als Kind» — прошлое, spielen слабый: spiel + te, у er нет окончания. «spielt» — настоящее время, «spielen» — инфинитив/форма wir." },
    { type: "order", words: ["Sie", "kam", "gestern", "sehr", "spät", "nach", "Hause"], ru: "Вчера она пришла домой очень поздно.",
      alts: [["gestern", "kam", "Sie", "sehr", "spät", "nach", "Hause"]],
      explain: "kommen — сильный глагол: kam (без -te). Спрягаемый глагол стоит на 2-м месте, поэтому можно начать и с gestern: «Gestern kam sie…»." },
    { type: "input", q: "Ich ___ nicht, dass du hier wohnst. (wissen, Präteritum)", a: ["wusste"],
      explain: "wissen — смешанный глагол: меняет корень и берёт -te → wusste. Форма «wisste» не существует." },
    { type: "choice", q: "Wohin ___ ihr im Sommer?", options: ["fahrtet", "fuhrt", "fuhrtet"], a: 1,
      explain: "fahren — сильный глагол: корень fuhr- + окончание ihr -t → fuhrt. Сильные глаголы не берут -te, поэтому «fahrtet» и «fuhrtet» неверны." },
    { type: "input", q: "Der Film ___ sehr spannend. (sein, Präteritum)", a: ["war"],
      explain: "sein в Präteritum: ich/er war. Именно war, а не Perfekt «ist gewesen», — так говорят и в разговоре." },
    { type: "choice", q: "Ich ___ oft an dich.", options: ["denkte", "dachte", "dacht"], a: 1,
      explain: "denken — смешанный глагол: корень меняется на dach- и добавляется -te → dachte. «denkte» — ошибка «как у слабого», «dacht» — без окончания -te." },
    { type: "order", words: ["Der", "Zug", "fuhr", "um", "acht", "Uhr", "ab"], ru: "Поезд отправился в восемь часов.",
      alts: [["um", "acht", "Uhr", "fuhr", "Der", "Zug", "ab"]],
      explain: "abfahren → fuhr … ab: отделяемая приставка уходит в конец. Глагол на 2-м месте, поэтому возможно и «Um acht Uhr fuhr der Zug ab»." },
    { type: "input", q: "Du ___ früher sehr gut singen. (können, Präteritum)", a: ["konntest"],
      explain: "Модальные глаголы в Präteritum теряют умлаут: können → konnte, du konntest. «Konntest» без умлаута — правильно, «könntest» — это уже Konjunktiv II." },
    { type: "choice", q: "Какое предложение звучит естественно в разговоре?", options: ["Ich aß gestern Pizza.", "Ich habe gestern Pizza gegessen.", "Ich habe gestern Pizza geessen."], a: 1,
      explain: "В разговоре обычные глаголы употребляются в Perfekt: habe … gegessen. «Ich aß» грамматически верно, но звучит книжно; «geessen» — неверное Partizip II (правильно gegessen)." },
    { type: "input", q: "Er ___ mir einen langen Brief. (schreiben, Präteritum)", a: ["schrieb"],
      explain: "schreiben — сильный глагол, ei → ie: schrieb. Без -te: «schreibte» неверно." },
    { type: "order", words: ["Wir", "mussten", "lange", "auf", "den", "Bus", "warten"], ru: "Нам пришлось долго ждать автобус.",
      alts: [["lange", "mussten", "Wir", "auf", "den", "Bus", "warten"]],
      explain: "müssen → mussten (без умлаута), инфинитив warten в самом конце. Можно вынести lange на первое место: «Lange mussten wir…»." }
  ]
});
