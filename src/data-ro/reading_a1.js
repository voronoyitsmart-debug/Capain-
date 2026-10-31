// Тексты для чтения — уровень A1
DE.reading.push(
  {
    id: "a1_familia_lui_andrei", title: "Familia mea", ru: "Моя семья", lvl: "A1", emoji: "👨‍👩‍👧",
    text: "Mă numesc Andrei și am douăzeci și cinci de ani. Locuiesc în Cluj-Napoca, un oraș mare din Transilvania. Sunt programator și lucrez la o firmă mică.\n\nFamilia mea nu este mare. Tata se numește Mihai și este profesor de istorie. Mama se numește Elena și este medic. Am o soră, Ioana. Ea are șaptesprezece ani și este elevă la liceu. Ioana iubește muzica și cântă la chitară în fiecare seară.\n\nPărinții mei locuiesc la Turda, aproape de Cluj. Duminica merg la ei. Mama gătește ciorbă și plăcintă cu mere, iar tata vorbește mereu despre istorie. După masă, ne plimbăm prin parc. Îmi place mult duminica!",
    glossary: [
      { ro: "a se numi", ru: "зваться, называться" },
      { ro: "firmă", ru: "фирма, компания" },
      { ro: "elevă", ru: "ученица" },
      { ro: "liceu", ru: "лицей (старшая школа)" },
      { ro: "a cânta la chitară", ru: "играть на гитаре" },
      { ro: "a găti", ru: "готовить (еду)" },
      { ro: "mereu", ru: "всегда, постоянно" },
      { ro: "a se plimba", ru: "гулять" }
    ],
    questions: [
      { q: "Где живёт Андрей?", options: ["В Бухаресте", "В Клуж-Напоке", "В Турде", "В Яссах"], a: 1,
        explain: "В тексте: „Locuiesc în Cluj-Napoca“. В Турде живут его родители." },
      { q: "Кем работает мама Андрея?", options: ["Учительницей истории", "Программистом", "Врачом", "Продавцом"], a: 2,
        explain: "„Mama se numește Elena și este medic“ — она врач. Учитель истории — папа." },
      { q: "Что Иоана делает каждый вечер?", options: ["Играет на гитаре", "Готовит пирог", "Читает об истории", "Гуляет в парке"], a: 0,
        explain: "„Ioana iubește muzica și cântă la chitară în fiecare seară.“" },
      { q: "Когда Андрей ездит к родителям?", options: ["По субботам", "Каждый вечер", "По воскресеньям", "Только летом"], a: 2,
        explain: "„Duminica merg la ei“ — duminica (с артиклем) значит «по воскресеньям»." },
      { q: "Сколько лет сестре Андрея?", options: ["15", "17", "25", "27"], a: 1,
        explain: "„Ea are șaptesprezece ani“ — семнадцать. 25 лет — самому Андрею." }
    ]
  },
  {
    id: "a1_la_piata", title: "La piață", ru: "На рынке", lvl: "A1", emoji: "🍅",
    text: "Este sâmbătă dimineața. Doamna Maria merge la piață cu nepotul ei, Luca. Luca are opt ani și duce o sacoșă mare.\n\nLa piață sunt multe tarabe cu legume și fructe. Roșiile sunt roșii și frumoase. Doamna Maria cumpără un kilogram de roșii, castraveți și un ardei. Luca vrea cireșe.\n\n— Cât costă cireșele? întreabă doamna Maria.\n— Cincisprezece lei kilogramul, răspunde vânzătorul.\n— Sunt cam scumpe, dar bine. O jumătate de kilogram, vă rog.\n\nApoi ei cumpără brânză și ouă de la o bătrână de la țară. Brânza este proaspătă și foarte bună. Acasă, bunica face o salată, iar Luca mănâncă toate cireșele.",
    glossary: [
      { ro: "nepot", ru: "внук; племянник" },
      { ro: "sacoșă", ru: "сумка (хозяйственная)" },
      { ro: "tarabă", ru: "прилавок (на рынке)" },
      { ro: "castravete", ru: "огурец" },
      { ro: "ardei", ru: "перец (овощ)" },
      { ro: "cireașă", ru: "черешня" },
      { ro: "vânzător", ru: "продавец" },
      { ro: "proaspăt", ru: "свежий" }
    ],
    questions: [
      { q: "С кем госпожа Мария идёт на рынок?", options: ["С дочерью", "С внуком", "С соседкой", "С мужем"], a: 1,
        explain: "„Doamna Maria merge la piață cu nepotul ei, Luca“ — с внуком Лукой." },
      { q: "Сколько стоит килограмм черешни?", options: ["5 леев", "10 леев", "15 леев", "50 леев"], a: 2,
        explain: "Продавец отвечает: „Cincisprezece lei kilogramul“ — 15 леев." },
      { q: "Сколько черешни покупает Мария?", options: ["Полкило", "Килограмм", "Два килограмма", "Нисколько"], a: 0,
        explain: "„O jumătate de kilogram, vă rog“ — полкилограмма." },
      { q: "У кого они покупают сыр и яйца?", options: ["У продавца черешни", "В супермаркете", "У пожилой женщины из деревни", "У соседа"], a: 2,
        explain: "„cumpără brânză și ouă de la o bătrână de la țară“ — у пожилой женщины из деревни." },
      { q: "Что происходит с черешней дома?", options: ["Лука съедает её всю", "Бабушка кладёт её в салат", "Её отдают соседям", "Её оставляют на завтра"], a: 0,
        explain: "В конце: „Luca mănâncă toate cireșele“ — Лука съедает всю черешню. Салат бабушка делает из овощей." }
    ]
  },
  {
    id: "a1_martisor", title: "Mărțișorul", ru: "Мэрцишор", lvl: "A1", emoji: "🎀",
    text: "Pe 1 martie, în România și în Republica Moldova, oamenii sărbătoresc Mărțișorul. Este o sărbătoare veche și frumoasă. Ea marchează începutul primăverii.\n\nMărțișorul este un obiect mic: un șnur alb și roșu și o figurină. Figurina poate fi o floare, o inimă, un coșar sau o potcoavă. Bărbații și băieții dăruiesc mărțișoare femeilor și fetelor. Ele poartă mărțișorul în piept, aproape de inimă.\n\nMulte femei poartă mărțișorul toată luna martie. La sfârșitul lunii, ele leagă șnurul de un pom înflorit. Oamenii spun că mărțișorul aduce noroc, sănătate și bucurie.",
    glossary: [
      { ro: "a sărbători", ru: "праздновать" },
      { ro: "șnur", ru: "шнурок" },
      { ro: "coșar", ru: "трубочист" },
      { ro: "potcoavă", ru: "подкова" },
      { ro: "a dărui", ru: "дарить" },
      { ro: "a purta", ru: "носить (одежду, украшение)" },
      { ro: "a lega", ru: "привязывать, завязывать" },
      { ro: "pom înflorit", ru: "цветущее дерево" },
      { ro: "noroc", ru: "удача, счастье" }
    ],
    questions: [
      { q: "Когда празднуют Мэрцишор?", options: ["1 января", "8 марта", "1 марта", "31 марта"], a: 2,
        explain: "Первая фраза: „Pe 1 martie … oamenii sărbătoresc Mărțișorul“." },
      { q: "Каких цветов шнурок мэрцишора?", options: ["Белый и красный", "Красный и жёлтый", "Белый и синий", "Зелёный и белый"], a: 0,
        explain: "„un șnur alb și roșu“ — белый и красный." },
      { q: "Кто обычно дарит мэрцишоры?", options: ["Женщины — мужчинам", "Мужчины и мальчики — женщинам и девочкам", "Учителя — ученикам", "Только дети"], a: 1,
        explain: "„Bărbații și băieții dăruiesc mărțișoare femeilor și fetelor.“" },
      { q: "Что делают со шнурком в конце марта?", options: ["Выбрасывают", "Дарят подруге", "Кладут в шкаф", "Привязывают к цветущему дереву"], a: 3,
        explain: "„La sfârșitul lunii, ele leagă șnurul de un pom înflorit.“" }
    ]
  },
  {
    id: "a1_brasov", title: "O plimbare prin Brașov", ru: "Прогулка по Брашову", lvl: "A1", emoji: "🏔️",
    text: "Brașovul este un oraș frumos din centrul României. Orașul este înconjurat de munți. Mulți turiști vin aici vara și iarna.\n\nÎn centru este Piața Sfatului. Aici sunt cafenele, restaurante și case vechi, colorate. Lângă piață este Biserica Neagră. Este o biserică foarte mare și veche. De ce se numește „Neagră”? Pentru că zidurile ei sunt negre după un incendiu mare din anul 1689.\n\nDeasupra orașului este muntele Tâmpa. Pe munte scrie „BRAȘOV” cu litere mari și albe, ca la Hollywood. Turiștii urcă pe jos sau cu telecabina. De sus, priveliștea este minunată.\n\nIarna, mulți oameni merg la schi în Poiana Brașov. Stațiunea este foarte aproape de oraș.",
    glossary: [
      { ro: "înconjurat", ru: "окружённый" },
      { ro: "zid", ru: "стена (каменная)" },
      { ro: "incendiu", ru: "пожар" },
      { ro: "deasupra", ru: "над, наверху" },
      { ro: "literă", ru: "буква" },
      { ro: "a urca", ru: "подниматься" },
      { ro: "telecabină", ru: "канатная дорога (кабинка)" },
      { ro: "priveliște", ru: "вид, панорама" },
      { ro: "stațiune", ru: "курорт" }
    ],
    questions: [
      { q: "Где находится Брашов?", options: ["На севере страны", "На берегу моря", "В центре Румынии", "У Дуная"], a: 2,
        explain: "„Brașovul este un oraș frumos din centrul României.“" },
      { q: "Почему церковь называется «Чёрной»?", options: ["Её построили из чёрного камня", "Её стены почернели после большого пожара", "Внутри всё чёрное", "Так решил король"], a: 1,
        explain: "„zidurile ei sunt negre după un incendiu mare din anul 1689“ — после пожара 1689 года." },
      { q: "Что написано на горе Тымпа?", options: ["Название города", "Имя короля", "«Hollywood»", "Год пожара"], a: 0,
        explain: "„Pe munte scrie „BRAȘOV” cu litere mari și albe“ — название города, как надпись в Голливуде." },
      { q: "Как туристы поднимаются на гору?", options: ["Только на машине", "На поезде", "На лошадях", "Пешком или на канатной дороге"], a: 3,
        explain: "„Turiștii urcă pe jos sau cu telecabina.“" },
      { q: "Что делают зимой в Пояна-Брашов?", options: ["Купаются", "Катаются на лыжах", "Собирают грибы", "Ходят на рынок"], a: 1,
        explain: "„Iarna, mulți oameni merg la schi în Poiana Brașov.“" }
    ]
  },
  {
    id: "a1_la_mare", title: "O zi la mare", ru: "День на море", lvl: "A1", emoji: "🏖️",
    text: "Familia Popescu este în vacanță la Marea Neagră, în stațiunea Mamaia. Este iulie și afară sunt treizeci de grade.\n\nDimineața, toți merg la plajă. Tata citește o carte sub umbrelă. Mama înoată în mare. Copiii, Radu și Ana, construiesc un castel mare din nisip. Apa este caldă și limpede.\n\nLa prânz, familia mănâncă pește la un restaurant pe plajă. Radu nu mănâncă pește. El preferă cartofi prăjiți și o înghețată de ciocolată.\n\nDupă-amiaza, soarele este foarte puternic. Mama pune cremă de soare pe spatele copiilor. Seara, familia se plimbă pe faleză și privește apusul. Ana spune: „Vreau să stau aici toată vara!”",
    glossary: [
      { ro: "umbrelă", ru: "зонт" },
      { ro: "a înota", ru: "плавать" },
      { ro: "nisip", ru: "песок" },
      { ro: "limpede", ru: "прозрачный, чистый" },
      { ro: "prânz", ru: "обед" },
      { ro: "cartofi prăjiți", ru: "картофель фри" },
      { ro: "puternic", ru: "сильный" },
      { ro: "faleză", ru: "набережная" },
      { ro: "apus", ru: "закат" }
    ],
    questions: [
      { q: "Где отдыхает семья Попеску?", options: ["В горах", "На Чёрном море", "В дельте Дуная", "В Брашове"], a: 1,
        explain: "„Familia Popescu este în vacanță la Marea Neagră, în stațiunea Mamaia.“" },
      { q: "Что делает папа утром на пляже?", options: ["Плавает в море", "Строит замок", "Читает книгу под зонтом", "Ловит рыбу"], a: 2,
        explain: "„Tata citește o carte sub umbrelă.“ Плавает мама, замок строят дети." },
      { q: "Что ест Раду на обед?", options: ["Картофель фри и шоколадное мороженое", "Рыбу", "Салат", "Суп"], a: 0,
        explain: "„Radu nu mănâncă pește. El preferă cartofi prăjiți și o înghețată de ciocolată.“" },
      { q: "Чего хочет Ана?", options: ["Вернуться домой", "Остаться здесь на всё лето", "Поехать в горы", "Купить мороженое"], a: 1,
        explain: "Ана говорит: „Vreau să stau aici toată vara!“ — «Хочу остаться здесь на всё лето!»" }
    ]
  },
  {
    id: "a1_colegul_de_camera", title: "Colegul meu de cameră", ru: "Мой сосед по комнате", lvl: "A1", emoji: "🐱",
    text: "Am un coleg de cameră nou. Se numește Tigru. Este mic, dar foarte curajos.\n\nTigru doarme mult: dimineața, la prânz și după-amiaza. Noaptea, el nu doarme. Aleargă prin casă și face mult zgomot. Eu sunt obosit, dar nu sunt supărat pe el.\n\nTigru nu gătește și nu spală vasele. Nu plătește chiria. Mănâncă doar pește și carne și bea lapte. Îi place să stea la fereastră și să privească păsările din copac.\n\nCând vin acasă de la serviciu, Tigru mă așteaptă la ușă. Apoi stă pe genunchii mei și toarce fericit. Da, Tigru este pisoiul meu. Și este cel mai bun coleg de cameră!",
    glossary: [
      { ro: "coleg de cameră", ru: "сосед по комнате" },
      { ro: "curajos", ru: "храбрый" },
      { ro: "zgomot", ru: "шум" },
      { ro: "supărat", ru: "сердитый, обиженный" },
      { ro: "a spăla vasele", ru: "мыть посуду" },
      { ro: "chirie", ru: "плата за жильё, аренда" },
      { ro: "genunchi", ru: "колено" },
      { ro: "a toarce", ru: "мурлыкать" },
      { ro: "pisoi", ru: "котёнок" }
    ],
    questions: [
      { q: "Когда Тигру не спит?", options: ["Утром", "В обед", "Ночью", "После обеда"], a: 2,
        explain: "„Noaptea, el nu doarme. Aleargă prin casă…“ — ночью он бегает по дому." },
      { q: "Чего Тигру НЕ делает?", options: ["Не пьёт молоко", "Не платит за жильё", "Не смотрит в окно", "Не встречает хозяина"], a: 1,
        explain: "„Nu plătește chiria.“ Молоко он пьёт, в окно смотрит, хозяина встречает у двери." },
      { q: "На что Тигру любит смотреть в окно?", options: ["На машины", "На детей", "На дождь", "На птиц на дереве"], a: 3,
        explain: "„Îi place să stea la fereastră și să privească păsările din copac.“" },
      { q: "Кто такой Тигру?", options: ["Младший брат", "Студент", "Котёнок", "Щенок"], a: 2,
        explain: "В конце: „Da, Tigru este pisoiul meu“ — это котёнок." }
    ]
  },
  {
    id: "a1_email_chisinau", title: "Un e-mail de la Chișinău", ru: "Письмо из Кишинёва", lvl: "A1", emoji: "📧",
    text: "Bună, Sofia!\n\nCe faci? Eu sunt bine. Acum sunt la Chișinău, la mătușa mea. Chișinăul este capitala Republicii Moldova. Aici oamenii vorbesc română și rusă.\n\nOrașul este verde și liniștit. Sunt multe parcuri. Parcul meu preferat este Parcul Ștefan cel Mare, în centru. Acolo este o statuie mare a domnitorului. Seara, oamenii se plimbă și ascultă muzică.\n\nMâine merg cu mătușa la Cricova. Este un oraș mic, aproape de Chișinău. Acolo sunt pivnițe foarte mari, cu vin. Pivnițele au străzi lungi sub pământ, ca un oraș subteran!\n\nȘi tu? Ce faci în vacanță? Scrie-mi!\n\nTe pup,\nDaria",
    glossary: [
      { ro: "mătușă", ru: "тётя" },
      { ro: "capitală", ru: "столица" },
      { ro: "liniștit", ru: "спокойный, тихий" },
      { ro: "statuie", ru: "статуя" },
      { ro: "domnitor", ru: "господарь, правитель" },
      { ro: "pivniță", ru: "погреб, подвал" },
      { ro: "sub pământ", ru: "под землёй" },
      { ro: "subteran", ru: "подземный" },
      { ro: "Te pup", ru: "Целую (в конце письма)" }
    ],
    questions: [
      { q: "Где сейчас Дарья?", options: ["В Бухаресте", "У тёти в Кишинёве", "В Крикове", "У Софии"], a: 1,
        explain: "„Acum sunt la Chișinău, la mătușa mea.“" },
      { q: "На каких языках, по словам Дарьи, говорят в Кишинёве?", options: ["Только на румынском", "На русском и английском", "На румынском и русском", "На французском"], a: 2,
        explain: "„Aici oamenii vorbesc română și rusă.“" },
      { q: "Что есть в парке Штефана чел Маре?", options: ["Большой фонтан", "Статуя правителя", "Озеро", "Винный погреб"], a: 1,
        explain: "„Acolo este o statuie mare a domnitorului.“" },
      { q: "Чем знаменита Крикова?", options: ["Огромными винными погребами с подземными улицами", "Высокими горами", "Самым большим парком", "Морем"], a: 0,
        explain: "„Acolo sunt pivnițe foarte mari, cu vin. Pivnițele au străzi lungi sub pământ.“" },
      { q: "Когда Дарья поедет в Крикову?", options: ["Сегодня вечером", "Через неделю", "Завтра", "В конце лета"], a: 2,
        explain: "„Mâine merg cu mătușa la Cricova“ — mâine = завтра." }
    ]
  }
);
