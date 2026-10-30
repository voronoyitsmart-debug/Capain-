// Запуск тренировок разных типов
const MODES = {
  flash: { t: 'Карточки', d: 'Интервальное повторение', ic: 'cards' },
  quiz: { t: 'Выбор перевода', d: 'DE ↔ RU', ic: 'target' },
  listen: { t: 'Аудирование', d: 'Слушай и выбирай', ic: 'ear' },
  write: { t: 'Письмо', d: 'Напиши слово', ic: 'pen' },
  article: { t: 'Der · Die · Das', d: 'Тренажёр артиклей', ic: 'layers' },
  plural: { t: 'Мн. число', d: 'Формы plural', ic: 'shuffle' },
  gap: { t: 'Пропуски', d: 'Слово в контексте', ic: 'gap' },
  order: { t: 'Собери фразу', d: 'Порядок слов', ic: 'puzzle' },
  dictation: { t: 'Диктант', d: 'Услышь и собери', ic: 'ear' },
  match: { t: 'Пары', d: 'Найди соответствия', ic: 'pairs' },
  speed: { t: 'Скорость', d: '60 секунд', ic: 'timer' }
};

const Train = {
  // слова, подходящие для общего режима
  // уже начатые слова + слова не выше уровня пользователя
  globalPool(filter) {
    let started = C.words.filter(w => Store.mastery(w.key) > 0 && C.atLevel(w));
    if (filter) started = started.filter(filter);
    if (started.length >= 12) return started;
    const lv = Store.state.level;
    let lvl = C.words.filter(w => C.atLevel(w));
    if (filter) lvl = lvl.filter(filter);
    // сначала слова своего уровня, потом ниже
    const mine = lvl.filter(w => w.lvl === lv && !started.includes(w)), lower = lvl.filter(w => w.lvl !== lv && !started.includes(w));
    return started.concat(sample(mine, 30), sample(lower, 15));
  },
  // подбор слов для режима: сначала «срочные» и слабые
  pickWords(pool, n) {
    const now = Date.now();
    // сначала «срочные» и слабые, слова выше уровня пользователя — в последнюю очередь
    const score = w => { const r = Store.srsGet(w.key); const above = C.atLevel(w) ? 0 : 3;
      if (!r) return above + 1 + Math.random(); return above + (r.due <= now ? 0 : 2) + r.b * 0.3 + Math.random() * 0.8; };
    return pool.slice().sort((a, b) => score(a) - score(b)).slice(0, n);
  },
  // Вопросы строятся в момент показа (функции), чтобы учитывать сложность, набранную по ходу тренировки
  build(mode, pool, n) {
    const lazy = (ws, f) => ws.map(w => () => f(w) || Q.deRu(w, pool));
    switch (mode) {
      case 'flash': return this.pickWords(pool, Math.min(n || 15, pool.length)).map(w => Q.flash(w));
      case 'quiz': return lazy(this.pickWords(pool, n || 12), w => Adapt.eff(w) >= 2 || Math.random() < .4 ? Q.ruDe(w, pool) : Q.deRu(w, pool));
      case 'listen': return lazy(this.pickWords(pool, n || 12), w => Adapt.eff(w) >= 4 && Math.random() < .5 ? Q.make('typeListen', w, pool) : Q.listen(w, pool));
      case 'write': return lazy(this.pickWords(pool, n || 10), w => Q.type(w));
      case 'article': return this.pickWords(pool.filter(w => w.t === 'n' && splitArticle(w.de).art), n || 15).map(w => () => Q.article(w));
      case 'plural': return lazy(this.pickWords(pool.filter(w => Q.canPlural(w)), n || 12), w => Q.pluralForms(w));
      case 'gap': return lazy(this.pickWords(pool.filter(w => Q.gapToken(w)), n || 10), w => Q.gap(w, pool));
      case 'order': return lazy(this.pickWords(pool.filter(w => w.ex), n || 8), w => Q.make('orderEx', w, pool));
      case 'dictation': return lazy(this.pickWords(pool.filter(w => w.ex), n || 8), w => Q.make('dictation', w, pool));
      case 'match': {
        const out = []; let src = this.pickWords(pool, 30);
        while (out.length < 3 && src.length >= 4) {
          const set = Q.matchSet(src, 6);
          if (set.length < 4) break;
          out.push(Q.match(set));
          src = src.filter(w => !set.includes(w));
        }
        return out;
      }
      case 'mix': return this.pickWords(pool, n || 12).map(w => () => Q.forWord(w, pool));
    }
    return [];
  },
  run(mode, pool, title, extra = {}) {
    if (mode === 'speed') return this.speed(pool, title);
    const qs = this.build(mode, pool);
    if (!qs.length) return UI.toast(mode === 'article' || mode === 'plural' ? 'В этой подборке нет подходящих существительных' : 'Недостаточно слов для этого режима');
    Engine.start(Object.assign({ title, questions: qs, xp: mode === 'flash' ? 3 : 5, retry: () => this.run(mode, pool, title, extra), requeue: mode !== 'match' }, extra));
  },
  topic(id, mode) {
    const pool = C.topicWords(id);
    if (!id.startsWith('ph:') && id !== 'fav') { Store.state.lastTopic = id; Store.save(); }
    this.run(mode, pool, (C.topicById[id] || {}).title || 'Тренировка');
  },
  global(mode) {
    const f = mode === 'article' ? (w => w.t === 'n') : mode === 'plural' ? (w => Q.canPlural(w)) : null;
    this.run(mode, this.globalPool(f), MODES[mode].t);
  },
  speed(pool, title) {
    pool = pool && pool.length >= 6 ? pool : this.globalPool();
    let last = null;
    Engine.start({
      title: title || 'Скорость', mode: 'speed', timeLimit: 60, xp: 2, requeue: false,
      gen: () => { let w; do { w = pick(pool); } while (w === last && pool.length > 1); last = w; return Math.random() < .5 ? Q.deRu(w, pool) : Q.ruDe(w, pool); },
      onFinish: r => {
        const best = Store.state.best.speed || 0;
        if (r.correct > best) { Store.state.best.speed = r.correct; Store.save(); return { headline: `Новый рекорд: <b>${r.correct}</b>!` }; }
        return { headline: `Рекорд: ${best}` };
      },
      retry: () => this.speed(pool, title)
    });
  },
  // Умная ежедневная тренировка
  smartPlan() {
    const now = Date.now(), s = Store.state;
    const due = Object.keys(s.srs).filter(k => (k[0] === 'w' || k[0] === 'p') && C.byKey[k] && s.srs[k].due <= now)
      .sort((a, b) => s.srs[a].due - s.srs[b].due);
    const today = Store.today();
    const newLeft = Math.max(0, s.settings.newPerDay - (today.nw || 0));
    // если сейчас трудно — меньше новых слов, если легко — больше
    const per = [3, 4, 6, 7, 8][Adapt.level()];
    const want = Math.min(newLeft, per);
    let fresh = [];
    if (want) {
      const lv = s.level, li = LEVELS.indexOf(lv);
      const order = [];
      if (s.lastTopic && C.topicById[s.lastTopic] && LEVELS.indexOf(C.topicById[s.lastTopic].level) <= li) order.push(C.topicById[s.lastTopic]);
      C.topics.filter(t => t.level === lv).forEach(t => order.push(t));
      C.topics.filter(t => LEVELS.indexOf(t.level) < li).forEach(t => order.push(t));
      C.topics.forEach(t => order.push(t));
      // сначала слова ровно своего уровня, потом ниже; выше уровня — никогда
      for (const pass of [w => w.lvl === lv, w => LEVELS.indexOf(w.lvl) < li]) {
        for (const t of uniq(order)) {
          for (const w of t.words) {
            if (fresh.length >= want) break;
            if (!s.srs[w.key] && pass(w) && !fresh.includes(w)) fresh.push(w);
          }
          if (fresh.length >= want) break;
        }
        if (fresh.length >= want) break;
      }
    }
    return { due, fresh };
  },
  smart() {
    const { due, fresh } = this.smartPlan();
    const dueWords = due.slice(0, 15).map(k => C.byKey[k]);
    const qs = [];
    const later = [];
    fresh.forEach(w => { qs.push(Q.flash(w)); later.push(w); });
    dueWords.forEach((w, i) => { qs.splice(Math.min(qs.length, i * 2 + 1), 0, () => Q.forWord(w)); });
    // новое слово закрепляем сразу после знакомства: сначала узнать, затем вспомнить
    later.forEach(w => qs.push(() => Q.forWord(w, null, Adapt.level() >= 3 ? 'ruDe' : pick(['deRu', 'listen']))));
    if (!qs.length) {
      const pool = this.globalPool();
      return Engine.start({ title: 'Повторение', questions: this.build('mix', pool, 12), retry: () => this.smart() });
    }
    Engine.start({
      title: 'Ежедневная тренировка', questions: qs, retry: () => this.smart(),
      onFinish: () => { const t = Store.today(); t.nw = (t.nw || 0) + fresh.length; Store.save(); }
    });
  },
  mistakes() {
    const keys = Object.keys(Store.state.mistakes).sort((a, b) => Store.state.mistakes[b].last - Store.state.mistakes[a].last);
    const qs = keys.slice(0, 20).map(k => Q.fromKey(k)).filter(Boolean);
    if (!qs.length) return UI.toast('Ошибок нет — так держать!');
    Engine.start({ title: 'Работа над ошибками', questions: shuffle(qs), retry: () => this.mistakes() });
  },
  grammar(id) {
    const g = C.grammar.find(x => x.id === id);
    // от простого к сложному: выбор → ввод → порядок слов;
    // если урок уже пройден хорошо — повторная попытка начинается сразу со сложных заданий
    const prev = Store.state.grammar[id];
    const rank = prev && prev.best >= 80 ? { input: 0, order: 1, choice: 2 } : { choice: 0, input: 1, order: 2 };
    const ex = shuffle(g.exercises).sort((a, b) => rank[a.type] - rank[b.type]);
    const qs = ex.map(x => Q.fromExercise(x)).filter(Boolean);
    Engine.start({
      title: g.title, questions: qs, xp: 6, retry: () => this.grammar(id),
      onFinish: r => {
        const st = Store.state.grammar[id] || { best: 0, done: false };
        st.best = Math.max(st.best, r.pct); if (r.pct >= 60) st.done = true;
        Store.state.grammar[id] = st; Store.save();
        return { headline: r.pct >= 60 ? 'Урок пройден ✓' : 'Для зачёта нужно 60% — попробуйте ещё раз' };
      }
    });
  },
  levelTest(lvl) {
    const qs = sample(C.tests.filter(t => t.lvl === lvl), 20).map(t => Q.fromTest(t));
    Engine.start({
      title: 'Тест ' + lvl, questions: qs, xp: 8, requeue: false, retry: () => this.levelTest(lvl),
      onFinish: r => this.saveTest(lvl, r)
    });
  },
  exam(lvl) {
    const qs = sample(C.tests.filter(t => t.lvl === lvl), 30).map(t => Q.fromTest(t));
    Engine.start({
      title: 'Экзамен ' + lvl, questions: qs, mode: 'exam', timeLimit: 20 * 60, xp: 10, requeue: false, retry: () => this.exam(lvl),
      onFinish: r => {
        const out = this.saveTest(lvl, r);
        out.html = this.catBreakdown(r);
        return out;
      }
    });
  },
  saveTest(lvl, r) {
    const st = Store.state.tests[lvl] || { best: 0, passed: false };
    st.best = Math.max(st.best, r.pct); st.date = Date.now();
    const passed = r.pct >= 70;
    if (passed) st.passed = true;
    Store.state.tests[lvl] = st; Store.save();
    return { headline: passed ? `Уровень ${lvl} подтверждён ✓` : `Для зачёта нужно 70%. Лучший результат: ${st.best}%` };
  },
  catBreakdown(r) {
    const cats = {};
    r.done.forEach(d => { const c = d.q.label; cats[c] = cats[c] || { ok: 0, n: 0 }; cats[c].n++; if (d.ok) cats[c].ok++; });
    return `<div class="cats">${Object.entries(cats).map(([c, v]) => `<div class="cat"><span>${c}</span><div class="bar"><i style="width:${v.ok / v.n * 100}%"></i></div><b>${v.ok}/${v.n}</b></div>`).join('')}</div>`;
  },
  placement() {
    const PER = 8, NEED = 6;
    let li = 0, inStage = 0, ok = 0, reached = -1;
    const used = new Set();
    const res = {};
    Engine.start({
      title: 'Тест на уровень', mode: 'exam', requeue: false, xp: 4, totalHint: PER * LEVELS.length,
      gen: () => {
        const s = Engine.s;
        if (inStage > 0) { const last = s.done[s.done.length - 1]; if (last && last.ok) ok++; }
        if (inStage === PER) {
          res[LEVELS[li]] = ok;
          if (ok >= NEED) { reached = li; li++; inStage = 0; ok = 0; if (li >= LEVELS.length) return null; }
          else return null;
        }
        const pool = C.tests.filter(t => t.lvl === LEVELS[li] && !used.has(t.key));
        if (!pool.length) return null;
        const t = pick(pool); used.add(t.key); inStage++;
        return Q.fromTest(t);
      },
      onFinish: r => {
        const lvl = reached < 0 ? 'A1' : LEVELS[Math.min(reached + (reached < 4 ? 1 : 0), 4)];
        const solid = reached < 0 ? 'ниже A1' : LEVELS[reached];
        Store.state.placement = { level: lvl, solid, date: Date.now(), res };
        Store.state.level = lvl; Store.save();
        return { headline: `Уверенно: <b>${solid}</b>. Рекомендуем заниматься на уровне <b>${lvl}</b>.`,
          html: `<div class="cats">${Object.entries(res).map(([l, v]) => `<div class="cat"><span>${l}</span><div class="bar"><i style="width:${v / PER * 100}%"></i></div><b>${v}/${PER}</b></div>`).join('')}</div>` };
      }
    });
  },
  verbs(list, title) {
    list = list && list.length ? list : C.verbs.filter(v => LEVELS.indexOf(v.lvl) <= LEVELS.indexOf(Store.state.level));
    if (!list.length) list = C.verbs;
    const qs = Array.from({ length: 12 }, () => Q.verbQ(pick(list)));
    Engine.start({ title: title || 'Спряжение глаголов', questions: qs, xp: 6, retry: () => this.verbs(list, title) });
  },
  verbAll(v) {
    const qs = shuffle([0, 1, 2, 3, 4, 5].map(p => Q.verbQ(v, 'praes', p)).concat([Q.verbQ(v, 'praet', 0), Q.verbQ(v, 'praet', 3), Q.verbQ(v, 'perf')]));
    Engine.start({ title: v.inf, questions: qs, xp: 5, retry: () => this.verbAll(v) });
  },
  reading(id) {
    const r = DE.reading.find(x => x.id === id);
    const qs = r.questions.map((q, i) => Q.fromQuiz(q, null));
    Engine.start({ title: r.title, questions: qs, xp: 8, requeue: false, retry: () => this.reading(id),
      onFinish: res => { const st = Store.state.reading[id] || { best: 0 }; st.best = Math.max(st.best, res.pct); Store.state.reading[id] = st; Store.save(); } });
  },
  dialogue(id) {
    const d = DE.dialogues.find(x => x.id === id);
    const qs = (d.quiz || []).map(q => Q.fromQuiz(q, null));
    Engine.start({ title: d.title, questions: qs, xp: 8, requeue: false, retry: () => this.dialogue(id),
      onFinish: res => { const st = Store.state.dialogues[id] || { best: 0 }; st.best = Math.max(st.best, res.pct); Store.state.dialogues[id] = st; Store.save(); } });
  },
  // Ролевая игра: выбрать свою реплику
  roleplay(id) {
    const d = DE.dialogues.find(x => x.id === id);
    const speakers = uniq(d.lines.map(l => l.s));
    const me = speakers[1] || speakers[0];
    const others = DE.dialogues.filter(x => x !== d).flatMap(x => x.lines.map(l => l.de));
    const qs = [];
    d.lines.forEach((l, i) => {
      if (l.s !== me || i === 0) return;
      const prev = d.lines[i - 1];
      const wrong = sample(others.filter(o => o !== l.de), 2);
      const opts = shuffle([l.de].concat(wrong));
      qs.push({ kind: 'choice', label: `Вы — ${esc(me)}. Что ответить?`,
        prompt: `<div class="bubble them"><b>${esc(prev.s)}</b>${esc(prev.de)}</div><div class="q-sub">Смысл ответа: ${esc(l.ru)}</div>`,
        say: prev.de, autoplay: true, options: opts.map(o => ({ html: esc(o) })), a: opts.indexOf(l.de), sayAfter: l.de, explain: esc(l.ru) });
    });
    Engine.start({ title: 'Ролевая игра', questions: qs, xp: 6, requeue: false, retry: () => this.roleplay(id) });
  },
  phrases(id, mode) { this.run(mode, C.topicWords('ph:' + id), 'Разговорник'); }
};
