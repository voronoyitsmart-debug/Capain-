// Достижения
const ACH = [
  { id: 'first', t: 'Erster Schritt', d: 'Пройти первую тренировку', ic: '🌱', f: s => s.stats.sessions >= 1 },
  { id: 'w10', t: 'Zehn Wörter', d: 'Выучить 10 слов', ic: '🔤', f: () => Ach.known() >= 10 },
  { id: 'w50', t: 'Wortschatz', d: 'Выучить 50 слов', ic: '📗', f: () => Ach.known() >= 50 },
  { id: 'w150', t: 'Bücherwurm', d: 'Выучить 150 слов', ic: '🐛', f: () => Ach.known() >= 150 },
  { id: 'w400', t: 'Lexikon', d: 'Выучить 400 слов', ic: '📚', f: () => Ach.known() >= 400 },
  { id: 'w1000', t: 'Wortmeister', d: 'Выучить 1000 слов', ic: '🏛️', f: () => Ach.known() >= 1000 },
  { id: 's3', t: 'Dranbleiben', d: 'Серия 3 дня подряд', ic: '🔥', f: () => Store.bestStreak() >= 3 },
  { id: 's7', t: 'Eine Woche', d: 'Серия 7 дней подряд', ic: '📅', f: () => Store.bestStreak() >= 7 },
  { id: 's30', t: 'Eiserner Wille', d: 'Серия 30 дней подряд', ic: '🦾', f: () => Store.bestStreak() >= 30 },
  { id: 'xp1k', t: 'Tausend', d: 'Набрать 1000 XP', ic: '⚡', f: s => s.xp >= 1000 },
  { id: 'xp5k', t: 'Fünftausend', d: 'Набрать 5000 XP', ic: '🌩️', f: s => s.xp >= 5000 },
  { id: 'perfect', t: 'Fehlerfrei', d: 'Тренировка без единой ошибки', ic: '💎', f: s => s.stats.perfect >= 1 },
  { id: 'perfect10', t: 'Perfektionist', d: '10 тренировок без ошибок', ic: '👑', f: s => s.stats.perfect >= 10 },
  { id: 'gram3', t: 'Grammatikfan', d: 'Пройти 3 урока грамматики', ic: '🧩', f: s => Object.values(s.grammar).filter(g => g.done).length >= 3 },
  { id: 'gram15', t: 'Regelkenner', d: 'Пройти 15 уроков грамматики', ic: '📐', f: s => Object.values(s.grammar).filter(g => g.done).length >= 15 },
  { id: 'place', t: 'Standortbestimmung', d: 'Пройти тест на уровень', ic: '🧭', f: s => !!s.placement },
  { id: 'tA1', t: 'A1 bestanden', d: 'Сдать тест A1', ic: '🥉', f: s => s.tests.A1 && s.tests.A1.passed },
  { id: 'tA2', t: 'A2 bestanden', d: 'Сдать тест A2', ic: '🥈', f: s => s.tests.A2 && s.tests.A2.passed },
  { id: 'tB1', t: 'B1 bestanden', d: 'Сдать тест B1', ic: '🥇', f: s => s.tests.B1 && s.tests.B1.passed },
  { id: 'tB2', t: 'B2 bestanden', d: 'Сдать тест B2', ic: '🏅', f: s => s.tests.B2 && s.tests.B2.passed },
  { id: 'tC1', t: 'C1 bestanden', d: 'Сдать тест C1', ic: '🎓', f: s => s.tests.C1 && s.tests.C1.passed },
  { id: 'speed', t: 'Blitzschnell', d: '20 верных ответов в «Скорости»', ic: '⏱️', f: s => (s.best.speed || 0) >= 20 },
  { id: 'read5', t: 'Leseratte', d: 'Прочитать 5 текстов', ic: '📖', f: s => Object.keys(s.reading).length >= 5 },
  { id: 'dial5', t: 'Gesprächig', d: 'Разобрать 5 диалогов', ic: '💬', f: s => Object.keys(s.dialogues).length >= 5 },
  { id: 'a100', t: 'Hundert Antworten', d: 'Ответить на 100 вопросов', ic: '✅', f: s => s.stats.answers >= 100 },
  { id: 'a1000', t: 'Fleißig', d: 'Ответить на 1000 вопросов', ic: '🐝', f: s => s.stats.answers >= 1000 },
  { id: 'night', t: 'Nachteule', d: 'Заниматься после 23:00', ic: '🦉', f: () => new Date().getHours() >= 23 },
  { id: 'early', t: 'Frühaufsteher', d: 'Заниматься до 7:00', ic: '🌅', f: () => new Date().getHours() < 7 }
];
const Ach = {
  _known: null,
  known() { if (this._known == null) this._known = Object.values(Store.state.srs).filter(r => r.b >= 2).length; return this._known; },
  check() {
    this._known = null;
    const s = Store.state;
    const fresh = [];
    for (const a of ACH) {
      if (s.ach[a.id]) continue;
      let ok = false; try { ok = !!a.f(s); } catch (e) { ok = false; }
      if (ok) { s.ach[a.id] = Date.now(); fresh.push(a); }
    }
    if (fresh.length) {
      Store.save();
      fresh.forEach((a, i) => setTimeout(() => UI.toast(`<span class="t-ic">${a.ic}</span><div><b>${a.t}</b><br><small>${a.d}</small></div>`, 3200), 600 + i * 900));
    }
  }
};
