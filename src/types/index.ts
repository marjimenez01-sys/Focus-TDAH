export type FocusLevel = 'alta' | 'media' | 'baja' | 'disperso';

export interface MicroTask {
  id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
  timeBlock?: string;
  priorityOrder?: number; // 1, 2, 3 for top priorities
  isPostponed?: boolean;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface MedicationDose {
  id: string;
  medicationName: string;
  scheduledTime: string; // e.g. "08:30", "13:00"
  taken: boolean;
  takenAt?: string; // e.g. "08:35"
  snoozedUntil?: string;
  date: string; // YYYY-MM-DD
}

export interface HabitItem {
  id: string;
  name: string;
  category: 'mente' | 'cuerpo' | 'hogar' | 'creatividad' | 'organizacion';
  iconName: string;
  activeToday: boolean;
  completedToday: boolean;
  streak: number;
}

export interface DailyCheckIn {
  id: string;
  timeOfDay: 'mañana' | 'mediodia' | 'noche';
  date: string;
  concentration: number; // 1 - 10
  anxiety: number; // 1 - 10
  stress: number; // 1 - 10
  energy: number; // 1 - 10
  mood: number; // 1 - 10
  notes?: string;
  timestamp: string;
}

export interface SleepRecord {
  date: string;
  hours: number;
  quality: number; // 1 - 10
  wakeRestless: boolean;
}

export interface PhysicalActivity {
  id: string;
  date: string;
  title: string;
  type: 'caminar' | 'cardio' | 'fuerza' | 'estiramientos' | 'otro';
  durationMinutes: number;
  energyBoostRating: number; // 1 - 5
  timestamp: string;
}

export interface SmartReminder {
  id: string;
  type: 'medicacion' | 'pausa' | 'hidratacion' | 'alimentacion' | 'ejercicio' | 'habito' | 'tarea';
  title: string;
  subtitle?: string;
  time: string;
  active: boolean;
  intervalMinutes?: number;
}

export interface AIAnalysisResult {
  bestFocusWindow: string;
  sleepCorrelation: string;
  exerciseImpact: string;
  habitInsight: string;
  nightlySummary: string;
  tomorrowRecommendation: string;
  difficultHours: string;
  generatedAt: string;
}
