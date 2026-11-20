'use strict';
// © Kvizora. All rights reserved. See LICENSE.
// «🎓 Навчання» — the learning tab next to the tests: homework (a teacher sets it for a class or a group, students hand in
// a written answer, a Kvizora test or nothing; the teacher marks it 1–12 or sends it back), every mark of a student in one
// place, and how a class is doing (progress). Marks reuse the gradebook (grades, day_marks): homework marks show up there
// on the due day and in the student report.
// Photos of a notebook (an answer written by hand): only when the school's administrator turned them on (off by default),
// at most 3 per answer, JPEG only, metadata removed on the server, files outside the database, deleted after 30 days.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { tx, audit } = require('./db');
const { USER } = require('./errors');

const DAY = 86400000;
const PHOTO = { perAnswer: 3, perTask: 5, maxBytes: 1024 * 1024, maxSide: 4000 };
const KINDS = ['text', 'test', 'none'];   // the student writes an answer / takes the linked test / hands in nothing (the teacher only marks)
const DEFAULTS = { keepFileDays: 30, filesMaxMb: Number(process.env.HW_FILES_MAX_MB) || 2048 };

const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').replace(/\r\n?/g, '\n').trim().slice(0, n);
const line = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const J = (s, d) => { try { const v = JSON.parse(s || ''); return v == null ? d : v; } catch (e) { return d; } };
function classKey(s) { return String(s || '').toLowerCase().replace(/[\s\-–—._/]+/g, ''); }
const isAdm = t => !!t && (t.role === 'owner' || t.role === 'admin');
const num = g => /^\d+$/.test(String(g || '')) ? Number(g) : null;
/** A mark: 1–12, a short word («н», «зар.») or '' (none). */
function cleanGrade(g) {
  g = String(g == null ? '' : g).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 12);
  if (/^\d+$/.test(g) && (Number(g) < 1 || Number(g) > 12)) throw USER('bad_grade', 'A mark is from 1 to 12.');
  return g;
}
/** The level of a 1–12 mark (the 12-point scale of Ukrainian schools). */
const levelOf = m => m == null ? '' : m >= 10 ? 'high' : m >= 7 ? 'sufficient' : m >= 4 ? 'middle' : 'initial';
const avg = a => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length * 10) / 10 : null;

// ---------- photos: a JPEG made by the page, cleaned again here ----------
/**
 * Keeps only what is needed to show the picture: no EXIF (place, camera, time), no comments, nothing after the end of the
 * image (a file that is also something else is cut off). Anything that is not a well-formed JPEG is refused.
 */
function cleanJpeg(buf) {
  const bad = () => { throw USER('bad_photo', 'This photo could not be read. Take it again (JPEG or PNG from the camera).'); };
  if (!Buffer.isBuffer(buf) || buf.length < 4 || buf[0] !== 0xFF || buf[1] !== 0xD8) bad();
  const out = [Buffer.from([0xFF, 0xD8])];
  let i = 2, sof = false;
  while (i < buf.length) {
    if (buf[i] !== 0xFF) bad();
    const m = buf[i + 1];
    if (m === 0xFF) { i++; continue; }   // fill bytes
    if (m === 0xD9) { out.push(Buffer.from([0xFF, 0xD9])); return sof ? Buffer.concat(out) : bad(); }
    if (m >= 0xD0 && m <= 0xD7) bad();
    if (i + 4 > buf.length) bad();
    const len = buf.readUInt16BE(i + 2); if (len < 2 || i + 2 + len > buf.length) bad();
    const seg = buf.subarray(i, i + 2 + len);
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) {   // frame header: the picture's size
      sof = true; const h = seg.readUInt16BE(5), w = seg.readUInt16BE(7);
      if (!w || !h || w > PHOTO.maxSide || h > PHOTO.maxSide) throw USER('photo_big', 'The photo is too large.');
    }
    const keep = !(m >= 0xE1 && m <= 0xEF) && m !== 0xFE;   // APP0 (JFIF) stays; APP1–APP15 (EXIF, XMP, ICC…) and COM go
    if (keep) out.push(seg);
    i += 2 + len;
    if (m === 0xDA) {   // the image data runs up to the next marker that is not a restart / stuffed byte
      let j = i;
      while (j < buf.length - 1 && !(buf[j] === 0xFF && buf[j + 1] !== 0x00 && !(buf[j + 1] >= 0xD0 && buf[j + 1] <= 0xD7))) j++;
      if (j >= buf.length - 1) bad();
      out.push(buf.subarray(i, j)); i = j;
    }
  }
  return bad();
}
function decodePhoto(x) {
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(x || ''));
  if (!m) throw USER('bad_photo', 'This photo could not be read. Take it again (JPEG or PNG from the camera).');
  const buf = Buffer.from(m[1], 'base64');
  if (buf.length > PHOTO.maxBytes) throw USER('photo_big', 'The photo is too large.');
  return cleanJpeg(buf);
}

const BY_DB = new WeakMap();   // privacy.js and admin.js find the tab's data through the database they were given

