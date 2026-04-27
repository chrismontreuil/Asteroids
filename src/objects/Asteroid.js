import { SIZE_TO_TEX, SIZE_TO_RADIUS, SIZE_TO_SPEED, SCORE_FOR_SIZE } from '../constants.js';

// Each size class uses 5px padding around its radius (see TextureFactory),
// so the hitbox offset to center the circle is always (5, 5).
const HITBOX_OFFSET = 5;

export class Asteroid extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, size) {
        super(scene, x, y, SIZE_TO_TEX[size]);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.size       = size;
        this.scoreValue = SCORE_FOR_SIZE[size];

        const radius = SIZE_TO_RADIUS[size];
        this.body.setCircle(radius, HITBOX_OFFSET, HITBOX_OFFSET);
    }

    // Called after group.add() to set velocity — Phaser can reset body state during add()
    launch(speedMultiplier) {
        const speed = SIZE_TO_SPEED[this.size] * (speedMultiplier || 1);
        const angle = Math.random() * Math.PI * 2;
        this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        this.body.setAngularVelocity(Phaser.Math.Between(-80, 80));
    }
}
