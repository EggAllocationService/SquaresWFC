import {TileType} from "./tile_types.ts";
export const tile_weight: Map<TileType, number> = new Map([
    [TileType.HORIZ, 1],
    [TileType.VERT, 1],
    [TileType.BOTTOM_LEFT_CORNER, 1],
    [TileType.TOP_LEFT_CORNER, 1],
    [TileType.BOTTOM_RIGHT_CORNER, 1],
    [TileType.TOP_RIGHT_CORNER, 1]
]);

export function pickRandomWeightedItem<T>(items: T[], weights: number[]): T {
    if (items.length !== weights.length || items.length === 0) {
        throw new Error("Invalid input: items and weights must have the same length and cannot be empty.");
    }

    // Calculate the sum of all weights
    const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);

    // Generate a random number within the range [0, totalWeight)
    const randomValue = Math.random() * totalWeight;

    // Find the index corresponding to the chosen item
    let currentIndex = 0;
    let currentWeight = weights[0];

    while (randomValue > currentWeight) {
        currentIndex++;
        currentWeight += weights[currentIndex];
    }

    // Return the randomly selected item
    return items[currentIndex];
}