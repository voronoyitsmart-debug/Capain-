DE.grammar.push({
  id: "n_deklination",
  title: "N-склонение (n-Deklination)",
  level: "B2",
  emoji: "🦁",
  summary: "der Junge → den Jungen, der Student → dem Studenten, der Name → des Namens",
  content: `<p>Есть небольшая группа существительных <b>мужского рода</b>, которые во всех падежах, кроме именительного, получают окончание <span class="hl">-(e)n</span>. Это и есть <b>n-Deklination</b> (слабое склонение).</p>
<h3>Склонение</h3>
<table>
<tr><th>Падеж</th><th>der Junge</th><th>der Student</th><th>der Herr</th></tr>
<tr><td>Nominativ</td><td>der Junge</td><td>der Student</td><td>der Herr</td></tr>
<tr><td>Akkusativ</td><td>den Junge<b>n</b></td><td>den Student<b>en</b></td><td>den Herr<b>n</b></td></tr>
<tr><td>Dativ</td><td>dem Junge<b>n</b></td><td>dem Student<b>en</b></td><td>dem Herr<b>n</b></td></tr>
<tr><td>Genitiv</td><td>des Junge<b>n</b></td><td>des Student<b>en</b></td><td>des Herr<b>n</b></td></tr>
<tr><td>Plural</td><td>die Junge<b>n</b></td><td>die Student<b>en</b></td><td>die Herr<b>en</b></td></tr>
</table>
<p>Обратите внимание: в Genitiv <b>нет</b> окончания -s! <i>des Studenten</i>, а не <i>des Studentens</i>.</p>
<h3>Какие слова сюда относятся?</h3>
<ul>
<li><b>Люди и животные на -e:</b> der Junge, der Kollege, der Kunde, der Neffe, der Experte, der Löwe, der Affe, der Hase, der Russe, der Franzose.</li>
<li><b>Иностранные слова на -ent, -ant, -ist, -at, -oge, -graf:</b> der Student, der Präsident, der Praktikant, der Polizist, der Journalist, der Soldat, der Kandidat, der Biologe, der Fotograf. А также der Planet.</li>
<li><b>Отдельные слова (запомнить):</b> der Mensch, der Herr, der Nachbar, der Bauer, der Bär, der Held, der Prinz, der Graf.</li>
</ul>
<h3>Особая группа: Genitiv на -ns</h3>
<p>Несколько абстрактных слов в Genitiv получают <b>-ns</b>:</p>
<table>
<tr><th>Nom.</th><th>Akk.</th><th>Dat.</th><th>Gen.</th></tr>
<tr><td>der Name</td><td>den Namen</td><td>dem Namen</td><td>des Name<b>ns</b></td></tr>
<tr><td>der Gedanke</td><td>den Gedanken</td><td>dem Gedanken</td><td>des Gedanke<b>ns</b></td></tr>
<tr><td>der Buchstabe</td><td>den Buchstaben</td><td>dem Buchstaben</td><td>des Buchstabe<b>ns</b></td></tr>
<tr><td>der Glaube</td><td>den Glauben</td><td>dem Glauben</td><td>des Glaube<b>ns</b></td></tr>
<tr><td>das Herz</td><td>das Herz</td><td>dem Herz<b>en</b></td><td>des Herz<b>ens</b></td></tr>
</table>
<p>Сюда же: der Wille, der Friede, der Funke, der Same. <b>das Herz</b> — единственное слово среднего рода с похожим склонением (Akk. = Nom.).</p>
<div class="ex"><b>Ich frage den Polizisten nach dem Weg.</b> — Я спрашиваю у полицейского дорогу.</div>
<div class="ex"><b>Das ist das Büro des Präsidenten.</b> — Это кабинет президента.</div>
<div class="ex"><b>Kennst du den Namen des Kunden?</b> — Ты знаешь имя клиента?</div>
<div class="ex"><b>Ich danke dir von ganzem Herzen.</b> — Благодарю тебя от всего сердца.</div>
<div class="warn">Не все слова мужского рода на -e склоняются так: <i>der Käse, der See</i> — обычное склонение (des Käses, des Sees). Они не обозначают людей или животных.</div>
<div class="tip">Правило «трёх вопросов»: мужской род? Живое существо? Оканчивается на -e или на «иностранный» суффикс (-ent, -ist, -ant, -at)? Три «да» — смело добавляйте <b>-(e)n</b> везде, кроме Nominativ. В разговорной речи окончание иногда проглатывают (<i>mit dem Student</i>), но в письме и на экзамене оно обязательно.</div>`,
  exercises: [
    { type: "choice", q: "Ich habe gestern ___ getroffen.", options: ["den Student", "den Studenten", "der Studenten"], a: 1,
      explain: "treffen + Akkusativ; der Student (суффикс -ent) относится к n-Deklination → den Studenten. «den Student» — разговорная ошибка, «der Studenten» — Genitiv/Dativ мн. ч." },
    { type: "input", q: "Kennst du den neuen ___? (der Kollege)", a: ["Kollegen"],
      explain: "Kollege — человек, мужской род, на -e → n-Deklination. В Akkusativ: den Kollegen." },
    { type: "choice", q: "Wie ist die Schreibweise des ___?", options: ["Name", "Namen", "Namens"], a: 2,
      explain: "der Name входит в особую группу (Name, Gedanke, Buchstabe, Glaube): в Genitiv -ns → des Namens. «des Namen» — неверно." },
    { type: "input", q: "Sie hilft dem alten ___. (der Herr)", a: ["Herrn"],
      explain: "helfen + Dativ; Herr в ед. числе получает -n (dem Herrn), а -en — только во мн. числе (die Herren)." },
    { type: "order", words: ["Der", "Arzt", "untersucht", "den", "Patienten"], ru: "Врач осматривает пациента.",
      alts: [["den", "Patienten", "untersucht", "Der", "Arzt"]],
      explain: "der Patient (суффикс -ent) в Akkusativ → den Patienten. Артикли показывают падежи, поэтому дополнение может стоять и на 1-м месте." },
    { type: "choice", q: "Какое слово НЕ склоняется по n-Deklination?", options: ["der Kunde", "der Tisch", "der Polizist"], a: 1,
      explain: "der Tisch — неодушевлённый, без суффикса -ent/-ist и без -e: den Tisch, des Tisches. Kunde (живое на -e) и Polizist (-ist) — слабые." },
    { type: "input", q: "Das ist das Auto meines ___. (der Nachbar)", a: ["Nachbarn"],
      explain: "Nachbar — слово-исключение, склоняется по n-Deklination: des Nachbarn (без -s)." },
    { type: "choice", q: "Die Kinder füttern ___ im Zoo.", options: ["den Affen", "den Affe", "dem Affe"], a: 0,
      explain: "füttern требует Akkusativ; der Affe — животное на -e → den Affen. «dem» — Dativ." },
    { type: "input", q: "Ich spreche mit dem ___. (der Präsident)", a: ["Präsidenten", "Praesidenten"],
      explain: "mit + Dativ; суффикс -ent → n-Deklination: dem Präsidenten." },
    { type: "choice", q: "Ich danke dir von ganzem ___.", options: ["Herz", "Herzen", "Herzens"], a: 1,
      explain: "das Herz склоняется особо: Dativ — dem Herzen. Устойчивое выражение: von ganzem Herzen. «Herzens» — Genitiv (des Herzens)." },
    { type: "order", words: ["Wir", "fragen", "den", "Polizisten", "nach", "dem", "Weg"], ru: "Мы спрашиваем у полицейского дорогу.",
      alts: [["den", "Polizisten", "fragen", "Wir", "nach", "dem", "Weg"], ["nach", "dem", "Weg", "fragen", "Wir", "den", "Polizisten"]],
      explain: "fragen + Akkusativ; der Polizist → den Polizisten. Глагол fragen на 2-м месте, на 1-м может стоять любая группа." },
    { type: "choice", q: "Die Zeitung hat ein Interview mit einem bekannten ___ veröffentlicht.", options: ["Journalist", "Journalisten", "Journalists"], a: 1,
      explain: "mit + Dativ; суффикс -ist → n-Deklination: einem Journalisten. Окончания -s у таких слов не бывает." },
    { type: "input", q: "Das Kind zeichnet einen ___. (der Löwe)", a: ["Löwen", "Loewen"],
      explain: "zeichnen + Akkusativ; der Löwe — животное мужского рода на -e → einen Löwen." },
    { type: "choice", q: "Die Würde des ___ ist unantastbar.", options: ["Mensch", "Menschen", "Menschens"], a: 1,
      explain: "der Mensch — слабое существительное: des Menschen, без -s. Это первая фраза Основного закона ФРГ." }
  ]
});
