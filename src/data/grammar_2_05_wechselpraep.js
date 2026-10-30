DE.grammar.push({
  id: "wechselpraep",
  title: "Предлоги двойного управления",
  level: "A2",
  emoji: "📦",
  summary: "in, an, auf… — Wo? + Dativ, Wohin? + Akkusativ; stellen/stehen, legen/liegen",
  content: `<p>Девять предлогов могут требовать <b>и Dativ, и Akkusativ</b> — в зависимости от вопроса. Хорошая новость: в русском всё работает так же! «Книга лежит <i>на столе</i>» (где?) и «Я кладу книгу <i>на стол</i>» (куда?).</p>

<table>
<tr><th>Вопрос</th><th>Смысл</th><th>Падеж</th><th>Пример</th></tr>
<tr><td><b>Wo?</b> — Где?</td><td>место, покой</td><td><b>Dativ</b></td><td>Ich bin <b>im</b> Kino.</td></tr>
<tr><td><b>Wohin?</b> — Куда?</td><td>направление, движение к цели</td><td><b>Akkusativ</b></td><td>Ich gehe <b>ins</b> Kino.</td></tr>
</table>

<h3>Девять предлогов</h3>
<table>
<tr><th>Предлог</th><th>Значение</th><th>Wo? (Dat)</th><th>Wohin? (Akk)</th></tr>
<tr><td><b>in</b></td><td>в</td><td>in der Küche</td><td>in die Küche</td></tr>
<tr><td><b>an</b></td><td>на (вертикальной поверхности), у</td><td>an der Wand</td><td>an die Wand</td></tr>
<tr><td><b>auf</b></td><td>на (горизонтальной поверхности)</td><td>auf dem Tisch</td><td>auf den Tisch</td></tr>
<tr><td><b>über</b></td><td>над</td><td>über dem Sofa</td><td>über das Sofa</td></tr>
<tr><td><b>unter</b></td><td>под</td><td>unter dem Bett</td><td>unter das Bett</td></tr>
<tr><td><b>vor</b></td><td>перед</td><td>vor dem Haus</td><td>vor das Haus</td></tr>
<tr><td><b>hinter</b></td><td>за, позади</td><td>hinter der Tür</td><td>hinter die Tür</td></tr>
<tr><td><b>neben</b></td><td>рядом с</td><td>neben dem Fenster</td><td>neben das Fenster</td></tr>
<tr><td><b>zwischen</b></td><td>между</td><td>zwischen den Stühlen</td><td>zwischen die Stühle</td></tr>
</table>
<p>Слияния: in + dem = <b>im</b>, in + das = <b>ins</b>, an + dem = <b>am</b>, an + das = <b>ans</b>.</p>

<h3>Пары глаголов: действие → результат</h3>
<table>
<tr><th>Wohin? + Akk (действие)</th><th>Wo? + Dat (состояние)</th></tr>
<tr><td><b>stellen</b> — ставить (вертикально)</td><td><b>stehen</b> — стоять</td></tr>
<tr><td><b>legen</b> — класть (горизонтально)</td><td><b>liegen</b> — лежать</td></tr>
<tr><td><b>setzen</b> — сажать / sich setzen — садиться</td><td><b>sitzen</b> — сидеть</td></tr>
<tr><td><b>hängen</b> — вешать</td><td><b>hängen</b> — висеть</td></tr>
</table>

<div class="tip">Глаголы действия (stellen, legen, setzen) — <b>слабые</b> и отвечают на «куда?» → Akkusativ. Глаголы состояния (stehen, liegen, sitzen) — <b>сильные</b> и отвечают на «где?» → Dativ. Запомните: <b>«Куда — Akk, где — Dat»</b>, как в русском «на стол» / «на столе».</div>

<div class="ex"><b>Ich stelle die Vase auf den Tisch.</b> — Я ставлю вазу на стол.<br><b>Die Vase steht auf dem Tisch.</b> — Ваза стоит на столе.</div>
<div class="ex"><b>Er legt das Handy neben das Bett.</b> — Он кладёт телефон рядом с кроватью.<br><b>Das Handy liegt neben dem Bett.</b> — Телефон лежит рядом с кроватью.</div>
<div class="ex"><b>Wir hängen das Bild an die Wand.</b> — Мы вешаем картину на стену.<br><b>Das Bild hängt an der Wand.</b> — Картина висит на стене.</div>

<div class="warn">Движение <b>внутри</b> места — это всё ещё «где?»: <i>Die Kinder laufen im Park</i> (бегают в парке) — Dativ. А <i>Die Kinder laufen in den Park</i> (бегут в парк) — Akkusativ.</div>`,
  exercises: [
    { type: "choice", q: "Das Buch liegt auf ___ Tisch.", options: ["den", "dem", "der"], a: 1,
      explain: "liegen — состояние, вопрос «где?» → Dativ: auf dem Tisch. den было бы при «куда?» (legen)." },
    { type: "choice", q: "Ich lege das Buch auf ___ Tisch.", options: ["den", "dem", "der"], a: 0,
      explain: "legen — движение, вопрос «куда?» → Akkusativ: auf den Tisch. dem — при «где?» (liegen)." },
    { type: "input", q: "Wir gehen heute ___ Kino. (in + das)", a: ["ins"],
      explain: "gehen — куда? → Akkusativ: in das Kino = ins Kino. im (in dem) отвечает на «где?»." },
    { type: "input", q: "Ich bin ___ Büro. (in + dem)", a: ["im"],
      explain: "sein — где? → Dativ: in dem Büro = im Büro." },
    { type: "choice", q: "Die Lampe hängt über ___ Sofa.", options: ["das", "dem", "den"], a: 1,
      explain: "hängen здесь — «висеть» (состояние), вопрос «где?» → Dativ: über dem Sofa." },
    { type: "choice", q: "Ich ___ die Flasche in den Kühlschrank.", options: ["stelle", "stehe", "liege"], a: 0,
      explain: "Действие «ставить» + куда? (in den Kühlschrank, Akk) → stellen. stehen/liegen — состояния, они не берут прямое дополнение." },
    { type: "choice", q: "Die Flasche ___ im Kühlschrank.", options: ["stellt", "steht", "legt"], a: 1,
      explain: "Состояние «стоять» + где? (im Kühlschrank, Dativ) → stehen. stellt/legt — действия, им нужно дополнение «что?»." },
    { type: "input", q: "Das Handy liegt ___ dem Bett. (под)", a: ["unter"],
      explain: "unter — «под»; liegen — где? → Dativ: unter dem Bett." },
    { type: "order", words: ["Die", "Katze", "sitzt", "auf", "dem", "Sofa"], ru: "Кошка сидит на диване.",
      alts: [["auf", "dem", "Sofa", "sitzt", "Die", "Katze"]],
      explain: "sitzen — где? → Dativ: auf dem Sofa. Можно начать с места: Auf dem Sofa sitzt die Katze." },
    { type: "choice", q: "Wohin hängst du das Bild? — An ___ Wand.", options: ["die", "der", "den"], a: 0,
      explain: "Wohin? → Akkusativ; die Wand — женский род, в Akk не меняется: an die Wand. der — Dativ (Wo?)." },
    { type: "input", q: "Wir fahren am Wochenende ___ Meer. (an + das)", a: ["ans"],
      explain: "fahren — куда? → Akkusativ: an das Meer = ans Meer. am Meer (Dativ) — «где? у моря»." },
    { type: "order", words: ["Ich", "lege", "den", "Schlüssel", "auf", "den", "Tisch"], ru: "Я кладу ключ на стол.",
      alts: [["den", "Schlüssel", "lege", "Ich", "auf", "den", "Tisch"], ["auf", "den", "Tisch", "lege", "Ich", "den", "Schlüssel"]],
      explain: "legen — куда? → Akkusativ: auf den Tisch. Глагол lege всегда на 2-м месте, что бы ни стояло первым." },
    { type: "choice", q: "Das Auto steht zwischen ___ Bäumen.", options: ["die", "den", "dem"], a: 1,
      explain: "stehen — где? → Dativ мн. ч.: zwischen den Bäumen (артикль den + -n у существительного)." },
    { type: "choice", q: "Setz dich neben ___!", options: ["mich", "mir", "ich"], a: 0,
      explain: "sich setzen — движение, «куда?» → Akkusativ: neben mich. neben mir (Dativ) — «где?»: Er sitzt neben mir." }
  ]
});
