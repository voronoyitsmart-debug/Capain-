'use strict';
// © Платон Вороний. All rights reserved. See LICENSE.
// Personal data: how long it is kept (automatic cleanup), a person's data on request (find, export, correct, delete),
// a teacher's own data (export, delete the account), the school's details for the Privacy Policy.
const { tx, audit } = require('./db');
const { USER } = require('./errors');
const learnOf = db => require('./learn').of(db);   // «🎓 Навчання» keeps homework in its own tables

const TERMS_VERSION = '2026-10-26';   // raise it when duties or liability change (not for typos or contact details): everybody accepts again
const DAY = 86400000;
const DEFAULTS = { keepDeviceDays: 90, keepAttemptDays: 0 };   // 0 = keep the results until the administrator deletes them
const SCHOOL_FIELDS = { legalName: 200, edrpou: 20, address: 200, person: 120, email: 120, phone: 40 };
const OWNER_FIELDS = { name: 200, email: 120, address: 200 };

const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const J = (s, d) => { try { const v = JSON.parse(s || ''); return v == null ? d : v; } catch (e) { return d; } };
const csvCell = v => { let x = String(v == null ? '' : v); if (/^[=+\-@\t\r]/.test(x)) x = "'" + x; return /[",;\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
const iso = ms => ms ? new Date(ms).toISOString().replace('T', ' ').slice(0, 16) : '';

function getMeta(db, k) { const r = db.prepare('SELECT v FROM meta WHERE k = ?').get(k); return r ? r.v : null; }
function setMeta(db, k, v) { db.prepare('INSERT INTO meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v').run(k, String(v)); }

/** Retention settings (administrator). */
function settings(db) {
  const r = J(getMeta(db, 'privacy'), {});
  const num = (v, d) => { const n = Math.floor(Number(v)); return Number.isFinite(n) && n >= 0 ? Math.min(n, 3650) : d; };
  return { keepDeviceDays: num(r.keepDeviceDays, DEFAULTS.keepDeviceDays), keepAttemptDays: num(r.keepAttemptDays, DEFAULTS.keepAttemptDays),
    owner: Object.assign({ name: '', email: '', address: '' }, r.owner || {}), lastCleanup: r.lastCleanup || 0, lastResult: r.lastResult || null };
}
function saveSettings(db, input) {
  const cur = settings(db), x = input || {};
  const owner = {}; Object.keys(OWNER_FIELDS).forEach(k => { owner[k] = clean(x.owner && x.owner[k] != null ? x.owner[k] : cur.owner[k], OWNER_FIELDS[k]); });
  const days = (v, d) => { const n = Math.floor(Number(v)); if (!Number.isFinite(n) || n < 0 || n > 3650) throw USER('bad_days', 'Days: a number from 0 to 3650.'); return n; };
  const next = { keepDeviceDays: x.keepDeviceDays != null ? days(x.keepDeviceDays) : cur.keepDeviceDays,
    keepAttemptDays: x.keepAttemptDays != null ? days(x.keepAttemptDays) : cur.keepAttemptDays, owner: owner, lastCleanup: cur.lastCleanup, lastResult: cur.lastResult };
  if (next.keepDeviceDays === 0) next.keepDeviceDays = 1;   // device data is never kept forever
  setMeta(db, 'privacy', JSON.stringify(next));
  return settings(db);
}

/**
 * The automatic cleanup (at start and once a day): device data (IP, browser id, fingerprint, browser name) of attempts
 * older than keepDeviceDays is erased; whole attempts (and marks) older than keepAttemptDays are deleted, if set.
 * deviceNow: erase the device data of every finished attempt now (the administrator's button).
 */
function cleanup(db, opts) {
  opts = opts || {};
  const s = settings(db), n = Date.now();
  return tx(db, () => {
    const devCut = opts.deviceNow ? n : n - s.keepDeviceDays * DAY;
    const devSql = "UPDATE attempts SET ip = '', dev_id = '', fp_hash = '', fp = '{}', ua = '' WHERE (ip <> '' OR dev_id <> '' OR fp_hash <> '' OR ua <> '') AND ";
    const dev = opts.deviceNow ? db.prepare(devSql + 'submitted IS NOT NULL').run().changes
      : db.prepare(devSql + 'started < ?').run(devCut).changes;
    db.prepare("UPDATE audit SET ip = '' WHERE ip <> '' AND at < ?").run(devCut);   // IPs in the action log: as long as device data
    let gone = 0, marks = 0;
    if (s.keepAttemptDays > 0) {
      const cut = n - s.keepAttemptDays * DAY;
      gone = db.prepare('DELETE FROM attempts WHERE started < ? AND (submitted IS NOT NULL OR deadline IS NULL OR deadline < ?)').run(cut, n).changes;
      marks = db.prepare('DELETE FROM grades WHERE updated < ?').run(cut).changes + db.prepare('DELETE FROM day_marks WHERE updated < ?').run(cut).changes
        + db.prepare('DELETE FROM final_marks WHERE updated < ?').run(cut).changes + db.prepare('DELETE FROM day_topics WHERE updated < ?').run(cut).changes;
    }
    const logs = db.prepare('DELETE FROM audit WHERE at < ?').run(n - 400 * DAY).changes;   // the action log: about a year
    const res = { device: dev, attempts: gone, grades: marks, log: logs, at: n };
    const cur = J(getMeta(db, 'privacy'), {}); cur.lastCleanup = n; cur.lastResult = res; setMeta(db, 'privacy', JSON.stringify(cur));
    return res;
  });
}

// ---------- the school's details (they go into the Privacy Policy: the school is the data controller) ----------
function schoolInfo(db, id) {
  const sc = db.prepare('SELECT id, name, info FROM schools WHERE id = ?').get(Number(id) || 0);
  if (!sc) return null;
  const info = J(sc.info, {}), out = { id: sc.id, name: sc.name };
  Object.keys(SCHOOL_FIELDS).forEach(k => { out[k] = info[k] || ''; });
  out.complete = !!(out.legalName && out.edrpou && out.address && out.person && out.email);
  return out;
}
function saveSchoolInfo(db, id, input) {
  const cur = schoolInfo(db, id); if (!cur) throw USER('sc_none', 'Choose a school.', 404);
  const x = input || {}, info = {};
  Object.keys(SCHOOL_FIELDS).forEach(k => { info[k] = clean(x[k] != null ? x[k] : cur[k], SCHOOL_FIELDS[k]); });
  if (info.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) throw USER('email', 'Check the e-mail address.');
  db.prepare('UPDATE schools SET info = ? WHERE id = ?').run(JSON.stringify(info), cur.id);
  return schoolInfo(db, cur.id);
}

// ---------- one student's data in the teacher's own tests (a request from a parent / student) ----------
/** People whose name contains q, among the attempts at this teacher's tests (all subjects). */
function findStudent(db, teacher, q) {
  q = clean(q, 80).toLowerCase();
  if (q.replace(/\s+/g, '').length < 2) throw USER('q_short', 'Type at least 2 letters of the name.');
  // a guest (no account) is told apart by name AND class: a namesake in another class is another person
  const rows = db.prepare("SELECT name_key, CASE WHEN student_id IS NULL THEN grp ELSE '' END AS g, MAX(name) AS name, MAX(grp) AS grp, MAX(student_id) AS student_id, COUNT(*) AS n, MAX(started) AS last FROM attempts WHERE teacher_id = ? GROUP BY name_key, g ORDER BY name LIMIT 2000").all(teacher.id);
  return { people: rows.filter(r => r.name.toLowerCase().indexOf(q) >= 0).slice(0, 50)
    .map(r => ({ key: r.name_key + '\u0001' + r.g, name: r.name, group: r.grp, account: r.student_id != null, attempts: r.n, last: r.last })) };
}
const splitKey = key => { const k = String(key || '').slice(0, 200), i = k.indexOf('\u0001'); return i < 0 ? { nk: k, g: null } : { nk: k.slice(0, i), g: k.slice(i + 1) }; };
const WHO = "a.teacher_id = ? AND a.name_key = ? AND (a.student_id IS NOT NULL OR ? IS NULL OR a.grp = ?)";
function attemptsOf(db, teacher, key) {
  const { nk, g } = splitKey(key);
  const rows = db.prepare('SELECT a.*, t.subject FROM attempts a LEFT JOIN tests t ON t.id = a.test_id WHERE ' + WHO + ' ORDER BY a.started').all(teacher.id, nk, g, g);
  if (!rows.length) throw USER('none', 'Nothing found for this student.', 404);
  return rows;
}
/** Everything stored about this student in the teacher's tests, as a CSV file (opens in Excel). */
function exportStudent(db, teacher, key, ip) {
  const rows = attemptsOf(db, teacher, key);
  const head = ['Ім’я', 'Клас', 'Предмет', 'Тест', 'Код', 'Почав', 'Здав', 'Статус', 'Бали', 'Макс', 'Відповіді', 'IP', 'Браузер'];
  const lines = [head.join(';')].concat(rows.map(r => [r.name, r.grp, r.subject || '', r.ttitle, r.test_id, iso(r.started), iso(r.submitted), r.status,
    r.score, r.max, r.answers, r.ip, r.ua].map(csvCell).join(';')));
  const grades = rows[0].student_id != null ? db.prepare('SELECT g.grade, g.note, g.updated, t.title FROM grades g LEFT JOIN tests t ON t.id = g.test_id WHERE g.teacher_id = ? AND g.student_id = ?').all(teacher.id, rows[0].student_id) : [];
  if (grades.length) { lines.push(''); lines.push(['Тест', 'Оцінка', 'Примітка', 'Змінено'].join(';')); grades.forEach(g => lines.push([g.title, g.grade, g.note, iso(g.updated)].map(csvCell).join(';'))); }
  const L = learnOf(db), hw = L && rows[0].student_id != null ? L.exportStudent(rows[0].student_id, teacher.id) : [];
  if (hw.length) { lines.push(''); lines.push(['Домашнє завдання', 'Предмет', 'Термін', 'Відповідь', 'Фото', 'Здано', 'Статус', 'Оцінка', 'Коментар'].join(';'));
    hw.forEach(h => lines.push([h.title, h.subject, iso(h.due), h.text, h.photos, iso(h.submitted), h.status, h.grade, h.comment].map(csvCell).join(';'))); }
  audit(db, teacher.email, 'data.export', rows[0].name, ip || '');
  return { name: 'student-' + rows[0].name.replace(/[^\p{L}\p{N}]+/gu, '_').slice(0, 40) + '.csv', csv: '﻿' + lines.join('\r\n') };
}
/** Delete every attempt (and mark) of this student in the teacher's tests. */
function deleteStudent(db, teacher, key, ip) {
  const rows = attemptsOf(db, teacher, key);
  return tx(db, () => {
    const ids = rows.map(r => r.id), del = db.prepare('DELETE FROM attempts WHERE id = ?');
    let n = 0; ids.forEach(id => { n += del.run(id).changes; });
    if (rows[0].student_id != null) { db.prepare('DELETE FROM grades WHERE teacher_id = ? AND student_id = ?').run(teacher.id, rows[0].student_id); db.prepare('DELETE FROM day_marks WHERE teacher_id = ? AND student_id = ?').run(teacher.id, rows[0].student_id); db.prepare('DELETE FROM final_marks WHERE teacher_id = ? AND student_id = ?').run(teacher.id, rows[0].student_id);
      const L = learnOf(db); if (L) L.purgeStudent(rows[0].student_id, teacher.id); }   // homework answers, marks and photos in this teacher's tasks
    audit(db, teacher.email, 'data.delete', rows[0].name + ' (' + n + ')', ip || '');
    return { ok: true, deleted: n };
  });
}
/** Correct the name of a student who took tests without an account (account names are corrected by the administrator). */
function renameStudent(db, teacher, key, name, nameKey, ip) {
  const rows = attemptsOf(db, teacher, key);
  if (rows[0].student_id != null) throw USER('acc_name', 'This student has an account: the administrator corrects the name in the admin panel.');
  name = clean(name, 80); if (name.replace(/\s+/g, '').length < 2) throw USER('name', 'Type the full name.');
  const nk = nameKey(name);
  if (nk !== rows[0].name_key && db.prepare('SELECT 1 FROM attempts WHERE teacher_id = ? AND name_key = ? AND test_id IN (SELECT test_id FROM attempts WHERE teacher_id = ? AND name_key = ?)').get(teacher.id, nk, teacher.id, rows[0].name_key))
    throw USER('name_taken', 'Another student with this name already took one of these tests.');
  const up = db.prepare('UPDATE attempts SET name = ?, name_key = ? WHERE id = ?'); rows.forEach(r => up.run(name, nk, r.id));
  audit(db, teacher.email, 'data.rename', rows[0].name + ' → ' + name, ip || '');
  return { ok: true, key: nk + '\u0001' + rows[0].grp, name: name };
}

// ---------- a teacher's own data ----------
function exportTeacher(db, teacher) {
  const me = db.prepare('SELECT id, email, name, role, created, last_login, classes, school_id, terms_at, terms_ver, ai_ack_at FROM teachers WHERE id = ?').get(teacher.id);
  const school = db.prepare('SELECT name FROM schools WHERE id = ?').get(me.school_id || 0);
  return {
    exported: new Date().toISOString(), account: Object.assign(me, { school: school ? school.name : '', aiKey: teacher.ai_key ? '(saved, not exported)' : '' }),
    tests: db.prepare('SELECT id, subject, title, folder, status, created, updated, settings, content FROM tests WHERE teacher_id = ? ORDER BY created').all(teacher.id)
      .map(t => Object.assign(t, { settings: J(t.settings, {}), content: J(t.content, {}) })),
    attempts: db.prepare('SELECT test_id, name, grp, started, submitted, status, score, max, answers FROM attempts WHERE teacher_id = ? ORDER BY started').all(teacher.id)
      .map(a => Object.assign(a, { answers: J(a.answers, {}) })),
    grades: db.prepare('SELECT test_id, student_id, grade, note, updated FROM grades WHERE teacher_id = ?').all(teacher.id),
    dayMarks: db.prepare('SELECT subject, student_id, day, grade, note, updated FROM day_marks WHERE teacher_id = ? ORDER BY day').all(teacher.id),
    lessonTopics: db.prepare('SELECT subject, cls, grp, day, topic, updated FROM day_topics WHERE teacher_id = ? ORDER BY day').all(teacher.id),
    finalMarks: db.prepare('SELECT subject, student_id, period, grade, updated FROM final_marks WHERE teacher_id = ?').all(teacher.id),
    ...(learnOf(db) ? learnOf(db).forTeacherExport(teacher.id) : {}),
    log: db.prepare('SELECT at, action, detail FROM audit WHERE who = ? ORDER BY at DESC LIMIT 1000').all(teacher.email)
  };
}

module.exports = { TERMS_VERSION, settings, saveSettings, cleanup, schoolInfo, saveSchoolInfo, findStudent, exportStudent, deleteStudent, renameStudent, exportTeacher };
