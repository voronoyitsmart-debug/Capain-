'use strict';
// © Платон Вороний. All rights reserved. See LICENSE.
// Administrator panel: school classes, student accounts, teacher accounts, the audit log.
// Every function gets the signed-in administrator first (checked by server.js) and logs what it changed.
const { tx, password, audit } = require('./db');
const auth = require('./auth');
const privacy = require('./privacy');
const { USER } = require('./errors');
const learnOf = db => require('./learn').of(db);
const parents = require('./parents');

// Ukrainian → Latin (official 2010 table, simplified), for logins made from names
const TR = { а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l',
  м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ь: '', ю: 'iu', я: 'ia',
  ы: 'y', э: 'e', ё: 'io', ъ: '' };
function translit(s) { return String(s).toLowerCase().split('').map(ch => TR[ch] !== undefined ? TR[ch] : ch).join(''); }

const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
/** How classes are compared: "9-А", "9 а" and "9А" are the same class. */
function offList(v) { try { const a = JSON.parse(v || '[]'); return Array.isArray(a) ? a.map(String) : []; } catch (e) { return []; } }
function classKey(s) { return String(s || '').toLowerCase().replace(/[\s\-–—._/]+/g, ''); }
const okEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Roles: 'owner' — the owner of Kvizora (made at /setup): every school, the schools themselves, the owner's details,
// how long data is kept, the action log. 'admin' — the administrator of ONE school: only that school's classes,
// students, teachers and details. 'teacher' — no admin panel.
const isOwner = me => !!me && me.role === 'owner';
const ROLES = ['teacher', 'admin', 'owner'];

class Admin {
  constructor(db, api) { this.db = db; this.api = api; }
  /** server.js sets this.me (the signed-in administrator) before every call. */
  scope(schoolId) { if (!isOwner(this.me) && (!this.me || Number(schoolId) !== this.me.school_id)) throw USER('forbidden', 'This is another school: only its own administrator or the owner can see it.', 403); }
  ownerOnly() { if (!isOwner(this.me)) throw USER('owner_only', 'Only the owner of Kvizora can do this.', 403); }
  log(me, action, detail) { audit(this.db, me.email, action, detail, this.ip || ''); }

  // ---------- overview ----------
  overview() {
    const schools = this.listSchools().schools;
    return { schools: schools, appUrl: this.api.publicUrl() || this.api.lanUrl(), owner: isOwner(this.me),
      // schools whose details for the Privacy Policy are not filled in yet (the panel shows a yellow banner)
      incomplete: schools.filter(sc => !privacy.schoolInfo(this.db, sc.id).complete).map(sc => ({ id: sc.id, name: sc.name })),
      ownerMissing: isOwner(this.me) && !privacy.settings(this.db).owner.name };
  }

  // ---------- schools: every account and class belongs to one ----------
  listSchools() {
    const n = (sql, id) => this.db.prepare(sql).get(id).n;
    return { schools: this.db.prepare('SELECT id, name FROM schools ORDER BY name').all().filter(sc => isOwner(this.me) || (this.me && sc.id === this.me.school_id)).map(sc => ({ id: sc.id, name: sc.name,
      classes: n('SELECT COUNT(*) AS n FROM school_classes WHERE school_id = ?', sc.id),
      students: n('SELECT COUNT(*) AS n FROM students WHERE school_id = ?', sc.id),
      teachers: n('SELECT COUNT(*) AS n FROM teachers WHERE school_id = ?', sc.id) })) };
  }
  school(id) {
    const sc = this.db.prepare('SELECT id, name FROM schools WHERE id = ?').get(Number(id) || 0);
    if (!sc) throw USER('sc_none', 'Choose a school (the administrator adds schools first).', 404);
    this.scope(sc.id);
    return sc;
  }
  /** Names are compared without case (SQLite's NOCASE knows only Latin letters). */
  schoolTaken(name, exceptId) { const k = name.toLowerCase(); return this.db.prepare('SELECT id, name FROM schools').all().some(x => x.id !== exceptId && x.name.toLowerCase() === k); }
  addSchool(me, name) {
    this.ownerOnly(); name = clean(name, 100);
    if (name.length < 2) throw USER('sc_name', 'Type the school name.');
    if (this.schoolTaken(name, 0)) throw USER('sc_taken', 'This school already exists.');
    const id = Number(this.db.prepare('INSERT INTO schools (name, created) VALUES (?, ?)').run(name, Date.now()).lastInsertRowid);
    this.log(me, 'school.add', name);
    return Object.assign(this.listSchools(), { id: id });
  }
  renameSchool(me, id, name) {
    const sc = this.school(id); name = clean(name, 100);
    if (name.length < 2) throw USER('sc_name', 'Type the school name.');
    if (this.schoolTaken(name, sc.id)) throw USER('sc_taken', 'This school already exists.');
    this.db.prepare('UPDATE schools SET name = ? WHERE id = ?').run(name, sc.id);
    this.log(me, 'school.rename', sc.name + ' → ' + name);
    return this.listSchools();
  }
  deleteSchool(me, id) {
    this.ownerOnly(); const sc = this.school(id);
    const busy = this.db.prepare('SELECT (SELECT COUNT(*) FROM school_classes WHERE school_id = ?) + (SELECT COUNT(*) FROM students WHERE school_id = ?) + (SELECT COUNT(*) FROM teachers WHERE school_id = ?) AS n').get(sc.id, sc.id, sc.id).n;
    if (busy) throw USER('sc_busy', 'The school still has classes or accounts. Move or delete them first.');
    this.db.prepare('DELETE FROM schools WHERE id = ?').run(sc.id);
    this.log(me, 'school.delete', sc.name);
    return this.listSchools();
  }

