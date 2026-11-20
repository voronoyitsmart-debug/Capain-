// © Платон Вороний. All rights reserved. See LICENSE.
// Teacher page additions for the local server: who is signed in, log out, and a big code + QR for the class screen.
(function () {
  'use strict';
  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }
  function lang() { try { return localStorage.getItem('revtest-lang') === 'en' ? 'en' : 'uk'; } catch (e) { return 'uk'; } }

  // «Вийти», «?» and the way back to the subjects are in the shared row of tabs (public/js/nav.js)
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#langTog') && window.KvNav) setTimeout(window.KvNav.rebuild, 0); });

  // ---------- photos for "test from photos": a small tray of thumbnails ----------
  var MAX = 10, photos = [], L = 'uk';
  var PT = {
    uk: { go: '✨ Створити тест', count: 'Фото: {n} з {max}. Порядок фото = порядок сторінок.', none: 'Фото ще немає — натисніть «➕ Додати фото».',
      need: 'Спершу додайте хоча б одне фото.', full: 'Можна до {max} фото. Зайві не додано.', bad: 'Не вдалося прочитати: {n} файл(и). Оберіть інше фото.', del: 'Прибрати', reading: 'Читаю фото…' },
    en: { go: '✨ Create the test', count: 'Photos: {n} of {max}. Photo order = page order.', none: 'No photos yet — press “➕ Add photos”.',
      need: 'Add at least one photo first.', full: 'Up to {max} photos. The extra ones were not added.', bad: 'Could not read {n} file(s). Choose another photo.', del: 'Remove', reading: 'Reading the photos…' }
  };
  function P(k, n) { return PT[L][k].replace('{n}', n).replace('{max}', MAX); }
  function css() {
    if (document.getElementById('ai-tray-css')) return;
    var st = el('style'); st.id = 'ai-tray-css';
    st.textContent = '.ai-tray{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 4px}.ai-tray .ph{position:relative;width:84px;height:84px;border-radius:10px;overflow:hidden;border:1.5px solid var(--line,#ddd);background:var(--bg,#f4f4f4)}' +
      '.ai-tray .ph img{width:100%;height:100%;object-fit:cover;display:block}.ai-tray .ph b{position:absolute;left:4px;top:4px;background:rgba(0,0,0,.65);color:#fff;font-size:12px;border-radius:99px;min-width:20px;height:20px;display:flex;align-items:center;justify-content:center;padding:0 5px}' +
      '.ai-tray .ph button{position:absolute;right:3px;top:3px;width:24px;height:24px;border-radius:50%;border:0;background:rgba(0,0,0,.65);color:#fff;font-size:13px;line-height:1;cursor:pointer;padding:0}';
    document.head.appendChild(st);
  }
  function render(msg) {
    css();
    var tray = document.getElementById('aiTray'), info = document.getElementById('aiTrayMsg'), go = document.getElementById('aiGo');
    if (!tray) return;
    tray.textContent = '';
    photos.forEach(function (p, i) {
      var c = el('div', 'ph'); var im = new Image(); im.src = p.dataUrl; im.alt = ''; c.appendChild(im); c.appendChild(el('b', null, String(i + 1)));
      var x = el('button', null, '✕'); x.type = 'button'; x.title = PT[L].del; x.setAttribute('aria-label', PT[L].del + ' ' + (i + 1));
      x.addEventListener('click', function () { photos.splice(i, 1); render(); }); c.appendChild(x);
      tray.appendChild(c);
    });
    if (info) info.textContent = msg || (photos.length ? P('count', photos.length) : P('none'));
    if (go) { go.textContent = PT[L].go; go.disabled = !photos.length; }
  }
  window.__TX_photos = {
    reset: function (lg) { L = lg === 'en' ? 'en' : 'uk'; photos = []; render(); },
    /** files from the file input → resized JPEG data URLs (readImage is the page's own resizer) */
    add: function (files, readImage) {
      var room = MAX - photos.length, take = files.slice(0, Math.max(0, room)), extra = files.length - take.length, bad = 0;
      if (take.length) render(PT[L].reading);
      Promise.all(take.map(function (f) { return readImage(f).catch(function () { bad++; return null; }); })).then(function (list) {
        list.forEach(function (x) { if (x) photos.push(x); });
        render(bad ? P('bad', bad) : extra > 0 ? P('full') : '');
      });
    },
    list: function () { return photos.map(function (p) { return { dataUrl: p.dataUrl }; }); },
    need: function () { render(PT[L].need); }
  };

  var qrReady = null;
  function loadQr() {
    if (!qrReady) qrReady = new Promise(function (res) { var s = document.createElement('script'); s.src = '/vendor/qr/qrcode.js'; s.onload = res; s.onerror = res; document.head.appendChild(s); });
    return qrReady;
  }

  // ---------- «Хто може пройти тест»: chosen classes or the whole school ----------
  var ACC = { mode: 'classes', classes: [] };
  var AT = {
    uk: { who: 'Хто може пройти тест', cls: '👥 Лише вибрані класи', all: '🌍 Кожний бажаючий', pick: 'Позначте один або кілька класів:',
      other: 'інший клас, напр. 9-Б', add: 'Додати', none_cls: 'Класів ще немає — їх додає адміністратор, або впишіть свій нижче.',
      hint_cls: 'Тест бачать у «Моїх тестах» лише учні цих класів; за посиланням чи QR інших не пустить.', hint_all: 'Будь-хто за кодом, посиланням чи QR, навіть без акаунта: обов’язково вписує своє ім’я. Учні вашої школи також бачать тест у «Моїх тестах».',
      need: 'Оберіть хоча б один клас або виберіть «Кожний бажаючий».', lab_all: '🌍 кожний бажаючий', lab_none: '👥 класи не вибрано' },
    en: { who: 'Who can take the test', cls: '👥 Only chosen classes', all: '🌍 Anyone', pick: 'Tick one or more classes:',
      other: 'another class, e.g. 9-B', add: 'Add', none_cls: 'No classes yet — the administrator adds them, or type your own below.',
      hint_cls: 'Only students of these classes see it in “My tests”; the link or QR does not let anyone else in.', hint_all: 'Anyone with the code, link or QR, even without an account: they must type their name. Students of your school also see it in “My tests”.',
      need: 'Choose at least one class, or choose “Anyone”.', lab_all: '🌍 anyone', lab_none: '👥 no class chosen' }
  };
  function accFrom(t) {
    if (t && t.__acc) return { mode: t.__acc.mode, classes: t.__acc.classes.slice() };
    var s = t && t.settings;
    if (s) {
      var cl = (s.classes && s.classes.length) ? s.classes.slice() : (t.folder ? [t.folder] : []);
      return { mode: s.access === 'all' || (!s.access && !cl.length) ? 'all' : 'classes', classes: cl };
    }
    return { mode: 'classes', classes: t && t.folder ? [t.folder] : [] };
  }
  var key = function (c) { return String(c).toLowerCase().replace(/[\s\-–—._\/]+/g, ''); };
  function accessField(t, LIB, L) {
    var X = AT[L] || AT.uk; ACC = accFrom(t);
    var w = el('div'); w.id = 'eaccess';
    w.appendChild(el('label', 'lab', X.who));
    var hidden = el('input'); hidden.type = 'hidden'; hidden.id = 'efolder'; w.appendChild(hidden);
    var modes = el('div'); modes.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin:4px 0 8px'; w.appendChild(modes);
    var box = el('div'); w.appendChild(box);
    var hint = el('p', 'muted'); hint.style.cssText = 'font-size:13px;margin:6px 0 0'; w.appendChild(hint);
    var all = ((LIB && LIB.classes) || []).slice();
    ACC.classes.forEach(function (c) { if (!all.some(function (x) { return key(x) === key(c); })) all.push(c); });
    function paint() {
      hidden.value = ACC.mode === 'classes' && ACC.classes.length ? ACC.classes[0] : '';
      modes.textContent = '';
      [['classes', X.cls], ['all', X.all]].forEach(function (m) {
        var b = el('button', 'btn sm', m[1]); b.type = 'button';
        if (ACC.mode === m[0]) { b.style.background = 'var(--accent, #0f6d8c)'; b.style.color = '#fff'; b.style.borderColor = 'var(--accent, #0f6d8c)'; }
        b.addEventListener('click', function () { ACC.mode = m[0]; paint(); }); modes.appendChild(b);
      });
      box.textContent = ''; hint.textContent = ACC.mode === 'all' ? X.hint_all : X.hint_cls;
      if (ACC.mode === 'all') return;
      box.appendChild(el('div', 'muted', all.length ? X.pick : X.none_cls)).style.fontSize = '13px';
      var chips = el('div'); chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin:6px 0'; box.appendChild(chips);
      all.forEach(function (c) {
        var on = ACC.classes.some(function (x) { return key(x) === key(c); });
        var lab = el('label'); lab.style.cssText = 'display:inline-flex;align-items:center;gap:6px;margin:0;padding:6px 10px;border-radius:10px;cursor:pointer;font-weight:600;border:1.5px solid ' + (on ? 'var(--accent,#0f6d8c)' : 'var(--line,#ddd)');
        var cb = el('input'); cb.type = 'checkbox'; cb.checked = on; cb.style.width = 'auto';
        cb.addEventListener('change', function () {
          if (cb.checked) ACC.classes.push(c); else ACC.classes = ACC.classes.filter(function (x) { return key(x) !== key(c); });
          paint();
        });
        lab.appendChild(cb); lab.appendChild(document.createTextNode(c)); chips.appendChild(lab);
      });
      var row = el('div'); row.style.cssText = 'display:flex;gap:6px;max-width:360px'; box.appendChild(row);
      var inp = el('input'); inp.placeholder = X.other; inp.maxLength = 60; row.appendChild(inp);
      var add = el('button', 'btn sm', X.add); add.type = 'button'; row.appendChild(add);
      function addIt() { var v = inp.value.trim(); if (!v) return; if (!all.some(function (x) { return key(x) === key(v); })) all.push(v); if (!ACC.classes.some(function (x) { return key(x) === key(v); })) ACC.classes.push(v); paint(); }
      add.addEventListener('click', addIt);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); addIt(); } });
    }
    paint();
    return w;
  }

  // ---------- AI: what the teacher must know before sending photos (and a one-time confirmation) ----------
  var AL = {
    uk: { d3: 'Не фотографуйте роботи учнів, журнали, списки класу чи документи з іменами. Фото надсилаються до Google. Використовуйте лише матеріали, на які маєте право.',
      d2: '⚠️ ШІ (Google Gemini) може помилятися у фактах, правильних відповідях і перекладі. Перевірте кожне завдання перед тим, як дати тест учням.',
      ack: 'Я не надсилатиму до ШІ роботи учнів, списки чи інші персональні дані. Я перевірятиму кожне завдання і відповідь, створені ШІ. Я маю право використовувати ці матеріали.',
      need: 'Спершу позначте галочку про правила ШІ.',
      d9: 'Ключ зберігається лише на цьому сервері. На безкоштовному рівні Gemini Google може використовувати надіслані матеріали для покращення своїх продуктів, і їх можуть переглядати люди. Рекомендуємо платний ключ.' },
    en: { d3: 'Do not photograph student work, registers, class lists or documents with names. Photos are sent to Google. Use only materials you have the right to use.',
      d2: '⚠️ AI (Google Gemini) can make mistakes in facts, answer keys and translations. Check every question before giving the test to students.',
      ack: 'I will not send student work, class lists or other personal data to the AI. I will check every question and answer the AI creates. I have the right to use these materials.',
      need: 'First tick the box about the AI rules.',
      d9: 'The key is stored only on this server. On Gemini\'s free tier, Google may use submitted content to improve its products, and people may review it. A paid key is recommended.' }
  };
  function aiLegal(L) {
    var X = AL[L] || AL.uk, dlg = document.getElementById('aiDlg'); if (!dlg) return;
    var box = document.getElementById('aiLegal');
    if (!box) {
      box = el('div'); box.id = 'aiLegal'; box.style.cssText = 'font-size:13px;margin:8px 0;padding:10px 12px;border-radius:10px;background:var(--warn-soft,#fff4d6)';
      var lab = document.getElementById('aiNoteLab'); dlg.insertBefore(box, lab || null);
    }
    box.textContent = '';
    box.appendChild(el('p', null, X.d3)).style.margin = '0 0 6px';
    box.appendChild(el('p', null, X.d2)).style.margin = '0';
    if (!window.AI_ACK) {
      var w = el('label'); w.style.cssText = 'display:flex;gap:8px;align-items:flex-start;margin-top:8px;font-weight:600;cursor:pointer';
      var cb = el('input'); cb.type = 'checkbox'; cb.id = 'aiAck'; cb.style.cssText = 'width:18px;height:18px;flex:0 0 auto;margin-top:2px';
      w.appendChild(cb); w.appendChild(el('span', null, X.ack)); box.appendChild(w);
      cb.addEventListener('change', function () {
        if (!cb.checked) return;
        var m = /^\/app\/([a-z]+)/.exec(location.pathname);
        window.api('/api/t/' + (m ? m[1] : 'math') + '/ackAi', { args: [] }).then(function () { window.AI_ACK = true; }, function () { cb.checked = false; });
      });
    }
  }
  // «Create the test» waits for the confirmation
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('#aiGo, #aiChoose'); if (!t || window.AI_ACK) return;
    var cb = document.getElementById('aiAck');
    if (cb && !cb.checked) { e.stopImmediatePropagation(); e.preventDefault(); alert((AL[lang()] || AL.uk).need); cb.focus(); }
  }, true);
  document.addEventListener('DOMContentLoaded', function () {
    var k = document.getElementById('aiKeyIntro'); if (!k) return;
    var n = el('p', 'muted', (AL[lang()] || AL.uk).d9); n.style.cssText = 'font-size:12px;margin:6px 0'; k.parentNode.insertBefore(n, k.nextSibling);
  });

  // ---------- the students' review of their mistakes (results page) ----------
  /** Per student: «as the test says» / «show now» / «never». */
  function reviewToggle(r, RES, L, save, reload) {
    var uk = L !== 'en', w = el('div'); w.style.cssText = 'margin-top:12px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:13px';
    w.appendChild(el('b', null, uk ? '🔍 Розбір помилок для учня:' : '🔍 Review for this student:'));
    [[null, uk ? (RES.review ? 'як у тесті (після закриття)' : 'як у тесті (вимкнено)') : (RES.review ? 'as the test (after closing)' : 'as the test (off)')],
     [true, uk ? 'показати зараз' : 'show now'], [false, uk ? 'не показувати' : 'never']].forEach(function (o) {
      var on = (r.review == null ? null : r.review) === o[0], b = el('button', 'btn sm' + (on ? ' solid' : ''), o[1]); b.type = 'button';
      b.addEventListener('click', function (e) { e.stopPropagation(); if (on) return; b.textContent = '…'; save(o[0]).then(reload, function (err) { alert(String(err && err.message || err).replace(/^.*USER:\s*/, '')); }); });
      w.appendChild(b);
    });
    return w;
  }
  /** «✨ Explanations (AI)»: short reasons for the right answers, shown in the students' review. */
  function explainBtn(RES, L, run, reload) {
    var uk = L !== 'en', b = el('button', 'btn sm', (RES.explained ? '✨ ' + (uk ? 'Оновити пояснення (ШІ)' : 'Update explanations (AI)') : '✨ ' + (uk ? 'Пояснення до відповідей (ШІ)' : 'Explanations (AI)'))); b.type = 'button';
    b.title = uk ? 'ШІ коротко пояснить, чому правильна відповідь правильна. Учні бачать це в розборі помилок. Перевірте пояснення!' : 'The AI briefly explains why each right answer is right. Students see it in the review. Check the explanations!';
    b.addEventListener('click', function () {
      if (!confirm(b.title)) return;
      b.disabled = true; b.textContent = uk ? 'Пояснюю…' : 'Explaining…';
      run().then(function (r) { alert((uk ? 'Готово: пояснень ' : 'Done: explanations ') + r.explained); reload(); }, function (err) { b.disabled = false; alert(String(err && err.message || err).replace(/^.*USER:\s*/, '').replace(/\s*\[#[a-z_]+\]\s*$/, '')); });
    });
    return b;
  }

  // ---------- «🏫 Банк школи»: tests the colleagues of the school shared; a copy goes to «Від колеги: …» as a draft ----------
  function subjectKey() { var m = /^\/app\/([a-z]+)/.exec(location.pathname); return m ? m[1] : ''; }
  function bankDialog() {
    var en = lang() === 'en', d = el('dialog'); d.style.cssText = 'max-width:min(760px,calc(100vw - 24px));width:100%';
    d.appendChild(el('h2', null, en ? '🏫 School test bank' : '🏫 Банк тестів школи'));
    var p = el('p', 'muted', en ? 'Tests your colleagues shared. A copy becomes your draft (with the author’s name); you can change it. Results are never shared.' : 'Тести, якими поділилися колеги вашої школи. Копія стає вашою чернеткою (з ім’ям автора), її можна змінювати. Результати учнів не передаються. Щоб поділитися своїм тестом: «⋯» біля тесту.');
    p.style.fontSize = '13px'; d.appendChild(p);
    var list = el('div', null, en ? 'Loading…' : 'Завантаження…'); d.appendChild(list);
    var close = el('button', 'btn', en ? 'Close' : 'Закрити'); close.type = 'button'; close.style.marginTop = '12px'; close.addEventListener('click', function () { d.close(); d.remove(); }); d.appendChild(close);
    document.body.appendChild(d); d.showModal();
    var run = function (fn, args) { return new Promise(function (ok, bad) { var r = window.google.script.run.withSuccessHandler(ok).withFailureHandler(bad); r[fn].apply(r, ['session'].concat(args || [])); }); };
    run('schoolBank').then(function (r) {
      list.textContent = '';
      if (!r.tests.length) { list.appendChild(el('p', 'muted', en ? 'Nothing shared yet in this subject.' : 'З цього предмета колеги ще нічим не поділилися.')); return; }
      r.tests.forEach(function (t) {
        var row = el('div'); row.style.cssText = 'display:flex;gap:10px;align-items:center;padding:8px 0;border-top:1px solid var(--line)';
        var info = el('div'); info.style.flex = '1';
        info.appendChild(el('b', null, (t.titles && (t.titles[lang()] || t.titles.uk || t.titles.en)) || '—'));
        info.appendChild(el('div', 'muted', (en ? 'by ' : 'автор: ') + t.author + ' · ' + t.questions + (en ? ' questions' : ' питань') + ' · ' + new Date(t.updated).toLocaleDateString(en ? 'en-GB' : 'uk-UA'))).style.fontSize = '13px';
        row.appendChild(info);
        var b = el('button', 'btn sm' + (t.copied ? '' : ' solid'), t.copied ? (en ? 'Copy again' : 'Скопіювати ще раз') : (en ? 'Copy to me' : 'Скопіювати собі')); b.type = 'button';
        b.addEventListener('click', function () {
          b.disabled = true;
          run('copyFromBank', [t.bank]).then(function (x) { location.href = location.pathname + '?e=' + encodeURIComponent(x.id); }, function (e) { b.disabled = false; alert(String(e && e.message || e).replace(/^.*USER:\s*/, '').replace(/\s*\[#.*$/, '')); });
        });
        row.appendChild(b); list.appendChild(row);
      });
    }, function (e) { list.textContent = String(e && e.message || e).replace(/^.*USER:\s*/, '').replace(/\s*\[#.*$/, ''); });
  }
  function bindBank() {
    var b = document.getElementById('bankBtn'); if (!b || b.__kv) return; b.__kv = 1;
    if (!subjectKey()) { b.hidden = true; return; }
    b.textContent = lang() === 'en' ? '🏫 School bank' : '🏫 Банк школи';
    b.addEventListener('click', bankDialog);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindBank); else bindBank();

  window.__TX = {
    reviewToggle: reviewToggle,
    explainBtn: explainBtn,
    aiLegal: aiLegal,
    photos: window.__TX_photos,
    accessField: accessField,
    /** The «⋯» menu of a test's row (made once per row): the less used actions go there. */
    more: function (acts, L) {
      var d = acts.querySelector('details.more'); if (d) return d.lastChild;
      d = el('details', 'more'); var sm = el('summary', 'btn sm', '⋯'); sm.title = L === 'en' ? 'More' : 'Ще'; sm.setAttribute('aria-label', sm.title);
      d.appendChild(sm); d.appendChild(el('div', 'menu')); acts.appendChild(d);
      document.addEventListener('click', function (e) { if (d.open && !d.contains(e.target)) d.open = false; });
      return d.lastChild;
    },
    /** «⋯» → share the test with the colleagues of the school (or stop sharing). Only the test, never results. */
    shareItem: function (menu, t, L, call, reload) {
      var on = !!t.shared, en = L === 'en';
      var b = el('button', 'btn sm', on ? (en ? '🏫 Stop sharing with colleagues' : '🏫 Не ділитися з колегами') : (en ? '🏫 Share with colleagues of the school' : '🏫 Поділитися з колегами школи'));
      b.type = 'button';
      b.addEventListener('click', function () {
        if (!on && !confirm(en ? 'Colleagues of your school will see this test in «🏫 School bank» and can copy it (with your name). Students’ results are never shared. Share only tests you have the right to share.' : 'Колеги вашої школи побачать цей тест у «🏫 Банк школи» і зможуть скопіювати собі (з вашим ім’ям). Результати учнів не передаються. Діліться лише тестами, на які маєте право.')) return;
        call('shareTest', ['session', t.id, !on]).then(function () { reload(); }, function (e) { alert(String(e && e.message || e).replace(/^.*USER:\s*/, '').replace(/\s*\[#.*$/, '')); });
      });
      menu.appendChild(b);
    },
    accRead: function () { return { mode: ACC.mode, classes: ACC.mode === 'all' ? [] : ACC.classes.slice() }; },
    accCheck: function (L) { return ACC.mode === 'classes' && !ACC.classes.length ? (AT[L] || AT.uk).need : ''; },
    /** For the test list: «👥 9-А, 9-Б» or «🌍 кожний бажаючий». */
    accLabel: function (a, L) { var X = AT[L] || AT.uk; if (!a || a.mode === 'all') return X.lab_all; return a.classes.length ? '👥 ' + a.classes.join(', ') : X.lab_none; },
    /** Full-screen card with the code, the link and a QR code, for the projector. */
    showCode: function (code, link, title, L) {
      var d = el('dialog'); d.style.cssText = 'max-width:min(720px,calc(100vw - 32px));width:100%;text-align:center';
      d.appendChild(el('h2', null, title));
      d.appendChild(el('p', 'muted', L === 'en' ? 'Open this address, log in and type the code (or scan the QR):' : 'Відкрийте адресу, увійдіть у свій акаунт і введіть код (або відскануйте QR):'));
      var u = el('div', null, link.replace(/\/t\/[^/]*$/, '')); u.style.cssText = 'font-size:22px;font-weight:700;word-break:break-all';
      d.appendChild(u);
      var c = el('div', null, code); c.style.cssText = 'font:800 clamp(48px,14vw,110px)/1.1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.12em;margin:14px 0';
      d.appendChild(c);
      var q = el('div'); q.style.cssText = 'display:flex;justify-content:center;margin:8px 0 14px'; d.appendChild(q);
      d.appendChild(el('p', 'muted', (L === 'en' ? 'or scan: ' : 'або відскануйте: ') + link));
      var close = el('button', 'btn solid', L === 'en' ? 'Close' : 'Закрити'); close.addEventListener('click', function () { d.close(); d.remove(); });
      d.appendChild(close);
      document.body.appendChild(d); d.showModal();
      loadQr().then(function () {
        if (!window.qrcode) return;
        var qr = window.qrcode(0, 'M'); qr.addData(link); qr.make();
        var img = new Image(); img.src = qr.createDataURL(8, 2); img.alt = (L === 'en' ? 'QR code to open test ' : 'QR-код для входу в тест ') + code; img.style.cssText = 'width:min(260px,60vw);image-rendering:pixelated;background:#fff;padding:6px;border-radius:8px';
        q.appendChild(img);
      });
    }
  };
})();
