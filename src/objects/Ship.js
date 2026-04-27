import {
    TEX,
    SHIP_ROTATION_SPEED,
    SHIP_THRUST_FORCE,
    SHIP_MAX_SPEED,
    MAX_PLAYER_BULLETS,
    INVULNERABILITY_MS,
} from '../constants.js';
import { Bullet } from './Bullet.js';

export class Ship extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, TEX.SHIP);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Circular hitbox centered on the triangle (nose at y=2, base at y=36, center ~y=20)
        this.body.setCircle(16, 4, 4);
        this.body.setMaxVelocity(SHIP_MAX_SPEED, SHIP_MAX_SPEED);
        this.body.setDamping(true);
        this.body.setDrag(0.99, 0.99);

        this.isInvulnerable = false;
        this._invulnTween   = null;
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
            this.setTexture(TEX.SHIP_THRUST);
        } else {
            this.body.setAcceleration(0, 0);
            this.setTexture(TEX.SHIP);
        }

        // Fire
        if (input.state.fire) {
            this._tryFire();
        }
    }

    _tryFire() {
        const bullets = this.scene.bullets.getChildren();
        if (bullets.length >= MAX_PLAYER_BULLETS) { return; }

        // Spawn bullet from the nose (18px forward from center)
        const rad = Phaser.Math.DegToRad(this.angle - 90);
        const noseX = this.x + Math.cos(rad) * 18;
        const noseY = this.y + Math.sin(rad) * 18;

        const bullet = new Bullet(this.scene, noseX, noseY);
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
}
