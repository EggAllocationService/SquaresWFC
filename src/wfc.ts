import {tileRuleSolvers} from "./tile_rules.ts";
import {pickRandomWeightedItem, tile_weight} from "./tile_weights.ts";
import {Direction, TileType} from "./tile_types.ts";
import {Color, tile_connections} from "./colors.ts";

export class WfcGrid {
    width: number;
    height: number;
    // 2 spatial dimensions, third dimension represents all possible tile types for that location
    tiles: TileType[][][];
    colors: Color[][];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.tiles = new Array(width);
        this.colors = new Array(width);
        for (let x = 0; x < width; x++) {
            this.tiles[x] = new Array(height);
            this.colors[x] = new Array(height);
            for (let y = 0; y < height; y++) {
                this.tiles[x][y] = [];
                this.colors[x][y] = Color.random();
                for (let tileType = 0; tileType < 6; tileType++) {
                    this.tiles[x][y].push(tileType);
                }
            }

        }

    }

    /**
     * Collapse a specific coordinate into a definite tile type
     * Also spreads new constraints to adjacent tiles
     * @param x
     * @param y
     */
    collapse(x: number, y: number) {

        var validStates = this.tiles[x][y]
           .filter(t => !this.willProduceInvalidState(x, y, t));

        if (validStates.length == 0) {
            this.tiles[x][y] = [];
            return;
        }

        // pick random valid state
        //let collapsedState = validStates[Math.floor(Math.random() * validStates.length)];
        let collapsedState = pickRandomWeightedItem(validStates, validStates.map(s => tile_weight.get(s)!) );
        this.deterministicCollapse(x, y, collapsedState);
    }

    deterministicCollapse(x:number, y:number, collapsedState:number, propagate: boolean = true) {
        this.tiles[x][y] = [collapsedState];
        // spread new constraints to adjacent tiles
        if (propagate) {
            this.propagateTileChange(x, y, []);
        }
    }

    propagateTileChange(x: number, y: number, visitedPoints: number[][]) {
        visitedPoints.push([x, y]);
        if (this.tiles[x][y].length > 1) {
            this.resetTile(x, y);
        }

        if (this.tiles[x][y].length == 6) {
            return;
        }
        for (let offset of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            let nx = x + offset[0];
            let ny = y + offset[1];

            // make sure point is not already visited
            if (visitedPoints.filter((p) => p[0] == nx && p[1] == ny).length > 0) {
                continue;
            }

            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                this.propagateTileChange(nx, ny, visitedPoints);
            }
        }
    }

    /**
     * Check if setting a specific tile type at a specific coordinate will produce an invalid state
     * @param x
     * @param y
     * @param tile
     */
    willProduceInvalidState(x: number, y: number, tile: TileType) {
        // save current tile and all adjacent tiles
        let currentTile = this.tiles[x][y];
        let leftTile = x != 0 ? this.tiles[x - 1][y] : [];
        let rightTile = x != this.width - 1 ? this.tiles[x + 1][y] : [];
        let aboveTile = y != 0 ? this.tiles[x][y - 1] : [];
        let belowTile = y != this.height - 1 ? this.tiles[x][y + 1] : [];

        this.deterministicCollapse(x, y, tile, false);
        let isValid = this.tileIsValid(x, y);

        // restore saved states
        this.tiles[x][y] = currentTile;
        if (x != 0) {
            this.tiles[x - 1][y] = leftTile;
        }
        if (x != this.width - 1) {
            this.tiles[x + 1][y] = rightTile;
        }
        if (y != 0) {
            this.tiles[x][y - 1] = aboveTile;
        }
        if (y != this.height - 1) {
            this.tiles[x][y + 1] = belowTile;

        }
        return !isValid.reduce((acc, val) => acc && val, true);
    }


    // calculate the entropy of a specific coordinate, based on the weights in tile_weights.ts
    getEntropy(x: number, y: number) {
        let choices = this.tiles[x][y];
        if (choices.length == 6) return 100;
        let weights = choices.map((t) => {
            return tile_weight.get(t)!;
        });
        // Check if the choices and weights arrays have the same length


        // Calculate the total sum of weights
        const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);

        // Calculate entropy
        let entropy = 0;
        for (let i = 0; i < choices.length; i++) {
            const probability = weights[i] / totalWeight;
            entropy += -probability * Math.log2(probability);
        }

        return entropy;

    }

    //find a tile with the lowest entropy
    findLowestEntropy() {
        let lowestEntropy = 1000000000;
        let foundLocations: number[][] = [];
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let entropy = this.getEntropy(x, y);
                if ( this.tiles[x][y].length > 1) {
                    if (entropy < lowestEntropy) {
                        lowestEntropy = entropy;
                        foundLocations = [[x, y]];
                    } else if (entropy == lowestEntropy) {
                        foundLocations.push([x, y]);
                    }

                }
            }
        }
        if (foundLocations.length == 0) {
            // find the first non-collapsed tile
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    if (this.tiles[x][y].length > 1) {
                        foundLocations.push([x, y]);
                    }
                }
            }
        }
        // pick a random found location and return
        let randomIndex = Math.floor(Math.random() * foundLocations.length);

        let lowestEntropyX = foundLocations[randomIndex][0];
        let lowestEntropyY = foundLocations[randomIndex][1];

        return {x: lowestEntropyX, y: lowestEntropyY};
    }

    getTile(x: number, y: number): TileType[] {

        return this.tiles[x][y];
    }

    resetTile(x: number, y: number) {
        this.tiles[x][y] = [TileType.HORIZ, TileType.VERT, TileType.BOTTOM_LEFT_CORNER, TileType.TOP_LEFT_CORNER, TileType.BOTTOM_RIGHT_CORNER, TileType.TOP_RIGHT_CORNER]
            .filter((t) => {
                let isAllowed = true;
                if (x != 0 && this.tiles[x - 1][y].length == 1) {
                    isAllowed = isAllowed && tileRuleSolvers.get(t)!(this.tiles[x - 1][y][0], Direction.LEFT);
                }
                if (x != this.width - 1 && this.tiles[x + 1][y].length == 1) {
                    isAllowed = isAllowed && tileRuleSolvers.get(t)!(this.tiles[x + 1][y][0], Direction.RIGHT);
                }
                if (y != 0 && this.tiles[x][y - 1].length == 1) {
                    isAllowed = isAllowed && tileRuleSolvers.get(t)!(this.tiles[x][y - 1][0], Direction.ABOVE);

                }
                if (y != this.height - 1 && this.tiles[x][y + 1].length == 1) {
                    isAllowed = isAllowed && tileRuleSolvers.get(t)!(this.tiles[x][y + 1][0], Direction.BELOW);
                }
                return isAllowed;
            });
    }
    tileIsValid(x: number, y: number): boolean[] {
        // check all adjacent tiles to see if they can be placed next to the specified one
        let valid: boolean[] = [];
        if (x != 0 && this.tiles[x - 1][y].length == 1) {
            valid.push(tileRuleSolvers.get(this.tiles[x][y][0])!(this.tiles[x - 1][y][0], Direction.LEFT));
        }
        if (x != this.width - 1 && this.tiles[x + 1][y].length == 1) {
            valid.push(tileRuleSolvers.get(this.tiles[x][y][0])!(this.tiles[x + 1][y][0], Direction.RIGHT));
        }
        if (y != 0 && this.tiles[x][y - 1].length == 1) {
            valid.push(tileRuleSolvers.get(this.tiles[x][y][0])!(this.tiles[x][y - 1][0], Direction.ABOVE));

        }
        if (y != this.height - 1 && this.tiles[x][y + 1].length == 1) {
            valid.push(tileRuleSolvers.get(this.tiles[x][y][0])!(this.tiles[x][y + 1][0], Direction.BELOW));
        }
        return valid;
    }

    simulateColorStep(): boolean {
        // spread out colors, battling across the tile connections
        let didChange = false;
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const tile = this.getTile(x, y);
                if (tile.length != 1) continue;
                const color = this.colors[x][y];
                for (let offset of tile_connections[tile[0]]) {
                    let nx = x + offset[0];
                    let ny = y + offset[1];
                    if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) continue;
                    const otherTile = this.getTile(nx, ny);
                    if (otherTile.length != 1) continue;
                    const otherColor = this.colors[nx][ny];
                    if (otherColor.value == color.value) continue;


                    didChange = true;
                    if (color.tiles > 20 && color.value != "#333333") {
                        color.weight = 100000;
                        color.value = "#333333";
                    }
                    if (color.beats(otherColor)) {
                        color.tiles++;
                        this.colors[nx][ny] = color;

                    } else {
                        otherColor.tiles++;
                        this.colors[x][y] = otherColor;
                    }
                }
            }
        }
        return didChange;
    }
}



