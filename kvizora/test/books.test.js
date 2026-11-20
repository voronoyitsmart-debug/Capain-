'use strict';
// Textbooks («📚 Підручники»): the API (schools see only their own books, limits, topics from the contents, a draft
// test from chosen topics with only those pages sent to the AI) and the page in Chromium with real PDFs made here:
// one with bookmarks, one with a printed table of contents, one scanned (no text). Screenshots go to test/screens/.
// Run: npm run test:books   (Playwright: NODE_PATH=/opt/node22/lib/node_modules or npm i -D playwright)
const os = require('os');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { createServer } = require('../server');
const auth = require('../lib/auth');
const { tocFromText, cleanToc } = require('../lib/books');

let passed = 0, failed = 0;
async function check(name, fn) {
  try { await fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { failed++; console.log('  ✗ ' + name + '\n      ' + (e && e.stack || e).toString().split('\n').slice(0, 3).join('\n      ')); }
}
const SHOTS = path.join(__dirname, 'screens'); fs.mkdirSync(SHOTS, { recursive: true });

function client(base) {
  const jar = {};
  async function req(p, body, raw) {
    const headers = { 'Content-Type': 'application/json', 'X-Tests-App': '1' };
    const ck = Object.keys(jar).map(k => k + '=' + jar[k]).join('; '); if (ck) headers.Cookie = ck;
    const res = await fetch(base + p, { method: body === undefined ? 'GET' : 'POST', headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual' });
    (res.headers.getSetCookie ? res.headers.getSetCookie() : []).forEach(s => { const m = /^([^=]+)=([^;]*)/.exec(s); if (m) { if (m[2]) jar[m[1]] = m[2]; else delete jar[m[1]]; } });
    if (raw) return res;
    const j = await res.json().catch(() => ({}));
    if (!j.ok) { const e = new Error(j.error || ('HTTP ' + res.status)); e.status = res.status; throw e; }
    return j.result;
  }
  return { jar, req, b: (fn, ...a) => req('/api/books/' + fn, { args: a }), login: (login, password) => req('/api/auth/login', { login, password }) };
}
const codeOf = e => (/\[#([a-z_]+)\]/.exec(String(e && e.message)) || [])[1];
async function throwsCode(code, p) { try { await p; } catch (e) { assert.strictEqual(codeOf(e), code, 'expected #' + code + ', got: ' + e.message); return; } assert.fail('expected #' + code); }

// the book used everywhere: contents on page 2, three topics, page numbers printed = PDF page − 2
const TOPICS = [['§ 1. Будова клітини', 'Клітина має мембрану, цитоплазму і ядро. Мітохондрії виробляють енергію для клітини.'],
  ['§ 2. Фотосинтез у рослин', 'Під час фотосинтезу хлоропласти поглинають світло і вуглекислий газ, а виділяють кисень.'],
  ['§ 3. Дихання організмів', 'Під час дихання організм поглинає кисень і виділяє вуглекислий газ і воду.']];

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kv-books-'));
  const prompts = [];
  const fakeAi = async (key, body) => {
    const b = JSON.parse(body), all = b.contents[0].parts.map(p => p.text || '').join('\n'), pics = b.contents[0].parts.filter(p => p.inline_data).length;
    prompts.push({ text: all, pics: pics });
    if (/first pages of a school textbook/.test(all)) return { text: JSON.stringify({ topics: TOPICS.map((t, i) => ({ title: t[0], printed: 1 + i * 2 })) }), model: 'fake' };
    return { text: JSON.stringify({ title: { uk: 'Тест' }, sources: [{ n: 1, page: 5, quote: 'хлоропласти поглинають світло' }, { n: 2, page: 99, quote: 'not in the pages' }],
      sections: [{ title: { uk: 'Фотосинтез' }, questions: [
        { type: 'mc', q: { uk: 'Що виділяють рослини під час фотосинтезу?' }, options: [{ uk: 'Кисень' }, { uk: 'Азот' }], answer: 0 },
        { type: 'short', q: { uk: 'Які органели поглинають світло?' }, accept: ['хлоропласти'] }] }] }), model: 'fake' };
  };
  const srv = createServer({ dbFile: path.join(dir, 't.db'), port: 0, geminiKey: 'test-key', geminiCall: fakeAi });
  const http = srv.app.listen(0, '127.0.0.1');
  await new Promise(r => http.once('listening', r));
  const base = 'http://127.0.0.1:' + http.address().port;
  await srv.ready;
  const db = srv.db, n0 = Date.now();
  const sc1 = Number(db.prepare('INSERT INTO schools (name, created) VALUES (?, ?)').run('Ліцей 1', n0).lastInsertRowid);
  const sc2 = Number(db.prepare('INSERT INTO schools (name, created) VALUES (?, ?)').run('Гімназія 2', n0).lastInsertRowid);
  const mk = (email, role, sc) => db.prepare('INSERT INTO teachers (email, name, pass, created, role, school_id, terms_at, terms_ver) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(email, email.split('@')[0], auth.hashPassword('correct horse 1'), n0, role, sc, n0, require('../lib/privacy').TERMS_VERSION);
  mk('owner@k.ua', 'owner', sc1); mk('anna@s1.ua', 'teacher', sc1); mk('ivan@s1.ua', 'teacher', sc1); mk('adm@s1.ua', 'admin', sc1); mk('olga@s2.ua', 'teacher', sc2);
  const A = client(base), I = client(base), ADM = client(base), O = client(base);
  await A.login('anna@s1.ua', 'correct horse 1'); await I.login('ivan@s1.ua', 'correct horse 1'); await ADM.login('adm@s1.ua', 'correct horse 1'); await O.login('olga@s2.ua', 'correct horse 1');
  const pageTexts = ['Біологія 7 клас', 'ЗМІСТ\n' + TOPICS.map((t, i) => t[0] + ' ........ ' + (1 + i * 2)).join('\n')];
  TOPICS.forEach(t => { pageTexts.push(t[0] + '\n' + t[1]); pageTexts.push(t[1] + ' Продовження теми.'); });

  console.log('Textbooks — API');
  let bookId;
  await check('topics from a printed table of contents: printed pages → PDF pages (offset found from the titles)', async () => {
    const toc = cleanToc(tocFromText(pageTexts), pageTexts.length);
    assert.deepStrictEqual(toc.map(t => [t.from, t.to]), [[3, 4], [5, 6], [7, 8]]);
    assert.strictEqual(toc[1].title, '§ 2. Фотосинтез у рослин');
  });
  await check('adding a book: the «lawful use» box is required; pages arrive in portions; finish finds the topics', async () => {
    await throwsCode('book_lawful', A.b('create', { title: 'Біологія 7', pages: 8 }));
    await throwsCode('book_big', A.b('create', { title: 'Біологія 7', pages: 5000, lawful: true }));
    bookId = (await A.b('create', { title: 'Біологія 7', subject: 'biology', grade: '7', pages: 8, lawful: true })).id;
    await A.b('addPages', bookId, pageTexts.slice(0, 4).map((t, i) => ({ page: i + 1, text: t })));
    await throwsCode('book_missing', A.b('finish', bookId, []));
    await A.b('addPages', bookId, pageTexts.slice(4).map((t, i) => ({ page: i + 5, text: t })));
    const r = await A.b('finish', bookId, []);
    assert.strictEqual(r.how, 'contents'); assert.strictEqual(r.book.toc.length, 3); assert.ok(r.book.ready);
  });
  await check('bookmarks of the PDF win over the printed contents', async () => {
    const id = (await A.b('create', { title: 'Закладки', pages: 8, lawful: true })).id;
    await A.b('addPages', id, pageTexts.map((t, i) => ({ page: i + 1, text: t })));
    const r = await A.b('finish', id, [{ title: 'Перша', from: 3 }, { title: 'Друга', from: 6 }]);
    assert.strictEqual(r.how, 'outline'); assert.deepStrictEqual(r.book.toc.map(t => [t.from, t.to]), [[3, 5], [6, 8]]);
    await A.b('remove', id);
  });
  await check('page pictures: only JPEG, size limit; preview gives at most 5 pages, picture only to the school', async () => {
    const id = (await A.b('create', { title: 'Скан', pages: 2, lawful: true })).id;
    await throwsCode('book_img', A.b('addPages', id, [{ page: 1, text: '', img: 'data:image/png;base64,iVBORw0KGgo=' }]));
    await throwsCode('book_img', A.b('addPages', id, [{ page: 1, text: '', img: 'data:image/jpeg;base64,' + Buffer.alloc(500 * 1024, 0xff).toString('base64') }]));
    const jpg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(100)]);
    await A.b('addPages', id, [{ page: 1, text: '', img: 'data:image/jpeg;base64,' + jpg.toString('base64') }, { page: 2, text: 'Текст другої сторінки, достатньо довгий.' }]);
    await A.b('finish', id, []);
    assert.strictEqual((await I.req('/app/books/img/' + id + '/1.jpg', undefined, true)).status, 200);
    assert.strictEqual((await O.req('/app/books/img/' + id + '/1.jpg', undefined, true)).status, 404);
    const pv = await A.b('pages', bookId, 1, 8); assert.strictEqual(pv.pages.length, 5);
    assert.strictEqual((await A.b('get', id)).scans, 1);
    await A.b('remove', id);
  });
  await check('schools are separate: another school neither lists nor opens the book; students and guests get nothing', async () => {
    assert.ok((await I.b('list')).books.some(b => b.id === bookId));
    assert.ok(!(await O.b('list')).books.some(b => b.id === bookId));
    await throwsCode('book_none', O.b('get', bookId));
    await throwsCode('book_none', O.b('pages', bookId, 3, 3));
    const anon = client(base); await throwsCode('auth', anon.b('list'));
    assert.strictEqual((await anon.req('/app/books', undefined, true)).status, 302);
  });
  await check('only who added the book or an administrator changes or deletes it; others of the school still use it', async () => {
    await throwsCode('book_owner', I.b('update', bookId, { title: 'Чуже' }));
    await throwsCode('book_owner', I.b('remove', bookId));
    const b = await ADM.b('update', bookId, { grade: '7-Б' }); assert.strictEqual(b.grade, '7-Б');
  });
  await check('AI rules must be confirmed once before the AI is used', async () => {
    await throwsCode('ai_ack', I.b('makeTest', bookId, { topics: [1] }));
    await I.req('/api/t/math/ackAi', { args: [] }); await A.req('/api/t/math/ackAi', { args: [] });
    assert.ok((await I.b('list')).me.aiAck);
  });
  await check('«🤖 Знайти теми»: the AI reads only the first pages; printed numbers are mapped to PDF pages', async () => {
    await A.b('update', bookId, { toc: [] });
    const b = await A.b('findTopics', bookId);
    assert.deepStrictEqual(b.toc.map(t => [t.from, t.to]), [[3, 4], [5, 6], [7, 8]]);
    assert.ok(/first pages of a school textbook/.test(prompts[prompts.length - 1].text));
  });
  let made;
  await check('a test from a chosen topic: only that topic’s pages go to the AI; a DRAFT test is saved; sources are checked', async () => {
    made = await I.b('makeTest', bookId, { topics: [1], count: 8, langs: ['uk'], subject: 'biology' });
    const p = prompts[prompts.length - 1].text;
    assert.ok(/=== PAGE 5 ===/.test(p) && /=== PAGE 6 ===/.test(p), 'topic pages sent');
    assert.ok(!/Мітохондрії/.test(p.replace(/ЗМІСТ[\s\S]*?\n\n/, '')) && !/=== PAGE 3 ===|=== PAGE 7 ===/.test(p), 'no pages of other topics');
    assert.ok(/exactly 8 questions/.test(p) && /«§ 2\. Фотосинтез у рослин»/.test(p));
    assert.strictEqual(made.questions, 2); assert.strictEqual(made.subject, 'biology');
    assert.deepStrictEqual(made.sources.map(s => s.page), [5], 'a source outside the sent pages is dropped');
    const t = db.prepare('SELECT * FROM tests WHERE id = ?').get(made.id);
    assert.strictEqual(t.status, 'draft'); assert.strictEqual(t.source, 'ai'); assert.strictEqual(t.title, '§ 2. Фотосинтез у рослин');
    assert.ok(!/sources/.test(t.content), 'sources are not stored in the test');
  });
  await check('pages instead of topics; the subject’s languages; no pages chosen → a clear error', async () => {
    const r = await I.b('makeTest', bookId, { pages: { from: 7, to: 8 }, subject: 'english' });
    assert.ok(/=== PAGE 7 ===/.test(prompts[prompts.length - 1].text));
    assert.strictEqual(r.subject, 'english');
    await throwsCode('book_pick', I.b('makeTest', bookId, { topics: [] }));
  });
  await check('daily AI limit per school', async () => {
    const lim = require('../lib/books').LIMITS; const keep = lim.aiPerDay; lim.aiPerDay = 3;
    try { await throwsCode('book_ai_limit', I.b('makeTest', bookId, { topics: [0] })); } finally { lim.aiPerDay = keep; }
  });
  await check('the editor opens a draft from the textbooks page: /app/<subject>?e=<id> is served', async () => {
    const r = await I.req('/app/biology?e=' + made.id, undefined, true);
    assert.strictEqual(r.status, 200); assert.ok(/replaceState/.test(await r.text()));
  });

  // ---------- the page in Chromium ----------
  let chromium = null; try { ({ chromium } = require('playwright')); } catch (e) {}
  if (!chromium) { console.log('  (Playwright not found: browser checks skipped)'); }
  else {
    console.log('Textbooks — browser');
    const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
    const errors = [];
    const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
    const pg = await ctx.newPage();
    pg.on('pageerror', e => errors.push('page error: ' + e.message));
    pg.on('console', m => { if (m.type() === 'error' && !/favicon|status of 4[0-9][0-9]/.test(m.text())) errors.push('console: ' + m.text()); });
    pg.on('dialog', d => d.accept());
    // PDFs made by Chromium itself: real text layers (Cyrillic fonts), bookmarks from the headings, and a scan
    const maker = await ctx.newPage();
    const pdfOf = async (html, outline) => { await maker.setContent('<meta charset="utf-8"><style>body{font:16px serif} .p{page-break-after:always}</style>' + html); return maker.pdf({ format: 'A5', outline: !!outline, tagged: !!outline }); };
    const bodyHtml = '<div class="p"><h1 style="font-weight:400">Біологія 7 клас</h1></div><div class="p"><p>ЗМІСТ</p>' + TOPICS.map((t, i) => '<p>' + t[0] + ' ........ ' + (1 + i * 2) + '</p>').join('') + '</div>' +
      TOPICS.map(t => '<div class="p"><h2>' + t[0] + '</h2><p>' + t[1] + '</p></div><div class="p"><p>' + t[1] + ' Продовження теми.</p></div>').join('');
    const pdfText = path.join(dir, 'biology-7.pdf'); fs.writeFileSync(pdfText, await pdfOf(bodyHtml.replace(/<h1/, '<p').replace(/<\/h1>/, '</p>'), false));
    const pdfMarks = path.join(dir, 'bookmarks.pdf'); fs.writeFileSync(pdfMarks, await pdfOf(bodyHtml.replace(/<p>ЗМІСТ<\/p>[\s\S]*?<\/div>/, '<p>Вступ</p></div>'), true));
    await maker.setContent('<meta charset="utf-8"><p style="font:22px serif;padding:30px">Клітина — основна одиниця живого. Скан сторінки.</p>');
    const png = await maker.screenshot();
    const pdfScan = path.join(dir, 'scan.pdf'); fs.writeFileSync(pdfScan, await pdfOf('<img style="width:100%" src="data:image/png;base64,' + png.toString('base64') + '">', false));

    const sign = async () => { await pg.goto(base + '/login'); await pg.fill('#login', 'anna@s1.ua'); await pg.fill('#password', 'correct horse 1'); await pg.click('#go'); await pg.waitForURL(/\/app$/); };
    async function addBook(file, title) {
      await pg.click('#addBtn'); await pg.setInputFiles('#aFile', file); await pg.fill('#aTitle', title);
      await pg.selectOption('#aSubj', 'biology'); await pg.check('#aLawful'); await pg.click('#aGo');
      await pg.waitForFunction(() => !document.getElementById('bookCard').classList.contains('hidden') && document.getElementById('addCard').classList.contains('hidden'), null, { timeout: 60000 });
    }
    await check('dashboard has «📚 Підручники»; the page opens', async () => {
      await sign(); await pg.click('#nav a[href="/app/books"]'); await pg.waitForURL(/\/app\/books$/); await pg.waitForSelector('#books');
    });
    await check('PDF with a printed contents: read in the browser, text only uploaded, topics found and mapped', async () => {
      let bigBody = 0; pg.on('request', r => { if (/\/api\/books\/addPages/.test(r.url())) bigBody = Math.max(bigBody, (r.postData() || '').length); });
      await addBook(pdfText, 'Біологія 7 (текст)');
      const rows = await pg.$$eval('#topics tr', trs => trs.map(tr => [tr.children[1].firstChild.value, tr.children[2].firstChild.value, tr.children[3].firstChild.value]));
      assert.deepStrictEqual(rows.map(r => r.slice(1)), [['3', '4'], ['5', '6'], ['7', '8']], JSON.stringify(rows));
      assert.ok(/Фотосинтез/.test(rows[1][0]));
      assert.ok(bigBody > 0 && bigBody < 20000, 'only text went to the server (' + bigBody + ' bytes)');
      const b = (await A.b('list')).books.find(x => x.title === 'Біологія 7 (текст)'); assert.strictEqual(b.scans, 0);
    });
    await check('preview of a topic’s pages; a test from the chosen topic → «Відкрити в редакторі» opens the draft', async () => {
      await pg.click('#topics tr:nth-child(2) td.acts button'); await pg.waitForSelector('#prev h3');
      assert.ok(/хлоропласти/.test(await pg.textContent('#prev')));
      await pg.check('#topics tr:nth-child(2) input.pick'); await pg.fill('#gCount', '6');
      await pg.click('#gGo'); await pg.waitForSelector('#gOut .ok-box');
      assert.ok(/=== PAGE 5 ===/.test(prompts[prompts.length - 1].text) && !/=== PAGE 7 ===/.test(prompts[prompts.length - 1].text));
      assert.ok(/с\. 5/.test(await pg.textContent('#gOut')));
      await shot(pg, '25-books');
      await pg.click('#gOut a.btn'); await pg.waitForURL(/\/app\/biology$/);
      await pg.waitForFunction(() => { const e = document.getElementById('editor'); return e && e.offsetParent !== null && /Фотосинтез|Що виділяють/.test(e.innerHTML); }, null, { timeout: 15000 });
      await shot(pg, '26-books-draft-editor', false);
    });
    await check('PDF with bookmarks: topics come from the bookmarks', async () => {
      await pg.goto(base + '/app/books'); await pg.waitForSelector('#books');
      await addBook(pdfMarks, 'Біологія 7 (закладки)');
      await pg.waitForFunction(() => /закладок/.test(document.getElementById('tStatus').textContent));
      const rows = await pg.$$eval('#topics tr', trs => trs.map(tr => tr.children[1].firstChild.value + '|' + tr.children[2].firstChild.value));
      assert.ok(rows.some(r => /Фотосинтез.*\|5$/.test(r)), JSON.stringify(rows));
    });
    await check('scanned PDF: the page without text is kept as a picture (beta); preview shows it', async () => {
      await pg.goto(base + '/app/books'); await pg.waitForSelector('#books');
      await addBook(pdfScan, 'Скан (бета)');
      const b = (await A.b('list')).books.find(x => x.title === 'Скан (бета)'); assert.strictEqual(b.scans, 1);
      await pg.click('#tAdd'); await pg.click('#topics tr:nth-child(1) td.acts button');
      await pg.waitForSelector('#prev img'); await pg.waitForFunction(() => { const i = document.querySelector('#prev img'); return i.complete && i.naturalWidth > 100; });
      await pg.fill('#topics tr:nth-child(1) input.tt', 'Клітина'); await pg.check('#topics tr:nth-child(1) input.pick');
      await pg.click('#gGo'); await pg.waitForSelector('#gOut .ok-box');
      assert.strictEqual(prompts[prompts.length - 1].pics, 1, 'the scan went to the AI as a picture');
    });
    await check('phone width: no horizontal page scroll', async () => {
      await pg.setViewportSize({ width: 390, height: 800 });
      const w = await pg.evaluate(() => document.documentElement.scrollWidth); assert.ok(w <= 392, 'scrollWidth ' + w);
      await shot(pg, '27-books-phone', false);
    });
    await check('no script errors in the browser', async () => { assert.deepStrictEqual(errors, []); });
    await browser.close();
  }
  async function shot(p, n, full) { await p.screenshot({ path: path.join(SHOTS, n + '.png'), fullPage: full !== false }); }

  http.close();
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
