import { GameObject } from "./game.js";
import { gfx } from "./graphics.js";
import { input } from "./input.js";
import { camera } from "./camera.js";
import { Animation } from "./animation.js";

const MAX_FALL_SPEED = 128;
const CLIMB_SPEED = 24;

const COLLISION_LAYER = 0;
const STAIRS_LEFT = 2;
const STAIRS_RIGHT = 3;
const LADDER = 4;

const states = {
    PLATFORMING: 0,
    TILE_PLACING: 1
};

export class Player extends GameObject {
    constructor(game) {
        super();

        this.state = states.PLATFORMING;

        this.width = 6;
        this.height = 12;

        this.idle_anim = new Animation('player_idle');
        this.idle_anim.anchor_x = 0.5;
        this.idle_anim.anchor_y = 1.0;

        this.walk_right_anim = new Animation('player_walk_right');
        this.walk_right_anim.anchor_x = 0.5;
        this.walk_right_anim.anchor_y = 1.0;

        this.walk_left_anim = new Animation('player_walk_left');
        this.walk_left_anim.anchor_x = 0.5;
        this.walk_left_anim.anchor_y = 1.0;

        this.climbing_anim = new Animation('player_climbing');
        this.climbing_anim.anchor_x = 0.5;
        this.climbing_anim.anchor_y = 1.0;

        this.falling_anim = new Animation('player_falling');
        this.falling_anim.anchor_x = 0.5;
        this.falling_anim.anchor_y = 1.0;

        this.curr_anim = this.idle_anim;

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

        if(this.state == states.PLATFORMING) {
            let movement_x = 0;
            if(input.isKeyDown('a', 'left')) {
                movement_x -= 1;
            }

            if(input.isKeyDown('d', 'right')) {
                movement_x += 1;
            }

            if(Math.abs(movement_x) > 0) {
                this.moveX(movement_x * this.speed * dt);
                if(movement_x > 0) {
                    this.curr_anim = this.walk_right_anim;
                }
                else {
                    this.curr_anim = this.walk_left_anim;
                }
            }
            else {
                this.curr_anim = this.idle_anim;
            }

            let can_open_ipad = true;

            if(this.collidesAt(this.x, this.y+1)) {
                this.fall_speed = 0;
            }
            else {
                can_open_ipad = false;
                this.fall_speed += 4;
                if(this.fall_speed > MAX_FALL_SPEED) {
                    this.fall_speed = MAX_FALL_SPEED;
                }

                this.curr_anim = this.falling_anim;
            }

            const foottile = this.tileAt(this.x, this.y);
            if(foottile === STAIRS_LEFT || foottile === STAIRS_RIGHT) {
                can_open_ipad = true;
                const base_y = Math.floor(this.y / this.map.tile_height) * this.map.tile_height;

                if(foottile === STAIRS_LEFT) {
                    const t = ((this.x-this.width/2) % this.map.tile_width) / this.map.tile_width;
                    this.y = Math.floor(base_y + this.map.tile_height * t)-2;
                }
                else {
                    const t = ((this.x+this.width/2) % this.map.tile_width) / this.map.tile_width;
                    this.y = Math.floor(base_y + (this.map.tile_height-1) * (1-t))-2;
                }
            }
            else if(foottile === LADDER) {
                can_open_ipad = false;
                this.fall_speed = 0;

                if(input.isKeyDown('up', 'w')) {
                    this.fall_speed = -CLIMB_SPEED;
                }

                if(input.isKeyDown('down', 's')) {
                    this.fall_speed = CLIMB_SPEED;
                }

                this.curr_anim = this.climbing_anim;
            }

            this.moveY(this.fall_speed * dt);

            camera.target(this.x, this.y);

            if(can_open_ipad && input.isKeyJustPressed('e')) {
                this.state = states.TILE_PLACING;
            }
        }
        else {
            const mouse_x = input.mouse_x + camera.x;
            const mouse_y = input.mouse_y + camera.y;

            const tile_x = Math.floor(mouse_x / this.map.tile_width);
            const tile_y = Math.floor(mouse_y / this.map.tile_height);
            const tile_index = tile_x + tile_y * this.map.width;

            if(input.isKeyJustPressed('mouse')) {
                this.map.layers[0].tiles[tile_index] = 1;
            }

            gfx.fillStyle = 'rgba(0, 255, 0, 0.5)';
            gfx.fillRect(tile_x*this.map.tile_width, tile_y*this.map.tile_height,
                         this.map.tile_width, this.map.tile_height);

            // Do ipad animations
            //
            if(input.isKeyJustPressed('e')) {
                this.state = states.PLATFORMING;
            }
        }

        // Draw
        this.curr_anim.update(dt);
        this.curr_anim.draw(this.x, this.y);

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
        const tiles = [
            this.tileAt(x-this.width/2, y-this.height),
            this.tileAt(x+this.width/2, y-this.height),
            this.tileAt(x-this.width/2, y),
            this.tileAt(x+this.width/2, y)
        ];

        for(var i=0; i<tiles.length; ++i) {
            const tile = tiles[i];
            if(tile !== 0 &&
               tile !== STAIRS_LEFT &&
               tile !== STAIRS_RIGHT &&
               tile !== LADDER) {
                return true;
            }
        }

        return false;
    }

    tileAt(x, y) {
        const index = Math.floor(x / this.map.tile_width) +
                      Math.floor(y / this.map.tile_height) * this.map.width;
        const tile = this.map.layers[COLLISION_LAYER].tiles[index];
        return tile;
    }
}

