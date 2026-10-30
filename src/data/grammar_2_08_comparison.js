DE.grammar.push({
  id: "comparison",
  title: "Степени сравнения",
  level: "A2",
  emoji: "📈",
  summary: "schnell — schneller — am schnellsten; gut — besser — am besten; als / wie",
  content: `<p>Чтобы сравнивать, в немецком есть три ступени: <b>Positiv</b> (быстрый), <b>Komparativ</b> (быстрее) и <b>Superlativ</b> (быстрее всех). Схема очень регулярная.</p>

<table>
<tr><th>Positiv</th><th>Komparativ (+ -er)</th><th>Superlativ (am … -sten)</th></tr>
<tr><td>schnell</td><td>schnell<b>er</b></td><td><b>am</b> schnell<b>sten</b></td></tr>
<tr><td>klein</td><td>klein<b>er</b></td><td><b>am</b> klein<b>sten</b></td></tr>
<tr><td>schön</td><td>schön<b>er</b></td><td><b>am</b> schön<b>sten</b></td></tr>
<tr><td>teuer</td><td>teu<b>rer</b></td><td><b>am</b> teuer<b>sten</b></td></tr>
</table>

<h3>Умлаут в коротких словах</h3>
<p>Многие односложные прилагательные с <b>a, o, u</b> получают умлаут:</p>
<table>
<tr><th>Positiv</th><th>Komparativ</th><th>Superlativ</th></tr>
<tr><td>alt</td><td>älter</td><td>am ältesten</td></tr>
<tr><td>jung</td><td>jünger</td><td>am jüngsten</td></tr>
<tr><td>groß</td><td>größer</td><td>am größten</td></tr>
<tr><td>warm / kalt</td><td>wärmer / kälter</td><td>am wärmsten / am kältesten</td></tr>
<tr><td>lang / kurz</td><td>länger / kürzer</td><td>am längsten / am kürzesten</td></tr>
</table>
<p>После <b>-d, -t, -s, -ß, -z</b> в Superlativ добавляется <b>-e-</b> для удобства произношения: am ält<b>e</b>sten, am heiß<b>e</b>sten, am kürz<b>e</b>sten.</p>

<h3>Неправильные формы — выучить наизусть</h3>
<table>
<tr><th>Positiv</th><th>Komparativ</th><th>Superlativ</th></tr>
<tr><td><b>gut</b> — хороший</td><td><b>besser</b></td><td><b>am besten</b></td></tr>
<tr><td><b>viel</b> — много</td><td><b>mehr</b></td><td><b>am meisten</b></td></tr>
<tr><td><b>gern</b> — охотно</td><td><b>lieber</b></td><td><b>am liebsten</b></td></tr>
<tr><td><b>hoch</b> — высокий</td><td><b>höher</b></td><td><b>am höchsten</b></td></tr>
<tr><td><b>nah</b> — близкий</td><td><b>näher</b></td><td><b>am nächsten</b></td></tr>
</table>

<h3>als или wie?</h3>
<table>
<tr><th>Ситуация</th><th>Слово</th><th>Пример</th></tr>
<tr><td>неравенство (больше / меньше)</td><td>Komparativ + <b>als</b> = «чем»</td><td>Tom ist größer <b>als</b> Max.</td></tr>
<tr><td>равенство</td><td><b>so</b> … <b>wie</b> = «такой же … как»</td><td>Tom ist <b>so</b> groß <b>wie</b> Max.</td></tr>
</table>

<div class="tip">Переводите в уме на русский: «больше, <b>чем</b>» → <b>als</b>; «такой же, <b>как</b>» → <b>wie</b>. Правило-проверка: есть Komparativ на -er (älter, besser) — ставьте <b>als</b>; есть <b>so</b> — ставьте <b>wie</b>.</div>

<div class="ex"><b>Mein Bruder ist älter als ich.</b> — Мой брат старше меня.</div>
<div class="ex"><b>Der Zug ist schneller als das Auto.</b> — Поезд быстрее машины.</div>
<div class="ex"><b>Heute ist es so kalt wie gestern.</b> — Сегодня так же холодно, как вчера.</div>
<div class="ex"><b>Ich trinke lieber Tee als Kaffee.</b> — Я больше люблю чай, чем кофе.</div>
<div class="ex"><b>Im Juli ist es am wärmsten.</b> — В июле теплее всего.</div>

<div class="warn"><b>gern</b> не даёт «gerner»! Только <b>lieber</b> и <b>am liebsten</b>: <i>Am liebsten esse ich Pizza</i> — «Больше всего я люблю пиццу».</div>`,
  exercises: [
    { type: "choice", q: "Mein Bruder ist ___ als ich.", options: ["alt", "älter", "ältest"], a: 1,
      explain: "С als нужен Komparativ: alt → älter (с умлаутом)." },
    { type: "choice", q: "Berlin ist größer ___ München.", options: ["wie", "als", "dann"], a: 1,
      explain: "Komparativ (größer) + als = «чем». «größer wie» встречается в разговоре, но это ошибка; wie — для равенства (so groß wie)." },
    { type: "choice", q: "Ich bin so groß ___ mein Vater.", options: ["als", "wie", "so"], a: 1,
      explain: "Равенство: so … wie («такой же, как»). als ставится только после Komparativ." },
    { type: "input", q: "Komparativ от «gut»:", a: ["besser"],
      explain: "gut — неправильный: gut — besser — am besten (не «güter»)." },
    { type: "input", q: "Anna läuft am ___. (schnell, Superlativ)", a: ["schnellsten"],
      explain: "Superlativ при глаголе: am + прилагательное + -sten → am schnellsten." },
    { type: "choice", q: "Ich trinke ___ Tee als Kaffee.", options: ["gerner", "lieber", "mehr gern"], a: 1,
      explain: "gern — неправильный: gern — lieber — am liebsten. «gerner» не существует." },
    { type: "input", q: "Im Sommer ist es ___ als im Winter. (warm)", a: ["wärmer"],
      explain: "Короткое (односложное) прилагательное с a получает умлаут: warm → wärmer." },
    { type: "order", words: ["Der", "Zug", "ist", "schneller", "als", "der", "Bus"], ru: "Поезд быстрее автобуса.",
      explain: "Komparativ + als: schneller als der Bus (после als — тот же падеж, Nominativ)." },
    { type: "choice", q: "Wer hat am ___ Geld?", options: ["meisten", "mehrsten", "vielsten"], a: 0,
      explain: "viel — неправильный: viel — mehr — am meisten." },
    { type: "input", q: "Der Mount Everest ist am ___. (hoch, Superlativ)", a: ["höchsten"],
      explain: "hoch — höher — am höchsten: умлаут, а c в Komparativ выпадает (höher)." },
    { type: "choice", q: "Heute ist es ___ als gestern. (kalt)", options: ["kalter", "kälter", "kältest"], a: 1,
      explain: "kalt → kälter: умлаут в односложном прилагательном; + als → Komparativ, а не Superlativ." },
    { type: "order", words: ["Am", "liebsten", "esse", "ich", "Pizza"], ru: "Больше всего я люблю есть пиццу.",
      alts: [["ich", "esse", "Am", "liebsten", "Pizza"], ["Pizza", "esse", "ich", "Am", "liebsten"]],
      explain: "«Am liebsten» на 1-м месте → глагол esse на 2-м, подлежащее ich после него. Так же верно: Ich esse am liebsten Pizza." },
    { type: "input", q: "Im Juli ist es am ___. (heiß, Superlativ)", a: ["heißesten", "heissesten"],
      explain: "После -ß, -s, -z, -t добавляется -e-: am heißesten (иначе не выговорить «heißsten»)." },
    { type: "choice", q: "Das Wetter ist heute nicht so gut ___ gestern.", options: ["als", "wie", "wenn"], a: 1,
      explain: "Конструкция so … wie сохраняется и с отрицанием: nicht so gut wie. als — только после Komparativ (besser als)." }
  ]
});
