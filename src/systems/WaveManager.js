import { Asteroid } from "../objects/Asteroid.js";
import { Octopus } from "../objects/Octopus.js";

export class WaveManager {
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;

    this._transitioning = false;
    this._firstWave = true;
  }

  startWave() {
    this._transitioning = false;

    // Reset pickup abilities when starting new wave
    this.scene.ship.resetAbilities();
    this.scene.pickupManager.reset();
    this.scene.resetSaucer();
    this.scene.resetOctopuses();

    const level = this.gameState.level;
    const numRocks = Math.min(16 + level, 33);
    const speedScale = 2 + (level - 1) * 0.1;

    // Spawn 3 giant asteroids
    for (let i = 0; i < 3; i++) {
      const pos = this._edgePosition();
      const asteroid = new Asteroid(this.scene, pos.x, pos.y, "giant");
      this.scene.asteroids.add(asteroid);
      asteroid.launch(speedScale);
    }

    // Spawn regular large asteroids
    for (let i = 0; i < numRocks; i++) {
      const pos = this._edgePosition();
      const asteroid = new Asteroid(this.scene, pos.x, pos.y, "large");
      this.scene.asteroids.add(asteroid);
      asteroid.launch(speedScale);
    }

    // Spawn octopuses starting from level 2
    if (level >= 2) {
      const numOctopuses = 1 + Math.floor((level - 1) / 2);
      for (let i = 0; i < numOctopuses; i++) {
        const pos = this._randomCenterPosition();
        const octopus = new Octopus(this.scene, pos.x, pos.y);
        this.scene.octopuses.add(octopus);
      }
    }

    // Show wave label on all waves after the first
    if (!this._firstWave) {
      this.scene.showWaveLabel(level);
      this.scene.audioManager.playSecondWave();
    }
    this._firstWave = false;
  }

  update(time, delta) {
    if (this._transitioning) {
      return;
    }

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
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const edge = Phaser.Math.Between(0, 3);

    if (edge === 0) {
      return { x: Phaser.Math.Between(0, w), y: 0 };
    }
    if (edge === 1) {
      return { x: Phaser.Math.Between(0, w), y: h };
    }
    if (edge === 2) {
      return { x: 0, y: Phaser.Math.Between(0, h) };
    }
    return { x: w, y: Phaser.Math.Between(0, h) };
  }

  _randomCenterPosition() {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const margin = 150;
    return {
      x: Phaser.Math.Between(margin, w - margin),
      y: Phaser.Math.Between(margin, h - margin),
    };
  }
}
