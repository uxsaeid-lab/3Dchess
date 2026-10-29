import React from 'react';
import {
  RotateCcw,
  Undo2,
  Volume2,
  VolumeX,
  Palette,
  Compass,
  ScrollText,
} from 'lucide-react';
import type { CameraPreset, GameStatus } from '../../types/chess';
import { clsx } from 'clsx';

interface HeaderProps {
  turn: 'w' | 'b';
  gameStatus: GameStatus;
  moveCount: number;
  cameraPreset: CameraPreset;
  autoRotate: boolean;
  soundEnabled: boolean;
  historyOpen: boolean;
  onNewGame: () => void;
  onUndo: () => void;
  onCameraChange: (preset: CameraPreset) => void;
  onToggleAutoRotate: () => void;
  onToggleSound: () => void;
  onToggleHistory: () => void;
  onOpenThemeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  turn,
  gameStatus,
  moveCount,
  cameraPreset,
  autoRotate,
  soundEnabled,
  historyOpen,
  onNewGame,
  onUndo,
  onCameraChange,
  onToggleAutoRotate,
  onToggleSound,
  onToggleHistory,
  onOpenThemeModal,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-[#0a0d14]/80 backdrop-blur-md border-b border-white/10 shadow-lg select-none">
      {/* Brand logo & tagline */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 shadow-md shadow-amber-500/20 text-white font-black text-xl">
          <span>3D</span>
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-[#0a0d14] animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-400 bg-clip-text text-transparent">
              3dches.ir
            </h1>
            <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <span>Sanctuary</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Wizard's Gothic Sanctuary
          </p>
        </div>
      </div>

      {/* Middle status & turn pill */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-white/10 shadow-inner">
          <div
            className={clsx(
              'w-3 h-3 rounded-full transition-all duration-300 shadow-sm',
              turn === 'w'
                ? 'bg-amber-100 ring-2 ring-amber-300 shadow-amber-200'
                : 'bg-slate-900 ring-2 ring-slate-400 shadow-black'
            )}
          />
          <span className="text-xs font-semibold text-slate-200">
            {turn === 'w' ? 'White to Move' : 'Black to Move'}
          </span>
          <span className="text-[11px] text-slate-500 font-mono pl-1 border-l border-slate-700">
            Move #{Math.floor(moveCount / 2) + 1}
          </span>
        </div>

        {/* Check/Checkmate Warning Badge */}
        {gameStatus === 'check' && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Check!
          </div>
        )}
        {gameStatus === 'checkmate' && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/30 border border-red-500 text-red-200 text-xs font-bold">
            Checkmate!
          </div>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Camera Preset Quick Switch */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-900/90 border border-white/10">
          <button
            onClick={() => onCameraChange('white')}
            title="White Perspective"
            className={clsx(
              'px-2 py-1 text-xs font-medium rounded-md transition-colors',
              cameraPreset === 'white'
                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            )}
          >
            White
          </button>
          <button
            onClick={() => onCameraChange('black')}
            title="Black Perspective"
            className={clsx(
              'px-2 py-1 text-xs font-medium rounded-md transition-colors',
              cameraPreset === 'black'
                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            )}
          >
            Black
          </button>
          <button
            onClick={() => onCameraChange('top')}
            title="Top-down 2D View"
            className={clsx(
              'px-2 py-1 text-xs font-medium rounded-md transition-colors',
              cameraPreset === 'top'
                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            )}
          >
            Top
          </button>
          <button
            onClick={() => onCameraChange('isometric')}
            title="Isometric 3D View"
            className={clsx(
              'hidden md:block px-2 py-1 text-xs font-medium rounded-md transition-colors',
              cameraPreset === 'isometric'
                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            )}
          >
            Iso
          </button>
        </div>

        {/* Auto Rotate Button */}
        <button
          onClick={onToggleAutoRotate}
          title={autoRotate ? 'Disable Orbit Rotation' : 'Enable Orbit Rotation'}
          className={clsx(
            'p-2 rounded-lg border transition-all',
            autoRotate
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/20'
              : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
          )}
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Undo Button */}
        <button
          onClick={onUndo}
          title="Undo Move"
          disabled={moveCount === 0}
          className="p-2 rounded-lg bg-slate-900/80 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        {/* New Game Button */}
        <button
          onClick={onNewGame}
          title="Start New Game"
          className="p-2 rounded-lg bg-slate-900/80 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          className="p-2 rounded-lg bg-slate-900/80 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Move History Drawer Toggle */}
        <button
          onClick={onToggleHistory}
          title="Toggle Move History"
          className={clsx(
            'p-2 rounded-lg border transition-all',
            historyOpen
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
          )}
        >
          <ScrollText className="w-4 h-4" />
        </button>

        {/* Theme Settings Button */}
        <button
          onClick={onOpenThemeModal}
          title="Themes & Board Settings"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/30 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all font-semibold text-xs shadow-sm shadow-amber-500/10"
        >
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">Theme</span>
        </button>
      </div>
    </header>
  );
};