class Learn {
  /** dir: where the photos are kept (data/hw-files next to the database). */
  constructor(db, api, dir) {
    this.db = db; this.api = api; this.dir = dir; BY_DB.set(db, this);
    db.exec(`
CREATE TABLE IF NOT EXISTS hw (            -- homework: a teacher's task for a class (or one group of it)
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL,
  school_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  class_name TEXT NOT NULL,
  grp INTEGER NOT NULL DEFAULT 0,          -- 0 = the whole class
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'text',
  test_id TEXT NOT NULL DEFAULT '',
  due INTEGER NOT NULL,
  late INTEGER NOT NULL DEFAULT 1,         -- answers after the due time are still taken (marked «late»)
  created INTEGER NOT NULL,
  updated INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS hw_teacher ON hw (teacher_id);
CREATE INDEX IF NOT EXISTS hw_school ON hw (school_id);
CREATE TABLE IF NOT EXISTS hw_sub (        -- a student's answer and the teacher's mark
  hw_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'submitted', -- submitted / returned (do it again) / checked
  submitted INTEGER,
  late INTEGER NOT NULL DEFAULT 0,
  grade TEXT NOT NULL DEFAULT '',
  comment TEXT NOT NULL DEFAULT '',
  checked INTEGER,
  updated INTEGER NOT NULL,
  PRIMARY KEY (hw_id, student_id)
);
CREATE INDEX IF NOT EXISTS hw_sub_student ON hw_sub (student_id);
CREATE TABLE IF NOT EXISTS hw_files (      -- photos: the file is in data/hw-files, here only its random name
  id TEXT PRIMARY KEY,
  hw_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL DEFAULT 0,   -- 0 = the teacher's picture for the task
  size INTEGER NOT NULL,
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS hw_files_hw ON hw_files (hw_id, student_id);
CREATE TABLE IF NOT EXISTS hw_ann (        -- a teacher's announcement to a class (or a group): text only, no files, no comments
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL,
  school_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  class_name TEXT NOT NULL,
  grp INTEGER NOT NULL DEFAULT 0,
  text TEXT NOT NULL,
  created INTEGER NOT NULL,
  until INTEGER NOT NULL                   -- shown to the students until then
);
CREATE INDEX IF NOT EXISTS hw_ann_school ON hw_ann (school_id);
`);
    // columns added later: how the teacher will mark the task (optional, shown to the students)
    if (!db.prepare('PRAGMA table_info(hw)').all().some(c => c.name === 'criteria')) db.exec("ALTER TABLE hw ADD COLUMN criteria TEXT NOT NULL DEFAULT ''");
  }

  // ---------- settings ----------
  settings() { const r = this.db.prepare("SELECT v FROM meta WHERE k = 'learn'").get(); return Object.assign({}, DEFAULTS, J(r && r.v, {})); }
  photosOn(schoolId) {
    const r = this.db.prepare('SELECT info FROM schools WHERE id = ?').get(Number(schoolId) || 0);
    return !!J(r && r.info, {}).hwPhotos;
  }
  /** The school's administrator (or the owner) turns photos in answers on or off for the school. */
  setPhotos(me, on) {
    if (!isAdm(me)) throw USER('forbidden', 'Only an administrator can do this.', 403);
    const r = this.db.prepare('SELECT info FROM schools WHERE id = ?').get(me.school_id || 0); if (!r) throw USER('sc_none', 'Choose a school.', 404);
    const info = J(r.info, {}); info.hwPhotos = !!on;
    this.db.prepare('UPDATE schools SET info = ? WHERE id = ?').run(JSON.stringify(info), me.school_id);
    audit(this.db, me.email, 'learn.photos', on ? 'on' : 'off', '');
    return { photos: !!on };
  }

  // ---------- files ----------
  fileOf(id) { return /^[a-f0-9]{32}$/.test(String(id || '')) ? path.join(this.dir, id + '.jpg') : null; }
  usedBytes() { return this.db.prepare('SELECT COALESCE(SUM(size), 0) AS n FROM hw_files').get().n; }
  /** Photos from the page, checked and cleaned before anything is changed (so a bad photo changes nothing). */
  prepFiles(list) {
    const bufs = (Array.isArray(list) ? list : []).slice(0, 10).map(decodePhoto);
    if (bufs.length && this.usedBytes() + bufs.reduce((n, b) => n + b.length, 0) > this.settings().filesMaxMb * 1048576) throw USER('disk_full', 'There is no room for photos on the server. Tell the administrator.', 507);
    return bufs;
  }
  /** Inside a transaction: the files are written first; if the transaction fails they are removed again (see written). */
  writeFiles(hwId, studentId, bufs, written) {
    if (!bufs.length) return;
    fs.mkdirSync(this.dir, { recursive: true });
    bufs.forEach(b => {
      const id = crypto.randomBytes(16).toString('hex');
      fs.writeFileSync(this.fileOf(id), b, { mode: 0o600 }); written.push(id);
      this.db.prepare('INSERT INTO hw_files (id, hw_id, student_id, size, created) VALUES (?, ?, ?, ?, ?)').run(id, hwId, studentId, b.length, Date.now());
    });
  }
  unlink(ids) { ids.forEach(id => { try { fs.unlinkSync(this.fileOf(id)); } catch (e) {} }); }
  /** fn changes the database (in one transaction) and returns the photo ids it removed; their files go only after it worked. */
  withFiles(fn) {
    const written = [];
    let out;
    try { out = tx(this.db, () => fn(written)); } catch (e) { this.unlink(written); throw e; }
    this.unlink(out.gone || []);
    return out.result;
  }
  forget(where, ...args) {
    const ids = this.db.prepare('SELECT id FROM hw_files WHERE ' + where).all(...args).map(r => r.id);
    this.db.prepare('DELETE FROM hw_files WHERE ' + where).run(...args);
    return ids;
  }
  dropFiles(where, ...args) { const ids = this.forget(where, ...args); this.unlink(ids); return ids.length; }
  filesOf(hwId, studentId) { return this.db.prepare('SELECT id FROM hw_files WHERE hw_id = ? AND student_id = ? ORDER BY created').all(hwId, studentId).map(r => r.id); }
  /** A photo for whoever may see it: the teacher of the task; the student who handed it in; the task's own pictures for its class. */
  file(who, id) {
    const f = this.db.prepare('SELECT f.*, h.teacher_id, h.school_id, h.class_name, h.grp, h.subject FROM hw_files f JOIN hw h ON h.id = f.hw_id WHERE f.id = ?').get(String(id || ''));
    if (!f) return null;
    const ok = who.staff ? f.teacher_id === who.staff.id
      : who.student && (f.student_id === who.student.id || (!f.student_id && this.forStudent(f, this.studentRow(who.student.id))));
    if (!ok) return null;
    try { return fs.readFileSync(this.fileOf(f.id)); } catch (e) { return null; }
  }

