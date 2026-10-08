import React, { useState } from 'react';
import {
  Pill,
  CheckCircle2,
  Clock,
  Bell,
  Sparkles,
  Activity,
  Plus,
  Flame,
  ShieldCheck,
  Brain,
  BookOpen,
  Music,
  PenTool,
  CreditCard,
  Utensils,
  AlertTriangle,
  RotateCcw,
  Check
} from 'lucide-react';
import { MedicationDose, HabitItem, PhysicalActivity, SmartReminder } from '../types';
import { playTaskDoneSound, playReminderPingSound } from '../utils/sound';

interface Props {
  medications: MedicationDose[];
  onTakeMedication: (id: string) => void;
  onSnoozeMedication: (id: string, minutes: number) => void;
  habits: HabitItem[];
  onToggleHabitActive: (id: string) => void;
  onToggleHabitCompleted: (id: string) => void;
  activities: PhysicalActivity[];
  onAddActivity: (act: Omit<PhysicalActivity, 'id' | 'timestamp'>) => void;
  reminders: SmartReminder[];
  onToggleReminder: (id: string) => void;
}

export const MedicationAndHabitsView: React.FC<Props> = ({
  medications,
  onTakeMedication,
  onSnoozeMedication,
  habits,
  onToggleHabitActive,
  onToggleHabitCompleted,
  activities,
  onAddActivity,
  reminders,
  onToggleReminder,
}) => {
  // Snnze interval setting (10, 15, 30 min)
  const [snoozeInterval, setSnoozeInterval] = useState(15);
  const [habitLimitWarning, setHabitLimitWarning] = useState<string | null>(null);

  // New activity form state
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityType, setActivityType] = useState<PhysicalActivity['type']>('caminar');
  const [activityDuration, setActivityDuration] = useState(20);
  const [activityBoost, setActivityBoost] = useState(5);

  // Count active habits
  const activeHabitsCount = habits.filter((h) => h.activeToday).length;
  const MAX_ACTIVE_HABITS = 3;

  const handleHabitToggleActive = (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    if (!habit.activeToday && activeHabitsCount >= MAX_ACTIVE_HABITS) {
      setHabitLimitWarning(
        `Límite TDAH: Máximo ${MAX_ACTIVE_HABITS} hábitos activos al día. Proteger tu atención evita la frustración y el agotamiento ejecutivo.`
      );
      setTimeout(() => setHabitLimitWarning(null), 5000);
      return;
    }

    setHabitLimitWarning(null);
    onToggleHabitActive(id);
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) return;

    playTaskDoneSound();
    onAddActivity({
      date: new Date().toISOString().split('T')[0],
      title: activityTitle.trim(),
      type: activityType,
      durationMinutes: activityDuration,
      energyBoostRating: activityBoost,
    });

    setActivityTitle('');
    setShowAddActivity(false);
  };

  const getHabitIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain':
        return Brain;
      case 'BookOpen':
        return BookOpen;
      case 'Music':
        return Music;
      case 'PenTool':
        return PenTool;
      case 'CreditCard':
        return CreditCard;
      case 'Sparkles':
        return Sparkles;
      case 'Utensils':
        return Utensils;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="space-y-5 pb-20 animate-fade-in">
      {/* Top Header */}
      <div>
        <span className="text-xs uppercase tracking-widest font-bold text-teal-400">
          Cuerpo, Hábitos & Medicación
        </span>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Cuidado Ejecutivo
        </h2>
      </div>

      {/* 1. MEDICACIÓN (Metilfenidato 08:30 y 13:00) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Metilfenidato
              </h3>
              <p className="text-[11px] text-slate-400">
                Horarios pautados: 08:30 y 13:00
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
            <span>Repetir en:</span>
            {[10, 15, 30].map((mins) => (
              <button
                key={mins}
                onClick={() => setSnoozeInterval(mins)}
                className={`px-1.5 py-0.5 rounded ${
                  snoozeInterval === mins
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Medication Cards */}
        <div className="space-y-2.5">
          {medications.map((med) => (
            <div
              key={med.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                med.taken
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      med.taken
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {med.scheduledTime}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {med.medicationName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {med.taken
                        ? `✓ Tomada a las ${med.takenAt || med.scheduledTime}`
                        : 'Pendiente de confirmación'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {med.taken ? (
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Tomada
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          playTaskDoneSound();
                          onTakeMedication(med.id);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl transition-transform active:scale-95"
                      >
                        Tomado
                      </button>
                      <button
                        onClick={() => {
                          playReminderPingSound();
                          onSnoozeMedication(med.id, snoozeInterval);
                        }}
                        className="bg-slate-800 text-slate-300 text-xs font-medium px-2.5 py-1.5 rounded-xl hover:bg-slate-700 transition-colors"
                      >
                        +{snoozeInterval}m
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-slate-500 mt-3 text-center">
          Solo registramos si fue tomada y la hora exacta para ayudarte con tu especialista.
        </p>
      </div>

      {/* 2. HÁBITOS DIARIOS (Con Límite Automático Anti-Sobrecarga) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Hábitos Clave
              </h3>
              <span className="text-[10px] font-bold text-teal-300 bg-teal-950/80 border border-teal-500/30 px-2 py-0.5 rounded-full">
                {activeHabitsCount}/{MAX_ACTIVE_HABITS} activos hoy
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Limitamos automáticamente a máx 3 para prevenir sobrecarga.
            </p>
          </div>
        </div>

        {/* Warning if limit reached */}
        {habitLimitWarning && (
          <div className="bg-amber-950/70 border border-amber-500/40 rounded-xl p-3 mb-3 text-xs text-amber-200 flex items-start gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>{habitLimitWarning}</p>
          </div>
        )}

        {/* Habits List */}
        <div className="grid grid-cols-1 gap-2 mt-3">
          {habits.map((h) => {
            const Icon = getHabitIcon(h.iconName);
            return (
              <div
                key={h.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  h.completedToday
                    ? 'bg-teal-950/30 border-teal-500/30 text-teal-200'
                    : h.activeToday
                    ? 'bg-slate-950/80 border-slate-800 text-white'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (h.activeToday) {
                        playTaskDoneSound();
                        onToggleHabitCompleted(h.id);
                      } else {
                        handleHabitToggleActive(h.id);
                      }
                    }}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                      h.completedToday
                        ? 'bg-teal-500 text-slate-950'
                        : h.activeToday
                        ? 'border border-slate-600 hover:border-teal-400 text-transparent'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-teal-400" />
                    <div>
                      <span className="text-xs font-semibold capitalize block">
                        {h.name}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400" />
                        Racha: {h.streak} días
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleHabitToggleActive(h.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                      h.activeToday
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {h.activeToday ? 'Activo hoy' : 'Activar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVIDAD FÍSICA (Energía & Dopamina natural) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Actividad Física
              </h3>
              <p className="text-[11px] text-slate-400">
                El movimiento regula la dopamina y rompe la niebla mental
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddActivity(true)}
            className="text-xs bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-semibold px-2.5 py-1.5 rounded-xl flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Registrar
          </button>
        </div>

        {/* Recent activities */}
        <div className="space-y-2">
          {activities.map((act) => (
            <div
              key={act.id}
              className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-white">
                  {act.title}
                </p>
                <span className="text-[10px] text-slate-400">
                  {act.durationMinutes} min · Impulso de energía: {act.energyBoostRating}/5 ⭐
                </span>
              </div>
              <span className="text-[10px] font-bold text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-500/30 uppercase">
                {act.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. RECORDATORIOS INTELIGENTES */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-white">
              Recordatorios Inteligentes
            </h3>
            <p className="text-[11px] text-slate-400">
              Adaptados a tu ritmo sin bombardearte
            </p>
          </div>
        </div>

        <div className="space-y-2 mt-2">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200">
                    {rem.title}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {rem.time}
                  </span>
                </div>
                {rem.subtitle && (
                  <p className="text-[10px] text-slate-400 truncate">
                    {rem.subtitle}
                  </p>
                )}
              </div>

              <button
                onClick={() => onToggleReminder(rem.id)}
                className={`text-[10px] px-2.5 py-1 rounded-full font-semibold transition-colors ${
                  rem.active
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {rem.active ? 'Activo' : 'Pausado'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add Physical Activity */}
      {showAddActivity && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-4 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-2">
              Registrar Movimiento / Actividad
            </h4>
            <form onSubmit={handleCreateActivity} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  ¿Qué hiciste?
                </label>
                <input
                  type="text"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="Ej: Caminata rápida, estiramientos de espalda..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Tipo
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white"
                  >
                    <option value="caminar">Caminar</option>
                    <option value="estiramientos">Estiramientos</option>
                    <option value="cardio">Cardio</option>
                    <option value="fuerza">Fuerza</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    value={activityDuration}
                    onChange={(e) => setActivityDuration(Number(e.target.value))}
                    min={5}
                    max={120}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  ¿Cómo te sentó? (1 = nada, 5 = recarga total)
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setActivityBoost(lvl)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                        activityBoost === lvl
                          ? 'bg-teal-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {lvl}★
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddActivity(false)}
                  className="flex-1 bg-slate-800 text-slate-300 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!activityTitle.trim()}
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
