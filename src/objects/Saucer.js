import {
  TEX,
  SAUCER_SPEED,
  SAUCER_AVOID_RADIUS,
  SAUCER_FIRE_INTERVAL,
} from '../constants.js';
import { Bullet } from './Bullet.js';
import { WrapBounds } from '../utils/WrapBounds.js';

export class Saucer extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.SAUCER);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setScale(1);
    this.body.setCircle(28, 0, 0);

    this._fireTimer = this.scene.time.addEvent({
      delay: SAUCER_FIRE_INTERVAL,
      callback: () => this._fire(),
      loop: true,
    });

    this._soundTimer = this.scene.time.addEvent({
      delay: 1000,
      callback: () => this.scene.audioManager.playSaucerSound(),
      loop: true,
    });
  }

  update(delta) {
    if (!this.scene || !this.scene.ship) {
      return;
    }

    this._steer();
    WrapBounds.wrap(this.scene, this);
  }

  _steer() {
    const dx = this.scene.ship.x - this.x;
    const dy = this.scene.ship.y - this.y;
    const distToPlayer = Math.sqrt(dx * dx + dy * dy);

    let desiredVx = 0;
    let desiredVy = 0;

    if (distToPlayer > 0) {
      desiredVx = (dx / distToPlayer) * SAUCER_SPEED;
      desiredVy = (dy / distToPlayer) * SAUCER_SPEED;
    }

    const asteroids = this.scene.asteroids.getChildren();
    for (const asteroid of asteroids) {
      if (!asteroid.active) continue;

      const adx = asteroid.x - this.x;
      const ady = asteroid.y - this.y;
      const dist = Math.sqrt(adx * adx + ady * ady);

      if (dist > 0 && dist < SAUCER_AVOID_RADIUS) {
        const repulsionStrength = (SAUCER_AVOID_RADIUS - dist) / SAUCER_AVOID_RADIUS;
        desiredVx -= (adx / dist) * repulsionStrength * SAUCER_SPEED * 0.8;
        desiredVy -= (ady / dist) * repulsionStrength * SAUCER_SPEED * 0.8;
      }
    }

    const speed = Math.sqrt(desiredVx * desiredVx + desiredVy * desiredVy);
    if (speed > SAUCER_SPEED) {
      desiredVx = (desiredVx / speed) * SAUCER_SPEED;
      desiredVy = (desiredVy / speed) * SAUCER_SPEED;
    }

    this.body.setVelocity(desiredVx, desiredVy);
  }

  _fire() {
    if (!this.scene.ship || !this.scene.ship.active) {
      return;
    }

    const dx = this.scene.ship.x - this.x;
    const dy = this.scene.ship.y - this.y;
    const angle = Math.atan2(dy, dx);

    const bullet = new Bullet(this.scene, this.x, this.y);
    bullet.setTint(0xff0000);
    this.scene.saucerBullets.add(bullet);
    bullet.launch(angle);
  }

  die() {
    if (this._fireTimer && this.scene) {
      this.scene.time.removeEvent(this._fireTimer);
      this._fireTimer = null;
    }
    if (this._soundTimer && this.scene) {
      this.scene.time.removeEvent(this._soundTimer);
      this._soundTimer = null;
    }
    this.destroy();
  }
}
