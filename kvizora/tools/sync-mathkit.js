'use strict';
// © Платон Вороний. All rights reserved. See LICENSE.
// MathKit lives once, at the end of core/Code.gs (between the MATHKIT BEGIN / END lines).
// The pages need the same code (formula preview, roots in the editor, calculator, graphs):
// this copies the block into core/Student.html and core/Teacher.html.
//   node tools/sync-mathkit.js <core dir>          copy
//   node tools/sync-mathkit.js <core dir> --check  only check the copies are the same (exit 1 if not)
const fs = require('fs');
const path = require('path');
const dir = process.argv[2] || path.join(__dirname, '..', 'core');
const check = process.argv.includes('--check');
const BEGIN = '// ==== MATHKIT BEGIN', END = '// ==== MATHKIT END ====';
function block(src, file) {
  const a = src.indexOf(BEGIN), b = src.indexOf(END);
  if (a < 0 || b < a) return null;
  return src.slice(a, b + END.length);
}
const code = fs.readFileSync(path.join(dir, 'Code.gs'), 'utf8');
const mk = block(code);
if (!mk) { console.error('No MathKit block in Code.gs'); process.exit(1); }
let bad = 0;
['Student.html', 'Teacher.html'].forEach(f => {
  const p = path.join(dir, f); let src = fs.readFileSync(p, 'utf8');
  const cur = block(src);
  if (check) { if (cur !== mk) { console.error(f + ': MathKit differs from Code.gs'); bad++; } return; }
  if (cur) src = src.replace(cur, () => mk);
  else {   // first time: its own <script> right before the page's main script
    const at = src.indexOf('<script>\nvar ');
    if (at < 0) throw new Error(f + ': no place for MathKit');
    src = src.slice(0, at) + '<script>\n' + mk + '\n</script>\n' + src.slice(at);
  }
  fs.writeFileSync(p, src);
});
if (check) { if (bad) process.exit(1); console.log('OK: MathKit is the same in Code.gs, Student.html, Teacher.html'); }
else console.log('MathKit copied into Student.html and Teacher.html');
