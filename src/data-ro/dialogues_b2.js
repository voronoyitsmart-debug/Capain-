DE.dialogues.push(
  { id: "b2_salariu", title: "Переговоры о зарплате", emoji: "💰", lvl: "B2",
    context: "Елене предложили должность старшего аналитика в Бухаресте. Она обсуждает условия с директором.",
    lines: [
      { s: "Directoare", ro: "Elena, ne bucurăm că ați trecut de toate etapele. Vă putem oferi postul de analist senior, cu un salariu de 9.000 de lei net.", ru: "Елена, мы рады, что вы прошли все этапы. Можем предложить вам должность старшего аналитика с зарплатой 9 000 лей на руки." },
      { s: "Elena", ro: "Vă mulțumesc, mă bucur foarte mult. Sincer să fiu, mă așteptam la o cifră ceva mai mare, având în vedere experiența mea și responsabilitățile postului.", ru: "Спасибо, я очень рада. Честно говоря, я рассчитывала на несколько бо́льшую сумму, учитывая мой опыт и обязанности на этой должности." },
      { s: "Directoare", ro: "Înțeleg. La ce sumă vă gândeați?", ru: "Понимаю. На какую сумму вы рассчитывали?" },
      { s: "Elena", ro: "M-am documentat: pentru poziții similare în București, salariile pe piață se situează între 10.500 și 12.000 de lei net. Aș propune 11.500.", ru: "Я изучила вопрос: на аналогичных позициях в Бухаресте зарплаты на рынке — от 10 500 до 12 000 лей на руки. Я бы предложила 11 500." },
      { s: "Directoare", ro: "Depășește bugetul aprobat pentru acest post. Cel mult am putea ajunge la 10.000.", ru: "Это выходит за рамки бюджета, утверждённого на эту должность. Максимум мы могли бы дойти до 10 000." },
      { s: "Elena", ro: "Înțeleg constrângerile bugetare. În cazul acesta, poate discutăm despre alte beneficii. De pildă, aș avea nevoie de două zile pe săptămână de lucru de acasă.", ru: "Понимаю бюджетные ограничения. В таком случае, может, обсудим другие условия? Например, мне нужны два дня удалённой работы в неделю." },
      { s: "Directoare", ro: "Asta se poate aranja, avem deja o politică de lucru hibrid.", ru: "Это можно устроить, у нас уже есть политика гибридной работы." },
      { s: "Elena", ro: "Și o reevaluare a salariului după perioada de probă, adică după trei luni, în funcție de rezultate?", ru: "И пересмотр зарплаты после испытательного срока, то есть через три месяца, по результатам работы?" },
      { s: "Directoare", ro: "După trei luni ar fi neobișnuit. Să zicem așa: 10.000 de la început și o reevaluare după șase luni, pe baza unor obiective stabilite de comun acord.", ru: "Через три месяца — это было бы необычно. Давайте так: 10 000 с самого начала и пересмотр через шесть месяцев на основе целей, согласованных вместе." },
      { s: "Elena", ro: "Mi se pare corect. Aș vrea totuși să am în scris și bugetul de formare profesională.", ru: "Мне кажется, это справедливо. Но я хотела бы также получить в письменном виде бюджет на профессиональное обучение." },
      { s: "Directoare", ro: "Fiecare angajat are 3.000 de lei pe an pentru cursuri și certificări. Îl trecem în ofertă.", ru: "У каждого сотрудника есть 3 000 лей в год на курсы и сертификации. Мы впишем это в предложение." },
      { s: "Elena", ro: "Atunci cred că ne-am înțeles. Îmi puteți trimite oferta finală pe e-mail?", ru: "Тогда, думаю, мы договорились. Можете прислать мне окончательное предложение по почте?" },
      { s: "Directoare", ro: "Desigur. O primiți până mâine la prânz.", ru: "Разумеется. Вы получите его завтра до обеда." }
    ],
    quiz: [
      { q: "Какую зарплату предложили Елене сначала?", options: ["10 000 лей", "9 000 лей", "11 500 лей", "12 000 лей"], a: 1,
        explain: "Директор: „cu un salariu de 9.000 de lei net“." },
      { q: "Какую сумму предложила Елена?", options: ["10 500 лей", "12 000 лей", "11 500 лей", "10 000 лей"], a: 2,
        explain: "Елена: „Aș propune 11.500“." },
      { q: "О чём они договорились в итоге?", options: ["10 000 лей и пересмотр через шесть месяцев", "11 500 лей сразу", "9 000 лей и пересмотр через три месяца", "10 000 лей без пересмотра"], a: 0,
        explain: "Директор: „10.000 de la început și o reevaluare după șase luni“, Елена: „Mi se pare corect“." },
      { q: "Сколько выделяется на обучение?", options: ["Нисколько", "3 000 лей в месяц", "Один курс в три года", "3 000 лей в год"], a: 3,
        explain: "Директор: „Fiecare angajat are 3.000 de lei pe an pentru cursuri și certificări“." }
    ] },

  { id: "b2_mediu", title: "Дебаты: машины в центре города", emoji: "🌍", lvl: "B2",
    context: "Студенческие дебаты в Клуже: нужно ли запретить автомобили в историческом центре?",
    lines: [
      { s: "Moderator", ro: "Bun venit la dezbaterea noastră. Tema de azi: ar trebui interzise mașinile în centrul orașului? Radu, începeți dumneavoastră.", ru: "Добро пожаловать на наши дебаты. Сегодняшняя тема: нужно ли запретить машины в центре города? Раду, начинайте." },
      { s: "Radu", ro: "Mulțumesc. Eu cred că da. Poluarea aerului în Cluj depășește frecvent limitele admise, iar traficul este principala cauză. Orașele care și-au închis centrul pentru mașini au devenit mai sigure și mai vii.", ru: "Спасибо. Я считаю, что да. Загрязнение воздуха в Клуже часто превышает допустимые нормы, и главная причина — транспорт. Города, закрывшие центр для машин, стали безопаснее и живее." },
      { s: "Simona", ro: "Nu contest problema poluării, dar soluția mi se pare prea radicală. Ce facem cu persoanele în vârstă sau cu cele cu dizabilități? Nu toată lumea poate merge pe jos sau cu bicicleta.", ru: "Я не оспариваю проблему загрязнения, но решение кажется мне слишком радикальным. Что делать с пожилыми людьми или людьми с инвалидностью? Не все могут ходить пешком или ездить на велосипеде." },
      { s: "Radu", ro: "Tocmai de aceea e nevoie de un transport public bun, accesibil și frecvent. Interdicția nu ar veni singură.", ru: "Именно поэтому нужен хороший, доступный и частый общественный транспорт. Запрет не будет единственной мерой." },
      { s: "Simona", ro: "În teorie sună bine. În practică însă, autobuzele sunt deja aglomerate, iar investițiile durează ani de zile. Dacă interzici mașinile înainte să existe alternative, îi pedepsești pe oameni.", ru: "В теории звучит хорошо. Но на практике автобусы и так переполнены, а инвестиции занимают годы. Если запретить машины до того, как появятся альтернативы, ты наказываешь людей." },
      { s: "Moderator", ro: "Deci, Simona, pentru dumneavoastră problema este mai degrabă ordinea măsurilor?", ru: "То есть, Симона, для вас проблема скорее в порядке мер?" },
      { s: "Simona", ro: "Exact. Eu aș începe cu stimulente: abonamente ieftine, parcări la marginea orașului, piste de biciclete sigure. Abia apoi aș restricționa accesul.", ru: "Именно. Я бы начала со стимулов: дешёвые проездные, парковки на окраине, безопасные велодорожки. И только потом ограничивала бы въезд." },
      { s: "Radu", ro: "Doar că, din experiența altor orașe, oamenii nu-și schimbă obiceiurile dacă nu sunt și puțin constrânși. Stimulentele singure nu ajung.", ru: "Только опыт других городов показывает, что люди не меняют привычек, если их хоть немного не вынуждать. Одних стимулов недостаточно." },
      { s: "Simona", ro: "Se poate. Însă o măsură impusă fără sprijinul cetățenilor riscă să fie anulată după primele alegeri.", ru: "Возможно. Однако мера, навязанная без поддержки граждан, рискует быть отменённой после первых же выборов." },
      { s: "Moderator", ro: "Un argument important. Ce compromis ați accepta amândoi?", ru: "Важный аргумент. На какой компромисс вы оба согласились бы?" },
      { s: "Radu", ro: "O zonă pietonală extinsă treptat, în etape anunțate din timp.", ru: "Пешеходная зона, которую расширяют постепенно, этапами, объявленными заранее." },
      { s: "Simona", ro: "Cu asta sunt de acord, cu condiția ca transportul public să fie îmbunătățit în paralel.", ru: "С этим я согласна — при условии, что параллельно будет улучшаться общественный транспорт." }
    ],
    quiz: [
      { q: "Какую позицию занимает Раду?", options: ["Он против запрета", "Он за запрет машин в центре", "Он предлагает платный въезд", "У него нет мнения"], a: 1,
        explain: "Раду: „Eu cred că da“ — на вопрос, нужно ли запретить машины." },
      { q: "Какой аргумент приводит Симона против запрета?", options: ["Загрязнение воздуха — миф", "Пострадает торговля в центре", "Пожилые люди и люди с инвалидностью не смогут передвигаться без машины", "Велосипеды опасны"], a: 2,
        explain: "Симона: „Ce facem cu persoanele în vârstă sau cu cele cu dizabilități?“" },
      { q: "С чего Симона предлагает начать?", options: ["Со стимулов: дешёвые проездные, парковки, велодорожки", "С полного запрета", "С повышения цен на бензин", "С референдума"], a: 0,
        explain: "Симона: „Eu aș începe cu stimulente: abonamente ieftine, parcări la marginea orașului, piste de biciclete sigure“." },
      { q: "На какой компромисс они соглашаются?", options: ["Запрет только по выходным", "Отказ от всех ограничений", "Бесплатный транспорт", "Постепенное расширение пешеходной зоны"], a: 3,
        explain: "Раду: „O zonă pietonală extinsă treptat“, Симона: „Cu asta sunt de acord“." }
    ] },

  { id: "b2_sedinta_birou", title: "Совещание в офисе", emoji: "📊", lvl: "B2",
    context: "Руководитель проекта Михай проводит совещание: запуск приложения для клиента под угрозой.",
    lines: [
      { s: "Mihai", ro: "Bună dimineața tuturor. Hai să începem, avem multe pe ordinea de zi. Primul punct: lansarea aplicației. Ana, unde suntem?", ru: "Всем доброе утро. Давайте начнём, у нас много пунктов на повестке. Первый: запуск приложения. Ана, на каком мы этапе?" },
      { s: "Ana", ro: "Din păcate, avem o întârziere. Testarea a scos la iveală câteva erori grave la modulul de plăți, pe care nu le putem ignora.", ru: "К сожалению, есть задержка. Тестирование выявило несколько серьёзных ошибок в модуле платежей, которые мы не можем игнорировать." },
      { s: "Mihai", ro: "Cât de mare e întârzierea?", ru: "Насколько большая задержка?" },
      { s: "Ana", ro: "Estimăm cam două săptămâni. Dacă lansăm la data inițială, riscăm reclamații și recenzii proaste.", ru: "По нашей оценке, около двух недель. Если запустимся в изначальную дату, рискуем получить жалобы и плохие отзывы." },
      { s: "Igor", ro: "Sunt de acord cu Ana. Totuși, clientul a anunțat deja lansarea în presă, așa că trebuie să-i explicăm situația foarte bine.", ru: "Согласен с Аной. Но клиент уже объявил о запуске в прессе, так что ситуацию надо объяснить ему очень хорошо." },
      { s: "Mihai", ro: "Ce propuneți concret?", ru: "Что вы конкретно предлагаете?" },
      { s: "Igor", ro: "Am putea lansa la termen o versiune fără plăți, iar modulul de plăți să-l activăm după ce remediem erorile.", ru: "Мы могли бы запустить в срок версию без платежей, а модуль платежей включить после исправления ошибок." },
      { s: "Ana", ro: "Tehnic, e fezabil. Ar trebui doar să ascundem câteva ecrane.", ru: "Технически это осуществимо. Нужно будет только скрыть несколько экранов." },
      { s: "Mihai", ro: "Îmi place ideea. Igor, pregătești tu o propunere pentru client până joi?", ru: "Мне нравится идея. Игорь, подготовишь предложение для клиента до четверга?" },
      { s: "Igor", ro: "Da, mă ocup eu.", ru: "Да, я займусь." },
      { s: "Mihai", ro: "Ana, ai nevoie de oameni în plus pentru remedieri?", ru: "Ана, тебе нужны дополнительные люди для исправлений?" },
      { s: "Ana", ro: "Ne-ar ajuta încă un tester, măcar pentru zece zile.", ru: "Нам бы помог ещё один тестировщик, хотя бы на десять дней." },
      { s: "Mihai", ro: "Vorbesc eu cu cei de la departamentul de calitate. Al doilea punct era bugetul pe trimestrul patru, dar, fiindcă am depășit deja timpul, îl mutăm pe vineri. Mulțumesc, ne vedem atunci.", ru: "Я поговорю с отделом качества. Вторым пунктом был бюджет на четвёртый квартал, но раз мы уже вышли за время, переносим его на пятницу. Спасибо, увидимся тогда." }
    ],
    quiz: [
      { q: "Почему запуск задерживается?", options: ["Клиент изменил требования", "Тестирование нашло серьёзные ошибки в платежах", "Не хватает дизайнеров", "Сервер не готов"], a: 1,
        explain: "Ана: „Testarea a scos la iveală câteva erori grave la modulul de plăți“." },
      { q: "На сколько оценивается задержка?", options: ["На два месяца", "На десять дней", "Примерно на две недели", "На неделю"], a: 2,
        explain: "Ана: „Estimăm cam două săptămâni“." },
      { q: "Что предлагает Игорь?", options: ["Отменить запуск", "Нанять другую компанию", "Скрыть ошибки от клиента", "Запустить в срок версию без платежей"], a: 3,
        explain: "Игорь: „Am putea lansa la termen o versiune fără plăți“." },
      { q: "Какой вопрос перенесли на пятницу?", options: ["Бюджет на четвёртый квартал", "Предложение для клиента", "Найм тестировщика", "Дату запуска"], a: 0,
        explain: "Михай: „Al doilea punct era bugetul pe trimestrul patru... îl mutăm pe vineri“." }
    ] },

  { id: "b2_proprietar", title: "Конфликт с хозяйкой квартиры", emoji: "🔑", lvl: "B2",
    context: "Хозяйка квартиры хочет поднять плату посреди срока договора. Андрей отстаивает свои права.",
    lines: [
      { s: "Proprietară", ro: "Andrei, voiam să vă anunț că de luna viitoare chiria crește cu 100 de euro.", ru: "Андрей, я хотела вас предупредить, что со следующего месяца аренда вырастет на 100 евро." },
      { s: "Andrei", ro: "Poftim? Doamna Vasilescu, avem contract pe un an, semnat în martie, cu o chirie fixă de 400 de euro. Nu o puteți modifica unilateral.", ru: "Что? Госпожа Василеску, у нас договор на год, подписанный в марте, с фиксированной платой 400 евро. Вы не можете изменить её в одностороннем порядке." },
      { s: "Proprietară", ro: "Știu, dar s-a scumpit tot: impozitul, întreținerea... Nu-mi mai iese socoteala.", ru: "Знаю, но всё подорожало: налог, коммунальные расходы... У меня больше не сходятся концы с концами." },
      { s: "Andrei", ro: "Înțeleg că vă e greu, dar contractul prevede clar că prețul se poate renegocia doar la prelungire.", ru: "Понимаю, что вам тяжело, но в договоре чётко сказано, что цену можно пересмотреть только при продлении." },
      { s: "Proprietară", ro: "Dacă nu vă convine, puteți să vă mutați.", ru: "Если вас не устраивает, можете съехать." },
      { s: "Andrei", ro: "Contractul nu se reziliază pur și simplu pentru că vreți dumneavoastră. Și, apropo, mai e ceva: săptămâna trecută ați intrat în apartament cât am fost plecat, fără să mă anunțați.", ru: "Договор не расторгается просто потому, что вам так хочется. И кстати, есть ещё кое-что: на прошлой неделе вы зашли в квартиру, пока меня не было, не предупредив меня." },
      { s: "Proprietară", ro: "Am venit doar să verific centrala. Totuși, e apartamentul meu.", ru: "Я зашла только проверить котёл. Как-никак, это моя квартира." },
      { s: "Andrei", ro: "Este proprietatea dumneavoastră, dar e locuința mea. Conform contractului, vizitele se anunță cu cel puțin 24 de ore înainte. Aș vrea să respectăm asta.", ru: "Это ваша собственность, но это моё жильё. По договору о визитах предупреждают минимум за 24 часа. Я бы хотел, чтобы мы это соблюдали." },
      { s: "Proprietară", ro: "Bine, bine, aici aveți dreptate. Dar cu chiria ce facem?", ru: "Ладно, ладно, тут вы правы. Но что делаем с арендой?" },
      { s: "Andrei", ro: "Vă propun așa: păstrăm chiria actuală până la expirarea contractului, iar în martie discutăm o majorare rezonabilă, de 30–40 de euro.", ru: "Предлагаю так: сохраняем нынешнюю плату до окончания договора, а в марте обсуждаем разумное повышение — на 30–40 евро." },
      { s: "Proprietară", ro: "Și dacă găsesc alt chiriaș care dă mai mult?", ru: "А если я найду другого жильца, который заплатит больше?" },
      { s: "Andrei", ro: "E dreptul dumneavoastră să nu prelungiți contractul. Vă rog doar să-mi spuneți cu două luni înainte, ca să am timp să-mi caut altceva.", ru: "Это ваше право — не продлевать договор. Только прошу сообщить мне за два месяца, чтобы у меня было время найти что-то другое." },
      { s: "Proprietară", ro: "Hm... Bine. Rămâne cum ați zis. Vă anunț din timp.", ru: "Хм... Ладно. Пусть будет, как вы сказали. Предупрежу вас заранее." }
    ],
    quiz: [
      { q: "На сколько хозяйка хочет поднять плату?", options: ["На 30–40 евро", "На 400 евро", "На 100 евро", "На 24 евро"], a: 2,
        explain: "Хозяйка: „chiria crește cu 100 de euro“." },
      { q: "Почему Андрей против повышения?", options: ["У них договор на год с фиксированной платой", "Квартира в плохом состоянии", "У него нет денег", "Соседи платят меньше"], a: 0,
        explain: "Андрей: „avem contract pe un an... cu o chirie fixă de 400 de euro. Nu o puteți modifica unilateral.“" },
      { q: "Какая ещё претензия у Андрея?", options: ["Не работает котёл", "Хозяйка не вернула залог", "Шумные соседи", "Хозяйка вошла в квартиру без предупреждения"], a: 3,
        explain: "Андрей: „ați intrat în apartament cât am fost plecat, fără să mă anunțați“." },
      { q: "Какой компромисс предлагает Андрей?", options: ["Съехать через месяц", "Сохранить плату до конца договора, а в марте обсудить повышение", "Сразу платить на 50 евро больше", "Разделить коммунальные расходы"], a: 1,
        explain: "Андрей: „păstrăm chiria actuală până la expirarea contractului, iar în martie discutăm o majorare rezonabilă“." }
    ] }
);
