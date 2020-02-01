export const items = {
    ladder: {
        width: 1,
        height: 2,
        tile_layer: [
            23,
            23
        ],
        collision_layer: [
            68,
            68
        ],
        pickup_tile: 23,
        icon_x: 48,
        icon_y: 0
    },
    bridge: {
        width: 4,
        height: 1,
        tile_layer: [
            25, 25, 25, 25
        ],
        collision_layer: [
            65, 65, 65, 65
        ],
        pickup_tile: 25,
        icon_x: 16,
        icon_y: 0
    },
    stairs_left: {
        width: 2,
        height: 2,
        tile_layer: [
            39, 0,
            40, 39
        ],
        collision_layer: [
            67, 0,
            65, 67
        ],
        pickup_tile: 39,
        icon_x: 16,
        icon_y: 0
    },
    stairs_right: {
        width: 2,
        height: 2,
        tile_layer: [
             0, 24,
            24, 29
        ],
        collision_layer: [
             0, 66,
            66, 65
        ],
        pickup_tile: 24,
        icon_x: 32,
        icon_y: 0
    }
};

