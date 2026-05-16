import { MINE_LIFESPAN, MINE_SPEED, MINE_EXPLOSION_DURATION, MINE_EXPLOSION_RADIUS } from '../constants.js';
import { WrapBounds } from '../utils/WrapBounds.js';

export class Mine extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'mine');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setScale(1);
    this.body.setCircle(16, 0, 0);

    this._rotation = 0;
    this._elapsed = 0;
    this._exploding = false;
    this._explosionRadius = 0;
    this._explosionGraphics = null;

    this._cornerGraphics = scene.add.graphics();
    this._cornerGraphics.setDepth(5);
    this._blinkOn = true;
    this._blinkTimer = 0;
    this._blinkInterval = 400;
    this._drawCorners();
  }

  launch(angleRad) {
    if (this.scene) {
      this.scene.sound.play('mine-explosion');
      this.scene.time.delayedCall(1000, () => {
        if (this.scene) {
          this.body.setVelocity(
            Math.cos(angleRad) * MINE_SPEED,
            Math.sin(angleRad) * MINE_SPEED,
          );
        }
      });
    }
  }

  update(delta) {
    if (!this.scene) {
      return;
    }

    if (this._exploding) {
      this._updateExplosion(delta);
      return;
    }

    this._elapsed += delta;
    this._rotation += delta * 0.006;
    this.setRotation(this._rotation);

    this._blinkTimer += delta;
    if (this._blinkTimer >= this._blinkInterval) {
      this._blinkTimer -= this._blinkInterval;
      this._blinkOn = !this._blinkOn;
    }
    this._drawCorners();

    WrapBounds.wrap(this.scene, this);

    if (this._elapsed >= MINE_LIFESPAN) {
      this._startExplosion();
    }
  }

  _drawCorners() {
    if (!this._cornerGraphics) { return; }
    this._cornerGraphics.clear();
    if (!this._blinkOn) { return; }

    // Triangle vertices relative to center, rotated
    const verts = [
      { x: 0, y: -12 },
      { x: 12, y: 8 },
      { x: -12, y: 8 },
    ];
    const cos = Math.cos(this._rotation);
    const sin = Math.sin(this._rotation);

    this._cornerGraphics.fillStyle(0xff0000, 1);
    for (const v of verts) {
      const rx = v.x * cos - v.y * sin;
      const ry = v.x * sin + v.y * cos;
      this._cornerGraphics.fillCircle(this.x + rx, this.y + ry, 2.5);
    }
  }

  _startExplosion() {
    if (this._exploding) { return; }

    this._exploding = true;
    this._elapsed = 0;
    this.body.setVelocity(0, 0);
    this.setVisible(false);
    if (this._cornerGraphics) {
      this._cornerGraphics.clear();
    }

    if (this.scene) {
      this._explosionGraphics = this.scene.add.graphics({ x: this.x, y: this.y });
      this._explosionGraphics.setDepth(4);
    }
  }

  _updateExplosion(delta) {
    this._elapsed += delta;
    const progress = this._elapsed / MINE_EXPLOSION_DURATION;
    this._explosionRadius = progress * MINE_EXPLOSION_RADIUS;

    if (this._explosionGraphics) {
      this._explosionGraphics.clear();
      const flash = Math.sin(progress * Math.PI * 4) * 0.3 + 0.5;
      this._explosionGraphics.fillStyle(0xff0000, 0.7 * flash);
      this._explosionGraphics.fillCircle(0, 0, this._explosionRadius);
      this._explosionGraphics.lineStyle(2, 0xff6600, 0.8 * flash);
      this._explosionGraphics.strokeCircle(0, 0, this._explosionRadius);
    }

    if (progress >= 1) {
      if (this._explosionGraphics) {
        this._explosionGraphics.clear();
        this._explosionGraphics.destroy();
        this._explosionGraphics = null;
      }
      this.destroy();
    }
  }

  getExplosionRadius() {
    return this._exploding ? this._explosionRadius : 0;
  }

  isExploding() {
    return this._exploding;
  }

  die() {
    this._cleanupGraphics();
    this.destroy();
  }

  destroy(fromScene) {
    this._cleanupGraphics();
    super.destroy(fromScene);
  }

  _cleanupGraphics() {
    if (this._explosionGraphics) {
      this._explosionGraphics.destroy();
      this._explosionGraphics = null;
    }
    if (this._cornerGraphics) {
      this._cornerGraphics.destroy();
      this._cornerGraphics = null;
    }
  }
}
