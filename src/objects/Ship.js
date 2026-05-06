import {
    TEX,
    SHIP_ROTATION_SPEED,
    SHIP_THRUST_FORCE,
    SHIP_MAX_SPEED,
    MAX_PLAYER_BULLETS,
    INVULNERABILITY_MS,
    BURST_BULLET_COUNT,
    BURST_BULLET_DELAY,
} from '../constants.js';
import { Bullet } from './Bullet.js';
import { HeatSeekBullet } from './HeatSeekBullet.js';

export class Ship extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, TEX.SHIP);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Pivot at hull center (y=35 of 100px texture); display at 40×50px
        this.setOrigin(0.5, 0.35);
        this.setScale(0.5);

        // Circular hitbox in display-pixel space (radius 16, centered on hull)
        this.body.setCircle(16, 4, 2);
        this.body.setMaxVelocity(SHIP_MAX_SPEED, SHIP_MAX_SPEED);
        this.body.setDamping(true);
        this.body.setDrag(0.99, 0.99);

        this.isInvulnerable = false;
        this._invulnTween   = null;

        this.hasBurstFire = false;
        this._burstActive = false;
        this._burstCount = 0;
        this._burstTimer = null;

        this.hasWideFire = false;

        this.hasHeatSeek = false;

        this.hasPurpleExplosion = false;
        this.hasPinkExplosion = false;

        this._colorTag = null;
    }

    update(input) {
        // Rotation
        if (input.state.rotateLeft) {
            this.setAngularVelocity(-SHIP_ROTATION_SPEED);
        } else if (input.state.rotateRight) {
            this.setAngularVelocity(SHIP_ROTATION_SPEED);
        } else {
            this.setAngularVelocity(0);
        }

        // Thrust — the texture is drawn nose-up, so we subtract 90° to align with Phaser's angle convention
        if (input.state.thrust) {
            const rad = Phaser.Math.DegToRad(this.angle - 90);
            this.body.setAcceleration(
                Math.cos(rad) * SHIP_THRUST_FORCE,
                Math.sin(rad) * SHIP_THRUST_FORCE,
            );
            this._setTextureForState(true);
        } else {
            this.body.setAcceleration(0, 0);
            this._setTextureForState(false);
        }

        // setTexture resets scale — reapply after every swap
        this.setScale(0.5);

        // Fire
        if (input.state.fire) {
            this._tryFire();
        }
    }

    _tryFire() {
        if (this.hasPinkExplosion) {
            this._firePinkExplosion();
            return;
        }

        if (this.hasPurpleExplosion) {
            this._firePurpleExplosion();
            return;
        }

        if (this.hasWideFire) {
            this._fireWide();
            return;
        }

        if (this.hasHeatSeek) {
            this._fireHeatSeek();
            return;
        }

        if (!this.hasBurstFire) {
            this._fireOnce();
            return;
        }

        if (this._burstActive) { return; }

        this._burstActive = true;
        this._burstCount = 0;
        this._fireBurst();
    }

    _fireWide() {
        const spreadAngles = [-30, -15, 0, 15, 30];
        for (const offset of spreadAngles) {
            const rad = Phaser.Math.DegToRad(this.angle - 90 + offset);
            this._fireOnceAtAngle(rad, 0xffff00, 2);
        }
    }

    _fireHeatSeek() {
        const rad = Phaser.Math.DegToRad(this.angle - 90);
        const noseX = this.x + Math.cos(rad) * 15;
        const noseY = this.y + Math.sin(rad) * 15;

        const targets = this._get5ClosestTargetsInFront(rad);

        for (let i = 0; i < 5; i++) {
            const bullets = this.scene.bullets.getChildren();
            if (bullets.length >= MAX_PLAYER_BULLETS) {
                break;
            }

            const target = targets[i] || null;
            const bullet = new HeatSeekBullet(this.scene, noseX, noseY, target);
            bullet.setTint(0x00ff00);
            this.scene.bullets.add(bullet);
            bullet.launch(rad, 600);
            this.scene.audioManager.playPlasma();
        }

        this.scene.audioManager.playGreenBullet();
    }

    _firePurpleExplosion() {
        const asteroids = this.scene.asteroids.getChildren();
        const maxRadius = 300;
        const asteroidsToDestroy = [];

        for (const asteroid of asteroids) {
            if (!asteroid.active) continue;

            const dx = asteroid.x - this.x;
            const dy = asteroid.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= maxRadius) {
                asteroidsToDestroy.push(asteroid);
            }
        }

        for (const asteroid of asteroidsToDestroy) {
            this.scene.splitAsteroid(asteroid);
        }

        const g = this.scene.make.graphics({ x: this.x, y: this.y, add: true });
        const radiusObj = { r: 0 };

        this.scene.tweens.add({
            targets: radiusObj,
            r: maxRadius,
            duration: 300,
            ease: 'Quad.easeOut',
            onUpdate: () => {
                g.clear();
                g.lineStyle(2, 0x9900ff, 1);
                g.strokeCircle(0, 0, radiusObj.r);
            },
            onComplete: () => {
                g.destroy();
            },
        });

        this.scene.audioManager.playPurpleBlast();
    }

    _firePinkExplosion() {
        const asteroids = this.scene.asteroids.getChildren();
        const maxRadius = 600;
        const asteroidsToDestroy = [];

        for (const asteroid of asteroids) {
            if (!asteroid.active) continue;

            const dx = asteroid.x - this.x;
            const dy = asteroid.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= maxRadius) {
                asteroidsToDestroy.push(asteroid);
            }
        }

        for (const asteroid of asteroidsToDestroy) {
            this.scene.splitAsteroid(asteroid);
        }

        const g = this.scene.make.graphics({ x: this.x, y: this.y, add: true });
        const radiusObj = { r: 0 };

        this.scene.tweens.add({
            targets: radiusObj,
            r: maxRadius,
            duration: 300,
            ease: 'Quad.easeOut',
            onUpdate: () => {
                g.clear();
                g.lineStyle(2, 0xff0099, 1);
                g.strokeCircle(0, 0, radiusObj.r);
            },
            onComplete: () => {
                g.destroy();
            },
        });

        this.scene.audioManager.playPinkBlast();
    }

    _get5ClosestTargetsInFront(shipAngleRad) {
        const allAsteroids = this.scene.asteroids.getChildren();
        const allSaucers = this.scene.saucers.getChildren();
        const inFront = [];

        for (const asteroid of allAsteroids) {
            if (!asteroid.active) continue;

            const dx = asteroid.x - this.x;
            const dy = asteroid.y - this.y;
            const asteroidAngle = Math.atan2(dy, dx);

            const angleDiff = Phaser.Math.Angle.Wrap(asteroidAngle - shipAngleRad);
            const absDiff = Math.abs(angleDiff);

            if (absDiff <= Math.PI / 2) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                inFront.push({ target: asteroid, distance });
            }
        }

        for (const saucer of allSaucers) {
            if (!saucer.active) continue;

            const dx = saucer.x - this.x;
            const dy = saucer.y - this.y;
            const saucerAngle = Math.atan2(dy, dx);

            const angleDiff = Phaser.Math.Angle.Wrap(saucerAngle - shipAngleRad);
            const absDiff = Math.abs(angleDiff);

            if (absDiff <= Math.PI / 2) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                inFront.push({ target: saucer, distance });
            }
        }

        inFront.sort((a, b) => a.distance - b.distance);

        return inFront.slice(0, 5).map(item => item.target);
    }

    _fireBurst() {
        if (this._burstCount >= BURST_BULLET_COUNT) {
            this._burstActive = false;
            return;
        }

        this._fireOnce();
        this._burstCount++;

        if (this._burstTimer) {
            this.scene.time.removeEvent(this._burstTimer);
        }
        this._burstTimer = this.scene.time.delayedCall(
            BURST_BULLET_DELAY,
            () => this._fireBurst()
        );
    }

    _fireOnce() {
        const rad = Phaser.Math.DegToRad(this.angle - 90);
        const tint = this.hasBurstFire ? 0x0099ff : 0xffffff;
        this._fireOnceAtAngle(rad, tint);
    }

    _fireOnceAtAngle(rad, tint, scale = 1) {
        const bullets = this.scene.bullets.getChildren();
        if (bullets.length >= MAX_PLAYER_BULLETS) { return; }

        const noseX = this.x + Math.cos(rad) * 15;
        const noseY = this.y + Math.sin(rad) * 15;

        const bullet = new Bullet(this.scene, noseX, noseY);
        bullet.setTint(tint);
        bullet.setScale(scale);
        this.scene.bullets.add(bullet);
        bullet.launch(rad);
        this.scene.audioManager.playShoot();
    }

    startInvulnerability(duration) {
        this.isInvulnerable = true;

        if (this._invulnTween) {
            this._invulnTween.stop();
        }

        this._invulnTween = this.scene.tweens.add({
            targets:  this,
            alpha:    0.2,
            duration: 120,
            yoyo:     true,
            repeat:   Math.floor(duration / 240),
        });

        this.scene.time.delayedCall(duration, () => {
            this.isInvulnerable = false;
            this.setAlpha(1);
            if (this._invulnTween) {
                this._invulnTween.stop();
                this._invulnTween = null;
            }
        });
    }

    _setTextureForState(isThrusting) {
        let colorMode;
        if (this.hasPinkExplosion) {
            colorMode = 'pink';
        } else if (this.hasPurpleExplosion) {
            colorMode = 'purple';
        } else if (this.hasWideFire) {
            colorMode = 'wide';
        } else if (this.hasBurstFire) {
            colorMode = 'burst';
        } else if (this.hasHeatSeek) {
            colorMode = 'heat';
        } else {
            colorMode = this._colorTag;
        }

        if (colorMode === 'pink') {
            this.setTexture(isThrusting ? TEX.SHIP_PINK_THRUST : TEX.SHIP_PINK);
        } else if (colorMode === 'purple') {
            this.setTexture(isThrusting ? TEX.SHIP_PURPLE_THRUST : TEX.SHIP_PURPLE);
        } else if (colorMode === 'wide') {
            this.setTexture(isThrusting ? TEX.SHIP_WIDE_THRUST : TEX.SHIP_WIDE);
        } else if (colorMode === 'burst') {
            this.setTexture(isThrusting ? TEX.SHIP_BURST_THRUST : TEX.SHIP_BURST);
        } else if (colorMode === 'heat') {
            this.setTexture(isThrusting ? TEX.SHIP_HEAT_THRUST : TEX.SHIP_HEAT);
        } else {
            this.setTexture(isThrusting ? TEX.SHIP_THRUST : TEX.SHIP);
        }
    }

    applyColorOnly(colorType) {
        this.hasBurstFire = false;
        this.hasWideFire = false;
        this.hasHeatSeek = false;
        this.hasPurpleExplosion = false;
        this.hasPinkExplosion = false;
        this._burstActive = false;
        this._burstCount = 0;
        if (this._burstTimer) {
            this.scene.time.removeEvent(this._burstTimer);
            this._burstTimer = null;
        }
        this._colorTag = colorType;
        this._setTextureForState(false);
    }

    enableBurstFire() {
        if (this.hasWideFire) {
            this.hasWideFire = false;
        }
        if (this.hasHeatSeek) {
            this.hasHeatSeek = false;
        }
        if (this.hasPurpleExplosion) {
            this.hasPurpleExplosion = false;
        }
        if (this.hasPinkExplosion) {
            this.hasPinkExplosion = false;
        }
        this.hasBurstFire = true;
        this._setTextureForState(false);
    }

    enableWideFire() {
        if (this.hasBurstFire) {
            this.hasBurstFire = false;
            this._burstActive = false;
            this._burstCount = 0;
            if (this._burstTimer) {
                this.scene.time.removeEvent(this._burstTimer);
                this._burstTimer = null;
            }
        }
        if (this.hasHeatSeek) {
            this.hasHeatSeek = false;
        }
        if (this.hasPurpleExplosion) {
            this.hasPurpleExplosion = false;
        }
        if (this.hasPinkExplosion) {
            this.hasPinkExplosion = false;
        }
        this.hasWideFire = true;
        this._setTextureForState(false);
    }

    enableHeatSeek() {
        // Disable other fire modes
        if (this.hasBurstFire) {
            this.hasBurstFire = false;
            this._burstActive = false;
            this._burstCount = 0;
            if (this._burstTimer) {
                this.scene.time.removeEvent(this._burstTimer);
                this._burstTimer = null;
            }
        }
        if (this.hasWideFire) {
            this.hasWideFire = false;
        }
        if (this.hasPurpleExplosion) {
            this.hasPurpleExplosion = false;
        }
        if (this.hasPinkExplosion) {
            this.hasPinkExplosion = false;
        }
        this.hasHeatSeek = true;
        this._setTextureForState(false);
    }

    enablePurpleExplosion() {
        // Disable other fire modes
        if (this.hasBurstFire) {
            this.hasBurstFire = false;
            this._burstActive = false;
            this._burstCount = 0;
            if (this._burstTimer) {
                this.scene.time.removeEvent(this._burstTimer);
                this._burstTimer = null;
            }
        }
        if (this.hasWideFire) {
            this.hasWideFire = false;
        }
        if (this.hasHeatSeek) {
            this.hasHeatSeek = false;
        }
        if (this.hasPinkExplosion) {
            this.hasPinkExplosion = false;
        }
        this.hasPurpleExplosion = true;
        this._setTextureForState(false);
    }

    enablePinkExplosion() {
        // Disable other fire modes
        if (this.hasBurstFire) {
            this.hasBurstFire = false;
            this._burstActive = false;
            this._burstCount = 0;
            if (this._burstTimer) {
                this.scene.time.removeEvent(this._burstTimer);
                this._burstTimer = null;
            }
        }
        if (this.hasWideFire) {
            this.hasWideFire = false;
        }
        if (this.hasHeatSeek) {
            this.hasHeatSeek = false;
        }
        if (this.hasPurpleExplosion) {
            this.hasPurpleExplosion = false;
        }
        this.hasPinkExplosion = true;
        this._setTextureForState(false);
    }

    resetAbilities() {
        this.hasBurstFire = false;
        this.hasWideFire = false;
        this.hasHeatSeek = false;
        this.hasPurpleExplosion = false;
        this.hasPinkExplosion = false;
        this._colorTag = null;
        this._setTextureForState(false);
        this._burstActive = false;
        this._burstCount = 0;
        if (this._burstTimer) {
            this.scene.time.removeEvent(this._burstTimer);
            this._burstTimer = null;
        }
    }
}
