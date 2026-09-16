// Web Audio API Tactical Radar Sound Synthesizer for ESM Receiver

class TacticalAudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private volume: number = 0.3;
  private lastPingTime: number = 0;

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!muted) {
      this.init();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public playPulsePing(priUs: number, carrierGhz: number) {
    if (this.isMuted) return;
    const now = performance.now();
    if (now - this.lastPingTime < 40) return; // Throttle audio events to avoid audio clipping
    this.lastPingTime = now;

    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch mapped from carrier frequency and PRI
      const freq = Math.min(2400, Math.max(220, 300 + (carrierGhz * 120) + (100000 / (priUs + 50))));
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, this.ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(this.volume * 0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // AudioContext might be blocked until user gesture
    }
  }

  public playInterceptAlert() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.setValueAtTime(1320, t + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.25, t);
      gain.gain.setValueAtTime(this.volume * 0.25, t + 0.16);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.24);
    } catch {
      // Ignored if user hasn't clicked
    }
  }

  public playRetuneTick() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);

      gain.gain.setValueAtTime(this.volume * 0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.015);
    } catch {
      // Ignored
    }
  }
}

export const tacticalAudio = new TacticalAudioService();
