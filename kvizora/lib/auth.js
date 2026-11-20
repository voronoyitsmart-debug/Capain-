'use strict';
// © Платон Вороний. All rights reserved. See LICENSE.
// Accounts: scrypt password hashes, session cookies (only a hash of the cookie is stored), lockout after wrong passwords.
// Two kinds of accounts: staff (teachers and administrators, table teachers) and students (table students).
// Nobody signs up: the administrator creates every account (the very first administrator is made on /setup).
const crypto = require('crypto');
const { token, sha } = require('./db');

const SESSION = { staff: 7 * 86400000, student: 12 * 3600000, parent: 2 * 3600000 };   // a student session ends the same day; a parent's after two hours
const LOCK_AFTER = 5, LOCK_MS = 15 * 60000;                          // 5 wrong passwords → the account waits 15 minutes
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(String(pw), salt, 64, SCRYPT);
  return 'scrypt$' + salt.toString('base64') + '$' + key.toString('base64');
}
function checkPassword(pw, stored) {
  const p = String(stored || '').split('$');
  if (p.length !== 3 || p[0] !== 'scrypt') return false;
  const want = Buffer.from(p[2], 'base64');
  const got = crypto.scryptSync(String(pw), Buffer.from(p[1], 'base64'), want.length, SCRYPT);
  return crypto.timingSafeEqual(want, got);
}
// Compared against when the login is unknown, so a wrong login takes as long as a wrong password.
const DUMMY = hashPassword(crypto.randomBytes(12).toString('hex'));

function parseCookies(req) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach(p => {
    const i = p.indexOf('='); if (i < 0) return;
    const k = p.slice(0, i).trim(); if (!k) return;
    try { out[k] = decodeURIComponent(p.slice(i + 1).trim()); } catch (e) {}
  });
  return out;
}
function cookie(res, name, value, opts) {
  opts = opts || {};
  let c = name + '=' + encodeURIComponent(value) + '; Path=/; HttpOnly; SameSite=Lax';
  if (opts.maxAge != null) c += '; Max-Age=' + Math.floor(opts.maxAge);
  if (opts.secure) c += '; Secure';
  const prev = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', (Array.isArray(prev) ? prev : prev ? [prev] : []).concat(c));
}

/** A new session (the old one of this browser, if any, is dropped: a fresh token after every login). */
function createSession(db, req, res, kind, userId, secure) {
  const old = parseCookies(req).sid;
  if (old) db.prepare('DELETE FROM sessions WHERE token = ?').run(sha(old));
  const t = token(32), ms = SESSION[kind] || SESSION.student;
  db.prepare('INSERT INTO sessions (token, teacher_id, expires, kind) VALUES (?, ?, ?, ?)').run(sha(t), userId, Date.now() + ms, kind);
  db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());
  cookie(res, 'sid', t, { maxAge: ms / 1000, secure: secure });
}
function endSession(db, req, res) {
  const t = parseCookies(req).sid;
  if (t) db.prepare('DELETE FROM sessions WHERE token = ?').run(sha(t));
  cookie(res, 'sid', '', { maxAge: 0 });
}
/** Sign every browser of this account out (password changed / reset, account turned off or deleted). */
function endAll(db, kind, userId) { db.prepare('DELETE FROM sessions WHERE kind = ? AND teacher_id = ?').run(kind, userId); }

function sessionOf(db, req) {
  const t = parseCookies(req).sid;
  if (!t) return null;
  const s = db.prepare('SELECT teacher_id, expires, kind FROM sessions WHERE token = ?').get(sha(t));
  return s && s.expires >= Date.now() ? s : null;
}
/** The signed-in teacher or administrator ({ id, email, name, role, must_change, … }) or null. */
function staffOf(db, req) {
  const s = sessionOf(db, req);
  if (!s || s.kind !== 'staff') return null;
  return db.prepare('SELECT id, email, name, role, must_change, classes, ai_key, ai_model, school_id, terms_at, terms_ver, ai_ack_at FROM teachers WHERE id = ? AND active = 1').get(s.teacher_id) || null;
}
/** The signed-in student ({ id, login, name, class_name }) or null. */
function studentOf(db, req) {
  const s = sessionOf(db, req);
  if (!s || s.kind !== 'student') return null;
  return db.prepare('SELECT id, login, name, class_name, school_id FROM students WHERE id = ? AND active = 1').get(s.teacher_id) || null;
}

/**
 * Check a login. `login` with "@" is a teacher's e-mail, anything else a student's login.
 * Returns { kind, user } or throws a plain object { code } — 'login' (wrong pair, the same answer for an unknown login),
 * 'locked' (too many wrong passwords) or 'off' (account turned off).
 */
function verify(db, login, pw) {
  login = String(login || '').trim().toLowerCase().slice(0, 120);
  const kind = login.indexOf('@') >= 0 ? 'staff' : 'student';
  const table = kind === 'staff' ? 'teachers' : 'students';
  const u = login ? db.prepare('SELECT * FROM ' + table + ' WHERE ' + (kind === 'staff' ? 'email' : 'login') + ' = ?').get(login) : null;
  const n = Date.now();
  if (u && u.locked_until > n) { checkPassword(pw, DUMMY); throw { code: 'locked', until: u.locked_until }; }
  const ok = checkPassword(String(pw || ''), u ? u.pass : DUMMY);
  if (!u || !ok) {
    if (u) {
      const f = u.failed + 1;
      if (f >= LOCK_AFTER) db.prepare('UPDATE ' + table + ' SET failed = 0, locked_until = ? WHERE id = ?').run(n + LOCK_MS, u.id);
      else db.prepare('UPDATE ' + table + ' SET failed = ? WHERE id = ?').run(f, u.id);
    }
    throw { code: 'login', user: u ? (kind === 'staff' ? u.email : u.login) : '' };
  }
  if (!u.active) throw { code: 'off' };
  db.prepare('UPDATE ' + table + ' SET failed = 0, locked_until = 0, last_login = ? WHERE id = ?').run(n, u.id);
  return { kind: kind, user: u };
}

/** Password rules: 8–200 characters, not just one repeated character, not the same as the login. */
function pwProblem(pw, login) {
  pw = String(pw || '');
  if (pw.length < 8 || pw.length > 200) return 'short';
  if (/^(.)\1*$/.test(pw) || (login && pw.toLowerCase() === String(login).toLowerCase())) return 'weak';
  return '';
}

module.exports = { hashPassword, checkPassword, DUMMY, parseCookies, cookie, createSession, endSession, endAll,
  sessionOf, staffOf, studentOf, verify, pwProblem, LOCK_AFTER, LOCK_MS };
