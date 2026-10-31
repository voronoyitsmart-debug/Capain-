DE.grammar.push({
  id: "genitiv_dativ",
  title: "Родительный и дательный падеж (-ului, -ei, -lor; al/a/ai/ale)",
  level: "B1",
  emoji: "🔑",
  summary: "cartea profesorului, dau mamei flori — одна форма для «кого/чего» и «кому/чему»",
  content: `<p>Хорошая новость: в румынском у существительных <b>родительный (genitiv) и дательный (dativ) совпадают</b>. «Книга <i>учителя</i>» и «даю <i>учителю</i>» — одна и та же форма: <b>profesorului</b>.</p>
<div class="ex"><b>Aceasta este mașina profesorului.</b> — Это машина преподавателя. (genitiv)</div>
<div class="ex"><b>Dau cartea profesorului.</b> — Я отдаю книгу преподавателю. (dativ)</div>
<h3>Окончания с определённым артиклем</h3>
<table>
<tr><th>Род</th><th>Им. падеж</th><th>Род./дат. падеж</th></tr>
<tr><td>м. и ср. р., ед. ч.</td><td>băiatul, trenul, fratele</td><td>băiat<span class="hl">ului</span>, tren<span class="hl">ului</span>, frate<span class="hl">lui</span></td></tr>
<tr><td>ж. р., ед. ч.</td><td>casa, cartea, mama</td><td>case<span class="hl">i</span>, cărți<span class="hl">i</span>, mame<span class="hl">i</span></td></tr>
<tr><td>мн. ч. (все роды)</td><td>băieții, casele, trenurile</td><td>băieți<span class="hl">lor</span>, case<span class="hl">lor</span>, trenuri<span class="hl">lor</span></td></tr>
<tr><td>с неопр. артиклем</td><td>un băiat, o fată, niște prieteni</td><td><b>unui</b> băiat, <b>unei</b> fete, <b>unor</b> prieteni</td></tr>
</table>
<p><b>Женский род</b> строится от формы множественного числа: casă → case → <b>casei</b>; carte → cărți → <b>cărții</b>; floare → flori → <b>florii</b>.</p>
<h3>Имена и местоимения</h3>
<ul>
<li>Мужские имена — со словом <b>lui</b> перед ними: <i>mașina <b>lui Ion</b></i>, <i>dau <b>lui Mihai</b></i>.</li>
<li>Женские имена на -a меняются как существительные: Maria → <b>Mariei</b>, Ana → <b>Anei</b>. Остальные — с lui: <i>lui Carmen</i>.</li>
<li>«Его / её / их» после существительного: <b>lui</b>, <b>ei</b>, <b>lor</b>: <i>casa lui</i> (его дом), <i>casa ei</i> (её дом), <i>casa lor</i> (их дом).</li>
</ul>
<h3>Притяжательный артикль al / a / ai / ale</h3>
<p>Если перед «владельцем» нет существительного с определённым артиклем, нужна связка. Она согласуется с тем, <b>что принадлежит</b>, а не с владельцем:</p>
<table>
<tr><th></th><th>ед. ч.</th><th>мн. ч.</th></tr>
<tr><td>м. р. (и ср. р. ед. ч.)</td><td><b>al</b> — un prieten al Mariei</td><td><b>ai</b> — niște prieteni ai Mariei</td></tr>
<tr><td>ж. р. (и ср. р. мн. ч.)</td><td><b>a</b> — o prietenă a Mariei</td><td><b>ale</b> — niște cărți ale Mariei</td></tr>
</table>
<div class="ex"><b>Cartea profesorului</b> — без связки (casa, cartea… уже с артиклем). <b>O carte a profesorului</b> — со связкой.</div>
<div class="ex"><b>Mașina aceasta este a fratelui meu.</b> — Эта машина — моего брата.</div>
<h3>Дательный с местоимением-дублем</h3>
<p>При дательном почти всегда добавляют краткое местоимение <b>îi</b> (ед. ч.) или <b>le</b> (мн. ч.): <i><b>Îi</b> dau mamei flori.</i> — Я дарю маме цветы. <i><b>Le</b> scriu prietenilor.</i> — Я пишу друзьям.</p>
<p>Некоторые предлоги требуют родительного: <i>în fața casei</i> (перед домом), <i>în spatele școlii</i> (за школой), <i>din cauza ploii</i> (из-за дождя).</p>
<div class="tip">💡 Запомните тройку <b>-ului / -ei / -lor</b> — и вы знаете оба падежа сразу. А связка al/a/ai/ale «смотрит» на предмет: <i>un prieten <b>al</b> Mariei</i> — prieten мужского рода, хотя Maria — женщина.</div>`,
  exercises: [
    { type: "choice", q: "Aceasta este mașina ___. (profesorul, ед. ч.)", options: ["profesorului", "profesorul", "profesorlui"], a: 0,
      explain: "Мужской род ед. ч.: -ul → -ului: profesorul → profesorului («машина преподавателя»)." },
    { type: "input", q: "Culoarea ___ este albastră. (casa)", a: ["casei"],
      explain: "Женский род: форма от мн. ч. case + -i → casei («цвет дома»)." },
    { type: "choice", q: "Am vorbit cu sora ___ Ion.", options: ["lui", "a", "al"], a: 0,
      explain: "Перед мужским именем в родительном ставится lui: sora lui Ion — сестра Иона." },
    { type: "choice", q: "Andrei este un prieten ___ Mariei.", options: ["al", "a", "ai"], a: 0,
      explain: "Связка согласуется с предметом обладания: un prieten — м. р. ед. ч. → al." },
    { type: "choice", q: "Pe masă sunt niște cărți ___ băiatului.", options: ["ale", "al", "a"], a: 0,
      explain: "Cărți — ж. р. мн. ч., перед ним нет артикля → нужна связка ale." },
    { type: "input", q: "Îi dau flori ___. (mama, с артиклем)", a: ["mamei"],
      explain: "Дательный ж. р.: mamă → mame + -i → mamei. Дубль îi подсказывает дательный." },
    { type: "input", q: "Profesorul le explică ___ regula. (elevii)", a: ["elevilor"],
      explain: "Множественное число в род./дат. падеже: -lor → elevilor. Le — дубль во мн. ч." },
    { type: "choice", q: "Telefonul ___ este nou. (её телефон)", options: ["ei", "ea", "îi"], a: 0,
      explain: "«Её» после существительного — ei: telefonul ei. Ea — «она», îi — «ей» перед глаголом." },
    { type: "order", words: ["Îi", "dau", "cartea", "profesorului"], ru: "Я отдаю книгу преподавателю.",
      alts: [["Îi", "dau", "profesorului", "cartea"]],
      explain: "Дубль îi стоит перед глаголом; дополнения cartea и profesorului можно поменять местами." },
    { type: "input", q: "Ea este o prietenă ___ mea.", a: ["a"],
      explain: "O prietenă — ж. р. ед. ч. без артикля перед притяжательным → связка a." },
    { type: "choice", q: "Mergem la casa ___ noștri.", options: ["prietenilor", "prietenului", "prieteni"], a: 0,
      explain: "Noștri — мн. ч., значит, и существительное во мн. ч. род. падежа: prietenilor." },
    { type: "choice", q: "Am cumpărat un cadou ___ copil.", options: ["unui", "unei", "unor"], a: 0,
      explain: "Неопределённый артикль в дательном: unui — м. р. ед. ч. (unei — ж. р., unor — мн. ч.)." },
    { type: "input", q: "Te aștept în fața ___. (școala)", a: ["școlii"],
      explain: "În fața требует родительного: școală → școli + -i → școlii." },
    { type: "order", words: ["Fratele", "Mariei", "lucrează", "la", "bancă"], ru: "Брат Марии работает в банке.",
      alts: [["la", "bancă", "lucrează", "Fratele", "Mariei"], ["lucrează", "la", "bancă", "Fratele", "Mariei"]],
      explain: "Женское имя на -a в родительном получает -ei: Maria → Mariei, связка не нужна после fratele." }
  ]
});
