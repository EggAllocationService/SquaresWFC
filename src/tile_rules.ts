import {Direction, TileType} from "./tile_types.ts";


/**
 * Calculates if another tile may be placed next to this one in the specified direction
 */
export interface TileRuleSolver {
    (targetTile: TileType, fromDirection: Direction): boolean;
}
function horiz(targetTile: TileType, fromDirection: Direction): boolean {
    let values = [
        [ // above
            TileType.HORIZ,
            TileType.BOTTOM_LEFT_CORNER,
            TileType.BOTTOM_RIGHT_CORNER
        ],
        [ // below
            TileType.HORIZ,
            TileType.TOP_LEFT_CORNER,
            TileType.TOP_RIGHT_CORNER
        ],
        [ // left
            TileType.HORIZ,
            TileType.BOTTOM_LEFT_CORNER,
            TileType.TOP_LEFT_CORNER
        ],
        [// right
            TileType.HORIZ,
            TileType.BOTTOM_RIGHT_CORNER,
            TileType.TOP_RIGHT_CORNER
        ]
    ]
    return values[fromDirection].includes(targetTile);
}

function vert(targetTile: TileType, fromDirection: Direction): boolean {
    let values = [
        [ // above
            TileType.VERT,
            TileType.TOP_LEFT_CORNER,
            TileType.TOP_RIGHT_CORNER
        ],
        [ // below
            TileType.VERT,
            TileType.BOTTOM_LEFT_CORNER,
            TileType.BOTTOM_RIGHT_CORNER
        ],
        [// left
            TileType.VERT,
            TileType.BOTTOM_RIGHT_CORNER,
            TileType.TOP_RIGHT_CORNER
        ],
        [ // right
            TileType.VERT,
            TileType.BOTTOM_LEFT_CORNER,
            TileType.TOP_LEFT_CORNER
        ]
    ]
    return values[fromDirection].includes(targetTile);
}

function cornerBottomLeft(targetTile: TileType, fromDirection: Direction): boolean {
    // ┗
    let values = [
        [ // above
            TileType.VERT,
            TileType.TOP_LEFT_CORNER,
            TileType.TOP_RIGHT_CORNER
        ],
        [ // below
            TileType.HORIZ,
            TileType.TOP_LEFT_CORNER,
            TileType.TOP_RIGHT_CORNER
        ],
        [ // left
            TileType.VERT,
            TileType.BOTTOM_RIGHT_CORNER,
            TileType.TOP_RIGHT_CORNER
        ],
        [ // right
            TileType.HORIZ,
            TileType.BOTTOM_RIGHT_CORNER,
            TileType.TOP_RIGHT_CORNER
        ]
    ];
    return values[fromDirection].includes(targetTile);
}
function cornerTopLeft(targetTile: TileType, fromDirection: Direction): boolean {
    // ┏
    let values = [
        [ // above
            TileType.HORIZ,
            TileType.BOTTOM_LEFT_CORNER,
            TileType.BOTTOM_RIGHT_CORNER
        ],
        [ // below
            TileType.VERT,
            TileType.BOTTOM_LEFT_CORNER,
            TileType.BOTTOM_RIGHT_CORNER
        ],
        [ // left
            TileType.VERT,
            TileType.TOP_RIGHT_CORNER,
            TileType.BOTTOM_RIGHT_CORNER
        ],
        [ // right
            TileType.HORIZ,
            TileType.TOP_RIGHT_CORNER,
            TileType.BOTTOM_RIGHT_CORNER
        ]
    ];
    return values[fromDirection].includes(targetTile);
}
function cornerBottomRight(targetTile: TileType, fromDirection: Direction): boolean {
    // ┛
    let values = [
        [ // above
            TileType.VERT,
            TileType.TOP_RIGHT_CORNER,
            TileType.TOP_LEFT_CORNER
        ],
        [ // below
            TileType.HORIZ,
            TileType.TOP_LEFT_CORNER,
            TileType.TOP_RIGHT_CORNER
        ],
        [ // left
            TileType.HORIZ,
            TileType.BOTTOM_LEFT_CORNER,
            TileType.TOP_LEFT_CORNER
        ],
        [ // right
            TileType.VERT,
            TileType.BOTTOM_LEFT_CORNER,
            TileType.TOP_LEFT_CORNER
        ]
    ];
    return values[fromDirection].includes(targetTile);
}

function cornerTopRight(targetTile: TileType, fromDirection: Direction): boolean {
    // ┓
    let values = [
        [ // above
            TileType.HORIZ,
            TileType.BOTTOM_LEFT_CORNER,
            TileType.BOTTOM_RIGHT_CORNER
        ],
        [ // below
            TileType.VERT,
            TileType.BOTTOM_RIGHT_CORNER,
            TileType.BOTTOM_LEFT_CORNER
        ],
        [ // left
            TileType.HORIZ,
            TileType.TOP_LEFT_CORNER,
            TileType.BOTTOM_LEFT_CORNER
        ],
        [ // right
            TileType.VERT,
            TileType.BOTTOM_LEFT_CORNER,
            TileType.TOP_LEFT_CORNER
        ]
    ];
    return values[fromDirection].includes(targetTile);
}

/**
 * Ruleset for how tiles can connect to other tiles depending on direction
 */
export const tileRuleSolvers: Map<any, TileRuleSolver> = new Map([
    [0, horiz],
    [1, vert],
    [2, cornerBottomLeft],
    [3, cornerTopLeft],
    [4, cornerBottomRight],
    [5, cornerTopRight],
]);

// @ts-ignore
window["tileSolvers"] = tileRuleSolvers;