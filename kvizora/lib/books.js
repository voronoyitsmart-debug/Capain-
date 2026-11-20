'use strict';
// © Платон Вороний. All rights reserved. See LICENSE.
// The school's textbooks («📚 Підручники»): a teacher or an administrator adds the book the school works with,
// Kvizora splits it into topics, and a teacher makes a draft test from the chosen topics with the AI.
// The PDF itself never reaches the server: the browser reads it (pdf.js) and sends the text of each page; only pages
// without text (scans) and photos of pages are kept as small JPEGs. Books belong to a school: only that school's
// teachers and administrators see them, students never do. The AI gets only the pages of the chosen topics.
const { tx, audit } = require('./db');
const { USER } = require('./errors');
const { plain } = require('./engine');
const gemini = require('./gemini');

const LIMITS = {
  pages: 600,                 // pages in one book
  pageText: 20000,            // characters of one page
  img: 400 * 1024,            // one page picture (JPEG, decoded bytes)
  booksPerSchool: 200,
  genText: 60000,             // characters of book text in one AI request (about 25–30 pages)
  genImages: 10,              // page pictures in one AI request
  tocPages: 14,               // first pages the AI reads to find the table of contents
  aiPerDay: Number(process.env.BOOKS_AI_PER_DAY) || 300   // AI requests from the textbooks page, per school and day
};

const SCHEMA = `
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL,         -- who added it
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',    -- a subject key, '' = any
  grade TEXT NOT NULL DEFAULT '',      -- class / year, e.g. "7"
  pages INTEGER NOT NULL DEFAULT 0,
  toc TEXT NOT NULL DEFAULT '[]',      -- [{ title, from, to }] in PDF page numbers (1-based)
  ready INTEGER NOT NULL DEFAULT 0,    -- 0 while the pages are still being uploaded
  created INTEGER NOT NULL,
  updated INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS books_school ON books (school_id);
CREATE TABLE IF NOT EXISTS book_pages (
  book_id INTEGER NOT NULL,
  page INTEGER NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  img BLOB,                            -- JPEG of a page without text (a scan or a photo)
  PRIMARY KEY (book_id, page)
);
`;

