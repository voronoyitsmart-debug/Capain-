DE.grammar.push({
  id: "conectori_avansati",
  title: "Сложные связки: totuși, ci, ba chiar, întrucât…",
  level: "C1",
  emoji: "🔗",
  summary: "ci после отрицания, nici… nici, fie… fie, cu toate că, întrucât, astfel încât",
  content: `<p>Связки делают речь логичной и «взрослой». На уровне C1 важно не только знать их, но и чувствовать стиль: разговорный или книжный.</p>

<h3>Противопоставление и уступка</h3>
<table>
<tr><th>Связка</th><th>Перевод</th><th>Пример</th></tr>
<tr><td><b>dar</b></td><td>но</td><td>E scump, dar merită.</td></tr>
<tr><td><b>însă</b></td><td>однако</td><td>El, însă, a refuzat.</td></tr>
<tr><td><b>totuși</b></td><td>всё-таки, тем не менее</td><td>Era obosit; totuși, a venit.</td></tr>
<tr><td><b>deși / cu toate că</b></td><td>хотя</td><td>Cu toate că ploua, am ieșit.</td></tr>
<tr><td><b>chiar dacă</b></td><td>даже если</td><td>Vin chiar dacă plouă.</td></tr>
<tr><td><b>pe când / în timp ce</b></td><td>тогда как</td><td>Eu muncesc, pe când el doarme.</td></tr>
</table>

<h3>Ci — «а» после отрицания</h3>
<p><b>Ci</b> исправляет отрицаемое: «не X, а Y». Используется <b>только после отрицания</b>. Если отрицания нет — <b>dar</b>.</p>
<div class="ex"><b>Nu vreau ceai, ci cafea.</b> — Я хочу не чай, а кофе.<br><b>Nu numai că a venit, ci a și adus flori.</b> — Он не только пришёл, но и принёс цветы.</div>

<h3>Нарастание, перечисление, выбор</h3>
<table>
<tr><th>Связка</th><th>Перевод</th><th>Пример</th></tr>
<tr><td><b>ba chiar</b></td><td>и даже</td><td>Filmul e bun, ba chiar excelent.</td></tr>
<tr><td><b>ba mai mult</b></td><td>более того</td><td>Ba mai mult, a mințit.</td></tr>
<tr><td><b>nici… nici</b></td><td>ни… ни</td><td>Nu beau nici cafea, nici ceai.</td></tr>
<tr><td><b>fie… fie</b></td><td>либо… либо</td><td>Venim fie azi, fie mâine.</td></tr>
<tr><td><b>ori… ori / sau… sau</b></td><td>или… или (разг.)</td><td>Ori vii, ori rămâi.</td></tr>
</table>
<div class="warn">При <b>nici… nici</b> глагол тоже отрицается (двойное отрицание, как в русском): <i>Nici Ion, nici Maria <b>n-au</b> venit.</i></div>

<h3>Причина и следствие</h3>
<table>
<tr><th>Связка</th><th>Перевод</th><th>Стиль</th></tr>
<tr><td><b>pentru că, fiindcă</b></td><td>потому что</td><td>нейтральный</td></tr>
<tr><td><b>deoarece, întrucât</b></td><td>так как, поскольку</td><td>книжный, официальный</td></tr>
<tr><td><b>din moment ce</b></td><td>раз уж</td><td>нейтральный</td></tr>
<tr><td><b>așa că, deci</b></td><td>так что, значит</td><td>разговорный</td></tr>
<tr><td><b>astfel încât</b></td><td>так что / так, чтобы</td><td>книжный</td></tr>
<tr><td><b>prin urmare</b></td><td>следовательно</td><td>книжный</td></tr>
</table>
<p><b>Astfel încât</b> + индикатив — результат; + <b>să</b> + конъюнктив — цель:</p>
<div class="ex"><b>A plouat mult, astfel încât drumurile au fost închise.</b> — Шёл сильный дождь, так что дороги закрыли.<br><b>A vorbit rar, astfel încât să înțeleagă toți.</b> — Он говорил медленно, чтобы все поняли.</div>
<div class="ex"><b>Întrucât nu ați răspuns în termen, cererea a fost respinsă.</b> — Поскольку вы не ответили в срок, заявление отклонено.</div>

<div class="tip">Быстрая проверка для <span class="hl">ci</span> и <span class="hl">dar</span>: если перед связкой есть «nu» и вы заменяете одно другим («не это, а то») — ci. Если оба утверждения верны одновременно («дорого, но стоит того») — dar.</div>`,
  exercises: [
    { type: "choice", q: "Nu vreau ceai, ___ cafea.", options: ["ci", "dar", "însă"], a: 0,
      explain: "После отрицания, когда одно заменяется другим («не чай, а кофе»), используется ci." },
    { type: "choice", q: "E scump, ___ merită.", options: ["dar", "ci", "nici"], a: 0,
      explain: "Отрицания нет, оба утверждения верны — нужен dar." },
    { type: "input", q: "Nu numai că a venit, ___ a și adus flori.", a: ["ci"],
      explain: "Устойчивая пара nu numai… ci și — «не только… но и»." },
    { type: "choice", q: "Nici Ion, ___ Maria n-au venit.", options: ["nici", "fie", "ci"], a: 0,
      explain: "Парная связка nici… nici — «ни… ни»; глагол тоже с отрицанием: n-au venit." },
    { type: "choice", q: "Putem vorbi fie azi, ___ mâine.", options: ["fie", "nici", "ci"], a: 0,
      explain: "Fie… fie — «либо… либо»: выбор между двумя вариантами." },
    { type: "input", q: "___ era obosit, a terminat lucrarea. (хотя — 3 слова)", a: ["Cu toate că"],
      explain: "Cu toate că = deși — «хотя»: уступка." },
    { type: "choice", q: "Era obosit; ___, a mers la petrecere.", options: ["totuși", "ci", "întrucât"], a: 0,
      explain: "Totuși — «тем не менее»: действие вопреки сказанному ранее." },
    { type: "choice", q: "___ nu ați răspuns în termen, cererea a fost respinsă.", options: ["Întrucât", "Deși", "Totuși"], a: 0,
      explain: "Нужна причина («поскольку»), в официальном стиле — întrucât." },
    { type: "order", words: ["A", "vorbit", "rar,", "astfel", "încât", "să", "înțeleagă", "toți"], ru: "Он говорил медленно, чтобы все поняли.",
      explain: "Astfel încât + să + конъюнктив выражает цель." },
    { type: "input", q: "Filmul e bun, ___ excelent! (и даже)", a: ["ba chiar"],
      explain: "Ba chiar — «и даже»: усиление предыдущего утверждения." },
    { type: "order", words: ["Nu", "beau", "nici", "cafea,", "nici", "ceai"], ru: "Я не пью ни кофе, ни чая.",
      explain: "Nici… nici с отрицанием при глаголе: nu beau nici…, nici…." },
    { type: "choice", q: "A plouat mult, ___ drumurile au fost închise.", options: ["astfel încât", "deși", "ci"], a: 0,
      explain: "Astfel încât + индикатив выражает следствие: «так что дороги закрыли»." },
    { type: "choice", q: "___ tot ești aici, ajută-mă puțin.", options: ["Din moment ce", "Cu toate că", "Nici"], a: 0,
      explain: "Din moment ce — «раз уж»: причина, известная собеседнику." },
    { type: "choice", q: "Какой вариант правильный?", options: ["El, însă, a refuzat.", "El, ci, a refuzat.", "El, totuși că, a refuzat."], a: 0,
      explain: "Însă может стоять внутри предложения, выделенное запятыми; ci — только после отрицания, а «totuși că» не существует." }
  ]
});
