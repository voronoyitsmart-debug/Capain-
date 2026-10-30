DE.grammar.push({
  id: "passiv_ersatz",
  title: "Альтернативы пассиву (Passiversatz)",
  level: "B2",
  emoji: "🔄",
  summary: "man, sich lassen + Inf., sein + zu + Inf., -bar / -lich",
  content: `<p>Пассив в немецком звучит тяжеловато, поэтому носители часто заменяют его другими конструкциями. Их важно узнавать в текстах и уметь использовать самому — особенно на экзаменах B2/C1.</p>
<h3>1. man + актив</h3>
<p>Самый простой способ: неопределённое <b>man</b> + глагол в 3-м лице ед. ч.</p>
<div class="ex"><b>Hier wird Deutsch gesprochen.</b> → <b>Hier spricht man Deutsch.</b> — Здесь говорят по-немецки.</div>
<h3>2. sich lassen + Infinitiv = «можно»</h3>
<p><span class="hl">sich lassen + Inf.</span> = <b>können + Passiv</b>. Описывает возможность.</p>
<div class="ex"><b>Das Fenster lässt sich leicht öffnen.</b> = Das Fenster kann leicht geöffnet werden. — Окно легко открывается.</div>
<div class="ex"><b>Das lässt sich nicht ändern.</b> — Этого не изменить.</div>
<h3>3. sein + zu + Infinitiv = «можно» или «нужно»</h3>
<p><span class="hl">sein + zu + Inf.</span> = <b>können</b> или <b>müssen + Passiv</b>. Смысл подсказывает контекст.</p>
<div class="ex"><b>Die Aufgabe ist leicht zu lösen.</b> = kann leicht gelöst werden. — Задачу легко решить.</div>
<div class="ex"><b>Die Rechnung ist bis Montag zu bezahlen.</b> = muss bezahlt werden. — Счёт нужно оплатить до понедельника.</div>
<p>У отделяемых глаголов <b>zu</b> встаёт внутрь: <i>ab<b>zu</b>geben, an<b>zu</b>rufen</i>.</p>
<h3>4. Прилагательные на -bar / -lich</h3>
<p>Суффикс <b>-bar</b> (реже <b>-lich</b>) = «такой, который можно …». С приставкой <b>un-</b> — «нельзя».</p>
<table>
<tr><th>Глагол</th><th>Прилагательное</th><th>Значение</th></tr>
<tr><td>lösen</td><td>lösbar / unlösbar</td><td>решаемый / нерешаемый</td></tr>
<tr><td>machen</td><td>machbar</td><td>выполнимый</td></tr>
<tr><td>trinken</td><td>trinkbar</td><td>пригодный для питья</td></tr>
<tr><td>lesen</td><td>lesbar</td><td>читаемый, разборчивый</td></tr>
<tr><td>verstehen</td><td>verständlich</td><td>понятный</td></tr>
<tr><td>erhalten</td><td>erhältlich</td><td>имеющийся в продаже</td></tr>
<tr><td>vermeiden</td><td>unvermeidlich</td><td>неизбежный</td></tr>
</table>
<h3>Сводная таблица</h3>
<table>
<tr><th>Пассив</th><th>Замена</th></tr>
<tr><td>Das kann nicht repariert werden.</td><td>Das <b>lässt sich</b> nicht reparieren.<br>Das <b>ist</b> nicht <b>zu</b> reparieren.<br>Das ist nicht <b>reparierbar</b>.<br><b>Man kann</b> das nicht reparieren.</td></tr>
<tr><td>Der Antrag muss ausgefüllt werden.</td><td>Der Antrag <b>ist auszufüllen</b>.<br><b>Man muss</b> den Antrag ausfüllen.</td></tr>
</table>
<div class="warn"><b>man</b> всегда требует глагол в ед. ч.: <i>man spricht</i>, а не <i>man sprechen</i>. И не путайте <b>man</b> (неопределённое лицо) и <b>der Mann</b> (мужчина)!</div>
<div class="tip">Запомните формулу: <b>-bar ≈ lässt sich ≈ ist zu + Inf. ≈ kann … werden</b>. Увидели в тексте «ist … zu + Infinitiv» — сразу спросите себя: «можно» или «нужно»? В инструкциях и официальных письмах это почти всегда «нужно».</div>`,
  exercises: [
    { type: "choice", q: "Das Problem ist ___. (= kann gelöst werden)", options: ["lösbar", "lösend", "gelöst"], a: 0,
      explain: "Суффикс -bar означает «такой, который можно…»: lösbar = решаемый. «gelöst» — уже решён (результат), а не возможность." },
    { type: "input", q: "Diese Tür lässt ___ nicht öffnen.", a: ["sich"],
      explain: "sich lassen + инфинитив = «можно/нельзя» (= kann nicht geöffnet werden): дверь не открывается." },
    { type: "input", q: "Das Formular ist bis Freitag ___. (abgeben, = muss abgegeben werden)", a: ["abzugeben"],
      explain: "sein + zu + инфинитив = «нужно». abgeben — отделяемый глагол, zu встаёт между приставкой и корнем: ab-zu-geben." },
    { type: "order", words: ["Das", "lässt", "sich", "leicht", "erklären"], ru: "Это легко объяснить.",
      explain: "lässt на 2-м месте, возвратное sich сразу после него, инфинитив erklären — в конце (= kann leicht erklärt werden)." },
    { type: "choice", q: "Das Wasser ist nicht ___ — trink es nicht!", options: ["trinkbar", "trinklich", "getrunken"], a: 0,
      explain: "trinkbar = пригодный для питья (можно пить). Слова «trinklich» не существует, «getrunken» — Partizip II («выпитый»)." },
    { type: "choice", q: "Der Text ist schwer zu ___.", options: ["verstehen", "verstanden", "versteht"], a: 0,
      explain: "В конструкции sein + zu после zu всегда стоит инфинитив: schwer zu verstehen = трудно понять." },
    { type: "input", q: "Hier wird Deutsch gesprochen. → Hier spricht ___ Deutsch.", a: ["man"],
      explain: "Пассив без исполнителя заменяется на man + актив; глагол при man в 3-м лице ед. числа (spricht)." },
    { type: "choice", q: "Что значит: „Die Medikamente sind nur in der Apotheke erhältlich.“?", options: ["Лекарства можно купить только в аптеке.", "Лекарства нужно отнести в аптеку.", "Лекарства уже получены в аптеке."], a: 0,
      explain: "erhältlich (от erhalten) = «можно получить/купить, имеется в продаже». Это возможность, а не обязанность или результат." },
    { type: "order", words: ["Die", "Rechnung", "ist", "sofort", "zu", "bezahlen"], ru: "Счёт необходимо оплатить немедленно.",
      alts: [["sofort", "ist", "Die", "Rechnung", "zu", "bezahlen"]],
      explain: "sein + zu + инфинитив здесь значит «нужно» (= muss bezahlt werden). ist на 2-м месте, zu bezahlen — в конце." },
    { type: "choice", q: "Diese Handschrift ist kaum ___.", options: ["lesbar", "leselich", "lesend"], a: 0,
      explain: "lesbar = разборчивый, такой, который можно прочитать. «leselich» не существует, «lesend» — «читающий»." },
    { type: "input", q: "Das kann man nicht ändern. → Das ist nicht zu ___.", a: ["ändern", "aendern"],
      explain: "sein + zu + инфинитив = «можно/нельзя сделать»: Das ist nicht zu ändern = этого не изменить." },
    { type: "choice", q: "Man ___ das Museum im Jahr 1900.", options: ["eröffnete", "eröffneten", "wurde eröffnet"], a: 0,
      explain: "man требует глагол в 3-м лице ед. числа в активе: man eröffnete. «eröffneten» — мн. число, «wurde eröffnet» — пассив, с man невозможен." },
    { type: "order", words: ["Dieses", "Projekt", "ist", "leider", "nicht", "machbar"], ru: "Этот проект, к сожалению, неосуществим.",
      alts: [["leider", "ist", "Dieses", "Projekt", "nicht", "machbar"]],
      explain: "machbar (от machen) = выполнимый; nicht machbar = неосуществимый. Предложение можно начать и с leider." },
    { type: "choice", q: "Die Aufgabe lässt sich in einer Stunde ___.", options: ["erledigen", "erledigt", "zu erledigen"], a: 0,
      explain: "После sich lassen стоит чистый инфинитив без zu: lässt sich erledigen. zu нужен только в конструкции sein + zu." }
  ]
});
