import { Pickup } from './Pickup.js';

export class ShipUpgradePickup extends Pickup {
    constructor(scene, x, y, num) {
        super(scene, x, y, `pickup-upgrade-${num}`, 0xffffff);
        this.num = num;
    }

    onPickup(ship) {
        ship.upgradeTo(this.num);
    }
}
