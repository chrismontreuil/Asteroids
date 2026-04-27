export class CollisionManager {
    constructor(scene) {
        this.scene = scene;
    }

    register(ship, bullets, asteroids) {
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
}
