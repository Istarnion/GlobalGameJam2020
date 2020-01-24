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
// Timer.script(function*() {
//     console.log("Walk to the door");
//     yield 2;
//     console.log("Open the door");
//     yield 1;
//     console.log("Look outside");
// });
//
// Note that Timer.script must be passed a generator function
//

function _nothing_() {}

function updateTimerHandle(handle, dt) {
    handle.time += dt;
    handle.during(dt, Math.max(handle.limit - handle.time, 0));

    while(handle.time >= handle.limit && handle.count > 0) {
        if(handle.after(handle.after) === false) {
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
        for(var i=this.functions.length-1; i>=0; --i) {
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
            time: 0,
            during: during,
            after: after || _nothing_,
            limit: delay,
            count: 1
        };

        this.functions.push(handle);
        return handle;
    }

    after(delay, func) {
        return this.during(delay, _nothing_, func);
    }

    every(delay, after, count) {
        count = count || Infinity;
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
        const coroutine = f();

        this.after(1, (f) => {
            const delay = coroutine.next();
            if(!delay.done) {
                this.after(delay.value, f);
            }
        });
    }

    tween(duration, obj, target, func_name) {
        function the_good_tween(t) {
            return 3*t*t - 2*t*t*t;
        }

        const tween_funcs = {
            in: the_good_tween,
            out: (t) => {
                t=1-t;
                return the_good_tween(t);
            },
            inout: (t) => {
                if(t<0.5) t*=2;
                else t=1-(2*(t-0.5));
                return the_good_tween(t);
            }
        };

        var time = 0;
        const tween = tween_funcs[func_name || 'in'];
        const original_values = {};
        for(const prop in target) {
            original_values[prop] = obj[prop];
        }

        this.during(duration, (dt, remaining) => {
            // Run every frame until done
            time += dt;
            const t = tween(Math.min(time / duration, 1));

            for(const prop in target) {
                obj[prop] = original_values[prop]*(1-t) + target[prop]*t;
            }
        },
        () => {
            // Run once after done
            const t = tween(1);
            for(const prop in target) {
                obj[prop] = original_values[prop]*(1-t) + target[prop]*t;
            }
        });
    }
}

export const Timer = new TimerInstance();

