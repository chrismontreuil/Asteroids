import { TEX, BULLET_SPEED, BULLET_LIFESPAN } from '../constants.js';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, TEX.BULLET);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this._elapsed = 0;
    }

    // Called after group.add() to set velocity — Phaser can reset body state during add()
    launch(angleRad) {
        this.body.setVelocity(
            Math.cos(angleRad) * BULLET_SPEED,
            Math.sin(angleRad) * BULLET_SPEED,
        );
    }

    update(delta) {
        this._elapsed += delta;
        if (this._elapsed >= BULLET_LIFESPAN) {
            this.destroy();
        }
    }
}
