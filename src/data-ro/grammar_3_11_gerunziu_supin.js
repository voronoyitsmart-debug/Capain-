DE.grammar.push({
  id: "gerunziu_supin",
  title: "Деепричастие и супин (făcând, citind; de făcut, mașină de spălat)",
  level: "B1",
  emoji: "🛠️",
  summary: "Mergând pe stradă… (идя по улице) и Am multe de făcut (мне много чего надо сделать)",
  content: `<p>Две неизменяемые формы глагола, которые делают речь компактной: <b>gerunziul</b> (≈ русское деепричастие «делая») и <b>supinul</b> (de + причастие: «de făcut» — «чтобы сделать / для делания»).</p>
<h3>1. Gerunziu: -ând / -ind</h3>
<table>
<tr><th>Глаголы</th><th>Окончание</th><th>Примеры</th></tr>
<tr><td>на -a, -ea, -e, -î</td><td><b>-ând</b></td><td>lucra → <b>lucrând</b>, vedea → <b>văzând</b>, face → <b>făcând</b>, merge → <b>mergând</b>, hotărî → <b>hotărând</b></td></tr>
<tr><td>на -i</td><td><b>-ind</b></td><td>citi → <b>citind</b>, dormi → <b>dormind</b>, veni → <b>venind</b></td></tr>
<tr><td>основа на -i- (и глаголы на -ui)</td><td><b>-ind</b></td><td>ști → <b>știind</b>, scrie → <b>scriind</b>, tăia → <b>tăind</b>, locui → <b>locuind</b></td></tr>
<tr><td>особые</td><td></td><td>fi → <b>fiind</b>, avea → <b>având</b>, da → <b>dând</b>, sta → <b>stând</b>, crede → <b>crezând</b></td></tr>
</table>
<p>Значения — как у русского деепричастия: одновременное действие, причина, способ.</p>
<div class="ex"><b>Mergând pe stradă, am întâlnit-o pe Ana.</b> — Идя по улице, я встретил Ану.</div>
<div class="ex"><b>Fiind bolnav, nu a venit la lucru.</b> — Будучи больным (так как болел), он не пришёл на работу.</div>
<div class="ex"><b>Mi-a răspuns zâmbind.</b> — Он ответил мне, улыбаясь.</div>
<p><b>Местоимения</b> присоединяются через дефис и связующее <b>-u-</b>: <i>văzându-l</i> (увидев его), <i>spunându-i</i> (говоря ему), <i>plimbându-se</i> (гуляя). Исключение — <b>o</b>: <i>văzând-o</i>. <b>Отрицание</b> — приставка <b>ne-</b>: <i><b>Ne</b>având timp, n-am venit.</i> — Не имея времени, я не пришёл.</p>
<div class="warn">Gerunziu НЕ используется для «длительного времени», как английское -ing. «Я сейчас читаю» — просто <i>Citesc acum</i>.</div>
<h3>2. Supin: de + причастие</h3>
<table>
<tr><th>Употребление</th><th>Пример</th><th>Перевод</th></tr>
<tr><td>что нужно сделать</td><td><i>Am multe <b>de făcut</b>.</i></td><td>Мне много чего надо сделать.</td></tr>
<tr><td>после «легко / трудно»</td><td><i>E greu <b>de înțeles</b>.</i></td><td>Это трудно понять.</td></tr>
<tr><td>назначение предмета</td><td><i>mașină <b>de spălat</b>, apă <b>de băut</b></i></td><td>стиральная машина, питьевая вода</td></tr>
<tr><td>после a termina, a se apuca, a se lăsa</td><td><i>Am terminat <b>de scris</b>. S-a lăsat <b>de fumat</b>.</i></td><td>Я закончил писать. Он бросил курить.</td></tr>
</table>
<p>Супин всегда в одной форме — <b>как мужское причастие ед. ч.</b>: de citit, de mâncat, de văzut.</p>
<div class="ex"><b>Ai ceva de citit?</b> — У тебя есть что почитать?</div>
<div class="tip">💡 Ищите супин в бытовых названиях: <b>mașină de spălat</b> (стиральная), <b>mașină de cusut</b> (швейная), <b>aparat de ras</b> (бритва), <b>fier de călcat</b> (утюг), <b>sală de așteptare</b> (зал ожидания). Буквально — «машина для стирания», «железо для глажки».</div>`,
  exercises: [
    { type: "choice", q: "___ pe stradă, am întâlnit-o pe Ana. (идя)", options: ["Mergând", "Mergind", "Mers"], a: 0,
      explain: "A merge — не на -i, значит, окончание -ând: mergând." },
    { type: "input", q: "Stă în pat ___ o carte. (a citi)", a: ["citind"],
      explain: "Глагол на -i → -ind: citind («читая»)." },
    { type: "input", q: "___ bolnav, nu a venit la lucru. (a fi)", a: ["Fiind"],
      explain: "Gerunziu от a fi — fiind; здесь он выражает причину («так как болел»)." },
    { type: "choice", q: "Am multe ___ făcut azi.", options: ["de", "să", "a"], a: 0,
      explain: "Супин = de + причастие: de făcut («надо сделать»)." },
    { type: "input", q: "Avem nevoie de o mașină de ___. (стиральная машина)", a: ["spălat"],
      explain: "Назначение предмета → супин: mașină de spălat." },
    { type: "choice", q: "Textul acesta e greu de ___.", options: ["înțeles", "înțelege", "înțelegând"], a: 0,
      explain: "После «greu de / ușor de» — супин, то есть причастие: greu de înțeles." },
    { type: "input", q: "Copilul a intrat în cameră ___. (a plânge)", a: ["plângând"],
      explain: "Способ действия («плача») → gerunziu: plânge → plângând." },
    { type: "choice", q: "___, am înțeles totul. (увидев его)", options: ["Văzându-l", "Văzând-l", "Văzândul"], a: 0,
      explain: "Местоимение l присоединяется через -u-: văzându-l." },
    { type: "order", words: ["S-a", "lăsat", "de", "fumat", "anul", "trecut"], ru: "Он бросил курить в прошлом году.",
      alts: [["anul", "trecut", "S-a", "lăsat", "de", "fumat"]],
      explain: "A se lăsa de + супин = бросить делать что-то: s-a lăsat de fumat." },
    { type: "order", words: ["Mi-a", "răspuns", "zâmbind"], ru: "Он ответил мне, улыбаясь.",
      alts: [["zâmbind", "Mi-a", "răspuns"]],
      explain: "Gerunziu zâmbind (от a zâmbi, -ind) показывает, как он ответил." },
    { type: "input", q: "Am terminat de ___ raportul. (a scrie)", a: ["scris"],
      explain: "A termina de + супин: de scris («закончил писать»)." },
    { type: "choice", q: "Am învățat multe ___ greșeli. (a face)", options: ["făcând", "făcind", "facând"], a: 0,
      explain: "A face → făcând: окончание -ând и ă в корне, как в făcut." },
    { type: "input", q: "Ai ceva ___ băut? (есть что попить?)", a: ["de"],
      explain: "«Что попить» → ceva de băut: de + причастие (супин)." },
    { type: "input", q: "___ ce să fac, am sunat-o pe mama. (a ști, с отрицанием: «не зная»)", a: ["Neștiind"],
      explain: "Отрицательный gerunziu — приставка ne-: ști → știind → neștiind." }
  ]
});
