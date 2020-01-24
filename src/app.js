import { gfx, setGameSize, clear, loadImages } from "./graphics.js";
import { images, maps } from "./assets.js";
import { loadMapDefs, TiledMap } from "./tiled_map.js";
import { input } from "./input.js";
import { musicManager } from "./musicManager";
import { Timer } from "./timer.js";

setGameSize(800, 600);

gfx.fillText("Loading...", gfx.width / 2, gfx.height / 2);

let prevTime = performance.now();
let testmap = null;
let circle = { radius: 64 };

export let gameState = "";

function init() {
    testmap = new TiledMap('gloomcastle');
    const starttime = performance.now();
    Timer.tween(3, circle, { radius: 128 }, 'inout', () => {
        console.log('tween complete: '+(performance.now()-starttime)/1000);
    });
}

function update() {
    clear();
    const now = performance.now();
    const deltaTime = (now - prevTime) / 1000.0;
    prevTime = now;

    input.update();
    musicManager.update(deltaTime);

    testmap.draw();

    switch(gameState) {
        default: break;
    }

    Timer.update(deltaTime);

    gfx.fillStyle = 'white';
    gfx.beginPath();
    gfx.arc(circle.radius*4, circle.radius*3, circle.radius, 0, 2*Math.PI);
    gfx.fill();
    gfx.fillText(`radius: ${circle.radius}`, 32, 32);

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

