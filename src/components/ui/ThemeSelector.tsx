import React from 'react';
import { X, Check, Sliders, Sparkles, Volume2, Grid, Target, Compass } from 'lucide-react';
import { BOARD_THEMES } from '../../types/theme';
import type { BoardTheme } from '../../types/theme';
import type { GameSettings } from '../../types/chess';
import { clsx } from 'clsx';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  onSelectTheme: (theme: BoardTheme) => void;
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0f1422] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Studio & Board Customization</h2>
              <p className="text-xs text-slate-400">Personalize materials, lighting, and visuals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Board & Piece Themes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Board & Piece Aesthetics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(BOARD_THEMES).map((theme) => {
                const isSelected = theme.id === currentThemeId;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onSelectTheme(theme)}
                    className={clsx(
                      'relative flex flex-col p-3 rounded-xl border text-left transition-all group',
                      isSelected
                        ? 'bg-slate-800/90 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                        : 'bg-slate-900/50 border-white/5 hover:border-white/20 hover:bg-slate-850'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                          {theme.name}
                        </span>
                        {theme.id === 'wizards_sanctuary' && (
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Premier
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Color Swatch Preview */}
                    <div className="flex items-center gap-1.5 mb-2">
                      {/* Light square */}
                      <div
                        className="w-5 h-5 rounded border border-white/10"
                        style={{ backgroundColor: theme.lightSquare }}
                        title="Light Square"
                      />
                      {/* Dark square */}
                      <div
                        className="w-5 h-5 rounded border border-white/10"
                        style={{ backgroundColor: theme.darkSquare }}
                        title="Dark Square"
                      />
                      {/* Light piece */}
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: theme.lightPiece }}
                        title="White Pieces"
                      />
                      {/* Dark piece */}
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: theme.darkPiece }}
                        title="Black Pieces"
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {theme.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gameplay & Board Visual Settings */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Gameplay Preferences
            </h3>

            <div className="space-y-2">
              {/* Legal Move Highlights */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:border-white/10 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Legal Move Highlights</span>
                    <p className="text-[11px] text-slate-400">Show dots and capture rings for valid moves</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showLegalMoves}
                  onChange={(e) => onUpdateSettings({ showLegalMoves: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              {/* Show Coordinates */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:border-white/10 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Grid className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Board Coordinates</span>
                    <p className="text-[11px] text-slate-400">Display Rank (1-8) and File (A-H) on border</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showCoordinates}
                  onChange={(e) => onUpdateSettings({ showCoordinates: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              {/* Sound Effects */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:border-white/10 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Synthesized Sound Effects</span>
                    <p className="text-[11px] text-slate-400">Tactile Web Audio clicks, captures, and alerts</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              {/* Auto Rotate Camera */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:border-white/10 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Compass className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Orbit Showcase Mode</span>
                    <p className="text-[11px] text-slate-400">Slowly rotate camera around 3D board</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoRotateCamera}
                  onChange={(e) => onUpdateSettings({ autoRotateCamera: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-white/10 bg-slate-900/60">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