  // ---------- classes (of one school) ----------
  listClasses(schoolId) {
    const sc = this.school(schoolId), cnt = {};
    this.db.prepare('SELECT class_name AS c, COUNT(*) AS n FROM students WHERE school_id = ? GROUP BY class_name').all(sc.id).forEach(r => { cnt[classKey(r.c)] = (cnt[classKey(r.c)] || 0) + r.n; });
    const list = this.db.prepare('SELECT c.name, c.parents_at, c.subjects_off, c.created_by, t.name AS by_name, t.role AS by_role FROM school_classes c LEFT JOIN teachers t ON t.id = c.created_by WHERE c.school_id = ?').all(sc.id)
      .sort((a, b) => a.name.localeCompare(b.name, 'uk', { numeric: true }));
    return { school: sc, subjects: this.subjectList(), classes: list.map(r => ({ name: r.name, students: cnt[classKey(r.name)] || 0, parentsAt: r.parents_at || null,
      subjectsOff: offList(r.subjects_off).filter(k => this.api.subjects[k]),
      byTeacher: r.by_role === 'teacher' ? r.by_name : '', mine: !!this.me && r.created_by === this.me.id })) };
  }
  findClass(schoolId, name) {
    const k = classKey(name);
    return this.db.prepare('SELECT name FROM school_classes WHERE school_id = ?').all(Number(schoolId) || 0).map(r => r.name).filter(n => classKey(n) === k)[0] || '';
  }
  addClass(me, schoolId, name) {
    const sc = this.school(schoolId); name = clean(name, 40);
    if (!classKey(name)) throw USER('cls_name', 'Type the class name, for example 9-А.');
    if (this.findClass(sc.id, name)) throw USER('cls_taken', 'This class already exists.');
    if (this.db.prepare('SELECT COUNT(*) AS n FROM school_classes WHERE school_id = ?').get(sc.id).n >= 300) throw USER('cls_many', 'Too many classes.');
    this.db.prepare('INSERT INTO school_classes (school_id, name, created, created_by) VALUES (?, ?, ?, ?)').run(sc.id, name, Date.now(), me && me.id || null);
    this.log(me, 'class.add', sc.name + ': ' + name);
    return this.listClasses(sc.id);
  }
  /** Rename a class: its students and the tests set for it (by this school's teachers) move along. */
  renameClass(me, schoolId, from, to) {
    const sc = this.school(schoolId), old = this.findClass(sc.id, from); to = clean(to, 40);
    if (!old) throw USER('cls_none', 'This class was not found.', 404);
    if (!classKey(to)) throw USER('cls_name', 'Type the class name, for example 9-А.');
    const clash = this.findClass(sc.id, to); if (clash && clash !== old) throw USER('cls_taken', 'This class already exists.');
    const k = classKey(old);
    tx(this.db, () => {
      this.db.prepare('UPDATE school_classes SET name = ? WHERE school_id = ? AND name = ?').run(to, sc.id, old);
      this.db.prepare('SELECT id, class_name FROM students WHERE school_id = ?').all(sc.id).forEach(s => { if (classKey(s.class_name) === k) this.db.prepare('UPDATE students SET class_name = ? WHERE id = ?').run(to, s.id); });
      this.db.prepare('SELECT t.id, t.folder, t.settings FROM tests t JOIN teachers te ON te.id = t.teacher_id WHERE te.school_id = ?').all(sc.id).forEach(t => {
        let st = {}; try { st = JSON.parse(t.settings || '{}') || {}; } catch (e) {}
        const cls = Array.isArray(st.classes) ? st.classes : [];
        const moved = cls.map(c => classKey(c) === k ? to : c), changed = moved.some((c, i) => c !== cls[i]);
        if (changed) { st.classes = moved; this.db.prepare('UPDATE tests SET settings = ? WHERE id = ?').run(JSON.stringify(st), t.id); }
        if (classKey(t.folder) === k) this.db.prepare('UPDATE tests SET folder = ? WHERE id = ?').run(to, t.id);
      });
    });
    this.log(me, 'class.rename', sc.name + ': ' + old + ' → ' + to);
    return this.listClasses(sc.id);
  }
  deleteClass(me, schoolId, name) {
    const sc = this.school(schoolId), old = this.findClass(sc.id, name);
    if (!old) throw USER('cls_none', 'This class was not found.', 404);
    const n = this.db.prepare('SELECT class_name FROM students WHERE school_id = ?').all(sc.id).filter(s => classKey(s.class_name) === classKey(old)).length;
    if (n) throw USER('cls_busy', 'The class still has students. Move or delete them first.');
    this.db.prepare('DELETE FROM school_classes WHERE school_id = ? AND name = ?').run(sc.id, old);
    this.log(me, 'class.delete', sc.name + ': ' + old);
    return this.listClasses(sc.id);
  }

