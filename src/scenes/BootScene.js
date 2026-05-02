import { TextureFactory } from '../utils/TextureFactory.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this.load.audio('explosion-giant', 'sound fx/lordsonny-punch-a-rock-161647.mp3');
        this.load.audio('explosion-large', 'sound fx/lordsonny-small-rock-break-194553.mp3');
        this.load.audio('explosion-medium', 'sound fx/lumora_studios-pixel-explosion-319166.mp3');
        this.load.audio('bullet', 'sound fx/floraphonic-scifi-gun-shoot-1-266417.mp3');
        this.load.audio('pickup-purple', 'sound fx/freesound_community-blaster-2-81267.mp3');
        this.load.audio('pickup-pink', 'sound fx/rescopicsound-sci-fi-weapon-shoot-firing-pulse-tm-05-233825.mp3');
        this.load.audio('saucer-bullet', 'sound fx/soundreality-blaster-fx-343681.mp3');
        this.load.audio('plasma', 'sound fx/rescopicsound-sci-fi-weapon-shoot-firing-plasma-ku-01-233816.mp3');
        this.load.audio('extra-life', 'sound fx/extra_life.mp3');
        this.load.audio('second-wave', 'sound fx/second_wave.mp3');
        this.load.audio('rock-cinematic', 'sound fx/lordsonny-rock-cinematic-161648.mp3');
        this.load.audio('octopus-hit', 'sound fx/bb6.mp3');
        this.load.audio('saucer-death', 'sound fx/zap.mp3');
        this.load.audio('green-bullet', 'sound fx/dogwolf123-retro-siren-sound-474816.mp3');
    }

    create() {
        TextureFactory.createAll(this);
        this.scene.start('MenuScene');
    }
}

if ('caches' in window) {
    caches.keys().then(names => {
        Promise.all(names.map(name => caches.delete(name)));
    });
}
