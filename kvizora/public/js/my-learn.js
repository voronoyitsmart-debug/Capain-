// © Kvizora. All rights reserved. See LICENSE.
// The student's «🎓 Навчання» (homework: what to do, hand in, the teacher's mark and comment) and «⭐ Оцінки» (every mark
// per subject). Draws into <section data-tab="learn"> and <section data-tab="marks"> of /my. Needs /js/rpc.js, /js/photos.js.
(function () {
  'use strict';
  var boxL = document.querySelector('section[data-tab="learn"]'), boxM = document.querySelector('section[data-tab="marks"]');
  if (!boxL && !boxM) return;
  function el(tag, c, x) { var n = document.createElement(tag); if (c) n.className = c; if (x != null) n.textContent = x; return n; }
  function msg(e) { var m = String(e && e.message || e), i = m.indexOf('USER:'); return (i >= 0 ? m.slice(i + 5) : m).replace(/\s*\[#[a-z_]+\]\s*$/, '').trim(); }
  function nm(x) { return x && typeof x === 'object' ? (x.uk || x.en || '') : String(x || ''); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dayOf(ms) { var d = new Date(ms); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function when(ms) { var d = new Date(ms); return d.toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric', month: 'long' }) + ', ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function dueText(ms, now) {
    var days = Math.round((new Date(dayOf(ms)) - new Date(dayOf(now))) / 86400000), t = pad(new Date(ms).getHours()) + ':' + pad(new Date(ms).getMinutes());
    return days === 0 ? 'сьогодні до ' + t : days === 1 ? 'завтра до ' + t : 'до ' + when(ms);
  }
  var css = el('style');
  css.textContent = '.hw{background:var(--card);border:1.5px solid var(--line);border-radius:var(--radius);margin-bottom:10px}' +
    '.hw>button{all:unset;box-sizing:border-box;display:flex;gap:12px;align-items:center;width:100%;padding:14px;cursor:pointer}.hw>button:focus-visible{outline:2px solid var(--accent)}' +
    '.hw .ic{font-size:26px;line-height:1}.hw .tt{flex:1;min-width:0}.hw .tt b{display:block}.hw .tt small{color:var(--muted);font-size:13px}' +
    '.hw .in{padding:0 14px 14px;border-top:1px solid var(--line)}.hw .body{white-space:pre-wrap;margin:10px 0}.hw .tc{margin:10px 0;padding:8px 10px;border-radius:8px;background:var(--accent-soft)}' +
    '.hw.ret{border-color:#d49b1e}.hw .soon{color:#a86b00;font-weight:700}.mthumbs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.mthumbs .th{position:relative}' +
    '.mthumbs img{width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid var(--line);display:block}.mthumbs .th button{position:absolute;top:2px;right:2px;border:0;border-radius:6px;background:rgba(0,0,0,.6);color:#fff;cursor:pointer}' +
    '.kvm-s{display:flex;gap:4px;flex-wrap:wrap;margin-top:8px}.kvm-s span{font-weight:800;font-size:14px;min-width:30px;text-align:center;padding:3px 6px;border-radius:8px;background:var(--bg);border:1px solid var(--line)}' +
    '.ann{padding:8px 0;border-top:1px solid var(--line)}.ann:first-of-type{border-top:0}.ann .body{margin:2px 0}' +
    '.soon{list-style:none;margin:8px 0 0;padding:0}.soon li{display:flex;gap:4px 10px;flex-wrap:wrap;padding:6px 0;border-top:1px solid var(--line)}.soon li:first-child{border-top:0}.soon .when{min-width:150px;color:var(--muted);font-size:14px}' +
    '.hw .crit{white-space:pre-wrap;margin:8px 0;padding:8px 10px;border-radius:8px;background:var(--bg);font-size:14px}' +
    '.kvm-s span.hi{color:#1d7a46}.kvm-s span.lo{color:var(--bad)}.mgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}@media(max-width:640px){.mgrid{grid-template-columns:1fr;gap:10px}}.avgb{font-weight:800;color:#fff;border-radius:8px;padding:2px 10px;margin-left:6px}';
  document.head.appendChild(css);

  var D = null, OPEN = {};
  var STATE = { todo: ['Треба зробити', 'pill'], missing: ['Не здано', 'pill bad'], submitted: ['Здано ✓', 'pill ok'], returned: ['Виправити', 'pill bad'], checked: ['Перевірено', 'pill ok'] };
  var ORDER = { returned: 0, todo: 1, missing: 2, submitted: 3, checked: 4 };
  var LV = { high: ['високий', '#1d7a46'], sufficient: ['достатній', '#4b9b6e'], middle: ['середній', '#b07d10'], initial: ['початковий', '#b3121f'] };

  function load() {
    return window.api('/api/student/learn').then(function (d) { D = d; paint(); }, function (e) {
      if (e.status === 401) location.href = '/login'; else if (boxL) boxL.textContent = 'Немає зв’язку із сервером.';
    });
  }
  function paint() {
    if (boxL) paintTasks(); if (boxM) paintMarks();
    var b = document.getElementById('learnBadge'), n = window.kvLearnBadge();   // tasks to do, on the tab button
    if (b) { b.textContent = String(n); b.classList.toggle('hidden', !n); }
  }
  // a tab opened again shows fresh data
  document.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-t="learn"],[data-t="marks"]'); if (t && D) load(); });
  window.kvLearnBadge = function () { return D ? D.tasks.filter(function (t) { return t.state === 'todo' || t.state === 'returned'; }).length : 0; };

  function paintTasks() {
    boxL.textContent = '';
    var list = D.tasks.slice().sort(function (a, b) {
      return (ORDER[a.state] - ORDER[b.state]) || (a.state === 'checked' || a.state === 'submitted' ? b.due - a.due : a.due - b.due);
    });
    var todo = list.filter(function (t) { return t.state === 'todo' || t.state === 'returned'; }).length;
    var head = el('div', 'card'); head.appendChild(el('b', null, todo ? '📋 Треба зробити: ' + todo : '🎉 Усе зроблено'));
    head.appendChild(el('div', 'muted', 'Домашні завдання вчителів твого класу. Натисни на завдання, щоб відкрити його й здати відповідь.')).style.fontSize = '13px';
    boxL.appendChild(head);
    if (D.announcements && D.announcements.length) {   // 📢 the teachers' announcements to the class
      var an = el('div', 'card'); an.appendChild(el('b', null, '📢 Оголошення'));
      D.announcements.forEach(function (a) {
        var d = el('div', 'ann'); d.appendChild(el('div', 'muted', a.icon + ' ' + nm(a.subjectName) + ' · ' + a.teacher + ' · ' + new Date(a.at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' }))).style.fontSize = '13px';
        d.appendChild(linkify(el('div', 'body'), a.text)); an.appendChild(d);
      });
      boxL.appendChild(an);
    }
    if (D.soon && D.soon.length) {   // 🗓 the next 7 days: homework to do and tests to hand in
      var sn = el('div', 'card'); sn.appendChild(el('b', null, '🗓 Найближчі терміни'));
      var ul = el('ul', 'soon');
      D.soon.forEach(function (x) {
        var li = el('li'); li.appendChild(el('span', 'when', dueText(x.due, D.serverNow)));
        var go = el('a', null, x.icon + ' ' + x.title + (x.kind === 'test' ? ' (тест)' : x.state === 'returned' ? ' (виправити)' : x.hwKind === 'none' ? ' (підготуватися)' : ''));
        if (x.kind === 'test') go.href = '/t/' + encodeURIComponent(x.id);
        else { go.href = '#learn'; go.onclick = function (e) { e.preventDefault(); OPEN[x.id] = true; paintTasks(); var c = boxL.querySelector('[data-hw="' + x.id + '"]'); if (c && c.scrollIntoView) c.scrollIntoView({ block: 'start', behavior: 'smooth' }); }; }
        li.appendChild(go); ul.appendChild(li);
      });
      sn.appendChild(ul); boxL.appendChild(sn);
    }
    if (!list.length) { boxL.appendChild(el('p', 'muted', 'Завдань поки немає.')); return; }
    list.forEach(function (t) { boxL.appendChild(card(t)); });
  }
  function card(t) {
    var c = el('div', 'hw' + (t.state === 'returned' ? ' ret' : '')), b = el('button'); c.setAttribute('data-hw', String(t.id));
    b.setAttribute('aria-expanded', String(!!OPEN[t.id]));
    b.appendChild(el('div', 'ic', t.icon));
    var tt = el('div', 'tt'); tt.appendChild(el('b', null, t.title));
    var soon = (t.state === 'todo' || t.state === 'returned') && t.due - D.serverNow < 86400000 * 1.5 && t.due > D.serverNow;
    var sm = el('small'); sm.appendChild(el('span', soon ? 'soon' : '', dueText(t.due, D.serverNow))); sm.appendChild(document.createTextNode(' · ' + nm(t.subjectName) + ' · ' + t.teacher));
    tt.appendChild(sm); b.appendChild(tt);
    if (t.kind !== 'none' || t.state === 'checked') b.appendChild(el('span', STATE[t.state][1], t.kind === 'none' && t.state !== 'checked' ? 'Без здачі' : STATE[t.state][0]));
    if (t.grade) b.appendChild(el('span', 'pill', '⭐ ' + t.grade));
    b.onclick = function () { OPEN[t.id] = !OPEN[t.id]; c.replaceWith(card(t)); };
    c.appendChild(b);
    if (!OPEN[t.id]) return c;
    var inn = el('div', 'in');
    if (t.body) inn.appendChild(linkify(el('div', 'body'), t.body));
    if (t.criteria) inn.appendChild(el('div', 'crit', '📏 Як оцінюватиметься: ' + t.criteria));
    if (t.files.length) { var th = el('div', 'mthumbs'); t.files.forEach(function (f) { th.appendChild(pic('/learn/file/' + f + '.jpg')); }); inn.appendChild(th); }
    if (t.comment) inn.appendChild(el('div', 'tc', '💬 Учитель: ' + t.comment));
    if (t.kind === 'test') {
      if (t.test && t.test.submitted) inn.appendChild(el('p', null, '📝 Тест здано ✓'));
      else { var a = el('a', 'btn solid', t.test ? 'Продовжити тест' : 'Пройти тест'); a.href = '/t/' + encodeURIComponent(t.testId); inn.appendChild(a); }
    } else if (t.kind === 'none') inn.appendChild(el('p', 'muted', 'Здавати нічого не треба — учитель перевірить на уроці.'));
    else answer(inn, t);
    c.appendChild(inn);
    return c;
  }
  function linkify(box, text) {   // links in the teacher's text become clickable (only http/https)
    String(text).split(/(https?:\/\/[^\s<>"']+)/g).forEach(function (part, i) {
      if (i % 2) { var a = el('a', null, part); a.href = part; a.target = '_blank'; a.rel = 'noopener noreferrer'; box.appendChild(a); } else box.appendChild(document.createTextNode(part));
    });
    return box;
  }
  function pic(src, onDrop) {
    var d = el('div', 'th'), a = el('a'); a.href = src; a.target = '_blank'; a.rel = 'noopener';
    var im = el('img'); im.src = src; im.alt = 'Фото'; a.appendChild(im); d.appendChild(a);
    if (onDrop) { var x = el('button', null, '✕'); x.type = 'button'; x.setAttribute('aria-label', 'Прибрати фото'); x.onclick = onDrop; d.appendChild(x); }
    return d;
  }
  function answer(inn, t) {
    var locked = t.state === 'checked', closed = t.due < D.serverNow && !t.late && t.state !== 'returned';
    if (t.submitted) inn.appendChild(el('p', 'muted', 'Здано: ' + when(t.submitted) + (t.late ? ' (із запізненням)' : ''))).style.fontSize = '13px';
    if (locked) { if (t.text) inn.appendChild(el('div', 'body', t.text)); if (t.mine.length) { var th0 = el('div', 'mthumbs'); t.mine.forEach(function (f) { th0.appendChild(pic('/learn/file/' + f + '.jpg')); }); inn.appendChild(th0); } return; }
    if (closed && !t.submitted) { inn.appendChild(el('p', 'muted', 'Термін минув — учитель не приймає це завдання після терміну.')); return; }
    var ta = el('textarea'); ta.value = t.text; ta.maxLength = 10000; ta.placeholder = 'Твоя відповідь…'; ta.setAttribute('aria-label', 'Відповідь'); ta.style.minHeight = '120px';
    inn.appendChild(ta);
    var keep = t.mine.slice(), add = [], th = el('div', 'mthumbs'), err = el('div', 'err');
    function thumbs() {
      th.textContent = '';
      keep.forEach(function (f) { th.appendChild(pic('/learn/file/' + f + '.jpg', function () { keep.splice(keep.indexOf(f), 1); thumbs(); })); });
      add.forEach(function (d, i) { th.appendChild(pic(d, function () { add.splice(i, 1); thumbs(); })); });
    }
    thumbs(); inn.appendChild(th);
    var row = el('div', 'row');
    if (D.photos) {
      var lab = el('label', 'btn', '📷 Фото зошита'); lab.style.margin = '0';
      var fi = el('input'); fi.type = 'file'; fi.accept = 'image/*'; fi.multiple = true; fi.hidden = true; lab.appendChild(fi);
      fi.onchange = function () {
        var files = Array.prototype.slice.call(fi.files || []); fi.value = ''; err.textContent = '';
        if (keep.length + add.length + files.length > D.photoLimits.perAnswer) { err.textContent = 'Не більше ' + D.photoLimits.perAnswer + ' фото.'; return; }
        files.reduce(function (p, f) { return p.then(function () { return window.kvPhoto(f).then(function (d) { add.push(d); }); }); }, Promise.resolve()).then(thumbs, function (e) { err.textContent = msg(e); });
      };
      row.appendChild(lab);
    }
    var go = el('button', 'btn solid', t.submitted && t.state !== 'returned' ? 'Оновити відповідь' : 'Здати'); go.type = 'button';
    go.onclick = function () {
      err.textContent = ''; go.disabled = true;
      window.api('/api/student/hwSubmit', { args: [t.id, ta.value, add, keep] }).then(function () { return load(); }, function (e) { err.textContent = msg(e); }).then(function () { go.disabled = false; });
    };
    row.appendChild(go); inn.appendChild(row);
    if (D.photos) inn.appendChild(el('p', 'muted', 'Фотографуй лише зошит: без облич, документів та інших людей. Фото бачить лише вчитель, через ' + D.keepFileDays + ' днів воно видаляється.')).style.fontSize = '12px';
    inn.appendChild(err);
  }

  function paintMarks() {
    boxM.textContent = '';
    if (!D.subjects.length) { boxM.appendChild(el('div', 'card muted', 'Оцінок поки немає.')); return; }
    var all = []; D.subjects.forEach(function (s) { s.marks.forEach(function (m) { if (/^\d+$/.test(m.grade)) all.push(Number(m.grade)); }); });
    if (all.length) { var top = el('div', 'card'); top.appendChild(el('b', null, '⭐ Середня з усіх предметів: ' + (Math.round(all.reduce(function (a, b) { return a + b; }, 0) / all.length * 10) / 10).toString().replace('.', ','))); boxM.appendChild(top); }
    var grid = el('div', 'mgrid');
    D.subjects.forEach(function (s) {
      var tile = el('div', 'tile'), h = el('h3', null, s.icon + ' ' + nm(s.name));
      if (s.avg != null) { var b = el('span', 'avgb', String(s.avg).replace('.', ',')); b.style.background = LV[s.level][1]; b.title = LV[s.level][0] + ' рівень'; h.appendChild(b); }
      tile.appendChild(h);
      var ms = el('div', 'kvm-s');
      s.marks.forEach(function (m) {
        var n = Number(m.grade), sp = el('span', /^\d+$/.test(m.grade) ? (n >= 10 ? 'hi' : n <= 3 ? 'lo' : '') : '', m.grade);
        sp.title = new Date(m.at).toLocaleDateString('uk-UA') + ' · ' + ({ test: '📝 тест', lesson: '📅 урок', hw: '🏠 д/з' })[m.kind] + (m.title ? ': ' + m.title : '') + (m.note ? ' — ' + m.note : '');
        sp.tabIndex = 0; sp.onclick = function () { info.textContent = sp.title; };   // phones have no hover
        ms.appendChild(sp);
      });
      tile.appendChild(ms);
      var info = el('div', 'muted'); info.style.fontSize = '13px'; info.style.marginTop = '6px'; tile.appendChild(info);
      if (s.absent) tile.appendChild(el('div', 'muted', 'Пропусків («н»): ' + s.absent)).style.fontSize = '13px';
      grid.appendChild(tile);
    });
    boxM.appendChild(grid);
    boxM.appendChild(el('p', 'muted', 'Наведи на оцінку (або натисни), щоб побачити дату й за що її поставлено.')).style.fontSize = '13px';
  }
  load();
  setInterval(function () { if (!document.hidden && !document.querySelector('.hw .in textarea')) load(); }, 120000);   // never while an answer is open
  window.kvLearnReload = load;
})();
