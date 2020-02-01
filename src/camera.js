export const camera = {
    x: 0,
    y: 0,
    bounds_left: 0,
    bounds_right: 640,
    bounds_top: 0,
    bounds_bottom: 480
};

camera.target = (x, y) => {
    camera.x = x;
    camera.y = y;
};

camera.setBounds = (left, right, top, bottom) => {
    camera.bounds_left = left;
    camera.bounds_right = right;
    camera.bounds_top = top;
    camera.bounds_bottom = bottom;
};

