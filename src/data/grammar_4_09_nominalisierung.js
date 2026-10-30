DE.grammar.push({
  id: "nominalisierung",
  title: "Номинализация и вербализация",
  level: "C1",
  emoji: "🧱",
  summary: "weil er krank war → wegen seiner Krankheit; nachdem → nach + Dat.",
  content: `<p><b>Номинализация</b> — превращение придаточного предложения в группу с существительным. Так пишут в науке, СМИ, деловых письмах: текст становится короче и «плотнее». <b>Вербализация</b> — обратный процесс: из существительного снова делаем глагол, чтобы текст читался легче.</p>
<div class="ex"><b>Weil er krank war, blieb er zu Hause.</b> → <b>Wegen seiner Krankheit blieb er zu Hause.</b> — Из-за болезни он остался дома.</div>
<h3>Союз → предлог</h3>
<table>
<tr><th>Союз (глагол)</th><th>Предлог (существительное)</th><th>Пример</th></tr>
<tr><td>weil, da</td><td>wegen + Gen. / aufgrund + Gen.</td><td>wegen des Regens</td></tr>
<tr><td>obwohl</td><td>trotz + Gen.</td><td>trotz seiner Krankheit</td></tr>
<tr><td>wenn, falls</td><td>bei + Dat.</td><td>bei Regen, bei Problemen</td></tr>
<tr><td>als / wenn (время)</td><td>bei + Dat.</td><td>bei seiner Ankunft</td></tr>
<tr><td>während</td><td>während + Gen.</td><td>während des Essens</td></tr>
<tr><td>nachdem</td><td>nach + Dat.</td><td>nach dem Studium</td></tr>
<tr><td>bevor</td><td>vor + Dat.</td><td>vor der Abreise</td></tr>
<tr><td>seit(dem)</td><td>seit + Dat.</td><td>seit seinem Umzug</td></tr>
<tr><td>bis</td><td>bis zu + Dat.</td><td>bis zur Abfahrt</td></tr>
<tr><td>indem</td><td>durch + Akk.</td><td>durch regelmäßiges Üben</td></tr>
<tr><td>um … zu, damit</td><td>zu + Dat. / für + Akk.</td><td>zum Lernen, für die Prüfung</td></tr>
</table>
<h3>Как образуется существительное</h3>
<ul>
<li>Инфинитив: <i>lesen → <b>das Lesen</b>, üben → das Üben</i> (всегда средний род)</li>
<li>Суффикс <b>-ung</b>: <i>entscheiden → die Entscheidung, erklären → die Erklärung</i></li>
<li>Основа глагола: <i>besuchen → der Besuch, umziehen → der Umzug, ankommen → die Ankunft</i></li>
<li>Прилагательное + <b>-heit/-keit</b>: <i>krank → die Krankheit, möglich → die Möglichkeit</i></li>
</ul>
<h3>Что происходит с остальными частями</h3>
<table>
<tr><th>В предложении</th><th>В номинализации</th></tr>
<tr><td>подлежащее: <i>der Zug kommt an</i></td><td>Genitiv / местоимение: <i>die Ankunft <b>des Zuges</b> / <b>seine</b> Ankunft</i></td></tr>
<tr><td>дополнение: <i>er repariert das Auto</i></td><td>Genitiv: <i>die Reparatur <b>des Autos</b></i></td></tr>
<tr><td>наречие: <i>er übt regelmäßig</i></td><td>прилагательное: <i><b>regelmäßiges</b> Üben</i></td></tr>
</table>
<div class="ex"><b>Nachdem er angekommen war, rief er an.</b> → <b>Nach seiner Ankunft rief er an.</b> — После приезда он позвонил.</div>
<div class="ex"><b>Indem man regelmäßig übt, lernt man schnell.</b> → <b>Durch regelmäßiges Üben lernt man schnell.</b></div>
<div class="ex"><b>Trotz des schlechten Wetters fand das Konzert statt.</b> → <b>Obwohl das Wetter schlecht war, fand das Konzert statt.</b></div>
<div class="warn">Предлоги <b>wegen, trotz, während</b> требуют Genitiv: <i>wegen <b>des</b> Verkehrs</i>. В разговорной речи слышен Dativ (<i>wegen dem Verkehr</i>), но в письменном языке нужен Genitiv.</div>
<div class="tip">При номинализации главная работа — найти правильный предлог (таблица выше) и превратить подлежащее в притяжательное местоимение: <b>er → sein, sie → ihr, wir → unser</b>. <i>Weil <b>wir</b> umgezogen sind → wegen <b>unseres</b> Umzugs.</i></div>`,
  exercises: [
    { type: "choice", q: "Weil er krank war, blieb er zu Hause. → ___ seiner Krankheit blieb er zu Hause.", options: ["Wegen", "Trotz", "Nach"], a: 0,
      explain: "weil выражает причину → wegen + Genitiv (seiner Krankheit). trotz — уступка (= obwohl), nach — время (= nachdem)." },
    { type: "choice", q: "Obwohl es regnete, … → ___ des Regens …", options: ["Trotz", "Wegen", "Während"], a: 0,
      explain: "obwohl выражает уступку → trotz + Genitiv. wegen — причина, während — одновременность; смысл бы изменился." },
    { type: "input", q: "Nachdem er angekommen war, … → ___ seiner Ankunft …", a: ["nach"],
      explain: "nachdem → предлог nach + Dativ: nach seiner Ankunft. Подлежащее er превращается в притяжательное seiner." },
    { type: "choice", q: "Bevor wir abreisen, … → ?", options: ["vor unserer Abreise", "nach unserer Abreise", "bei unserer Abreise"], a: 0,
      explain: "bevor («перед тем как») → vor + Dativ: vor unserer Abreise. nach = nachdem, bei = als/wenn (в момент)." },
    { type: "input", q: "Wenn es regnet, bleiben wir zu Hause. → ___ Regen bleiben wir zu Hause.", a: ["bei"],
      explain: "Условие с wenn/falls → bei + Dativ: bei Regen («в случае дождя»)." },
    { type: "order", words: ["Wegen", "des", "starken", "Verkehrs", "kamen", "wir", "zu", "spät"], ru: "Из-за сильного движения мы опоздали.",
      alts: [["wir", "kamen", "Wegen", "des", "starken", "Verkehrs", "zu", "spät"]],
      explain: "wegen + Genitiv (des starken Verkehrs). Глагол kamen на 2-м месте: после предложной группы или после подлежащего wir." },
    { type: "choice", q: "Существительное от entscheiden:", options: ["die Entscheidung", "die Entscheidheit", "die Entschiedung"], a: 0,
      explain: "От многих глаголов существительное образуется суффиксом -ung к основе: entscheid-en → die Entscheidung. -heit присоединяется к прилагательным." },
    { type: "input", q: "Er repariert das Auto. → die Reparatur ___ Autos", a: ["des"],
      explain: "Прямое дополнение (das Auto) при номинализации становится Genitiv: die Reparatur des Autos." },
    { type: "choice", q: "Вербализуйте: „Trotz seines Fleißes bestand er die Prüfung nicht.“", options: ["Obwohl er fleißig war, bestand er die Prüfung nicht.", "Weil er fleißig war, bestand er die Prüfung nicht.", "Wenn er fleißig ist, besteht er die Prüfung nicht."], a: 0,
      explain: "trotz (уступка) превращается в obwohl, существительное Fleiß — в «fleißig sein». weil — причина, wenn — условие: смысл искажается." },
    { type: "choice", q: "Indem man regelmäßig übt, … → ?", options: ["Durch regelmäßiges Üben …", "Nach regelmäßigem Üben …", "Trotz regelmäßigen Übens …"], a: 0,
      explain: "indem (способ: «тем, что…») → durch + Akkusativ; наречие regelmäßig становится прилагательным regelmäßiges." },
    { type: "order", words: ["Während", "des", "Essens", "klingelte", "das", "Telefon"], ru: "Во время еды зазвонил телефон.",
      alts: [["das", "Telefon", "klingelte", "Während", "des", "Essens"]],
      explain: "während + Genitiv: des Essens. Глагол klingelte на 2-м месте; предложение можно начать и с das Telefon." },
    { type: "input", q: "Um Deutsch zu lernen, … → ___ Lernen der deutschen Sprache …", a: ["zum", "fürs", "für das"],
      explain: "Цель (um … zu) → zu + Dativ: zum (= zu dem) Lernen. Возможен и вариант für + Akk.: fürs Lernen." },
    { type: "choice", q: "Seit er umgezogen ist, … → ?", options: ["Seit seinem Umzug …", "Seit seines Umzugs …", "Seit sein Umzug …"], a: 0,
      explain: "Предлог seit всегда требует Dativ: seit seinem Umzug. Genitiv (seines) и Nominativ (sein) здесь неверны." },
    { type: "input", q: "Прилагательное möglich → существительное: die ___", a: ["Möglichkeit", "Moeglichkeit"],
      explain: "Прилагательные на -lich, -ig, -bar образуют существительные с -keit: möglich → die Möglichkeit." }
  ]
});
