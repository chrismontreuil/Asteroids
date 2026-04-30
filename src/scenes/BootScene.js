import { TextureFactory } from '../utils/TextureFactory.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
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
