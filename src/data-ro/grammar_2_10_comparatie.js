DE.grammar.push({
  id: "comparatie",
  title: "Степени сравнения (mai mare, cel mai mare)",
  level: "A2",
  emoji: "📏",
  summary: "mai mare decât, la fel de mare ca, cel mai mare, foarte mare",
  content: `<p>Хорошая новость: в румынском <b>нет неправильных форм</b> сравнения. Никаких «хороший → лучше»: всё строится словом <b>mai</b> («более»).</p>

<table>
<tr><th>Степень</th><th>Формула</th><th>Пример</th></tr>
<tr><td>больше</td><td><b>mai</b> + прил. + <b>decât</b></td><td>Ion e mai înalt decât Mihai.</td></tr>
<tr><td>меньше</td><td><b>mai puțin</b> + прил. + <b>decât</b></td><td>Ceaiul e mai puțin dulce decât sucul.</td></tr>
<tr><td>так же</td><td><b>la fel de</b> + прил. + <b>ca</b> (și)</td><td>Ana e la fel de înaltă ca (și) Maria.</td></tr>
<tr><td>самый</td><td><b>cel / cea / cei / cele mai</b> + прил.</td><td>cel mai bun prieten</td></tr>
<tr><td>очень</td><td><b>foarte</b> + прил.</td><td>foarte frumos</td></tr>
</table>
<p><b>bun → mai bun → cel mai bun</b> (хороший → лучше → самый лучший). <b>mult → mai mult → cel mai mult</b> (много → больше → больше всего).</p>

<h3>«Самый» согласуется с существительным</h3>
<table>
<tr><th></th><th>Ед. ч.</th><th>Мн. ч.</th></tr>
<tr><td>м. р.</td><td><b>cel mai</b> mare oraș</td><td><b>cei mai</b> buni prieteni</td></tr>
<tr><td>ж. р.</td><td><b>cea mai</b> frumoasă zi</td><td><b>cele mai</b> bune zile</td></tr>
</table>
<p>Средний род (neutru) — как мужской в ед. ч. и как женский во мн. ч.: <b>cel mai mare oraș — cele mai mari orașe</b>. Можно и после существительного, тогда у него артикль: <b>orașul cel mai mare</b>. «Из» — <b>din</b> или <b>dintre</b>: <b>cel mai înalt din clasă</b>.</p>

<p>С наречиями «самый» не меняется: <b>Ea cântă cel mai bine.</b> — Она поёт лучше всех.</p>

<div class="ex"><b>Trenul e mai rapid decât autobuzul.</b> — Поезд быстрее автобуса.</div>
<div class="ex"><b>Fratele meu e mai mare decât mine.</b> — Мой брат старше меня.</div>
<div class="ex"><b>Bucureștiul este cel mai mare oraș din România.</b> — Бухарест — самый большой город Румынии.</div>
<div class="ex"><b>Azi e la fel de frig ca ieri.</b> — Сегодня так же холодно, как вчера.</div>

<div class="warn">После <b>decât</b> и <b>ca</b> местоимения — в ударной форме винительного: <b>decât mine, decât tine, ca el</b>. И не путайте пары: <b>mai … decât</b>, но <b>la fel de … ca</b>.</div>

<div class="tip">Русское «старше / младше» = <b>mai mare / mai mic</b>: <b>sora mea mai mică</b> — моя младшая сестра. А <b>mai</b> без прилагательного значит «ещё»: <b>Mai vreau cafea.</b> — Хочу ещё кофе.</div>`,
  exercises: [
    { type: "choice", q: "Ion e mai înalt ___ Mihai.", options: ["decât", "de", "că"], a: 0,
      explain: "Сравнение «выше, чем» строится как mai … decât." },
    { type: "choice", q: "Maria este ___ fată din clasă.", options: ["cea mai frumoasă", "cel mai frumos", "cea mai frumos"], a: 0,
      explain: "Fată — женский род: cea mai, и прилагательное тоже в ж. р.: frumoasă." },
    { type: "input", q: "Acesta e ___ mai bun prieten al meu.", a: ["cel"],
      explain: "Prieten — м. р., ед. ч.: cel mai bun (самый лучший)." },
    { type: "input", q: "Ana e ___ fel de deșteaptă ca sora ei.", a: ["la"],
      explain: "Равенство: la fel de + прилагательное + ca — «такая же умная, как»." },
    { type: "choice", q: "Ei sunt ___ buni studenți.", options: ["cei mai", "cel mai", "cele mai"], a: 0,
      explain: "Studenți — м. р., мн. ч.: cei mai buni." },
    { type: "choice", q: "Florile acestea sunt ___ frumoase.", options: ["cele mai", "cei mai", "cea mai"], a: 0,
      explain: "Flori — ж. р., мн. ч.: cele mai frumoase." },
    { type: "input", q: "Trenul e mai rapid ___ autobuzul.", a: ["decât", "ca"],
      explain: "Сравнение «быстрее, чем»: mai rapid decât (разговорно допустимо и ca)." },
    { type: "choice", q: "Fratele meu e mai mare decât ___.", options: ["mine", "îmi", "mă"], a: 0,
      explain: "После decât — ударная форма местоимения: decât mine (чем я / меня)." },
    { type: "choice", q: "Ea cântă ___. (лучше всех)", options: ["cel mai bine", "cea mai bună", "cel mai bun"], a: 0,
      explain: "С глаголом нужно наречие, а «самый» перед наречием не меняется: cel mai bine." },
    { type: "order", words: ["Bucureștiul", "este", "cel", "mai", "mare", "oraș", "din", "România"], ru: "Бухарест — самый большой город Румынии.",
      alts: [["cel", "mai", "mare", "oraș", "din", "România", "este", "Bucureștiul"]],
      explain: "cel mai + прилагательное + существительное; «в стране» — din România. Можно начать с «самого большого города»." },
    { type: "order", words: ["Vara", "e", "mai", "caldă", "decât", "primăvara"], ru: "Лето теплее весны.",
      explain: "Формула: A + e + mai + прилагательное + decât + B; caldă — ж. р., т. к. vara женского рода." },
    { type: "input", q: "Cafeaua e ___ puțin dulce decât ceaiul.", a: ["mai"],
      explain: "«Менее сладкий» — mai puțin dulce." },
    { type: "choice", q: "Este o carte ___ interesantă. (очень)", options: ["foarte", "cea mai", "la fel de"], a: 0,
      explain: "«Очень» — foarte + прилагательное: foarte interesantă." },
    { type: "choice", q: "Testul de azi a fost la fel de greu ___ cel de ieri.", options: ["ca", "decât", "de"], a: 0,
      explain: "После la fel de … всегда ca, а не decât: la fel de greu ca." }
  ]
});
