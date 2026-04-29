export class Pickup extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, color = 0xffffff) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.color = color;
    }

    launch() {
        const angle = Math.random() * Math.PI * 2;
        const speed = 80 + Math.random() * 40;
        this.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
    }

    onPickup() {
        // Override in subclasses
    }

    destroy() {
        super.destroy();
    }
}