  subjectList() { return Object.keys(this.api.subjects).map(k => ({ key: k, icon: this.api.subjects[k].icon, name: this.api.subjects[k].info.name })); }
  /** Which subjects a class has: off = the subject keys turned off (its students do not see them and cannot open their tests). */
  setClassSubjects(me, schoolId, name, off) {
    const sc = this.school(schoolId), cls = this.findClass(sc.id, name);
    if (!cls) throw USER('cls_none', 'This class was not found.', 404);
    const keys = (Array.isArray(off) ? off : []).map(String).filter((k, i, a) => this.api.subjects[k] && a.indexOf(k) === i);
    this.db.prepare('UPDATE school_classes SET subjects_off = ? WHERE school_id = ? AND name = ?').run(JSON.stringify(keys), sc.id, cls);
    this.log(me, 'class.subjects', sc.name + ': ' + cls + (keys.length ? ' − ' + keys.join(', ') : ' (усі)'));
    return this.listClasses(sc.id);
  }

  // ---------- a teacher's classes: the teacher adds classes to the own school (students stay with the administrator) ----------
  myClasses(me) {
    const r = this.listClasses(me.school_id);
    return { school: r.school.name, classes: r.classes.map(c => ({ name: c.name, students: c.students, mine: c.mine })) };
  }
  addMyClass(me, name) { this.addClass(me, me.school_id, name); return this.myClasses(me); }
  /** A teacher deletes only a class they added, and only while it has no students. */
  deleteMyClass(me, name) {
    const old = this.findClass(me.school_id, name);
    if (!old) throw USER('cls_none', 'This class was not found.', 404);
    const row = this.db.prepare('SELECT created_by FROM school_classes WHERE school_id = ? AND name = ?').get(me.school_id, old);
    if (!row || row.created_by !== me.id) throw USER('cls_not_mine', 'Only the administrator can delete a class you did not add.', 403);
    this.deleteClass(me, me.school_id, old);
    return this.myClasses(me);
  }