  // ---------- who sees a task ----------
  studentRow(id) { return this.db.prepare('SELECT id, name, login, class_name, school_id, subgroup FROM students WHERE id = ? AND active = 1').get(id); }
  forStudent(h, st) {
    if (!st || h.school_id !== st.school_id || classKey(h.class_name) !== classKey(st.class_name)) return false;
    if (h.grp && h.grp !== (st.subgroup || 0)) return false;
    return !this.api.subjectOff(st, h.subject);
  }
  studentsOf(h) {
    return this.db.prepare('SELECT id, name, login, class_name, subgroup FROM students WHERE school_id = ? AND active = 1').all(h.school_id)
      .filter(s => classKey(s.class_name) === classKey(h.class_name) && (!h.grp || s.subgroup === h.grp)).sort((a, b) => a.name.localeCompare(b.name, 'uk'));
  }
  ownHw(t, id) {
    const h = this.db.prepare('SELECT * FROM hw WHERE id = ? AND teacher_id = ?').get(Number(id) || 0, t.id);
    if (!h) throw USER('hw_none', 'This task was not found.', 404);
    return h;
  }
  /** The state of one student's task: todo / missing (late, nothing handed in) / submitted / returned / checked. */
  stateOf(h, s, n, att) {
    if (s && s.status === 'checked') return 'checked';
    if (s && s.status === 'returned') return 'returned';
    if (s && s.submitted) return 'submitted';
    if (h.kind === 'test' && att && att.submitted) return 'submitted';
    return h.due < n ? 'missing' : 'todo';
  }
  /** Did this teacher set homework for the student's class (then the teacher teaches the student: the report is allowed)? */
  teaches(t, st) { return this.db.prepare('SELECT class_name FROM hw WHERE teacher_id = ? AND school_id = ?').all(t.id, st.school_id || 0).some(h => classKey(h.class_name) === classKey(st.class_name)); }
  attemptOf(h, studentId) {
    return h.kind === 'test' && h.test_id ? this.db.prepare('SELECT status, submitted, score, max FROM attempts WHERE test_id = ? AND student_id = ? ORDER BY started DESC LIMIT 1').get(h.test_id, studentId) : null;
  }

