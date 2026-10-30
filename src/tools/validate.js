#!/usr/bin/env node
// Проверка файлов данных: node tools/validate.js [файлы...] (по умолчанию все data/*.js)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
let files = process.argv.slice(2);
if (!files.length) {
  files = fs.readdirSync(path.join(root, 'data'))
    .filter(f => f.endsWith('.js') && f !== '_init.js')
    .map(f => path.join('data', f));
}

const LV = ['A1', 'A2', 'B1', 'B2', 'C1'];
const TT = ['n', 'v', 'adj', 'adv', 'phr', 'other'];
let errors = 0, warnings = 0;
const err = (f, m) => { errors++; console.log(`  ✗ ${f}: ${m}`); };
const warn = (f, m) => { warnings++; console.log(`  ! ${f}: ${m}`); };
const str = v => typeof v === 'string' && v.trim().length > 0;

function load(file) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'data/_init.js'), 'utf8'), ctx);
  ctx.DE = ctx.window.DE;
  vm.runInContext(fs.readFileSync(path.resolve(root, file), 'utf8'), ctx, { filename: file });
  return ctx.DE;
}

function checkChoice(f, x, where, needExplain) {
  if (!Array.isArray(x.options) || x.options.length < 2) return err(f, `${where}: options`);
  if (needExplain && !str(x.explain)) err(f, `${where}: нет explain`);
  if (!Number.isInteger(x.a) || x.a < 0 || x.a >= x.options.length) err(f, `${where}: a вне диапазона`);
  if (new Set(x.options).size !== x.options.length) err(f, `${where}: дубли в options`);
  if (!str(x.q)) err(f, `${where}: нет q`);
}

