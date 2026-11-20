'use strict';
// © Платон Вороний. All rights reserved. See LICENSE.
// One row of tabs under the header on every staff page: Тести · Навчання · Журнал · Підручники · Налаштування · Адмін,
// then «?» (the tutorial for this page) and «Вийти». A page marks its tab with data-active on this script tag
// (or it is found from the address). The administrator's tab shows only for administrators.
(function () {
  var LEARN = true;    // «🎓 Навчання» (homework, lessons): turned on when that page is part of the build
  var me = document.currentScript;
  var ITEMS = [
    { k: 'tests', href: '/app', uk: '📝 Тести', en: '📝 Tests' },
    { k: 'learn', href: '/app/learn', uk: '🎓 Навчання', en: '🎓 Learning', on: function () { return LEARN; } },
    { k: 'grades', href: '/app/grades', uk: '📒 Журнал', en: '📒 Gradebook' },
    { k: 'books', href: '/app/books', uk: '📚 Підручники', en: '📚 Textbooks' },
    { k: 'settings', href: '/app/settings', uk: '⚙️ Налаштування', en: '⚙️ Settings' },
    { k: 'admin', href: '/admin', uk: '🛠 Адмін', en: '🛠 Admin', on: function (role) { return role === 'admin' || role === 'owner'; } }
  ];
  // the tutorial that fits each tab
  var HELP = { tests: 'tests', learn: 'learn', grades: 'journal', books: 'books', settings: 'settings', admin: 'admin' };
  function lang() { try { return localStorage.getItem('revtest-lang') === 'en' ? 'en' : 'uk'; } catch (e) { return 'uk'; } }
  function active() {
    var a = me && me.getAttribute('data-active'); if (a) return a;
    var p = location.pathname;
    if (p === '/admin') return 'admin';
    var m = /^\/app\/([a-z]+)/.exec(p); if (!m) return 'tests';
    return ['learn', 'grades', 'books', 'settings'].indexOf(m[1]) >= 0 ? m[1] : 'tests';
  }
  // its own styles, so the row looks the same on pages that do not load app.css (the subject pages)
  var CSS = "/* ---------- the row of tabs under the header (public/js/nav.js) ---------- */ .kv-nav { background: var(--card); border-bottom: 1px solid var(--line); position: sticky; top: 0; z-index: 20; } .kv-nav .wrap { max-width: 1000px; margin: 0 auto; padding: 6px 16px; display: flex; gap: 4px; align-items: center; overflow-x: auto; scrollbar-width: none; } .kv-nav .wrap::-webkit-scrollbar { display: none; } .kv-nav a, .kv-nav button { flex: none; font: inherit; font-weight: 600; font-size: 14px; color: var(--muted); text-decoration: none; padding: 8px 12px; border-radius: 10px; border: 0; background: none; cursor: pointer; white-space: nowrap; } .kv-nav a:hover, .kv-nav button:hover { background: var(--bg); color: var(--ink); } .kv-nav a.on { background: var(--accent-soft); color: var(--accent); } .kv-nav .sp { flex: 1; min-width: 8px; } .kv-nav a.ic { width: 34px; height: 34px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border: 1.5px solid var(--line); border-radius: 50%; font-weight: 800; } .kv-nav button.out { border: 1.5px solid var(--line); } @media print { .kv-nav { display: none; } } /* the «⋯» menu of a row */ details.more { position: relative; display: inline-block; } details.more > summary { list-style: none; cursor: pointer; } details.more > summary::-webkit-details-marker { display: none; } details.more > .menu { position: absolute; right: 0; top: calc(100% + 4px); z-index: 30; background: var(--card); border: 1px solid var(--line); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.12); padding: 6px; display: flex; flex-direction: column; gap: 4px; min-width: 190px; } details.more > .menu .btn { text-align: left; border-color: transparent; margin: 0; } details.more > .menu .btn:hover { background: var(--bg); } ";
  function style() { if (document.getElementById('kv-nav-css')) return; var st = document.createElement('style'); st.id = 'kv-nav-css'; st.textContent = CSS; (document.head || document.documentElement).appendChild(st); }
  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }
  function build(role) {
    style();
    var L = lang(), cur = active();
    var nav = document.getElementById('nav');
    if (!nav) { nav = el('nav'); nav.id = 'nav'; var h = document.querySelector('header'); if (h && h.parentNode) h.parentNode.insertBefore(nav, h.nextSibling); else document.body.insertBefore(nav, document.body.firstChild); }
    nav.className = 'kv-nav'; nav.setAttribute('aria-label', L === 'en' ? 'Sections' : 'Розділи'); nav.textContent = '';
    var wrap = el('div', 'wrap');
    ITEMS.forEach(function (it) {
      if (it.on && !it.on(role)) return;
      var a = el('a', it.k === cur ? 'on' : '', it[L]); a.href = it.href;
      var subj = /^\/app\/([a-z]+)$/.exec(location.pathname);   // from a subject's page the gradebook opens on that subject
      if (it.k === 'grades' && subj && ['learn', 'grades', 'books', 'settings'].indexOf(subj[1]) < 0) a.href += '?s=' + subj[1];
      if (it.k === cur) a.setAttribute('aria-current', 'page');
      wrap.appendChild(a);
    });
    wrap.appendChild(el('span', 'sp'));
    var help = el('a', 'ic', '?'); help.href = '/help?tab=' + (HELP[cur] || 'tests'); help.title = L === 'en' ? 'Tutorial for this page' : 'Підказка до цієї сторінки';
    help.setAttribute('aria-label', help.title); wrap.appendChild(help);
    var out = el('button', 'out', L === 'en' ? 'Log out' : 'Вийти'); out.type = 'button';
    out.onclick = function () { window.api('/api/auth/logout').then(function () { location.href = '/login'; }, function () { location.href = '/login'; }); };
    wrap.appendChild(out);
    nav.appendChild(wrap);
    var on = wrap.querySelector('a.on'); if (on && on.scrollIntoView && wrap.scrollWidth > wrap.clientWidth) try { on.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {}
  }
  function start() {
    build('');
    if (window.api) window.api('/api/auth/me').then(function (r) { if (r && r.role === 'student') { var n = document.getElementById('nav'); if (n) n.remove(); } else if (r && r.role) build(r.role); }, function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.KvNav = { rebuild: function () { start(); } };
})();
