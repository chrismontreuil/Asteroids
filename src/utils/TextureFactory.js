import { TEX } from "../constants.js";

export const TextureFactory = {
  createAll(scene) {
    this._createShip(scene);
    this._createShipThrust(scene);
    this._createShipBurst(scene);
    this._createShipBurstThrust(scene);
    this._createShipWide(scene);
    this._createShipWideThrust(scene);
    this._createShipHeat(scene);
    this._createShipHeatThrust(scene);
    this._createShipPurple(scene);
    this._createShipPurpleThrust(scene);
    this._createShipPink(scene);
    this._createShipPinkThrust(scene);
    for (let i = 0; i < 4; i++) {
      const giRadii = [
        { x: 220, y: 100 },
        { x: 200, y: 110 },
        { x: 190, y: 95 },
        { x: 210, y: 85 },
      ];
      const lgRadii = [
        { x: 40, y: 30 },
        { x: 32, y: 38 },
        { x: 28, y: 42 },
        { x: 36, y: 28 },
      ];
      const mdRadii = [
        { x: 20, y: 15 },
        { x: 16, y: 19 },
        { x: 14, y: 21 },
        { x: 18, y: 14 },
      ];
      const smRadii = [
        { x: 9, y: 8 },
        { x: 8, y: 10.5 },
        { x: 7, y: 11 },
        { x: 8.5, y: 9.5 },
      ];

      this._createAsteroid(
        scene,
        `${TEX.ASTEROID_GI}-${i}`,
        giRadii[i].x,
        giRadii[i].y,
        55,
      );
      this._createAsteroid(
        scene,
        `${TEX.ASTEROID_LG}-${i}`,
        lgRadii[i].x,
        lgRadii[i].y,
        7,
      );
      this._createAsteroid(
        scene,
        `${TEX.ASTEROID_MD}-${i}`,
        mdRadii[i].x,
        mdRadii[i].y,
        6,
      );
      this._createAsteroid(
        scene,
        `${TEX.ASTEROID_SM}-${i}`,
        smRadii[i].x,
        smRadii[i].y,
        5,
      );
    }
    this._createBullet(scene);
    this._createParticle(scene);
    this._createBurstPickup(scene);
    this._createWidePickup(scene);
    this._createGreenPickup(scene);
    this._createPurplePickup(scene);
    this._createPinkPickup(scene);
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

  _createShipBurst(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    this._drawShipBodyTinted(g, 0x0099ff);
    g.generateTexture("ship-burst", 80, 100);
    g.destroy();
  },

  _createShipBurstThrust(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    // Flame drawn before hull so it appears behind
    g.fillStyle(0xff4400, 0.7);
    g.fillTriangle(32, 75, 40, 96, 48, 75);

    g.fillStyle(0xffcc00, 0.9);
    g.fillTriangle(35, 75, 40, 89, 45, 75);

    g.fillStyle(0xffffff, 1);
    g.fillTriangle(37, 75, 40, 82, 43, 75);

    this._drawShipBodyTinted(g, 0x0099ff);
    g.generateTexture("ship-burst-thrust", 80, 100);
    g.destroy();
  },

  _createShipWide(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    this._drawShipBodyTinted(g, 0xffff00);
    g.generateTexture("ship-wide", 80, 100);
    g.destroy();
  },

  _createShipWideThrust(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    // Flame drawn before hull so it appears behind
    g.fillStyle(0xff4400, 0.7);
    g.fillTriangle(32, 75, 40, 96, 48, 75);

    g.fillStyle(0xffcc00, 0.9);
    g.fillTriangle(35, 75, 40, 89, 45, 75);

    g.fillStyle(0xffffff, 1);
    g.fillTriangle(37, 75, 40, 82, 43, 75);

    this._drawShipBodyTinted(g, 0xffff00);
    g.generateTexture("ship-wide-thrust", 80, 100);
    g.destroy();
  },

  _createShipHeat(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    this._drawShipBodyTinted(g, 0x00ff00);
    g.generateTexture(TEX.SHIP_HEAT, 80, 100);
    g.destroy();
  },

  _createShipHeatThrust(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    // Flame drawn before hull so it appears behind
    g.fillStyle(0xff4400, 0.7);
    g.fillTriangle(32, 75, 40, 96, 48, 75);

    g.fillStyle(0xffcc00, 0.9);
    g.fillTriangle(35, 75, 40, 89, 45, 75);

    g.fillStyle(0xffffff, 1);
    g.fillTriangle(37, 75, 40, 82, 43, 75);

    this._drawShipBodyTinted(g, 0x00ff00);
    g.generateTexture(TEX.SHIP_HEAT_THRUST, 80, 100);
    g.destroy();
  },

  _createShipPurple(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    this._drawShipBodyTinted(g, 0x9900ff);
    g.generateTexture(TEX.SHIP_PURPLE, 80, 100);
    g.destroy();
  },

  _createShipPurpleThrust(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    // Flame drawn before hull so it appears behind
    g.fillStyle(0xff4400, 0.7);
    g.fillTriangle(32, 75, 40, 96, 48, 75);

    g.fillStyle(0xffcc00, 0.9);
    g.fillTriangle(35, 75, 40, 89, 45, 75);

    g.fillStyle(0xffffff, 1);
    g.fillTriangle(37, 75, 40, 82, 43, 75);

    this._drawShipBodyTinted(g, 0x9900ff);
    g.generateTexture(TEX.SHIP_PURPLE_THRUST, 80, 100);
    g.destroy();
  },

  _createShipPink(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    this._drawShipBodyTinted(g, 0xff0099);
    g.generateTexture(TEX.SHIP_PINK, 80, 100);
    g.destroy();
  },

  _createShipPinkThrust(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    // Flame drawn before hull so it appears behind
    g.fillStyle(0xff4400, 0.7);
    g.fillTriangle(32, 75, 40, 96, 48, 75);

    g.fillStyle(0xffcc00, 0.9);
    g.fillTriangle(35, 75, 40, 89, 45, 75);

    g.fillStyle(0xffffff, 1);
    g.fillTriangle(37, 75, 40, 82, 43, 75);

    this._drawShipBodyTinted(g, 0xff0099);
    g.generateTexture(TEX.SHIP_PINK_THRUST, 80, 100);
    g.destroy();
  },

  _drawShipBody(g) {
    this._drawShipBodyFills(g, 0x555555, 0x444444, 0x333333);
    this._drawShipBodyStrokes(g);
  },

  _drawShipBodyTinted(g, tint) {
    // Blend tint with gray fill
    const blended = this._blendColor(0x555555, tint);
    this._drawShipBodyFills(
      g,
      blended,
      this._blendColor(0x444444, tint),
      this._blendColor(0x333333, tint),
    );
    this._drawShipBodyStrokes(g);
  },

  _drawShipBodyFills(g, hullColor, wingColor, nozzleColor) {
    // Main triangle hull
    g.fillStyle(hullColor, 1);
    g.beginPath();
    g.moveTo(40, 6);
    g.lineTo(56, 50);
    g.lineTo(24, 50);
    g.closePath();
    g.fillPath();

    // Left wing tip
    g.fillStyle(wingColor, 1);
    g.beginPath();
    g.moveTo(24, 50);
    g.lineTo(17, 54);
    g.lineTo(21, 56);
    g.closePath();
    g.fillPath();

    // Right wing tip
    g.beginPath();
    g.moveTo(56, 50);
    g.lineTo(63, 54);
    g.lineTo(59, 56);
    g.closePath();
    g.fillPath();

    // Engine nozzle fill (smaller)
    g.fillStyle(nozzleColor, 1);
    g.beginPath();
    g.moveTo(36, 50);
    g.lineTo(44, 50);
    g.lineTo(42, 65);
    g.lineTo(38, 65);
    g.closePath();
    g.fillPath();
  },

  _drawShipBodyStrokes(g) {
    // Main triangle outline
    g.lineStyle(2, 0xffffff, 1);
    g.beginPath();
    g.moveTo(40, 6);
    g.lineTo(56, 50);
    g.lineTo(24, 50);
    g.closePath();
    g.strokePath();

    // Left wing outline
    g.beginPath();
    g.moveTo(24, 50);
    g.lineTo(17, 54);
    g.lineTo(21, 56);
    g.closePath();
    g.strokePath();

    // Right wing outline
    g.beginPath();
    g.moveTo(56, 50);
    g.lineTo(63, 54);
    g.lineTo(59, 56);
    g.closePath();
    g.strokePath();

    // Engine nozzle outline
    g.beginPath();
    g.moveTo(36, 50);
    g.lineTo(44, 50);
    g.lineTo(42, 65);
    g.lineTo(38, 65);
    g.closePath();
    g.strokePath();
  },

  _blendColor(baseColor, tintColor) {
    const r1 = (baseColor >> 16) & 0xff;
    const g1 = (baseColor >> 8) & 0xff;
    const b1 = baseColor & 0xff;

    const r2 = (tintColor >> 16) & 0xff;
    const g2 = (tintColor >> 8) & 0xff;
    const b2 = tintColor & 0xff;

    const r = Math.floor((r1 + r2) / 2);
    const g = Math.floor((g1 + g2) / 2);
    const b = Math.floor((b1 + b2) / 2);

    return (r << 16) | (g << 8) | b;
  },

  // radiusX, radiusY = ellipse semi-axes; numPoints = polygon vertex count
  _createAsteroid(scene, key, radiusX, radiusY, numPoints) {
    // Add 5px padding on each side so the polygon doesn't clip the edge
    const size = Math.max(radiusX, radiusY) * 2 + 10;
    const cx = size / 2;
    const cy = size / 2;

    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const a = (i / numPoints) * Math.PI * 2;
      const rVariation = 0.92 + Math.random() * 0.08;
      const x = radiusX * Math.cos(a) * rVariation;
      const y = radiusY * Math.sin(a) * rVariation;
      points.push({ x: cx + x, y: cy + y });
    }

    let fillColor = 0x292929;
    if (key.includes("asteroid-gi")) {
      fillColor = 0x1a1a1a;
    } else if (key.includes("asteroid-sm")) {
      fillColor = 0x444444;
    }

    g.fillStyle(fillColor, 1);
    g.beginPath();
    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      g.lineTo(points[i].x, points[i].y);
    }
    g.closePath();
    g.fillPath();

    g.generateTexture(key, size, size);
    g.destroy();
  },

  _createBullet(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 3);
    g.lineStyle(1, 0xffffff, 1);
    g.strokeCircle(4, 4, 3);
    g.generateTexture(TEX.BULLET, 8, 8);
    g.destroy();
  },

  _createParticle(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture(TEX.PARTICLE, 4, 4);
    g.destroy();
  },

  _createBurstPickup(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x0099ff, 1);
    this._fillPentagon(g, 20, 20, 16);
    g.lineStyle(1.5, 0xffffff, 1);
    this._strokePentagon(g, 20, 20, 16);
    g.generateTexture("pickup-burst", 40, 40);
    g.destroy();
  },

  _createWidePickup(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffff00, 1);
    this._fillPentagon(g, 20, 20, 16);
    g.lineStyle(1.5, 0xffffff, 1);
    this._strokePentagon(g, 20, 20, 16);
    g.generateTexture("pickup-wide", 40, 40);
    g.destroy();
  },

  _createGreenPickup(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x00ff00, 1);
    this._fillPentagon(g, 20, 20, 16);
    g.lineStyle(1.5, 0xffffff, 1);
    this._strokePentagon(g, 20, 20, 16);
    g.generateTexture("pickup-green", 40, 40);
    g.destroy();
  },

  _createPurplePickup(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x9900ff, 1);
    this._fillPentagon(g, 20, 20, 16);
    g.lineStyle(1.5, 0xffffff, 1);
    this._strokePentagon(g, 20, 20, 16);
    g.generateTexture("pickup-purple", 40, 40);
    g.destroy();
  },

  _createPinkPickup(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xff0099, 1);
    this._fillPentagon(g, 20, 20, 16);
    g.lineStyle(1.5, 0xffffff, 1);
    this._strokePentagon(g, 20, 20, 16);
    g.generateTexture("pickup-pink", 40, 40);
    g.destroy();
  },

  _fillPentagon(g, cx, cy, radius) {
    g.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) {
        g.moveTo(x, y);
      } else {
        g.lineTo(x, y);
      }
    }
    g.closePath();
    g.fillPath();
  },

  _strokePentagon(g, cx, cy, radius) {
    g.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) {
        g.moveTo(x, y);
      } else {
        g.lineTo(x, y);
      }
    }
    g.closePath();
    g.strokePath();
  },
};
