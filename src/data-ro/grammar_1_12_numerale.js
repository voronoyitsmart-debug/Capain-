DE.grammar.push({
  id: "numerale",
  title: "Числительные",
  level: "A1",
  emoji: "🔢",
  summary: "unu/una, doi/două, -sprezece; с 20 — «de»: douăzeci de lei",
  content: `<table>
<tr><th>0–10</th><th>11–19</th><th>Десятки</th><th>Сотни и больше</th></tr>
<tr><td>0 zero</td><td>11 unsprezece</td><td>10 zece</td><td>100 o sută</td></tr>
<tr><td>1 unu / una</td><td>12 doisprezece / douăsprezece</td><td>20 douăzeci</td><td>200 două sute</td></tr>
<tr><td>2 doi / două</td><td>13 treisprezece</td><td>30 treizeci</td><td>300 trei sute</td></tr>
<tr><td>3 trei</td><td>14 paisprezece</td><td>40 patruzeci</td><td>1000 o mie</td></tr>
<tr><td>4 patru</td><td>15 cincisprezece</td><td>50 cincizeci</td><td>2000 două mii</td></tr>
<tr><td>5 cinci</td><td>16 șaisprezece</td><td>60 șaizeci</td><td>1 000 000 un milion</td></tr>
<tr><td>6 șase</td><td>17 șaptesprezece</td><td>70 șaptezeci</td><td></td></tr>
<tr><td>7 șapte</td><td>18 optsprezece</td><td>80 optzeci</td><td></td></tr>
<tr><td>8 opt</td><td>19 nouăsprezece</td><td>90 nouăzeci</td><td></td></tr>
<tr><td>9 nouă</td><td></td><td></td><td></td></tr>
</table>

<p><b>11–19</b> строятся как в русском: «один-на-дцать» = un-<b>spre</b>-zece (один на десять). <b>Десятки</b> — число + <b>zeci</b>: trei<b>zeci</b>. Составные — через <b>și</b> (и): 25 = douăzeci <b>și</b> cinci. Обратите внимание на 14 (pai-), 16 и 60 (șai-).</p>

<h3>Род: 1 и 2 — как в русском</h3>
<p>Вспомните «два брата — две сестры». Румынский делает так же: <b>un băiat — o fată</b>, <b>doi băieți — două fete</b>. Средний род во мн. ч. — как женский: <b>două trenuri</b>. Так же меняются 12, 21, 22, 32…: <b>doisprezece</b> băieți, <b>douăsprezece</b> fete, douăzeci și <b>două</b> de mașini. При счёте «раз, два, три» говорят <b>unu, doi, trei</b>, а перед существительным — <b>un / o</b>.</p>
<p>sută и mie — женского рода: <b>o</b> sută, <b>două</b> sute, <b>o</b> mie, <b>două</b> mii.</p>

<h3>Главное правило: «de» с 20</h3>
<p>Начиная с 20, между числом и существительным ставится <b>de</b>. В русском после 5 появляется родительный падеж («пять рублей»), а в румынском после 20 — частица de.</p>
<table>
<tr><th>Без de (1–19)</th><th>С de (20 и больше)</th></tr>
<tr><td>cinci lei</td><td>douăzeci <b>de</b> lei</td></tr>
<tr><td>doisprezece ani</td><td>treizeci <b>de</b> ani</td></tr>
<tr><td>nouăsprezece studenți</td><td>o sută <b>de</b> studenți</td></tr>
</table>
<p>Точнее: de ставится, если две последние цифры числа — 00 или от 20 до 99. Поэтому <b>o sută cinci lei</b> (105 — без de), но <b>o sută douăzeci de lei</b>.</p>

<div class="ex"><b>Cât costă? — Cincisprezece lei.</b> — Сколько стоит? — Пятнадцать лей.</div>
<div class="ex"><b>Am douăzeci și doi de ani.</b> — Мне двадцать два года.</div>
<div class="ex"><b>În clasă sunt treizeci de copii.</b> — В классе тридцать детей.</div>

<div class="tip">В разговоре 11–19 сокращают: <b>unșpe, doișpe, paișpe, cincișpe</b>… Пишите полные формы, но не пугайтесь, когда услышите «Costă cincișpe lei».</div>`,
  exercises: [
    { type: "choice", q: "___ fete (2)", options: ["doi", "două", "doua"], a: 1,
      explain: "fată — женский род: două fete. Как в русском «две девочки»." },
    { type: "input", q: "___ băieți (12)", a: ["doisprezece"],
      explain: "băiat — мужской род: doisprezece băieți. С женским родом — douăsprezece." },
    { type: "choice", q: "Costă douăzeci ___.", options: ["lei", "de lei", "de leu"], a: 1,
      explain: "С 20 и больше перед существительным ставится de: douăzeci de lei." },
    { type: "choice", q: "Am ___ frați. (2)", options: ["doi", "două", "doua"], a: 0,
      explain: "frate — мужской род: doi frați." },
    { type: "input", q: "15 = ___", a: ["cincisprezece"],
      explain: "cinci + spre + zece = cincisprezece." },
    { type: "choice", q: "Cartea costă ___ lei. (5)", options: ["de cinci", "cinci de", "cinci"], a: 2,
      explain: "До 19 de не нужно: cinci lei." },
    { type: "input", q: "Am ___ de ani. (30)", a: ["treizeci"],
      explain: "trei + zeci = treizeci; после 20 — de: treizeci de ani." },
    { type: "choice", q: "100 = ?", options: ["un sută", "o sută", "unu sută"], a: 1,
      explain: "sută — женского рода: o sută, două sute." },
    { type: "choice", q: "Am o soră și ___ frate.", options: ["un", "unu", "una"], a: 0,
      explain: "Перед существительным мужского рода — un. unu — только при счёте, una — женская форма." },
    { type: "input", q: "unu, ___, trei", a: ["doi"],
      explain: "При счёте используется мужская форма: unu, doi, trei." },
    { type: "choice", q: "___ de mașini (22)", options: ["douăzeci și doi", "douăzeci și două", "două zeci și două"], a: 1,
      explain: "mașină — женский род, поэтому в конце două; десятки пишутся слитно: douăzeci și două de mașini." },
    { type: "input", q: "14 = ___", a: ["paisprezece"],
      explain: "Особая форма: pai- (а не patru-) + sprezece = paisprezece." },
    { type: "order", words: ["Biletul", "costă", "cincizeci", "de", "lei"], ru: "Билет стоит пятьдесят лей.",
      explain: "cinci + zeci = cincizeci; число больше 20 — значит, нужен de: cincizeci de lei." },
    { type: "order", words: ["Avem", "două", "fete", "și", "un", "băiat"], ru: "У нас две девочки и мальчик.",
      alts: [["Avem", "un", "băiat", "și", "două", "fete"]],
      explain: "fată — женский род (două fete), băiat — мужской (un băiat)." }
  ]
});
