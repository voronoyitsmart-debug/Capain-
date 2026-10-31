#!/usr/bin/env node
// Сборка приложения Capain в корень репозитория (его публикует GitHub Pages):
// общий код + языковые пакеты, данные каждого языка — отдельным файлом data-<код>.js.
// node tools/build.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(root, f), 'utf8');

// Одно приложение «Capain» с выбором языка при входе. Данные каждого языка — отдельный файл,
// загружается только выбранный. Старый адрес ro/ перенаправляет в общее приложение.
const LANG_CODES = ['de', 'ro'];
const DATA_DIR = { de: 'data', ro: 'data-ro' };
const APP = { title: 'Capain', short: 'Capain', desc: 'Немецкий и румынский каждый день: слова, грамматика, тесты A1–C1', bg: '#f2f3f6', prefix: 'capain', legacy: ['deutsch', 'romana'] };
const JS = ['js/util.js'].concat(LANG_CODES.map(c => `lang/${c}.js`), ['store', 'speech', 'icons', 'content', 'adapt', 'explain', 'modes', 'ui', 'engine', 'ach', 'train', 'screens', 'app', 'boot'].map(f => `js/${f}.js`));
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600&family=Jost:wght@500;600;700&display=swap">';
const OUTPUTS = ['index.html', 'app.js', 'app.css', 'data.js', 'sw.js', 'manifest.webmanifest', 'icons', '.nojekyll'].concat(LANG_CODES.map(c => `data-${c}.js`));

function readData(dir) {
  const files = [dir + '/_init.js'].concat(fs.readdirSync(path.join(root, dir)).filter(f => f.endsWith('.js') && f !== '_init.js').sort().map(f => dir + '/' + f));
  return files.map(f => `/* ${f} */\n` + rd(f)).join('\n');
}

function build() {
  const dist = path.join(root, '..');
  for (const f of OUTPUTS) fs.rmSync(path.join(dist, f), { recursive: true, force: true });
  fs.mkdirSync(path.join(dist, 'icons'), { recursive: true });
  const data = {};
  LANG_CODES.forEach(c => { data[c] = readData(DATA_DIR[c]); });
  const app = JS.map(f => `/* ${f} */\n` + rd(f)).join('\n');
  const css = rd('css/app.css');
  const shell = rd('tools/shell.html');
  const ver = crypto.createHash('sha1').update(Object.values(data).join('') + app + css + shell).digest('hex').slice(0, 10);

  LANG_CODES.forEach(c => fs.writeFileSync(path.join(dist, `data-${c}.js`), data[c]));
  fs.writeFileSync(path.join(dist, 'app.js'), app);
  fs.writeFileSync(path.join(dist, 'app.css'), css);
  for (const f of fs.readdirSync(path.join(root, 'icons'))) fs.copyFileSync(path.join(root, 'icons', f), path.join(dist, 'icons', f));
  fs.writeFileSync(path.join(dist, 'manifest.webmanifest'), JSON.stringify({
    name: APP.title, short_name: APP.short, description: APP.desc, lang: 'ru', start_url: './index.html', scope: './',
    display: 'standalone', orientation: 'portrait', background_color: APP.bg, theme_color: APP.bg,
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  }, null, 2));
  fs.writeFileSync(path.join(dist, 'index.html'), `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${APP.title}</title>
<meta name="description" content="${APP.desc}">
<meta name="theme-color" content="${APP.bg}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="${APP.short}">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<link rel="icon" type="image/png" href="icons/favicon.png">
<link rel="manifest" href="manifest.webmanifest">
${FONTS}
<link rel="stylesheet" href="app.css?v=${ver}">
<style>body{padding-top:env(safe-area-inset-top,0px)}</style>
</head>
<body>
${shell}
<script>window.CAPAIN_VER = '${ver}';</script>
<script src="app.js?v=${ver}"></script>
<script>if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(function () {});</script>
</body>
</html>
`);
  const assets = ['./', 'index.html', `app.css?v=${ver}`, `app.js?v=${ver}`, 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon.png']
    .concat(LANG_CODES.map(c => `data-${c}.js?v=${ver}`));
  fs.writeFileSync(path.join(dist, 'sw.js'), rd('sw.js').replace('__PREFIX__', APP.prefix).replace('__VERSION__', ver)
    .replace('__ASSETS__', JSON.stringify(assets)).replace('__EXCLUDE__', JSON.stringify(['ro/'])).replace('__LEGACY__', JSON.stringify(APP.legacy)));
  fs.writeFileSync(path.join(dist, '.nojekyll'), '');

  // старый адрес румынского приложения: убрать его офлайн-кэш и открыть общее приложение на румынском
  const ro = path.join(dist, 'ro');
  fs.rmSync(ro, { recursive: true, force: true });
  fs.mkdirSync(ro, { recursive: true });
  fs.writeFileSync(path.join(ro, 'index.html'), `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Capain</title><meta http-equiv="refresh" content="2; url=../?lang=ro"></head>
<body style="font-family:-apple-system,system-ui,sans-serif;padding:24px">
<p>Румынский теперь внутри общего приложения Capain. Открываем…</p>
<script>
(async function () {
  try {
    if ('serviceWorker' in navigator) for (const r of await navigator.serviceWorker.getRegistrations()) if (/\\/ro\\/$/.test(r.scope)) await r.unregister();
    if (window.caches) for (const k of await caches.keys()) if (k.startsWith('romana-')) await caches.delete(k);
  } catch (e) {}
  location.replace('../?lang=ro');
})();
</script></body></html>
`);
  // пустой sw.js на старом адресе: старый работник, если ещё жив, заменится этим и ничего не кэширует
  fs.writeFileSync(path.join(ro, 'sw.js'), "self.addEventListener('install', () => self.skipWaiting());\nself.addEventListener('activate', e => e.waitUntil(self.registration.unregister()));\n");
  console.log(`build capain ${ver}  (app ${(app.length / 1024).toFixed(0)} KB, ${LANG_CODES.map(c => `${c} ${(data[c].length / 1024).toFixed(0)} KB`).join(', ')})`);
}

build();
