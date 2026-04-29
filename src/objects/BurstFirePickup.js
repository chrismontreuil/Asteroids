import { Pickup } from './Pickup.js';

export class BurstFirePickup extends Pickup {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, 0x0099ff);
    }

    onPickup(ship) {
        ship.enableBurstFire();
    }
}
