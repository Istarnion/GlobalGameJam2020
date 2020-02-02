export const input = {
    mouse_x: 0,
    mouse_y: 0,
    keyDownListeners: [],
    specificKeyDownListeners: {},
    keyUpListeners: [],
    specificKeyUpListeners: {},

    // Arguments: Either a keyname and function, or just a function
    isKeyDown: function(key, altKey) { return !!this.keyStates[key][0] || (altKey && !!this.keyStates[altKey][0]);
    },

    isKeyJustPressed: function(key) {
        if(!this.keyStates[key]) return false;
        const result =
            this.keyStates[key][0] &&
            !this.keyStates[key][1];
        return result;
    },

    isKeyJustReleased: function(key) {
        const result =
            !this.keyStates[key][0] &&
            this.keyStates[key][1];
        return result;
    },

    addKeyDownListener: function() {
        if(typeof arguments[0] === "string") {
            // Listener for specific key
            if(this.specificKeyDownListeners.hasOwnProperty(arguments[0])) {
                this.specificKeyDownListeners[arguments[0]].push(arguments[1]);
            }
            else {
                this.specificKeyDownListeners[arguments[0]] = [arguments[1]];
            }
        }
        else {
            // Listener for any key
            this.keyDownListeners.push(arguments[0]);
        }
    },

    addKeyUpListener: function() {
        if(typeof arguments[0] === "string") {
            // Listener for specific key
            if(this.specificKeyUpListeners.hasOwnProperty(arguments[0])) {
                this.specificKeyUpListeners[arguments[0]].push(arguments[1]);
            }
            else {
                this.specificKeyUpListeners[arguments[0]] = [arguments[1]];
            }
        }
        else {
            // Listener for any key
            this.keyUpListeners.push(arguments[0]);
        }
    },

    removeKeyDownListener: function(f) {
        for(const key in this.specificKeyDownListeners) {
            if(this.specificKeyDownListeners.hasOwnProperty(key)) {
                if(removeFromArray(this.specificKeyDownListeners[key], f)) {
                    return;
                }
            }
        }

        removeFromArray(this.keyDownListeners, f);
    },

    removeKeyUpListener: function(f) {
        for(const key in this.specificKeyUpListeners) {
            if(this.specificKeyUpListeners.hasOwnProperty(key)) {
                if(removeFromArray(this.specificKeyUpListeners[key], f)) {
                    return;
                }
            }
        }

        removeFromArray(this.keyUpListeners, f);
    },

    update: function() {
        // Called by the main loop to broadcast events
        for(const key in this.keyStates) {
            if(this.keyStates.hasOwnProperty(key)) {
                const currState = !!this.keyStates[key][0];
                const prevState = !!this.keyStates[key][1];

                if(currState && !prevState) {
                    // console.log(`Key down: ${key}`);
                    if(this.specificKeyDownListeners.hasOwnProperty(key)) {
                        for(const listener of this.specificKeyDownListeners[key]) {
                            listener(key);
                        }
                    }

                    for(const listener of this.keyDownListeners) {
                        listener(key);
                    }
                }
                else if(!currState && prevState) {
                    if(this.specificKeyUpListeners.hasOwnProperty(key)) {
                        for(const listener of this.specificKeyUpListeners[key]) {
                            listener(key);
                        }
                    }

                    for(const listener of this.keyUpListeners) {
                        listener(key);
                    }
                }
            }
        }
    },

    lateUpdate: function() {
        for(const key in this.keyStates) {
            if(this.keyStates.hasOwnProperty(key)) {
                this.keyStates[key][1] = !!this.keyStates[key][0];
            }
        }
    },

    // NOTE(istarnion): Index 0 is current, 1 is previous
    // This allows us to see what has changed from frame to frame
    keyStates: {
        space: [false, false],
        enter: [false, false],
        w: [false, false],
        s: [false, false],
        a: [false, false],
        d: [false, false],
        up: [false, false],
        down: [false, false],
        left: [false, false],
        right: [false, false],
        q: [false, false],
        e: [false, false],
        one: [false, false],
        two: [false, false],
        three: [false, false],
        four: [false, false],
        five: [false, false],
        mouse: [false, false]
    }
};

const getKeyNameFromCode = (code) => {
    let key = false;
    switch(code) {
        case "Space": key = "space"; break;
        case "Enter": key = "enter"; break;
        case "ArrowUp": key = "up"; break;
        case "ArrowDown": key = "down"; break;
        case "ArrowLeft": key = "left"; break;
        case "ArrowRight": key = "right"; break;
        case "KeyW": key = "up"; break;
        case "KeyA": key = "left"; break;
        case "KeyS": key = "down"; break;
        case "KeyD": key = "right"; break;
        case "KeyQ": key = "q"; break;
        case "KeyE": key = "e"; break;
        case "Digit1": key = "one"; break;
        case "Digit2": key = "two"; break;
        case "Digit3": key = "three"; break;
        case "Digit4": key = "four"; break;
        case "Digit5": key = "five"; break;
        default: break;
    }

    return key;
};

window.addEventListener("keydown", (e) => {
    const key = getKeyNameFromCode(e.code);
    if(key) {
        input.keyStates[key][0] = true;
    }
});

window.addEventListener("keyup", (e) => {
    const key = getKeyNameFromCode(e.code);
    if(key) {
        input.keyStates[key][0] = false;
    }
});

const canvas = document.getElementById('game-canvas');
canvas.addEventListener("mousemove", (e) => {
    e.preventDefault();
    const scale = 320 / canvas.clientWidth;
    const client_rect = canvas.getClientRects()[0];
    input.mouse_x = (e.clientX - client_rect.x) * scale;
    input.mouse_y = (e.clientY - client_rect.y) * scale;
    return false;
});

canvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    input.mouse_down = true;
    input.keyStates['mouse'][0] = true;
    return false;
});

window.addEventListener("mouseup", (e) => {
    e.preventDefault();
    input.keyStates['mouse'][0] = false;
    return false;
});

