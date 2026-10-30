DE.grammar.push({
  id: "alphabet",
  title: "Алфавит и произношение",
  level: "A1",
  emoji: "🔤",
  summary: "ä ö ü ß, ei/ie, eu/äu, ch, sch, sp/st, z, v, w — как это читать",
  content: `<p>Хорошая новость: немецкий читается почти всегда <b>так, как пишется</b>. Нужно лишь один раз запомнить несколько буквосочетаний — и вы сможете прочитать любое слово.</p>

<h3>Особые буквы</h3>
<table>
<tr><th>Буква</th><th>Звук</th><th>Пример</th></tr>
<tr><td><b>ä</b></td><td>[э]</td><td>M<b>ä</b>dchen — девочка</td></tr>
<tr><td><b>ö</b></td><td>губы как для «о», говорим «э» (≈ «ё» в «мёд»)</td><td>sch<b>ö</b>n — красивый</td></tr>
<tr><td><b>ü</b></td><td>губы как для «у», говорим «и» (≈ «ю» в «тюль»)</td><td>f<b>ü</b>r — для</td></tr>
<tr><td><b>ß</b></td><td>[с] (после долгого гласного)</td><td>Stra<b>ß</b>e — улица</td></tr>
</table>

<h3>Буквосочетания</h3>
<table>
<tr><th>Пишем</th><th>Читаем</th><th>Пример</th></tr>
<tr><td><b>ei, ai</b></td><td>[ай]</td><td>m<b>ei</b>n, M<b>ai</b></td></tr>
<tr><td><b>ie</b></td><td>[и:] — долгое «и»</td><td>L<b>ie</b>be, v<b>ie</b>l</td></tr>
<tr><td><b>eu, äu</b></td><td>[ой]</td><td>L<b>eu</b>te, B<b>äu</b>me</td></tr>
<tr><td><b>sch</b></td><td>[ш]</td><td><b>Sch</b>ule</td></tr>
<tr><td><b>tsch</b></td><td>[ч]</td><td>Deu<b>tsch</b></td></tr>
<tr><td><b>sp-, st-</b> в начале слова/корня</td><td>[шп], [шт]</td><td><b>Sp</b>ort, <b>St</b>adt, ver<b>st</b>ehen</td></tr>
<tr><td><b>ch</b> после a, o, u, au</td><td>твёрдое [х]</td><td>Bu<b>ch</b>, a<b>ch</b>t</td></tr>
<tr><td><b>ch</b> после e, i, ä, ö, ü, согласных</td><td>мягкое [хь]</td><td>i<b>ch</b>, Mil<b>ch</b></td></tr>
<tr><td><b>-ig</b> в конце</td><td>[ихь]</td><td>billi<b>g</b></td></tr>
<tr><td><b>z, tz</b></td><td>[ц]</td><td><b>Z</b>eit, Ka<b>tz</b>e</td></tr>
<tr><td><b>v</b></td><td>[ф] (в заимствованиях — [в])</td><td><b>V</b>ater; <b>V</b>ase</td></tr>
<tr><td><b>w</b></td><td>[в]</td><td><b>W</b>asser</td></tr>
<tr><td><b>s</b> перед гласным</td><td>[з]</td><td><b>S</b>onne</td></tr>
<tr><td><b>j</b></td><td>[й]</td><td><b>j</b>a, <b>J</b>ahr</td></tr>
<tr><td><b>h</b> после гласного</td><td>не читается, гласный долгий</td><td>ge<b>h</b>en, Fa<b>h</b>rt</td></tr>
</table>

<p><b>R</b> произносится в горле (как при полоскании), а в конце слова почти превращается в «а»: Mutt<b>er</b> ≈ «мутта», hie<b>r</b> ≈ «хиа».</p>

<div class="tip">Путаете <b>ei</b> и <b>ie</b>? Назовите <b>вторую</b> букву по-английски: в <b>ie</b> вторая — «e» [и:], значит, читаем [и:]; в <b>ei</b> вторая — «i» [ай], значит, читаем [ай]. Сравните: <span class="hl">Wien</span> [ви:н] — Вена, <span class="hl">Wein</span> [вайн] — вино.</div>

<h3>Ударение</h3>
<p>Обычно ударение падает на <b>первый слог</b>: <b>A</b>rbeit, <b>Mu</b>tter, <b>spie</b>len. Исключения: слова с неотделяемыми приставками (be-, ver-, er-…: ver<b>ste</b>hen) и многие заимствования (Uni<b>ver</b>si<b>tät</b>, stu<b>die</b>ren, Bü<b>ro</b>).</p>

<div class="ex"><b>Ich spreche ein bisschen Deutsch.</b> — [ихь ш<b>пре</b>хе айн <b>бис</b>хьен дойч] — Я немного говорю по-немецки.</div>
<div class="ex"><b>Die Straße ist schön.</b> — [ди ш<b>тра</b>:се ист шён] — Улица красивая.</div>
<div class="ex"><b>Wie viel Zeit?</b> — [ви: фи:ль цайт] — Сколько времени?</div>

<div class="warn">Если нет немецкой клавиатуры: ä = <b>ae</b>, ö = <b>oe</b>, ü = <b>ue</b>, ß = <b>ss</b> (für → fuer, Straße → Strasse). В Швейцарии ß вообще не используют.</div>`,
  exercises: [
    { type: "choice", q: "Как читается «ie» в слове «Liebe»?", options: ["[ай]", "[и:] — долгое «и»", "[ие]"], a: 1,
      explain: "ie = долгое [и:]: Liebe [ли:бе], viel [фи:ль]." },
    { type: "choice", q: "Как читается «ei» в слове «mein»?", options: ["[ей]", "[ай]", "[и:]"], a: 1,
      explain: "ei всегда читается [ай]: mein [майн], Zeit [цайт]." },
    { type: "choice", q: "Как читается «eu» в слове «Leute»?", options: ["[еу]", "[ой]", "[ю]"], a: 1,
      explain: "eu и äu читаются [ой]: Leute [лойте], Bäume [бойме]." },
    { type: "choice", q: "Как читается «sp» в слове «Sport»?", options: ["[сп]", "[шп]", "[зп]"], a: 1,
      explain: "В начале слова sp = [шп], st = [шт]: Sport [шпорт], Stadt [штат]." },
    { type: "choice", q: "Какая буква читается как [ц]?", options: ["s", "z", "w"], a: 1,
      explain: "z = [ц]: Zeit [цайт], zehn [цэ:н]. s перед гласным читается [з], w — [в]." },
    { type: "choice", q: "Как читается «v» в слове «Vater»?", options: ["[в]", "[ф]", "[у]"], a: 1,
      explain: "В немецких словах v = [ф]: Vater [фа:тер], viel [фи:ль]." },
    { type: "choice", q: "Как читается «w» в слове «Wasser»?", options: ["[в]", "[ф]", "[у]"], a: 0,
      explain: "w = [в]: Wasser [васер], wo [во:]." },
    { type: "choice", q: "Как читается «sch» в слове «Schule»?", options: ["[сх]", "[ш]", "[щ]"], a: 1,
      explain: "sch = [ш]: Schule [шу:ле]. Звука [сх] в этом сочетании нет — три буквы дают один звук." },
    { type: "order", words: ["Wie", "heißt", "du"], ru: "Как тебя зовут?",
      explain: "Wie [ви:], heißt [хайст] — ei = [ай], ß = [с]." },
    { type: "choice", q: "Где ударение в слове «Arbeit» (работа)?", options: ["AR-beit", "ar-BEIT"], a: 0,
      explain: "В исконно немецких словах ударение обычно на первом слоге: ARbeit. На последний слог оно падает в основном в заимствованиях (Büro, Universität)." },
    { type: "choice", q: "В каком слове «ch» звучит твёрдо, как русское [х]?", options: ["ich", "Buch", "Milch"], a: 1,
      explain: "После a, o, u, au ch твёрдое: Buch, acht. После i, e и согласных — мягкое: ich, Milch." },
    { type: "input", q: "Как написать «Straße», если нет буквы ß? Stra___e", a: ["ss"],
      explain: "Без клавиатуры ß заменяют на ss: Straße → Strasse (одна s была бы неверной)." },
    { type: "input", q: "Как написать «für», если нет буквы ü? f___r", a: ["ue"],
      explain: "Умлаут заменяется на гласную + e: ü → ue (fuer), ä → ae, ö → oe." },
    { type: "order", words: ["Ich", "spreche", "ein", "bisschen", "Deutsch"], ru: "Я немного говорю по-немецки.",
      alts: [["ein", "bisschen", "Deutsch", "spreche", "Ich"], ["Deutsch", "spreche", "Ich", "ein", "bisschen"]],
      explain: "spreche [шпрехе] — sp в начале = [шп]; Deutsch [дойч] — eu = [ой], tsch = [ч]." }
  ]
});
