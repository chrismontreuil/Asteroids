export const SCREEN_W = 1920;
export const SCREEN_H = 1080;

export const TEX = {
  SHIP: "ship",
  SHIP_THRUST: "ship-thrust",
  ASTEROID_LG: "asteroid-lg",
  ASTEROID_MD: "asteroid-md",
  ASTEROID_SM: "asteroid-sm",
  BULLET: "bullet",
  PARTICLE: "particle",
};

export const SCORE = {
  ASTEROID_LARGE: 20,
  ASTEROID_MEDIUM: 50,
  ASTEROID_SMALL: 100,
};

export const SIZE_TO_TEX = {
  large: TEX.ASTEROID_LG,
  medium: TEX.ASTEROID_MD,
  small: TEX.ASTEROID_SM,
};

export const SIZE_TO_RADIUS = {
  large: 40,
  medium: 20,
  small: 10,
};

export const SIZE_TO_SPEED = {
  large: 60,
  medium: 100,
  small: 160,
};

export const SPLITS_INTO = {
  large: "medium",
  medium: "small",
  small: null,
};

export const SCORE_FOR_SIZE = {
  large: SCORE.ASTEROID_LARGE,
  medium: SCORE.ASTEROID_MEDIUM,
  small: SCORE.ASTEROID_SMALL,
};

export const SHIP_ROTATION_SPEED = 200;
export const SHIP_THRUST_FORCE = 400;
export const SHIP_MAX_SPEED = 300;
export const SHIP_DRAG = 0.98;

export const MAX_PLAYER_BULLETS = 8;
export const BULLET_SPEED = 500;
export const BULLET_LIFESPAN = 1200;

export const STARTING_LIVES = 3;
export const EXTRA_LIFE_SCORE = 10000;
export const INVULNERABILITY_MS = 3000;
