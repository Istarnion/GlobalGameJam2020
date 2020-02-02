import { Room, roomStack } from "./game.js";
import { gfx, sprites } from "./graphics.js";
import { input } from "./input.js";
import { GameRoom } from "./game_room.js";

export class CreditsRoom extends Room {
    constructor() {
        super();

        const button_left = gfx.width/2 - 32/2;
        this.buttons = [
            {
                x: button_left,
                y: gfx.height - 48,
                image: sprites['buttons'],
                normal_x: 96,
                normal_y: 0,
                hover_x: 128,
                hover_y: 0,
                click_x: 160,
                click_y: 0,
                onclick: function() {
                    roomStack.pop();
                }
            }
        ];
    }

    update(dt) {
        const mouse_x = input.mouse_x;
        const mouse_y = input.mouse_y;

        gfx.drawImage(sprites['menubg'], 0, 0);
        gfx.drawImage(sprites['credits'], 0, 0);

        for(const button of this.buttons) {
            let src_x = button.normal_x;
            let src_y = button.normal_y;

            if(mouse_x >= button.x && mouse_x < button.x+32 &&
               mouse_y >= button.y && mouse_y < button.y+32) {
                if(input.isKeyDown('mouse')) {
                    // Pressed
                    src_x = button.click_x;
                    src_y = button.click_y;
                }
                else if(input.isKeyJustReleased('mouse')) {
                    button.onclick();
                }
                else {
                    // Hover
                    src_x = button.hover_x;
                    src_y = button.hover_y;
                }
            }

            gfx.drawImage(button.image, src_x, src_y, 32, 16, button.x, button.y, 32, 16);
        }
    }
}

