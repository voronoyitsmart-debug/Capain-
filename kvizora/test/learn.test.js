'use strict';
// «🎓 Навчання» API tests: homework for a class / a group, answers with photos (only when the school allows them, cleaned on
// the server), marks and «send back», who sees what, the gradebook and the student report, progress, personal data.
// Run: npm run test:learn
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
  async function req(p, body, raw) {
    const headers = { 'Content-Type': 'application/json', 'X-Tests-App': '1' };
    if (ip !== null) headers['X-Forwarded-For'] = ip || '10.1.1.' + (1 + Math.floor(Math.random() * 200));
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

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kv-learn-'));
  const srv = createServer({ dbFile: path.join(dir, 't.db'), port: 0, geminiKey: '' });
  const http = srv.app.listen(0); await new Promise(r => http.once('listening', r));
  const base = 'http://127.0.0.1:' + http.address().port;
  const hwDir = path.join(dir, 'hw-files');
  const PW = 'correct horse 1', DAY = 86400000;
  const JPEG = fs.readFileSync(path.join(__dirname, 'fixtures', 'photo-exif.jpg'));   // 40×30, with EXIF («SecretCam») and a comment
  const dataUrl = b => 'data:image/jpeg;base64,' + Buffer.from(b).toString('base64');

  const A = client(base, null);   // straight from this computer (the first administrator is made only here)   // the owner / administrator (Олена)
  await A.req('/api/setup', { school: 'Ліцей № 7', name: 'Олена Коваль', email: 'olena@school.ua', password: PW, terms: true, schoolOk: true });
  const SC = (await A.adm('listSchools')).schools[0].id;
  async function teacher(name, email, school) {
    const t = await A.adm('addTeacher', { name, email, school: school || SC }), c = client(base);
    await c.login(email, t.password); await c.req('/api/auth/password', { old: t.password, password: PW + 'x', terms: true, schoolOk: true });
    c.id = t.id; return c;
  }
  const B = await teacher('Петро Іваненко', 'petro@school.ua');
  for (const c of ['7-А', '7-Б']) await A.adm('addClass', SC, c);
  const kids = (await A.adm('addStudents', SC, '7-А', ['Аня Бойко', 'Богдан Гнатюк', 'Вера Дяк'])).created;
  const other = (await A.adm('addStudents', SC, '7-Б', ['Галя Єрмак'])).created[0];
  await A.adm('updateStudent', kids[2].id, { group: 2 });
  const S = [];
  for (const k of kids.concat([other])) { const c = client(base); await c.login(k.login, k.password); c.acc = k; S.push(c); }
  const [s1, s2, s3, s4] = S;
  const home = c => c.req('/api/student/learn', {});
  const submit = (c, ...a) => c.req('/api/student/hwSubmit', { args: a });
  let H1, H2, HG;

  console.log('\nHomework: the teacher sets it');
  await check('the teacher opens the tab: subjects, classes with students, photos off by default', async () => {
    assert.strictEqual((await B.page('/app/learn')).status, 200);
    assert.strictEqual((await client(base).page('/app/learn')).status, 302);
    const h = await B.L('home');
    assert.ok(h.subjects.some(s => s.key === 'math')); assert.deepStrictEqual(h.classes.map(c => c.name).sort(), ['7-А', '7-Б']);
    assert.strictEqual(h.photos, false);
    assert.deepStrictEqual(h.classes.find(c => c.name === '7-А').groups, [{ group: 2, students: 1 }]);
  });
  await check('a task needs a known subject, a class of the school, a title and a due time', async () => {
    const ok = { subject: 'math', cls: '7-А', title: '§ 5, № 1–4', body: 'Розв’язати рівняння.\nhttps://example.org/a', due: Date.now() + DAY };
    await throwsCode('not_found', B.L('save', Object.assign({}, ok, { subject: 'alchemy' })));
    await throwsCode('cls_none', B.L('save', Object.assign({}, ok, { cls: '11-Z' })));
    await throwsCode('hw_title', B.L('save', Object.assign({}, ok, { title: ' ' })));
    await throwsCode('hw_due', B.L('save', Object.assign({}, ok, { due: 'soon' })));
    await throwsCode('hw_test', B.L('save', Object.assign({}, ok, { kind: 'test', testId: 'NOPE00' })));
    H1 = await B.L('save', ok);
    assert.ok(H1.id && H1.kind === 'text' && H1.late === true && H1.cls === '7-А');
    H2 = await B.L('save', { subject: 'math', cls: '7-А', title: 'Вивчити таблицю', kind: 'none', due: Date.now() + 2 * DAY });
    HG = await B.L('save', { subject: 'english', cls: '7-А', group: 2, title: 'Words, unit 3', due: Date.now() + DAY });
  });
  await check('a teacher can link only an own test of the subject', async () => {
    await B.req('/api/dashboard', {}); await A.req('/api/dashboard', {});   // the sample tests appear on the first visit
    const tests = (await B.L('home')).tests.filter(t => t.subject === 'math');
    assert.ok(tests.length, 'the sample tests are published');
    const own = await B.L('save', { subject: 'math', cls: '7-А', title: 'Тест до § 5', kind: 'test', testId: tests[0].id, due: Date.now() + DAY });
    assert.strictEqual(own.testId, tests[0].id);
    const aTests = (await A.L('home')).tests.filter(t => t.subject === 'math');
    await throwsCode('hw_test', B.L('save', { subject: 'math', cls: '7-А', title: 'Чужий', kind: 'test', testId: aTests[0].id, due: Date.now() + DAY }));
    await B.L('remove', own.id);
  });
  await check('the list counts students and answers; another teacher sees and changes nothing of it', async () => {
    const l = await B.L('list', { cls: '7-А' });
    const t = l.tasks.find(x => x.id === H1.id); assert.strictEqual(t.students, 3); assert.strictEqual(t.done, 0);
    assert.strictEqual(l.tasks.find(x => x.id === HG.id).students, 1, 'the group task is for group 2 only');
    assert.strictEqual((await A.L('list', {})).tasks.length, 0);
    await throwsCode('hw_none', A.L('detail', H1.id));
    await throwsCode('hw_none', A.L('mark', H1.id, kids[0].id, '10', ''));
    await throwsCode('hw_none', A.L('remove', H1.id));
  });

  console.log('\nHomework: the student hands it in');
  await check('students see the tasks of their own class and group only', async () => {
    const t1 = (await home(s1)).tasks.map(t => t.id), t3 = (await home(s3)).tasks.map(t => t.id), t4 = (await home(s4)).tasks.map(t => t.id);
    assert.ok(t1.includes(H1.id) && t1.includes(H2.id) && !t1.includes(HG.id));
    assert.ok(t3.includes(HG.id) && t3.includes(H1.id));
    assert.deepStrictEqual(t4, []);
    await throwsCode('hw_none', submit(s4, H1.id, 'чуже'));
    await throwsCode('auth', client(base).req('/api/student/learn', {}));
    assert.strictEqual((await home(s1)).tasks.find(t => t.id === H1.id).state, 'todo');
  });
  await check('an empty answer is refused; «no hand-in» tasks are not handed in; photos are off until the administrator turns them on', async () => {
    await throwsCode('hw_empty', submit(s1, H1.id, '   '));
    await throwsCode('hw_kind', submit(s1, H2.id, 'вивчив'));
    await throwsCode('photos_off', submit(s1, H1.id, 'x = 2', [dataUrl(JPEG)]));
    await throwsCode('forbidden', B.L('setPhotos', true));
    assert.strictEqual((await A.L('setPhotos', true)).photos, true);
    assert.strictEqual((await home(s1)).photos, true);
  });
  let fileId;
  await check('a photo is cleaned on the server: no EXIF, no comment, nothing after the picture; only JPEG; at most 3', async () => {
    const r = await submit(s1, H1.id, 'x = 2, x = 3', [dataUrl(Buffer.concat([JPEG, Buffer.from('<script>alert(1)</script>')]))]);
    assert.strictEqual(r.state, 'submitted'); assert.strictEqual(r.mine.length, 1); fileId = r.mine[0];
    const f = fs.readFileSync(path.join(hwDir, fileId + '.jpg'));
    assert.ok(f.indexOf('Exif') < 0 && f.indexOf('SecretCam') < 0 && f.indexOf('GPS secret') < 0 && f.indexOf('script') < 0, 'metadata and the tail are gone');
    assert.ok(f[0] === 0xFF && f[1] === 0xD8 && f[f.length - 2] === 0xFF && f[f.length - 1] === 0xD9 && f.length < JPEG.length);
    await throwsCode('bad_photo', submit(s1, H1.id, 'x', ['data:image/png;base64,iVBORw0KGgo=']));
    await throwsCode('bad_photo', submit(s1, H1.id, 'x', [dataUrl(Buffer.from('GIF89a not a jpeg'))]));
    await throwsCode('bad_photo', submit(s1, H1.id, 'x', [dataUrl(JPEG.subarray(0, 200))]));
    await throwsCode('photo_many', submit(s1, H1.id, 'x', [dataUrl(JPEG), dataUrl(JPEG), dataUrl(JPEG)], [fileId]));
    assert.deepStrictEqual((await home(s1)).tasks.find(t => t.id === H1.id).mine, [fileId], 'a refused answer changes nothing');
  });
  await check('a photo opens only for the student who sent it and the teacher of the task', async () => {
    const url = '/learn/file/' + fileId + '.jpg';
    const r1 = await s1.page(url); assert.strictEqual(r1.status, 200); assert.strictEqual(r1.headers.get('content-type'), 'image/jpeg');
    assert.ok(/no-store/.test(r1.headers.get('cache-control')) && r1.headers.get('x-content-type-options') === 'nosniff');
    assert.strictEqual((await B.page(url)).status, 200);
    for (const c of [s2, s4, A, client(base)]) assert.strictEqual((await c.page(url)).status, 404);
    assert.strictEqual((await s1.page('/learn/file/..%2F..%2Ft.db.jpg')).status, 404);
  });
  await check('the student may change the answer before it is checked (keep or drop photos)', async () => {
    const r = await submit(s1, H1.id, 'x = 2; x = 3 (перевірка)', [], [fileId]);
    assert.deepStrictEqual(r.mine, [fileId]);
    const t = (await home(s1)).tasks.find(x => x.id === H1.id); assert.strictEqual(t.state, 'submitted'); assert.ok(/перевірка/.test(t.text));
  });

  console.log('\nMarks, «send back», the gradebook');
  await check('the teacher sees every student of the class with the answer and marks it 1–12', async () => {
    const d = await B.L('detail', H1.id);
    assert.deepStrictEqual(d.students.map(s => s.state), ['submitted', 'todo', 'todo']);
    assert.deepStrictEqual(d.students[0].files, [fileId]);
    await throwsCode('bad_grade', B.L('mark', H1.id, kids[0].id, '13', ''));
    await throwsCode('st_none', B.L('mark', H1.id, other.id, '10', ''));
    const r = await B.L('mark', H1.id, kids[0].id, '10', 'Молодець!');
    assert.strictEqual(r.state, 'checked'); assert.strictEqual(r.grade, '10');
    await throwsCode('hw_checked', submit(s1, H1.id, 'ще раз'));
    const t = (await home(s1)).tasks.find(x => x.id === H1.id); assert.strictEqual(t.grade, '10'); assert.strictEqual(t.comment, 'Молодець!');
  });
  await check('«send back»: the student fixes it and hands it in again', async () => {
    await submit(s2, H1.id, 'x = 5');
    const r = await B.L('mark', H1.id, kids[1].id, '', 'Перевір другий корінь', true); assert.strictEqual(r.state, 'returned');
    assert.strictEqual((await home(s2)).tasks.find(x => x.id === H1.id).state, 'returned');
    await submit(s2, H1.id, 'x = 5, x = -1');
    assert.strictEqual((await home(s2)).tasks.find(x => x.id === H1.id).state, 'submitted');
    await B.L('mark', H1.id, kids[1].id, '8', '');
  });
  await check('a «no hand-in» task can be marked too; late answers are marked, closed tasks refuse them', async () => {
    await B.L('mark', H2.id, kids[0].id, 'н', '');
    const past = await B.L('save', { subject: 'math', cls: '7-А', title: 'Минуле', due: Date.now() - DAY, late: true });
    const closed = await B.L('save', { subject: 'math', cls: '7-А', title: 'Закрите', due: Date.now() - DAY, late: false });
    const r = await submit(s3, past.id, 'пізно, але зробив'); assert.strictEqual(r.late, true);
    await throwsCode('hw_closed', submit(s3, closed.id, 'запізно'));
    assert.strictEqual((await home(s2)).tasks.find(x => x.id === closed.id).state, 'missing');
    const d = await B.L('detail', past.id); assert.strictEqual(d.students.find(s => s.id === kids[2].id).late, true);
  });
  await check('homework marks are in the gradebook (on the due day) and in the student report', async () => {
    const g = await B.t('math', 'gradebook', '7-А', 0);
    assert.ok(g.hw.tasks.some(t => t.id === H1.id));
    assert.strictEqual(g.hw.marks[kids[0].id][H1.id].grade, '10');
    const rep = await B.t('math', 'studentReport', kids[0].id);
    const m = rep.subjects.find(s => s.key === 'math'); assert.ok(m, 'math is in the report');
    assert.strictEqual(m.avgMark, 10); assert.ok(m.hw.given >= 1 && m.hw.done >= 1);
  });
  await check('the student sees every mark per subject (tests, lessons, homework) and the average', async () => {
    await B.t('math', 'setDayMark', kids[0].id, '2026-10-20', '12', 'відповідь біля дошки');
    const h = await home(s1), m = h.subjects.find(s => s.key === 'math');
    assert.deepStrictEqual(m.marks.map(x => x.kind + ':' + x.grade).sort(), ['hw:10', 'hw:н', 'lesson:12']);
    assert.strictEqual(m.avg, 11); assert.strictEqual(m.level, 'high'); assert.strictEqual(m.absent, 1);
    assert.ok(!(await home(s4)).subjects.length, 'nobody else’s marks');
  });

  console.log('\nProgress');
  await check('a teacher sees the class from the own marks: average, level, homework, absences, who needs attention', async () => {
    await B.t('math', 'setDayMark', kids[1].id, '2026-10-20', '3', ''); await B.t('math', 'setDayMark', kids[1].id, '2026-10-21', '4', '');
    const p = await B.L('progress', '7-А', 0, 'math', 0, true);
    assert.strictEqual(p.wide, false, 'a teacher cannot ask for every teacher');
    const by = {}; p.students.forEach(s => { by[s.id] = s; });
    assert.strictEqual(by[kids[0].id].avg, 11); assert.strictEqual(by[kids[0].id].level, 'high'); assert.strictEqual(by[kids[0].id].absent, 1);
    assert.strictEqual(by[kids[1].id].avg, 5); assert.ok(by[kids[1].id].attention.includes('low'));
    assert.strictEqual(p.summary.students, 3); assert.ok(p.summary.attention >= 1);
    const g2 = await B.L('progress', '7-А', 2, '', 0, false); assert.deepStrictEqual(g2.students.map(s => s.id), [kids[2].id]);
    await throwsCode('cls_none', B.L('progress', '', 0, '', 0));
  });
  await check('the administrator may see every teacher of the school', async () => {
    assert.strictEqual((await A.L('progress', '7-А', 0, '', 0, false)).students.find(s => s.id === kids[0].id).avg, null);
    const w = await A.L('progress', '7-А', 0, '', 0, true); assert.strictEqual(w.wide, true);
    assert.strictEqual(w.students.find(s => s.id === kids[0].id).avg, 11);
  });

  console.log('\nAnnouncements, «Найближчі терміни», criteria');
  await check('criteria: optional, saved with the task and shown to the students', async () => {
    const t = await B.L('save', { subject: 'math', cls: '7-А', title: 'Підготовка до контрольної', kind: 'none', criteria: '12 — усе правильно', due: Date.now() + 3 * DAY });
    assert.strictEqual(t.criteria, '12 — усе правильно');
    const st = (await home(s1)).tasks.find(x => x.id === t.id); assert.strictEqual(st.criteria, '12 — усе правильно');
    assert.strictEqual((await home(s1)).tasks.find(x => x.id === H1.id).criteria, '');
  });
  await check('«Найближчі терміни»: the next 7 days of homework still to do (sorted), nothing already handed in', async () => {
    const soon = (await home(s2)).soon;
    assert.ok(soon.length >= 2); assert.ok(soon.every((x, i) => !i || soon[i - 1].due <= x.due));
    assert.ok(soon.some(x => x.title === 'Підготовка до контрольної' && x.hwKind === 'none'));
    assert.ok(!(await home(s1)).soon.some(x => x.id === H1.id), 'checked work is not «to do»');
    await B.L('save', { subject: 'math', cls: '7-А', title: 'Далеко', due: Date.now() + 20 * DAY });
    assert.ok(!(await home(s2)).soon.some(x => x.title === 'Далеко'));
  });
  let ANN;
  await check('announcements: text only, to a class or a group; other classes and groups do not see them', async () => {
    await throwsCode('ann_text', B.L('announce', { subject: 'math', cls: '7-А', text: ' ' }));
    await throwsCode('cls_none', B.L('announce', { subject: 'math', cls: '11-Z', text: 'Привіт' }));
    ANN = await B.L('announce', { subject: 'math', cls: '7-А', text: 'У п’ятницю контрольна, § 10–12.', days: 7 });
    assert.ok(ANN.until > Date.now() + 6 * DAY && ANN.until < Date.now() + 8 * DAY);
    await B.L('announce', { subject: 'english', cls: '7-А', group: 2, text: 'Group 2: bring dictionaries.' });
    const a1 = (await home(s1)).announcements, a3 = (await home(s3)).announcements;
    assert.deepStrictEqual(a1.map(a => a.text), ['У п’ятницю контрольна, § 10–12.']);
    assert.strictEqual(a3.length, 2); assert.deepStrictEqual((await home(s4)).announcements, []);
    assert.strictEqual(a1[0].teacher, 'Петро Іваненко'); assert.strictEqual(a1[0].subject, 'math');
    assert.ok(!('id' in a1[0]) && !('cls' in a1[0]), 'only what a student or a parent needs');
    assert.deepStrictEqual(srv.learn.announcementsFor({ id: kids[0].id }).map(a => a.text), a1.map(a => a.text), 'the same list for the parent page');
  });
  await check('announcements: another teacher cannot delete them; they disappear after their time and on delete', async () => {
    await throwsCode('not_found', A.L('unannounce', ANN.id));
    assert.strictEqual((await B.L('announcements')).list.length, 2);
    srv.db.prepare('UPDATE hw_ann SET until = ? WHERE id = ?').run(Date.now() - 1000, ANN.id);
    assert.deepStrictEqual((await home(s1)).announcements, []);
    assert.strictEqual((await B.L('announcements')).list.find(a => a.id === ANN.id).active, false);
    await B.L('unannounce', ANN.id); assert.strictEqual((await B.L('announcements')).list.length, 1);
    assert.ok((await A.adm('auditLog', 50)).rows.some(x => x.action === 'ann.add'));
  });

  console.log('\nPersonal data');
  await check('🚩 an unacceptable photo: the teacher removes it and the administrator sees it in the log', async () => {
    const r = await submit(s3, HG.id, 'words', [dataUrl(JPEG)]);
    await throwsCode('not_found', A.L('dropPhoto', r.mine[0], true));
    await B.L('dropPhoto', r.mine[0], true);
    assert.ok(!fs.existsSync(path.join(hwDir, r.mine[0] + '.jpg')));
    assert.ok((await A.adm('auditLog', 50)).rows.some(x => x.action === 'hw.photo.report' && /Вера Дяк/.test(x.detail)));
  });
  await check('photos are deleted after 30 days (the answer and the mark stay); stray files go too', async () => {
    const r = await submit(s3, HG.id, 'words v2', [dataUrl(JPEG)]);
    srv.db.prepare('UPDATE hw_files SET created = ? WHERE id = ?').run(Date.now() - 31 * DAY, r.mine[0]);
    fs.writeFileSync(path.join(hwDir, 'a'.repeat(32) + '.jpg'), 'x');
    const c = srv.learn.cleanup(0);
    assert.strictEqual(c.photos, 1); assert.ok(!fs.existsSync(path.join(hwDir, r.mine[0] + '.jpg')) && !fs.existsSync(path.join(hwDir, 'a'.repeat(32) + '.jpg')));
    assert.strictEqual((await home(s3)).tasks.find(x => x.id === HG.id).text, 'words v2');
    assert.ok(fs.existsSync(path.join(hwDir, fileId + '.jpg')), 'newer photos stay');
  });
  await check('export: the student’s homework is in the administrator’s file and the teacher’s CSV', async () => {
    const x = await A.adm('exportStudent', kids[0].id);
    assert.ok(x.data.homework.some(h => h.title === '§ 5, № 1–4' && h.grade === '10' && h.photos === 1));
    const key = (await B.req('/api/data/findStudent', { args: ['Аня'] })).people;   // only attempts at tests are searched there
    assert.ok(Array.isArray(key));
    const me = await (await B.page('/account/data.json')).json(); assert.ok(me.homework.length >= 3 && me.homeworkMarks.length >= 3 && me.announcements.length === 1);
  });
  await check('deleting a student removes the answers, marks and photos; deleting a teacher removes the tasks', async () => {
    await A.adm('deleteStudent', kids[0].id, true);
    assert.strictEqual(srv.db.prepare('SELECT COUNT(*) AS n FROM hw_sub WHERE student_id = ?').get(kids[0].id).n, 0);
    assert.ok(!fs.existsSync(path.join(hwDir, fileId + '.jpg')));
    await A.adm('deleteTeacher', B.id);
    assert.strictEqual(srv.db.prepare('SELECT COUNT(*) AS n FROM hw').get().n, 0);
    assert.strictEqual(srv.db.prepare('SELECT COUNT(*) AS n FROM hw_ann').get().n, 0);
    assert.strictEqual(srv.db.prepare('SELECT COUNT(*) AS n FROM hw_sub').get().n, 0);
    assert.deepStrictEqual(fs.readdirSync(hwDir), []);
  });
  await check('the student page has the tabs; the learning script is served', async () => {
    const c = client(base); await c.login(kids[1].login, kids[1].password);
    const h = await (await c.page('/my')).text(); assert.ok(h.indexOf('data-tab="learn"') > 0 && h.indexOf('data-tab="marks"') > 0 && h.indexOf('/js/my-learn.js') > 0);
    assert.strictEqual((await c.page('/js/my-learn.js')).status, 200);
  });

  http.close();
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
