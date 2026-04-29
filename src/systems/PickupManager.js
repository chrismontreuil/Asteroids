import { SCREEN_W, SCREEN_H, PICKUP_SPAWN_DELAY } from '../constants.js';
import { BurstFirePickup } from '../objects/BurstFirePickup.js';
import { WideFirePickup } from '../objects/WideFirePickup.js';
import { GreenPickup } from '../objects/GreenPickup.js';
import { Pickup } from '../objects/Pickup.js';

export class PickupManager {
    constructor(scene) {
        this.scene = scene;
        this.pickups = [];
        this.spawnedTypes = new Set();
        this.nextPickupType = 'burst';
        this.widePickupCollected = false;

        this.spawnNext();
    }

    spawnNext() {
        if (this.spawnedTypes.has(this.nextPickupType)) {
            return;
        }

        const margin = 100;
        const x = Phaser.Math.Between(margin, SCREEN_W - margin);
        const y = Phaser.Math.Between(margin, SCREEN_H - margin);

        let newPickup;
        if (this.nextPickupType === 'burst') {
            newPickup = new BurstFirePickup(this.scene, x, y, 'pickup-burst');
        } else if (this.nextPickupType === 'wide') {
            newPickup = new WideFirePickup(this.scene, x, y, 'pickup-wide');
        } else if (this.nextPickupType === 'green') {
            newPickup = new GreenPickup(this.scene, x, y, 'pickup-green');
        }

        this.pickups.push(newPickup);
        this.spawnedTypes.add(this.nextPickupType);
        this.scene.pickups.add(newPickup);
        newPickup.launch();

        this.advanceNextType();
    }

    advanceNextType() {
        if (this.nextPickupType === 'burst') {
            this.nextPickupType = 'wide';
        } else if (this.nextPickupType === 'wide') {
            if (this.widePickupCollected) {
                this.nextPickupType = 'green';
            } else {
                this.nextPickupType = 'burst';
            }
        } else if (this.nextPickupType === 'green') {
            this.nextPickupType = 'burst';
        }
    }

    pickup(pickup) {
        pickup.onPickup(this.scene.ship);
        if (pickup instanceof WideFirePickup) {
            this.widePickupCollected = true;
        }
        this.spawnNext();
    }

    reset() {
        this.nextPickupType = 'burst';
        this.widePickupCollected = false;
        this.spawnedTypes.clear();
        this.pickups.forEach(p => p.destroy());
        this.pickups = [];
        this.spawnNext();
    }
}
