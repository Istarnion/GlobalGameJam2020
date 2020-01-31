import { GameObject } from "./game.js";
import { gfx } from "./graphics.js";
import { input } from "./input.js";

const MAX_FALL_SPEED = 128;

const COLLISION_LAYER = 0;
const STAIRS_LEFT = 2;
const STAIRS_RIGHT = 3;

export class Player extends GameObject {
    constructor(game) {
        super();
        this.width = 12;
        this.height = 24;

        this.game = game;
        this.map = game.map;

        this.speed = 48;
        this.fall_speed = 0;

        // TODO: Get x and y from map
        this.x = gfx.width/2;
        this.y = gfx.height/2;

        this.remainder_x = 0;
        this.remainder_y = 0;
    }

    update(dt) {
        let movement_x = 0;
        if(input.isKeyDown('a') || input.isKeyDown('left')) {
            movement_x -= 1;
        }

        if(input.isKeyDown('d') || input.isKeyDown('right')) {
            movement_x += 1;
        }

        if(Math.abs(movement_x) > 0) {
            this.moveX(movement_x * this.speed * dt);
        }

        if(this.collidesAt(this.x-this.width/2, this.y+1) ||
           this.collidesAt(this.x+this.width/2, this.y+1)) {
            this.fall_speed = 0;
        }
        else {
            this.fall_speed += 4;
            if(this.fall_speed > MAX_FALL_SPEED) {
                this.fall_speed = MAX_FALL_SPEED;
            }

            this.moveY(this.fall_speed * dt);
        }

        // Draw
        gfx.fillStyle = 'white';
        gfx.fillRect(this.x-this.width/2, this.y-this.height, this.width, this.height);

        if(input.isKeyDown('q')) {
            gfx.fillStyle = 'rgba(255, 0, 255, 0.5)';
            gfx.fillRect(this.x-this.width/2, this.y-this.height, this.width, this.height);
        }
    }

    moveX(amount) {
        this.remainder_x += amount;
        let move = Math.round(this.remainder_x);

        if(move !== 0) {
            this.remainder_x -= move;
            const sign = Math.sign(move);

            while(move !== 0) {
                if(!this.collidesAt(this.x + sign, this.y)) {
                    this.x += sign;
                    move -= sign;
                }
                else break;
            }
        }
    }

    moveY(amount) {
        this.remainder_y += amount;
        let move = Math.round(this.remainder_y);

        if(move !== 0) {
            this.remainder_y -= move;
            const sign = Math.sign(move);

            while(move !== 0) {
                if(!this.collidesAt(this.x, this.y + sign)) {
                    this.y += sign;
                    move -= sign;
                }
                else break;
            }
        }
    }

    collidesAt(x, y) {
        const tile = this.tileAt(x, y);
        return tile !== 0 && tile !== STAIRS_LEFT && tile !== STAIRS_RIGHT;
    }

    tileAt(x, y) {
        const index = Math.floor(x / this.map.tile_width) +
                      Math.floor(y / this.map.tile_height) * this.map.width;
        const tile = this.map.layers[COLLISION_LAYER].tiles[index];
        return tile;
    }
}

