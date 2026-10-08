import React from 'react';
import { Sparkles, Zap, Brain } from 'lucide-react';
import { FocusLevel } from '../types';

interface HeaderProps {
  currentFocus: FocusLevel;
  onSetFocus: (level: FocusLevel) => void;
  onOpenLowFocusMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentFocus,
  onSetFocus,
  onOpenLowFocusMode,
}) => {
  const [showFocusMenu, setShowFocusMenu] = React.useState(false);

  const focusConfig: Record<FocusLevel, { label: string; color: string; bg: string; dot: string }> = {
    alta: { label: 'Foco Alto', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-400' },
    media: { label: 'Foco Medio', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30', dot: 'bg-cyan-400' },
    baja: { label: 'Foco Bajo', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', dot: 'bg-amber-400' },
    disperso: { label: 'Disperso', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', dot: 'bg-rose-400' },
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-teal-500/20">
            <Brain className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              Focus TDAH
            </h1>
            <span className="text-[10px] text-slate-400 font-medium block -mt-0.5">
              Asistente ejecutivo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Concentration Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFocusMenu(!showFocusMenu)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${focusConfig[currentFocus].bg}`}
              title="Cambiar estado de concentración"
            >
              <span className={`w-2 h-2 rounded-full ${focusConfig[currentFocus].dot} animate-pulse`} />
              <span className={focusConfig[currentFocus].color}>
                {focusConfig[currentFocus].label}
              </span>
            </button>

            {showFocusMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-2.5 py-1 text-[10px] uppercase font-semibold text-slate-500">
                  Estado actual
                </div>
                {(['alta', 'media', 'baja', 'disperso'] as FocusLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      onSetFocus(level);
                      setShowFocusMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors hover:bg-slate-800 ${
                      currentFocus === level ? 'text-white font-semibold bg-slate-800/50' : 'text-slate-400'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${focusConfig[level].dot}`} />
                    {focusConfig[level].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Low Focus Quick Rescue Button */}
          <button
            onClick={onOpenLowFocusMode}
            className="flex items-center gap-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 shadow-sm"
            title="Activar modo baja concentración"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="hidden sm:inline">Modo</span> Rescate
          </button>
        </div>
      </div>
    </header>
  );
};
