/**
 * Realbeber - Ambient WebGL Audio Engine
 * Museum-grade synthesized dimensional soundscape & micro-interactions via Web Audio API.
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.masterGain = null;
    this.droneGain = null;
    this.oscillators = [];
    this.lfo = null;
    this.filter = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Low-pass filter for warm dimensional atmosphere
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(260, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(3.5, this.ctx.currentTime);
      this.filter.connect(this.masterGain);

      // Drone sub-gain
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.droneGain.connect(this.filter);

      // 1. Root Sub Oscillator (55Hz - A1)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, this.ctx.currentTime);
      osc1.connect(this.droneGain);
      osc1.start();
      this.oscillators.push(osc1);

      // 2. Warm Fundamental (110Hz - A2)
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110, this.ctx.currentTime);
      const osc2Gain = this.ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      osc2.connect(osc2Gain);
      osc2Gain.connect(this.droneGain);
      osc2.start();
      this.oscillators.push(osc2);

      // 3. Ethereal Fifth (165Hz - E3)
      const osc3 = this.ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(164.81, this.ctx.currentTime);
      const osc3Gain = this.ctx.createGain();
      osc3Gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      osc3.connect(osc3Gain);
      osc3Gain.connect(this.droneGain);
      osc3.start();
      this.oscillators.push(osc3);

      // 4. Subtle LFO to breathe filter frequency
      this.lfo = this.ctx.createOscillator();
      this.lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 8-second slow breath
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(60, this.ctx.currentTime);
      this.lfo.connect(lfoGain);
      lfoGain.connect(this.filter.frequency);
      this.lfo.start();

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  toggle() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.85;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.3);
    }
    return !this.isMuted;
  }

  // Micro-interaction UI click
  playClick() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(780, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  // Dimension warp whoosh sound on scroll velocity or section switch
  playWarp(pitch = 1.0) {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120 * pitch, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(350 * pitch, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch (e) {}
  }

  // Dynamic filter modulation based on scroll velocity
  modulateVelocity(velocity) {
    if (!this.filter || !this.ctx || this.isMuted) return;
    const clamped = Math.min(Math.abs(velocity) * 80, 600);
    this.filter.frequency.setTargetAtTime(260 + clamped, this.ctx.currentTime, 0.1);
  }
}

export const audioEngine = new AudioEngine();
