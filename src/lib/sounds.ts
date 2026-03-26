/**
 * TACTICAL_AUDIO_ENGINE // v1.1.0
 * Generates synthetic HUD sound effects using the Web Audio API
 * Optimized for loudness and visibility on modern speakers.
 */

class TacticalAudioEngine {
  private ctx: AudioContext | null = null;
  private isResumed = false;

  private getContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Explicitly resume context (required by browsers after the first user gesture)
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    
    return this.ctx;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number) {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Initial sharp attack for that "tactile" click feel
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    // Smooth decay to prevent popping
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  // Quick mechanical click for close/toggle
  public click() {
    this.playTone(2200, "sine", 0.08, 0.15); // Louder (15%) and slightly longer
  }

  // High-frequency UI blip for nav/hover
  public blip() {
    this.playTone(1600, "sine", 0.12, 0.12); // Louder (12%)
  }

  // Ascending success chime for commands
  public success() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.playTone(880, "sine", 0.3, 0.1);
    setTimeout(() => this.playTone(1320, "sine", 0.3, 0.1), 80);
    setTimeout(() => this.playTone(1760, "sine", 0.3, 0.1), 160);
  }

  // Low-frequency error buzz/glitch
  public error() {
    this.playTone(160, "sawtooth", 0.4, 0.2); // Loud (20%) and gritty
  }

  // Short typing burst with randomized pitch
  public type() {
    const freq = Math.random() * 300 + 800; // Shifted higher for audibility
    this.playTone(freq, "square", 0.03, 0.08); // Doubled loudness
  }

  // Audible system hum for modal opening
  public hum() {
    // 300Hz is much more audible on laptop speakers than 60Hz
    this.playTone(300, "sine", 0.4, 0.08); 
    // Add a high-pitch layer for that "digital scan" feel
    this.playTone(4000, "sine", 0.05, 0.03);
  }

  // Tactical radio comms burst (static + double beep)
  public comms() {
    const ctx = this.getContext();
    if (!ctx) return;

    // 1. Static Burst (Noise)
    const bufferSize = ctx.sampleRate * 0.12; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.Q.setValueAtTime(1, ctx.currentTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.06, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();

    // 2. Double Beep (Radio Squelch Tail)
    setTimeout(() => {
      this.playTone(1200, "sine", 0.04, 0.08);
      setTimeout(() => this.playTone(1500, "sine", 0.04, 0.08), 50);
    }, 80);
  }
}

export const tacticalAudio = typeof window !== "undefined" ? new TacticalAudioEngine() : null;
