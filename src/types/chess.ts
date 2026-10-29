import type { Square, PieceSymbol, Color } from 'chess.js';

export type PieceColor = Color; // 'w' | 'b'
export type PieceType = PieceSymbol; // 'p' | 'n' | 'b' | 'r' | 'q' | 'k'

export interface BoardPiece {
  square: Square;
  type: PieceType;
  color: PieceColor;
}

export interface MoveRecord {
  from: Square;
  to: Square;
  san: string;
  piece: PieceType;
  color: PieceColor;
  captured?: PieceType;
  promotion?: PieceType;
  flags: string;
}

export type GameStatus =
  | 'active'
  | 'check'
  | 'checkmate'
  | 'draw'
  | 'stalemate'
  | 'insufficient_material'
  | 'threefold_repetition';

export type GameMode = 'pvp' | 'ai';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type CameraPreset = 'cinematic' | 'white' | 'black' | 'top' | 'isometric';

export interface BotConfig {
  id: string;
  name: string;
  nameEn: string;
  power: number;
  difficulty: AIDifficulty;
  tag: string;
  desc: string;
}

export interface GameSettings {
  showLegalMoves: boolean;
  showCoordinates: boolean;
  soundEnabled: boolean;
  autoRotateCamera: boolean;
}
