import React from 'react';
import {
  LayoutDashboard,
  Activity,
  ListFilter,
  BarChart2,
  Cpu,
  Database,
} from 'lucide-react';
import { useEwStore, ActiveTab } from '../../store/useEwStore';

export const TacticalNav: React.FC = () => {
  const { activeTab, setActiveTab } = useEwStore();

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }> = [
    {
      id: 'live-ops',
      label: 'Mission Operations',
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
    },
    {
      id: 'waterfall',
      label: 'RF Spectrogram & Waterfall',
      icon: <Activity className="w-3.5 h-3.5" />,
    },
    {
      id: 'tracks-dwell',
      label: 'Emitter Tracks & Dwell Plan',
      icon: <ListFilter className="w-3.5 h-3.5" />,
    },
    {
      id: 'benchmarks',
      label: 'Strategy & Cumulative POI',
      icon: <BarChart2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'monte-carlo',
      label: 'Monte-Carlo Proving Harness',
      icon: <Cpu className="w-3.5 h-3.5" />,
      badge: 'N≥1000',
    },
    {
      id: 'mdd-editor',
      label: 'MDD Threat Database',
      icon: <Database className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <nav className="border-b border-slate-800 bg-slate-900/50 px-4 flex items-center justify-start overflow-x-auto no-scrollbar gap-1 py-1">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded font-mono text-xs tracking-tight transition-colors border shrink-0 ${
              isActive
                ? 'border-sky-500/40 bg-sky-950/40 text-sky-400 font-medium'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span className={isActive ? 'text-sky-400' : 'text-slate-500'}>{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && (
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
