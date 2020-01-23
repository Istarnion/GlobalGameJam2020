import { gfx, sprites } from "./graphics.js";

export class Tileset {
    constructor(image, tileWidth, tileHeight, margin, spacing) {
        this.tilemap = sprites[image];
        this.width = tileWidth;
        this.height = tileHeight;
        this.margin = margin;
        this.spacing = spacing;

        const imgWidth = this.tilemap.width;
        this.widthWithSpacing = this.width + this.spacing;
        this.heightWithSpacing = this.height + this.spacing;
        this.tilesAcross = Math.floor(imgWidth / this.widthWithSpacing);
        this.animated_tiles = {};
    }

    /*
     * 'tile' is a number from 1 to n, where 1 would draw the top left tile in the sheet,
     * and 2 would draw the tile to the right of that one, and so on.
     * 0 is accepted, but will not draw anything. ( For empty tiles )
     * These numbers are the same as they would be in Tiled
     */
    drawTile(tile, x, y) {
        if(tile === 0) return;

        --tile;

        const animated_tile = this.animated_tiles[tile];
        if(!!animated_tile) {
            const now = performance.now();
            if(now - animated_tile.last_frame_start > animated_tile.current.duration) {
                animated_tile.last_frame_start = now;
                ++animated_tile.current_index;
                if(animated_tile.current_index >= animated_tile.frames.length) {
                    animated_tile.current_index = 0;
                }

                animated_tile.current = animated_tile.frames[animated_tile.current_index];
            }

            tile = animated_tile.current.tile;
        }

        gfx.drawImage(
            this.tilemap,
            this.margin + this.widthWithSpacing * (tile % this.tilesAcross),
            this.margin + this.heightWithSpacing * Math.floor(tile / this.tilesAcross),
            this.width, this.height,
            x, y, this.width, this.height);
    }
}

