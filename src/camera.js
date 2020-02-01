const WIDTH = 320;
const HEIGHT = 240;

export const camera = {
    x: 0,
    y: 0,
    bounds_left: 0,
    bounds_right: 140*16,
    bounds_top: 0,
    bounds_bottom: 105*16
};

camera.target = (x, y) => {
    x -= WIDTH/2;
    y -= HEIGHT/2;

    if(x        <  camera.bounds_left)   x = camera.bounds_left;
    if(x+WIDTH  >= camera.bounds_right)  x = camera.bounds_right-WIDTH;
    if(y        <  camera.bounds_top)    y = camera.bounds_top;
    if(y+HEIGHT >= camera.bounds_bottom) y = camera.bounds_bottom-HEIGHT;

    camera.x = x;
    camera.y = y;
};

camera.setBounds = (left, right, top, bottom) => {
    camera.bounds_left = left;
    camera.bounds_right = right;
    camera.bounds_top = top;
    camera.bounds_bottom = bottom;
};

