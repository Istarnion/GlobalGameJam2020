import { Howl } from 'howler';

class MusicManager {
    constructor() {
        this.music = {}

        this.music.menuLoop = new Howl({
            src: ['res/sounds/Menu_Loop.mp3'],
            loop: true,
        });

        this.music.gameLoop = new Howl({
            src: ['res/sounds/Game_Loop.mp3'],
            loop: true,
        });

        this.music.creditsLoop = new Howl({
            src: ['res/sounds/Credits_Loop.mp3'],
            loop: true,
        });

        this.setGameState();
    }

    setMenuState() {
        this.music.gameLoop.stop();
        this.music.menuLoop.play();
    }

    setGameState() {
        this.music.creditsLoop.stop();
        this.music.menuLoop.stop();
        this.music.gameLoop.play();
    }

    setCreditsState() {
        this.music.menuLoop.stop();
        this.music.gameLoop.stop();
        this.music.creditsLoop.play();
    }

    update(deltaTime) {
    }
}

export const musicManager = new MusicManager();

