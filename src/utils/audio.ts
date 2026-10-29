// Procedural sound effects using Web Audio API
class ChessAudioEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public playSelect() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio error silently handled
    }
  }

  // Stone piece sliding across polished marble
  public playStoneSlide() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      // White noise through resonant bandpass filter simulating marble scraping
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.linearRampToValueAtTime(500, t + 0.12);
      filter.Q.value = 3;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(t);
    } catch {
      // Audio error silently handled
    }
  }

  // Solid marble/obsidian impact thud
  public playMove() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.playStoneSlide();

      const t = ctx.currentTime + 0.04;
      // Low solid stone impact
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(160, t);
      osc1.frequency.exponentialRampToValueAtTime(45, t + 0.12);
      gain1.gain.setValueAtTime(0.25, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      // High crisp ceramic click
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(520, t);
      osc2.frequency.exponentialRampToValueAtTime(220, t + 0.06);
      gain2.gain.setValueAtTime(0.12, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.12);
      osc2.stop(t + 0.06);
    } catch {
      // Audio error silently handled
    }
  }

  // High-impact combat crystalline shatter effect
  public playCrystallineShatter() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;

      // 1. Heavy resonant strike clack
      const strikeOsc = ctx.createOscillator();
      const strikeGain = ctx.createGain();
      strikeOsc.type = 'sawtooth';
      strikeOsc.frequency.setValueAtTime(320, t);
      strikeOsc.frequency.exponentialRampToValueAtTime(60, t + 0.18);
      strikeGain.gain.setValueAtTime(0.3, t);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.exponentialRampToValueAtTime(200, t + 0.18);

      strikeOsc.connect(filter);
      filter.connect(strikeGain);
      strikeGain.connect(ctx.destination);

      strikeOsc.start(t);
      strikeOsc.stop(t + 0.18);

      // 2. High crystalline shards shattering (cluster of high harmonic pings)
      const shardFreqs = [1760, 2217, 2637, 3520, 4434];
      shardFreqs.forEach((freq, i) => {
        const shardOsc = ctx.createOscillator();
        const shardGain = ctx.createGain();
        shardOsc.type = 'sine';
        const startOffset = t + 0.02 + i * 0.025;
        shardOsc.frequency.setValueAtTime(freq, startOffset);
        shardOsc.frequency.exponentialRampToValueAtTime(freq * 0.7, startOffset + 0.14);

        shardGain.gain.setValueAtTime(0.08, startOffset);
        shardGain.gain.exponentialRampToValueAtTime(0.0001, startOffset + 0.14);

        shardOsc.connect(shardGain);
        shardGain.connect(ctx.destination);

        shardOsc.start(startOffset);
        shardOsc.stop(startOffset + 0.14);
      });

      // 3. Low rumble burst
      const rumble = ctx.createOscillator();
      const rumbleGain = ctx.createGain();
      rumble.type = 'triangle';
      rumble.frequency.setValueAtTime(90, t);
      rumble.frequency.exponentialRampToValueAtTime(30, t + 0.25);
      rumbleGain.gain.setValueAtTime(0.2, t);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      rumble.connect(rumbleGain);
      rumbleGain.connect(ctx.destination);

      rumble.start(t);
      rumble.stop(t + 0.25);
    } catch {
      // Audio error silently handled
    }
  }

  public playCapture() {
    this.playCrystallineShatter();
  }

  // Cathedral Gothic Check chime (Ethereal minor 5th chord)
  public playCheck() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      // D4, A4, D5 cathedral organ-like chime
      const freqs = [293.66, 440.0, 587.33, 880.0];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, t + i * 0.03);

        gain.gain.setValueAtTime(0.09, t + i * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.03 + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t + i * 0.03);
        osc.stop(t + i * 0.03 + 0.55);
      });
    } catch {
      // Audio error silently handled
    }
  }

  // Cathedral Gothic Victory Cadence
  public playGameOver() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      // Majestic gothic minor-to-major cadence
      const notes = [220.0, 329.63, 440.0, 554.37, 659.25, 880.0];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = t + i * 0.08;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.9);
      });
    } catch {
      // Audio error silently handled
    }
  }
}

export const chessAudio = new ChessAudioEngine();
