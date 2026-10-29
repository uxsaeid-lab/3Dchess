import type { Square } from 'chess.js';

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

// Helper to calculate 3D board position from square string like "e4"
export function squareToCoords(square: Square): [number, number, number] {
  const file = square[0];
  const rank = parseInt(square[1], 10);
  const fileIdx = FILES.indexOf(file as typeof FILES[number]);
  const rankIdx = rank - 1;

  const x = fileIdx - 3.5;
  const z = 3.5 - rankIdx;
  return [x, 0.1, z];
}
