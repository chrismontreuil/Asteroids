export class CollisionManager {
    constructor(scene) {
        this.scene = scene;
    }

    register(ship, bullets, asteroids, pickups, saucers, saucerBullets, mines, octopuses, tentacles) {
        const physics = this.scene.physics;

        physics.add.overlap(
            bullets,
            asteroids,
            this._onBulletHitsAsteroid,
            null,
            this,
        );

        physics.add.overlap(
            ship,
            asteroids,
            this._onShipHitsAsteroid,
            this._shipIsVulnerable,
            this,
        );


        if (pickups) {
            physics.add.overlap(
                ship,
                pickups,
                this._onShipHitsPickup,
                null,
                this,
            );
        }

        if (saucers) {
            physics.add.overlap(
                bullets,
                saucers,
                this._onBulletHitsSaucer,
                null,
                this,
            );

            physics.add.overlap(
                saucers,
                asteroids,
                this._onSaucerHitsAsteroid,
                null,
                this,
            );

            physics.add.overlap(
                ship,
                saucers,
                this._onShipHitsSaucer,
                this._shipIsVulnerable,
                this,
            );
        }

        if (saucerBullets) {
            physics.add.overlap(
                saucerBullets,
                ship,
                this._onSaucerBulletHitsShip,
                this._shipIsVulnerable,
                this,
            );
        }

        if (mines) {
            physics.add.overlap(
                mines,
                asteroids,
                this._onMineHitsAsteroid,
                null,
                this,
            );
        }

        if (octopuses) {
            physics.add.overlap(
                ship,
                octopuses,
                this._onShipHitsOctopus,
                this._shipIsVulnerable,
                this,
            );
        }

        if (tentacles) {
            physics.add.overlap(
                bullets,
                tentacles,
                this._onBulletHitsTentacle,
                null,
                this,
            );
        }
    }

    _onBulletHitsAsteroid(bullet, asteroid) {
        if (!bullet.active || !asteroid.active) { return; }
        bullet.setActive(false);
        this.scene.splitAsteroid(asteroid);
    }

    _onShipHitsAsteroid(ship, asteroid) {
        if (!ship.active || !asteroid.active) { return; }
        this.scene.killShip();
    }

    _shipIsVulnerable(ship) {
        return !ship.isInvulnerable;
    }

    _onShipHitsPickup(ship, pickup) {
        if (!ship.active || !pickup.active) { return; }
        this.scene.pickupManager.pickup(pickup);
    }

    _onBulletHitsSaucer(bullet, saucer) {
        if (!bullet.active || !saucer.active) { return; }
        bullet.setActive(false);
        this.scene.sound.play('saucer-hit');
        if (saucer.active) {
            if (saucer.takeHit) {
                const isDead = saucer.takeHit();
                if (isDead) {
                    this.scene.killBigSaucer(saucer);
                }
            } else {
                this.scene.killSaucer(saucer);
            }
        }
    }

    _onSaucerBulletHitsShip(saucerBullet, ship) {
        if (!saucerBullet.active || !ship.active) { return; }
        saucerBullet.setActive(false);
        if (ship.active) {
            this.scene.killShip();
        }
    }

    _onSaucerHitsAsteroid(saucer, asteroid) {
        if (!saucer.active || !asteroid.active) { return; }
        if (asteroid.size === 'giant') { return; }
        if (saucer.takeHit) { return; }
        saucer.setActive(false);
        asteroid.setActive(false);
        this.scene.killSaucer(saucer);
        this.scene.splitAsteroid(asteroid);
    }

    _onShipHitsSaucer(ship, saucer) {
        if (!ship.active || !saucer.active) { return; }
        this.scene.killShip();
    }

    _onBulletHitsTentacle(bullet, tentacle) {
        if (!bullet.active || !tentacle.active) { return; }

        const octopus = tentacle.octopus;
        bullet.setActive(false);

        if (tentacle.isBodyCollider) {
            this.scene.killOctopus(octopus);
        } else {
            const tentacleIndex = tentacle.tentacleIndex;
            const tentacleWasShot = octopus.shootTentacle(tentacleIndex);

            if (tentacleWasShot) {
                this.scene.damageOctopusTentacle(octopus);
            }
        }
    }

    _onMineHitsAsteroid(mine, asteroid) {
        if (!mine.active || !asteroid.active) { return; }
        if (mine._exploding) { return; }
    }

    _onShipHitsOctopus(ship, octopus) {
        if (!ship.active || !octopus.active) { return; }
        this.scene.killShip();
    }
}
