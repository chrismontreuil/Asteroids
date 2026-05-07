import { initGlobalAudioContext } from '../systems/AudioManager.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        const highScore = parseInt(localStorage.getItem('asteroidsHigh') || '0');

        if (this.sound) {
            this.sound.play('rock-cinematic');
        }

        this.add.text(w / 2, h * 0.12, 'ASTEROIDS ON STEROIDS', {
            fontSize:   '56px',
            fill:       '#ffffff',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        this.add.text(w / 2, h * 0.25, 'HIGH SCORE: ' + highScore, {
            fontSize:   '24px',
            fill:       '#aaaaaa',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        this.add.text(w / 2, h * 0.36, 'SELECT WAVE', {
            fontSize:   '18px',
            fill:       '#ffffff',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        const startY = h * 0.42;
        const spacing = 32;
        const startX = w / 2;

        this.waveButtons = [];
        this.selectedWaveIndex = 0;

        for (let i = 1; i <= 10; i++) {
            const y = startY + (i - 1) * spacing;
            const isAvailable = i <= 7;
            const fillColor = isAvailable ? '#ffffff' : '#444444';

            const button = this.add.text(startX, y, 'WAVE ' + i, {
                fontSize: '18px',
                fill: fillColor,
                fontFamily: 'monospace',
            }).setOrigin(0.5);

            if (isAvailable) {
                button.setInteractive({ useHandCursor: true });

                button.on('pointerover', () => {
                    if (this.selectedWaveIndex !== i - 1) {
                        button.setFill('#ffff00');
                    }
                });

                button.on('pointerout', () => {
                    if (this.selectedWaveIndex !== i - 1) {
                        button.setFill('#ffffff');
                    }
                });

                button.on('pointerdown', () => {
                    this.selectWave(i - 1);
                    this.startGame();
                });
            }

            this.waveButtons.push({
                text: button,
                wave: i,
                available: isAvailable,
            });
        }

        this.selectWave(0);

        const boxX = startX - 120;
        const boxY = startY - 10;
        const boxWidth = 240;
        const boxHeight = 5 * spacing + 25;

        const graphics = this.make.graphics({ x: 0, y: 0, add: true });
        graphics.fillStyle(0x333333, 0.5);
        graphics.fillRect(boxX, boxY, boxWidth, boxHeight);

        this.add.text(boxX + 15, boxY - 15, 'TRAINING', {
            fontSize: '14px',
            fill: '#666666',
            fontFamily: 'monospace',
        });

        this.add.text(w / 2, startY + 9 * spacing + 85, 'PRESS ENTER', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        this.add.text(w / 2, h * 0.82, 'KEYBOARD: ARROW KEYS rotate/thrust     SPACE fire', {
            fontSize: '14px',
            fill: '#666666',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        this.add.text(w / 2, h * 0.88, 'GAMEPAD: left stick rotate     RB thrust     A fire', {
            fontSize: '14px',
            fill: '#666666',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        let hasKeyboardInput = false;

        this.input.keyboard.on('keydown', () => {
            hasKeyboardInput = true;
        });

        this.input.keyboard.on('keydown-UP', () => {
            this.selectWave(Math.max(0, this.selectedWaveIndex - 1));
        });

        this.input.keyboard.on('keydown-DOWN', () => {
            this.selectWave(Math.min(6, this.selectedWaveIndex + 1));
        });

        this.input.keyboard.once('keydown-ENTER', () => {
            this.startGame();
        });

        this.gamepadButtonPressed = false;
        if (this.input.gamepad) {
            this.input.gamepad.enabled = true;
        }

        this.events.on('update', () => {
            if (this.input.gamepad && this.input.gamepad.gamepads && this.input.gamepad.gamepads.length > 0) {
                const pad = this.input.gamepad.gamepads[0];
                if (pad && pad.buttons[0].pressed && !this.gamepadButtonPressed) {
                    this.gamepadButtonPressed = true;
                    if (hasKeyboardInput) {
                        this.startGame();
                    }
                }
                if (pad && !pad.buttons[0].pressed) {
                    this.gamepadButtonPressed = false;
                }
            }
        });
    }

    selectWave(index) {
        if (this.waveButtons[this.selectedWaveIndex]) {
            const prevButton = this.waveButtons[this.selectedWaveIndex];
            const prevColor = prevButton.available ? '#ffffff' : '#444444';
            prevButton.text.setFill(prevColor);
        }

        this.selectedWaveIndex = index;
        const selectedButton = this.waveButtons[index];
        selectedButton.text.setFill('#00ff00');
    }

    startGame() {
        this.events.off('update');
        initGlobalAudioContext();
        const selectedWave = this.waveButtons[this.selectedWaveIndex].wave;
        this.scene.start('GameScene', { startingWave: selectedWave });
    }
}
