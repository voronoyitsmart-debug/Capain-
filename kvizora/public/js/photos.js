// © Kvizora. All rights reserved. See LICENSE.
// Photos for «🎓 Навчання»: the browser shrinks a picture and draws it anew as a JPEG (no place, camera or time inside),
// so only a small clean file goes to the server (which checks and cleans it again).
(function () {
  'use strict';
  function load(file) {
    return new Promise(function (ok, fail) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () { ok(img); setTimeout(function () { URL.revokeObjectURL(url); }, 1000); };
      img.onerror = function () { URL.revokeObjectURL(url); fail(new Error('Це не фото. Оберіть знімок (JPEG чи PNG).')); };
      img.src = url;
    });
  }
  function draw(img, side, q) {
    var w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, side / Math.max(w, h));
    var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
    var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', q);
  }
  /** A File → 'data:image/jpeg;base64,…' under ~1 MB. */
  window.kvPhoto = function (file) {
    return load(file).then(function (img) {
      var tries = [[1600, 0.82], [1400, 0.72], [1200, 0.62], [1000, 0.55]];
      for (var i = 0; i < tries.length; i++) { var d = draw(img, tries[i][0], tries[i][1]); if (d.length * 0.75 < 950 * 1024) return d; }
      throw new Error('Фото завелике. Зробіть знімок ближче або з меншою роздільністю.');
    });
  };
})();
