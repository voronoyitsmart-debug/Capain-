'use strict';
// © Платон Вороний. All rights reserved. See LICENSE.
// SQLite storage (one file, data/tests.db by default). Uses Node's built-in node:sqlite, so nothing native is installed.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT);
CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  pass TEXT NOT NULL,
  created INTEGER NOT NULL,
  classes TEXT NOT NULL DEFAULT '[]',
  ai_key TEXT NOT NULL DEFAULT '',
  ai_model TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,             -- sha256 of the cookie value
  teacher_id INTEGER NOT NULL,        -- the user's id (teachers.id for staff, students.id for students)
  expires INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  login TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  class_name TEXT NOT NULL DEFAULT '',
  pass TEXT NOT NULL,
  created INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  failed INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0,
  last_login INTEGER
);
CREATE INDEX IF NOT EXISTS students_class ON students (class_name);
CREATE TABLE IF NOT EXISTS schools (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE COLLATE NOCASE, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS school_classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER NOT NULL,
  name TEXT NOT NULL COLLATE NOCASE,
  created INTEGER NOT NULL,
  UNIQUE (school_id, name)
);
CREATE TABLE IF NOT EXISTS audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at INTEGER NOT NULL,
  who TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  ip TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS grades (    -- the teacher's mark for a student's test (the gradebook)
  test_id TEXT NOT NULL,
  student_id INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL,
  grade TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  updated INTEGER NOT NULL,
  PRIMARY KEY (test_id, student_id)
);
CREATE TABLE IF NOT EXISTS day_marks (   -- the dated gradebook: a teacher's mark for a student on a day (a lesson, not a test)
  teacher_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  student_id INTEGER NOT NULL,
  day TEXT NOT NULL,                  -- YYYY-MM-DD
  grade TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  updated INTEGER NOT NULL,
  PRIMARY KEY (teacher_id, subject, student_id, day)
);
CREATE TABLE IF NOT EXISTS day_topics (   -- the dated gradebook: the lesson's topic on a day, for a class (or one group of it)
  teacher_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  cls TEXT NOT NULL,                  -- the class's key (lower case, no spaces)
  grp INTEGER NOT NULL DEFAULT 0,
  day TEXT NOT NULL,                  -- YYYY-MM-DD
  topic TEXT NOT NULL DEFAULT '',
  updated INTEGER NOT NULL,
  PRIMARY KEY (teacher_id, subject, cls, grp, day)
);
CREATE TABLE IF NOT EXISTS final_marks (  -- marks for a period, set by the teacher: semester 1/2, the year, a topic («тематична»)
  teacher_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  student_id INTEGER NOT NULL,
  period TEXT NOT NULL,               -- 'sem1' | 'sem2' | 'year' | 'th:<topic name>'
  grade TEXT NOT NULL DEFAULT '',
  updated INTEGER NOT NULL,
  PRIMARY KEY (teacher_id, subject, student_id, period)
);
CREATE TABLE IF NOT EXISTS parent_codes (  -- read-only access of a parent to one student: only a hash of the code is kept
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  school_id INTEGER NOT NULL,
  hash TEXT NOT NULL UNIQUE,
  created INTEGER NOT NULL,
  expires INTEGER NOT NULL,
  made_by TEXT NOT NULL DEFAULT '',
  last_used INTEGER
);
CREATE TABLE IF NOT EXISTS seeded (teacher_id INTEGER NOT NULL, subject TEXT NOT NULL, PRIMARY KEY (teacher_id, subject));
CREATE TABLE IF NOT EXISTS tests (
  id TEXT PRIMARY KEY,                -- also the access code students type
  teacher_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  folder TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'draft',
  created INTEGER NOT NULL,
  updated INTEGER NOT NULL,
  settings TEXT NOT NULL DEFAULT '{}',
  content TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS tests_owner ON tests (teacher_id, subject);
CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY,
  test_id TEXT NOT NULL,
  teacher_id INTEGER NOT NULL,
  ttitle TEXT NOT NULL DEFAULT '',
  started INTEGER NOT NULL,
  submitted INTEGER,
  name TEXT NOT NULL,
  name_key TEXT NOT NULL,
  grp TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'In progress',
  score REAL,
  max REAL,
  deadline INTEGER,
  answers TEXT NOT NULL DEFAULT '{}',   -- canonical answers (original option order)
  overrides TEXT NOT NULL DEFAULT '{}',
  activity TEXT NOT NULL DEFAULT '{}',
  plan TEXT NOT NULL DEFAULT '{}',      -- this attempt's shuffle: question order, option order, matching order
  max_pos INTEGER NOT NULL DEFAULT 0,   -- questions before this position are locked (no going back)
  dev_id TEXT NOT NULL DEFAULT '',      -- sha256 of the browser's device cookie
  fp_hash TEXT NOT NULL DEFAULT '',     -- hash of the device fingerprint
  fp TEXT NOT NULL DEFAULT '{}',
  ip TEXT NOT NULL DEFAULT '',
  ua TEXT NOT NULL DEFAULT '',
  via TEXT NOT NULL DEFAULT '',         -- 'lan' (school network) or 'internet' at the start
  outside INTEGER NOT NULL DEFAULT 0    -- saves that came from outside the school network (Wi-Fi-only tests)
);
CREATE INDEX IF NOT EXISTS attempts_test ON attempts (test_id);
`;

function open(file) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  db.exec(SCHEMA);
  // columns added after the first release
  [['attempts', 'via', "TEXT NOT NULL DEFAULT ''"], ['attempts', 'outside', 'INTEGER NOT NULL DEFAULT 0'],
   ['attempts', 'student_id', 'INTEGER'],
   ['teachers', 'role', "TEXT NOT NULL DEFAULT 'teacher'"], ['teachers', 'must_change', 'INTEGER NOT NULL DEFAULT 0'],
   ['teachers', 'active', 'INTEGER NOT NULL DEFAULT 1'], ['teachers', 'failed', 'INTEGER NOT NULL DEFAULT 0'],
   ['teachers', 'locked_until', 'INTEGER NOT NULL DEFAULT 0'], ['teachers', 'last_login', 'INTEGER'],
   ['sessions', 'kind', "TEXT NOT NULL DEFAULT 'staff'"],
   ['teachers', 'school_id', 'INTEGER'], ['students', 'school_id', 'INTEGER'],
   // legal: when a staff member accepted the Terms (and which version), when a teacher confirmed the AI rules once;
   // the school's details for the Privacy Policy; when the parents of a class were informed
   ['teachers', 'terms_at', 'INTEGER'], ['teachers', 'terms_ver', "TEXT NOT NULL DEFAULT ''"], ['teachers', 'ai_ack_at', 'INTEGER'],
   ['schools', 'info', "TEXT NOT NULL DEFAULT '{}'"], ['school_classes', 'parents_at', 'INTEGER'],
   // a class split into groups (1, 2, …; 0 = none) by the school's administrator; the teacher's per-student «show the review» choice
   ['students', 'subgroup', 'INTEGER NOT NULL DEFAULT 0'], ['attempts', 'review', 'INTEGER'],
   // who added a class (a teacher may add classes of the own school and delete the own empty ones)
   ['school_classes', 'created_by', 'INTEGER'],
   // subjects the school's administrator turned off for a class (JSON list of subject keys; empty = every subject)
   ['school_classes', 'subjects_off', "TEXT NOT NULL DEFAULT '[]'"],
   // a test its teacher shares with the colleagues of the school (they copy it to themselves; results are never shared)
   ['tests', 'shared', 'INTEGER NOT NULL DEFAULT 0']].forEach(c => {
    const have = db.prepare('PRAGMA table_info(' + c[0] + ')').all().some(x => x.name === c[1]);
    if (!have) db.exec('ALTER TABLE ' + c[0] + ' ADD COLUMN ' + c[1] + ' ' + c[2]);
  });
  // the owner of Kvizora (every school): in an older database, the first administrator (or the first teacher)
  if (!db.prepare("SELECT 1 FROM teachers WHERE role = 'owner'").get()) {
    const first = db.prepare("SELECT id FROM teachers ORDER BY role = 'admin' DESC, id LIMIT 1").get();
    if (first) db.prepare("UPDATE teachers SET role = 'owner' WHERE id = ?").run(first.id);
  }
  // accounts without a school (a database from before schools existed): they all go to one school
  const orphans = db.prepare('SELECT (SELECT COUNT(*) FROM teachers WHERE school_id IS NULL) + (SELECT COUNT(*) FROM students WHERE school_id IS NULL) AS n').get().n;
  if (orphans) {
    let sc = db.prepare('SELECT id FROM schools ORDER BY id LIMIT 1').get();
    if (!sc) sc = { id: Number(db.prepare('INSERT INTO schools (name, created) VALUES (?, ?)').run('Моя школа', Date.now()).lastInsertRowid) };
    db.prepare('UPDATE teachers SET school_id = ? WHERE school_id IS NULL').run(sc.id);
    db.prepare('UPDATE students SET school_id = ? WHERE school_id IS NULL').run(sc.id);
  }
  return db;
}

function meta(db, k, make) {
  const r = db.prepare('SELECT v FROM meta WHERE k = ?').get(k);
  if (r) return r.v;
  const v = make();
  db.prepare('INSERT INTO meta (k, v) VALUES (?, ?)').run(k, v);
  return v;
}

/** Run fn inside one transaction (node:sqlite is synchronous, so this is also a lock). */
function tx(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const out = fn(); db.exec('COMMIT'); return out; }
  catch (e) { try { db.exec('ROLLBACK'); } catch (e2) {} throw e; }
}

const CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // no 0/O, 1/I: easy to type from the board
function code(n) {
  const b = crypto.randomBytes(n); let s = '';
  for (let i = 0; i < n; i++) s += CODE_ABC[b[i] % CODE_ABC.length];
  return s;
}
function token(n) { return crypto.randomBytes(n || 24).toString('base64url'); }
function sha(s) { return crypto.createHash('sha256').update(String(s)).digest('hex'); }

/** A readable random password (no 0/O, 1/l/I). */
function password(n) {
  const abc = 'abcdefghjkmnpqrstuvwxyz23456789', b = crypto.randomBytes(n || 8); let s = '';
  for (let i = 0; i < b.length; i++) s += abc[b[i] % abc.length];
  return s;
}
function audit(db, who, action, detail, ip) {
  db.prepare('INSERT INTO audit (at, who, action, detail, ip) VALUES (?, ?, ?, ?, ?)').run(Date.now(), String(who || '').slice(0, 120), action, String(detail || '').slice(0, 400), String(ip || ''));
}

module.exports = { open, meta, tx, code, token, sha, password, audit };
