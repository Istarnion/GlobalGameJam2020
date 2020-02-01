import { gfx, setGameSize, clear, loadImages } from "./graphics.js";
import { images, maps } from "./assets.js";
import { loadMapDefs } from "./tiled_map.js";
import { input } from "./input.js";
import { musicManager } from "./musicManager";
import { Timer } from "./timer.js";
import { roomStack } from "./game.js";

import { GameRoom } from "./game_room.js";

setGameSize(320, 240);

gfx.fillText("Loading...", gfx.width / 2, gfx.height / 2);

let prevTime = performance.now();

// THis is run once all assets are loaded. Called from the bottom of this file
function init() {
    roomStack.push(new GameRoom());
}

// Called every frame, starting straight after init() is run.
function update() {
    clear();
    const now = performance.now();
    const deltaTime = Math.min(0.0333, (now - prevTime) / 1000.0);
    prevTime = now;

    input.update();
    musicManager.update(deltaTime);

    roomStack.update(deltaTime);

    Timer.update(deltaTime);

    window.requestAnimationFrame(update);
    input.lateUpdate();
}

// Create list of images to load in proper format
const imagesToLoad = [];
for(const img in images) {
    if(images.hasOwnProperty(img)) {
        imagesToLoad.push([ img, images[img] ]);
    }
}

// Start loading all assets, call init() when done, then start the game loop
Promise.all([loadMapDefs(maps), loadImages(imagesToLoad)]).then(() => {
    init();
    update(); // This starts the update loop
});

