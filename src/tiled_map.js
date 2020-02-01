import { images } from "./graphics.js";
import { ajax } from "./ajax.js"
import { Tileset } from "./tileset.js";
import { gfx } from "./graphics.js";

// Reference: https://doc.mapeditor.org/en/stable/reference/json-map-format/

export const tiled_map_defs = {};

function createTileset(ts) {
    const result = new Tileset(ts.name, ts.tilewidth, ts.tileheight, ts.margin, ts.spacing);
    for(const tile in ts.tiles) {
        if(ts.tiles[tile].hasOwnProperty('animation')) {
            const anim = {};
            anim.last_frame_start = performance.now();
            anim.current_index = 0;
            anim.frames = [];

            for(const frame of ts.tiles[tile].animation) {
                anim.frames.push({
                    tile: frame.tileid,
                    duration: frame.duration
                });
            }

            anim.current = anim.frames[0];

            result.animated_tiles[ts.tiles[tile].id] = anim;
        }
    }

    return result;
}

export class TiledMap {
    constructor(map_name) {
        const map = JSON.parse(tiled_map_defs[map_name]);

        this.name = map_name;
        this.properties = {};
        if(typeof map.properties !== 'undefined') {
            for(const prop of map.properties) {
                this.properties[prop.name] = prop.value;
            }
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
                    properties: {},
                    name: l.name
                };

                if(typeof l.properties !== 'undefined') {
                    for(const prop of l.properties) {
                        layer.properties[prop.name] = prop.value;
                    }
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

    drawLayer(i) {
        const layer = this.layers[i];
        for(var y=0; y<this.height; ++y) {
            for(var x=0; x<this.width; ++x) {
                const index = x + y * this.width;
                this.tileset.drawTile(layer.tiles[index],
                                      x*this.tile_width,
                                      y*this.tile_height);
            }
        }
    }

    drawLayerDebug(i) {
        gfx.globalAlpha = 0.5;
        gfx.fillStyle = 'white';
        const layer = this.layers[i];
        for(var y=0; y<this.height; ++y) {
            for(var x=0; x<this.width; ++x) {
                const index = x + y * this.width;
                if(layer.tiles[index] !== 0) {
                    gfx.fillRect(x*this.tile_width, y*this.tile_height,
                                 this.tile_width, this.tile_height);
                }
            }
        }

        gfx.globalAlpha = 1.0;
    }
}

export function loadMapDefs(maps) {
    return new Promise((resolve, reject) => {
        if(maps.length === 0) {
            resulve();
            return;
        }

        const map_promises = [];

        for(const map_name in maps) {
            map_promises.push(new Promise((resolve, reject) => {
                ajax.get(maps[map_name])
                .then((map_def) => {
                    tiled_map_defs[map_name] = map_def;
                    resolve();
                })
                .catch((url) => {
                    console.error("Failed to fetch map def at "+url);
                    reject(url);
                });
            }));
        }

        Promise.all(map_promises)
        .then(() => {
            resolve();
        })
        .catch((failed_maps) => {
            console.error("Failed to load "+failed_maps);
            reject(failed_maps);
        });
    });
}

