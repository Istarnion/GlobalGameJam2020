import { GameObject } from "./game.js";
import { gfx } from "./graphics.js";

export class BlockFadeEffect extends GameObject {
    constructor(x, y) {
        super();
        this.x = x * 16 + 8;
        this.y = y * 16 + 8;

        this.size = 8;
    }

    update(dt) {
        gfx.fillStyle = 'white';

        gfx.fillRect(this.x-this.size, this.y-this.size, this.size*2, this.size*2);

        this.size -= dt * 16;
        if(this.size < 0) {
            this.die();
        }
    }
}
