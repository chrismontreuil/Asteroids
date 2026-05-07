import {
  BIG_SAUCER_SPEED,
  BIG_SAUCER_AVOID_RADIUS,
  BIG_SAUCER_FIRE_INTERVAL,
  BIG_SAUCER_MAX_HEALTH,
} from '../constants.js';
import { Mine } from './Mine.js';
import { WrapBounds } from '../utils/WrapBounds.js';

export class BigSaucer extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'big-saucer');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setScale(1);
    this.body.setCircle(56, 0, 0);
    this.setVisible(false);

    this._health = BIG_SAUCER_MAX_HEALTH;
    this._elapsed = 0;
    this._graphics = scene.add.graphics();
    this._graphics.setDepth(3);

    this._fireTimer = this.scene.time.addEvent({
      delay: BIG_SAUCER_FIRE_INTERVAL,
      callback: () => this._fire(),
      loop: true,
    });

    this._soundTimer = this.scene.time.addEvent({
      delay: 1000,
      callback: () => this.scene.audioManager.playSaucerSound(),
      loop: true,
    });

    this.scene.time.delayedCall(500, () => {
      if (this.scene && this.scene.ship && this.scene.ship.active) {
        this._fire();
      }
    });
  }

  update(delta) {
    if (!this.scene || !this.scene.ship) {
      return;
    }

    this._elapsed += delta;
    this._steer();
    this._draw();
  }

  _draw() {
    this._graphics.clear();
    const healthPercent = this._health / BIG_SAUCER_MAX_HEALTH;
    const red = 255;
    const green = Math.floor((1 - healthPercent) * 255);
    const blue = 0;
    const fillColor = (red << 16) | (green << 8) | blue;

    const cx = this.x + 50;
    const cy = this.y + 53;

    // Main body - symmetric top and bottom
    this._graphics.fillStyle(fillColor, 1);
    this._graphics.beginPath();
    this._graphics.moveTo(cx - 72, cy);        // Left point
    this._graphics.lineTo(cx - 32, cy + 28); // Left bottom angle
    this._graphics.lineTo(cx + 32, cy + 28); // Right bottom angle
    this._graphics.lineTo(cx + 72, cy);       // Right point
    this._graphics.lineTo(cx + 32, cy - 28); // Right top angle
    this._graphics.lineTo(cx - 32, cy - 28); // Left top angle
    this._graphics.closePath();
    this._graphics.fillPath();

    // Stroke outline - body only
    this._graphics.lineStyle(2, 0xffffff, 1);
    this._graphics.beginPath();
    this._graphics.moveTo(cx - 72, cy);
    this._graphics.lineTo(cx - 32, cy - 28);
    this._graphics.lineTo(cx + 32, cy - 28);
    this._graphics.lineTo(cx + 72, cy);
    this._graphics.lineTo(cx + 32, cy + 28);
    this._graphics.lineTo(cx - 32, cy + 28);
    this._graphics.closePath();
    this._graphics.strokePath();

    // Dome - semicircle ellipse (top half only)
    this._graphics.lineStyle(2, 0xffffff, 1);
    this._graphics.beginPath();
    this._graphics.moveTo(cx - 32.4, cy - 28);
    for (let i = 1; i <= 10; i++) {
      const angle = Math.PI * (1 - i / 10);
      const x = cx + 32.4 * Math.cos(angle);
      const y = (cy - 28) - 19.44 * Math.sin(angle);
      this._graphics.lineTo(x, y);
    }
    this._graphics.strokePath();

    // Horizontal dividing line through middle
    this._graphics.lineStyle(2, 0xffffff, 1);
    this._graphics.lineBetween(cx - 72, cy, cx + 72, cy);

    // Three white portholes in top section (stroked, not filled)
    this._graphics.lineStyle(2, 0xffffff, 1);
    this._graphics.strokeCircle(cx - 24, cy - 14, 10);
    this._graphics.strokeCircle(cx, cy - 14, 10);
    this._graphics.strokeCircle(cx + 24, cy - 14, 10);
  }

  _steer() {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;

    const shipX = this.scene.ship.x;
    const shipY = this.scene.ship.y;

    let desiredVx = (shipX - this.x) * 0.15;
    let desiredVy = (shipY - this.y) * 0.15;

    const asteroids = this.scene.asteroids.getChildren();
    for (const asteroid of asteroids) {
      if (!asteroid.active) continue;

      const adx = asteroid.x - this.x;
      const ady = asteroid.y - this.y;
      const dist = Math.sqrt(adx * adx + ady * ady);

      if (dist > 0 && dist < BIG_SAUCER_AVOID_RADIUS) {
        const repulsionStrength = (BIG_SAUCER_AVOID_RADIUS - dist) / BIG_SAUCER_AVOID_RADIUS;
        desiredVx -= (adx / dist) * repulsionStrength * BIG_SAUCER_SPEED * 0.8;
        desiredVy -= (ady / dist) * repulsionStrength * BIG_SAUCER_SPEED * 0.8;
      }
    }

    const speed = Math.sqrt(desiredVx * desiredVx + desiredVy * desiredVy);
    if (speed > BIG_SAUCER_SPEED) {
      desiredVx = (desiredVx / speed) * BIG_SAUCER_SPEED;
      desiredVy = (desiredVy / speed) * BIG_SAUCER_SPEED;
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

    const mine = new Mine(this.scene, this.x, this.y);
    this.scene.mines.add(mine);
    mine.launch(angle);
  }

  takeHit() {
    this._health--;
    return this._health <= 0;
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
    if (this._graphics) {
      this._graphics.clear();
      this._graphics.destroy();
      this._graphics = null;
    }
    this.destroy();
  }
}
