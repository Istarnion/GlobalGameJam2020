import { Room, Arena } from "./game.js";
import { TiledMap } from "./tiled_map.js";
import { Player } from "./player.js";
import { gfx, sprites } from "./graphics.js";
import { camera } from "./camera.js";
import { input } from "./input.js";

export class GameRoom extends Room {
    constructor() {
        super();
        this.map = new TiledMap("dungeon");
        this.arena = new Arena();

        this.player = new Player(this);
        this.arena.add(this.player);

        this.tut1_x = (this.map.properties.player_start_x-1)*16;
        this.tut1_y = (this.map.properties.player_start_y-2)*16;

        this.tut2_x = this.tut1_x+12*16;
        this.tut2_y = this.tut1_y-4*16;
    }

    update(dt) {
        gfx.save();
        gfx.translate(-camera.x, -camera.y);

        const left = Math.floor(camera.x / this.map.tile_width);
        const right = Math.floor(camera.y / this.map.tile_height);
        const across = gfx.width / this.map.tile_width + 1;
        const down = gfx.height / this.map.tile_height + 1;
        this.map.drawLayer(0, left, right, across, down);

        gfx.drawImage(sprites['tutorial1'], this.tut1_x, this.tut1_y);
        gfx.drawImage(sprites['tutorial2'], this.tut2_x, this.tut2_y);

        this.arena.update(dt);

        gfx.restore();
        this.player.updateHUD();
    }
}

