import { assets } from "./assets.js";
import { gfx, sprites } from "./graphics.js";
import { tileToPixel } from "./utils.js";

const cursor = {
    targetX: 0,
    targetY: 0,
    offsetX: 0,
    offsetY: 0,

    speed: 2048,
    bounceSpeed: 6,
    theta: 0,

    sprite: sprites["cursor"]
};

const drawRotatedImage = (colorOrImage, x, y, w, h, theta = 0) => {
    gfx.save();

    gfx.translate(x+w/2, y+h/2);
    gfx.rotate(theta);

    if(typeof colorOrImage === "string") {
        gfx.fillStyle = colorOrImage;
        gfx.fillRect(w/-2, h/-2, w, h);
    }
    else {
        gfx.drawImage(colorOrImage, w/-2, h/-2, w, h);
    }

    gfx.restore();
};

const drawSprite = (colorOrImage, x, y, offsetX = 0, offsetY = 0, dir = Directions.up) => {
    let theta = 0;
    switch(dir) {
        case Directions.up: break;
        case Directions.right:
            theta = Math.PI / 2;
            break;
        case Directions.down:
            theta = Math.PI;
            break;
        case Directions.left:
            theta = Math.PI / -2;
            break;
    }

    const pixelCoord = tileToPixel(x, y);

    drawRotatedImage(
        colorOrImage,
        pixelCoord.x+16+offsetX, pixelCoord.y+16+offsetY,
        32, 32,
        theta);
}

