import { Room, Arena } from "./game.js";
import { TiledMap } from "./tiled_map.js";
import { Player } from "./player.js";
import { gfx } from "./graphics.js";
import { camera } from "./camera.js";
import { input } from "./input.js";

export class GameRoom extends Room {
    constructor() {
        super();
        this.map = new TiledMap("testmap");
        this.arena = new Arena();

        this.arena.add(new Player(this));
    }

    update(dt) {
        gfx.save();
        gfx.translate(-camera.x, -camera.y);

        this.map.draw();

        this.arena.update(dt);

        gfx.restore();
    }
}

