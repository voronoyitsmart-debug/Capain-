// © Платон Вороний. All rights reserved. See LICENSE.
// «📚 Підручники»: adding the school's textbooks (the PDF is read here, in the browser, by pdf.js — only the text of
// each page and small pictures of pages without text go to the server), their topics, and a draft test from chosen topics.
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function el(tag, c, x) { var n = document.createElement(tag); if (c) n.className = c; if (x != null) n.textContent = x; return n; }
  function B(fn) { return window.api('/api/books/' + fn, { args: Array.prototype.slice.call(arguments, 1) }); }
  function msg(e) { var m = String(e && e.message || e), i = m.indexOf('USER:'); return (i >= 0 ? m.slice(i + 5) : m).replace(/\s*\[#[a-z_]+\]\s*$/, '').trim(); }
  var TR = {   // the server's messages, in Ukrainian
    book_lawful: 'Позначте галочку: школа працює за цим підручником.', book_title: 'Введіть назву підручника.', book_empty: 'У файлі немає сторінок.',
    book_big: 'Підручник задовгий. Додайте його частинами.', book_none: 'Підручник не знайдено.', book_owner: 'Змінювати підручник може той, хто його додав, або адміністратор.',
    book_missing: 'Не всі сторінки дійшли. Додайте підручник ще раз.', book_pick: 'Позначте хоча б одну тему.', book_blank: 'На цих сторінках немає тексту. Перевірте сторінки теми.',
    book_no_toc: 'ШІ не знайшов змісту на перших сторінках. Додайте теми вручну.', book_ai_limit: 'Школа вичерпала запити до ШІ на сьогодні. Спробуйте завтра.',
    book_many: 'У школи вже забагато підручників. Видаліть непотрібні.', book_img: 'Картинку сторінки не вдалося прочитати.',
    ai_ack: 'Спершу позначте галочку про правила ШІ.', no_key: 'Немає ключа Gemini. Його додає власник сервера (GEMINI_API_KEY) або ви — у кабінеті предмета («Ключ ШІ»).',
    ai_unreadable: 'Не вдалося прочитати відповідь ШІ. Спробуйте ще раз.', ai_empty: 'ШІ не створив питань. Спробуйте інші сторінки.',
    ai_unreachable: 'Не вдалося з’єднатися з Gemini. Перевірте ключ та інтернет.', rate: 'Забагато запитів. Зачекайте хвилину.'
  };
  function err(e) { var c = (/\[#([a-z_]+)\]/.exec(String(e && e.message)) || [])[1]; return (c && TR[c]) || msg(e); }
  var D = null, CUR = null, FORMULA = { math: 1, physics: 1, chemistry: 1 };

  function subjName(k) { var s = (D.subjects.filter(function (x) { return x.key === k; })[0]); return s ? s.icon + ' ' + (s.name.uk || s.name.en) : '—'; }
  function fillSubj(sel, any) {
    sel.textContent = '';
    if (any) { var o = el('option', null, '— будь-який —'); o.value = ''; sel.appendChild(o); }
    D.subjects.forEach(function (s) { var o = el('option', null, s.icon + ' ' + (s.name.uk || s.name.en)); o.value = s.key; sel.appendChild(o); });
  }
  function load(openId) {
    return B('list').then(function (d) {
      D = d; fillSubj($('aSubj'), true); fillSubj($('eSubj'), true); fillSubj($('gSubj'), false);
      var tb = $('books'); tb.textContent = '';
      $('empty').classList.toggle('hidden', d.books.length > 0);
      d.books.forEach(function (b) {
        var tr = el('tr'); if (!b.ready) tr.className = 'off';
        var td = el('td'); var a = el('a', null, b.title); a.href = '#'; a.addEventListener('click', function (e) { e.preventDefault(); openBook(b.id); }); td.appendChild(a);
        if (b.scans) { td.appendChild(document.createTextNode(' ')); td.appendChild(el('span', 'badge beta', 'скани: ' + b.scans)); }
        if (!b.ready) { td.appendChild(document.createTextNode(' ')); td.appendChild(el('span', 'badge', 'не дозавантажено')); }
        tr.appendChild(td); tr.appendChild(el('td', null, b.subject ? subjName(b.subject) : '—')); tr.appendChild(el('td', null, b.grade || '—'));
        tr.appendChild(el('td', null, String(b.pages))); tr.appendChild(el('td', null, b.by));
        var acts = el('td', 'acts'); var o = el('button', 'btn sm', 'Відкрити'); o.type = 'button'; o.addEventListener('click', function () { openBook(b.id); }); acts.appendChild(o);
        tr.appendChild(acts); tb.appendChild(tr);
      });
      $('ackWrap').classList.toggle('hidden', !!d.me.aiAck);
      if (openId) openBook(openId);
    }).catch(function (e) { $('listErr').textContent = err(e); });
  }

  // ---------- adding a textbook ----------
  $('addBtn').addEventListener('click', function () { $('addCard').classList.remove('hidden'); $('aTitle').focus(); });
  $('aCancel').addEventListener('click', function () { $('addCard').classList.add('hidden'); });
  $('aFile').addEventListener('change', function () {
    var f = $('aFile').files[0]; if (f && !$('aTitle').value) $('aTitle').value = f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[_]+/g, ' ').slice(0, 140);
  });
  function status(t, part) { $('aStatus').textContent = t; if (part != null) { $('aBar').classList.remove('hidden'); $('aBar').firstChild.style.width = Math.round(part * 100) + '%'; } }

  var PDFJS = null;
  function pdfjs() {
    if (PDFJS) return Promise.resolve(PDFJS);
    return import('/vendor/pdfjs/pdf.min.mjs').then(function (m) { m.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.mjs'; PDFJS = m; return m; });
  }
  /** Lines of a pdf.js page: a new line where the item says so or where the baseline moves. */
  function pageText(tc) {
    var out = '', lastY = null;
    tc.items.forEach(function (it) {
      if (it.str == null) return;
      var y = it.transform ? it.transform[5] : null;
      if (lastY != null && y != null && Math.abs(y - lastY) > Math.max(2, (it.height || 10) * 0.6) && !/\n$/.test(out)) out += '\n';
      out += it.str; if (it.hasEOL) out += '\n';
      if (y != null) lastY = y;
    });
    return out.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }
  function canvasJpeg(cv) {
    var q = [0.62, 0.5, 0.4], url = '';
    for (var i = 0; i < q.length; i++) { url = cv.toDataURL('image/jpeg', q[i]); if (url.length * 0.75 < D.limits.img * 0.92) return url; }
    var small = document.createElement('canvas'); small.width = Math.round(cv.width * 0.7); small.height = Math.round(cv.height * 0.7);
    small.getContext('2d').drawImage(cv, 0, 0, small.width, small.height);
    return small.toDataURL('image/jpeg', 0.45);
  }
  function renderPage(page) {
    var v1 = page.getViewport({ scale: 1 }), scale = Math.min(2, 1150 / v1.width), vp = page.getViewport({ scale: scale });
    var cv = document.createElement('canvas'); cv.width = Math.round(vp.width); cv.height = Math.round(vp.height);
    var ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
    return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () { return canvasJpeg(cv); });
  }
  function photoJpeg(file) {
    return createImageBitmap(file).then(function (bm) {
      var k = Math.min(1, 1400 / Math.max(bm.width, bm.height)), cv = document.createElement('canvas');
      cv.width = Math.round(bm.width * k); cv.height = Math.round(bm.height * k);
      var ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.drawImage(bm, 0, 0, cv.width, cv.height);
      return canvasJpeg(cv);
    });
  }
  /** The PDF's bookmarks → [{title, from}]; a bookmark with sub-bookmarks is a part: its children are the topics. */
  function outlineOf(doc) {
    return doc.getOutline().then(function (items) {
      var flat = [];
      (items || []).forEach(function (it) { if (it.items && it.items.length) it.items.forEach(function (c) { flat.push(c); }); else flat.push(it); });
      return Promise.all(flat.slice(0, 400).map(function (it) {
        var d = it.dest;
        return (typeof d === 'string' ? doc.getDestination(d) : Promise.resolve(d)).then(function (dest) {
          if (!dest || !dest[0]) return null;
          return (typeof dest[0] === 'number' ? Promise.resolve(dest[0]) : doc.getPageIndex(dest[0])).then(function (i) { return { title: it.title, from: i + 1 }; });
        }).catch(function () { return null; });
      })).then(function (a) { return a.filter(Boolean); });
    }).catch(function () { return []; });
  }

  $('aGo').addEventListener('click', function () {
    var files = Array.prototype.slice.call($('aFile').files || []), btn = $('aGo');
    $('aErr').textContent = '';
    if (!files.length) { $('aErr').textContent = 'Оберіть файл PDF або фото сторінок.'; return; }
    if (!$('aLawful').checked) { $('aErr').textContent = TR.book_lawful; return; }
    var isPdf = files.length === 1 && /pdf$/i.test(files[0].type || files[0].name);
    if (!isPdf && files.some(function (f) { return !/^image\//.test(f.type); })) { $('aErr').textContent = 'Оберіть один PDF або лише фото (JPEG, PNG).'; return; }
    files.sort(function (a, b) { return a.name.localeCompare(b.name, 'uk', { numeric: true }); });
    btn.disabled = true;
    var bookId = 0, doc = null, total = 0, buf = [], size = 0;
    function flush() { if (!buf.length) return Promise.resolve(); var part = buf; buf = []; size = 0; return B('addPages', bookId, part); }
    function push(p) { buf.push(p); size += (p.text || '').length * 2 + (p.img || '').length; return (buf.length >= 40 || size > 6000000) ? flush() : Promise.resolve(); }
    if (isPdf) status('Читаю PDF…', 0);
    var open = isPdf ? pdfjs().then(function (m) {
      return files[0].arrayBuffer().then(function (data) {
        return m.getDocument({ data: data, cMapUrl: '/vendor/pdfjs/cmaps/', cMapPacked: true, standardFontDataUrl: '/vendor/pdfjs/standard_fonts/', isEvalSupported: false }).promise;
      }).then(function (d) { doc = d; total = d.numPages; });
    }) : Promise.resolve().then(function () { total = files.length; });
    open.then(function () {
      if (total > D.limits.pages) throw new Error('USER: x [#book_big]');
      return B('create', { title: $('aTitle').value, subject: $('aSubj').value, grade: $('aGrade').value, pages: total, lawful: true });
    }).then(function (r) {
      bookId = r.id;
      var i = 0;
      function next() {
        if (i >= total) return flush();
        var n = ++i; status('Сторінка ' + n + ' з ' + total + '…', (n - 1) / total);
        if (!isPdf) return photoJpeg(files[n - 1]).then(function (img) { return push({ page: n, text: '', img: img }); }).then(next);
        return doc.getPage(n).then(function (pg) {
          return pg.getTextContent().then(function (tc) {
            var text = pageText(tc);
            var p = text.replace(/\s+/g, '').length >= 5 ? Promise.resolve('') : renderPage(pg);   // no text layer: a scan
            return p.then(function (img) { pg.cleanup(); return push({ page: n, text: text, img: img || undefined }); });
          });
        }).then(next);
      }
      return next();
    }).then(function () {
      status('Шукаю теми…', 1);
      return (doc ? outlineOf(doc) : Promise.resolve([])).then(function (ol) { return B('finish', bookId, ol); });
    }).then(function (r) {
      btn.disabled = false; $('addCard').classList.add('hidden'); $('aFile').value = ''; $('aTitle').value = ''; $('aLawful').checked = false; $('aBar').classList.add('hidden');
      status(''); if (doc) doc.destroy();
      load(bookId).then(function () {
        $('tStatus').textContent = r.how === 'outline' ? 'Теми взято із закладок PDF. Перевірте їх.' : r.how === 'contents' ? 'Теми знайдено у змісті. Перевірте сторінки.' : 'Тем не знайдено автоматично: натисніть «🤖 Знайти теми» або додайте вручну.';
      });
    }).catch(function (e) {
      btn.disabled = false; status(''); $('aBar').classList.add('hidden'); $('aErr').textContent = err(e);
      if (bookId) B('remove', bookId).catch(function () {});
      if (doc) doc.destroy();
    });
  });

  // ---------- one textbook ----------
  function openBook(id) {
    $('gOut').textContent = ''; $('gErr').textContent = ''; $('prev').classList.add('hidden'); $('tStatus').textContent = '';
    return B('get', id).then(function (b) { CUR = b; renderBook(); $('bookCard').classList.remove('hidden'); $('bookCard').scrollIntoView({ behavior: 'smooth', block: 'start' }); })
      .catch(function (e) { $('listErr').textContent = err(e); });
  }
  function canEdit() { return CUR && (CUR.teacherId === D.me.id || D.me.admin); }
  function renderBook() {
    var b = CUR;
    $('bTitle').textContent = '📘 ' + b.title;
    $('bMeta').textContent = (b.subject ? subjName(b.subject) + ' · ' : '') + (b.grade ? b.grade + ' клас · ' : '') + b.pages + ' стор.' + (b.scans ? ' · сканів: ' + b.scans + ' (бета)' : '') + ' · додав(ла) ' + b.by;
    $('bEdit').classList.toggle('hidden', !canEdit()); $('tSave').classList.toggle('hidden', !canEdit()); $('tAi').classList.toggle('hidden', !canEdit());
    $('eTitle').value = b.title; $('eSubj').value = b.subject; $('eGrade').value = b.grade;
    if (b.subject) $('gSubj').value = b.subject;
    subjChanged();
    var tb = $('topics'); tb.textContent = '';
    b.toc.forEach(function (t) { tb.appendChild(topicRow(t)); });
    $('noTopics').classList.toggle('hidden', b.toc.length > 0);
  }
  function topicRow(t) {
    var tr = el('tr');
    var c0 = el('td'), pick = el('input', 'pick'); pick.type = 'checkbox'; pick.setAttribute('aria-label', 'Обрати тему'); c0.appendChild(pick); tr.appendChild(c0);
    var c1 = el('td'), tt = el('input', 'tt'); tt.value = t.title; tt.maxLength = 160; tt.readOnly = !canEdit(); tt.setAttribute('aria-label', 'Назва теми'); c1.appendChild(tt); tr.appendChild(c1);
    [t.from, t.to].forEach(function (v, i) {
      var c = el('td'), x = el('input', 'pg'); x.type = 'number'; x.min = 1; x.max = CUR.pages; x.value = v; x.readOnly = !canEdit(); x.setAttribute('aria-label', i ? 'До сторінки' : 'Від сторінки'); c.appendChild(x); tr.appendChild(c);
    });
    var c4 = el('td', 'acts'), eye = el('button', 'btn sm', '👁'); eye.type = 'button'; eye.title = 'Переглянути сторінки';
    eye.addEventListener('click', function () { preview(Number(tr.children[2].firstChild.value), Number(tr.children[3].firstChild.value)); });
    c4.appendChild(eye);
    if (canEdit()) { var del = el('button', 'btn sm', '✕'); del.type = 'button'; del.title = 'Прибрати тему'; del.addEventListener('click', function () { tr.remove(); }); c4.appendChild(del); }
    tr.appendChild(c4);
    return tr;
  }
  function readToc() {
    return Array.prototype.map.call($('topics').children, function (tr) {
      return { title: tr.children[1].firstChild.value, from: Number(tr.children[2].firstChild.value), to: Number(tr.children[3].firstChild.value), pick: tr.children[0].firstChild.checked };
    });
  }
  function preview(from, to) {
    var box = $('prev'); box.classList.remove('hidden'); box.textContent = 'Завантаження…';
    B('pages', CUR.id, from, to).then(function (r) {
      box.textContent = '';
      box.appendChild(el('p', 'muted', 'Сторінки ' + r.from + '–' + r.to + (to > r.to ? ' (показано перші 5)' : ''))).style.margin = '0';
      r.pages.forEach(function (p) {
        box.appendChild(el('h3', null, 'Сторінка ' + p.page + (p.scan ? ' · скан' : '')));
        if (p.scan) { var im = el('img'); im.alt = 'Сторінка ' + p.page; im.loading = 'lazy'; im.src = '/app/books/img/' + CUR.id + '/' + p.page + '.jpg'; box.appendChild(im); }
        else box.appendChild(el('div', null, p.text.slice(0, 1500) + (p.text.length > 1500 ? ' …' : '')));
      });
    }).catch(function (e) { box.textContent = err(e); });
  }
  $('bClose').addEventListener('click', function () { $('bookCard').classList.add('hidden'); CUR = null; });
  $('tAdd').addEventListener('click', function () { var last = readToc().slice(-1)[0]; var f = last ? Math.min(CUR.pages, last.to + 1) : 1; $('topics').appendChild(topicRow({ title: '', from: f, to: f })); $('noTopics').classList.add('hidden'); });
  $('tSave').addEventListener('click', function () {
    $('tStatus').textContent = 'Зберігаю…';
    B('update', CUR.id, { toc: readToc() }).then(function (b) { CUR = b; renderBook(); $('tStatus').textContent = 'Теми збережено.'; }).catch(function (e) { $('tStatus').textContent = err(e); });
  });
  $('tAi').addEventListener('click', function () {
    if (!ackOk()) { $('tStatus').textContent = TR.ai_ack; return; }
    if (CUR.toc.length && !confirm('Замінити теми тими, що знайде ШІ?')) return;
    $('tAi').disabled = true; $('tStatus').textContent = 'ШІ читає зміст…';
    B('findTopics', CUR.id).then(function (b) { CUR = b; renderBook(); $('tStatus').textContent = 'Знайдено тем: ' + b.toc.length + '. Перевірте сторінки (👁).'; })
      .catch(function (e) { $('tStatus').textContent = err(e); }).then(function () { $('tAi').disabled = false; });
  });
  $('eSave').addEventListener('click', function () {
    B('update', CUR.id, { title: $('eTitle').value, subject: $('eSubj').value, grade: $('eGrade').value }).then(function (b) { CUR = b; renderBook(); load(); }).catch(function (e) { alert(err(e)); });
  });
  $('eDel').addEventListener('click', function () {
    if (!confirm('Видалити підручник «' + CUR.title + '»? Тести, створені з нього, залишаться.')) return;
    B('remove', CUR.id).then(function () { $('bookCard').classList.add('hidden'); CUR = null; load(); }).catch(function (e) { alert(err(e)); });
  });

  // ---------- the test ----------
  function subjChanged() {
    var s = D.subjects.filter(function (x) { return x.key === $('gSubj').value; })[0] || D.subjects[0], sel = $('gLang'); sel.textContent = '';
    var opts = s.mode === 'translate' ? [['en', 'English (з перекладом для учнів)']] : s.langs.length > 1 ? [['uk,en', 'Українська + English'], ['uk', 'Українська'], ['en', 'English']] : [[s.langs[0], s.langs[0] === 'en' ? 'English' : 'Українська']];
    opts.forEach(function (o) { var x = el('option', null, o[1]); x.value = o[0]; sel.appendChild(x); });
    $('fWarn').classList.toggle('hidden', !FORMULA[s.key]);
  }
  $('gSubj').addEventListener('change', subjChanged);
  function ackOk() {
    if (D.me.aiAck) return true;
    return $('aiAck').checked;
  }
  $('aiAck').addEventListener('change', function () {
    if (!$('aiAck').checked) return;
    window.api('/api/t/' + D.subjects[0].key + '/ackAi', { args: [] }).then(function () { D.me.aiAck = true; }, function () { $('aiAck').checked = false; });
  });
  $('gGo').addEventListener('click', function () {
    $('gErr').textContent = ''; $('gOut').textContent = '';
    if (!ackOk()) { $('gErr').textContent = TR.ai_ack; return; }
    var toc = readToc(), picked = [];
    toc.forEach(function (t, i) { if (t.pick) picked.push(i); });
    if (!picked.length) { $('gErr').textContent = TR.book_pick; return; }
    var unsaved = JSON.stringify(toc.map(function (t) { return [t.title, t.from, t.to]; })) !== JSON.stringify(CUR.toc.map(function (t) { return [t.title, t.from, t.to]; }));
    var go = $('gGo'); go.disabled = true; $('gStatus').textContent = 'ШІ складає тест… (до хвилини)';
    var opts = { subject: $('gSubj').value, count: Number($('gCount').value), langs: $('gLang').value.split(','), note: $('gNote').value };
    // topics changed but not saved (a teacher who cannot edit the book, or forgot): send the pages instead
    if (unsaved) { var a = picked.map(function (i) { return toc[i]; }); opts.pages = { from: Math.min.apply(null, a.map(function (t) { return t.from; })), to: Math.max.apply(null, a.map(function (t) { return t.to; })) }; }
    else opts.topics = picked;
    B('makeTest', CUR.id, opts).then(function (r) {
      var box = el('div', 'ok-box');
      box.appendChild(el('b', null, '✅ Чернетку створено: ' + r.questions + ' питань (сторінок: ' + r.pages + ').'));
      box.appendChild(el('p', null, 'Тест збережено як чернетку в предметі «' + subjName(r.subject) + '». Учні його не бачать, доки ви не перевірите й не опублікуєте.')).style.margin = '6px 0';
      if (r.cut) box.appendChild(el('p', 'muted', 'Тема довга: ШІ отримав лише її перші сторінки. Для решти створіть ще один тест.')).style.margin = '6px 0';
      var a = el('a', 'btn solid sm', 'Відкрити в редакторі →'); a.href = '/app/' + r.subject + '?e=' + encodeURIComponent(r.id); box.appendChild(a);
      if (r.sources && r.sources.length) {
        box.appendChild(el('p', null, 'Звідки взято відповіді (для перевірки):')).style.margin = '12px 0 4px';
        var ul = el('ul', 'src'); r.sources.forEach(function (s) { ul.appendChild(el('li', null, 'Питання ' + s.n + ' — с. ' + s.page + (s.quote ? ': «' + s.quote + '»' : ''))); }); box.appendChild(ul);
      }
      $('gOut').appendChild(box);
    }).catch(function (e) { $('gErr').textContent = err(e); }).then(function () { go.disabled = false; $('gStatus').textContent = ''; });
  });

  window.api('/api/auth/me').then(function (me) { $('who').textContent = me.name; }).catch(function () {});
  load();
})();
