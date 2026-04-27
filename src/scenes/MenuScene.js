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

        this.add.text(w / 2, h * 0.85, 'ARROW KEYS: rotate / thrust     SPACE: fire', {
            fontSize:   '14px',
            fill:       '#666666',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start('GameScene');
        });
    }
}
