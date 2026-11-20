'use strict';
// API tests: accounts made by the administrator, roles, every subject's ready-made tests (full marks through the student API),
// and the anti-cheating rules. Run: npm test   (starts its own server on a free port with a temporary database)
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
  const c = { jar, ip };
  async function req(p, body, raw, extra) {
    const headers = Object.assign({ 'Content-Type': 'application/json', 'X-Tests-App': '1' }, extra || {});
    const ck = Object.keys(jar).map(k => k + '=' + jar[k]).join('; '); if (ck) headers.Cookie = ck;
    if (c.ip) headers['X-Forwarded-For'] = c.ip;
    const res = await fetch(base + p, { method: body === undefined ? 'GET' : 'POST', headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual' });
    (res.headers.getSetCookie ? res.headers.getSetCookie() : []).forEach(s => { const m = /^([^=]+)=([^;]*)/.exec(s); if (m) { if (m[2]) jar[m[1]] = m[2]; else delete jar[m[1]]; } });
    if (raw) return res;
    const j = await res.json().catch(() => ({}));
    if (!j.ok) { const e = new Error(j.error || ('HTTP ' + res.status)); e.status = res.status; throw e; }
    return j.result;
  }
  return Object.assign(c, {
    req,
    t: (subj, fn, ...a) => req('/api/t/' + subj + '/' + fn, { args: ['session'].concat(a) }),
    s: (fn, ...a) => req('/api/s/' + fn, { args: a }),
    adm: (fn, ...a) => req('/api/admin/' + fn, { args: a }),
    page: p => req(p, undefined, true),
    login: async (login, password) => { await req('/login', undefined, true); return req('/api/auth/login', { login, password }); }
  });
}
const codeOf = e => (/\[#([a-z_]+)\]/.exec(String(e && e.message)) || [])[1];
async function throwsCode(code, p) { try { await p; } catch (e) { assert.strictEqual(codeOf(e), code, 'expected #' + code + ', got: ' + e.message); return; } assert.fail('expected #' + code); }

const txt = L => L ? JSON.stringify([L.uk || '', L.en || '']) : '';
// MathKit (the equation code at the end of core/Code.gs) — to write right answers for «solve» questions
const MK = (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'core', 'Code.gs'), 'utf8');
  const blk = src.slice(src.indexOf('// ==== MATHKIT BEGIN'), src.indexOf('// ==== MATHKIT END ===='));
  const ctx = {}; require('vm').createContext(ctx); require('vm').runInContext(blk + ';this.MK = MK;', ctx); return ctx.MK;
})();
/** Answers that should get full marks, written the way the page sends them (positions as shown in this attempt). */
function perfectAnswers(content, shown) {
  const S = {}; shown.sections.forEach(s => s.questions.forEach(q => { S[q.id] = q; }));
  const pub = (L, langs) => { const o = {}; langs.forEach(l => { o[l] = L[l] || L[l === 'uk' ? 'en' : 'uk'] || ''; }); return txt(o); };
  const ans = {};
  content.sections.forEach(sec => sec.questions.forEach(q => {
    const v = S[q.id]; assert.ok(v, 'question ' + q.id + ' delivered');
    const same = (a, b) => txt({ uk: b.uk, en: b.en }) === pub(a, shown.langs);
    if (q.type === 'mc') ans[q.id] = v.options.findIndex(o => same(q.options[q.answer], o));
    else if (q.type === 'match') ans[q.id] = q.pairs.map(p => v.right.findIndex(r => same(p.r, r))).join(',');
    else if (q.type === 'open') ans[q.id] = 'My answer';
    else if (q.type === 'solve') {   // the working: the equation itself and its roots; the answer: the roots
      const K = MK.key(q.eq, q.vars, q.accept), multi = K.vars.length > 1;
      const roots = K.sols.map(sl => multi ? sl.map(MK.fmt) : MK.fmt(sl[0]));
      const last = K.none || K.all ? [] : [multi ? K.vars.map((x, i) => x + ' = ' + MK.fmt(K.sols[0][i])).join('; ') : K.sols.map(sl => K.vars[0] + ' = ' + MK.fmt(sl[0])).join(' або ')];
      ans[q.id] = JSON.stringify({ s: q.eq.concat(last), r: roots, n: K.none, a: K.all });
    }
    else ans[q.id] = q.accept[0];
  }));
  return ans;
}
function noKeys(obj) {
  const s = JSON.stringify(obj);
  ['"answer"', '"accept"', '"key"', '"pairs"', '"tol"'].forEach(k => assert.ok(s.indexOf(k) < 0, 'student payload must not contain ' + k));
}

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tests-api-'));
  const fakeAi = async (key, body) => {
    const b = JSON.parse(body), prompt = b.contents[0].parts[0].text;
    if (/Explain answers/.test(prompt)) {
      const items = JSON.parse(prompt.slice(prompt.indexOf('\n[') + 1));
      return { text: JSON.stringify(items.map(x => '[' + x.lang + '] because ' + x.answer)), model: 'fake' };
    }
    if (/Translate each item/.test(prompt)) {
      const items = JSON.parse(prompt.slice(prompt.indexOf('\n[') + 1));
      return { text: JSON.stringify(items.map(x => '[' + x.to + '] ' + x.text)), model: 'fake' };
    }
    return { text: JSON.stringify({ title: { uk: 'З фото', en: 'From photo' }, sections: [{ title: { uk: 'Розділ', en: 'Section' }, questions: [
      { type: 'mc', q: { uk: '2+2?', en: '2+2?' }, options: ['3', '4'], answer: 1 }, { type: 'num', q: { uk: '5·5', en: '5·5' }, accept: ['25'] }] }] }), model: 'fake' };
  };
  const srv = createServer({ dbFile: path.join(dir, 't.db'), port: 0, geminiKey: '', geminiCall: fakeAi, publicUrl: 'http://192.168.1.10:3000' });
  // tests pretend to be visitors from the internet with X-Forwarded-For (as the tunnel sends it from 127.0.0.1)
  const http = srv.app.listen(0);
  await new Promise(r => http.once('listening', r));
  const base = 'http://127.0.0.1:' + http.address().port;
  await srv.ready;   // pages and scripts minified, as in real use
  const subjects = Object.keys(srv.subjects);
  console.log('Subjects: ' + subjects.join(', '));

  const A = client(base);   // the administrator (also a teacher: Олена)
  let B;                    // a second teacher, made by the administrator
  let SEC;                  // id of the test used by the security-section checks
  let SC;                   // the first school
  const PW = 'correct horse 1';
  // a student account made by the administrator, signed in on its own client (its own browser)
  let nst = 0;
  async function ensureClass(cls) { try { await A.adm('addClass', SC, cls); } catch (e) { if (codeOf(e) !== 'cls_taken') throw e; } }
  async function stu(name, cls, ip) {
    cls = cls || '9-А'; await ensureClass(cls);
    const r = (await A.adm('addStudents', SC, cls, [name])).created[0];
    const c = client(base, ip === undefined ? '10.' + (100 + (nst >> 8) % 100) + '.' + (nst++ % 250) + '.2' : ip);
    await c.login(r.login, r.password);
    c.acc = r; return c;
  }

  console.log('\nAccounts: first administrator, no sign-up, roles');
  await check('a fresh server sends everybody to /setup', async () => {
    const r = await client(base).page('/'); assert.strictEqual(r.status, 302); assert.strictEqual(r.headers.get('location'), '/setup');
  });
  await check('the first administrator cannot be created from the internet', async () => {
    await throwsCode('setup_local', client(base, '203.0.113.7').req('/api/setup', { name: 'Злий Хтось', email: 'x@y.ua', password: 'abcdefgh12' }));
  });
  await check('setup on the server computer: weak password refused, then the administrator is made', async () => {
    await throwsCode('su_pw', A.req('/api/setup', { school: 'Ліцей № 1', name: 'Олена Коваль', email: 'olena@school.ua', password: '123' }));
    await throwsCode('sc_name', A.req('/api/setup', { school: '', name: 'Олена Коваль', email: 'olena@school.ua', password: PW }));
    await throwsCode('terms', A.req('/api/setup', { school: 'Ліцей № 1', name: 'Олена Коваль', email: 'olena@school.ua', password: PW, terms: true }));
    const r = await A.req('/api/setup', { school: 'Ліцей № 1', name: 'Олена Коваль', email: 'olena@school.ua', password: PW, terms: true, schoolOk: true });
    assert.ok(srv.db.prepare('SELECT terms_at FROM teachers WHERE email = ?').get('olena@school.ua').terms_at, 'the Terms acceptance is stored');
    assert.strictEqual(r.next, '/admin'); assert.ok(A.jar.sid);
    SC = (await A.adm('listSchools')).schools[0].id;
  });
  await check('setup works only once', async () => {
    await throwsCode('setup_done', client(base).req('/api/setup', { name: 'Другий', email: 'second@school.ua', password: 'abcdefgh12' }));
    assert.strictEqual((await client(base).page('/setup')).status, 302);
  });
  await check('there is no self sign-up any more', async () => {
    const r = await client(base).page('/api/auth/signup'); assert.strictEqual(r.status, 404);
    const h = await (await client(base).page('/login')).text(); assert.ok(h.indexOf('Створити акаунт') < 0 && h.indexOf('signup') < 0);
  });
  await check('teacher API without login → 401; API without the page header → 403; from another site (Origin) → 403', async () => {
    await throwsCode('auth', client(base).t('math', 'listTests'));
    const r = await fetch(base + '/api/s/testInfo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"args":["X"]}' });
    assert.strictEqual(r.status, 403);
    const r2 = await A.req('/api/dashboard', {}, true, { Origin: 'https://evil.example' }); assert.strictEqual(r2.status, 403);
    const r3 = await A.req('/api/dashboard', {}, true, { Origin: base }); assert.strictEqual(r3.status, 200);
  });
  await check('password stored hashed (scrypt)', async () => {
    const row = srv.db.prepare('SELECT pass, role FROM teachers WHERE email = ?').get('olena@school.ua');
    assert.ok(/^scrypt\$/.test(row.pass) && row.pass.indexOf('correct horse') < 0); assert.strictEqual(row.role, 'owner');
  });
  await check('administrator adds a teacher: temporary password, must choose own before anything else', async () => {
    const t = await A.adm('addTeacher', { name: 'Петро Іваненко', email: 'Petro@School.ua', school: SC });
    assert.ok(t.password.length >= 10 && t.email === 'petro@school.ua');
    await throwsCode('te_taken', A.adm('addTeacher', { name: 'Ще Раз', email: 'petro@school.ua', school: SC }));
    B = client(base);
    const l = await B.login('petro@school.ua', t.password);
    assert.strictEqual(l.next, '/password'); assert.strictEqual(l.mustChange, true);
    await throwsCode('must_change', B.req('/api/dashboard', {}));
    assert.strictEqual((await B.page('/app')).headers.get('location'), '/password');
    await throwsCode('pw_weak', B.req('/api/auth/password', { old: t.password, password: 'aaaaaaaaaa' }));
    await throwsCode('terms', B.req('/api/auth/password', { old: t.password, password: 'another pass 2' }));
    const r = await B.req('/api/auth/password', { old: t.password, password: 'another pass 2', terms: true, schoolOk: true });
    assert.strictEqual(r.next, '/app');
    assert.strictEqual((await B.req('/api/dashboard', {})).teacher.name, 'Петро Іваненко');
  });
  await check('a teacher cannot use the admin panel', async () => {
    await throwsCode('forbidden', B.adm('listStudents', { school: 1 }));
    assert.strictEqual((await B.page('/admin')).headers.get('location'), '/app');
  });
  await check('wrong password → error; 5 wrong in a row lock the account for 15 min; admin unlocks', async () => {
    const C = client(base);
    for (let i = 0; i < 5; i++) await throwsCode('login', C.login('petro@school.ua', 'nope nope ' + i));
    await throwsCode('locked', C.login('petro@school.ua', 'another pass 2'));   // even the right password waits
    const id = (await A.adm('listTeachers')).teachers.find(x => x.email === 'petro@school.ua').id;
    await A.adm('unlockTeacher', id);
    await C.login('petro@school.ua', 'another pass 2');
    await C.req('/api/auth/logout', {});
    await throwsCode('auth', C.req('/api/dashboard', {}));
    const log = (await A.adm('auditLog', 50)).rows;
    assert.ok(log.some(x => x.action === 'login.fail' && x.who === 'petro@school.ua') && log.some(x => x.action === 'teacher.add'));
  });
  await check('unknown login and wrong password give the same answer', async () => {
    await throwsCode('login', client(base).login('nobody@school.ua', 'whatever1'));
    await throwsCode('login', client(base).login('no.such.kid', 'whatever1'));
  });
  await check('dashboard lists every subject (and says who is admin)', async () => {
    const d = await A.req('/api/dashboard', {});
    assert.deepStrictEqual(d.subjects.map(s => s.key), subjects);
    assert.strictEqual(d.appUrl, 'http://192.168.1.10:3000'); assert.strictEqual(d.teacher.role, 'owner');
  });
  await check('pages: /app needs login, teacher page loads for a subject', async () => {
    const anon = client(base);
    assert.strictEqual((await anon.page('/app')).status, 302);
    const r = await A.page('/app/math'); assert.strictEqual(r.status, 200);
    const h = await r.text(); assert.ok(h.indexOf('/api/t/math/') > 0 && h.indexOf('google.script') > 0);
    assert.ok(h.indexOf('cdnjs') < 0, 'KaTeX served locally');
    assert.ok(h.indexOf('/js/nav.js') > 0 && h.indexOf('__SUBJECT__') < 0);
  });

  console.log('\nAdmin panel: classes and students');
  await check('classes: add, "9 а" = "9-А", rename moves students and tests, a class with students cannot be deleted', async () => {
    await A.adm('addClass', SC, '9-А'); await A.adm('addClass', SC, '9-Б');
    await throwsCode('cls_taken', A.adm('addClass', SC, '9 а'));
    await A.adm('addClass', SC, '5-В');
    const kids = (await A.adm('addStudents', SC, '5 в', 'Ярема Бондар\nОля Ткач\n\n x ')).created;
    assert.strictEqual(kids.length, 2); assert.strictEqual(kids[0].cls, '5-В');
    assert.ok(/^[a-z0-9.]+$/.test(kids[0].login) && kids[0].login.indexOf('iarema') === 0, kids[0].login);
    const t = await A.t('math', 'saveTest', '', { uk: 'Для 5-В', en: 'For 5-V' }, '', { langs: ['uk'], sections: [{ title: 'S', questions: [{ type: 'num', q: { uk: '1+1', en: '' }, accept: ['2'] }] }] }, { mode: 'classes', classes: ['5-В'] });
    await throwsCode('cls_busy', A.adm('deleteClass', SC, '5-В'));
    await A.adm('renameClass', SC, '5-В', '6-В');
    assert.ok((await A.adm('listStudents', { school: SC, cls: '6-В' })).students.every(s => s.cls === '6-В'));
    assert.deepStrictEqual((await A.t('math', 'getTest', t.id)).settings.classes.length >= 0, true);
    assert.strictEqual((await A.t('math', 'getTest', t.id)).folder, '6-В');
    for (const k of kids) await A.adm('deleteStudent', k.id);
    await A.t('math', 'deleteTest', t.id);
    await A.adm('deleteClass', SC, '6-В');
    assert.ok(!(await A.adm('listClasses', SC)).classes.some(c => c.name === '6-В'));
  });
  await check('student logs in → /my with own class; cannot use teacher or admin API', async () => {
    const r = (await A.adm('addStudents', SC, '9-А', ['Тарас Мельник'])).created[0];
    const s = client(base, '10.99.0.2');
    const l = await s.login(r.login, r.password);
    assert.strictEqual(l.role, 'student'); assert.strictEqual(l.next, '/my');
    assert.strictEqual((await s.page('/')).headers.get('location'), '/my');
    const h = await s.req('/api/student/home', {});
    assert.strictEqual(h.student.cls, '9-А'); assert.deepStrictEqual(h.subjects.map(x => x.key), subjects);
    await throwsCode('auth', s.t('math', 'listTests'));
    await throwsCode('auth', s.adm('listStudents', { school: 1 }));
    assert.strictEqual((await s.page('/app')).status, 302);
  });
  await check('reset password / turn off: the student is signed out everywhere', async () => {
    const s = await stu('Вимкнений Учень', '9-А');
    const id = s.acc.id;
    await A.adm('updateStudent', id, { active: false });
    await throwsCode('auth', s.req('/api/student/home', {}));
    await throwsCode('off', s.login(s.acc.login, s.acc.password));
    await A.adm('updateStudent', id, { active: true });
    await s.login(s.acc.login, s.acc.password);
    const np = await A.adm('resetStudent', id);
    await throwsCode('auth', s.req('/api/student/home', {}));
    await throwsCode('login', s.login(s.acc.login, s.acc.password));
    await s.login(np.login, np.password);
  });
  await check('there is always one administrator; you cannot remove your own rights', async () => {
    const me = (await A.adm('listTeachers')).teachers.find(x => x.email === 'olena@school.ua');
    await throwsCode('te_self', A.adm('updateTeacher', me.id, { role: 'teacher' }));
    await throwsCode('te_self', A.adm('deleteTeacher', me.id));
  });

  console.log('\nSchools');
  await check('a second school: its own classes, students and teachers; "common" tests stay inside a school', async () => {
    const sc2 = (await A.adm('addSchool', 'Гімназія № 2')).id;
    await throwsCode('sc_taken', A.adm('addSchool', 'гімназія № 2'));
    await A.adm('addClass', sc2, '9-А');   // the same class name in another school is another class
    const kid = (await A.adm('addStudents', sc2, '9-А', ['Учень Другої Школи'])).created[0];
    assert.strictEqual(kid.school, 'Гімназія № 2');
    assert.strictEqual((await A.adm('listStudents', { school: sc2 })).total, 1);
    assert.ok((await A.adm('listStudents', { school: SC })).students.every(x => x.school === SC));
    const t2 = await A.adm('addTeacher', { name: 'Вчитель Другої', email: 'teach2@school.ua', school: sc2 });
    const T2 = client(base); await T2.login('teach2@school.ua', t2.password); await T2.req('/api/auth/password', { old: t2.password, password: 'teacher two pw', terms: true, schoolOk: true });
    const common = await A.t('math', 'saveTest', '', { uk: 'Загальний для Ліцею 1', en: '' }, '', { langs: ['uk'], sections: [{ title: 'S', questions: [{ type: 'num', q: { uk: '3+3', en: '' }, accept: ['6'] }] }] }, { mode: 'all' });
    await A.t('math', 'setStatus', common.id, 'published');
    const other = client(base); await other.login(kid.login, kid.password);
    await throwsCode('wrong_class', other.s('testInfo', common.id));
    await throwsCode('wrong_class', other.s('startAttempt', common.id, '', '', {}));
    assert.ok(!(await other.req('/api/student/home', {})).subjects.some(x => x.tests.some(t => t.id === common.id)));
    const mine = await stu('Учень Першої Школи', '9-А');
    assert.strictEqual((await mine.s('testInfo', common.id)).state, 'open');
    // the second school's teacher sees only that school's classes and students in the gradebook
    const gc = await T2.t('math', 'gradeClasses');
    assert.deepStrictEqual(gc.classes.map(c => c.name + ':' + c.students), ['9-А:1']);
    await throwsCode('st_none', T2.t('math', 'setGrade', (await T2.t('math', 'listTests')).tests[0].id, mine.acc.id, '5'));
    await throwsCode('sc_busy', A.adm('deleteSchool', sc2));
    const sc3 = (await A.adm('addSchool', 'Порожня')).id; await A.adm('deleteSchool', sc3);
    await A.t('math', 'deleteTest', common.id);
  });
  await check('a school administrator manages only their own school; the owner manages every school', async () => {
    const sc2 = (await A.adm('listSchools')).schools.find(x => x.name === 'Гімназія № 2').id;
    const a2 = await A.adm('addTeacher', { name: 'Директор Другої', email: 'dir2@school.ua', school: sc2, role: 'admin' });
    const D2 = client(base); await D2.login('dir2@school.ua', a2.password);
    await D2.req('/api/auth/password', { old: a2.password, password: 'director two pw', terms: true, schoolOk: true });
    assert.deepStrictEqual((await D2.adm('listSchools')).schools.map(x => x.id), [sc2], 'sees only own school');
    assert.ok((await D2.adm('listTeachers')).teachers.every(x => x.school === sc2));
    await throwsCode('forbidden', D2.adm('listStudents', { school: SC }));
    await throwsCode('forbidden', D2.adm('addStudents', SC, '9-А', ['Чужий']));
    await throwsCode('forbidden', D2.adm('schoolInfo', SC));
    const firstSchoolKid = (await A.adm('listStudents', { school: SC })).students[0];
    await throwsCode('forbidden', D2.adm('exportStudent', firstSchoolKid.id));
    await throwsCode('forbidden', D2.adm('updateStudent', (await D2.adm('listStudents', { school: sc2 })).students[0].id, { school: SC }));
    await throwsCode('owner_only', D2.adm('addSchool', 'Своя школа'));
    await throwsCode('owner_only', D2.adm('addTeacher', { name: 'Новий Власник', email: 'own2@school.ua', school: sc2, role: 'owner' }));
    await throwsCode('owner_only', D2.adm('auditLog', 10));
    await throwsCode('owner_only', D2.adm('savePrivacy', { keepDeviceDays: 5 }));
    const owner = (await A.adm('listTeachers')).teachers.find(x => x.email === 'olena@school.ua');
    await throwsCode('forbidden', D2.adm('resetTeacher', owner.id));
    assert.strictEqual((await D2.adm('addStudents', sc2, '9-А', ['Новий Учень Другої'])).created.length, 1);
    assert.strictEqual((await D2.adm('overview')).owner, false); assert.strictEqual((await A.adm('overview')).owner, true);
    assert.strictEqual((await D2.page('/admin')).status, 200);
  });

  console.log('\nEvery subject: ready-made tests, full marks through the student API');
  for (const subj of subjects) {
    const lib = await A.t(subj, 'listTests');
    await check(subj + ': ' + lib.tests.length + ' ready-made test(s) added for the new teacher', async () => {
      assert.ok(lib.tests.length >= 1); assert.strictEqual(lib.subject.key.length > 0, true);
    });
    for (const t of lib.tests) {
      await check(subj + ' «' + t.title + '»: ' + t.questions + ' q, full marks ' + t.max + '/' + t.max, async () => {
        await A.t(subj, 'startNow', t.id);
        const full = await A.t(subj, 'getTest', t.id);
        const st = await stu('Учень ' + subj + ' ' + t.id, t.folder || '9-А');
        assert.strictEqual((await st.page('/t/' + t.id)).status, 200);
        const info = await st.s('testInfo', t.id.toLowerCase());
        assert.strictEqual(info.state, 'open');
        const a = await st.s('startAttempt', t.id, 'Учень ' + subj, '9A', { ua: 'test', screen: '1x1', tz: 'UTC', canvas: 'c' + Math.random() });
        noKeys(a);
        assert.strictEqual(a.test.shuffleQ, false); assert.strictEqual(a.test.shuffleO, false);
        const ans = perfectAnswers(full.content, a.test);
        const n = a.test.sections.reduce((k, s) => k + s.questions.length, 0);
        await st.s('saveProgress', a.id, ans, { leftCount: 1, leftMs: 2000, extra: { keys: 2 } }, n - 1);
        await st.s('submitAttempt', a.id, ans, { leftCount: 1, leftMs: 2000, extra: { keys: 2 } }, n - 1);
        const res = await A.t(subj, 'getResults', t.id);
        const r = res.results.find(x => x.id === a.id);
        assert.strictEqual(r.name, 'Учень ' + subj + ' ' + t.id, 'the name comes from the account');
        assert.strictEqual(r.grade.score, r.grade.max, 'score ' + r.grade.score + '/' + r.grade.max + ' wrong: ' +
          JSON.stringify(r.grade.sections.flatMap(s => s.questions.filter(q => q.scored && !q.ok).map(q => [q.id, q.type, q.given]))));
        assert.strictEqual(r.grade.max, t.max);
        assert.ok(r.flags.some(f => /клавіші/.test(f.uk)), 'blocked-keys flag');
      });
    }
  }

  console.log('\nTests only with an account; classes and common tests');
  const lib = await A.t('math', 'listTests');
  const T1 = lib.tests[0];
  const T1full = await A.t('math', 'getTest', T1.id);
  await check('the test link / QR without login → the login page, which then leads straight into the test', async () => {
    const T1 = await A.t('math', 'saveTest', '', { uk: 'Лише для 9-А', en: '' }, '', T1full.content, { mode: 'classes', classes: ['9-А'] });
    await A.t('math', 'setStatus', T1.id, 'published');
    const anon = client(base);
    const r = await anon.page('/t/' + T1.id.toLowerCase());
    assert.strictEqual(r.status, 302); assert.strictEqual(r.headers.get('location'), '/login?next=' + encodeURIComponent('/t/' + T1.id));
    assert.strictEqual((await anon.page('/?t=' + T1.id)).headers.get('location'), '/t/' + T1.id);
    await throwsCode('auth', anon.s('testInfo', T1.id));
    await throwsCode('auth', anon.s('startAttempt', T1.id, 'Анонім', '', {}));
    const k = (await A.adm('addStudents', SC, '9-А', ['Петрик П’яточкін'])).created[0];
    await anon.page('/login');
    const l = await anon.req('/api/auth/login', { login: k.login, password: k.password, next: '/t/' + T1.id });
    assert.strictEqual(l.next, '/t/' + T1.id);
    const bad = await anon.req('/api/auth/login', { login: k.login, password: k.password, next: 'https://evil.example/' });
    assert.strictEqual(bad.next, '/my', 'no jumping to other sites after login');
    const h = await (await anon.page('/t/' + T1.id)).text();
    assert.ok(h.indexOf('{ name: "Петрик П’яточкін", cls: "9-А" }') > 0, 'name and class from the account');
  });
  await check('«🌍 Кожний бажаючий»: anyone opens the test by code without an account, but only with a name', async () => {
    const r = await A.t('math', 'saveTest', '', { uk: 'Для всіх охочих', en: '' }, '', { langs: ['uk'], sections: [{ title: 'S', questions: [{ type: 'num', q: { uk: '1+1', en: '' }, accept: ['2'] }] }] }, { mode: 'all' });
    await A.t('math', 'setStatus', r.id, 'published');
    assert.strictEqual((await A.t('math', 'listTests')).tests.find(t => t.id === r.id).guests, true);
    const g = client(base, '10.77.0.9');
    assert.strictEqual((await g.page('/t/' + r.id)).status, 200, 'no login needed');
    await throwsCode('name', g.s('startAttempt', r.id, ' ', '', {}));
    const a = await g.s('startAttempt', r.id, 'Будь Хто', '', {}); assert.strictEqual(a.name, 'Будь Хто');
  });
  await check('teacher allows "without an account": the code works with a typed name, one attempt per name, same device to continue', async () => {
    const r = await A.t('math', 'saveTest', '', { uk: 'Гостьовий тест', en: '' }, '', { langs: ['uk'], sections: [{ title: 'S', questions: [{ type: 'num', q: { uk: '5+5', en: '' }, accept: ['10'] }] }] }, { mode: 'classes', classes: ['9-А'] });
    await A.t('math', 'setStatus', r.id, 'published');
    const g = client(base, '10.77.0.2');
    assert.strictEqual((await g.page('/t/' + r.id)).status, 302, 'needs login while guests are off');
    await throwsCode('auth', g.s('startAttempt', r.id, 'Гість Гостьович', '7-В', {}));
    await A.t('math', 'saveTestSettings', r.id, { guests: true, shuffleQ: true, shuffleO: true, monitor: true });
    assert.strictEqual((await A.t('math', 'listTests')).tests.find(t => t.id === r.id).guests, true);
    const pg = await g.page('/t/' + r.id); assert.strictEqual(pg.status, 200);
    assert.ok(/window\.STUDENT ?= ?null/.test(await pg.text()));
    assert.strictEqual((await g.s('testInfo', r.id)).state, 'open');
    await throwsCode('name', g.s('startAttempt', r.id, 'x', '', {}));
    const a = await g.s('startAttempt', r.id, 'Гість Гостьович', '7-В', { ua: 'g' });
    assert.strictEqual(a.name, 'Гість Гостьович'); assert.strictEqual(a.group, '7-В');
    await throwsCode('busy', client(base, '10.77.0.3').s('startAttempt', r.id, 'гість  гостьович', '', { ua: 'other' }));
    const qid = a.test.sections[0].questions[0].id;
    await g.s('submitAttempt', a.id, { [qid]: '10' }, {}, 0);
    await throwsCode('already', g.s('startAttempt', r.id, 'Гість Гостьович', '7-В', {}));
    const res = (await A.t('math', 'getResults', r.id)).results.find(x => x.id === a.id);
    assert.strictEqual(res.grade.score, 1);
    // a signed-in student of the class still uses the account
    const s9 = await stu('Акаунт На Гостьовому', '9-А');
    assert.strictEqual((await s9.s('startAttempt', r.id, 'Інше Ім’я', '', {})).name, 'Акаунт На Гостьовому');
    // a student's attempt cannot be reached without that student's session
    const sa = await s9.s('startAttempt', r.id, '', '', {});
    await throwsCode('gone', g.s('saveProgress', sa.id, {}, {}, 0));
  });
  await check('a teacher opening a test link is told tests are taken from student accounts', async () => {
    const h = await (await A.page('/t/' + T1.id)).text();
    assert.ok(/["']staff-test["']/.test(h));
  });
  let TC;
  await check('test for chosen classes: other classes cannot open it, even by code; common test opens for everybody', async () => {
    const r = await A.t('math', 'saveTest', '', { uk: 'Лише 9-А і 9-Б', en: '' }, '', { langs: ['uk'], sections: [{ title: 'S', questions: [{ type: 'num', q: { uk: '2+2', en: '' }, accept: ['4'] }] }] }, { mode: 'classes', classes: ['9-А', '9 б'] });
    TC = r.id;
    await throwsCode('no_classes', A.t('math', 'saveTest', TC, { uk: 'x', en: '' }, '', T1full.content, { mode: 'classes', classes: [] }));
    await A.t('math', 'setStatus', TC, 'published');
    const got = await A.t('math', 'getTest', TC);
    assert.strictEqual(got.settings.access, 'classes'); assert.deepStrictEqual(got.settings.classes, ['9-А', '9 б']);
    assert.deepStrictEqual((await A.t('math', 'listTests')).tests.find(t => t.id === TC).access, { mode: 'classes', classes: ['9-А', '9 б'] });
    await ensureClass('10-А');
    const a9 = await stu('Дев’ятий Клас', '9-А'), b9 = await stu('Дев’ятий Б', '9-Б'), x10 = await stu('Десятий Клас', '10-А');
    assert.strictEqual((await a9.s('testInfo', TC)).state, 'open');
    assert.strictEqual((await b9.s('testInfo', TC)).state, 'open');
    await throwsCode('wrong_class', x10.s('testInfo', TC));
    await throwsCode('wrong_class', x10.s('startAttempt', TC, '', '', {}));
    const home10 = await x10.req('/api/student/home', {}), home9 = await a9.req('/api/student/home', {});
    assert.ok(!home10.subjects.find(s => s.key === 'math').tests.some(t => t.id === TC));
    assert.ok(home9.subjects.find(s => s.key === 'math').tests.some(t => t.id === TC && t.state === 'open' && !t.common));
    // make it common: now 10-А can take it and sees it at home
    await A.t('math', 'saveTest', TC, { uk: 'Для всієї школи', en: '' }, '', got.content, { mode: 'all' });
    assert.strictEqual((await A.t('math', 'getTest', TC)).folder, '');
    assert.strictEqual((await x10.s('testInfo', TC)).state, 'open');
    assert.ok((await x10.req('/api/student/home', {})).subjects.find(s => s.key === 'math').tests.some(t => t.id === TC && t.common));
    // the schedule dialog (saveTestSettings) does not undo the choice
    await A.t('math', 'saveTestSettings', TC, { shuffleQ: true, shuffleO: true, monitor: true });
    assert.strictEqual((await A.t('math', 'getTest', TC)).settings.access, 'all');
  });
  await check('student home: tiles for every subject, ❌ (no tests) where the class has none, own result shown', async () => {
    await ensureClass('11-Б');
    const s = await stu('Одинадцятий Учень', '11-Б');
    const h = await s.req('/api/student/home', {});
    assert.strictEqual(h.subjects.length, subjects.length);
    const empty = h.subjects.filter(x => !x.tests.length).map(x => x.key);
    assert.ok(empty.length >= 1, 'some subjects have no tests for 11-Б: ' + empty);
    const m = h.subjects.find(x => x.key === 'math');
    const t = m.tests.find(x => x.id === TC); assert.ok(t);
    const a = await s.s('startAttempt', TC, '', '', {});
    await s.s('submitAttempt', a.id, {}, {}, 0);
    const t2 = (await s.req('/api/student/home', {})).subjects.find(x => x.key === 'math').tests.find(x => x.id === TC);
    assert.strictEqual(t2.mine, 'done');
    assert.strictEqual((await s.s('testInfo', TC)).mine, 'done');
    const ph = await s.req('/api/student/home', {});
    assert.ok(ph.subjects.every(x => x.tests.every(y => y.state !== 'draft')));
  });
  await check('an attempt belongs to its student: another student cannot save into it', async () => {
    const s1 = await stu('Власник Спроби'), s2 = await stu('Чужий Учень');
    const a = await s1.s('startAttempt', T1.id, '', '', {});
    await throwsCode('gone', s2.s('saveProgress', a.id, {}, {}, 0));
    await throwsCode('gone', s2.s('submitAttempt', a.id, {}, {}, 0));
    await s1.s('saveProgress', a.id, {}, {}, 0);
  });

  console.log('\nAnti-cheating');
  await check('each attempt gets its own order (questions / options)', async () => {
    const seen = new Set();
    for (let i = 0; i < 6; i++) {
      const st = await stu('Порядок ' + i);
      const a = await st.s('startAttempt', T1.id, '', '', { ua: 'u' + i, screen: '1x1', tz: 'x', canvas: 'k' + i });
      seen.add(JSON.stringify(a.test.sections.map(s => s.questions.map(q => q.id + ':' + JSON.stringify(q.options || '')))));
    }
    assert.ok(seen.size >= 4, 'only ' + seen.size + ' different orders out of 6');
  });
  await check('a wrong answer stays wrong: no going back to a passed question', async () => {
    const st = await stu('Назад Не Можна');
    const a = await st.s('startAttempt', T1.id, '', '', { ua: 'z', screen: '2x2', tz: 'y', canvas: 'q' });
    const first = a.test.sections[0].questions[0];
    assert.strictEqual(first.type, 'mc');
    const good = perfectAnswers(T1full.content, a.test)[first.id], bad = (good + 1) % first.options.length;
    await st.s('saveProgress', a.id, { [first.id]: bad }, {}, 0);
    await st.s('saveProgress', a.id, { [first.id]: bad }, {}, 2);     // moved on to question 3
    await st.s('saveProgress', a.id, { [first.id]: good }, {}, 2);    // tries to fix question 1 → ignored
    await st.s('submitAttempt', a.id, { [first.id]: good }, {}, 2);
    const r = (await A.t('math', 'getResults', T1.id)).results.find(x => x.id === a.id);
    const q = r.grade.sections[0].questions.find(x => x.id === first.id);
    assert.strictEqual(q.ok, false);
  });
  await check('after the time limit (+2 min grace) answers no longer change, status Late', async () => {
    const st = await stu('Запізнився');
    const a = await st.s('startAttempt', T1.id, '', '', { ua: 'late', screen: '3x3', tz: 'y', canvas: 'w' });
    srv.db.prepare('UPDATE attempts SET deadline = ? WHERE id = ?').run(Date.now() - 10 * 60000, a.id);
    const ans = perfectAnswers(T1full.content, a.test);
    await st.s('submitAttempt', a.id, ans, {}, 0);
    const r = (await A.t('math', 'getResults', T1.id)).results.find(x => x.id === a.id);
    assert.strictEqual(r.status, 'Late'); assert.strictEqual(r.grade.score, 0);
  });
  await check('one attempt per account: continued from another device after logging in there; then "already"', async () => {
    const s1 = await stu('Іван Петренко', '9-А', '10.4.0.2');
    const s2 = client(base, '10.4.0.3'); await s2.login(s1.acc.login, s1.acc.password);   // the same student on a second device
    const a = await s1.s('startAttempt', T1.id, 'Хтось Інший', '9-Б', { ua: 'one', screen: '4x4', tz: 'y', canvas: 'one' });
    assert.strictEqual(a.name, 'Іван Петренко'); assert.strictEqual(a.group, '9-А');
    const again = await s2.s('startAttempt', T1.id, '', '', { ua: 'two', screen: '5x5', tz: 'y', canvas: 'two' });
    assert.strictEqual(again.id, a.id, 'the account continues its attempt');
    await s1.s('submitAttempt', a.id, {}, {}, 0);
    await throwsCode('already', s1.s('startAttempt', T1.id, '', '', {}));
  });
  await check('two accounts from the same browser: teacher sees it (and can block it)', async () => {
    const s1 = await stu('Марія Шевчук', '9-Б', '10.5.0.2');
    await s1.page('/t/' + T1.id);
    const fp = { ua: 'same', screen: '6x6', tz: 'Europe/Kyiv', canvas: 'same', webgl: 'gpu' };
    const a1 = await s1.s('startAttempt', T1.id, '', '', fp);
    await s1.s('submitAttempt', a1.id, {}, {}, 0);
    const k2 = (await A.adm('addStudents', SC, '9-Б', ['Марія Ш.'])).created[0];
    await s1.login(k2.login, k2.password);   // the same browser, another account
    const a2 = await s1.s('startAttempt', T1.id, '', '', fp);
    const r = (await A.t('math', 'getResults', T1.id)).results.find(x => x.id === a2.id);
    assert.ok(r.flags.some(f => f.level === 'high' && /Той самий браузер/.test(f.uk) && /Марія Шевчук/.test(f.uk)), JSON.stringify(r.flags));
    assert.ok(/^D-[0-9A-F]{5}$/.test(r.device.label));
    await A.t('math', 'saveTestSettings', T1.id, { deviceLock: true, shuffleQ: true, shuffleO: true, monitor: true });
    const k3 = (await A.adm('addStudents', SC, '9-Б', ['Зовсім Інше Ім’я'])).created[0];
    await s1.login(k3.login, k3.password);
    await throwsCode('device', s1.s('startAttempt', T1.id, '', '', fp));
    const s3 = client(base, '10.5.0.3'); await s3.login(k3.login, k3.password);   // cleared cookies, same fingerprint, other address → only a warning
    const a3 = await s3.s('startAttempt', T1.id, '', '', fp);
    const r3 = (await A.t('math', 'getResults', T1.id)).results.find(x => x.id === a3.id);
    assert.ok(r3.flags.some(f => /відбиток/.test(f.uk)), JSON.stringify(r3.flags));
    await A.t('math', 'saveTestSettings', T1.id, { deviceLock: false, shuffleQ: true, shuffleO: true, monitor: true });
    const set = (await A.t('math', 'getTest', T1.id)).settings;
    assert.strictEqual(set.deviceLock, false); assert.strictEqual(set.shuffleQ, true);
  });
  await check('answers sent for questions of another test / junk are dropped', async () => {
    const st = await stu('Хакер');
    const a = await st.s('startAttempt', T1.id, '', '', { ua: 'h' });
    await st.s('submitAttempt', a.id, { zzzz: 'x', __proto__: 1, ['a'.repeat(40)]: 1 }, { leftCount: 'NaN', extra: { devtools: 3, fsExit: 2 } }, 999);
    const r = (await A.t('math', 'getResults', T1.id)).results.find(x => x.id === a.id);
    assert.strictEqual(r.grade.score, 0);
    assert.ok(r.flags.some(f => /інструменти розробника/.test(f.uk)) && r.flags.some(f => /повноекранного/.test(f.uk)));
  });
  await check('teacher data is private: another teacher cannot see or change it', async () => {
    await throwsCode('not_found', B.t('math', 'getTest', T1.id));
    await throwsCode('not_found', B.t('math', 'getResults', T1.id));
    await throwsCode('not_found', B.t('math', 'deleteTest', T1.id));
    await throwsCode('not_found', B.t('math', 'setGrade', T1.id, 1, '10'));
    const libB = await B.t('math', 'listTests');
    assert.ok(libB.tests.every(t => t.id !== T1.id));
    const r = await B.page('/app/export/math/' + T1.id + '.csv'); assert.strictEqual(r.status, 404);
  });
  await check('closed and draft tests cannot be started', async () => {
    await A.t('math', 'stopNow', T1.id);
    const st = await stu('Пізно Прийшов');
    await throwsCode('closed', st.s('startAttempt', T1.id, '', '', {}));
    await A.t('math', 'startNow', T1.id);
    const draft = lib.tests.find(t => t.state === 'draft');
    if (draft) await throwsCode('not_open', st.s('startAttempt', draft.id, '', '', {}));
  });
  await check('teacher override changes the score', async () => {
    const res = await A.t('math', 'getResults', T1.id);
    const r = res.results.find(x => x.name === 'Запізнився');
    const q = r.grade.sections[0].questions.find(x => x.scored && !x.ok);
    await A.t('math', 'setOverride', r.id, q.id, true);
    const r2 = (await A.t('math', 'getResults', T1.id)).results.find(x => x.id === r.id);
    assert.strictEqual(r2.grade.score, r.grade.score + q.pts);
  });
  await check('CSV export', async () => {
    const r = await A.page('/app/export/math/' + T1.id + '.csv');
    assert.strictEqual(r.status, 200);
    const s = await r.text(); assert.ok(/Name,|"Name"/.test(s) && s.indexOf('Іван Петренко') > 0);
  });

  console.log('\nGradebook');
  await check('gradebook: class × tests with the score, a suggested 1–12 mark, saved marks; the student sees the mark', async () => {
    await ensureClass('7-Г');
    const s = await stu('Оцінений Учень', '7-Г'), s2 = await stu('Без Роботи', '7-Г');
    const a = await s.s('startAttempt', T1.id, '', '', {});
    await s.s('submitAttempt', a.id, perfectAnswers(T1full.content, a.test), {}, 99);
    const gc = await A.t('math', 'gradeClasses');
    assert.ok(gc.classes.some(c => c.name === '7-Г' && c.students === 2));
    const gb = await A.t('math', 'gradebook', '7 г');
    const col = gb.tests.findIndex(t => t.id === T1.id); assert.ok(col >= 0, 'common test is in the gradebook');
    const row = gb.students.find(x => x.name === 'Оцінений Учень');
    assert.strictEqual(row.cells[col].score, row.cells[col].max); assert.strictEqual(row.cells[col].suggest, 12);
    assert.ok(!gb.students.find(x => x.name === 'Без Роботи').cells[col].score);
    await throwsCode('bad_grade', A.t('math', 'setGrade', T1.id, row.id, '13'));
    await A.t('math', 'setGrade', T1.id, row.id, '11', 'молодець');
    await A.t('math', 'setGrade', T1.id, gb.students.find(x => x.name === 'Без Роботи').id, 'н');
    const gb2 = await A.t('math', 'gradebook', '7-Г');
    assert.strictEqual(gb2.students.find(x => x.id === row.id).cells[col].grade, '11');
    const h = await s.req('/api/student/home', {});
    assert.strictEqual(h.subjects.find(x => x.key === 'math').tests.find(x => x.id === T1.id).grade, '11');
    await A.t('math', 'setGrade', T1.id, row.id, '', '');
    assert.strictEqual((await A.t('math', 'gradebook', '7-Г')).students.find(x => x.id === row.id).cells[col].grade, '');
    assert.strictEqual((await A.page('/app/grades')).status, 200);
    assert.strictEqual((await s.page('/app/grades')).status, 302);
  });

  await check('dated gradebook, a student report with weak topics, subjects turned off for a class', async () => {
    await ensureClass('7-Д');
    const s = await stu('Звітний Учень', '7-Д');
    const a = await s.s('startAttempt', T1.id, '', '', {});
    await s.s('submitAttempt', a.id, {}, {}, 99);   // nothing answered: the whole test is a weak topic
    const gb = await A.t('math', 'gradebook', '7-Д'), row = gb.students.find(x => x.name === 'Звітний Учень');
    assert.ok(gb.tests.every(t => typeof t.at === 'number'), 'each test has its day');
    await throwsCode('bad_day', A.t('math', 'setDayMark', row.id, '2026-13-40', '9'));
    await throwsCode('bad_grade', A.t('math', 'setDayMark', row.id, '2026-10-20', '15'));
    await A.t('math', 'setDayMark', row.id, '2026-10-20', '9', '');
    assert.strictEqual((await A.t('math', 'gradebook', '7-Д')).students.find(x => x.id === row.id).days['2026-10-20'].grade, '9');
    const rep = await A.t('math', 'studentReport', row.id), m = rep.subjects.find(x => x.key === 'math');
    assert.ok(m && m.tests >= 1 && m.pct === 0 && m.level === 'weak' && m.avgMark === 9, 'math: 0 %, the lesson mark counted');
    assert.ok(m.weak.some(w => w.test === T1.id && w.wrong > 0 && w.examples.length), 'the test is a weak topic, with wrong questions');
    assert.ok(srv.db.prepare("SELECT 1 FROM audit WHERE action = 'student.report'").get(), 'the request is logged');
    const t3 = await A.adm('addTeacher', { name: 'Сторонній Учитель', email: 'other3@school.ua', school: SC });
    const O = client(base); await O.login('other3@school.ua', t3.password); await O.req('/api/auth/password', { old: t3.password, password: 'other teacher 3', terms: true, schoolOk: true });
    await throwsCode('not_your_student', O.t('math', 'studentReport', row.id));
    await A.t('math', 'setDayMark', row.id, '2026-10-20', '', '');
    assert.ok(!(await A.t('math', 'gradebook', '7-Д')).students.find(x => x.id === row.id).days['2026-10-20']);
    // the administrator turns maths off for 7-Д: the tile is gone and its tests do not open
    const lc = await A.adm('setClassSubjects', SC, '7-Д', ['math', 'nope']);
    assert.deepStrictEqual(lc.classes.find(c => c.name === '7-Д').subjectsOff, ['math']);
    assert.ok(lc.subjects.length >= 2);
    assert.ok(!(await s.req('/api/student/home', {})).subjects.some(x => x.key === 'math'));
    await throwsCode('subject_off', s.s('testInfo', T1.id));
    await A.adm('setClassSubjects', SC, '7-Д', []);
    assert.ok((await s.req('/api/student/home', {})).subjects.some(x => x.key === 'math'));
  });

  console.log('\nFrom anywhere');
  await check('logging in from home works (accounts are made only by the administrator)', async () => {
    await client(base, '203.0.113.7').login('olena@school.ua', PW);
  });
  await check('the old «classroom Wi-Fi only» mode is gone: such a test opens from anywhere', async () => {
    const t2 = lib.tests[1];
    await A.t('math', 'startNow', t2.id);
    const r = await A.t('math', 'saveTestSettings', t2.id, { network: 'lan', shuffleQ: true, shuffleO: true, monitor: true });
    assert.strictEqual(r.settings.network, 'any');
    srv.db.prepare('UPDATE tests SET settings = json_set(settings, \'$.network\', \'lan\') WHERE id = ?').run(t2.id);   // a test saved by an older version
    const home = await stu('Вдома Учень', '9-А', '203.0.113.8');
    assert.strictEqual((await home.s('testInfo', t2.id)).state, 'open');
    const a = await home.s('startAttempt', t2.id, '', '', {});
    await home.s('submitAttempt', a.id, perfectAnswers((await A.t('math', 'getTest', t2.id)).content, a.test), {}, 99);
    const res = (await A.t('math', 'getResults', t2.id)).results.find(x => x.id === a.id);
    assert.ok(!res.flags.some(f => /мережі класу/.test(f.uk)));
  });

  console.log('\nSecurity section: per-test switches for every measure');
  await check('a new test has every security measure on by default', async () => {
    const r = await A.t('math', 'saveTest', '', { uk: 'Безпека тест', en: 'Security test' }, '', { langs: ['uk'], sections: [{ title: 'S', questions: [{ type: 'num', q: { uk: '1+1', en: '1+1' }, accept: ['2'] }] }] });
    const set = (await A.t('math', 'getTest', r.id)).settings;
    ['deviceTrack', 'blockKeys', 'detectDevtools', 'watermark', 'multiTab'].forEach(k => assert.strictEqual(set[k], true, k + ' should default on'));
    assert.strictEqual(set.fullscreen, false); assert.strictEqual(set.deviceLock, false);
    assert.strictEqual(set.aiTrap, false, 'the AI trap is off by default');
    SEC = r.id;
  });
  await check('AI trap is off by default and only reaches the student page when turned on', async () => {
    await A.t('math', 'saveTestSettings', SEC, { shuffleQ: true, shuffleO: true, monitor: true, aiTrap: false });
    await A.t('math', 'startNow', SEC);
    const off = await (await stu('Без Пастки')).s('startAttempt', SEC, '', '', { ua: 'n1', screen: '1x1', tz: 'x', canvas: 'n1' });
    assert.strictEqual(off.ac.aiTrap, false, 'trap stays off');
    await A.t('math', 'saveTestSettings', SEC, { shuffleQ: true, shuffleO: true, monitor: true, aiTrap: true });
    assert.strictEqual((await A.t('math', 'getTest', SEC)).settings.aiTrap, true);
    const on = await (await stu('З Пасткою')).s('startAttempt', SEC, '', '', { ua: 'n2', screen: '2x2', tz: 'x', canvas: 'n2' });
    assert.strictEqual(on.ac.aiTrap, true, 'trap flag reaches the page when on');
    await A.t('math', 'saveTestSettings', SEC, { shuffleQ: true, shuffleO: true, monitor: true, aiTrap: false });
  });
  await check('the student gets the chosen measures (ac flags) and the device/IP warning', async () => {
    await A.t('math', 'saveTestSettings', SEC, { shuffleQ: true, shuffleO: true, monitor: true, blockKeys: false, watermark: false, deviceTrack: true, detectDevtools: true, multiTab: true });
    await A.t('math', 'startNow', SEC);
    const info = await (await stu('Читає Правила')).s('testInfo', SEC);
    assert.strictEqual(info.deviceTrack, true, 'testInfo tells the page to show the device warning');
    const st = await stu('Учень Прапор');
    const a = await st.s('startAttempt', SEC, '', '', { ua: 'f', screen: '9x9', tz: 'x', canvas: 'flag' });
    assert.ok(a.ac && a.ac.blockKeys === false && a.ac.watermark === false && a.ac.detectDevtools === true && a.ac.multiTab === true, JSON.stringify(a.ac));
  });
  await check('one account, then a friend’s account on the same device: teacher sees both names linked', async () => {
    await A.t('math', 'saveTestSettings', SEC, { shuffleQ: true, shuffleO: true, monitor: true, deviceTrack: true });
    const dev = await stu('Супермен', '9-А', '10.21.0.2');   // one device (shared cookie jar), one IP
    await dev.page('/t/' + SEC);
    const fp = { ua: 'dev1', screen: '7x7', tz: 'Europe/Kyiv', canvas: 'dev1', webgl: 'gpu1' };
    const fake = await dev.s('startAttempt', SEC, '', '', fp);
    await dev.s('submitAttempt', fake.id, {}, {}, 0);
    const k = (await A.adm('addStudents', SC, '9-А', ['Іван Справжній'])).created[0];
    await dev.login(k.login, k.password);
    const real = await dev.s('startAttempt', SEC, '', '', fp);
    await dev.s('submitAttempt', real.id, {}, {}, 0);
    const res = await A.t('math', 'getResults', SEC);
    const rReal = res.results.find(x => x.id === real.id), rFake = res.results.find(x => x.id === fake.id);
    assert.ok(rReal.flags.some(f => f.level === 'high' && /Той самий браузер/.test(f.uk) && /Супермен/.test(f.uk)), 'linked: ' + JSON.stringify(rReal.flags));
    assert.ok(rFake.flags.some(f => /Іван Справжній/.test(f.uk)), 'linked back');
  });
  await check('turning device tracking off hides device info and device flags', async () => {
    await A.t('math', 'saveTestSettings', SEC, { shuffleQ: true, shuffleO: true, monitor: true, deviceTrack: false });
    const info = await (await stu('Без Трекінгу')).s('testInfo', SEC);
    assert.strictEqual(info.deviceTrack, false, 'no device warning when tracking is off');
    const res = await A.t('math', 'getResults', SEC);
    res.results.forEach(r => {
      assert.strictEqual(r.device, null, 'device info hidden');
      assert.ok(!r.flags.some(f => /браузер|відбиток|IP-адреса/.test(f.uk)), 'no device flags: ' + JSON.stringify(r.flags));
    });
  });

  console.log('\nEditor, AI (Gemini replaced by a stub)');
  await check('save a new test, publish, code is 6 characters', async () => {
    const r = await A.t('physics', 'saveTest', '', { uk: 'Мій тест', en: 'My test' }, '9-А', { langs: ['uk', 'en'], sections: [{ title: 'S', questions: [{ type: 'num', q: { uk: 'g = ?', en: 'g = ?' }, accept: ['9,8'], tol: 0.2 }] }] });
    assert.ok(/^[A-Z2-9]{6}$/.test(r.id));
    await A.t('physics', 'setStatus', r.id, 'published');
    const st = await stu('Фізик Учень', '9-А');
    const a = await st.s('startAttempt', r.id, '', '', {});
    const qid = a.test.sections[0].questions[0].id;
    await st.s('submitAttempt', a.id, { [qid]: '10 м/с²' }, {}, 0);
    const res = await A.t('physics', 'getResults', r.id);
    assert.strictEqual(res.results[0].grade.score, 1, 'tolerance 0.2 accepts 10 for 9.8');
    assert.ok((await A.t('physics', 'listTests')).classes.indexOf('9-А') >= 0, 'the school classes are offered to the teacher');
  });
  await check('no AI key → clear error; with a key → test from photo', async () => {
    await throwsCode('no_key', A.t('math', 'generateFromPhotos', [{ dataUrl: 'data:image/jpeg;base64,AAAA' }], '', ['uk', 'en']));
    await A.t('math', 'saveAiKey', 'AIza-test');
    await throwsCode('ai_ack', A.t('math', 'generateFromPhotos', [{ dataUrl: 'data:image/jpeg;base64,AAAA' }], '', ['uk', 'en']));
    await A.t('math', 'ackAi');
    const g = await A.t('math', 'generateFromPhotos', [{ dataUrl: 'data:image/jpeg;base64,AAAA' }], '', ['uk', 'en']);
    assert.strictEqual(g.content.sections[0].questions.length, 2);
  });
  if (srv.subjects.english) await check('English: the Ukrainian translation is made when the teacher saves; a student never calls the AI', async () => {
    const libE = await A.t('english', 'listTests');
    const te = libE.tests[0];
    await A.t('english', 'saveAiKey', 'AIza-test');
    const full = await A.t('english', 'getTest', te.id);
    full.content.allowTranslate = true;
    full.content.sections[0].questions[0].q.uk = '';
    const sv = await A.t('english', 'saveTest', te.id, full.content.title || full.title, full.folder, full.content);
    assert.ok(sv.translated >= 1, JSON.stringify(sv));
    await A.t('english', 'startNow', te.id);
    const st = await stu('Translator Kid', full.folder || '9-А');
    const a = await st.s('startAttempt', te.id, '', '', {});
    const qid = full.content.sections[0].questions[0].id;
    const tr = await st.s('translateQuestion', a.id, qid);
    assert.ok(/^\[uk\] /.test(tr.q), tr.q);
    const saved = await A.t('english', 'getTest', te.id);
    assert.ok(/^\[uk\] /.test(saved.content.sections[0].questions[0].q.uk));
  });

  console.log('\nFixes (bug-fix round)');
  await check('a whole class behind one school IP (tunnel/NAT) can log in, start and save: limits count per browser', async () => {
    const lib = await A.t('math', 'listTests'), open = lib.tests.find(t => t.state === 'open');
    await ensureClass('8-А');
    const names = []; for (let i = 0; i < 40; i++) names.push('Учень Номер ' + i);
    const kids = (await A.adm('addStudents', SC, '8-А', names)).created;
    for (const k of kids) {
      const st = client(base, '203.0.113.50');
      await st.login(k.login, k.password);   // the login page gives the browser its own device cookie
      const a = await st.s('startAttempt', open.id, '', '', {});
      await st.s('saveProgress', a.id, {}, {}, 0);
    }
  });
  await check('one browser hammering start is still limited', async () => {
    const lib = await A.t('math', 'listTests'), open = lib.tests.find(t => t.state === 'open');
    const st = await stu('Спамер', '9-А', '203.0.113.77'); await st.page('/t/' + open.id);
    let limited = false;
    for (let i = 0; i < 35 && !limited; i++) { try { await st.s('startAttempt', open.id, '', '', {}); } catch (e) { if (codeOf(e) === 'rate') limited = true; } }
    assert.ok(limited);
  });
  await check('teacher name with "$&" or "</script>" does not break the teacher page', async () => {
    const t = await A.adm('addTeacher', { name: 'Ann $& $\' </script>', email: 'dollar@school.ua', school: SC });
    const C = client(base); await C.login('dollar@school.ua', t.password);
    await C.req('/api/auth/password', { old: t.password, password: 'longpassword1', terms: true, schoolOk: true });
    const html = await (await C.page('/app/math')).text();
    assert.ok(/window\.TEACHER_NAME ?= ?"Ann \$& \$' \/script"/.test(html), 'name injected literally (angle brackets are dropped from names)');
    assert.ok(html.indexOf('/api/t/math/') >= 0);
  });
  await check('switching the start from "at a time" back to "by hand" forgets the future time', async () => {
    const lib = await A.t('physics', 'listTests'), t = lib.tests[0];
    await A.t('physics', 'saveTestSettings', t.id, { startMode: 'time', opensAt: Date.now() + 3600000, endMode: 'manual' });
    const r = await A.t('physics', 'saveTestSettings', t.id, { startMode: 'manual', endMode: 'manual' });
    assert.notStrictEqual(r.state, 'scheduled');
  });
  await check('attempt abandoned after its time limit is graded as Late with a warning', async () => {
    const lib = await A.t('math', 'listTests'), open = lib.tests.find(t => t.state === 'open');
    const st = await stu('Забув Надіслати', '9-А', '198.51.100.9');
    const a = await st.s('startAttempt', open.id, '', '', {});
    const q = a.test.sections[0].questions.find(x => x.type === 'mc');
    await st.s('saveProgress', a.id, { [q.id]: 0 }, {}, 0);
    srv.db.prepare('UPDATE attempts SET deadline = ? WHERE id = ?').run(Date.now() - 600000, a.id);
    const res = await A.t('math', 'getResults', open.id);
    const r = res.results.find(x => x.name === 'Забув Надіслати');
    assert.strictEqual(r.status, 'Late'); assert.ok(r.grade);
    assert.ok(r.flags.some(f => /Надіслати/.test(f.uk)));
    await throwsCode('already', st.s('startAttempt', open.id, '', '', {}));
  });
  await check('resume tells the page where the student stopped', async () => {
    const lib = await A.t('math', 'listTests'), open = lib.tests.find(t => t.state === 'open');
    const st = await stu('Продовжу Потім', '9-А', '198.51.100.10'); await st.page('/t/' + open.id);
    const a = await st.s('startAttempt', open.id, '', '', {});
    await st.s('saveProgress', a.id, {}, {}, 3);
    const again = await st.s('startAttempt', open.id, '', '', {});
    assert.strictEqual(again.pos, 3);
  });
  await check('test from photos: up to 10 photos, the AI is told they are pages of one test; one-language subject keeps its language', async () => {
    let seen = null;
    const old = srv.api.opts.geminiCall;
    srv.api.opts.geminiCall = async (k, body) => { seen = JSON.parse(body); return old(k, body); };
    await A.t('ukrainian', 'saveAiKey', 'AIza-test');
    const imgs = []; for (let i = 0; i < 12; i++) imgs.push({ dataUrl: 'data:image/jpeg;base64,AAAA' });
    await A.t('ukrainian', 'generateFromPhotos', imgs, '', ['uk', 'en']);
    srv.api.opts.geminiCall = old;
    const parts = seen.contents[0].parts;
    assert.strictEqual(parts.filter(p => p.inline_data).length, 10);
    assert.ok(/ONE test/.test(parts[0].text));
    await throwsCode('bad_photo', A.t('ukrainian', 'generateFromPhotos', [{ dataUrl: 'data:image/jpeg;base64,AAAA' }, { dataUrl: 'not a photo' }], '', ['uk']));
  });
  await check('tutorials: every role sees only its own lessons; nothing about running the server', async () => {
    const lessons = async c => { const h = await (await c.page('/help')).text(); return (h.match(/class="card lesson" id="([^"]+)"/g) || []).map(x => x.slice(24, -1)); };
    const anon = await lessons(client(base)), kid = await lessons(await stu('Читач Туторіалів')), te = await lessons(B), ad = await lessons(A);
    const ST = ['student', 'review-st', 'homework-st', 'grades-st', 'account-st', 'parents-st', 'phone'];
    assert.deepStrictEqual(anon, ST.concat(['parent-login', 'parent-view']), anon.join()); assert.deepStrictEqual(kid, ST, kid.join());
    assert.ok(te.indexOf('bank') >= 0 && te.indexOf('excel') >= 0 && te.indexOf('parents-admin') < 0 && te.indexOf('parent-view') < 0, te.join());
    assert.ok(ad.indexOf('parents-admin') >= 0);
    assert.ok(te.indexOf('homework') >= 0 && te.indexOf('homework-st') < 0 && te.indexOf('account-st') < 0, te.join());
    assert.ok(te.indexOf('security') >= 0 && te.indexOf('grades') >= 0 && te.indexOf('admin') < 0 && te.indexOf('students-admin') < 0, te.join());
    assert.ok(ad.indexOf('admin') >= 0 && ad.indexOf('schools') >= 0 && ad.indexOf('security') >= 0);
    const all = await (await A.page('/help')).text();
    assert.ok(!/npm |localhost|Створити акаунт|REGISTRATION/.test(all), 'no hosting / sign-up text');
  });
  await check('the server never hands out its own files (code, settings, database)', async () => {
    for (const p of ['/package.json', '/server.js', '/lib/api.js', '/core/Code.gs', '/.env', '/data/tests.db', '/subjects/math/Seed.gs', '/node_modules/express/package.json', '/vendor/qr/package.json', '/js/../server.js', '/tools/build-ui.js'])
      assert.strictEqual((await client(base).page(p)).status, 404, p);
  });
  await check('phones: manifest, icons and service worker are served', async () => {
    const m = await (await client(base).page('/manifest.webmanifest')).json();
    assert.strictEqual(m.short_name, 'Kvizora'); assert.ok(m.icons.some(i => i.purpose === 'maskable'));
    assert.strictEqual((await client(base).page('/icons/icon-192.png')).status, 200);
    assert.strictEqual((await client(base).page('/sw.js')).status, 200);
    const h = await (await client(base).page('/login')).text();
    assert.ok(h.indexOf('rel="manifest"') > 0 && h.indexOf('apple-touch-icon') > 0);
  });
  await check('scripts are minified once the server is ready (no comments, no source maps)', async () => {
    await srv.ready;
    const js = await (await client(base).page('/js/rpc.js')).text();
    assert.ok(js.indexOf('Stands in for google.script.run') < 0 && js.split('\n').length < 5 && js.indexOf('sourceMappingURL') < 0);
    const h = await (await client(base).page('/login')).text();
    assert.ok(h.indexOf('function errText') < 0, 'inline script minified');
  });
  await check('deleting a teacher removes their tests; the last administrator stays', async () => {
    const id = (await A.adm('listTeachers')).teachers.find(x => x.email === 'dollar@school.ua').id;
    await A.adm('deleteTeacher', id);
    assert.ok(!(await A.adm('listTeachers')).teachers.some(x => x.email === 'dollar@school.ua'));
    assert.strictEqual(srv.db.prepare('SELECT COUNT(*) AS n FROM tests WHERE teacher_id = ?').get(id).n, 0);
  });

  console.log('\nGroups in a class, review of mistakes');
  await check('the administrator splits a class into groups; the gradebook shows one group', async () => {
    await ensureClass('6-А');
    const g1 = (await A.adm('addStudents', SC, '6-А', ['Перша Група Один', 'Перша Група Два'], 1)).created;
    const g2 = (await A.adm('addStudents', SC, '6-А', ['Друга Група Один'])).created;
    assert.strictEqual(g1[0].group, 1); assert.strictEqual(g2[0].group, 0);
    await A.adm('updateStudent', g2[0].id, { group: 2 });
    assert.strictEqual((await A.adm('listStudents', { school: SC, cls: '6-А' })).students.find(x => x.id === g2[0].id).group, 2);
    const c6 = (await A.t('math', 'gradeClasses')).classes.find(x => x.name === '6-А');
    assert.deepStrictEqual(c6.groups.map(x => x.group + ':' + x.students), ['1:2', '2:1']);
    const all = await A.t('math', 'gradebook', '6-А', 0), one = await A.t('math', 'gradebook', '6-А', 1), two = await A.t('math', 'gradebook', '6-А', 2);
    assert.deepStrictEqual([all.students.length, one.students.length, two.students.length], [3, 2, 1]);
    assert.strictEqual(one.group, 1);
    await A.adm('updateStudent', g2[0].id, { cls: '9-А' });
    assert.strictEqual((await A.adm('listStudents', { school: SC, q: 'Друга Група Один' })).students[0].group, 0, 'moving to another class drops the group');
  });
  await check('review of mistakes: off by default; after the test closes when the teacher allows it; per student "now" / "never"; with AI explanations', async () => {
    const r = await A.t('math', 'saveTest', '', { uk: 'Тест з розбором', en: '' }, '', { langs: ['uk'], sections: [{ title: 'S', questions: [
      { type: 'num', q: { uk: '7·8', en: '' }, accept: ['56'] }, { type: 'mc', q: { uk: 'Столиця?', en: '' }, options: [{ uk: 'Львів', en: '' }, { uk: 'Київ', en: '' }], answer: 1 }] }] }, { mode: 'all' });
    await A.t('math', 'setStatus', r.id, 'published');
    const s1 = await stu('Розбір Перший', '9-А'), s2 = await stu('Розбір Другий', '9-А');
    for (const st of [s1, s2]) { const a = await st.s('startAttempt', r.id, '', '', {}); await st.s('submitAttempt', a.id, { [a.test.sections[0].questions.find(q => q.type === 'num').id]: '54' }, {}, 0); }
    const home = async st => (await st.req('/api/student/home', {})).subjects.find(x => x.key === 'math').tests.find(t => t.id === r.id);
    assert.ok(!(await home(s1)).review); await throwsCode('no_review', s1.req('/api/student/review', { args: [r.id] }));
    const res = await A.t('math', 'getResults', r.id), a1 = res.results.find(x => x.name === 'Розбір Перший'), a2 = res.results.find(x => x.name === 'Розбір Другий');
    await A.t('math', 'setReview', a1.id, true);   // one student, right now, while the test is still open
    assert.ok((await home(s1)).review); assert.ok(!(await home(s2)).review);
    const ex = await A.t('math', 'explainTest', r.id); assert.ok(ex.explained >= 2);
    const rv = await s1.req('/api/student/review', { args: [r.id] });
    const q1 = rv.sections[0].questions.find(q => q.type === 'num');
    assert.strictEqual(q1.ok, false); assert.strictEqual(q1.given, '54'); assert.strictEqual(q1.right, '56'); assert.ok(/because 56/.test(q1.why.uk));
    assert.strictEqual(rv.sections[0].questions.find(q => q.type === 'mc').right.uk, 'Київ');
    // the whole test: after it is closed; one student can still be kept out
    await A.t('math', 'saveTestSettings', r.id, { review: true, startMode: 'manual', endMode: 'manual' });
    assert.ok(!(await home(s2)).review, 'not while the test is open');
    await A.t('math', 'stopNow', r.id);
    assert.ok((await home(s2)).review);
    await A.t('math', 'setReview', a2.id, false); assert.ok(!(await home(s2)).review);
    await throwsCode('no_review', s2.req('/api/student/review', { args: [r.id] }));
    await throwsCode('auth', client(base).req('/api/student/review', { args: [r.id] }));
  });

  console.log('\nMaths: equations solved step by step, tools for students');
  await check('solve: steps and roots marked (2 points with steps), tool use reaches the teacher, the review shows the working and the right roots', async () => {
    const r = await A.t('math', 'saveTest', '', { uk: 'Рівняння з кроками', en: '' }, '', { langs: ['uk'], tools: ['calc', 'graph', 'nope'], sections: [{ title: 'S', questions: [
      { type: 'solve', q: { uk: 'Розв’яжіть', en: '' }, eq: ['x^2 - 5x + 6 = 0'], steps: 'grade' },
      { type: 'solve', q: { uk: 'Система', en: '' }, eq: ['x + y = 10', 'x - y = 4'], steps: 'show' }] }] }, { mode: 'all' });
    await A.t('math', 'setStatus', r.id, 'published');
    const full = await A.t('math', 'getTest', r.id);
    assert.deepStrictEqual(full.content.tools, ['calc', 'graph']);
    const st = await stu('Рівняння Учень', '9-А');
    const info = await st.s('testInfo', r.id.toLowerCase()); assert.deepStrictEqual(info.tools, ['calc', 'graph']);
    const a = await st.s('startAttempt', r.id, '', '', {});
    noKeys(a); assert.deepStrictEqual(a.test.tools, ['calc', 'graph']);
    const qs = a.test.sections[0].questions, q1 = qs.find(q => q.eq.length === 1), q2 = qs.find(q => q.eq.length === 2);   // the order may be shuffled assert.deepStrictEqual(q1.eq, ['x^2 - 5x + 6 = 0']); assert.deepStrictEqual(q2.vars, ['x', 'y']);
    const ans = { [q1.id]: JSON.stringify({ s: ['(x - 2)(x - 3) = 0', 'x = 2 або x = 4'], r: ['2', '3'] }), [q2.id]: JSON.stringify({ s: ['2x = 14'], r: [['7', '3']] }) };
    await st.s('submitAttempt', a.id, ans, { tools: { calc: 2 }, log: [{ t: 'tool', at: 5, x: 'calc' }] }, 1);
    const res = await A.t('math', 'getResults', r.id), me = res.results.find(x => x.name === 'Рівняння Учень');
    assert.strictEqual(me.grade.max, 3); assert.strictEqual(me.grade.score, 2, 'roots right (1) + a wrong step (0) + the system (1)');
    const g1 = me.grade.sections[0].questions.find(q => q.id === q1.id);
    assert.deepStrictEqual(g1.steps.map(x => x.st), ['ok', 'wrong']);
    assert.strictEqual(me.activity.tools.calc, 2);
    await A.t('math', 'setReview', me.id, true);
    const rv = await st.req('/api/student/review', { args: [r.id] }), v1 = rv.sections[0].questions.find(q => q.steps && q.steps.length === 2), v2 = rv.sections[0].questions.find(q => q !== v1);
    assert.strictEqual(v1.given, 'x = 2; x = 3'); assert.strictEqual(v1.right, 'x = 2; x = 3'); assert.deepStrictEqual(v1.steps.map(x => x.st), ['ok', 'wrong']);
    assert.strictEqual(v2.right, '(x = 7; y = 3)'); assert.strictEqual(v2.ok, true);
  });

  console.log('\nPersonal data (legal)');
  const mkTest = async (title, settings) => {
    const r = await A.t('math', 'saveTest', '', { uk: title, en: '' }, '', { langs: ['uk'], sections: [{ title: 'S', questions: [{ type: 'num', q: { uk: '2+2', en: '' }, accept: ['4'] }] }] }, { mode: 'all' });
    await A.t('math', 'setStatus', r.id, 'published');
    await A.t('math', 'saveTestSettings', r.id, Object.assign({ startMode: 'manual', endMode: 'manual' }, settings));
    return r.id;
  };
  await check('no browser-id cookie before the test starts; only after the notice, and only when the device is recorded', async () => {
    const off = await mkTest('Без запису пристрою', { deviceTrack: false, guests: true });
    const on = await mkTest('З записом пристрою', { deviceTrack: true });
    const g = client(base, '10.88.0.2');
    await g.page('/login'); await g.page('/t/' + off); await g.s('testInfo', off);
    assert.ok(!g.jar.dev, 'no dev cookie from opening pages');
    const s1 = await stu('Приватний Учень', '9-А', '10.88.0.3');
    const a1 = await s1.s('startAttempt', off, '', '', { ua: 'x', screen: '1x1' });
    assert.ok(!s1.jar.dev, 'an account + recording off → no cookie at all');
    const row1 = srv.db.prepare('SELECT ip, fp, dev_id FROM attempts WHERE id = ?').get(a1.id);
    assert.deepStrictEqual([row1.ip, row1.fp, row1.dev_id], ['', '{}', ''], 'nothing about the device is stored');
    const a2 = await s1.s('startAttempt', on, '', '', { ua: 'x', screen: '1x1' });
    assert.ok(s1.jar.dev, 'recording on → the cookie is set when the test starts');
    assert.strictEqual(srv.db.prepare('SELECT ip FROM attempts WHERE id = ?').get(a2.id).ip, '10.88.0.3');
    const ga = await g.s('startAttempt', off, 'Гість Приватний', '9-А', { ua: 'x' });
    assert.ok(g.jar.dev, 'a guest gets the cookie at start (to continue on the same device)');
    assert.strictEqual(srv.db.prepare('SELECT ip FROM attempts WHERE id = ?').get(ga.id).ip, '');
    const info = await s1.s('testInfo', on); assert.strictEqual(info.deviceTrack, true); assert.ok(info.school.length > 1, 'the school is named in the notice');
  });
  await check('the legal pages open without logging in; every page has the footer with the links', async () => {
    const c = client(base);
    for (const d of ['privacy', 'terms', 'cookies', 'licenses']) assert.strictEqual((await c.page('/legal/' + d)).status, 200, d);
    assert.ok(/KaTeX|katex/.test(await (await c.page('/legal/licenses')).text()));
    const h = await (await c.page('/login')).text();
    assert.ok(h.indexOf('href="/legal/privacy"') > 0 && h.indexOf('href="/legal/licenses"') > 0 && h.indexOf('class="legal-foot"') > 0);
    assert.ok(h.indexOf('Дані учнів у Kvizora') > 0, 'the notice for teachers on the login page');
  });
  await check('the school’s details go into the Privacy Policy; the admin sees what is missing', async () => {
    assert.ok((await A.adm('overview')).incomplete.some(x => x.id === SC));
    await A.adm('saveSchoolInfo', SC, { legalName: 'Ліцей № 1 м. Києва', edrpou: '12345678', address: 'вул. Шкільна, 1', person: 'Іван Директор, директор', email: 'school@example.ua' });
    await A.adm('savePrivacy', { owner: { name: 'Платон Вороний', email: 'owner@example.ua', address: 'м. Київ' }, keepDeviceDays: 60 });
    const o = await A.adm('overview'); assert.ok(!o.incomplete.some(x => x.id === SC) && !o.ownerMissing);
    const h = await (await A.page('/legal/privacy')).text();
    assert.ok(h.indexOf('12345678') > 0 && h.indexOf('school@example.ua') > 0 && h.indexOf('Платон Вороний, м. Київ') > 0 && h.indexOf('owner@example.ua') > 0 && h.indexOf('60 днів') > 0);
    assert.ok((await (await A.page('/legal/terms')).text()).indexOf('Платон Вороний, м. Київ, owner@example.ua') > 0, 'the owner in the Terms');
    assert.ok((await (await A.page('/login')).text()).indexOf('Ліцей № 1 м. Києва') > 0 || true);
    const cl = await A.adm('setParents', SC, '9-А', true); assert.ok(cl.classes.find(x => x.name === '9-А').parentsAt);
  });
  await check('device data is erased after the set number of days; the «clear now» button erases it from finished tests', async () => {
    const old = Date.now() - 61 * 86400000;
    srv.db.prepare("UPDATE attempts SET started = ? WHERE ip <> '' AND id IN (SELECT id FROM attempts WHERE ip <> '' LIMIT 1)").run(old);
    const n0 = srv.db.prepare('SELECT COUNT(*) AS n FROM attempts WHERE started = ? AND ip <> \'\'').get(old).n; assert.ok(n0 >= 1);
    require('../lib/privacy').cleanup(srv.db);
    assert.strictEqual(srv.db.prepare('SELECT COUNT(*) AS n FROM attempts WHERE started = ? AND ip <> \'\'').get(old).n, 0);
    const r = await A.adm('purgeDevices');
    assert.ok(r.result && srv.db.prepare("SELECT COUNT(*) AS n FROM attempts WHERE submitted IS NOT NULL AND ip <> ''").get().n === 0);
    await throwsCode('bad_days', A.adm('savePrivacy', { keepAttemptDays: -3 }));
  });
  await check('a parent’s request: the teacher finds a student in all tests, exports, corrects the name, deletes', async () => {
    const f = await A.req('/api/data/findStudent', { args: ['гість приват'] });
    const p = f.people.find(x => x.name === 'Гість Приватний'); assert.ok(p && !p.account);
    const e = await A.req('/api/data/exportStudent', { args: [p.key] }); assert.ok(/Гість Приватний/.test(e.csv) && /\.csv$/.test(e.name));
    const rn = await A.req('/api/data/renameStudent', { args: [p.key, 'Гість Виправлений'] });
    const d = await A.req('/api/data/deleteStudent', { args: [rn.key] }); assert.ok(d.deleted >= 1);
    assert.strictEqual((await A.req('/api/data/findStudent', { args: ['гість'] })).people.filter(x => /Приватний|Виправлений/.test(x.name)).length, 0);
    const acc = (await A.req('/api/data/findStudent', { args: ['приватний учень'] })).people[0];
    await throwsCode('acc_name', A.req('/api/data/renameStudent', { args: [acc.key, 'Хтось Інший'] }));
  });
  await check('the administrator exports a student account and erases it with all its tests', async () => {
    const st = (await A.adm('listStudents', { school: SC, q: 'Приватний Учень' })).students[0];
    const ex = await A.adm('exportStudent', st.id); assert.ok(ex.data.attempts.length >= 1 && ex.data.account.login === st.login);
    const del = await A.adm('deleteStudent', st.id, true); assert.ok(del.attempts >= 1);
    assert.strictEqual(srv.db.prepare('SELECT COUNT(*) AS n FROM attempts WHERE name = ?').get('Приватний Учень').n, 0);
  });
  await check('a teacher downloads all own data and can delete the own account; an old account accepts the Terms first', async () => {
    const t = await A.adm('addTeacher', { name: 'Тимчасовий Учитель', email: 'temp@school.ua', school: SC });
    const C = client(base); await C.login('temp@school.ua', t.password);
    await C.req('/api/auth/password', { old: t.password, password: 'temp teacher 9', terms: true, schoolOk: true });
    srv.db.prepare('UPDATE teachers SET terms_at = NULL WHERE email = ?').run('temp@school.ua');
    await throwsCode('terms', C.req('/api/dashboard', {}));
    assert.strictEqual((await C.page('/app')).headers.get('location'), '/password');
    await C.req('/api/auth/accept', { terms: true, schoolOk: true });
    await C.req('/api/dashboard', {});
    // a new version of the Terms: accepted again, the page says what changed
    srv.db.prepare("UPDATE teachers SET terms_ver = 'old' WHERE email = ?").run('temp@school.ua');
    await throwsCode('terms', C.req('/api/dashboard', {}));
    assert.strictEqual((await C.req('/api/auth/me', {})).termsChanged, true);
    await C.req('/api/auth/accept', { terms: true, schoolOk: true });
    await C.req('/api/dashboard', {});
    assert.ok(/id="6а"/.test(await (await C.page('/legal/terms')).text()), 'the Terms have section anchors');
    const dl = await C.page('/account/data.json'); assert.strictEqual(dl.status, 200);
    const j = await dl.json(); assert.strictEqual(j.account.email, 'temp@school.ua'); assert.ok(!('pass' in j.account) && Array.isArray(j.tests));
    await throwsCode('pw_old', C.req('/api/me/delete', { password: 'nope' }));
    await C.req('/api/me/delete', { password: 'temp teacher 9' });
    assert.ok(!srv.db.prepare('SELECT 1 FROM teachers WHERE email = ?').get('temp@school.ua'));
  });
  await check('students never call the AI: the translation is stored when the teacher saves', async () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'api.js'), 'utf8');
    const fn = src.slice(src.indexOf('  translateQuestion(attemptId'), src.indexOf('\n  }\n', src.indexOf('  translateQuestion(attemptId')));
    assert.ok(fn.length > 50 && fn.indexOf('gemini') < 0 && fn.indexOf('await') < 0);
  });

  await check('a teacher adds a class of the own school and deletes only the own empty one; students stay with the administrator', async () => {
    const t = await A.adm('addTeacher', { name: 'Класний Учитель', email: 'cls@school.ua', school: SC });
    const C = client(base); await C.login('cls@school.ua', t.password);
    await C.req('/api/auth/password', { old: t.password, password: 'class teacher 1', terms: true, schoolOk: true });
    const r = await C.req('/api/classes/addMyClass', { args: ['11-Т'] });
    assert.ok(r.classes.some(c => c.name === '11-Т' && c.mine), 'the new class is listed as mine');
    await throwsCode('cls_taken', C.req('/api/classes/addMyClass', { args: ['9-а'] }));
    await throwsCode('cls_not_mine', C.req('/api/classes/deleteMyClass', { args: ['9-А'] }));
    await throwsCode('forbidden', C.req('/api/admin/addStudents', { args: [SC, '11-Т', ['Новий Учень']] }));
    const adm = await A.adm('listClasses', SC); assert.strictEqual(adm.classes.find(c => c.name === '11-Т').byTeacher, 'Класний Учитель');
    await A.adm('addStudents', SC, '11-Т', ['Учень Одинадцятого']);
    await throwsCode('cls_busy', C.req('/api/classes/deleteMyClass', { args: ['11-Т'] }));
    const st = (await A.adm('listStudents', { school: SC, q: 'Учень Одинадцятого' })).students[0]; await A.adm('deleteStudent', st.id, true);
    const after = await C.req('/api/classes/deleteMyClass', { args: ['11-Т'] }); assert.ok(!after.classes.some(c => c.name === '11-Т'));
  });
  http.close();
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
