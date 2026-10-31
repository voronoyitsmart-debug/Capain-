DE.grammar.push({
  id: "posesive",
  title: "Притяжательные местоимения (meu, mea; al, a, ai, ale)",
  level: "A1",
  emoji: "🔑",
  summary: "fratele meu, casa mea, prietenii mei, cărțile mele; Cartea este a mea",
  content: `<p>Как и русские «мой — моя — мои», румынские притяжательные согласуются с <b>предметом</b> (а не с владельцем). Но стоят они <b>после</b> существительного, а существительное получает <b>определённый артикль</b>: <b>casa mea</b> — мой дом (дословно «дом-тот мой»).</p>

<table>
<tr><th>Чей?</th><th>м./ср. ед.</th><th>ж. ед.</th><th>м. мн.</th><th>ж./ср. мн.</th></tr>
<tr><td>мой</td><td>meu</td><td>mea</td><td>mei</td><td>mele</td></tr>
<tr><td>твой</td><td>tău</td><td>ta</td><td>tăi</td><td>tale</td></tr>
<tr><td>его/её (книжн.)</td><td>său</td><td>sa</td><td>săi</td><td>sale</td></tr>
<tr><td>наш</td><td>nostru</td><td>noastră</td><td>noștri</td><td>noastre</td></tr>
<tr><td>ваш</td><td>vostru</td><td>voastră</td><td>voștri</td><td>voastre</td></tr>
<tr><td>их</td><td colspan="4">lor (не меняется)</td></tr>
</table>
<p>В разговорной речи «его» и «её» — это неизменяемые <b>lui</b> и <b>ei</b>: <b>casa lui</b> — его дом, <b>casa ei</b> — её дом. Вежливое «Ваш» — <b>dumneavoastră</b>: <b>numele dumneavoastră</b> — Ваше имя.</p>

<div class="ex"><b>Fratele meu este student.</b> — Мой брат студент.</div>
<div class="ex"><b>Unde sunt cheile mele?</b> — Где мои ключи?</div>
<div class="ex"><b>Prietenii noștri locuiesc aici.</b> — Наши друзья живут здесь.</div>

<div class="warn">Без артикля нельзя: не «casă mea», а <b>casa mea</b>; не «prieteni mei», а <b>prietenii mei</b>.</div>

<h3>Притяжательный артикль al / a / ai / ale</h3>
<p>Когда притяжательное слово не стоит сразу после существительного с артиклем, перед ним появляется «связка» <b>al, a, ai, ale</b> — она тоже согласуется с предметом:</p>
<table>
<tr><th>м./ср. ед.</th><th>ж. ед.</th><th>м. мн.</th><th>ж./ср. мн.</th></tr>
<tr><td><b>al</b> meu</td><td><b>a</b> mea</td><td><b>ai</b> mei</td><td><b>ale</b> mele</td></tr>
</table>
<ul>
<li>После a fi: <b>Cartea este a mea.</b> — Книга моя. <b>Telefonul este al meu.</b></li>
<li>С неопределённым артиклем: <b>un prieten al meu</b> — один мой друг, <b>o colegă a mea</b>.</li>
<li>В вопросе «чей?»: <b>Al cui este telefonul? — Al meu.</b></li>
</ul>

<div class="tip">Проверка формы: спросите себя «<b>какой предмет?</b>», а не «кто владелец?». Мама говорит о сыне — «<b>fiul meu</b>», папа о дочери — «<b>fiica mea</b>». Точно как в русском: «мой сын», «моя дочь».</div>`,
  exercises: [
    { type: "choice", q: "fratele ___ (мой)", options: ["mea", "meu", "mei"], a: 1,
      explain: "frate — мужской род ед. ч.: fratele meu." },
    { type: "input", q: "mama ___ (моя)", a: ["mea"],
      explain: "mamă — женский род ед. ч.: mama mea." },
    { type: "input", q: "prietenii ___ (наши)", a: ["noștri"],
      explain: "prieteni — мужской род мн. ч.: prietenii noștri." },
    { type: "choice", q: "cărțile ___ (твои)", options: ["tăi", "ta", "tale"], a: 2,
      explain: "carte — женский род, мн. ч. cărți: cărțile tale." },
    { type: "choice", q: "Как сказать «мой дом»?", options: ["casă mea", "casa mea", "mea casă"], a: 1,
      explain: "Существительное с определённым артиклем + притяжательное после него: casa mea." },
    { type: "choice", q: "Cartea este ___ mea.", options: ["al", "ale", "a"], a: 2,
      explain: "После a fi нужен притяжательный артикль; carte — женский род ед. ч.: a mea." },
    { type: "input", q: "Telefonul este ___ meu.", a: ["al"],
      explain: "telefon — средний род ед. ч. (как мужской): al meu." },
    { type: "choice", q: "un prieten ___ meu", options: ["al", "a", "ai"], a: 0,
      explain: "С неопределённым артиклем нужна связка: un prieten al meu — один мой друг." },
    { type: "input", q: "Pantofii sunt ___ mei.", a: ["ai"],
      explain: "pantofi — мужской род мн. ч.: ai mei." },
    { type: "choice", q: "copiii ___ (их)", options: ["lui", "ei", "lor"], a: 2,
      explain: "«Их» — lor, не меняется. lui — его, ei — её." },
    { type: "input", q: "orașul ___ (ваш)", a: ["vostru", "dumneavoastră"],
      explain: "oraș — средний род ед. ч.: orașul vostru. Вежливо — orașul dumneavoastră." },
    { type: "choice", q: "___ cui este geanta? — A mea.", options: ["Al", "Ale", "A"], a: 2,
      explain: "geantă — женский род ед. ч.: A cui? — A mea." },
    { type: "order", words: ["Fratele", "meu", "este", "student"], ru: "Мой брат студент.",
      explain: "Существительное с артиклем + притяжательное: fratele meu. Профессия после a fi — без артикля." },
    { type: "order", words: ["Cheile", "nu", "sunt", "ale", "mele"], ru: "Ключи не мои.",
      explain: "После a fi — притяжательный артикль: cheie — женский род, мн. ч. chei → ale mele." }
  ]
});
