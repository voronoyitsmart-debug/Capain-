DE.grammar.push({
  id: "dativ",
  title: "Дательный падеж (Dativ)",
  level: "A2",
  emoji: "🎁",
  summary: "Кому? Чему? — dem/der/den, mir/dir, helfen, gefallen, gehören, danken",
  content: `<p><b>Dativ</b> отвечает на вопрос <b>Wem?</b> — «Кому?». Чаще всего это <b>адресат</b>: тот, кому что-то дают, показывают, помогают. Почти как русский дательный падеж.</p>

<h3>Артикли в Dativ</h3>
<table>
<tr><th></th><th>m (der)</th><th>f (die)</th><th>n (das)</th><th>Pl (die)</th></tr>
<tr><td>определённый</td><td><b>dem</b> Mann</td><td><b>der</b> Frau</td><td><b>dem</b> Kind</td><td><b>den</b> Kinder<b>n</b></td></tr>
<tr><td>неопределённый</td><td><b>einem</b> Mann</td><td><b>einer</b> Frau</td><td><b>einem</b> Kind</td><td>— Kinder<b>n</b></td></tr>
<tr><td>отрицание</td><td><b>keinem</b></td><td><b>keiner</b></td><td><b>keinem</b></td><td><b>keinen</b> …n</td></tr>
</table>
<div class="tip">Окончания Dativ: <b>-m, -r, -m, -n</b> — «<b>М</b>а<b>Р</b>и<b>М</b>а<b>Н</b>а». Во множественном числе к существительному добавляется <b>-n</b>: den Freunde<b>n</b>, den Kinder<b>n</b> (если слово уже не кончается на -n или -s: den Frauen, den Autos).</div>

<h3>Личные местоимения</h3>
<table>
<tr><th>Nom</th><th>ich</th><th>du</th><th>er</th><th>sie</th><th>es</th><th>wir</th><th>ihr</th><th>sie</th><th>Sie</th></tr>
<tr><td><b>Dat</b></td><td>mir</td><td>dir</td><td>ihm</td><td>ihr</td><td>ihm</td><td>uns</td><td>euch</td><td>ihnen</td><td>Ihnen</td></tr>
</table>

<h3>Глаголы, которые требуют Dativ</h3>
<table>
<tr><th>Глагол</th><th>Значение</th><th>Пример</th></tr>
<tr><td>helfen</td><td>помогать (кому)</td><td>Ich helfe <b>dir</b>.</td></tr>
<tr><td>gefallen</td><td>нравиться (кому)</td><td>Das Kleid gefällt <b>mir</b>.</td></tr>
<tr><td>gehören</td><td>принадлежать (кому)</td><td>Das Auto gehört <b>dem</b> Chef.</td></tr>
<tr><td>danken</td><td>благодарить</td><td>Ich danke <b>Ihnen</b>.</td></tr>
<tr><td>antworten</td><td>отвечать (кому)</td><td>Er antwortet <b>der</b> Lehrerin.</td></tr>
<tr><td>schmecken</td><td>быть вкусным (кому)</td><td>Die Suppe schmeckt <b>ihm</b>.</td></tr>
<tr><td>gratulieren</td><td>поздравлять</td><td>Wir gratulieren <b>dir</b>!</td></tr>
</table>

<div class="warn"><b>danken</b> и <b>gratulieren</b> — ловушки! По-русски «благодарить <i>кого</i>», «поздравлять <i>кого</i>» (винительный), а по-немецки — Dativ: Ich danke <b>dir</b> (не dich!).</div>

<p>У глаголов «давать» (geben, schenken, zeigen, bringen, erklären) часто два дополнения: <b>кому</b> — Dativ, <b>что</b> — Akkusativ.</p>
<div class="ex"><b>Ich schenke meiner Mutter einen Schal.</b> — Я дарю маме шарф. (кому? — Dat, что? — Akk)</div>
<div class="ex"><b>Gefällt dir die Stadt?</b> — Тебе нравится город?</div>
<div class="ex"><b>Wem gehört der Schlüssel?</b> — Чей это ключ? (букв. «Кому принадлежит ключ?»)</div>
<div class="ex"><b>Wie geht es Ihnen?</b> — Как у Вас дела?</div>

<div class="tip">«Мне нравится» по-немецки строится так же, как по-русски: <b>Es gefällt mir</b> — «Это нравится мне». Тот, кому нравится, стоит в Dativ, а то, что нравится, — подлежащее.</div>`,
  exercises: [
    { type: "choice", q: "Ich helfe ___ Mann.", options: ["den", "dem", "der"], a: 1,
      explain: "helfen требует Dativ; мужской род: der → dem Mann, а не den (Akkusativ)." },
    { type: "choice", q: "Das Buch gehört ___ Frau.", options: ["die", "der", "den"], a: 1,
      explain: "gehören требует Dativ; женский род: die → der Frau." },
    { type: "input", q: "Der Film gefällt ___. (ich)", a: ["mir"],
      explain: "gefallen + Dativ: тот, кому нравится, — в Dativ: ich → mir. mich — это Akkusativ." },
    { type: "input", q: "Kannst du ___ helfen? (wir)", a: ["uns"],
      explain: "helfen + Dativ: wir → uns (у wir формы Akkusativ и Dativ совпадают)." },
    { type: "choice", q: "Ich danke ___ für die Hilfe. (du)", options: ["dich", "dir", "du"], a: 1,
      explain: "danken требует Dativ: du → dir (в отличие от русского «благодарю тебя»)." },
    { type: "order", words: ["Die", "Jacke", "gefällt", "mir", "sehr"], ru: "Куртка мне очень нравится.",
      alts: [["mir", "gefällt", "Die", "Jacke", "sehr"]],
      explain: "Подлежащее — die Jacke, тот, кому нравится, — в Dativ (mir). Можно начать и с mir: Mir gefällt die Jacke sehr — глагол всё равно на 2-м месте." },
    { type: "input", q: "Wir geben ___ Kindern Schokolade. (die Kinder)", a: ["den"],
      explain: "geben: кому? — Dativ. Во мн. числе артикль den + существительное на -n: den Kindern. die — Nominativ/Akkusativ." },
    { type: "choice", q: "Er schenkt ___ Freundin ein Buch.", options: ["eine", "einer", "einen"], a: 1,
      explain: "schenken: кому? — Dativ, женский род: eine → einer Freundin. ein Buch — Akkusativ (что?)." },
    { type: "input", q: "Wie geht es ___? (Sie, вежливо)", a: ["Ihnen"],
      explain: "Wie geht es …? требует Dativ: вежливое Sie → Ihnen (с большой буквы). Sie — это Nominativ/Akkusativ." },
    { type: "choice", q: "Gehört das Auto ___? (er)", options: ["ihn", "ihm", "er"], a: 1,
      explain: "gehören + Dativ: er → ihm. ihn — это Akkusativ." },
    { type: "order", words: ["Ich", "zeige", "dir", "die", "Stadt"], ru: "Я покажу тебе город.",
      alts: [["die", "Stadt", "zeige", "Ich", "dir"]],
      explain: "Кому? — dir (Dativ), что? — die Stadt (Akkusativ). Короткое местоимение dir стоит перед существительным." },
    { type: "choice", q: "Ich antworte den ___. (die Freunde)", options: ["Freund", "Freunde", "Freunden"], a: 2,
      explain: "В Dativ мн. числа существительное получает -n: den Freunden." },
    { type: "input", q: "Das Essen schmeckt ___ nicht. (er)", a: ["ihm"],
      explain: "schmecken + Dativ: er → ihm. ihn было бы Akkusativ." },
    { type: "order", words: ["Kannst", "du", "mir", "helfen"], ru: "Можешь мне помочь?",
      explain: "Модальный глагол на первом месте в вопросе, инфинитив — в конце. helfen требует Dativ: mir, а не mich." }
  ]
});
