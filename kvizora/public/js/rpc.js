// © Платон Вороний. All rights reserved. See LICENSE.
// Stands in for google.script.run: the pages call server functions by name, the server answers with JSON.
(function () {
  'use strict';
  var base = window.RPC_BASE || '/api/s/';
  function runner(ok, fail) {
    var r = {
      withSuccessHandler: function (f) { return runner(f, fail); },
      withFailureHandler: function (f) { return runner(ok, f); }
    };
    return new Proxy(r, { get: function (target, name) {
      if (name in target) return target[name];
      return function () {
        var args = Array.prototype.slice.call(arguments);
        fetch(base + encodeURIComponent(String(name)), {
          method: 'POST', credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', 'X-Tests-App': '1' },
          body: JSON.stringify({ args: args })
        }).then(function (res) {
          return res.json().catch(function () { return { error: 'Server error (' + res.status + ')' }; }).then(function (j) {
            if (res.status === 401 && window.RPC_LOGIN) { location.href = '/login?next=' + encodeURIComponent(location.pathname); return; }
            if (res.status === 403 && /\[#(must_change|terms)\]/.test(String(j && j.error))) { location.href = '/password'; return; }
            if (j && j.ok) { if (ok) ok(j.result); }
            else if (fail) fail(new Error((j && j.error) || ('Error ' + res.status)));
          });
        }, function () { if (fail) fail(new Error('Network error')); });
      };
    } });
  }
  window.google = { script: { run: runner(null, null) } };
  window.api = function (path, body) {
    return fetch(path, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Tests-App': '1' }, body: JSON.stringify(body || {}) })
      .then(function (res) { return res.json().catch(function () { return { error: 'Server error' }; }).then(function (j) {
        if (j && j.ok) return j.result;
        var e = new Error(String((j && j.error) || 'Error')); e.status = res.status; throw e;
      }); });
  };
})();
