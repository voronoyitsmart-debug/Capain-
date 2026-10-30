// Движок учебной сессии: показывает вопросы, проверяет, объясняет ошибки, подстраивает сложность
const Engine = {
  s: null,
  start(cfg) {
    const qs = (cfg.questions || []).filter(Boolean);
    if (!qs.length && !cfg.gen) { UI.toast('Здесь пока нечего тренировать'); return; }
    Speech.stop();
    this.s = Object.assign({ mode: 'learn', requeue: true, xp: 5, title: 'Тренировка' }, cfg, {
      queue: qs.slice(), done: [], total: qs.length, correct: 0, combo: 0, maxCombo: 0, xpGained: 0,
      t0: Date.now(), cur: null, locked: false, adaptive: false
    });
    let el = $('#session');
    if (!el) { el = document.createElement('div'); el.id = 'session'; document.body.appendChild(el); }
    el.innerHTML = `<div class="ses-top">
        <button class="icon-btn" id="ses-close" aria-label="Закрыть">${ICON.close}</button>
        <div class="ses-bar"><i id="ses-prog"></i></div>
        <div class="ses-diff" id="ses-diff"></div>
        <div class="ses-meta" id="ses-meta"></div>
      </div>
      <div class="ses-body" id="ses-body"></div>
      <div class="ses-foot" id="ses-foot"></div>`;
    el.hidden = false;
    document.body.classList.add('in-session');
    $('#ses-close').onclick = () => this.quit();
    if (this.s.timeLimit) this.startTimer();
    this.next();
  },
  async quit() {
    const s = this.s;
    if (s && !s.finished && s.done.length > 2) {
      if (!(await UI.confirm('Закончить тренировку?', 'Прогресс по уже отвеченным вопросам сохранится.', 'Закончить'))) return;
    }
    this.close();
  },
  close() {
    Speech.stop();
    if (this.s && this.s.timer) clearInterval(this.s.timer);
    this.s = null;
    const el = $('#session'); if (el) { el.hidden = true; el.innerHTML = ''; }
    document.body.classList.remove('in-session');
    App.refresh();
  },
  startTimer() {
    const s = this.s;
    s.tEnd = Date.now() + s.timeLimit * 1000;
    const tick = () => {
      if (this.s !== s) return clearInterval(s.timer);
      const left = Math.max(0, Math.ceil((s.tEnd - Date.now()) / 1000));
      const m = $('#ses-meta');
      if (m) m.innerHTML = `<span class="timer ${left <= 10 ? 'hot' : ''}">${ICON.timer}${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}</span>`;
      if (left <= 0) { clearInterval(s.timer); this.finish(); }
    };
    tick();
    s.timer = setInterval(tick, 250);
  },
  progress() {
    const s = this.s;
    const p = s.gen ? (s.timeLimit ? 1 - (s.tEnd - Date.now()) / (s.timeLimit * 1000) : s.done.length / (s.totalHint || 30))
      : s.done.length / (s.done.length + s.queue.length + (s.cur ? 1 : 0) || 1);
    $('#ses-prog').style.width = (clamp(p, 0, 1) * 100) + '%';
    if (!s.timeLimit) {
      $('#ses-meta').innerHTML = s.combo >= 3 ? `<span class="combo">${ICON.bolt}${s.combo}</span>`
        : `<span class="count">${s.gen ? s.done.length + 1 : Math.min(s.done.length + 1, s.total) + '/' + s.total}</span>`;
    }
    const d = $('#ses-diff');
    if (d) d.innerHTML = s.adaptive && Adapt.on() && s.mode === 'learn' ? Adapt.dots() : '';
  },
  next() {
    const s = this.s; if (!s) return;
    s.locked = false;
    let q = null;
    // вопросы по словам строятся в момент показа — с учётом текущей сложности
    while (!q) {
      let item = s.gen ? s.gen() : s.queue.shift();
      if (item === undefined || item === null) { if (s.gen || !s.queue.length) break; continue; }
      q = typeof item === 'function' ? item() : item;
      if (s.gen) break;
    }
    if (!q) return this.finish();
    if (q.adapt) s.adaptive = true;
    s.cur = q; q._t0 = Date.now();
    this.progress();
    const body = $('#ses-body'), foot = $('#ses-foot');
    foot.innerHTML = ''; foot.className = 'ses-foot';
    body.className = 'ses-body kind-' + q.kind;
    body.innerHTML = '';
    this['r_' + q.kind].call(this, q, body, foot);
    body.scrollTop = 0;
    if (q.autoplay && Store.state.settings.autoplay && q.say) setTimeout(() => Speech.say(q.say), 200);
    $$('[data-say]', body).forEach(b => b.onclick = () => Speech.say(b.dataset.say || q.say));
  },
  head(q) {
    return `<div class="q-label">${q.label || ''}</div><div class="q-prompt">${q.prompt || ''}</div>`;
  },

  // ---------- Выбор варианта ----------
  r_choice(q, body) {
    body.innerHTML = this.head(q) + `<div class="opts ${q.style === 'articles' ? 'opts-art' : ''}">${q.options.map((o, i) =>
      `<button class="opt ${o.cls || ''}" data-i="${i}"><span class="opt-k">${i + 1}</span><span class="opt-t">${o.html}</span></button>`).join('')}</div>`;
    $$('.opt', body).forEach(b => b.onclick = () => this.pickChoice(q, +b.dataset.i));
  },
  pickChoice(q, i) {
    const s = this.s; if (s.locked) return;
    s.locked = true;
    const ok = i === q.a;
    const btns = $$('.opt', $('#ses-body'));
    if (s.mode === 'exam') {
      btns[i].classList.add('picked');
      return this.record(q, ok, q.options[i].html, () => setTimeout(() => this.next(), 220), false, ok ? '' : this.choiceWhy(q, i));
    }
    btns.forEach((b, j) => { b.disabled = true; if (j === q.a) b.classList.add('right'); else if (j === i) b.classList.add('wrong'); else b.classList.add('dim'); });
    const why = ok ? '' : this.choiceWhy(q, i);
    this.record(q, ok, q.options[i].html, null, false, why);
    if (s.mode === 'speed') return setTimeout(() => this.next(), ok ? 280 : 1100);
    this.feedback(q, ok, ok ? '' : `Правильно: <b>${q.options[q.a].html}</b>` + why, false,
      !ok && q.style !== 'articles' ? { kind: 'choice', i } : null);
  },
  choiceWhy(q, i) {
    const w = Explain.choice(q, i);
    return w || `<div class="why"><div>Вы выбрали: <s>${q.options[i].html}</s></div></div>`;
  },

  // ---------- Ввод текста ----------
  r_input(q, body, foot) {
    body.innerHTML = this.head(q) + `
      <div class="inp-wrap">${q.prefix ? `<span class="inp-prefix">${esc(q.prefix)}</span>` : ''}
        <input id="ans" class="inp" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="Ваш ответ" aria-label="Ваш ответ"></div>
      <div class="uml">${['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map(c => `<button data-c="${c}">${c}</button>`).join('')}</div>`;
    foot.innerHTML = `<button class="btn ghost" id="dontknow">Не знаю</button><button class="btn primary grow" id="check">Проверить</button>`;
    const inp = $('#ans');
    $$('.uml button', body).forEach(b => b.onclick = e => {
      e.preventDefault();
      const p = inp.selectionStart ?? inp.value.length;
      inp.value = inp.value.slice(0, p) + b.dataset.c + inp.value.slice(inp.selectionEnd ?? p);
      inp.focus(); inp.setSelectionRange(p + 1, p + 1);
    });
    const submit = () => {
      if (this.s.locked) return;
      const v = inp.value;
      if (!v.trim()) { inp.focus(); return; }
      const r = this.checkInput(q, v);
      this.s.locked = true;
      inp.disabled = true;
      inp.classList.add(r.ok ? 'right' : 'wrong');
      const why = r.ok ? '' : (r.note ? `<div class="note">${r.note}</div>` : '') + Explain.input(q, v);
      this.record(q, r.ok, esc(v), null, false, why);
      if (this.s.mode === 'exam') return this.next();
      this.feedback(q, r.ok, (r.ok && !r.note ? '' : `Ответ: <b>${q.reveal}</b>`) + (r.ok && r.note ? `<div class="note">${r.note}</div>` : '') + why,
        r.warn, r.ok ? null : { kind: 'input', given: v });
    };
    $('#check').onclick = submit;
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    $('#dontknow').onclick = () => {
      if (this.s.locked) return; this.s.locked = true; inp.disabled = true;
      const why = q.verb ? Explain.verb(q.verb, q.tense, q.person, '') : (q.w && q.w.t === 'n' ? Explain.gender(q.w) : '');
      this.record(q, false, '—', null, false, why);
      this.feedback(q, false, `Ответ: <b>${q.reveal}</b>` + why);
    };
    setTimeout(() => inp.focus(), 60);
  },
  // проверка письменного ответа: точный ответ → принятые ранее → «мягкие» → синонимы
  checkInput(q, v) {
    let res = checkAnswer(v, q.answers, q.strict);
    if (res === 'ok') return { ok: true };
    if (res === 'noumlaut') return { ok: false, note: `Не хватает умлаута: правильно <b>${esc(q.answers[0])}</b>. Умлаут меняет форму и смысл (schon — «уже», schön — «красивый»).` };
    if (res === 'typo') return { ok: true, warn: true, note: 'Засчитано, но есть опечатка — сравните с ответом выше' };
    if (res === 'umlaut') return { ok: true, warn: true, note: 'Засчитано. Попробуйте писать умлауты: ä ö ü ß' };
    if (q.accepted && q.accepted.length && checkAnswer(v, q.accepted, true) === 'ok') return { ok: true, note: 'Засчитано — этот вариант вы раньше отметили как верный' };
    for (const s of q.soft || []) if (['ok', 'umlaut'].includes(checkAnswer(v, [s.a], q.strict))) return { ok: true, warn: true, note: s.note };
    for (const x of q.synonyms || []) {
      if (['ok', 'umlaut'].includes(checkAnswer(v, C.variants(x.de), true))) return { ok: true, warn: true, note: `Тоже верно: ${deHTML(x)} — «${esc(x.ru)}». Здесь загадано слово ${deHTML(q.w)}.` };
    }
    return { ok: false };
  },

  // ---------- Сборка предложения ----------
  r_order(q, body, foot) {
    const bank = shuffle(q.tokens.map((t, i) => ({ t, i })));
    if (bank.length > 2 && bank.every((b, j) => b.i === j)) bank.push(bank.shift());
    body.innerHTML = this.head(q) + `<div class="ord-ans" id="ord-ans"></div><div class="ord-bank" id="ord-bank">${bank.map(b =>
      `<button class="tok" data-i="${b.i}">${esc(b.t)}</button>`).join('')}</div>`;
    foot.innerHTML = `<button class="btn ghost" id="dontknow">Не знаю</button><button class="btn primary grow" id="check" disabled>Проверить</button>`;
    const ans = $('#ord-ans'), bk = $('#ord-bank');
    const upd = () => { $('#check').disabled = bk.querySelectorAll('.tok:not(.used)').length > 0; };
    bk.addEventListener('click', e => {
      const b = e.target.closest('.tok'); if (!b || b.classList.contains('used') || this.s.locked) return;
      Sound.tap();
      b.classList.add('used');
      const c = document.createElement('button'); c.className = 'tok in'; c.textContent = b.textContent; c.dataset.i = b.dataset.i;
      ans.appendChild(c); upd();
    });
    ans.addEventListener('click', e => {
      const c = e.target.closest('.tok'); if (!c || this.s.locked) return;
      const src = bk.querySelector(`.tok.used[data-i="${c.dataset.i}"]`); if (src) src.classList.remove('used');
      c.remove(); upd();
    });
    const right = esc(q.tokens.join(' ') + q.tail);
    $('#check').onclick = () => {
      if (this.s.locked) return;
      this.s.locked = true;
      const given = $$('.tok', ans).map(t => t.textContent);
      const g = norm(given.join(' '));
      let ok = g === norm(q.tokens.join(' ')), note = '';
      if (!ok && (q.alts || []).some(a => norm(a) === g)) { ok = true; note = `Тоже верно! Основной вариант: <b>${right}</b>`; }
      if (!ok && (q.accepted || []).includes(g)) { ok = true; note = 'Засчитано — этот вариант вы раньше отметили как верный'; }
      ans.classList.add(ok ? 'right' : 'wrong');
      const why = ok ? '' : Explain.order(q, given);
      this.record(q, ok, esc(given.join(' ')), null, false, why);
      if (this.s.mode === 'exam') return this.next();
      this.feedback(q, ok, (ok ? '' : `Правильно: <b>${right}</b>`) + (note ? `<div class="note">${note}</div>` : '') + why, false,
        ok ? null : { kind: 'order', given: given.join(' ') });
    };
    $('#dontknow').onclick = () => {
      if (this.s.locked) return; this.s.locked = true;
      const why = Explain.order(q, []);
      this.record(q, false, '—', null, false, why);
      this.feedback(q, false, `Правильно: <b>${right}</b>` + why);
    };
  },

  // ---------- Карточка ----------
  r_flash(q, body, foot) {
    const w = q.w;
    const tag = { n: 'существительное', v: 'глагол', adj: 'прилагательное', adv: 'наречие', phr: 'фраза', other: 'слово' }[w.t] || '';
    body.innerHTML = `<div class="flash" id="flash" tabindex="0" role="button" aria-label="Перевернуть карточку">
      <div class="flash-in">
        <div class="face front ${artClass(w.de)}">
          <div class="f-tag">${tag} · ${w.lvl}</div>
          <div class="f-word">${deHTML(w)}</div>
          ${w.t === 'n' && w.pl && w.pl !== '-' ? `<div class="f-pl">${esc(w.pl)}</div>` : ''}
          <div class="f-hint">Нажмите, чтобы перевернуть</div>
        </div>
        <div class="face back ${artClass(w.de)}">
          <div class="f-tag">${deHTML(w)}</div>
          <div class="f-ru">${esc(w.ru)}</div>
          ${w.ex && w.ex !== w.de ? `<div class="f-ex"><button class="mini-audio" data-say="${esc(w.ex)}">${ICON.sound}</button><div>${esc(w.ex)}<div class="muted">${esc(w.exRu || '')}</div></div></div>` : ''}
          ${w.t === 'n' ? Explain.gender(w) : ''}
        </div>
      </div></div>
      <div class="row center gap8"><button class="btn round" data-say="${esc(w.de)}" aria-label="Послушать">${ICON.sound}</button>
      <button class="btn round" id="slow" aria-label="Медленно">${ICON.slow}</button></div>`;
    $('#slow').onclick = () => Speech.say(w.de, { slow: true });
    const flash = $('#flash');
    const flip = () => {
      flash.classList.toggle('flipped');
      if (flash.classList.contains('flipped') && !foot.innerHTML) {
        foot.className = 'ses-foot grades';
        foot.innerHTML = [['Не знаю', 0, 'g0'], ['Трудно', 1, 'g1'], ['Знаю', 2, 'g2'], ['Легко', 3, 'g3']].map(([l, g, c]) =>
          `<button class="btn grade ${c}" data-g="${g}">${l}</button>`).join('');
        $$('[data-g]', foot).forEach(b => b.onclick = () => this.grade(q, +b.dataset.g));
      }
    };
    flash.onclick = e => { if (!e.target.closest('[data-say]')) flip(); };
    flash.onkeydown = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); } };
    if (Store.state.settings.autoplay) setTimeout(() => Speech.say(w.de), 250);
  },
  grade(q, g) {
    const s = this.s; if (s.locked) return; s.locked = true;
    Store.srsGrade(q.key, g);
    const ok = g >= 2;
    Store.answer(ok);
    if (ok) { s.correct++; Store.fixMistake(q.key); this.gain(3); } else if (s.requeue && !q._re) { s.queue.push(Object.assign({}, q, { _re: true })); }
    s.done.push({ q, ok, given: ['не знаю', 'трудно', 'знаю', 'легко'][g] });
    Store.save();
    this.next();
  },

  // ---------- Пары ----------
  r_match(q, body) {
    const L = shuffle(q.pairs.map((p, i) => ({ i, h: p.lh || esc(p.l), say: p.l })));
    const R = shuffle(q.pairs.map((p, i) => ({ i, h: esc(p.r) })));
    body.innerHTML = this.head(q) + `<div class="match"><div class="mcol">${L.map(x => `<button class="mt" data-side="l" data-i="${x.i}" data-s="${esc(x.say)}">${x.h}</button>`).join('')}</div>
      <div class="mcol">${R.map(x => `<button class="mt" data-side="r" data-i="${x.i}">${x.h}</button>`).join('')}</div></div>
      <div class="match-why" id="match-why" aria-live="polite"></div>`;
    let sel = null; const bad = new Set(); let left = q.pairs.length;
    body.querySelector('.match').addEventListener('click', e => {
      const b = e.target.closest('.mt'); if (!b || b.classList.contains('done')) return;
      if (b.dataset.side === 'l' && Store.state.settings.autoplay) Speech.say(b.dataset.s);
      if (!sel || sel.dataset.side === b.dataset.side) { $$('.mt.sel', body).forEach(x => x.classList.remove('sel')); sel = b; b.classList.add('sel'); return; }
      const a = sel; sel = null; a.classList.remove('sel');
      if (a.dataset.i === b.dataset.i) {
        [a, b].forEach(x => { x.classList.add('done'); x.disabled = true; });
        Sound.ok(); left--;
        if (!left) {
          q.pairs.forEach((p, i) => { const ok = !bad.has(i); this.record({ key: p.key, srs: true, kind: 'pair', label: p.l }, ok, '', null, true); });
          this.s.done.push({ q, ok: bad.size === 0, given: '' });
          setTimeout(() => this.next(), 450);
        }
      } else {
        bad.add(+a.dataset.i); bad.add(+b.dataset.i);
        [a, b].forEach(x => { x.classList.add('shake'); setTimeout(() => x.classList.remove('shake'), 400); });
        // объясняем, что на самом деле значит выбранная пара
        const l = a.dataset.side === 'l' ? a : b, r = a.dataset.side === 'r' ? a : b;
        const pl = q.pairs[+l.dataset.i], pr = q.pairs[+r.dataset.i];
        $('#match-why').innerHTML = `<b>${pl.lh || esc(pl.l)}</b> — «${esc(pl.r)}», а «${esc(pr.r)}» — <b>${pr.lh || esc(pr.l)}</b>`;
        Sound.bad();
      }
    });
  },

  // ---------- Учёт ответа ----------
  record(q, ok, given, after, silent, why) {
    const s = this.s;
    Store.answer(ok);
    if (q.key) {
      if (q.srs) Store.srsAnswer(q.key, ok);
      if (ok) Store.fixMistake(q.key); else Store.mistake(q.key);
    }
    if (ok) {
      s.correct++; s.combo++; s.maxCombo = Math.max(s.maxCombo, s.combo);
      this.gain(s.xp + (s.combo > 0 && s.combo % 5 === 0 ? 5 : 0));
      if (s.mode !== 'exam' && !silent) Sound.ok();
    } else {
      s.combo = 0;
      if (s.mode !== 'exam' && !silent) Sound.bad();
      if (s.requeue && s.mode === 'learn' && !q._re && q.kind !== 'pair') { s.queue.push(Object.assign({}, q, { _re: true })); }
    }
    // адаптивная сложность: верно — сложнее, ошибка — шаг назад
    if (q.adapt && s.mode === 'learn' && !q._re) {
      const ch = Adapt.answer(ok, Date.now() - (q._t0 || Date.now()));
      if (ch) this.diffChanged(ch);
    }
    if (q.kind !== 'pair') s.done.push({ q, ok, given, why });
    Store.save();
    this.progress();
    if (after) after();
  },
  diffChanged(ch) {
    const d = $('#ses-diff'); if (!d) return;
    const pill = document.createElement('span');
    pill.className = 'diff-pill ' + ch;
    pill.textContent = ch === 'up' ? `Сложнее ↑ ${Adapt.label()}` : `Проще ↓ ${Adapt.label()}`;
    $('#ses-body').prepend(pill);
    setTimeout(() => pill.remove(), 2400);
  },
  gain(n) { this.s.xpGained += n; Store.addXP(n); },

  feedback(q, ok, html, warn, override) {
    const foot = $('#ses-foot');
    foot.className = 'ses-foot fb ' + (ok ? (warn ? 'fb-warn' : 'fb-ok') : 'fb-bad');
    const title = ok ? (warn ? 'Засчитано' : pick(['Richtig!', 'Super!', 'Genau!', 'Toll!', 'Prima!', 'Klasse!'])) : pick(['Nicht ganz', 'Leider falsch']);
    const sayTxt = q.sayAfter || (q.kind === 'input' || q.kind === 'order' ? q.say : null);
    const lesson = q.lesson && C.grammar.find(g => g.id === q.lesson);
    const canOverride = override && this.s.mode === 'learn';
    foot.innerHTML = `<div class="fb-box">
        <div class="fb-head"><span class="fb-ic">${ok ? ICON.check : ICON.x}</span><b>${title}</b>
        ${sayTxt ? `<button class="mini-audio" id="fb-say" aria-label="Послушать">${ICON.sound}</button>` : ''}</div>
        ${html ? `<div class="fb-ans">${html}</div>` : ''}
        ${q.explain ? `<div class="fb-ex">${q.explain}</div>` : ''}
      </div>
      <div class="row gap8 wrap">${canOverride ? `<button class="btn ghost sm" id="override">Мой ответ тоже верный</button>` : ''}
        ${lesson && !ok ? `<button class="btn ghost sm" id="rule">${ICON.grammar} Правило</button>` : ''}
        <button class="btn primary grow" id="next">Дальше</button></div>`;
    if (sayTxt) { $('#fb-say').onclick = () => Speech.say(sayTxt); if (ok && Store.state.settings.autoplay && !q.autoplay) Speech.say(sayTxt); }
    $('#next').onclick = () => this.next();
    if (lesson && !ok) $('#rule').onclick = () => {
      const m = UI.sheet(`<div class="sheet-h"><h3 class="display">${esc(lesson.title)}</h3><button class="icon-btn" data-close aria-label="Закрыть">${ICON.close}</button></div><div class="lesson-body">${lesson.content}</div>`);
      m.querySelector('.sheet-card').classList.add('tall');
    };
    if (canOverride) $('#override').onclick = () => this.override(q, override);
    setTimeout(() => $('#next') && $('#next').focus({ preventScroll: true }), 50);
  },
  // «Мой ответ тоже верный»: засчитываем и запоминаем, чтобы больше не считать это ошибкой
  override(q, o) {
    const s = this.s, st = Store.state, last = s.done[s.done.length - 1];
    if (o.kind === 'choice' && q.optWords && q.w) {
      st.badPairs = st.badPairs || {};
      st.badPairs[q.w.key + '|' + q.optWords[o.i].key] = 1;
    } else if (q.key && (o.kind === 'input' || o.kind === 'order')) {
      st.accepted = st.accepted || {};
      const list = st.accepted[q.key] = st.accepted[q.key] || [];
      const g = norm(o.given); if (!list.includes(g)) list.push(g);
    }
    st.reports = (st.reports || []).concat([{ key: q.key || '', given: o.given || (q.options && q.options[o.i] && q.options[o.i].html) || '', t: Date.now() }]).slice(-200);
    if (last && !last.ok) {
      last.ok = true; last.why = ''; s.correct++;
      if (q.key) { Store.fixMistake(q.key); if (q.srs) Store.srsGrade(q.key, 2); }
      const k = s.queue.findIndex(x => x.key === q.key && x._re); if (k >= 0) s.queue.splice(k, 1);
      if (q.adapt) { const a = Adapt.st(); a.d = clamp(a.d + 0.4, 0, 4); a.bad = 0; }
    }
    Store.save();
    UI.toast(o.kind === 'choice' ? 'Засчитано. Эти варианты больше не будут стоять вместе' : 'Засчитано. Этот ответ теперь будет приниматься', 2200);
    this.next();
  },

  // ---------- Итоги ----------
  finish() {
    const s = this.s; if (!s || s.finished) return;
    s.finished = true;
    if (s.timer) clearInterval(s.timer);
    Speech.stop();
    const firstTry = s.done.filter(d => !d.q._re);
    const total = s.gen ? s.done.length : firstTry.length;
    const correct = firstTry.filter(d => d.ok).length;
    const pct = total ? Math.round(correct / total * 100) : 0;
    const secs = Math.round((Date.now() - s.t0) / 1000);
    Store.state.stats.sessions++;
    if (pct === 100 && total >= 5) Store.state.stats.perfect++;
    const res = { correct, total, pct, secs, xp: s.xpGained, maxCombo: s.maxCombo, done: s.done };
    if (s.adaptive && s.mode === 'learn') Adapt.noteSession(res);
    Store.save();
    const custom = s.onFinish ? s.onFinish(res) : null;
    Ach.check();
    if (pct >= 90 && total >= 5) { UI.confetti(); Sound.done(); }
    const wrong = s.done.filter(d => !d.ok && d.q.kind !== 'match' && d.q.kind !== 'flash');
    const uniqWrong = []; const seen = new Set();
    wrong.forEach(d => { const k = d.q.key || d.q.prompt; if (!seen.has(k)) { seen.add(k); uniqWrong.push(d); } });
    const verdict = pct >= 90 ? 'Ausgezeichnet!' : pct >= 70 ? 'Gut gemacht!' : pct >= 50 ? 'Nicht schlecht!' : 'Weiter üben!';
    const sug = Adapt.suggestion();
    const body = $('#ses-body'), foot = $('#ses-foot');
    $('#ses-prog').style.width = '100%';
    $('#ses-meta').innerHTML = '';
    $('#ses-diff').innerHTML = '';
    body.className = 'ses-body result';
    body.innerHTML = `
      <div class="res-hero">
        <div class="res-ring">${UI.ring(pct / 100, 132, 12, pct >= 70 ? 'good' : pct >= 50 ? 'mid' : 'low')}<div class="res-pct">${s.gen ? correct : pct + '%'}<small>${s.gen ? 'верно' : `${correct} из ${total}`}</small></div></div>
        <h2>${verdict}</h2>
        ${custom && custom.headline ? `<p class="res-line">${custom.headline}</p>` : ''}
      </div>
      <div class="res-stats">
        <div><b>+${s.xpGained}</b><span>XP</span></div>
        <div><b>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</b><span>время</span></div>
        <div>${s.adaptive && Adapt.on() ? `<b class="res-diff">${Adapt.dots()}</b><span>${Adapt.label()}</span>` : `<b>${s.maxCombo}</b><span>серия</span>`}</div>
      </div>
      ${sug ? Screens.levelCard(sug) : ''}
      ${custom && custom.html ? custom.html : ''}
      ${uniqWrong.length ? `<h3 class="res-h">Разбор ошибок · ${uniqWrong.length}</h3><div class="res-list">${uniqWrong.slice(0, 40).map(d => this.reviewItem(d)).join('')}</div>` : ''}
      ${s.mode === 'exam' ? `<h3 class="res-h">Все ответы</h3><div class="res-list">${s.done.map(d => this.reviewItem(d)).join('')}</div>` : ''}`;
    if (sug) Screens.bindLevelCard(body);
    foot.className = 'ses-foot';
    foot.innerHTML = `${s.retry ? `<button class="btn ghost" id="again">${ICON.redo} Ещё раз</button>` : ''}<button class="btn primary grow" id="fin">Готово</button>`;
    $('#fin').onclick = () => this.close();
    if (s.retry) $('#again').onclick = () => { const r = s.retry; this.close(); r(); };
  },
  reviewItem(d) {
    const q = d.q;
    let right = '';
    if (q.kind === 'choice') right = q.options[q.a].html;
    else if (q.kind === 'input') right = q.reveal;
    else if (q.kind === 'order') right = esc(q.tokens.join(' ') + q.tail);
    const prompt = q.kind === 'choice' && q.listen ? deHTML(q.w) : (q.prompt || '').replace(/<button[\s\S]*?<\/button>/g, q.say ? esc(q.say) : '').replace(/<div class="q-hint">[\s\S]*?<\/div>/, '');
    return `<div class="rv ${d.ok ? 'ok' : 'bad'}"><div class="rv-q">${prompt}</div>
      ${!d.ok && d.given ? `<div class="rv-a">Ваш ответ: <s>${d.given}</s></div>` : ''}<div class="rv-r">${ICON.check}<span>${right}</span></div>
      ${!d.ok && d.why ? `<div class="rv-e">${d.why}</div>` : ''}
      ${!d.ok && q.explain && !q.w ? `<div class="rv-e">${q.explain}</div>` : ''}</div>`;
  }
};
