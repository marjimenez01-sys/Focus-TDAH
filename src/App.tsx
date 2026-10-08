import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { NowView } from './components/NowView';
import { PlanView } from './components/PlanView';
import { MedicationAndHabitsView } from './components/MedicationAndHabitsView';
import { CheckInView } from './components/CheckInView';
import { AnalyticsView } from './components/AnalyticsView';
import { LowFocusModal } from './components/LowFocusModal';
import { TimerModal } from './components/TimerModal';
import { TaskBreakdownModal } from './components/TaskBreakdownModal';
import { MedicationAlertBanner } from './components/MedicationAlertBanner';
import {
  MicroTask,
  MedicationDose,
  HabitItem,
  DailyCheckIn,
  SleepRecord,
  PhysicalActivity,
  SmartReminder,
  AIAnalysisResult,
  FocusLevel,
} from './types';
import {
  STORAGE_KEYS,
  INITIAL_TASKS,
  INITIAL_MEDICATIONS,
  INITIAL_HABITS,
  INITIAL_CHECKINS,
  INITIAL_SLEEP,
  INITIAL_ACTIVITIES,
  INITIAL_REMINDERS,
  INITIAL_AI_ANALYSIS,
  loadFromStorage,
  saveToStorage,
} from './utils/storage';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('ahora');

  // Core State with LocalStorage Persistence
  const [tasks, setTasks] = useState<MicroTask[]>(() =>
    loadFromStorage<MicroTask[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS)
  );
  const [medications, setMedications] = useState<MedicationDose[]>(() =>
    loadFromStorage<MedicationDose[]>(STORAGE_KEYS.MEDICATIONS, INITIAL_MEDICATIONS)
  );
  const [habits, setHabits] = useState<HabitItem[]>(() =>
    loadFromStorage<HabitItem[]>(STORAGE_KEYS.HABITS, INITIAL_HABITS)
  );
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(() =>
    loadFromStorage<DailyCheckIn[]>(STORAGE_KEYS.CHECKINS, INITIAL_CHECKINS)
  );
  const [sleepRecord, setSleepRecord] = useState<SleepRecord>(() =>
    loadFromStorage<SleepRecord>(STORAGE_KEYS.SLEEP, INITIAL_SLEEP)
  );
  const [activities, setActivities] = useState<PhysicalActivity[]>(() =>
    loadFromStorage<PhysicalActivity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES)
  );
  const [reminders, setReminders] = useState<SmartReminder[]>(() =>
    loadFromStorage<SmartReminder[]>(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS)
  );
  const [currentFocus, setCurrentFocus] = useState<FocusLevel>(() =>
    loadFromStorage<FocusLevel>(STORAGE_KEYS.FOCUS_STATE, 'alta')
  );
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult>(() =>
    loadFromStorage<AIAnalysisResult>(STORAGE_KEYS.AI_ANALYSIS, INITIAL_AI_ANALYSIS)
  );

  // Active Task in Focus
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);

  // Modals
  const [isLowFocusOpen, setIsLowFocusOpen] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [taskForBreakdown, setTaskForBreakdown] = useState<MicroTask | null>(null);

  // Sync to localStorage
  useEffect(() => saveToStorage(STORAGE_KEYS.TASKS, tasks), [tasks]);
  useEffect(() => saveToStorage(STORAGE_KEYS.MEDICATIONS, medications), [medications]);
  useEffect(() => saveToStorage(STORAGE_KEYS.HABITS, habits), [habits]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CHECKINS, checkIns), [checkIns]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SLEEP, sleepRecord), [sleepRecord]);
  useEffect(() => saveToStorage(STORAGE_KEYS.ACTIVITIES, activities), [activities]);
  useEffect(() => saveToStorage(STORAGE_KEYS.REMINDERS, reminders), [reminders]);
  useEffect(() => saveToStorage(STORAGE_KEYS.FOCUS_STATE, currentFocus), [currentFocus]);
  useEffect(() => saveToStorage(STORAGE_KEYS.AI_ANALYSIS, aiAnalysis), [aiAnalysis]);

  // Derived: Current task for AHORA view
  const activeUncompletedTasks = tasks.filter((t) => !t.completed && !t.isPostponed);
  const currentTask =
    activeUncompletedTasks.find((t) => t.id === focusedTaskId) ||
    activeUncompletedTasks[0] ||
    null;

  // Next upcoming reminder
  const nextReminder = reminders.find((r) => r.active) || null;

  // Pending medications count
  const pendingMedCount = medications.filter((m) => !m.taken).length;

  // Handlers: Tasks
  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: true,
              completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : t
      )
    );
  };

  const handleAddTask = (newTask: Omit<MicroTask, 'id' | 'createdAt'>) => {
    const item: MicroTask = {
      ...newTask,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [item, ...prev]);
  };

  const handleUpdateTasks = (newTasks: MicroTask[]) => {
    setTasks(newTasks);
  };

  const handleSelectNextTask = () => {
    if (activeUncompletedTasks.length <= 1) return;
    const currentIndex = activeUncompletedTasks.findIndex((t) => t.id === currentTask?.id);
    const nextIndex = (currentIndex + 1) % activeUncompletedTasks.length;
    setFocusedTaskId(activeUncompletedTasks[nextIndex].id);
  };

  const handleApplyMicroSteps = (
    parentTaskId: string,
    microTasks: { title: string; durationMinutes: number }[]
  ) => {
    setTasks((prev) => {
      const parentIdx = prev.findIndex((t) => t.id === parentTaskId);
      if (parentIdx === -1) return prev;
      const parent = prev[parentIdx];

      const newItems: MicroTask[] = microTasks.map((m, idx) => ({
        id: `micro-${Date.now()}-${idx}`,
        title: m.title,
        durationMinutes: m.durationMinutes,
        completed: false,
        timeBlock: parent.timeBlock,
        priorityOrder: idx === 0 ? 1 : undefined,
        createdAt: new Date().toISOString(),
        notes: `Micro-paso ${idx + 1} de: ${parent.title}`,
      }));

      // Replace parent task
      const copy = [...prev];
      copy.splice(parentIdx, 1, ...newItems);
      return copy;
    });

    // Auto focus the very first micro-step
    setFocusedTaskId(`micro-${Date.now()}-0`);
  };

  // Handlers: Medication
  const handleTakeMedication = (id: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMedications((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, taken: true, takenAt: nowTime } : m
      )
    );
  };

  const handleSnoozeMedication = (id: string, minutes: number) => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + minutes);
    const snoozed = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMedications((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, snoozedUntil: snoozed } : m
      )
    );
  };

  // Handlers: Habits
  const handleToggleHabitActive = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, activeToday: !h.activeToday } : h))
    );
  };

  const handleToggleHabitCompleted = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const isDone = !h.completedToday;
          return {
            ...h,
            completedToday: isDone,
            streak: isDone ? h.streak + 1 : Math.max(0, h.streak - 1),
          };
        }
        return h;
      })
    );
  };

  // Handlers: Check-in & Sleep
  const handleSaveCheckIn = (checkInData: Omit<DailyCheckIn, 'id'>) => {
    const newEntry: DailyCheckIn = {
      ...checkInData,
      id: `chk-${Date.now()}`,
    };
    setCheckIns((prev) => {
      // Replace if slot already checked in today
      const filtered = prev.filter((c) => c.timeOfDay !== checkInData.timeOfDay);
      return [...filtered, newEntry];
    });
  };

  const handleAddActivity = (act: Omit<PhysicalActivity, 'id' | 'timestamp'>) => {
    const newAct: PhysicalActivity = {
      ...act,
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        currentFocus={currentFocus}
        onSetFocus={setCurrentFocus}
        onOpenLowFocusMode={() => setIsLowFocusOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-3 pb-8">
        {/* Medication floating notification banner if dose is pending */}
        <MedicationAlertBanner
          medications={medications}
          onTakeMedication={handleTakeMedication}
          onSnoozeMedication={handleSnoozeMedication}
        />

        {/* Tab 1: AHORA */}
        {activeTab === 'ahora' && (
          <NowView
            currentTask={currentTask}
            onCompleteTask={handleCompleteTask}
            onBreakdownTask={(t) => setTaskForBreakdown(t)}
            currentFocus={currentFocus}
            onSetFocus={setCurrentFocus}
            nextReminder={nextReminder}
            medications={medications}
            onTakeMedication={handleTakeMedication}
            onStartFocusSession={() => setIsTimerModalOpen(true)}
            onOpenLowFocusMode={() => setIsLowFocusOpen(true)}
            onSelectNextTask={handleSelectNextTask}
          />
        )}

        {/* Tab 2: Planificar */}
        {activeTab === 'plan' && (
          <PlanView
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTasks={handleUpdateTasks}
            onCompleteTask={handleCompleteTask}
            onSelectCurrentTask={(t) => {
              setFocusedTaskId(t.id);
              setActiveTab('ahora');
            }}
            onOpenBreakdownModal={(t) => setTaskForBreakdown(t)}
          />
        )}

        {/* Tab 3: Cuerpo, Hábitos & Meds */}
        {activeTab === 'habitos' && (
          <MedicationAndHabitsView
            medications={medications}
            onTakeMedication={handleTakeMedication}
            onSnoozeMedication={handleSnoozeMedication}
            habits={habits}
            onToggleHabitActive={handleToggleHabitActive}
            onToggleHabitCompleted={handleToggleHabitCompleted}
            activities={activities}
            onAddActivity={handleAddActivity}
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
          />
        )}

        {/* Tab 4: Check-in Diario */}
        {activeTab === 'checkin' && (
          <CheckInView
            checkIns={checkIns}
            onSaveCheckIn={handleSaveCheckIn}
            sleepRecord={sleepRecord}
            onUpdateSleep={setSleepRecord}
          />
        )}

        {/* Tab 5: IA Análisis */}
        {activeTab === 'analisis' && (
          <AnalyticsView
            analysis={aiAnalysis}
            onUpdateAnalysis={setAiAnalysis}
            checkIns={checkIns}
            sleepRecord={sleepRecord}
            habits={habits}
            activities={activities}
            completedTasksCount={tasks.filter((t) => t.completed).length}
            postponedTasksCount={tasks.filter((t) => t.isPostponed).length}
          />
        )}
      </main>

      {/* Low Focus Zen Mode Modal */}
      <LowFocusModal
        currentTask={currentTask}
        isOpen={isLowFocusOpen}
        onClose={() => setIsLowFocusOpen(false)}
        onTaskCompleted={(id) => {
          handleCompleteTask(id);
          setIsLowFocusOpen(false);
        }}
      />

      {/* Pomodoro Timer Modal */}
      <TimerModal
        task={currentTask}
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        onComplete={(id) => {
          handleCompleteTask(id);
          setIsTimerModalOpen(false);
        }}
      />

      {/* AI Task Breakdown Modal */}
      <TaskBreakdownModal
        task={taskForBreakdown}
        isOpen={!!taskForBreakdown}
        onClose={() => setTaskForBreakdown(null)}
        onApplyMicroSteps={handleApplyMicroSteps}
      />

      {/* Bottom Mobile Navigation */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        pendingMedCount={pendingMedCount}
      />
    </div>
  );
}