  // ---------- students ----------
  studentRow(s) {
    return { id: s.id, login: s.login, name: s.name, cls: s.class_name, group: s.subgroup || 0, school: s.school_id, active: !!s.active, locked: s.locked_until > Date.now(),
      lastLogin: s.last_login || null, created: s.created, parent: parents.statusOf(this.db, s.id) };
  }
  listStudents(me, filter) {
    filter = filter || {};
    const sc = this.school(filter.school);
    const k = filter.cls != null ? classKey(filter.cls) : null, q = clean(filter.q, 60).toLowerCase();
    const rows = this.db.prepare('SELECT * FROM students WHERE school_id = ? ORDER BY class_name, name').all(sc.id)
      .filter(s => (k === null || classKey(s.class_name) === k) && (!q || s.name.toLowerCase().indexOf(q) >= 0 || s.login.indexOf(q) >= 0));
    return { students: rows.slice(0, 2000).map(s => this.studentRow(s)), total: rows.length };
  }
  newLogin(name) {
    let base = translit(name).replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '').slice(0, 24).replace(/\.+$/, '');
    if (base.length < 3) base = 'student';
    let login = base, i = 1;
    while (this.db.prepare('SELECT 1 FROM students WHERE login = ?').get(login)) login = base + (++i);
    return login;
  }
  /** Add students to a class: one name per line. Returns the logins and first passwords (shown only now). */
  addStudents(me, schoolId, cls, names, group) {
    const grp = Math.max(0, Math.min(9, Math.floor(Number(group) || 0)));
    const sc = this.school(schoolId), c = this.findClass(sc.id, cls);
    if (!c) throw USER('cls_none', 'Choose a class (the administrator adds classes first).', 404);
    const list = (Array.isArray(names) ? names : String(names || '').split(/\r?\n/)).map(n => clean(n, 80)).filter(n => n.replace(/\s+/g, '').length >= 2);
    if (!list.length) throw USER('st_names', 'Type the students’ names, one per line.');
    if (list.length > 200) throw USER('st_many', 'At most 200 students at once.');
    const out = tx(this.db, () => list.map(name => {
      const login = this.newLogin(name), pw = password(8);
      const r = this.db.prepare('INSERT INTO students (login, name, class_name, pass, created, school_id, subgroup) VALUES (?, ?, ?, ?, ?, ?, ?)').run(login, name, c, auth.hashPassword(pw), Date.now(), sc.id, grp);
      return { id: Number(r.lastInsertRowid), name: name, cls: c, group: grp, school: sc.name, login: login, password: pw };
    }));
    this.log(me, 'student.add', sc.name + ', ' + c + ': ' + out.length);
    return { created: out };
  }
  student(id) {
    const s = this.db.prepare('SELECT * FROM students WHERE id = ?').get(Number(id) || 0);
    if (!s) throw USER('st_none', 'This student was not found.', 404);
    this.scope(s.school_id);
    return s;
  }
  updateStudent(me, id, input) {
    const s = this.student(id); input = input || {};
    const name = input.name != null ? clean(input.name, 80) : s.name;
    if (name.replace(/\s+/g, '').length < 2) throw USER('st_name', 'Type the student’s name.');
    // moving to another school: the class is chosen in that school
    const school = input.school != null ? this.school(input.school).id : s.school_id;
    let cls = school !== s.school_id ? '' : s.class_name;
    if (input.cls != null) { cls = input.cls === '' ? '' : this.findClass(school, input.cls); if (input.cls !== '' && !cls) throw USER('cls_none', 'This class was not found.', 404); }
    let login = s.login;
    if (input.login != null && input.login !== s.login) {
      login = String(input.login).trim().toLowerCase();
      if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(login)) throw USER('st_login', 'A login is 3–32 Latin letters, digits, dots or dashes.');
      if (this.db.prepare('SELECT 1 FROM students WHERE login = ? AND id <> ?').get(login, s.id)) throw USER('st_login_taken', 'This login is taken.');
    }
    const active = input.active != null ? (input.active ? 1 : 0) : s.active;
    // the group inside the class (1, 2, …; 0 = the whole class), e.g. for languages or computer science
    const group = input.group != null ? Math.max(0, Math.min(9, Math.floor(Number(input.group) || 0))) : (cls !== s.class_name ? 0 : s.subgroup || 0);
    this.db.prepare('UPDATE students SET name = ?, class_name = ?, login = ?, active = ?, school_id = ?, subgroup = ? WHERE id = ?').run(name, cls, login, active, school, group, s.id);
    if (!active || login !== s.login || school !== s.school_id) auth.endAll(this.db, 'student', s.id);
    if (school !== s.school_id) parents.revoke(this.db, s.id);   // another school: the parent's code of the old one stops
    this.log(me, 'student.update', s.login + (cls !== s.class_name ? ' class ' + s.class_name + '→' + cls : '') + (active !== s.active ? (active ? ' on' : ' off') : '') + (name !== s.name ? ' name' : '') + (group !== (s.subgroup || 0) ? ' group→' + group : '') + (login !== s.login ? ' login→' + login : ''));
    return this.studentRow(this.student(s.id));
  }
  resetStudent(me, id) {
    const s = this.student(id), pw = password(8);
    this.db.prepare('UPDATE students SET pass = ?, failed = 0, locked_until = 0 WHERE id = ?').run(auth.hashPassword(pw), s.id);
    auth.endAll(this.db, 'student', s.id);
    this.log(me, 'student.reset', s.login);
    return { id: s.id, name: s.name, cls: s.class_name, school: this.schoolName(s.school_id), login: s.login, password: pw };
  }
  /** works: also delete every test the student took (a request to erase the data); otherwise they stay in the results, under the name. */
  deleteStudent(me, id, works) {
    const s = this.student(id);
    return tx(this.db, () => {
      this.db.prepare('DELETE FROM students WHERE id = ?').run(s.id);
      this.db.prepare('DELETE FROM grades WHERE student_id = ?').run(s.id);
      this.db.prepare('DELETE FROM day_marks WHERE student_id = ?').run(s.id);
      this.db.prepare('DELETE FROM final_marks WHERE student_id = ?').run(s.id);
      parents.revoke(this.db, s.id);
      const L = learnOf(this.db); if (L) L.purgeStudent(s.id);   // homework answers, marks and photos
      const n = works ? this.db.prepare('DELETE FROM attempts WHERE student_id = ?').run(s.id).changes
        : (this.db.prepare('UPDATE attempts SET student_id = NULL WHERE student_id = ?').run(s.id), 0);
      auth.endAll(this.db, 'student', s.id);
      this.log(me, works ? 'student.erase' : 'student.delete', s.login + ' (' + s.name + ')' + (works ? ', ' + n + ' attempts' : ''));
      return { ok: true, attempts: n };
    });
  }
  /** Everything stored about one student account (a request from the student or the parents): a JSON file. */
  exportStudent(me, id) {
    const s = this.student(id);
    const row = this.db.prepare('SELECT id, login, name, class_name, created, last_login, active FROM students WHERE id = ?').get(s.id);
    const attempts = this.db.prepare(`SELECT a.test_id, a.ttitle, t.subject, te.name AS teacher, a.started, a.submitted, a.status, a.score, a.max, a.answers, a.ip, a.ua
      FROM attempts a LEFT JOIN tests t ON t.id = a.test_id LEFT JOIN teachers te ON te.id = a.teacher_id WHERE a.student_id = ? ORDER BY a.started`).all(s.id)
      .map(a => { let ans = {}; try { ans = JSON.parse(a.answers || '{}'); } catch (e) {} return Object.assign(a, { answers: ans }); });
    const grades = this.db.prepare('SELECT g.test_id, t.title, g.grade, g.note, g.updated FROM grades g LEFT JOIN tests t ON t.id = g.test_id WHERE g.student_id = ?').all(s.id);
    this.log(me, 'student.export', s.login);
    const dayMarks = this.db.prepare('SELECT subject, day, grade, note, updated FROM day_marks WHERE student_id = ? ORDER BY day').all(s.id);
    const finalMarks = this.db.prepare('SELECT subject, period, grade, updated FROM final_marks WHERE student_id = ?').all(s.id);
    const parentCodes = this.db.prepare('SELECT created, expires, last_used FROM parent_codes WHERE student_id = ?').all(s.id);
    const L = learnOf(this.db), homework = L ? L.exportStudent(s.id) : [];
    return { name: 'student-' + s.login + '.json', data: { exported: new Date().toISOString(), school: this.schoolName(s.school_id), account: row, attempts: attempts, grades: grades, dayMarks: dayMarks, finalMarks: finalMarks, parentAccess: parentCodes, homework: homework } };
  }

  // ---------- personal data: the school's details, parents informed, how long data is kept ----------
  schoolInfo(id) { this.school(id); return privacy.schoolInfo(this.db, id); }
  saveSchoolInfo(me, id, input) { this.school(id); const r = privacy.saveSchoolInfo(this.db, id, input); this.log(me, 'school.info', r.name); return r; }
  /** «Батьків поінформовано»: the date the parents of a class were informed (and consents collected); null = not yet. */
  setParents(me, schoolId, cls, on) {
    const sc = this.school(schoolId), name = this.findClass(sc.id, cls);
    if (!name) throw USER('cls_none', 'There is no such class.', 404);
    this.db.prepare('UPDATE school_classes SET parents_at = ? WHERE school_id = ? AND name = ?').run(on ? Date.now() : null, sc.id, name);
    this.log(me, on ? 'class.parents' : 'class.parents.off', sc.name + ' / ' + name);
    return this.listClasses(sc.id);
  }
  // ---------- parents: read-only access to one student by a code (the school turns it on; off by default) ----------
  parentAccess(schoolId) {
    const sc = this.school(schoolId);
    return { on: parents.isOn(this.db, sc.id), codes: this.db.prepare('SELECT COUNT(*) AS n FROM parent_codes WHERE school_id = ? AND expires > ?').get(sc.id, Date.now()).n };
  }
  setParentAccess(me, schoolId, on) {
    const sc = this.school(schoolId);
    parents.setOn(this.db, sc.id, !!on);
    if (!on) this.db.prepare("DELETE FROM sessions WHERE kind = 'parent' AND teacher_id IN (SELECT id FROM parent_codes WHERE school_id = ?)").run(sc.id);
    this.log(me, on ? 'parents.on' : 'parents.off', sc.name);
    return this.parentAccess(sc.id);
  }
  /** A new code for the parents of a student (the old one stops). Shown only now: the database keeps a hash. */
  issueParentCode(me, studentId) {
    const s = this.student(studentId);
    if (!parents.isOn(this.db, s.school_id)) throw USER('parents_off', 'Turn on parent access for the school first.', 403);
    if (!s.active) throw USER('st_off', 'This account is turned off.');
    const r = parents.issue(this.db, s, me.email);
    this.log(me, 'parents.code', s.login + ' (' + s.class_name + ')');
    return { code: r.code, expires: r.expires, student: { name: s.name, cls: s.class_name, school: this.schoolName(s.school_id) }, url: (this.api.publicUrl() || this.api.lanUrl() || '') + '/parent' };
  }
  revokeParentCode(me, studentId) {
    const s = this.student(studentId), n = parents.revoke(this.db, s.id);
    this.log(me, 'parents.revoke', s.login + ' (' + n + ')');
    return this.studentRow(this.student(s.id));
  }
  privacySettings() { return privacy.settings(this.db); }
  savePrivacy(me, input) { this.ownerOnly(); const r = privacy.saveSettings(this.db, input); this.log(me, 'privacy.save', 'device ' + r.keepDeviceDays + 'd, attempts ' + (r.keepAttemptDays || '∞') + 'd'); return r; }
  /** The «clear device data now» button: IP, browser id and fingerprint of every finished attempt. */
  purgeDevices(me) { this.ownerOnly(); const r = privacy.cleanup(this.db, { deviceNow: true }); this.log(me, 'privacy.purge', r.device + ' attempts'); return Object.assign(privacy.settings(this.db), { result: r }); }
  unlockStudent(me, id) {
    const s = this.student(id);
    this.db.prepare('UPDATE students SET failed = 0, locked_until = 0 WHERE id = ?').run(s.id);
    this.log(me, 'student.unlock', s.login);
    return this.studentRow(this.student(s.id));
  }
  /** Every work of one student, in every subject (for the administrator). */
  studentAttempts(me, id) {
    const s = this.student(id);
    const rows = this.db.prepare(`SELECT a.test_id, a.ttitle, a.started, a.submitted, a.status, a.score, a.max, t.subject, te.name AS teacher
      FROM attempts a LEFT JOIN tests t ON t.id = a.test_id LEFT JOIN teachers te ON te.id = a.teacher_id WHERE a.student_id = ? ORDER BY a.started DESC LIMIT 500`).all(s.id);
    return { student: this.studentRow(s), attempts: rows.map(r => ({ test: r.test_id, title: r.ttitle, subject: r.subject || '', teacher: r.teacher || '',
      started: r.started, submitted: r.submitted, status: r.status, score: r.score, max: r.max })) };
  }

  schoolName(id) { const sc = this.db.prepare('SELECT name FROM schools WHERE id = ?').get(id || 0); return sc ? sc.name : ''; }

  // ---------- teachers ----------
  teacherRow(t) {
    return { id: t.id, email: t.email, name: t.name, role: t.role, school: t.school_id, schoolName: this.schoolName(t.school_id), active: !!t.active, locked: t.locked_until > Date.now(),
      mustChange: !!t.must_change, lastLogin: t.last_login || null, created: t.created,
      tests: this.db.prepare('SELECT COUNT(*) AS n FROM tests WHERE teacher_id = ?').get(t.id).n };
  }
  listTeachers() { return { teachers: this.db.prepare('SELECT * FROM teachers ORDER BY name').all().filter(t => isOwner(this.me) || (this.me && t.school_id === this.me.school_id)).map(t => this.teacherRow(t)) }; }
  teacher(id) {
    const t = this.db.prepare('SELECT * FROM teachers WHERE id = ?').get(Number(id) || 0);
    if (!t) throw USER('te_none', 'This teacher was not found.', 404);
    this.scope(t.school_id);
    if (t.role === 'owner' && !isOwner(this.me)) throw USER('forbidden', 'Only the owner can change the owner’s account.', 403);
    return t;
  }
  /** Active owners: there must always be at least one. */
  admins() { return this.db.prepare("SELECT COUNT(*) AS n FROM teachers WHERE role = 'owner' AND active = 1").get().n; }
  /** The role an administrator may give: a school administrator cannot make an owner. */
  roleOf(v, cur) { const r = ROLES.indexOf(v) >= 0 ? v : cur || 'teacher'; if (r === 'owner' && !isOwner(this.me)) throw USER('owner_only', 'Only the owner of Kvizora can do this.', 403); return r; }
  /** A teacher (or another administrator) account with a first password; they choose their own at the first login. */
  addTeacher(me, input) {
    input = input || {};
    const name = clean(input.name, 80), email = String(input.email || '').trim().toLowerCase().slice(0, 120);
    const role = this.roleOf(input.role, 'teacher');
    if (name.length < 2) throw USER('te_name', 'Type the teacher’s name.');
    if (!okEmail(email)) throw USER('te_email', 'Type a valid e-mail (it is the teacher’s login).');
    if (this.db.prepare('SELECT 1 FROM teachers WHERE email = ?').get(email)) throw USER('te_taken', 'An account with this e-mail already exists.');
    const sc = this.school(input.school);
    const pw = password(10);
    const r = this.db.prepare('INSERT INTO teachers (email, name, pass, created, role, must_change, school_id) VALUES (?, ?, ?, ?, ?, 1, ?)').run(email, name, auth.hashPassword(pw), Date.now(), role, sc.id);
    this.log(me, 'teacher.add', email + ' (' + role + ', ' + sc.name + ')');
    return { id: Number(r.lastInsertRowid), name: name, email: email, role: role, school: sc.name, password: pw };
  }
  updateTeacher(me, id, input) {
    const t = this.teacher(id); input = input || {};
    const name = input.name != null ? clean(input.name, 80) : t.name;
    if (name.length < 2) throw USER('te_name', 'Type the teacher’s name.');
    const role = input.role != null ? this.roleOf(input.role, t.role) : t.role;
    const active = input.active != null ? (input.active ? 1 : 0) : t.active;
    const school = input.school != null ? this.school(input.school).id : t.school_id;
    if (t.id === me.id && (role !== t.role || !active)) throw USER('te_self', 'You cannot take away your own administrator rights or turn off your own account.');
    if (t.role === 'owner' && t.active && (role !== 'owner' || !active) && this.admins() <= 1) throw USER('te_last', 'There must be at least one owner.');
    this.db.prepare('UPDATE teachers SET name = ?, role = ?, active = ?, school_id = ? WHERE id = ?').run(name, role, active, school, t.id);
    if (!active || role !== t.role) auth.endAll(this.db, 'staff', t.id);
    this.log(me, 'teacher.update', t.email + (role !== t.role ? ' role→' + role : '') + (active !== t.active ? (active ? ' on' : ' off') : '') + (name !== t.name ? ' name' : '') + (school !== t.school_id ? ' school→' + this.schoolName(school) : ''));
    return this.teacherRow(this.teacher(t.id));
  }
  resetTeacher(me, id) {
    const t = this.teacher(id), pw = password(10);
    if (t.id === me.id) throw USER('te_self_pw', 'Change your own password on the subjects page.');
    this.db.prepare('UPDATE teachers SET pass = ?, must_change = 1, failed = 0, locked_until = 0 WHERE id = ?').run(auth.hashPassword(pw), t.id);
    auth.endAll(this.db, 'staff', t.id);
    this.log(me, 'teacher.reset', t.email);
    return { id: t.id, name: t.name, email: t.email, school: this.schoolName(t.school_id), password: pw };
  }
  unlockTeacher(me, id) {
    const t = this.teacher(id);
    this.db.prepare('UPDATE teachers SET failed = 0, locked_until = 0 WHERE id = ?').run(t.id);
    this.log(me, 'teacher.unlock', t.email);
    return this.teacherRow(this.teacher(t.id));
  }
  /** Delete a teacher with all their tests and the students' works in them. */
  deleteTeacher(me, id) {
    const t = this.teacher(id);
    if (t.id === me.id) throw USER('te_self', 'You cannot delete your own account.');
    if (t.role === 'owner' && t.active && this.admins() <= 1) throw USER('te_last', 'There must be at least one owner.');
    this.wipeTeacher(t);
    this.log(me, 'teacher.delete', t.email);
    return { ok: true };
  }
  /** A teacher deletes their own account (with everything in it). The last administrator cannot. */
  deleteSelf(t) {
    if (t.role === 'owner' && this.admins() <= 1) throw USER('te_last', 'You are the only owner: make another owner first.');
    this.wipeTeacher(t);
    this.log(t, 'teacher.delete.self', t.email);
    return { ok: true };
  }
  wipeTeacher(t) {
    tx(this.db, () => {
      this.db.prepare('DELETE FROM attempts WHERE teacher_id = ?').run(t.id);
      this.db.prepare('DELETE FROM grades WHERE teacher_id = ?').run(t.id);
      this.db.prepare('DELETE FROM day_marks WHERE teacher_id = ?').run(t.id);
      this.db.prepare('DELETE FROM day_topics WHERE teacher_id = ?').run(t.id);
      this.db.prepare('DELETE FROM final_marks WHERE teacher_id = ?').run(t.id);
      const L = learnOf(this.db); if (L) L.purgeTeacher(t.id);   // the teacher's homework tasks, answers and photos
      this.db.prepare('DELETE FROM tests WHERE teacher_id = ?').run(t.id);
      this.db.prepare('DELETE FROM seeded WHERE teacher_id = ?').run(t.id);
      this.db.prepare('DELETE FROM teachers WHERE id = ?').run(t.id);
      auth.endAll(this.db, 'staff', t.id);
    });
  }

  // ---------- audit log ----------
  auditLog(me, limit) {
    this.ownerOnly();
    const n = Math.max(1, Math.min(1000, Number(limit) || 200));
    return { rows: this.db.prepare('SELECT at, who, action, detail, ip FROM audit ORDER BY id DESC LIMIT ?').all(n) };
  }
}

const ADMIN_FNS = ['parentAccess', 'setParentAccess', 'issueParentCode', 'revokeParentCode', 'overview', 'listSchools', 'addSchool', 'renameSchool', 'deleteSchool', 'listClasses', 'addClass', 'renameClass', 'deleteClass', 'setClassSubjects', 'listStudents', 'addStudents', 'updateStudent', 'resetStudent',
  'deleteStudent', 'unlockStudent', 'studentAttempts', 'exportStudent', 'schoolInfo', 'saveSchoolInfo', 'setParents', 'privacySettings', 'savePrivacy', 'purgeDevices', 'listTeachers', 'addTeacher', 'updateTeacher', 'resetTeacher', 'unlockTeacher', 'deleteTeacher', 'auditLog'];
// the ones that take no "me" (read-only, nothing logged)
const NO_ME = { parentAccess: 1, overview: 1, listSchools: 1, listClasses: 1, listTeachers: 1, schoolInfo: 1, privacySettings: 1 };

module.exports = { Admin, ADMIN_FNS, NO_ME, classKey, translit };
