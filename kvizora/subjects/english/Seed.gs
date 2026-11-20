/**
 * Seed.gs — ENGLISH. Everything that is special about this subject:
 * the ready-made tests, the AI prompt and which question types the editor offers.
 * Paste this as a SECOND script file (next to Code.gs), named "Seed".
 *
 * The tests are in English. A question may also carry a Ukrainian translation
 * ({ en: '…', uk: '…' }); the teacher decides per test whether students may open it
 * (editor → "Allow students to translate questions into Ukrainian").
 */

const SUBJECT = {
  key: 'english',
  name: { uk: 'Англійська мова', en: 'English' },
  mode: 'translate',                       // test stays in English; optional Ukrainian translation per question
  qtypes: ['mc', 'fix', 'short', 'open'],  // question types the editor offers
  formulas: false,                         // no LaTeX: a "$" in a sentence stays a dollar sign
  mcGap: true                              // multiple-choice questions are sentences with a ___ gap
};

/** Ready-made tests. The first one is opened right away on a fresh install; the others start as drafts. */
const SEED_TESTS = [
  { title: 'Revision Test: Units 1–4', open: true, content: { allowTranslate: false, sections: [
    { title: 'Step 1', instructions: { en: 'Choose a, b or c.', uk: 'Оберіть a, b або c.' }, questions: [
      { type: 'mc', q: { en: "I don't have ___ money left after buying those shoes.", uk: 'У мене не залишилося ___ грошей після купівлі тих черевиків.' }, options: ['some', 'much', 'many'], answer: 1 },
      { type: 'mc', q: { en: 'There are ___ promotions in the store this week.', uk: 'Цього тижня в магазині ___ акцій.' }, options: ['plenty of', 'much', 'a lot'], answer: 0 },
      { type: 'mc', q: { en: '___ of my purchases arrived damaged, so I had to send them back.', uk: '___ моїх покупок прийшли пошкодженими, тож мені довелося їх повернути.' }, options: ['Several', 'Much', 'Any'], answer: 0 },
      { type: 'mc', q: { en: 'My brother is good at ___ goals in football.', uk: 'Мій брат добре вміє ___ голи у футболі.' }, options: ['score', 'scoring', 'scored'], answer: 1 },
      { type: 'mc', q: { en: '___ online shopping is becoming more popular every year.', uk: '___ покупки онлайн щороку стають популярнішими.' }, options: ['To do', 'Do', 'Doing'], answer: 2 },
      { type: 'mc', q: { en: 'I used to ___ customers in that shop before it closed.', uk: 'Раніше я ___ покупців у тому магазині, доки його не закрили.' }, options: ['serve', 'serving', 'served'], answer: 0 },
      { type: 'mc', q: { en: 'We are interested in ___ a club for young designers.', uk: 'Ми хочемо ___ до клубу юних дизайнерів.' }, options: ['join', 'joining', 'joined'], answer: 1 },
      { type: 'mc', q: { en: "There isn't ___ lightning today, but the wind is blowing strongly.", uk: 'Сьогодні немає ___ блискавки, але дме сильний вітер.' }, options: ['many', 'any', 'several'], answer: 1 },
      { type: 'mc', q: { en: "She's crazy about ___ competitions and winning medals.", uk: 'Вона обожнює ___ у змаганнях і вигравати медалі.' }, options: ['enter', 'entered', 'entering'], answer: 2 },
      { type: 'mc', q: { en: 'I ___ for a refund last week because the service was terrible.', uk: 'Минулого тижня я ___ повернути гроші, бо обслуговування було жахливим.' }, options: ['asked', 'ask', 'asking'], answer: 0 },
      { type: 'mc', q: { en: 'My classmate ___ very reliable — I could always count on her.', uk: 'Моя однокласниця ___ дуже надійною — я завжди могла на неї покластися.' }, options: ["wasn't", 'were', 'was'], answer: 2 },
      { type: 'mc', q: { en: 'They ___ a lot of money shopping online every month.', uk: 'Вони ___ багато грошей на онлайн-покупки щомісяця.' }, options: ['spends', 'are spending', 'spend'], answer: 2 },
      { type: 'mc', q: { en: 'The building ___ during the earthquake.', uk: 'Будівля ___ під час землетрусу.' }, options: ['fall down', 'fell down', 'falling down'], answer: 1 },
      { type: 'mc', q: { en: "I can't stand ___ in long queues at the supermarket.", uk: 'Я терпіти не можу ___ у довгих чергах у супермаркеті.' }, options: ['wait', 'waiting', 'waited'], answer: 1 }
    ] },
    { title: 'Step 2', instructions: { en: 'Each sentence has a mistake. Find and correct it.', uk: 'У кожному реченні є помилка. Знайдіть і виправте її.' }, questions: [
      { type: 'fix', q: { en: "There aren't much refunds available during special promotions.", uk: 'Під час спеціальних акцій повернень коштів небагато.' }, key: 'much → many (or any)',
        accept: ["There aren't many refunds available during special promotions.", "There aren't any refunds available during special promotions."] },
      { type: 'fix', q: { en: 'Have you seen a little discounts on online shopping websites?', uk: 'Ти бачив якісь знижки на сайтах онлайн-магазинів?' }, key: 'a little → any (some / a few)',
        accept: ['Have you seen any discounts on online shopping websites?', 'Have you seen some discounts on online shopping websites?', 'Have you seen a few discounts on online shopping websites?'] },
      { type: 'fix', q: { en: 'My sister is keen on enter competitions and winning prizes for her school.', uk: 'Моя сестра захоплюється участю в змаганнях і здобуттям призів для своєї школи.' }, key: 'enter → entering',
        accept: ['My sister is keen on entering competitions and winning prizes for her school.'] },
      { type: 'fix', q: { en: 'Shop online is becoming more popular than going to physical stores.', uk: 'Покупки онлайн стають популярнішими, ніж походи до звичайних магазинів.' }, key: 'Shop online → Shopping online',
        accept: ['Shopping online is becoming more popular than going to physical stores.', 'Online shopping is becoming more popular than going to physical stores.'] },
      { type: 'fix', q: { en: 'The wind blows very strongly today.', uk: 'Сьогодні дме дуже сильний вітер.' }, key: 'blows → is blowing',
        accept: ['The wind is blowing very strongly today.'] },
      { type: 'fix', q: { en: "I'm usually shopping at weekends, but today I'm spending time comparing prices online.", uk: 'Зазвичай я ходжу по магазинах у вихідні, але сьогодні порівнюю ціни онлайн.' }, key: "I'm usually shopping → I usually shop",
        accept: ["I usually shop at weekends, but today I'm spending time comparing prices online.", "I usually go shopping at weekends, but today I'm spending time comparing prices online."] },
      { type: 'fix', q: { en: "We didn't used to get receipts by email.", uk: 'Раніше ми не отримували чеки електронною поштою.' }, key: "didn't used to → didn't use to",
        accept: ["We didn't use to get receipts by email.", 'We never used to get receipts by email.'] },
      { type: 'fix', q: { en: 'Last year, I exchanged a damaged item and get a refund without any charges.', uk: 'Минулого року я обміняв пошкоджений товар і отримав гроші без жодних комісій.' }, key: 'get → got',
        accept: ['Last year, I exchanged a damaged item and got a refund without any charges.'] }
    ] },
    { title: 'Step 3', instructions: { en: 'Answer the questions.', uk: 'Дайте відповіді на запитання (англійською).' }, questions: [
      { type: 'open', q: { en: 'When you go shopping, what do you usually spend a lot of money on?', uk: 'На що ви зазвичай витрачаєте багато грошей, коли ходите по магазинах?' } },
      { type: 'open', q: { en: 'What activities do you enjoy doing in your free time?', uk: 'Чим ви любите займатися у вільний час?' } },
      { type: 'open', q: { en: 'What kind of weather do you usually get in your town?', uk: 'Яка погода зазвичай буває у вашому місті?' } },
      { type: 'open', q: { en: 'Did you use to spend a lot of time shopping in shops, or did you prefer online shopping? Why?', uk: 'Ви раніше багато часу проводили в магазинах чи надавали перевагу покупкам онлайн? Чому?' } }
    ] }
  ] } },

  { title: 'Present Simple vs Present Continuous', open: false, minutes: 15, content: { allowTranslate: true, sections: [
    { title: 'Part 1', instructions: { en: 'Choose the correct form.', uk: 'Оберіть правильну форму.' }, questions: [
      { type: 'mc', q: { en: 'Look! It ___ outside.', uk: 'Дивись! Надворі ___ (іде сніг).' }, options: ['snows', 'is snowing', 'snow'], answer: 1 },
      { type: 'mc', q: { en: 'Water ___ at 100 degrees Celsius.', uk: 'Вода ___ при 100 градусах Цельсія.' }, options: ['boils', 'is boiling', 'boil'], answer: 0 },
      { type: 'mc', q: { en: 'My dad usually ___ to work by bus.', uk: 'Мій тато зазвичай ___ на роботу автобусом.' }, options: ['is going', 'go', 'goes'], answer: 2 },
      { type: 'mc', q: { en: 'Be quiet, please. The baby ___.', uk: 'Тихіше, будь ласка. Дитина ___.' }, options: ['sleeps', 'is sleeping', 'sleep'], answer: 1 },
      { type: 'mc', q: { en: "I ___ this song. It's my favourite!", uk: 'Я ___ цю пісню. Вона моя улюблена!' }, options: ['love', 'am loving', 'loves'], answer: 0 },
      { type: 'mc', q: { en: '___ you often play computer games?', uk: 'Ти часто граєш у комп’ютерні ігри?' }, options: ['Are', 'Do', 'Does'], answer: 1 },
      { type: 'mc', q: { en: 'This week Anna ___ at her grandma’s house.', uk: 'Цього тижня Анна ___ у бабусі.' }, options: ['stays', 'is staying', 'stay'], answer: 1 },
      { type: 'mc', q: { en: 'He ___ understand the question.', uk: 'Він ___ розуміє питання.' }, options: ["isn't", "doesn't", "don't"], answer: 1 }
    ] },
    { title: 'Part 2', instructions: { en: 'Each sentence has one mistake. Correct it.', uk: 'У кожному реченні одна помилка. Виправте її.' }, questions: [
      { type: 'fix', q: { en: 'She is knowing the answer.', uk: 'Вона знає відповідь.' }, key: 'is knowing → knows', accept: ['She knows the answer.'] },
      { type: 'fix', q: { en: 'We are go to school every day.', uk: 'Ми ходимо до школи щодня.' }, key: 'are go → go', accept: ['We go to school every day.'] },
      { type: 'fix', q: { en: 'Listen! Somebody sing in the next room.', uk: 'Послухай! Хтось співає в сусідній кімнаті.' }, key: 'sing → is singing', accept: ['Listen! Somebody is singing in the next room.'] },
      { type: 'fix', q: { en: "Tom don't like fish.", uk: 'Том не любить рибу.' }, key: "don't → doesn't", accept: ["Tom doesn't like fish.", 'Tom does not like fish.'] }
    ] },
    { title: 'Part 3', instructions: { en: 'Write 2–3 sentences in English.', uk: 'Напишіть 2–3 речення англійською.' }, questions: [
      { type: 'open', q: { en: 'What do you usually do on Saturdays? What are you doing this Saturday?', uk: 'Що ви зазвичай робите в суботу? Що ви робите цієї суботи?' } }
    ] }
  ] } }
];

