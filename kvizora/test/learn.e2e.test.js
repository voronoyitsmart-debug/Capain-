'use strict';
// Browser test of «🎓 Навчання» (Chromium via Playwright): the teacher sets homework with a picture, the student (on a phone)
// hands in an answer with a photo of the notebook, the teacher marks it, the gradebook and the progress page show it,
// the student sees the mark in «⭐ Оцінки». Screenshots: test/screens/learn-*.png
// Run: npm run test:learn-e2e   (needs Playwright)
const os = require('os');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { createServer } = require('../server');

const SHOTS = path.join(__dirname, 'screens'); fs.mkdirSync(SHOTS, { recursive: true });
const PHOTO = path.join(__dirname, 'fixtures', 'notebook.jpg');
let ok = 0, bad = 0;
async function check(name, fn) {
  try { const r = await fn(); if (r === false) throw new Error('false'); ok++; console.log('  ✓ ' + name); }
  catch (e) { bad++; console.log('  ✗ ' + name + ' — ' + String(e.message).split('\n')[0]); }
}

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kv-learn-e2e-'));
  const srv = createServer({ dbFile: path.join(dir, 'e2e.db'), port: 0, geminiKey: '', publicUrl: 'https://demo.trycloudflare.com' });
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
    p.on('dialog', d => d.accept());
    return p;
  }
  const shot = (p, n, full) => p.screenshot({ path: path.join(SHOTS, 'learn-' + n + '.png'), fullPage: full !== false });
  const api = (P, url, body) => P.evaluate(([u, b]) => window.api(u, b), [url, body]);
  async function loginAs(P, login, pw) { await P.goto(base + '/login'); await P.waitForSelector('#login'); await P.fill('#login', login); await P.fill('#password', pw); await P.click('#go'); }

  const T = await newPage();
  const K = {};
  await check('setup: the administrator (also a maths teacher), class 7-А with four students, one of them in group 2', async () => {
    await T.goto(base + '/setup'); await T.waitForSelector('#school');
    await T.fill('#school', 'Ліцей № 7'); await T.fill('#name', 'Олена Коваль'); await T.fill('#email', 'olena@school.ua');
    await T.fill('#password', 'correct horse 1'); await T.fill('#password2', 'correct horse 1'); await T.check('#t1'); await T.check('#t2');
    await T.click('#go'); await T.waitForURL(/\/admin$/);
    const sc = (await api(T, '/api/admin/listSchools', { args: [] })).schools[0].id;
    await api(T, '/api/admin/addClass', { args: [sc, '7-А'] });
    const made = (await api(T, '/api/admin/addStudents', { args: [sc, '7-А', ['Іван Петренко', 'Марія Шевчук', 'Олег Бондар', 'Софія Кравець']] })).created;
    made.forEach(m => { K[m.name] = m; });
    await api(T, '/api/admin/updateStudent', { args: [K['Софія Кравець'].id, { group: 2 }] });
    await api(T, '/api/dashboard', {});
    return made.length === 4;
  });

  await check('teacher: «🎓 Навчання» opens; the administrator turns notebook photos on for the school', async () => {
    await T.goto(base + '/app/learn'); await T.waitForSelector('#photoCard:not(.hidden)');
    if (!/вимкнено/.test(await T.textContent('#photoState'))) throw new Error('photos must be off by default');
    await T.click('#photoBtn'); await T.waitForFunction(() => /увімкнено/.test(document.querySelector('#photoState').textContent));
  });
  await check('teacher: a new task with a worksheet picture, due tomorrow, for the whole class', async () => {
    await T.click('#newBtn'); await T.waitForSelector('#edDlg[open]');
    await T.selectOption('#eSubj', 'math'); await T.selectOption('#eCls', '7-А');
    await T.fill('#eName', '§ 12. Лінійні рівняння, № 312–316');
    await T.fill('#eBody', 'Розв’яжіть рівняння з підручника (с. 74). Запишіть перевірку для № 314.\nВідео-пояснення: https://example.org/linear');
    await T.fill('#eCrit', '12 — усі рівняння правильно й є перевірка; 9 — одна помилка; 6 — розв’язано половину.');
    await T.setInputFiles('#ePick', PHOTO); await T.waitForSelector('#eFiles img');
    await shot(T, '01-editor', false);
    await T.click('#edSave');
    await T.waitForFunction(() => !document.querySelector('#edDlg').open || document.querySelector('#edErr').textContent).catch(() => {});
    const err = await T.textContent('#edErr'); if (err) throw new Error('save: ' + err);
    await T.waitForSelector('.task:has-text("§ 12")');
  });
  await check('teacher: two more tasks (a Kvizora test and «learn by heart» for group 2)', async () => {
    const h = await api(T, '/api/learn/home', { args: [] });
    const test = h.tests.find(t => t.subject === 'math');
    const d = Date.now();
    await api(T, '/api/learn/save', { args: [{ subject: 'math', cls: '7-А', title: 'Тест «Дроби» вдома', kind: 'test', testId: test.id, due: d + 2 * 86400000 }] });
    await api(T, '/api/learn/save', { args: [{ subject: 'english', cls: '7-А', group: 2, title: 'Learn the words of Unit 3', kind: 'none', due: d + 3 * 86400000 }] });
    await api(T, '/api/learn/save', { args: [{ subject: 'math', cls: '7-А', title: '§ 11. Вправи 290–295', due: d - 2 * 86400000 }] });
    await T.reload(); await T.waitForSelector('.task:has-text("Дроби")');
    await shot(T, '02-tasks');
  });

  await check('teacher: «📢 Оголошення» — a text announcement to the class with the hint about personal data', async () => {
    await T.click('#tabAnn'); await T.waitForSelector('#annForm');
    if (!/даних окремих учнів/.test(await T.textContent('#annForm'))) throw new Error('no hint');
    await T.selectOption('#aSubj', 'math'); await T.selectOption('#aCls', '7-А');
    await T.fill('#aText', 'У п’ятницю — контрольна робота «Лінійні рівняння». Повторіть § 10–12 і візьміть лінійку.');
    await T.click('#annForm button[type=submit]'); await T.waitForSelector('#annList .card:has-text("контрольна")');
    await shot(T, '07-announcements', false);
    await T.click('#tabTasks');
  });

  // ---------- the student, on a phone ----------
  const S = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await check('student (phone): «🎓 Навчання» shows the class tasks with a badge, the group task is not there', async () => {
    const k = K['Іван Петренко'];
    await loginAs(S, k.login, k.password); await S.waitForURL(/\/my$/);
    await S.waitForFunction(() => document.querySelector('#learnBadge') && !document.querySelector('#learnBadge').classList.contains('hidden'));
    await S.click('.ptabs [data-t=learn]'); await S.waitForSelector('.hw');
    if (await S.locator('.hw:has-text("Unit 3")').count()) throw new Error('a group-2 task is shown to group 0');
    if (!(await S.locator('.card:has-text("📢 Оголошення"):has-text("контрольна")').count())) throw new Error('no announcement');
    if (await S.locator('.soon li').count() < 2) throw new Error('no «Найближчі терміни»');
    await shot(S, '10-student-tasks');
  });
  await check('student: opens the task, writes the answer, adds a photo of the notebook and hands it in', async () => {
    await S.click('.hw:has-text("§ 12") > button');
    await S.waitForSelector('.hw .in textarea');
    if (!(await S.locator('.hw .crit').count())) throw new Error('no criteria');
    await S.fill('.hw .in textarea', '№ 312: x = 4\n№ 313: x = −2,5\n№ 314: x = 7; перевірка: 3·7 − 5 = 16 ✓');
    await S.setInputFiles('.hw .in input[type=file]', PHOTO); await S.waitForSelector('.hw .in .mthumbs img');
    await shot(S, '11-student-answer');
    await S.click('.hw .in button.solid'); await S.waitForSelector('.hw:has-text("§ 12") .pill.ok');
  });

  // ---------- the teacher checks ----------
  await check('teacher: sees the answer with the photo, marks it 11 with a comment; returns another one', async () => {
    const k2 = K['Марія Шевчук'];
    const S2 = await newPage(); await loginAs(S2, k2.login, k2.password); await S2.waitForURL(/\/my$/);
    const id = (await api(S2, '/api/student/learn', {})).tasks.find(t => /§ 12/.test(t.title)).id;
    await api(S2, '/api/student/hwSubmit', { args: [id, '№ 312: x = 4\n№ 313: x = 2,5', [], []] });
    await T.click('.task:has-text("§ 12")'); await T.waitForSelector('.sub');
    const row = T.locator('.sub', { hasText: 'Іван Петренко' });
    if (!(await row.locator('.thumbs img').count())) throw new Error('no photo');
    await row.locator('input.g').fill('11'); await row.locator('input.cm').fill('Чудово! Перевірка правильна.'); await row.locator('button.solid').click();
    await row.getByText('Збережено ✓').waitFor();
    const row2 = T.locator('.sub', { hasText: 'Марія Шевчук' });
    await row2.locator('input.cm').fill('У № 313 знак: має бути −2,5. Виправ, будь ласка.'); await row2.locator('button[title^="Повернути"]').click();
    await row2.getByText('Повернено ✓').waitFor();
    await shot(T, '03-check');
  });

  await check('marks for the progress page: lesson marks, homework of the other students', async () => {
    const h = await api(T, '/api/learn/list', { args: [{}] }), past = h.tasks.find(t => /§ 11/.test(t.title)), id12 = h.tasks.find(t => /§ 12/.test(t.title)).id;
    const M = { 'Іван Петренко': ['10', '11', '12', '9'], 'Марія Шевчук': ['8', '7', 'н', '9'], 'Олег Бондар': ['4', 'н', '5', 'н', 'н'], 'Софія Кравець': ['10', '9', '11'] };
    const days = ['2026-10-06', '2026-10-09', '2026-10-13', '2026-10-16', '2026-10-20'];
    for (const n of Object.keys(M)) for (let i = 0; i < M[n].length; i++) await api(T, '/api/t/math/setDayMark', { args: ['session', K[n].id, days[i], M[n][i], ''] });
    await api(T, '/api/learn/mark', { args: [past.id, K['Іван Петренко'].id, '10', ''] });
    await api(T, '/api/learn/mark', { args: [past.id, K['Софія Кравець'].id, '11', ''] });
    await api(T, '/api/learn/mark', { args: [id12, K['Софія Кравець'].id, '12', ''] });
    return true;
  });
  await check('teacher: «📈 Успішність» — averages, levels, homework, absences, who needs attention', async () => {
    await T.goto(base + '/app/learn'); await T.click('#tabProg'); await T.selectOption('#pSubj', 'math'); await T.selectOption('#pFrom', 'all');
    await T.waitForSelector('#pBody tr:has-text("Олег Бондар") .warn');
    const warn = await T.textContent('#pBody tr:has-text("Олег Бондар") .warn');
    if (!/низька середня/.test(warn) || !/пропуски/.test(warn)) throw new Error('attention: ' + warn);
    await shot(T, '04-progress');
  });
  await check('the gradebook («За датами») shows the homework mark on the due day; a click on a name in progress opens the report', async () => {
    await T.click('#pBody tr:has-text("Іван Петренко") a'); await T.waitForURL(/\/app\/grades/);
    await T.waitForSelector('#repDlg[open]'); await T.waitForFunction(() => /д\/з здано/.test(document.querySelector('#repBody').textContent));
    await shot(T, '05-report', false);
    await T.click('#repClose'); await T.click('#vDays');
    await T.waitForSelector('th.dcol small:has-text("🏠")');
    await shot(T, '06-gradebook-days');
  });

  await check('student: the mark and the comment are in the task; «⭐ Оцінки» lists every mark with the average', async () => {
    await S.click('.ptabs [data-t=tests]'); await S.click('.ptabs [data-t=learn]');   // a tab opened again shows fresh data
    await S.waitForSelector('.hw:has-text("§ 12") .pill:has-text("11")');
    if (await S.getAttribute('.hw:has-text("§ 12") > button', 'aria-expanded') !== 'true') await S.click('.hw:has-text("§ 12") > button');
    await S.waitForSelector('.hw .tc');
    await shot(S, '12-student-checked');
    await S.click('.ptabs [data-t=marks]'); await S.waitForSelector('.kvm-s span');
    const t = await S.textContent('section[data-tab=marks]');
    if (!/11/.test(t) || !/Середня/.test(t)) throw new Error('marks: ' + t.slice(0, 200));
    await shot(S, '13-student-marks');
  });
  await check('the returned answer is fixed and handed in again', async () => {
    const k2 = K['Марія Шевчук'], S2 = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await loginAs(S2, k2.login, k2.password); await S2.waitForURL(/\/my$/); await S2.click('.ptabs [data-t=learn]');
    await S2.waitForSelector('.hw.ret'); await S2.click('.hw.ret > button'); await S2.waitForSelector('.hw .tc');
    await S2.fill('.hw .in textarea', '№ 312: x = 4\n№ 313: x = −2,5'); await S2.click('.hw .in button.solid');
    await S2.waitForSelector('.hw:has-text("§ 12") .pill.ok');
  });
  await check('no page errors', async () => { if (errors.length) throw new Error(errors.slice(0, 3).join(' | ')); });

  await browser.close(); http.close();
  console.log('\n' + ok + ' passed, ' + bad + ' failed. Screenshots: ' + SHOTS);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
