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

        this.sfx = {
            yoink: new Howl({ src: ['res/sounds/Yoink.wav'] }),
            place: new Howl({ src: ['res/sounds/Place.wav'] }),
            backpack: new Howl({ src: ['res/sounds/Backpack.wav'] }),
            pickup: new Howl({ src: ['res/sounds/Pickup.wav'] }),
            strawberry: new Howl({ src: ['res/sounds/Strawberry.wav'] }),
            full: new Howl({ src: ['res/sounds/FullInventory.wav'] }),
            open: new Howl({ src: ['res/sounds/OpenTablet.wav'] }),
            close: new Howl({ src: ['res/sounds/CloseTablet.wav'] }),
            button: new Howl({ src: ['res/sounds/Button.wav'] })
        };
    }

    setMenuState() {
        this.music.creditsLoop.stop();
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

    playSFX(sound) {
        this.sfx[sound].play();
    }

    update(deltaTime) {
    }
}

export const musicManager = new MusicManager();

