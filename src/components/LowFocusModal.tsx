import React, { useState, useEffect } from 'react';
import { X, Play, Pause, CheckCircle2, RotateCcw, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { MicroTask } from '../types';
import { playTaskDoneSound, playFocusStartSound } from '../utils/sound';

interface LowFocusModalProps {
  currentTask: MicroTask | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskCompleted: (taskId: string) => void;
}

export const LowFocusModal: React.FC<LowFocusModalProps> = ({
  currentTask,
  isOpen,
  onClose,
  onTaskCompleted,
}) => {
  // Ultra small steps progression
  const [stepIndex, setStepIndex] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(5); // 3, 5 or 10 min
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Derive micro-steps from current task or default micro-steps
  const microSteps = currentTask
    ? [
        `Paso 1: Siéntate cómodo, bebe un trago de agua y solo abre la app o documento de: "${currentTask.title}"`,
        `Paso 2: Escribe solo la primera frase o prepara un borrador de 1 minuto sin juzgar el resultado`,
        `Paso 3: Continúa 3 minutos más en ritmo suave antes de parar`,
      ]
    : [
        'Paso 1: Deja el móvil a un lado, respira hondo y siéntate frente a tu espacio de trabajo',
        'Paso 2: Haz una sola acción física concreta de 2 minutos',
        'Paso 3: Marca el paso como completado y descansa',
      ];

  // Sync timer when duration changes
  useEffect(() => {
    setTimeLeft(durationMinutes * 60);
    setIsRunning(false);
  }, [durationMinutes, stepIndex]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playTaskDoneSound();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStepDone = () => {
    playTaskDoneSound();
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      if (stepIndex < microSteps.length - 1) {
        setStepIndex(stepIndex + 1);
      } else {
        if (currentTask) {
          onTaskCompleted(currentTask.id);
        }
        setStepIndex(0);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-6 overflow-hidden animate-fade-in select-none">
      {/* Top minimal control */}
      <div className="w-full max-w-sm flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Modo Baja Concentración
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          title="Salir del modo"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Single Action Area */}
      <div className="w-full max-w-sm flex-1 flex flex-col justify-center items-center text-center px-2 py-4">
        {/* Step indicator */}
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Micro-paso {stepIndex + 1} de {microSteps.length}
        </span>

        {/* The single concrete micro-step */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-2xl relative w-full mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-white leading-relaxed tracking-tight">
            {microSteps[stepIndex]}
          </h3>

          <p className="text-xs text-slate-400 mt-3 font-medium">
            Sin metas grandes. Solo este pequeño movimiento físico.
          </p>

          {showCelebration && (
            <div className="absolute inset-0 bg-teal-950/95 border border-teal-500/50 rounded-3xl flex flex-col items-center justify-center p-4 animate-in fade-in">
              <CheckCircle2 className="w-12 h-12 text-teal-400 mb-2 animate-bounce" />
              <p className="text-base font-bold text-teal-200">
                ¡Paso superado sin fricción!
              </p>
              <p className="text-xs text-teal-300/80 mt-1">
                Preparando el siguiente micropaso...
              </p>
            </div>
          )}
        </div>

        {/* Short Timer display */}
        <div className="my-2">
          <div className="text-6xl sm:text-7xl font-mono font-black text-slate-100 tracking-tight">
            {formatTime(timeLeft)}
          </div>

          {/* Duration selector: 3m, 5m, 10m */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[3, 5, 10].map((mins) => (
              <button
                key={mins}
                onClick={() => setDurationMinutes(mins)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                  durationMinutes === mins
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>

        {/* Timer controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => {
              if (!isRunning) playFocusStartSound();
              setIsRunning(!isRunning);
            }}
            className="w-14 h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
          >
            {isRunning ? (
              <Pause className="w-7 h-7 fill-slate-950" />
            ) : (
              <Play className="w-7 h-7 fill-slate-950 ml-0.5" />
            )}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(durationMinutes * 60);
            }}
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center active:scale-95 transition-transform"
            title="Reiniciar temporizador"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom single action button: Only Next Step */}
      <div className="w-full max-w-sm pb-4">
        <button
          onClick={handleStepDone}
          className="w-full bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <CheckCircle2 className="w-5 h-5 text-teal-400" />
          <span>
            {stepIndex < microSteps.length - 1
              ? 'Listo → Ver siguiente micropaso'
              : 'Completar tarea y salir'}
          </span>
        </button>

        <p className="text-center text-[10px] text-slate-500 mt-2">
          Cero culpa. Avanzar 1 milímetro ya es una victoria con TDAH.
        </p>
      </div>
    </div>
  );
};