const ids = {};
const totals = {};
for (const file of files) {
  let DE;
  try { DE = load(file); } catch (e) { err(file, 'синтаксис: ' + e.message); continue; }
  const f = path.basename(file);
  for (const k of Object.keys(DE)) totals[k] = (totals[k] || 0) + DE[k].length;
  const uid = (kind, id) => {
    const key = kind + ':' + id;
    if (ids[key]) err(f, `дубликат id ${key} (также в ${ids[key]})`);
    ids[key] = f;
  };

  DE.topics.forEach(t => {
    const w0 = `topic ${t.id}`;
    if (!str(t.id) || !str(t.title) || !str(t.emoji)) err(f, `${w0}: id/title/emoji`);
    uid('topic', t.id);
    if (!LV.includes(t.level)) err(f, `${w0}: level`);
    if (!Array.isArray(t.words) || t.words.length < 20) err(f, `${w0}: мало слов (${t.words && t.words.length})`);
    else {
      const cnt = {}; t.words.forEach(w => cnt[w.lvl] = (cnt[w.lvl] || 0) + 1);
      const top = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
      if (top !== t.level) warn(f, `${w0}: level=${t.level}, а больше всего слов уровня ${top} (${JSON.stringify(cnt)})`);
    }
    const seen = new Set();
    (t.words || []).forEach((w, i) => {
      const wh = `${w0} #${i} ${w.de}`;
      if (!str(w.de) || !str(w.ru)) err(f, `${wh}: de/ru`);
      if (seen.has(w.de)) err(f, `${wh}: дубликат`);
      seen.add(w.de);
      if (!TT.includes(w.t)) err(f, `${wh}: t=${w.t}`);
      if (!LV.includes(w.lvl)) err(f, `${wh}: lvl`);
      if (!str(w.ex) || !str(w.exRu)) err(f, `${wh}: нет примера`);
      if (w.alt !== undefined && (!Array.isArray(w.alt) || !w.alt.every(str))) err(f, `${wh}: alt должен быть массивом строк`);
      if (w.t === 'n') {
        if (!/^(der|die|das) \S/.test(w.de)) err(f, `${wh}: существительное без артикля`);
        if (!str(w.pl)) err(f, `${wh}: нет pl`);
        else if (w.pl !== '-' && !/^die \S/.test(w.pl)) warn(f, `${wh}: pl без "die": ${w.pl}`);
      }
    });
  });

  DE.grammar.forEach(g => {
    const w0 = `grammar ${g.id}`;
    uid('grammar', g.id);
    if (!str(g.title) || !str(g.content) || !str(g.summary)) err(f, `${w0}: title/content/summary`);
    if (!LV.includes(g.level)) err(f, `${w0}: level`);
    if (!Array.isArray(g.exercises) || g.exercises.length < 6) err(f, `${w0}: мало упражнений`);
    (g.exercises || []).forEach((x, i) => {
      const wh = `${w0} ex#${i}`;
      if (x.type === 'choice') checkChoice(f, x, wh, true);
      else if (x.type === 'input') { if (!str(x.q) || !Array.isArray(x.a) || !x.a.length) err(f, `${wh}: input`); if (!str(x.explain)) err(f, `${wh}: нет explain`); }
      else if (x.type === 'order') {
        if (!Array.isArray(x.words) || x.words.length < 2 || !str(x.ru)) err(f, `${wh}: order`);
        if (!str(x.explain)) err(f, `${wh}: нет explain`);
        (x.alts || []).forEach((alt, k) => {
          if (!Array.isArray(alt) || alt.slice().sort().join('|') !== x.words.slice().sort().join('|')) err(f, `${wh}: alts[${k}] должен состоять из тех же слов`);
        });
      }
      else err(f, `${wh}: type=${x.type}`);
    });
    const tags = (g.content.match(/<\/?([a-z0-9]+)/gi) || []).map(t => t.replace(/[<\/]/g, '').toLowerCase());
    const ok = ['p','b','i','u','br','ul','ol','li','table','tr','th','td','h3','h4','div','span','thead','tbody','em','strong','small','sup'];
    tags.forEach(t => { if (!ok.includes(t)) warn(f, `${w0}: тег <${t}>`); });
  });

  DE.tests.forEach((x, i) => {
    const wh = `test #${i}`;
    checkChoice(f, x, wh, true);
    if (!LV.includes(x.lvl)) err(f, `${wh}: lvl`);
    if (x.options && x.options.length !== 4) err(f, `${wh}: нужно 4 варианта`);
  });

  DE.verbs.forEach(v => {
    const wh = `verb ${v.inf}`;
    uid('verb', v.inf);
    if (!str(v.ru) || !LV.includes(v.lvl)) err(f, `${wh}: ru/lvl`);
    if (!Array.isArray(v.praes) || v.praes.length !== 6) err(f, `${wh}: praes`);
    if (!Array.isArray(v.praet) || v.praet.length !== 6) err(f, `${wh}: praet`);
    if (!/^(hat|ist|hat\/ist|ist\/hat) /.test(v.perf || '')) err(f, `${wh}: perf "${v.perf}"`);
    if (!str(v.ex)) err(f, `${wh}: ex`);
  });

  DE.dialogues.forEach(d => {
    const wh = `dialogue ${d.id}`;
    uid('dialogue', d.id);
    if (!Array.isArray(d.lines) || d.lines.length < 6) err(f, `${wh}: lines`);
    (d.lines || []).forEach((l, i) => { if (!str(l.s) || !str(l.de) || !str(l.ru)) err(f, `${wh} line#${i}`); });
    (d.quiz || []).forEach((q, i) => checkChoice(f, q, `${wh} quiz#${i}`, true));
    if (!LV.includes(d.lvl)) err(f, `${wh}: lvl`);
  });

  DE.phrases.forEach(p => {
    const wh = `phrases ${p.id}`;
    uid('phrases', p.id);
    if (!Array.isArray(p.items) || p.items.length < 10) err(f, `${wh}: items`);
    (p.items || []).forEach((l, i) => { if (!str(l.de) || !str(l.ru)) err(f, `${wh} #${i}`); });
    if (!LV.includes(p.lvl)) err(f, `${wh}: lvl`);
  });

  DE.reading.forEach(r => {
    const wh = `reading ${r.id}`;
    uid('reading', r.id);
    if (!str(r.text) || !str(r.title)) err(f, `${wh}: text/title`);
    if (!LV.includes(r.lvl)) err(f, `${wh}: lvl`);
    (r.questions || []).forEach((q, i) => checkChoice(f, q, `${wh} q#${i}`, true));
    if (!r.questions || r.questions.length < 3) err(f, `${wh}: мало вопросов`);
  });
}

console.log('Итого:', JSON.stringify(totals));
console.log(errors ? `ОШИБОК: ${errors}` : 'Ошибок нет ✓', warnings ? `, предупреждений: ${warnings}` : '');
process.exit(errors ? 1 : 0);
