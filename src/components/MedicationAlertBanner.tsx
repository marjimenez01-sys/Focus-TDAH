import React from 'react';
import { Pill, Check, Clock, Bell } from 'lucide-react';
import { MedicationDose } from '../types';
import { playTaskDoneSound, playReminderPingSound } from '../utils/sound';

interface Props {
  medications: MedicationDose[];
  onTakeMedication: (id: string) => void;
  onSnoozeMedication: (id: string, minutes: number) => void;
}

export const MedicationAlertBanner: React.FC<Props> = ({
  medications,
  onTakeMedication,
  onSnoozeMedication,
}) => {
  // Find pending medications for today
  const pendingMed = medications.find((m) => !m.taken);

  if (!pendingMed) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-950/80 to-teal-900/80 border border-emerald-500/30 rounded-2xl p-4 text-emerald-100 shadow-lg shadow-emerald-950/40 mb-4 animate-fade-in backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
            <Pill className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Recordatorio clave
              </span>
              <span className="text-xs text-emerald-300/80 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {pendingMed.scheduledTime}
              </span>
            </div>
            <h4 className="font-semibold text-white text-base mt-0.5">
              {pendingMed.medicationName}
            </h4>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Mantener la regularidad protege tu energía y foco sin bajones repentinos.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-emerald-500/20">
        <button
          onClick={() => {
            playTaskDoneSound();
            onTakeMedication(pendingMed.id);
          }}
          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2.5 px-3 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-emerald-950/50"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          Tomado
        </button>
        <button
          onClick={() => {
            playReminderPingSound();
            onSnoozeMedication(pendingMed.id, 15);
          }}
          className="bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 font-medium py-2.5 px-3.5 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
        >
          <Bell className="w-3.5 h-3.5" />
          Recordar en 15m
        </button>
      </div>
    </div>
  );
};
