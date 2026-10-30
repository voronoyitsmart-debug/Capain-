// Общие утилиты
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const sample = (a, n) => shuffle(a).slice(0, n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uniq = a => Array.from(new Set(a));
const DAY = 86400000;

function dayKey(d = new Date()) {
  const z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }

// Нормализация ответа: регистр, пробелы, конечная пунктуация, типографские кавычки
function norm(s) {
  return String(s || '').toLowerCase().replace(/[’`´]/g, "'").replace(/[„“”«»"]/g, '')
    .replace(/[.!?,;:…¿¡]+/g, ' ').replace(/\s+/g, ' ').trim();
}
// Замены для тех, у кого нет немецкой раскладки
function deUmlaut(s) { return s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss'); }
function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
// Проверка ввода: 'ok' | 'umlaut' (ae вместо ä) | 'noumlaut' (умлаут пропущен) | 'typo' | 'bad'.
// strict — без скидки на опечатки (грамматика и спряжение: там одна буква и есть суть задания)
const plainUml = s => s.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss');
function checkAnswer(input, answers, strict) {
  const x = norm(input);
  if (!x) return 'bad';
  const list = answers.map(norm);
  if (list.includes(x)) return 'ok';
  if (list.some(a => deUmlaut(a) === deUmlaut(x))) return 'umlaut';
  if (list.some(a => /[äöü]/.test(a) && plainUml(a) === plainUml(x))) return 'noumlaut';
  if (!strict && list.some(a => a.length > 4 && lev(a, x) === 1)) return 'typo';
  return 'bad';
}

const ART = { der: 'der', die: 'die', das: 'das' };
function splitArticle(de) {
  const m = /^(der|die|das) (.+)$/.exec(de);
  return m ? { art: m[1], lemma: m[2] } : { art: '', lemma: de };
}
function artClass(de) { const a = splitArticle(de).art; return a ? 'a-' + a : ''; }
// Слово с цветным артиклем
function deHTML(w) {
  if (w.t === 'n') {
    const { art, lemma } = splitArticle(w.de);
    if (art) return `<span class="art a-${art}">${art}</span> ${esc(lemma)}`;
  }
  return esc(w.de);
}
function plural(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const LEVEL_NAMES = { A1: 'Начальный', A2: 'Элементарный', B1: 'Средний', B2: 'Выше среднего', C1: 'Продвинутый' };
