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
    constructor(scene = null) {
        this._thrusterNodes = null;   // { osc, gain } while thrusting
        this._scene = scene;
    }

    setScene(scene) {
        this._scene = scene;
    }

    _createDistortionCurve(amount = 50) {
        const k = amount;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            let x = (i * 2) / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
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
        if (this._scene && this._scene.sound) {
            this._scene.sound.play('bullet');
        }
    }

    playPlasma() {
        if (this._scene && this._scene.sound) {
            this._scene.sound.play('plasma');
        }
    }

    playPurpleBlast() {
        if (this._scene && this._scene.sound) {
            this._scene.sound.play('pickup-purple');
        }
    }

    playPinkBlast() {
        if (this._scene && this._scene.sound) {
            this._scene.sound.play('pickup-pink');
        }
    }

    playExplosion(size) {
        if (this._scene && this._scene.sound) {
            let soundKey, volume;

            if (size === 'giant') {
                soundKey = 'explosion-giant';
                volume = 1;
            } else if (size === 'large') {
                soundKey = 'explosion-large';
                volume = 0.5;
            } else if (size === 'medium') {
                soundKey = 'explosion-medium';
                volume = 1;
            } else {
                soundKey = 'explosion-medium';
                volume = 0.4;
            }

            this._scene.sound.play(soundKey, { volume });
        } else if (size === 'small') {
            const volume = 0.08;
            this._playExplosionBoom(volume);

            if (this._scene) {
                this._scene.time.delayedCall(100, () => {
                    this._playExplosionBoom(volume);
                });
                this._scene.time.delayedCall(200, () => {
                    this._playExplosionBoom(volume);
                });
            }
        }
    }

    _playExplosionBoom(volume) {
        const ctx = this._getCtx();
        const duration = 1;

        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const distortion = ctx.createWaveShaper();
        distortion.curve = this._createDistortionCurve(400);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        source.connect(distortion);
        distortion.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
    }

    playSaucerSound() {
        const ctx = this._getCtx();
        const duration = 1;
        const lowFreq = 150;
        const highFreq = 300;
        const volume = 0.2;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(lowFreq, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(highFreq, ctx.currentTime + 0.25);
        osc.frequency.linearRampToValueAtTime(lowFreq, ctx.currentTime + 0.5);
        osc.frequency.linearRampToValueAtTime(highFreq, ctx.currentTime + 0.75);
        osc.frequency.linearRampToValueAtTime(lowFreq, ctx.currentTime + duration);

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
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


    playPickup(pitchMultiplier = 1, pickupType = null) {

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
        const bendDuration = 1.2;
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

    playExtraLife() {
        if (this._scene && this._scene.sound) {
            this._scene.sound.play('extra-life');
        }
    }

    playSecondWave() {
        if (this._scene && this._scene.sound) {
            this._scene.sound.play('second-wave');
        }
    }

    playRockCinematic() {
        if (this._scene && this._scene.sound) {
            this._scene.sound.play('rock-cinematic');
        }
    }

    playOctopusHit() {
        if (this._scene && this._scene.sound) {
            this._scene.sound.play('octopus-hit');
        }
    }

    playSaucerDeath() {
        if (this._scene && this._scene.sound) {
            this._scene.sound.play('saucer-death');
        }
    }

    playGreenBullet() {
        if (this._scene && this._scene.sound) {
            this._scene.sound.play('green-bullet');
        }
    }
}
