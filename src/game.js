/*
 * This system is inspired by the excellent BYTEPATH tutorials (https://github.com/adnzzzzZ/blog/issues/30)
 * There are three components:
 * - Rooms are what is called stages or scenes in other engines. They are the main game states
 * - Most rooms contains an Area, which is a container for game objects. for instance, in a Sokoban game,
 *   there could be one gameplay room that had one area per level, and another room for the main menu and
 *   credits screen.
 * - Areas are glorified lists of game objects and handles iterating through and updating them, as well as
 *   removing them when they die. If needed for a game, Area would be the place to implement query functions
 *   like getGameObjectsWithinCircle or simmilar.
 *
 * Typically, Room and GameObject are inherited from and never used directly, while Area objects are used
 * as-is in the classes derived from Room that need one.
 */

export class Room {
    init() {}
    update(dt) {}
    pause() {}
    resume() {}
}

export class Arena {
    constructor() {
        this.gameObjects = [];
    }

    update(dt) {
        for(var i=0; i<this.gameObjects.length; ++i) {
            this.gameObjects[i].update(dt);
        }

        for(var i=this.gameObjects.length-1; i>=0; --i) {
            if(this.gameObjects[i].dead) {
                this.gameObjects.splice(i, 1);
            }
        }
    }

    add(gameObject) {
        this.gameObjects.push(gameObject);
    }
}

export class GameObject {
    constructor() {
        this.dead = false;
        this.x = 0;
        this.y = 0;
    }

    update(dt) {}

    die() {
        this.dead = true;
    }
}

