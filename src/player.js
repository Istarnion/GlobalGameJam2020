import { GameObject } from "./game.js";
import { gfx, sprites } from "./graphics.js";
import { input } from "./input.js";
import { camera } from "./camera.js";
import { Animation } from "./animation.js";

const MAX_FALL_SPEED = 128;
const CLIMB_SPEED = 24;

const COLLISION_LAYER = 1;
const STAIRS_RIGHT = 50;
const STAIRS_LEFT = 51;
const LADDER = 52;

const states = {
    PLATFORMING: 0,
    TILE_PLACING: 1
};

export class Player extends GameObject {
    constructor(game) {
        super();

        this.state = states.PLATFORMING;

        this.inventory = [null];
        this.active_inventory_slot = null;
        this.held_tile = null;
        this.held_tile_collision = null;

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

        this.x = this.map.properties.player_start_x * this.map.tile_width;
        this.y = this.map.properties.player_start_y * this.map.tile_height;

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
                if(this.held_tile === null) {
                    // Try pick up tile
                    let first_open_inventory_slot = 0;
                    for(let i=0; i<this.inventory.length; ++i) {
                        if(this.inventory[i] !== null) {
                            ++first_open_inventory_slot;
                        }
                    }

                    if(first_open_inventory_slot < this.inventory.length) {
                        this.inventory[first_open_inventory_slot] = [
                            this.map.layers[0].tiles[tile_index],
                            this.map.layers[COLLISION_LAYER].tiles[tile_index]
                        ];

                        this.map.layers[0].tiles[tile_index] = 0;
                        this.map.layers[COLLISION_LAYER].tiles[tile_index] = 0;
                    }
                }
                else {
                    this.map.layers[0].tiles[tile_index] = this.held_tile;
                    this.map.layers[COLLISION_LAYER].tiles[tile_index] = this.held_tile_collision;

                    this.held_tile = null;
                    this.held_tile_collision = null;
                    this.inventory[this.active_inventory_slot] = null;
                    this.active_inventory_slot = null;
                }
            }

            if(this.held_tile === null) {
                gfx.drawImage(sprites['misc'], 0, 16, 16, 16, mouse_x-8, mouse_y-8, 16, 16);
            }
            else {
                gfx.globalAlpha = 0.5;
                this.map.tileset.drawTile(this.held_tile,
                                          tile_x*this.map.tile_width, tile_y*this.map.tile_height);
                gfx.globalAlpha = 1.0;
            }

            // Do ipad animations

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

    updateHUD() {
        let hud_x = gfx.width/2 - (this.inventory.length+1) * 18 / 2;
        const hud_y = gfx.height - 20;
        gfx.drawImage(sprites['FlisesettGGJ2020'], 32, 32, 16, 16, hud_x, hud_y, 16, 16);

        for(var i=0; i<this.inventory.length; ++i) {
            hud_x += 18;

            if(input.isKeyJustPressed('mouse')) {
                if(input.mouse_x > hud_x && input.mouse_x <= hud_x+16 &&
                   input.mouse_y > hud_y && input.mouse_y <= hud_y+16)
                {
                    if(this.inventory[i] === null) {
                        this.held_tile = null;
                        this.held_tile_collision = null;
                        this.active_inventory_slot = null;
                    }
                    else {
                        this.held_tile = this.inventory[i][0];
                        this.held_tile_collision = this.inventory[i][1];
                        this.active_inventory_slot = i;
                    }
                }
            }

            gfx.drawImage(sprites['misc'], 0, 0, 16, 16, hud_x, hud_y, 16, 16);

            if(this.inventory[i] !== null) {
                let src_x = 0;
                switch(this.inventory[i][0]) {
                    case 23: // Ladder
                        src_x = 48;
                        break;
                    case 24: // stairs right
                        src_x = 32;
                        break;
                    case 39: // stairs left
                        src_x = 32;
                        break;
                    case 25: // Bridge
                    case 26:
                        src_x = 16;
                        break;
                    default: break;
                }

                gfx.drawImage(sprites['misc'],
                              src_x, 0, 16, 16,
                              hud_x, hud_y, 16, 16);

                if(this.active_inventory_slot === i) {
                    gfx.drawImage(sprites['misc'],
                                  0, 16, 16, 16,
                                  hud_x, hud_y, 16, 16);
                }
            }
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