  // ======================================================================
  //  TEACHER
  // ======================================================================
  /** The tab's start: subjects, the school's classes (with groups), the teacher's published tests to link, settings. */
  home(t) {
    const S = this.api.subjects, gc = this.api.gradeClasses(t);
    const tests = this.db.prepare("SELECT id, subject, title FROM tests WHERE teacher_id = ? AND status = 'published' ORDER BY updated DESC").all(t.id).filter(x => S[x.subject]);
    return { me: { name: t.name, role: t.role, school: (this.db.prepare('SELECT name FROM schools WHERE id = ?').get(t.school_id || 0) || {}).name || '' },
      subjects: Object.keys(S).map(k => ({ key: k, icon: S[k].icon, name: S[k].info.name })),
      classes: gc.classes, tests: tests, photos: this.photosOn(t.school_id), photoLimits: PHOTO, keepFileDays: this.settings().keepFileDays, serverNow: Date.now() };
  }
  /** The teacher's tasks (newest due first), with how many handed in and how many are checked. */
  list(t, filter) {
    const f = filter || {}, n = Date.now();
    const rows = this.db.prepare('SELECT * FROM hw WHERE teacher_id = ? ORDER BY due DESC LIMIT 500').all(t.id)
      .filter(h => (!f.cls || classKey(h.class_name) === classKey(f.cls)) && (!f.subject || h.subject === f.subject));
    return { serverNow: n, tasks: rows.map(h => {
      const st = this.studentsOf(h), ids = {}; st.forEach(s => { ids[s.id] = 1; });
      const subs = this.db.prepare('SELECT * FROM hw_sub WHERE hw_id = ?').all(h.id).filter(s => ids[s.student_id]);
      const by = {}; subs.forEach(s => { by[s.student_id] = s; });
      let done = 0, toCheck = 0, checked = 0;
      st.forEach(s => { const x = this.stateOf(h, by[s.id], n, this.attemptOf(h, s.id)); if (x === 'submitted') { done++; toCheck++; } else if (x === 'checked') { done++; checked++; } });
      return this.pub(h, { students: st.length, done: done, toCheck: toCheck, checked: checked });
    }) };
  }
  pub(h, extra) {
    const S = this.api.subjects[h.subject];
    return Object.assign({ id: h.id, subject: h.subject, icon: S ? S.icon : '📘', subjectName: S ? S.info.name : { uk: h.subject }, cls: h.class_name, group: h.grp,
      title: h.title, body: h.body, criteria: h.criteria || '', kind: h.kind, testId: h.test_id, due: h.due, late: !!h.late, created: h.created, files: this.filesOf(h.id, 0) }, extra || {});
  }
  /** Create (no id) or change a task. */
  save(t, input) {
    const x = input || {}, n = Date.now(), S = this.api.subjects;
    const subject = String(x.subject || ''); if (!S[subject]) throw USER('not_found', 'Unknown subject.', 404);
    const cls = line(x.cls, 60), k = classKey(cls);
    if (!k || !this.api.classesOf(t.id).some(c => classKey(c) === k)) throw USER('cls_none', 'Choose a class.');
    if (this.api.subjectOff({ class_name: cls, school_id: t.school_id }, subject)) throw USER('subject_off', 'This subject is turned off for this class.');
    const grp = Math.max(0, Math.min(9, Math.floor(Number(x.group) || 0)));
    const title = line(x.title, 140); if (title.length < 2) throw USER('hw_title', 'Type what the task is called.');
    const body = clean(x.body, 8000), criteria = clean(x.criteria, 2000);
    const kind = KINDS.indexOf(x.kind) >= 0 ? x.kind : 'text';
    let testId = '';
    if (kind === 'test') {
      testId = String(x.testId || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
      if (!this.db.prepare('SELECT 1 FROM tests WHERE id = ? AND teacher_id = ? AND subject = ?').get(testId, t.id, subject)) throw USER('hw_test', 'Choose one of your tests of this subject.');
    }
    const due = Math.floor(Number(x.due));
    if (!Number.isFinite(due) || due < n - 366 * DAY || due > n + 366 * DAY) throw USER('hw_due', 'Choose when the task is due.');
    const late = x.late === false ? 0 : 1;
    const bufs = this.prepFiles(x.files);
    return this.withFiles(written => {
      let id = Number(x.id) || 0, gone = [];
      if (id) {
        const h = this.ownHw(t, id);
        this.db.prepare('UPDATE hw SET subject = ?, class_name = ?, grp = ?, title = ?, body = ?, criteria = ?, kind = ?, test_id = ?, due = ?, late = ?, updated = ? WHERE id = ?')
          .run(subject, cls, grp, title, body, criteria, kind, testId, due, late, n, h.id);
        (Array.isArray(x.removeFiles) ? x.removeFiles : []).forEach(f => { if (/^[a-f0-9]{32}$/.test(String(f))) gone = gone.concat(this.forget('id = ? AND hw_id = ? AND student_id = 0', String(f), h.id)); });
      } else {
        id = Number(this.db.prepare('INSERT INTO hw (teacher_id, school_id, subject, class_name, grp, title, body, criteria, kind, test_id, due, late, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .run(t.id, t.school_id || 0, subject, cls, grp, title, body, criteria, kind, testId, due, late, n, n).lastInsertRowid);
      }
      if (this.filesOf(id, 0).length + bufs.length > PHOTO.perTask) throw USER('photo_many', 'Too many photos: at most ' + PHOTO.perTask + '.');
      this.writeFiles(id, 0, bufs, written);
      return { gone: gone, result: this.pub(this.ownHw(t, id)) };
    });
  }
  remove(t, id) {
    const h = this.ownHw(t, id);
    this.withFiles(() => {
      const gone = this.forget('hw_id = ?', h.id);
      this.db.prepare('DELETE FROM hw_sub WHERE hw_id = ?').run(h.id);
      this.db.prepare('DELETE FROM hw WHERE id = ?').run(h.id);
      return { gone: gone };
    });
    audit(this.db, t.email, 'hw.delete', h.title + ' (' + h.class_name + ')', '');
    return { ok: true };
  }
  /** One task with every student of the class (group): the answer, the photos, the linked test's result, the mark. */
  detail(t, id) {
    const h = this.ownHw(t, id), n = Date.now();
    const subs = {}; this.db.prepare('SELECT * FROM hw_sub WHERE hw_id = ?').all(h.id).forEach(s => { subs[s.student_id] = s; });
    return Object.assign(this.pub(h), { photos: this.photosOn(h.school_id), serverNow: n, students: this.studentsOf(h).map(st => {
      const s = subs[st.id], a = this.attemptOf(h, st.id);
      const out = { id: st.id, name: st.name, group: st.subgroup || 0, state: this.stateOf(h, s, n, a),
        text: s ? s.text : '', submitted: s ? s.submitted : null, late: !!(s && s.late), grade: s ? s.grade : '', comment: s ? s.comment : '', files: this.filesOf(h.id, st.id) };
      if (a) { out.test = { status: a.status, submitted: a.submitted, score: a.score, max: a.max };
        if (a.submitted && a.max) out.suggest = Math.max(1, Math.min(12, Math.round(a.score / a.max * 12))); }
      return out;
    }) });
  }
  /** The teacher's mark and comment. back: send the answer back to be done again (the comment says what to fix). */
  mark(t, id, studentId, grade, comment, back) {
    const h = this.ownHw(t, id), st = this.studentRow(Number(studentId) || 0);
    if (!st || !this.forStudent(h, st)) throw USER('st_none', 'This student was not found.', 404);
    grade = cleanGrade(grade); comment = clean(comment, 1000);
    const n = Date.now(), s = this.db.prepare('SELECT * FROM hw_sub WHERE hw_id = ? AND student_id = ?').get(h.id, st.id);
    const status = back ? 'returned' : (grade || comment ? 'checked' : (s && s.submitted ? 'submitted' : ''));
    if (!status) { this.db.prepare('DELETE FROM hw_sub WHERE hw_id = ? AND student_id = ?').run(h.id, st.id); return { ok: true, state: this.stateOf(h, null, n, this.attemptOf(h, st.id)), grade: '', comment: '' }; }
    if (s) this.db.prepare('UPDATE hw_sub SET grade = ?, comment = ?, status = ?, checked = ?, updated = ? WHERE hw_id = ? AND student_id = ?').run(back ? '' : grade, comment, status, n, n, h.id, st.id);
    else this.db.prepare('INSERT INTO hw_sub (hw_id, student_id, status, grade, comment, checked, updated) VALUES (?, ?, ?, ?, ?, ?, ?)').run(h.id, st.id, status, back ? '' : grade, comment, n, n);
    const s2 = this.db.prepare('SELECT * FROM hw_sub WHERE hw_id = ? AND student_id = ?').get(h.id, st.id);
    return { ok: true, state: this.stateOf(h, s2, n, this.attemptOf(h, st.id)), grade: s2.grade, comment: s2.comment };
  }
  /** The teacher removes a student's photo; report: it was not acceptable — the school's administrator sees it in the log. */
  dropPhoto(t, fileId, report) {
    const f = this.db.prepare('SELECT f.*, h.teacher_id, h.title, h.class_name FROM hw_files f JOIN hw h ON h.id = f.hw_id WHERE f.id = ?').get(String(fileId || ''));
    if (!f || f.teacher_id !== t.id) throw USER('not_found', 'This photo was not found.', 404);
    this.dropFiles('id = ?', f.id);
    if (report) {
      const st = this.db.prepare('SELECT name, login FROM students WHERE id = ?').get(f.student_id) || {};
      audit(this.db, t.email, 'hw.photo.report', (st.name || '?') + ' (' + (st.login || '') + ', ' + f.class_name + ') · ' + f.title, '');
    }
    return { ok: true };
  }

  // ---------- announcements to a class: text only (no files, no comments), shown in the students' «🎓 Навчання» ----------
  /** The teacher's own announcements (newest first). */
  announcements(t) {
    const n = Date.now();
    return { serverNow: n, list: this.db.prepare('SELECT * FROM hw_ann WHERE teacher_id = ? ORDER BY created DESC LIMIT 200').all(t.id).map(a => this.annPub(a, { active: a.until >= n })) };
  }
  annPub(a, extra) {
    const S = this.api.subjects[a.subject];
    return Object.assign({ id: a.id, subject: a.subject, icon: S ? S.icon : '📘', subjectName: S ? S.info.name : { uk: a.subject }, cls: a.class_name, group: a.grp, text: a.text, at: a.created, until: a.until }, extra || {});
  }
  /** A new announcement: subject, class (group), text up to 1000 characters, shown for `days` days (1–60, 14 by default). */
  announce(t, input) {
    const x = input || {}, n = Date.now(), S = this.api.subjects;
    const subject = String(x.subject || ''); if (!S[subject]) throw USER('not_found', 'Unknown subject.', 404);
    const cls = line(x.cls, 60), k = classKey(cls);
    if (!k || !this.api.classesOf(t.id).some(c => classKey(c) === k)) throw USER('cls_none', 'Choose a class.');
    const grp = Math.max(0, Math.min(9, Math.floor(Number(x.group) || 0)));
    const text = clean(x.text, 1000); if (text.replace(/\s+/g, '').length < 2) throw USER('ann_text', 'Write the announcement.');
    const days = Math.max(1, Math.min(60, Math.floor(Number(x.days) || 14)));
    if (this.db.prepare('SELECT COUNT(*) AS c FROM hw_ann WHERE teacher_id = ? AND created > ?').get(t.id, n - DAY).c >= 50) throw USER('ann_many', 'Too many announcements today.', 429);
    const id = Number(this.db.prepare('INSERT INTO hw_ann (teacher_id, school_id, subject, class_name, grp, text, created, until) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(t.id, t.school_id || 0, subject, cls, grp, text, n, n + days * DAY).lastInsertRowid);
    audit(this.db, t.email, 'ann.add', cls + (grp ? ' гр.' + grp : '') + ' · ' + subject, '');
    return this.annPub(this.db.prepare('SELECT * FROM hw_ann WHERE id = ?').get(id), { active: true });
  }
  unannounce(t, id) {
    const a = this.db.prepare('SELECT * FROM hw_ann WHERE id = ? AND teacher_id = ?').get(Number(id) || 0, t.id);
    if (!a) throw USER('not_found', 'This announcement was not found.', 404);
    this.db.prepare('DELETE FROM hw_ann WHERE id = ?').run(a.id);
    audit(this.db, t.email, 'ann.delete', a.class_name + ' · ' + a.subject, '');
    return { ok: true };
  }
  /**
   * What a student (or the student's parent) sees: the current announcements for the student's class and group
   * ({ subject, subjectName, icon, text, at, until, teacher }) — no names of students in them.
   */
  announcementsFor(student) {
    const st = student && student.id ? (this.studentRow(student.id) || student) : student, n = Date.now();
    if (!st || !st.school_id) return [];
    const names = {}; this.db.prepare('SELECT id, name, active FROM teachers WHERE school_id = ?').all(st.school_id).forEach(r => { if (r.active) names[r.id] = r.name; });
    return this.db.prepare('SELECT * FROM hw_ann WHERE school_id = ? AND until >= ? ORDER BY created DESC LIMIT 200').all(st.school_id, n)
      .filter(a => names[a.teacher_id] && this.api.subjects[a.subject] && this.forStudent(a, st)).slice(0, 30)
      .map(a => { const p = this.annPub(a, { teacher: names[a.teacher_id] }); delete p.id; delete p.cls; delete p.group; return p; });
  }

  /**
   * How a class (or a group) is doing: per student the average mark (tests, lessons, homework), the level, homework handed in,
   * absences («н»), the average % in tests and the trend; who needs attention and why. A teacher sees the own marks;
   * the school's administrator every teacher's (all = true). subject: one subject or '' for all; from: since when (ms).
   */
  progress(t, cls, group, subject, from, all) {
    const S = this.api.subjects, k = classKey(cls), g = Math.max(0, Math.floor(Number(group) || 0)), since = Math.max(0, Number(from) || 0), n = Date.now();
    if (!k) throw USER('cls_none', 'Choose a class.');
    if (subject && !S[subject]) throw USER('not_found', 'Unknown subject.', 404);
    const wide = !!all && isAdm(t);
    const school = t.school_id || 0;
    const students = this.db.prepare('SELECT id, name, login, class_name, school_id, subgroup FROM students WHERE school_id = ? AND active = 1').all(school)
      .filter(s => classKey(s.class_name) === k && (!g || s.subgroup === g)).sort((a, b) => a.name.localeCompare(b.name, 'uk'));
    const ids = {}; students.forEach(s => { ids[s.id] = 1; });
    const teachers = wide ? this.db.prepare('SELECT id FROM teachers WHERE school_id = ?').all(school).map(r => r.id) : [t.id];
    const tIn = '(' + teachers.map(Number).join(',') + ')';
    const subjOk = key => !subject || key === subject;
    const marks = {}; students.forEach(s => { marks[s.id] = []; });   // { subject, m (number or null), raw, at }
    const push = (sid, key, raw, at) => { if (ids[sid] && subjOk(key) && at >= since && raw) marks[sid].push({ subject: key, m: num(raw), raw: raw, at: at }); };
    this.db.prepare('SELECT g.student_id, g.grade, g.updated, t.subject FROM grades g JOIN tests t ON t.id = g.test_id WHERE g.teacher_id IN ' + tIn).all()
      .forEach(r => push(r.student_id, r.subject, r.grade, r.updated));
    this.db.prepare('SELECT student_id, subject, day, grade FROM day_marks WHERE teacher_id IN ' + tIn).all()
      .forEach(r => push(r.student_id, r.subject, r.grade, Date.parse(r.day + 'T12:00:00')));
    const hws = this.db.prepare('SELECT * FROM hw WHERE teacher_id IN ' + tIn).all().filter(h => subjOk(h.subject) && classKey(h.class_name) === k);
    const subs = {}; if (hws.length) this.db.prepare('SELECT * FROM hw_sub WHERE hw_id IN (' + hws.map(h => Number(h.id)).join(',') + ')').all().forEach(s => { subs[s.hw_id + '|' + s.student_id] = s; });
    hws.forEach(h => students.forEach(st => { const s = subs[h.id + '|' + st.id]; if (s && s.grade) push(st.id, h.subject, s.grade, h.due); }));
    const tests = {}; this.db.prepare('SELECT a.student_id, a.score, a.max, a.submitted, t.subject FROM attempts a JOIN tests t ON t.id = a.test_id WHERE a.teacher_id IN ' + tIn + ' AND a.submitted IS NOT NULL AND a.student_id IS NOT NULL').all()
      .forEach(a => { if (ids[a.student_id] && subjOk(a.subject) && a.submitted >= since && a.max) (tests[a.student_id] = tests[a.student_id] || []).push(a.score / a.max * 100); });
    const keys = Object.keys(S).filter(subjOk);
    const rows = students.map(st => {
      const ms = marks[st.id].sort((a, b) => a.at - b.at), nums = ms.filter(x => x.m != null).map(x => x.m);
      const mine = hws.filter(h => this.forStudent(h, st) && h.due >= since && (h.due < n || subs[h.id + '|' + st.id]));
      let given = 0, done = 0, late = 0;
      mine.forEach(h => { given++; const s = subs[h.id + '|' + st.id], x = this.stateOf(h, s, n, this.attemptOf(h, st.id));
        if (x === 'submitted' || x === 'checked') { done++; if (s && s.late) late++; } });
      const half = Math.floor(nums.length / 2), early = avg(nums.slice(0, half)), lateAvg = avg(nums.slice(half));
      const trend = nums.length >= 4 ? (lateAvg - early >= 1.5 ? 'up' : early - lateAvg >= 1.5 ? 'down' : 'flat') : '';
      const a = avg(nums), tp = tests[st.id] ? Math.round(avg(tests[st.id])) : null, absent = ms.filter(x => /^н/i.test(x.raw)).length;
      const why = [];
      if (a != null && nums.length >= 2 && a < 6) why.push('low');
      if (given >= 3 && done / given < 0.6) why.push('homework');
      if (tp != null && tp < 50) why.push('tests');
      if (trend === 'down' && lateAvg < 7) why.push('down');   // falling marks matter when they fall below «sufficient»
      if (absent >= 3) why.push('absent');
      const bySubject = {}; keys.forEach(key => { const v = ms.filter(x => x.subject === key && x.m != null).map(x => x.m); if (v.length) bySubject[key] = avg(v); });
      return { id: st.id, name: st.name, group: st.subgroup || 0, avg: a, level: levelOf(a), marks: nums.length, last: ms.slice(-6).map(x => x.raw),
        hw: { given: given, done: done, late: late }, absent: absent, tests: tp, trend: trend, attention: why, bySubject: bySubject };
    });
    const avgs = rows.filter(r => r.avg != null).map(r => r.avg), lv = { high: 0, sufficient: 0, middle: 0, initial: 0 };
    rows.forEach(r => { if (r.level) lv[r.level]++; });
    const hg = rows.reduce((x, r) => x + r.hw.given, 0), hd = rows.reduce((x, r) => x + r.hw.done, 0);
    return { cls: cls, group: g, subject: subject || '', from: since, wide: wide,
      subjects: keys.filter(key => rows.some(r => r.bySubject[key] != null)).map(key => ({ key: key, icon: S[key].icon, name: S[key].info.name })),
      summary: { students: rows.length, avg: avg(avgs), levels: lv, hwRate: hg ? Math.round(hd / hg * 100) : null, attention: rows.filter(r => r.attention.length).length },
      students: rows };
  }

  /** Homework marks of one teacher's subject and class, for the gradebook's dated view (shown on the due day). */
  forGradebook(t, subject, cls, group) {
    const k = classKey(cls), g = Math.max(0, Math.floor(Number(group) || 0));
    const hws = this.db.prepare('SELECT * FROM hw WHERE teacher_id = ? AND subject = ? ORDER BY due').all(t.id, subject)
      .filter(h => classKey(h.class_name) === k && (!g || !h.grp || h.grp === g));
    const subs = {}; if (hws.length) this.db.prepare('SELECT hw_id, student_id, grade, status FROM hw_sub WHERE hw_id IN (' + hws.map(h => Number(h.id)).join(',') + ')').all()
      .forEach(s => { (subs[s.student_id] = subs[s.student_id] || {})[s.hw_id] = { grade: s.grade, status: s.status }; });
    return { tasks: hws.map(h => ({ id: h.id, title: h.title, due: h.due, group: h.grp })), marks: subs };
  }
  /** Homework of one student, per subject, for the student report: given (due already), handed in, marks. */
  forReport(st) {
    const n = Date.now(), out = {};
    this.db.prepare('SELECT * FROM hw WHERE school_id = ?').all(st.school_id || 0).filter(h => this.forStudent(h, Object.assign({ subgroup: 0 }, this.studentRow(st.id) || st))).forEach(h => {
      const s = this.db.prepare('SELECT * FROM hw_sub WHERE hw_id = ? AND student_id = ?').get(h.id, st.id), x = this.stateOf(h, s, n, this.attemptOf(h, st.id));
      if (x === 'todo') return;
      const o = out[h.subject] = out[h.subject] || { given: 0, done: 0, marks: [] };
      o.given++; if (x === 'submitted' || x === 'checked') o.done++;
      if (s && s.grade) o.marks.push(s.grade);
    });
    return out;
  }

  // ======================================================================
  //  STUDENT
  // ======================================================================
  /** The student's tab: tasks of the class (newest first), and every mark per subject (tests, lessons, homework). */
  studentHome(student) {
    const st = this.studentRow(student.id), n = Date.now(), S = this.api.subjects;
    if (!st) throw USER('auth', 'Please log in.', 401);
    const names = {}; this.db.prepare('SELECT id, name FROM teachers WHERE school_id = ?').all(st.school_id || 0).forEach(r => { names[r.id] = r.name; });
    const tasks = this.db.prepare('SELECT h.* FROM hw h JOIN teachers te ON te.id = h.teacher_id WHERE h.school_id = ? AND te.active = 1 ORDER BY h.due DESC LIMIT 400').all(st.school_id || 0)
      .filter(h => S[h.subject] && this.forStudent(h, st)).map(h => {
        const s = this.db.prepare('SELECT * FROM hw_sub WHERE hw_id = ? AND student_id = ?').get(h.id, st.id), a = this.attemptOf(h, st.id);
        return this.pub(h, { teacher: names[h.teacher_id] || '', state: this.stateOf(h, s, n, a), text: s ? s.text : '', grade: s ? s.grade : '', comment: s ? s.comment : '',
          submitted: s ? s.submitted : (a && a.submitted) || null, late: !!(s && s.late), mine: this.filesOf(h.id, st.id), test: a ? { status: a.status, submitted: a.submitted } : null });
      });
    // marks: the gradebook's test marks and lesson marks, and the homework marks
    const marks = {};
    const add = (key, m) => { if (!S[key] || !m.grade) return; (marks[key] = marks[key] || []).push(m); };
    this.db.prepare('SELECT g.grade, g.note, g.updated, t.subject, t.title, t.teacher_id FROM grades g JOIN tests t ON t.id = g.test_id WHERE g.student_id = ?').all(st.id)
      .forEach(r => add(r.subject, { kind: 'test', grade: r.grade, note: r.note, at: r.updated, title: r.title, teacher: names[r.teacher_id] || '' }));
    this.db.prepare('SELECT subject, day, grade, note, teacher_id FROM day_marks WHERE student_id = ?').all(st.id)
      .forEach(r => add(r.subject, { kind: 'lesson', grade: r.grade, note: r.note, at: Date.parse(r.day + 'T12:00:00'), day: r.day, teacher: names[r.teacher_id] || '' }));
    tasks.forEach(h => { if (h.grade) add(h.subject, { kind: 'hw', grade: h.grade, note: h.comment, at: h.due, title: h.title, teacher: h.teacher }); });
    // «Найближчі терміни»: the next 7 days — homework still to do and open tests not handed in yet
    const week = n + 7 * DAY, soon = [];
    tasks.forEach(h => { if ((h.state === 'todo' || h.state === 'returned') && h.due <= week && (h.kind !== 'none' || h.due >= n)) soon.push({ kind: 'hw', id: h.id, icon: h.icon, subjectName: h.subjectName, title: h.title, due: h.due, hwKind: h.kind, state: h.state }); });
    try {
      this.api.studentHome(st).subjects.forEach(sj => sj.tests.forEach(tt => {
        if (tt.mine !== 'done' && (tt.state === 'open' || tt.state === 'scheduled') && tt.closesAt && tt.closesAt >= n && tt.closesAt <= week)
          soon.push({ kind: 'test', id: tt.id, icon: sj.icon, subjectName: sj.name, title: (tt.titles && (tt.titles.uk || tt.titles.en)) || tt.id, due: tt.closesAt, state: tt.state, opensAt: tt.opensAt || null });
      }));
    } catch (e) {}
    soon.sort((a, b) => a.due - b.due);
    return { serverNow: n, photos: this.photosOn(st.school_id), photoLimits: PHOTO, keepFileDays: this.settings().keepFileDays,
      student: { name: st.name, cls: st.class_name },
      announcements: this.announcementsFor(st), soon: soon.slice(0, 20),
      tasks: tasks,
      subjects: Object.keys(S).filter(key => !this.api.subjectOff(st, key) && marks[key]).map(key => {
        const list = marks[key].sort((a, b) => a.at - b.at), nums = list.map(m => num(m.grade)).filter(x => x != null);
        return { key: key, icon: S[key].icon, name: S[key].info.name, avg: avg(nums), level: levelOf(avg(nums)), absent: list.filter(m => /^н/i.test(m.grade)).length, marks: list };
      }) };
  }
  /** The student hands in (or changes) an answer: text and, if the school allows it, photos of the notebook. */
  submit(student, id, text, photos, keep) {
    const st = this.studentRow(student.id), n = Date.now();
    const h = this.db.prepare('SELECT * FROM hw WHERE id = ?').get(Number(id) || 0);
    if (!h || !st || !this.forStudent(h, st)) throw USER('hw_none', 'This task was not found.', 404);
    if (h.kind !== 'text') throw USER('hw_kind', 'This task is not handed in here.');
    const s = this.db.prepare('SELECT * FROM hw_sub WHERE hw_id = ? AND student_id = ?').get(h.id, st.id);
    if (s && s.status === 'checked') throw USER('hw_checked', 'The teacher has already checked this task.');
    const late = n > h.due ? 1 : 0;
    if (late && !h.late && !(s && s.status === 'returned')) throw USER('hw_closed', 'The time for this task is over.');
    text = clean(text, 10000);
    photos = Array.isArray(photos) ? photos : [];
    if (photos.length && !this.photosOn(h.school_id)) throw USER('photos_off', 'Photos are turned off in your school.', 403);
    const keepIds = (Array.isArray(keep) ? keep : []).map(String), now = this.filesOf(h.id, st.id);
    const kept = now.filter(f => keepIds.indexOf(f) >= 0), bufs = this.prepFiles(photos);
    if (kept.length + bufs.length > PHOTO.perAnswer) throw USER('photo_many', 'Too many photos: at most ' + PHOTO.perAnswer + '.');
    if (!text && !kept.length && !bufs.length) throw USER('hw_empty', 'Write the answer or add a photo.');
    return this.withFiles(written => {
      const gone = []; now.forEach(f => { if (kept.indexOf(f) < 0) gone.push(...this.forget('id = ?', f)); });
      this.writeFiles(h.id, st.id, bufs, written);
      if (s) this.db.prepare("UPDATE hw_sub SET text = ?, status = 'submitted', submitted = ?, late = ?, updated = ? WHERE hw_id = ? AND student_id = ?").run(text, n, late, n, h.id, st.id);
      else this.db.prepare("INSERT INTO hw_sub (hw_id, student_id, text, status, submitted, late, updated) VALUES (?, ?, ?, 'submitted', ?, ?, ?)").run(h.id, st.id, text, n, late, n);
      return { gone: gone, result: { ok: true, state: 'submitted', late: !!late, mine: this.filesOf(h.id, st.id) } };
    });
  }

  // ======================================================================
  //  PERSONAL DATA (called from privacy.js / admin.js) and cleanup
  // ======================================================================
  /** Everything of one student (export on request). teacherId: only that teacher's tasks. */
  exportStudent(studentId, teacherId) {
    const sid = Number(studentId) || 0;
    return this.db.prepare('SELECT s.hw_id, h.subject, h.class_name, h.title, h.due, s.text, s.status, s.submitted, s.late, s.grade, s.comment, s.checked FROM hw_sub s JOIN hw h ON h.id = s.hw_id WHERE s.student_id = ?' + (teacherId ? ' AND h.teacher_id = ' + Number(teacherId) : '') + ' ORDER BY h.due')
      .all(sid).map(r => Object.assign(r, { photos: this.filesOf(r.hw_id, sid).length }));
  }
  /** Delete one student's answers, marks and photos (everywhere, or only in one teacher's tasks). */
  purgeStudent(studentId, teacherId) {
    const sid = Number(studentId) || 0, only = teacherId ? ' AND hw_id IN (SELECT id FROM hw WHERE teacher_id = ' + Number(teacherId) + ')' : '';
    const files = this.dropFiles('student_id = ? AND student_id <> 0' + only, sid);
    const subs = this.db.prepare('DELETE FROM hw_sub WHERE student_id = ?' + only).run(sid).changes;
    return { answers: subs, photos: files };
  }
  /** A teacher's account is deleted: every task, answer and photo of it. */
  purgeTeacher(teacherId) {
    const ids = this.db.prepare('SELECT id FROM hw WHERE teacher_id = ?').all(Number(teacherId) || 0).map(r => r.id);
    ids.forEach(id => { this.dropFiles('hw_id = ?', id); this.db.prepare('DELETE FROM hw_sub WHERE hw_id = ?').run(id); });
    this.db.prepare('DELETE FROM hw WHERE teacher_id = ?').run(Number(teacherId) || 0);
    this.db.prepare('DELETE FROM hw_ann WHERE teacher_id = ?').run(Number(teacherId) || 0);
  }
  forTeacherExport(teacherId) {
    return { homework: this.db.prepare('SELECT id, subject, class_name, grp, title, body, criteria, kind, test_id, due, created FROM hw WHERE teacher_id = ? ORDER BY due').all(teacherId),
      announcements: this.db.prepare('SELECT subject, class_name, grp, text, created, until FROM hw_ann WHERE teacher_id = ? ORDER BY created').all(teacherId),
      homeworkMarks: this.db.prepare('SELECT s.hw_id, s.student_id, s.status, s.grade, s.comment, s.submitted, s.checked FROM hw_sub s JOIN hw h ON h.id = s.hw_id WHERE h.teacher_id = ?').all(teacherId) };
  }
  /**
   * Daily: students' photos older than keepFileDays are deleted (the answer's text and the mark stay); files on disk that
   * the database does not know (e.g. after a crash) go too. keepAttemptDays (results) applies to tasks as well.
   */
  cleanup(keepAttemptDays) {
    const s = this.settings(), n = Date.now();
    const photos = this.dropFiles('student_id <> 0 AND created < ?', n - s.keepFileDays * DAY);
    let tasks = 0;
    this.db.prepare('DELETE FROM hw_ann WHERE until < ?').run(n - 30 * DAY);   // announcements: a month after they stopped showing
    if (keepAttemptDays > 0) this.db.prepare('SELECT id FROM hw WHERE due < ?').all(n - keepAttemptDays * DAY).forEach(r => {
      this.dropFiles('hw_id = ?', r.id); this.db.prepare('DELETE FROM hw_sub WHERE hw_id = ?').run(r.id); this.db.prepare('DELETE FROM hw WHERE id = ?').run(r.id); tasks++;
    });
    try {
      const known = {}; this.db.prepare('SELECT id FROM hw_files').all().forEach(r => { known[r.id + '.jpg'] = 1; });
      fs.readdirSync(this.dir).forEach(f => { if (!known[f] && /^[a-f0-9]{32}\.jpg$/.test(f)) { try { fs.unlinkSync(path.join(this.dir, f)); } catch (e) {} } });
    } catch (e) {}
    return { photos: photos, tasks: tasks };
  }
}

const STAFF_FNS = ['home', 'list', 'save', 'remove', 'detail', 'mark', 'dropPhoto', 'progress', 'setPhotos', 'announcements', 'announce', 'unannounce'];
module.exports = { Learn, STAFF_FNS, cleanJpeg, PHOTO, of: db => BY_DB.get(db) || null };
