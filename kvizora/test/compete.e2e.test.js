'use strict';
// In a real browser: the gradebook's absences, lesson topics and period marks, the «⬇️ Excel» link, the administrator's
// parent access (switch, code sheet), the parent's page, the student's «Профіль» line, the school's test bank.
// Run: npm run test:compete-e2e   (screenshots in test/screens/compete-*.png)
const os = require('os');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { createServer } = require('../server');

const SHOTS = path.join(__dirname, 'screens'); fs.mkdirSync(SHOTS, { recursive: true });
let ok = 0, bad = 0;
async function check(name, fn) {
  try { const r = await fn(); if (r === false) throw new Error('false'); ok++; console.log('  ✓ ' + name); }
  catch (e) { bad++; console.log('  ✗ ' + name + ' — ' + String(e.message).split('\n')[0]); }
}
const pad = n => String(n).padStart(2, '0');
const dayOf = ms => { const d = new Date(ms); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kv-compete-e2e-'));
  const srv = createServer({ dbFile: path.join(dir, 'e2e.db'), port: 0, geminiKey: '' });
  const http = srv.app.listen(0, '127.0.0.1'); await new Promise(r => http.once('listening', r));
  const base = 'http://127.0.0.1:' + http.address().port;
  await srv.ready;
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const errors = [];
  async function newPage(opts) {
    const ctx = await browser.newContext(Object.assign({ viewport: { width: 1180, height: 860 } }, opts || {}));
    const p = await ctx.newPage();
    p.on('pageerror', e => errors.push('page error: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/favicon|status of 4[0-9][0-9]/.test(m.text())) errors.push('console: ' + m.text()); });
    p.on('dialog', d => d.type() === 'prompt' ? d.accept('Тема 1. Дроби') : d.accept());
    return p;
  }
  const shot = (p, n, full) => p.screenshot({ path: path.join(SHOTS, 'compete-' + n + '.png'), fullPage: full !== false });
  const api = (P, url, body) => P.evaluate(([u, b]) => window.api(u, b), [url, body]);
  async function loginAs(P, login, pw) { await P.goto(base + '/login'); await P.waitForSelector('#login'); await P.fill('#login', login); await P.fill('#password', pw); await P.click('#go'); }

  const T = await newPage();
  const K = {}; let SC;
  await check('setup: the administrator (also a teacher), class 7-А with two students, a mark and an absence', async () => {
    await T.goto(base + '/setup'); await T.waitForSelector('#school');
    await T.fill('#school', 'Ліцей № 7'); await T.fill('#name', 'Олена Коваль'); await T.fill('#email', 'olena@school.ua');
    await T.fill('#password', 'correct horse 1'); await T.fill('#password2', 'correct horse 1'); await T.check('#t1'); await T.check('#t2');
    await T.click('#go'); await T.waitForURL(/\/admin$/);
    SC = (await api(T, '/api/admin/listSchools', { args: [] })).schools[0].id;
    await api(T, '/api/admin/addClass', { args: [SC, '7-А'] });
    (await api(T, '/api/admin/addStudents', { args: [SC, '7-А', ['Іван Петренко', 'Марія Шевчук']] })).created.forEach(m => { K[m.name] = m; });
    await api(T, '/api/dashboard', {});
    await api(T, '/api/t/math/setDayMark', { args: ['session', K['Іван Петренко'].id, dayOf(Date.now() - 86400000), '11', ''] });
  });

  await check('gradebook «📅 За датами»: the topic under the date is saved; «нп» counts in «Пропуски»', async () => {
    await T.goto(base + '/app/grades?s=math&c=' + encodeURIComponent('7-А')); await T.waitForSelector('#vDays');
    await T.click('#vDays'); await T.waitForSelector('#head input.tp');
    await T.fill('#head input.tp', 'Звичайні дроби'); await T.press('#head input.tp', 'Tab');
    await T.waitForFunction(() => /Збережено/.test(document.querySelector('#status').textContent));
    const inp = T.locator('#body tr').nth(1).locator('input.g').first();
    await inp.fill('нп'); await inp.press('Tab');
    await T.waitForFunction(() => /нп 1/.test(document.querySelector('#body').textContent));
    await T.reload(); await T.waitForSelector('#head input.tp');
    if ((await T.inputValue('#head input.tp')) !== 'Звичайні дроби') throw new Error('the topic was not kept');
    await shot(T, 'journal-days');
  });

  await check('«🏁 Підсумкові»: the semester hint is grey, the mark is saved; «＋ Тематична» adds a column; «⬇️ Excel» downloads', async () => {
    await T.click('#vFinal'); await T.waitForSelector('#head th.fcol');
    const ph = await T.locator('#body tr').first().locator('input.g').nth(0).getAttribute('placeholder');
    await T.click('#addTheme'); await T.waitForFunction(() => /Тема 1\. Дроби/.test(document.querySelector('#head').textContent));
    const sem = T.locator('#body tr').first().locator('input.g').nth(1);
    await sem.fill('10'); await sem.press('Tab');
    await T.waitForFunction(() => /Збережено/.test(document.querySelector('#status').textContent));
    const href = await T.getAttribute('#csvBtn', 'href');
    if (!/\/app\/journal\/math\.csv\?c=/.test(href)) throw new Error('csv link: ' + href);
    const res = await T.evaluate(u => fetch(u).then(r => r.text()), href);
    if (!/І семестр/.test(res) || !/"10"/.test(res)) throw new Error('csv content: ' + res.slice(0, 200));
    await shot(T, 'journal-final');
    return ph === null || /^\d+$/.test(ph);
  });

  let CODE = '';
  await check('admin: parent access is off; turning it on (with D15 text) lets the administrator print a code sheet', async () => {
    await T.goto(base + '/admin'); await T.waitForSelector('#tabs');
    await T.click('#tabs [data-tab="privacy"]'); await T.waitForSelector('#parOn');
    if (await T.isChecked('#parOn')) throw new Error('must be off by default');
    if (!/законному представнику/.test(await T.textContent('#parCard'))) throw new Error('D15 text');
    await T.check('#parOn'); await T.waitForFunction(() => /Діючих кодів: 0/.test(document.querySelector('#parCount').textContent));
    await T.click('#tabs [data-tab="students"]');
    await T.waitForSelector('#stBody button:has-text("👪 Код батькам")');
    await T.locator('#stBody tr', { hasText: 'Іван Петренко' }).locator('button:has-text("👪 Код батькам")').click();
    await T.waitForSelector('#slipsCard:not(.hidden) code');
    CODE = await T.textContent('#slips code');
    if (!/^[A-Z2-9]{4}(-[A-Z2-9]{4}){3}$/.test(CODE)) throw new Error('code: ' + CODE);
    if (!/діє як пароль/.test(await T.textContent('#slips'))) throw new Error('D14 text');
    await shot(T, 'admin-parent-code');
  });

  await check('the parent: «Я з батьків» on the login page, the code opens the child’s marks, absences and topics; nothing to change', async () => {
    await api(T, '/api/t/math/setDayMark', { args: ['session', K['Іван Петренко'].id, dayOf(Date.now() - 3 * 86400000), 'н', ''] });
    const P = await newPage({ viewport: { width: 390, height: 844 } });
    await P.goto(base + '/login'); await P.click('#parentLink'); await P.waitForURL(/\/parent$/);
    await P.fill('#code', 'AAAA-BBBB-CCCC-DDDD'); await P.click('#go');
    await P.waitForFunction(() => /не діє/.test(document.querySelector('#err').textContent));
    await P.fill('#code', CODE.toLowerCase()); await P.click('#go');
    await P.waitForSelector('#view:not([hidden])');
    const t = await P.textContent('#view');
    if (!/Іван Петренко/.test(t) || !/11/.test(t) || !/пропуски: н 1/.test(t) || !/І семестр: 10/.test(t)) throw new Error('parent view: ' + t.replace(/\s+/g, ' ').slice(0, 400));
    if (/Марія/.test(t)) throw new Error('another student is visible');
    if (await P.locator('#view input, #view textarea').count()) throw new Error('the parent page must be read-only');
    await P.click('.ptabs [data-t="weak"]'); await P.waitForSelector('#weak:not([hidden])');
    await shot(P, 'parent-phone');
    await P.click('#out'); await P.waitForSelector('#enter:not([hidden])');
  });

  await check('the student sees in «👤 Профіль» that the parents have access', async () => {
    const S = await newPage();
    await loginAs(S, K['Іван Петренко'].login, K['Іван Петренко'].password); await S.waitForURL(/\/my/);
    await S.click('.ptabs [data-t="profile"]');
    await S.waitForFunction(() => /Доступ батьків/.test(document.querySelector('#prof').textContent));
    if (!/увімкнено/.test(await S.textContent('#prof'))) throw new Error('profile line');
  });

  await check('the school bank: a colleague’s shared test is copied and opens in the editor', async () => {
    const t = await api(T, '/api/admin/addTeacher', { args: [{ name: 'Петро Іваненко', email: 'petro@school.ua', school: SC }] });
    const B = await newPage();
    await loginAs(B, 'petro@school.ua', t.password); await B.waitForURL(/\/password/);
    await B.fill('#old', t.password).catch(() => {});
    await api(B, '/api/auth/password', { old: t.password, password: 'correct horse 2', terms: true, schoolOk: true });
    const lib = await api(T, '/api/t/math/listTests', { args: ['session'] });
    await api(T, '/api/t/math/shareTest', { args: ['session', lib.tests[0].id, true] });
    await B.goto(base + '/app/math'); await B.waitForSelector('#bankBtn');
    await B.click('#bankBtn'); await B.waitForSelector('dialog[open] button:has-text("Скопіювати собі")');
    await shot(B, 'bank', false);
    await B.click('dialog[open] button:has-text("Скопіювати собі")');
    await B.waitForURL(/\/app\/math/); await B.waitForSelector('#editor:not(.hidden), #efolder', { timeout: 15000 });
    const mine = await api(B, '/api/t/math/listTests', { args: ['session'] });
    if (!mine.tests.some(x => x.folder === 'Від колеги: Олена Коваль' && x.status === 'draft')) throw new Error('no copy');
  });

  await check('no page errors', async () => { if (errors.length) throw new Error(errors.slice(0, 3).join(' | ')); });
  await browser.close(); http.close();
  console.log('\n' + ok + ' passed, ' + bad + ' failed. Screenshots: ' + SHOTS);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
