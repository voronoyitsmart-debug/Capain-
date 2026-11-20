'use strict';
// Browser test of the maths equations and tools (Chromium via Playwright):
// the teacher turns tools on in the editor and sees the roots of a new equation; the student solves equations line by line
// (formula preview, math keyboard, roots, «Коренів немає», a system), opens the calculator, graphs, ruler, protractor and
// the formula sheet; the teacher sees every step marked and which tools were opened; the student's review shows the working.
// Run: node test/math.e2e.test.js   (needs Playwright)
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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tests-math-e2e-'));
  const srv = createServer({ dbFile: path.join(dir, 'e2e.db'), port: 0, geminiKey: '', publicUrl: 'https://demo-class-tests.trycloudflare.com' });
  const http = srv.app.listen(0, '127.0.0.1');
  await new Promise(r => http.once('listening', r));
  const base = 'http://127.0.0.1:' + http.address().port;
  await srv.ready;
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
  async function loginAs(P, login, pw) { await P.waitForSelector('#login'); await P.fill('#login', login); await P.fill('#password', pw); await P.click('#go'); }
  const rpc = (P, fn, ...args) => P.evaluate(([fn, args]) => new Promise((res, rej) => google.script.run.withSuccessHandler(res).withFailureHandler(rej)[fn].apply(null, ['session'].concat(args))), [fn, args]);

  // ---------- administrator (who teaches maths), a class with two students ----------
  const T = await newPage();
  const KIDS = {};
  await check('setup: administrator, class 9-А, two students', async () => {
    await T.goto(base + '/app'); await T.waitForURL(/\/setup$/);
    await T.fill('#school', 'Ліцей № 1'); await T.fill('#name', 'Олена Коваль'); await T.fill('#email', 'olena@school.ua');
    await T.fill('#password', 'correct horse 1'); await T.fill('#password2', 'correct horse 1'); await T.check('#t1'); await T.check('#t2');
    await T.click('#go'); await T.waitForURL(/\/admin$/); await T.waitForSelector('#addStBtn');
    await T.click('#tabs button[data-tab=classes]');
    await T.fill('#clsName', '9-А'); await T.click('#clsForm button'); await T.waitForSelector('#clsBody td:text-is("9-А")');
    await T.click('#tabs button[data-tab=students]'); await T.click('#addStBtn'); await T.selectOption('#addCls', '9-А');
    await T.fill('#addNames', 'Іван Петренко\nМарія Шевчук'); await T.click('#addGo');
    await T.waitForSelector('#slipsCard:not(.hidden) .slip');
    const slips = await T.locator('.slip').evaluateAll(n => n.map(x => ({ name: x.querySelector('b').textContent.split(' · ')[0], codes: Array.from(x.querySelectorAll('code')).map(c => c.textContent) })));
    slips.forEach(x => { KIDS[x.name] = { login: x.codes[0], pw: x.codes[1] }; });
    return slips.length === 2;
  });

  // ---------- teacher: the editor ----------
  let eqTest;
  await check('maths library has the ready-made «Рівняння» test', async () => {
    await T.goto(base + '/app/math'); await T.waitForSelector('.test-row');
    const lib = await rpc(T, 'listTests');
    eqTest = lib.tests.find(t => /Рівняння/.test(t.title));
    return !!eqTest && eqTest.questions === 11 && eqTest.max === 18;
  });
  await check('editor: «Рівняння» questions with live formula and roots; tool switches; all five tools turned on and saved', async () => {
    await T.locator('.test-row', { hasText: eqTest.title }).getByText(/Редагувати|Edit/).first().click();
    await T.waitForSelector('.toolbar-ed');
    await T.waitForTimeout(600);
    const keys = await T.locator('.solve-key').allTextContents();
    if (keys.length !== 11) throw new Error('solve editors: ' + keys.length);
    if (!/x = 12/.test(keys[0]) || !/x = -2, x = 1\/2|x = 1\/2, x = -2/.test(keys[5]) || !/коренів немає/.test(keys[6]) || !/x = 7; y = 3/.test(keys[10])) throw new Error('keys: ' + keys.join(' | '));
    if (await T.locator('.solve-prev .katex').count() < 11) throw new Error('no KaTeX preview of the equations');
    for (const k of ['ruler', 'protractor']) await T.check('#eTool-' + k);
    // a new equation: the roots appear while typing
    await T.locator('.sec').first().locator('button', { hasText: /Рівняння/ }).click();
    const last = T.locator('.sec').first().locator('.qitem').last();
    await last.locator('.q-eq').fill('x^2 - 9 = 0');
    await T.waitForFunction(el => /x = -3, x = 3/.test(el.textContent), await last.locator('.solve-key').elementHandle());
    await last.locator('.q-eq').fill('x*y = 6\nx + y = 5');
    await T.waitForFunction(el => /самі|yourself/.test(el.textContent), await last.locator('.solve-key').elementHandle());
    await last.locator('.q-accept').fill('x=2; y=3\nx=3; y=2');
    await T.waitForFunction(el => /\(x = 2; y = 3\), \(x = 3; y = 2\)/.test(el.textContent), await last.locator('.solve-key').elementHandle());
    await last.scrollIntoViewIfNeeded();
    await shot(T, 'm01-editor-solve', false);
    await last.locator('.qhead button.danger').click();   // not part of the test
    await T.locator('button', { hasText: '💾' }).first().click();
    await T.waitForFunction(() => /Збережено|Saved/.test((document.getElementById('saveMsg') || {}).textContent || ''));
    const t = await rpc(T, 'getTest', eqTest.id);
    await T.locator('.toolbar-ed').scrollIntoViewIfNeeded(); await shot(T, 'm02-editor-tools', false);
    return t.content.tools.join() === 'calc,graph,ruler,protractor,formulas' && t.content.sections.reduce((n, s) => n + s.questions.length, 0) === 11;
  });
  await check('teacher opens the test now', async () => { await rpc(T, 'startNow', eqTest.id); const t = await rpc(T, 'getTest', eqTest.id); return !!t; });

  // ---------- student ----------
  async function openTest(S, kid) {
    await S.goto(base + '/t/' + eqTest.id.toLowerCase());
    if (!/\/login/.test(S.url()) && await S.evaluate(() => !window.STUDENT)) { await S.click('#myTests'); await S.waitForURL(/\/login/); }
    if (/\/login/.test(S.url())) { await loginAs(S, KIDS[kid].login, KIDS[kid].pw); await S.waitForURL(new RegExp('/t/' + eqTest.id + '$')); }
    await S.waitForSelector('#startBtn:visible');
  }
  const S = await newPage();
  await check('intro lists the tools the student may use', async () => {
    await openTest(S, 'Іван Петренко');
    const rules = await S.locator('#rules').textContent();
    return /Калькулятор/.test(rules) && /Графіки/.test(rules) && /Лінійка/.test(rules) && /Транспортир/.test(rules) && /Формули/.test(rules);
  });
  // the questions come in a shuffled order: the right working is worked out for whatever question is on the screen
  const MK = (() => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'core', 'Code.gs'), 'utf8');
    const ctx = {}; require('vm').createContext(ctx);
    require('vm').runInContext(src.slice(src.indexOf('// ==== MATHKIT BEGIN'), src.indexOf('// ==== MATHKIT END ====')) + ';this.MK = MK;', ctx); return ctx.MK;
  })();
  let QS = {};
  async function current(P) { const id = await P.locator('#qcard').getAttribute('data-qid'); return QS[id]; }
  /** Write the right working (the equation, then the roots) and the right roots for the question on the screen. */
  async function solveHere(P, o) {
    o = o || {};
    const q = await current(P), K = MK.key(q.eq, q.vars, q.accept), multi = K.vars.length > 1, f = MK.fmt;
    if (q.steps !== 'off' && !o.noSteps) {
      const lines = q.eq.slice();
      if (!K.none && !K.all) lines.push(multi ? K.vars.map((v, i) => v + ' = ' + f(K.sols[0][i])).join('; ') : K.sols.map(s => K.vars[0] + ' = ' + f(s[0])).join(' або '));
      for (let i = 0; i < lines.length; i++) {
        if (i) { await P.locator('.stepin').nth(i - 1).press('Enter'); await P.waitForFunction(n => document.querySelectorAll('.stepin').length > n, i); }
        await P.locator('.stepin').nth(i).fill(lines[i]);
      }
    }
    if (K.none) await P.locator('.rflags label').first().click();
    else for (let i = 0; i < K.sols.length; i++) {
      if (i) await P.locator('.roots .linkbtn').click();
      for (let j = 0; j < K.vars.length; j++) await P.locator('.rootrow').nth(i).locator('.rootin').nth(j).fill(f(K.sols[i][j]));
    }
    return { q, K };
  }
  async function next(P) {
    const before = await P.locator('#qcard').getAttribute('data-qid');
    await P.click('#nextBtn');
    await P.waitForFunction(id => document.querySelector('#qcard').getAttribute('data-qid') !== id || !document.querySelector('#quiz') || document.querySelector('dialog[open]'), before);
  }
  await check('question 1: equation shown with KaTeX; steps typed line by line with a live preview; Enter adds a line', async () => {
    const t = await rpc(T, 'getTest', eqTest.id); QS = {}; t.content.sections.forEach(s => s.questions.forEach(q => { QS[q.id] = q; }));
    await S.check('#consent'); await S.click('#startBtn');
    await S.waitForSelector('.eqbox .katex');
    let q = await current(S);
    while (q.steps === 'off') { await solveHere(S); await next(S); q = await current(S); }
    const i = S.locator('.stepin').first();
    await i.fill('2x + 3 = 7'); await i.press('Enter');
    await S.waitForFunction(() => document.querySelectorAll('.stepin').length === 2 && document.activeElement === document.querySelectorAll('.stepin')[1]);
    await S.keyboard.type('2x = 4');
    await S.waitForFunction(() => document.querySelectorAll('.sprev .katex').length === 2);
    await shot(S, 'm10-student-solve', false);
    // back to an empty working, then the right one
    await S.locator('.srow .iconbtn').nth(1).click(); await S.locator('.srow .iconbtn').first().click();
    const one = await S.locator('.stepin').count() === 1 && !(await S.locator('.stepin').inputValue());
    return one;
  });
  await check('an unreadable line says so; empty roots block «Next»; the math keyboard types √( ) and ²', async () => {
    const i = S.locator('.stepin').first();
    await i.fill('5x - 10 = 3x +');
    await S.waitForSelector('.sprev.bad');
    await i.fill(''); await i.focus();
    await S.locator('.mkbd button', { hasText: /^x$/ }).first().click();
    await S.locator('.mkbd button', { hasText: '²' }).click();
    const v1 = await i.inputValue();
    await i.fill('');
    await S.locator('.mkbd button', { hasText: '√' }).first().click();
    await S.keyboard.type('x+1');
    const v2 = await i.inputValue();
    await i.fill('');
    await S.click('#nextBtn');
    const err = await S.locator('#quizErr').textContent();
    await solveHere(S); await next(S);
    return v1 === 'x²' && v2 === '√(x+1)' && /Запишіть відповідь/.test(err);
  });
  await check('calculator: 2+3·4 = 14, sin 30° = 0,5, a bad expression says so; the tool use is counted', async () => {
    await S.click('#tool-calc');
    await S.waitForSelector('.twin.calc');
    const d = S.locator('.calc .disp');
    await d.fill('2+3·4'); await d.press('Enter');
    const r1 = await d.inputValue();
    await d.fill(''); for (const k of ['sin', '3', '0']) await S.locator('.calc .keys button', { hasText: new RegExp('^' + k + '$') }).click();
    await S.locator('.calc .keys button.eq').click();
    const r2 = await d.inputValue();
    await d.fill('2+*'); await d.press('Enter');
    const err = await S.locator('.calc .res').textContent();
    await shot(S, 'm11-calculator', false);
    return r1 === '14' && r2 === '0,5' && /Помилка/.test(err);
  });
  await check('graphs: y = x^2 - 4 is drawn; a bad function says so; zoom works', async () => {
    await S.click('#tool-graph');
    await S.waitForSelector('.twin.graph canvas');
    await S.locator('.graph input').fill('x^2 - 4; 2x + 1');
    await S.waitForTimeout(200);
    const colored = await S.evaluate(() => { const c = document.querySelector('.graph canvas'), g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 2] > 100 && d[i] < 60 && d[i + 1] > 80) n++; return n; });
    await S.locator('.graph .grow button').first().click();
    await shot(S, 'm12-graph', false);
    await S.locator('.graph input').fill('x^2 +');
    const st = await S.locator('.graph .gst').textContent();
    await S.locator('.graph input').fill('sin(x)');
    return colored > 100 && /Не вдається/.test(st);
  });
  await check('ruler and protractor: shown over the page, dragged, turned by the ○ handle', async () => {
    await S.click('#tool-ruler'); await S.click('#tool-protractor');
    const ruler = S.locator('.instrument').first(), prot = S.locator('.instrument').nth(1);
    const b0 = await ruler.boundingBox();
    await S.mouse.move(b0.x + 200, b0.y + 40); await S.mouse.down(); await S.mouse.move(b0.x + 100, b0.y + 140, { steps: 5 }); await S.mouse.up();
    const b1 = await ruler.boundingBox();
    const rot = ruler.locator('.rot'), rb = await rot.boundingBox();
    await S.mouse.move(rb.x + rb.width / 2, rb.y + rb.height / 2); await S.mouse.down();
    await S.mouse.move(rb.x + rb.width / 2 - 60, rb.y + rb.height / 2 + 200, { steps: 8 }); await S.mouse.up();
    const tr = await ruler.evaluate(n => n.style.transform);
    const w = await prot.evaluate(n => n.offsetWidth);
    await shot(S, 'm13-ruler-protractor', false);
    return Math.abs(b1.x - b0.x + 100) < 3 && Math.abs(b1.y - b0.y - 100) < 3 && /rotate\((\d+)deg\)/.test(tr) && tr !== 'rotate(0deg)' && w > 300;
  });
  await check('formula sheet: the subject’s formulas drawn with KaTeX; tools close with ✕ / the toolbar', async () => {
    await S.click('#tool-formulas');
    await S.waitForSelector('.twin.sheet .katex');
    const n = await S.locator('.twin.sheet .tb > div').count();
    await shot(S, 'm14-formulas', false);
    await S.locator('.twin.sheet .th button').click();
    await S.click('#tool-ruler'); await S.click('#tool-protractor');
    await S.locator('.twin.graph .th button').click();
    return n >= 10 && await S.locator('.twin, .instrument').count() === 1;
  });
  await check('the rest of the test: two roots (+ корінь), «Коренів немає» turns the root boxes off, a system has x and y boxes', async () => {
    await S.locator('.twin.calc .th button').click();
    let n = 0, sawNone = false, sawSys = false, sawTwo = false;
    while (!(await S.locator('dialog[open]').count()) && n++ < 12) {
      const { K } = await solveHere(S);
      if (K.none) { sawNone = await S.locator('.rootin').first().isDisabled(); await shot(S, 'm15-no-roots', false); }
      if (K.vars.length > 1) { sawSys = (await S.locator('.rootrow label').allTextContents()).join('|') === 'x =|y ='; await shot(S, 'm16-system', false); }
      if (K.sols.length === 2 && !sawTwo) { sawTwo = await S.locator('.rootin').count() === 2; await shot(S, 'm15-two-roots', false); }
      if (/11 з 11|11 of 11/.test(await S.locator('.qcount').textContent())) break;
      await next(S);
    }
    return sawNone && sawSys && sawTwo;
  });
  await check('phone width: the solving page and an open tool do not scroll sideways', async () => {
    const P = await newPage({ viewport: { width: 375, height: 760 }, isMobile: true, hasTouch: true });
    await openTest(P, 'Марія Шевчук');
    await P.check('#consent'); await P.click('#startBtn'); await P.waitForSelector('.eqbox');
    await P.locator('.stepin').first().fill('3x - 2x = 5 + 7');
    await P.click('#tool-calc'); await P.waitForSelector('.twin.calc');
    const over = await P.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const box = await P.locator('.twin.calc').boundingBox();
    await shot(P, 'm17-phone', false);
    await P.close();
    return over <= 0 && box.x >= 0 && box.x + box.width <= 375;
  });
  await check('student submits; the score counts roots and steps', async () => {
    if (!(await S.locator('dialog[open]').count())) await S.click('#nextBtn');
    await S.waitForSelector('dialog[open]'); await S.click('#cSend');
    await S.waitForSelector('#doneView:not(.hidden)');
    const res = await rpc(T, 'getResults', eqTest.id), r = res.results.find(x => x.name === 'Іван Петренко');
    // every answer and every working right
    return r && r.grade.score === 18 && r.grade.max === 18 || (console.log(JSON.stringify(r && r.grade.sections.map(s => s.questions.map(q => [q.got, q.pts])))), false);
  });
  await check('teacher results: each step marked with KaTeX, roots and points; the tools the student opened', async () => {
    await T.goto(base + '/app/math?r=' + eqTest.id); 
    await T.waitForSelector('tr.row2');
    await T.locator('tr.row2', { hasText: 'Іван Петренко' }).click();
    await T.waitForSelector('.st-line .katex');
    const lines = await T.locator('.st-line').count(), info = await T.locator('tr.detail .inner > p.muted').allTextContents();
    await shot(T, 'm20-results');
    return lines >= 8 && info.some(x => /Калькулятор 1×/.test(x) && /Графіки 1×/.test(x) && /Лінійка 1×/.test(x));
  });
  await check('the student’s review shows the working with marks and the right roots', async () => {
    const res = await rpc(T, 'getResults', eqTest.id), r = res.results.find(x => x.name === 'Іван Петренко');
    await rpc(T, 'setReview', r.id, true);
    await S.goto(base + '/my'); await S.waitForSelector('#stiles .stile');
    await S.locator('button', { hasText: 'Розбір помилок' }).first().click();
    await S.waitForSelector('#revDlg[open]');
    await S.uncheck('#revOnlyWrong').catch(() => {});
    const txt = await S.locator('#revBody').textContent();
    await shot(S, 'm21-review', false);
    return /Розв’язання/.test(txt) && /✓ 3x - 7 = 2x \+ 5/.test(txt) && /Ваша відповідь: x = 12/.test(txt);
  });
  await check('no page errors', async () => { if (errors.length) console.log(errors.slice(0, 10).join('\n')); return errors.length === 0; });

  await browser.close(); http.close();
  const fail = results.filter(r => r[0] === 'FAIL').length;
  console.log('\n' + (results.length - fail) + ' passed, ' + fail + ' failed. Screenshots: ' + SHOTS);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
