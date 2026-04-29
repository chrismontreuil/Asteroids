import { getAsteroidTexture, SIZE_TO_RADIUS_X, SIZE_TO_RADIUS_Y, SIZE_TO_SPEED, SCORE_FOR_SIZE } from '../constants.js';

const HITBOX_OFFSET = 5;

export class Asteroid extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, size) {
        super(scene, x, y, getAsteroidTexture(size));

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.size       = size;
        this.scoreValue = SCORE_FOR_SIZE[size];

        const radiusX = SIZE_TO_RADIUS_X[size];
        const radiusY = SIZE_TO_RADIUS_Y[size];
        const avgRadius = (radiusX + radiusY) / 2;
        this.body.setCircle(avgRadius, HITBOX_OFFSET, HITBOX_OFFSET);
    }

    // Called after group.add() to set velocity — Phaser can reset body state during add()
    launch(speedMultiplier) {
        const speed = SIZE_TO_SPEED[this.size] * (speedMultiplier || 1);
        const angle = Math.random() * Math.PI * 2;
        this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        this.body.setAngularVelocity(Phaser.Math.Between(-80, 80));
    }
}
