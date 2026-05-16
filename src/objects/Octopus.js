import {
  TEX,
  OCTOPUS_TENTACLE_REGROW_DELAY,
  OCTOPUS_BODY_SCORE,
  OCTOPUS_TENTACLE_SCORE,
  CENTER_EXCLUSION_RADIUS,
} from '../constants.js';
import { WrapBounds } from '../utils/WrapBounds.js';

export class Octopus extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.OCTOPUS);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setScale(1.5);
    this.body.setCircle(30);
    this.setDrag(0.99);

    this.tentacles = new Array(8).fill(true);
    this.tentacleHealth = new Array(8).fill(3);
    this.tentacleRegrowTimers = new Array(8).fill(null);
    this.allTentaclesDestroyed = false;
    this.bodyVulnerable = false;
    this.bodyVulnerableTimer = null;
    this._tentacleOffsets = new Array(8);
    this._initTentacleOffsets();

    this.tentacleColliders = [];
    this._createTentacleColliders();

    this.bodyCollider = null;
    this._createBodyCollider();

    this.xMin = null;
    this.xMax = null;
  }

  setXBounds(xMin, xMax) {
    this.xMin = xMin;
    this.xMax = xMax;
  }

  _initTentacleOffsets() {
    for (let i = 0; i < 8; i++) {
      this._tentacleOffsets[i] = {
        angle: (i / 8) * Math.PI * 2,
        sway: 0,
        bendDirection: Math.random() > 0.5 ? 1 : -1,
      };
    }
  }

  _createTentacleColliders() {
    for (let i = 0; i < 8; i++) {
      const rect = this.scene.add.rectangle(this.x, this.y, 18, 60);
      this.scene.physics.add.existing(rect);
      rect.body.setCollideWorldBounds(false);
      rect.octopus = this;
      rect.tentacleIndex = i;
      this.scene.tentacles.add(rect);
      this.tentacleColliders.push(rect);
    }
  }

  _createBodyCollider() {
    const rect = this.scene.add.rectangle(this.x, this.y, 36, 36);
    this.scene.physics.add.existing(rect);
    rect.body.setCollideWorldBounds(false);
    rect.octopus = this;
    rect.isBodyCollider = true;
    rect.setActive(false);
    rect.setVisible(false);
    this.scene.tentacles.add(rect);
    this.bodyCollider = rect;
  }

  update(delta) {
    if (!this.scene || !this.scene.ship) {
      return;
    }

    this._moveTowardPlayer();
    this._animateTentacles(delta);
    this._updateTentacleColliders();
    WrapBounds.wrap(this.scene, this);
    this._clampXBounds();
  }

  _updateTentacleColliders() {
    const tentacleLength = 60;

    for (let i = 0; i < 8; i++) {
      const collider = this.tentacleColliders[i];

      const baseAngle = this._tentacleOffsets[i].angle;
      const sway = Math.sin(this._tentacleOffsets[i].sway) * 0.3;
      const angle = baseAngle + sway;

      const midX = this.x + Math.cos(angle) * (tentacleLength / 2);
      const midY = this.y + Math.sin(angle) * (tentacleLength / 2);

      collider.setPosition(midX, midY);
      collider.setRotation(angle);
      collider.setActive(this.tentacles[i]);
      collider.setVisible(false);
    }

    this.bodyCollider.setPosition(this.x, this.y);
    this.bodyCollider.setActive(this.bodyVulnerable);
    this.bodyCollider.setVisible(false);
  }

  _moveTowardPlayer() {
    const dx = this.scene.ship.x - this.x;
    const dy = this.scene.ship.y - this.y;
    const distToPlayer = Math.sqrt(dx * dx + dy * dy);

    const speed = 40;
    let desiredVx = 0;
    let desiredVy = 0;

    if (distToPlayer > 0) {
      desiredVx = (dx / distToPlayer) * speed;
      desiredVy = (dy / distToPlayer) * speed;
    }

    const cx = this.scene.scale.width / 2;
    const cy = this.scene.scale.height / 2;
    const cdx = this.x - cx;
    const cdy = this.y - cy;
    const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
    if (cdist < CENTER_EXCLUSION_RADIUS && cdist > 0) {
      const strength = (CENTER_EXCLUSION_RADIUS - cdist) / CENTER_EXCLUSION_RADIUS;
      desiredVx += (cdx / cdist) * strength * 40 * 3;
      desiredVy += (cdy / cdist) * strength * 40 * 3;
    }

    if (this.xMin !== null && this.x <= this.xMin && desiredVx < 0) {
      desiredVx = 0;
    }
    if (this.xMax !== null && this.x >= this.xMax && desiredVx > 0) {
      desiredVx = 0;
    }

    this.body.setVelocity(desiredVx, desiredVy);
  }

  _clampXBounds() {
    if (this.xMin !== null && this.x < this.xMin) {
      this.x = this.xMin;
      this.body.velocity.x = 0;
    }
    if (this.xMax !== null && this.x > this.xMax) {
      this.x = this.xMax;
      this.body.velocity.x = 0;
    }
  }

  _animateTentacles(delta) {
    for (let i = 0; i < 8; i++) {
      this._tentacleOffsets[i].sway += delta * 0.002;
    }
    this.updateTexture();
  }

  shootTentacle(index) {
    if (index < 0 || index >= 8 || !this.tentacles[index]) {
      return false;
    }

    this.tentacleHealth[index]--;

    if (this.tentacleHealth[index] <= 0) {
      this.tentacles[index] = false;
      this.tentacleHealth[index] = 0;

      const allGone = this.tentacles.every(t => !t);
      if (allGone && !this.allTentaclesDestroyed) {
        this.allTentaclesDestroyed = true;
        this.bodyVulnerable = true;
        this._setupBodyVulnerableTimeout();
      }

      this._setupTentacleRegrow(index);
    }

    this.updateTexture();
    return true;
  }

  _setupBodyVulnerableTimeout() {
    if (this.bodyVulnerableTimer) {
      this.scene.time.removeEvent(this.bodyVulnerableTimer);
    }

    this.bodyVulnerableTimer = this.scene.time.addEvent({
      delay: OCTOPUS_TENTACLE_REGROW_DELAY,
      callback: () => this._bodyVulnerableExpired(),
      loop: false,
    });
  }

  _bodyVulnerableExpired() {
    this.bodyVulnerable = false;
    this.allTentaclesDestroyed = false;
    this.updateTexture();
  }

  _setupTentacleRegrow(index) {
    if (this.tentacleRegrowTimers[index]) {
      this.scene.time.removeEvent(this.tentacleRegrowTimers[index]);
    }

    this.tentacleRegrowTimers[index] = this.scene.time.addEvent({
      delay: OCTOPUS_TENTACLE_REGROW_DELAY,
      callback: () => this._regrowTentacle(index),
      loop: false,
    });
  }

  _regrowTentacle(index) {
    this.tentacles[index] = true;
    this.tentacleHealth[index] = 3;
    this.tentacleRegrowTimers[index] = null;
    this.updateTexture();
  }

  updateTexture() {
    const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
    const centerX = 70;
    const centerY = 70;

    g.fillStyle(0x2a0000, 1);
    g.fillCircle(centerX, centerY, 18);

    const tentacleLength = 60;

    for (let i = 0; i < 8; i++) {
      if (!this.tentacles[i]) continue;

      const baseAngle = this._tentacleOffsets[i].angle;
      const sway = Math.sin(this._tentacleOffsets[i].sway) * 0.15;
      const bendDir = this._tentacleOffsets[i].bendDirection;

      const elbowDist = tentacleLength * 0.5;
      const elbowAngle = baseAngle + sway * 1.5 * bendDir;

      const elbowX = centerX + Math.cos(elbowAngle) * elbowDist;
      const elbowY = centerY + Math.sin(elbowAngle) * elbowDist;

      const tipAngle = baseAngle + sway * 0.5 * bendDir;
      const tipX = centerX + Math.cos(tipAngle) * tentacleLength;
      const tipY = centerY + Math.sin(tipAngle) * tentacleLength;

      const baseWidth = 12;
      const elbowWidth = 8;
      const tipWidth = 3;

      const perpBase = elbowAngle + Math.PI / 2;
      const perpElbow = tipAngle + Math.PI / 2;

      const baseLx = centerX + Math.cos(perpBase) * baseWidth;
      const baseLy = centerY + Math.sin(perpBase) * baseWidth;
      const baseRx = centerX - Math.cos(perpBase) * baseWidth;
      const baseRy = centerY - Math.sin(perpBase) * baseWidth;

      const elbowLx = elbowX + Math.cos(perpElbow) * elbowWidth;
      const elbowLy = elbowY + Math.sin(perpElbow) * elbowWidth;
      const elbowRx = elbowX - Math.cos(perpElbow) * elbowWidth;
      const elbowRy = elbowY - Math.sin(perpElbow) * elbowWidth;

      const tipLx = tipX + Math.cos(perpElbow) * tipWidth;
      const tipLy = tipY + Math.sin(perpElbow) * tipWidth;
      const tipRx = tipX - Math.cos(perpElbow) * tipWidth;
      const tipRy = tipY - Math.sin(perpElbow) * tipWidth;

      g.fillStyle(0x2a0000, 1);
      g.beginPath();
      g.moveTo(baseLx, baseLy);
      g.lineTo(elbowLx, elbowLy);
      g.lineTo(tipLx, tipLy);
      g.lineTo(tipRx, tipRy);
      g.lineTo(elbowRx, elbowRy);
      g.lineTo(baseRx, baseRy);
      g.closePath();
      g.fillPath();
    }

    const texName = `octopus-${Date.now()}`;
    g.generateTexture(texName, 140, 140);
    g.destroy();

    this.setTexture(texName);

    let alpha = 1;
    if (this.bodyVulnerable) {
      alpha = 0.5;
    }
    this.setAlpha(alpha);
  }

  die() {
    if (this.bodyVulnerableTimer && this.scene) {
      this.scene.time.removeEvent(this.bodyVulnerableTimer);
      this.bodyVulnerableTimer = null;
    }
    for (let i = 0; i < 8; i++) {
      if (this.tentacleRegrowTimers[i] && this.scene) {
        this.scene.time.removeEvent(this.tentacleRegrowTimers[i]);
        this.tentacleRegrowTimers[i] = null;
      }
    }
    this.tentacleColliders.forEach(c => c.destroy());
    if (this.bodyCollider) {
      this.bodyCollider.destroy();
    }
    this.destroy();
  }
}
