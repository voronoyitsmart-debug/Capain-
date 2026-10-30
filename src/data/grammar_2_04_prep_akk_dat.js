DE.grammar.push({
  id: "prep_akk_dat",
  title: "Предлоги с Akkusativ и Dativ",
  level: "A2",
  emoji: "🧭",
  summary: "durch, für, gegen, ohne, um + Akk; aus, bei, mit, nach, seit, von, zu + Dat",
  content: `<p>Многие немецкие предлоги всегда требуют одного и того же падежа. Их нужно просто выучить группами — это одна из самых полезных «табличек» в немецком.</p>

<h3>Всегда Akkusativ</h3>
<table>
<tr><th>Предлог</th><th>Значение</th><th>Пример</th></tr>
<tr><td><b>durch</b></td><td>через, сквозь</td><td>durch <b>den</b> Park</td></tr>
<tr><td><b>für</b></td><td>для, за</td><td>für <b>meinen</b> Vater</td></tr>
<tr><td><b>gegen</b></td><td>против; около (о времени)</td><td>gegen <b>den</b> Wind, gegen acht Uhr</td></tr>
<tr><td><b>ohne</b></td><td>без</td><td>ohne <b>dich</b></td></tr>
<tr><td><b>um</b></td><td>вокруг; в (о времени)</td><td>um <b>den</b> See, um 8 Uhr</td></tr>
</table>
<div class="tip">Запоминалка для Akk: <b>DOGFU</b> — <b>D</b>urch, <b>O</b>hne, <b>G</b>egen, <b>F</b>ür, <b>U</b>m.</div>

<h3>Всегда Dativ</h3>
<table>
<tr><th>Предлог</th><th>Значение</th><th>Пример</th></tr>
<tr><td><b>aus</b></td><td>из</td><td>aus <b>der</b> Ukraine, aus <b>dem</b> Haus</td></tr>
<tr><td><b>bei</b></td><td>у, при, в (фирме)</td><td>bei <b>meiner</b> Oma, bei Siemens</td></tr>
<tr><td><b>mit</b></td><td>с; на (транспорте)</td><td>mit <b>dem</b> Bus, mit <b>dir</b></td></tr>
<tr><td><b>nach</b></td><td>после; в (города, страны)</td><td>nach <b>dem</b> Essen, nach Berlin</td></tr>
<tr><td><b>seit</b></td><td>с (какого-то времени), уже</td><td>seit <b>einem</b> Jahr</td></tr>
<tr><td><b>von</b></td><td>от, из, о</td><td>von <b>meinem</b> Freund</td></tr>
<tr><td><b>zu</b></td><td>к</td><td>zu <b>der</b> Ärztin → zur Ärztin</td></tr>
</table>
<div class="tip">Ритмичная запоминалка: «<b>aus, bei, mit, nach, seit, von, zu</b> — с Dativ дружишь ты!» Пропевайте её как считалочку.</div>

<h3>Слияния предлога и артикля</h3>
<table>
<tr><th>Полная форма</th><th>Слияние</th><th>Пример</th></tr>
<tr><td>zu + dem</td><td><b>zum</b></td><td>zum Arzt, zum Bahnhof</td></tr>
<tr><td>zu + der</td><td><b>zur</b></td><td>zur Schule, zur Arbeit</td></tr>
<tr><td>bei + dem</td><td><b>beim</b></td><td>beim Arzt, beim Essen</td></tr>
<tr><td>von + dem</td><td><b>vom</b></td><td>vom Bahnhof</td></tr>
</table>

<div class="warn"><b>nach Hause</b> = домой (куда?), <b>zu Hause</b> = дома (где?). А <b>seit</b> используется с настоящим временем: <i>Ich wohne seit zwei Jahren hier</i> — «Я живу здесь уже два года».</div>

<div class="ex"><b>Ich fahre mit dem Fahrrad zur Arbeit.</b> — Я еду на работу на велосипеде.</div>
<div class="ex"><b>Das Geschenk ist für dich.</b> — Подарок для тебя.</div>
<div class="ex"><b>Nach dem Kurs gehe ich nach Hause.</b> — После курса я иду домой.</div>
<div class="ex"><b>Wir gehen durch den Wald.</b> — Мы идём через лес.</div>
<div class="ex"><b>Sie kommt aus der Schweiz.</b> — Она из Швейцарии.</div>

<p><b>nach</b> или <b>zu</b>? <b>nach</b> — к городам и странам без артикля (nach Wien, nach Spanien) и nach Hause; <b>zu</b> — к людям и учреждениям (zum Arzt, zu meiner Freundin, zur Bank).</p>`,
  exercises: [
    { type: "choice", q: "Das Geschenk ist für ___ Vater.", options: ["dem", "den", "der"], a: 1,
      explain: "für всегда требует Akkusativ; мужской род: der → den Vater. dem — Dativ." },
    { type: "choice", q: "Ich fahre mit ___ Bus.", options: ["den", "dem", "der"], a: 1,
      explain: "mit всегда требует Dativ: der Bus → dem Bus." },
    { type: "input", q: "Ich gehe ___ Arzt. (zu + dem)", a: ["zum"],
      explain: "zu требует Dativ: der Arzt → dem Arzt, а zu + dem сливаются в zum." },
    { type: "input", q: "Sie geht ___ Schule. (zu + der)", a: ["zur"],
      explain: "zu + Dativ: die Schule → der Schule, а zu + der сливаются в zur." },
    { type: "choice", q: "Ich wohne ___ drei Jahren in Berlin.", options: ["seit", "vor", "für"], a: 0,
      explain: "seit + Dativ — действие началось в прошлом и продолжается сейчас (поэтому Präsens wohne). vor drei Jahren = «три года назад»." },
    { type: "choice", q: "Wir fahren morgen ___ Österreich.", options: ["zu", "nach", "bei"], a: 1,
      explain: "Страны и города без артикля — с nach: nach Österreich. zu — к людям и учреждениям, bei — «у кого-то»." },
    { type: "input", q: "Wir gehen durch ___ Park. (der Park)", a: ["den"],
      explain: "durch всегда требует Akkusativ: der Park → den Park." },
    { type: "choice", q: "Er kommt ___ der Türkei.", options: ["aus", "nach", "zu"], a: 0,
      explain: "Происхождение: aus + Dativ (die Türkei → aus der Türkei)." },
    { type: "order", words: ["Ich", "gehe", "heute", "zum", "Arzt"], ru: "Сегодня я иду к врачу.",
      alts: [["heute", "gehe", "Ich", "zum", "Arzt"]],
      explain: "zum = zu + dem (der Arzt). Время стоит перед местом; можно начать с heute: Heute gehe ich zum Arzt." },
    { type: "input", q: "Er ist ___ seiner Oma. (у)", a: ["bei"],
      explain: "«У кого-то (дома)» — bei + Dativ: bei seiner Oma. zu отвечает на вопрос «к кому?»." },
    { type: "choice", q: "Ich bin gegen ___ Idee.", options: ["die", "der", "dem"], a: 0,
      explain: "gegen + Akkusativ; женский род в Akk не меняется: die Idee." },
    { type: "choice", q: "Nach dem Unterricht gehe ich ___ Hause.", options: ["nach", "zu", "bei"], a: 0,
      explain: "Куда? — домой: nach Hause. Где? — zu Hause (дома). bei Hause не говорят." },
    { type: "order", words: ["Das", "Paket", "ist", "von", "meiner", "Schwester"], ru: "Посылка от моей сестры.",
      explain: "von всегда требует Dativ; die Schwester → meiner Schwester." },
    { type: "input", q: "Wir laufen ___ den See. (вокруг)", a: ["um"],
      explain: "um + Akkusativ — «вокруг»: um den See. Тот же предлог, что и в «um 9 Uhr»." }
  ]
});
