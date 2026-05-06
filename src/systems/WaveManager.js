import { Asteroid } from "../objects/Asteroid.js";
import { Octopus } from "../objects/Octopus.js";
import { SAUCER_RESPAWN_DELAY } from '../constants.js';

export class WaveManager {
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;

    this._transitioning = false;
    this._firstWave = true;
    this._saucerKillCount = 0;
    this._saucerKillTarget = 0;
  }

  startWave() {
    this._transitioning = false;

    this.scene.ship.resetAbilities();
    this.scene.pickupManager.reset();
    this.scene.resetOctopuses();
    this.scene.clearMines();
    this.scene.clearAsteroids();

    const level = this.gameState.level;

    if (level === 1) {
      this._startWave1();
    } else if (level === 2) {
      this._startWave2();
    } else if (level === 3) {
      this._startWave3();
    } else if (level === 4) {
      this._startWave4();
    } else if (level === 5) {
      this._startWave5();
    } else if (level === 6) {
      this._startWave6();
    } else {
      this._startRegularWave();
    }

    if (!this._firstWave) {
      this.scene.showWaveLabel(level);
      this.scene.audioManager.playSecondWave();
    }
    this._firstWave = false;
  }

  _startWave1() {
    this.scene.pickupManager.setMode('colorOnly', false);
    this.scene.pickupManager.reset();
    this.scene.clearSaucers();

    // Three stationary giant asteroids
    const asteroidPositions = [
      { x: 300, y: 250 },
      { x: 1620, y: 250 },
      { x: 960, y: 830 },
    ];

    asteroidPositions.forEach(pos => {
      const asteroid = new Asteroid(this.scene, pos.x, pos.y, 'giant');
      this.scene.asteroids.add(asteroid);
      asteroid.launch();
    });

    this.scene.pickupManager.setAsteroidPositions(asteroidPositions);
  }

  _startWave2() {
    this.scene.pickupManager.setMode('none');
    this.scene.pickupManager.reset();
    this.scene.clearSaucers();
    this._saucerKillCount = 0;
    this._saucerKillTarget = 5;
    this.scene._spawnSaucer();
  }

  _startWave3() {
    this.scene.pickupManager.setMode('none');
    this.scene.pickupManager.reset();
    this.scene.clearSaucers();
    this._saucerKillCount = 0;
    this._saucerKillTarget = 1;
    this.scene._spawnBigSaucer();

    for (let i = 0; i < 10; i++) {
      const pos = this._edgePosition();
      const asteroid = new Asteroid(this.scene, pos.x, pos.y, 'medium');
      this.scene.asteroids.add(asteroid);
      asteroid.launch();
    }
  }

  _startWave4() {
    this.scene.pickupManager.setMode('colorOnly', true);
    this.scene.pickupManager.reset();
    this.scene.clearSaucers();
  }

  _startWave5() {
    this.scene.pickupManager.setMode('colorOnly', true);
    this.scene.pickupManager.reset();
    this.scene.clearSaucers();
    this.scene._spawnSaucer();
  }

  _startWave6() {
    this.scene.pickupManager.setMode('blueWeapon', true);
    this.scene.pickupManager.reset();
    this.scene.clearSaucers();

    for (let i = 0; i < 5; i++) {
      const pos = this._edgePosition();
      const asteroid = new Asteroid(this.scene, pos.x, pos.y, 'large');
      this.scene.asteroids.add(asteroid);
      asteroid.launch();
    }

    this.scene.time.delayedCall(5000, () => {
      if (!this._transitioning) {
        this.scene._spawnSaucer();
      }
    });
  }

  _startRegularWave() {
    this.scene.pickupManager.setMode('full', true);
    this.scene.pickupManager.reset();
    this.scene.resetSaucer();
    const level = this.gameState.level;
    const numRocks = Math.min(16 + (level - 7), 33);
    const speedScale = 2 + (level - 7) * 0.1;

    for (let i = 0; i < 3; i++) {
      const pos = this._edgePosition();
      const asteroid = new Asteroid(this.scene, pos.x, pos.y, 'giant');
      this.scene.asteroids.add(asteroid);
      asteroid.launch(speedScale);
    }

    for (let i = 0; i < numRocks; i++) {
      const pos = this._edgePosition();
      const asteroid = new Asteroid(this.scene, pos.x, pos.y, 'large');
      this.scene.asteroids.add(asteroid);
      asteroid.launch(speedScale);
    }

    if (level >= 9) {
      const numOctopuses = 1 + Math.floor((level - 8) / 2);
      for (let i = 0; i < numOctopuses; i++) {
        const pos = this._randomCenterPosition();
        const octopus = new Octopus(this.scene, pos.x, pos.y);
        this.scene.octopuses.add(octopus);
      }
    }
  }

  update(time, delta) {
    if (this._transitioning) {
      return;
    }

    const level = this.gameState.level;

    if (level === 1) {
      this._checkWave1();
    } else if (level === 2) {
      this._checkWave2();
    } else if (level === 3) {
      this._checkWave3();
    } else if (level === 4) {
      this._checkWave4();
    } else if (level === 5) {
      this._checkWave5();
    } else if (level === 6) {
      this._checkWave6();
    } else {
      this._checkRegularWave();
    }
  }

  _checkWave1() {
    if (this.scene.pickupManager.trainingComplete) {
      this._advanceWave();
    }
  }

  _checkWave2() {
    if (this._saucerKillCount >= this._saucerKillTarget) {
      this._advanceWave();
    }
  }

  _checkWave3() {
    if (this._saucerKillCount >= this._saucerKillTarget) {
      this._advanceWave();
    }
  }

  _checkWave4() {
    if (this.scene.pickupManager.trainingComplete) {
      this._advanceWave();
    }
  }

  _checkWave5() {
    if (this.scene.pickupManager.trainingComplete) {
      this._advanceWave();
    }
  }

  _checkWave6() {
    const remaining = this.scene.asteroids.countActive(true);
    if (remaining === 0) {
      this._advanceWave();
    }
  }

  _checkRegularWave() {
    const remaining = this.scene.asteroids.countActive(true);
    if (remaining === 0) {
      this._advanceWave();
    }
  }

  _advanceWave() {
    this._transitioning = true;
    this.gameState.nextLevel();

    this.scene.time.delayedCall(1500, () => {
      this.startWave();
    });
  }

  onSaucerKilled() {
    const level = this.gameState.level;
    if (level >= 2 && level <= 3) {
      this._saucerKillCount++;
    }
  }

  getSaucerRespawnDelay() {
    const level = this.gameState.level;
    if (level >= 2 && level <= 3) {
      return 3000;
    }
    if (level === 5) {
      return 5000;
    }
    return SAUCER_RESPAWN_DELAY;
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
