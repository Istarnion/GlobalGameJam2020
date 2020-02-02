import { GameObject } from "./game.js";
import { gfx, sprites } from "./graphics.js";
import { input } from "./input.js";
import { camera } from "./camera.js";
import { Animation } from "./animation.js";
import { items } from "./inventory_item.js";
import { BlockFadeEffect } from "./block_fade_effect.js";
import { PickupEffect } from "./pickup_effect.js";
import { roomStack } from "./game.js";
import { VictoryRoom } from "./victory.js";
import { musicManager } from "./musicManager.js";

const MAX_FALL_SPEED = 128;
const WALK_SPEED = 52
const CLIMB_SPEED = 52;

const TILE_LAYER = 0;
const COLLISION_LAYER = 1;
const PICKUP_LAYER = 2;

const STAIRS_RIGHT = 66;
const STAIRS_LEFT = 67;
const LADDER = 68;
const BACKPACK = 19;

const PICKUPABLES = {
    backpack: 19,
    muffin: 31,
    eye: 42,
    die: 48,
    wine: 53,
    cup: 57,
    strawberry: 61
};

const states = {
    PLATFORMING: 0,
    TILE_PLACING: 1
};

export class Player extends GameObject {
    constructor(game) {
        super();

        this.state = states.PLATFORMING;

        this.pickedup_pickups = [];
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

        this.sparkle_anim = new Animation('sparkle');
        this.pickup_sparkle_anim = new Animation('pickup_sparkle');

        this.curr_anim = this.idle_anim;
        this.can_open_ipad = true;
        this.grounded = true;

        this.game = game;
        this.map = game.map;

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

            musicManager.playFootsteps(Math.abs(movement_x) > 0);

            if(Math.abs(movement_x) > 0) {
                this.moveX(movement_x * WALK_SPEED * dt);
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

            this.can_open_ipad = true;

            if(this.collidesAt(this.x, this.y+1)) {
                this.fall_speed = 0;
                this.grounded = true;
            }
            else {
                this.can_open_ipad = false;
                this.fall_speed += 4;
                if(this.fall_speed > MAX_FALL_SPEED) {
                    this.fall_speed = MAX_FALL_SPEED;
                }

                this.curr_anim = this.falling_anim;
                this.grounded = false;
            }

            const foottile = this.tileAt(this.x, this.y);
            if(foottile === STAIRS_LEFT || foottile === STAIRS_RIGHT) {
                this.can_open_ipad = true;
                const base_y = Math.floor(this.y / this.map.tile_height) * this.map.tile_height;

                if(foottile === STAIRS_LEFT) {
                    const t = ((this.x-this.width/2) % this.map.tile_width) / this.map.tile_width;
                    this.y = Math.floor(base_y + this.map.tile_height * t)-2;
                }
                else {
                    const t = ((this.x+this.width/2) % this.map.tile_width) / this.map.tile_width;
                    this.y = Math.floor(base_y + (this.map.tile_height-1) * (1-t))-2;
                }
                this.grounded = true;
            }
            else if(foottile === LADDER) {
                this.can_open_ipad = false;
                this.fall_speed = 0;

                if(input.isKeyDown('up', 'w')) {
                    this.fall_speed = -CLIMB_SPEED;
                }

                if(input.isKeyDown('down', 's')) {
                    this.fall_speed = CLIMB_SPEED;
                }

                this.curr_anim = this.climbing_anim;
            }

            const centertile_index = Math.floor(this.x/this.map.tile_width) + Math.floor(this.y/this.map.tile_height) * this.map.width;
            const centertile = this.map.layers[TILE_LAYER].tiles[centertile_index];
            for(const pickupable in PICKUPABLES) {
                const tile = PICKUPABLES[pickupable];
                if(centertile === tile) {
                    if(pickupable === 'backpack') {
                        // Pickup backpack
                        musicManager.playSFX('backpack');
                        this.inventory.push(null);
                    }
                    else if(pickupable === 'strawberry') {
                        // WIN
                        musicManager.playSFX('strawberry');
                        roomStack.push(new VictoryRoom(this.pickedup_pickups, this.map));
                    }
                    else {
                        musicManager.playSFX('pickup');
                        this.pickedup_pickups.push(pickupable);
                    }

                    this.map.layers[0].tiles[centertile_index] = 0;
                    this.game.arena.add(new PickupEffect(this.x, this.y));
                }
            }

            this.moveY(this.fall_speed * dt);

            camera.target(this.x, this.y);

            if(this.can_open_ipad && input.isKeyJustPressed('e')) {
                musicManager.playSFX('open');
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
                    const can_pickup = pickup_layer_tile !== 0 && pickup_layer_tile !== 65;

                    let first_open_inventory_slot = 0;
                    for(let i=0; i<this.inventory.length && can_pickup; ++i) {
                        if(this.inventory[i] !== null) {
                            ++first_open_inventory_slot;
                        }
                        else break;
                    }

                    if(can_pickup && first_open_inventory_slot >= this.inventory.length) {
                        musicManager.playSFX('full');
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

                        // REMOVE ITEM
                        const tile_indices_to_remove = [tile_index];
                        const tile_index_deltas_to_check = [];
                        for(let y=0; y<item.height; ++y) {
                            for(let x=0; x<item.width; ++x) {
                                tile_index_deltas_to_check.push( x+y*this.map.width);
                                tile_index_deltas_to_check.push(-x+y*this.map.width);
                                tile_index_deltas_to_check.push( x-y*this.map.width);
                                tile_index_deltas_to_check.push(-x-y*this.map.width);
                            }
                        }

                        for(const td of tile_index_deltas_to_check) {
                            if(this.map.layers[PICKUP_LAYER].tiles[tile_index+td] === pickup_layer_tile) {
                                tile_indices_to_remove.push(tile_index + td);
                            }
                        }

                        for(const i of tile_indices_to_remove) {
                            this.map.layers[TILE_LAYER].tiles[i] = 0;
                            this.map.layers[COLLISION_LAYER].tiles[i] = 0;
                            this.map.layers[PICKUP_LAYER].tiles[i] = 65;

                            musicManager.playSFX('yoink');
                            this.game.arena.add(new BlockFadeEffect(i%this.map.width,
                                                                    Math.floor(i/this.map.width)));
                        }
                    }
                }
                else {
                    // PLACE ITEM
                    const leftmost = this.map.clampX(mouse_x - Math.floor(this.held_item.width/2) *
                                                     this.map.tile_width) / this.map.tile_width;
                    const topmost = this.map.clampY(mouse_y - Math.floor(this.held_item.height/2) *
                                                    this.map.tile_height) / this.map.tile_height;

                    // CHECK IF CAN PLACE
                    let can_place = true;
                    for(let y=0; y<this.held_item.height&&can_place; ++y) {
                        for(let x=0; x<this.held_item.width&&can_place; ++x) {
                            const i = (leftmost+x) + (topmost+y) * this.map.width

                            if(this.map.layers[PICKUP_LAYER].tiles[i] !== 65) {
                                can_place = false;
                            }
                        }
                    }

                    if(can_place) {
                        musicManager.playSFX('place');
                        for(let y=0; y<this.held_item.height; ++y) {
                            for(let x=0; x<this.held_item.width; ++x) {
                                const local_index = x + y * this.held_item.width;
                                const i = (leftmost+x) + (topmost+y) * this.map.width

                                this.map.layers[TILE_LAYER].tiles[i] =
                                    this.held_item.tile_layer[local_index];

                                this.map.layers[COLLISION_LAYER].tiles[i] =
                                    this.held_item.collision_layer[local_index];

                                this.map.layers[PICKUP_LAYER].tiles[i] =
                                    this.held_item.pickup_tile;
                            }
                        }

                        this.held_item = null;
                        this.inventory[this.active_inventory_slot] = null;
                        this.active_inventory_slot = null;
                        musicManager.playSFX('close');
                        this.state = states.PLATFORMING;
                    }
                }
            }

            if(this.held_item === null) {
                gfx.drawImage(sprites['misc'], 0, 16, 16, 16, mouse_x-8, mouse_y-8, 16, 16);
            }
            else {
                gfx.globalAlpha = 0.5;
                // ITEM GHOST
                const leftmost = this.map.clampX(mouse_x - Math.floor(this.held_item.width/2) * this.map.tile_width);
                const topmost = this.map.clampY(mouse_y - Math.floor(this.held_item.height/2) * this.map.tile_height);
                for(let y=0; y<this.held_item.height; ++y) {
                    for(let x=0; x<this.held_item.width; ++x) {
                        this.map.tileset.drawTile(this.held_item.tile_layer[x+y*this.held_item.width],
                                                  leftmost+x*this.map.tile_width,
                                                  topmost+y*this.map.tile_height);
                    }
                }

                gfx.globalAlpha = 1.0;
            }

            // Do ipad animations enter and exit
            this.curr_anim = this.ipad_lookat_anim;

            if(input.isKeyJustPressed('e')) {
                musicManager.playSFX('close');
                this.state = states.PLATFORMING;
                this.active_inventory_slot = null;
                this.held_item = null;
            }

            const tiles_down = gfx.height / this.map.tile_height;
            const tiles_across = gfx.width / this.map.tile_width;

            const leftmost = Math.max(0, Math.floor((this.x-gfx.width)/this.map.tile_width)-1);
            const topmost = Math.max(0, Math.floor((this.y-gfx.height)/this.map.tile_height)-1);
            const rightmost = Math.min(this.map.width, leftmost+2*tiles_across);
            const bottommost = Math.min(this.map.height, topmost+2*tiles_down);

            this.sparkle_anim.update(dt);
            for(let y=topmost; y<bottommost; ++y) {
                for(let x=leftmost; x<rightmost; ++x) {
                    const index = x + y * this.map.width;
                    if(this.map.layers[PICKUP_LAYER].tiles[index] !== 0) {
                        this.sparkle_anim.draw(x*this.map.tile_width,
                                               y*this.map.tile_height);
                    }
                }
            }
        }

