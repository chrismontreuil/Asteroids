export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create(data) {
        const w     = this.scale.width;
        const h     = this.scale.height;
        const score = data ? data.score : 0;
        const high  = parseInt(localStorage.getItem('asteroidsHigh') || '0');

        this.add.text(w / 2, h * 0.25, 'GAME OVER', {
            fontSize:   '64px',
            fill:       '#ffffff',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        this.add.text(w / 2, h * 0.44, 'SCORE: ' + score, {
            fontSize:   '32px',
            fill:       '#ffffff',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        this.add.text(w / 2, h * 0.56, 'HIGH SCORE: ' + high, {
            fontSize:   '24px',
            fill:       '#aaaaaa',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        const prompt = this.add.text(w / 2, h * 0.72, 'PRESS ENTER TO START', {
            fontSize:   '24px',
            fill:       '#ffffff',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        this.tweens.add({
            targets:  prompt,
            alpha:    0.2,
            duration: 700,
            yoyo:     true,
            repeat:   -1,
        });

        const startGame = () => this.scene.start('MenuScene');

        this.input.keyboard.once('keydown-ENTER', startGame);

        if (this.input.gamepad) {
            this.input.gamepad.on('down-A', startGame);
        }
    }
}
