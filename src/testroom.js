import { Room } from "./game.js";
import { TiledMap } from "./tiled_map.js";

export class TestRoom extends Room {
    constructor() {
        super();
        this.map = null;
    }

    init() {
        console.log("Room init");
        this.map = new TiledMap('gloomcastle');
    }

    finalize() {
        console.log("Room finalize");
    }

    update(dt) {
        this.map.draw();
    }

    pause() {
        console.log("Room pause");
    }

    resume() {
        console.log("Room resume");
    }
}

