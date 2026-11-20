'use strict';
// © Платон Вороний. All rights reserved. See LICENSE.
// Forgot the administrator's password? Run on the server computer (the server may keep running):
//   npm run reset-password -- admin@school.ua
// Prints a temporary password; at the next login a new one must be chosen. Without an e-mail it lists the staff accounts.
const path = require('path');
const dbm = require('../lib/db');
const auth = require('../lib/auth');

const db = dbm.open(process.env.DB_FILE || path.join(__dirname, '..', 'data', 'tests.db'));
const email = String(process.argv[2] || '').trim().toLowerCase();
if (!email) {
  const rows = db.prepare('SELECT email, name, role, active FROM teachers ORDER BY role, name').all();
  if (!rows.length) console.log('Акаунтів ще немає. Запустіть сервер (npm start) і відкрийте http://localhost:3000/setup');
  rows.forEach(r => console.log((r.role === 'owner' ? 'власник      ' : r.role === 'admin' ? 'адмін школи  ' : 'учитель      ') + '  ' + r.email + '  ' + r.name + (r.active ? '' : '  (вимкнено)')));
  console.log('\nСкинути пароль:  npm run reset-password -- <e-mail>');
  process.exit(0);
}
const t = db.prepare('SELECT id, name FROM teachers WHERE email = ?').get(email);
if (!t) { console.error('Немає акаунта з e-mail ' + email + '. Без e-mail команда покаже список.'); process.exit(1); }
const pw = dbm.password(10);
db.prepare('UPDATE teachers SET pass = ?, must_change = 1, failed = 0, locked_until = 0, active = 1 WHERE id = ?').run(auth.hashPassword(pw), t.id);
auth.endAll(db, 'staff', t.id);
dbm.audit(db, email, 'password', 'reset from the server console', 'console');
console.log('Тимчасовий пароль для ' + t.name + ' (' + email + '):  ' + pw + '\nПри вході потрібно буде придумати новий.');
