// Sortof ported/inspired by hump.timer (https://github.com/vrld/hump/blob/master/timer.lua)
//
// USAGE:
//
// Print a random number after 2 seconds
// Timer.after(2, () => { console.log(Math.random()); });
//
// Print a random number at 2 second intervals 5 times
// If the last option is left out, it pulses for ever.
// Timer.every(2, () => { console.log(Math.random()); }, 5);
//
// The callbacks passed to after and every get passed the callback it self to allow the following:
// Pulse for ever, but with random intervals:
// Timer.after(Math.random(), (f) => {
//     console.log("pulse");
//     Timer.after(Math.random(), f);
// });
//
// It may be useful to create more local timers. (To have pulses that last until something gets destroyed and so on).
// to get that, import the TimerInstance class, and create a new instance from that
//
// Lastly, the script function:
// Timer.script(function*(wait) {
//     console.log("Walk to the door");
//     wait(2);
//     console.log("Open the door");
//     wait(1);
//     console.log("Look outside");
// });
//
// Note that Timer.script must be passed a generator function
//

export const Timer = new TimerInstance();

function _nothing_() {}

function updateTimerHandle(handle, dt) {
    handle.time += dt;
    handle.during(dt, Math.max(handle.limit - handle.time, 0));

    while(handle.time >= handle.limit && handle.count > 0) {
        if(!handle.after(handle.after)) {
            handle.count = 0;
            break;
        }

        handle.time -= handle.limit;
        --handle.count;
    }
}

export class TimerInstance {
    constructor() {
        this.functions = [];
    }

    update(dt) {
        const to_update = [];

        // Copy over, because this.functions may be
        // mutated during update
        for(const handle of this.functions) {
            to_update.push(handle);
        }

        for(var i=to_update.length-1; i>=0; --i) {
            const handle = this.functions[i];
            updateTimerHandle(handle, dt);

            if(handle.count === 0) {
                this.functions.splice(i, 1);
            }
        }
    }

    clear() {
        this.functions = [];
    }

    during(delay, during, after) {
        const handle = {
            timer: 0,
            during: during,
            after: after || _nothing_,
            limit: delay,
            count: 0
        }

        this.functions.push(handle);
        return handle;
    }

    after(delay, func) {
        return this.during(delay, _nothing_, func);
    }

    every(delay, after, count) {
        const count = count || Infinity;
        const handle = {
            time: 0,
            during: _nothing_,
            after: after,
            limit: delay,
            count: count
        };

        this.functions.push(handle);
        return handle;
    }

    script(f) {
        const coroutine = (f) => {
            const o = f();
            return function(x) {
                o.next(x);
            };
        };

        const co = coroutine(f);
        const self = this;
        co(function*(t) {
            this.after(t, co);
            yield;
        });
    }
}

