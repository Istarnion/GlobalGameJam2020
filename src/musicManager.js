import {Howl, Howler } from "./howler.min.js";

class MusicManager {
    constructor() {
        // EXAMPLE:
        /*
        this.music.startDrone = new Howl({
                src: ['res/sounds/BassDrone_Start.mp3'],
                onend: () => {
                    this.music.loopDrone.play();
                }
        });
        */
    }

    update(deltaTime) {
    }
}

export const musicManager = new MusicManager();

