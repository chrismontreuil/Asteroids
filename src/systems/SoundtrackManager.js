export class SoundtrackManager {
    constructor(scene, audioManager) {
        this.scene = scene;
        this.audioManager = audioManager;
        this._timers = [];

        this._start();
    }

    _start() {
        this._playDrums();
    }

    _playDrums() {
        const drumPattern = [
            { note: 'b', dur: 4 },
            { note: 'p', dur: 4 },
            { note: 'b', dur: 2 },
            { note: 'b', dur: 2 },
            { note: 'p', dur: 4 },
        ];

        const drumTempos = [180, 210, 240, 270, 300, 330, 360, 390, 420, 450, 480, 510];
        let timeOffset = 0;

        for (let tempoIdx = 0; tempoIdx < drumTempos.length; tempoIdx++) {
            const beatDuration = 60 / drumTempos[tempoIdx];

            for (let loopNum = 0; loopNum < 4; loopNum++) {
                for (let i = 0; i < drumPattern.length; i++) {
                    const step = drumPattern[i];
                    const delay = timeOffset * 1000;

                    const timer = this.scene.time.delayedCall(delay, () => {
                        this.audioManager.playDrumBeat(step.note === 'b');
                    });
                    this._timers.push(timer);

                    timeOffset += step.dur * beatDuration;
                }
            }
        }

        const finalDelay = timeOffset * 1000;
        const timer = this.scene.time.delayedCall(finalDelay, () => {
            this._playDrums();
        });
        this._timers.push(timer);
    }

    _playLowTones() {
        const tempos = [90, 120, 150];
        const pattern = [
            { note: 'b', dur: 2, isRest: false },
            { note: 'p', dur: 2, isRest: false },
            { note: 'w', dur: 4, isRest: false },
            { note: 'w', dur: 4, isRest: true },
            { note: 'w', dur: 4, isRest: true },
            { note: 'w', dur: 4, isRest: true },
        ];

        let tempoIndex = 0;
        let globalTimeOffset = 0;

        const playAtTempo = () => {
            if (tempoIndex >= tempos.length) {
                const timer = this.scene.time.delayedCall(0, () => {
                    this._start();
                });
                this._timers.push(timer);
                return;
            }

            const beatDuration = 60 / tempos[tempoIndex];
            let tempoTimeOffset = 0;

            for (let loopNum = 0; loopNum < 4; loopNum++) {
                for (let i = 0; i < pattern.length; i++) {
                    const step = pattern[i];
                    const delay = (globalTimeOffset + tempoTimeOffset) * 1000;

                    if (!step.isRest) {
                        const timer = this.scene.time.delayedCall(delay, () => {
                            this.audioManager.playLowTone(step.note === 'p');
                        });
                        this._timers.push(timer);
                    }

                    tempoTimeOffset += step.dur * beatDuration;
                }
            }

            globalTimeOffset += tempoTimeOffset;
            tempoIndex++;
            playAtTempo();
        };

        playAtTempo();
    }

    shutdown() {
        this._timers.forEach(timer => {
            this.scene.time.removeEvent(timer);
        });
        this._timers = [];
    }
}
