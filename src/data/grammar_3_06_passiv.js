DE.grammar.push({
  id: "passiv",
  title: "Страдательный залог (Passiv)",
  level: "B1",
  emoji: "🏗️",
  summary: "Das Haus wird gebaut / wurde gebaut — важно действие, а не тот, кто делает",
  content: `<p><b>Пассив</b> используют, когда важно <b>само действие</b>, а не тот, кто его выполняет. Русские аналоги: «дом <b>строится</b>», «дом <b>строят</b>», «дом <b>был построен</b>».</p>
<div class="ex"><b>Aktiv:</b> Der Bäcker backt das Brot. — Пекарь печёт хлеб.<br><b>Passiv:</b> Das Brot <b>wird</b> (vom Bäcker) <b>gebacken</b>. — Хлеб печётся (пекарем).</div>
<h3>Формула</h3>
<p><span class="hl">werden + Partizip II</span> (Partizip — в конце предложения)</p>
<table>
<tr><th></th><th>Präsens</th><th>Präteritum</th></tr>
<tr><td>ich</td><td>werde gefragt</td><td>wurde gefragt</td></tr>
<tr><td>du</td><td>wirst gefragt</td><td>wurdest gefragt</td></tr>
<tr><td>er/sie/es</td><td>wird gefragt</td><td>wurde gefragt</td></tr>
<tr><td>wir</td><td>werden gefragt</td><td>wurden gefragt</td></tr>
<tr><td>ihr</td><td>werdet gefragt</td><td>wurdet gefragt</td></tr>
<tr><td>sie/Sie</td><td>werden gefragt</td><td>wurden gefragt</td></tr>
</table>
<h3>Как превратить актив в пассив</h3>
<table>
<tr><th>Шаг</th><th>Aktiv</th><th>Passiv</th></tr>
<tr><td>Akkusativ-дополнение → подлежащее</td><td>Man repariert <b>den Wagen</b>.</td><td><b>Der Wagen</b> wird repariert.</td></tr>
<tr><td>Подлежащее → von + Dativ (или исчезает)</td><td><b>Der Mechaniker</b> repariert den Wagen.</td><td>Der Wagen wird <b>vom Mechaniker</b> repariert.</td></tr>
<tr><td>Время сохраняется</td><td>Man reparierte den Wagen.</td><td>Der Wagen <b>wurde</b> repariert.</td></tr>
</table>
<p>Исполнителя (<b>von + Dativ</b>) часто вообще не называют — он неизвестен или неважен. Подлежащее <i>man</i> в пассиве всегда исчезает.</p>
<div class="ex"><b>In Deutschland wird viel Bier getrunken.</b> — В Германии пьют много пива.</div>
<div class="ex"><b>Das Museum wurde 1900 gebaut.</b> — Музей был построен в 1900 году.</div>
<div class="ex"><b>Die Briefe werden von der Post gebracht.</b> — Письма приносит почта.</div>
<div class="ex"><b>Hier wird nicht geraucht!</b> — Здесь не курят!</div>
<h3>Пассив в придаточном и с модальными</h3>
<p>В придаточном werden уходит в самый конец: <i>…, weil die Straße <b>gebaut wird</b>.</i> С модальным глаголом — Partizip II + <b>werden</b> в конце: <i>Das Zimmer <b>muss</b> heute <b>geputzt werden</b>.</i></p>
<div class="tip">💡 Не путай три роли werden: <b>werden + прилагательное/существительное</b> = становиться (Er wird Arzt), <b>werden + инфинитив</b> = будущее (Er wird kommen), <b>werden + Partizip II</b> = пассив (Er wird gefragt). Смотри на вторую часть!</div>
<div class="warn">Пассив действия — с <b>werden</b>, а не с sein: <i>Die Tür wird geöffnet</i> (дверь открывают — процесс). <i>Die Tür ist geöffnet</i> — дверь открыта (состояние, это другая конструкция).</div>`,
  exercises: [
    { type: "choice", q: "Das Auto ___ jeden Samstag gewaschen.", options: ["wird", "werden", "ist"], a: 0,
      explain: "Повторяющееся действие (jeden Samstag) → пассив действия: wird + Partizip II, das Auto — ед. ч. «ist gewaschen» описывает состояние («вымыта»), «werden» — мн. ч." },
    { type: "input", q: "Die Fenster ___ jeden Tag geöffnet. (Präsens)", a: ["werden"],
      explain: "die Fenster — множественное число (окна), поэтому werden, а не wird." },
    { type: "choice", q: "Das Haus wurde 1950 ___.", options: ["bauen", "gebaut", "baute"], a: 1,
      explain: "Пассив = werden + Partizip II: wurde gebaut. Инфинитив bauen после wurde дал бы бессмыслицу, baute — Präteritum актива." },
    { type: "order", words: ["Der", "Brief", "wurde", "gestern", "geschrieben"], ru: "Письмо было написано вчера.",
      alts: [["gestern", "wurde", "Der", "Brief", "geschrieben"]],
      explain: "wurde стоит на 2-м месте, Partizip II geschrieben — в конце. Предложение можно начать и с gestern: «Gestern wurde der Brief geschrieben»." },
    { type: "input", q: "Ich ___ oft nach dem Weg gefragt. (Präteritum)", a: ["wurde"],
      explain: "Пассив Präteritum: werden → wurde; у ich нет окончания (ich wurde gefragt)." },
    { type: "choice", q: "Das Essen wird ___ Koch zubereitet.", options: ["von der", "vom", "von den"], a: 1,
      explain: "Исполнитель вводится через von + Dativ; der Koch → von dem = vom Koch. «von der» — женский род, «von den» — мн. число." },
    { type: "input", q: "Aktiv: Man spricht hier Deutsch. → Passiv: Hier ___ Deutsch gesprochen.", a: ["wird"],
      explain: "man в пассиве исчезает, Deutsch становится подлежащим (ед. ч.) → Hier wird Deutsch gesprochen." },
    { type: "choice", q: "Wann ___ die Kinder abgeholt? (Präteritum)", options: ["wurde", "wurden", "werden"], a: 1,
      explain: "Подлежащее die Kinder — мн. число, время Präteritum → wurden. «werden» — Präsens, «wurde» — ед. ч." },
    { type: "order", words: ["Die", "Wohnung", "wird", "von", "einer", "Firma", "renoviert"], ru: "Квартиру ремонтирует фирма.",
      alts: [["von", "einer", "Firma", "wird", "Die", "Wohnung", "renoviert"]],
      explain: "Исполнитель — von + Dativ (von einer Firma). wird на 2-м месте, renoviert в конце." },
    { type: "input", q: "Du ___ am Bahnhof abgeholt. (Präsens)", a: ["wirst"],
      explain: "werden для du — wirst (неправильная форма): du wirst abgeholt." },
    { type: "choice", q: "Какое предложение в пассиве?", options: ["Er wird Lehrer.", "Er wird morgen kommen.", "Er wird operiert."], a: 2,
      explain: "Пассив = werden + Partizip II (operiert). werden + существительное = «становиться», werden + инфинитив = будущее время." },
    { type: "order", words: ["Das", "Zimmer", "muss", "heute", "geputzt", "werden"], ru: "Комнату нужно убрать сегодня.",
      alts: [["heute", "muss", "Das", "Zimmer", "geputzt", "werden"]],
      explain: "Пассив с модальным: muss на 2-м месте, в конце Partizip II + werden (geputzt werden)." },
    { type: "input", q: "Die Prüfungen ___ von den Lehrern korrigiert. (Präteritum)", a: ["wurden"],
      explain: "die Prüfungen — мн. число, Präteritum → wurden korrigiert." }
  ]
});