        // Draw
        if(!this.grounded) {
            this.curr_anim = this.falling_anim;
        }

        this.curr_anim.update(dt);
        this.curr_anim.draw(this.x, this.y);

        if(input.isKeyDown('q')) {
            gfx.fillStyle = 'rgba(255, 0, 255, 0.5)';
            gfx.fillRect(this.x-this.width/2, this.y-this.height, this.width, this.height);
        }
    }

    updateHUD() {
        let scroll_x = gfx.width/2 - (this.inventory.length+1) * 24 / 2;
        let hud_x = gfx.width/2 - (this.inventory.length+1) * 18 / 2;
        const hud_y = gfx.height - 20;

        // Scroll left edge
        gfx.drawImage(sprites['scroll'], 0, 0, 24, 24, scroll_x-24, hud_y-4, 24, 24);
        gfx.drawImage(sprites['scroll'], 24, 0, 24, 24, scroll_x, hud_y-4, 24, 24);

        const backpack_x = hud_x;

        for(var i=0; i<this.inventory.length; ++i) {
            scroll_x += 24;
            gfx.drawImage(sprites['scroll'], 24, 0, 24, 24, scroll_x, hud_y-4, 24, 24);
        }

        for(var i=0; i<this.inventory.length; ++i) {
            hud_x += 18;

            if(this.state === states.TILE_PLACING && input.isKeyJustPressed('mouse')) {
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
            gfx.fillStyle = 'red';
            gfx.font = '8px Arial';
            gfx.fillText((i+1).toString(), hud_x+5, hud_y+17);

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

        this.map.tileset.drawTile(19, backpack_x, hud_y);

        // Scroll right edge
        gfx.drawImage(sprites['scroll'], 48, 0, 24, 24, scroll_x + 24, hud_y-4, 24, 24);

        // Keyboard shortcuts for inventory
        if(this.can_open_ipad) {
            if(input.isKeyJustPressed('one')) {
                if(this.inventory[0] !== null) {
                    this.held_item = this.inventory[0];
                    this.active_inventory_slot = 0;
                    if(this.state !== states.TILE_PLACING) musicManager.playSFX('open');
                    this.state = states.TILE_PLACING;
                }
                else {
                    this.active_inventory_slot = null;
                    this.held_item = null;
                }
            }

            if(input.isKeyJustPressed('two') && this.inventory.length >= 2) {
                if(this.inventory[1] !== null) {
                    this.held_item = this.inventory[1];
                    this.active_inventory_slot = 1;
                    if(this.state !== states.TILE_PLACING) musicManager.playSFX('open');
                    this.state = states.TILE_PLACING;
                }
                else {
                    this.active_inventory_slot = null;
                    this.held_item = null;
                }
            }

            if(input.isKeyJustPressed('three') && this.inventory.length >= 3) {
                if(this.inventory[2] !== null) {
                    this.held_item = this.inventory[2];
                    this.active_inventory_slot = 2;
                    if(this.state !== states.TILE_PLACING) musicManager.playSFX('open');
                    this.state = states.TILE_PLACING;
                }
                else {
                    this.active_inventory_slot = null;
                    this.held_item = null;
                }
            }

            if(input.isKeyJustPressed('four') && this.inventory.length >= 4) {
                if(this.inventory[3] !== null) {
                    this.held_item = this.inventory[3];
                    this.active_inventory_slot = 3;
                    if(this.state !== states.TILE_PLACING) musicManager.playSFX('open');
                    this.state = states.TILE_PLACING;
                }
                else {
                    this.active_inventory_slot = null;
                    this.held_item = null;
                }
            }

            if(input.isKeyJustPressed('five') && this.inventory.length >= 5) {
                if(this.inventory[4] !== null) {
                    this.held_item = this.inventory[4];
                    this.active_inventory_slot = 4;
                    if(this.state !== states.TILE_PLACING) musicManager.playSFX('open');
                    this.state = states.TILE_PLACING;
                }
                else {
                    this.active_inventory_slot = null;
                    this.held_item = null;
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

