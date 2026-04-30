import { Pickup } from './Pickup.js';

export class PurplePickup extends Pickup {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, 0x9900ff);
    }

    onPickup(ship) {
        ship.enablePurpleExplosion();
    }
}
