type Track = 'title' | 'field' | 'battle' | 'ending';

const MELODY: Record<Track, number[]> = {
  title: [62, 65, 69, 67, 65, 62, 58, 57, 55, 57, 62, 65],
  field: [57, 60, 64, 67, 64, 60, 57, 55, 52, 55, 57, 60],
  battle: [48, 51, 55, 51, 48, 46, 43, 46, 48, 55, 58, 55],
  ending: [60, 64, 67, 72, 67, 64, 60, 64, 67, 72, 76, 72],
};

export class AudioBus {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer = 0;
  private step = 0;
  private track: Track = 'title';
  muted = false;
  volume = 0.8;
  private reduced = false;

  private ensure(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume * 0.15;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : this.volume * 0.15;
  }

  setVolume(volume: number): void {
    this.volume = volume;
    if (this.master && !this.muted) this.master.gain.value = volume * 0.15;
  }

  setReduced(reduced: boolean): void {
    this.reduced = reduced;
  }

  play(track: Track): void {
    this.track = track;
    this.step = 0;
  }

  tick(): void {
    const now = performance.now();
    if (now < this.timer) return;
    this.timer = now + (this.track === 'battle' ? 170 : 240);
    if (this.muted || this.reduced) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const notes = MELODY[this.track];
    const midi = notes[this.step % notes.length];
    this.step += 1;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = this.track === 'battle' ? 'square' : 'triangle';
    osc.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.8, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  sfx(kind: 'hit' | 'heal' | 'confirm' | 'win'): void {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = kind === 'hit' ? 180 : kind === 'heal' ? 660 : kind === 'win' ? 520 : 440;
    osc.type = kind === 'hit' ? 'square' : 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (kind === 'hit') osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);
    if (kind === 'win') osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }
}

export const audio = new AudioBus();
