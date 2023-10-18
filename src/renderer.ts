import {Direction, TileType} from "./tile_types.ts";
import {WfcGrid} from "./wfc.ts";


export function render(ctx: CanvasRenderingContext2D, grid: WfcGrid, elementSize: number, lineWidth: number) {
    ctx.fillStyle = "black";

    for (let x = 0; x < grid.width; x++) {
        for (let y = 0; y < grid.height; y++) {
            render_tile(x, y, ctx, grid, elementSize, lineWidth);
        }
    }
}

function draw_corner_tile(originX: number, originY: number, dir1: Direction, dir2: Direction, ctx: CanvasRenderingContext2D, elementSize: number, lineWidth: number ) {
    //let saved = ctx.fillStyle;
    let middleX = (originX + elementSize / 2) - (lineWidth/2);
    let middleY = (originY + elementSize / 2) - (lineWidth/2);
    /*ctx.fillStyle = "lime";
    ctx.fillRect(originX, originY, elementSize, elementSize);
    ctx.fillStyle = saved;*/
    for (let dir of [dir1, dir2]) {
        // draw the single directional line from the edge of the tile to the center


        switch (dir) {
            case Direction.ABOVE:
                ctx.fillRect(middleX, originY, lineWidth, (elementSize / 2) + (lineWidth/2));
                break;
            case Direction.BELOW:
                ctx.fillRect(middleX, middleY, lineWidth, (elementSize / 2) + (lineWidth/2));
                break;
            case Direction.LEFT:
                ctx.fillRect(originX, middleY, (elementSize / 2) + (lineWidth/2), lineWidth);
                break;
            case Direction.RIGHT:
                ctx.fillRect(middleX, middleY, (elementSize / 2) + (lineWidth/2), lineWidth);
                break;


        }
    }
}

function render_tile(x: number, y: number, ctx: CanvasRenderingContext2D, waveFunction: WfcGrid, elementSize: number, lineWidth: number) {
    let possibilities = waveFunction.getTile(x, y);
    let originX = x * elementSize;
    let originY = y * elementSize;
    let middleX = (originX + elementSize / 2) - (lineWidth/2);
    let middleY = (originY + elementSize / 2) - (lineWidth/2);

    if (possibilities.length == 0) {
        // errored
        ctx.fillStyle = "red";
        ctx.fillRect(originX, originY, elementSize, elementSize);
    } else if (possibilities.length == 1) {
        // got collapsed
        let final = possibilities[0];
        ctx.fillStyle = "white";
        switch (final) {
            case TileType.HORIZ:
                ctx.fillRect(originX, middleY, elementSize, lineWidth);
                break;
            case TileType.VERT:
                ctx.fillRect(middleX, originY, lineWidth, elementSize);
                break;
            case TileType.BOTTOM_LEFT_CORNER:
                draw_corner_tile(originX, originY, Direction.ABOVE, Direction.RIGHT, ctx, elementSize, lineWidth);
                break;
            case TileType.TOP_LEFT_CORNER:
                draw_corner_tile(originX, originY, Direction.BELOW, Direction.RIGHT, ctx, elementSize, lineWidth);
                break;
            case TileType.BOTTOM_RIGHT_CORNER:
                draw_corner_tile(originX, originY, Direction.ABOVE, Direction.LEFT, ctx, elementSize, lineWidth);
                break;
            case TileType.TOP_RIGHT_CORNER:
                draw_corner_tile(originX, originY, Direction.BELOW, Direction.LEFT, ctx, elementSize, lineWidth);
                break;
        }
    } else {
        // still a lot of possibilities

        let certainty = waveFunction.tiles[x][y].length / 6;
        certainty = Math.min(1, certainty);
        ctx.fillStyle = "white"
        ctx.fillRect(originX, originY, elementSize, elementSize);
        ctx.fillStyle = "black";
        ctx.globalAlpha = certainty;
        ctx.fillRect(originX, originY, elementSize, elementSize);
        ctx.globalAlpha = 1;
    }
}

export function drawValidOverlay(ctx: CanvasRenderingContext2D, grid: WfcGrid, elementSize: number) {
    ctx.fillStyle = "lime";
    ctx.globalAlpha = 0.3;
    for (let x = 0; x < grid.width; x++) {
        for (let y = 0; y < grid.height; y++) {
            if (grid.tileIsValid(x, y).reduce((a, b) => a && b, true)) {
                ctx.fillRect(x * elementSize, y * elementSize, elementSize, elementSize);
            }
        }
    }
    ctx.globalAlpha = 1;
}