// Адаптивная сложность: 0 (разминка) … 4 (эксперт).
// После верных ответов растёт, после ошибок — откатывается назад, после двух ошибок подряд — сильнее.
const Adapt = {
  LABELS: ['Разминка', 'Легко', 'Средне', 'Сложно', 'Эксперт'],
  st() {
    const s = Store.state;
    if (!s.adapt || typeof s.adapt.d !== 'number') s.adapt = { d: 1, ok: 0, bad: 0 };
    return s.adapt;
  },
  on() { return Store.state.settings.adaptive !== false; },
  level() { return this.on() ? clamp(Math.round(this.st().d), 0, 4) : 2; },
  label() { return this.LABELS[this.level()]; },
  // насколько хорошо выучено слово: 0 новое … 4 выучено
  tier(w) { const b = Store.mastery(w.key); return b <= 0 ? 0 : b === 1 ? 1 : b <= 3 ? 2 : b === 4 ? 3 : 4; },
  // итоговая сложность вопроса по слову: больше всего решает текущий уровень ученика, меньше — знание слова
  eff(w) {
    if (!this.on()) return clamp(this.tier(w) + 1, 0, 4);
    return clamp(Math.round(0.65 * this.st().d + 0.35 * this.tier(w) + 0.15), 0, 4);
  },
  options(eff) { return eff <= 0 ? 3 : eff >= 4 ? 5 : 4; },
  // учесть ответ. Верно — сложнее (быстрый ответ — ещё сложнее), ошибка — чуть проще.
  // Если реально трудно (две ошибки подряд или три из последних пяти) — откат на целый уровень.
  // Возвращает 'up' | 'down' | 'rollback' | null
  answer(ok, ms) {
    if (!this.on()) return null;
    const a = this.st(), before = this.level();
    a.hist = (a.hist || []).concat([ok ? 1 : 0]).slice(-6);
    if (ok) { a.ok++; a.bad = 0; a.d += ms && ms < 6000 ? 0.3 : 0.2; }
    else {
      a.bad++; a.ok = 0;
      const recent = a.hist.slice(-5), wrong = recent.filter(x => !x).length;
      if (a.bad >= 2 || (recent.length >= 4 && wrong >= 3)) {
        a.d = Math.max(0, Math.min(a.d, before) - 1);
        a.bad = 0; a.hist = [];
        return 'rollback';
      }
      a.d -= 0.35;
    }
    a.d = clamp(a.d, 0, 4);
    const after = this.level();
    return after > before ? 'up' : after < before ? 'down' : null;
  },
  dots(n = this.level()) {
    return `<span class="dbars" title="Сложность: ${this.LABELS[n]}" aria-label="Сложность: ${this.LABELS[n]}">${[0, 1, 2, 3, 4].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;
  },

  // ---- Подсказка о смене уровня (A1 → A2 и обратно) ----
  noteSession(res) {
    const s = Store.state;
    if (!res.total || res.total < 8) return;
    s.recent = (s.recent || []).concat([{ lvl: s.level, pct: res.pct, d: this.st().d, t: Date.now() }]).slice(-8);
  },
  suggestion() {
    const s = Store.state, i = LEVELS.indexOf(s.level);
    if (s.lvlHint && s.lvlHint.lvl === s.level && Date.now() - s.lvlHint.t < 3 * DAY) return null;
    const mine = (s.recent || []).filter(r => r.lvl === s.level);
    const last = mine.slice(-4);
    const avg = last.length ? last.reduce((a, r) => a + r.pct, 0) / last.length : 0;
    const test = s.tests[s.level];
    if (i < LEVELS.length - 1 && ((last.length >= 4 && avg >= 90 && this.st().d >= 3.2) || (test && test.passed))) {
      return { dir: 'up', to: LEVELS[i + 1], why: test && test.passed ? `Тест ${s.level} сдан` : `Последние тренировки — в среднем ${Math.round(avg)}%` };
    }
    const low = mine.slice(-3);
    const lowAvg = low.length ? low.reduce((a, r) => a + r.pct, 0) / low.length : 100;
    if (i > 0 && low.length >= 3 && lowAvg < 50) {
      return { dir: 'down', to: LEVELS[i - 1], why: `Последние тренировки — в среднем ${Math.round(lowAvg)}%` };
    }
    return null;
  },
  dismiss() { Store.state.lvlHint = { lvl: Store.state.level, t: Date.now() }; Store.save(); }
};
