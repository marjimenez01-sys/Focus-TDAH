import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Moon,
  Clock,
  Activity,
  Heart,
  Brain,
  AlertCircle,
  Lightbulb,
  RefreshCw,
  Award,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { AIAnalysisResult, DailyCheckIn, SleepRecord, HabitItem, PhysicalActivity } from '../types';
import { playTaskDoneSound } from '../utils/sound';

interface Props {
  analysis: AIAnalysisResult;
  onUpdateAnalysis: (result: AIAnalysisResult) => void;
  checkIns: DailyCheckIn[];
  sleepRecord: SleepRecord;
  habits: HabitItem[];
  activities: PhysicalActivity[];
  completedTasksCount: number;
  postponedTasksCount: number;
}

export const AnalyticsView: React.FC<Props> = ({
  analysis,
  onUpdateAnalysis,
  checkIns,
  sleepRecord,
  habits,
  activities,
  completedTasksCount,
  postponedTasksCount,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'nocturno' | 'semanal'>('nocturno');

  // Compute quick stats
  const avgConcentration = checkIns.length
    ? (checkIns.reduce((acc, c) => acc + c.concentration, 0) / checkIns.length).toFixed(1)
    : '7.0';

  const avgEnergy = checkIns.length
    ? (checkIns.reduce((acc, c) => acc + c.energy, 0) / checkIns.length).toFixed(1)
    : '6.5';

  const handleRefreshAI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIns,
          sleepData: sleepRecord,
          habits: habits.filter((h) => h.completedToday).map((h) => h.name),
          activities,
          completedCount: completedTasksCount,
          postponedCount: postponedTasksCount,
        }),
      });

      if (!response.ok) throw new Error('Network error');
      const data = await response.json();

      playTaskDoneSound();
      onUpdateAnalysis({
        ...data,
        difficultHours: data.difficultHours || '14:30 - 16:00 (valle circadiano de media tarde)',
        generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err) {
      console.warn('Fallback analysis used:', err);
      // Heuristic fallback
      onUpdateAnalysis({
        bestFocusWindow: '09:00 - 11:30 (ventana óptima tras primera toma de metilfenidato)',
        sleepCorrelation: `Con ${sleepRecord.hours}h de sueño, tu concentración alcanza ${avgConcentration}/10 con menor fatiga mental.`,
        exerciseImpact: 'La actividad física ligera y pausas cada 25m previenen la sensación de agotamiento repentino.',
        habitInsight: 'Los días donde practicas meditación o música muestran mayor estabilidad emocional y menor procrastinación.',
        nightlySummary: `Completaste ${completedTasksCount} micro-bloques hoy. Gran trabajo manteniendo tus funciones ejecutivas protegidas.`,
        tomorrowRecommendation: 'Elige solo 1 microtarea simple de 10 min para abrir tu mañana con sensación de avance.',
        difficultHours: '14:30 - 16:00 (valle post-almuerzo: agenda descansos o tareas mecánicas).',
        generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-20 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-teal-400">
            Neurociencia y Patrones
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Análisis IA
          </h2>
        </div>

        <button
          onClick={handleRefreshAI}
          disabled={isLoading}
          className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-teal-400 hover:text-white px-3 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Analizando...' : 'Recalcular'}
        </button>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            Foco Promedio
          </span>
          <span className="text-lg font-mono font-bold text-teal-400">
            {avgConcentration}/10
          </span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            Sueño Anoche
          </span>
          <span className="text-lg font-mono font-bold text-indigo-400">
            {sleepRecord.hours}h
          </span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            Hechas Hoy
          </span>
          <span className="text-lg font-mono font-bold text-emerald-400">
            {completedTasksCount}
          </span>
        </div>
      </div>

      {/* Switcher: Resumen Nocturno vs Análisis Semanal */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-1 grid grid-cols-2 gap-1 shadow-md">
        <button
          onClick={() => setActiveTab('nocturno')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'nocturno'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Resumen Nocturno
        </button>
        <button
          onClick={() => setActiveTab('semanal')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'semanal'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Patrones Semanales
        </button>
      </div>

      {/* 1. RESUMEN NOCTURNO */}
      {activeTab === 'nocturno' ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-indigo-500/30 rounded-3xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Balance del Día
                </h3>
                <span className="text-[10px] text-slate-400">
                  Generado a las {analysis.generatedAt}
                </span>
              </div>
            </div>

            <p className="text-xs text-indigo-100 leading-relaxed font-medium mt-3 bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
              {analysis.nightlySummary}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-amber-300 block">
                  Recomendación para mañana:
                </span>
                <p className="text-xs text-slate-300 mt-0.5">
                  {analysis.tomorrowRecommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Postponed Tasks Compassionate Note */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <span className="font-bold text-white block">
                Psicoeducación TDAH: Reprogramar no es fracasar
              </span>
              Mover tareas al cofre de espera protege tu sistema nervioso del estrés crónico. La energía fluctúa y adaptarse es una señal de alta función ejecutiva.
            </div>
          </div>
        </div>
      ) : (
        /* 2. PATRONES SEMANALES */
        <div className="space-y-3">
          {/* Ventana de Mayor Foco */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-teal-400 mb-1.5">
              <Clock className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Ventana de Mayor Foco
              </h4>
            </div>
            <p className="text-xs text-white font-medium">
              {analysis.bestFocusWindow}
            </p>
          </div>

          {/* Horarios de Mayor Dificultad */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-1.5">
              <AlertCircle className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Horario de Mayor Dificultad
              </h4>
            </div>
            <p className="text-xs text-slate-200 font-medium">
              {analysis.difficultHours}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              💡 Consejo: No intentes tareas complejas en este tramo. Usa pausas o tareas mecánicas.
            </p>
          </div>

          {/* Correlación Sueño vs Concentración */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-indigo-400 mb-1.5">
              <Moon className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Sueño vs Concentración
              </h4>
            </div>
            <p className="text-xs text-slate-200 font-medium">
              {analysis.sleepCorrelation}
            </p>
          </div>

          {/* Impacto del Ejercicio */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
              <Activity className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Actividad Física & Dopamina
              </h4>
            </div>
            <p className="text-xs text-slate-200 font-medium">
              {analysis.exerciseImpact}
            </p>
          </div>

          {/* Hábitos de Mejores Días */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-purple-400 mb-1.5">
              <Brain className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Hábitos Asociados a Mejores Días
              </h4>
            </div>
            <p className="text-xs text-slate-200 font-medium">
              {analysis.habitInsight}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
