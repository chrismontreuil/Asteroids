export class CollisionManager {
    constructor(scene) {
        this.scene = scene;
    }

    register(ship, bullets, asteroids, pickups) {
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
    }

    _onBulletHitsAsteroid(bullet, asteroid) {
        if (!bullet.active || !asteroid.active) { return; }
        bullet.destroy();
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
}
