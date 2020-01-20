/*
 * Usage:
 * Tween.linear((t) => {
 *     obj.x = a*(1-t) + b*t;
 * }, 1);
 */

export const Tween = {};
const activeTweens = [];

Tween.linear = function(cb, durationInSeconds) {
    activeTweens.push({
        t: 0,
        duration: durationInSeconds,
        func: function(t) { return t; },
        callback: cb
    });

    return Tween;
}

Tween.inOut = function(cb, duration) {
    activeTweens.push({
        t: 0,
        duration: durationInSeconds,
        func: function(t) { return 3*t*t - 2*t*t*t; },
        callback: cb
    });

    return Tween;
}

export function updateTweens(deltaTime) {
    for(var i=activeTweens.length-1; i>=0; --i) {
        const tween = activeTweens[i];
        tween.t += deltaTime/tween.duration;
        if(tween.t >= 1) {
            tween.t = 1;
            activeTweens.splice(i, 1);
        }

        const t = tween.func(tween.t);
        tween.callback(t);
    }
}

