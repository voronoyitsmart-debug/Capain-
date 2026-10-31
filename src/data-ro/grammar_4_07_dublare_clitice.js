DE.grammar.push({
  id: "dublare_clitice",
  title: "Удвоение дополнения: Îl văd pe Ion",
  level: "B2",
  emoji: "👥",
  summary: "Îl văd pe Ion. I-am dat lui Ion cartea. — дополнение повторяется местоимением",
  content: `<p>В румынском дополнение часто «удваивается»: рядом с ним стоит ещё и краткое местоимение (clitic). Для русского уха это звучит как «Я <i>его</i> вижу Иона», но для румына без местоимения фраза неполная.</p>

<h3>Краткие местоимения</h3>
<table>
<tr><th>Лицо</th><th>Винительный (кого?)</th><th>Дательный (кому?)</th></tr>
<tr><td>eu</td><td>mă (m-)</td><td>îmi (mi-)</td></tr>
<tr><td>tu</td><td>te</td><td>îți (ți-)</td></tr>
<tr><td>el</td><td>îl (l-, -l)</td><td>îi (i-)</td></tr>
<tr><td>ea</td><td>o (-o)</td><td>îi (i-)</td></tr>
<tr><td>noi</td><td>ne</td><td>ne (ni-)</td></tr>
<tr><td>voi</td><td>vă (v-)</td><td>vă (vi-)</td></tr>
<tr><td>ei / ele</td><td>îi (i-) / le</td><td>le (li-)</td></tr>
</table>

<h3>1. Прямое дополнение с pe — удвоение обязательно</h3>
<p>Предлог <b>pe</b> ставится перед прямым дополнением-лицом (имена, люди, местоимения). Тогда обязательно и краткое местоимение:</p>
<div class="ex"><b>Îl văd pe Ion.</b> — Я вижу Иона.<br><b>O cunosc pe Maria.</b> — Я знаю Марию.<br><b>Îi aștept pe copii.</b> — Я жду детей.<br><b>Le salut pe fete.</b> — Я приветствую девушек.</div>
<p>В perfect compus: <b>L-am văzut pe Ion</b>, но женское <b>o</b> ставится после причастия: <b>Am văzut-o pe Maria</b>.</p>
<div class="warn">После pe существительное без определения <b>теряет артикль</b>: <i>Îl caut pe <b>director</b></i> (не «pe directorul»). С определением артикль остаётся: <i>Îl caut pe directorul școlii.</i></div>

<h3>2. Неодушевлённые предметы</h3>
<p>Без pe — без удвоения: <b>Văd casa. Am citit cartea.</b> Но если дополнение вынесено <b>в начало</b> фразы, оно удваивается:</p>
<div class="ex"><b>Cartea am citit-o deja.</b> — Книгу я уже прочитал.<br><b>Filmul l-am văzut ieri.</b> — Фильм я видел вчера.</div>

<h3>3. Косвенное дополнение (дательный падеж)</h3>
<p>С существительными удвоение очень частое, в речи почти обязательное; с ударными местоимениями (mie, ție, lui, ei…) — обязательное:</p>
<div class="ex"><b>I-am dat lui Ion cartea.</b> — Я дал Иону книгу.<br><b>Le-am spus copiilor adevărul.</b> — Я сказал детям правду.<br><b>Mie îmi place muzica.</b> — Мне нравится музыка.</div>

<table>
<tr><th>Ситуация</th><th>Удвоение</th><th>Пример</th></tr>
<tr><td>pe + лицо</td><td>обязательно</td><td>Îl ajut pe Andrei.</td></tr>
<tr><td>ударное местоимение</td><td>обязательно</td><td>Pe tine te cunosc. Ție îți spun.</td></tr>
<tr><td>дательный + существительное</td><td>почти всегда</td><td>Îi scriu mamei.</td></tr>
<tr><td>предмет перед глаголом</td><td>обязательно</td><td>Casa am vândut-o.</td></tr>
<tr><td>предмет после глагола</td><td>нет</td><td>Am vândut casa.</td></tr>
</table>

<div class="tip">Правило-проверка: видите <span class="hl">pe</span> перед человеком — сразу ставьте местоимение того же рода и числа перед глаголом: pe Ion → îl, pe Ana → o, pe copii → îi, pe fete → le.</div>`,
  exercises: [
    { type: "choice", q: "___ văd pe Ion mâine.", options: ["Îl", "O", "Îi"], a: 0,
      explain: "Ion — м. р. ед. ч., винительный падеж: îl." },
    { type: "choice", q: "Am văzut-___ pe Maria la teatru.", options: ["o", "l", "i"], a: 0,
      explain: "Maria — ж. р. ед. ч.: o; в perfect compus оно ставится после причастия: am văzut-o." },
    { type: "input", q: "___ aștept pe copii la școală. (вин. п.)", a: ["Îi"],
      explain: "Copii — м. р. мн. ч.: îi aștept pe copii." },
    { type: "input", q: "___ salut pe fete. (вин. п.)", a: ["Le"],
      explain: "Fete — ж. р. мн. ч.: винительное местоимение le." },
    { type: "choice", q: "Îl caut pe ___.", options: ["director", "directorul", "directorului"], a: 0,
      explain: "После pe существительное без определения теряет артикль: pe director." },
    { type: "order", words: ["L-am", "întâlnit", "pe", "Andrei", "ieri"], ru: "Я вчера встретил Андрея.",
      alts: [["ieri", "L-am", "întâlnit", "pe", "Andrei"], ["L-am", "întâlnit", "ieri", "pe", "Andrei"], ["pe", "Andrei", "L-am", "întâlnit", "ieri"]],
      explain: "Pe Andrei удваивается местоимением l- (l-am întâlnit). Порядок свободный, но местоимение всегда стоит при глаголе." },
    { type: "input", q: "___ dat lui Ion cartea. (дат. местоимение + am)", a: ["I-am"],
      explain: "Lui Ion — дательный, м. р. ед. ч.: îi → i- перед am: i-am dat." },
    { type: "choice", q: "___ spun ție un secret.", options: ["Îți", "Te", "Îi"], a: 0,
      explain: "Ție — дательный 2 л. ед. ч., удваивается кратким îți." },
    { type: "choice", q: "Cartea ___ citit-o deja.", options: ["am", "l-am", "o-am"], a: 0,
      explain: "Предмет вынесен в начало, поэтому удваивается: cartea (ж. р.) → am citit-o." },
    { type: "choice", q: "Какое предложение правильное?", options: ["Văd casa.", "O văd casa.", "Văd pe casa."], a: 0,
      explain: "Неодушевлённое дополнение после глагола не требует ни pe, ни удвоения." },
    { type: "order", words: ["Le-am", "spus", "copiilor", "adevărul"], ru: "Я сказал детям правду.",
      alts: [["Le-am", "spus", "adevărul", "copiilor"], ["copiilor", "Le-am", "spus", "adevărul"]],
      explain: "Copiilor — дательный мн. ч., удваивается местоимением le-." },
    { type: "input", q: "Pe tine ___ cunosc de mult. (вин. п.)", a: ["te"],
      explain: "Ударное pe tine обязательно удваивается кратким te." },
    { type: "choice", q: "Mie ___ place muzica.", options: ["îmi", "mă", "mi"], a: 0,
      explain: "A plăcea требует дательного: mie → îmi place (mi- — только перед гласной: mi-a plăcut)." }
  ]
});
