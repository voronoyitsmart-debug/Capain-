'use strict';
// © Платон Вороний. All rights reserved. See LICENSE.
// Internet access without router settings: a Cloudflare "quick tunnel" (free, no account).
// cloudflared runs next to the server and gives an https://….trycloudflare.com address that forwards to it.
// The address changes on every start; a fixed address needs a Cloudflare account (CLOUDFLARE_TUNNEL_TOKEN + PUBLIC_URL).
const fs = require('fs');
const { spawn } = require('child_process');

const URL_RE = /https:\/\/(?!api\.)[a-z0-9-]+\.trycloudflare\.com/;

function parseUrl(line) { const m = URL_RE.exec(String(line)); return m ? m[0] : null; }

/** Starts the tunnel; onUrl(url) is called when the address is known. Restarts a few times if it stops. */
async function startTunnel(port, onUrl, log) {
  let cf;
  try { cf = require('cloudflared'); } catch (e) { log('Інтернет-доступ: пакет cloudflared не встановлено (npm install).'); return null; }
  if (!fs.existsSync(cf.bin)) {
    log('Інтернет-доступ: завантажую cloudflared (один раз, ~30 МБ)…');
    try { await cf.install(cf.bin); } catch (e) { log('Інтернет-доступ: не вдалося завантажити cloudflared: ' + e.message); return null; }
  }
  const token = process.env.CLOUDFLARE_TUNNEL_TOKEN || '';
  let tries = 0, child = null, stopped = false;
  function run() {
    const args = token ? ['tunnel', '--no-autoupdate', 'run', '--token', token]
      : ['tunnel', '--no-autoupdate', '--url', 'http://localhost:' + port];
    child = spawn(cf.bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let buf = '';
    const onData = d => {
      buf += d.toString();
      const lines = buf.split('\n'); buf = lines.pop();
      lines.forEach(l => {
        const u = parseUrl(l); if (u) { tries = 0; onUrl(u); }
        if (token && /Registered tunnel connection/.test(l)) tries = 0;
      });
    };
    child.stdout.on('data', onData); child.stderr.on('data', onData);
    child.on('exit', code => {
      onUrl(null);
      if (stopped) return;
      if (++tries > 5) { log('Інтернет-доступ: тунель зупинився (код ' + code + '). Працює лише локальна мережа.'); return; }
      log('Інтернет-доступ: тунель перепідключається…');
      setTimeout(run, 5000 * tries);
    });
  }
  run();
  const stop = () => { stopped = true; if (child) try { child.kill(); } catch (e) {} };
  process.once('exit', stop);
  process.once('SIGINT', () => { stop(); process.exit(0); });
  return { stop };
}

module.exports = { startTunnel, parseUrl };
