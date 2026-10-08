import React from 'react';
import { Play, CheckCircle2, Split, Clock, Bell, Sparkles, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { MicroTask, FocusLevel, SmartReminder, MedicationDose } from '../types';
import { playTaskDoneSound } from '../utils/sound';

interface NowViewProps {
  currentTask: MicroTask | null;
  onCompleteTask: (taskId: string) => void;
  onBreakdownTask: (task: MicroTask) => void;
  currentFocus: FocusLevel;
  onSetFocus: (level: FocusLevel) => void;
  nextReminder: SmartReminder | null;
  medications: MedicationDose[];
  onTakeMedication: (id: string) => void;
  onStartFocusSession: (task: MicroTask | null) => void;
  onOpenLowFocusMode: () => void;
  onSelectNextTask: () => void;
}

export const NowView: React.FC<NowViewProps> = ({
  currentTask,
  onCompleteTask,
  onBreakdownTask,
  currentFocus,
  onSetFocus,
  nextReminder,
  medications,
  onTakeMedication,
  onStartFocusSession,
  onOpenLowFocusMode,
  onSelectNextTask,
}) => {
  // Find if there is a pending medication scheduled soon
  const pendingMed = medications.find((m) => !m.taken);

  const focusLevels: { id: FocusLevel; label: string; desc: string; color: string; border: string; bg: string }[] = [
    { id: 'alta', label: 'Alta', desc: 'Buen ritmo', color: 'text-emerald-300', border: 'border-emerald-500/40', bg: 'bg-emerald-950/40' },
    { id: 'media', label: 'Media', desc: 'Estable', color: 'text-cyan-300', border: 'border-cyan-500/40', bg: 'bg-cyan-950/40' },
    { id: 'baja', label: 'Baja', desc: 'Fatiga', color: 'text-amber-300', border: 'border-amber-500/40', bg: 'bg-amber-950/40' },
    { id: 'disperso', label: 'Disperso', desc: 'Niebla mental', color: 'text-rose-300', border: 'border-rose-500/40', bg: 'bg-rose-950/40' },
  ];

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* 1. Header context / reassurance */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-teal-400">
            Foco Inmediato
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            AHORA
          </h2>
        </div>
        <button
          onClick={onOpenLowFocusMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 transition-transform active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 fill-amber-400" />
          Modo baja concentración
        </button>
      </div>

      {/* 2. Próxima Tarea & Bloque de Trabajo Actual */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 border border-teal-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
            Próxima Tarea
          </span>

          {currentTask?.timeBlock ? (
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1 bg-slate-800/80 px-2.5 py-0.5 rounded-full">
              <Clock className="w-3 h-3 text-teal-400" />
              Bloque: {currentTask.timeBlock}
            </span>
          ) : (
            <span className="text-xs text-slate-500 font-medium">
              Bloque sugerido: 20 min
            </span>
          )}
        </div>

        {currentTask ? (
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug tracking-tight mb-2">
              {currentTask.title}
            </h3>

            {currentTask.notes && (
              <p className="text-xs text-slate-400 mb-3 bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
                💡 <span className="font-medium text-slate-300">Pauta:</span> {currentTask.notes}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => {
                  playTaskDoneSound();
                  onCompleteTask(currentTask.id);
                }}
                className="flex-1 bg-slate-800 hover:bg-slate-700/80 text-teal-300 border border-teal-500/30 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                Marcar Hecho
              </button>

              <button
                onClick={() => onBreakdownTask(currentTask)}
                className="bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700 font-medium py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                title="Dividir en micro-pasos de menor fricción con IA"
              >
                <Split className="w-3.5 h-3.5 text-amber-400" />
                Dividir en micro-pasos
              </button>

              <button
                onClick={onSelectNextTask}
                className="bg-slate-800/60 hover:bg-slate-800 text-slate-400 font-medium py-2 px-2.5 rounded-xl text-xs flex items-center justify-center transition-colors"
                title="Ver otra tarea de hoy"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-slate-300 font-medium text-sm">
              ¡No hay tareas pendientes para este momento!
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Tu mente está libre. Añade una tarea rápida o descansa sin culpa.
            </p>
            <button
              onClick={onSelectNextTask}
              className="mt-3 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs px-3.5 py-1.5 rounded-xl font-medium"
            >
              Revisar plan del día
            </button>
          </div>
        )}
      </div>

      {/* 3. Estado de Concentración */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Estado de Concentración
          </span>
          <span className="text-[11px] text-slate-500">
            Adaptamos la pauta a tu energía
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {focusLevels.map((lvl) => {
            const isSelected = currentFocus === lvl.id;
            return (
              <button
                key={lvl.id}
                onClick={() => onSetFocus(lvl.id)}
                className={`py-2 px-1 rounded-xl text-center border transition-all active:scale-95 flex flex-col items-center justify-center ${
                  isSelected
                    ? `${lvl.bg} ${lvl.border} ring-2 ring-teal-500/30`
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40'
                }`}
              >
                <span className={`text-xs font-bold ${isSelected ? lvl.color : 'text-slate-300'}`}>
                  {lvl.label}
                </span>
                <span className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                  {lvl.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Próximo Recordatorio */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Próximo Recordatorio
          </span>
          <span className="text-[11px] text-teal-400/90 font-medium">
            {pendingMed ? `Próxima dosis: ${pendingMed.scheduledTime}` : 'Al día'}
          </span>
        </div>

        {pendingMed ? (
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {pendingMed.medicationName} · {pendingMed.scheduledTime}
                </p>
                <p className="text-[11px] text-emerald-300/80">
                  Importante para sostener tus funciones ejecutivas
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                playTaskDoneSound();
                onTakeMedication(pendingMed.id);
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 transition-transform active:scale-95"
            >
              Tomado
            </button>
          </div>
        ) : nextReminder ? (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {nextReminder.title} ({nextReminder.time})
                </p>
                <p className="text-[11px] text-slate-400">
                  {nextReminder.subtitle || 'Pausa saludable'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-1 rounded-md shrink-0">
              Programado
            </span>
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-1">
            Todo en orden. Próxima pausa recomendada en 25 minutos.
          </div>
        )}
      </div>

      {/* 5. Acción Principal: "EMPEZAR" */}
      <div className="pt-2">
        <button
          onClick={() => onStartFocusSession(currentTask)}
          className="w-full bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-black text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-teal-500/25 transition-all transform active:scale-[0.98] border border-teal-300/40"
        >
          <Play className="w-6 h-6 fill-slate-950" />
          <span>Empezar ({currentTask?.durationMinutes || 20} min)</span>
        </button>
        <p className="text-center text-[11px] text-slate-500 mt-2 font-medium">
          Temporizador Pomodoro con sonido suave y sin distracciones
        </p>
      </div>

      {/* 6. Quick Low Focus Helper Banner */}
      <div
        onClick={onOpenLowFocusMode}
        className="cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-200">
              ¿Sientes bloqueo o resistencia?
            </h4>
            <p className="text-[11px] text-slate-400">
              Activa el modo rescate: solo 1 micro-paso de 5 min para romper la inercia.
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
      </div>
    </div>
  );
};
