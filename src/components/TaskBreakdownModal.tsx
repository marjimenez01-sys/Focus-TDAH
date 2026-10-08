import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { MicroTask } from '../types';
import { playTaskDoneSound } from '../utils/sound';

interface TaskBreakdownModalProps {
  task: MicroTask | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyMicroSteps: (parentTaskId: string, microTasks: { title: string; durationMinutes: number }[]) => void;
}

export const TaskBreakdownModal: React.FC<TaskBreakdownModalProps> = ({
  task,
  isOpen,
  onClose,
  onApplyMicroSteps,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [breakdownData, setBreakdownData] = useState<{
    ultraQuickStarter: string;
    reassurance: string;
    microTasks: { title: string; durationMinutes: number }[];
  } | null>(null);

  useEffect(() => {
    if (isOpen && task) {
      loadBreakdown(task.title);
    } else {
      setBreakdownData(null);
    }
  }, [isOpen, task]);

  const loadBreakdown = async (title: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error('Breakdown fetch failed');
      const data = await response.json();
      setBreakdownData(data);
    } catch (e) {
      // Heuristic fallback tailored to executive function
      setBreakdownData({
        ultraQuickStarter: `Abre los archivos de "${title}" y escribe una sola viñeta con la primera idea en 2 minutos.`,
        reassurance: 'El secreto del TDAH es no pedirle al cerebro que termine, solo que comience 2 minutos.',
        microTasks: [
          { title: `Preparar espacio y abrir documento para: ${title}`, durationMinutes: 10 },
          { title: `Borrador rápido de la primera sección (modo sucio sin correcciones)`, durationMinutes: 20 },
          { title: `Revisión general y guardado`, durationMinutes: 15 },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  const handleApply = () => {
    if (!breakdownData) return;
    playTaskDoneSound();
    onApplyMicroSteps(task.id, breakdownData.microTasks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 shadow-2xl relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Desglose Anti-Fricción IA
              </h3>
              <p className="text-[11px] text-slate-400">
                Transformando tarea vaga en micro-acciones concretas
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Original Task */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-3">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
            Tarea origen:
          </span>
          <p className="text-xs font-semibold text-slate-200 mt-0.5">
            {task.title}
          </p>
        </div>

        {isLoading ? (
          <div className="py-8 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-300 font-medium">
              Calculando los micro-pasos de menor resistencia...
            </p>
            <p className="text-[10px] text-slate-500">
              Eliminando verbos abstractos y perfeccionismo
            </p>
          </div>
        ) : breakdownData ? (
          <div className="space-y-3">
            {/* Starter 2 min step */}
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold mb-1">
                <Play className="w-3.5 h-3.5 fill-amber-300" />
                Micropaso de 2 minutos para romper la inercia:
              </div>
              <p className="text-xs text-amber-100 font-medium">
                {breakdownData.ultraQuickStarter}
              </p>
            </div>

            {/* Reassurance */}
            <p className="text-[11px] text-teal-300/90 italic bg-teal-950/30 border border-teal-500/20 p-2 rounded-xl">
              💚 {breakdownData.reassurance}
            </p>

            {/* Micro tasks list */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Micro-pasos generados:
              </span>
              <div className="space-y-1.5">
                {breakdownData.microTasks.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-slate-200 font-medium">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-teal-400 font-semibold shrink-0 bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-500/20">
                      {item.durationMinutes}m
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={onClose}
                className="bg-slate-800 text-slate-300 py-2.5 px-3 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleApply}
                className="flex-1 bg-gradient-to-r from-amber-500 to-teal-400 hover:from-amber-400 hover:to-teal-300 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Reemplazar tarea con estos micro-pasos
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
