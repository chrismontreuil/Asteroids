import { Pickup } from './Pickup.js';

export class PinkPickup extends Pickup {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, 0xff0099);
    }

    onPickup(ship) {
        ship.enablePinkExplosion();
    }
}
