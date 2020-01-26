// Sortof ported/inspired by hump.timer (https://github.com/vrld/hump/blob/master/timer.lua)
//
// USAGE:
//
// Run function every frame for 3 seconds:
// Timer.during(3, () => { ... });
//
// the callback gets passed the delta time, and the time remaining, both in seconds
//
// during can also take another function as a third parameter that will be called after the last
// time the main callback is called.
//
// Print a random number after 2 seconds
// Timer.after(2, () => { console.log(Math.random()); });
//
// Print a random number at 2 second intervals 5 times
// If the last option is left out, it pulses for ever.
// Timer.every(2, () => { console.log(Math.random()); }, 5);
//
// The pulsing can be cancelled early by returning false from the callback.
//
// The callbacks passed to after and every get passed the callback it self to allow the following:
// Pulse for ever, but with random intervals:
// Timer.after(Math.random(), (f) => {
//     console.log("pulse");
//     Timer.after(Math.random(), f);
// });
//
// To setup scripted events:
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
// Tween the radius of a circle from up to 64 and back over 1 second:
// const circle = { radius: 16 };
// Timer.tween(1, circle, { radius: 64 }, 'inout');
//
// The fourth parameter decides if the tween should move the values up to target ('in'),
// from target back to initial 'out', or up to target and back again ('inout').
//
// Like with duration, you can pass another function as a last parameter that will get called when the tween is complete.
//
// It may be useful to create more local timers. (To have pulses that last until something gets destroyed and so on).
// to get that, import the TimerInstance class, and create a new instance from that
//
// Also, the times and durations here is approximations at best. Do not rely on them to be accurate
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

        handle.cancel = () => {
            handle.count = 0;
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

        handle.cancel = () => {
            handle.count = 0;
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

    tween(duration, obj, target, func_name, after) {
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

            if(after) {
                after();
            }
        });
    }
}

export const Timer = new TimerInstance();

