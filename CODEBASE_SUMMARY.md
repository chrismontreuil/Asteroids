# Asteroids Codebase Summary

## File Structure

```
src/
├── main.js
├── constants.js
├── objects/
│   ├── Ship.js
│   ├── Bullet.js
│   └── Asteroid.js
├── scenes/
│   ├── BootScene.js
│   ├── MenuScene.js
│   ├── GameScene.js
│   └── GameOverScene.js
├── systems/
│   ├── GameState.js
│   ├── InputHandler.js
│   ├── WaveManager.js
│   ├── CollisionManager.js
│   └── AudioManager.js
└── utils/
    ├── TextureFactory.js
    ├── WrapBounds.js
    └── Explosion.js
```

**Stack:** Phaser 3.87 + Vite 5.4, ES modules, port 3000

---

## Constants (`constants.js`)

| Constant | Value |
|----------|-------|
| SCREEN_W / SCREEN_H | 800 / 600 |
| SHIP_ROTATION_SPEED | 200 °/s |
| SHIP_THRUST_FORCE | 400 |
| SHIP_MAX_VELOCITY | 300 |
| SHIP_DRAG | 0.99 |
| SHIP_BODY_RADIUS | 16px |
| MAX_PLAYER_BULLETS | 4 |
| BULLET_SPEED | 500 px/s |
| BULLET_LIFESPAN | 1200ms |
| STARTING_LIVES | 3 |
| INVULNERABILITY_DURATION | 3000ms |
| EXTRA_LIFE_SCORE | 10000 |

**Asteroid sizes:**

| Size | Radius | Base Speed | Score | Splits Into |
|------|--------|-----------|-------|-------------|
| large | 40px | 60 px/s | 20 | 2× medium |
| medium | 20px | 100 px/s | 50 | 2× small |
| small | 10px | 160 px/s | 100 | nothing |

---

## Game States / Scene Flow

```
BootScene → MenuScene → GameScene → GameOverScene → GameScene (retry)
```

- **BootScene:** calls `TextureFactory.createAll()`, then starts MenuScene
- **MenuScene:** shows title + high score (localStorage `asteroidsHigh`); ENTER starts GameScene; prompt pulses alpha 1→0.2, 700ms cycle
- **GameScene:** main loop (see below)
- **GameOverScene:** shows final score + high score; ENTER restarts GameScene (full reset)

---

## GameScene — Main Loop

### create()
1. Init GameState, AudioManager, InputHandler
2. Create physics groups: `bullets`, `asteroids`
3. Spawn Ship at (400, 300)
4. Wire CollisionManager overlaps
5. WaveManager.startWave() (wave 1)
6. Create HUD text (depth 10): score, lives, wave

### update(time, delta)
1. Exit early if `_gameOver`
2. `inputHandler.update()`
3. `ship.update(input)` — rotation, thrust, fire
4. Track thruster audio: call `startThruster()` / `stopThruster()` only on state change
5. `WrapBounds.wrap()` for ship, all asteroids, all bullets
6. `bullet.update(delta)` for each bullet — lifespan countdown, destroy if expired
7. `waveManager.update()` — check if wave cleared, spawn next
8. `audioManager.updateHeartbeat(delta, asteroidCount)`
9. Refresh HUD text

### splitAsteroid(asteroid)
1. `gameState.addScore(asteroid.scoreValue)`
2. `createExplosion(scene, x, y, 10)`
3. Play explosion sound (size-based)
4. Destroy asteroid
5. If size has a child size: spawn 2 child Asteroids at same (x,y), call `.launch(speedScale)`

### killShip()
1. Skip if `ship.isInvulnerable` or `_gameOver`
2. `createExplosion(scene, x, y, 20)`
3. Play large explosion sound
4. Stop thruster audio
5. `gameState.loseLife()`
6. **Lives remain:** reset ship to center (velocity 0, rotation 0), `ship.startInvulnerability(3000)`
7. **No lives:** set `_gameOver = true`, destroy ship, delay 1500ms → GameOverScene with score

---

## Objects

### Ship (`objects/Ship.js`)
- Sprite, circular body radius 16px, offset (4,4)
- Max velocity 300 X+Y, drag 0.99, damping enabled

**update(input):**
- Rotate: left/right → angular velocity ±200; else 0
- Thrust: `rad = DegToRad(angle - 90)`; acceleration `(cos(rad)*400, sin(rad)*400)`; switch texture SHIP↔SHIP_THRUST
- Fire: call `_tryFire()` if `input.fire`

**_tryFire():**
- Reject if bullets group count ≥ 4
- Nose position: `ship.x + cos(rad)*18`, `ship.y + sin(rad)*18`
- Create Bullet, add to group, `bullet.launch(rad)`
- `audioManager.playShoot()`

**startInvulnerability(duration):**
- Set `isInvulnerable = true`
- Tween alpha 1↔0.2, 120ms cycle, repeat `floor(duration/240)` times
- After `duration` ms: `isInvulnerable = false`, alpha = 1, cancel tween

### Bullet (`objects/Bullet.js`)
- Sprite, `_elapsed = 0`
- `launch(rad)`: velocity `(cos(rad)*500, sin(rad)*500)`
- `update(delta)`: `_elapsed += delta`; if `_elapsed >= 1200` → destroy

