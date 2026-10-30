#!/usr/bin/env node
// Сборка: готовый сайт в корень репозитория (его публикует GitHub Pages)
// и однофайловая версия (путь — первым аргументом)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(root, f), 'utf8');
const dist = path.join(root, '..');
// удаляем только то, что создаёт сборка: исходники в src/ не трогаем
for (const f of ['index.html', 'app.js', 'app.css', 'data.js', 'sw.js', 'manifest.webmanifest', 'icons']) fs.rmSync(path.join(dist, f), { recursive: true, force: true });
fs.mkdirSync(path.join(dist, 'icons'), { recursive: true });

const JS = ['util', 'store', 'speech', 'icons', 'content', 'adapt', 'explain', 'modes', 'ui', 'engine', 'ach', 'train', 'screens', 'app'].map(f => `js/${f}.js`);
const dataFiles = ['data/_init.js'].concat(fs.readdirSync(path.join(root, 'data')).filter(f => f.endsWith('.js') && f !== '_init.js').sort().map(f => 'data/' + f));
const data = dataFiles.map(f => `/* ${f} */\n` + rd(f)).join('\n');
const app = JS.map(f => `/* ${f} */\n` + rd(f)).join('\n');
const css = rd('css/app.css');
const shell = rd('tools/shell.html');
const ver = require('crypto').createHash('sha1').update(data + app + css + shell).digest('hex').slice(0, 10);
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600&family=Jost:wght@500;600;700&display=swap">';
const TITLE = 'Deutsch Tag für Tag';

fs.writeFileSync(path.join(dist, 'data.js'), data);
fs.writeFileSync(path.join(dist, 'app.js'), app);
fs.writeFileSync(path.join(dist, 'app.css'), css);
for (const f of fs.readdirSync(path.join(root, 'icons'))) fs.copyFileSync(path.join(root, 'icons', f), path.join(dist, 'icons', f));
fs.copyFileSync(path.join(root, 'manifest.webmanifest'), path.join(dist, 'manifest.webmanifest'));

// PWA
const index = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${TITLE}</title>
<meta name="description" content="Немецкий язык каждый день: слова, грамматика, тесты A1–C1">
<meta name="theme-color" content="#f2f3f6">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Deutsch">
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
fs.writeFileSync(path.join(dist, 'sw.js'), rd('sw.js').replace('__VERSION__', ver).replace('__ASSETS__', JSON.stringify(['./', 'index.html', `app.css?v=${ver}`, `data.js?v=${ver}`, `app.js?v=${ver}`, 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon.png'])));
fs.writeFileSync(path.join(dist, '.nojekyll'), '');

// Один файл для Artifact (без <html>/<head>: обёртка добавляется при публикации)
const safe = s => s.replace(/<\/script/gi, '<\\/script');
const artifact = `<title>${TITLE}</title>
<meta name="claude:viewport-fit-sides" content="cover">
${FONTS}
<style>
${css}
</style>
${shell}
<script>
${safe(data)}
</script>
<script>
${safe(app)}
</script>
`;
const out = process.argv[2] || path.join(root, '..', 'build', 'single.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, artifact);
console.log('build', ver, 'artifact', (artifact.length / 1024 / 1024).toFixed(2) + ' MB');
