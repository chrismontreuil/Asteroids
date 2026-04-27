import { TEX } from '../constants.js';

export const TextureFactory = {

    createAll(scene) {
        this._createShip(scene);
        this._createShipThrust(scene);
        this._createAsteroid(scene, TEX.ASTEROID_LG, 40, 12);
        this._createAsteroid(scene, TEX.ASTEROID_MD, 20, 10);
        this._createAsteroid(scene, TEX.ASTEROID_SM, 10, 8);
        this._createBullet(scene);
        this._createParticle(scene);
    },

    _createShip(scene) {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.lineStyle(2, 0xffffff, 1);
        // Nose at top-center, base at bottom-left and bottom-right
        g.strokeTriangle(20, 2, 4, 36, 36, 36);
        g.generateTexture(TEX.SHIP, 40, 40);
        g.destroy();
    },

    _createShipThrust(scene) {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        // Same ship outline
        g.lineStyle(2, 0xffffff, 1);
        g.strokeTriangle(20, 2, 4, 36, 36, 36);
        // Thrust flame below base
        g.fillStyle(0xffff44, 0.9);
        g.fillTriangle(15, 36, 20, 39, 25, 36);
        g.generateTexture(TEX.SHIP_THRUST, 40, 40);
        g.destroy();
    },

    // radius = physics hitbox radius; numPoints = polygon vertex count
    _createAsteroid(scene, key, radius, numPoints) {
        // Add 5px padding on each side so the polygon doesn't clip the edge
        const size = radius * 2 + 10;
        const cx = size / 2;
        const cy = size / 2;

        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.lineStyle(2, 0xffffff, 1);

        const points = [];
        for (let i = 0; i < numPoints; i++) {
            const a = (i / numPoints) * Math.PI * 2;
            const r = radius * (0.7 + Math.random() * 0.3);
            points.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
        }

        g.beginPath();
        g.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            g.lineTo(points[i].x, points[i].y);
        }
        g.closePath();
        g.strokePath();
        g.generateTexture(key, size, size);
        g.destroy();
    },

    _createBullet(scene) {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffffff, 1);
        g.fillCircle(3, 3, 3);
        g.generateTexture(TEX.BULLET, 6, 6);
        g.destroy();
    },

    _createParticle(scene) {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffffff, 1);
        g.fillRect(0, 0, 4, 4);
        g.generateTexture(TEX.PARTICLE, 4, 4);
        g.destroy();
    },
};
