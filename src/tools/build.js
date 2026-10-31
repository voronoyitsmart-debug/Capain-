#!/usr/bin/env node
// Сборка сайтов: один код, разные языки.
//   немецкий  → корень репозитория (его публикует GitHub Pages)
//   румынский → папка ro/
// node tools/build.js [de|ro] [путь для однофайловой версии]
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(root, f), 'utf8');

const LANGS = {
  de: { data: 'data', lang: 'lang/de.js', out: '..', icons: 'icons', prefix: 'deutsch', exclude: ['ro/'],
    title: 'Deutsch Tag für Tag', short: 'Deutsch', desc: 'Немецкий язык каждый день: слова, грамматика, тесты A1–C1', bg: '#f2f3f6' },
  ro: { data: 'data-ro', lang: 'lang/ro.js', out: '../ro', icons: 'icons-ro', prefix: 'romana', exclude: [],
    title: 'Română zi de zi', short: 'Română', desc: 'Румынский язык каждый день: слова, грамматика, тесты A1–C1', bg: '#f2f3f6' }
};
const JS = ['util', 'LANG', 'store', 'speech', 'icons', 'content', 'adapt', 'explain', 'modes', 'ui', 'engine', 'ach', 'train', 'screens', 'app'];
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600&family=Jost:wght@500;600;700&display=swap">';
const OUTPUTS = ['index.html', 'app.js', 'app.css', 'data.js', 'sw.js', 'manifest.webmanifest', 'icons', '.nojekyll'];

function build(code, singlePath) {
  const cfg = LANGS[code];
  if (!fs.existsSync(path.join(root, cfg.lang))) { console.log(`skip ${code}: нет ${cfg.lang}`); return; }
  const dist = path.join(root, cfg.out);
  fs.mkdirSync(dist, { recursive: true });
  for (const f of OUTPUTS) fs.rmSync(path.join(dist, f), { recursive: true, force: true });
  fs.mkdirSync(path.join(dist, 'icons'), { recursive: true });

  const dataFiles = [cfg.data + '/_init.js'].concat(fs.readdirSync(path.join(root, cfg.data)).filter(f => f.endsWith('.js') && f !== '_init.js').sort().map(f => cfg.data + '/' + f));
  const data = dataFiles.map(f => `/* ${f} */\n` + rd(f)).join('\n');
  const app = JS.map(f => f === 'LANG' ? cfg.lang : `js/${f}.js`).map(f => `/* ${f} */\n` + rd(f)).join('\n');
  const css = rd('css/app.css');
  const shell = rd('tools/shell.html').replace('{{BRAND}}', cfg.title).replace('{{FLAG}}', code);
  const ver = crypto.createHash('sha1').update(data + app + css + shell).digest('hex').slice(0, 10);

  fs.writeFileSync(path.join(dist, 'data.js'), data);
  fs.writeFileSync(path.join(dist, 'app.js'), app);
  fs.writeFileSync(path.join(dist, 'app.css'), css);
  for (const f of fs.readdirSync(path.join(root, cfg.icons))) fs.copyFileSync(path.join(root, cfg.icons, f), path.join(dist, 'icons', f));
  fs.writeFileSync(path.join(dist, 'manifest.webmanifest'), JSON.stringify({
    name: cfg.title, short_name: cfg.short, description: cfg.desc, lang: 'ru', start_url: './index.html', scope: './',
    display: 'standalone', orientation: 'portrait', background_color: cfg.bg, theme_color: cfg.bg,
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  }, null, 2));

  const index = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${cfg.title}</title>
<meta name="description" content="${cfg.desc}">
<meta name="theme-color" content="${cfg.bg}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="${cfg.short}">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<link rel="icon" type="image/png" href="icons/favicon.png">
<link rel="manifest" href="manifest.webmanifest">
${FONTS}
<link rel="stylesheet" href="app.css?v=${ver}">
<style>body{padding-top:env(safe-area-inset-top,0px)}</style>
</head>
<body>
${shell}
<script src="data.js?v=${ver}"></script>
<script src="app.js?v=${ver}"></script>
<script>if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(function () {});</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(dist, 'index.html'), index);
  const assets = ['./', 'index.html', `app.css?v=${ver}`, `data.js?v=${ver}`, `app.js?v=${ver}`, 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon.png'];
  fs.writeFileSync(path.join(dist, 'sw.js'), rd('sw.js').replace('__PREFIX__', cfg.prefix).replace('__VERSION__', ver)
    .replace('__ASSETS__', JSON.stringify(assets)).replace('__EXCLUDE__', JSON.stringify(cfg.exclude)));
  fs.writeFileSync(path.join(dist, '.nojekyll'), '');

  // Один файл без <html>/<head> (для публикации как страницы на claude.ai)
  const safe = s => s.replace(/<\/script/gi, '<\\/script');
  const single = `<title>${cfg.title}</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n${FONTS}\n<style>\n${css}\n</style>\n${shell}\n<script>\n${safe(data)}\n</script>\n<script>\n${safe(app)}\n</script>\n`;
  const out = singlePath || path.join(root, '..', 'build', `single-${code}.html`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, single);
  console.log(`build ${code} ${ver} → ${path.relative(path.join(root, '..'), dist) || '.'}  (${(single.length / 1024 / 1024).toFixed(2)} MB)`);
}

const want = process.argv[2] && LANGS[process.argv[2]] ? [process.argv[2]] : Object.keys(LANGS);
for (const code of want) build(code, want.length === 1 ? process.argv[3] : null);
