'use strict';
// © Платон Вороний. All rights reserved. See LICENSE.
// Kvizora (online tests) — one local server for every subject.
//   npm start            → http://localhost:3000  (students on the same network use the address printed below)
// Settings (environment variables): PORT, GEMINI_API_KEY, DB_FILE, PUBLIC_URL, TRUST_PROXY, COOKIE_SECURE.
const path = require('path');
const fs = require('fs');
const os = require('os');

const [maj, min] = process.versions.node.split('.').map(Number);
if (maj < 22 || (maj === 22 && min < 13)) {
  console.error('Потрібен Node.js 22.13 або новіший (зараз ' + process.version + '). Встановіть LTS-версію з https://nodejs.org');
  process.exit(1);
}
process.removeAllListeners('warning');
process.on('warning', w => { if (w.name !== 'ExperimentalWarning') console.warn(w); });

const express = require('express');
const dbm = require('./lib/db');
const auth = require('./lib/auth');
const { loadSubjects } = require('./lib/engine');
const { Api } = require('./lib/api');
const { Admin, ADMIN_FNS, NO_ME } = require('./lib/admin');
const { Books, FNS: BOOK_FNS } = require('./lib/books');
const { Learn, STAFF_FNS: LEARN_FNS } = require('./lib/learn');
const parents = require('./lib/parents');
const { USER } = require('./lib/errors');
const privacy = require('./lib/privacy');
const md = require('./lib/markdown');
const ui = require('./tools/build-ui');

