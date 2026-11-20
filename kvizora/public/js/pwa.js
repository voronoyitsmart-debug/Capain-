// © Платон Вороний. All rights reserved. See LICENSE.
// Kvizora on a phone: the service worker (needed to add the app to the home screen) and an «install» button where the
// browser offers it (Android / desktop Chrome, Edge). On iPhone: Safari → Share → «На екран “Додому”».
(function () {
  'use strict';
  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  }
  if (/^\/t\//.test(location.pathname)) return;   // nothing extra during a test
  var standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone) { document.documentElement.classList.add('standalone'); return; }
  var dismissed = false; try { dismissed = localStorage.getItem('kvizora-install-off') === '1'; } catch (e) {}
  if (dismissed) return;
  window.addEventListener('beforeinstallprompt', function (ev) {
    ev.preventDefault();
    var bar = document.createElement('div'); bar.className = 'installbar';
    var b = document.createElement('button'); b.type = 'button'; b.className = 'btn solid sm'; b.textContent = '📲 Додати Kvizora на екран';
    var x = document.createElement('button'); x.type = 'button'; x.className = 'btn sm'; x.textContent = '✕'; x.setAttribute('aria-label', 'Закрити');
    b.onclick = function () { ev.prompt(); ev.userChoice.then(function () { bar.remove(); }); };
    x.onclick = function () { bar.remove(); try { localStorage.setItem('kvizora-install-off', '1'); } catch (e) {} };
    bar.appendChild(b); bar.appendChild(x); document.body.appendChild(bar);
  });
})();
