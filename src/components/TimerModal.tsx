import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle2, Coffee, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { MicroTask } from '../types';
import { playTaskDoneSound, playFocusStartSound } from '../utils/sound';

interface TimerModalProps {
  task: MicroTask | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskId: string) => void;
}

export const TimerModal: React.FC<TimerModalProps> = ({
  task,
  isOpen,
  onClose,
  onComplete,
}) => {
  const initialDuration = task?.durationMinutes || 20;
  const [timeLeft, setTimeLeft] = useState(initialDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const duration = isBreak ? 5 : task?.durationMinutes || 20;
      setTimeLeft(duration * 60);
      setIsRunning(true);
      playFocusStartSound();
    }
  }, [isOpen, task, isBreak]);

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

  const totalTime = (isBreak ? 5 : task?.durationMinutes || 20) * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalTime - timeLeft) / totalTime) * 100));

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleFinishEarly = () => {
    playTaskDoneSound();
    if (task) {
      onComplete(task.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-6 select-none animate-fade-in">
      {/* Top Header */}
      <div className="w-full max-w-sm mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isBreak ? 'bg-cyan-400' : 'bg-teal-400'} animate-ping`} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {isBreak ? 'Pausa Cognitiva (5 min)' : 'Bloque de Foco Activo'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Focus Dial */}
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col items-center justify-center text-center py-6">
        {/* Task Title */}
        <div className="mb-6 max-w-xs">
          <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-widest block mb-1">
            {isBreak ? 'Relaja la mirada' : 'Misión actual'}
          </span>
          <h3 className="text-xl font-bold text-white line-clamp-2">
            {isBreak ? 'Descanso visual y respiración profunda' : task?.title || 'Foco concentrado'}
          </h3>
        </div>

        {/* Circular Progress & Time Display */}
        <div className="relative w-64 h-64 flex items-center justify-center my-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-900"
              fill="transparent"
            />
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 110}
              strokeDashoffset={2 * Math.PI * 110 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className={`transition-all duration-1000 ${
                isBreak ? 'text-cyan-400' : 'text-teal-400'
              }`}
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-mono font-black text-white tracking-tight">
              {displayTime}
            </span>
            <span className="text-xs text-slate-400 mt-1 font-medium">
              {isRunning ? 'En curso' : 'En pausa'}
            </span>
          </div>
        </div>

        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => {
              if (!isRunning) playFocusStartSound();
              setIsRunning(!isRunning);
            }}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-slate-950 transition-transform active:scale-95 shadow-xl ${
              isBreak
                ? 'bg-cyan-400 hover:bg-cyan-300 shadow-cyan-400/25'
                : 'bg-teal-400 hover:bg-teal-300 shadow-teal-400/25'
            }`}
          >
            {isRunning ? (
              <Pause className="w-8 h-8 fill-slate-950" />
            ) : (
              <Play className="w-8 h-8 fill-slate-950 ml-1" />
            )}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft((isBreak ? 5 : task?.durationMinutes || 20) * 60);
            }}
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center active:scale-95 transition-transform"
            title="Reiniciar bloque"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle Break button */}
        <button
          onClick={() => setIsBreak(!isBreak)}
          className="mt-4 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 py-1 px-3 rounded-full bg-slate-900/60 border border-slate-800"
        >
          <Coffee className="w-3.5 h-3.5 text-amber-400" />
          {isBreak ? 'Volver al bloque de foco' : 'Cambiar a pausa de 5 min'}
        </button>
      </div>

      {/* Bottom Completion Action */}
      <div className="w-full max-w-sm mx-auto">
        <button
          onClick={handleFinishEarly}
          className="w-full bg-slate-900 hover:bg-slate-800/90 border border-teal-500/40 text-teal-300 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <CheckCircle2 className="w-5 h-5 text-teal-400" />
          Marcar como completado
        </button>
      </div>
    </div>
  );
};
