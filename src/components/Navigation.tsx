import React from 'react';
import { Target, CalendarCheck2, Pill, Activity, Sparkles, HeartPulse } from 'lucide-react';

export type TabType = 'ahora' | 'plan' | 'habitos' | 'checkin' | 'analisis';

interface NavigationProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  pendingMedCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  pendingMedCount,
}) => {
  const tabs = [
    { id: 'ahora' as TabType, label: 'Ahora', icon: Target },
    { id: 'plan' as TabType, label: 'Planificar', icon: CalendarCheck2 },
    { id: 'habitos' as TabType, label: 'Cuerpo & Meds', icon: Pill, badge: pendingMedCount > 0 ? pendingMedCount : null },
    { id: 'checkin' as TabType, label: 'Check-in', icon: HeartPulse },
    { id: 'analisis' as TabType, label: 'IA Análisis', icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-teal-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-teal-400 stroke-[2.4]' : 'stroke-[1.7]'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-emerald-500 text-slate-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight truncate max-w-full ${isActive ? 'text-teal-300 font-semibold' : 'text-slate-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-teal-400 rounded-full mt-0.5 shadow-sm shadow-teal-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
