import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, X, FileText } from 'lucide-react';
import type { MoveRecord } from '../../types/chess';
import { clsx } from 'clsx';

interface MoveHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  moves: MoveRecord[];
  fen: string;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  isOpen,
  onClose,
  moves,
  fen,
}) => {
  const [copiedType, setCopiedType] = useState<'pgn' | 'fen' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new move is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves]);

  // Generate PGN string from moves
  const generatePGN = () => {
    let pgn = '';
    for (let i = 0; i < moves.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const whiteMove = moves[i]?.san || '';
      const blackMove = moves[i + 1]?.san || '';
      pgn += `${moveNum}. ${whiteMove} ${blackMove ? blackMove + ' ' : ''}`;
    }
    return pgn.trim();
  };

  const handleCopy = (type: 'pgn' | 'fen') => {
    const text = type === 'pgn' ? generatePGN() : fen;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  if (!isOpen) return null;

  // Group moves into pairs (turns)
  const turns: { moveNumber: number; white?: MoveRecord; black?: MoveRecord }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    turns.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  return (
    <aside className="fixed top-18 right-4 bottom-4 z-20 w-72 flex flex-col rounded-2xl bg-[#0d121f]/90 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden select-none animate-in fade-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-slate-100">Move History</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Move List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-xs"
      >
        {turns.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
            <span className="text-2xl mb-1">♟</span>
            <p>No moves yet.</p>
            <p className="text-[11px] text-slate-600 mt-1">Make your first move on the board!</p>
          </div>
        ) : (
          turns.map((turn) => (
            <div
              key={turn.moveNumber}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="text-slate-500 w-8">{turn.moveNumber}.</span>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <span
                  className={clsx(
                    'font-medium',
                    turn.white ? 'text-amber-200' : 'text-slate-600'
                  )}
                >
                  {turn.white?.san || '—'}
                </span>
                <span
                  className={clsx(
                    'font-medium',
                    turn.black ? 'text-slate-300' : 'text-slate-600'
                  )}
                >
                  {turn.black?.san || '—'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Actions: Copy PGN & FEN */}
      <div className="p-3 border-t border-white/10 bg-slate-900/40 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleCopy('pgn')}
            disabled={moves.length === 0}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs font-semibold text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {copiedType === 'pgn' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy PGN</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleCopy('fen')}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs font-semibold text-slate-200 transition-all"
          >
            {copiedType === 'fen' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy FEN</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
