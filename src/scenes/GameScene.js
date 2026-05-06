import { Ship }             from '../objects/Ship.js';
import { Asteroid }         from '../objects/Asteroid.js';
import { Saucer }           from '../objects/Saucer.js';
import { Octopus }          from '../objects/Octopus.js';
import { GameState }        from '../systems/GameState.js';
import { InputHandler }     from '../systems/InputHandler.js';
import { WaveManager }      from '../systems/WaveManager.js';
import { CollisionManager } from '../systems/CollisionManager.js';
import { AudioManager }     from '../systems/AudioManager.js';
import { PickupManager }    from '../systems/PickupManager.js';
import { SoundtrackManager } from '../systems/SoundtrackManager.js';
import { WrapBounds }       from '../utils/WrapBounds.js';
import { createExplosion }  from '../utils/Explosion.js';
import { SCREEN_W, SCREEN_H, SPLITS_INTO, INVULNERABILITY_MS, SAUCER_SPAWN_DELAY, SAUCER_RESPAWN_DELAY, SAUCER_SCORE, OCTOPUS_BODY_SCORE, OCTOPUS_TENTACLE_SCORE } from '../constants.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // State and systems
        this.gameState    = new GameState();
        const startingWave = this.sys.settings.data?.startingWave || 1;
        this.gameState.level = startingWave;
        this.audioManager = new AudioManager(this);
        this.inputHandler = new InputHandler(this);

        // Physics groups
        this.bullets        = this.physics.add.group();
        this.asteroids      = this.physics.add.group();
        this.pickups        = this.physics.add.group();
        this.saucers        = this.physics.add.group();
        this.saucerBullets  = this.physics.add.group();
        this.octopuses      = this.physics.add.group();
        this.tentacles      = this.physics.add.group();

        // Player ship
        this.ship = new Ship(this, SCREEN_W / 2, SCREEN_H / 2);

        // Pickup manager
        this.pickupManager = new PickupManager(this);

        // Soundtrack
        this.soundtrackManager = new SoundtrackManager(this, this.audioManager);

        // Wire collisions
        this.collisionManager = new CollisionManager(this);
        this.collisionManager.register(this.ship, this.bullets, this.asteroids, this.pickups, this.saucers, this.saucerBullets, this.octopuses, this.tentacles);

        // Wave manager starts the first wave
        this.waveManager = new WaveManager(this, this.gameState);
        this.waveManager.startWave();

        // HUD (drawn on top of everything)
        this.scoreText = this.add.text(16, 16, 'SCORE: 0', {
            fontSize:   '18px',
            fill:       '#ffffff',
            fontFamily: 'monospace',
        }).setDepth(10);

        this.livesText = this.add.text(SCREEN_W - 16, 16, 'LIVES: 5', {
            fontSize:   '18px',
            fill:       '#ffffff',
            fontFamily: 'monospace',
        }).setOrigin(1, 0).setDepth(10);

        this.waveText = this.add.text(SCREEN_W / 2, SCREEN_H / 2, '', {
            fontSize:   '32px',
            fill:       '#ffffff',
            fontFamily: 'monospace',
        }).setOrigin(0.5).setDepth(10).setAlpha(0);

        // Flags
        this._gameOver           = false;
        this._thrusterWasOn      = false;
        this._saucerSpawnTimer   = null;
        this._saucerRespawnTimer = null;

        this._scheduleSaucerSpawn();
    }

    update(time, delta) {
        if (this._gameOver) { return; }

        this.inputHandler.update();
        this.ship.update(this.inputHandler);

        // Thruster audio — only trigger on state change
        const thrustOn = this.inputHandler.state.thrust;
        if (thrustOn && !this._thrusterWasOn) {
            this.audioManager.startThruster();
        } else if (!thrustOn && this._thrusterWasOn) {
            this.audioManager.stopThruster();
        }
        this._thrusterWasOn = thrustOn;

        // Screen wrapping
        WrapBounds.wrap(this, this.ship);

        const allAsteroids = [...this.asteroids.getChildren()];
        allAsteroids.forEach(a => WrapBounds.wrap(this, a));

        // Asteroid-to-asteroid collisions
        for (let i = 0; i < allAsteroids.length; i++) {
            for (let j = i + 1; j < allAsteroids.length; j++) {
                const a1 = allAsteroids[i];
                const a2 = allAsteroids[j];
                const dx = a2.body.x - a1.body.x;
                const dy = a2.body.y - a1.body.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = (a1.body.radius || 20) + (a2.body.radius || 20);

                if (dist < minDist && dist > 0) {
                    const nx = dx / dist;
                    const ny = dy / dist;

                    const dvx = a2.body.velocity.x - a1.body.velocity.x;
                    const dvy = a2.body.velocity.y - a1.body.velocity.y;
                    const dvn = dvx * nx + dvy * ny;

                    if (dvn < 0) {
                        const impulse = dvn / 2;
                        a1.body.velocity.x += impulse * nx;
                        a1.body.velocity.y += impulse * ny;
                        a2.body.velocity.x -= impulse * nx;
                        a2.body.velocity.y -= impulse * ny;
                    }
                }
            }
        }

        const allBullets = [...this.bullets.getChildren()];
        allBullets.forEach(b => {
            WrapBounds.wrap(this, b);
            b.update(delta);
        });

        const allSaucerBullets = [...this.saucerBullets.getChildren()];
        allSaucerBullets.forEach(b => {
            WrapBounds.wrap(this, b);
            b.update(delta);
        });

        // Wrap pickups
        const allPickups = [...this.pickups.getChildren()];
        allPickups.forEach(p => WrapBounds.wrap(this, p));

        // Update saucers
        const allSaucers = [...this.saucers.getChildren()];
        allSaucers.forEach(s => s.update(delta));

        // Update octopuses
        const allOctopuses = [...this.octopuses.getChildren()];
        allOctopuses.forEach(o => o.update(delta));

        // Wave logic
        this.waveManager.update(time, delta);

        // HUD
        this.scoreText.setText('SCORE: ' + this.gameState.score);
        this.livesText.setText('LIVES: ' + this.gameState.lives);
    }

    splitAsteroid(asteroid) {
        const pos  = { x: asteroid.x, y: asteroid.y };
        const size = asteroid.size;

        const extraLifeEarned = this.gameState.addScore(asteroid.scoreValue);
        if (extraLifeEarned) {
            this.audioManager.playExtraLife();
        }
        createExplosion(this, pos.x, pos.y, 10);
        this.audioManager.playExplosion(size);

        asteroid.destroy();

        if (size === 'giant') {
            for (let i = 0; i < 5; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 80 + Math.random() * 40;
                const offsetX = Math.cos(angle) * distance;
                const offsetY = Math.sin(angle) * distance;
                const child = new Asteroid(this, pos.x + offsetX, pos.y + offsetY, 'large');
                this.asteroids.add(child);
                child.launch();
            }
            for (let i = 0; i < 10; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 80 + Math.random() * 40;
                const offsetX = Math.cos(angle) * distance;
                const offsetY = Math.sin(angle) * distance;
                const child = new Asteroid(this, pos.x + offsetX, pos.y + offsetY, 'medium');
                this.asteroids.add(child);
                child.launch();
            }
            return;
        }

        const childSize = SPLITS_INTO[size];
        if (childSize !== null) {
            const child1 = new Asteroid(this, pos.x, pos.y, childSize);
            const child2 = new Asteroid(this, pos.x, pos.y, childSize);
            this.asteroids.add(child1);
            this.asteroids.add(child2);
            child1.launch();
            child2.launch();
        }
    }

    killShip() {
        if (this.ship.isInvulnerable || this._gameOver) { return; }

        createExplosion(this, this.ship.x, this.ship.y, 20);
        this.audioManager.playExplosion('large');
        this.audioManager.playDeath();
        this.audioManager.stopThruster();
        this._thrusterWasOn = false;

        this.ship.resetAbilities();
        this.pickupManager.reset();

        const isGameOver = this.gameState.loseLife();

        if (isGameOver) {
            this._gameOver = true;
            this.ship.destroy();
            this._cancelSaucerTimers();

            this.time.delayedCall(1500, () => {
                this.scene.start('GameOverScene', { score: this.gameState.score });
            });
        } else {
            this.ship.setActive(true);
            this.ship.setVisible(true);
            this.ship.setPosition(SCREEN_W / 2, SCREEN_H / 2);
            this.ship.body.setVelocity(0, 0);
            this.ship.body.setAcceleration(0, 0);
            this.ship.setAngle(0);
            this.ship.startInvulnerability(INVULNERABILITY_MS);
        }
    }

    // Called by WaveManager to show "WAVE N" overlay
    showWaveLabel(level) {
        this.waveText.setText('WAVE ' + level);
        this.tweens.add({
            targets:  this.waveText,
            alpha:    { from: 1, to: 0 },
            duration: 1200,
            delay:    300,
        });
    }

    _scheduleSaucerSpawn() {
        this._saucerSpawnTimer = this.time.delayedCall(SAUCER_SPAWN_DELAY, () => {
            this._spawnSaucer();
        });
    }

    _spawnSaucer() {
        const activeSaucers = this.saucers.countActive(true);
        if (activeSaucers > 0) { return; }

        const w = this.scale.width;
        const h = this.scale.height;
        const edge = Phaser.Math.Between(0, 3);
        let x, y;

        if (edge === 0) {
            x = Phaser.Math.Between(0, w);
            y = 0;
        } else if (edge === 1) {
            x = Phaser.Math.Between(0, w);
            y = h;
        } else if (edge === 2) {
            x = 0;
            y = Phaser.Math.Between(0, h);
        } else {
            x = w;
            y = Phaser.Math.Between(0, h);
        }

        const saucer = new Saucer(this, x, y);
        this.saucers.add(saucer);
    }

    killSaucer(saucer) {
        const extraLifeEarned = this.gameState.addScore(SAUCER_SCORE);
        if (extraLifeEarned) {
            this.audioManager.playExtraLife();
        }
        createExplosion(this, saucer.x, saucer.y, 15);
        this.audioManager.playSaucerDeath();
        saucer.die();

        this.waveManager.onSaucerKilled();

        if (this._saucerRespawnTimer) {
            this.time.removeEvent(this._saucerRespawnTimer);
        }
        const respawnDelay = this.waveManager.getSaucerRespawnDelay();
        this._saucerRespawnTimer = this.time.delayedCall(respawnDelay, () => {
            this._spawnSaucer();
        });
    }

    damageOctopusTentacle(octopus) {
        const extraLifeEarned = this.gameState.addScore(OCTOPUS_TENTACLE_SCORE);
        if (extraLifeEarned) {
            this.audioManager.playExtraLife();
        }
        this.audioManager.playOctopusHit();
    }

    killOctopus(octopus) {
        const extraLifeEarned = this.gameState.addScore(OCTOPUS_BODY_SCORE);
        if (extraLifeEarned) {
            this.audioManager.playExtraLife();
        }
        createExplosion(this, octopus.x, octopus.y, 20);
        this.audioManager.playExplosion('large');
        octopus.die();
    }

    resetOctopuses() {
        const octopuses = [...this.octopuses.getChildren()];
        octopuses.forEach(o => o.die());
    }

    resetSaucer() {
        this._cancelSaucerTimers();
        const saucers = [...this.saucers.getChildren()];
        saucers.forEach(s => s.die());
        this._scheduleSaucerSpawn();
    }

    clearSaucers() {
        this._cancelSaucerTimers();
        const saucers = [...this.saucers.getChildren()];
        saucers.forEach(s => s.die());
    }

    _cancelSaucerTimers() {
        if (this._saucerSpawnTimer) {
            this.time.removeEvent(this._saucerSpawnTimer);
            this._saucerSpawnTimer = null;
        }
        if (this._saucerRespawnTimer) {
            this.time.removeEvent(this._saucerRespawnTimer);
            this._saucerRespawnTimer = null;
        }
    }

    shutdown() {
        this.soundtrackManager.shutdown();
    }
}
