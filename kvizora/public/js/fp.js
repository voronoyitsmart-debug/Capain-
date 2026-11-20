// © Платон Вороний. All rights reserved. See LICENSE.
// Device fingerprint: a few properties of the browser and the machine, sent with "Start".
// It is a signal for the teacher (the same device again under another name), not proof:
// identical school computers can look the same, and a determined student can change it.
(function () {
  'use strict';
  function h(s) {   // short non-crypto hash, only to keep the canvas/fonts values small (the server hashes everything again)
    var x = 2166136261; s = String(s);
    for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; }
    return x.toString(16);
  }
  function canvasHash() {
    try {
      var c = document.createElement('canvas'); c.width = 240; c.height = 60;
      var g = c.getContext('2d'); if (!g) return '';
      g.textBaseline = 'top'; g.font = '16px Arial'; g.fillStyle = '#f60'; g.fillRect(100, 1, 62, 20);
      g.fillStyle = '#069'; g.fillText('Тест ✓ Test 0123 ∑', 2, 15);
      g.fillStyle = 'rgba(102, 204, 0, 0.7)'; g.font = '18px Times New Roman'; g.fillText('Тест ✓ Test 0123 ∑', 4, 35);
      g.beginPath(); g.arc(50, 30, 20, 0, Math.PI * 2); g.stroke();
      return h(c.toDataURL());
    } catch (e) { return ''; }
  }
  function webgl() {
    try {
      var c = document.createElement('canvas'), gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) return { r: '', v: '' };
      var d = gl.getExtension('WEBGL_debug_renderer_info');
      return { r: String(d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)), v: String(d ? gl.getParameter(d.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR)) };
    } catch (e) { return { r: '', v: '' }; }
  }
  // font enumeration and audio fingerprinting were removed on purpose: they are the most "tracking" signals and add
  // little over canvas + webgl + screen (data minimisation, Закон № 2297-VI ст.6 / GDPR art.5). The device link still
  // rests on the browser cookie (dev_id), IP and the remaining fingerprint.
  var fp = {};
  try {
    var n = navigator, s = screen, gl = webgl();
    fp = {
      ua: n.userAgent, platform: n.platform || '', lang: n.language || '', langs: (n.languages || []).join(','),
      tz: (Intl.DateTimeFormat().resolvedOptions().timeZone || ''), tzo: String(new Date().getTimezoneOffset()),
      screen: s.width + 'x' + s.height, avail: s.availWidth + 'x' + s.availHeight, depth: String(s.colorDepth), dpr: String(window.devicePixelRatio || 1),
      cores: String(n.hardwareConcurrency || ''), mem: String(n.deviceMemory || ''), touch: String(n.maxTouchPoints || 0),
      canvas: canvasHash(), webgl: gl.r, webglv: gl.v, cookies: String(n.cookieEnabled)
    };
  } catch (e) {}
  window.__FP = fp;
})();
