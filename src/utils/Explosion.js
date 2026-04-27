import { TEX } from '../constants.js';

export function createExplosion(scene, x, y, count) {
    const emitter = scene.add.particles(x, y, TEX.PARTICLE, {
        speed:    { min: 40, max: 200 },
        angle:    { min: 0, max: 360 },
        scale:    { start: 1, end: 0 },
        alpha:    { start: 1, end: 0 },
        lifespan: 600,
        quantity: count,
    });

    emitter.explode(count);

    // Clean up emitter after particles have fully faded
    scene.time.delayedCall(700, () => {
        emitter.destroy();
    });
}
