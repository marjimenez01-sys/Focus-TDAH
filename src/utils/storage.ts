import { MicroTask, MedicationDose, HabitItem, DailyCheckIn, SleepRecord, PhysicalActivity, SmartReminder, AIAnalysisResult, FocusLevel } from '../types';

const STORAGE_KEYS = {
  TASKS: 'focus_tdah_tasks',
  MEDICATIONS: 'focus_tdah_meds',
  HABITS: 'focus_tdah_habits',
  CHECKINS: 'focus_tdah_checkins',
  SLEEP: 'focus_tdah_sleep',
  ACTIVITIES: 'focus_tdah_activities',
  REMINDERS: 'focus_tdah_reminders',
  FOCUS_STATE: 'focus_tdah_focus_state',
  AI_ANALYSIS: 'focus_tdah_ai_analysis',
};

// Today's date in YYYY-MM-DD
export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Initial realistic ADHD-friendly tasks
export const INITIAL_TASKS: MicroTask[] = [
  {
    id: 'task-1',
    title: 'Escribir informe: abrir plantilla y listar 3 puntos clave',
    durationMinutes: 15,
    completed: true,
    timeBlock: '09:00 - 09:15',
    priorityOrder: 1,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    completedAt: '09:14',
    notes: 'Primer micro-paso de baja fricción superado.'
  },
  {
    id: 'task-2',
    title: 'Redactar conclusiones del reporte mensual (sin editar gramática)',
    durationMinutes: 20,
    completed: false,
    timeBlock: '10:30 - 10:50',
    priorityOrder: 2,
    createdAt: new Date().toISOString(),
    notes: 'Modo borrador sucio para evitar perfeccionismo.'
  },
  {
    id: 'task-3',
    title: 'Enviar correo de confirmación al cliente y cerrar pestaña',
    durationMinutes: 10,
    completed: false,
    timeBlock: '11:45 - 11:55',
    priorityOrder: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Ordenar mesa de trabajo y reciclar papeles acumulados',
    durationMinutes: 15,
    completed: false,
    isPostponed: true, // In backlog without guilt
    createdAt: new Date().toISOString(),
    notes: 'Guardado para la tarde o mañana sin presión.'
  }
];

export const INITIAL_MEDICATIONS: MedicationDose[] = [
  {
    id: 'med-1',
    medicationName: 'Metilfenidato (Dosis 1)',
    scheduledTime: '08:30',
    taken: true,
    takenAt: '08:34',
    date: getTodayString()
  },
  {
    id: 'med-2',
    medicationName: 'Metilfenidato (Dosis 2)',
    scheduledTime: '13:00',
    taken: false,
    date: getTodayString()
  }
];

export const INITIAL_HABITS: HabitItem[] = [
  { id: 'h-1', name: 'Meditar', category: 'mente', iconName: 'Brain', activeToday: true, completedToday: true, streak: 4 },
  { id: 'h-2', name: 'Leer', category: 'mente', iconName: 'BookOpen', activeToday: true, completedToday: false, streak: 2 },
  { id: 'h-3', name: 'Practicar bajo', category: 'creatividad', iconName: 'Music', activeToday: true, completedToday: false, streak: 6 },
  { id: 'h-4', name: 'Escribir', category: 'creatividad', iconName: 'PenTool', activeToday: false, completedToday: false, streak: 1 },
  { id: 'h-5', name: 'Revisar finanzas', category: 'organizacion', iconName: 'CreditCard', activeToday: false, completedToday: false, streak: 3 },
  { id: 'h-6', name: 'Ordenar la casa', category: 'hogar', iconName: 'Sparkles', activeToday: false, completedToday: false, streak: 5 },
  { id: 'h-7', name: 'Preparar comidas', category: 'cuerpo', iconName: 'Utensils', activeToday: false, completedToday: false, streak: 2 },
];

export const INITIAL_CHECKINS: DailyCheckIn[] = [
  {
    id: 'chk-1',
    timeOfDay: 'mañana',
    date: getTodayString(),
    concentration: 8,
    anxiety: 3,
    stress: 3,
    energy: 7,
    mood: 8,
    timestamp: '08:45',
    notes: 'Buen inicio de mañana tras metilfenidato y desayuno rico en proteína.'
  },
  {
    id: 'chk-2',
    timeOfDay: 'mediodia',
    date: getTodayString(),
    concentration: 6,
    anxiety: 4,
    stress: 4,
    energy: 6,
    mood: 7,
    timestamp: '12:45',
    notes: 'Ligera fatiga antes de la segunda toma de medicación.'
  }
];

export const INITIAL_SLEEP: SleepRecord = {
  date: getTodayString(),
  hours: 7.5,
  quality: 8,
  wakeRestless: false
};

export const INITIAL_ACTIVITIES: PhysicalActivity[] = [
  {
    id: 'act-1',
    date: getTodayString(),
    title: 'Caminata rápida bajo el sol matutino',
    type: 'caminar',
    durationMinutes: 20,
    energyBoostRating: 5,
    timestamp: '08:00'
  }
];

export const INITIAL_REMINDERS: SmartReminder[] = [
  { id: 'rem-1', type: 'medicacion', title: 'Metilfenidato (Dosis 2)', subtitle: 'Puntualidad para evitar bajón vespertino', time: '13:00', active: true },
  { id: 'rem-2', type: 'pausa', title: 'Pausa cognitiva & estiramiento', subtitle: 'Mira a lo lejos 20 segundos y rota cuello', time: '11:15', active: true },
  { id: 'rem-3', type: 'hidratacion', title: 'Vaso de agua fresca', subtitle: 'Hidratar cerebro para concentración', time: '11:30', active: true },
  { id: 'rem-4', type: 'alimentacion', title: 'Almuerzo nutritivo', subtitle: 'Combina carbohidratos complejos y proteína', time: '13:30', active: true },
  { id: 'rem-5', type: 'habito', title: 'Practicar bajo (15 min)', subtitle: 'Estímulo creativo sin juicio', time: '18:00', active: true }
];

export const INITIAL_AI_ANALYSIS: AIAnalysisResult = {
  bestFocusWindow: '09:00 - 11:30 (tras la 1ª toma de metilfenidato y caminata)',
  sleepCorrelation: 'Tus registros muestran que dormir ≥ 7h reduce tu ansiedad en 2.8 puntos y estabiliza tu foco un 45%.',
  exerciseImpact: 'La caminata matutina de 20 min aceleró tu inicio de tareas, eliminando la procrastinación matutina.',
  habitInsight: 'Tocar el bajo y meditar funcionan como anclas de dopamina sana que restauran tu energía sin sobreestimulación.',
  nightlySummary: 'Has mantenido una excelente gestión energética. Desglosar las tareas en micro-bloques de 15 min redujo la parálisis.',
  tomorrowRecommendation: 'Comienza mañana con el paso minúsculo de 2 minutos antes de abrir el correo electrónico.',
  difficultHours: '14:30 - 16:00 (caída natural de energía post-almuerzo: agenda tareas mecánicas o descanso).',
  generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

// Storage helper functions
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data) as T;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error saving ${key} to localStorage:`, e);
  }
}

export { STORAGE_KEYS };
