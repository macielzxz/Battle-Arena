const SFX = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone({ type = 'square', freq = 220, freqEnd = null, vol = 0.3,
                  attack = 0.01, decay = 0.12, sustain = 0.0, release = 0.08,
                  duration = 0.22, detune = 0 }) {
    const c   = getCtx();
    const osc = c.createOscillator();
    const env = c.createGain();
    const now = c.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd !== null)
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), now + duration);
    if (detune) osc.detune.setValueAtTime(detune, now);

    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(vol, now + attack);
    env.gain.linearRampToValueAtTime(vol * sustain || vol * 0.3, now + attack + decay);
    env.gain.linearRampToValueAtTime(0, now + attack + decay + release);

    osc.connect(env);
    env.connect(c.destination);
    osc.start(now);
    osc.stop(now + attack + decay + release + 0.05);
  }

  function noise({ vol = 0.25, duration = 0.15, freqLP = 800 }) {
    const c    = getCtx();
    const buf  = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src  = c.createBufferSource();
    const filt = c.createBiquadFilter();
    const env  = c.createGain();
    const now  = c.currentTime;

    src.buffer = buf;
    filt.type  = 'lowpass';
    filt.frequency.setValueAtTime(freqLP, now);
    env.gain.setValueAtTime(vol, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + duration);

    src.connect(filt);
    filt.connect(env);
    env.connect(c.destination);
    src.start(now);
  }

  function swordHit() {
    noise({ vol: 0.35, duration: 0.09, freqLP: 1200 });
    tone({ type: 'sawtooth', freq: 180, freqEnd: 60, vol: 0.18,
           attack: 0.005, decay: 0.08, release: 0.06, duration: 0.14 });
  }

  function playerHurt() {
    noise({ vol: 0.3, duration: 0.12, freqLP: 600 });
    tone({ type: 'triangle', freq: 300, freqEnd: 120, vol: 0.2,
           attack: 0.01, decay: 0.15, release: 0.12, duration: 0.28 });
  }

  function playerDie() {
    tone({ type: 'sawtooth', freq: 400, freqEnd: 40, vol: 0.45,
           attack: 0.02, decay: 0.8, release: 0.6, duration: 1.4 });
    noise({ vol: 0.35, duration: 0.5, freqLP: 500 });
    setTimeout(() =>
      tone({ type: 'sine', freq: 80, freqEnd: 20, vol: 0.3,
             attack: 0.05, decay: 0.8, release: 0.5, duration: 1.3 }), 300);
  }

  function dragonHurt() {
    tone({ type: 'sawtooth', freq: 140, freqEnd: 40, vol: 0.35,
           attack: 0.02, decay: 0.25, release: 0.18, duration: 0.45, detune: 15 });
    tone({ type: 'square',   freq: 90,  freqEnd: 30, vol: 0.2,
           attack: 0.03, decay: 0.20, release: 0.15, duration: 0.4 });
  }
  function dragonDie() {
    tone({ type: 'sawtooth', freq: 200, freqEnd: 20, vol: 0.5,
           attack: 0.01, decay: 0.5, release: 0.4, duration: 0.95, detune: 20 });
    noise({ vol: 0.4, duration: 0.5, freqLP: 400 });
    setTimeout(() =>
      tone({ type: 'sine', freq: 60, freqEnd: 20, vol: 0.3,
             attack: 0.05, decay: 0.4, release: 0.3, duration: 0.75 }), 200);
  }

  function demonHurt() {
    tone({ type: 'square',   freq: 600, freqEnd: 300, vol: 0.22,
           attack: 0.005, decay: 0.12, release: 0.08, duration: 0.2 });
    tone({ type: 'sawtooth', freq: 650, freqEnd: 280, vol: 0.15,
           attack: 0.005, decay: 0.10, release: 0.07, duration: 0.18, detune: 50 });
  }
  function demonDie() {
    tone({ type: 'square',   freq: 800, freqEnd: 50, vol: 0.4,
           attack: 0.01, decay: 0.6, release: 0.3, duration: 0.95 });
    tone({ type: 'sawtooth', freq: 700, freqEnd: 30, vol: 0.3,
           attack: 0.02, decay: 0.55, release: 0.25, duration: 0.9, detune: 80 });
    noise({ vol: 0.25, duration: 0.35, freqLP: 2000 });
  }

  function zombieHurt() {
    tone({ type: 'sine', freq: 180, freqEnd: 120, vol: 0.28,
           attack: 0.04, decay: 0.28, release: 0.22, duration: 0.55, detune: -20 });
    noise({ vol: 0.12, duration: 0.2, freqLP: 300 });
  }
  function zombieDie() {
    tone({ type: 'sine',     freq: 150, freqEnd: 50, vol: 0.4,
           attack: 0.06, decay: 0.7, release: 0.5, duration: 1.3, detune: -30 });
    tone({ type: 'triangle', freq: 100, freqEnd: 30, vol: 0.25,
           attack: 0.08, decay: 0.6, release: 0.4, duration: 1.1 });
    noise({ vol: 0.2, duration: 0.6, freqLP: 200 });
  }

  function alienHurt() {
    tone({ type: 'sine',   freq: 1200, freqEnd: 400, vol: 0.22,
           attack: 0.005, decay: 0.1, release: 0.08, duration: 0.2 });
    tone({ type: 'square', freq: 900,  freqEnd: 300, vol: 0.15,
           attack: 0.005, decay: 0.1, release: 0.06, duration: 0.18, detune: -40 });
  }
  function alienDie() {
    tone({ type: 'sine',   freq: 1800, freqEnd: 100, vol: 0.4,
           attack: 0.01, decay: 0.55, release: 0.4, duration: 1.0 });
    tone({ type: 'square', freq: 2000, freqEnd: 50,  vol: 0.25,
           attack: 0.01, decay: 0.45, release: 0.3, duration: 0.8, detune: 60 });
    noise({ vol: 0.3, duration: 0.4, freqLP: 3000 });
    setTimeout(() => noise({ vol: 0.2, duration: 0.25, freqLP: 5000 }), 150);
  }

  function victory() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => setTimeout(() =>
      tone({ type: 'square', freq: f, vol: 0.3,
             attack: 0.01, decay: 0.12, release: 0.1, duration: 0.22 }), i * 110));
    setTimeout(() =>
      tone({ type: 'square', freq: 1047, vol: 0.4,
             attack: 0.01, decay: 0.4, release: 0.3, duration: 0.7 }), 450);
  }

  function gameOver() {
    const notes = [392, 330, 294, 220];
    notes.forEach((f, i) => setTimeout(() =>
      tone({ type: 'triangle', freq: f, vol: 0.28,
             attack: 0.02, decay: 0.22, release: 0.18, duration: 0.42 }), i * 160));
    setTimeout(() =>
      tone({ type: 'sine', freq: 110, freqEnd: 55, vol: 0.35,
             attack: 0.05, decay: 0.8, release: 0.6, duration: 1.4 }), 700);
  }

  const monsterSounds = {
    dragon: { hurt: dragonHurt, die: dragonDie },
    demon:  { hurt: demonHurt,  die: demonDie  },
    zombie: { hurt: zombieHurt, die: zombieDie },
    alien:  { hurt: alienHurt,  die: alienDie  },
  };

  return { swordHit, playerHurt, playerDie, victory, gameOver, monsterSounds };
})();
