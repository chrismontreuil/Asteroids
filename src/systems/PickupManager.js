import { SCREEN_W, SCREEN_H, PICKUP_SPAWN_DELAY } from '../constants.js';
import { BurstFirePickup } from '../objects/BurstFirePickup.js';
import { WideFirePickup } from '../objects/WideFirePickup.js';
import { GreenPickup } from '../objects/GreenPickup.js';
import { PurplePickup } from '../objects/PurplePickup.js';
import { PinkPickup } from '../objects/PinkPickup.js';
import { Pickup } from '../objects/Pickup.js';

export class PickupManager {
    constructor(scene) {
        this.scene = scene;
        this.pickups = [];
        this.spawnedTypes = new Set();
        this.nextPickupType = 'burst';
        this.widePickupCollected = false;
        this.greenPickupCollected = false;
        this.purplePickupCollected = false;
        this.pickupCooldowns = new Map();
        this.lastSoundTime = 0;
        this.soundCooldownMs = 1000;

        this._spawnBurstAndGreen();
    }

    _spawnBurstAndGreen() {
        const margin = 100;
        const x1 = Phaser.Math.Between(margin, SCREEN_W - margin);
        const y1 = Phaser.Math.Between(margin, SCREEN_H - margin);

        const burstPickup = new BurstFirePickup(this.scene, x1, y1, 'pickup-burst');
        this.pickups.push(burstPickup);
        this.spawnedTypes.add('burst');
        this.scene.pickups.add(burstPickup);
        burstPickup.launch();

        this.nextPickupType = 'wide';
    }

    spawnNext() {
        if (!this.spawnedTypes.has(this.nextPickupType)) {
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
            } else if (this.nextPickupType === 'purple') {
                newPickup = new PurplePickup(this.scene, x, y, 'pickup-purple');
            } else if (this.nextPickupType === 'pink') {
                newPickup = new PinkPickup(this.scene, x, y, 'pickup-pink');
            }

            if (newPickup) {
                this.pickups.push(newPickup);
                this.spawnedTypes.add(this.nextPickupType);
                this.scene.pickups.add(newPickup);
                newPickup.launch();
            }
        }
    }

    pickup(pickup) {
        const now = Date.now();
        const cooldownMs = 300;
        const lastCollect = this.pickupCooldowns.get(pickup) || 0;

        if (now - lastCollect < cooldownMs) {
            return;
        }

        pickup.onPickup(this.scene.ship);
        this.scene.gameState.addScore(1000);
        this.pickupCooldowns.set(pickup, now);

        let pitchMultiplier = 1;
        if (pickup instanceof BurstFirePickup) {
            pitchMultiplier = 0.5; // blue - lowest
            this.nextPickupType = 'wide';
        } else if (pickup instanceof WideFirePickup) {
            pitchMultiplier = 1.0; // yellow
            this.widePickupCollected = true;
            this.nextPickupType = 'green';
        } else if (pickup instanceof GreenPickup) {
            pitchMultiplier = 1.26; // green
            this.greenPickupCollected = true;
            this.nextPickupType = 'purple';
        } else if (pickup instanceof PurplePickup) {
            pitchMultiplier = 1.5; // purple
            this.purplePickupCollected = true;
            this.nextPickupType = 'pink';
        } else if (pickup instanceof PinkPickup) {
            pitchMultiplier = 2.0; // pink - highest
            this.nextPickupType = 'burst';
        }

        if (now - this.lastSoundTime >= this.soundCooldownMs) {
            this.scene.audioManager.playPickup(pitchMultiplier);
            this.lastSoundTime = now;
        }

        this.spawnNext();
    }

    reset() {
        this.nextPickupType = 'burst';
        this.widePickupCollected = false;
        this.greenPickupCollected = false;
        this.purplePickupCollected = false;
        this.spawnedTypes.clear();
        this.pickupCooldowns.clear();
        this.pickups.forEach(p => p.destroy());
        this.pickups = [];
        this._spawnBurstAndGreen();
    }
}
