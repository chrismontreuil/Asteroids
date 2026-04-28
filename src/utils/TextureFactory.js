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
        this._drawShipBody(g);
        g.generateTexture(TEX.SHIP, 80, 100);
        g.destroy();
    },

    _createShipThrust(scene) {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });

        // Flame drawn before hull so it appears behind
        g.fillStyle(0xff4400, 0.7);
        g.fillTriangle(32, 75, 40, 96, 48, 75);

        g.fillStyle(0xffcc00, 0.9);
        g.fillTriangle(35, 75, 40, 89, 45, 75);

        g.fillStyle(0xffffff, 1);
        g.fillTriangle(37, 75, 40, 82, 43, 75);

        this._drawShipBody(g);
        g.generateTexture(TEX.SHIP_THRUST, 80, 100);
        g.destroy();
    },

    _drawShipBody(g) {
        // Hull fill
        g.fillStyle(0x1a1a2e, 1);
        g.beginPath();
        g.moveTo(40, 6);
        g.lineTo(54, 44);
        g.lineTo(52, 64);
        g.lineTo(28, 64);
        g.lineTo(26, 44);
        g.closePath();
        g.fillPath();

        // Left wing fill
        g.fillStyle(0x16213e, 1);
        g.beginPath();
        g.moveTo(26, 44);
        g.lineTo(4,  62);
        g.lineTo(20, 68);
        g.lineTo(28, 64);
        g.closePath();
        g.fillPath();

        // Right wing fill
        g.beginPath();
        g.moveTo(54, 44);
        g.lineTo(76, 62);
        g.lineTo(60, 68);
        g.lineTo(52, 64);
        g.closePath();
        g.fillPath();

        // Engine nozzle fill
        g.fillStyle(0x333333, 1);
        g.beginPath();
        g.moveTo(34, 64);
        g.lineTo(46, 64);
        g.lineTo(44, 75);
        g.lineTo(36, 75);
        g.closePath();
        g.fillPath();

        // White outlines
        g.lineStyle(1.5, 0xffffff, 1);

        g.beginPath();
        g.moveTo(40, 6);
        g.lineTo(54, 44);
        g.lineTo(52, 64);
        g.lineTo(28, 64);
        g.lineTo(26, 44);
        g.closePath();
        g.strokePath();

        g.beginPath();
        g.moveTo(26, 44);
        g.lineTo(4,  62);
        g.lineTo(20, 68);
        g.lineTo(28, 64);
        g.closePath();
        g.strokePath();

        g.beginPath();
        g.moveTo(54, 44);
        g.lineTo(76, 62);
        g.lineTo(60, 68);
        g.lineTo(52, 64);
        g.closePath();
        g.strokePath();

        g.beginPath();
        g.moveTo(34, 64);
        g.lineTo(46, 64);
        g.lineTo(44, 75);
        g.lineTo(36, 75);
        g.closePath();
        g.strokePath();

        // Hull detail lines
        g.lineStyle(1, 0x888888, 1);

        g.beginPath();
        g.moveTo(40, 14);
        g.lineTo(40, 64);
        g.strokePath();

        g.beginPath();
        g.moveTo(36, 22);
        g.lineTo(27, 52);
        g.strokePath();

        g.beginPath();
        g.moveTo(44, 22);
        g.lineTo(53, 52);
        g.strokePath();

        // Wing brace lines
        g.lineStyle(0.8, 0x666666, 1);

        g.beginPath();
        g.moveTo(26, 50);
        g.lineTo(18, 60);
        g.strokePath();

        g.beginPath();
        g.moveTo(54, 50);
        g.lineTo(62, 60);
        g.strokePath();

        // Cockpit
        g.fillStyle(0x003355, 1);
        g.fillEllipse(40, 24, 14, 18);

        g.lineStyle(1.5, 0x00ccff, 1);
        g.strokeEllipse(40, 24, 14, 18);

        // Nozzle glow ring
        g.lineStyle(1, 0xff6600, 1);
        g.strokeEllipse(40, 75, 10, 4);
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
