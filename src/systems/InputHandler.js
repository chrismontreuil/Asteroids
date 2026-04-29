export class InputHandler {
    constructor(scene) {
        this.keys    = scene.input.keyboard.createCursorKeys();
        this.fireKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.gamepad = null;
        this.lastGamepadFirePressed = false;

        if (scene.input.gamepad) {
            scene.input.gamepad.enabled = true;
            // Check for already-connected gamepads
            if (scene.input.gamepad.gamepads && scene.input.gamepad.gamepads.length > 0) {
                this.gamepad = scene.input.gamepad.gamepads[0];
            }
            scene.input.gamepad.on('connected', (pad) => {
                this.gamepad = pad;
            });
            scene.input.gamepad.on('disconnected', () => {
                this.gamepad = null;
            });
        }

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

        if (this.gamepad) {
            const leftStickX = this.gamepad.leftStick.x;
            const threshold = 0.5;

            if (leftStickX < -threshold) {
                this.state.rotateLeft = true;
            }
            if (leftStickX > threshold) {
                this.state.rotateRight = true;
            }

            if (this.gamepad.buttons[4].pressed || this.gamepad.buttons[5].pressed) {
                this.state.thrust = true;
            }

            const gamepadFirePressed = this.gamepad.buttons[0].pressed;
            if (gamepadFirePressed && !this.lastGamepadFirePressed) {
                this.state.fire = true;
            }
            this.lastGamepadFirePressed = gamepadFirePressed;
        }
    }
}
