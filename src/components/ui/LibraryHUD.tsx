import React, { useState, useEffect, useRef } from 'react';
import { List, Clock, RotateCcw, Flag, Home, ArrowRight } from 'lucide-react';
import type { MoveRecord, PieceType, PieceColor, BotConfig } from '../../types/chess';
import { clsx } from 'clsx';

interface LibraryHUDProps {
  turn: PieceColor;
  moves: MoveRecord[];
  capturedWhite: PieceType[]; // White pieces captured by opponent
  capturedBlack: PieceType[]; // Black pieces captured by player
  onUndo: () => void;
  onResign: () => void;
  isGameOver: boolean;
  opponent?: BotConfig | null;
  onExitToLanding?: () => void;
}

// Miniature Monochrome SVG Icons for Captured Pieces (Matches Reference Screenshot)
const PieceIcon: React.FC<{ type: PieceType }> = ({ type }) => {
  switch (type) {
    case 'p':
      return (
        <svg className="w-3.5 h-3.5 text-slate-400 stroke-current fill-none stroke-[1.6]" viewBox="0 0 24 24">
          <circle cx="12" cy="7" r="3" />
          <path d="M7 19c0-3.5 2-6 5-6s5 2.5 5 6" />
          <line x1="6" y1="21" x2="18" y2="21" />
        </svg>
      );
    case 'n':
      return (
        <svg className="w-3.5 h-3.5 text-slate-400 stroke-current fill-none stroke-[1.6]" viewBox="0 0 24 24">
          <path d="M19 21H5c0-4 3-7 3-10 0-1.5 1-4 3-4s2 1 2 2c1-2 3-2 4-1 2 2 2 6 2 9v4z" />
          <circle cx="14" cy="9" r="1" fill="currentColor" />
        </svg>
      );
    case 'b':
      return (
        <svg className="w-3.5 h-3.5 text-slate-400 stroke-current fill-none stroke-[1.6]" viewBox="0 0 24 24">
          <path d="M12 4v2m-4 15h8c0-4-1.5-6-2.5-8C15 10 15 7 12 7s-3 3-1.5 6c-1 2-2.5 4-2.5 8z" />
          <circle cx="12" cy="3" r="1" />
        </svg>
      );
    case 'r':
      return (
        <svg className="w-3.5 h-3.5 text-slate-400 stroke-current fill-none stroke-[1.6]" viewBox="0 0 24 24">
          <path d="M5 21h14v-4H5v4zM7 7h10v10H7V7zM6 4h3v3H6V4zm4.5 0h3v3h-3V4zm4.5 0h3v3h-3V4z" />
        </svg>
      );
    case 'q':
      return (
        <svg className="w-3.5 h-3.5 text-slate-400 stroke-current fill-none stroke-[1.6]" viewBox="0 0 24 24">
          <circle cx="6" cy="7" r="1.5" />
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="18" cy="7" r="1.5" />
          <path d="M5 20h14l-2-9-5 4-5-4-2 9z" />
          <line x1="4" y1="21" x2="20" y2="21" />
        </svg>
      );
    case 'k':
      return (
        <svg className="w-3.5 h-3.5 text-slate-400 stroke-current fill-none stroke-[1.6]" viewBox="0 0 24 24">
          <line x1="12" y1="3" x2="12" y2="7" />
          <line x1="10" y1="5" x2="14" y2="5" />
          <path d="M7 21h10v-3l-2-3c1-2 1-5-3-5s-4 3-3 5l-2 3v3z" />
        </svg>
      );
    default:
      return null;
  }
};

