DE.grammar.push({
  id: "akkusativ",
  title: "Винительный падеж (Akkusativ)",
  level: "A1",
  emoji: "🎯",
  summary: "Кого? Что? — den/einen, mich/dich…",
  content: `<p>Akkusativ — это прямое дополнение, отвечает на вопросы <b>wen? (кого?)</b> и <b>was? (что?)</b>. Как в русском «вижу кот<b>а</b>», «покупаю книг<b>у</b>». Хорошая новость: в немецком меняется только <b>мужской род</b>!</p>

<table>
<tr><th></th><th>Мужской</th><th>Женский</th><th>Средний</th><th>Мн. число</th></tr>
<tr><td>Nominativ (кто? что?)</td><td>der / ein / kein</td><td>die / eine</td><td>das / ein</td><td>die / —</td></tr>
<tr><td>Akkusativ (кого? что?)</td><td><b>den / einen / keinen</b></td><td>die / eine</td><td>das / ein</td><td>die / —</td></tr>
</table>
<p>Так же меняются притяжательные: mein → <b>meinen</b>, dein → <b>deinen</b>.</p>

<div class="tip">Правило «мужчине — <b>-n</b>»: в Akkusativ к артиклю мужского рода прибавляется <span class="hl">n</span>: de<b>n</b>, eine<b>n</b>, keine<b>n</b>, meine<b>n</b>. Остальные роды «ленивые» и не меняются.</div>

<div class="ex"><b>Der Hund ist klein. Ich sehe den Hund.</b> — Собака маленькая. Я вижу собаку.</div>
<div class="ex"><b>Ich kaufe einen Tisch und eine Lampe.</b> — Я покупаю стол и лампу.</div>
<div class="ex"><b>Hast du einen Bruder?</b> — У тебя есть брат?</div>

<h3>Местоимения в Akkusativ</h3>
<table>
<tr><th>Nominativ</th><th>ich</th><th>du</th><th>er</th><th>sie</th><th>es</th><th>wir</th><th>ihr</th><th>sie / Sie</th></tr>
<tr><td>Akkusativ</td><td><b>mich</b></td><td><b>dich</b></td><td><b>ihn</b></td><td>sie</td><td>es</td><td><b>uns</b></td><td><b>euch</b></td><td>sie / Sie</td></tr>
</table>
<div class="ex"><b>Ich liebe dich.</b> — Я тебя люблю.</div>
<div class="ex"><b>Kennst du Peter? — Ja, ich kenne ihn.</b> — Ты знаешь Петера? — Да, я его знаю.</div>

<h3>Частые глаголы и предлоги с Akkusativ</h3>
<ul>
<li>Глаголы: haben, brauchen, kaufen, sehen, essen, trinken, nehmen, besuchen, lieben, kennen, suchen и оборот <b>es gibt</b> (есть, имеется).</li>
<li>Предлоги: <b>für</b> (для), <b>ohne</b> (без), <b>durch</b> (через), <b>gegen</b> (против), <b>um</b> (вокруг, в — о времени).</li>
</ul>
<div class="ex"><b>Das Geschenk ist für dich.</b> — Подарок для тебя.</div>

<div class="warn">Не путайте: после <b>sein</b> Akkusativ не бывает! «Das ist <b>ein</b> Hund» (Nominativ), но «Ich habe <b>einen</b> Hund» (Akkusativ).</div>`,
  exercises: [
    { type: "choice", q: "Ich sehe ___ Hund.", options: ["der", "den", "dem"], a: 1,
      explain: "sehen требует Akkusativ; мужской род: der → den Hund. dem — это Dativ." },
    { type: "input", q: "Ich kaufe ___ Tisch. (ein)", a: ["einen"],
      explain: "kaufen + Akkusativ; der Tisch — мужской род, поэтому ein → einen." },
    { type: "input", q: "Er trinkt ___ Milch. (die)", a: ["die"],
      explain: "Женский род в Akkusativ не меняется: die Milch. Меняется только мужской род (der → den)." },
    { type: "choice", q: "Wir haben ___ Hund.", options: ["kein", "keinen", "keine"], a: 1,
      explain: "haben требует Akkusativ; der Hund — мужской род: keinen Hund. kein — Nominativ, keine — женский род/мн. число." },
    { type: "choice", q: "Ich liebe ___. (тебя)", options: ["du", "dich", "dir"], a: 1,
      explain: "lieben + Akkusativ: du → dich. dir — это Dativ." },
    { type: "input", q: "Kennst du Peter? — Ja, ich kenne ___. (местоимение)", a: ["ihn"],
      explain: "Peter = er; kennen требует Akkusativ: er → ihn. ihm — Dativ." },
    { type: "order", words: ["Ich", "brauche", "einen", "Stift"], ru: "Мне нужна ручка.",
      alts: [["einen", "Stift", "brauche", "Ich"]],
      explain: "brauchen требует Akkusativ: der Stift → einen Stift. В отличие от русского «мне нужна», подлежащее — ich." },
    { type: "choice", q: "Das Geschenk ist für ___. (он)", options: ["er", "ihn", "ihm"], a: 1,
      explain: "Предлог für всегда требует Akkusativ: er → ihn. ihm — Dativ." },
    { type: "input", q: "Besuchst du ___ morgen? (мы)", a: ["uns"],
      explain: "besuchen + Akkusativ: wir → uns (Akkusativ и Dativ у wir совпадают)." },
    { type: "choice", q: "Hier gibt es ___ Supermarkt.", options: ["ein", "einen", "eine"], a: 1,
      explain: "После es gibt всегда Akkusativ: der Supermarkt → einen Supermarkt. ein было бы Nominativ." },
    { type: "order", words: ["Siehst", "du", "den", "Mann"], ru: "Ты видишь мужчину?",
      explain: "sehen + Akkusativ: der Mann → den Mann. Вопрос да/нет — глагол первым." },
    { type: "input", q: "Ich esse ___ Apfel. (ein)", a: ["einen"],
      explain: "essen + Akkusativ; der Apfel — мужской род: einen Apfel." },
    { type: "choice", q: "Wir gehen ohne ___. (вы — группа друзей)", options: ["ihr", "euch", "uns"], a: 1,
      explain: "Предлог ohne требует Akkusativ: ihr → euch. ihr — форма Nominativ." },
    { type: "input", q: "Er kennt ___ Bruder. (mein)", a: ["meinen"],
      explain: "kennen + Akkusativ; der Bruder — мужской род: mein → meinen (окончание как у einen)." }
  ]
});
