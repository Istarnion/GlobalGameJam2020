export const images = {
    character: "res/Character.png",
    FlisesettGGJ2020: "res/FlisesettGGJ2020.png",
    misc: "res/SparkleInventoryAndStuff.png",
    scroll: "res/InventoryScroll.png",
    menubg: "res/MenuScreen_WIP.png",
    buttons: "res/Buttons.png",
    credits: "res/Credits.png",
    victory: "res/Victory.png",
    tutorial1: "res/tutorial1.png",
    tutorial2: "res/tutorial2.png"
};

export const animations = {
    player_idle: {
        image: "character",
        timePerFrame: 0.1,
        looping: 'loop',
        frames: [
            { x:  0, y: 0, w: 16, h: 16 },
            { x: 16, y: 0, w: 16, h: 16 },
            { x: 32, y: 0, w: 16, h: 16 },
            { x: 48, y: 0, w: 16, h: 16 }
        ]
    },
    player_walk_right: {
        image: "character",
        timePerFrame: 0.1,
        looping: 'loop',
        frames: [
            { x:  0, y: 16, w: 16, h: 16 },
            { x: 16, y: 16, w: 16, h: 16 },
            { x: 32, y: 16, w: 16, h: 16 },
            { x: 48, y: 16, w: 16, h: 16 }
        ]
    },
    player_walk_left: {
        image: "character",
        timePerFrame: 0.1,
        looping: 'loop',
        frames: [
            { x:  0, y: 32, w: 16, h: 16 },
            { x: 16, y: 32, w: 16, h: 16 },
            { x: 32, y: 32, w: 16, h: 16 },
            { x: 48, y: 32, w: 16, h: 16 }
        ]
    },
    player_ipad_open: {
        image: "character",
        timePerFrame: 0.1,
        looping: 'once',
        frames: [
        ]
    },
    player_ipad_look: {
        image: "character",
        timePerFrame: 0.05,
        looping: 'loop',
        frames: [
            { x:   0, y: 64, w: 16, h: 16 },
            { x:  16, y: 64, w: 16, h: 16 },
            { x:  32, y: 64, w: 16, h: 16 },
            { x:  48, y: 64, w: 16, h: 16 },
            { x:  64, y: 64, w: 16, h: 16 },
            { x:  80, y: 64, w: 16, h: 16 },
            { x:  96, y: 64, w: 16, h: 16 },
            { x: 112, y: 64, w: 16, h: 16 },
        ]
    },
    player_ipad_close: {
        image: "character",
        timePerFrame: 0.1,
        looping: 'once',
        frames: [
        ]
    },
    player_climbing: {
        image: "character",
        timePerFrame: 0.1,
        looping: 'loop',
        frames: [
            { x:  0, y: 80, w: 16, h: 16 },
            { x: 16, y: 80, w: 16, h: 16 },
            { x: 32, y: 80, w: 16, h: 16 },
            { x: 48, y: 80, w: 16, h: 16 },
            { x: 64, y: 80, w: 16, h: 16 },
            { x: 80, y: 80, w: 16, h: 16 }
        ]
    },
    player_falling: {
        image: "character",
        timePerFrame: 0.1,
        looping: 'loop',
        frames: [
            { x:  0, y: 96, w: 16, h: 16 },
            { x: 16, y: 96, w: 16, h: 16 },
        ]
    },
    player_sleep: {
        image: "character",
        timePerFrame: 0.1,
        looping: 'loop',
        frames: [
        ]
    },
    player_confused: {
        image: "character",
        timePerFrame: 0.1,
        looping: 'loop',
        frames: [
        ]
    },
    sparkle: {
        image: "misc",
        timePerFrame: 0.1,
        looping: 'loop',
        frames: [
            { x:  64, y: 0, w: 16, h: 16 },
            { x:  80, y: 0, w: 16, h: 16 },
            { x:  96, y: 0, w: 16, h: 16 },
            { x: 112, y: 0, w: 16, h: 16 },
        ]
    },
    pickup_sparkle: {
        image: "misc",
        timePerFrame: 0.1,
        looping: 'loop',
        frames: [
            { x:   32, y: 16, w: 16, h: 16 },
            { x:   48, y: 16, w: 16, h: 16 },
            { x:   64, y: 16, w: 16, h: 16 },
            { x:   80, y: 16, w: 16, h: 16 },
            { x:   96, y: 16, w: 16, h: 16 },
            { x:  112, y: 16, w: 16, h: 16 }
        ]
    }
};

export const maps = {
    dungeon: "res/DD_Map.json"
};

