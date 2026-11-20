'use strict';
// Browser test of every teacher and student function, the way people use them (Chromium via Playwright).
// Covers what test/e2e.test.js does not: the editor with every question type, classes, AI key, test from a photo,
// auto-translation, schedule (time / start / stop), results (manual mark, deleting attempts), deleting tests,
// ready-made tests, password change, resume after reload, time limit, English translation, the tutorials page.
// Gemini is replaced by a stub. Run: npm run test:functions
const os = require('os');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { createServer } = require('../server');
const { Admin } = require('../lib/admin');

const results = [];
async function check(name, fn) {
  try { const r = await fn(); results.push([!r ? 'FAIL' : 'ok', name]); console.log((!r ? '  ✗ ' : '  ✓ ') + name); }
  catch (e) { results.push(['FAIL', name]); console.log('  ✗ ' + name + ' — ' + String(e.message).split('\n')[0]); }
}
function assert(c, m) { if (!c) throw new Error(m || 'assertion failed'); }

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
let lastPhotos = 0;
const fakeAi = async (key, body) => {
  const b = JSON.parse(body), prompt = b.contents[0].parts[0].text;
  lastPhotos = b.contents[0].parts.filter(x => x.inline_data).length;
  if (/Translate each item/.test(prompt)) {
    const items = JSON.parse(prompt.slice(prompt.indexOf('\n[') + 1));
    return { text: JSON.stringify(items.map(x => '[' + x.to + '] ' + x.text)), model: 'fake' };
  }
  return { text: JSON.stringify({ title: { uk: 'Тест із фото', en: 'Test from photo' }, sections: [{ title: { uk: 'Розділ', en: 'Section' }, questions: [
    { type: 'mc', q: { uk: '2+2 = ?', en: '2+2 = ?' }, options: ['3', '4', '5'], answer: 1 }, { type: 'num', q: { uk: '5·5 = ?', en: '5·5 = ?' }, accept: ['25'] }] }] }), model: 'fake' };
};

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tests-fn-'));
  const srv = createServer({ dbFile: path.join(dir, 'fn.db'), port: 0, geminiKey: '', geminiCall: fakeAi, publicUrl: 'https://demo-class-tests.trycloudflare.com' });
  const http = srv.app.listen(0, '127.0.0.1');
  await new Promise(r => http.once('listening', r));
  const base = 'http://127.0.0.1:' + http.address().port;
  await srv.ready;   // the browser gets the minified pages, as in real use
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const errors = [];
  async function newPage(opts) {
    const ctx = await browser.newContext(Object.assign({ viewport: { width: 1100, height: 860 } }, opts || {}));
    const p = await ctx.newPage();
    p.on('pageerror', e => errors.push('page error: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/favicon|status of 4[0-9][0-9]/.test(m.text())) errors.push('console: ' + m.text()); });
    p.on('dialog', d => d.accept());
    return p;
  }
  /** Call a teacher function from the teacher page, the way the page itself does. */
  const rpc = (p, fn, ...a) => p.evaluate(([fn, a]) => new Promise((res, rej) => google.script.run.withSuccessHandler(res).withFailureHandler(e => rej(String(e.message)))[fn].apply(null, ['session'].concat(a))), [fn, a]);
  const sql = (q, ...a) => srv.db.prepare(q).run(...a);

  // ---------- teacher: account ----------
  const T = await newPage();
  await T.goto(base + '/setup');
  await T.fill('#school', 'Ліцей № 7'); await T.fill('#name', 'Марія Тест'); await T.fill('#email', 'maria@school.ua');
  await T.fill('#password', 'pass word 123'); await T.fill('#password2', 'pass word 123'); await T.check('#t1'); await T.check('#t2');
  await T.click('#go'); await T.waitForURL(/\/admin$/);
  await T.goto(base + '/app'); await T.waitForSelector('.subj');
  // students are made by the administrator (here straight through the admin module)
  const adm = new Admin(srv.db, srv.api), ME = { id: 0, email: 'functions-test', role: 'owner' }; adm.me = ME;
  const SCH = srv.db.prepare('SELECT id FROM schools').get().id;
  ['9-А', '9-Б'].forEach(c => adm.addClass(ME, SCH, c));
  /** A new student account, signed in on its own page (its own browser). */
  async function student(name, cls, opts) {
    cls = cls || '9-Б'; if (!adm.findClass(SCH, cls)) adm.addClass(ME, SCH, cls);
    const k = adm.addStudents(ME, SCH, cls, [name]).created[0];
    const p = await newPage(opts);
    await p.goto(base + '/login'); await p.fill('#login', k.login); await p.fill('#password', k.password); await p.click('#go');
    await p.waitForURL(/\/my$/);
    return p;
  }

  await check('dashboard: УКР / EN switch translates the page', async () => {
    await T.click('#lang-en'); const en = await T.textContent('#pick');
    await T.click('#lang-uk'); const uk = await T.textContent('#pick');
    return en === 'Choose a subject' && uk === 'Оберіть предмет';
  });
  await check('dashboard: change password (wrong old one refused, then changed)', async () => {
    await T.goto(base + '/app/settings'); await T.click('#pwTitle');
    await T.fill('#pwOld', 'wrong password'); await T.fill('#pwNew', 'new pass 4567'); await T.click('#pwSave');
    await T.waitForFunction(() => document.getElementById('pwMsg').textContent.length > 0);
    const bad = await T.textContent('#pwMsg');
    await T.fill('#pwOld', 'pass word 123'); await T.click('#pwSave');
    await T.waitForFunction(() => /змінено|changed/i.test(document.getElementById('pwMsg').textContent));
    await T.goto(base + '/app'); await T.waitForSelector('.subj');
    return /wrong|невір/i.test(bad);
  });
  await check('tutorials: page opens from the dashboard, one lesson per function', async () => {
    await T.click('#nav a.ic');
    await T.waitForURL(/\/help/);
    const n = await T.locator('.lesson').count();
    const titles = await T.locator('.lesson h2').allTextContents();
    await T.goto(base + '/app'); await T.waitForSelector('.subj');
    return n >= 15 && titles.every(t => t.trim().length > 3);
  });

  // ---------- teacher: physics library ----------
  await T.click('a.subj[href="/app/physics"]'); await T.waitForSelector('.test-row');
  await check('teacher page: tutorials link in the header', async () => (await T.locator('#nav a.ic[href^="/help"]').count()) === 1);
  await check('classes: the school’s classes are there; add two own, remove one, list kept on the server', async () => {
    await T.click('#classesBtn');
    await T.fill('#newClass', '10-В'); await T.click('#addClassBtn');
    await T.fill('#newClass', '10-Г'); await T.click('#addClassBtn');
    await T.waitForTimeout(400);
    await T.locator('#classesList .row', { hasText: '10-В' }).locator('button').click();
    await T.waitForTimeout(400);
    await T.click('#classesClose');
    const lib = await rpc(T, 'listTests');
    return lib.classes.join() === '9-А,9-Б,10-Г';
  });
  await check('AI key: saved for the account', async () => {
    await T.click('#aiKeyBtn'); await T.fill('#aiKeyInput', 'AIza-fake-key'); await T.click('#aiKeySave');
    await T.waitForTimeout(900);
    return (await rpc(T, 'listTests')).hasAiKey === true;
  });
  let aiId = '';
  await check('test from photos: add 2 photos, then 1 more, remove one → 2 photos go to the AI as one test', async () => {
    await T.click('#newAiBtn'); await T.waitForSelector('#aiDlg[open]');
    await T.check('#aiAck'); await T.waitForFunction(() => window.AI_ACK === true);
    const f = n => ({ name: 'page' + n + '.png', mimeType: 'image/png', buffer: PNG });
    await T.setInputFiles('#fileInput', [f(1), f(2)]);
    await T.waitForFunction(() => document.querySelectorAll('#aiTray .ph').length === 2);
    await T.setInputFiles('#fileInput', [f(3)]);
    await T.waitForFunction(() => document.querySelectorAll('#aiTray .ph').length === 3);
    await T.locator('#aiTray .ph button').nth(1).click();
    await T.waitForFunction(() => document.querySelectorAll('#aiTray .ph').length === 2);
    const nums = await T.locator('#aiTray .ph b').allTextContents();
    await T.click('#aiGo');
    await T.waitForSelector('#editor:not(.hidden) .qitem');
    assert(lastPhotos === 2, 'photos sent: ' + lastPhotos);
    return nums.join(',') === '1,2';
  });
  await check('test from photos: more than 10 → only 10 kept, with a message', async () => {
    await T.click('#homeBtn'); await T.waitForSelector('#newAiBtn');
    await T.click('#newAiBtn'); await T.waitForSelector('#aiDlg[open]');
    const many = []; for (let i = 0; i < 12; i++) many.push({ name: 'p' + i + '.png', mimeType: 'image/png', buffer: PNG });
    await T.setInputFiles('#fileInput', many);
    await T.waitForFunction(() => document.querySelectorAll('#aiTray .ph').length === 10);
    const msg = await T.textContent('#aiTrayMsg');
    await T.click('#aiCancel');
    return /10/.test(msg);
  });
  await check('test from a photo: the AI test opens in the editor and saves', async () => {
    await T.click('#newAiBtn'); await T.waitForSelector('#aiDlg[open]');
    const empty = await T.locator('#aiTray .ph').count();
    await T.setInputFiles('#fileInput', { name: 'page.png', mimeType: 'image/png', buffer: PNG });
    await T.waitForFunction(() => document.querySelectorAll('#aiTray .ph').length === 1);
    await T.click('#aiGo');
    await T.waitForSelector('#editor:not(.hidden) .qitem');
    assert(empty === 0, 'the tray starts empty');
    const n = await T.locator('#editor .qitem').count();
    await T.locator('#eaccess button', { hasText: 'Кожний бажаючий' }).click();   // a new test: the teacher picks who may take it
    await T.locator('.sticky-save button').first().click();
    await T.waitForFunction(() => /збережено|saved/i.test((document.getElementById('saveMsg') || {}).textContent || ''));
    const lib = await rpc(T, 'listTests');
    const t = lib.tests.find(x => x.source === 'ai'); aiId = t && t.id;
    return n === 2 && !!t;
  });
  await check('editor: auto-translate fills the missing language', async () => {
    const t = await rpc(T, 'getTest', aiId);
    t.content.sections[0].questions[0].q.en = '';
    await rpc(T, 'saveTest', aiId, t.content.title, '', t.content);
    await T.click('#homeBtn'); await T.waitForSelector('.test-row');
    await T.locator('.test-row', { hasText: 'Тест із фото' }).getByText('Редагувати').click();
    await T.waitForSelector('#editor:not(.hidden) .qitem');
    await T.locator('.langbar button').click();
    await T.waitForFunction(() => Array.from(document.querySelectorAll('#editor .q-text textarea[data-l=en]')).some(x => /^\[en\]/.test(x.value)));
    return true;
  });

  // a new test with every physics question type, made in the editor
  let myId = '';
  await check('editor: a new test with every question type → save & publish → open', async () => {
    await T.click('#homeBtn'); await T.waitForSelector('#newBlankBtn');
    await T.click('#newBlankBtn'); await T.waitForSelector('#editor:not(.hidden)');
    await T.fill('.e-title input[data-l=uk]', 'Мій тест з фізики'); await T.fill('.e-title input[data-l=en]', 'My physics test');
    await T.locator('#eaccess label', { hasText: '9-Б' }).click();   // «Хто може пройти тест»: only 9-Б
    const sec = T.locator('#secWrap .sec').first();
    await sec.locator('.sec-title input[data-l=uk]').fill('Розділ 1'); await sec.locator('.sec-title input[data-l=en]').fill('Part 1');
    const add = async ty => { await sec.locator('.row button', { hasText: '+ ' + ty }).click(); return sec.locator('.qitem').last(); };
    let q = await add('Вибір варіанта'); // mc
    await q.locator('.q-text textarea[data-l=uk]').fill('Одиниця сили?'); await q.locator('.q-text textarea[data-l=en]').fill('Unit of force?');
    await q.locator('.q-options textarea[data-l=uk]').fill('Джоуль\nНьютон\nВат'); await q.locator('.q-options textarea[data-l=en]').fill('Joule\nNewton\nWatt');
    await q.locator('.q-answer').fill('2');
    q = await add('Числова');
    await q.locator('.q-text textarea[data-l=uk]').fill('g = ? м/с²'); await q.locator('.q-text textarea[data-l=en]').fill('g = ? m/s²');
    await q.locator('.q-accept').fill('9.8'); await q.locator('.q-tol').fill('0.2');
    q = await add('Відповідність');
    await q.locator('.q-text textarea[data-l=uk]').fill('Величина → одиниця'); await q.locator('.q-text textarea[data-l=en]').fill('Quantity → unit');
    const pairs = [['Сила', 'Force', 'Н', 'N'], ['Робота', 'Work', 'Дж', 'J'], ['Потужність', 'Power', 'Вт', 'W']];
    for (let i = 0; i < 3; i++) {
      const pr = q.locator('.pair').nth(i);
      await pr.locator('.p-l input[data-l=uk]').fill(pairs[i][0]); await pr.locator('.p-l input[data-l=en]').fill(pairs[i][1]);
      await pr.locator('.p-r input[data-l=uk]').fill(pairs[i][2]); await pr.locator('.p-r input[data-l=en]').fill(pairs[i][3]);
    }
    q = await add('Коротка');
    await q.locator('.q-text textarea[data-l=uk]').fill('Хто відкрив закон всесвітнього тяжіння?'); await q.locator('.q-text textarea[data-l=en]').fill('Who discovered universal gravitation?');
    await q.locator('.q-accept').fill('Ньютон\nNewton');
    q = await add('Відкрите');
    await q.locator('.q-text textarea[data-l=uk]').fill('Поясніть інерцію.'); await q.locator('.q-text textarea[data-l=en]').fill('Explain inertia.');
    await T.locator('.sticky-save button').nth(1).click();
    await T.waitForSelector('#library:not(.hidden) .test-row');
    const lib = await rpc(T, 'listTests');
    const t = lib.tests.find(x => x.title === 'Мій тест з фізики'); myId = t && t.id;
    assert(t, 'test saved'); assert(t.questions === 5, 'questions: ' + t.questions);
    return t.state === 'open' && t.folder === '9-Б';
  });

  // ---------- student takes it through the page ----------
  const S = await student('Петро Учень', '9-Б');
  await check('student: the new test is on «Мої тести»; wrong code → clear message; right code → intro', async () => {
    await S.reload(); await S.waitForSelector('#stiles .stile');
    const onHome = await S.locator('#nowBox .ttest', { hasText: 'Мій тест з фізики' }).count();
    await S.fill('#code', 'AB1'); await S.press('#code', 'Enter');
    await S.waitForFunction(() => /не знайдено|not found/i.test(document.getElementById('msgTitle').textContent));
    await S.goto(base + '/my'); await S.waitForSelector('#stiles .stile');
    await S.fill('#code', myId.toLowerCase()); await S.press('#code', 'Enter');
    await S.waitForSelector('#intro:not(.hidden)');
    return onHome === 1;
  });
  await check('student of another class: the test does not open', async () => {
    const o = await student('Учень Іншого Класу', '9-А');
    await o.goto(base + '/t/' + myId);
    await o.waitForFunction(() => /іншому класу/.test(document.getElementById('msgTitle').textContent));
    await o.context().close();
    return true;
  });
  await check('student: every question type answered in the page → full marks', async () => {
    if (await S.locator('#consent').isVisible()) await S.check('#consent');
    await S.click('#startBtn'); await S.waitForSelector('#quiz:not(.hidden)');
    for (let i = 0; i < 5; i++) {
      const card = S.locator('#qcard');
      const txt = await card.innerText();
      if (/сили\?|force\?/i.test(txt)) await card.locator('label.opt', { hasText: /Ньютон|Newton/ }).click();
      else if (/g = \?/.test(txt)) await S.fill('#ta', '9,81');
      else if (/одиниця|unit/i.test(txt)) {
        const map = { 'Сила': 'Н', 'Робота': 'Дж', 'Потужність': 'Вт', 'Force': 'N', 'Work': 'J', 'Power': 'W' };
        const rows = card.locator('.mrow');
        for (let r = 0; r < 3; r++) { const l = (await rows.nth(r).locator('.mleft').innerText()).trim(); await rows.nth(r).locator('select').selectOption({ label: map[l] }); }
      } else if (/тяжіння|gravitation/i.test(txt)) await S.fill('#ta', 'Ньютон');
      else await S.fill('#ta', 'Тіло зберігає швидкість, якщо на нього не діють сили.');
      await S.click('#nextBtn');
    }
    await S.waitForSelector('#confirm[open]'); await S.click('#cSend');
    await S.waitForSelector('#doneView:not(.hidden)');
    const res = await rpc(T, 'getResults', myId);
    const r = res.results.find(x => x.name === 'Петро Учень');
    return r && r.grade.score === r.grade.max && r.grade.max === 6;
  });

  await check('results page: manual mark ✗ lowers the score, «Авто» restores it', async () => {
    await T.click('#homeBtn'); await T.waitForSelector('.test-row');
    await T.locator('.test-row', { hasText: 'Мій тест з фізики' }).getByText('Результати').click();
    await T.waitForSelector('#resRows tr.row2');
    await T.locator('#resRows tr.row2').first().click();
    await T.locator('#resRows .ov button.no').first().click();
    await T.waitForFunction(() => /5\/6/.test(document.getElementById('resRows').textContent));
    await T.locator('#resRows tr.row2').first().click();
    await T.locator('#resRows .ov button.auto').first().click();
    await T.waitForFunction(() => /6\/6/.test(document.getElementById('resRows').textContent));
    return true;
  });

  // resume + no going back
  const S2 = await student('Оля Перезавантаження', '9-Б');
  await check('student: reload in the middle → continues at the same question with the answers kept', async () => {
    await S2.goto(base + '/t/' + myId);
    await S2.waitForSelector('#intro:not(.hidden)');
    if (await S2.locator('#consent').isVisible()) await S2.check('#consent');
    await S2.click('#startBtn'); await S2.waitForSelector('#quiz:not(.hidden)');
    const first = await S2.locator('#qcard').getAttribute('data-qid');
    const card = S2.locator('#qcard');
    if (await card.locator('label.opt').count()) await card.locator('label.opt').first().click();
    else if (await card.locator('select').count()) { const sels = card.locator('select'); for (let r = 0; r < await sels.count(); r++) await sels.nth(r).selectOption({ index: 1 }); }
    else await S2.fill('#ta', '1');
    await S2.click('#nextBtn');
    const second = await S2.locator('#qcard').getAttribute('data-qid');
    await S2.waitForTimeout(900);   // the answer is saved
    await S2.reload(); await S2.waitForSelector('#quiz:not(.hidden)');
    const after = await S2.locator('#qcard').getAttribute('data-qid');
    return after === second && after !== first;
  });
  await check('teacher can delete an attempt that is still in progress (student stuck on another device)', async () => {
    await T.locator('#results button', { hasText: /Оновити|Refresh/ }).click();
    await T.waitForSelector('#resRows tr.row2');
    await T.locator('#resRows tr.row2', { hasText: 'Оля Перезавантаження' }).click();
    const del = T.locator('#resRows tr.detail button.danger');
    assert(await del.count() === 1, 'no delete button for an attempt in progress');
    await del.click();
    await T.waitForFunction(() => !/Оля Перезавантаження/.test(document.getElementById('resRows').textContent));
    return true;
  });

  // abandoned attempt after the time is up → graded for the teacher
  await check('time is up and the student never pressed «Надіслати» → teacher still gets a score', async () => {
    const st = await student('Іван Покинув', '9-Б');
    await st.goto(base + '/t/' + myId); await st.waitForSelector('#intro:not(.hidden)');
    if (await st.locator('#consent').isVisible()) await st.check('#consent');
    await st.click('#startBtn'); await st.waitForSelector('#quiz:not(.hidden)');
    const card = st.locator('#qcard');
    if (await card.locator('label.opt').count()) await card.locator('label.opt').first().click(); else if (await card.locator('select').count()) await card.locator('select').first().selectOption({ index: 1 }); else await st.fill('#ta', '9.8');
    await st.waitForTimeout(900);
    await st.context().close();
    sql('UPDATE attempts SET deadline = ? WHERE name = ?', Date.now() - 10 * 60000, 'Іван Покинув');
    const res = await rpc(T, 'getResults', myId);
    const r = res.results.find(x => x.name === 'Іван Покинув');
    return r && r.grade && r.status === 'Late' && r.submitted;
  });

  // ---------- schedule ----------
  await check('schedule: start at a time in the future → student sees a countdown; «Почати зараз» opens it', async () => {
    await T.click('#homeBtn'); await T.waitForSelector('.test-row');
    const row = T.locator('.test-row', { hasText: 'Тест із фото' });
    await row.getByText('Розклад').click(); await T.waitForSelector('#scheduleDlg[open]');
    await rpc(T, 'setStatus', aiId, 'published');
    await rpc(T, 'saveTestSettings', aiId, { startMode: 'time', opensAt: Date.now() + 3600000, endMode: 'manual', minutes: 0, shuffleQ: true, shuffleO: true, monitor: true });
    await T.keyboard.press('Escape');
    const st = await student('Чекає Відкриття');
    await st.goto(base + '/t/' + aiId); await st.waitForSelector('#msgCountdown:not(.hidden)');
    await rpc(T, 'saveTestSettings', aiId, { startMode: 'manual', endMode: 'manual', minutes: 0, shuffleQ: true, shuffleO: true, monitor: true });
    await rpc(T, 'startNow', aiId);
    await st.reload(); await st.waitForSelector('#intro:not(.hidden)');
    await st.context().close();
    return true;
  });
  await check('schedule: switching back from «за часом» to «вручну» does not leave the test waiting for the old time', async () => {
    await rpc(T, 'saveTestSettings', aiId, { startMode: 'time', opensAt: Date.now() + 7200000, endMode: 'manual', minutes: 0 });
    let lib = await rpc(T, 'listTests'); const s1 = lib.tests.find(x => x.id === aiId).state;
    await rpc(T, 'saveTestSettings', aiId, { startMode: 'manual', endMode: 'manual', minutes: 0 });
    lib = await rpc(T, 'listTests'); const s2 = lib.tests.find(x => x.id === aiId).state;
    return s1 === 'scheduled' && s2 !== 'scheduled';
  });
  await check('schedule: «Зупинити» closes the test for students', async () => {
    await rpc(T, 'startNow', aiId);
    await rpc(T, 'stopNow', aiId);
    const st = await student('Запізнився На Тест');
    await st.goto(base + '/t/' + aiId); await st.waitForSelector('#msgView:not(.hidden)');
    await st.waitForFunction(() => /закрит|closed/i.test(document.getElementById('msgTitle').textContent));
    await st.context().close();
    return true;
  });
  await check('schedule dialog: the extra options are saved through the page', async () => {
    await T.reload(); await T.waitForSelector('.test-row');
    await T.locator('.test-row', { hasText: 'Мій тест з фізики' }).getByText('Розклад').click();
    await T.waitForSelector('#scheduleDlg[open]');
    await T.check('#sch-devicelock');
    await T.locator('#scheduleDlg button.btn.solid', { hasText: /Зберегти|Save/ }).last().click();
    await T.waitForTimeout(500);
    const t = await rpc(T, 'getTest', myId);
    await rpc(T, 'saveTestSettings', myId, { network: 'any', deviceLock: false, startMode: 'manual', endMode: 'manual' });
    return t.settings.network === 'any' && t.settings.deviceLock === true;
  });

  // ---------- time limit ----------
  await check('time limit: when the time runs out the page sends the answers by itself', async () => {
    await rpc(T, 'saveTestSettings', myId, { startMode: 'manual', endMode: 'manual', minutes: 1 });
    const st = await student('Час Минув', '9-Б');
    await st.goto(base + '/t/' + myId); await st.waitForSelector('#intro:not(.hidden)');
    if (await st.locator('#consent').isVisible()) await st.check('#consent');
    await st.click('#startBtn'); await st.waitForSelector('#timer:not(.hidden)');
    sql('UPDATE attempts SET deadline = ? WHERE name = ?', Date.now() + 3000, 'Час Минув');
    await st.evaluate(() => { /* the page learns the new deadline with the next save */ });
    const card = st.locator('#qcard');
    if (await card.locator('label.opt').count()) await card.locator('label.opt').first().click(); else if (await card.locator('select').count()) await card.locator('select').first().selectOption({ index: 1 }); else await st.fill('#ta', '1');
    await st.waitForSelector('#doneView:not(.hidden)', { timeout: 15000 });
    await rpc(T, 'saveTestSettings', myId, { startMode: 'manual', endMode: 'manual', minutes: 0 });
    const res = await rpc(T, 'getResults', myId);
    await st.context().close();
    return !!res.results.find(x => x.name === 'Час Минув' && x.submitted);
  });

  // ---------- library actions ----------
  await check('ready-made tests: «Додати готові тести» brings back a deleted one', async () => {
    const lib = await rpc(T, 'listTests');
    const sample = lib.tests.find(x => x.source === 'sample');
    await rpc(T, 'deleteTest', sample.id);
    await T.click('#homeBtn'); await T.waitForSelector('#addSamplesBtn');
    await T.click('#addSamplesBtn'); await T.waitForTimeout(800);
    const lib2 = await rpc(T, 'listTests');
    return lib2.tests.filter(x => x.source === 'sample').length === lib.tests.filter(x => x.source === 'sample').length;
  });
  await check('delete a test from the list (results are kept in the database)', async () => {
    await T.click('#homeBtn'); await T.waitForSelector('.test-row');
    const row = T.locator('.test-row', { hasText: 'Тест із фото' }); await row.locator('details.more > summary').click(); await row.getByText('🗑').click();
    await T.waitForTimeout(800);
    const lib = await rpc(T, 'listTests');
    return !lib.tests.some(x => x.id === aiId);
  });

  // ---------- English: translation for the student ----------
  await check('English: the student opens the Ukrainian translation of a question', async () => {
    await T.goto(base + '/app/english'); await T.waitForSelector('.test-row');
    const lib = await rpc(T, 'listTests');
    const te = lib.tests[0];
    const full = await rpc(T, 'getTest', te.id);
    full.content.allowTranslate = true;
    await rpc(T, 'saveTest', te.id, full.content.title || full.title, full.folder, full.content, { mode: 'all' });
    await rpc(T, 'startNow', te.id);
    const st = await student('Anna English', '9-А');
    await st.goto(base + '/t/' + te.id); await st.waitForSelector('#intro:not(.hidden)');
    if (await st.locator('#consent').isVisible()) await st.check('#consent');
    await st.click('#startBtn'); await st.waitForSelector('#quiz:not(.hidden)');
    await st.click('.trbtn'); await st.waitForSelector('.trbox');
    const txt = await st.textContent('.trbox');
    await st.context().close();
    return txt.length > 5;
  });

  // ---------- every subject opens in the teacher page and its first test opens for a student ----------
  for (const k of Object.keys(srv.subjects)) {
    await check('subject ' + k + ': library, editor and student intro open without errors', async () => {
      await T.goto(base + '/app/' + k); await T.waitForSelector('.test-row');
      await T.locator('.test-row').first().getByText(/Редагувати|Edit/).click();
      await T.waitForSelector('#editor:not(.hidden) .qitem');
      const lib = await rpc(T, 'listTests');
      const open = lib.tests.find(x => x.state === 'open') || lib.tests[0];
      if (open.state !== 'open') await rpc(T, 'startNow', open.id);
      const st = await student('Учень ' + k, open.folder || '9-Б', { viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
      await st.goto(base + '/t/' + open.id); await st.waitForSelector('#intro:not(.hidden)');
      await st.context().close();
      return true;
    });
  }

  await check('logout from the teacher page', async () => {
    await T.locator('#nav button.out').click();
    await T.waitForURL(/\/login$/);
    return true;
  });
  await check('no page errors', async () => { if (errors.length) throw new Error(errors.slice(0, 3).join(' | ')); return true; });

  await browser.close(); http.close();
  const failed = results.filter(r => r[0] === 'FAIL').length;
  console.log('\n' + (results.length - failed) + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
