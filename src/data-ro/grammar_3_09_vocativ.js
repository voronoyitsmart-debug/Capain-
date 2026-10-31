DE.grammar.push({
  id: "vocativ",
  title: "Звательный падеж (Ioane!, Mario!, doamnă!, domnule!)",
  level: "B1",
  emoji: "📣",
  summary: "Обращение: Domnule profesor! Prietene! Doamnelor și domnilor!",
  content: `<p><b>Vocativul</b> — форма для обращения к человеку. В русском он почти исчез, но остался в словах <i>Боже! Господи! Отче!</i>, а в разговоре живёт «новый звательный»: <i>Мам! Саш!</i> В румынском vocativ — обычная часть вежливой и дружеской речи.</p>
<h3>Основные окончания</h3>
<table>
<tr><th>Тип</th><th>Окончание</th><th>Примеры</th></tr>
<tr><td>м. р. ед. ч.</td><td><b>-e</b></td><td>prieten → <b>prietene!</b>, băiat → <b>băiete!</b>, Ion → <b>Ioane!</b></td></tr>
<tr><td>м. р. ед. ч. (от формы с артиклем)</td><td><b>-ule</b></td><td>domn → <b>domnule!</b>, om → <b>omule!</b>, fiu → <b>fiule!</b>, Radu → <b>Radule!</b></td></tr>
<tr><td>ж. р. ед. ч.</td><td><b>-o</b> (разговорное)</td><td>Maria → <b>Mario!</b>, soră → <b>soro!</b>, bunică → <b>bunico!</b></td></tr>
<tr><td>ж. р. ед. ч.</td><td>без изменений (форма без артикля)</td><td><b>doamnă!</b>, <b>domnișoară!</b>, <b>mamă!</b></td></tr>
<tr><td>мн. ч. (все роды)</td><td><b>-lor</b></td><td><b>doamnelor</b>, <b>domnilor</b>, <b>fraților</b>, <b>copiilor</b></td></tr>
</table>
<h3>Вежливое обращение</h3>
<p>К мужчине — <b>domnule</b>, к женщине — <b>doamnă</b>, к девушке — <b>domnișoară</b>. После них — фамилия или должность в обычной форме:</p>
<div class="ex"><b>Bună ziua, domnule Popescu!</b> — Добрый день, господин Попеску!</div>
<div class="ex"><b>Doamnă profesoară, am o întrebare.</b> — Госпожа учительница, у меня вопрос.</div>
<div class="ex"><b>Doamnelor și domnilor, bine ați venit!</b> — Дамы и господа, добро пожаловать!</div>
<h3>Что НЕ меняется</h3>
<p>Имена на <b>-i</b> и <b>-e</b>: <i>Mihai!, Andrei!, Vasile!, Gheorghe!</i> Слова на <b>-e</b>: <i>frate!</i> (брат!). В письмах: <b>Dragă</b> + имя (dragă не меняется в ед. ч.): <i>Dragă Ioane, Dragă Maria</i>; во мн. ч. — <b>Dragi prieteni</b>.</p>
<div class="warn">Формы на <b>-o</b> (Mario!, Ioano!, fato!) — разговорные и фамильярные. Для незнакомых и в официальной речи безопаснее просто имя: <i>Maria!</i> А вот <b>domnule</b> вместо «domnul» — обязательно: <i>Bună ziua, domnul Popescu!</i> — ошибка.</div>
<p>На письме обращение всегда выделяется запятой: <i>Ioane, vino aici!</i></p>
<div class="tip">💡 Запомните «вежливую пару» на все случаи: <b>domnule</b> + фамилия / <b>doamnă</b> + фамилия. А дружеское <b>Omule!</b> или <b>Frate!</b> вы услышите в Румынии на каждом углу — это как наше «Слушай, друг!».</div>`,
  exercises: [
    { type: "choice", q: "___, vino aici! (Ion)", options: ["Ioane", "Ionule", "Ioano"], a: 0,
      explain: "Мужское имя на согласный получает -e: Ion → Ioane (как старинное «Иване!»)." },
    { type: "choice", q: "Bună ziua, ___ Popescu!", options: ["domnule", "domnul", "domn"], a: 0,
      explain: "Вежливое обращение к мужчине — звательная форма domnule. «Domnul» — так говорят о человеке, а не к нему." },
    { type: "input", q: "Mulțumesc, ___! (prieten)", a: ["prietene"],
      explain: "Мужской род на согласный → -e: prieten → prietene." },
    { type: "input", q: "___ și domnilor, bine ați venit! (doamne)", a: ["Doamnelor"],
      explain: "Звательный падеж мн. ч. — окончание -lor: doamnelor, domnilor." },
    { type: "choice", q: "Bună dimineața, ___ profesoară!", options: ["doamnă", "doamna", "doamno"], a: 0,
      explain: "Нормативное обращение к женщине — doamnă (форма без артикля). Doamna — так говорят о ней, doamno — не употребляется." },
    { type: "choice", q: "___, ce mai faci? (Mihai)", options: ["Mihai", "Mihaie", "Mihaiule"], a: 0,
      explain: "Имена на -i в звательном падеже не меняются: Mihai!" },
    { type: "input", q: "___, ajută-mă, te rog! (băiat)", a: ["Băiete"],
      explain: "Băiat → băiete: окончание -e, а -a- в корне переходит в -e-." },
    { type: "input", q: "___, unde ești? (Radu, звательная форма)", a: ["Radule"],
      explain: "Мужские имена на -u получают -ule: Radu → Radule." },
    { type: "order", words: ["Dragă", "prietene,", "îți", "mulțumesc", "mult"], ru: "Дорогой друг, большое тебе спасибо.",
      alts: [["îți", "mulțumesc", "mult", "Dragă", "prietene,"]],
      explain: "Dragă не меняется, а prieten в обращении → prietene. Обращение выделяется запятой." },
    { type: "input", q: "___, unde ai pus cheile? (Maria, разговорная форма на -o)", a: ["Mario"],
      explain: "В разговорной речи женские имена на -a получают -o: Maria → Mario." },
    { type: "choice", q: "___, liniște, vă rog! (дети, обращение)", options: ["Copiilor", "Copiii", "Copiilui"], a: 0,
      explain: "Обращение во мн. ч. → -lor: copiilor! Copiii — обычная форма с артиклем." },
    { type: "order", words: ["Copii,", "veniți", "la", "masă!"], ru: "Дети, идите к столу!",
      alts: [["veniți", "la", "masă!", "Copii,"]],
      explain: "Во мн. ч. обращение может быть и без -lor: Copii! Обращение стоит в начале или в конце." },
    { type: "choice", q: "Ascultă, ___, nu e vina mea! (человек, дружески)", options: ["omule", "omul", "om"], a: 0,
      explain: "Om → omule: окончание -ule для обращения («Слушай, друг!»)." },
    { type: "input", q: "___ doctor, mă doare capul. (domn)", a: ["Domnule"],
      explain: "Обращение к мужчине по должности: domnule + doctor (сама должность не меняется)." }
  ]
});
