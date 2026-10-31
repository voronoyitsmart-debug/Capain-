DE.grammar.push({
  id: "infinitiv_lung",
  title: "Длинный инфинитив и номинализация",
  level: "B2",
  emoji: "📜",
  summary: "a citi → citire, a pleca → plecare, a hotărî → hotărâre: глагол становится существительным",
  content: `<p>У румынского глагола два инфинитива: <b>короткий</b> (a citi — читать) и <b>длинный</b> (citire). Сегодня длинный инфинитив — это обычное <b>существительное женского рода</b>, обозначающее действие или его результат: «чтение», «отъезд», «решение».</p>

<h3>Образование по спряжениям</h3>
<table>
<tr><th>Инфинитив</th><th>Суффикс</th><th>Существительное</th><th>С артиклем</th><th>Мн. ч.</th></tr>
<tr><td>a plec<b>a</b></td><td>-are</td><td>plecare</td><td>plecarea</td><td>plecări</td></tr>
<tr><td>a ved<b>ea</b></td><td>-ere</td><td>vedere</td><td>vederea</td><td>vederi</td></tr>
<tr><td>a merg<b>e</b></td><td>-ere</td><td>mergere</td><td>mergerea</td><td>—</td></tr>
<tr><td>a cit<b>i</b></td><td>-ire</td><td>citire</td><td>citirea</td><td>citiri</td></tr>
<tr><td>a hotăr<b>î</b></td><td>-âre</td><td>hotărâre</td><td>hotărârea</td><td>hotărâri</td></tr>
</table>
<p>Обратите внимание: <b>-î</b> в конце слова превращается в <b>-â-</b> внутри: a coborî → coborâre.</p>

<h3>Слова с самостоятельным значением</h3>
<p>Многие длинные инфинитивы стали просто словами словаря:</p>
<table>
<tr><th>Глагол</th><th>Существительное</th></tr>
<tr><td>a avea (иметь)</td><td>avere — имущество, состояние</td></tr>
<tr><td>a putea (мочь)</td><td>putere — сила, власть</td></tr>
<tr><td>a părea (казаться)</td><td>părere — мнение</td></tr>
<tr><td>a plăcea (нравиться)</td><td>plăcere — удовольствие</td></tr>
<tr><td>a mânca (есть)</td><td>mâncare — еда</td></tr>
</table>

<h3>Номинальный стиль</h3>
<p>В официальных текстах, новостях и объявлениях придаточные предложения часто заменяют существительными. Дополнение после такого существительного ставится в <b>родительном падеже</b>:</p>
<div class="ex"><b>După ce am terminat facultatea…</b> → <b>După terminarea facultății…</b> — После окончания университета…</div>
<div class="ex"><b>Înainte de plecarea trenului</b> — перед отправлением поезда</div>
<div class="ex"><b>Intrarea este interzisă.</b> — Вход запрещён.</div>
<table>
<tr><th>Глагольный стиль</th><th>Номинальный стиль</th></tr>
<tr><td>înainte să plece trenul</td><td>înainte de plecarea trenului</td></tr>
<tr><td>după ce s-a terminat ședința</td><td>după terminarea ședinței</td></tr>
<tr><td>ca să obțină viza</td><td>în vederea obținerii vizei</td></tr>
<tr><td>pentru că a crescut prețul</td><td>din cauza creșterii prețului</td></tr>
</table>
<p>Номинальный стиль короче и типичен для документов, но в живой речи глагольные конструкции звучат естественнее.</p>

<h3>Другой тип: причастие + -ul</h3>
<p>Название занятия можно образовать и от формы причастия с артиклем <b>-ul</b>: <i>fumatul</i> (курение), <i>mersul</i> (ходьба), <i>cititul</i> (чтение как занятие), <i>învățatul</i>.</p>
<div class="ex"><b>Fumatul interzis!</b> — Курить запрещено! <b>Îmi place cititul.</b> — Я люблю читать.</div>

<div class="tip">Длинный инфинитив звучит более официально («citirea textului»), форма на -ul — более разговорно («cititul înainte de culcare»). Все существительные на <span class="hl">-are, -ere, -ire, -âre</span> женского рода: o plecare, plecarea, plecări.</div>`,
  exercises: [
    { type: "input", q: "Ora de ___ a trenului este 8:15. (a pleca)", a: ["plecare"],
      explain: "Глаголы на -a образуют длинный инфинитив на -are: a pleca → plecare." },
    { type: "choice", q: "a vedea → длинный инфинитив:", options: ["vedere", "vedare", "videre"], a: 0,
      explain: "Глаголы на -ea получают -ere: a vedea → vedere." },
    { type: "input", q: "Am luat o ___ importantă. (a hotărî)", a: ["hotărâre"],
      explain: "Глаголы на -î → -âre; в середине слова пишется â: hotărâre." },
    { type: "choice", q: "Am făcut mai multe ___ ale textului.", options: ["citiri", "citire", "citirei"], a: 0,
      explain: "Мн. ч. существительных на -ire — -iri: citire → citiri." },
    { type: "input", q: "După ___ cursurilor, mergem acasă. (a termina, с артиклем)", a: ["terminarea"],
      explain: "a termina → terminare → с артиклем terminarea; за ним — родительный падеж cursurilor." },
    { type: "order", words: ["Intrarea", "este", "interzisă", "după", "ora", "zece"], ru: "Вход запрещён после десяти часов.",
      alts: [["după", "ora", "zece", "Intrarea", "este", "interzisă"]],
      explain: "Intrarea (от a intra) — ж. р., поэтому interzisă. Обстоятельство времени можно поставить в начало." },
    { type: "choice", q: "Как написано на табличке «Курить запрещено»?", options: ["Fumatul interzis!", "Fumarea interzis!", "Fumând interzis!"], a: 0,
      explain: "Устойчивая надпись — Fumatul interzis! Fumatul — существительное от формы fumat + -ul." },
    { type: "input", q: "Îmi face mare ___ să te văd. (a plăcea)", a: ["plăcere"],
      explain: "a plăcea → plăcere (удовольствие): «Мне очень приятно тебя видеть»." },
    { type: "choice", q: "Слово părere (мнение) образовано от глагола:", options: ["a părea", "a pierde", "a apărea"], a: 0,
      explain: "a părea (казаться) → părere: «то, что кажется» = мнение." },
    { type: "order", words: ["Înainte", "de", "plecarea", "trenului", "cumpărăm", "bilete"], ru: "Перед отправлением поезда мы покупаем билеты.",
      alts: [["cumpărăm", "bilete", "Înainte", "de", "plecarea", "trenului"]],
      explain: "Înainte de + существительное с артиклем + родительный падеж (trenului)." },
    { type: "choice", q: "«După ce am terminat facultatea, m-am mutat.» → номинальный стиль:", options: ["După terminarea facultății, m-am mutat.", "După terminarea facultatea, m-am mutat.", "După terminare facultății, m-am mutat."], a: 0,
      explain: "Существительное с артиклем (terminarea) + дополнение в родительном падеже (facultății)." },
    { type: "input", q: "a coborî → ___ (длинный инфинитив)", a: ["coborâre"],
      explain: "-î в конце глагола → -âre: coborâre (спуск, выход из транспорта)." },
    { type: "choice", q: "a merge → длинный инфинитив:", options: ["mergere", "mergare", "mergire"], a: 0,
      explain: "Глаголы на -e (III спряжение) образуют форму на -ere: a merge → mergere." }
  ]
});
