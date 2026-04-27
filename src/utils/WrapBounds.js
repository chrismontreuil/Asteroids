export const WrapBounds = {
    wrap(scene, obj) {
        const w = scene.scale.width;
        const h = scene.scale.height;
        const hw = obj.displayWidth  / 2;
        const hh = obj.displayHeight / 2;

        if (obj.x < -hw)    { obj.x = w + hw; }
        if (obj.x > w + hw) { obj.x = -hw; }
        if (obj.y < -hh)    { obj.y = h + hh; }
        if (obj.y > h + hh) { obj.y = -hh; }
    },
};
