import { Pickup } from './Pickup.js';

export class GreenPickup extends Pickup {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, 0x00ff00);
    }

    onPickup(ship) {
        ship.enableHeatSeek();
    }
}
