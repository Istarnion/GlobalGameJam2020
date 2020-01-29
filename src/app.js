import { gfx, setGameSize, clear, loadImages } from "./graphics.js";
import { images, maps } from "./assets.js";
import { loadMapDefs } from "./tiled_map.js";
import { input } from "./input.js";
import { musicManager } from "./musicManager";
import { Timer } from "./timer.js";
import { roomStack } from "./game.js";

import { TestRoom } from "./testroom.js";

setGameSize(800, 600);

gfx.fillText("Loading...", gfx.width / 2, gfx.height / 2);

let prevTime = performance.now();

function init() {
    roomStack.push(new TestRoom());
}

function update() {
    clear();
    const now = performance.now();
    const deltaTime = (now - prevTime) / 1000.0;
    prevTime = now;

    input.update();
    musicManager.update(deltaTime);

    roomStack.update(deltaTime);

    Timer.update(deltaTime);

    window.requestAnimationFrame(update);
    input.lateUpdate();
}

const imagesToLoad = [];
for(const img in images) {
    if(images.hasOwnProperty(img)) {
        imagesToLoad.push([ img, images[img] ]);
    }
}

Promise.all([loadMapDefs(maps), loadImages(imagesToLoad)]).then(() => {
    init();
    update(); // This starts the update loop
});

