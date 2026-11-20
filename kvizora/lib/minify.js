'use strict';
// © Платон Вороний. All rights reserved. See LICENSE.
// What the browser gets is minified: scripts (files and those inside the pages) are compressed and their local names
// shortened, comments are dropped, no source maps. The logic that matters (answers, grading, accounts) never leaves
// the server anyway. MINIFY=0 turns this off (for debugging).
const { minify } = require('terser');

const OPTS = { compress: { passes: 2, evaluate: false, reduce_vars: false, collapse_vars: false, conditionals: false, dead_code: false, booleans: false, comparisons: false }, mangle: true, format: { comments: false, quote_style: 3 }, sourceMap: false };

async function js(code) {
  const out = await minify(code, OPTS);
  return out.code;
}
/** Minify every inline <script> of a page and drop HTML comments. Placeholders the server fills in later stay as they are. */
async function html(page) {
  const parts = [], re = /<script>([\s\S]*?)<\/script>/g;
  let last = 0, m;
  while ((m = re.exec(page))) {
    parts.push(page.slice(last, m.index));
    parts.push('<script>' + (await js(m[1])) + '</script>');
    last = re.lastIndex;
  }
  parts.push(page.slice(last));
  return parts.join('').replace(/<!--(?!\[)[\s\S]*?-->/g, '');
}

module.exports = { js, html };
