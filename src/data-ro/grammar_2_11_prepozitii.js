DE.grammar.push({
  id: "prepozitii",
  title: "Предлоги (la, în, pe, cu, din…)",
  level: "A2",
  emoji: "📍",
  summary: "la școală, în oraș, pe masă, cu trenul, din Rusia, de la medic; la или în?",
  content: `<table>
<tr><th>Предлог</th><th>Значение</th><th>Примеры</th></tr>
<tr><td><b>la</b></td><td>в / на / к (учреждение, событие, человек)</td><td>la școală, la serviciu, la mare, la medic</td></tr>
<tr><td><b>în</b></td><td>в (внутри)</td><td>în cameră, în parc, în România, în mai</td></tr>
<tr><td><b>pe</b></td><td>на (поверхности)</td><td>pe masă, pe stradă, pe 5 mai, pe jos</td></tr>
<tr><td><b>cu</b></td><td>с; на (транспорт)</td><td>cu prietenii, cu trenul, cafea cu lapte</td></tr>
<tr><td><b>fără</b></td><td>без</td><td>fără zahăr, fără tine</td></tr>
<tr><td><b>de</b></td><td>из, для (состав, назначение)</td><td>o ceașcă de ceai, profesor de română</td></tr>
<tr><td><b>din</b></td><td>из (изнутри, откуда родом)</td><td>Sunt din Rusia. Vin din oraș.</td></tr>
<tr><td><b>de la</b></td><td>от, с, из (откуда — для la)</td><td>de la serviciu, de la mama, de la ora 9</td></tr>
<tr><td><b>pentru</b></td><td>для</td><td>pentru tine, pentru copii</td></tr>
<tr><td><b>despre</b></td><td>о, про</td><td>despre film</td></tr>
<tr><td><b>spre</b></td><td>к, по направлению к</td><td>spre centru, spre casă</td></tr>
</table>

<h3>la или în?</h3>
<p><b>la</b> — «точка на карте», учреждение, мероприятие, человек: <b>la școală, la bancă, la cinema, la concert, la bunica</b>. <b>în</b> — внутри пространства: <b>în cameră, în oraș, în parc, în Italia</b>. Со странами — всегда <b>în</b>: <b>Merg în Spania.</b> С городами: где? — <b>în</b> (Locuiesc în Cluj), куда? — <b>la</b> (Merg la Cluj).</p>

<h3>Пары «куда — откуда»</h3>
<table>
<tr><th>Куда / где</th><th>Откуда</th></tr>
<tr><td>Merg <b>la</b> școală.</td><td>Vin <b>de la</b> școală.</td></tr>
<tr><td>Sunt <b>în</b> oraș.</td><td>Vin <b>din</b> oraș.</td></tr>
<tr><td>Pun cartea <b>pe</b> masă.</td><td>Iau cartea <b>de pe</b> masă.</td></tr>
</table>
<div class="tip">Запомните пары как в русском «в — из», «на — с»: <b>în → din</b>, <b>la → de la</b>, <b>pe → de pe</b>. А русские «на работе», «на море», «в горах» — это <b>la</b>: la serviciu, la mare, la munte.</div>

<div class="warn">После предлога существительное без определения обычно без артикля: <b>pe masă</b> (не «pe masa»), <b>în parc</b>, <b>la magazin</b>. Но: <b>în parcul central</b>. Исключение — <b>cu</b>: <b>cu trenul, cu mașina</b>.</div>

<div class="ex"><b>Mergem la mare cu trenul.</b> — Мы едем на море на поезде.</div>
<div class="ex"><b>Copiii se joacă în parc.</b> — Дети играют в парке.</div>
<div class="ex"><b>Am primit o scrisoare de la bunica.</b> — Я получил письмо от бабушки.</div>
<div class="ex"><b>Merg pe jos spre centru.</b> — Я иду пешком к центру.</div>`,
  exercises: [
    { type: "choice", q: "Copiii sunt ___ școală.", options: ["la", "pe", "din"], a: 0,
      explain: "Учреждение (школа) — la: la școală (в школе, на занятиях)." },
    { type: "choice", q: "Cartea e ___ masă.", options: ["pe", "la", "cu"], a: 0,
      explain: "На поверхности — pe; после предлога без артикля: pe masă." },
    { type: "input", q: "Merg la serviciu ___ autobuzul.", a: ["cu"],
      explain: "Транспорт — с предлогом cu, причём с артиклем: cu autobuzul (на автобусе)." },
    { type: "input", q: "Sunt ___ Rusia. (я из России)", a: ["din"],
      explain: "Откуда родом — din (из): Sunt din Rusia." },
    { type: "choice", q: "Vin ___ medic. (от врача)", options: ["de la", "din", "la"], a: 0,
      explain: "К человеку — la medic, от человека — de la medic." },
    { type: "choice", q: "Locuim ___ România.", options: ["în", "la", "pe"], a: 0,
      explain: "Со странами — всегда în: în România." },
    { type: "choice", q: "Beau cafea ___ zahăr. (без)", options: ["fără", "cu", "de"], a: 0,
      explain: "«Без» — fără: cafea fără zahăr." },
    { type: "input", q: "Am cumpărat un cadou ___ tine. (для)", a: ["pentru"],
      explain: "«Для» — pentru; после него ударная форма местоимения: pentru tine." },
    { type: "choice", q: "Vorbim ___ film. (о фильме)", options: ["despre", "pentru", "spre"], a: 0,
      explain: "«О, про» — despre: despre film." },
    { type: "choice", q: "Mergem ___ munte. (в горы)", options: ["la", "din", "cu"], a: 0,
      explain: "Как «на море», «в горы» — la: la mare, la munte." },
    { type: "order", words: ["Mergem", "la", "mare", "cu", "trenul"], ru: "Мы едем на море на поезде.",
      alts: [["Mergem", "cu", "trenul", "la", "mare"], ["la", "mare", "Mergem", "cu", "trenul"], ["cu", "trenul", "Mergem", "la", "mare"]],
      explain: "Куда — la mare, на чём — cu trenul; обстоятельства в румынском можно переставлять." },
    { type: "order", words: ["Vin", "acasă", "de", "la", "serviciu"], ru: "Я иду домой с работы.",
      alts: [["Vin", "de", "la", "serviciu", "acasă"]],
      explain: "«С работы» — de la serviciu (пара к la serviciu); acasă — домой, без предлога." },
    { type: "input", q: "Mergem ___ centru. (по направлению к)", a: ["spre", "către"],
      explain: "Направление «к, в сторону» — spre (или către): spre centru." },
    { type: "choice", q: "Scot telefonul ___ geantă. (из сумки)", options: ["din", "de la", "la"], a: 0,
      explain: "Изнутри чего-то — din (пара к în): în geantă → din geantă." }
  ]
});
