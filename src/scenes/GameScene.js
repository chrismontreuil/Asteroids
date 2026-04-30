import { Ship }             from '../objects/Ship.js';
import { Asteroid }         from '../objects/Asteroid.js';
import { GameState }        from '../systems/GameState.js';
import { InputHandler }     from '../systems/InputHandler.js';
import { WaveManager }      from '../systems/WaveManager.js';
import { CollisionManager } from '../systems/CollisionManager.js';
import { AudioManager }     from '../systems/AudioManager.js';
import { PickupManager }    from '../systems/PickupManager.js';
import { WrapBounds }       from '../utils/WrapBounds.js';
import { createExplosion }  from '../utils/Explosion.js';
import { SCREEN_W, SCREEN_H, SPLITS_INTO, INVULNERABILITY_MS } from '../constants.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // State and systems
        this.gameState    = new GameState();
        this.audioManager = new AudioManager();
        this.inputHandler = new InputHandler(this);

        // Physics groups
        this.bullets   = this.physics.add.group();
        this.asteroids = this.physics.add.group();
        this.pickups   = this.physics.add.group();

        // Player ship
        this.ship = new Ship(this, SCREEN_W / 2, SCREEN_H / 2);

        // Pickup manager
        this.pickupManager = new PickupManager(this);

        // Wire collisions
        this.collisionManager = new CollisionManager(this);
        this.collisionManager.register(this.ship, this.bullets, this.asteroids, this.pickups);

        // Wave manager starts the first wave
        this.waveManager = new WaveManager(this, this.gameState);
        this.waveManager.startWave();

        // HUD (drawn on top of everything)
        this.scoreText = this.add.text(16, 16, 'SCORE: 0', {
            fontSize:   '18px',
            fill:       '#ffffff',
            fontFamily: 'monospace',
        }).setDepth(10);

        this.livesText = this.add.text(SCREEN_W - 16, 16, 'LIVES: 3', {
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
        this._gameOver       = false;
        this._thrusterWasOn  = false;
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

        // Wrap pickups
        const allPickups = [...this.pickups.getChildren()];
        allPickups.forEach(p => WrapBounds.wrap(this, p));

        // Wave logic
        this.waveManager.update(time, delta);

        // Heartbeat audio tempo based on remaining asteroids
        this.audioManager.updateHeartbeat(delta, this.asteroids.countActive(true));

        // HUD
        this.scoreText.setText('SCORE: ' + this.gameState.score);
        this.livesText.setText('LIVES: ' + this.gameState.lives);
    }

    splitAsteroid(asteroid) {
        const pos  = { x: asteroid.x, y: asteroid.y };
        const size = asteroid.size;

        this.gameState.addScore(asteroid.scoreValue);
        createExplosion(this, pos.x, pos.y, 10);
        this.audioManager.playExplosion(size);

        asteroid.destroy();

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
        this.audioManager.stopThruster();
        this._thrusterWasOn = false;

        this.ship.resetAbilities();
        this.pickupManager.reset();

        const isGameOver = this.gameState.loseLife();

        if (isGameOver) {
            this._gameOver = true;
            this.ship.destroy();

            this.time.delayedCall(1500, () => {
                this.scene.start('GameOverScene', { score: this.gameState.score });
            });
        } else {
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
}
