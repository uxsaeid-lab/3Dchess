import { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import type { Square, PieceSymbol } from 'chess.js';
import type {
  PieceColor,
  PieceType,
  MoveRecord,
  GameStatus,
  GameMode,
  AIDifficulty,
} from '../types/chess';
import { chessAudio } from '../utils/audio';
import { findBestMove } from '../utils/chessAi';

export function useChessGame(
  soundEnabled: boolean = true,
  onCapture?: (to: Square, capturedColor: PieceColor) => void
) {
  const [chess, setChess] = useState<Chess>(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [playerColor, setPlayerColor] = useState<PieceColor>('w');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Sync sound engine enabled state
  useEffect(() => {
    chessAudio.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const board = chess.board();
  const turn = chess.turn();
  const isCheck = chess.inCheck();
  const isGameOver = chess.isGameOver();

  // Compute game status
  let gameStatus: GameStatus = 'active';
  if (chess.isCheckmate()) {
    gameStatus = 'checkmate';
  } else if (chess.isStalemate()) {
    gameStatus = 'stalemate';
  } else if (chess.isThreefoldRepetition()) {
    gameStatus = 'threefold_repetition';
  } else if (chess.isInsufficientMaterial()) {
    gameStatus = 'insufficient_material';
  } else if (chess.isDraw()) {
    gameStatus = 'draw';
  } else if (isCheck) {
    gameStatus = 'check';
  }

  // Calculate captured pieces & material advantage
  const initialPieces: Record<PieceColor, Record<PieceType, number>> = {
    w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
  };

  const currentPieces: Record<PieceColor, Record<PieceType, number>> = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
  };

  board.forEach((row) => {
    row.forEach((piece) => {
      if (piece) {
        currentPieces[piece.color][piece.type]++;
      }
    });
  });

  const capturedPieces: { w: PieceType[]; b: PieceType[] } = { w: [], b: [] };
  const pieceOrder: PieceType[] = ['q', 'r', 'b', 'n', 'p'];

  pieceOrder.forEach((pt) => {
    // White pieces captured by Black
    const wDiff = initialPieces.w[pt] - currentPieces.w[pt];
    for (let i = 0; i < wDiff; i++) capturedPieces.w.push(pt);

    // Black pieces captured by White
    const bDiff = initialPieces.b[pt] - currentPieces.b[pt];
    for (let i = 0; i < bDiff; i++) capturedPieces.b.push(pt);
  });

  // Material evaluation: Pawn=1, Knight/Bishop=3, Rook=5, Queen=9
  const values: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  let materialAdvantage = 0;
  (['p', 'n', 'b', 'r', 'q'] as PieceType[]).forEach((pt) => {
    materialAdvantage += (currentPieces.w[pt] - currentPieces.b[pt]) * values[pt];
  });

  // Make move internal
  const executeMove = useCallback(
    (from: Square, to: Square, promotion: PieceSymbol = 'q'): boolean => {
      try {
        const gameCopy = new Chess(chess.fen());
        const moveResult = gameCopy.move({
          from,
          to,
          promotion,
        });

        if (moveResult) {
          setChess(gameCopy);
          setLastMove({ from, to });
          setSelectedSquare(null);
          setLegalMoves([]);

          const newRecord: MoveRecord = {
            from: moveResult.from,
            to: moveResult.to,
            san: moveResult.san,
            piece: moveResult.piece as PieceType,
            color: moveResult.color,
            captured: moveResult.captured as PieceType | undefined,
            promotion: moveResult.promotion as PieceType | undefined,
            flags: moveResult.flags,
          };

          setMoveHistory((prev) => [...prev, newRecord]);

          // Combat Capture callback trigger
          if (moveResult.captured) {
            const capturedColor = (moveResult.color === 'w' ? 'b' : 'w') as PieceColor;
            onCapture?.(moveResult.to as Square, capturedColor);
          }

          // Sound triggers
          if (gameCopy.isGameOver()) {
            chessAudio.playGameOver();
          } else if (gameCopy.inCheck()) {
            chessAudio.playCheck();
          } else if (moveResult.captured) {
            chessAudio.playCapture();
          } else {
            chessAudio.playMove();
          }

          return true;
        }
      } catch {
        // Invalid move
      }
      return false;
    },
    [chess, onCapture]
  );

  // Square selection / move dispatcher
  const selectSquare = useCallback(
    (square: Square) => {
      if (isGameOver || isAiThinking) return;

      // If playing vs AI and it's AI turn, ignore clicks
      if (gameMode === 'ai' && chess.turn() !== playerColor) return;

      const pieceOnSquare = chess.get(square);

      // If a square is already selected
      if (selectedSquare) {
        // Check if the clicked square is one of legal moves
        if (legalMoves.includes(square)) {
          // Check if promotion is needed (pawn moving to 8th rank)
          const movingPiece = chess.get(selectedSquare);
          const isWhitePromotion = movingPiece?.type === 'p' && movingPiece.color === 'w' && square[1] === '8';
          const isBlackPromotion = movingPiece?.type === 'p' && movingPiece.color === 'b' && square[1] === '1';
          const promotionPiece = isWhitePromotion || isBlackPromotion ? 'q' : undefined;

          executeMove(selectedSquare, square, promotionPiece);
          return;
        }

        // If clicking on another piece of the same color, switch selection
        if (pieceOnSquare && pieceOnSquare.color === chess.turn()) {
          setSelectedSquare(square);
          const moves = chess.moves({ square, verbose: true }).map((m) => m.to as Square);
          setLegalMoves(moves);
          chessAudio.playSelect();
          return;
        }

        // Clicked elsewhere -> deselect
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // No square currently selected: click on a piece of current turn color
      if (pieceOnSquare && pieceOnSquare.color === chess.turn()) {
        setSelectedSquare(square);
        const moves = chess.moves({ square, verbose: true }).map((m) => m.to as Square);
        setLegalMoves(moves);
        chessAudio.playSelect();
      }
    },
    [chess, selectedSquare, legalMoves, isGameOver, isAiThinking, gameMode, playerColor, executeMove]
  );

  // AI response trigger
  useEffect(() => {
    if (gameMode === 'ai' && !isGameOver && chess.turn() !== playerColor) {
      const timer = setTimeout(() => {
        setIsAiThinking(true);
        // Short delay to simulate AI thinking
        const innerTimer = setTimeout(() => {
          const aiMove = findBestMove(chess, aiDifficulty);
          if (aiMove) {
            executeMove(aiMove.from, aiMove.to, aiMove.promotion);
          }
          setIsAiThinking(false);
        }, 350 + Math.random() * 250);

        return () => clearTimeout(innerTimer);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [gameMode, isGameOver, chess, playerColor, aiDifficulty, executeMove]);

  // Reset Game
  const resetGame = useCallback(() => {
    setChess(new Chess());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setMoveHistory([]);
    setIsAiThinking(false);
  }, []);

  // Undo Move (if vs AI, undoes two half-moves so player gets turn back)
  const undoMove = useCallback(() => {
    if (isAiThinking) return;

    const gameCopy = new Chess(chess.fen());
    if (gameMode === 'ai') {
      gameCopy.undo();
      gameCopy.undo();
      setMoveHistory((prev) => prev.slice(0, Math.max(0, prev.length - 2)));
    } else {
      gameCopy.undo();
      setMoveHistory((prev) => prev.slice(0, Math.max(0, prev.length - 1)));
    }

    setChess(gameCopy);
    setSelectedSquare(null);
    setLegalMoves([]);

    setMoveHistory((currentHistory) => {
      const last = currentHistory[currentHistory.length - 1];
      if (last) {
        setLastMove({ from: last.from, to: last.to });
      } else {
        setLastMove(null);
      }
      return currentHistory;
    });
  }, [chess, isAiThinking, gameMode]);

  return {
    chess,
    fen: chess.fen(),
    board,
    turn,
    selectedSquare,
    legalMoves,
    lastMove,
    moveHistory,
    gameStatus,
    isCheck,
    isGameOver,
    capturedPieces,
    materialAdvantage,
    gameMode,
    aiDifficulty,
    playerColor,
    isAiThinking,
    selectSquare,
    executeMove,
    resetGame,
    undoMove,
    setGameMode,
    setAiDifficulty,
    setPlayerColor,
  };
}
