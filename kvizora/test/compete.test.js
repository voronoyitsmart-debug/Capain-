'use strict';
// The journal next to the school's official one, parents, the school's test bank:
// absences «н»/«нп», the lesson's topic, marks for a period (set by the teacher), the spreadsheet for «Мрія»,
// read-only access of parents by a code (off by default, only a hash kept, taken back at once), sharing tests inside a school.
// Run: npm run test:compete
const os = require('os');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { createServer } = require('../server');

let passed = 0, failed = 0;
async function check(name, fn) {
  try { await fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { failed++; console.log('  ✗ ' + name + '\n      ' + (e && e.stack || e).toString().split('\n').slice(0, 3).join('\n      ')); }
}
function client(base, ip) {
  const jar = {};
  const fixedIp = ip || '10.2.' + (1 + Math.floor(Math.random() * 200)) + '.' + (1 + Math.floor(Math.random() * 200));
  async function req(p, body, raw) {
    const headers = { 'Content-Type': 'application/json', 'X-Tests-App': '1' };
    if (ip !== null) headers['X-Forwarded-For'] = fixedIp;
    const ck = Object.keys(jar).map(k => k + '=' + jar[k]).join('; '); if (ck) headers.Cookie = ck;
    const res = await fetch(base + p, { method: body === undefined ? 'GET' : 'POST', headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual' });
    (res.headers.getSetCookie ? res.headers.getSetCookie() : []).forEach(s => { const m = /^([^=]+)=([^;]*)/.exec(s); if (m) { if (m[2]) jar[m[1]] = m[2]; else delete jar[m[1]]; } });
    if (raw) return res;
    const j = await res.json().catch(() => ({}));
    if (!j.ok) { const e = new Error(j.error || ('HTTP ' + res.status)); e.status = res.status; throw e; }
    return j.result;
  }
  return { jar, req, page: p => req(p, undefined, true),
    adm: (fn, ...a) => req('/api/admin/' + fn, { args: a }), L: (fn, ...a) => req('/api/learn/' + fn, { args: a }),
    t: (subj, fn, ...a) => req('/api/t/' + subj + '/' + fn, { args: ['session'].concat(a) }),
    login: async (login, password) => { await req('/login', undefined, true); return req('/api/auth/login', { login, password }); } };
}
const codeOf = e => (/\[#([a-z_]+)\]/.exec(String(e && e.message)) || [])[1];
async function throwsCode(code, p) { try { await p; } catch (e) { assert.strictEqual(codeOf(e), code, 'expected #' + code + ', got: ' + e.message); return; } assert.fail('expected #' + code); }
const pad = n => String(n).padStart(2, '0');
const dayOf = ms => { const d = new Date(ms); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kv-compete-'));
  const srv = createServer({ dbFile: path.join(dir, 't.db'), port: 0, geminiKey: '' });
  const http = srv.app.listen(0); await new Promise(r => http.once('listening', r));
  const base = 'http://127.0.0.1:' + http.address().port;
  const PW = 'correct horse 1', DAY = 86400000;

  const A = client(base, null);
  await A.req('/api/setup', { school: 'Ліцей № 7', name: 'Олена Коваль', email: 'olena@school.ua', password: PW, terms: true, schoolOk: true });
  const SC = (await A.adm('listSchools')).schools[0].id;
  const SC2 = (await A.adm('addSchool', 'Гімназія № 3')).schools.find(s => s.name === 'Гімназія № 3').id;
  async function teacher(name, email, school) {
    const t = await A.adm('addTeacher', { name, email, school: school || SC }), c = client(base);
    await c.login(email, t.password); await c.req('/api/auth/password', { old: t.password, password: PW + 'x', terms: true, schoolOk: true });
    c.id = t.id; return c;
  }
  const B = await teacher('Петро Іваненко', 'petro@school.ua');
  const C = await teacher('Ірина Мельник', 'iryna@school.ua');
  const Z = await teacher('Чужа Вчителька', 'zz@other.ua', SC2);
  await A.adm('addClass', SC, '7-А'); await A.adm('addClass', SC2, '5-В');
  const kids = (await A.adm('addStudents', SC, '7-А', ['Аня Бойко', 'Богдан Гнатюк'])).created;
  const far = (await A.adm('addStudents', SC2, '5-В', ['Інша Учениця'])).created[0];
  const s1 = client(base); await s1.login(kids[0].login, kids[0].password);
  const today = dayOf(Date.now());

  console.log('\nJournal: absences, lesson topics, period marks, the spreadsheet');
  await check('«н» and «нп» are absences (spelling does not matter); the reason is never kept', async () => {
    assert.strictEqual((await B.t('math', 'setDayMark', kids[0].id, today, 'Н', '')).grade, 'н');
    assert.strictEqual((await B.t('math', 'setDayMark', kids[1].id, today, 'н/п', '')).grade, 'нп');
    assert.strictEqual((await B.t('math', 'setDayMark', kids[0].id, dayOf(Date.now() - DAY), '10', '')).grade, '10');
    await throwsCode('bad_grade', B.t('math', 'setDayMark', kids[0].id, today, '13', ''));
  });
  await check('the lesson topic belongs to the class (and group) and the day; another class does not see it', async () => {
    const r = await B.t('math', 'setDayTopic', '7-А', 0, today, '  Дроби <b>і</b>   відсотки ');
    assert.strictEqual(r.topic, 'Дроби b і /b відсотки');
    const gb = await B.t('math', 'gradebook', '7-А', 0);
    assert.strictEqual(gb.topics[today], r.topic);
    assert.deepStrictEqual((await C.t('math', 'gradebook', '7-А', 0)).topics, {});   // another teacher: own topics
    assert.deepStrictEqual((await B.t('math', 'gradebook', '7-А', 1)).topics, {});    // group 1 has its own
    await throwsCode('bad_day', B.t('math', 'setDayTopic', '7-А', 0, '2026-13-01', 'x'));
    await B.t('math', 'setDayTopic', '7-А', 0, dayOf(Date.now() - DAY), 'Вступ');
    assert.strictEqual((await B.t('math', 'setDayTopic', '7-А', 0, dayOf(Date.now() - DAY), '')).topic, '');
  });
  await check('period marks are set by the teacher: semesters, the year, a named topic; renaming a topic moves its marks', async () => {
    assert.strictEqual((await B.t('math', 'setFinalMark', kids[0].id, 'sem1', '9')).grade, '9');
    assert.strictEqual((await B.t('math', 'setFinalMark', kids[0].id, 'th:Дроби', '8')).period, 'th:Дроби');
    await throwsCode('bad_period', B.t('math', 'setFinalMark', kids[0].id, 'quarter', '9'));
    await throwsCode('bad_grade', B.t('math', 'setFinalMark', kids[0].id, 'year', '0'));
    await throwsCode('st_none', Z.t('math', 'setFinalMark', kids[0].id, 'sem1', '5'));   // a student of another school
    let gb = await B.t('math', 'gradebook', '7-А', 0);
    assert.deepStrictEqual(gb.themes, ['th:Дроби']);
    assert.deepStrictEqual(gb.students.find(x => x.id === kids[0].id).finals, { sem1: '9', 'th:Дроби': '8' });
    await B.t('math', 'renameTheme', '7-А', 0, 'th:Дроби', 'th:Звичайні дроби');
    gb = await B.t('math', 'gradebook', '7-А', 0);
    assert.deepStrictEqual(gb.themes, ['th:Звичайні дроби']);
    assert.strictEqual((await B.t('math', 'setFinalMark', kids[0].id, 'sem1', '')).grade, '');
    assert.ok(!(await B.t('math', 'gradebook', '7-А', 0)).students.find(x => x.id === kids[0].id).finals.sem1);
    await B.t('math', 'setFinalMark', kids[0].id, 'sem1', '9');
  });
  await check('the spreadsheet for «Мрія»: days with topics, marks, absences, the average, period marks; Excel-safe; logged', async () => {
    await B.t('math', 'setDayMark', kids[1].id, dayOf(Date.now() - 2 * DAY), '=1+1', '');
    const res = await B.page('/app/journal/math.csv?c=' + encodeURIComponent('7-А') + '&g=0');
    assert.strictEqual(res.status, 200); assert.ok(/text\/csv/.test(res.headers.get('content-type')));
    const buf = Buffer.from(await res.arrayBuffer()), csv = buf.toString('utf8'), rows = csv.replace(/^\ufeff/, '').split('\r\n');
    assert.ok(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf, 'a BOM for Excel');
    assert.ok(rows[0].indexOf('Дроби') >= 0 && rows[0].indexOf('"н";"нп";"Середня"') >= 0 && rows[0].indexOf('"Тематична: Звичайні дроби";"І семестр";"ІІ семестр";"Річна"') >= 0, rows[0]);
    const anya = rows.find(r => r.indexOf('Аня Бойко') >= 0), bohdan = rows.find(r => r.indexOf('Богдан') >= 0);
    assert.ok(anya.endsWith('"";"10";"н";"1";"";"10";"8";"9";"";""'), anya);
    assert.ok(bohdan.indexOf("\"'=1+1\"") >= 0, 'a formula is neutralised: ' + bohdan);
    assert.strictEqual((await client(base).page('/app/journal/math.csv?c=7-А')).status, 302);   // not signed in
    const log = await A.adm('auditLog', {});
    assert.ok(log.rows.some(r => r.action === 'gradebook.export'));
  });
  await check('the student report counts absences per subject', async () => {
    const r = await B.t('math', 'studentReport', kids[0].id);
    assert.deepStrictEqual(r.subjects.find(s => s.key === 'math').absent, { n: 1, np: 0 });
  });

  console.log('\nParents: a code from the school, read-only');
  let CODE;
  await check('off by default: no code can be made; the parent page opens but no code works', async () => {
    assert.strictEqual((await A.adm('parentAccess', SC)).on, false);
    await throwsCode('parents_off', A.adm('issueParentCode', kids[0].id));
    assert.strictEqual((await client(base).page('/parent')).status, 200);
    await throwsCode('parent_code', client(base).req('/api/parent/login', { code: 'ABCD-EFGH-JKLM-NPQR' }));
  });
  await check('the administrator turns it on and makes a code: shown once, 16 characters, only a hash in the database', async () => {
    await throwsCode('forbidden', B.adm('setParentAccess', SC, true));
    assert.strictEqual((await A.adm('setParentAccess', SC, true)).on, true);
    const r = await A.adm('issueParentCode', kids[0].id);
    assert.ok(/^[A-Z2-9]{4}(-[A-Z2-9]{4}){3}$/.test(r.code), r.code); CODE = r.code;
    assert.ok(r.expires > Date.now() + 300 * DAY);
    const row = srv.db.prepare('SELECT * FROM parent_codes WHERE student_id = ?').get(kids[0].id);
    assert.ok(row && row.hash.length === 64 && JSON.stringify(row).indexOf(CODE.replace(/-/g, '')) < 0);
    const st = (await A.adm('listStudents', { school: SC })).students.find(x => x.id === kids[0].id);
    assert.ok(st.parent && st.parent.expires === r.expires);
  });
  let P;
  await check('the parent signs in with the code (any case, dashes or spaces) and sees one child: marks, absences, homework, period marks', async () => {
    P = client(base);
    await P.req('/api/parent/login', { code: ' ' + CODE.toLowerCase().replace(/-/g, ' ') + ' ' });
    const h = await P.req('/api/parent/home', {});
    assert.strictEqual(h.student.name, 'Аня Бойко'); assert.strictEqual(h.student.cls, '7-А');
    const m = h.subjects.find(s => s.key === 'math');
    assert.ok(m.marks.some(x => x.grade === '10') && m.marks.some(x => x.grade === 'н'));
    assert.deepStrictEqual(m.absent, { n: 1, np: 0 }); assert.strictEqual(m.finals.sem1, '9');
    const txt = JSON.stringify(h);
    assert.ok(txt.indexOf('Богдан') < 0, 'no other students'); assert.ok(txt.indexOf(kids[0].login) < 0, 'no login');
    assert.ok(Array.isArray(h.tasks) && Array.isArray(h.announcements));
  });
  await check('help for a signed-in parent: only the parents\' lessons, «back» goes to the parents\' page', async () => {
    const h = await (await P.page('/help')).text();
    const ids = (h.match(/class="card lesson" id="([^"]+)"/g) || []).map(x => x.slice(24, -1));
    assert.deepStrictEqual(ids, ['parent-login', 'parent-view'], ids.join());
    assert.ok(h.indexOf('href="/parent">') > 0);
  });
  await check('the parent cannot use student, teacher or admin calls', async () => {
    await throwsCode('auth', P.req('/api/student/home', {}));
    await throwsCode('auth', P.t('math', 'gradebook', '7-А', 0));
    await throwsCode('auth', P.adm('listStudents', { school: SC }));
  });
  await check('the student sees in «Профіль» that the parents have access', async () => {
    const h = await s1.req('/api/student/home', {});
    assert.ok(h.parent && h.parent.expires > Date.now());
  });
  await check('turning parents off for the school stops the session at once; a new code stops the old one; revoke works', async () => {
    await A.adm('setParentAccess', SC, false);
    await throwsCode('auth', P.req('/api/parent/home', {}));
    await A.adm('setParentAccess', SC, true);
    await P.req('/api/parent/login', { code: CODE });
    const r2 = await A.adm('issueParentCode', kids[0].id);
    await throwsCode('auth', P.req('/api/parent/home', {}));
    await throwsCode('parent_code', client(base).req('/api/parent/login', { code: CODE }));
    await P.req('/api/parent/login', { code: r2.code });
    await A.adm('revokeParentCode', kids[0].id);
    await throwsCode('auth', P.req('/api/parent/home', {}));
    assert.strictEqual((await A.adm('listStudents', { school: SC })).students.find(x => x.id === kids[0].id).parent, null);
  });
  await check('an administrator of another school cannot make a code for this school’s student; a turned-off student cannot be viewed', async () => {
    const adm2 = await A.adm('addTeacher', { name: 'Адмін Два', email: 'adm2@other.ua', school: SC2, role: 'admin' });
    const D = client(base); await D.login('adm2@other.ua', adm2.password); await D.req('/api/auth/password', { old: adm2.password, password: PW + 'y', terms: true, schoolOk: true });
    await throwsCode('forbidden', D.adm('issueParentCode', kids[1].id));
    const r = await A.adm('issueParentCode', kids[1].id);
    const Q = client(base); await Q.req('/api/parent/login', { code: r.code });
    await A.adm('updateStudent', kids[1].id, { active: false });
    await throwsCode('auth', Q.req('/api/parent/home', {}));
    await A.adm('updateStudent', kids[1].id, { active: true });
  });
  await check('wrong codes are limited per address', async () => {
    const X = client(base, '10.9.9.9'); let limited = false;
    for (let i = 0; i < 12; i++) { try { await X.req('/api/parent/login', { code: 'AAAA-BBBB-CCCC-DDD' + (i % 10) }); } catch (e) { if (e.status === 429) { limited = true; break; } } }
    assert.ok(limited);
  });
  await check('deleting the student deletes the codes; the export of the student shows the parent access', async () => {
    const r = await A.adm('issueParentCode', kids[1].id);
    const ex = await A.adm('exportStudent', kids[1].id);
    assert.strictEqual(ex.data.parentAccess.length, 1); assert.ok(JSON.stringify(ex.data).indexOf(r.code.replace(/-/g, '')) < 0);
    assert.ok(Array.isArray(ex.data.finalMarks));
    await A.adm('deleteStudent', kids[1].id, true);
    assert.strictEqual(srv.db.prepare('SELECT COUNT(*) AS n FROM parent_codes WHERE student_id = ?').get(kids[1].id).n, 0);
    assert.strictEqual(srv.db.prepare('SELECT COUNT(*) AS n FROM final_marks WHERE student_id = ?').get(kids[1].id).n, 0);
  });

  console.log('\nThe school’s test bank');
  let T1;
  await check('a teacher shares a test; colleagues of the same school see it with the author, another school does not', async () => {
    const lib = await B.t('math', 'listTests');
    T1 = lib.tests[0]; assert.ok(T1 && T1.shared === false);
    await throwsCode('not_found', C.t('math', 'shareTest', T1.id, true));   // only one's own test
    assert.strictEqual((await B.t('math', 'shareTest', T1.id, true)).shared, true);
    assert.strictEqual((await B.t('math', 'listTests')).tests.find(t => t.id === T1.id).shared, true);
    const bank = await C.t('math', 'schoolBank');
    assert.strictEqual(bank.tests.length, 1); assert.strictEqual(bank.tests[0].author, 'Петро Іваненко');
    assert.ok(JSON.stringify(bank).indexOf(T1.id) < 0, 'the access code is not shown');
    assert.strictEqual((await B.t('math', 'schoolBank')).tests.length, 0);   // not one's own
    assert.strictEqual((await Z.t('math', 'schoolBank')).tests.length, 0);   // another school
    assert.strictEqual((await C.t('physics', 'schoolBank')).tests.length, 0);   // another subject
  });
  await check('a copy is the colleague’s own draft (author in the folder), without any results', async () => {
    const bank = await C.t('math', 'schoolBank');
    const r = await C.t('math', 'copyFromBank', bank.tests[0].bank);
    const lib = await C.t('math', 'listTests'), t = lib.tests.find(x => x.id === r.id);
    assert.ok(t && t.status === 'draft' && t.folder === 'Від колеги: Петро Іваненко' && t.attempts === 0 && t.shared === false);
    assert.strictEqual(t.questions, T1.questions);
    assert.ok((await C.t('math', 'schoolBank')).tests[0].copied);
    await throwsCode('bank_none', Z.t('math', 'copyFromBank', bank.tests[0].bank));
    await B.t('math', 'shareTest', T1.id, false);
    assert.strictEqual((await C.t('math', 'schoolBank')).tests.length, 0);
    await throwsCode('bank_none', C.t('math', 'copyFromBank', bank.tests[0].bank));
  });
  await check('the teacher page has the bank button and the share item', async () => {
    const html = await (await B.page('/app/math')).text();
    assert.ok(html.indexOf('id="bankBtn"') >= 0 && html.indexOf('shareItem') >= 0);
  });

  http.close();
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
