function createTileset(ts) {
    return new Tileset();
}

export class TiledMap {
    constructor(map_json) {
        const map = JSON.parse(map_json);
        this.tileset = createTileset(map.tilesets[0]);

        this.width = map.width;
        this.height = map.height;
        this.tile_size = 32;
        this.layers = [];

        for(const l of map.layers) {
            const layer = {
                tiles: [],
                properties: {}
            };

            this.layers.push(layer);
        }
    }

    draw() {
        for(const layer of this.layers) {
            for(var y=0; y<this.height; ++y) {
                for(var x=0; x<this.width; ++x) {
                    const index = x + y * this.width;
                    this.tileset.drawTile(layer.tiles[i], x*this.tile_size, y*this.tile_size);
                }
            }
        }
    }
}

