'use strict';
// © Платон Вороний. All rights reserved. See LICENSE.
// Parents: read-only access to ONE student by a code the school's administrator gives the parent (on paper, in person).
// Nothing about the parent is kept: only a hash of the code, when it was made, when it ends, when it was last used.
// The school's administrator turns this on for the school (off by default), makes a new code (the old one stops) or takes it back.
// The parent sees the child's marks, absences, homework (no answers or photos), topics to repeat and the class's announcements.
const crypto = require('crypto');
const { code, sha, audit } = require('./db');
const { USER } = require('./errors');

const VALID_MS = 365 * 86400000;   // a code works for a year (one school year), then the administrator makes a new one
const KEY = id => 'parents.on.' + Number(id);

function isOn(db, schoolId) { const r = db.prepare('SELECT v FROM meta WHERE k = ?').get(KEY(schoolId)); return !!r && r.v === '1'; }
function setOn(db, schoolId, on) { db.prepare('INSERT INTO meta (k, v) VALUES (?, ?) ON CONFLICT (k) DO UPDATE SET v = excluded.v').run(KEY(schoolId), on ? '1' : '0'); }

/** The code as people type it: 16 letters and digits in groups of four (dashes, spaces and case do not matter). */
function norm(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 32); }
function pretty(c) { return c.match(/.{1,4}/g).join('-'); }
function hashOf(c) { return sha('parent:' + norm(c)); }

/** The current code of a student (without the code itself): { created, expires, lastUsed } or null. */
function statusOf(db, studentId) {
  const r = db.prepare('SELECT created, expires, last_used FROM parent_codes WHERE student_id = ? AND expires > ? ORDER BY created DESC LIMIT 1').get(Number(studentId) || 0, Date.now());
  return r ? { created: r.created, expires: r.expires, lastUsed: r.last_used || null } : null;
}
/** Sign out every parent of this student (a new code, the code taken back, the student moved or deleted). */
function endSessions(db, studentId) {
  db.prepare("DELETE FROM sessions WHERE kind = 'parent' AND teacher_id IN (SELECT id FROM parent_codes WHERE student_id = ?)").run(Number(studentId) || 0);
}
function revoke(db, studentId) {
  endSessions(db, studentId);
  return db.prepare('DELETE FROM parent_codes WHERE student_id = ?').run(Number(studentId) || 0).changes;
}
/** A new code for a student: the old one stops at once. The code is returned only now; the database keeps only its hash. */
function issue(db, student, by) {
  revoke(db, student.id);
  const c = code(16), n = Date.now();
  db.prepare('INSERT INTO parent_codes (student_id, school_id, hash, created, expires, made_by) VALUES (?, ?, ?, ?, ?, ?)').run(student.id, student.school_id, hashOf(c), n, n + VALID_MS, String(by || '').slice(0, 120));
  return { code: pretty(c), expires: n + VALID_MS };
}
/** The code a parent typed → { codeId, student } (or null: wrong, ended, the school turned parents off, the student is off). */
function check(db, typed) {
  const c = norm(typed); if (c.length !== 16) return null;
  const r = db.prepare('SELECT * FROM parent_codes WHERE hash = ?').get(hashOf(c));
  if (!r || r.expires <= Date.now() || !isOn(db, r.school_id)) return null;
  const st = db.prepare('SELECT id, name, class_name, school_id, login FROM students WHERE id = ? AND active = 1').get(r.student_id);
  if (!st || st.school_id !== r.school_id) return null;
  db.prepare('UPDATE parent_codes SET last_used = ? WHERE id = ?').run(Date.now(), r.id);
  return { codeId: r.id, student: st };
}
/** The signed-in parent's code row and student, checked again on every request. */
function ofSession(db, s) {
  if (!s || s.kind !== 'parent') return null;
  const r = db.prepare('SELECT * FROM parent_codes WHERE id = ?').get(s.teacher_id);
  if (!r || r.expires <= Date.now() || !isOn(db, r.school_id)) return null;
  const st = db.prepare('SELECT id, name, class_name, school_id, login FROM students WHERE id = ? AND active = 1').get(r.student_id);
  return st && st.school_id === r.school_id ? { codeId: r.id, student: st } : null;
}
function cleanup(db) { return db.prepare('DELETE FROM parent_codes WHERE expires <= ?').run(Date.now()).changes; }

/**
 * What the parent sees. Built from the same data as the student's own pages, minus anything the parent does not need:
 * no answers or photos of homework, no names of other students, no device data.
 */
function home(api, learn, p) {
  const st = p.student, db = api.db;
  const school = (db.prepare('SELECT name FROM schools WHERE id = ?').get(st.school_id) || {}).name || '';
  const L = learn ? learn.studentHome(st) : { tasks: [], subjects: [] };
  const rep = api.reportOf(st);
  const finals = {}; db.prepare('SELECT subject, period, grade FROM final_marks WHERE student_id = ?').all(st.id).forEach(f => { (finals[f.subject] = finals[f.subject] || {})[f.period] = f.grade; });
  const bySubj = {}; (L.subjects || []).forEach(s => { bySubj[s.key] = s; });
  const keys = {}; Object.keys(bySubj).concat(rep.subjects.map(s => s.key), Object.keys(finals)).forEach(k => { keys[k] = 1; });
  const subjects = Object.keys(api.subjects).filter(k => keys[k] && !api.subjectOff(st, k)).map(k => {
    const S = api.subjects[k], m = bySubj[k] || {}, r = rep.subjects.filter(x => x.key === k)[0] || {};
    return { key: k, icon: S.icon, name: S.info.name, avg: m.avg == null ? null : m.avg, level: m.level || '',
      marks: (m.marks || []).map(x => ({ kind: x.kind, grade: x.grade, at: x.at, title: x.title || '', note: x.note || '' })),
      absent: r.absent || { n: 0, np: 0 }, pct: r.pct == null ? null : r.pct, trend: r.trend || '', finals: finals[k] || {},
      weak: (r.weak || []).slice(0, 5).map(w => ({ title: w.title, pct: w.pct, parts: (w.parts || []).slice(0, 3).map(x => x.title) })) };
  });
  const tasks = (L.tasks || []).map(h => ({ id: h.id, subject: h.subject, title: h.title, due: h.due, state: h.state, grade: h.grade || '', comment: h.comment || '', teacher: h.teacher || '', late: !!h.late }));
  const notes = learn && typeof learn.announcementsFor === 'function' ? (learn.announcementsFor(st) || []).map(a => ({ subject: a.subject || '', icon: a.icon || '', subjectName: a.subjectName || '', text: a.text, at: a.at, until: a.until || null, teacher: a.teacher || '' })) : [];
  return { student: { name: st.name, cls: st.class_name, school: school }, serverNow: Date.now(), subjects: subjects, tasks: tasks, announcements: notes,
    icons: Object.keys(api.subjects).reduce((o, k) => { o[k] = { icon: api.subjects[k].icon, name: api.subjects[k].info.name }; return o; }, {}) };
}

function logIn(db, p, ip) { audit(db, 'parent#' + p.codeId, 'parent.login', p.student.name + ' (' + p.student.class_name + ')', ip || ''); }

module.exports = { VALID_MS, isOn, setOn, norm, pretty, statusOf, endSessions, revoke, issue, check, ofSession, cleanup, home, logIn };
