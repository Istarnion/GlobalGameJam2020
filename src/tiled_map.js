import { images } from "./graphics.js";

// Reference: https://doc.mapeditor.org/en/stable/reference/json-map-format/

function createTileset(ts) {
    return new Tileset(ts.name, ts.tilewidth, ts.tileheight, ts.margin, ts.spacing);
}

export class TiledMap {
    constructor(map_json) {
        const map = JSON.parse(map_json);

        this.properties = {};
        for(const prop of map.properties) {
            this.properties[prop.name] = prop.value;
        }

        this.tileset = createTileset(map.tilesets[0]);
        this.width = map.width;
        this.height = map.height;
        this.tile_width = this.tileset.width;
        this.tile_height = this.tileset.height;
        this.layers = [];
        this.objects = {};

        for(const l of map.layers) {
            if(l.type === "tilelayer") {
                const layer = {
                    tiles: l.data,
                    properties: {}
                };

                for(const prop of l.properties) {
                    layer.properties[prop.name] = prop.value;
                }

                this.layers.push(layer);
            }
            else if(l.type === "objectgroup") {
                const group = {
                    objects: {},
                    properties: {}
                };

                for(const obj of l.objects) {
                    group.objects[obj.name] = obj;
                }

                for(const prop of l.properties) {
                    group.properties[prop.name] = prop.value;
                }

                this.objects[l.name] = group;
            }
            else console.assert("Unsupported Tiled map layer type '"+l.type+"'");
        }
    }

    draw() {
        for(const layer of this.layers) {
            for(var y=0; y<this.height; ++y) {
                for(var x=0; x<this.width; ++x) {
                    const index = x + y * this.width;
                    this.tileset.drawTile(layer.tiles[i], x*this.tile_width, y*this.tile_height);
                }
            }
        }
    }
}

