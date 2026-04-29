import { BULLET_LIFESPAN, TEX } from '../constants.js';

export class HeatSeekBullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, targetAsteroid) {
        super(scene, x, y, TEX.BULLET);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this._elapsed = 0;
        this.targetAsteroid = targetAsteroid;
        this._steerSpeed = 100;
    }

    launch(angleRad, initialSpeed = 500) {
        this.body.setVelocity(
            Math.cos(angleRad) * initialSpeed,
            Math.sin(angleRad) * initialSpeed,
        );
    }

    update(delta) {
        this._elapsed += delta;

        if (this._elapsed >= BULLET_LIFESPAN) {
            this.destroy();
            return;
        }

        if (this.targetAsteroid && this.targetAsteroid.active) {
            this._steerTowards(this.targetAsteroid);
        }
    }

    _steerTowards(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
            return;
        }

        const currentVelX = this.body.velocity.x;
        const currentVelY = this.body.velocity.y;
        const currentSpeed = Math.sqrt(currentVelX * currentVelX + currentVelY * currentVelY);

        const targetAngle = Math.atan2(dy, dx);
        const currentAngle = Math.atan2(currentVelY, currentVelX);

        let angleDiff = targetAngle - currentAngle;
        if (angleDiff > Math.PI) {
            angleDiff -= Math.PI * 2;
        } else if (angleDiff < -Math.PI) {
            angleDiff += Math.PI * 2;
        }

        const turnAmount = Math.max(-0.1, Math.min(0.1, angleDiff * 0.3));
        const newAngle = currentAngle + turnAmount;

        const targetVelX = target.body.velocity.x;
        const targetVelY = target.body.velocity.y;
        const targetSpeed = Math.sqrt(targetVelX * targetVelX + targetVelY * targetVelY);

        const desiredSpeed = Math.min(currentSpeed + (targetSpeed - currentSpeed) * 0.02, 600);

        this.body.setVelocity(
            Math.cos(newAngle) * desiredSpeed,
            Math.sin(newAngle) * desiredSpeed,
        );
    }
}
