import { TEX } from "../constants.js";

export const TextureFactory = {
  createAll(scene) {
    this._createShipTier(scene, '',  'fighter-single');
    this._createShipTier(scene, '2', 'fighter-double');
    this._createShipTier(scene, '3', 'fighter-triple');
    for (let i = 0; i < 4; i++) {
      const giRadii = [
        { x: 220, y: 180 },
        { x: 200, y: 170 },
        { x: 190, y: 155 },
        { x: 210, y: 165 },
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
    this._createBigSaucer(scene);
    this._createMine(scene);
    this._createOctopus(scene);
    this._createBurstPickup(scene);
    this._createWidePickup(scene);
    this._createGreenPickup(scene);
    this._createPurplePickup(scene);
    this._createPinkPickup(scene);
  },

  _createShipTier(scene, suffix, svgKey) {
    const b = `ship${suffix}`;
    const flameCount = suffix === '2' ? 2 : 1;
    const baseY     = suffix === '2' ? 83 : 91;
    this._createShipFromSVG(scene, b,                    null,     svgKey);
    this._createShipFromSVG(scene, `${b}-burst`,         0x0099ff, svgKey);
    this._createShipFromSVG(scene, `${b}-wide`,          0xffff00, svgKey);
    this._createShipFromSVG(scene, `${b}-heat`,          0x00ff00, svgKey);
    this._createShipFromSVG(scene, `${b}-purple`,        0x9900ff, svgKey);
    this._createShipFromSVG(scene, `${b}-pink`,          0xff0099, svgKey);
    this._createShipThrustFromSVG(scene, `${b}-thrust`,         null,     svgKey, flameCount, baseY);
    this._createShipThrustFromSVG(scene, `${b}-burst-thrust`,   0x0099ff, svgKey, flameCount, baseY);
    this._createShipThrustFromSVG(scene, `${b}-wide-thrust`,    0xffff00, svgKey, flameCount, baseY);
    this._createShipThrustFromSVG(scene, `${b}-heat-thrust`,    0x00ff00, svgKey, flameCount, baseY);
    this._createShipThrustFromSVG(scene, `${b}-purple-thrust`,  0x9900ff, svgKey, flameCount, baseY);
    this._createShipThrustFromSVG(scene, `${b}-pink-thrust`,    0xff0099, svgKey, flameCount, baseY);
  },

  _createShipFromSVG(scene, textureName, tint, svgKey = 'fighter-single') {
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');

    const img = scene.textures.get(svgKey).getSourceImage();
    ctx.drawImage(img, 0, 15, 80, 80);

    if (tint !== null) {
      const r = (tint >> 16) & 0xff;
      const g = (tint >> 8) & 0xff;
      const b = tint & 0xff;

      const imageData = ctx.getImageData(0, 15, 80, 80);
      const data = imageData.data;

      for (let i = 3; i < data.length; i += 4) {
        const alpha = data[i];
        if (alpha > 0) {
          data[i - 3] = Math.floor(data[i - 3] * r / 255);
          data[i - 2] = Math.floor(data[i - 2] * g / 255);
          data[i - 1] = Math.floor(data[i - 1] * b / 255);
        }
      }

      ctx.putImageData(imageData, 0, 15);
    }

    scene.textures.addCanvas(textureName, canvas);
  },

  _drawFlame(ctx, cx, baseY) {
    ctx.fillStyle = 'rgba(255, 68, 0, 0.7)';
    ctx.beginPath();
    ctx.moveTo(cx - 12, baseY);
    ctx.lineTo(cx, baseY + 32);
    ctx.lineTo(cx + 12, baseY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 204, 0, 0.9)';
    ctx.beginPath();
    ctx.moveTo(cx - 7, baseY);
    ctx.lineTo(cx, baseY + 21);
    ctx.lineTo(cx + 7, baseY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.beginPath();
    ctx.moveTo(cx - 4, baseY);
    ctx.lineTo(cx, baseY + 11);
    ctx.lineTo(cx + 4, baseY);
    ctx.closePath();
    ctx.fill();
  },

  _createShipThrustFromSVG(scene, textureName, tint, svgKey = 'fighter-single', flameCount = 1, baseY = 75) {
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');

    const flameCenters = {
      1: [40],
      2: [26, 54],
      3: [22, 40, 58],
    };
    const centers = flameCenters[flameCount] || [40];
    for (const cx of centers) {
      this._drawFlame(ctx, cx, baseY);
    }

    const img = scene.textures.get(svgKey).getSourceImage();

    if (tint === null) {
      ctx.drawImage(img, 0, 15, 80, 80);
    } else {
      const tmp = document.createElement('canvas');
      tmp.width = 80;
      tmp.height = 120;
      const tmpCtx = tmp.getContext('2d');
      tmpCtx.drawImage(img, 0, 15, 80, 80);

      const r = (tint >> 16) & 0xff;
      const g = (tint >> 8) & 0xff;
      const b = tint & 0xff;

      const imageData = tmpCtx.getImageData(0, 0, 80, 120);
      const data = imageData.data;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) {
          data[i - 3] = Math.floor(data[i - 3] * r / 255);
          data[i - 2] = Math.floor(data[i - 2] * g / 255);
          data[i - 1] = Math.floor(data[i - 1] * b / 255);
        }
      }
      tmpCtx.putImageData(imageData, 0, 0);
      ctx.drawImage(tmp, 0, 0);
    }

    scene.textures.addCanvas(textureName, canvas);
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

    g.lineStyle(1, 0xffff00, 1);
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

  _createBigSaucer(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const cx = 50;
    const cy = 52;

    // Main body - symmetric top and bottom
    g.fillStyle(0xff0000, 1);
    g.beginPath();
    g.moveTo(cx - 72, cy);        // Left point
    g.lineTo(cx - 32, cy + 28); // Left bottom angle
    g.lineTo(cx + 32, cy + 28); // Right bottom angle
    g.lineTo(cx + 72, cy);       // Right point
    g.lineTo(cx + 32, cy - 28); // Right top angle
    g.lineTo(cx - 32, cy - 28); // Left top angle
    g.closePath();
    g.fillPath();

    // Stroke outline - body only
    g.lineStyle(2, 0xffffff, 1);
    g.beginPath();
    g.moveTo(cx - 72, cy);
    g.lineTo(cx - 32, cy - 28);
    g.lineTo(cx + 32, cy - 28);
    g.lineTo(cx + 72, cy);
    g.lineTo(cx + 32, cy + 28);
    g.lineTo(cx - 32, cy + 28);
    g.closePath();
    g.strokePath();

    // Dome - semicircle ellipse (top half only)
    g.lineStyle(2, 0xffffff, 1);
    g.beginPath();
    g.moveTo(cx - 32.4, cy - 28);
    for (let i = 1; i <= 10; i++) {
      const angle = Math.PI * (1 - i / 10);
      const x = cx + 32.4 * Math.cos(angle);
      const y = (cy - 28) - 19.44 * Math.sin(angle);
      g.lineTo(x, y);
    }
    g.strokePath();

    // Horizontal dividing line through middle
    g.lineStyle(2, 0xffffff, 1);
    g.lineBetween(cx - 72, cy, cx + 72, cy);

    // Three white portholes in top section (stroked, not filled)
    g.lineStyle(2, 0xffffff, 1);
    g.strokeCircle(cx - 24, cy - 14, 10);
    g.strokeCircle(cx, cy - 14, 10);
    g.strokeCircle(cx + 24, cy - 14, 10);

    g.generateTexture('big-saucer', 100, 108);
    g.destroy();
  },

  _createMine(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const cx = 16;
    const cy = 16;
    const size = 32;
    g.fillStyle(0x000000, 1);
    g.beginPath();
    g.moveTo(cx, cy - 12);
    g.lineTo(cx + 12, cy + 8);
    g.lineTo(cx - 12, cy + 8);
    g.closePath();
    g.fillPath();
    g.lineStyle(2, 0x0088ff, 1);
    g.beginPath();
    g.moveTo(cx, cy - 12);
    g.lineTo(cx + 12, cy + 8);
    g.lineTo(cx - 12, cy + 8);
    g.closePath();
    g.strokePath();
    g.generateTexture('mine', size, size);
    g.destroy();
  },

  _createOctopus(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const centerX = 35;
    const centerY = 35;

    g.fillStyle(0xff6699, 1);
    g.fillCircle(centerX, centerY, 12);

    g.lineStyle(2, 0xffffff, 1);
    g.strokeCircle(centerX, centerY, 12);

    const tentacleRadius = 22;
    const tentacleLength = 16;
    const tentacleWidth = 3;

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const tx = centerX + Math.cos(angle) * tentacleRadius;
      const ty = centerY + Math.sin(angle) * tentacleRadius;

      g.fillStyle(0xff6699, 1);
      g.fillCircle(tx, ty, 4);
      g.lineStyle(2, 0xffffff, 1);
      g.strokeCircle(tx, ty, 4);

      g.lineStyle(tentacleWidth, 0xff99cc, 1);
      g.lineBetween(centerX, centerY, tx, ty);
    }

    g.generateTexture(TEX.OCTOPUS, 70, 70);
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

  _createNumberedPickup(scene, num) {
    const size = 40;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 16, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(num.toString(), size / 2, size / 2 + 1);

    scene.textures.addCanvas(`pickup-upgrade-${num}`, canvas);
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
