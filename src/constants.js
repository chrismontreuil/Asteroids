export const SCREEN_W = 1920;
export const SCREEN_H = 1080;

export const TEX = {
  SHIP: "ship",
  SHIP_THRUST: "ship-thrust",
  SHIP_BURST: "ship-burst",
  SHIP_BURST_THRUST: "ship-burst-thrust",
  SHIP_WIDE: "ship-wide",
  SHIP_WIDE_THRUST: "ship-wide-thrust",
  SHIP_HEAT: "ship-heat",
  SHIP_HEAT_THRUST: "ship-heat-thrust",
  SHIP_PURPLE: "ship-purple",
  SHIP_PURPLE_THRUST: "ship-purple-thrust",
  SHIP_PINK: "ship-pink",
  SHIP_PINK_THRUST: "ship-pink-thrust",
  ASTEROID_GI: "asteroid-gi",
  ASTEROID_LG: "asteroid-lg",
  ASTEROID_MD: "asteroid-md",
  ASTEROID_SM: "asteroid-sm",
  BULLET: "bullet",
  PARTICLE: "particle",
  SAUCER: "saucer",
  OCTOPUS: "octopus",
};

export const SCORE = {
  ASTEROID_LARGE: 20,
  ASTEROID_MEDIUM: 50,
  ASTEROID_SMALL: 100,
};

export const getAsteroidTexture = (size) => {
  const variation = Math.floor(Math.random() * 4);
  const baseTexes = {
    giant: TEX.ASTEROID_GI,
    large: TEX.ASTEROID_LG,
    medium: TEX.ASTEROID_MD,
    small: TEX.ASTEROID_SM,
  };
  return `${baseTexes[size]}-${variation}`;
};

export const SIZE_TO_RADIUS_X = {
  giant: 190,
  large: 40,
  medium: 20,
  small: 10,
};

export const SIZE_TO_RADIUS_Y = {
  giant: 180,
  large: 28,
  medium: 14,
  small: 7,
};

export const SIZE_TO_SPEED = {
  giant: 60,
  large: 90,
  medium: 150,
  small: 240,
};

export const SPLITS_INTO = {
  giant: "large",
  large: "medium",
  medium: "small",
  small: null,
};

export const SCORE_FOR_SIZE = {
  giant: 10,
  large: SCORE.ASTEROID_LARGE,
  medium: SCORE.ASTEROID_MEDIUM,
  small: SCORE.ASTEROID_SMALL,
};

export const SHIP_ROTATION_SPEED = 200;
export const SHIP_THRUST_FORCE = 400;
export const SHIP_MAX_SPEED = 300;
export const SHIP_DRAG = 0.98;

export const MAX_PLAYER_BULLETS = 10;
export const BULLET_SPEED = 500;
export const BULLET_LIFESPAN = 1200;

export const PICKUP_SPAWN_DELAY = 30000;
export const PICKUP_LIFETIME = 10000;
export const BURST_BULLET_COUNT = 5;
export const BURST_BULLET_DELAY = 50;

export const STARTING_LIVES = 3;
export const EXTRA_LIFE_SCORE = 10000;
export const INVULNERABILITY_MS = 3000;

export const SAUCER_SPEED = 160;
export const SAUCER_AVOID_RADIUS = 220;
export const SAUCER_FIRE_INTERVAL = 2500;
export const SAUCER_RESPAWN_DELAY = 15000;
export const SAUCER_SPAWN_DELAY = 10000;
export const SAUCER_SCORE = 500;

export const OCTOPUS_SPEED = 0;
export const OCTOPUS_FIRE_INTERVAL = 3000;
export const OCTOPUS_TENTACLE_REGROW_DELAY = 5000;
export const OCTOPUS_BODY_SCORE = 1000;
export const OCTOPUS_TENTACLE_SCORE = 500;
