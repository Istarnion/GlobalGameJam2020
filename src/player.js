import { GameObject } from "./game.js";
import { gfx } from "./graphics.js";
import { input } from "./input.js";

export class Player extends GameObject {
    constructor(game) {
        super();
        this.width = 12;
        this.height = 24;

        this.game = game;
        this.map = game.map;

        this.speed = 48;

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

        // TODO: Gravity

        // Draw
        gfx.fillStyle = 'white';
        gfx.fillRect(this.x-this.width/2, this.y-this.height, this.width, this.height);
    }

    moveX(amount) {
        this.remainder_x += amount;
        let move = Math.round(this.remainder_x);

        if(move != 0) {
            this.remainder_x -= move;
            const sign = Math.sign(move);

            while(move != 0) {
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

        if(move != 0) {
            this.remainder_y -= move;
            const sign = Math.sign(move);

            while(move != 0) {
                if(!collidesAt(this.x, this.y + sign)) {
                    this.y += sign;
                    move -= sign;
                }
                else break;
            }
        }
    }

    collidesAt(x, y) {
        return false;
        // TODO: Handle collision with map
    }
}

