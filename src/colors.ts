import {Direction} from "./tile_types.ts";

const pastel_rainbow: string[] = [
    "#ffadad",
    "#ffd6a5",
    "#fdffb6",
    "#caffbf",
    "#9bf6ff",
    "#a0c4ff",
    "#bdb2ff"
]

export class Color {
    value: string;
    weight: number;
    tiles: number = 1;
    constructor(value: string, weight: number = 1) {
        this.value = value;
        this.weight = weight;
    }

    beats(opponent: Color): boolean  {
        const thisWins = (opponent.weight == this.weight && Math.random() > 0.5);

        return this.weight > opponent.weight || thisWins;

    }
    static random(): Color {
        let solved = pastel_rainbow[Math.floor(Math.random() * pastel_rainbow.length)];
        return new Color(solved, Math.random() * 100);
    }
}

function getConnectionVector(a: Direction): number[] {
    if (a == Direction.LEFT) {
        return [-1, 0];
    } else if (a == Direction.BELOW) {
        return [0, 1];
    } else if (a == Direction.RIGHT) {
        return [1, 0];
    } else {
        return [0, -1];
    }
}

export const tile_connections: number[][][] = [
    [getConnectionVector(Direction.LEFT), getConnectionVector(Direction.RIGHT)], // horiz
    [getConnectionVector(Direction.ABOVE), getConnectionVector(Direction.BELOW)], // vert
    [getConnectionVector(Direction.RIGHT), getConnectionVector(Direction.ABOVE)], // bottom left
    [getConnectionVector(Direction.RIGHT), getConnectionVector(Direction.BELOW)], // top left
    [getConnectionVector(Direction.LEFT), getConnectionVector(Direction.ABOVE)], // bottom right
    [getConnectionVector(Direction.LEFT), getConnectionVector(Direction.BELOW)] // top right
];