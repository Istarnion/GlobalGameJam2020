import { Room, Arena } from "./game.js";
import { Player } from "./player.js";

const STATE_PLATFORMING = 0;
const STATE_TILE_PLACING = 1;

export class GameRoom extends Room {

    constructor() {
        super();
        this.state = STATE_PLATFORMING;
        this.map = null;
        this.arena = new Arena();

        this.arena.add(new Player(this));
    }

    update(dt) {
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
    }

    updateTilePlacing(dt) {
        // TODO(ole): PLZ
    }
}

