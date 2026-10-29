import React from 'react';
import { Trophy, RotateCcw, Award } from 'lucide-react';
import type { GameStatus } from '../../types/chess';

interface GameOverModalProps {
  status: GameStatus;
  turn: 'w' | 'b';
  onNewGame: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  status,
  turn,
  onNewGame,
}) => {
  if (status === 'active' || status === 'check') return null;

  const isCheckmate = status === 'checkmate';
  const winner = turn === 'w' ? 'Black' : 'White';

  let title = 'Game Finished';
  let subtitle = 'Well played!';

  if (isCheckmate) {
    title = `${winner} Wins!`;
    subtitle = `Checkmate! ${winner} captured victory.`;
  } else if (status === 'stalemate') {
    title = 'Stalemate';
    subtitle = 'Draw by stalemate — no legal moves remain.';
  } else if (status === 'insufficient_material') {
    title = 'Draw';
    subtitle = 'Draw by insufficient material to checkmate.';
  } else if (status === 'threefold_repetition') {
    title = 'Draw';
    subtitle = 'Draw by threefold repetition.';
  } else if (status === 'draw') {
    title = 'Draw';
    subtitle = 'The match concluded in a draw.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 via-[#0d121f] to-slate-950 border border-amber-500/30 p-6 text-center shadow-2xl shadow-amber-500/10">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25">
          {isCheckmate ? <Trophy className="w-8 h-8" /> : <Award className="w-8 h-8" />}
        </div>

        <h2 className="text-2xl font-black tracking-tight text-white mb-1">
          {title}
        </h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          {subtitle}
        </p>

        <button
          onClick={onNewGame}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Play Again</span>
        </button>
      </div>
    </div>
  );
};
