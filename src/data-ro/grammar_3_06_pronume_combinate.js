DE.grammar.push({
  id: "pronume_combinate",
  title: "Сочетания местоимений (mi-l, ți-o, i le, mi l-a dat)",
  level: "B1",
  emoji: "🧩",
  summary: "Mi-l dai? — Da, ți-l dau. Mi l-a dat ieri — «мне его», «тебе её»",
  content: `<p>Когда в фразе есть сразу «кому» и «что» (<i>дай <b>мне его</b></i>), румынские краткие местоимения склеиваются в пару. Порядок всегда один: <b>сначала «кому» (дательный), потом «что» (винительный)</b>.</p>
<div class="ex"><b>— Îmi dai pixul? — Da, ți-l dau.</b> — Дашь мне ручку? — Да, даю (тебе её).</div>
<h3>Таблица пар (перед глаголом в настоящем времени)</h3>
<table>
<tr><th>кому / что</th><th>его (îl)</th><th>её (o)</th><th>их, м. (îi)</th><th>их, ж. (le)</th></tr>
<tr><td>мне</td><td>mi-l</td><td>mi-o</td><td>mi-i</td><td>mi le</td></tr>
<tr><td>тебе</td><td>ți-l</td><td>ți-o</td><td>ți-i</td><td>ți le</td></tr>
<tr><td>ему / ей</td><td>i-l</td><td>i-o</td><td>i-i</td><td>i le</td></tr>
<tr><td>нам</td><td>ni-l</td><td>ni-o</td><td>ni-i</td><td>ni le</td></tr>
<tr><td>вам</td><td>vi-l</td><td>vi-o</td><td>vi-i</td><td>vi le</td></tr>
<tr><td>им</td><td><span class="hl">li</span>-l</td><td><span class="hl">li</span>-o</td><td><span class="hl">li</span>-i</td><td><span class="hl">li</span> le</td></tr>
</table>
<p>Что меняется: îmi → <b>mi</b>, îți → <b>ți</b>, îi → <b>i</b>, ne → <b>ni</b>, vă → <b>vi</b>, le → <b>li</b>. Все «кому» заканчиваются на <b>-i</b> — это легко запомнить.</p>
<h3>В прошедшем (perfect compus)</h3>
<p>Мужской род и множественное число цепляются к вспомогательному глаголу, а <b>o</b> («её») уходит в конец, после причастия:</p>
<table>
<tr><th>что</th><th>пример</th><th>перевод</th></tr>
<tr><td>его</td><td><b>Mi l-a dat</b> ieri.</td><td>Он дал мне его вчера.</td></tr>
<tr><td>их (м.)</td><td><b>Ți i-am trimis.</b></td><td>Я тебе их отправил.</td></tr>
<tr><td>их (ж.)</td><td><b>I le-am arătat.</b></td><td>Я ему их показал.</td></tr>
<tr><td>её</td><td><b>Mi-a dat-o</b> ieri.</td><td>Он дал мне её вчера.</td></tr>
</table>
<h3>Повелительное наклонение</h3>
<p>В утвердительном императиве пара идёт <b>после</b> глагола через дефисы: <i><b>Dă-mi-l!</b></i> (Дай мне его!), <i><b>Spune-i-o!</b></i> (Скажи ему это!). В отрицательном — снова перед: <i><b>Nu mi-l da!</b></i></p>
<div class="ex"><b>Vreau să ți-o arăt.</b> — Я хочу тебе её показать.</div>
<div class="ex"><b>— Le-ai dat copiilor bomboanele? — Da, li le-am dat.</b> — Ты дал детям конфеты? — Да, я им их дал.</div>
<div class="tip">💡 Правило «<b>кому — первым</b>»: как в русском «дай <i>мне</i> его», а не «дай его мне». Если запутались — сначала подумайте, кто получает (mi, ți, i, ni, vi, li), потом — что именно (l, o, i, le).</div>`,
  exercises: [
    { type: "choice", q: "— Îmi dai cartea? — Da, ___ dau.", options: ["ți-o", "ți-l", "mi-o"], a: 0,
      explain: "Тебе (ți) + её (o, cartea — ж. р.) → ți-o dau." },
    { type: "choice", q: "— Îi dai pixul lui Ion? — Da, ___ dau.", options: ["i-l", "i-o", "îl-i"], a: 0,
      explain: "Ему (i) + его (l, pixul — м. р.): сначала «кому», потом «что» → i-l dau." },
    { type: "input", q: "— Ne trimiteți pachetul? — Da, ___ trimitem. (вам его)", a: ["vi-l"],
      explain: "Vă перед местоимением «его» превращается в vi: vi-l." },
    { type: "input", q: "— Le dai florile copiilor? — Da, ___ dau. (им их)", a: ["li le"],
      explain: "Le («им») перед винительным → li; «их» (flori — ж. р.) → le: li le dau." },
    { type: "choice", q: "— Cine ți-a dat ceasul? — Mama ___ dat.", options: ["mi l-a", "mi-a l", "mi-l a"], a: 0,
      explain: "В perfect compus «его» цепляется к вспомогательному: mi + l-a → mi l-a dat." },
    { type: "input", q: "— Ți-a dat Ana rețeta? — Da, ___. (дала мне её, perfect compus)", a: ["mi-a dat-o"],
      explain: "Местоимение o («её») в perfect compus стоит после причастия: mi-a dat-o." },
    { type: "order", words: ["Mi", "l-a", "dat", "ieri"], ru: "Он дал мне его вчера.",
      alts: [["ieri", "Mi", "l-a", "dat"]],
      explain: "Пара mi + l-a стоит вплотную перед причастием; ieri — в начале или в конце." },
    { type: "order", words: ["Vreau", "să", "ți-o", "arăt"], ru: "Я хочу тебе её показать.",
      explain: "После să пара стоит перед глаголом: să ți-o arăt." },
    { type: "choice", q: "Caietul meu e la tine? ___! (дай мне его)", options: ["Dă-mi-l", "Dă-l-mi", "Mi-l dă"], a: 0,
      explain: "Утвердительный императив: глагол + «кому» + «что» через дефисы → Dă-mi-l!" },
    { type: "input", q: "— Le-ai arătat colegilor proiectul? — Da, ___ arătat. (им его)", a: ["li l-am"],
      explain: "Им (li) + его (l-am) → li l-am arătat." },
    { type: "choice", q: "— Ne dați cheile? — Da, ___ dăm.", options: ["vi le", "vă le", "ni le"], a: 0,
      explain: "«Вам их»: vă → vi перед le. Ni le значило бы «нам их»." },
    { type: "order", words: ["I", "le-am", "trimis", "aseară"], ru: "Я ему их (фотографии) отправил вчера вечером.",
      alts: [["aseară", "I", "le-am", "trimis"]],
      explain: "Ему (i) + их, ж. р. (le-am): i le-am trimis. Aseară — в начале или в конце." },
    { type: "choice", q: "Nu ___ da! (не давай мне его)", options: ["mi-l", "-mi-l", "îmi îl"], a: 0,
      explain: "В отрицательном императиве пара стоит перед глаголом: Nu mi-l da!" }
  ]
});
