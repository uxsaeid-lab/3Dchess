import React from 'react';
import { Bot, User, BrainCircuit, Swords, Loader2 } from 'lucide-react';
import type {
  PieceType,
  PieceColor,
  GameMode,
  AIDifficulty,
} from '../../types/chess';
import { clsx } from 'clsx';

interface GameHUDProps {
  turn: PieceColor;
  capturedPieces: { w: PieceType[]; b: PieceType[] };
  materialAdvantage: number;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  isAiThinking: boolean;
  onSetGameMode: (mode: GameMode) => void;
  onSetAiDifficulty: (diff: AIDifficulty) => void;
}

const PIECE_SYMBOLS: Record<PieceType, { white: string; black: string }> = {
  p: { white: '♙', black: '♟' },
  n: { white: '♘', black: '♞' },
  b: { white: '♗', black: '♝' },
  r: { white: '♖', black: '♜' },
  q: { white: '♕', black: '♛' },
  k: { white: '♔', black: '♚' },
};

export const GameHUD: React.FC<GameHUDProps> = ({
  turn,
  capturedPieces,
  materialAdvantage,
  gameMode,
  aiDifficulty,
  isAiThinking,
  onSetGameMode,
  onSetAiDifficulty,
}) => {
  return (
    <div className="fixed bottom-4 left-4 z-20 flex flex-col gap-2 max-w-sm select-none pointer-events-none">
      {/* Player White & Black Cards */}
      <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-[#0d121f]/85 backdrop-blur-md border border-white/10 shadow-xl pointer-events-auto">
        {/* Opponent (Black) */}
        <div
          className={clsx(
            'flex items-center justify-between p-2 rounded-xl transition-all duration-300',
            turn === 'b'
              ? 'bg-slate-800/80 border border-slate-600/50 shadow-inner'
              : 'bg-transparent'
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-200">
              {gameMode === 'ai' ? (
                isAiThinking ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                ) : (
                  <Bot className="w-4 h-4 text-cyan-400" />
                )
              ) : (
                <User className="w-4 h-4 text-slate-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200">
                  {gameMode === 'ai' ? `Engine (${aiDifficulty})` : 'Black Player'}
                </span>
                {materialAdvantage < 0 && (
                  <span className="text-[10px] font-mono px-1 rounded bg-slate-700 text-amber-300">
                    +{Math.abs(materialAdvantage)}
                  </span>
                )}
              </div>
              {/* Captured pieces taken by Black (White pieces captured) */}
              <div className="flex items-center gap-0.5 text-base text-slate-400 min-h-[18px]">
                {capturedPieces.w.map((pt, i) => (
                  <span key={i} className="leading-none text-slate-300">
                    {PIECE_SYMBOLS[pt].white}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {turn === 'b' && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">
              {isAiThinking ? 'Thinking...' : 'Turn'}
            </span>
          )}
        </div>

        <div className="h-px bg-white/5 mx-1" />

        {/* Player (White) */}
        <div
          className={clsx(
            'flex items-center justify-between p-2 rounded-xl transition-all duration-300',
            turn === 'w'
              ? 'bg-amber-500/10 border border-amber-500/30 shadow-inner'
              : 'bg-transparent'
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <User className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200">White Player</span>
                {materialAdvantage > 0 && (
                  <span className="text-[10px] font-mono px-1 rounded bg-amber-500/20 text-amber-300">
                    +{materialAdvantage}
                  </span>
                )}
              </div>
              {/* Captured pieces taken by White (Black pieces captured) */}
              <div className="flex items-center gap-0.5 text-base text-slate-400 min-h-[18px]">
                {capturedPieces.b.map((pt, i) => (
                  <span key={i} className="leading-none text-slate-400">
                    {PIECE_SYMBOLS[pt].black}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {turn === 'w' && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
              Turn
            </span>
          )}
        </div>

        {/* Game Mode Selector pill */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
            <button
              onClick={() => onSetGameMode('pvp')}
              className={clsx(
                'flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all',
                gameMode === 'pvp'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Swords className="w-3 h-3" />
              <span>Pass & Play</span>
            </button>
            <button
              onClick={() => onSetGameMode('ai')}
              className={clsx(
                'flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all',
                gameMode === 'ai'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <BrainCircuit className="w-3 h-3" />
              <span>vs Engine</span>
            </button>
          </div>

          {/* AI Difficulty dropdown if in AI mode */}
          {gameMode === 'ai' && (
            <div className="flex items-center gap-1">
              {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => onSetAiDifficulty(diff)}
                  className={clsx(
                    'px-1.5 py-0.5 text-[10px] font-bold uppercase rounded transition-all',
                    aiDifficulty === diff
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-800/60'
                  )}
                >
                  {diff[0]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Helpful 3D Navigation Controls Hint */}
      <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/5 text-[11px] text-slate-400 pointer-events-auto">
        <span>🖱️ <strong className="text-slate-300">Left Click</strong>: Select / Move</span>
        <span>🔄 <strong className="text-slate-300">Right Click + Drag</strong>: Rotate Orbit</span>
        <span>🔍 <strong className="text-slate-300">Scroll</strong>: Zoom</span>
      </div>
    </div>
  );
};
