DE.grammar.push({
  id: "passiv_full",
  title: "Пассив во всех временах (Passiv)",
  level: "B2",
  emoji: "🏗️",
  summary: "wird gebaut → ist gebaut worden, muss gebaut werden, ist geschlossen",
  content: `<p>Пассив ставит в центр <b>действие или его объект</b>, а не того, кто действует. Основной пассив — <b>Vorgangspassiv</b> (пассив процесса): <span class="hl">werden + Partizip II</span>. Меняется только <b>werden</b> — Partizip II всегда стоит в конце.</p>
<h3>Vorgangspassiv во всех временах</h3>
<table>
<tr><th>Время</th><th>Формула</th><th>Пример</th></tr>
<tr><td>Präsens</td><td>wird + P II</td><td>Das Haus <b>wird</b> gebaut.</td></tr>
<tr><td>Präteritum</td><td>wurde + P II</td><td>Das Haus <b>wurde</b> gebaut.</td></tr>
<tr><td>Perfekt</td><td>ist + P II + <b>worden</b></td><td>Das Haus <b>ist</b> gebaut <b>worden</b>.</td></tr>
<tr><td>Plusquamperfekt</td><td>war + P II + worden</td><td>Das Haus <b>war</b> gebaut <b>worden</b>.</td></tr>
<tr><td>Futur I</td><td>wird + P II + werden</td><td>Das Haus <b>wird</b> gebaut <b>werden</b>.</td></tr>
</table>
<div class="warn">В пассиве Perfekt — <b>worden</b>, а не <b>geworden</b>! <i>Er ist Arzt geworden</i> (стал врачом), но <i>Das Haus ist gebaut worden</i> (дом был построен). И вспомогательный глагол всегда <b>sein</b>.</div>
<h3>Кем? Чем?</h3>
<ul>
<li><b>von + Dativ</b> — исполнитель (обычно человек): <i>Das Bild wurde <b>von</b> Picasso gemalt.</i></li>
<li><b>durch + Akkusativ</b> — средство, причина, посредник: <i>Die Stadt wurde <b>durch</b> ein Erdbeben zerstört.</i></li>
</ul>
<h3>Пассив с модальными глаголами</h3>
<p>Формула: <span class="hl">модальный глагол + Partizip II + werden</span> (Infinitiv Passiv в конце).</p>
<table>
<tr><th>Время</th><th>Пример</th></tr>
<tr><td>Präsens</td><td>Die Arbeit <b>muss</b> heute gemacht <b>werden</b>.</td></tr>
<tr><td>Präteritum</td><td>Die Arbeit <b>musste</b> gemacht <b>werden</b>.</td></tr>
<tr><td>Perfekt (редко)</td><td>Die Arbeit <b>hat</b> gemacht <b>werden müssen</b>.</td></tr>
<tr><td>Придаточное</td><td>…, dass die Arbeit gemacht werden <b>muss</b>.</td></tr>
</table>
<h3>Безличный пассив</h3>
<p>Даже глаголы без объекта могут стоять в пассиве — так описывают «что тут происходит»:</p>
<div class="ex"><b>Hier wird nicht geraucht.</b> — Здесь не курят.</div>
<div class="ex"><b>Am Samstag wird getanzt.</b> — В субботу будут танцы.</div>
<h3>Zustandspassiv — пассив состояния</h3>
<p><span class="hl">sein + Partizip II</span> описывает <b>результат</b>, а не процесс:</p>
<table>
<tr><th>Процесс (werden)</th><th>Результат (sein)</th></tr>
<tr><td>Die Tür <b>wird</b> geöffnet. — Дверь открывают.</td><td>Die Tür <b>ist</b> geöffnet. — Дверь открыта.</td></tr>
<tr><td>Das Essen <b>wurde</b> gekocht. — Еду варили.</td><td>Das Essen <b>war</b> gekocht. — Еда была готова.</td></tr>
</table>
<div class="ex"><b>Der Brief ist schon geschrieben.</b> — Письмо уже написано (лежит готовое).</div>
<div class="ex"><b>Das Museum ist montags geschlossen.</b> — По понедельникам музей закрыт.</div>
<div class="ex"><b>Der Täter ist von der Polizei festgenommen worden.</b> — Преступник был задержан полицией.</div>
<div class="tip">Проверка «процесс или состояние»: если можно спросить «что с этим делают?» — нужен <b>werden</b>. Если «в каком оно состоянии?» — <b>sein</b>. По-русски это как разница между «дверь <i>открывают</i>» и «дверь <i>открыта</i>».</div>`,
  exercises: [
    { type: "choice", q: "Das Rathaus ___ im 16. Jahrhundert gebaut.", options: ["wurde", "worden", "geworden"], a: 0,
      explain: "Präteritum Passiv = wurde + Partizip II. worden употребляется только в Perfekt/Plusquamperfekt вместе с ist/war, а geworden — значит «стал»." },
    { type: "choice", q: "Der Brief ist gestern abgeschickt ___.", options: ["geworden", "worden", "werden"], a: 1,
      explain: "Perfekt Passiv = ist + Partizip II + worden. «geworden» — Perfekt от werden «становиться» (Er ist Arzt geworden), в пассиве его не используют." },
    { type: "input", q: "Die Straße ___ morgen repariert werden. (müssen, Präsens)", a: ["muss"],
      explain: "Пассив с модальным: спрягается модальный глагол (die Straße → muss), а в конце стоит Partizip II + werden." },
    { type: "order", words: ["Das", "Problem", "muss", "sofort", "gelöst", "werden"], ru: "Проблему нужно решить немедленно.",
      alts: [["sofort", "muss", "Das", "Problem", "gelöst", "werden"]],
      explain: "Модальный muss на 2-м месте, Infinitiv Passiv (gelöst werden) — в конце. На 1-м месте может стоять и sofort." },
    { type: "choice", q: "Du musst nicht zahlen, die Rechnung ___ schon bezahlt — Anna hat das gestern gemacht.", options: ["wird", "ist", "werden"], a: 1,
      explain: "Речь о результате: счёт уже оплачен (состояние) → Zustandspassiv sein + Partizip II. «wird bezahlt» означало бы, что его оплачивают сейчас." },
    { type: "input", q: "Das Auto ___ gestern repariert worden. (Perfekt)", a: ["ist"],
      explain: "Perfekt Passiv всегда образуется с sein: ist … repariert worden. «hat … worden» — типичная ошибка." },
    { type: "choice", q: "Das Fenster wurde ___ den Sturm zerstört.", options: ["von", "durch", "mit"], a: 1,
      explain: "Причина/стихия + Akkusativ (den Sturm) → durch. von требует Dativ (vom Sturm), а mit обозначает инструмент и тоже требует Dativ." },
    { type: "choice", q: "Als wir ankamen, ___ das Essen schon serviert worden.", options: ["war", "ist", "wurde"], a: 0,
      explain: "Еду подали раньше, чем мы пришли (ankamen) → Plusquamperfekt Passiv: war … worden. «wurde … worden» не бывает." },
    { type: "order", words: ["Hier", "wird", "nicht", "geraucht"], ru: "Здесь не курят.",
      explain: "Безличный пассив: подлежащего нет, wird стоит на 2-м месте, Partizip II geraucht — в конце." },
    { type: "input", q: "Das Ergebnis wird nächste Woche bekannt gegeben ___. (Futur I)", a: ["werden"],
      explain: "Futur I Passiv = wird + Partizip II + werden (инфинитив пассива в конце)." },
    { type: "choice", q: "Ich weiß, dass der Antrag bis Freitag ___.", options: ["abgegeben werden muss", "muss abgegeben werden", "abgegeben muss werden"], a: 0,
      explain: "В придаточном с dass спрягаемый модальный глагол muss уходит в самый конец: abgegeben werden muss." },
    { type: "order", words: ["Die", "Tür", "ist", "seit", "gestern", "geschlossen"], ru: "Дверь закрыта со вчерашнего дня.",
      alts: [["seit", "gestern", "ist", "Die", "Tür", "geschlossen"]],
      explain: "Zustandspassiv (sein + Partizip II) описывает состояние: дверь закрыта. ist на 2-м месте, geschlossen в конце." },
    { type: "input", q: "Der Kuchen ___ von meiner Oma gebacken. (Präteritum)", a: ["wurde"],
      explain: "Präteritum Passiv: wurde + Partizip II; исполнитель вводится через von + Dativ (von meiner Oma)." },
    { type: "choice", q: "Das Paket hat gestern nicht ___ werden können.", options: ["geliefert", "liefern", "geliefert worden"], a: 0,
      explain: "Perfekt пассива с модальным: hat + Partizip II + werden + können (двойной инфинитив). «worden» здесь лишнее." }
  ]
});
