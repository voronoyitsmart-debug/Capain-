DE.grammar.push({
  id: "imperativ",
  title: "Повелительное наклонение (vino!, nu veni!)",
  level: "A2",
  emoji: "❗",
  summary: "citește!, mergi!, vino!; nu + инфинитив: nu pleca!; voi: plecați!; să mergem!",
  content: `<h3>Ты: утвердительная форма</h3>
<p>Обычно берём форму <b>el</b> из настоящего времени. У непереходных глаголов II–IV групп (без прямого дополнения) — форму <b>tu</b>.</p>
<table>
<tr><th>Правило</th><th>Примеры</th></tr>
<tr><td>как <b>el</b>: I группа и глаголы на -ește</td><td>lucrează! ascultă! așteaptă! citește! vorbește!</td></tr>
<tr><td>как <b>el</b>: переходные (что?)</td><td>scrie! deschide! închide!</td></tr>
<tr><td>как <b>tu</b>: непереходные</td><td>mergi! dormi! fugi! ieși! taci!</td></tr>
<tr><td>особые формы</td><td>a veni → <b>vino!</b>, a fi → <b>fii!</b>, a face → <b>fă!</b>, a zice → <b>zi!</b>, a duce → <b>du!</b>, a da → <b>dă!</b>, a lua → <b>ia!</b>, a sta → <b>stai!</b></td></tr>
</table>

<h3>Ты: «не делай!» = nu + инфинитив</h3>
<p>Очень просто: <b>nu</b> + инфинитив без a: <b>Nu pleca! Nu vorbi! Nu veni! Nu fi trist!</b> Особые формы здесь не нужны: <b>vino!</b>, но <b>nu veni!</b>; <b>fă!</b>, но <b>nu face!</b></p>
<div class="tip">Похоже на русские надписи «Не курить!», «Не входить!» — только в румынском так говорят и человеку на «ты»: <b>Nu fuma!</b> — Не кури!</div>

<h3>Вы (voi и вежливое dumneavoastră)</h3>
<p>Форма совпадает с настоящим временем voi — и в утверждении, и в отрицании: <b>Intrați! Nu plecați! Mergeți! Faceți!</b> Исключение: a fi → <b>fiți!</b> (не «sunteți!»).</p>

<h3>Давайте… / пусть…</h3>
<p>Через конъюнктив: <b>Să mergem!</b> или <b>Hai să mergem!</b> — Давай(те) пойдём! <b>Să intre!</b> — Пусть войдёт!</p>

<h3>Местоимения</h3>
<table>
<tr><th>Утверждение — после, через дефис</th><th>Отрицание — перед глаголом</th></tr>
<tr><td>Ajută-mă!</td><td>Nu mă ajuta!</td></tr>
<tr><td>Spune-mi!</td><td>Nu-mi spune!</td></tr>
<tr><td>Uită-te!</td><td>Nu te uita!</td></tr>
<tr><td>Ascultați-mă!</td><td>Nu mă ascultați!</td></tr>
</table>

<div class="ex"><b>Vino aici, te rog!</b> — Иди сюда, пожалуйста!</div>
<div class="ex"><b>Nu-ți face griji!</b> — Не волнуйся!</div>
<div class="ex"><b>Luați loc, vă rog!</b> — Садитесь, пожалуйста!</div>
<div class="ex"><b>Hai să mâncăm!</b> — Давай поедим!</div>

<div class="warn">Не путайте: <b>Vino!</b> (иди сюда) — но <b>Nu veni!</b> (не приходи). <b>Fii atent!</b> (будь внимателен) — но <b>Nu fi supărat!</b> (не сердись).</div>`,
  exercises: [
    { type: "choice", q: "___ aici! (a veni, ты)", options: ["Vino", "Vine", "Veni"], a: 0,
      explain: "a veni — особая форма повелительного: vino!" },
    { type: "choice", q: "Nu ___! (a pleca, ты)", options: ["pleca", "pleacă", "plecă"], a: 0,
      explain: "Запрет для tu: nu + инфинитив без a — nu pleca!" },
    { type: "input", q: "___ cartea! (a citi, ты)", a: ["citește"],
      explain: "Глаголы на -esc: повелительное как форма el — citește!" },
    { type: "input", q: "Nu ___ trist! (a fi, ты)", a: ["fi"],
      explain: "Отрицание для tu — nu + инфинитив: nu fi trist! (утвердительно было бы fii!)" },
    { type: "choice", q: "___ atenți, copii! (a fi, вы)", options: ["Fiți", "Sunteți", "Fii"], a: 0,
      explain: "a fi в повелительном для voi — fiți! (не sunteți). Fii — для tu." },
    { type: "choice", q: "___ adevărul! (скажи мне)", options: ["Spune-mi", "Spui-mi", "Mi spune"], a: 0,
      explain: "В утвердительном повелительном местоимение ставится после глагола через дефис: spune-mi!" },
    { type: "input", q: "Hai să ___ la film! (давай пойдём)", a: ["mergem"],
      explain: "«Давай(те)…» — să + конъюнктив noi: hai să mergem!" },
    { type: "choice", q: "Nu ___ uita la televizor! (ты)", options: ["te", "-te", "tu"], a: 0,
      explain: "В отрицании местоимение стоит перед глаголом без дефиса: nu te uita!" },
    { type: "choice", q: "___ temele! (a face, ты)", options: ["Fă", "Face", "Faci"], a: 0,
      explain: "a face — особая форма: fă! (в отрицании: nu face!)." },
    { type: "order", words: ["Nu", "mă", "întrerupe!"], ru: "Не перебивай меня!",
      explain: "Отрицание: nu + местоимение + инфинитив (întrerupe)." },
    { type: "order", words: ["Intrați", "vă", "rog"], ru: "Входите, пожалуйста.",
      alts: [["vă", "rog", "Intrați"]],
      explain: "Вежливая форма = форма voi: intrați. «Vă rog» может стоять до или после: Vă rog, intrați!" },
    { type: "input", q: "___ ușa, te rog! (a deschide, ты)", a: ["deschide"],
      explain: "Переходный глагол: повелительное совпадает с формой el — deschide!" },
    { type: "choice", q: "___ la mine! (a se uita, ты)", options: ["Uită-te", "Te uită", "Uită-tu"], a: 0,
      explain: "Возвратное местоимение в утвердительном повелительном идёт после глагола: uită-te!" },
    { type: "input", q: "Nu ___ atât de repede! (a vorbi, вы)", a: ["vorbiți"],
      explain: "Для voi отрицание — nu + форма настоящего времени: nu vorbiți!" }
  ]
});
