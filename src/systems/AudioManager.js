let globalAudioContext = null;

export function initGlobalAudioContext() {
    if (!globalAudioContext) {
        globalAudioContext = new AudioContext();
    }
    if (globalAudioContext.state === 'suspended') {
        globalAudioContext.resume();
    }
    return globalAudioContext;
}

export class AudioManager {
    constructor() {
        this._thrusterNodes = null;   // { osc, gain } while thrusting
    }

    // Called on first user interaction so the AudioContext is created with user gesture
    _getCtx() {
        if (!globalAudioContext) {
            globalAudioContext = new AudioContext();
        }
        if (globalAudioContext.state === 'suspended') {
            globalAudioContext.resume();
        }
        return globalAudioContext;
    }

    playShoot() {
        const ctx  = this._getCtx();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
    }

    playExplosion(size) {
        const ctx = this._getCtx();
        const duration = 2;
        const volume = size === 'large' ? 0.4 : size === 'medium' ? 0.3 : 0.2;

        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
    }

    startThruster() {
        if (this._thrusterNodes) { return; }

        const ctx = this._getCtx();
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const gain = ctx.createGain();
        source.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0.06, ctx.currentTime);

        source.start();
        this._thrusterNodes = { source, gain };
    }

    stopThruster() {
        if (!this._thrusterNodes) { return; }

        const { source, gain } = this._thrusterNodes;
        const ctx = this._getCtx();

        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        source.stop(ctx.currentTime + 0.08);

        this._thrusterNodes = null;
    }


    playPickup(pitchMultiplier = 1) {
        const ctx = this._getCtx();
        // C, C, G (down), B, C, G, C, E
        const baseNotes = [262, 262, 196, 247, 262, 392, 523, 659];
        const notes = baseNotes.map(n => n * pitchMultiplier);
        const noteDuration = 0.06;
        const noteGap = 0.02;
        const now = ctx.currentTime;

        notes.forEach((freq, i) => {
            const startTime = now + i * (noteDuration + noteGap);
            const endTime = startTime + noteDuration;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.35, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, endTime);

            osc.start(startTime);
            osc.stop(endTime);
        });
    }

    playDeath() {
        const ctx = this._getCtx();
        const now = ctx.currentTime;
        const bendDuration = 0.6;
        const bendEndTime = now + bendDuration;

        const highFreq = 659 * 0.125;
        const lowFreq = 262 * 0.125;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(highFreq, now);
        osc.frequency.exponentialRampToValueAtTime(lowFreq, bendEndTime);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.setValueAtTime(0.05, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, bendEndTime);

        osc.start(now);
        osc.stop(bendEndTime);
    }

    playDrumBeat(isLow) {
        const ctx = this._getCtx();
        const duration = 2;
        const volume = 0.4;

        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(isLow ? 200 : 350, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
    }

    playLowTone(isHigh) {
        const ctx = this._getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isHigh ? 440 : 220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(isHigh ? 55 : 27.5, ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.6, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
    }
}
