import { Room, Arena } from "./game.js";
import { TiledMap } from "./tiled_map.js";
import { Player } from "./player.js";
import { gfx } from "./graphics.js";
import { camera } from "./camera.js";

const STATE_PLATFORMING = 0;
const STATE_TILE_PLACING = 1;

export class GameRoom extends Room {

    constructor() {
        super();
        this.state = STATE_PLATFORMING;
        this.map = new TiledMap("testmap");
        this.arena = new Arena();

        this.arena.add(new Player(this));
    }

    update(dt) {
        gfx.save();
        gfx.translate(-camera.x, -camera.y);

        this.map.draw();

        switch(this.state) {
            case STATE_PLATFORMING:
                // Do nothing special, I think
                break;
            case STATE_TILE_PLACING:
                updateTilePlacing(dt);
                break;
            default:
                console.err(`GameRoom is in an invalid state ${this.state}`);
                break;
        }

        this.arena.update(dt);

        gfx.restore();
    }

    updateTilePlacing(dt) {
        // TODO(ole): PLZ
    }
}

