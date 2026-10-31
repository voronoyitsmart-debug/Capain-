// Экраны приложения. Каждый экран: { title, html(params), mount(el, params) }
const lvlChip = l => `<span class="lvl lvl-${l}">${l}</span>`;
const bar = (p, cls = '') => `<div class="pbar ${cls}"><i style="width:${Math.round(clamp(p, 0, 1) * 100)}%"></i></div>`;
const modeTile = (run, m, extra = '') => `<button class="mode" data-run="${run}"><span class="mode-ic">${ICON[MODES[m].ic]}</span><span class="mode-t">${MODES[m].t}</span><span class="mode-d">${extra || MODES[m].d}</span></button>`;
const greet = () => L.ui.greet(new Date().getHours());
const levelFilter = (cur, extra = []) => `<div class="chips" role="tablist">${[['all', 'Все']].concat(LEVELS.map(l => [l, l]), extra).map(([v, l]) =>
  `<button class="chip ${cur === v ? 'on' : ''}" data-filter="${v}">${l}</button>`).join('')}</div>`;

const Screens = {
  levelCard(sug) {
    return `<section class="card lvl-sug ${sug.dir}">
      <div class="eyebrow">${sug.dir === 'up' ? 'Пора двигаться дальше' : 'Можно сделать шаг назад'}</div>
      <b>${sug.dir === 'up' ? `Уровень ${Store.state.level} даётся легко. Перейти на ${sug.to}?` : `Уровень ${Store.state.level} пока тяжело даётся. Вернуться на ${sug.to}?`}</b>
      <small class="muted">${esc(sug.why)}. Новые слова и подборки будут уровня ${sug.to}.</small>
      <div class="row gap8 wrap"><button class="btn sm primary" data-lvlset="${sug.to}">Перейти на ${sug.to}</button><button class="btn sm ghost" data-lvlno>Позже</button></div>
    </section>`;
  },
  bindLevelCard(root) {
    $$('[data-lvlset]', root).forEach(b => b.onclick = () => { Store.state.level = b.dataset.lvlset; App.mem = {}; Store.save(); UI.toast(`Уровень ${b.dataset.lvlset} включён`); const c = b.closest('.lvl-sug'); if (c) c.remove(); if (!Engine.s) App.refresh(); });
    $$('[data-lvlno]', root).forEach(b => b.onclick = () => { Adapt.dismiss(); const c = b.closest('.lvl-sug'); if (c) c.remove(); });
  },
  // ================= ГЛАВНАЯ =================
  home: {
    title: 'Главная',
    html() {
      const s = Store.state, t = Store.today(), [g, gr] = greet();
      const streak = Store.streak();
      const goal = s.settings.goal, pct = t.xp / goal;
      const plan = Train.smartPlan();
      const known = Ach.known();
      const wod = C.wordOfDay();
      const mist = Object.keys(s.mistakes).length;
      const nextLesson = C.grammar.find(x => x.level === s.level && !(s.grammar[x.id] && s.grammar[x.id].done)) || C.grammar.find(x => !(s.grammar[x.id] && s.grammar[x.id].done));
      const last = s.lastTopic && C.topicById[s.lastTopic];
      return `
      <section class="hero">
        <div class="hero-txt"><div class="eyebrow">${gr}</div><h1 class="display">${g}</h1>
          <button class="lvl-pick" data-go="settings">Уровень ${lvlChip(s.level)} <small>${LEVEL_NAMES[s.level]}</small></button></div>
        <div class="goal">${UI.ring(pct, 84, 8, pct >= 1 ? 'good' : '')}<div class="goal-t"><b>${t.xp}</b><small>из ${goal} XP</small></div></div>
      </section>
      <div class="stats3">
        <div class="st ${streak ? 'hot' : ''}">${ICON.flame}<b>${streak}</b><span>${plural(streak, 'день', 'дня', 'дней')} подряд</span></div>
        <div class="st">${ICON.words}<b>${known}</b><span>слов знаю</span></div>
        <div class="st">${ICON.bolt}<b>${s.xp}</b><span>всего XP</span></div>
      </div>
      ${(() => { const sg = Adapt.suggestion(); return sg ? Screens.levelCard(sg) : ''; })()}
      <button class="cta" data-run="smart">
        <div class="cta-t"><span class="eyebrow">Ежедневная тренировка</span>
          <b>${plan.due.length || plan.fresh.length ? 'Начать занятие' : 'Повторить слова'}</b>
          <span>${plan.due.length} на повторение · ${plan.fresh.length} ${plural(plan.fresh.length, 'новое слово', 'новых слова', 'новых слов')} · уровень ${s.level}</span>
          ${Adapt.on() ? `<span class="cta-diff">${Adapt.dots()} ${Adapt.label()}</span>` : ''}</div>
        <span class="cta-go">${ICON.play}</span>
      </button>
      ${wod ? `<section class="card wod ${wClass(wod)}">
        <div class="row between"><span class="eyebrow">Слово дня · ${wod.lvl}</span>
          <div class="row gap8"><button class="icon-btn" data-say="${esc(wod.de)}" aria-label="Послушать">${ICON.sound}</button>
          <button class="icon-btn ${s.fav[wod.key] ? 'faved' : ''}" data-fav="${esc(wod.key)}" aria-label="В избранное">${ICON.star}</button></div></div>
        <div class="wod-w">${deHTML(wod)}</div>
        <div class="wod-ru">${esc(wod.ru)}${wod.pl && wod.pl !== '-' ? ` <span class="muted">· ${esc(wod.pl)}</span>` : ''}</div>
        ${wod.ex ? `<div class="wod-ex"><button class="mini-audio" data-say="${esc(wod.ex)}">${ICON.sound}</button><div>${esc(wod.ex)}<div class="muted">${esc(wod.exRu)}</div></div></div>` : ''}
      </section>` : ''}
      <h2 class="sec">Тренажёры</h2>
      <div class="modes">
        ${['flash', 'article', 'listen', 'speed', 'order', 'match', 'write', 'gap'].map(m => modeTile('global:' + m, m)).join('')}
      </div>
      <h2 class="sec">Продолжить</h2>
      <div class="list">
        ${last ? `<button class="li" data-go="topic" data-id="${last.id}"><span class="li-ic emoji">${last.emoji}</span><span class="li-b"><b>${esc(last.title)}</b><small>${C.topicProgress(last.id).known} из ${last.words.length} слов</small>${bar(C.topicProgress(last.id).pct)}</span></button>` : ''}
        ${nextLesson ? `<button class="li" data-go="lesson" data-id="${nextLesson.id}"><span class="li-ic">${ICON.grammar}</span><span class="li-b"><b>${esc(nextLesson.title)}</b><small>Грамматика · ${nextLesson.level}</small></span>${lvlChip(nextLesson.level)}</button>` : ''}
        ${mist ? `<button class="li" data-run="mistakes"><span class="li-ic warn">${ICON.redo}</span><span class="li-b"><b>Работа над ошибками</b><small>${mist} ${plural(mist, 'ошибка', 'ошибки', 'ошибок')} ждут исправления</small></span></button>` : ''}
        ${!s.placement ? `<button class="li" data-run="placement"><span class="li-ic">${ICON.target}</span><span class="li-b"><b>Определить свой уровень</b><small>Адаптивный тест, 10–30 вопросов</small></span></button>` : ''}
        <button class="li" data-go="reading"><span class="li-ic">${ICON.book}</span><span class="li-b"><b>Чтение</b><small>${DE.reading.length} текстов с вопросами</small></span></button>
        <button class="li" data-go="dialogues"><span class="li-ic">${ICON.chat}</span><span class="li-b"><b>Диалоги</b><small>${DE.dialogues.length} ситуаций с озвучкой</small></span></button>
      </div>`;
    },
    mount(el) { Screens.bindLevelCard(el); }
  },

  // ================= СЛОВА =================
  words: {
    title: 'Слова',
    html(p) {
      const f = App.mem.wordsFilter || Store.state.level;
      const list = f === 'all' ? C.topics : C.topics.filter(t => t.level === f);
      const favN = Object.keys(Store.state.fav).length;
      return `<h1 class="display page-h">${L.ui.h.words}</h1><p class="lead">${C.words.length} слов в ${C.topics.length} темах · уровни A1–C1</p>
      <button class="search-fake" data-go="dict">${ICON.search}<span>Поиск по словарю</span></button>
      ${levelFilter(f)}
      ${favN ? `<button class="li fav-row" data-go="topic" data-id="fav"><span class="li-ic">${ICON.star}</span><span class="li-b"><b>Избранное</b><small>${favN} ${plural(favN, 'слово', 'слова', 'слов')}</small></span></button>` : ''}
      <div class="topics">${list.map(t => {
        const pr = C.topicProgress(t.id);
        return `<button class="topic" data-go="topic" data-id="${t.id}">
          <span class="t-emoji">${t.emoji}</span>
          <span class="t-b"><b>${esc(t.title)}</b><small>${esc(t.de || t.ro || '')}</small></span>
          <span class="t-f">${lvlChip(t.level)}<small>${pr.known}/${pr.total}</small></span>
          ${bar(pr.pct)}
        </button>`;
      }).join('')}</div>`;
    },
    mount(el) {
      $$('[data-filter]', el).forEach(b => b.onclick = () => { App.mem.wordsFilter = b.dataset.filter; App.render(); });
    }
  },

  topic: {
    title: p => p.id === 'fav' ? 'Избранное' : (C.topicById[p.id] || {}).title,
    html(p) {
      const t = p.id === 'fav' ? { id: 'fav', title: 'Избранное', de: L.ui.h.topicFav, emoji: '⭐', level: Store.state.level } : C.topicById[p.id];
      if (!t) return '<p>Тема не найдена</p>';
      const ws = C.topicWords(t.id);
      const pr = C.topicProgress(t.id);
      const nouns = ws.filter(w => w.t === 'n').length;
      const modes = ['flash', 'quiz', 'listen', 'write', 'match', 'order', 'gap', 'dictation', 'speed'];
      if (nouns >= 4) modes.splice(3, 0, 'article', 'plural');
      const sort = App.mem.topicSort || 'list';
      let shown = ws.slice();
      if (sort === 'weak') shown.sort((a, b) => Store.mastery(a.key) - Store.mastery(b.key));
      if (sort === 'az') shown.sort((a, b) => L.lemma(a).localeCompare(L.lemma(b), L.code));
      return `<section class="topic-head">
        <span class="t-emoji big">${t.emoji}</span>
        <div><h1 class="display">${esc(t.title)}</h1><div class="muted">${esc(t.de || t.ro || '')} · ${lvlChip(t.level)}</div></div>
      </section>
      <div class="prog-line"><span><b>${pr.known}</b> из ${pr.total} выучено</span><span>${Math.round(pr.pct * 100)}%</span></div>${bar(pr.pct, 'thick')}
      <div class="lvl-dist">${LEVELS.map(l => { const n = ws.filter(w => w.lvl === l).length; return n ? `<span>${lvlChip(l)} ${n}</span>` : ''; }).join('')}
        ${ws.some(w => !C.atLevel(w)) ? `<small class="muted">Слова выше уровня ${Store.state.level} даются в последнюю очередь</small>` : ''}</div>
      <button class="cta slim" data-run="topic:${t.id}:mix"><div class="cta-t"><b>Учить тему</b><span>Смешанная тренировка по уровню знания</span></div><span class="cta-go">${ICON.play}</span></button>
      <div class="modes">${modes.map(m => modeTile(`topic:${t.id}:${m}`, m)).join('')}</div>
      <div class="row between sec-row"><h2 class="sec">Слова · ${ws.length}</h2>
        <div class="seg sm">${[['list', 'по теме'], ['weak', 'слабые'], ['az', 'А–Я']].map(([v, l]) => `<button class="${sort === v ? 'on' : ''}" data-sort="${v}">${l}</button>`).join('')}</div></div>
      <div class="wlist">${shown.map(w => Screens.wordRow(w)).join('')}</div>`;
    },
    mount(el) { $$('[data-sort]', el).forEach(b => b.onclick = () => { App.mem.topicSort = b.dataset.sort; App.render(); }); }
  },
  wordRow(w, showTopic) {
    const fav = Store.state.fav[w.key];
    const tp = showTopic && C.topicById[w.topic];
    return `<div class="wrow ${wClass(w)}">
      <button class="w-say" data-say="${esc(w.de)}" aria-label="Послушать">${ICON.sound}</button>
      <button class="w-main" data-word="${esc(w.key)}"><span class="w-de">${deHTML(w)}${w.t === 'n' && w.pl && w.pl !== '-' ? `<small> · ${esc(w.pl.replace(/^die /, ''))}</small>` : ''}</span>
        <span class="w-ru">${esc(w.ru)}${tp ? ` <small class="muted">· ${esc(tp.title)}</small>` : ''}</span></button>
      ${!C.atLevel(w) ? lvlChip(w.lvl) : ''}${UI.dots(Store.mastery(w.key))}
      <button class="w-fav ${fav ? 'faved' : ''}" data-fav="${esc(w.key)}" aria-label="В избранное">${ICON.star}</button>
    </div>`;
  },
  wordSheet(key) {
    const w = C.byKey[key]; if (!w) return;
    const r = Store.srsGet(key);
    const m = UI.sheet(`<div class="sheet-h ${wClass(w)}"><div class="f-word">${deHTML(w)}</div>
      <button class="icon-btn" data-close aria-label="Закрыть">${ICON.close}</button></div>
      <div class="f-ru">${esc(w.ru)}</div>
      ${w.t === 'n' && w.pl ? `<div class="muted">Мн. число: <b>${w.pl === '-' ? 'нет' : esc(w.pl)}</b></div>` : ''}
      ${w.ex ? `<div class="f-ex"><button class="mini-audio" data-say="${esc(w.ex)}">${ICON.sound}</button><div>${esc(w.ex)}<div class="muted">${esc(w.exRu)}</div></div></div>` : ''}
      <div class="row gap8 wrap"><button class="btn" data-say="${esc(w.de)}">${ICON.sound} Слушать</button>
      <button class="btn" data-sayslow="${esc(w.de)}">${ICON.slow} Медленно</button>
      <button class="btn ${Store.state.fav[key] ? 'faved' : ''}" data-fav="${esc(key)}">${ICON.star} Избранное</button></div>
      <div class="muted small">${r ? `Верно ${r.ok} · ошибок ${r.bad} · ${['новое', 'учу', 'знаю', 'знаю', 'знаю', 'выучено', 'выучено'][r.b]}` : 'Ещё не изучалось'}</div>`);
    App.bindCommon(m);
    Speech.say(w.de);
  },

  // ================= СЛОВАРЬ =================
  dict: {
    title: 'Словарь',
    html() {
      return `<div class="search"><span>${ICON.search}</span><input id="q" type="search" placeholder="${L.ui.adjCap} или русское слово" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" value="${esc(App.mem.dictQ || '')}"></div>
        <div id="dres" class="wlist"></div>`;
    },
    mount(el) {
      const inp = $('#q', el), out = $('#dres', el);
      const all = C.words.concat(DE.phrases.flatMap(p => p.words));
      const run = () => {
        const q = norm(inp.value); App.mem.dictQ = inp.value;
        if (q.length < 2) { out.innerHTML = `<p class="muted pad">Введите хотя бы 2 буквы. В словаре ${all.length} слов и фраз.</p>`; return; }
        const qd = L.translit(q);
        const score = w => {
          const de = norm(w.de), lem = norm(L.lemma(w)), ru = norm(w.ru);
          if (lem === q || de === q || ru === q) return 0;
          if (lem.startsWith(q) || L.translit(lem).startsWith(qd) || L.plain(lem).startsWith(L.plain(q))) return 1;
          if (ru.split(/[,;]\s*/).some(x => x.startsWith(q))) return 1.5;
          if (de.includes(q) || L.translit(de).includes(qd) || L.plain(de).includes(L.plain(q))) return 2;
          if (ru.includes(q)) return 3;
          return 9;
        };
        const res = all.map(w => [score(w), w]).filter(x => x[0] < 9).sort((a, b) => a[0] - b[0]).slice(0, 60);
        const verbs = C.verbs.filter(v => norm(v.inf).includes(q) || norm(v.ru).includes(q)).slice(0, 6);
        out.innerHTML = (verbs.length ? `<div class="vchips">${verbs.map(v => `<button class="chip" data-go="verb" data-id="${esc(v.inf)}">${ICON.verb} ${esc(v.inf)}</button>`).join('')}</div>` : '') +
          (res.length ? res.map(([, w]) => Screens.wordRow(w, true)).join('') : `<p class="muted pad">Ничего не найдено</p>`);
        App.bindCommon(out);
      };
      inp.oninput = run; run();
      setTimeout(() => inp.focus(), 100);
    }
  },

  // ================= ГРАММАТИКА =================
  grammar: {
    title: 'Грамматика',
    html(p) {
      const f = App.mem.gramFilter || Store.state.level;
      const st = Store.state.grammar;
      const done = C.grammar.filter(g => st[g.id] && st[g.id].done).length;
      return `<h1 class="display page-h">${L.ui.h.grammar}</h1><p class="lead">${C.grammar.length} уроков с объяснениями и упражнениями · пройдено ${done}</p>
      ${levelFilter(f)}
      ${LEVELS.filter(l => f === 'all' || f === l).map(l => {
        const ls = C.grammar.filter(g => g.level === l);
        if (!ls.length) return '';
        return `<h2 class="sec">${lvlChip(l)} ${LEVEL_NAMES[l]}</h2><div class="list">${ls.map((g, i) => {
          const s = st[g.id];
          return `<button class="li" data-go="lesson" data-id="${g.id}"><span class="li-num ${s && s.done ? 'done' : ''}">${s && s.done ? ICON.check : i + 1}</span>
            <span class="li-b"><b>${esc(g.title)}</b><small>${esc(g.summary)}</small></span>${s ? `<span class="pct">${s.best}%</span>` : ''}</button>`;
        }).join('')}</div>`;
      }).join('')}`;
    },
    mount(el) { $$('[data-filter]', el).forEach(b => b.onclick = () => { App.mem.gramFilter = b.dataset.filter; App.render(); }); }
  },
  lesson: {
    title: p => (C.grammar.find(g => g.id === p.id) || {}).title,
    html(p) {
      const i = C.grammar.findIndex(g => g.id === p.id), g = C.grammar[i];
      if (!g) return '<p>Урок не найден</p>';
      const st = Store.state.grammar[g.id];
      const prev = C.grammar[i - 1], next = C.grammar[i + 1];
      return `<article class="lesson">
        <div class="eyebrow">${lvlChip(g.level)} Урок грамматики ${st && st.done ? '· пройден ✓' : ''}</div>
        <h1 class="display">${esc(g.title)}</h1>
        <p class="lead">${esc(g.summary)}</p>
        <div class="lesson-body">${g.content}</div>
      </article>
      <button class="cta" data-run="grammar:${g.id}"><div class="cta-t"><span class="eyebrow">Практика · ${g.exercises.length} заданий</span><b>${st ? 'Повторить упражнения' : 'Закрепить на практике'}</b>${st ? `<span>Лучший результат: ${st.best}%</span>` : ''}</div><span class="cta-go">${ICON.play}</span></button>
      <div class="row between gap8 pager">
        ${prev ? `<button class="btn ghost" data-go="lesson" data-id="${prev.id}" data-replace="1">${ICON.back} ${esc(prev.title.split('(')[0].trim())}</button>` : '<span></span>'}
        ${next ? `<button class="btn ghost right" data-go="lesson" data-id="${next.id}" data-replace="1">${esc(next.title.split('(')[0].trim())} <span class="flip">${ICON.back}</span></button>` : ''}
      </div>`;
    },
    mount(el) {
      // примеры на изучаемом языке в уроке можно послушать по нажатию
      $$('.lesson-body .ex, .lesson-body td, .lesson-body b', el).forEach(n => {
        const txt = n.classList.contains('ex') ? (n.querySelector('b') || n).textContent : n.textContent;
        if (L.isTarget(txt)) {
          n.classList.add('speakable'); n.onclick = e => { e.stopPropagation(); Speech.say(txt.replace(/[—–].*$/, '')); };
        }
      });
    }
  },

  // ================= ТЕСТЫ =================
  tests: {
    title: 'Тесты',
    html() {
      const s = Store.state;
      const mist = Object.keys(s.mistakes).length;
      return `<h1 class="display page-h">${L.ui.h.tests}</h1><p class="lead">${L.ui.testsLead}</p>
      <button class="cta" data-run="placement"><div class="cta-t"><span class="eyebrow">${L.ui.placement}</span><b>Тест на определение уровня</b>
        <span>${s.placement ? `Последний результат: уровень ${s.placement.solid}, рекомендован ${s.placement.level}` : 'Адаптивный: от A1 до C1, пока получается'}</span></div><span class="cta-go">${ICON.target}</span></button>
      <h2 class="sec">По уровням</h2>
      <div class="lvl-grid">${LEVELS.map(l => {
        const t = s.tests[l]; const n = C.tests.filter(x => x.lvl === l).length;
        return `<div class="lvl-card ${t && t.passed ? 'passed' : ''}">
          <div class="row between"><span class="lvl-big">${l}</span>${t && t.passed ? `<span class="badge ok">${ICON.check} сдан</span>` : ''}</div>
          <small>${LEVEL_NAMES[l]} · ${n} вопросов в банке</small>
          ${t ? `<div class="muted small">Лучший: ${t.best}%</div>${bar(t.best / 100)}` : ''}
          <div class="row gap8"><button class="btn sm primary" data-run="test:${l}" ${n < 5 ? 'disabled' : ''}>Тест · 20</button>
          <button class="btn sm" data-run="exam:${l}" ${n < 10 ? 'disabled' : ''}>Экзамен</button></div></div>`;
      }).join('')}</div>
      <p class="muted small pad-x">Тест — 20 вопросов с разбором после каждого ответа. Экзамен — 30 вопросов за 20 минут, без подсказок, разбор в конце. Зачёт от 70%.</p>
      <h2 class="sec">Ещё проверки</h2>
      <div class="list">
        <button class="li" data-run="mistakes"><span class="li-ic warn">${ICON.redo}</span><span class="li-b"><b>Работа над ошибками</b><small>${mist ? `${mist} ${plural(mist, 'вопрос', 'вопроса', 'вопросов')} для повторения` : 'Ошибок пока нет'}</small></span></button>
        <button class="li" data-run="verbs"><span class="li-ic">${ICON.verb}</span><span class="li-b"><b>Спряжение глаголов</b><small>${L.ui.verbTenses}</small></span></button>
        <button class="li" data-run="global:quiz"><span class="li-ic">${ICON.target}</span><span class="li-b"><b>Тест по словам</b><small>Слова вашего уровня и изучаемые</small></span></button>
        <button class="li" data-run="global:article"><span class="li-ic">${ICON.layers}</span><span class="li-b"><b>${L.ui.genderTest[0]}</b><small>${L.ui.genderTest[1]}</small></span></button>
        <button class="li" data-run="global:speed"><span class="li-ic">${ICON.timer}</span><span class="li-b"><b>Скорость · 60 секунд</b><small>Рекорд: ${s.best.speed || 0}</small></span></button>
      </div>`;
    }
  },

  // ================= ЕЩЁ =================
  more: {
    title: 'Ещё',
    html() {
      const item = (go, ic, t, d) => `<button class="li" data-go="${go}"><span class="li-ic">${ICON[ic]}</span><span class="li-b"><b>${t}</b><small>${d}</small></span></button>`;
      const achN = Object.keys(Store.state.ach).length;
      return `<h1 class="display page-h">${L.ui.h.more}</h1>
      <h2 class="sec">Практика</h2><div class="list">
        ${item('reading', 'book', 'Чтение', `${DE.reading.length} текстов A1–C1 с вопросами и озвучкой`)}
        ${item('dialogues', 'chat', 'Диалоги', `${DE.dialogues.length} живых диалогов и ролевые игры`)}
        ${item('phrases', 'phrase', 'Разговорник', `${DE.phrases.length} ситуаций, ${DE.phrases.reduce((a, p) => a + p.items.length, 0)} фраз`)}
        ${item('verbs', 'verb', 'Глаголы', `${C.verbs.length} таблиц спряжения`)}
        ${item('dict', 'search', 'Словарь', 'Поиск по всем словам')}
      </div>
      ${L.other && L.other.length ? `<h2 class="sec">Другие языки</h2><div class="list">${L.other.map(o => `<a class="li" href="${o.href}"><span class="li-ic"><span class="flag flag-${o.flag}" aria-hidden="true"><i></i><i></i><i></i></span></span><span class="li-b"><b>${esc(o.t)}</b><small>${esc(o.d)}</small></span></a>`).join('')}</div>` : ''}
      <h2 class="sec">Прогресс</h2><div class="list">
        ${item('stats', 'chart', 'Статистика', 'Активность, точность, слова по уровням')}
        ${item('achievements', 'trophy', 'Достижения', `${achN} из ${ACH.length} получено`)}
        ${item('settings', 'gear', 'Настройки', 'Цель, озвучка, тема, резервная копия')}
      </div>`;
    }
  },

  // ================= ГЛАГОЛЫ =================
  verbs: {
    title: 'Глаголы',
    html() {
      const f = App.mem.verbFilter || Store.state.level;
      return `<h1 class="display page-h">${L.ui.h.verbs}</h1>
      <div class="search"><span>${ICON.search}</span><input id="vq" type="search" placeholder="Найти глагол" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(App.mem.verbQ || '')}"></div>
      ${levelFilter(f)}
      <button class="cta slim" data-run="verbs:${f}"><div class="cta-t"><b>Тренировать спряжение</b><span>${f === 'all' ? 'Глаголы до вашего уровня' : 'Глаголы уровня ' + f}</span></div><span class="cta-go">${ICON.play}</span></button>
      <div id="vlist" class="list"></div>`;
    },
    mount(el) {
      const f = App.mem.verbFilter || Store.state.level;
      $$('[data-filter]', el).forEach(b => b.onclick = () => { App.mem.verbFilter = b.dataset.filter; App.render(); });
      const inp = $('#vq', el), out = $('#vlist', el);
      const TYPES = { weak: 'слабый', strong: 'сильный', mixed: 'смешанный', modal: 'модальный', irregular: 'неправильный' };
      const run = () => {
        const q = norm(inp.value); App.mem.verbQ = inp.value;
        const ls = C.verbs.filter(v => (f === 'all' || v.lvl === f) && (!q || norm(v.inf).includes(q) || norm(v.ru).includes(q)));
        out.innerHTML = ls.map(v => `<button class="li" data-go="verb" data-id="${esc(v.inf)}"><span class="li-b"><b>${esc(v.inf)}</b><small>${esc(v.ru)} · ${TYPES[v.type] || ''}${v.sep ? ', отделяемый' : ''}</small></span>
          <span class="v-perf muted">${esc(L.verbSummary(v))}</span>${lvlChip(v.lvl)}</button>`).join('') || '<p class="muted pad">Не найдено</p>';
      };
      inp.oninput = run; run();
    }
  },
  verb: {
    title: p => p.id,
    html(p) {
      const v = C.verbByInf[p.id]; if (!v) return '<p>Не найдено</p>';
      return `<section class="topic-head"><div><h1 class="display">${esc(v.inf)}</h1><div class="muted">${esc(v.ru)} · ${lvlChip(v.lvl)}</div></div>
        <button class="btn round" data-say="${esc(v.inf)}">${ICON.sound}</button></section>
        ${L.verbView(v)}
        ${v.ex ? `<div class="card f-ex"><button class="mini-audio" data-say="${esc(v.ex)}">${ICON.sound}</button><div>${esc(v.ex)}<div class="muted">${esc(v.exRu || '')}</div></div></div>` : ''}
        <button class="cta slim" data-run="verb:${esc(v.inf)}"><div class="cta-t"><b>Тренировать этот глагол</b><span>${L.verbAll(v).length} заданий на все формы</span></div><span class="cta-go">${ICON.play}</span></button>
        <p class="muted small pad-x">Нажмите на форму, чтобы услышать её.</p>`;
    }
  },

  // ================= ЧТЕНИЕ =================
  reading: {
    title: 'Чтение',
    html() {
      const f = App.mem.readFilter || Store.state.level;
      const ls = DE.reading.filter(r => f === 'all' || r.lvl === f).sort((a, b) => LEVELS.indexOf(a.lvl) - LEVELS.indexOf(b.lvl));
      return `<h1 class="display page-h">${L.ui.h.reading}</h1>${levelFilter(f)}
      <div class="list">${ls.map(r => { const st = Store.state.reading[r.id];
        return `<button class="li" data-go="text" data-id="${r.id}"><span class="li-ic emoji">${r.emoji || '📄'}</span><span class="li-b"><b>${esc(r.title)}</b><small>${esc(r.ru)} · ${r.text.split(/\s+/).length} слов</small></span>
        ${st ? `<span class="pct">${st.best}%</span>` : ''}${lvlChip(r.lvl)}</button>`; }).join('')}</div>`;
    },
    mount(el) { $$('[data-filter]', el).forEach(b => b.onclick = () => { App.mem.readFilter = b.dataset.filter; App.render(); }); }
  },
  text: {
    title: p => (DE.reading.find(r => r.id === p.id) || {}).title,
    html(p) {
      const r = DE.reading.find(x => x.id === p.id); if (!r) return '';
      const paras = r.text.split(/\n\s*\n/).map(par => `<p>${par.split(/(\s+)/).map(tok => /\s+/.test(tok) ? tok : `<span class="tw">${esc(tok)}</span>`).join('')}</p>`).join('');
      return `<article class="reader">
        <div class="eyebrow">${lvlChip(r.lvl)} ${esc(r.ru)}</div>
        <h1 class="display">${esc(r.title)}</h1>
        <div class="row gap8"><button class="btn" id="readall">${ICON.play} Слушать текст</button><button class="btn ghost" id="readstop">${ICON.stop} Стоп</button></div>
        <div class="reader-body">${paras}</div>
        <p class="muted small">Нажмите на слово, чтобы услышать и увидеть перевод.</p>
        ${r.glossary && r.glossary.length ? `<h2 class="sec">Словарик</h2><div class="gloss">${r.glossary.map(g => `<button data-say="${esc(g.de)}"><b>${esc(g.de)}</b><span>${esc(g.ru)}</span></button>`).join('')}</div>` : ''}
      </article>
      <button class="cta" data-run="reading:${r.id}"><div class="cta-t"><span class="eyebrow">${r.questions.length} вопросов</span><b>Проверить понимание</b></div><span class="cta-go">${ICON.play}</span></button>`;
    },
    mount(el, p) {
      const r = DE.reading.find(x => x.id === p.id);
      let stop = false;
      $('#readall', el).onclick = async () => {
        stop = false;
        const ps = $$('.reader-body p', el);
        for (const n of ps) {
          if (stop) break;
          n.classList.add('reading');
          const sents = n.textContent.match(/[^.!?]+[.!?]*["“”]?/g) || [n.textContent];
          for (const s of sents) { if (stop) break; await Speech.say(s, { queue: true }); }
          n.classList.remove('reading');
        }
      };
      $('#readstop', el).onclick = () => { stop = true; Speech.stop(); $$('.reading', el).forEach(n => n.classList.remove('reading')); };
      $('.reader-body', el).addEventListener('click', e => {
        const t = e.target.closest('.tw'); if (!t) return;
        const word = t.textContent.replace(/[.,!?;:„“"()«»—–]/g, '');
        Speech.say(word);
        $$('.tw.on', el).forEach(x => x.classList.remove('on')); t.classList.add('on');
        const hit = C.lookup(word) || (r.glossary || []).find(g => g.de.toLowerCase() === word.toLowerCase());
        UI.toast(`<b>${esc(word)}</b>${hit ? ` — ${esc(hit.ru)}${hit.de && norm(hit.de) !== norm(word) ? ` <small>(${esc(hit.de)})</small>` : ''}` : ' <small>· нет в словаре</small>'}`, 2200);
      });
      App.onLeave = () => { stop = true; Speech.stop(); };
    }
  },

  // ================= ДИАЛОГИ =================
  dialogues: {
    title: 'Диалоги',
    html() {
      const f = App.mem.dialFilter || Store.state.level;
      const ls = DE.dialogues.filter(d => f === 'all' || d.lvl === f).sort((a, b) => LEVELS.indexOf(a.lvl) - LEVELS.indexOf(b.lvl));
      return `<h1 class="display page-h">${L.ui.h.dialogues}</h1>${levelFilter(f)}
      <div class="list">${ls.map(d => { const st = Store.state.dialogues[d.id];
        return `<button class="li" data-go="dialogue" data-id="${d.id}"><span class="li-ic emoji">${d.emoji || '💬'}</span><span class="li-b"><b>${esc(d.title)}</b><small>${esc(d.context || '')}</small></span>
        ${st ? `<span class="pct">${st.best}%</span>` : ''}${lvlChip(d.lvl)}</button>`; }).join('')}</div>`;
    },
    mount(el) { $$('[data-filter]', el).forEach(b => b.onclick = () => { App.mem.dialFilter = b.dataset.filter; App.render(); }); }
  },
  dialogue: {
    title: p => (DE.dialogues.find(d => d.id === p.id) || {}).title,
    html(p) {
      const d = DE.dialogues.find(x => x.id === p.id); if (!d) return '';
      const sp = uniq(d.lines.map(l => l.s));
      const showRu = Store.state.settings.showRu;
      return `<section class="topic-head"><span class="t-emoji big">${d.emoji || '💬'}</span><div><h1 class="display">${esc(d.title)}</h1><div class="muted">${lvlChip(d.lvl)} ${esc(d.context || '')}</div></div></section>
      <div class="row gap8 wrap"><button class="btn sm" id="playall">${ICON.play} Слушать</button><button class="btn sm ghost" id="stopall" aria-label="Стоп">${ICON.stop}</button>
        <button class="btn sm ghost" id="toggleRu">${ICON.eye} ${showRu ? 'Скрыть перевод' : 'Показать перевод'}</button></div>
      <div class="chat ${showRu ? '' : 'no-ru'}">${d.lines.map((l, i) => `<button class="bubble ${sp.indexOf(l.s) % 2 ? 'me' : 'them'}" data-line="${i}">
        <b>${esc(l.s)}</b>${esc(l.de)}<span class="b-ru">${esc(l.ru)}</span></button>`).join('')}</div>
      <div class="row gap8 stack-sm">
        ${d.quiz && d.quiz.length ? `<button class="cta grow" data-run="dialogue:${d.id}"><div class="cta-t"><b>Вопросы</b><span>${d.quiz.length} на понимание</span></div><span class="cta-go">${ICON.play}</span></button>` : ''}
        <button class="cta grow alt" data-run="roleplay:${d.id}"><div class="cta-t"><b>Ролевая игра</b><span>Говорите за «${esc(sp[1] || sp[0])}»</span></div><span class="cta-go">${ICON.chat}</span></button>
      </div>`;
    },
    mount(el, p) {
      const d = DE.dialogues.find(x => x.id === p.id);
      const sp = uniq(d.lines.map(l => l.s));
      let stop = false;
      const pitch = s => [1, 0.8, 1.2, 0.95][sp.indexOf(s) % 4];
      $$('.bubble', el).forEach(b => b.onclick = () => { const l = d.lines[+b.dataset.line]; Speech.say(l.de, { pitch: pitch(l.s) }); });
      $('#playall', el).onclick = async () => {
        stop = false;
        for (const [i, l] of d.lines.entries()) {
          if (stop) break;
          const b = $(`[data-line="${i}"]`, el); b.classList.add('reading'); b.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          await Speech.say(l.de, { pitch: pitch(l.s), queue: true });
          b.classList.remove('reading');
        }
      };
      $('#stopall', el).onclick = () => { stop = true; Speech.stop(); $$('.reading', el).forEach(n => n.classList.remove('reading')); };
      $('#toggleRu', el).onclick = () => { Store.state.settings.showRu = !Store.state.settings.showRu; Store.save(); App.render(); };
      App.onLeave = () => { stop = true; Speech.stop(); };
    }
  },

  // ================= РАЗГОВОРНИК =================
  phrases: {
    title: 'Разговорник',
    html() {
      const ls = DE.phrases.slice().sort((a, b) => LEVELS.indexOf(a.lvl) - LEVELS.indexOf(b.lvl));
      return `<h1 class="display page-h">${L.ui.h.phrases}</h1><p class="lead">Готовые фразы для реальных ситуаций</p>
      <div class="topics">${ls.map(p => { const pr = C.topicProgress('ph:' + p.id);
        return `<button class="topic" data-go="phraseset" data-id="${p.id}"><span class="t-emoji">${p.emoji || '💬'}</span>
        <span class="t-b"><b>${esc(p.title)}</b><small>${p.items.length} фраз</small></span><span class="t-f">${lvlChip(p.lvl)}<small>${pr.known}/${pr.total}</small></span>${bar(pr.pct)}</button>`; }).join('')}</div>`;
    }
  },
  phraseset: {
    title: p => (DE.phrases.find(x => x.id === p.id) || {}).title,
    html(p) {
      const ph = DE.phrases.find(x => x.id === p.id); if (!ph) return '';
      return `<section class="topic-head"><span class="t-emoji big">${ph.emoji || '💬'}</span><div><h1 class="display">${esc(ph.title)}</h1><div class="muted">${lvlChip(ph.lvl)} ${ph.items.length} фраз</div></div></section>
      <div class="modes">${['flash', 'quiz', 'listen', 'order'].map(m => modeTile(`phr:${ph.id}:${m}`, m)).join('')}</div>
      <div class="wlist">${ph.words.map(w => Screens.wordRow(w)).join('')}</div>`;
    }
  },

  // ================= СТАТИСТИКА =================
  stats: {
    title: 'Статистика',
    html() {
      const s = Store.state;
      const acc = s.stats.answers ? Math.round(s.stats.correct / s.stats.answers * 100) : 0;
      // 14 дней XP
      const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(Date.now() - (13 - i) * DAY); const k = dayKey(d); return { k, d, xp: (s.days[k] || {}).xp || 0 }; });
      const max = Math.max(s.settings.goal, ...days.map(d => d.xp));
      const wd = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      const goalY = 100 - s.settings.goal / max * 100;
      // тепловая карта 18 недель
      const weeks = 18, start = new Date(); start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - (weeks - 1) * 7);
      const cells = [];
      for (let i = 0; i < weeks * 7; i++) { const d = new Date(start.getTime() + i * DAY); const k = dayKey(d); const xp = (s.days[k] || {}).xp || 0; cells.push({ k, xp, future: d > new Date() }); }
      const lvlOf = xp => xp <= 0 ? 0 : xp < s.settings.goal * 0.5 ? 1 : xp < s.settings.goal ? 2 : xp < s.settings.goal * 2 ? 3 : 4;
      const byLvl = LEVELS.map(l => { const ws = C.words.filter(w => w.lvl === l); const k = ws.filter(w => Store.isKnown(w.key)).length; return { l, n: ws.length, k }; });
      const boxes = [0, 0, 0, 0]; Object.values(s.srs).forEach(r => boxes[r.b >= 5 ? 3 : r.b >= 2 ? 2 : r.b >= 1 ? 1 : 0]++);
      return `<h1 class="display page-h">${L.ui.h.stats}</h1>
      <div class="tiles">
        <div class="tile"><b>${s.xp}</b><span>XP всего</span></div>
        <div class="tile"><b>${Store.streak()}</b><span>серия · рекорд ${Store.bestStreak()}</span></div>
        <div class="tile"><b>${Ach.known()}</b><span>слов знаю</span></div>
        <div class="tile"><b>${acc}%</b><span>точность · ${s.stats.answers} ответов</span></div>
        <div class="tile"><b>${s.level}</b><span>мой уровень</span></div>
        <div class="tile"><b class="tile-diff">${Adapt.dots()}</b><span>сложность · ${Adapt.label()}</span></div>
      </div>
      <h2 class="sec">XP за 14 дней</h2>
      <div class="card chart"><div class="bars" role="img" aria-label="XP по дням">
        ${goalY < 85 ? `<div class="goal-line" style="top:${goalY}%"><span>цель ${s.settings.goal}</span></div>` : ''}
        ${days.map(d => `<button class="bcol" data-tip="${d.d.getDate()}.${d.d.getMonth() + 1}: ${d.xp} XP"><i style="height:${d.xp / max * 100}%" class="${d.xp >= s.settings.goal ? 'met' : ''}"></i><span>${wd[d.d.getDay()]}</span></button>`).join('')}
      </div><div class="chart-tip muted small" id="tip">Нажмите на столбик, чтобы увидеть значение</div></div>
      <h2 class="sec">Активность</h2>
      <div class="card"><div class="heat-wrap"><div class="heat">${cells.map(c => `<i class="h${c.future ? 'f' : lvlOf(c.xp)}" title="${c.k}: ${c.xp} XP"></i>`).join('')}</div></div>
        <div class="heat-leg muted small">меньше <i class="h0"></i><i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i> больше</div></div>
      <h2 class="sec">Слова по уровням</h2>
      <div class="card cats">${byLvl.map(x => `<div class="cat"><span>${lvlChip(x.l)}</span>${bar(x.n ? x.k / x.n : 0)}<b>${x.k}/${x.n}</b></div>`).join('')}</div>
      <h2 class="sec">Интервальное повторение</h2>
      <div class="tiles four">${['новые', 'учу', 'знаю', 'выучено'].map((l, i) => `<div class="tile"><b>${i === 0 ? C.words.length - Object.keys(s.srs).filter(k => k[0] === 'w').length : boxes[i]}</b><span>${l}</span></div>`).join('')}</div>`;
    },
    mount(el) { $$('.bcol', el).forEach(b => b.onclick = () => { $('#tip', el).textContent = b.dataset.tip; $$('.bcol.on', el).forEach(x => x.classList.remove('on')); b.classList.add('on'); }); }
  },
  achievements: {
    title: 'Достижения',
    html() {
      const s = Store.state;
      return `<h1 class="display page-h">${L.ui.h.ach}</h1><p class="lead">${Object.keys(s.ach).length} из ${ACH.length}</p>
      <div class="ach">${ACH.map(a => `<div class="ach-i ${s.ach[a.id] ? 'got' : ''}"><span class="ach-ic">${a.ic}</span><b>${a.t}</b><small>${a.d}</small>
        ${s.ach[a.id] ? `<small class="muted">${new Date(s.ach[a.id]).toLocaleDateString('ru-RU')}</small>` : ''}</div>`).join('')}</div>`;
    }
  },

  // ================= НАСТРОЙКИ =================
  settings: {
    title: 'Настройки',
    html() {
      const st = Store.state.settings, s = Store.state;
      const seg = (name, cur, opts) => `<div class="seg" data-set="${name}">${opts.map(([v, l]) => `<button class="${String(cur) === String(v) ? 'on' : ''}" data-v="${v}">${l}</button>`).join('')}</div>`;
      const voices = Speech.voices;
      const c = C.counts();
      return `<h1 class="display page-h">${L.ui.h.settings}</h1>
      <div class="form">
        <label class="f-row"><span>Мой уровень</span>${seg('level', s.level, LEVELS.map(l => [l, l]))}</label>
        <label class="f-row"><span>Цель на день</span>${seg('goal', st.goal, [[20, '20'], [50, '50'], [100, '100'], [200, '200']])}<small class="muted">XP в день</small></label>
        <label class="f-row"><span>Новых слов в день</span>${seg('newPerDay', st.newPerDay, [[5, '5'], [10, '10'], [15, '15'], [25, '25']])}</label>
        <label class="f-row"><span>Тема</span>${seg('theme', st.theme, [['system', 'Авто'], ['light', 'Светлая'], ['dark', 'Тёмная']])}</label>
        <div class="f-row"><span>Скорость речи · <b id="rateV">${st.rate.toFixed(2)}</b></span><input type="range" id="rate" min="0.5" max="1.2" step="0.05" value="${st.rate}"></div>
        <div class="f-row"><span>Голос</span><select id="voice"><option value="">Автоматически</option>${voices.map(v => `<option value="${esc(v.voiceURI)}" ${st.voice === v.voiceURI ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</select>
          <button class="btn sm" data-say="${esc(L.ui.voiceTest)}">${ICON.sound} Проверить</button>
          ${!voices.length ? `<small class="muted">${L.ui.voiceMissing}</small>` : ''}</div>
        <label class="f-row sw"><span>Подстраивать сложность<small class="muted block">Сейчас: ${Adapt.label()}. Верные ответы — сложнее, ошибки — проще.</small></span><input type="checkbox" id="adaptive" ${st.adaptive !== false ? 'checked' : ''}></label>
        <label class="f-row sw"><span>Автоматически озвучивать</span><input type="checkbox" id="autoplay" ${st.autoplay ? 'checked' : ''}></label>
        <label class="f-row sw"><span>Звуки ответов</span><input type="checkbox" id="sound" ${st.sound ? 'checked' : ''}></label>
      </div>
      <h2 class="sec">Резервная копия</h2>
      <div class="card">
        <p class="small muted">Прогресс хранится только на этом устройстве. Скопируйте код, чтобы перенести его или сохранить.</p>
        <div class="row gap8 wrap"><button class="btn" id="exp">${ICON.copy} Скопировать прогресс</button><button class="btn" id="imp">Вставить прогресс</button></div>
        <textarea id="bk" rows="3" hidden placeholder="Вставьте сюда скопированный код прогресса"></textarea>
        <button class="btn primary" id="impgo" hidden>Загрузить</button>
      </div>
      <h2 class="sec">О приложении</h2>
      <div class="card small"><p><b>${L.name}</b> — ${c.words} слов в ${c.topics} темах, ${c.grammar} уроков грамматики, ${c.tests} тестовых вопросов, ${c.verbs} глаголов, ${c.reading} текстов, ${c.dialogues} диалогов, ${c.phrases} разделов разговорника.</p>
        <p class="muted">Работает без интернета после первого открытия. Совет: в Safari нажмите «Поделиться» → «На экран „Домой“».</p>
        <button class="btn danger" id="reset">Сбросить весь прогресс</button></div>`;
    },
    mount(el) {
      const s = Store.state, st = s.settings;
      $$('[data-set]', el).forEach(g => g.addEventListener('click', e => {
        const b = e.target.closest('[data-v]'); if (!b) return;
        e.preventDefault();
        const k = g.dataset.set, v = b.dataset.v;
        if (k === 'level') { s.level = v; App.mem = {}; } else st[k] = isNaN(+v) ? v : +v;
        Store.save(); if (k === 'theme') App.applyTheme(); App.render();
      }));
      $('#rate', el).oninput = e => { st.rate = +e.target.value; $('#rateV', el).textContent = st.rate.toFixed(2); Store.save(); };
      $('#rate', el).onchange = () => Speech.say(L.ui.greet(12)[0]);
      $('#voice', el).onchange = e => { st.voice = e.target.value; Store.save(); Speech.say(L.ui.greet(12)[0]); };
      $('#autoplay', el).onchange = e => { st.autoplay = e.target.checked; Store.save(); };
      $('#adaptive', el).onchange = e => { st.adaptive = e.target.checked; Store.save(); App.render(); };
      $('#sound', el).onchange = e => { st.sound = e.target.checked; Store.save(); };
      $('#exp', el).onclick = () => {
        const data = Store.export();
        const ta = $('#bk', el);
        const fallback = () => { ta.hidden = false; ta.value = data; ta.select(); UI.toast('Выделите и скопируйте текст'); };
        try { navigator.clipboard.writeText(data).then(() => UI.toast('Прогресс скопирован')).catch(fallback); } catch (e) { fallback(); }
      };
      $('#imp', el).onclick = () => { const ta = $('#bk', el); ta.hidden = false; ta.value = ''; $('#impgo', el).hidden = false; ta.focus(); };
      $('#impgo', el).onclick = async () => {
        if (!(await UI.confirm('Загрузить прогресс?', 'Текущий прогресс на этом устройстве будет заменён.', 'Загрузить'))) return;
        try { Store.import($('#bk', el).value.trim()); UI.toast('Прогресс загружен'); App.applyTheme(); App.render(); } catch (e) { UI.toast('Не получилось: ' + esc(e.message)); }
      };
      $('#reset', el).onclick = async () => {
        if (!(await UI.confirm('Сбросить прогресс?', 'Все слова, результаты тестов и достижения будут удалены. Это нельзя отменить.', 'Сбросить', true))) return;
        Store.reset(); App.applyTheme(); App.tab('home'); UI.toast('Прогресс сброшен');
      };
    }
  }
};
