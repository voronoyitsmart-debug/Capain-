// Озвучка (Web Speech API) и звуки интерфейса
const Speech = {
  voices: [],
  ok: typeof window !== 'undefined' && 'speechSynthesis' in window,
  init() {
    if (!this.ok) return;
    const load = () => {
      this.voices = speechSynthesis.getVoices().filter(v => L.voiceRe.test(v.lang));
    };
    load();
    speechSynthesis.onvoiceschanged = load;
  },
  // лучший голос: выбранный пользователем, затем «улучшенные», затем de-DE
  voice() {
    const s = Store.state.settings;
    if (s.voice) { const v = this.voices.find(v => v.voiceURI === s.voice); if (v) return v; }
    const score = v => (/premium|enhanced|neural|natural/i.test(v.name) ? 4 : 0) + (v.lang.replace('_', '-') === L.tts ? 2 : 0) +
      (L.voicePref.test(v.name) ? 1 : 0);
    return this.voices.slice().sort((a, b) => score(b) - score(a))[0] || null;
  },
  // queue=true — не прерывать текущую речь
  say(text, opts = {}) {
    if (!this.ok || !text) return Promise.resolve();
    return new Promise(res => {
      if (!opts.queue) speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/\s*\(.*?\)\s*/g, ' ').replace(/\+ ?(Akk|Dat|Gen)\.?/g, ''));
      u.lang = L.tts;
      const v = this.voice(); if (v) u.voice = v;
      u.rate = (opts.rate || Store.state.settings.rate || 0.9) * (opts.slow ? 0.7 : 1);
      u.pitch = opts.pitch || 1;
      u.onend = u.onerror = () => res();
      speechSynthesis.speak(u);
      // iOS иногда «засыпает» — страховка
      setTimeout(res, 2000 + String(text).length * 120);
    });
  },
  stop() { if (this.ok) speechSynthesis.cancel(); }
};

const Sound = {
  ctx: null,
  tone(freqs, dur = 0.09, type = 'sine', vol = 0.06) {
    if (!Store.state.settings.sound) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const c = this.ctx; let t = c.currentTime;
      freqs.forEach(f => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 1.6);
        o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur * 1.7);
        t += dur;
      });
    } catch (e) { /* звук недоступен */ }
  },
  ok() { this.tone([660, 990]); },
  bad() { this.tone([220, 180], 0.12, 'triangle', 0.07); },
  done() { this.tone([523, 659, 784, 1047], 0.1); },
  tap() { this.tone([440], 0.03, 'sine', 0.03); }
};
