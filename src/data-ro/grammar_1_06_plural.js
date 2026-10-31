DE.grammar.push({
  id: "plural",
  title: "Множественное число",
  level: "A1",
  emoji: "👥",
  summary: "м. -i, ж. -e/-i, ср. -uri/-e; чередования: brad → brazi, fată → fete",
  content: `<p>Множественное число зависит от рода и окончания слова. Окончаний всего несколько: <b>-i, -e, -uri, -le</b>. Часто при этом меняется и сама основа — как в русском «друг → друзья», «ухо → уши».</p>

<table>
<tr><th>Род</th><th>Мн. ч.</th><th>Примеры</th></tr>
<tr><td>Мужской</td><td><b>-i</b></td><td>pom → pomi, câine → câini, frate → frați, copil → copii</td></tr>
<tr><td>Женский</td><td><b>-e</b> (из -ă)</td><td>fată → fete, casă → case, masă → mese</td></tr>
<tr><td>Женский</td><td><b>-i</b></td><td>carte → cărți, mașină → mașini, floare → flori, țară → țări</td></tr>
<tr><td>Женский</td><td><b>-le</b> (из -ea), <b>-ii</b> (из -ie)</td><td>cafea → cafele, familie → familii</td></tr>
<tr><td>Женский (реже)</td><td><b>-uri</b></td><td>vreme → vremuri, marfă → mărfuri</td></tr>
<tr><td>Средний</td><td><b>-uri</b></td><td>tren → trenuri, hotel → hoteluri, lucru → lucruri</td></tr>
<tr><td>Средний</td><td><b>-e</b></td><td>oraș → orașe, scaun → scaune, telefon → telefoane</td></tr>
</table>

<h3>Чередования</h3>
<p>Перед окончанием <b>-i</b> согласные «смягчаются»:</p>
<table>
<tr><th>Было</th><th>Стало</th><th>Пример</th></tr>
<tr><td>t</td><td>ț</td><td>student → studenți, frate → frați</td></tr>
<tr><td>d</td><td>z</td><td>brad → brazi, verde → verzi</td></tr>
<tr><td>s</td><td>ș</td><td>urs → urși</td></tr>
<tr><td>st</td><td>șt</td><td>turist → turiști</td></tr>
</table>
<p>Меняются и гласные основы:</p>
<ul>
<li><b>a → e</b>: fată → fete, masă → mese, băiat → băieți</li>
<li><b>a → ă</b>: carte → cărți, țară → țări</li>
<li><b>oa → o</b>: floare → flori, școală → școli, noapte → nopți</li>
<li><b>ea → e</b>: seară → seri</li>
<li><b>o → oa</b> (средний род): telefon → telefoane, creion → creioane</li>
</ul>

<h3>Неправильные формы</h3>
<div class="ex"><b>un om — doi oameni</b> — один человек — два человека</div>
<div class="ex"><b>o soră — două surori</b> — сестра — сёстры</div>
<div class="ex"><b>o zi — două zile</b> — день — два дня</div>

<div class="warn">Средний род во мн. ч. ведёт себя как женский: <b>două</b> trenuri, <b>două</b> orașe (не «doi»).</div>

<div class="tip">Учите существительное «парой»: <b>o carte — două cărți</b>, <b>un tren — două trenuri</b>. Так вы сразу запомните и род, и множественное число. Совет по произношению: конечное -i почти не слышно — pomi звучит как [помь], поэтому смотрите на написание.</div>`,
  exercises: [
    { type: "choice", q: "un student — doi ___", options: ["studenti", "studenți", "studente"], a: 1,
      explain: "Мужской род → -i, и t перед i превращается в ț: studenți." },
    { type: "input", q: "o fată — două ___", a: ["fete"],
      explain: "-ă → -e, и a в основе меняется на e: fată → fete." },
    { type: "input", q: "un brad — doi ___", a: ["brazi"],
      explain: "Мужской род → -i, а d перед i превращается в z: brad → brazi." },
    { type: "choice", q: "o carte — două ___", options: ["carți", "cărți", "carte"], a: 1,
      explain: "carte → cărți: окончание -i, t → ț и a → ă." },
    { type: "choice", q: "un tren — două ___", options: ["treni", "trene", "trenuri"], a: 2,
      explain: "tren — средний род, мн. ч. на -uri: trenuri." },
    { type: "input", q: "o țară — două ___", a: ["țări"],
      explain: "țară → țări: окончание -i и a → ă." },
    { type: "input", q: "un copil — doi ___", a: ["copii"],
      explain: "copil → copii: l перед i выпадает. С артиклем — copiii." },
    { type: "choice", q: "o floare — două ___", options: ["flori", "floare", "floari"], a: 0,
      explain: "floare → flori: окончание -i и oa → o." },
    { type: "choice", q: "un om — doi ___", options: ["omi", "oameni", "omuri"], a: 1,
      explain: "om — неправильное слово: un om — doi oameni." },
    { type: "input", q: "un oraș — două ___", a: ["orașe"],
      explain: "oraș — средний род, мн. ч. на -e: orașe." },
    { type: "choice", q: "un băiat — doi ___", options: ["băiați", "băiate", "băieți"], a: 2,
      explain: "băiat → băieți: окончание -i, t → ț и a → e." },
    { type: "input", q: "o masă — două ___", a: ["mese"],
      explain: "masă → mese: -ă → -e и a → e (как fată → fete)." },
    { type: "order", words: ["Am", "doi", "frați", "și", "trei", "surori"], ru: "У меня два брата и три сестры.",
      alts: [["Am", "trei", "surori", "și", "doi", "frați"]],
      explain: "frate → frați (t → ț), soră → surori (неправильная форма). doi — потому что frați мужского рода." },
    { type: "order", words: ["În", "oraș", "sunt", "multe", "hoteluri"], ru: "В городе много гостиниц.",
      alts: [["sunt", "multe", "hoteluri", "În", "oraș"]],
      explain: "hotel — средний род, мн. ч. hoteluri; прилагательное multe — в форме женского рода мн. ч." }
  ]
});
