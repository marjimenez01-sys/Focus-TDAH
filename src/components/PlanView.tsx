import React, { useState } from 'react';
import {
  Sparkles,
  CalendarCheck2,
  Clock,
  Plus,
  ArrowRight,
  ShieldAlert,
  Archive,
  CheckCircle2,
  Split,
  ChevronDown,
  RotateCcw,
  Zap,
  HelpCircle,
  X
} from 'lucide-react';
import { MicroTask } from '../types';
import { playTaskDoneSound } from '../utils/sound';

interface PlanViewProps {
  tasks: MicroTask[];
  onAddTask: (task: Omit<MicroTask, 'id' | 'createdAt'>) => void;
  onUpdateTasks: (tasks: MicroTask[]) => void;
  onCompleteTask: (taskId: string) => void;
  onSelectCurrentTask: (task: MicroTask) => void;
  onOpenBreakdownModal: (task: MicroTask) => void;
}

export const PlanView: React.FC<PlanViewProps> = ({
  tasks,
  onAddTask,
  onUpdateTasks,
  onCompleteTask,
  onSelectCurrentTask,
  onOpenBreakdownModal,
}) => {
  const [showMorningPlanner, setShowMorningPlanner] = useState(false);
  const [braindumpInput, setBraindumpInput] = useState('');
  const [isPlanningLoading, setIsPlanningLoading] = useState(false);
  const [coachTip, setCoachTip] = useState<string | null>(null);

  // Quick add manual task state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(20);

  // Filter tasks
  const activeTasks = tasks.filter((t) => !t.completed && !t.isPostponed);
  const completedTasks = tasks.filter((t) => t.completed);
  const postponedTasks = tasks.filter((t) => !t.completed && t.isPostponed);

  // Overload threshold
  const isOverloaded = activeTasks.length > 3;

  // Handle Morning Planning with AI
  const handlePlanMorningWithAI = async () => {
    if (!braindumpInput.trim()) return;
    setIsPlanningLoading(true);

    try {
      const response = await fetch('/api/ai/plan-morning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawBraindump: braindumpInput,
          energyLevel: 7,
        }),
      });

      if (!response.ok) throw new Error('Network error');
      const data = await response.json();

      // Convert priorities into tasks
      const newItems: MicroTask[] = data.priorities.map((p: any, idx: number) => ({
        id: `task-ai-${Date.now()}-${idx}`,
        title: p.title,
        durationMinutes: p.durationMinutes || 20,
        completed: false,
        timeBlock: p.timeBlock,
        priorityOrder: idx + 1,
        notes: p.whyImportant,
        createdAt: new Date().toISOString(),
      }));

      // Later tasks into backlog without guilt
      const laterItems: MicroTask[] = (data.laterTasks || []).map((t: string, idx: number) => ({
        id: `task-later-${Date.now()}-${idx}`,
        title: t,
        durationMinutes: 20,
        completed: false,
        isPostponed: true,
        notes: 'Guardado sin culpa para después',
        createdAt: new Date().toISOString(),
      }));

      onUpdateTasks([...newItems, ...laterItems, ...tasks]);
      setCoachTip(data.coachTip);
      setShowMorningPlanner(false);
      setBraindumpInput('');
    } catch (err) {
      console.warn('AI planning fallback used:', err);
      // Heuristic fallback
      const lines = braindumpInput.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
      const top3 = lines.slice(0, 3);
      const rest = lines.slice(3);

      const newItems: MicroTask[] = top3.map((line, idx) => ({
        id: `task-fb-${Date.now()}-${idx}`,
        title: line,
        durationMinutes: 20,
        completed: false,
        priorityOrder: idx + 1,
        timeBlock: idx === 0 ? '09:30 - 09:50' : idx === 1 ? '10:30 - 10:50' : '11:30 - 11:50',
        createdAt: new Date().toISOString(),
      }));

      const laterItems: MicroTask[] = rest.map((line, idx) => ({
        id: `task-later-${Date.now()}-${idx}`,
        title: line,
        durationMinutes: 15,
        completed: false,
        isPostponed: true,
        createdAt: new Date().toISOString(),
      }));

      onUpdateTasks([...newItems, ...laterItems, ...tasks]);
      setCoachTip('Priorizamos tus primeras 3 acciones. El resto está seguro en el cofre para después.');
      setShowMorningPlanner(false);
    } finally {
      setIsPlanningLoading(false);
    }
  };

  // Reorganize automatically when overloaded
  const handleAutoReorganize = async () => {
    setIsPlanningLoading(true);
    try {
      const response = await fetch('/api/ai/reorganize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentTasks: activeTasks.map((t) => t.title) }),
      });
      const data = await response.json();

      // Keep only first task, postpone the rest
      const updated = tasks.map((t, idx) => {
        if (!t.completed && !t.isPostponed) {
          if (idx === 0) return { ...t, priorityOrder: 1 };
          return { ...t, isPostponed: true };
        }
        return t;
      });

      onUpdateTasks(updated);
      setCoachTip(data.encouragement || 'Hemos aligerado tu carga. Respira y concéntrate solo en el siguiente paso.');
    } catch (e) {
      // Direct local reorganization
      const updated = tasks.map((t, idx) => {
        if (!t.completed && !t.isPostponed) {
          if (idx === 0) return { ...t, priorityOrder: 1 };
          return { ...t, isPostponed: true };
        }
        return t;
      });
      onUpdateTasks(updated);
      setCoachTip('Lista limpiada. Una sola tarea a la vez.');
    } finally {
      setIsPlanningLoading(false);
    }
  };

  // Reschedule single task without guilt
  const handlePostponeWithoutGuilt = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, isPostponed: true, priorityOrder: undefined } : t
    );
    onUpdateTasks(updated);
  };

  // Restore task from postponed
  const handleRestoreTask = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, isPostponed: false, priorityOrder: 3 } : t
    );
    onUpdateTasks(updated);
  };

  // Handle manual task add
  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTask({
      title: newTaskTitle.trim(),
      durationMinutes: newTaskDuration,
      completed: false,
      priorityOrder: activeTasks.length < 3 ? activeTasks.length + 1 : undefined,
    });

    setNewTaskTitle('');
    setShowQuickAdd(false);
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-teal-400">
            Enfoque sin sobrecarga
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Planificar
          </h2>
        </div>

        <button
          onClick={() => setShowMorningPlanner(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-full text-xs shadow-md shadow-teal-500/20 active:scale-95 transition-transform"
        >
          <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
          Plan Matutino IA
        </button>
      </div>

      {/* Coach Tip if available */}
      {coachTip && (
        <div className="bg-teal-950/60 border border-teal-500/30 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-teal-200">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-teal-300 block">Pauta ejecutiva:</span>
            {coachTip}
          </div>
          <button onClick={() => setCoachTip(null)} className="text-teal-400/60 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Overload Alert & Automatic Reorganizer */}
      {isOverloaded && (
        <div className="bg-amber-950/60 border border-amber-500/40 rounded-2xl p-4 text-amber-200 shadow-lg">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-amber-300 text-sm">
                Alerta de sobrecarga ejecutiva ({activeTasks.length} tareas)
              </h4>
              <p className="text-xs text-amber-200/80 mt-0.5">
                La mente con TDAH se paraliza con listas largas. Mantener solo las 3 prioridades clave protege tu dopamina y tu enfoque.
              </p>
              <button
                onClick={handleAutoReorganize}
                disabled={isPlanningLoading}
                className="mt-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                Reorganizar automáticamente sin culpa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Priorities Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Las 3 Prioridades de Hoy
            </span>
            <span className="text-[10px] text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-500/20 font-medium">
              Regla de 3
            </span>
          </div>

          <button
            onClick={() => setShowQuickAdd(true)}
            className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir microtarea
          </button>
        </div>

        {activeTasks.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-6 text-center">
            <p className="text-slate-400 text-sm">No tienes prioridades activas ahora.</p>
            <button
              onClick={() => setShowMorningPlanner(true)}
              className="mt-2 text-xs text-teal-400 font-semibold hover:underline"
            >
              Hacer planificación matutina con IA →
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeTasks.slice(0, 3).map((task, idx) => (
              <div
                key={task.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3.5 transition-all shadow-md group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1">
                    <button
                      onClick={() => {
                        playTaskDoneSound();
                        onCompleteTask(task.id);
                      }}
                      className="mt-0.5 text-slate-500 hover:text-teal-400 transition-colors"
                      title="Marcar hecho"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                        {task.timeBlock && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {task.timeBlock}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">
                          {task.durationMinutes} min
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white leading-snug">
                        {task.title}
                      </h4>
                      {task.notes && (
                        <p className="text-[11px] text-slate-400 mt-1">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onSelectCurrentTask(task)}
                      className="text-xs bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 px-2.5 py-1.5 rounded-xl font-medium active:scale-95 transition-transform"
                      title="Poner como tarea de AHORA"
                    >
                      Enfocar
                    </button>
                    <button
                      onClick={() => onOpenBreakdownModal(task)}
                      className="p-1.5 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-slate-800"
                      title="Desglosar en micro-pasos con IA"
                    >
                      <Split className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePostponeWithoutGuilt(task.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
                      title="Mover a más tarde sin culpa"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cofre Para Después / Reprogramar Sin Culpa */}
      {postponedTasks.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-slate-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Cofre para después ({postponedTasks.length})
              </h4>
            </div>
            <span className="text-[10px] text-slate-500">
              Guardadas sin culpa para proteger tu foco
            </span>
          </div>

          <div className="space-y-2 mt-2">
            {postponedTasks.map((t) => (
              <div
                key={t.id}
                className="bg-slate-950/60 border border-slate-800/70 rounded-xl p-2.5 flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 truncate font-medium">
                    {t.title}
                  </p>
                  <span className="text-[10px] text-slate-500">
                    {t.durationMinutes} min · Sin presión
                  </span>
                </div>
                <button
                  onClick={() => handleRestoreTask(t.id)}
                  className="text-xs text-teal-400 hover:text-teal-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 shrink-0 font-medium"
                >
                  Traer a hoy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tareas Completadas Hoy */}
      {completedTasks.length > 0 && (
        <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-3.5 mt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Completadas hoy ({completedTasks.length})
          </h4>
          <div className="space-y-1.5">
            {completedTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 text-xs text-slate-500 line-through">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500/70 shrink-0" />
                <span className="truncate">{t.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Morning Braindump Planner with AI */}
      {showMorningPlanner && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 shadow-2xl relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Planificación Matutina TDAH
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Vaciado mental sin ordenar. La IA estructura por ti.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMorningPlanner(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-medium mb-2">
              ¿Qué cosas tienes en la cabeza para hoy?
            </p>
            <textarea
              value={braindumpInput}
              onChange={(e) => setBraindumpInput(e.target.value)}
              placeholder="Ej: Tengo que responder correos pendientes, revisar los presupuestos, pedir cita con el dentista, hacer la compra y sacar la basura..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 resize-none"
            />

            {/* Quick Helper Prompts */}
            <div className="flex flex-wrap gap-1.5 my-2.5">
              <span className="text-[10px] text-slate-500 py-0.5">Sugerencias rápidas:</span>
              {[
                'Informe mensual',
                'Llamada médica',
                'Limpiar mesa de trabajo',
                'Facturas',
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() =>
                    setBraindumpInput((prev) => (prev ? `${prev}, ${chip}` : chip))
                  }
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full"
                >
                  +{chip}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handlePlanMorningWithAI}
                disabled={isPlanningLoading || !braindumpInput.trim()}
                className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-teal-500/20"
              >
                {isPlanningLoading ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    Transformando en 3 prioridades...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Organizar con IA (Top 3 & Time Blocks)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Quick Add Task */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white">Nueva Microtarea</h4>
              <button onClick={() => setShowQuickAdd(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Acción concreta (inicia con verbo: abrir, escribir, ordenar)
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ej: Abrir borrador y redactar 3 viñetas"
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Duración sugerida (máx 30m para TDAH)
                </label>
                <div className="flex items-center gap-2">
                  {[10, 15, 20, 25, 30].map((mins) => (
                    <button
                      type="button"
                      key={mins}
                      onClick={() => setNewTaskDuration(mins)}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold ${
                        newTaskDuration === mins
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                          : 'bg-slate-950 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="flex-1 bg-slate-800 text-slate-300 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