export const LibraryHUD: React.FC<LibraryHUDProps> = ({
  turn,
  moves,
  capturedWhite,
  capturedBlack,
  onUndo,
  onResign,
  isGameOver,
  opponent,
  onExitToLanding,
}) => {
  // Clocks: Initial 10:00 (or 08:45 / 09:12 to match reference image)
  const [whiteTime, setWhiteTime] = useState<number>(525); // 08:45
  const [blackTime, setBlackTime] = useState<number>(552); // 09:12
  const scrollRef = useRef<HTMLDivElement>(null);

  // Active clock countdown
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      if (turn === 'w') {
        setWhiteTime((prev) => Math.max(0, prev - 1));
      } else {
        setBlackTime((prev) => Math.max(0, prev - 1));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [turn, isGameOver]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Group moves into turns (1. e4 e5)
  const turnRows: { num: number; white?: MoveRecord; black?: MoveRecord }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    turnRows.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  // Auto-scroll move history to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves]);

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-40 overflow-hidden font-sans">
      {/* 1. Top Bar: Minimal Header + Exit to Landing Button */}
      <div className="absolute top-6 left-8 pointer-events-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-light text-base">—</span>
          <h1 className="text-sm font-normal tracking-wide text-slate-200/90 drop-shadow-md">
            Classic Chess
          </h1>
        </div>

        {onExitToLanding && (
          <button
            onClick={onExitToLanding}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(18,18,20,0.8)] backdrop-blur-[16px] border border-emerald-500/30 text-xs font-semibold text-emerald-300 hover:text-white hover:border-emerald-400 hover:bg-emerald-950/40 transition-all shadow-lg cursor-pointer"
            title="خروج و بازگشت به صفحه اصلی سایت"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="font-['Vazirmatn']">خروج به صفحه اصلی</span>
            <Home className="w-3.5 h-3.5 opacity-70" />
          </button>
        )}
      </div>

      {/* 2. Right Sidebar: Frosted Glass Move History Panel */}
      <aside className="absolute top-6 right-6 bottom-6 w-52 rounded-2xl bg-[rgba(18,18,20,0.75)] backdrop-blur-[16px] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto p-4 overflow-hidden">
        {/* Top Header with Hamburger/List Icon */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Notation</span>
          <button className="p-1 rounded-md text-slate-400 hover:text-white transition-colors">
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Two-Column Algebraic Notation Move History */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
          {turnRows.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
              <span className="text-lg opacity-40 mb-1">♟</span>
              <p className="text-[11px] font-sans">Game begins</p>
            </div>
          ) : (
            turnRows.map((tr) => {
              const isWhiteLatest = moves.length % 2 === 1 && moves[moves.length - 1] === tr.white;
              const isBlackLatest = moves.length % 2 === 0 && moves[moves.length - 1] === tr.black;

              return (
                <div key={tr.num} className="flex items-center text-slate-300 py-0.5">
                  <span className="text-slate-500 w-7 text-right pr-2 text-[11px]">{tr.num}.</span>
                  <div className="flex-1 grid grid-cols-2 gap-1.5">
                    {/* White Move */}
                    <span
                      className={clsx(
                        'px-1.5 py-0.5 rounded text-left',
                        isWhiteLatest
                          ? 'bg-white/10 text-white font-semibold'
                          : 'text-slate-300'
                      )}
                    >
                      {tr.white?.san || ''}
                    </span>
                    {/* Black Move */}
                    <span
                      className={clsx(
                        'px-1.5 py-0.5 rounded text-left',
                        isBlackLatest
                          ? 'bg-white/10 text-white font-semibold'
                          : 'text-slate-300'
                      )}
                    >
                      {tr.black?.san || ''}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* 3. Bottom HUD Elements */}
      <div className="absolute bottom-6 left-8 right-64 flex items-end justify-between pointer-events-none">
        {/* Left Side: Player 1 (Blue) Card & Captured Tray */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {/* Main Player Pill Card */}
          <div className="flex items-center gap-3.5 px-4 py-2 rounded-full bg-[rgba(18,18,20,0.75)] backdrop-blur-[16px] border border-white/10 shadow-2xl">
            {/* 3D Boy Avatar (Blue Collar) */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 ring-1 ring-white/20 flex items-center justify-center shadow-inner">
              <svg className="w-7 h-7" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="14" r="7" fill="#fcd34d" />
                <path d="M12 9c0-3 3-5 6-5s6 2 6 5c0 1-1 2-2 2h-8c-1 0-2-1-2-2z" fill="#78350f" />
                <circle cx="15.5" cy="14" r="1" fill="#1e293b" />
                <circle cx="20.5" cy="14" r="1" fill="#1e293b" />
                <path d="M16 17c1 1 3 1 4 0" stroke="#b45309" strokeWidth="1" strokeLinecap="round" />
                <path d="M9 30c0-5 4-8 9-8s9 3 9 8" fill="#3b82f6" />
              </svg>
            </div>

            {/* Status & Player Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-100">Blue&apos;s Turn</span>
                <span
                  className={clsx(
                    'w-2 h-2 rounded-full',
                    turn === 'w'
                      ? 'bg-blue-400 shadow-[0_0_8px_#38bdf8] animate-pulse'
                      : 'bg-slate-600'
                  )}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Player 1</span>
            </div>

            {/* Clock */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-white/10 text-slate-300 font-mono text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTime(whiteTime)}</span>
            </div>
          </div>

          {/* Secondary Sub-Capsule: Monochrome SVG Icons of Captured Pieces (NO numbers or text multipliers) */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(18,18,20,0.65)] backdrop-blur-[16px] border border-white/5 w-fit shadow-lg min-h-[26px]">
            {capturedBlack.length === 0 ? (
              <span className="text-[10px] text-slate-500 font-sans px-1">No captures</span>
            ) : (
              capturedBlack.map((pt, i) => <PieceIcon key={i} type={pt} />)
            )}
          </div>
        </div>

        {/* Center Bottom: Action Pill Buttons (↶ Undo and ⚐ Resign) */}
        <div className="flex items-center gap-3 pointer-events-auto pb-2">
          <button
            onClick={onUndo}
            disabled={moves.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[rgba(18,18,20,0.75)] backdrop-blur-[16px] border border-white/10 text-xs font-medium text-slate-200 hover:text-white hover:border-white/25 hover:bg-[rgba(30,30,35,0.85)] transition-all shadow-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Undo</span>
          </button>

          <button
            onClick={onResign}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[rgba(18,18,20,0.75)] backdrop-blur-[16px] border border-white/10 text-xs font-medium text-slate-200 hover:text-rose-200 hover:border-rose-500/40 hover:bg-rose-950/20 transition-all shadow-xl cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5 text-slate-400" />
            <span>Resign</span>
          </button>
        </div>

        {/* Right Side: Opponent (Player 2) Card & Captured Tray */}
        <div className="flex flex-col items-end gap-1.5 pointer-events-auto">
          {/* Main Opponent Pill Card */}
          <div className="flex items-center gap-3.5 px-4 py-2 rounded-full bg-[rgba(18,18,20,0.75)] backdrop-blur-[16px] border border-white/10 shadow-2xl">
            {/* 3D Boy Avatar (Pink Cap) */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-rose-200 via-rose-300 to-rose-400 ring-1 ring-white/20 flex items-center justify-center shadow-inner">
              <svg className="w-7 h-7" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="14" r="7" fill="#fed7aa" />
                <path d="M11 11c0-4 3-6 7-6s7 2 7 6c0 1 2 2 3 2v2H11v-4z" fill="#f43f5e" />
                <circle cx="15.5" cy="15" r="1" fill="#1e293b" />
                <circle cx="20.5" cy="15" r="1" fill="#1e293b" />
                <path d="M16 18c1 1 3 1 4 0" stroke="#9a3412" strokeWidth="1" strokeLinecap="round" />
                <path d="M9 30c0-5 4-8 9-8s9 3 9 8" fill="#ec4899" />
              </svg>
            </div>

            {/* Status & Player Info */}
            <div className="flex flex-col text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span
                  className={clsx(
                    'w-2 h-2 rounded-full',
                    turn === 'b'
                      ? 'bg-rose-400 shadow-[0_0_8px_#fb7185] animate-pulse'
                      : 'bg-slate-600'
                  )}
                />
                <span className="text-xs font-semibold text-slate-100 font-['Vazirmatn']">
                  {opponent ? opponent.name : 'حریف'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium font-['Vazirmatn']">
                {opponent ? `${opponent.nameEn} • ${opponent.tag}` : 'Black'}
              </span>
            </div>

            {/* Clock */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-white/10 text-slate-300 font-mono text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTime(blackTime)}</span>
            </div>
          </div>

          {/* Secondary Sub-Capsule: Captured Pieces Tray */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(18,18,20,0.65)] backdrop-blur-[16px] border border-white/5 w-fit shadow-lg min-h-[26px]">
            {capturedWhite.length === 0 ? (
              <span className="text-[10px] text-slate-500 font-sans px-1">No captures</span>
            ) : (
              capturedWhite.map((pt, i) => <PieceIcon key={i} type={pt} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
