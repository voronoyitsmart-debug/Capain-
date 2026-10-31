DE.grammar.push({
  id: "demonstrative",
  title: "Указательные местоимения (acest/acesta, acel/acela, același, ăsta, ăla)",
  level: "B1",
  emoji: "👉",
  summary: "această carte = cartea aceasta = cartea asta — «эта книга» тремя способами",
  content: `<p>«Этот» и «тот» в румынском можно поставить <b>до</b> существительного или <b>после</b> него. От места зависит форма.</p>
<h3>Acest — «этот»</h3>
<table>
<tr><th></th><th>перед сущ. (без артикля)</th><th>после сущ. (с артиклем) / отдельно</th></tr>
<tr><td>м. и ср. р. ед. ч.</td><td><b>acest</b> om</td><td>omul <b>acesta</b></td></tr>
<tr><td>ж. р. ед. ч.</td><td><b>această</b> carte</td><td>cartea <b>aceasta</b></td></tr>
<tr><td>м. р. мн. ч.</td><td><b>acești</b> oameni</td><td>oamenii <b>aceștia</b></td></tr>
<tr><td>ж. и ср. р. мн. ч.</td><td><b>aceste</b> cărți</td><td>cărțile <b>acestea</b></td></tr>
</table>
<h3>Acel — «тот»</h3>
<table>
<tr><th></th><th>перед сущ.</th><th>после сущ. / отдельно</th></tr>
<tr><td>м. и ср. р. ед. ч.</td><td><b>acel</b> oraș</td><td>orașul <b>acela</b></td></tr>
<tr><td>ж. р. ед. ч.</td><td><b>acea</b> casă</td><td>casa <b>aceea</b></td></tr>
<tr><td>м. р. мн. ч.</td><td><b>acei</b> băieți</td><td>băieții <b>aceia</b></td></tr>
<tr><td>ж. и ср. р. мн. ч.</td><td><b>acele</b> case</td><td>casele <b>acelea</b></td></tr>
</table>
<div class="ex"><b>Această carte e interesantă. = Cartea aceasta e interesantă.</b> — Эта книга интересная.</div>
<div class="ex"><b>Acesta e fratele meu.</b> — Это мой брат. (местоимение без существительного → длинная форма)</div>
<p>Как самостоятельное «это» в книжной речи используется <b>aceasta</b>: <i><b>Aceasta</b> înseamnă că avem o problemă.</i> — Это значит, что у нас проблема. В разговоре то же самое — <b>asta</b>: <i>Asta înseamnă…</i></p>
<div class="ex"><b>Vezi casa aceea de pe deal? Acolo locuiește bunica.</b> — Видишь тот дом на холме? Там живёт бабушка.</div>
<p>Род./дат. падеж: <b>acestui</b> băiat, <b>acestei</b> fete, <b>acestor</b> oameni (и acelui, acelei, acelor). После существительного: băiatului <b>acestuia</b>, fetei <b>acesteia</b>.</p>
<h3>Același — «тот же самый»</h3>
<p><b>același</b> (м.), <b>aceeași</b> (ж., три «е»!), <b>aceiași</b> (м. мн.), <b>aceleași</b> (ж. мн.): <i>Locuim în <b>același</b> oraș. Avem <b>aceeași</b> profesoară.</i></p>
<h3>Разговорные формы: ăsta, ăla</h3>
<table>
<tr><th></th><th>этот</th><th>тот</th></tr>
<tr><td>м. ед.</td><td>omul <b>ăsta</b></td><td>omul <b>ăla</b></td></tr>
<tr><td>ж. ед.</td><td>casa <b>asta</b></td><td>casa <b>aia</b></td></tr>
<tr><td>м. мн.</td><td>băieții <b>ăștia</b></td><td>băieții <b>ăia</b></td></tr>
<tr><td>ж. мн.</td><td>casele <b>astea</b></td><td>casele <b>alea</b></td></tr>
</table>
<p>Они стоят <b>только после</b> существительного. В устной речи их слышно постоянно: <i>Ce e <b>asta</b>?</i> — Что это?</p>
<div class="warn">Не путайте: <b>aceea</b> (та, ж. р.) и <b>aceia</b> (те, м. р.). А <b>de aceea</b> = «поэтому»: <i>Sunt obosit, de aceea rămân acasă.</i></div>
<div class="tip">💡 Простое правило: «короткое слово — вперёд, длинное — назад». <b>Acest</b> om, но omul <b>acesta</b>. Существительное после указательного — без артикля, перед ним — с артиклем.</div>`,
  exercises: [
    { type: "choice", q: "___ carte e foarte interesantă.", options: ["Această", "Aceasta", "Acest"], a: 0,
      explain: "Перед существительным без артикля → короткая форма; carte — ж. р. → această." },
    { type: "choice", q: "Cartea ___ e foarte interesantă.", options: ["aceasta", "această", "acest"], a: 0,
      explain: "После существительного с артиклем → длинная форма: cartea aceasta." },
    { type: "input", q: "___ oameni sunt vecinii mei. (эти, перед сущ.)", a: ["Acești"],
      explain: "Oameni — м. р. мн. ч., без артикля → acești." },
    { type: "input", q: "Băieții ___ sunt frați. (те, после сущ.)", a: ["aceia"],
      explain: "«Те» после существительного, м. р. мн. ч. → aceia (не путать с aceea — «та»)." },
    { type: "choice", q: "Locuim în ___ oraș.", options: ["același", "aceeași", "aceiași"], a: 0,
      explain: "Oraș — ср. р., в ед. ч. как мужской → același («в том же городе»)." },
    { type: "input", q: "Avem ___ profesoară. (та же)", a: ["aceeași"],
      explain: "Ж. р. ед. ч. → aceeași, с тремя «е» подряд." },
    { type: "choice", q: "Mașina ___ e a mea. (эта, разговорное)", options: ["asta", "ăsta", "ăștia"], a: 0,
      explain: "Mașina — ж. р. ед. ч. → asta. Ăsta — м. р., ăștia — м. р. мн. ч." },
    { type: "choice", q: "Dă-i cartea ___ fete.", options: ["acestei", "această", "acestui"], a: 0,
      explain: "Дательный («этой девушке»), ж. р. → acestei (м. р. было бы acestui)." },
    { type: "order", words: ["Îmi", "plac", "pantofii", "ăștia"], ru: "Мне нравятся эти туфли.",
      alts: [["pantofii", "ăștia", "Îmi", "plac"]],
      explain: "Разговорное ăștia стоит только после существительного с артиклем: pantofii ăștia." },
    { type: "input", q: "Nu am timp, de ___ nu vin. (поэтому)", a: ["aceea"],
      explain: "De aceea = «поэтому» — устойчивое выражение с формой aceea." },
    { type: "choice", q: "Ce e ___? (это, разговорное)", options: ["asta", "ăștia", "acest"], a: 0,
      explain: "Нейтральное «это» без существительного в разговоре — asta. Acest всегда требует существительного после себя." },
    { type: "input", q: "___ este sora mea. (это — нейтрально-книжное, о женщине)", a: ["Aceasta"],
      explain: "Без существительного → длинная форма; о женщине → aceasta." },
    { type: "order", words: ["Casa", "aceea", "este", "foarte", "veche"], ru: "Тот дом очень старый.",
      alts: [["este", "foarte", "veche", "Casa", "aceea"]],
      explain: "Существительное с артиклем + длинная форма: casa aceea («тот дом»)." },
    { type: "choice", q: "Am vorbit cu ___ studenți.", options: ["acei", "aceia", "acea"], a: 0,
      explain: "Перед существительным без артикля, м. р. мн. ч. → acei. Aceia ставится после: studenții aceia." }
  ]
});
