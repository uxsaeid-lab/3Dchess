import { Chess } from 'chess.js';
import type { Square, PieceSymbol, Color } from 'chess.js';
import type { AIDifficulty } from '../types/chess';

// Standard piece values (centipawns)
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (White perspective, mirror for black)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0,
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20,
];

const KING_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20,
];

function getSquareIndex(square: Square, color: Color): number {
  const file = square.charCodeAt(0) - 97; // 'a' -> 0
  const rank = parseInt(square[1], 10) - 1; // '1' -> 0
  if (color === 'w') {
    return (7 - rank) * 8 + file;
  } else {
    return rank * 8 + file;
  }
}

function getPositionalBonus(piece: PieceSymbol, square: Square, color: Color): number {
  const idx = getSquareIndex(square, color);
  switch (piece) {
    case 'p': return PAWN_TABLE[idx] || 0;
    case 'n': return KNIGHT_TABLE[idx] || 0;
    case 'b': return BISHOP_TABLE[idx] || 0;
    case 'r': return ROOK_TABLE[idx] || 0;
    case 'q': return QUEEN_TABLE[idx] || 0;
    case 'k': return KING_TABLE[idx] || 0;
    default: return 0;
  }
}

export function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -Infinity : Infinity;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
    return 0;
  }

  let evaluation = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        const square = piece.square;
        const val = PIECE_VALUES[piece.type] + getPositionalBonus(piece.type, square, piece.color);
        if (piece.color === 'w') {
          evaluation += val;
        } else {
          evaluation -= val;
        }
      }
    }
  }

  return evaluation;
}

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true });

  // Move ordering: sort captures and checks first for better alpha-beta pruning
  moves.sort((a, b) => {
    let scoreA = a.captured ? 10 : 0;
    let scoreB = b.captured ? 10 : 0;
    return scoreB - scoreA;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function findBestMove(
  chess: Chess,
  difficulty: AIDifficulty
): { from: Square; to: Square; promotion?: PieceSymbol } | null {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  // Easy mode: 60% random legal move, 40% depth 1
  if (difficulty === 'easy') {
    if (Math.random() < 0.6) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return {
        from: randomMove.from,
        to: randomMove.to,
        promotion: (randomMove.promotion as PieceSymbol) || 'q',
      };
    }
  }

  const isMaximizing = chess.turn() === 'w';
  let bestMove = moves[0];
  let bestValue = isMaximizing ? -Infinity : Infinity;

  // Medium: depth 2; Hard: depth 3
  const depth = difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1;

  for (const move of moves) {
    chess.move(move);
    const value = minimax(chess, depth - 1, -Infinity, Infinity, !isMaximizing);
    chess.undo();

    if (isMaximizing) {
      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
    } else {
      if (value < bestValue) {
        bestValue = value;
        bestMove = move;
      }
    }
  }

  return {
    from: bestMove.from,
    to: bestMove.to,
    promotion: (bestMove.promotion as PieceSymbol) || 'q',
  };
}
