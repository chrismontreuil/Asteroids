import { Asteroid } from '../objects/Asteroid.js';

export class WaveManager {
    constructor(scene, gameState) {
        this.scene     = scene;
        this.gameState = gameState;

        this._transitioning = false;
        this._firstWave     = true;
    }

    startWave() {
        this._transitioning = false;

        const level    = this.gameState.level;
        const numRocks = Math.min(2 + level, 12);
        const speedScale = 1 + (level - 1) * 0.1;

        for (let i = 0; i < numRocks; i++) {
            const pos      = this._edgePosition();
            const asteroid = new Asteroid(this.scene, pos.x, pos.y, 'large');
            this.scene.asteroids.add(asteroid);
            asteroid.launch(speedScale);
        }

        // Show wave label on all waves after the first
        if (!this._firstWave) {
            this.scene.showWaveLabel(level);
        }
        this._firstWave = false;
    }

    update(time, delta) {
        if (this._transitioning) { return; }

        const remaining = this.scene.asteroids.countActive(true);
        if (remaining === 0) {
            this._transitioning = true;
            this.gameState.nextLevel();

            this.scene.time.delayedCall(1500, () => {
                this.startWave();
            });
        }
    }

    _edgePosition() {
        const w    = this.scene.scale.width;
        const h    = this.scene.scale.height;
        const edge = Phaser.Math.Between(0, 3);

        if (edge === 0) { return { x: Phaser.Math.Between(0, w), y: 0 }; }
        if (edge === 1) { return { x: Phaser.Math.Between(0, w), y: h }; }
        if (edge === 2) { return { x: 0, y: Phaser.Math.Between(0, h) }; }
                          return { x: w, y: Phaser.Math.Between(0, h) };
    }
}
