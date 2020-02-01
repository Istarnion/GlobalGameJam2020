import { GameObject } from "./game.js";
import { gfx, sprites } from "./graphics.js";
import { input } from "./input.js";
import { camera } from "./camera.js";
import { Animation } from "./animation.js";
import { items } from "./inventory_item.js";

const MAX_FALL_SPEED = 128;
const CLIMB_SPEED = 24;

const TILE_LAYER = 0;
const COLLISION_LAYER = 1;
const PICKUP_LAYER = 2;

const STAIRS_RIGHT = 66;
const STAIRS_LEFT = 67;
const LADDER = 68;
const BACKPACK = 19;

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
        this.held_item = null;

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

        this.ipad_lookat_anim = new Animation('player_ipad_look');
        this.ipad_lookat_anim.anchor_x = 0.5;
        this.ipad_lookat_anim.anchor_y = 1.0;

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

            const centertile = this.tileAt(this.x, this.y - this.height/2);
            if(centertile === BACKPACK) {
                // Pickup backpack
                this.inventory.push(null);
                const tile_index = Math.floor(this.x/this.map.tile_width) + Math.floor(this.y/this.map.tile_height) * this.map.width;
                this.map.layers[0].tiles[tile_index] = 0;
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
                if(this.active_inventory_slot === null) {
                    // Try pick up tile
                    const pickup_layer_tile = this.map.layers[PICKUP_LAYER].tiles[tile_index];
                    const can_pickup = pickup_layer_tile !== 0 && pickup_layer_tile !== 49;

                    let first_open_inventory_slot = 0;
                    for(let i=0; i<this.inventory.length && can_pickup; ++i) {
                        if(this.inventory[i] !== null) {
                            ++first_open_inventory_slot;
                        }
                    }

                    if(can_pickup && first_open_inventory_slot < this.inventory.length) {
                        let item = null;
                        switch(pickup_layer_tile) {
                            case 24: // Stair right
                                item = items.stairs_right;
                                break;
                            case 39: // Stair left
                                item = items.stairs_left;
                                break;
                            case 23: // Ladder
                                item = items.ladder;
                                break;
                            case 25: // Bridge
                                item = items.bridge;
                                break;
                            default: break;
                        }

                        if(item === null) {
                            debugger;
                        }

                        this.inventory[first_open_inventory_slot] = item;

                        const tile_indices_to_remove = [tile_index];
                        const tile_index_deltas_to_check = [ -1, 1, -2, 2, -this.map.width, this.map.width ];
                        for(const td of tile_index_deltas_to_check) {
                            if(this.map.layers[PICKUP_LAYER].tiles[tile_index+td] === pickup_layer_tile) {
                                tile_indices_to_remove.push(tile_index + td);
                            }
                        }

                        for(const i of tile_indices_to_remove) {
                            this.map.layers[0].tiles[i] = 0;
                            this.map.layers[COLLISION_LAYER].tiles[i] = 0;
                            this.map.layers[PICKUP_LAYER].tiles[i] = 49;
                        }
                    }
                }
                else {
                    // TODO: Place item

                    this.held_item = null;
                    this.inventory[this.active_inventory_slot] = null;
                    this.active_inventory_slot = null;
                }
            }

            if(this.held_item === null) {
                gfx.drawImage(sprites['misc'], 0, 16, 16, 16, mouse_x-8, mouse_y-8, 16, 16);
            }
            else {
                gfx.globalAlpha = 0.5;
                // TODO: Draw item ghost
                for(let y=0; y<this.held_item.height; ++y) {
                    for(let x=0; x<this.held_item.width; ++x) {

                    }
                }
                this.map.tileset.drawTile(this.held_tile,
                                          tile_x*this.map.tile_width, tile_y*this.map.tile_height);
                gfx.globalAlpha = 1.0;
            }

            // Do ipad animations
            this.curr_anim = this.ipad_lookat_anim;

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
                        this.held_item = null;
                        this.active_inventory_slot = null;
                    }
                    else {
                        this.held_item = this.inventory[i];
                        this.active_inventory_slot = i;
                    }
                }
            }

            gfx.drawImage(sprites['misc'], 0, 0, 16, 16, hud_x, hud_y, 16, 16);

            if(this.inventory[i] !== null) {
                gfx.drawImage(sprites['misc'],
                              this.inventory[i].icon_x, this.inventory[i].icon_y,
                              16, 16,
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