function createServer(opts) {
  opts = opts || {};
  const ROOT = __dirname;
  const dbFile = opts.dbFile || process.env.DB_FILE || path.join(ROOT, 'data', 'tests.db');
  const db = dbm.open(dbFile);
  // how long personal data is kept: device data and (if set) old results are removed at start and once a day
  const clean = () => { try { privacy.cleanup(db); } catch (e) { console.error('cleanup:', e.message); } };
  clean(); setInterval(clean, 86400000).unref();
  const salt = dbm.meta(db, 'perm_salt', () => dbm.token(12));
  const subjects = loadSubjects(ROOT, salt);
  const port = Number(opts.port || process.env.PORT || 3000);
  const forceSecure = process.env.COOKIE_SECURE === '1';
  let tunnelUrl = '';   // set by lib/tunnel.js when the internet address is known

  function lanIp() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) for (const n of nets[name] || []) {
      if (n.family === 'IPv4' && !n.internal && !/^169\.254\./.test(n.address)) return n.address;
    }
    return '';
  }
  /** Address for students in the classroom network. */
  const lanUrl = () => { const ip = lanIp(); return ip ? 'http://' + ip + ':' + port : 'http://localhost:' + port; };
  /** Address for everybody (internet), or '' when the server is only reachable in the local network. */
  const publicUrl = () => String(opts.publicUrl || process.env.PUBLIC_URL || tunnelUrl || '').replace(/\/+$/, '');
  const appUrl = () => publicUrl() || lanUrl();

  // Where a request comes from. The tunnel (cloudflared) and any reverse proxy run on this computer, so their
  // requests arrive from 127.0.0.1 with a forwarding header; the visitor's address is in that header.
  // A request straight from another device of the local network has its own private address.
  const v4 = a => a.split('.').reduce((n, x) => (n * 256) + Number(x), 0);
  function inLocalNet(ip) {
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/.test(ip)) return true;
    if (/^(fe80:|fc|fd)/i.test(ip)) return true;
    const nets = os.networkInterfaces();
    for (const k of Object.keys(nets)) for (const n of nets[k] || []) {
      if (n.family === 'IPv4' && !n.internal && /^\d+\.\d+\.\d+\.\d+$/.test(ip) && (v4(ip) & v4(n.netmask)) >>> 0 === (v4(n.address) & v4(n.netmask)) >>> 0) return true;
    }
    return false;
  }
  function netOf(req) {
    const sock = String(req.socket.remoteAddress || '').replace(/^::ffff:/, '');
    const loop = /^(127\.|::1$)/.test(sock);
    const fwd = String(req.get('cf-connecting-ip') || (req.get('x-forwarded-for') || '').split(',')[0] || '').trim();
    const proxied = (loop || !!process.env.TRUST_PROXY) && !!fwd;
    const ip = proxied ? fwd.replace(/^::ffff:/, '') : sock;
    return { ip: ip, proxied: proxied, local: !proxied && (loop || inLocalNet(sock)),
      secure: forceSecure || (proxied && /https/.test(String(req.get('x-forwarded-proto') || req.get('cf-visitor') || ''))) };
  }
  const api = new Api(db, subjects, { appUrl, lanUrl, publicUrl, geminiKey: opts.geminiKey !== undefined ? opts.geminiKey : (process.env.GEMINI_API_KEY || ''), geminiCall: opts.geminiCall });
  // «🎓 Навчання»: homework, marks, progress; photos of answers are files in data/hw-files (next to the database)
  const learn = api.learn = new Learn(db, api, opts.hwDir || (dbFile === ':memory:' ? path.join(os.tmpdir(), 'kvizora-hw-' + dbm.token(6)) : path.join(path.dirname(dbFile), 'hw-files')));
  const cleanLearn = () => { try { learn.cleanup(privacy.settings(db).keepAttemptDays); } catch (e) { console.error('cleanup:', e.message); } };
  cleanLearn(); setInterval(cleanLearn, 86400000).unref();
  const cleanParents = () => { try { parents.cleanup(db); } catch (e) { console.error('cleanup:', e.message); } };
  cleanParents(); setInterval(cleanParents, 86400000).unref();

  // pages, built from the core's Student.html / Teacher.html (see tools/build-ui.js)
  const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const pages = {
    student: ui.buildStudent(read('core/Student.html')),
    teacher: ui.buildTeacher(read('core/Teacher.html')),
    login: read('public/login.html'),
    setup: read('public/setup.html'),
    password: read('public/password.html'),
    dashboard: read('public/dashboard.html'),
    admin: read('public/admin.html'),
    my: read('public/my.html'),
    grades: read('public/grades.html'),
    books: read('public/books.html'),
    learn: read('public/learn.html'),
    parent: read('public/parent.html'),
    help: read('public/help.html')
  };

  // the browser gets minified scripts (see lib/minify.js); until that is done (a second after start) the plain ones
  const jsMin = {};
  const ready = process.env.MINIFY === '0' ? Promise.resolve() : (async () => {
    const mini = require('./lib/minify');
    for (const k of Object.keys(pages)) pages[k] = await mini.html(pages[k]);
    const dir = path.join(ROOT, 'public', 'js');
    for (const f of fs.readdirSync(dir).filter(f => /\.js$/.test(f))) jsMin[f] = await mini.js(fs.readFileSync(path.join(dir, f), 'utf8'));
    jsMin['../sw.js'] = await mini.js(fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8'));
  })();

  const app = express();
  app.disable('x-powered-by');

  app.use((req, res, next) => {
    req.net = netOf(req);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' https: data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'");
    if (req.net.secure) res.setHeader('Strict-Transport-Security', 'max-age=15552000');
    next();
  });

  // ---------- rate limits (in memory) ----------
  const buckets = new Map();
  // by: what is counted (default: the IP). A whole class behind one school router (or the tunnel) shares one IP,
  // so student calls are counted per browser / per attempt, with a much higher cap for the IP as a whole.
  function limit(name, max, windowMs, by) {
    return (req, res, next) => {
      const who = by ? by(req) : req.net.ip; if (who == null) return next();
      const k = name + '|' + who, n = Date.now();
      let b = buckets.get(k); if (!b || b.reset < n) { b = { c: 0, reset: n + windowMs }; buckets.set(k, b); }
      if (++b.c > max) return res.status(429).json({ error: 'USER: Too many attempts. Wait a minute and try again. [#rate]' });
      next();
    };
  }
  setInterval(() => { const n = Date.now(); for (const [k, b] of buckets) if (b.reset < n) buckets.delete(k); }, 60000).unref();
  // a signed-in student is counted by account, a guest by the browser cookie of the test; nothing to tell apart → only the IP cap
  const perBrowser = req => { const ck = auth.parseCookies(req), k = (ck.sid || ck.dev || '').slice(0, 16); return k ? req.net.ip + '|' + k : null; };
  // login attempts: per IP and login name (no cookie before the login); a wrong password also locks the account after 5 tries
  const perLogin = req => { const b = req.body || {}; return req.net.ip + '|' + String(b.login != null ? b.login : b.email || '').trim().toLowerCase().slice(0, 120); };

  // ---------- static ----------
  // pdf.js reads a textbook's PDF in the teacher's browser (the file itself is never uploaded); .mjs must be sent as JavaScript
  const PDFJS = path.join(ROOT, 'vendor', 'pdfjs');   // pdf.js 4.10.38, Apache-2.0 (vendor/pdfjs/README.txt)
  const mjs = { maxAge: '7d', setHeaders: (res, f) => { if (/\.mjs$/.test(f)) res.setHeader('Content-Type', 'application/javascript; charset=utf-8'); } };
  app.get(/^\/vendor\/pdfjs\/(pdf|pdf\.worker)\.min\.mjs$/, (req, res) => { res.setHeader('Cache-Control', 'public, max-age=604800'); res.type('application/javascript').sendFile(path.join(PDFJS, req.params[0] + '.min.mjs')); });
  app.use('/vendor/pdfjs/cmaps', express.static(path.join(PDFJS, 'cmaps'), mjs));
  app.use('/vendor/pdfjs/standard_fonts', express.static(path.join(PDFJS, 'standard_fonts'), mjs));
  app.use('/vendor/katex', express.static(path.join(path.dirname(require.resolve('katex/package.json')), 'dist'), { maxAge: '7d' }));
  app.get('/vendor/qr/qrcode.js', (req, res) => { res.setHeader('Cache-Control', 'public, max-age=604800'); res.type('application/javascript').sendFile(path.join(path.dirname(require.resolve('qrcode-generator/package.json')), 'qrcode.js')); });
  app.get('/js/:f', (req, res, next) => {
    const c = jsMin[req.params.f]; if (!c) return next();
    res.setHeader('Cache-Control', 'no-cache'); res.type('application/javascript').send(c);
  });
  app.use('/js', express.static(path.join(ROOT, 'public', 'js'), { maxAge: 0 }));
  app.use('/css', express.static(path.join(ROOT, 'public', 'css'), { maxAge: 0 }));
  // phones: «add to home screen» (web app manifest, icons, service worker)
  app.use('/icons', express.static(path.join(ROOT, 'public', 'icons'), { maxAge: '7d' }));
  app.get('/manifest.webmanifest', (req, res) => res.type('application/manifest+json').sendFile(path.join(ROOT, 'public', 'manifest.webmanifest')));
  app.get('/sw.js', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache'); res.type('application/javascript');
    if (jsMin['../sw.js']) res.send(jsMin['../sw.js']); else res.sendFile(path.join(ROOT, 'public', 'sw.js'));
  });
  app.get('/offline.html', (req, res) => res.sendFile(path.join(ROOT, 'public', 'offline.html')));
  app.get('/favicon.ico', (req, res) => res.type('image/png').sendFile(path.join(ROOT, 'public', 'icons', 'favicon-32.png')));

  const PWA_HEAD = '<link rel="manifest" href="/manifest.webmanifest">\n<meta name="theme-color" content="#0f4f66">\n' +
    '<link rel="icon" href="/icons/icon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">\n' +
    '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="Kvizora">\n' +
    '<script src="/js/pwa.js" defer></script>\n' +
    // every page: a clearly visible keyboard focus, readable «draft» badges, the legal footer
    '<style>:focus-visible{outline:2px solid #0f6f8f;outline-offset:2px}input:focus-visible,select:focus-visible,textarea:focus-visible{box-shadow:0 0 0 3px rgba(15,111,143,.25)}' +
    '.badge.draft{color:#57524d!important}.legal-foot{max-width:1100px;margin:24px auto 16px;padding:0 16px;font-size:12px;color:#6b6560;text-align:center;line-height:1.6}' +
    '.legal-foot a{color:inherit}@media print{.legal-foot{display:none}}</style>\n</head>';
  // every page gets the phone tags (home-screen icon, app name, service worker)
  /** The school whose data this visitor deals with (the data controller in the footer and the legal pages). */
  function schoolOfReq(req, res) {
    const u = auth.staffOf(db, req) || auth.studentOf(db, req);
    let id = u ? u.school_id : res && res.locals.schoolId;
    // a guest following the privacy link from a test page: the school of that test (same-site Referer)
    const ref = !id && /\/t\/([A-Z0-9]{1,16})(?:[?#]|$)/.exec(String(req.get('referer') || '')) || (!id && req.query && /^[A-Z0-9]{1,16}$/.test(String(req.query.t || '')) && [0, String(req.query.t)]);
    if (ref) { const tt = db.prepare('SELECT te.school_id FROM tests t JOIN teachers te ON te.id = t.teacher_id WHERE t.id = ?').get(ref[1]); if (tt) id = tt.school_id; }
    if (!id) { const all = db.prepare('SELECT id FROM schools LIMIT 2').all(); if (all.length === 1) id = all[0].id; }
    return id ? privacy.schoolInfo(db, id) : null;
  }
  const footer = sc => '<footer class="legal-foot">Kvizora · <a href="/legal/terms">Умови використання</a> · <a href="/legal/privacy">Політика конфіденційності</a> · ' +
    '<a href="/legal/cookies">Cookie</a> · <a href="/legal/licenses">Ліцензії</a><br>Оператор даних: ' + md.esc(sc ? (sc.legalName || sc.name) : 'заклад освіти, що користується Kvizora') +
    '. Програма надається «як є», без гарантій. Лише необхідні cookie, без реклами та аналітики.</footer>\n</body>';
  // every page gets the phone tags (home-screen icon, app name, service worker) and the legal footer
  const html = (res, s) => {
    res.setHeader('Cache-Control', 'no-store');
    const sc = schoolOfReq(res.req, res);
    res.type('html').send(String(s).replace('</head>', () => PWA_HEAD).replace(/<\/body>(?![\s\S]*<\/body>)/, () => footer(sc)));
  };
  const jsStr = v => JSON.stringify(String(v == null ? '' : v)).replace(/</g, '\\u003c');
  // the browser id of a test attempt: set only when the attempt starts (after the student read the notice), see startAttempt
  const setDev = (req, res) => () => { const v = dbm.token(24); auth.cookie(res, 'dev', v, { maxAge: 180 * 86400, secure: req.net.secure }); return v; };
  const hasAdmin = () => !!db.prepare("SELECT 1 FROM teachers WHERE role = 'owner'").get();
  const isAdm = t => !!t && (t.role === 'owner' || t.role === 'admin');   // the owner (every school) or a school's administrator
  const needTerms = t => !t.terms_at || t.terms_ver !== privacy.TERMS_VERSION;   // never accepted, or accepted an older version of the Terms
  const codeOf = v => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
  /** Where a signed-in user starts. */
  function homeOf(req) {
    const st = auth.studentOf(db, req); if (st) return '/my';
    const t = auth.staffOf(db, req); if (!t) return '';
    if (t.must_change || needTerms(t)) return '/password';
    return isAdm(t) ? '/admin' : '/app';
  }
  // only these addresses may follow ?next= after the login (no jumping to another site)
  const safeNext = v => /^\/(t\/[A-Z0-9]{1,16}|app(\/[a-z]{1,20})?|admin|my)$/.test(String(v || '')) ? String(v) : '';
  const loginUrl = next => '/login' + (next ? '?next=' + encodeURIComponent(next) : '');
  /** The teacher pages: a staff session whose first password was already changed. */
  function staffPage(req, res) {
    const t = auth.staffOf(db, req);
    if (!t) { res.redirect(loginUrl(safeNext(req.path))); return null; }
    if (t.must_change || needTerms(t)) { res.redirect('/password'); return null; }
    return t;
  }

  app.get('/', (req, res) => {
    if (req.query.t) return res.redirect('/t/' + codeOf(req.query.t));   // old links and QR codes: /?t=CODE
    if (!hasAdmin()) return res.redirect('/setup');
    res.redirect(homeOf(req) || '/login');
  });
  // a test: only for a signed-in student (the code / QR leads to the login and then straight here)
  app.get('/t/:id', (req, res) => {
    const id = codeOf(req.params.id);
    const st = auth.studentOf(db, req);
    const t = st ? null : db.prepare('SELECT * FROM tests WHERE id = ?').get(id);
    // without an account: a «🌍 Кожний бажаючий» test, or a class test the teacher opened to guests ("by code"): the page asks for the name
    const guests = !!t && api.guestsOk(t);
    if (!st && (!guests || auth.staffOf(db, req))) {
      if (auth.staffOf(db, req)) return html(res, pages.login.replace('__MODE__', 'staff-test'));
      return res.redirect(loginUrl('/t/' + id));
    }
    const tt = db.prepare('SELECT te.school_id FROM tests t JOIN teachers te ON te.id = t.teacher_id WHERE t.id = ?').get(id); if (tt) res.locals.schoolId = tt.school_id;
    html(res, pages.student.replace('<?= testId ?>', () => id)
      .replace('__STUDENT__', () => st ? '{ name: ' + jsStr(st.name) + ', cls: ' + jsStr(st.class_name) + ' }' : 'null'));
  });
  app.get('/login', (req, res) => {
    if (!hasAdmin()) return res.redirect('/setup');
    const home = homeOf(req), next = safeNext(req.query.next);
    if (home) return res.redirect(home === '/password' ? home : (next && (next.indexOf('/t/') === 0) === (home === '/my') ? next : home));
    html(res, pages.login.replace('__MODE__', 'login'));
  });
  app.get('/setup', (req, res) => hasAdmin() ? res.redirect('/login') : html(res, pages.setup.replace('__LOCAL__', req.net.local ? '1' : '')));
  app.get('/password', (req, res) => (auth.staffOf(db, req) || auth.studentOf(db, req)) ? html(res, pages.password) : res.redirect('/login'));
  // tutorials: each role sees only its own lessons (students: how to take a test; teachers: everything about tests;
  // administrators: also the admin panel). Running the server is described only in the owner's guide in the archive.
  app.get('/help', (req, res) => {
    const t = auth.staffOf(db, req), st = t ? null : auth.studentOf(db, req), par = t || st ? null : parentOf(req);
    // nobody signed in (a parent or a student on the login page): the student's and the parents' lessons
    const role = t ? (isAdm(t) ? 'admin' : 'teacher') : st ? 'student' : par ? 'parent' : 'guest';
    const sees = roles => roles.indexOf(role) >= 0 || (role === 'guest' && (roles.indexOf('student') >= 0 || roles.indexOf('parent') >= 0));
    let h = pages.help.replace(/<section class="card lesson" id="[^"]*" data-role="([^"]*)"[\s\S]*?<\/section>\n?/g, (m, roles) => sees(roles.split(' ')) ? m : '');
    for (let i = 0; i < 20; i++) {   // group headings left without lessons
      const h2 = h.replace(/<div class="group-h"[^>]*>[^<]*<\/div>\s*(?=<div class="group-h"|<div class="card" id="nothing")/, '');
      if (h2 === h) break; h = h2;
    }
    if (role === 'parent') h = h.replace(/<small id="introRole">[^<]*<\/small>/, '<small id="introRole">Як увійти за кодом і що видно на сторінці батьків.</small>');
    if (role === 'student' || role === 'guest') h = h.replace(/<small id="introRole">[^<]*<\/small>/, '<small id="introRole">Як пройти тест, здати д/з і побачити оцінки.</small>');
    html(res, h.replace('href="/app">← До кабінету', () => t ? 'href="/app">← До кабінету' : st ? 'href="/my">← Мої тести' : par ? 'href="/parent">← До сторінки батьків' : 'href="/login">← Вхід'));
  });
  app.get('/my', (req, res) => auth.studentOf(db, req) ? html(res, pages.my) : res.redirect(homeOf(req) || '/login'));
  // a photo of a task or an answer: only for the task's teacher, the student who handed it in, or (the task's own pictures) its class
  app.get(/^\/learn\/file\/([a-f0-9]{32})\.jpg$/, (req, res) => {
    const staff = auth.staffOf(db, req), student = staff ? null : auth.studentOf(db, req);
    const f = (staff || student) && learn.file({ staff: staff, student: student }, req.params[0]);
    if (!f) return res.status(404).type('text').send('Not found');
    res.setHeader('Cache-Control', 'private, no-store'); res.setHeader('Content-Disposition', 'inline; filename="photo.jpg"');
    res.type('image/jpeg').send(f);
  });
  app.get('/admin', (req, res) => {
    const t = staffPage(req, res); if (!t) return;
    if (!isAdm(t)) return res.redirect('/app');
    html(res, pages.admin);
  });
  app.get('/app', (req, res) => { if (staffPage(req, res)) html(res, pages.dashboard); });
  app.get('/app/grades', (req, res) => { if (staffPage(req, res)) html(res, pages.grades); });
  app.get('/app/books', (req, res) => { if (staffPage(req, res)) html(res, pages.books); });
  app.get('/app/learn', (req, res) => { if (staffPage(req, res)) html(res, pages.learn); });
  app.get('/app/settings', (req, res) => { if (staffPage(req, res)) html(res, pages.dashboard); });
  app.get('/app/books/img/:id/:page.jpg', (req, res) => {
    const t = staffPage(req, res); if (!t) return;
    let img = null; try { img = books.image(t, req.params.id, req.params.page); } catch (e) {}
    if (!img) return res.status(404).send('Not found');
    res.setHeader('Cache-Control', 'private, max-age=3600'); res.type('image/jpeg').send(img);
  });
  app.get('/app/:subject', (req, res) => {
    const t = staffPage(req, res); if (!t) return;
    if (!subjects[req.params.subject]) return res.redirect('/app');
    const name = JSON.stringify(t.name).slice(1, -1).replace(/</g, '\\u003c');
    html(res, pages.teacher.replace('<?= testId ?>', () => String(req.query.r || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 16))
      .split('__SUBJECT__').join(req.params.subject).replace('__TEACHER__', () => name).replace('__AIACK__', t.ai_ack_at ? 'true' : 'false'));
  });
  app.get('/app/export/:subject/:id.csv', (req, res) => {
    const t = staffPage(req, res); if (!t) return;
    try {
      const csv = api.exportCsv(t, api.subj(req.params.subject), req.params.id);
      res.setHeader('Content-Disposition', 'attachment; filename="results-' + req.params.id.replace(/[^A-Za-z0-9]/g, '') + '.csv"');
      res.type('text/csv; charset=utf-8').send(csv);
    } catch (e) { res.status(404).send('Not found'); }
  });

  // the gradebook of a class as a spreadsheet (for the school's official journal); logged
  app.get('/app/journal/:subject.csv', (req, res) => {
    const t = staffPage(req, res); if (!t) return;
    try {
      api._req = req;
      const r = api.exportGradebook(t, api.subj(req.params.subject), String(req.query.c || '').slice(0, 40), Number(req.query.g) || 0);
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Disposition', "attachment; filename=\"journal.csv\"; filename*=UTF-8''" + encodeURIComponent(r.name));
      res.type('text/csv; charset=utf-8').send(r.csv);
    } catch (e) { res.status(e && e.status || 404).type('text/plain; charset=utf-8').send(String(e && e.message || 'Not found').replace(/^USER:/, '')); }
  });

  // ---------- JSON API ----------
  const small = express.json({ limit: '256kb' }), big = express.json({ limit: '15mb' });
  // Requests must come from this app's own pages: they send this header (a form or link on another site cannot),
  // and when the browser says where the page came from (Origin), it must be this server's own address.
  const sameApp = (req, res, next) => {
    const o = req.get('origin');
    let okOrigin = true;
    if (o && o !== 'null') { try { okOrigin = new URL(o).host === req.get('host'); } catch (e) { okOrigin = false; } }
    if (req.get('X-Tests-App') !== '1' || !okOrigin) return res.status(403).json({ error: 'USER: Forbidden. [#forbidden]' });
    res.setHeader('Cache-Control', 'no-store');
    next();
  };
  function send(res, fn) {
    Promise.resolve().then(fn).then(out => res.json({ ok: true, result: out === undefined ? null : out }), err => {
      const m = String(err && err.message || err);
      if (m.indexOf('USER:') >= 0) return res.status(err.status || 400).json({ error: m.slice(m.indexOf('USER:')) });
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    });
  }
  const args = req => Array.isArray(req.body && req.body.args) ? req.body.args : [];
  const pwCheck = (pw, login) => {
    const p = auth.pwProblem(pw, login);
    if (p === 'short') throw USER('su_pw', 'The password must be at least 8 characters.');
    if (p) throw USER('pw_weak', 'This password is too simple. Choose another one.');
  };
  /** The signed-in teacher / administrator for an API call. */
  function needStaff(req, admin) {
    const t = auth.staffOf(db, req); if (!t) throw USER('auth', 'Please log in.', 401);
    if (t.must_change) throw USER('must_change', 'Choose your own password first.', 403);
    if (needTerms(t)) throw USER('terms', 'Accept the Terms of Use first.', 403);
    if (admin && !isAdm(t)) throw USER('forbidden', 'Only an administrator can do this.', 403);
    return t;
  }
  function needStudent(req) { const s = auth.studentOf(db, req); if (!s) throw USER('auth', 'Please log in.', 401); return s; }

  // accounts — nobody signs up: the administrator creates teachers and students; the first administrator is made here,
  // once, and only on the server computer or in its local network
  app.post('/api/setup', limit('setup', 10, 3600000), small, sameApp, (req, res) => send(res, () => {
    if (hasAdmin()) throw USER('setup_done', 'The administrator already exists. Log in.', 409);
    if (!req.net.local) throw USER('setup_local', 'The first administrator can be created only on the server computer or in the school network.', 403);
    const b = req.body || {}, school = String(b.school || '').replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
    const name = String(b.name || '').trim().slice(0, 80), email = String(b.email || '').trim().toLowerCase().slice(0, 120), pw = String(b.password || '');
    if (school.length < 2) throw USER('sc_name', 'Type the school name.');
    if (name.length < 2) throw USER('su_name', 'Please type your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw USER('su_email', 'Please type a valid e-mail.');
    pwCheck(pw, email);
    if (b.terms !== true || b.schoolOk !== true) throw USER('terms', 'Tick both boxes: the Terms and the school’s responsibility.');
    const id = dbm.tx(db, () => {
      if (hasAdmin()) throw USER('setup_done', 'The administrator already exists. Log in.', 409);
      const sc = db.prepare('SELECT id FROM schools WHERE name = ?').get(school) || { id: Number(db.prepare('INSERT INTO schools (name, created) VALUES (?, ?)').run(school, Date.now()).lastInsertRowid) };
      return Number(db.prepare("INSERT INTO teachers (email, name, pass, created, role, school_id, terms_at, terms_ver) VALUES (?, ?, ?, ?, 'owner', ?, ?, ?)").run(email, name, auth.hashPassword(pw), Date.now(), sc.id, Date.now(), privacy.TERMS_VERSION).lastInsertRowid);
    });
    dbm.audit(db, email, 'setup', 'first administrator', req.net.ip);
    auth.createSession(db, req, res, 'staff', id, req.net.secure);
    return { next: '/admin' };
  }));
  app.post('/api/auth/login', limit('login-ip', 300, 60000), small, limit('login', 20, 60000, perLogin), sameApp, (req, res) => send(res, () => {
    const b = req.body || {};
    let r;
    try { r = auth.verify(db, b.login != null ? b.login : b.email, b.password); }
    catch (e) {
      if (!e || !e.code) throw e;
      if (e.code === 'login' && e.user) dbm.audit(db, e.user, 'login.fail', '', req.net.ip);
      if (e.code === 'locked') throw USER('locked', 'Too many wrong passwords. The account is locked for 15 minutes (the administrator can unlock it).', 423);
      if (e.code === 'off') throw USER('off', 'This account is turned off. Ask the administrator.', 403);
      throw USER('login', 'Wrong login or password.', 401);
    }
    auth.createSession(db, req, res, r.kind, r.user.id, req.net.secure);
    dbm.audit(db, r.kind === 'staff' ? r.user.email : r.user.login, 'login', r.kind, r.kind === 'staff' ? req.net.ip : '');   // no student IPs in the log
    const next = safeNext(b.next);
    let go;
    if (r.kind === 'student') go = next && next.indexOf('/t/') === 0 ? next : '/my';
    else if (r.user.must_change || needTerms(r.user)) go = '/password';
    else go = next && next.indexOf('/t/') !== 0 && (next !== '/admin' || isAdm(r.user)) ? next : (isAdm(r.user) ? '/admin' : '/app');
    return { role: r.kind === 'student' ? 'student' : r.user.role, mustChange: r.kind === 'staff' && !!r.user.must_change, next: go };
  }));
  // parents: read-only, one student, by a code from the school's administrator (see lib/parents.js); nothing about the parent is kept
  const parentOf = req => parents.ofSession(db, auth.sessionOf(db, req));
  app.get('/parent', (req, res) => html(res, pages.parent));
  app.post('/api/parent/login', limit('parent-ip', 10, 600000), limit('parent-all', 300, 60000, () => 'all'), small, sameApp, (req, res) => send(res, () => {
    const p = parents.check(db, (req.body || {}).code);
    if (!p) throw USER('parent_code', 'This code does not work. Check it, or ask the school for a new one.', 401);
    auth.createSession(db, req, res, 'parent', p.codeId, req.net.secure);
    parents.logIn(db, p, '');   // no parents' IPs in the log
    return { ok: true };
  }));
  app.post('/api/parent/home', limit('parent-home', 120, 60000, perBrowser), small, sameApp, (req, res) => send(res, () => {
    const p = parentOf(req); if (!p) throw USER('auth', 'Type the code again.', 401);
    res.setHeader('Cache-Control', 'no-store');
    return parents.home(api, learn, p);
  }));
  app.post('/api/auth/logout', small, sameApp, (req, res) => send(res, () => { auth.endSession(db, req, res); return { ok: true }; }));
  app.post('/api/auth/me', small, sameApp, (req, res) => send(res, () => {
    const t = auth.staffOf(db, req); if (t) return { role: t.role, name: t.name, login: t.email, mustChange: !!t.must_change, needTerms: needTerms(t), termsChanged: needTerms(t) && !!t.terms_at };
    const s = needStudent(req); return { role: 'student', name: s.name, login: s.login, cls: s.class_name };
  }));
  app.post('/api/auth/password', limit('pw', 10, 60000, perBrowser), small, sameApp, (req, res) => send(res, () => {
    const t = auth.staffOf(db, req), s = t ? null : auth.studentOf(db, req);
    if (!t && !s) throw USER('auth', 'Please log in.', 401);
    const table = t ? 'teachers' : 'students', id = t ? t.id : s.id, login = t ? t.email : s.login;
    const b = req.body || {}, row = db.prepare('SELECT pass FROM ' + table + ' WHERE id = ?').get(id);
    const accept = t && needTerms(t);   // a teacher's first password: the Terms are accepted on the same page
    if (!auth.checkPassword(String(b.old || ''), row.pass)) throw USER('pw_old', 'The current password is wrong.', 401);
    pwCheck(b.password, login);
    if (String(b.password) === String(b.old)) throw USER('pw_same', 'The new password must be different.');
    if (accept && (b.terms !== true || b.schoolOk !== true)) throw USER('terms', 'Tick both boxes: the Terms and the school’s responsibility.');
    db.prepare('UPDATE ' + table + ' SET pass = ?' + (t ? ', must_change = 0' : '') + ' WHERE id = ?').run(auth.hashPassword(String(b.password)), id);
    if (accept) { db.prepare('UPDATE teachers SET terms_at = ?, terms_ver = ? WHERE id = ?').run(Date.now(), privacy.TERMS_VERSION, id); dbm.audit(db, login, 'terms', privacy.TERMS_VERSION, req.net.ip); }
    auth.endAll(db, t ? 'staff' : 'student', id);   // every other browser of this account is signed out
    auth.createSession(db, req, res, t ? 'staff' : 'student', id, req.net.secure);
    dbm.audit(db, login, 'password', '', req.net.ip);
    return { ok: true, next: t ? (isAdm(t) ? '/admin' : '/app') : '/my' };
  }));

  // a staff account that already has its own password but has not accepted the Terms yet (made before they existed)
  app.post('/api/auth/accept', small, sameApp, (req, res) => send(res, () => {
    const t = auth.staffOf(db, req); if (!t) throw USER('auth', 'Please log in.', 401);
    const b = req.body || {};
    if (b.terms !== true || b.schoolOk !== true) throw USER('terms', 'Tick both boxes: the Terms and the school’s responsibility.');
    db.prepare('UPDATE teachers SET terms_at = ?, terms_ver = ? WHERE id = ?').run(Date.now(), privacy.TERMS_VERSION, t.id);
    dbm.audit(db, t.email, 'terms', privacy.TERMS_VERSION, req.net.ip);
    return { ok: true, next: t.must_change ? '/password' : (isAdm(t) ? '/admin' : '/app') };
  }));

  // personal data: a teacher's own data (export, delete the account) and one student's data in the teacher's tests
  app.get('/account/data.json', (req, res) => {
    const t = staffPage(req, res); if (!t) return;
    dbm.audit(db, t.email, 'data.self.export', '', req.net.ip);
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Disposition', 'attachment; filename="kvizora-my-data.json"');
    res.type('application/json').send(JSON.stringify(privacy.exportTeacher(db, t), null, 1));
  });
  app.post('/api/me/delete', limit('pw', 10, 60000, perBrowser), small, sameApp, (req, res) => send(res, () => {
    const t = needStaff(req), b = req.body || {};
    const row = db.prepare('SELECT pass FROM teachers WHERE id = ?').get(t.id);
    if (!auth.checkPassword(String(b.password || ''), row.pass)) throw USER('pw_old', 'The password is wrong.', 401);
    admin.ip = req.net.ip; admin.me = t; admin.deleteSelf(t);
    auth.endSession(db, req, res);
    return { ok: true, next: '/login' };
  }));
  const DATA_FNS = { findStudent: 1, exportStudent: 1, deleteStudent: 1, renameStudent: 1 };
  app.post('/api/data/:fn', limit('data', 120, 60000), small, sameApp, (req, res) => send(res, () => {
    const t = needStaff(req), fn = req.params.fn, a = args(req);
    if (!DATA_FNS[fn]) throw USER('bad', 'Unknown call.', 404);
    if (fn === 'renameStudent') return privacy.renameStudent(db, t, a[0], a[1], n => api.subjects[Object.keys(api.subjects)[0]].ctx.nameKey_(n), req.net.ip);
    return privacy[fn](db, t, a[0], req.net.ip);
  }));
  app.post('/api/t/:subject/ackAi', small, sameApp, (req, res) => send(res, () => {
    const t = needStaff(req);
    if (!t.ai_ack_at) { db.prepare('UPDATE teachers SET ai_ack_at = ? WHERE id = ?').run(Date.now(), t.id); dbm.audit(db, t.email, 'ai.ack', '', req.net.ip); }
    return { ok: true };
  }));

  // administrator
  const admin = new Admin(db, api);
  const books = new Books(db, api);
  // «📚 Підручники»: every teacher and administrator of a school, for that school's textbooks
  app.post('/api/books/:fn', limit('books', 240, 60000), big, sameApp, (req, res) => send(res, () => {
    const t = needStaff(req), fn = req.params.fn;
    if (BOOK_FNS.indexOf(fn) < 0) throw USER('bad', 'Unknown call.', 404);
    books.ip = req.net.ip;
    return books[fn].apply(books, [t].concat(args(req)));
  }));
  // «🎓 Навчання» (teachers and administrators): homework, marks, progress
  app.post('/api/learn/:fn', limit('learn', 600, 60000), big, sameApp, (req, res) => send(res, () => {
    const t = needStaff(req), fn = req.params.fn;
    if (LEARN_FNS.indexOf(fn) < 0) throw USER('bad', 'Unknown call.', 404);
    return learn[fn].apply(learn, [t].concat(args(req)));
  }));
  // classes of the teacher's own school: a teacher may add them too (students are still added by the administrator)
  const CLASS_FNS = ['myClasses', 'addMyClass', 'deleteMyClass'];
  app.post('/api/classes/:fn', limit('classes', 120, 60000), small, sameApp, (req, res) => send(res, () => {
    const t = needStaff(req), fn = req.params.fn;
    if (CLASS_FNS.indexOf(fn) < 0) throw USER('bad', 'Unknown call.', 404);
    admin.me = t; admin.ip = req.net.ip;
    return admin[fn].apply(admin, [t].concat(args(req)));
  }));
  app.post('/api/admin/:fn', limit('admin', 600, 60000), small, sameApp, (req, res) => send(res, () => {
    const me = needStaff(req, true), fn = req.params.fn;
    if (ADMIN_FNS.indexOf(fn) < 0) throw USER('bad', 'Unknown call.', 404);
    admin.ip = req.net.ip; admin.me = me;
    return NO_ME[fn] ? admin[fn].apply(admin, args(req)) : admin[fn].apply(admin, [me].concat(args(req)));
  }));

  // teacher
  const TEACHER_FNS = ['listTests', 'getTest', 'saveTest', 'setStatus', 'saveTestSettings', 'startNow', 'stopNow', 'deleteTest', 'addSampleTests',
    'getResults', 'setOverride', 'deleteAttempt', 'listClasses', 'saveClasses', 'saveAiKey', 'generateFromPhotos', 'autoTranslate',
    'gradeClasses', 'gradebook', 'setGrade', 'setDayMark', 'setDayTopic', 'setFinalMark', 'renameTheme', 'shareTest', 'schoolBank', 'copyFromBank', 'studentReport', 'setReview', 'explainTest'];
  app.post('/api/dashboard', small, sameApp, (req, res) => send(res, () => {
    const t = needStaff(req);
    api._req = req; return api.dashboard(t);
  }));
  app.post('/api/t/:subject/:fn', big, sameApp, (req, res) => send(res, () => {
    const t = needStaff(req);
    const fn = req.params.fn; if (TEACHER_FNS.indexOf(fn) < 0) throw USER('bad', 'Unknown call.', 404);
    const S = api.subj(req.params.subject);
    api._req = req;
    // the pages pass the old PIN as the first argument; the session cookie replaces it
    return api[fn].apply(api, [t, S].concat(args(req).slice(1)));
  }));

  // student (always signed in: the name and the class come from the account)
  const perAttempt = req => { const a = req.body && Array.isArray(req.body.args) ? String(req.body.args[0] || '').slice(0, 40) : ''; return req.net.ip + '|' + a; };
  app.post('/api/student/review', limit('review', 120, 60000, perBrowser), small, sameApp, (req, res) => send(res, () => api.studentReview(needStudent(req), args(req)[0])));
  app.post('/api/student/learn', limit('home', 120, 60000, perBrowser), small, sameApp, (req, res) => send(res, () => learn.studentHome(needStudent(req))));
  app.post('/api/student/hwSubmit', limit('hw', 30, 60000, perBrowser), express.json({ limit: '6mb' }), sameApp, (req, res) => send(res, () => { const a = args(req); return learn.submit(needStudent(req), a[0], a[1], a[2], a[3]); }));
  app.post('/api/student/home', limit('home', 120, 60000, perBrowser), small, sameApp, (req, res) => send(res, () => api.studentHome(needStudent(req))));
  app.post('/api/s/testInfo', limit('info-ip', 1200, 60000), limit('info', 60, 60000, perBrowser), small, sameApp, (req, res) => send(res, () => {
    const st = auth.studentOf(db, req), info = api.testInfo(args(req)[0], req.net, st);   // no account: only for a test that allows guests
    return st ? Object.assign(info, { student: { name: st.name, cls: st.class_name } }) : info;
  }));
  app.post('/api/s/listOpenTests', small, sameApp, (req, res) => send(res, () => ({ serverNow: Date.now(), tests: [], classes: [] })));
  app.post('/api/s/startAttempt', limit('start-ip', 600, 60000), limit('start', 30, 60000, perBrowser), small, sameApp, (req, res) => send(res, () => {
    const st = auth.studentOf(db, req), a = args(req);
    return api.startAttempt(a[0], a[1], a[2], a[3], { ip: req.net.ip, local: req.net.local, ua: req.get('user-agent') || '', devId: auth.parseCookies(req).dev || '', setDev: setDev(req, res), student: st });
  }));
  const own = req => { const a = args(req); api.checkOwner(a[0], auth.studentOf(db, req)); return a; };
  app.post('/api/s/saveProgress', limit('save-ip', 6000, 60000), small, limit('save', 240, 60000, perAttempt), sameApp, (req, res) => send(res, () => { const a = own(req); return api.saveProgress(a[0], a[1], a[2], a[3], req.net); }));
  app.post('/api/s/submitAttempt', limit('save-ip', 6000, 60000), small, limit('save', 240, 60000, perAttempt), sameApp, (req, res) => send(res, () => { const a = own(req); return api.submitAttempt(a[0], a[1], a[2], a[3], req.net); }));
  app.post('/api/s/translateQuestion', limit('tr-ip', 600, 60000), small, limit('tr', 40, 60000, perAttempt), sameApp, (req, res) => send(res, () => { const a = own(req); return api.translateQuestion(a[0], a[1]); }));

  // ---------- legal pages (open without logging in) ----------
  const LEGAL = { privacy: ['privacy-policy.md', 'Політика конфіденційності'], terms: ['terms-of-use.md', 'Умови використання'], cookies: ['cookie-notice.md', 'Cookie'], copyright: ['copyright-takedown.md', 'Скарги правовласників'] };
  /** The placeholders of the texts get the school's details (administrator → «Дані й право») and the owner's. */
  function fillLegal(text, sc) {
    const p = privacy.settings(db), o = p.owner, put = (from, to) => { if (to) text = text.split(from).join(to); };
    if (sc) {
      const name = sc.legalName || sc.name;
      put('[Повна назва закладу освіти], код ЄДРПОУ [______] | [адреса], [e-mail], [телефон]',
        name + (sc.edrpou ? ', код ЄДРПОУ ' + sc.edrpou : '') + ' | ' + [sc.address, sc.email, sc.phone].filter(Boolean).join(', '));
      put('[ПІБ, посада] | [e-mail]', sc.person && sc.person + ' | ' + (sc.email || '—'));
      put('напишіть відповідальній особі [e-mail]', sc.email && 'напишіть відповідальній особі ' + sc.email);
      put('відповідальна особа закладу освіти [e-mail]', sc.email && 'відповідальна особа закладу освіти ' + sc.email);
      put('[назва закладу освіти]', name);
    }
    put('[ПІБ / назва Власника, РНОКПП або ЄДРПОУ, адреса] | [e-mail]', o.name && [o.name, o.address].filter(Boolean).join(', ') + ' | ' + (o.email || '—'));
    put('[ПІБ / назва, РНОКПП або ЄДРПОУ, адреса, e-mail]', o.name && [o.name, o.address, o.email].filter(Boolean).join(', '));
    // the owner's name is in the texts; the address and e-mail come from «Дані й право» → owner card
    put('Платон Вороний, [РНОКПП], [адреса] | [e-mail]', (o.address || o.email) && 'Платон Вороний' + (o.address ? ', ' + o.address : '') + ' | ' + (o.email || '—'));
    put('Платон Вороний, [РНОКПП], [адреса], [e-mail]', (o.address || o.email) && ['Платон Вороний', o.address, o.email].filter(Boolean).join(', '));
    put('[e-mail Розробника]', o.email); put('повідомити на [e-mail]', o.email && 'повідомити на ' + o.email);
    put('[90 днів]', p.keepDeviceDays + ' днів');
    put('(типово 90 днів після здачі тесту)', '(зараз — ' + p.keepDeviceDays + ' днів після початку тесту)');
    put('](cookie-notice.md)', '](/legal/cookies)'); put('](privacy-policy.md)', '](/legal/privacy)'); put('](terms-of-use.md)', '](/legal/terms)'); put('](copyright-takedown.md)', '](/legal/copyright)');
    put('[адреса сервера / посилання]', api.publicUrl() || '');
    return text;
  }
  const legalPage = (res, title, body) => html(res, '<!DOCTYPE html>\n<html lang="uk">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
    '<title>' + md.esc(title) + ' — Kvizora</title>\n<link rel="stylesheet" href="/css/app.css">\n<style>.legal h2{margin-top:26px}.legal h3,.legal h4{margin-top:18px}.legal blockquote{margin:12px 0;padding:8px 14px;border-left:4px solid var(--line);color:var(--muted)}.legal td,.legal th{vertical-align:top}</style>\n</head>\n<body>\n' +
    '<header><div class="wrap"><h1>Kvizora<small>' + md.esc(title) + '</small></h1><a class="btn head" href="/" style="text-decoration:none">← На головну</a></div></header>\n' +
    '<main><article class="card legal">' + body + '</article></main>\n</body>\n</html>');
  app.get('/legal/:doc', (req, res, next) => {
    if (req.params.doc === 'licenses') {
      let t = ''; try { t = fs.readFileSync(path.join(ROOT, 'THIRD-PARTY-NOTICES.txt'), 'utf8'); } catch (e) {}
      return legalPage(res, 'Ліцензії', '<h2>Ліцензії стороннього програмного забезпечення</h2><p>Kvizora — закрита програма (усі права захищено). Вона використовує бібліотеки з відкритим кодом; їхні автори й ліцензії нижче.</p><pre style="white-space:pre-wrap;font-size:12px;line-height:1.45">' + md.esc(t) + '</pre>');
    }
    const d = LEGAL[req.params.doc]; if (!d) return next();
    let t; try { t = fs.readFileSync(path.join(ROOT, 'LEGAL', d[0]), 'utf8'); } catch (e) { return next(); }
    legalPage(res, d[1], md.render(fillLegal(t, schoolOfReq(req, res))));
  });

  app.use((req, res) => res.status(404).type('text').send('Not found'));
  app.use((err, req, res, next) => {   // e.g. a body that is too large or not JSON
    res.status(err.status || 400).json({ error: 'USER: The request could not be read. [#bad_request]' });
  });

  return { app, db, api, books, learn, subjects, port, ready, appUrl, lanIp, lanUrl, publicUrl, setTunnelUrl: u => { tunnelUrl = u || ''; } };
}

if (require.main === module) {
  const s = createServer();
  s.ready.catch(e => console.error('Minify failed, serving plain scripts:', e.message)).then(() => s.app.listen(s.port, '0.0.0.0', () => {
    const ip = s.lanIp();
    console.log('\nKvizora запущено.');
    console.log('  Kvizora надається «як є», без гарантій. Робіть резервні копії data/tests.db. © Платон Вороний. Усі права захищено. Умови: LEGAL/terms-of-use.md');
    console.log('  Вхід (на цьому комп’ютері):      http://localhost:' + s.port + '/login');
    if (!s.db.prepare("SELECT 1 FROM teachers WHERE role = 'owner'").get()) console.log('  ⚠️  Адміністратора ще немає: відкрийте http://localhost:' + s.port + '/setup на цьому комп’ютері.');
    if (ip) console.log('  Учні в мережі класу (Wi-Fi):     http://' + ip + ':' + s.port);
    if (process.env.PUBLIC_URL) console.log('  Учні звідусіль (інтернет):       ' + process.env.PUBLIC_URL);
    else if (process.env.INTERNET !== '0') {
      console.log('  Учні звідусіль (інтернет):       запускаю тунель…');
      require('./lib/tunnel').startTunnel(s.port, u => {
        s.setTunnelUrl(u);
        if (u) console.log('\n  ✅ Інтернет-адреса для учнів: ' + u + '\n     (вона ж показана в кабінеті вчителя; змінюється після перезапуску)\n');
      }, m => console.log('  ' + m));
    } else console.log('  Інтернет-доступ вимкнено (INTERNET=0): лише мережа класу.');
    console.log('  Предмети: ' + Object.keys(s.subjects).join(', '));
    console.log('  ШІ (Gemini): ' + (process.env.GEMINI_API_KEY ? 'ключ із GEMINI_API_KEY' : 'GEMINI_API_KEY не задано — учитель може вставити ключ у кабінеті'));
    console.log('Зупинити: Ctrl+C\n');
  }));
}

module.exports = { createServer };