const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f<>]/g, ' ').replace(/[ \t]+/g, ' ').trim().slice(0, n);
const line = (s, n) => clean(s, n).replace(/\s+/g, ' ');
const now = () => Date.now();
function J(s, d) { try { const v = JSON.parse(s || ''); return v == null ? d : v; } catch (e) { return d; } }
const isAdm = t => !!t && (t.role === 'owner' || t.role === 'admin');
/** Text for comparing titles: lower case, letters and digits only. */
const norm = s => String(s || '').toLowerCase().replace(/[’'`ʼ]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/** Topics: titles cleaned, pages inside the book, sorted, each one ends where the next one starts. */
function cleanToc(arr, pages) {
  const out = [];
  (Array.isArray(arr) ? arr : []).slice(0, 400).forEach(x => {
    const title = line(x && x.title, 160), from = Math.round(Number(x && x.from));
    if (!title || !(from >= 1) || from > pages) return;
    let to = Math.round(Number(x && x.to));
    if (!(to >= from)) to = 0;
    out.push({ title: title, from: from, to: Math.min(to, pages) });
  });
  out.sort((a, b) => a.from - b.from);
  out.forEach((t, i) => { if (!t.to) t.to = i + 1 < out.length ? Math.max(t.from, out[i + 1].from - 1) : pages; });
  return out;
}

/**
 * Topics from the book's own table of contents, without the AI: lines like «§ 5. Будова клітини ........ 34»
 * or «Тема 3. Сили 45». Printed page numbers are turned into PDF pages by finding the titles in the text.
 */
function tocFromText(pageTexts) {
  const n = pageTexts.length, found = [];
  const re = /^\s*((?:§\s*\d+|розділ\s+[\divxlc]+|тема\s+\d+|глава\s+\d+|урок\s+\d+|lesson\s+\d+|unit\s+\d+|chapter\s+\d+|\d{1,2}(?:\.\d{1,2})?)\.?\s+[^\n]{3,140}?)[\s.·…_-]{2,}(\d{1,3})\s*$/i;
  for (let p = 0; p < Math.min(n, LIMITS.tocPages); p++) {
    String(pageTexts[p] || '').split(/\n/).forEach(l => {
      const m = re.exec(l); if (!m) return;
      const title = m[1].replace(/[\s.·…_-]+$/, '').trim(), printed = Number(m[2]);
      if (printed >= 1 && printed <= n + 40) found.push({ title: title, printed: printed, tocPage: p + 1 });
    });
  }
  if (found.length < 2) return [];
  return mapPrinted(pageTexts, found);
}

/** [{title, printed}] → [{title, from}] with PDF page numbers: titles found in the text set the offset for the rest. */
function mapPrinted(pageTexts, items) {
  const n = pageTexts.length, normPages = pageTexts.map(norm), offsets = [];
  const keyOf = x => norm(x.title).replace(/^(§|розділ|тема|глава|урок|lesson|unit|chapter)?\s*[\divxlc]+\s*/i, '').slice(0, 40);
  const keys = items.map(keyOf);
  // the contents pages themselves list every title: the search for a topic starts after them
  let tocEnd = Math.max(0, ...items.map(x => x.tocPage || 0));
  for (let p = 0; p < Math.min(n, LIMITS.tocPages); p++) {
    if (keys.filter(k => k.length >= 6 && normPages[p].indexOf(k) >= 0).length >= Math.min(3, items.length)) tocEnd = Math.max(tocEnd, p + 1);
  }
  items.forEach((x, i) => {
    const key = keys[i];
    if (key.length < 6 || !x.printed) return;
    for (let p = tocEnd; p < n; p++) if (normPages[p].indexOf(key) >= 0) { x.pdf = p + 1; offsets.push(x.pdf - x.printed); break; }
  });
  offsets.sort((a, b) => a - b);
  const off = offsets.length ? offsets[Math.floor(offsets.length / 2)] : 0;
  return items.map(x => ({ title: x.title, from: x.pdf || Math.min(n, Math.max(1, (x.printed || 1) + off)) }));
}

class Books {
  constructor(db, api) {
    this.db = db; this.api = api;
    db.exec(SCHEMA);
  }

  // ---------- helpers ----------
  /** A book of the teacher's school (the owner of Kvizora sees every school). */
  book(t, id) {
    const b = this.db.prepare('SELECT * FROM books WHERE id = ?').get(Number(id) || 0);
    if (!b || (t.role !== 'owner' && b.school_id !== t.school_id)) throw USER('book_none', 'This textbook was not found.', 404);
    return b;
  }
  /** Only who added the book or an administrator may change or delete it. */
  mine(t, b) { if (b.teacher_id !== t.id && !isAdm(t)) throw USER('book_owner', 'Only the teacher who added this textbook or an administrator can change it.', 403); }
  view(b) {
    const who = this.db.prepare('SELECT name FROM teachers WHERE id = ?').get(b.teacher_id);
    const scans = this.db.prepare('SELECT COUNT(*) AS n FROM book_pages WHERE book_id = ? AND img IS NOT NULL').get(b.id).n;
    return { id: b.id, title: b.title, subject: b.subject, grade: b.grade, pages: b.pages, scans: scans, ready: !!b.ready,
      toc: J(b.toc, []), by: who ? who.name : '', teacherId: b.teacher_id, created: b.created, updated: b.updated };
  }
  /** One AI request more for the school; refuses after the daily limit (protects the owner's Gemini quota and bill). */
  countAi(t, what) {
    const since = now() - 86400000;
    const n = this.db.prepare("SELECT COUNT(*) AS n FROM audit WHERE action LIKE 'book.ai%' AND detail LIKE ? AND at > ?").get('school ' + t.school_id + ':%', since).n;
    if (n >= LIMITS.aiPerDay) throw USER('book_ai_limit', 'The school has used today’s AI requests for textbooks (' + LIMITS.aiPerDay + '). Try again tomorrow.', 429);
    audit(this.db, t.email, 'book.ai.' + what, 'school ' + t.school_id + ': ' + what, this.ip || '');
  }
  texts(b, from, to) {
    return this.db.prepare('SELECT page, text, img IS NOT NULL AS scan FROM book_pages WHERE book_id = ? AND page BETWEEN ? AND ? ORDER BY page').all(b.id, from, to);
  }

  // ---------- calls from the textbooks page ----------
  list(t) {
    const rows = t.role === 'owner' ? this.db.prepare('SELECT * FROM books ORDER BY grade, title').all()
      : this.db.prepare('SELECT * FROM books WHERE school_id = ? ORDER BY grade, title').all(t.school_id);
    return { books: rows.map(b => this.view(b)), limits: { pages: LIMITS.pages, img: LIMITS.img, genImages: LIMITS.genImages },
      subjects: Object.keys(this.api.subjects).map(k => { const S = this.api.subjects[k]; return { key: k, icon: S.icon, name: S.info.name, mode: S.info.mode, langs: plain(S.info.langs || S.x.LANGS) }; }),
      me: { id: t.id, admin: isAdm(t), aiAck: !!t.ai_ack_at } };
  }
  get(t, id) { return this.view(this.book(t, id)); }

  /** Step 1 of adding a book: its card. The teacher confirms the school may use the textbook this way. */
  create(t, meta) {
    meta = meta || {};
    if (meta.lawful !== true) throw USER('book_lawful', 'Tick the box: the school uses this textbook and it is added only for making tests.');
    const title = line(meta.title, 140); if (title.length < 2) throw USER('book_title', 'Type the textbook title.');
    const pages = Math.round(Number(meta.pages));
    if (!(pages >= 1)) throw USER('book_empty', 'The file has no pages.');
    if (pages > LIMITS.pages) throw USER('book_big', 'The textbook is too long (more than ' + LIMITS.pages + ' pages). Add it in parts.');
    const subject = this.api.subjects[meta.subject] ? meta.subject : '';
    if (this.db.prepare('SELECT COUNT(*) AS n FROM books WHERE school_id = ?').get(t.school_id).n >= LIMITS.booksPerSchool) throw USER('book_many', 'The school already has ' + LIMITS.booksPerSchool + ' textbooks. Delete the ones you no longer use.');
    const n = now();
    const id = Number(this.db.prepare('INSERT INTO books (school_id, teacher_id, title, subject, grade, pages, toc, ready, created, updated) VALUES (?,?,?,?,?,?,?,0,?,?)')
      .run(t.school_id, t.id, title, subject, line(meta.grade, 20), pages, '[]', n, n).lastInsertRowid);
    audit(this.db, t.email, 'book.add', '#' + id + ' ' + title, this.ip || '');
    return { id: id };
  }

  /** Step 2: pages in portions — [{ page, text, img: 'data:image/jpeg;base64,…' (only for pages without text) }]. */
  addPages(t, id, list) {
    const b = this.book(t, id); this.mine(t, b);
    if (!Array.isArray(list) || !list.length || list.length > 60) throw USER('book_part', 'Send from 1 to 60 pages at a time.');
    const ins = this.db.prepare('INSERT INTO book_pages (book_id, page, text, img) VALUES (?, ?, ?, ?) ON CONFLICT (book_id, page) DO UPDATE SET text = excluded.text, img = excluded.img');
    tx(this.db, () => list.forEach(p => {
      const page = Math.round(Number(p && p.page));
      if (!(page >= 1 && page <= b.pages)) throw USER('book_page', 'Wrong page number.');
      let img = null;
      if (p.img) {
        const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(p.img));
        if (!m) throw USER('book_img', 'A page picture could not be read.');
        img = Buffer.from(m[1], 'base64');
        if (img.length > LIMITS.img || img[0] !== 0xff || img[1] !== 0xd8) throw USER('book_img', 'A page picture is too big or not a JPEG.');
      }
      ins.run(b.id, page, clean(p.text, LIMITS.pageText).replace(/\n{3,}/g, '\n\n'), img);
    }));
    this.db.prepare('UPDATE books SET updated = ? WHERE id = ?').run(now(), b.id);
    return { ok: true };
  }

  /** Step 3: the upload is complete. Topics: the PDF's bookmarks (sent by the page), else the printed table of contents. */
  finish(t, id, outline) {
    const b = this.book(t, id); this.mine(t, b);
    const have = this.db.prepare('SELECT COUNT(*) AS n FROM book_pages WHERE book_id = ?').get(b.id).n;
    if (have < b.pages) throw USER('book_missing', 'Some pages did not arrive (' + (b.pages - have) + '). Add the textbook again.');
    let toc = cleanToc(outline, b.pages), how = toc.length ? 'outline' : '';
    if (toc.length < 2) {
      toc = cleanToc(tocFromText(this.texts(b, 1, b.pages).map(r => r.text)), b.pages);
      how = toc.length ? 'contents' : '';
    }
    this.db.prepare('UPDATE books SET ready = 1, toc = ?, updated = ? WHERE id = ?').run(JSON.stringify(toc), now(), b.id);
    return { book: this.get(t, b.id), how: how };
  }

  update(t, id, meta) {
    const b = this.book(t, id); this.mine(t, b); meta = meta || {};
    const title = line(meta.title != null ? meta.title : b.title, 140); if (title.length < 2) throw USER('book_title', 'Type the textbook title.');
    const subject = meta.subject == null ? b.subject : this.api.subjects[meta.subject] ? meta.subject : '';
    const toc = meta.toc ? cleanToc(meta.toc, b.pages) : J(b.toc, []);
    this.db.prepare('UPDATE books SET title = ?, subject = ?, grade = ?, toc = ?, updated = ? WHERE id = ?')
      .run(title, subject, line(meta.grade != null ? meta.grade : b.grade, 20), JSON.stringify(toc), now(), b.id);
    return this.get(t, b.id);
  }

  remove(t, id) {
    const b = this.book(t, id); this.mine(t, b);
    tx(this.db, () => { this.db.prepare('DELETE FROM book_pages WHERE book_id = ?').run(b.id); this.db.prepare('DELETE FROM books WHERE id = ?').run(b.id); });
    audit(this.db, t.email, 'book.delete', '#' + b.id + ' ' + b.title, this.ip || '');
    return { ok: true };
  }

  /** Preview of a few pages (to check a topic's pages); never the whole book at once. */
  pages(t, id, from, to) {
    const b = this.book(t, id);
    from = Math.max(1, Math.round(Number(from)) || 1); to = Math.min(b.pages, Math.round(Number(to)) || from);
    if (to < from) to = from;
    if (to - from > 4) to = from + 4;
    return { from: from, to: to, pages: this.texts(b, from, to).map(r => ({ page: r.page, text: r.text, scan: !!r.scan })) };
  }
  /** A page picture (scans and photos), for the preview. */
  image(t, id, page) {
    const b = this.book(t, id);
    const r = this.db.prepare('SELECT img FROM book_pages WHERE book_id = ? AND page = ?').get(b.id, Math.round(Number(page)) || 0);
    return r && r.img ? Buffer.from(r.img) : null;
  }

  /** «🤖 Знайти теми»: the AI reads the first pages (the table of contents) and lists the topics with their pages. */
  async findTopics(t, id) {
    const b = this.book(t, id); this.mine(t, b);
    const S = this.subjectFor(b), ai = this.api.ai(t, S);
    if (!t.ai_ack_at) throw USER('ai_ack', 'Confirm the AI rules first (the box in the «Test from photos» window).');
    const first = this.db.prepare('SELECT page, text, img FROM book_pages WHERE book_id = ? AND page <= ? ORDER BY page').all(b.id, LIMITS.tocPages);
    const parts = [{ text: 'These are the first pages of a school textbook (each page starts with "=== PAGE n ===", n is the page number in the file). ' +
      'Find its table of contents and list the topics a teacher would test separately (paragraphs §, lessons, topics; not the big parts). ' +
      'Return ONLY JSON: {"topics":[{"title":"the title as printed","printed":<the page number printed in the contents>}]}. ' +
      'If there is no table of contents on these pages, return {"topics":[]}.' }];
    let pics = 0;
    first.forEach(r => {
      parts.push({ text: '\n=== PAGE ' + r.page + ' ===\n' + String(r.text || '').slice(0, 6000) });
      if (r.img && pics < LIMITS.genImages) { pics++; parts.push({ inline_data: { mime_type: 'image/jpeg', data: Buffer.from(r.img).toString('base64') } }); }
    });
    this.countAi(t, 'topics');
    const res = await ai.call(JSON.stringify({ contents: [{ parts: parts }], generationConfig: { temperature: 0.1, response_mime_type: 'application/json', maxOutputTokens: 8192 } }));
    let parsed; try { parsed = JSON.parse(gemini.stripFence(res.text)); } catch (e) { throw USER('ai_unreadable', 'The AI reply could not be read. Please try again.'); }
    const items = (parsed && Array.isArray(parsed.topics) ? parsed.topics : []).map(x => ({ title: line(x && x.title, 160), printed: Math.round(Number(x && x.printed)) || 0 })).filter(x => x.title);
    if (!items.length) throw USER('book_no_toc', 'The AI did not find a table of contents in the first pages. Add the topics by hand (title and pages).');
    const all = this.texts(b, 1, b.pages).map(r => r.text);
    const toc = cleanToc(mapPrinted(all, items), b.pages);
    this.db.prepare('UPDATE books SET toc = ?, updated = ? WHERE id = ?').run(JSON.stringify(toc), now(), b.id);
    return this.get(t, b.id);
  }

  subjectFor(b, key) {
    const k = this.api.subjects[key] ? key : this.api.subjects[b.subject] ? b.subject : Object.keys(this.api.subjects)[0];
    return this.api.subjects[k];
  }

  /**
   * «✨ Створити тест»: a NEW draft test in the chosen subject from the pages of the chosen topics.
   * opts: { subject, topics: [index…] or pages: {from, to}, count, langs, note }.
   * The test is saved as the teacher's draft (marked «AI») and opens in the editor; nothing is published.
   */
  async makeTest(t, id, opts) {
    opts = opts || {};
    const b = this.book(t, id), S = this.subjectFor(b, opts.subject), c = S.ctx;
    if (!t.ai_ack_at) throw USER('ai_ack', 'Confirm the AI rules first (the box in the «Test from photos» window).');
    const ai = this.api.ai(t, S), toc = J(b.toc, []);
    let ranges = [], names = [];
    if (Array.isArray(opts.topics) && opts.topics.length) {
      opts.topics.slice(0, 20).forEach(i => { const x = toc[Number(i)]; if (x) { ranges.push([x.from, x.to]); names.push(x.title); } });
    } else if (opts.pages) {
      const f = Math.max(1, Math.round(Number(opts.pages.from)) || 1), e = Math.min(b.pages, Math.round(Number(opts.pages.to)) || f);
      if (e >= f) { ranges.push([f, e]); names.push(b.title + ', с. ' + f + (e > f ? '–' + e : '')); }
    }
    if (!ranges.length) throw USER('book_pick', 'Choose at least one topic (or the pages).');
    const seen = {}, rows = [];
    ranges.forEach(r => this.texts(b, r[0], r[1]).forEach(p => { if (!seen[p.page]) { seen[p.page] = 1; rows.push(p); } }));
    rows.sort((x, y) => x.page - y.page);
    const parts = [null];
    let chars = 0, pics = 0, cut = false;
    for (const r of rows) {
      const txt = String(r.text || '').trim();
      if (txt.length >= 30 || (txt && !r.scan)) {
        if (chars + txt.length > LIMITS.genText) { cut = true; break; }
        chars += txt.length; parts.push({ text: '\n=== PAGE ' + r.page + ' ===\n' + txt });
      } else if (r.scan) {
        if (pics >= LIMITS.genImages) { cut = true; break; }
        const img = this.db.prepare('SELECT img FROM book_pages WHERE book_id = ? AND page = ?').get(b.id, r.page).img;
        pics++; parts.push({ text: '\n=== PAGE ' + r.page + ' (picture) ===' }); parts.push({ inline_data: { mime_type: 'image/jpeg', data: Buffer.from(img).toString('base64') } });
      }
    }
    if (parts.length < 2) throw USER('book_blank', 'These pages have no text. Check the page numbers of the topic.');
    const sl = plain(S.info.langs || S.x.LANGS);
    let langs = (Array.isArray(opts.langs) ? opts.langs : []).filter(l => sl.indexOf(l) >= 0); if (!langs.length) langs = sl.slice();
    const count = Math.min(40, Math.max(3, Math.round(Number(opts.count)) || 10));
    const ins = String(S.x.AI_INSTRUCTIONS || '');
    const spec = (ins.indexOf('Return ONLY JSON') >= 0 ? ins.slice(ins.indexOf('Return ONLY JSON')) : ins)
      .replace(/\s*Keep the original wording[\s\S]*$/, '').replace(/\s*Do not invent exercises[^.]*\./g, '');
    parts[0] = { text: 'You write a NEW school ' + String(S.info.name && (S.info.name.en || S.info.name.uk) || S.key).toUpperCase() + ' test for the topic(s): ' +
      names.map(x => '«' + x + '»').join('; ') + (b.grade ? ' (class ' + b.grade + ')' : '') + '. The material below is the pages of the textbook the school uses. ' + spec +
      ' TEST: make exactly ' + count + ' questions, mostly "mc", plus a few "short", "match" or "fix" where they fit, at most one "open". ' +
      'Every question and its correct answer MUST come from the material below; do not use facts that are not in it. ' +
      'Write the questions in your own short words; never copy long passages of the textbook. Leave out exercises that need a picture. ' +
      'Add to the top-level JSON "sources": [{"n": question number from 1, "page": the PAGE number, "quote": at most 15 words of the material that support the answer}].' +
      c.aiLangRules_(langs) + (opts.note ? '\nExtra instructions from the teacher: ' + c.clean_(opts.note, 400) : '') };
    this.countAi(t, 'test');
    const res = await ai.call(JSON.stringify({ contents: [{ parts: parts }], generationConfig: { temperature: 0.3, response_mime_type: 'application/json', maxOutputTokens: 16384 } }));
    let parsed; try { parsed = JSON.parse(gemini.stripFence(res.text)); } catch (e) { throw USER('ai_unreadable', 'The AI reply could not be read. Please try again.'); }
    if (!parsed || typeof parsed !== 'object') throw USER('ai_unreadable', 'The AI reply could not be read. Please try again.');
    const sources = (Array.isArray(parsed.sources) ? parsed.sources : []).slice(0, 60).map(x => ({ n: Math.round(Number(x && x.n)) || 0, page: Math.round(Number(x && x.page)) || 0, quote: line(x && x.quote, 200) }))
      .filter(x => x.n && x.page && seen[x.page]);
    delete parsed.sources;
    parsed.langs = S.info.mode === 'translate' ? ['en'] : langs;
    parsed.allowTranslate = S.info.mode === 'translate';
    const title = (names.length === 1 ? names[0] : b.title + ': ' + names.length + ' теми').slice(0, 140);
    parsed.title = {}; parsed.langs.forEach(l => { parsed.title[l] = title; });   // the topic's name, not the AI's
    const content = c.normContent_(parsed);
    if (c.countQ_(content) === 0) throw USER('ai_empty', 'The AI made no questions. Try other pages or fewer questions.');
    const saved = await this.api.saveTest(t, S, '', title, '', Object.assign(plain(content), { source: 'ai' }), null);   // marked «AI» in the library
    audit(this.db, t.email, 'book.test', '#' + b.id + ' → ' + S.key + '/' + saved.id, this.ip || '');
    return plain({ ok: true, id: saved.id, subject: S.key, model: res.model, questions: c.countQ_(content), cut: cut, pages: rows.length,
      sources: sources, warnings: c.contentWarnings_(content) });
  }
}

const FNS = ['list', 'get', 'create', 'addPages', 'finish', 'update', 'remove', 'pages', 'findTopics', 'makeTest'];

module.exports = { Books, FNS, LIMITS, cleanToc, tocFromText, mapPrinted };
