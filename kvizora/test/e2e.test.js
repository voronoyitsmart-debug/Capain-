'use strict';
// Browser test (Chromium via Playwright): first administrator, admin panel (classes, students, teachers), a student logs in
// and takes tests by link, tests for chosen classes, the gradebook,
// the anti-cheating layer reacts, the teacher sees results with warnings. Screenshots go to test/screens/.
// Run: npm run test:e2e   (needs Playwright: npm i -D playwright && npx playwright install chromium)
const os = require('os');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { createServer } = require('../server');

const SHOTS = path.join(__dirname, 'screens'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
async function check(name, fn) {
  try { const r = await fn(); results.push([r === false ? 'FAIL' : 'ok', name]); console.log((r === false ? '  ✗ ' : '  ✓ ') + name); }
  catch (e) { results.push(['FAIL', name]); console.log('  ✗ ' + name + ' — ' + String(e.message).split('\n')[0]); }
}

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tests-e2e-'));
  const srv = createServer({ dbFile: path.join(dir, 'e2e.db'), port: 0, geminiKey: '', publicUrl: 'https://demo-class-tests.trycloudflare.com' });
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
  const shot = (p, n, full) => p.screenshot({ path: path.join(SHOTS, n + '.png'), fullPage: full !== false });

  // ---------- first administrator, admin panel ----------
  const T = await newPage();   // the administrator, who also teaches
  async function loginAs(P, login, pw) {
    await P.waitForSelector('#login');
    await P.fill('#login', login); await P.fill('#password', pw);
    await P.click('#go');
  }
  await check('fresh server → /setup: the first administrator is created, then the admin panel', async () => {
    await T.goto(base + '/app');
    await T.waitForURL(/\/setup$/);
    await T.fill('#school', 'Ліцей № 1'); await T.fill('#name', 'Олена Коваль'); await T.fill('#email', 'olena@school.ua');
    await T.fill('#password', 'correct horse 1'); await T.fill('#password2', 'correct horse 1'); await T.check('#t1'); await T.check('#t2');
    await shot(T, '00-setup', false);
    await T.click('#go');
    await T.waitForURL(/\/admin$/);
    await T.waitForSelector('#addStBtn');
    await T.waitForFunction(() => /Ліцей/.test(document.getElementById('school').textContent));
    return true;
  });
  const KIDS = {};
  await check('admin panel: add classes, add a whole class of students, printable password slips', async () => {
    await T.click('#tabs button[data-tab=classes]');
    for (const c of ['9-А', '9-Б']) { await T.fill('#clsName', c); await T.click('#clsForm button'); await T.waitForSelector('#clsBody td:text-is("' + c + '")'); }
    await shot(T, '20-admin-classes', false);
    await T.click('#tabs button[data-tab=students]');
    await T.click('#addStBtn');
    await T.selectOption('#addCls', '9-А');
    await T.fill('#addNames', 'Іван Петренко\nМарія Шевчук\nМарія Ш.\nОксана Мельник\nТарас Бондар');
    await T.click('#addGo');
    await T.waitForSelector('#slipsCard:not(.hidden) .slip');
    const slips = await T.locator('.slip').evaluateAll(n => n.map(x => ({ name: x.querySelector('b').textContent.split(' · ')[0], codes: Array.from(x.querySelectorAll('code')).map(c => c.textContent) })));
    slips.forEach(x => { KIDS[x.name] = { login: x.codes[0], pw: x.codes[1] }; });
    await T.waitForSelector('#stBody tr:has-text("Іван Петренко")');
    await shot(T, '21-admin-students');
    await T.click('#tabs button[data-tab=schools]');
    await T.fill('#scName', 'Гімназія № 2'); await T.click('#scForm button');
    await T.waitForSelector('#scBody tr:has-text("Гімназія № 2")');
    await shot(T, '24-admin-schools', false);
    await T.locator('#scBody tr', { hasText: 'Ліцей № 1' }).getByText('Вибрати').click();
    await T.waitForSelector('#stBody tr:has-text("Іван Петренко")');
    return slips.length === 5 && /^[a-z0-9.]+$/.test(KIDS['Іван Петренко'].login);
  });
  await check('admin adds a teacher; the teacher must choose an own password at first login', async () => {
    await T.click('#tabs button[data-tab=teachers]');
    await T.fill('#teName', 'Петро Іваненко'); await T.fill('#teEmail', 'petro@school.ua');
    await T.click('#teForm button');
    await T.waitForSelector('#slipsCard:not(.hidden) .slip:has-text("petro@school.ua")');
    const pw = await T.locator('.slip code').nth(1).textContent();
    await shot(T, '22-admin-teachers', false);
    const P = await newPage();
    await P.goto(base + '/login');
    await shot(P, '01-login', false);
    await loginAs(P, 'petro@school.ua', pw);
    await P.waitForURL(/\/password$/);
    await P.fill('#old', pw); await P.fill('#pw', 'another pass 2'); await P.fill('#pw2', 'another pass 2'); await P.check('#t1'); await P.check('#t2');
    await shot(P, '23-first-password', false);
    await P.click('#go');
    await P.waitForURL(/\/app$/);
    await P.waitForSelector('.subj');
    const admin = await P.locator('#adminLink').isVisible();
    await P.close();
    return !admin;
  });
  await check('subjects dashboard (with the admin panel and gradebook links)', async () => {
    await T.goto(base + '/app');
    await T.waitForSelector('.subj');
    const n = await T.locator('.subj').count();
    await shot(T, '02-dashboard');
    await T.waitForSelector('#nav a[href="/admin"]');
    return n === Object.keys(srv.subjects).length && await T.locator('#nav a[href="/app/grades"]').isVisible();
  });
  let codes = {};
  await check('math library: ready-made tests with their codes', async () => {
    await T.click('a.subj[href="/app/math"]');
    await T.waitForSelector('.test-row');
    const meta = await T.locator('.test-row .meta').allTextContents();
    await shot(T, '03-math-library');
    return meta.length >= 2 && meta.every(m => /Код: [A-Z2-9]{6}/.test(m));
  });
  const lib = await T.evaluate(() => new Promise((res, rej) => google.script.run.withSuccessHandler(res).withFailureHandler(rej).listTests('session')));
  const mathOpen = lib.tests.find(t => t.state === 'open');
  codes.math = mathOpen.id;
  await check('editor: «Хто може пройти тест» — chosen classes or the whole school', async () => {
    const other = lib.tests.find(t => t.id !== codes.math);
    await T.locator('.test-row', { hasText: other.title }).getByText(/Редагувати|Edit/).first().click();
    await T.waitForSelector('#eaccess');
    await T.locator('#eaccess button', { hasText: 'Лише вибрані' }).click();
    await T.locator('#eaccess label', { hasText: '9-Б' }).click();
    await shot(T, '16-editor-access', false);
    await T.locator('button', { hasText: '💾' }).first().click();
    await T.waitForFunction(() => /Збережено|Saved/.test((document.getElementById('saveMsg') || {}).textContent || ''));
    const t = await T.evaluate(id => new Promise(res => google.script.run.withSuccessHandler(res).getTest('session', id)), other.id);
    await T.goto(base + '/app/math');
    await T.waitForSelector('.test-row');
    return t.settings.access === 'classes' && t.settings.classes.join() === '9-Б';
  });
  await check('"Show code" dialog with a QR code', async () => {
    await T.locator('.test-row', { hasText: mathOpen.title }).getByText('📺').click();
    await T.waitForSelector('dialog[open] img[alt^="QR"]');
    await shot(T, '04-show-code', false);
    await T.locator('dialog[open] button', { hasText: 'Закрити' }).click();
    return true;
  });
  await check('schedule: full screen option saved', async () => {
    await T.locator('.test-row', { hasText: mathOpen.title }).getByText('Розклад').click();
    await T.waitForSelector('#sch-fullscreen');
    await T.check('#sch-fullscreen');
    if (await T.locator('#sch-net').count()) throw new Error('old Wi-Fi choice still there');
    await shot(T, '05-schedule', false);
    await T.locator('#scheduleDlg button.btn.solid', { hasText: /Зберегти|Save/ }).last().click();
    await T.waitForTimeout(500);
    const t = await T.evaluate(id => new Promise(res => google.script.run.withSuccessHandler(res).getTest('session', id)), mathOpen.id);
    return t.settings.fullscreen === true;
  });
  await check('«Безпека» section: every measure is a switch; turning watermark off is saved', async () => {
    await T.locator('.test-row', { hasText: mathOpen.title }).getByText('Розклад').click();
    await T.waitForSelector('#sch-devicetrack');
    for (const id of ['sch-devicetrack', 'sch-blockkeys', 'sch-devtools', 'sch-watermark', 'sch-multitab', 'sch-fullscreen', 'sch-devicelock', 'sch-aitrap']) {
      if (!(await T.locator('#' + id).count())) throw new Error('missing switch ' + id);
    }
    await T.uncheck('#sch-watermark');
    await shot(T, '15-security-section', false);
    await T.locator('#scheduleDlg button.btn.solid', { hasText: /Зберегти|Save/ }).last().click();
    await T.waitForTimeout(500);
    const t = await T.evaluate(id => new Promise(res => google.script.run.withSuccessHandler(res).getTest('session', id)), mathOpen.id);
    return t.settings.watermark === false && t.settings.deviceTrack === true && t.settings.aiTrap === false;
  });

  // ---------- student ----------
  /** The QR / link of a test → login → straight into the test. */
  async function openTest(S, code, kid, shotLogin) {
    await S.goto(base + '/t/' + code.toLowerCase());
    // a «🌍 Кожний бажаючий» test opens without an account: a student with one signs in from the header link
    if (!/\/login/.test(S.url()) && await S.evaluate(() => !window.STUDENT)) { await S.click('#myTests'); await S.waitForURL(/\/login/); }
    if (/\/login/.test(S.url())) {
      if (shotLogin) await shot(S, shotLogin, false);
      await loginAs(S, KIDS[kid].login, KIDS[kid].pw);
      await S.waitForURL(new RegExp('/t/' + code + '$'));
    }
  }
  await check('student home: own class, every subject, ❌ where there are no tests yet', async () => {
    const S = await newPage();
    await S.goto(base + '/');
    await S.waitForURL(/\/login$/);
    await loginAs(S, KIDS['Тарас Бондар'].login, KIDS['Тарас Бондар'].pw);
    await S.waitForURL(/\/my$/);
    await S.waitForSelector('#stiles .stile');
    const tiles = await S.locator('#stiles .stile').count(), none = await S.locator('#stiles .stile.none').count();
    const who = await S.locator('#who').textContent();
    const startLink = await S.locator('.ttest a.btn').count();
    await shot(S, '17-student-home');
    await S.close();
    return tiles === Object.keys(srv.subjects).length && none >= 1 && /9-А/.test(who) && startLink >= 1;
  });
  await check('student intro: name and class from the account (read-only), device & IP warning, consent', async () => {
    const S = await newPage();
    await openTest(S, codes.math, 'Оксана Мельник', '06-student-login');
    await S.waitForSelector('#startBtn:visible');
    const rulesTxt = await S.locator('#rules').textContent();
    const consentVisible = await S.locator('#consent').isVisible();
    const name = await S.inputValue('#name'), ro = await S.locator('#name').getAttribute('readonly');
    await S.close();
    return /пристрій/.test(rulesTxt) && /IP/.test(rulesTxt) && consentVisible && name === 'Оксана Мельник' && ro !== null;
  });
  async function takeTest(S, code, kid, opts) {
    opts = opts || {};
    await openTest(S, code, kid, opts.shotLogin);
    await S.waitForSelector('#startBtn:visible');
    if (opts.shotIntro) await shot(S, opts.shotIntro);
    if (await S.locator('#consent').isVisible()) await S.check('#consent');
    await S.click('#startBtn');
    await S.waitForSelector('#quiz:not(.hidden)');
    if (opts.during) await opts.during(S);
    for (let guard = 0; guard < 60; guard++) {
      if (await S.locator('#doneView:not(.hidden)').count()) break;
      if (await S.locator('#confirm[open]').count()) { await S.click('#cSend'); continue; }
      if (!(await S.locator('#quiz:not(.hidden)').count())) { await S.waitForTimeout(200); continue; }
      const card = S.locator('#qcard');
      if (await card.locator('input[type=radio]').count()) await card.locator('label.opt').first().click();
      const sels = card.locator('.mrow select');
      for (let i = 0; i < await sels.count(); i++) await sels.nth(i).selectOption({ index: 1 + (i % ((await sels.nth(i).locator('option').count()) - 1)) });
      const ta = card.locator('#ta');
      if (await ta.count()) await ta.fill(((await ta.inputValue()) || '') + ' 12');
      if (opts.shotQ && guard === opts.shotQ.at) await shot(S, opts.shotQ.name, false);
      await S.click('#nextBtn');
      await S.waitForTimeout(120);
    }
    await S.waitForSelector('#doneView:not(.hidden)');
  }

  await check('student (desktop, full screen): QR link → login → intro rules → whole test → sent', async () => {
    const S = await newPage();
    await takeTest(S, codes.math, 'Іван Петренко', { shotIntro: '07-student-intro', shotQ: { at: 1, name: '08-student-question' },
      during: async P => {
        const fs1 = await P.evaluate(() => !!document.fullscreenElement);
        await P.keyboard.press('F12');
        await P.mouse.click(300, 300, { button: 'right' });
        await P.keyboard.press('Control+U');
        await P.evaluate(() => document.exitFullscreen && document.fullscreenElement ? document.exitFullscreen() : null);
        await P.waitForTimeout(300);
        if (fs1) {
          const cover = await P.locator('text=Поверніться до тесту').isVisible();
          await shot(P, '09-student-fullscreen-cover', false);
          if (!cover) throw new Error('no cover after leaving full screen');
          await P.locator('button', { hasText: 'Повернутися до тесту' }).click();
        }
      } });
    const rules = await S.locator('#doneView').textContent();
    await shot(S, '10-student-done', false);
    return /Дякуємо|Thank/.test(rules);
  });
  await check('KaTeX renders formulas locally (no CDN)', async () => {
    const S = await newPage();
    await openTest(S, codes.math, 'Іван Петренко');
    return S.waitForFunction(() => !!window.katex, null, { timeout: 5000 }).then(() => true, () => false);
  });
  await check('the same account again → "already submitted"', async () => {
    const S = await newPage();
    await openTest(S, codes.math, 'Іван Петренко');
    await S.waitForFunction(() => /уже|вже|already/i.test(document.getElementById('msgTitle').textContent + document.getElementById('msgText').textContent));
    return true;
  });
  await check('a test for another class does not open (even by code)', async () => {
    const other = lib.tests.find(t => t.id !== codes.math);
    await T.evaluate(id => new Promise(r => google.script.run.withSuccessHandler(r).startNow('session', id)), other.id);
    const S = await newPage();
    await openTest(S, other.id, 'Марія Ш.');
    await S.waitForFunction(() => /іншому класу/.test(document.getElementById('msgTitle').textContent));
    await shot(S, '18-student-wrong-class', false);
    return true;
  });
  await check('same browser, another account → teacher warning "Той самий браузер"', async () => {
    const ctx = await browser.newContext({ viewport: { width: 1100, height: 860 } });
    const S = await ctx.newPage(); S.on('dialog', d => d.accept());
    await takeTest(S, codes.math, 'Марія Шевчук');
    await S.evaluate(() => window.api('/api/auth/logout'));
    await openTest(S, codes.math, 'Марія Ш.');
    if (await S.locator('#consent').isVisible()) await S.check('#consent');
    await S.click('#startBtn'); await S.waitForSelector('#quiz:not(.hidden)');
    const res = await T.evaluate(id => new Promise(r => google.script.run.withSuccessHandler(r).getResults('session', id)), codes.math);
    const r = res.results.find(x => x.name === 'Марія Ш.');
    return r.flags.some(f => /Той самий браузер/.test(f.uk));
  });

  // chemistry on a phone
  const chemLib = await T.evaluate(() => new Promise(res => fetch('/api/t/chemistry/listTests', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Tests-App': '1' }, body: '{"args":["s"]}' }).then(r => r.json()).then(j => res(j.result))));
  const chemOpen = chemLib.tests.find(t => t.state === 'open');
  await check('student on a phone: chemistry test (formula input, preview)', async () => {
    const S = await newPage({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
    await takeTest(S, chemOpen.id, 'Оксана Мельник', { shotQ: { at: 3, name: '11-student-phone-chemistry' } });
    return true;
  });

  if (srv.subjects.ukrainian) await check('Ukrainian: only Ukrainian, no language switch', async () => {
    const uk = await T.evaluate(() => fetch('/api/t/ukrainian/listTests', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Tests-App': '1' }, body: '{"args":["s"]}' }).then(r => r.json()).then(j => j.result));
    const open = uk.tests.find(t => t.state === 'open');
    const S = await newPage();
    await openTest(S, open.id, 'Тарас Бондар');
    await S.waitForSelector('#startBtn:visible');
    if (await S.locator('#consent').isVisible()) await S.check('#consent');
    await S.click('#startBtn'); await S.waitForSelector('#quiz:not(.hidden)');
    await shot(S, '13-student-ukrainian', false);
    return !(await S.locator('#langTog').isVisible());
  });

  // ---------- teacher: results ----------
  await check('teacher results: scores, warnings, device', async () => {
    await T.goto(base + '/app/math?r=' + codes.math);
    await T.waitForSelector('#resRows tr');
    await T.locator('#resRows tr', { hasText: 'Іван Петренко' }).first().click();
    await T.waitForSelector('.flags-box');
    const box = await T.locator('.flags-box').textContent();
    const dev = await T.locator('#resRows .detail').textContent();
    await shot(T, '12-teacher-results');
    return /клавіші/.test(box) && /контекстне меню/.test(box) && /Пристрій D-/.test(dev);
  });
  await check('CSV download link on the results page', async () => {
    const href = await T.locator('#results a', { hasText: 'CSV' }).getAttribute('href');
    return /\/app\/export\/math\/[A-Z2-9]{6}\.csv$/.test(href);
  });
  await check('gradebook: the class with scores, a mark is typed and saved; the student sees it', async () => {
    await T.goto(base + '/app/grades?s=math');
    await T.waitForSelector('#body tr');
    await T.selectOption('#cls', '9-А');
    await T.waitForSelector('#body tr:has-text("Іван Петренко") input.g');
    const row = T.locator('#body tr', { hasText: 'Іван Петренко' });
    const inp = row.locator('input.g').first();
    await inp.fill('10'); await inp.press('Tab');
    await T.waitForSelector('input.g.saved');
    await shot(T, '19-gradebook');
    const S = await newPage();
    await S.goto(base + '/login'); await loginAs(S, KIDS['Іван Петренко'].login, KIDS['Іван Петренко'].pw);
    await S.waitForURL(/\/my$/); await S.waitForSelector('#stiles .stile');
    const txt = await S.locator('.subjects').textContent();
    await S.close();
    return /Оцінка: 10/.test(txt);
  });
  const tcall = (url, args) => T.evaluate(([u, a]) => fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Tests-App': '1' }, body: JSON.stringify({ args: a }) }).then(r => r.json()), [url, args]);
  await check('groups: the administrator puts a student into group 1; the teacher picks «Моя група» in the gradebook', async () => {
    const ls = await tcall('/api/admin/listSchools', []); if (!ls.result) throw new Error(JSON.stringify(ls)); let ivan = null;
    for (const sc of ls.result.schools) { ivan = ivan || (await tcall('/api/admin/listStudents', [{ school: sc.id, q: 'Іван Петренко' }])).result.students[0]; }
    await tcall('/api/admin/updateStudent', [ivan.id, { group: 1 }]);
    await T.goto(base + '/app/grades?s=math'); await T.waitForSelector('#body tr');
    await T.selectOption('#cls', '9-А'); await T.waitForSelector('#grpBox:not([hidden])');
    await T.selectOption('#grp', '1'); await T.waitForFunction(() => /група 1/.test(document.getElementById('title').textContent));
    const names = await T.locator('#body tr td:first-child .nm').allTextContents();
    return names.length === 1 && names[0] === 'Іван Петренко';
  });
  await check('dated gradebook: a lesson mark on a new day; the student report; the administrator turns a subject off for a class', async () => {
    await T.selectOption('#grp', '0'); await T.waitForFunction(() => !/група/.test(document.getElementById('title').textContent));
    await T.click('#vDays'); await T.waitForSelector('th.dcol');
    await T.fill('#newDay', '2026-10-21'); await T.click('#addDay');
    const row = T.locator('#body tr', { hasText: 'Іван Петренко' });
    await T.waitForSelector('th.dcol[title="2026-10-21"]');
    const idx = await T.evaluate(() => Array.prototype.findIndex.call(document.querySelectorAll('#head th'), th => th.title === '2026-10-21'));
    const inp = row.locator('td').nth(idx).locator('input.g');
    await inp.fill('8'); await inp.press('Tab'); await T.waitForSelector('input.g.saved');
    await shot(T, '30-gradebook-dates');
    await row.locator('button.nm').click(); await T.waitForSelector('#repDlg[open] .rep-s h3'); await T.waitForFunction(() => /середня оцінка/.test(document.getElementById('repBody').textContent));
    await shot(T, '31-student-report');
    const rep = await T.locator('#repBody').textContent();
    await T.click('#repClose'); await T.click('#vTests');
    await T.goto(base + '/admin'); await T.click('#tabs button[data-tab="classes"]'); await T.waitForSelector('#clsBody tr td button');
    await T.locator('#clsBody tr').first().locator('td').nth(2).locator('button').click();
    await T.waitForSelector('#subjDlg[open] #subjBox input');
    await shot(T, '32-class-subjects');
    await T.click('#subjCancel');
    return /Математика|Mathematics/.test(rep) && /середня оцінка: \d/.test(rep);
  });
  await check('review of mistakes: the teacher allows it for one student; the student opens «🔍 Розбір помилок»', async () => {
    const res = await tcall('/api/t/math/getResults', ['s', codes.math]);
    const a = res.result.results.find(r => r.name === 'Іван Петренко' && r.submitted);
    await tcall('/api/t/math/setReview', ['s', a.id, true]);
    const S = await newPage();
    await S.goto(base + '/login'); await loginAs(S, KIDS['Іван Петренко'].login, KIDS['Іван Петренко'].pw);
    await S.waitForURL(/\/my$/); await S.locator('button', { hasText: 'Розбір помилок' }).first().click();
    await S.waitForSelector('#revDlg[open] .rv-q');
    await shot(S, '25-student-review', false);
    const n = await S.locator('#revDlg .rv-q').count();
    await S.close();
    return n > 0;
  });
  await check('logout → back to login', async () => {
    await T.goto(base + '/app/math');
    await T.locator('#nav button.out').click();
    await T.waitForURL(/\/login$/);
    return true;
  });

  await check('no page errors', async () => { if (errors.length) console.log('    ' + errors.slice(0, 5).join('\n    ')); return errors.length === 0; });

  await browser.close(); http.close();
  const bad = results.filter(r => r[0] !== 'ok').length;
  console.log('\n' + (results.length - bad) + ' passed, ' + bad + ' failed. Screenshots: ' + SHOTS);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
