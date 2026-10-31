DE.grammar.push({
  id: "registru",
  title: "Регистры и вежливость",
  level: "C1",
  emoji: "🎩",
  summary: "tu / dumneata / dumneavoastră, официальные письма, solicita вместо cere",
  content: `<p>Чтобы звучать естественно, мало говорить правильно — нужно выбрать нужный <b>регистр</b>: дружеский, нейтрально-вежливый или официальный.</p>

<h3>Формы обращения</h3>
<table>
<tr><th>Форма</th><th>Глагол</th><th>Когда</th></tr>
<tr><td><b>tu</b></td><td>2 л. ед. ч.: <i>ai, vii</i></td><td>друзья, семья, дети, коллеги-ровесники</td></tr>
<tr><td><b>dumneata</b> (d-ta)</td><td>2 л. ед. ч.: <i>ai, vii</i></td><td>промежуточная вежливость; звучит старомодно, бывает снисходительной</td></tr>
<tr><td><b>dumneavoastră</b> (dvs.)</td><td>2 л. мн. ч.: <i>aveți, veniți</i></td><td>незнакомые, старшие, официальные ситуации</td></tr>
</table>
<div class="ex"><b>Dumneavoastră aveți dreptate.</b> — Вы правы.<br><b>Dumneata ai timp mâine?</b> — У вас найдётся завтра время?</div>
<p>О третьем лице вежливо говорят <b>dânsul / dânsa</b> (он / она), в разговоре — <b>dumnealui / dumneaei</b>: <i>Domnul profesor nu e aici. Vreți să-l așteptați pe dânsul?</i></p>
<p>Перейти на «ты» — <b>a se tutui</b>: <i>Ne putem tutui? — Sigur, spune-mi Ana!</i></p>

<h3>Вежливые просьбы</h3>
<table>
<tr><th>Неформально</th><th>Вежливо</th></tr>
<tr><td>Închide fereastra!</td><td>Ați putea să închideți fereastra?</td></tr>
<tr><td>Vreau o cafea.</td><td>Aș dori o cafea, vă rog.</td></tr>
<tr><td>Poți să-mi spui…?</td><td>Mi-ați putea spune…?</td></tr>
<tr><td>Intră! Ia loc!</td><td>Intrați! Luați loc, vă rog!</td></tr>
</table>
<p>Обращения: <b>Domnule profesor, Doamnă doctor, Domnule director</b> — титул без фамилии звучит уважительно.</p>

<h3>Официальное письмо</h3>
<table>
<tr><th>Часть</th><th>Формулы</th></tr>
<tr><td>начало</td><td>Stimate domnule director, / Stimată doamnă Popescu, / Bună ziua,</td></tr>
<tr><td>вступление</td><td>Vă scriu în legătură cu… / În urma discuției noastre…</td></tr>
<tr><td>просьба</td><td>Vă rog să… / V-aș ruga să… / Vă rugăm să aveți amabilitatea să…</td></tr>
<tr><td>вложение</td><td>Găsiți atașat… / Vă transmit în atașament…</td></tr>
<tr><td>завершение</td><td>Cu stimă, / Cu respect, / Toate cele bune, (полуофициально)</td></tr>
</table>
<p>В дружеском письме: <i>Dragă Ana, … Te pup! / Numai bine! / Pa!</i></p>

<h3>Неологизмы и исконные слова</h3>
<p>Официальный стиль предпочитает латино-романские неологизмы, разговорный — исконные слова:</p>
<table>
<tr><th>Нейтрально</th><th>Официально</th><th>Перевод</th></tr>
<tr><td>a cere</td><td>a solicita</td><td>просить, запрашивать</td></tr>
<tr><td>a da</td><td>a acorda</td><td>давать, предоставлять</td></tr>
<tr><td>a începe</td><td>a demara</td><td>начинать(ся)</td></tr>
<tr><td>a termina</td><td>a finaliza</td><td>заканчивать</td></tr>
<tr><td>a trimite</td><td>a expedia, a transmite</td><td>отправлять</td></tr>
<tr><td>a vrea</td><td>a dori</td><td>хотеть, желать</td></tr>
<tr><td>ajutor</td><td>sprijin, asistență</td><td>помощь, поддержка</td></tr>
<tr><td>pentru că</td><td>deoarece, întrucât</td><td>потому что</td></tr>
</table>

<div class="tip">Если сомневаетесь — начинайте с <span class="hl">dumneavoastră</span> и глагола во мн. ч. Перейти на «tu» румын предложит сам. А вот «tu» с незнакомым пожилым человеком или чиновником звучит грубо.</div>`,
  exercises: [
    { type: "choice", q: "Dumneavoastră ___ dreptate.", options: ["aveți", "ai", "are"], a: 0,
      explain: "С dumneavoastră глагол стоит во 2 л. мн. ч.: aveți." },
    { type: "choice", q: "Dumneata ___ timp mâine?", options: ["ai", "aveți", "are"], a: 0,
      explain: "Dumneata согласуется с глаголом во 2 л. ед. ч.: ai." },
    { type: "input", q: "___ rog să luați loc. (вежливо)", a: ["Vă"],
      explain: "Вежливое местоимение — vă: «Vă rog» = «Прошу вас»." },
    { type: "choice", q: "Как начать официальное письмо директору?", options: ["Stimate domnule director,", "Salut, director!", "Dragă director,"], a: 0,
      explain: "Официальная формула: Stimate domnule director, (stimate — звательная форма м. р.)." },
    { type: "choice", q: "Как закончить официальное письмо?", options: ["Cu stimă,", "Te pup,", "Pa!"], a: 0,
      explain: "Cu stimă — «С уважением»; «Te pup» и «Pa» — только для близких." },
    { type: "input", q: "Am ___ o bursă de studii. (a cere — официальный синоним, причастие)", a: ["solicitat"],
      explain: "В официальном стиле a cere → a solicita: am solicitat o bursă." },
    { type: "order", words: ["Ați", "putea", "să", "închideți", "fereastra?"], ru: "Не могли бы вы закрыть окно?",
      explain: "Вежливая просьба: ați putea să + конъюнктив 2 л. мн. ч." },
    { type: "choice", q: "___, vă rog! (Входите — вежливо)", options: ["Intrați", "Intră", "Intrăm"], a: 0,
      explain: "Вежливый императив совпадает с формой 2 л. мн. ч.: Intrați!" },
    { type: "choice", q: "Proiectul va ___ luna viitoare. (офиц.: «начнётся»)", options: ["demara", "finaliza", "expedia"], a: 0,
      explain: "A demara — официальный синоним a începe; finaliza — «завершить», expedia — «отправить»." },
    { type: "input", q: "Ne putem ___? — Sigur, spune-mi Ana! (перейти на «ты»)", a: ["tutui"],
      explain: "A se tutui — обращаться друг к другу на «ты»: ne putem tutui?" },
    { type: "choice", q: "Domnul profesor nu e aici. Vreți să-l așteptați pe ___?", options: ["dânsul", "ăsta", "tine"], a: 0,
      explain: "Dânsul — вежливое «он» о третьем лице; «ăsta» о человеке звучит грубо." },
    { type: "order", words: ["Vă", "scriu", "în", "legătură", "cu", "anunțul", "dumneavoastră"], ru: "Пишу вам в связи с вашим объявлением.",
      explain: "Стандартное начало делового письма: Vă scriu în legătură cu…" },
    { type: "choice", q: "Какая фраза вежливо звучит в разговоре с незнакомцем на улице?", options: ["Scuzați-mă, unde e gara?", "Băi, unde e gara?", "Scuză-mă, frate, unde e gara?"], a: 0,
      explain: "Scuzați-mă — вежливая форма (2 л. мн. ч.); «băi» и «frate» — фамильярные." }
  ]
});
