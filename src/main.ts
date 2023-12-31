import {WfcGrid} from "./wfc.ts";
import {drawValidOverlay, render} from "./renderer.ts";
import {tile_weight} from "./tile_weights.ts";
import {TileType} from "./tile_types.ts";

const elementSize = 30;

let man = document.getElementById("main") as HTMLCanvasElement;
//man.width = window.innerWidth;
//man.height = window.innerHeight;

let canvasContext = man.getContext("2d")!;

// generation grid
let grid: WfcGrid;

let ixel = (document.getElementById("ix") as HTMLInputElement);
let iyel = (document.getElementById("iy") as HTMLInputElement);

var interval: number = -1;
function resetGrid() {

    grid = new WfcGrid(Math.ceil(man.width / elementSize), Math.ceil(man.height / elementSize));

    if (!(document.getElementById("border")! as HTMLInputElement).checked) return;
    for (let x = 1; x < grid.width - 1; x++) {
        grid.deterministicCollapse(x, 0, TileType.HORIZ);
        grid.deterministicCollapse(x, grid.height - 1, TileType.HORIZ);
    }
    for (let y = 1; y < grid.height - 1; y++) {
        grid.deterministicCollapse(0, y, TileType.VERT);
        grid.deterministicCollapse(grid.width - 1, y, TileType.VERT);
    }

}

resetGrid();
document.getElementById("sub")!.addEventListener("click", function() {
    if (interval == -1) {
        interval = setInterval(function() {
            let ix = parseInt(ixel.value);
            let iy = parseInt(iyel.value);
            grid.collapse(ix, iy);
            let lowest: {x: number, y: number};
            try {
                lowest = grid.findLowestEntropy();
            } catch (e) {
                console.log(e);
                clearInterval(interval);
                interval = -1;
                return;
            }
            ixel.value = lowest.x.toString();
            iyel.value = lowest.y.toString();
        }, 15);
    } else {
        clearInterval(interval);
        interval = -1;
    }
})

const batch_size = 11; // 5x5 batches
let batches: number[][] = [];
document.getElementById("full")!.addEventListener("click", async function () {
    let horiz_batch_count = Math.ceil(grid.width / batch_size);
    let vert_batch_count = Math.ceil(grid.height / batch_size);

    for (let bx = 0; bx < horiz_batch_count; bx++) {
        for (let by = 0; by < vert_batch_count; by++) {
            batches.push([bx, by]);
        }
    }

})
let curIters = 0;
function batchIterationSolve() {
    if (batches.length == 0) return;
    let [bx, by] = batches[0];
    let originX = Math.min(Math.max(bx * batch_size - 1, 0), grid.width - 1);
    let originY = Math.min(Math.max(by * batch_size - 1, 0), grid.height - 1);
    if (curIters > 0) {
        // fully reset tiles
        for (let x = 0; x < batch_size + 1 && originX + x < grid.width; x++) {
            for (let y = 0; y < batch_size + 1 && originY + y < grid.height; y++) {
                grid.resetTile(originX + x, originY + y);
            }
        }
    }

    var anyDidFail = false;
    for (let x = 0; x < batch_size + 1 && originX + x < grid.width; x++) {
        for (let y = 0; y < batch_size + 1 && originY + y < grid.height; y++) {
            grid.collapse(originX + x, originY + y);
            anyDidFail = anyDidFail || grid.getTile(originX + x, originY + y).length == 0;
        }
    }
    if (!anyDidFail || curIters > 100) {
        curIters = 0;
        batches.shift();
    }
}

let debugEl = document.getElementById("debug")! as HTMLSpanElement;
let validBox = document.getElementById("valid") as HTMLInputElement; // checkbox

for (let i = 0; i < 6; i++) {
    let el = document.getElementById("w" + (i + 1)) as HTMLInputElement;
    setupWeightInput(el, i);
}

document.getElementById("reset")!.addEventListener("click",  function() {
    resetGrid();
})

let colorInterval = -1;
document.getElementById("color")!.addEventListener("click", function() {
    if (colorInterval == -1) {
        colorInterval = setInterval(function() {
            if (!grid.simulateColorStep()) {
                clearInterval(colorInterval);
                colorInterval = -1;
            }
        }, 15);
    } else {
        clearInterval(colorInterval);
        colorInterval = -1;
    }
});

function setupWeightInput(el: HTMLInputElement, index: number) {
    el.value = tile_weight.get(index)?.toString() ?? "-1";
    el.addEventListener("change", () => {
        let val = parseInt(el.value);
        if (isNaN(val)) return;
        tile_weight.set(index, val);
    })
}

const color_b = document.getElementById("color_b") as HTMLInputElement;
function mainLoop() {
    canvasContext.fillStyle = "black"
    canvasContext.fillRect(0, 0, man.width, man.height);
    batchIterationSolve();
    render(canvasContext, grid, elementSize, 10, color_b.checked);
    requestAnimationFrame(mainLoop);
    let ix = parseInt(ixel.value);
    let iy = parseInt(iyel.value);
    if (isNaN(ix) || isNaN(iy)) return;
    debugEl.innerText = ix + "," + iy + ": " + grid.getTile(ix, iy).toString();
    debugEl.innerText += "\n" + grid.tileIsValid(ix, iy).toString();
    canvasContext.fillStyle = "yellow";
    canvasContext.globalAlpha = 0.3;
    canvasContext.fillRect(ix * elementSize, iy * elementSize, elementSize, elementSize);
    canvasContext.globalAlpha = 1;
    // draw overlay if debug checkbox is  checked
    if (validBox.checked) {
        drawValidOverlay(canvasContext, grid, elementSize);
    }

}

requestAnimationFrame(mainLoop);