### Asteroid (`objects/Asteroid.js`)
- Sprite, circular body, radius per size, offset (5,5)
- Stores `size` string and `scoreValue`
- `launch(speedMultiplier=1)`: random angle, velocity `cos/sin * speed * multiplier`, angular velocity random ±80 °/s

---

## Systems

### GameState (`systems/GameState.js`)
- `score=0`, `lives=3`, `level=1`
- `highScore` from localStorage `asteroidsHigh`
- `_nextExtraLife=10000`

**addScore(points):**
1. `score += points`
2. If `score >= _nextExtraLife`: `lives++`, `_nextExtraLife += 10000`
3. If `score > highScore`: update + persist to localStorage

**loseLife():** `lives--`; return `lives <= 0` (game over flag)

**nextLevel():** `level++`

### InputHandler (`systems/InputHandler.js`)
- `rotateLeft/Right/thrust`: `key.isDown` (hold)
- `fire`: `Phaser.Input.Keyboard.JustDown(spaceKey)` (single-frame pulse)

### WaveManager (`systems/WaveManager.js`)
- `startWave()`:
  - Asteroid count: `min(2 + level, 12)` → wave 1 = 3, capped at 12
  - Speed scale: `1 + (level-1)*0.1` → +10% per wave
  - Spawn `numRocks` large Asteroids from random screen edge
  - Show "WAVE N" label if not first wave (fades over 1200ms after 300ms delay)
- `update()`: if `asteroids.countActive() === 0` and not transitioning:
  - `_transitioning = true`, `gameState.nextLevel()`
  - Delay 1500ms → `startWave()`
- `_edgePosition()`: random point on one of four screen edges (x=0/800 or y=0/600)

### CollisionManager (`systems/CollisionManager.js`)
- Uses `physics.add.overlap()` (no bounce, destruction-based)
- Bullet-Asteroid: destroy bullet → `scene.splitAsteroid(asteroid)`
- Ship-Asteroid: `scene.killShip()` — filtered by `_shipIsVulnerable = !ship.isInvulnerable`
- Both callbacks sanity-check `body.active` before acting

### AudioManager (`systems/AudioManager.js`)
- All sounds via Web Audio API (lazy-init on first user gesture)

| Sound | Method | Synthesis |
|-------|--------|-----------|
| Shoot | `playShoot()` | Triangle wave, 880→110 Hz exponential ramp, 120ms |
| Explosion | `playExplosion(size)` | White noise buffer; large=500ms/0.5v, medium=300ms/0.35v, small=150ms/0.2v |
| Thruster | `startThruster()` / `stopThruster()` | Sawtooth 70 Hz, gain 0.12; fade-out 80ms on stop |
| Heartbeat | `updateHeartbeat(delta, count)` | Sine 60 Hz (phase 0) / 75 Hz (phase 1), 70ms, gain 0.4 |

**Heartbeat tempo:** `interval = 1200 - t*800` where `t = clamp((12-count)/12, 0, 1)` → 1200ms at 12 asteroids, 400ms at 0

---

## Utils

### TextureFactory (`utils/TextureFactory.js`)
- All sprites generated procedurally in `createAll(scene)` at boot
- Ship: 40×40 canvas, white triangle nose-up (20,2)→(4,36)→(36,36)
- Ship thrust: same + yellow fill triangle (15,36)→(20,39)→(25,36)
- Asteroids: canvas = `radius*2+10`; `numPoints` vertices at random radii 70-100% of nominal
  - large: radius=40, 12 points; medium: radius=20, 10 points; small: radius=10, 8 points
- Bullet: small white rect (exact size in source)
- Particle: small white square

### WrapBounds (`utils/WrapBounds.js`)
- `wrap(scene, obj)`: if `obj.x < -hw` → `obj.x = width+hw`; mirrored for all 4 edges
- Uses `displayWidth/2` so objects slide half-off before teleporting

### Explosion (`utils/Explosion.js`)
- `createExplosion(scene, x, y, count)`: one-shot particle burst
- Speed 40-200 px/s radial, scale 1→0, alpha 1→0, lifespan 600ms
- Emitter destroyed after 700ms

---

## Difficulty Progression

| Wave | Asteroids | Speed Scale |
|------|-----------|-------------|
| 1 | 3 | 1.0× |
| 2 | 4 | 1.1× |
| 5 | 7 | 1.4× |
| 10 | 12 | 1.9× |
| 11+ | 12 (capped) | keeps rising |

---

## Key Interactions

```
GameScene.update
  └─ InputHandler.update
  └─ Ship.update(input) ──fire──► Bullet.launch → bullets group
  └─ WrapBounds.wrap (ship, asteroids, bullets)
  └─ Bullet.update (lifespan → destroy)
  └─ WaveManager.update (count == 0 → nextLevel → startWave after 1.5s)
  └─ AudioManager.updateHeartbeat(delta, asteroidCount)

CollisionManager (registered in create, fires during physics step)
  bullet + asteroid ──► destroy bullet → GameScene.splitAsteroid
                            └─ GameState.addScore (extra life check, high score persist)
                            └─ Explosion (10 particles)
                            └─ spawn 2 child Asteroids (if splittable)
  ship + asteroid (if !invulnerable) ──► GameScene.killShip
                            └─ GameState.loseLife
                            └─ if lives: Ship.startInvulnerability(3000)
                            └─ if no lives: delay 1.5s → GameOverScene
```
