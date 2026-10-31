DE.grammar.push({
  id: "pasiv",
  title: "Пассив: a fi + причастие и пассив с «se»",
  level: "B2",
  emoji: "🔄",
  summary: "Casa a fost construită de bunicul. Se vând case. — причастие согласуется с подлежащим",
  content: `<p>Пассив (<b>diateza pasivă</b>) показывает, что действие совершается <i>над</i> подлежащим. В румынском есть два способа его выразить.</p>

<h3>1. a fi + причастие (participiu)</h3>
<p>Спрягается только <b>a fi</b>, а причастие ведёт себя как прилагательное и <b>согласуется с подлежащим</b> в роде и числе. Деятель вводится предлогом <b>de</b> (официально — <b>de către</b>).</p>
<table>
<tr><th>Подлежащее</th><th>a construi</th><th>a scrie</th><th>a lăuda</th></tr>
<tr><td>м. р. / ср. р. ед. ч.</td><td>construit</td><td>scris</td><td>lăudat</td></tr>
<tr><td>ж. р. ед. ч.</td><td>construit<b>ă</b></td><td>scris<b>ă</b></td><td>lăudat<b>ă</b></td></tr>
<tr><td>м. р. мн. ч.</td><td>construi<b>ți</b></td><td>scri<b>și</b></td><td>lăuda<b>ți</b></td></tr>
<tr><td>ж. р. / ср. р. мн. ч.</td><td>construit<b>e</b></td><td>scris<b>e</b></td><td>lăudat<b>e</b></td></tr>
</table>
<div class="ex"><b>Podul este construit de o firmă străină.</b> — Мост строится иностранной фирмой.</div>
<div class="ex"><b>Scrisoarea a fost trimisă ieri.</b> — Письмо было отправлено вчера.</div>
<div class="ex"><b>Studenții au fost lăudați de profesor.</b> — Студентов похвалил преподаватель.</div>

<h3>Времена пассива</h3>
<table>
<tr><th>Время</th><th>Форма (casa — ж. р.)</th><th>Перевод</th></tr>
<tr><td>prezent</td><td>casa <b>este</b> construită</td><td>дом строится / построен</td></tr>
<tr><td>perfect compus</td><td>casa <b>a fost</b> construită</td><td>дом был построен</td></tr>
<tr><td>imperfect</td><td>casa <b>era</b> construită</td><td>дом строился / был построен</td></tr>
<tr><td>viitor</td><td>casa <b>va fi</b> construită</td><td>дом будет построен</td></tr>
<tr><td>condițional</td><td>casa <b>ar fi</b> construită</td><td>дом был бы построен</td></tr>
<tr><td>conjunctiv</td><td>… ca casa <b>să fie</b> construită</td><td>чтобы дом был построен</td></tr>
</table>
<p>Обратите внимание: в perfect compus <b>fost</b> не меняется, согласуется только последнее причастие: <i>casele au fost construit<b>e</b></i>.</p>

<h3>2. Пассив с «se» (pasivul reflexiv)</h3>
<p>Очень частая, особенно в разговоре и в объявлениях, конструкция: <b>se + глагол в 3-м лице</b>. Деятель обычно не называется. Глагол <b>согласуется с подлежащим</b>: ед. ч. — <i>se vinde</i>, мн. ч. — <i>se vând</i>.</p>
<div class="ex"><b>Se vinde casa.</b> — Дом продаётся.<br><b>Se vând case.</b> — Продаются дома.</div>
<div class="ex"><b>Se închiriază apartament.</b> — Сдаётся квартира.<br><b>Aici se vorbește limba română.</b> — Здесь говорят по-румынски.</div>
<p>Без подлежащего та же конструкция становится безличной: <i>Aici se lucrează mult</i> — Здесь много работают.</p>

<div class="tip">Проверяйте согласование в объявлениях: <span class="hl">Se vinde mașina</span>, но <span class="hl">Se vând mașini</span>. Форма «se vinde mașini» встречается в разговоре, но по норме — ошибка. В пассиве с a fi ищите подлежащее и ставьте причастие в его род и число, как прилагательное.</div>
<div class="warn">С пассивом на «se» деятеля (de…) обычно не называют. Если важно, <i>кто</i> сделал, используйте a fi + причастие: <i>Romanul a fost scris de Rebreanu</i>.</div>`,
  exercises: [
    { type: "choice", q: "Scrisoarea a fost ___ ieri.", options: ["trimisă", "trimis", "trimise"], a: 0,
      explain: "Scrisoare — женский род, ед. ч., поэтому причастие trimis получает окончание -ă: trimisă." },
    { type: "input", q: "Cărțile sunt ___ de toți elevii. (a citi)", a: ["citite"],
      explain: "Cărți — ж. р. мн. ч.: citit → citite." },
    { type: "choice", q: "În acest magazin ___ legume proaspete.", options: ["se vând", "se vinde", "se vândă"], a: 0,
      explain: "Legume — мн. ч., поэтому глагол в пассиве с se тоже во мн. ч.: se vând." },
    { type: "order", words: ["Romanul", "a", "fost", "scris", "de", "Liviu", "Rebreanu"], ru: "Роман был написан Ливиу Ребряну.",
      explain: "Пассив: a fost + причастие (romanul — ср./м. р. ед. ч. → scris), деятель вводится через de." },
    { type: "input", q: "Studenții au fost ___ de profesor. (a lăuda)", a: ["lăudați"],
      explain: "Studenți — м. р. мн. ч.: lăudat → lăudați (t → ț перед -i)." },
    { type: "choice", q: "Podurile ___ construite în 1990.", options: ["au fost", "a fost", "este"], a: 0,
      explain: "Подлежащее podurile — мн. ч., поэтому вспомогательный глагол au fost; fost не изменяется." },
    { type: "input", q: "___ apartament cu două camere. (a închiria — пассив с se, наст. вр.)", a: ["Se închiriază"],
      explain: "Типичное объявление: se + 3 л. ед. ч. (apartament — ед. ч.): Se închiriază apartament — Сдаётся квартира." },
    { type: "choice", q: "Legea ___ votată de Parlament săptămâna viitoare.", options: ["va fi", "a fost", "era"], a: 0,
      explain: "«Săptămâna viitoare» — будущее, поэтому va fi + причастие: va fi votată." },
    { type: "order", words: ["Aici", "se", "vorbește", "limba", "română"], ru: "Здесь говорят по-румынски.",
      alts: [["limba", "română", "se", "vorbește", "Aici"], ["se", "vorbește", "limba", "română", "Aici"]],
      explain: "Пассив с se: se vorbește limba română (подлежащее limba — ед. ч.). Обстоятельство aici может стоять в начале или в конце." },
    { type: "choice", q: "Poliția a arestat hoții. → Пассив:", options: ["Hoții au fost arestați de poliție.", "Hoții a fost arestat de poliție.", "Hoții au fost arestate de poliție."], a: 0,
      explain: "Hoții — м. р. мн. ч.: au fost + arestați; деятель — de poliție." },
    { type: "input", q: "Ușa trebuie să fie ___ seara. (a închide)", a: ["închisă"],
      explain: "Ușă — ж. р. ед. ч., причастие închis → închisă." },
    { type: "choice", q: "În cartierul nostru se ___ multe case noi. (a construi)", options: ["construiesc", "construiește", "construit"], a: 0,
      explain: "Подлежащее «multe case noi» — мн. ч., поэтому se construiesc." },
    { type: "order", words: ["Casa", "va", "fi", "renovată", "anul", "viitor"], ru: "Дом будет отремонтирован в следующем году.",
      alts: [["anul", "viitor", "Casa", "va", "fi", "renovată"]],
      explain: "Будущее в пассиве: va fi + причастие, согласованное с casa (ж. р.) → renovată." }
  ]
});
