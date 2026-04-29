import { Pickup } from './Pickup.js';

export class WideFirePickup extends Pickup {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, 0xffff00);
    }

    onPickup(ship) {
        ship.enableWideFire();
    }
}
