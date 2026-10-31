DE.grammar.push({
  id: "perfect_compus",
  title: "Прошедшее время (perfect compus)",
  level: "A2",
  emoji: "⏪",
  summary: "am, ai, a, am, ați, au + participiu: am lucrat, ai văzut, a făcut, au mers",
  content: `<p><b>Perfect compus</b> — главное прошедшее время разговорного румынского. Оно переводит и «делал», и «сделал»: <b>Am citit cartea.</b> — Я читал / прочитал книгу.</p>

<h3>Формула: вспомогательный глагол + participiu</h3>
<table>
<tr><th>Лицо</th><th>Вспомогательный</th><th>Пример</th></tr>
<tr><td>eu</td><td><b>am</b></td><td>am lucrat</td></tr>
<tr><td>tu</td><td><b>ai</b></td><td>ai lucrat</td></tr>
<tr><td>el / ea</td><td><b>a</b></td><td>a lucrat</td></tr>
<tr><td>noi</td><td><b>am</b></td><td>am lucrat</td></tr>
<tr><td>voi</td><td><b>ați</b></td><td>ați lucrat</td></tr>
<tr><td>ei / ele</td><td><b>au</b></td><td>au lucrat</td></tr>
</table>
<div class="warn">Вспомогательный глагол отличается от обычного a avea: он/она <b>a</b> (не are), мы <b>am</b> (не avem), вы <b>ați</b> (не aveți). <b>El a mâncat</b>, а не «el are mâncat».</div>
<p>Причастие <b>не меняется</b> по роду и числу — в отличие от русского «работал / работала / работали»: <b>Ion a plecat. Ana a plecat. Ei au plecat.</b></p>

<h3>Как образовать participiu</h3>
<table>
<tr><th>Инфинитив</th><th>Participiu</th><th>Примеры</th></tr>
<tr><td>-a</td><td>-at</td><td>a lucra → lucrat, a mânca → mâncat, a lua → luat</td></tr>
<tr><td>-ea</td><td>-ut</td><td>a vedea → văzut, a putea → putut, a avea → avut</td></tr>
<tr><td>-e</td><td>-ut / -s / -t</td><td>a face → făcut, a merge → mers, a scrie → scris, a pune → pus, a rupe → rupt</td></tr>
<tr><td>-i</td><td>-it</td><td>a citi → citit, a dormi → dormit, a veni → venit</td></tr>
<tr><td>-î</td><td>-ât</td><td>a coborî → coborât, a hotărî → hotărât</td></tr>
</table>
<p>Запомните особые: <b>a fi → fost</b>, <b>a bea → băut</b>, <b>a vrea → vrut</b>, <b>a ști → știut</b>, <b>a spune → spus</b>, <b>a înțelege → înțeles</b>, <b>a deschide → deschis</b>.</p>

<h3>Отрицание</h3>
<p><b>nu</b> сливается со вспомогательным: <b>n-am</b>, <b>n-ai</b>, <b>n-a</b>, <b>n-am</b>, <b>n-ați</b>, <b>n-au</b>. Полная форма nu am тоже правильна, но звучит книжнее.</p>

<div class="ex"><b>Ieri am fost la mare.</b> — Вчера я был(а) на море.</div>
<div class="ex"><b>Ce ai făcut în weekend?</b> — Что ты делал на выходных?</div>
<div class="ex"><b>Copiii au mâncat tot.</b> — Дети всё съели.</div>
<div class="ex"><b>N-am înțeles întrebarea.</b> — Я не понял вопрос.</div>

<div class="tip">Многие глаголы на <b>-e</b> дают причастие на <b>-s</b>: deschide → deschis, merge → mers, înțelege → înțeles, spune → spus, râde → râs. Но не все: face → făcut, crede → crezut. Если форма на -ut звучит странно («mergut»), пробуйте -s!</div>`,
  exercises: [
    { type: "choice", q: "Ieri ___ lucrat mult. (eu)", options: ["am", "a", "au"], a: 0,
      explain: "Для eu вспомогательный глагол — am: am lucrat." },
    { type: "choice", q: "Ei ___ plecat.", options: ["au", "a", "ați"], a: 0,
      explain: "Для ei/ele — au: au plecat. A — для el/ea, ați — для voi." },
    { type: "input", q: "Voi ___ mâncat?", a: ["ați"],
      explain: "Для voi вспомогательный — ați (а не aveți): ați mâncat." },
    { type: "input", q: "Ce ai ___ ieri? (a face)", a: ["făcut"],
      explain: "a face → făcut (группа на -e, причастие на -ut с чередованием a → ă)." },
    { type: "input", q: "Am ___ o scrisoare. (a scrie)", a: ["scris"],
      explain: "a scrie → scris: причастие на -s." },
    { type: "choice", q: "Am ___ la mare. (a fi)", options: ["fost", "fiut", "fi"], a: 0,
      explain: "a fi — неправильный глагол, его причастие fost: am fost." },
    { type: "choice", q: "Maria ___ un film.", options: ["a văzut", "are văzut", "a vedeat"], a: 0,
      explain: "Для ea вспомогательный a (не are); a vedea → văzut." },
    { type: "choice", q: "Noi ___ cafea.", options: ["am băut", "avem băut", "am beat"], a: 0,
      explain: "Для noi вспомогательный am (не avem); a bea → băut." },
    { type: "input", q: "___ înțeles nimic. (я не…)", a: ["n-am", "nu am"],
      explain: "Отрицание: nu + am → n-am (разговорно) или nu am: N-am înțeles nimic." },
    { type: "order", words: ["Am", "citit", "o", "carte", "interesantă"], ru: "Я прочитал интересную книгу.",
      explain: "Вспомогательный глагол и причастие стоят рядом: am citit; прилагательное — после существительного." },
    { type: "order", words: ["Ce", "ați", "făcut", "ieri?"], ru: "Что вы делали вчера?",
      alts: [["ieri?", "Ce", "ați", "făcut"]],
      explain: "Вопросительное слово ce — перед глаголом; ieri обычно в конце, но можно и в начале: Ieri ce ați făcut?" },
    { type: "choice", q: "Am ___ bine. (a dormi)", options: ["dormit", "dormut", "dormat"], a: 0,
      explain: "Глаголы на -i дают причастие на -it: a dormi → dormit." },
    { type: "input", q: "Unde ai ___ cheile? (a pune)", a: ["pus"],
      explain: "a pune → pus: причастие на -s." },
    { type: "choice", q: "Ana ___ la Cluj anul trecut.", options: ["a mers", "a mergut", "are mers"], a: 0,
      explain: "a merge → mers (на -s, не «mergut»); для ea вспомогательный a." }
  ]
});
