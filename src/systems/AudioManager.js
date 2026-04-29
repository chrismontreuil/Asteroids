export class AudioManager {
    constructor() {
        this._ctx           = null;
        this._thrusterNodes = null;   // { osc, gain } while thrusting
        this._heartbeatTimer    = 0;
        this._heartbeatPhase    = 0;    // alternates 0/1 for the two-thump pattern
        this._heartbeatInterval = 1200; // ms; decreases as fewer asteroids remain
    }

    // Called on first user interaction so the AudioContext is created with user gesture
    _getCtx() {
        if (!this._ctx) {
            this._ctx = new AudioContext();
        }
        if (this._ctx.state === 'suspended') {
            this._ctx.resume();
        }
        return this._ctx;
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

    // Call every frame; asteroidCount drives tempo
    updateHeartbeat(delta, asteroidCount) {
        // Interval ranges from 1200ms (12+ asteroids) to 400ms (0 asteroids)
        const maxCount = 12;
        const t = Math.max(0, Math.min(1, (maxCount - asteroidCount) / maxCount));
        this._heartbeatInterval = 1200 - t * 800;

        this._heartbeatTimer += delta;
        if (this._heartbeatTimer >= this._heartbeatInterval) {
            this._heartbeatTimer = 0;
            this._thump(this._heartbeatPhase);
            this._heartbeatPhase = this._heartbeatPhase === 0 ? 1 : 0;
        }
    }

    _thump(phase) {
        const ctx  = this._getCtx();
        const freq = phase === 0 ? 30 : 37;

        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.07);
    }
}
