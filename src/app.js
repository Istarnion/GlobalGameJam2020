import { gfx, setGameSize, clear, loadImages } from "./graphics.js";
import { images } from "./assets.js";
import { input } from "./input.js";
import { musicManager } from "./musicManager";

setGameSize(800, 600);

gfx.fillText("Loading...", gfx.width / 2, gfx.height / 2);

let prevTime = performance.now();

export let gameState = "";

const init = () => {
}

const update = () => {
    clear();
    const now = performance.now();
    const deltaTime = (now - prevTime) / 1000.0;
    prevTime = now;

    input.update();
    musicManager.update(deltaTime);

    switch(gameState) {
        default: break;
    }

    window.requestAnimationFrame(update);
    input.lateUpdate();
}

const imagesToLoad = [];
for(const img in images) {
    if(images.hasOwnProperty(img)) {
        imagesToLoad.push([ img, images[img] ]);
    }
}

loadImages(imagesToLoad).then(() => {
    init();
    update(); // This starts the update loop
});

