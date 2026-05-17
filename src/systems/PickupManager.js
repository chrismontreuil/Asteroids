import { SCREEN_W, SCREEN_H, PICKUP_SPAWN_DELAY } from '../constants.js';
import { BurstFirePickup } from '../objects/BurstFirePickup.js';
import { WideFirePickup } from '../objects/WideFirePickup.js';
import { GreenPickup } from '../objects/GreenPickup.js';
import { PurplePickup } from '../objects/PurplePickup.js';
import { PinkPickup } from '../objects/PinkPickup.js';
import { ShipUpgradePickup } from '../objects/ShipUpgradePickup.js';
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
        this.mode = 'full';
        this.pickupsMoving = true;
        this.trainingComplete = false;
        this.asteroidPositions = [];
        this.upgradePickupTier = 2;

        this._spawnInitial();
    }

    _spawnInitial() {
        const pos = this._findSafeSpawnPos();
        const burstPickup = new BurstFirePickup(this.scene, pos.x, pos.y, 'pickup-burst');
        this.pickups.push(burstPickup);
        this.spawnedTypes.add('burst');
        this.scene.pickups.add(burstPickup);

        if (this.pickupsMoving) {
            burstPickup.launch();
        }

        this.nextPickupType = 'wide';

        if (this.upgradePickupTier <= 3) {
            this._spawnUpgradePickup(this.upgradePickupTier);
        }
    }

    _spawnUpgradePickup(tier) {
        const pos = this._findSafeSpawnPos();
        const pickup = new ShipUpgradePickup(this.scene, pos.x, pos.y, tier);
        this.pickups.push(pickup);
        this.spawnedTypes.add(`upgrade-${tier}`);
        this.scene.pickups.add(pickup);

        if (this.pickupsMoving) {
            pickup.launch();
        }
    }

    _findSafeSpawnPos() {
        const margin = 100;
        const minDistFromAsteroid = 300;
        let valid = false;
        let x, y;

        while (!valid) {
            x = Phaser.Math.Between(margin, SCREEN_W - margin);
            y = Phaser.Math.Between(margin, SCREEN_H - margin);

            valid = true;
            for (const asteroid of this.asteroidPositions) {
                const dx = x - asteroid.x;
                const dy = y - asteroid.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDistFromAsteroid) {
                    valid = false;
                    break;
                }
            }
        }

        return { x, y };
    }

    spawnNext() {
        if (this.mode === 'blueWeapon') {
            return;
        }

        if (!this.spawnedTypes.has(this.nextPickupType)) {
            const pos = this._findSafeSpawnPos();

            let newPickup;
            if (this.nextPickupType === 'burst') {
                newPickup = new BurstFirePickup(this.scene, pos.x, pos.y, 'pickup-burst');
            } else if (this.nextPickupType === 'wide') {
                newPickup = new WideFirePickup(this.scene, pos.x, pos.y, 'pickup-wide');
            } else if (this.nextPickupType === 'green') {
                newPickup = new GreenPickup(this.scene, pos.x, pos.y, 'pickup-green');
            } else if (this.nextPickupType === 'purple') {
                newPickup = new PurplePickup(this.scene, pos.x, pos.y, 'pickup-purple');
            } else if (this.nextPickupType === 'pink') {
                newPickup = new PinkPickup(this.scene, pos.x, pos.y, 'pickup-pink');
            }

            if (newPickup) {
                this.pickups.push(newPickup);
                this.spawnedTypes.add(this.nextPickupType);
                this.scene.pickups.add(newPickup);

                if (this.pickupsMoving) {
                    newPickup.launch();
                }
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

        let pitchMultiplier = 1;
        let isLastPickup = false;

        if (pickup instanceof ShipUpgradePickup) {
            pickup.onPickup(this.scene.ship);
            this.scene.gameState.addScore(1000);
            this.scene.audioManager.playUpgradePickup();
            this.spawnedTypes.delete(`upgrade-${pickup.num}`);
            pickup.destroy();
            const nextTier = pickup.num + 1;
            if (nextTier <= 3) {
                this.upgradePickupTier = nextTier;
                this._spawnUpgradePickup(nextTier);
            }
            return;
        }

        if (pickup instanceof BurstFirePickup) {
            pitchMultiplier = 0.5; // blue - lowest
            if (this.mode === 'full') {
                pickup.onPickup(this.scene.ship);
            } else if (this.mode === 'blueWeapon') {
                pickup.onPickup(this.scene.ship);
            } else {
                this.scene.ship.applyColorOnly('burst');
            }
            this.nextPickupType = 'wide';
        } else if (pickup instanceof WideFirePickup) {
            pitchMultiplier = 1.0; // yellow
            if (this.mode === 'full') {
                pickup.onPickup(this.scene.ship);
            } else {
                this.scene.ship.applyColorOnly('wide');
            }
            this.widePickupCollected = true;
            this.nextPickupType = 'green';
        } else if (pickup instanceof GreenPickup) {
            pitchMultiplier = 1.26; // green
            if (this.mode === 'full') {
                pickup.onPickup(this.scene.ship);
            } else {
                this.scene.ship.applyColorOnly('heat');
            }
            this.greenPickupCollected = true;
            this.nextPickupType = 'purple';
        } else if (pickup instanceof PurplePickup) {
            pitchMultiplier = 1.5; // purple
            if (this.mode === 'full') {
                pickup.onPickup(this.scene.ship);
            } else {
                this.scene.ship.applyColorOnly('purple');
            }
            this.purplePickupCollected = true;
            this.nextPickupType = 'pink';
        } else if (pickup instanceof PinkPickup) {
            pitchMultiplier = 2.0; // pink - highest
            if (this.mode === 'full') {
                pickup.onPickup(this.scene.ship);
            } else {
                this.scene.ship.applyColorOnly('pink');
            }
            isLastPickup = true;
            this.nextPickupType = 'burst';
        }

        this.scene.gameState.addScore(1000);
        this.pickupCooldowns.set(pickup, now);

        if (now - this.lastSoundTime >= this.soundCooldownMs) {
            const pickupType = pickup.constructor.name;
            this.scene.audioManager.playPickup(pitchMultiplier, pickupType);
            this.lastSoundTime = now;
        }

        if (isLastPickup && this.mode !== 'full') {
            this.trainingComplete = true;
        } else {
            this.spawnNext();
        }

        if (this.mode !== 'full') {
            pickup.destroy();
        }
    }

    setMode(mode, moving = true) {
        this.mode = mode;
        this.pickupsMoving = moving;
    }

    setAsteroidPositions(positions) {
        this.asteroidPositions = positions;
    }

    reset() {
        this.trainingComplete = false;
        this.nextPickupType = 'burst';
        this.widePickupCollected = false;
        this.greenPickupCollected = false;
        this.purplePickupCollected = false;
        this.spawnedTypes.clear();
        this.pickupCooldowns.clear();
        this.pickups.forEach(p => p.destroy());
        this.pickups = [];
        this.asteroidPositions = [];

        const shipTier = this.scene.ship ? this.scene.ship.shipTier : 1;
        this.upgradePickupTier = shipTier + 1;

        if (this.mode !== 'none') {
            this._spawnInitial();
        } else if (this.upgradePickupTier <= 3) {
            this._spawnUpgradePickup(this.upgradePickupTier);
        }
    }
}
