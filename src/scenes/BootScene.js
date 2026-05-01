import { TextureFactory } from '../utils/TextureFactory.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this.load.audio('explosion-giant', 'sound fx/soundreality-explosion-fx-343683.mp3');
        this.load.audio('explosion-large', 'sound fx/universfield-epic-cinematic-explosion-454857.mp3');
        this.load.audio('explosion-medium', 'sound fx/lumora_studios-pixel-explosion-319166.mp3');
        this.load.audio('bullet', 'sound fx/floraphonic-scifi-gun-shoot-1-266417.mp3');
        this.load.audio('pickup-purple', 'sound fx/freesound_community-blaster-2-81267.mp3');
        this.load.audio('pickup-pink', 'sound fx/rescopicsound-sci-fi-weapon-shoot-firing-pulse-tm-05-233825.mp3');
        this.load.audio('saucer-bullet', 'sound fx/soundreality-blaster-fx-343681.mp3');
        this.load.audio('plasma', 'sound fx/rescopicsound-sci-fi-weapon-shoot-firing-plasma-ku-01-233816.mp3');
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