// ---------- AI: photo(s) → test content ----------
// Code.gs adds the rules for the Ukrainian translation after this text.
const AI_INSTRUCTIONS =
  'You convert a photo of a printed language-test or worksheet page into structured JSON. ' +
  'Read every exercise on the page. Return ONLY JSON (no markdown, no commentary) shaped as: ' +
  '{"title": string, "sections": [{"title": string, "instructions": TEXT, "questions": [Q, ...]}]}. ' +
  'Each Q is one of: ' +
  '{"type":"mc","q":TEXT (sentence with ___ for the gap),"options":["a","b","c"],"answer":<index of the correct option, 0-based>}; ' +
  '{"type":"fix","q":TEXT (the sentence that contains one mistake),"key":"short note of the fix, e.g. was → were","accept":["the full corrected sentence","another acceptable full sentence"]}; ' +
  '{"type":"short","q":TEXT (question with a short expected answer),"accept":["answer1","answer2"]}; ' +
  '{"type":"open","q":TEXT (an open writing/speaking question with no single correct answer)}. ' +
  'Rules: use "___" to mark a gap in mc questions. For mc, "answer" MUST be the 0-based index of the correct option; ' +
  'if you are unsure of the correct option, still pick your best guess. For fix, put FULL corrected sentences in "accept". ' +
  'For a "fix" question the Ukrainian translation should give the meaning of the CORRECT sentence, without pointing at the mistake. ' +
  'Keep the original wording from the page. Keep section titles like "Step 1" if present. Do not invent exercises that are not on the page.';
