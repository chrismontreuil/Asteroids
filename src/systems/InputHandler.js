export class InputHandler {
    constructor(scene) {
        this.keys    = scene.input.keyboard.createCursorKeys();
        this.fireKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.state = {
            rotateLeft:  false,
            rotateRight: false,
            thrust:      false,
            fire:        false,
        };
    }

    update() {
        this.state.rotateLeft  = this.keys.left.isDown;
        this.state.rotateRight = this.keys.right.isDown;
        this.state.thrust      = this.keys.up.isDown;
        this.state.fire        = Phaser.Input.Keyboard.JustDown(this.fireKey);
    }
}
