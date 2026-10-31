DE.grammar.push({
  id: "pronume_dativ",
  title: "Местоимения в дательном (îmi, îți, îi…)",
  level: "A2",
  emoji: "🎁",
  summary: "Îmi place, mi-e foame, îi dau lui Ion; ударные: mie, ție, lui, ei",
  content: `<p>Дательный падеж (<b>dativ</b>) отвечает на вопрос <b>Cui?</b> — Кому? Как и в винительном, у местоимений есть короткая форма (перед глаголом) и ударная (для акцента).</p>

<table>
<tr><th>Кому?</th><th>Короткая</th><th>Перед гласной</th><th>Ударная</th></tr>
<tr><td>мне</td><td><b>îmi</b></td><td>mi-</td><td>mie</td></tr>
<tr><td>тебе</td><td><b>îți</b></td><td>ți-</td><td>ție</td></tr>
<tr><td>ему / ей</td><td><b>îi</b></td><td>i-</td><td>lui / ei</td></tr>
<tr><td>нам</td><td><b>ne</b></td><td>ne-</td><td>nouă</td></tr>
<tr><td>вам</td><td><b>vă</b></td><td>v-</td><td>vouă</td></tr>
<tr><td>им</td><td><b>le</b></td><td>le-</td><td>lor</td></tr>
</table>

<h3>Îmi place — как «мне нравится»</h3>
<p>Тут румынский думает точно как русский: <b>Îmi place cafeaua</b> — Мне нравится кофе. Глагол согласуется с тем, что нравится: <b>Îmi place</b> florea, но <b>Îmi plac</b> florile.</p>
<p>Так же: <b>îmi trebuie</b> (мне нужно), <b>îmi lipsește</b> (мне не хватает), <b>îmi pare rău</b> (мне жаль).</p>

<h3>Mi-e foame — «мне голодно»</h3>
<table>
<tr><th>Румынский</th><th>Русский</th></tr>
<tr><td>Mi-e foame / sete.</td><td>Я голоден / хочу пить.</td></tr>
<tr><td>Ți-e frig? / cald?</td><td>Тебе холодно? / жарко?</td></tr>
<tr><td>Ne e somn.</td><td>Нам хочется спать.</td></tr>
<tr><td>Mi-e dor de tine.</td><td>Я скучаю по тебе.</td></tr>
<tr><td>Mi-e frică.</td><td>Мне страшно.</td></tr>
</table>

<h3>Кому дать, сказать, написать</h3>
<p>С существительным короткое местоимение тоже «дублирует» его: <b>Îi dau lui Ion o carte.</b> — Я даю Иону книгу. <b>Le scriu părinților.</b> — Я пишу родителям. В perfect compus — через дефис: <b>mi-a dat</b>, <b>ți-am spus</b>, <b>i-am scris</b>, <b>le-am trimis</b>.</p>

<div class="ex"><b>Mie îmi place marea, ție îți place muntele.</b> — Мне нравится море, а тебе — горы.</div>
<div class="ex"><b>Ce le cumperi copiilor?</b> — Что ты покупаешь детям?</div>
<div class="ex"><b>Ți-am spus adevărul.</b> — Я сказал тебе правду.</div>
<div class="ex"><b>— Îmi place filmul. — Și mie!</b> — Мне нравится фильм. — Мне тоже!</div>

<div class="warn">Исключение: боль — винительный! <b>Mă doare capul</b> — У меня болит голова (не «îmi doare»). <b>Te doare ceva?</b> — У тебя что-то болит?</div>

<div class="tip">«Мне тоже!» — <b>Și mie!</b>, «А тебе?» — <b>Ție?</b> Ударные формы mie / ție отлично работают без глагола в коротких ответах.</div>`,
  exercises: [
    { type: "choice", q: "___ place ciocolata. (мне)", options: ["Îmi", "Mă", "Mie"], a: 0,
      explain: "«Мне нравится» — дательный, короткая форма: Îmi place. Mie без îmi перед глаголом не употребляется." },
    { type: "choice", q: "Îmi ___ florile.", options: ["plac", "place", "plăcem"], a: 0,
      explain: "Глагол согласуется с тем, что нравится: florile — мн. ч., поэтому plac." },
    { type: "input", q: "___ foame. (мне)", a: ["mi-e", "îmi e", "îmi este"],
      explain: "«Я голоден» — дательный + a fi: Mi-e foame (полная форма: Îmi este foame)." },
    { type: "input", q: "Ce ___ place să faci? (тебе)", a: ["îți"],
      explain: "«Тебе нравится» — îți place." },
    { type: "choice", q: "___ dau lui Andrei o carte.", options: ["Îi", "Îl", "Le"], a: 0,
      explain: "Кому? — lui Andrei (ему): дательный îi. Îl — винительный (его)." },
    { type: "choice", q: "Le scriu ___.", options: ["părinților", "părinții", "pe părinți"], a: 0,
      explain: "Кому? — родителям: дательный мн. ч. на -lor: părinților." },
    { type: "input", q: "— Îmi place muzica asta. — Și ___! (мне тоже)", a: ["mie"],
      explain: "В коротком ответе — ударная форма дательного: Și mie! (Мне тоже!)" },
    { type: "choice", q: "___ doare capul. (у меня)", options: ["Mă", "Îmi", "Mie"], a: 0,
      explain: "a durea — исключение: требует винительного: Mă doare capul." },
    { type: "order", words: ["Îmi", "place", "muzica", "românească"], ru: "Мне нравится румынская музыка.",
      alts: [["muzica", "românească", "Îmi", "place"]],
      explain: "Обычно: Îmi place + то, что нравится. Можно начать с подлежащего: Muzica românească îmi place." },
    { type: "order", words: ["Ți-am", "spus", "adevărul"], ru: "Я сказал тебе правду.",
      explain: "В perfect compus ți- сливается со вспомогательным am: ți-am spus." },
    { type: "choice", q: "___ dai cadoul? — Mamei.", options: ["Cui îi", "Pe cine", "Cine îi"], a: 0,
      explain: "Ответ в дательном (mamei — маме), значит вопрос Cui? (кому?), с дублем îi." },
    { type: "input", q: "Copiilor ___ place înghețata. (им)", a: ["le"],
      explain: "Copiilor (детям) — мн. ч., дубль в дательном — le: le place." },
    { type: "choice", q: "Vă ___ orașul?", options: ["place", "plac", "plăceți"], a: 0,
      explain: "Нравится город (ед. ч.) — place; vă (вам) на форму глагола не влияет." },
    { type: "choice", q: "Mama ___ dat bani. (мне)", options: ["mi-a", "îmi a", "mă a"], a: 0,
      explain: "Перед вспомогательным a форма îmi становится mi-: mi-a dat." }
  ]
});
