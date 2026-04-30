export class CollisionManager {
    constructor(scene) {
        this.scene = scene;
    }

    register(ship, bullets, asteroids, pickups, saucers, saucerBullets) {
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
        if (saucer.active) {
            this.scene.killSaucer(saucer);
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
        saucer.setActive(false);
        asteroid.setActive(false);
        this.scene.killSaucer(saucer);
        this.scene.splitAsteroid(asteroid);
    }

    _onShipHitsSaucer(ship, saucer) {
        if (!ship.active || !saucer.active) { return; }
        saucer.setActive(false);
        this.scene.killSaucer(saucer);
        this.scene.killShip();
    }
}
