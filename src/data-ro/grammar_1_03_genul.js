DE.grammar.push({
  id: "genul",
  title: "Род существительных",
  level: "A1",
  emoji: "🚻",
  summary: "masculin, feminin, neutru — проверка «un … doi / o … două / un … două»",
  content: `<p>В румынском, как и в русском, <b>три рода</b>: мужской (masculin), женский (feminin) и средний (neutru). Но румынский средний род особенный: в единственном числе он ведёт себя как <b>мужской</b>, а во множественном — как <b>женский</b>.</p>

<table>
<tr><th>Род</th><th>«один»</th><th>«два»</th><th>Типичные окончания</th><th>Примеры</th></tr>
<tr><td>Мужской</td><td>un</td><td>doi</td><td>согласная, -u, -e; люди и животные мужского пола, деревья</td><td>un băiat — doi băieți, un câine, un pom</td></tr>
<tr><td>Женский</td><td>o</td><td>două</td><td>-ă, -e, ударное -ea, -ie, -ție, -tate</td><td>o casă — două case, o carte, o cafea, o familie</td></tr>
<tr><td>Средний</td><td>un</td><td>două</td><td>согласная, -u, -o; неодушевлённые предметы</td><td>un tren — două trenuri, un scaun, un birou, un radio</td></tr>
</table>

<h3>Тест «один — два»</h3>
<p>Самый надёжный способ узнать род — поставить слово с «один» и «два»:</p>
<ul>
<li><b>un … / doi …</b> → мужской</li>
<li><b>o … / două …</b> → женский</li>
<li><b>un … / două …</b> → средний</li>
</ul>
<div class="ex"><b>un student — doi studenți</b> → мужской род</div>
<div class="ex"><b>o masă — două mese</b> → женский род</div>
<div class="ex"><b>un telefon — două telefoane</b> → средний род</div>

<h3>Подсказки по окончанию</h3>
<ul>
<li>На <b>-ă</b> — почти всегда женский род: casă, mașină, școală. Исключение — мужчины по смыслу: <b>tată</b> (папа) — мужской.</li>
<li>На <b>-e</b> — чаще женский (carte, floare), но бывает мужской (<b>frate</b> — брат, <b>câine</b> — собака) и средний (<b>nume</b> — имя).</li>
<li>Неодушевлённый предмет на согласную — чаще всего <b>средний</b>: oraș, tren, hotel, creion. Но деревья — мужского рода: pom, brad, copac.</li>
<li>Суффиксы <b>-ie, -ție, -tate</b> — женский род: familie, lecție, universitate.</li>
</ul>

<div class="warn">Род в русском и румынском часто <b>не совпадает</b>: masă (стол) и carte (книга) — женский род, pom (дерево) — мужской, scaun (стул) и oraș (город) — средний. Не переносите русский род — учите слово сразу с un/o!</div>

<div class="tip">Средний род — «двуликий»: <b>un</b> tren (как он), но <b>două</b> trenuri (как они-женщины). Запомните формулу: «одно — как мужчина, два — как женщины». Поэтому и прилагательные: un tren nou, но două trenuri noi.</div>`,
  exercises: [
    { type: "choice", q: "Какого рода слово «casă» (дом)?", options: ["женского", "мужского", "среднего"], a: 0,
      explain: "Слова на -ă почти всегда женского рода: o casă — două case." },
    { type: "choice", q: "un tren — două trenuri. Какого рода «tren»?", options: ["мужского", "женского", "среднего"], a: 2,
      explain: "un в ед. ч. и două во мн. ч. — это признак среднего рода." },
    { type: "choice", q: "Какого рода слово «tată» (папа)?", options: ["женского", "мужского", "среднего"], a: 1,
      explain: "Хотя слово оканчивается на -ă, по смыслу это мужчина — мужской род: un tată." },
    { type: "input", q: "___ băiat (un или o?)", a: ["un"],
      explain: "băiat (мальчик) — мужской род: un băiat — doi băieți." },
    { type: "input", q: "___ carte (un или o?)", a: ["o"],
      explain: "carte (книга) — женский род: o carte — două cărți." },
    { type: "choice", q: "___ scaune (два стула)", options: ["doi", "două"], a: 1,
      explain: "scaun — средний род: un scaun, но во мн. ч. как женский — două scaune." },
    { type: "choice", q: "Какое слово среднего рода?", options: ["femeie", "câine", "oraș"], a: 2,
      explain: "un oraș — două orașe: средний род. femeie — женский, câine — мужской (doi câini)." },
    { type: "choice", q: "Какое слово мужского рода?", options: ["carte", "frate", "floare"], a: 1,
      explain: "frate (брат) — мужчина: un frate — doi frați. carte и floare — женского рода." },
    { type: "input", q: "___ băieți (doi или două?)", a: ["doi"],
      explain: "băiat — мужской род, поэтому doi băieți." },
    { type: "choice", q: "Какого рода слово «universitate»?", options: ["женского", "мужского", "среднего"], a: 0,
      explain: "Суффикс -tate — женский род: o universitate — două universități." },
    { type: "input", q: "___ telefoane (doi или două?)", a: ["două"],
      explain: "telefon — средний род: un telefon, но două telefoane." },
    { type: "order", words: ["Am", "un", "frate", "și", "o", "soră"], ru: "У меня есть брат и сестра.",
      alts: [["Am", "o", "soră", "și", "un", "frate"]],
      explain: "frate — мужской род (un), soră — женский (o)." },
    { type: "order", words: ["Aici", "este", "un", "hotel"], ru: "Здесь есть гостиница.",
      alts: [["este", "un", "hotel", "Aici"]],
      explain: "hotel — средний род: в ед. ч. un hotel, во мн. ч. două hoteluri. Возможно и «Este un hotel aici»." }
  ]
});
