// Навигация, вкладки и общий обработчик действий
const TABS = [['home', 'Главная', 'home'], ['words', 'Слова', 'words'], ['grammar', 'Грамматика', 'grammar'], ['tests', 'Тесты', 'tests'], ['more', 'Ещё', 'more']];
const App = {
  stack: [], cur: 'home', mem: {}, onLeave: null,
  init() {
    Store.load();
    C.init();
    Speech.init();
    this.applyTheme();
    $('#tabs').innerHTML = TABS.map(([id, l, ic]) => `<button data-tab="${id}" aria-label="${l}">${ICON[ic]}<span>${l}</span></button>`).join('');
    $('#tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) this.tab(b.dataset.tab); });
    $('#back').innerHTML = ICON.back;
    $('#back').onclick = () => this.back();
    document.addEventListener('click', e => this.handle(e));
    document.addEventListener('keydown', e => {
      const s = Engine.s; if (!s) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const n = +e.key;
      if (n >= 1 && n <= 4 && s.cur && s.cur.kind === 'choice' && !s.locked) { const b = $$('.opt')[n - 1]; if (b) b.click(); }
      if (e.key === 'Enter' && $('#next')) { e.preventDefault(); $('#next').click(); }
    });
    matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => this.applyTheme());
    const start = (location.hash || '').replace('#', '');
    this.tab(TABS.some(t => t[0] === start) ? start : 'home');
    setTimeout(() => Ach.check(), 1200);
  },
  applyTheme() {
    const t = Store.state.settings.theme;
    if (t === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
    const dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    const m = $('meta[name="theme-color"]'); if (m) m.content = dark ? '#101218' : '#f2f3f6';
  },
  tab(id) {
    this.stack = [{ name: id, p: {} }];
    this.render();
  },
  go(name, p = {}, replace) {
    if (replace) this.stack[this.stack.length - 1] = { name, p };
    else this.stack.push({ name, p });
    this.render();
    window.scrollTo(0, 0);
  },
  back() { if (this.stack.length > 1) { this.stack.pop(); this.render(true); } },
  refresh() { this.render(true); },
  render(keepScroll) {
    if (this.onLeave) { try { this.onLeave(); } catch (e) { } this.onLeave = null; }
    const top = this.stack[this.stack.length - 1];
    const scr = Screens[top.name];
    const y = window.scrollY;
    const view = $('#view');
    view.innerHTML = scr.html(top.p);
    view.className = 'view scr-' + top.name;
    const title = typeof scr.title === 'function' ? scr.title(top.p) : scr.title;
    $('#ttl').textContent = title || '';
    const deep = this.stack.length > 1;
    $('#back').hidden = !deep;
    $('#top').classList.toggle('deep', deep);
    const root = this.stack[0].name;
    $$('#tabs [data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === root));
    if (scr.mount) scr.mount(view, top.p);
    this.bindCommon(view);
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  },
  bindCommon(root) {
    $$('[data-fav]', root).forEach(b => b.onclick = e => {
      e.stopPropagation();
      const k = b.dataset.fav, f = Store.state.fav;
      if (f[k]) delete f[k]; else f[k] = 1;
      Store.save();
      $$(`[data-fav="${CSS.escape(k)}"]`).forEach(x => x.classList.toggle('faved', !!f[k]));
      UI.toast(f[k] ? 'Добавлено в избранное' : 'Убрано из избранного', 1400);
    });
  },
  handle(e) {
    const say = e.target.closest('[data-say]');
    if (say && !say.closest('#ses-body')) { e.stopPropagation(); Speech.say(say.dataset.say); return; }
    const slow = e.target.closest('[data-sayslow]');
    if (slow) { Speech.say(slow.dataset.sayslow, { slow: true }); return; }
    const word = e.target.closest('[data-word]');
    if (word) { Screens.wordSheet(word.dataset.word); return; }
    const go = e.target.closest('[data-go]');
    if (go) { const m = go.closest('.modal'); if (m) m.remove(); this.go(go.dataset.go, { id: go.dataset.id }, !!go.dataset.replace); return; }
    const run = e.target.closest('[data-run]');
    if (run) { this.run(run.dataset.run); return; }
  },
  run(cmd) {
    const [a, b, c] = cmd.split(':');
    switch (a) {
      case 'smart': return Train.smart();
      case 'global': return Train.global(b);
      case 'topic': return Train.topic(b, c);
      case 'phr': return Train.phrases(b, c);
      case 'mistakes': return Train.mistakes();
      case 'grammar': return Train.grammar(b);
      case 'test': return Train.levelTest(b);
      case 'exam': return Train.exam(b);
      case 'placement': return Train.placement();
      case 'verbs': return Train.verbs(b && b !== 'all' ? C.verbs.filter(v => v.lvl === b) : null);
      case 'verb': return Train.verbAll(C.verbByInf[cmd.slice(5)]);
      case 'reading': return Train.reading(b);
      case 'dialogue': return Train.dialogue(b);
      case 'roleplay': return Train.roleplay(b);
    }
  }
};
document.addEventListener('DOMContentLoaded', () => App.init());
