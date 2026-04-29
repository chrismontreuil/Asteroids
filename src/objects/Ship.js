import {
    TEX,
    SHIP_ROTATION_SPEED,
    SHIP_THRUST_FORCE,
    SHIP_MAX_SPEED,
    MAX_PLAYER_BULLETS,
    INVULNERABILITY_MS,
    BURST_BULLET_COUNT,
    BURST_BULLET_DELAY,
} from '../constants.js';
import { Bullet } from './Bullet.js';

export class Ship extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, TEX.SHIP);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Pivot at hull center (y=35 of 100px texture); display at 40×50px
        this.setOrigin(0.5, 0.35);
        this.setScale(0.5);

        // Circular hitbox in display-pixel space (radius 16, centered on hull)
        this.body.setCircle(16, 4, 2);
        this.body.setMaxVelocity(SHIP_MAX_SPEED, SHIP_MAX_SPEED);
        this.body.setDamping(true);
        this.body.setDrag(0.99, 0.99);

        this.isInvulnerable = false;
        this._invulnTween   = null;

        this.hasBurstFire = false;
        this._burstActive = false;
        this._burstCount = 0;
        this._burstTimer = null;

        this.hasWideFire = false;
    }

    update(input) {
        // Rotation
        if (input.state.rotateLeft) {
            this.setAngularVelocity(-SHIP_ROTATION_SPEED);
        } else if (input.state.rotateRight) {
            this.setAngularVelocity(SHIP_ROTATION_SPEED);
        } else {
            this.setAngularVelocity(0);
        }

        // Thrust — the texture is drawn nose-up, so we subtract 90° to align with Phaser's angle convention
        if (input.state.thrust) {
            const rad = Phaser.Math.DegToRad(this.angle - 90);
            this.body.setAcceleration(
                Math.cos(rad) * SHIP_THRUST_FORCE,
                Math.sin(rad) * SHIP_THRUST_FORCE,
            );
            this._setTextureForState(true);
        } else {
            this.body.setAcceleration(0, 0);
            this._setTextureForState(false);
        }

        // setTexture resets scale — reapply after every swap
        this.setScale(0.5);

        // Fire
        if (input.state.fire) {
            this._tryFire();
        }
    }

    _tryFire() {
        if (this.hasWideFire) {
            this._fireWide();
            return;
        }

        if (!this.hasBurstFire) {
            this._fireOnce();
            return;
        }

        if (this._burstActive) { return; }

        this._burstActive = true;
        this._burstCount = 0;
        this._fireBurst();
    }

    _fireWide() {
        const spreadAngles = [-30, -15, 0, 15, 30];
        for (const offset of spreadAngles) {
            const rad = Phaser.Math.DegToRad(this.angle - 90 + offset);
            this._fireOnceAtAngle(rad, 0xffff00);
        }
    }

    _fireBurst() {
        if (this._burstCount >= BURST_BULLET_COUNT) {
            this._burstActive = false;
            return;
        }

        this._fireOnce();
        this._burstCount++;

        if (this._burstTimer) {
            this.scene.time.removeEvent(this._burstTimer);
        }
        this._burstTimer = this.scene.time.delayedCall(
            BURST_BULLET_DELAY,
            () => this._fireBurst()
        );
    }

    _fireOnce() {
        const rad = Phaser.Math.DegToRad(this.angle - 90);
        const tint = this.hasBurstFire ? 0x0099ff : 0xffffff;
        this._fireOnceAtAngle(rad, tint);
    }

    _fireOnceAtAngle(rad, tint) {
        const bullets = this.scene.bullets.getChildren();
        if (bullets.length >= MAX_PLAYER_BULLETS) { return; }

        const noseX = this.x + Math.cos(rad) * 15;
        const noseY = this.y + Math.sin(rad) * 15;

        const bullet = new Bullet(this.scene, noseX, noseY);
        bullet.setTint(tint);
        this.scene.bullets.add(bullet);
        bullet.launch(rad);
        this.scene.audioManager.playShoot();
    }

    startInvulnerability(duration) {
        this.isInvulnerable = true;

        if (this._invulnTween) {
            this._invulnTween.stop();
        }

        this._invulnTween = this.scene.tweens.add({
            targets:  this,
            alpha:    0.2,
            duration: 120,
            yoyo:     true,
            repeat:   Math.floor(duration / 240),
        });

        this.scene.time.delayedCall(duration, () => {
            this.isInvulnerable = false;
            this.setAlpha(1);
            if (this._invulnTween) {
                this._invulnTween.stop();
                this._invulnTween = null;
            }
        });
    }

    _setTextureForState(isThrusting) {
        if (this.hasWideFire) {
            this.setTexture(isThrusting ? TEX.SHIP_WIDE_THRUST : TEX.SHIP_WIDE);
        } else if (this.hasBurstFire) {
            this.setTexture(isThrusting ? TEX.SHIP_BURST_THRUST : TEX.SHIP_BURST);
        } else {
            this.setTexture(isThrusting ? TEX.SHIP_THRUST : TEX.SHIP);
        }
    }

    enableBurstFire() {
        if (this.hasWideFire) {
            // Switch from wide to burst
            this.hasWideFire = false;
        }
        this.hasBurstFire = true;
        this._setTextureForState(false);
    }

    enableWideFire() {
        if (this.hasBurstFire) {
            // Switch from burst to wide
            this.hasBurstFire = false;
            this._burstActive = false;
            this._burstCount = 0;
            if (this._burstTimer) {
                this.scene.time.removeEvent(this._burstTimer);
                this._burstTimer = null;
            }
        }
        this.hasWideFire = true;
        this._setTextureForState(false);
    }

    resetAbilities() {
        this.hasBurstFire = false;
        this.hasWideFire = false;
        this._setTextureForState(false);
        this._burstActive = false;
        this._burstCount = 0;
        if (this._burstTimer) {
            this.scene.time.removeEvent(this._burstTimer);
            this._burstTimer = null;
        }
    }
}
