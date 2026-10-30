// Тексты для чтения — уровень A1
DE.reading.push(
  {
    id: "annas_tag", title: "Annas Tag", ru: "День Анны", lvl: "A1", emoji: "☀️",
    text: "Anna ist 25 Jahre alt und wohnt in Köln. Sie ist Krankenschwester. Ihr Tag beginnt sehr früh: Sie steht um halb sechs auf.\n\nZuerst trinkt sie einen Kaffee. Dann duscht sie und frühstückt. Sie isst ein Brötchen mit Käse. Um sechs Uhr fährt sie mit dem Fahrrad zur Arbeit. Das Krankenhaus ist nicht weit.\n\nAnna arbeitet von halb sieben bis drei Uhr. Die Arbeit ist anstrengend, aber sie hilft gern. Am Nachmittag geht sie oft einkaufen oder trifft eine Freundin im Café.\n\nAm Abend kocht Anna Nudeln oder Suppe. Dann liest sie ein Buch oder sieht fern. Um zehn Uhr geht sie ins Bett. Sie ist immer sehr müde!",
    glossary: [
      { de: "die Krankenschwester", ru: "медсестра" },
      { de: "aufstehen (steht auf)", ru: "вставать" },
      { de: "frühstücken", ru: "завтракать" },
      { de: "das Brötchen", ru: "булочка" },
      { de: "das Krankenhaus", ru: "больница" },
      { de: "anstrengend", ru: "утомительный, тяжёлый" },
      { de: "einkaufen gehen", ru: "ходить за покупками" },
      { de: "fernsehen (sieht fern)", ru: "смотреть телевизор" }
    ],
    questions: [
      { q: "Кем работает Анна?", options: ["Учительницей", "Медсестрой", "Продавщицей", "Врачом"], a: 1,
        explain: "В тексте: „Sie ist Krankenschwester“ — Krankenschwester = медсестра." },
      { q: "Во сколько Анна встаёт?", options: ["В 5:30", "В 6:30", "В 6:00", "В 5:00"], a: 0,
        explain: "В тексте: „Sie steht um halb sechs auf“ — halb sechs = половина шестого, то есть 5:30." },
      { q: "Как Анна добирается до работы?", options: ["На автобусе", "Пешком", "На машине", "На велосипеде"], a: 3,
        explain: "В тексте: „Um sechs Uhr fährt sie mit dem Fahrrad zur Arbeit“ — das Fahrrad = велосипед." },
      { q: "Сколько примерно длится рабочий день Анны?", options: ["Около 6 часов", "Около 10 часов", "Около 8,5 часов", "Около 4 часов"], a: 2,
        explain: "В тексте: „Anna arbeitet von halb sieben bis drei Uhr“ — с 6:30 до 15:00, то есть около 8,5 часов." },
      { q: "Что Анна часто делает после работы?", options: ["Спит до вечера", "Ходит за покупками или встречается с подругой", "Снова идёт в больницу", "Занимается спортом"], a: 1,
        explain: "В тексте: „Am Nachmittag geht sie oft einkaufen oder trifft eine Freundin im Café“ — после работы (она работает до трёх)." }
    ]
  },
  {
    id: "familie_weber", title: "Familie Weber", ru: "Семья Вебер", lvl: "A1", emoji: "👨‍👩‍👧‍👦",
    text: "Das ist Familie Weber aus Leipzig. Der Vater heißt Thomas. Er ist 42 Jahre alt und arbeitet als Koch in einem Restaurant. Die Mutter heißt Sabine. Sie ist Lehrerin und unterrichtet Mathe und Englisch.\n\nDie Webers haben zwei Kinder. Lena ist 14 und geht aufs Gymnasium. Sie spielt gern Gitarre. Ihr Bruder Max ist erst sechs. Er liebt Fußball und Dinosaurier.\n\nDie Großeltern wohnen auch in Leipzig. Mit dem Auto sind es nur zehn Minuten. Jeden Sonntag besucht die Familie Oma und Opa. Dann gibt es Kaffee und Kuchen.\n\nUnd wer kocht zu Hause? Nicht der Vater! Thomas sagt: „Im Restaurant koche ich jeden Tag. Zu Hause kocht Sabine.“ Sabine lacht: „Und am Wochenende bestellen wir Pizza.“",
    glossary: [
      { de: "der Koch", ru: "повар" },
      { de: "unterrichten", ru: "преподавать" },
      { de: "das Gymnasium", ru: "гимназия" },
      { de: "erst", ru: "всего лишь, только" },
      { de: "die Großeltern", ru: "бабушка и дедушка" },
      { de: "besuchen", ru: "навещать, посещать" },
      { de: "bestellen", ru: "заказывать" }
    ],
    questions: [
      { q: "Где работает Томас?", options: ["В школе", "В ресторане", "В больнице", "В магазине"], a: 1,
        explain: "В тексте: „Er … arbeitet als Koch in einem Restaurant“ — Томас повар в ресторане (в школе работает Сабина)." },
      { q: "Сколько лет Максу?", options: ["4 года", "14 лет", "6 лет", "42 года"], a: 2,
        explain: "В тексте: „Ihr Bruder Max ist erst sechs“ — Максу шесть лет (14 — Лене, 42 — отцу)." },
      { q: "Что семья делает по воскресеньям?", options: ["Навещает бабушку и дедушку", "Ходит в ресторан", "Играет в футбол", "Ходит в кино"], a: 0,
        explain: "В тексте: „Jeden Sonntag besucht die Familie Oma und Opa“ — каждое воскресенье они навещают бабушку и дедушку." },
      { q: "Почему Томас не готовит дома?", options: ["Он не умеет готовить", "Он не любит кухню", "У него нет времени", "Он каждый день готовит на работе"], a: 3,
        explain: "Томас говорит: „Im Restaurant koche ich jeden Tag“ — он и так каждый день готовит на работе." },
      { q: "Что, по словам Сабины, семья делает в выходные?", options: ["Готовит вместе", "Заказывает пиццу", "Ест в ресторане Томаса", "Печёт торт"], a: 1,
        explain: "Сабина говорит: „Und am Wochenende bestellen wir Pizza“ — bestellen = заказывать." }
    ]
  },
  {
    id: "einkaufen_samstag", title: "Einkaufen am Samstag", ru: "Покупки в субботу", lvl: "A1", emoji: "🛒",
    text: "Heute ist Samstag. Paul hat Geburtstag und macht am Abend eine Party. Er geht in den Supermarkt. Er hat eine Liste: Brot, Käse, Tomaten, Chips, Saft und einen Kuchen.\n\nIm Supermarkt ist es sehr voll. Paul nimmt einen Korb. Die Tomaten kosten 2,50 Euro das Kilo. Der Käse ist teuer, aber sehr gut. Paul findet keinen Kuchen. Er fragt eine Verkäuferin: „Entschuldigung, wo finde ich Kuchen?“ – „Tut mir leid, Kuchen haben wir heute nicht mehr.“\n\nPaul ist traurig. Eine Party ohne Kuchen? Er bezahlt an der Kasse 23 Euro und geht nach Hause.\n\nAm Abend klingelt es. Seine Freunde stehen vor der Tür. Sie singen „Happy Birthday“ und haben etwas in der Hand: einen großen Schokoladenkuchen!",
    glossary: [
      { de: "der Korb", ru: "корзина" },
      { de: "teuer", ru: "дорогой" },
      { de: "die Verkäuferin", ru: "продавщица" },
      { de: "Tut mir leid.", ru: "Мне жаль. Извините." },
      { de: "traurig", ru: "грустный" },
      { de: "bezahlen", ru: "платить" },
      { de: "die Kasse", ru: "касса" },
      { de: "klingeln", ru: "звонить (в дверь)" }
    ],
    questions: [
      { q: "Почему Пауль идёт в супермаркет?", options: ["У него день рождения и вечером вечеринка", "У него дома нет еды на неделю", "Его попросила мама", "Он там работает"], a: 0,
        explain: "В тексте: „Paul hat Geburtstag und macht am Abend eine Party. Er geht in den Supermarkt.“" },
      { q: "Чего Пауль не нашёл в магазине?", options: ["Сыра", "Помидоров", "Торта", "Сока"], a: 2,
        explain: "В тексте: „Paul findet keinen Kuchen“, а продавщица отвечает: „Kuchen haben wir heute nicht mehr“." },
      { q: "Сколько Пауль заплатил на кассе?", options: ["2,50 евро", "23 евро", "32 евро", "25 евро"], a: 1,
        explain: "В тексте: „Er bezahlt an der Kasse 23 Euro“ (2,50 евро — это цена килограмма помидоров)." },
      { q: "Что сказано о сыре?", options: ["Он дешёвый", "Его не было", "Он невкусный", "Он дорогой, но очень хороший"], a: 3,
        explain: "В тексте: „Der Käse ist teuer, aber sehr gut“ — teuer = дорогой." },
      { q: "Почему вечеринка всё-таки будет с тортом?", options: ["Пауль испёк торт сам", "Магазин привёз торт вечером", "Соседи пригласили Пауля к себе", "Друзья принесли шоколадный торт"], a: 3,
        explain: "В тексте: друзья „haben etwas in der Hand: einen großen Schokoladenkuchen!“ — торт принесли друзья." }
    ]
  },
  {
    id: "zimmer_in_berlin", title: "Mein Zimmer in Berlin", ru: "Моя комната в Берлине", lvl: "A1", emoji: "🏠",
    text: "Ich heiße Olga und komme aus Kasan. Seit einem Monat wohne ich in Berlin. Ich lerne hier Deutsch und arbeite in einem Café.\n\nIch wohne in einer WG. WG heißt Wohngemeinschaft: Ich teile die Wohnung mit zwei Leuten. Jonas kommt aus Hamburg und studiert Musik. Marta kommt aus Spanien und ist Ärztin.\n\nMein Zimmer ist klein, aber hell. Es hat ein Bett, einen Schreibtisch und einen Schrank. Vom Fenster sehe ich einen Park. Die Küche und das Bad teilen wir.\n\nDie Miete kostet 550 Euro im Monat. Das ist viel, aber in Berlin ist das normal. Ich mag meine WG. Es gibt nur ein Problem: Jonas spielt jeden Abend Trompete!",
    glossary: [
      { de: "seit", ru: "с (какого-то времени), уже" },
      { de: "die WG (Wohngemeinschaft)", ru: "квартира, которую снимают вместе" },
      { de: "teilen", ru: "делить" },
      { de: "hell", ru: "светлый" },
      { de: "der Schreibtisch", ru: "письменный стол" },
      { de: "der Schrank", ru: "шкаф" },
      { de: "die Miete", ru: "арендная плата" },
      { de: "die Trompete", ru: "труба (муз. инструмент)" }
    ],
    questions: [
      { q: "Сколько времени Ольга живёт в Берлине?", options: ["Год", "Неделю", "Месяц", "Два года"], a: 2,
        explain: "В тексте: „Seit einem Monat wohne ich in Berlin“ — уже месяц." },
      { q: "Что такое WG?", options: ["Общежитие университета", "Квартира, в которой живут вместе несколько человек", "Маленький отель", "Квартира родителей"], a: 1,
        explain: "В тексте: „WG heißt Wohngemeinschaft: Ich teile die Wohnung mit zwei Leuten“ — квартира на несколько жильцов." },
      { q: "Кем работает Марта?", options: ["Врачом", "Официанткой", "Музыкантом", "Учительницей"], a: 0,
        explain: "В тексте: „Marta kommt aus Spanien und ist Ärztin“ — Ärztin = врач (в кафе работает сама Ольга)." },
      { q: "Что Ольга думает об арендной плате?", options: ["Это очень дёшево", "Она не платит за комнату", "Это много, но для Берлина нормально", "Это слишком дорого, она хочет переехать"], a: 2,
        explain: "В тексте: „Das ist viel, aber in Berlin ist das normal“ — это много, но для Берлина нормально." },
      { q: "Какая проблема есть в квартире?", options: ["Комната тёмная", "Йонас каждый вечер играет на трубе", "Нет кухни", "Под окном шумная улица"], a: 1,
        explain: "В тексте: „Es gibt nur ein Problem: Jonas spielt jeden Abend Trompete!“" }
    ]
  },
  {
    id: "email_aus_muenchen", title: "Eine E-Mail aus München", ru: "Письмо из Мюнхена", lvl: "A1", emoji: "✉️",
    text: "Liebe Oma,\n\nwie geht es dir? Mir geht es sehr gut! Ich bin jetzt seit drei Tagen in München. Die Stadt ist wunderschön, und das Wetter ist sonnig und warm.\n\nIch wohne bei meiner Freundin Katrin. Sie hat eine kleine Wohnung im Zentrum. Heute besuchen wir den Marienplatz. Dort ist das Rathaus. Um elf Uhr tanzen kleine Figuren im Turm – das ist das Glockenspiel. Toll!\n\nMorgen fahren wir an einen See. Ich möchte schwimmen, aber das Wasser ist noch sehr kalt.\n\nDas Essen hier ist lecker: Brezeln, Weißwürste und Apfelstrudel. Ich esse zu viel!\n\nAm Freitag komme ich zurück. Ich bringe dir ein Geschenk mit.\n\nViele Grüße und bis bald\ndeine Mia",
    glossary: [
      { de: "Liebe Oma", ru: "Дорогая бабушка" },
      { de: "das Rathaus", ru: "ратуша" },
      { de: "der Turm", ru: "башня" },
      { de: "das Glockenspiel", ru: "куранты с движущимися фигурами" },
      { de: "der See", ru: "озеро" },
      { de: "die Brezel", ru: "крендель (брецель)" },
      { de: "das Geschenk", ru: "подарок" },
      { de: "mitbringen (bringt mit)", ru: "привозить, приносить с собой" }
    ],
    questions: [
      { q: "Где Мия живёт в Мюнхене?", options: ["В отеле", "У бабушки", "В хостеле", "У подруги Катрин"], a: 3,
        explain: "Мия пишет: „Ich wohne bei meiner Freundin Katrin“ — у подруги Катрин." },
      { q: "Что происходит в 11 часов на Мариенплац?", options: ["Открывается рынок", "В башне танцуют фигурки", "Начинается концерт", "Закрывается ратуша"], a: 1,
        explain: "В письме: „Um elf Uhr tanzen kleine Figuren im Turm“ — в башне танцуют фигурки." },
      { q: "Почему Мия, возможно, не будет купаться в озере?", options: ["Вода ещё очень холодная", "Будет дождь", "Озеро далеко", "Она не умеет плавать"], a: 0,
        explain: "В письме: „Ich möchte schwimmen, aber das Wasser ist noch sehr kalt“." },
      { q: "Чем Мия немного недовольна?", options: ["Погодой", "Квартирой Катрин", "Тем, что слишком много ест", "Ценами в городе"], a: 2,
        explain: "Мия пишет: „Ich esse zu viel!“ — она слишком много ест. Погодой она довольна: „sonnig und warm“." },
      { q: "Когда Мия вернётся домой?", options: ["Завтра", "Через три дня", "В воскресенье", "В пятницу"], a: 3,
        explain: "В письме: „Am Freitag komme ich zurück“ — в пятницу." }
    ]
  },
  {
    id: "neuer_mitbewohner", title: "Mein neuer Mitbewohner", ru: "Мой новый сосед", lvl: "A1", emoji: "🐈",
    text: "Seit Montag habe ich einen neuen Mitbewohner. Er heißt Felix. Er ist klein, hat grüne Augen und ist sehr ruhig.\n\nFelix schläft viel – ungefähr sechzehn Stunden am Tag! Er schläft gern auf dem Sofa oder auf meinem Bett. Er arbeitet nicht und bezahlt keine Miete. Er kocht nie, aber er isst sehr gern. Am liebsten isst er Fisch.\n\nAm Morgen weckt mich Felix immer um fünf Uhr. Das finde ich nicht so toll. Aber am Abend sitzen wir zusammen auf dem Sofa. Ich lese, und Felix hört Musik – na ja, eigentlich schläft er wieder.\n\nMeine Freunde fragen: „Ist Felix nett?“ Ich sage: „Ja, sehr! Und er sagt immer nur ein Wort: Miau!“",
    glossary: [
      { de: "der Mitbewohner", ru: "сосед по квартире" },
      { de: "ruhig", ru: "спокойный, тихий" },
      { de: "ungefähr", ru: "примерно" },
      { de: "die Miete", ru: "арендная плата" },
      { de: "am liebsten", ru: "больше всего (любит)" },
      { de: "wecken", ru: "будить" },
      { de: "eigentlich", ru: "на самом деле" }
    ],
    questions: [
      { q: "Кто такой Феликс?", options: ["Новый студент", "Кот", "Младший брат автора", "Собака"], a: 1,
        explain: "В конце: Феликс говорит только одно слово — „Miau!“. Значит, это кот." },
      { q: "Сколько примерно спит Феликс?", options: ["8 часов", "12 часов", "16 часов", "5 часов"], a: 2,
        explain: "В тексте: „Felix schläft viel – ungefähr sechzehn Stunden am Tag!“" },
      { q: "Что Феликс любит есть больше всего?", options: ["Мясо", "Сыр", "Молоко", "Рыбу"], a: 3,
        explain: "В тексте: „Am liebsten isst er Fisch“ — am liebsten = больше всего." },
      { q: "Что не очень нравится автору?", options: ["Феликс будит его в пять утра", "Феликс громко слушает музыку", "Феликс спит на диване", "Феликс много ест"], a: 0,
        explain: "В тексте: „Am Morgen weckt mich Felix immer um fünf Uhr. Das finde ich nicht so toll.“" },
      { q: "Что Феликс на самом деле делает вечером на диване?", options: ["Слушает музыку", "Снова спит", "Читает", "Смотрит телевизор"], a: 1,
        explain: "В тексте: „Felix hört Musik – na ja, eigentlich schläft er wieder“ — eigentlich = на самом деле." }
    ]
  },
  {
    id: "hamburg_kurz", title: "Hamburg", ru: "Гамбург", lvl: "A1", emoji: "⚓",
    text: "Hamburg liegt im Norden von Deutschland. Die Stadt hat fast zwei Millionen Einwohner. Sie ist die zweitgrößte Stadt in Deutschland – nach Berlin.\n\nHamburg hat einen großen Hafen. Hier kommen Schiffe aus der ganzen Welt an. Viele Touristen machen eine Hafenrundfahrt mit dem Boot.\n\nAm Sonntagmorgen gehen viele Leute auf den Fischmarkt. Er beginnt sehr früh, im Sommer schon um fünf Uhr! Dort gibt es Fisch, Obst, Blumen und Musik. Ein Fischbrötchen zum Frühstück ist typisch.\n\nEin modernes Gebäude ist die Elbphilharmonie. Das ist ein Konzerthaus direkt am Wasser. Von oben hat man einen tollen Blick auf die Stadt.\n\nAber Achtung: In Hamburg regnet es oft. Nehmen Sie einen Regenschirm mit!",
    glossary: [
      { de: "der Einwohner", ru: "житель" },
      { de: "zweitgrößte", ru: "второй по величине" },
      { de: "der Hafen", ru: "порт" },
      { de: "das Schiff", ru: "корабль" },
      { de: "die Hafenrundfahrt", ru: "экскурсия по порту" },
      { de: "das Gebäude", ru: "здание" },
      { de: "der Blick", ru: "вид" },
      { de: "der Regenschirm", ru: "зонт" }
    ],
    questions: [
      { q: "Какой по величине город Гамбург в Германии?", options: ["Самый большой", "Третий", "Второй", "Четвёртый"], a: 2,
        explain: "В тексте: „Sie ist die zweitgrößte Stadt in Deutschland – nach Berlin“ — второй по величине." },
      { q: "Когда работает рыбный рынок?", options: ["Каждый вечер", "В воскресенье рано утром", "В субботу днём", "Только зимой"], a: 1,
        explain: "В тексте: „Am Sonntagmorgen gehen viele Leute auf den Fischmarkt. Er beginnt sehr früh“." },
      { q: "Что такое Эльбская филармония?", options: ["Концертный зал у воды", "Музей кораблей", "Рыбный ресторан", "Старый отель"], a: 0,
        explain: "В тексте: „Das ist ein Konzerthaus direkt am Wasser“ — концертный зал у воды." },
      { q: "Что типично есть на завтрак на рыбном рынке?", options: ["Брецель", "Фрукты", "Торт", "Булочку с рыбой"], a: 3,
        explain: "В тексте: „Ein Fischbrötchen zum Frühstück ist typisch“ — Fischbrötchen = булочка с рыбой." },
      { q: "Какой совет даёт текст туристам?", options: ["Приходить на рынок поздно", "Взять с собой зонт", "Не ездить на экскурсию по порту", "Приезжать только летом"], a: 1,
        explain: "В тексте: „In Hamburg regnet es oft. Nehmen Sie einen Regenschirm mit!“" }
    ]
  }
);
