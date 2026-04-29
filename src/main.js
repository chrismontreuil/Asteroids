import Phaser from 'phaser';
import { BootScene }     from './scenes/BootScene.js';
import { MenuScene }     from './scenes/MenuScene.js';
import { GameScene }     from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

const config = {
    type:            Phaser.AUTO,
    width:           1920,
    height:          1080,
    backgroundColor: '#000000',
    scale: {
        mode:       Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        },
    },
    input: {
        gamepad: true,
    },
    scene: [BootScene, MenuScene, GameScene, GameOverScene],
};

new Phaser.Game(config);
