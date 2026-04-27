import { STARTING_LIVES, EXTRA_LIFE_SCORE } from '../constants.js';

const HIGH_SCORE_KEY = 'asteroidsHigh';

export class GameState {
    constructor() {
        this.score    = 0;
        this.lives    = STARTING_LIVES;
        this.level    = 1;
        this.highScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0');
        this._nextExtraLife = EXTRA_LIFE_SCORE;
    }

    addScore(points) {
        this.score += points;

        if (this.score >= this._nextExtraLife) {
            this.lives += 1;
            this._nextExtraLife += EXTRA_LIFE_SCORE;
        }

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(HIGH_SCORE_KEY, this.highScore);
        }
    }

    // Returns true if all lives are gone
    loseLife() {
        this.lives -= 1;
        return this.lives <= 0;
    }

    nextLevel() {
        this.level += 1;
    }
}
