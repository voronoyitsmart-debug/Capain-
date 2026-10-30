DE.grammar.push({
  id: "konnektoren",
  title: "Связки и двойные союзы (Konnektoren)",
  level: "B2",
  emoji: "🔗",
  summary: "obwohl/trotzdem, deshalb, sowohl…als auch, weder…noch, je…desto, zwar…aber",
  content: `<p>Связки делают речь логичной и «взрослой». Главное — помнить, <b>как каждая связка влияет на порядок слов</b>. Есть три типа.</p>
<h3>1. Союзы придаточного: глагол в конец</h3>
<div class="ex"><b>Obwohl es regnet, gehen wir spazieren.</b> — Хотя идёт дождь, мы идём гулять.</div>
<p>Так же: <b>weil, da</b> (потому что), <b>obwohl</b> (хотя), <b>während</b> (в то время как).</p>
<h3>2. Наречия-связки: занимают 1-е место, глагол сразу за ними</h3>
<div class="ex"><b>Es regnet. Trotzdem gehen wir spazieren.</b> — Идёт дождь. Тем не менее мы идём гулять.</div>
<div class="ex"><b>Ich war müde, deshalb bin ich früh ins Bett gegangen.</b> — Я устал, поэтому рано лёг спать.</div>
<p>Так же: <b>deshalb / darum / deswegen / daher</b> (поэтому), <b>trotzdem / dennoch</b> (тем не менее), <b>sonst</b> (иначе).</p>
<div class="warn">Пара, которую часто путают: <b>obwohl</b> (+ глагол в конце) и <b>trotzdem</b> (+ глагол сразу после). Смысл один — «уступка», а порядок слов разный!</div>
<h3>3. Двойные союзы</h3>
<table>
<tr><th>Союз</th><th>Значение</th><th>Пример</th></tr>
<tr><td>sowohl … als auch</td><td>как … так и</td><td>Sie spricht <b>sowohl</b> Englisch <b>als auch</b> Französisch.</td></tr>
<tr><td>weder … noch</td><td>ни … ни</td><td>Ich trinke <b>weder</b> Kaffee <b>noch</b> Tee.</td></tr>
<tr><td>entweder … oder</td><td>или … или</td><td><b>Entweder</b> du kommst mit, <b>oder</b> du bleibst hier.</td></tr>
<tr><td>nicht nur … sondern auch</td><td>не только … но и</td><td>Er ist <b>nicht nur</b> klug, <b>sondern auch</b> fleißig.</td></tr>
<tr><td>zwar … aber</td><td>хотя и … но</td><td>Das Hotel ist <b>zwar</b> teuer, <b>aber</b> sehr schön.</td></tr>
<tr><td>je … desto / umso</td><td>чем … тем</td><td><b>Je</b> mehr ich lerne, <b>desto</b> besser verstehe ich.</td></tr>
</table>
<h3>Je … desto — особый порядок слов</h3>
<p>После <b>je</b> — сравнительная степень, глагол <b>в конце</b> (это придаточное). После <b>desto/umso</b> — сравнительная степень, затем сразу <b>глагол</b>, потом подлежащее.</p>
<table>
<tr><th>Je + Komparativ … глагол</th><th>desto + Komparativ + глагол + подлежащее</th></tr>
<tr><td>Je länger ich warte,</td><td>desto nervöser werde ich.</td></tr>
<tr><td>Je älter man wird,</td><td>umso weiser wird man.</td></tr>
</table>
<div class="ex"><b>Weder mein Bruder noch meine Schwester wohnt in Berlin.</b> — Ни брат, ни сестра не живут в Берлине.</div>
<div class="ex"><b>Beeil dich, sonst verpasst du den Bus!</b> — Поторопись, иначе опоздаешь на автобус!</div>
<div class="tip">Пары-«близнецы» легко запомнить: <b>weder–noch</b> (обе на «н-» отрицание), <b>entweder–oder</b> (в обоих есть «oder»), <b>sowohl–als auch</b> (оба «и»). А <b>sondern</b> ставится только после отрицания: <i>nicht nur …, sondern auch</i>.</div>`,
  exercises: [
    { type: "choice", q: "Es regnet. ___ gehen wir spazieren.", options: ["Obwohl", "Trotzdem", "Deshalb"], a: 1,
      explain: "Глагол gehen стоит сразу после пропуска → нужно наречие, а по смыслу это уступка: trotzdem. obwohl потребовал бы глагол в конце, deshalb («поэтому») нелогичен." },
    { type: "choice", q: "___ es regnet, gehen wir spazieren.", options: ["Obwohl", "Trotzdem", "Deshalb"], a: 0,
      explain: "Глагол regnet стоит в конце, а главное начинается с глагола gehen → это придаточное, нужен союз obwohl. trotzdem и deshalb — наречия, после них глагол идёт сразу." },
    { type: "order", words: ["Ich", "war", "müde,", "deshalb", "bin", "ich", "früh", "ins", "Bett", "gegangen"], ru: "Я устал, поэтому рано лёг спать.",
      alts: [["Ich", "war", "müde,", "ich", "bin", "deshalb", "früh", "ins", "Bett", "gegangen"]],
      explain: "deshalb — наречие: на 1-м месте после запятой, затем сразу глагол bin. Можно поставить deshalb и после глагола: «…, ich bin deshalb früh ins Bett gegangen»." },
    { type: "input", q: "Je länger ich warte, ___ nervöser werde ich.", a: ["desto", "umso"],
      explain: "Пара je … desto / umso = «чем … тем». Оба слова правильны; после них — сравнительная степень и сразу глагол." },
    { type: "choice", q: "Ich trinke ___ Kaffee noch Tee.", options: ["weder", "entweder", "sowohl"], a: 0,
      explain: "Вторая часть noch → пара weder … noch («ни … ни»). entweder сочетается с oder, sowohl — с als auch." },
    { type: "input", q: "Er spricht nicht nur Englisch, ___ auch Spanisch.", a: ["sondern"],
      explain: "nicht nur … sondern auch = «не только …, но и». После отрицания nicht нужен sondern, а не aber." },
    { type: "choice", q: "Wir fahren ___ mit dem Zug oder mit dem Auto.", options: ["entweder", "weder", "zwar"], a: 0,
      explain: "Вторая часть oder → entweder … oder («или … или»). weder требует noch, zwar — aber." },
    { type: "order", words: ["Je", "mehr", "du", "übst,", "desto", "besser", "wirst", "du"], ru: "Чем больше ты тренируешься, тем лучше у тебя получается.",
      explain: "Часть с je — придаточное: глагол übst в конце. После desto + Komparativ сразу идёт глагол, затем подлежащее: desto besser wirst du." },
    { type: "choice", q: "Die Wohnung ist zwar klein, ___ sehr gemütlich.", options: ["aber", "sondern", "oder"], a: 0,
      explain: "zwar … aber = «хотя и …, но». sondern ставится только после отрицания, oder не выражает противопоставления." },
    { type: "input", q: "Sie spielt sowohl Klavier ___ auch Gitarre.", a: ["als"],
      explain: "Пара sowohl … als auch = «как …, так и». «sowohl … wie auch» встречается, но стандартная форма — als auch." },
    { type: "choice", q: "Ich hatte keine Zeit, darum ___.", options: ["ich habe nicht angerufen", "habe ich nicht angerufen", "ich nicht angerufen habe"], a: 1,
      explain: "darum — наречие на 1-м месте, поэтому сразу за ним глагол: darum habe ich… Порядок «ich habe» и глагол в конце здесь неверны." },
    { type: "choice", q: "Du musst dich beeilen, ___ verpasst du den Bus.", options: ["sonst", "deshalb", "obwohl"], a: 0,
      explain: "По смыслу «иначе» → sonst, после него глагол сразу (verpasst du). deshalb («поэтому») нелогичен, obwohl потребовал бы глагол в конце." },
    { type: "order", words: ["Weder", "mein", "Bruder", "noch", "meine", "Schwester", "wohnt", "in", "Berlin"], ru: "Ни мой брат, ни моя сестра не живут в Берлине.",
      alts: [["in", "Berlin", "wohnt", "Weder", "mein", "Bruder", "noch", "meine", "Schwester"]],
      explain: "Вся группа weder … noch занимает 1-е место, глагол wohnt — на 2-м (согласуется с ближайшим подлежащим). Можно начать и с in Berlin." },
    { type: "input", q: "Der Film war ___ interessant, aber zu lang. (хотя и …, но)", a: ["zwar"],
      explain: "zwar … aber: признаём один факт (интересный) и противопоставляем другой (слишком длинный)." }
  ]
});
