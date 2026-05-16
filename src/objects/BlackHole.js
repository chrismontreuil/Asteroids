const KILL_RADIUS = 20;
const MAX_FORCE = 100;
const REF_DIST = 300;

export class BlackHole {
  constructor(scene) {
    this.scene = scene;
    const w = scene.scale.width;
    const h = scene.scale.height;
    this.wellX = Math.round(w * 0.72);
    this.wellY = h / 2;
    this._graphics = scene.add.graphics().setDepth(-1);
    this._drawBackground(w, h);
  }

  _drawBackground(w, h) {
    const g = this._graphics;

    g.fillStyle(0x060630, 1);
    g.fillRect(0, 0, w, h);

    g.lineStyle(2, 0x000000, 1);
    let r = 1400;
    while (r >= 1) {
      g.strokeCircle(this.wellX, this.wellY, r);
      r = Math.floor(r * 0.85);
    }
  }

  update(ship, delta) {
    const dx = this.wellX - ship.x;
    const dy = this.wellY - ship.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= KILL_RADIUS) {
      return true;
    }

    const dt = delta / 1000;
    const forceMag = Math.min(3000, MAX_FORCE * (REF_DIST / dist));
    ship.body.velocity.x += (dx / dist) * forceMag * dt;
    ship.body.velocity.y += (dy / dist) * forceMag * dt;

    return false;
  }

  destroy() {
    this._graphics.destroy();
  }
}
