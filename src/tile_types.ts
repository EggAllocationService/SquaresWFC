export enum TileType {
    HORIZ, // -
    VERT, // |
    BOTTOM_LEFT_CORNER, // ┗
    TOP_LEFT_CORNER, // ┏
    BOTTOM_RIGHT_CORNER, // ┛
    TOP_RIGHT_CORNER // ┓
}

export enum Direction {
    ABOVE, // y-negative
    BELOW, // y-positive
    LEFT, // x-negative
    RIGHT // x-positive
}

// vec is a 2d vector with one element as +-1 and ther other as 0
export function vecToDirection(vec: number[]) {
    if (vec[0] == 1) {
        return Direction.RIGHT;
    } else if (vec[0] == -1) {
        return Direction.LEFT;
    } else if (vec[1] == 1) {
        return Direction.BELOW;
    } else if (vec[1] == -1) {
        return Direction.ABOVE;
    }
    throw new Error("vec is not a direction");
}