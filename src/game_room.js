import { Room, Arena } from "./game.js";
import { TiledMap } from "./tiled_map.js";
import { Player } from "./player.js";
import { gfx } from "./graphics.js";
import { camera } from "./camera.js";
import { input } from "./input.js";

export const states = {
    PLATFORMING: 0,
    TILE_PLACING: 1
};

export class GameRoom extends Room {

    constructor() {
        super();
        this.state = states.PLATFORMING;
        this.map = new TiledMap("testmap");
        this.arena = new Arena();

        this.arena.add(new Player(this));
    }

    update(dt) {
        gfx.save();
        gfx.translate(-camera.x, -camera.y);

        this.map.draw();

        switch(this.state) {
            case states.PLATFORMING:
                // Do nothing special, I think
                break;
            case states.TILE_PLACING:
                this.updateTilePlacing(dt);
                break;
            default:
                console.err(`GameRoom is in an invalid state ${this.state}`);
                break;
        }

        this.arena.update(dt);

        gfx.restore();
    }

    updateTilePlacing(dt) {
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
    }
}

