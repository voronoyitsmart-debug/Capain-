// Запуск: экран выбора языка, затем загрузка данных выбранного языка и приложения.
// Смена языка — перезагрузка страницы (?lang=…): данные языков никогда не смешиваются.
const Boot = {
  info: {
    de: { flag: 'de', native: 'Deutsch', ru: 'Немецкий' },
    ro: { flag: 'ro', native: 'Română', ru: 'Румынский' }
  },
  // краткая сводка прогресса по языку прямо из сохранённых данных
  stats(code) {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(LANGS[code].storeKey) || 'null'); } catch (e) { s = null; }
    if (!s || !s.days) return null;
    let d = new Date(), streak = 0;
    const has = x => s.days[dayKey(x)] && s.days[dayKey(x)].xp > 0;
    if (!has(d)) d = new Date(Date.now() - DAY);
    while (has(d)) { streak++; d = new Date(d.getTime() - DAY); }
    const known = Object.values(s.srs || {}).filter(r => r.b >= 2).length;
    return { xp: s.xp || 0, level: s.level || 'A1', streak, known };
  },
  start() {
    const want = new URLSearchParams(location.search).get('lang');
    if (want && LANGS[want]) return this.enter(want);
    this.showChooser();
  },
  showChooser() {
    $('#app').hidden = true;
    const el = document.createElement('div');
    el.id = 'chooser';
    el.className = 'chooser';
    el.innerHTML = `<div class="ch-in">
      <div class="ch-logo" aria-hidden="true"><i></i><i></i><i></i></div>
      <h1 class="display">Capain</h1>
      <p class="lead">Какой язык учим сегодня?</p>
      <div class="ch-list">${Object.keys(LANGS).map(code => {
        const i = this.info[code], st = this.stats(code);
        return `<button class="ch-card" data-lang="${code}">
          <span class="flag flag-${i.flag}" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="ch-b"><b>${i.native}</b><small>${i.ru}${st ? ` · уровень ${st.level}` : ''}</small>
            <span class="ch-st">${st ? `<span>${ICON.flame}${st.streak}</span><span>${ICON.words}${st.known}</span><span>${ICON.bolt}${st.xp} XP</span>` : '<span>Начать с нуля</span>'}</span></span>
          <span class="cta-go">${ICON.play}</span></button>`;
      }).join('')}</div>
      <p class="muted small">Прогресс по каждому языку хранится отдельно. Сменить язык можно в любой момент — нажмите на флаг вверху.</p>
    </div>`;
    document.body.appendChild(el);
    el.addEventListener('click', e => { const b = e.target.closest('[data-lang]'); if (b) this.enter(b.dataset.lang); });
  },
  enter(code) {
    L = LANGS[code];
    document.documentElement.lang = 'ru';
    const ch = $('#chooser');
    if (ch) ch.innerHTML = `<div class="ch-in"><p class="lead">Загружаем ${this.info[code].ru.toLowerCase()}…</p></div>`;
    const done = () => { if (ch) ch.remove(); $('#app').hidden = false; App.init(); };
    if (window.DE && window.DE.topics && window.DE.topics.length) return done();   // данные уже в странице (однофайловая версия)
    const sc = document.createElement('script');
    sc.src = `data-${code}.js?v=${window.CAPAIN_VER || ''}`;
    sc.onload = done;
    sc.onerror = () => { if (ch) ch.innerHTML = '<div class="ch-in"><p class="lead">Не удалось загрузить данные. Проверьте интернет и откройте приложение ещё раз.</p></div>'; };
    document.head.appendChild(sc);
  },
  switchTo(code) { location.href = './?lang=' + code; }
};
document.addEventListener('DOMContentLoaded', () => Boot.start());
