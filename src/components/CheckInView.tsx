import React, { useState } from 'react';
import {
  HeartPulse,
  Sun,
  SunMedium,
  Moon,
  Sparkles,
  CheckCircle2,
  Bed,
  Check,
  TrendingUp,
  Brain
} from 'lucide-react';
import { DailyCheckIn, SleepRecord } from '../types';
import { playTaskDoneSound } from '../utils/sound';

interface Props {
  checkIns: DailyCheckIn[];
  onSaveCheckIn: (checkIn: Omit<DailyCheckIn, 'id'>) => void;
  sleepRecord: SleepRecord;
  onUpdateSleep: (sleep: SleepRecord) => void;
}

export const CheckInView: React.FC<Props> = ({
  checkIns,
  onSaveCheckIn,
  sleepRecord,
  onUpdateSleep,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<'mañana' | 'mediodia' | 'noche'>('mediodia');

  // Find existing check-in for this slot today
  const existing = checkIns.find((c) => c.timeOfDay === selectedSlot);

  const [concentration, setConcentration] = useState(existing?.concentration ?? 7);
  const [anxiety, setAnxiety] = useState(existing?.anxiety ?? 3);
  const [stress, setStress] = useState(existing?.stress ?? 3);
  const [energy, setEnergy] = useState(existing?.energy ?? 6);
  const [mood, setMood] = useState(existing?.mood ?? 7);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when slot changes
  const handleSelectSlot = (slot: 'mañana' | 'mediodia' | 'noche') => {
    setSelectedSlot(slot);
    const item = checkIns.find((c) => c.timeOfDay === slot);
    if (item) {
      setConcentration(item.concentration);
      setAnxiety(item.anxiety);
      setStress(item.stress);
      setEnergy(item.energy);
      setMood(item.mood);
      setNotes(item.notes || '');
    } else {
      setConcentration(7);
      setAnxiety(3);
      setStress(3);
      setEnergy(6);
      setMood(7);
      setNotes('');
    }
    setSavedSuccess(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    playTaskDoneSound();

    onSaveCheckIn({
      timeOfDay: selectedSlot,
      date: new Date().toISOString().split('T')[0],
      concentration,
      anxiety,
      stress,
      energy,
      mood,
      notes: notes.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const sliders = [
    { label: 'Concentración', val: concentration, setVal: setConcentration, desc: 'Claridad mental y foco sin dispersión', minLabel: 'Niebla', maxLabel: 'Hiperfoco' },
    { label: 'Ansiedad', val: anxiety, setVal: setAnxiety, desc: 'Tensión interna o sensación de prisa', minLabel: 'Calma', maxLabel: 'Agitado' },
    { label: 'Estrés', val: stress, setVal: setStress, desc: 'Sobrecarga de estímulos y tareas', minLabel: 'Ligero', maxLabel: 'Saturado' },
    { label: 'Energía', val: energy, setVal: setEnergy, desc: 'Combustible físico y vitalidad', minLabel: 'Agotado', maxLabel: 'Enérgico' },
    { label: 'Estado de ánimo', val: mood, setVal: setMood, desc: 'Optimismo y bienestar general', minLabel: 'Bajo', maxLabel: 'Excelente' },
  ];

  return (
    <div className="space-y-5 pb-20 animate-fade-in">
      {/* Top Header */}
      <div>
        <span className="text-xs uppercase tracking-widest font-bold text-teal-400">
          Autoconocimiento 3 veces al día
        </span>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Estado Diario
        </h2>
      </div>

      {/* 3 Times Slot Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 grid grid-cols-3 gap-1 shadow-md">
        {[
          { id: 'mañana' as const, label: 'Mañana', icon: Sun },
          { id: 'mediodia' as const, label: 'Mediodía', icon: SunMedium },
          { id: 'noche' as const, label: 'Noche', icon: Moon },
        ].map((slot) => {
          const Icon = slot.icon;
          const isSelected = selectedSlot === slot.id;
          const isDone = checkIns.some((c) => c.timeOfDay === slot.id);

          return (
            <button
              key={slot.id}
              onClick={() => handleSelectSlot(slot.id)}
              className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{slot.label}</span>
              {isDone && (
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-teal-400'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Check-In Sliders Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white capitalize">
              Check-in de la {selectedSlot}
            </h3>
            <p className="text-[11px] text-slate-400">
              Escala rápida del 1 al 10. Sin juicios.
            </p>
          </div>

          {savedSuccess && (
            <span className="text-xs text-teal-300 bg-teal-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 animate-in fade-in font-semibold">
              <Check className="w-3 h-3 stroke-[3]" /> Guardado
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {sliders.map((s, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  {s.label}
                </span>
                <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950/80 border border-teal-500/30 px-2 py-0.5 rounded-md">
                  {s.val} / 10
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={s.val}
                onChange={(e) => s.setVal(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
              />

              <div className="flex justify-between text-[10px] text-slate-500">
                <span>{s.minLabel}</span>
                <span className="text-slate-400 text-[9px]">{s.desc}</span>
                <span>{s.maxLabel}</span>
              </div>
            </div>
          ))}

          {/* Quick Notes */}
          <div className="pt-2">
            <label className="text-[11px] text-slate-400 block mb-1">
              Nota rápida (opcional: ¿algún factor detonante o éxito?)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Buena sesión de trabajo tras caminar 20 minutos..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-teal-500/20 mt-4"
          >
            <CheckCircle2 className="w-4 h-4" />
            Guardar Check-in de la {selectedSlot}
          </button>
        </form>
      </div>

      {/* SUEÑO & DESCANSO */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Bed className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Registro de Sueño
            </h3>
            <p className="text-[11px] text-slate-400">
              El pilar más influyente en la función ejecutiva con TDAH
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl">
            <span className="text-[11px] text-slate-400 block">Horas dormidas</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-bold font-mono text-white">
                {sleepRecord.hours} h
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    onUpdateSleep({ ...sleepRecord, hours: Math.max(3, sleepRecord.hours - 0.5) })
                  }
                  className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  -
                </button>
                <button
                  onClick={() =>
                    onUpdateSleep({ ...sleepRecord, hours: Math.min(12, sleepRecord.hours + 0.5) })
                  }
                  className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl">
            <span className="text-[11px] text-slate-400 block">Calidad subjetiva</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-bold font-mono text-teal-400">
                {sleepRecord.quality} / 10
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    onUpdateSleep({ ...sleepRecord, quality: Math.max(1, sleepRecord.quality - 1) })
                  }
                  className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  -
                </button>
                <button
                  onClick={() =>
                    onUpdateSleep({ ...sleepRecord, quality: Math.min(10, sleepRecord.quality + 1) })
                  }
                  className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
