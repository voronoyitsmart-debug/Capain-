'use strict';
// © Платон Вороний. All rights reserved. See LICENSE.
// Turns the core's Student.html / Teacher.html (made for Google Apps Script) into the local server's pages.
// The pages stay the core's own; only these small, named changes are applied, and each one fails loudly
// if the core changed so much that its anchor is gone. To take a newer core: copy its files into core/ and restart.
//   node tools/build-ui.js        checks that every patch still applies

function patch(src, list, page) {
  list.forEach(p => {
    const [name, from, to, all] = p;
    const n = src.split(from).length - 1;
    if (!n) throw new Error(page + ': patch "' + name + '" did not apply — its anchor is not in core/' + page + '.html any more');
    if (n > 1 && !all) throw new Error(page + ': patch "' + name + '" anchor is not unique (' + n + '×)');
    src = all ? src.split(from).join(to) : src.replace(from, () => to);
  });
  return src;
}

// KaTeX from this server (node_modules/katex) instead of the CDN: works without internet.
const KATEX = [
  ['katex css', 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css', '/vendor/katex/katex.min.css'],
  ['katex js', 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js', '/vendor/katex/katex.min.js'],
  ['mhchem', 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/mhchem.min.js', '/vendor/katex/contrib/mhchem.min.js'],
  ['auto-render', 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js', '/vendor/katex/contrib/auto-render.min.js']
];

function buildStudent(src) {
  return patch(src, KATEX.concat([
    ['head scripts', '</head>', '<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Kvizora</title>\n' +
      '<script>window.RPC_BASE = "/api/s/"; window.RPC_LOGIN = true; window.STUDENT = __STUDENT__;\n' +
      'document.addEventListener("DOMContentLoaded", function () { var m = document.getElementById("myTests"); if (m && !window.STUDENT) { m.textContent = "Є акаунт? Увійти"; m.href = "/login?next=" + encodeURIComponent("/t/" + location.pathname.split("/").pop().toUpperCase()); } });</script>\n<script src="/js/rpc.js"></script>\n<script src="/js/fp.js"></script>\n<script src="/js/anticheat.js"></script>\n</head>'],
    // the app is called Kvizora
    ['name h1', '<h1 id="title" style="flex:1;margin:0">Online Test</h1>', '<h1 id="title" style="flex:1;margin:0">Kvizora</h1>'],
    ['name uk', "app_title: 'Онлайн-тест'", "app_title: 'Kvizora'"],
    ['name en', "app_title: 'Online Test'", "app_title: 'Kvizora'"],
    // the student is signed in: a way back to «Мої тести»
    ['my tests link', '<div class="langtog" id="langTog">', '<a id="myTests" href="/my" style="color:inherit;font-size:14px;text-decoration:none;opacity:.85;white-space:nowrap">← Мої тести</a>\n<div class="langtog" id="langTog">'],
    // name and class come from the account: shown, not typed
    ['account name', "else if (!$('group').value && info.folder) $('group').value = info.folder;",
      "else if (!$('group').value && info.folder) $('group').value = info.folder;\n    if (window.STUDENT) { $('name').value = STUDENT.name; $('group').value = STUDENT.cls; $('name').readOnly = true; $('group').readOnly = true; }"],
    // already submitted from this account: say so at once
    ['already at once', "if (info.state === 'closed') { repaint = function () { message('🔒', t('closed'), t('closed_text')); }; return repaint(); }",
      "if (info.mine === 'done') { repaint = function () { message('✓', t('already'), t('already_text')); }; return repaint(); }\n      if (info.state === 'closed') { repaint = function () { message('🔒', t('closed'), t('closed_text')); }; return repaint(); }"],
    ['already uk', 'Цей тест уже пройдено під цим іменем.', 'Ви вже пройшли цей тест.', true],
    ['already en', 'This test has already been submitted under this name.', 'You have already submitted this test.'],
    // no list of open tests for everybody: the student types the code from the board
    ['code form', 'if (!TEST_ID) return showPicker();', 'if (!TEST_ID) { repaint = function () { window.__AC.codeForm(LANG, message); }; return repaint(); }'],
    // the device fingerprint goes with Start
    ['start fp (resume)', "call('startAttempt', [TEST_ID, saved.name, saved.group || '']", "call('startAttempt', [TEST_ID, saved.name, saved.group || '', lastInfo && lastInfo.deviceTrack === false ? null : window.__FP]"],
    ['start fp', "call('startAttempt', [TEST_ID, name, group])", "(window.__AC.beforeStart(lastInfo), call('startAttempt', [TEST_ID, name, group, lastInfo && lastInfo.deviceTrack === false ? null : window.__FP]))"],
    // the position goes with every save, so the server can lock the questions already passed
    ['save pos', "call('saveProgress', [A.id, ans, snapshotAct()], 1)", "call('saveProgress', [A.id, ans, snapshotAct(), POS], 1)"],
    ['submit pos', "call('submitAttempt', [A.id, ans, snapshotAct()])", "call('submitAttempt', [A.id, ans, snapshotAct(), POS])", true],
    ['act extra', 'translateCount: act.translateCount, langs: act.langs.slice(), log: act.log.slice(-80) }; }',
      'translateCount: act.translateCount, langs: act.langs.slice(), log: act.log.slice(-80), extra: window.__AC.snapshot() }; }'],
    ['ac start', 'if (monitorOn) startTracking();', 'if (monitorOn) startTracking();\n    window.__AC.start(res, { lang: LANG, toast: toast, monitor: monitorOn });'],
    ['ac stop', 'function stopTracking() { inTest = false;', 'function stopTracking() { inTest = false; window.__AC.stop();'],
    ['rules', "var items = [t('rule_once'), t('rule_oneway'), t('rule_shuffle')];",
      "var items = [t('rule_once'), t('rule_oneway'), t('rule_shuffle')];\n    if (info.deviceTrack !== false) items.push(t('rule_device'));\n    if (info.fullscreen) items.push(t('rule_fs'));"],
    // the student must agree not only when leaving-page is recorded, but also when the device/IP is recorded
    // the notice is always shown and must be ticked (never pre-ticked); its text says exactly what this test records
    ['consent device', "$('consentWrap').classList.remove('hidden');\n    } else {\n      $('consentWrap').classList.add('hidden');\n    }",
      "}\n    $('consentText').innerHTML = t(info.deviceTrack !== false ? 'consent_device' : 'consent_basic');\n    $('consentWrap').classList.remove('hidden');\n" +
      "    $('dataNote').innerHTML = t('data_note').replace('{school}', String(info.school || (LANG === 'uk' ? 'ваш заклад освіти' : 'your school')).replace(/[&<>\"]/g, function (ch) { return '&#' + ch.charCodeAt(0) + ';'; }));"],
    ['consent device gate', "if (monitorOn && !$('consent').checked) { $('startErr').textContent = t('err_consent'); return; }",
      "if (!$('consent').checked) { $('startErr').textContent = t('err_consent'); return; }"],
    ['data note', '<p class="rules-title" id="rulesTitle">', '<p class="datanote" id="dataNote" style="font-size:13px;color:var(--muted,#666);margin:6px 0 0"></p>\n    <p class="rules-title" id="rulesTitle">'],
    ['uk strings', "e_tr_off: '",
      "rule_device: '⚠️ Сервер записує ваш <b>пристрій та IP-адресу</b>. Якщо спробувати пройти тест двічі (наприклад, спершу під вигаданим ім’ям, а потім під справжнім), учитель побачить, що це той самий пристрій, і під якими іменами.', " +
      "rule_fs: 'Тест іде в <b>повноекранному режимі</b>. Кожен вихід із нього фіксується.', " +
      "consent_device: 'Я ознайомився(-лась) з правилами тесту та <a href=\"/legal/privacy\" target=\"_blank\">Політикою конфіденційності</a>. Я знаю, що тест записує мої відповіді, вихід зі сторінки, копіювання тексту, а також мій пристрій та IP-адресу.', " +
      "consent_basic: 'Я ознайомився(-лась) з правилами тесту та <a href=\"/legal/privacy\" target=\"_blank\">Політикою конфіденційності</a>. Я знаю, що тест записує мої відповіді, вихід зі сторінки та копіювання тексту' + (window.STUDENT ? '.' : ', а браузер отримає cookie, щоб тест можна було продовжити на цьому пристрої.'), " +
      "data_note: 'Ваші дані обробляє {school} для оцінювання. <a href=\"/legal/privacy\" target=\"_blank\">Детальніше</a>', err_consent: 'Позначте, що ви ознайомилися з правилами.', " +
      "e_device: 'З цього пристрою тест уже проходили. Зверніться до вчителя.', e_busy: 'Під цим ім’ям тест уже відкрито на іншому пристрої. Зверніться до вчителя.', " +
      "e_rate: 'Забагато спроб. Зачекайте хвилину.', e_wrong_class: 'Цей тест призначено іншому класу.', e_auth: 'Увійдіть у свій акаунт.', e_lan_only: 'Цей тест можна пройти лише в мережі класу.', lan_text: 'Підключіться до того самого Wi-Fi, що й комп’ютер учителя, і відкрийте адресу, яку дав учитель.', e_tr_off: '"],
    ['en strings', "tr_btn: '🇺🇦 Ukrainian translation'",
      "rule_device: '⚠️ The server records your <b>device and IP address</b>. If you try to take the test twice (for example first under a made-up name and then under your real one), the teacher will see it was the same device, and under which names.', " +
      "rule_fs: 'The test runs in <b>full screen</b>. Every exit from full screen is recorded.', " +
      "consent_device: 'I have read the test rules and the <a href=\"/legal/privacy\" target=\"_blank\">Privacy Policy</a>. I understand that the test records my answers, when I leave the page or copy text, and my device and IP address.', " +
      "consent_basic: 'I have read the test rules and the <a href=\"/legal/privacy\" target=\"_blank\">Privacy Policy</a>. I understand that the test records my answers and when I leave the page or copy text' + (window.STUDENT ? '.' : ', and the browser gets a cookie so the test can be continued on this device.'), " +
      "data_note: 'Your data is processed by {school} for assessment. <a href=\"/legal/privacy\" target=\"_blank\">Learn more</a>', err_consent: 'Please tick the box to confirm you have read the rules.', " +
      "e_device: 'This test was already taken on this device. Ask your teacher.', e_busy: 'This name already has the test open on another device. Ask your teacher.', " +
      "e_rate: 'Too many attempts. Wait a minute.', e_wrong_class: 'This test is for another class.', e_auth: 'Please log in.', e_lan_only: 'This test can be taken only in the classroom network.', lan_text: 'Connect to the same Wi-Fi as the teacher’s computer and open the address your teacher gave you.', tr_btn: '🇺🇦 Ukrainian translation'"],
    ['lan only msg', "}).catch(function (err) { var m = userMsg(err); repaint = function () { message('⚠️', t('connect_fail'), m || t('connect_fail_text'), { retry: true }); }; repaint(); });",
      "}).catch(function (err) { var m = userMsg(err); if (errCode(err) === 'lan_only') { repaint = function () { message('🏫', userMsg(err), t('lan_text')); }; return repaint(); } if (errCode(err) === 'wrong_class' || errCode(err) === 'not_found') { repaint = function () { message('🚫', userMsg(err), ''); }; return repaint(); } repaint = function () { message('⚠️', t('connect_fail'), m || t('connect_fail_text'), { retry: true }); }; repaint(); });", true],
    // after a reload the page continues where the server says the student was (questions before it are locked there)
    ['resume pos', 'POS = 0; for (var p = 0; p < ORDER.length; p++) { POS = p; if (!isAnswered(ORDER[p])) break; }',
      'POS = 0; for (var p = 0; p < ORDER.length; p++) { POS = p; if (!isAnswered(ORDER[p])) break; }\n    if (res.pos && res.pos > POS) POS = Math.min(res.pos, ORDER.length - 1);'],
    ['busy msg', 'store.del(activeKey()); var um = userMsg(err);',
      "store.del(activeKey()); var um = userMsg(err);\n        if (errCode(err) === 'busy' || errCode(err) === 'device') { repaint = function () { message('🔒', userMsg(err), ''); }; return repaint(); }"]
  ]), 'Student');
}

function buildTeacher(src) {
  return patch(src, KATEX.concat([
    ['head scripts', '</head>', '<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Kvizora — кабінет учителя</title>\n' +
      '<script>window.RPC_BASE = "/api/t/__SUBJECT__/"; window.RPC_LOGIN = true; window.TEACHER_NAME = "__TEACHER__"; window.AI_ACK = __AIACK__;</script>\n' +
      '<script src="/js/rpc.js"></script>\n<script src="/js/teacher-extra.js"></script>\n<script src="/js/nav.js" data-active="tests"></script>\n</head>'],
    // the session cookie replaces the PIN: the gate never shows (a 401 sends the page to /login)
    ['no pin', "try { PIN = sessionStorage.getItem('revtest-pin'); } catch (e) {}", "PIN = 'session';"],
    // a draft made on the textbooks page (/app/books) opens straight in the editor: /app/<subject>?e=<id>
    ['open draft', "if (BOOT_TEST) { var b = BOOT_TEST; BOOT_TEST = ''; openResults(b); }",
      "if (BOOT_TEST) { var b = BOOT_TEST; BOOT_TEST = ''; openResults(b); }\n      var bootEdit = /[?&]e=([A-Za-z0-9]{1,16})/.exec(location.search); if (bootEdit) { try { history.replaceState(null, '', location.pathname); } catch (e) {} openEditor(bootEdit[1]); }"],
    // the shared row of tabs (Тести · Журнал · Підручники · …, «?», «Вийти») right under the header
    ['header nav', '<main>', '<div id="nav"></div>\n<main>'],
    // «Хто може пройти тест»: chosen classes or the whole school (replaces the single «Клас» field of the editor)
    ['access field', "c.appendChild(folderField(t.folder || ''));", "c.appendChild(window.__TX.accessField(t, LIB, LANG));"],
    ['access keep', "folder: $('efolder').value, source: EDIT.source", "folder: $('efolder').value, __acc: window.__TX.accRead(), source: EDIT.source", true],
    ['access check', "var content = collectContent(), folder = $('efolder').value.trim();",
      "var accErr = window.__TX.accCheck(LANG); if (accErr) { $('saveMsg').style.color = 'var(--bad)'; $('saveMsg').textContent = accErr; return; }\n    var content = collectContent(), folder = $('efolder').value.trim();"],
    ['access save', "call('saveTest', [PIN, EDIT.id, title, folder, content])", "call('saveTest', [PIN, EDIT.id, title, folder, content, window.__TX.accRead()])"],
    ['student link', "function studentLink(id) { var base = (LIB && LIB.appUrl) || ''; return base + (base.indexOf('?') >= 0 ? '&' : '?') + 't=' + encodeURIComponent(id); }",
      "function studentLink(id) { var t0 = ((LIB && LIB.tests) || []).filter(function (x) { return x.id === id; })[0];\n" +
      "    var base = (LIB && (LIB.publicUrl || LIB.lanUrl)) || location.origin; return base + '/t/' + encodeURIComponent(id); }"],
    ['code in list', "tt.appendChild(el('div', 'meta', meta));", "meta += ' · ' + window.__TX.accLabel(t.access, LANG) + (t.guests && t.access.mode !== 'all' ? (LANG === 'uk' ? ' · 🔓 і без акаунта' : ' · 🔓 also without account') : '') + (t.shared ? (LANG === 'uk' ? ' · 🏫 у банку школи' : ' · 🏫 shared') : '') + ' · ' + (LANG === 'uk' ? 'Код: ' : 'Code: ') + t.id;\n    tt.appendChild(el('div', 'meta', meta));"],
    // a test's row: the main actions as buttons, the rest (link, code on screen, delete) in a «⋯» menu
    ['copy link tests', "if (t.state === 'open') acts.appendChild(mkBtn(L('btn_copylink'), 'btn sm', function (e) { copyLink(t.id, e.target); }));",
      "if (t.state === 'open') { acts.insertBefore(mkBtn(LANG === 'uk' ? '📺 Код на екран' : '📺 Show code', 'btn sm', function () { window.__TX.showCode(t.id, studentLink(t.id), tx(t.titles) || t.title, LANG); }), acts.firstChild); window.__TX.more(acts, LANG).appendChild(mkBtn('🔗 ' + L('btn_copylink'), 'btn sm', function (e) { copyLink(t.id, e.target); })); }"],
    ['delete in menu', "    acts.appendChild(mkBtn(L('btn_delete'), 'btn sm danger', function () {\n      if (confirm(L('confirm_delete_test'",
      "    window.__TX.shareItem(window.__TX.more(acts, LANG), t, LANG, call, loadLibrary);\n    window.__TX.more(acts, LANG).appendChild(mkBtn(L('btn_delete'), 'btn sm danger', function () {\n      if (confirm(L('confirm_delete_test'"],
    // the school's test bank: tests the colleagues shared, copied to oneself as a draft (see lib/api.js schoolBank)
    ['bank button', '<button class="btn hidden" id="addSamplesBtn">', '<button class="btn" id="bankBtn" type="button">🏫 Банк школи</button>\n      <button class="btn hidden" id="addSamplesBtn">'],
    // ----- «Безпека»: a section of its own in the editor, one on/off switch per anti-cheating measure -----
    ['security section', "dlg.appendChild(checkRow('sch-score', L('sch_score'), s.showScore));",
      "dlg.appendChild(checkRow('sch-score', L('sch_score'), s.showScore));\n" +
      "    var secUk = LANG === 'uk';\n" +
      "    var secH = el('div'); secH.style.cssText = 'margin:18px 0 2px;padding-top:14px;border-top:1px solid var(--line,#dcdce3);font-weight:700;font-size:16px'; secH.textContent = secUk ? '🛡️ Безпека' : '🛡️ Security'; dlg.appendChild(secH);\n" +
      "    var secP = el('p', 'muted'); secP.style.cssText = 'margin:2px 0 10px;font-size:13px'; secP.textContent = secUk ? 'Вмикайте лише ті заходи, що потрібні для цього тесту. Запис пристрою та IP — це обробка персональних даних: учні мають бути поінформовані, а батьки учнів до 14 років — дати згоду. Жоден захід не гарантує повної неможливості списування.' : 'Enable only the measures this test needs. Recording device and IP is personal data processing: students must be informed, and parents of children under 14 must consent. No measure fully prevents cheating.'; dlg.appendChild(secP);\n" +
      "    dlg.appendChild(checkRow('sch-devicetrack', secUk ? 'Записувати пристрій та IP; показувати повторні спроби з того самого пристрою/IP (навіть під іншим ім’ям)' : 'Record device & IP; flag repeat attempts from the same device/IP (even under another name)', s.deviceTrack !== false));\n" +
      "    dlg.appendChild(checkRow('sch-blockkeys', secUk ? 'Блокувати праву кнопку, F12 і «код елемента», копіювання та друк (спроби фіксуються)' : 'Block right-click, F12 / view-source, copy and print (attempts are recorded)', s.blockKeys !== false));\n" +
      "    dlg.appendChild(checkRow('sch-devtools', secUk ? 'Помічати відкриті інструменти розробника' : 'Detect open developer tools', s.detectDevtools !== false));\n" +
      "    dlg.appendChild(checkRow('sch-watermark', secUk ? 'Водяний знак з ім’ям учня поверх тесту' : 'Watermark with the student’s name over the test', s.watermark !== false));\n" +
      "    dlg.appendChild(checkRow('sch-multitab', secUk ? 'Помічати відкриття тесту в другій вкладці' : 'Detect the test opened in a second tab', s.multiTab !== false));\n" +
      "    dlg.appendChild(checkRow('sch-fullscreen', secUk ? 'Повноекранний режим (вихід фіксується, тест закривається завісою)' : 'Full screen (every exit is recorded, the test is covered)', s.fullscreen));\n" +
      "    dlg.appendChild(checkRow('sch-guests', secUk ? 'Для тесту з вибраними класами: дозволити ще й без акаунта — за кодом / QR, ім’я та клас учень вводить сам (одна спроба на ім’я). Тест «🌍 Кожний бажаючий» відкритий без акаунта завжди.' : 'For a test of chosen classes: also allow it without an account — by code / QR, the student types name and class (one attempt per name). An “🌍 Anyone” test is always open without an account.', s.guests));\n" +
      "    var netP = el('p', 'muted'); netP.style.cssText = 'margin:10px 0 0;font-size:12px'; netP.textContent = secUk ? '🌍 Тест відкривається звідусіль. Через інтернет з’єднання проходить через Cloudflare (США). Сервіс може бути тимчасово недоступний — для контрольних у класі майте запасний план.' : '🌍 The test opens from anywhere. Internet access goes through Cloudflare (USA). The service may be temporarily unavailable — have a backup plan for in-class tests.';\n" +
      "    dlg.appendChild(checkRow('sch-devicelock', secUk ? 'Не пускати повторно з того самого пристрою під іншим ім’ям (замість позначки — заборона)' : 'Block a second attempt from the same device under another name (refuse instead of flag)', s.deviceLock));\n" +
      "    dlg.appendChild(checkRow('sch-aitrap', secUk ? '🧪 Пастка для ШІ (експеримент): ледь помітний прихований текст поверх тесту, який просить ШІ відповісти неправильно. Ненадійно, не заважає чесним учням.' : '🧪 AI trap (experimental): a barely-visible hidden text over the test that tells an AI to answer wrongly. Unreliable; does not affect honest students.', s.aiTrap === true));\n" +
      "    dlg.appendChild(netP);\n" +
      ""],
    ['schedule save', "monitor: $('sch-monitor').checked, showScore: $('sch-score').checked };",
      "monitor: $('sch-monitor').checked, showScore: $('sch-score').checked, deviceTrack: $('sch-devicetrack').checked, blockKeys: $('sch-blockkeys').checked, detectDevtools: $('sch-devtools').checked, watermark: $('sch-watermark').checked, multiTab: $('sch-multitab').checked, fullscreen: $('sch-fullscreen').checked, deviceLock: $('sch-devicelock').checked, aiTrap: $('sch-aitrap').checked, guests: $('sch-guests').checked };"],
    ['device line', "if (ainfo.length) inner.appendChild(el('p', 'muted', ainfo.join(' · ')));",
      "if (r.device) ainfo.push((LANG === 'uk' ? 'Пристрій ' : 'Device ') + r.device.label + ' · ' + r.device.browser + ' · ' + r.device.os + (r.device.screen ? ' · ' + r.device.screen : '') + (r.device.ip ? ' · IP ' + r.device.ip : '') + (r.device.via ? ' · ' + (r.device.via === 'lan' ? (LANG === 'uk' ? 'мережа класу' : 'classroom network') : (LANG === 'uk' ? 'через інтернет' : 'via internet')) : '') + ' · ' + (LANG === 'uk' ? 'браузер ' : 'browser ') + r.device.cookie);\n" +
      "    if (ainfo.length) inner.appendChild(el('p', 'muted', ainfo.join(' · ')));"],
    ['device in row', "tr.appendChild(tdN);", "if (r.device && r.device.label !== '—') { var dv = el('span', 'muted', ' ' + r.device.label); dv.style.fontSize = '11px'; tdN.appendChild(dv); }\n      tr.appendChild(tdN);"],
    // an attempt still in progress can be deleted too: a student stuck "open on another device" can start again
    ['delete in progress', "if (!r.grade) { inner.appendChild(el('p', 'muted', L('not_submitted_yet'))); }",
      "if (!r.grade) { inner.appendChild(el('p', 'muted', L('not_submitted_yet')));\n" +
      "      inner.appendChild(mkBtn(L('del_attempt'), 'btn sm danger', function (e) { e.stopPropagation(); if (confirm(L('confirm_del_attempt', { name: r.name }))) call('deleteAttempt', [PIN, r.id]).then(function () { RESOPEN = null; openResults(RES.testId); }); })).style.marginTop = '12px'; }"],
    // test from photos: a set of photos (added one by one or several at once, up to 10), then "Create the test"
    ['photo tray html', '<div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn" id="aiCancel">Cancel</button><button class="btn ai" id="aiChoose">Choose photos</button></div>',
      '<div id="aiTray" class="ai-tray"></div><div class="muted" id="aiTrayMsg" style="font-size:13px;min-height:18px"></div>\n' +
      '  <div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn" id="aiCancel">Cancel</button><button class="btn" id="aiChoose">Choose photos</button><button class="btn ai" id="aiGo">✨ Create the test</button></div>'],
    ['photo tray reset', "$('aiNote').value = ''; $('aiDlg').showModal();", "$('aiNote').value = ''; window.__TX.photos.reset(LANG); window.__TX.aiLegal(LANG); $('aiDlg').showModal();"],
    // D4: flags are signals, not proof
    // ----- the students' review of their mistakes -----
    ['review switch', "dlg.appendChild(checkRow('sch-score', L('sch_score'), s.showScore));",
      "dlg.appendChild(checkRow('sch-score', L('sch_score'), s.showScore));\n    dlg.appendChild(checkRow('sch-review', LANG === 'uk' ? '🔍 Після закриття тесту показати учням розбір: де помилка, правильна відповідь і чому (кожному учню можна дозволити чи заборонити окремо в результатах)' : '🔍 After the test closes, show students the review: where they went wrong, the right answer and why (allow or forbid it per student in the results)', s.review));"],
    ['review save', "guests: $('sch-guests').checked };", "guests: $('sch-guests').checked, review: $('sch-review').checked };"],
    ['review per student', "      });\n      inner.appendChild(mkBtn(L('del_attempt')",
      "      });\n      inner.appendChild(window.__TX.reviewToggle(r, RES, LANG, function (v) { return call('setReview', [PIN, r.id, v]); }, function () { openResults(RES.testId); }));\n      inner.appendChild(mkBtn(L('del_attempt')"],
    ['review explain', "if (RES.sheetUrl) {", "top.appendChild(window.__TX.explainBtn(RES, LANG, function () { return call('explainTest', [PIN, RES.testId]); }, function () { openResults(RES.testId); }));\n    if (RES.sheetUrl) {"],
    ['flags note', "var fb = el('div', 'flags-box' + (high ? ' high' : '')); fb.appendChild(el('b', null, L('activity_title')));",
      "var fb = el('div', 'flags-box' + (high ? ' high' : '')); fb.appendChild(el('b', null, L('activity_title')));\n      var fbn = el('p', 'muted', LANG === 'uk' ? 'Позначки — це сигнали, а не докази. Вони можуть виникати з невинних причин (сповіщення, слабкий інтернет, однакові комп’ютери в класі, спільний пристрій у родині). Поговоріть з учнем, перш ніж робити висновки.' : 'Flags are signals, not proof. They can have innocent causes (notifications, weak internet, identical classroom computers, a shared family device). Talk to the student before drawing conclusions.'); fbn.style.cssText = 'margin:4px 0 0;font-size:12px'; fb.appendChild(fbn);"],
    ['photo tray add', "var files = Array.prototype.slice.call(this.files || []).slice(0, 6);\n    if (!files.length) return;",
      "var files = Array.prototype.slice.call(this.files || []);\n    window.__TX.photos.add(files, readImage); return;"],
    ['photo tray go', "$('aiChoose').addEventListener('click', function () { $('fileInput').value = ''; $('fileInput').click(); });",
      "$('aiChoose').addEventListener('click', function () { $('fileInput').value = ''; $('fileInput').click(); });\n" +
      "  $('aiGo').addEventListener('click', function () {\n" +
      "    var images = window.__TX.photos.list(); if (!images.length) { window.__TX.photos.need(); return; }\n" +
      "    var note = $('aiNote').value || '';\n" +
      "    var langs = []; if ($('aiLangUk').checked) langs.push('uk'); if ($('aiLangEn').checked) langs.push('en');\n" +
      "    if (ONE_LANG()) langs = SLANGS();\n" +
      "    $('aiDlg').close(); $('aiBusyDlg').showModal();\n" +
      "    call('generateFromPhotos', [PIN, images, note, langs]).then(function (res) {\n" +
      "      $('aiBusyDlg').close(); window.__TX.photos.reset(LANG);\n" +
      "      openEditorWith({ id: '', title: res.title, folder: '', source: 'ai', status: 'draft', content: res.content }, res.warnings || []);\n" +
      "    }).catch(function (err) { $('aiBusyDlg').close(); alert(L('ai_fail') + ' ' + (userMsg(err) || err)); $('aiDlg').showModal(); });\n" +
      "  });"],
    ['photo strings uk', "ai_intro: 'Сфотографуйте або оберіть чітке фото сторінки (до 6). Можна додати вказівки для ШІ.'",
      "ai_intro: 'Додайте фото сторінок (до 10): по одному або кілька одразу, можна з камери телефону. Усі фото стануть одним тестом. Можна додати вказівки для ШІ.'"],
    ['photo strings en', "ai_intro: 'Take or choose a clear photo of the worksheet page (up to 6). You can add instructions for the AI.'",
      "ai_intro: 'Add photos of the pages (up to 10): one by one or several at once, also from the phone camera. All photos become one test. You can add instructions for the AI.'"],
    ['photo btn uk', "ai_choose: 'Обрати фото'", "ai_choose: '➕ Додати фото'"],
    ['photo btn en', "ai_choose: 'Choose photos'", "ai_choose: '➕ Add photos'"],
    ['uk strings', "spreadsheet: 'Таблиця'", "spreadsheet: '⬇ CSV'"],
    ['en strings', "spreadsheet: 'Spreadsheet'", "spreadsheet: '⬇ CSV'"],
    ['uk del', 'Уже збережені оцінки залишаться в таблиці.', 'Уже збережені результати залишаться в базі.'],
    ['en del', 'Student marks already saved stay in the spreadsheet.', 'Student marks already saved stay in the database.'],
    ['uk key', 'Зберігається у вашому скрипті.', 'Зберігається у вашому акаунті на цьому сервері. Якщо адміністратор задав GEMINI_API_KEY, вводити ключ не потрібно.'],
    ['en key', 'It is stored in your own script.', 'It is stored in your account on this server. If the server has GEMINI_API_KEY set, you do not need one.', true]
  ]), 'Teacher');
}

if (require.main === module) {
  const fs = require('fs'), path = require('path');
  const core = path.join(__dirname, '..', 'core');
  buildStudent(fs.readFileSync(path.join(core, 'Student.html'), 'utf8'));
  buildTeacher(fs.readFileSync(path.join(core, 'Teacher.html'), 'utf8'));
  console.log('OK: all page patches apply to core/Student.html and core/Teacher.html');
}

module.exports = { buildStudent, buildTeacher };
