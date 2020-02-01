import { GameObject } from "./game.js";
import { gfx } from "./graphics.js";
import { Animation } from "./animation.js";

export class PickupEffect extends GameObject {
    constructor(x, y) {
        super();
        this.x = x-8;
        this.y = y-8;

        this.animation = new Animation('pickup_sparkle');
        this.animation.addCycleListener(() => {
            this.die();
        });
    }

    update(dt) {
        this.animation.update(dt);
        this.animation.draw(this.x, this.y);
    }
}
