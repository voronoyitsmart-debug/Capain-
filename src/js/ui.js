// Мелкие элементы интерфейса: тосты, модальные окна, конфетти
const UI = {
  toast(html, ms = 2600) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = html;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 400); }, ms);
  },
  // Своё окно подтверждения (confirm() в некоторых средах не работает)
  confirm(title, text, okLabel = 'Да', danger = false) {
    return new Promise(res => {
      const m = document.createElement('div');
      m.className = 'modal';
      m.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true">
        <h3>${title}</h3><p>${text}</p>
        <div class="row gap8 end"><button class="btn ghost" data-v="0">Отмена</button><button class="btn ${danger ? 'danger' : 'primary'}" data-v="1">${okLabel}</button></div></div>`;
      document.body.appendChild(m);
      m.addEventListener('click', e => {
        const b = e.target.closest('[data-v]');
        if (b || e.target === m) { m.remove(); res(!!(b && b.dataset.v === '1')); }
      });
    });
  },
  sheet(html) {
    const m = document.createElement('div');
    m.className = 'modal sheet-wrap';
    m.innerHTML = `<div class="sheet-card">${html}</div>`;
    document.body.appendChild(m);
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) m.remove(); });
    return m;
  },
  confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('canvas');
    c.className = 'confetti';
    document.body.appendChild(c);
    const W = c.width = innerWidth * devicePixelRatio, H = c.height = innerHeight * devicePixelRatio;
    const ctx = c.getContext('2d');
    const css = getComputedStyle(document.documentElement);
    const cols = ['--der', '--die', '--das', '--gold'].map(v => css.getPropertyValue(v).trim() || '#e0a020');
    const P = Array.from({ length: 140 }, () => ({ x: W / 2 + (Math.random() - .5) * W * .3, y: H * .35, vx: (Math.random() - .5) * 26, vy: -Math.random() * 30 - 8,
      s: (6 + Math.random() * 8) * devicePixelRatio, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: pick(cols) }));
    let f = 0;
    (function tick() {
      ctx.clearRect(0, 0, W, H);
      P.forEach(p => { p.vy += 1.1; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
      if (++f < 150) requestAnimationFrame(tick); else c.remove();
    })();
  },
  ring(pct, size = 64, stroke = 7, cls = '') {
    const r = (size - stroke) / 2, L = 2 * Math.PI * r, off = L * (1 - clamp(pct, 0, 1));
    return `<svg class="ring ${cls}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" class="ring-bg" fill="none"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" class="ring-fg" fill="none"
        stroke-dasharray="${L}" stroke-dashoffset="${off}" transform="rotate(-90 ${size / 2} ${size / 2})" stroke-linecap="round"/></svg>`;
  },
  dots(m) { // индикатор уровня знания слова, 0..6
    const n = m >= 5 ? 3 : m >= 2 ? 2 : m >= 1 ? 1 : 0;
    return `<span class="mdots m${n}" title="${['новое', 'учу', 'знаю', 'выучено'][n]}"><i></i><i></i><i></i></span>`;
  }
};
