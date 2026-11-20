'use strict';
// © Платон Вороний. All rights reserved. See LICENSE.
// A small Markdown → HTML converter for the legal pages (headings, paragraphs, lists, tables, quotes, bold/italic,
// code, links). The texts are ours, but everything is escaped anyway; only http(s), mailto and local links are kept.

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inline(s) {
  let h = esc(s);
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => /^(https?:|mailto:|\/(?!\/)|#)/.test(u.replace(/&amp;/g, '&')) ? '<a href="' + u + '">' + t + '</a>' : t);
  h = h.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[\s(«])\*([^*\s][^*]*)\*/g, '$1<i>$2</i>');
  return h;
}

function render(md) {
  const lines = String(md).replace(/\r/g, '').split('\n'), out = [];
  let i = 0;
  const isTable = l => /^\s*\|.*\|\s*$/.test(l);
  const cells = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = /^(#{1,4})\s+(.*)$/.exec(l))) { const n = Math.min(m[1].length + 1, 4); const num = /^(\d+[а-яa-z]?)\.\s/.exec(m[2]);   // «## 6а. …» → id="6а", so /legal/terms#6а jumps to it
      out.push('<h' + n + (num ? ' id="' + num[1] + '"' : '') + '>' + inline(m[2]) + '</h' + n + '>'); i++; continue; }
    if (/^\s*(---|\*\*\*)\s*$/.test(l)) { out.push('<hr>'); i++; continue; }
    if (isTable(l) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const head = cells(l); i += 2; const rows = [];
      while (i < lines.length && isTable(lines[i])) rows.push(cells(lines[i++]));
      out.push('<div class="tbl-wrap"><table class="tbl"><thead><tr>' + head.map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>' +
        rows.map(r => '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>');
      continue;
    }
    if (/^\s*>/.test(l)) {
      const q = []; while (i < lines.length && /^\s*>/.test(lines[i])) q.push(lines[i++].replace(/^\s*>\s?/, ''));
      out.push('<blockquote>' + render(q.join('\n')) + '</blockquote>'); continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(l)) {
      const ord = /^\s*\d+\./.test(l), items = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        let it = lines[i++].replace(/^\s*([-*]|\d+\.)\s+/, '');
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*]|\d+\.)\s+/.test(lines[i])) it += ' ' + lines[i++].trim();
        items.push('<li>' + inline(it) + '</li>');
      }
      out.push((ord ? '<ol>' : '<ul>') + items.join('') + (ord ? '</ol>' : '</ul>')); continue;
    }
    const p = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|\s*>|\s*([-*]|\d+\.)\s+|\s*---\s*$)/.test(lines[i]) && !isTable(lines[i])) p.push(lines[i++].trim());
    out.push('<p>' + p.map(inline).join('<br>') + '</p>');
  }
  return out.join('\n');
}

module.exports = { render, esc };
