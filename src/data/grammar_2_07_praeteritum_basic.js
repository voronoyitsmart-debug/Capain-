DE.grammar.push({
  id: "praeteritum_basic",
  title: "Präteritum: sein, haben и модальные",
  level: "A2",
  emoji: "📜",
  summary: "war, hatte, konnte, musste, wollte… — короткое прошедшее время",
  content: `<p>В разговоре немцы рассказывают о прошлом в Perfekt. Но у нескольких очень частых глаголов — <b>sein</b>, <b>haben</b> и <b>модальных</b> — вместо Perfekt обычно используют короткую форму <b>Präteritum</b>. «Ich <b>war</b> im Kino» звучит естественнее, чем «Ich bin im Kino gewesen».</p>

<h3>sein и haben</h3>
<table>
<tr><th></th><th>sein</th><th>haben</th></tr>
<tr><td>ich</td><td><b>war</b></td><td><b>hatte</b></td></tr>
<tr><td>du</td><td>war<b>st</b></td><td>hatte<b>st</b></td></tr>
<tr><td>er/sie/es</td><td><b>war</b></td><td><b>hatte</b></td></tr>
<tr><td>wir</td><td>war<b>en</b></td><td>hatte<b>n</b></td></tr>
<tr><td>ihr</td><td>war<b>t</b></td><td>hatte<b>t</b></td></tr>
<tr><td>sie/Sie</td><td>war<b>en</b></td><td>hatte<b>n</b></td></tr>
</table>

<h3>Модальные глаголы</h3>
<p>Схема: основа <b>без умлаута</b> + <b>-te</b> + окончание.</p>
<table>
<tr><th>Инфинитив</th><th>ich / er</th><th>wir / sie</th><th>Значение</th></tr>
<tr><td>können</td><td><b>konnte</b></td><td>konnten</td><td>мог</td></tr>
<tr><td>müssen</td><td><b>musste</b></td><td>mussten</td><td>должен был</td></tr>
<tr><td>dürfen</td><td><b>durfte</b></td><td>durften</td><td>было можно</td></tr>
<tr><td>wollen</td><td><b>wollte</b></td><td>wollten</td><td>хотел</td></tr>
<tr><td>sollen</td><td><b>sollte</b></td><td>sollten</td><td>должен был (по чужой воле)</td></tr>
<tr><td>mögen</td><td><b>mochte</b></td><td>mochten</td><td>любил, нравилось</td></tr>
</table>
<p>Окончания такие же, как у hatte: ich konnte, du konnte<b>st</b>, er konnte, wir konnte<b>n</b>, ihr konnte<b>t</b>, sie konnte<b>n</b>.</p>

<div class="tip"><b>Умлауты не попадают в прошлое!</b> können → k<b>o</b>nnte, müssen → m<b>u</b>sste, dürfen → d<b>u</b>rfte. Если видите müsste или könnte с точками — это уже другая форма (Konjunktiv II: «надо бы», «мог бы»).</div>

<div class="tip">Формы <b>ich</b> и <b>er</b> совпадают и не имеют окончания: ich war — er war, ich konnte — er konnte. Почти как в русском: «я был» — «он был».</div>

<p>Ещё одна полезная форма: <b>es gibt → es gab</b> (было, имелось).</p>

<div class="ex"><b>Gestern war ich müde.</b> — Вчера я был уставшим.</div>
<div class="ex"><b>Wir hatten keine Zeit.</b> — У нас не было времени.</div>
<div class="ex"><b>Ich konnte nicht kommen, ich musste arbeiten.</b> — Я не мог прийти, мне нужно было работать.</div>
<div class="ex"><b>Als Kind wollte ich Astronaut werden.</b> — В детстве я хотел стать космонавтом.</div>
<div class="ex"><b>Früher gab es hier ein Kino.</b> — Раньше здесь был кинотеатр.</div>

<div class="warn">Порядок слов как с модальными в настоящем: модальный глагол на 2-м месте, инфинитив — в конце: <i>Er <b>musste</b> gestern lange <b>warten</b>.</i></div>`,
  exercises: [
    { type: "choice", q: "Gestern ___ ich krank.", options: ["bin", "war", "hatte"], a: 1,
      explain: "gestern → прошедшее время; sein в Präteritum: ich war. bin — настоящее время, hatte — от haben." },
    { type: "input", q: "Wir ___ keine Zeit. (haben, Präteritum)", a: ["hatten"],
      explain: "haben в Präteritum: hatte + окончание; wir hatten." },
    { type: "choice", q: "Du ___ gestern nicht da.", options: ["war", "warst", "wart"], a: 1,
      explain: "sein в Präteritum: du warst (окончание -st). war — для ich/er, wart — для ihr." },
    { type: "input", q: "Ich ___ nicht kommen. (können, Präteritum)", a: ["konnte"],
      explain: "können → konnte: умлаут исчезает, добавляется -te; у ich окончания больше нет." },
    { type: "choice", q: "Er ___ gestern früh aufstehen. (müssen, Präteritum)", options: ["musste", "müsste", "musst"], a: 0,
      explain: "Präteritum без умлаута: musste. müsste — это Konjunktiv II («надо бы»)." },
    { type: "input", q: "Ihr ___ im Urlaub, oder? (sein, Präteritum)", a: ["wart"],
      explain: "sein в Präteritum, ihr → wart (без -e-, в отличие от wartet «ждёте»)." },
    { type: "order", words: ["Als", "Kind", "wollte", "ich", "Pilot", "werden"], ru: "В детстве я хотел стать пилотом.",
      alts: [["ich", "wollte", "Als", "Kind", "Pilot", "werden"]],
      explain: "«Als Kind» на 1-м месте → глагол wollte на 2-м, затем подлежащее, инфинитив werden — в конце. Можно и так: Ich wollte als Kind Pilot werden." },
    { type: "choice", q: "Früher ___ man hier nicht rauchen.", options: ["durfte", "dürfte", "darf"], a: 0,
      explain: "früher (раньше) → прошедшее время: durfte, без умлаута. dürfte — Konjunktiv II, darf — настоящее время." },
    { type: "input", q: "Hattest du Hunger? — Ja, ich ___ großen Hunger. (haben)", a: ["hatte"],
      explain: "Вопрос в Präteritum (hattest) → ответ тоже: ich hatte. Окончания -e у ich нет." },
    { type: "choice", q: "Wo ___ Sie gestern, Frau Klein?", options: ["war", "waren", "wart"], a: 1,
      explain: "Вежливое Sie → waren (как wir/sie). war — для ich/er, wart — для ihr." },
    { type: "input", q: "Sie (она) ___ den Film nicht. (mögen, Präteritum)", a: ["mochte"],
      explain: "mögen → mochte: меняется и гласная (ö → o), и согласная (g → ch)." },
    { type: "order", words: ["Wir", "waren", "letztes", "Jahr", "in", "Spanien"], ru: "В прошлом году мы были в Испании.",
      alts: [["letztes", "Jahr", "waren", "Wir", "in", "Spanien"]],
      explain: "sein в Präteritum: wir waren. Время (letztes Jahr) стоит перед местом; если начать с него, глагол остаётся на 2-м месте: Letztes Jahr waren wir in Spanien." },
    { type: "choice", q: "Präteritum от «sollen» (ich):", options: ["sollte", "sollt", "söllte"], a: 0,
      explain: "sollen → sollte: основа soll- + -te. Умлаута у sollen нет ни в одной форме." },
    { type: "choice", q: "Gestern ___ es viel Schnee.", options: ["gab", "gibt", "hatte"], a: 0,
      explain: "es gibt → es gab (было, имелось). hatte не подходит: «es hatte Schnee» по-немецки не говорят." }
  ]
});
