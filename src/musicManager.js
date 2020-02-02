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
            yoink: new Howl({ src: ['res/sounds/Yoink.wav'], volume: 0.1 }),
            place: new Howl({ src: ['res/sounds/Place.wav'], volume: 0.5 }),
            backpack: new Howl({ src: ['res/sounds/Backpack.wav'], volume: 0.5 }),
            pickup: new Howl({ src: ['res/sounds/Pickup.wav'], volume: 0.5 }),
            strawberry: new Howl({ src: ['res/sounds/Strawberry.wav'], volume: 0.5 }),
            full: new Howl({ src: ['res/sounds/FullInventory.wav'], volume: 0.5 }),
            open: new Howl({ src: ['res/sounds/OpenTablet.wav'], volume: 0.5 }),
            close: new Howl({ src: ['res/sounds/CloseTablet.wav'], volume: 0.5 }),
            button: new Howl({ src: ['res/sounds/Button.wav'], volume: 0.5 })
        };

        this.footsteps = new Howl({
            src: ['res/sounds/footsteps.wav'],
            loop: true,
            volume: 0.1
        });

        this.footsteps_playing = false;
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

    playFootsteps(should_play) {
        if(this.footsteps_playing && !should_play) {
            this.footsteps_playing = false;
            this.footsteps.stop();
        }
        else if(!this.footsteps_playing && should_play) {
            this.footsteps_playing = true;
            this.footsteps.play();
        }
    }

    update(deltaTime) {
    }
}

export const musicManager = new MusicManager();

