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

        // TODO: Get x and y from map
        this.x = gfx.width/2;
        this.y = gfx.height/2;
    }

    update() {
        let movement_x = 0;
        if(input.isKeyDown('a') || input.isKeyDown('left')) {
            movement_x -= 1;
        }

        if(input.isKeyDown('d') || input.isKeyDown('right')) {
            movement_x += 1;
        }

        // Draw
        gfx.fillStyle = 'white';
        gfx.fillRect(this.x-this.width/2, this.y-this.height, this.width, this.height);
    }

    moveX() {

    }

    moveY() {
    }
}

