import { Howl } from 'howler';

class MusicManager {
    constructor() {
        this.music = {}
        this.music.startDrone = new Howl({
                src: ['res/sounds/Menu_Loop.mp3'],
                loop: true,
                onload: () => {
                    this.music.startDrone.play();
                }
        });
    }

    update(deltaTime) {
    }
}

export const musicManager = new MusicManager();

