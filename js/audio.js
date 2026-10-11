/**
 * Elfblade Road - Web Audio API 16-Bit Chiptune Sound Engine
 * Zero external audio dependencies. Completely procedural audio synthesis.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.muted = false;
    this.initialized = false;

    // Music Sequencer State
    this.currentSong = null;
    this.isPlayingMusic = false;
    this.tempo = 135;
    this.currentStep = 0;
    this.nextNoteTime = 0.0;
    this.schedulerTimer = null;
    this.activeNodes = [];

    // Scale notes frequencies in Hz
    this.NOTE = {
      C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
      C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
      C6: 1046.50, D6: 1174.66, E6: 1318.51, F6: 1396.91, G6: 1567.98,
      REST: 0
    };
  }

  init() {
    if (this.initialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.45;

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.8;
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.55;
      this.bgmGain.connect(this.masterGain);

      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn("Web Audio API not supported or blocked", e);
    }
  }

  toggleMute() {
    this.init();
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.45, this.ctx.currentTime);
    }
    const btn = document.getElementById('btn-audio');
    if (btn) {
      btn.textContent = this.muted ? 'AUDIO: OFF' : 'AUDIO: ON';
      btn.classList.toggle('active', !this.muted);
    }
    return this.muted;
  }

  // ==========================================
  // RETRO SOUND EFFECTS (SFX)
  // ==========================================

  // Crisp 16-bit sword slash
  playSwordSwing(type = 1) {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;

    // Filtered noise swoosh
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const startFreq = type === 3 ? 2400 : 1800;
    filter.frequency.setValueAtTime(startFreq, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.12);
    filter.Q.value = 3.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    // Tonal swipe undertone
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(type === 3 ? 450 : 350, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.35, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    noise.start(now);
    osc.start(now);
    noise.stop(now + 0.13);
    osc.stop(now + 0.11);
  }

  // Punchy arcade hit impact
  playHit(heavy = false) {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const duration = heavy ? 0.22 : 0.14;

    const osc = this.ctx.createOscillator();
    osc.type = heavy ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(heavy ? 220 : 180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    // Hit noise burst
    const bufSize = this.ctx.sampleRate * 0.05;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const nFilter = this.ctx.createBiquadFilter();
    nFilter.type = 'lowpass';
    nFilter.frequency.value = heavy ? 1000 : 1500;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.6, now);
    nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    noise.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(this.sfxGain);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    noise.start(now);
    osc.stop(now + duration);
    noise.stop(now + 0.06);
  }

  // Metallic shield block deflection ping
  playGuard() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;

    [1180, 2360, 3540].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const gain = this.ctx.createGain();
      const initialVol = 0.5 / (i + 1);
      gain.gain.setValueAtTime(initialVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.36);
    });
  }

  // Goblin hurt / screech
  playGoblinHurt() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(950, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Goblin defeat
  playGoblinDie() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.3);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.31);
  }

  // Orc hurt / grunt
  playOrcHurt() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 450;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.21);
  }

  // Orc defeat roar
  playOrcDie() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.51);
  }

  // Boss roaring entrance / rage
  playBossRoar() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(45, now + 1.2);

    // LFO tremolo
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 18;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 25;
    lfo.connect(osc.frequency);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.85, now);
    gain.gain.linearRampToValueAtTime(0.95, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 1.25);
    osc.stop(now + 1.25);
  }

  // Boss ground smash impact
  playBossSmash() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;

    // Sub rumble
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.6);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    // Debris noise
    const bufSize = this.ctx.sampleRate * 0.4;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.4);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.7, now);
    nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.sfxGain);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    noise.start(now);
    osc.stop(now + 0.61);
    noise.stop(now + 0.41);
  }

  // Item pickup
  playItemPickup(type = 'coin') {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;

    if (type === 'meat') {
      // Warm health chime
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.22);
      });
    } else if (type === 'potion') {
      // Mystic chime
      [440, 554.37, 659.25, 880, 1108.73].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.04 + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.26);
      });
    } else {
      // Golden coin pickup
      const notes = [987.77, 1318.51]; // B5 -> E6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.16);
      });
    }
  }

  // Magic Special ("Elven Elemental Storm")
  playMagicStorm() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;

    // Fast mystical ascending harp sweep
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.035);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now + i * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.035 + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.035);
      osc.stop(now + i * 0.035 + 0.22);
    });

    // Thunder strike
    setTimeout(() => {
      if (!this.initialized || this.muted) return;
      const tNow = this.ctx.currentTime;

      const bufSize = this.ctx.sampleRate * 0.8;
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, tNow);
      filter.frequency.exponentialRampToValueAtTime(150, tNow + 0.7);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.9, tNow);
      nGain.gain.exponentialRampToValueAtTime(0.01, tNow + 0.75);

      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.sfxGain);
      noise.start(tNow);
      noise.stop(tNow + 0.8);
    }, 280);
  }

  // Level Up fanfare
  playLevelUp() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const chords = [
      { notes: [261.63, 329.63, 392.00], time: 0.0, dur: 0.12 },
      { notes: [293.66, 369.99, 440.00], time: 0.12, dur: 0.12 },
      { notes: [329.63, 415.30, 493.88], time: 0.24, dur: 0.15 },
      { notes: [392.00, 493.88, 587.33], time: 0.39, dur: 0.15 },
      { notes: [523.25, 659.25, 783.99, 1046.50], time: 0.54, dur: 0.6 }
    ];

    chords.forEach(c => {
      c.notes.forEach(note => {
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(note, now + c.time);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, now + c.time);
        gain.gain.exponentialRampToValueAtTime(0.01, now + c.time + c.dur);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + c.time);
        osc.stop(now + c.time + c.dur + 0.05);
      });
    });
  }

  // Game Over defeat jingle
  playGameOver() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const notes = [
      { f: 220.00, time: 0.0, dur: 0.25 },
      { f: 207.65, time: 0.25, dur: 0.25 },
      { f: 196.00, time: 0.50, dur: 0.25 },
      { f: 185.00, time: 0.75, dur: 0.60 }
    ];

    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, now + n.time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.01, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur + 0.05);
    });
  }

  // Barrel shatter sound
  playBarrelBreak() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;

    const bufSize = this.ctx.sampleRate * 0.25;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.2);
    filter.Q.value = 1.8;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
    noise.stop(now + 0.24);
  }

  // UI button click / select
  playSelect() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(880, now + 0.05);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  // Player hurt
  playPlayerHurt() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  // ==========================================
  // RETRO 16-BIT CHIPTUNE BGM SEQUENCER
  // ==========================================

  playBGM(trackName) {
    this.init();
    if (this.currentSong === trackName && this.isPlayingMusic) return;
    this.stopBGM();

    this.currentSong = trackName;
    this.isPlayingMusic = true;
    this.currentStep = 0;
    this.nextNoteTime = this.ctx ? this.ctx.currentTime + 0.05 : 0;

    if (trackName === 'stage1') {
      this.tempo = 132;
      this.activePattern = this.getStage1Pattern();
    } else if (trackName === 'boss') {
      this.tempo = 146;
      this.activePattern = this.getBossPattern();
    } else if (trackName === 'title') {
      this.tempo = 115;
      this.activePattern = this.getTitlePattern();
    } else if (trackName === 'victory') {
      this.tempo = 125;
      this.activePattern = this.getVictoryPattern();
    }

    this.scheduleMusic();
  }

  stopBGM() {
    this.isPlayingMusic = false;
    if (this.schedulerTimer) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    this.activeNodes.forEach(node => {
      try { node.stop(); } catch (e) {}
    });
    this.activeNodes = [];
  }

  scheduleMusic() {
    if (!this.isPlayingMusic || !this.ctx) return;

    const secondsPerStep = (60.0 / this.tempo) / 4; // 16th note steps
    const lookahead = 0.15; // Schedule 150ms ahead

    while (this.nextNoteTime < this.ctx.currentTime + lookahead) {
      this.playStep(this.currentStep, this.nextNoteTime, secondsPerStep);
      this.nextNoteTime += secondsPerStep;
      this.currentStep = (this.currentStep + 1) % this.activePattern.length;
    }

    this.schedulerTimer = setTimeout(() => this.scheduleMusic(), 50);
  }

  playStep(step, time, stepDur) {
    if (this.muted) return;
    const pat = this.activePattern;
    const n = this.NOTE;

    // 1. Lead / Melody
    if (pat.melody && pat.melody[step] && pat.melody[step] !== n.REST) {
      const freq = pat.melody[step];
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);

      // Add gentle vibrato for rich 16-bit style lead
      const vib = this.ctx.createOscillator();
      vib.frequency.value = 6;
      const vibGain = this.ctx.createGain();
      vibGain.gain.value = 4.0;
      vib.connect(osc.frequency);
      vib.start(time);
      vib.stop(time + stepDur * 1.8);

      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.22, time);
      env.gain.exponentialRampToValueAtTime(0.001, time + stepDur * 1.6);

      osc.connect(env);
      env.connect(this.bgmGain);
      osc.start(time);
      osc.stop(time + stepDur * 1.7);
      this.activeNodes.push(osc);
    }

    // 2. Bassline (Punchy triangle / low square)
    if (pat.bass && pat.bass[step] && pat.bass[step] !== n.REST) {
      const freq = pat.bass[step];
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.38, time);
      env.gain.exponentialRampToValueAtTime(0.01, time + stepDur * 0.9);

      osc.connect(env);
      env.connect(this.bgmGain);
      osc.start(time);
      osc.stop(time + stepDur * 0.95);
      this.activeNodes.push(osc);
    }

    // 3. Drums (K = kick, S = snare, H = hi-hat)
    if (pat.drums && pat.drums[step]) {
      const drum = pat.drums[step];
      if (drum === 'K') {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, time);
        osc.frequency.exponentialRampToValueAtTime(35, time + 0.08);

        const env = this.ctx.createGain();
        env.gain.setValueAtTime(0.6, time);
        env.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

        osc.connect(env);
        env.connect(this.bgmGain);
        osc.start(time);
        osc.stop(time + 0.09);
        this.activeNodes.push(osc);
      } else if (drum === 'S') {
        const bufSize = this.ctx.sampleRate * 0.08;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1600;

        const env = this.ctx.createGain();
        env.gain.setValueAtTime(0.35, time);
        env.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

        noise.connect(filter);
        filter.connect(env);
        env.connect(this.bgmGain);
        noise.start(time);
        noise.stop(time + 0.09);
        this.activeNodes.push(noise);
      } else if (drum === 'H') {
        const bufSize = this.ctx.sampleRate * 0.025;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;

        const env = this.ctx.createGain();
        env.gain.setValueAtTime(0.12, time);
        env.gain.exponentialRampToValueAtTime(0.005, time + 0.025);

        noise.connect(filter);
        filter.connect(env);
        env.connect(this.bgmGain);
        noise.start(time);
        noise.stop(time + 0.03);
        this.activeNodes.push(noise);
      }
    }

    // Clean up expired active nodes
    if (this.activeNodes.length > 50) {
      this.activeNodes = this.activeNodes.slice(-25);
    }
  }

  // --- Musical Patterns (32-step 16th note loops) ---

  getStage1Pattern() {
    const N = this.NOTE;
    return {
      length: 32,
      // Driving heroic fantasy lead
      melody: [
        N.A4, 0, N.C5, 0, N.D5, 0, N.E5, N.E5,
        N.D5, 0, N.C5, 0, N.A4, 0, N.G4, N.A4,
        N.C5, 0, N.D5, 0, N.E5, 0, N.G5, N.G5,
        N.E5, 0, N.D5, 0, N.C5, N.D5, N.A4, 0
      ],
      // Syncopated 16-bit bassline
      bass: [
        N.A2, 0, N.A2, N.A2, 0, N.A2, N.C3, N.D3,
        N.A2, 0, N.A2, N.A2, 0, N.G2, N.F2, N.G2,
        N.A2, 0, N.A2, N.A2, 0, N.C3, N.D3, N.E3,
        N.F2, 0, N.F2, N.G2, 0, N.G2, N.A2, 0
      ],
      drums: [
        'K', 'H', 'H', 'H', 'S', 'H', 'K', 'H',
        'K', 'H', 'K', 'H', 'S', 'H', 'H', 'H',
        'K', 'H', 'H', 'H', 'S', 'H', 'K', 'H',
        'K', 'H', 'K', 'H', 'S', 'K', 'S', 'H'
      ]
    };
  }

  getBossPattern() {
    const N = this.NOTE;
    return {
      length: 32,
      // Frantic, urgent, menacing boss theme
      melody: [
        N.E4, N.E4, N.G4, N.E4, N.A4, N.E4, N.B4, N.E4,
        N.C5, N.B4, N.A4, N.G4, N.A4, N.G4, N.F4, N.E4,
        N.E4, N.E4, N.B4, N.E4, N.C5, N.E4, N.D5, N.E4,
        N.E5, N.D5, N.C5, N.B4, N.C5, N.B4, N.A4, N.G4
      ],
      bass: [
        N.E2, N.E2, 0, N.E2, N.E2, 0, N.E2, N.G2,
        N.E2, N.E2, 0, N.E2, N.D2, 0, N.F2, N.G2,
        N.E2, N.E2, 0, N.E2, N.E2, 0, N.E2, N.B2,
        N.C3, 0, N.B2, 0, N.A2, 0, N.G2, N.F2
      ],
      drums: [
        'K', 'H', 'S', 'H', 'K', 'K', 'S', 'H',
        'K', 'H', 'S', 'H', 'K', 'S', 'K', 'S',
        'K', 'H', 'S', 'H', 'K', 'K', 'S', 'H',
        'K', 'K', 'S', 'K', 'S', 'S', 'K', 'S'
      ]
    };
  }

  getTitlePattern() {
    const N = this.NOTE;
    return {
      length: 32,
      melody: [
        N.D4, 0, N.A4, 0, N.G4, 0, N.F4, N.E4,
        N.D4, 0, N.F4, 0, N.A4, 0, N.D5, 0,
        N.C5, 0, N.B4, 0, N.G4, 0, N.A4, 0,
        N.F4, 0, N.E4, 0, N.D4, 0, 0, 0
      ],
      bass: [
        N.D2, 0, N.D2, 0, N.D2, 0, N.A2, 0,
        N.D2, 0, N.D2, 0, N.F2, 0, N.G2, 0,
        N.C2, 0, N.C2, 0, N.G2, 0, N.A2, 0,
        N.D2, 0, N.A2, 0, N.D2, 0, 0, 0
      ],
      drums: [
        'K', 0, 'H', 0, 'S', 0, 'H', 0,
        'K', 0, 'H', 0, 'S', 0, 'H', 'H',
        'K', 0, 'H', 0, 'S', 0, 'H', 0,
        'K', 0, 'K', 0, 'S', 0, 'H', 0
      ]
    };
  }

  getVictoryPattern() {
    const N = this.NOTE;
    return {
      length: 32,
      melody: [
        N.C4, N.E4, N.G4, N.C5, N.E5, 0, N.G5, 0,
        N.E5, 0, N.G5, 0, N.C6, 0, 0, 0,
        N.A4, N.C5, N.E5, N.A5, N.G5, 0, N.E5, 0,
        N.D5, 0, N.E5, 0, N.C5, 0, 0, 0
      ],
      bass: [
        N.C2, 0, N.C2, 0, N.C3, 0, N.G2, 0,
        N.C3, 0, N.E2, 0, N.G2, 0, N.C3, 0,
        N.F2, 0, N.F2, 0, N.A2, 0, N.C3, 0,
        N.G2, 0, N.G2, 0, N.C2, 0, 0, 0
      ],
      drums: [
        'K', 0, 'H', 0, 'S', 0, 'H', 0,
        'K', 0, 'H', 'H', 'S', 0, 'K', 'S',
        'K', 0, 'H', 0, 'S', 0, 'H', 0,
        'K', 'K', 'S', 0, 'S', 'S', 'K', 0
      ]
    };
  }
}

// Global Singleton Instance
window.SoundEngine = new SoundEngine();
