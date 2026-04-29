import { initGlobalAudioContext } from '../systems/AudioManager.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        const highScore = parseInt(localStorage.getItem('asteroidsHigh') || '0');

        this.add.text(w / 2, h * 0.28, 'ASTEROIDS', {
            fontSize:   '72px',
            fill:       '#ffffff',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        this.add.text(w / 2, h * 0.50, 'HIGH SCORE: ' + highScore, {
            fontSize:   '24px',
            fill:       '#aaaaaa',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        const prompt = this.add.text(w / 2, h * 0.65, 'PRESS ENTER TO START', {
            fontSize:   '26px',
            fill:       '#ffffff',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        // Pulse the prompt text
        this.tweens.add({
            targets:  prompt,
            alpha:    0.2,
            duration: 700,
            yoyo:     true,
            repeat:   -1,
        });

        this.add.text(w / 2, h * 0.82, 'KEYBOARD: ARROW KEYS rotate/thrust     SPACE fire', {
            fontSize:   '14px',
            fill:       '#666666',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        this.add.text(w / 2, h * 0.88, 'GAMEPAD: left stick rotate     RB thrust     A fire', {
            fontSize:   '14px',
            fill:       '#666666',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        // Initialize AudioContext on first input (browser requirement for user gesture)
        const initAudio = () => {
            initGlobalAudioContext();
        };

        let hasKeyboardInput = false;

        const startGame = () => {
            this.events.off('update');
            initGlobalAudioContext();
            this.scene.start('GameScene');
        };

        this.input.keyboard.on('keydown', () => {
            hasKeyboardInput = true;
        });
        this.input.keyboard.once('keydown-ENTER', startGame);

        // Poll gamepad button state instead of using events
        this.gamepadButtonPressed = false;
        if (this.input.gamepad) {
            this.input.gamepad.enabled = true;
        }

        this.events.on('update', () => {
            if (this.input.gamepad && this.input.gamepad.gamepads && this.input.gamepad.gamepads.length > 0) {
                const pad = this.input.gamepad.gamepads[0];
                if (pad && pad.buttons[0].pressed && !this.gamepadButtonPressed) {
                    this.gamepadButtonPressed = true;
                    // Gamepad needs keyboard interaction first for audio to work
                    if (hasKeyboardInput) {
                        startGame();
                    }
                }
                if (pad && !pad.buttons[0].pressed) {
                    this.gamepadButtonPressed = false;
                }
            }
        });
    }
}
