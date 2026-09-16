import React from 'react';
import { StrategyTier } from '../../types/ew.types';
import { useEwStore } from '../../store/useEwStore';
import { ewEngine } from '../../services/ewPhysicsEngine';
import { RotateCw, Sliders, Cpu } from 'lucide-react';

export const StrategySelector: React.FC = () => {
  const { activeStrategy, setActiveStrategy } = useEwStore();

  const handleStrategyChange = (strategy: StrategyTier) => {
    setActiveStrategy(strategy);
    ewEngine.setStrategy(strategy);
  };

  const strategies: Array<{
    id: StrategyTier;
    tier: string;
    name: string;
    description: string;
    formulation: string;
    singleLookPoi: string;
    meanTti: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'ROUND_ROBIN',
      tier: 'Tier 1 Baseline',
      name: 'Fixed Round-Robin Sweep',
      description: 'Sequential cyclic scan (equal dwell duration across all sub-bands). Defeated by AESA agility.',
      formulation: 'Tdwell = constant = 10 ms',
      singleLookPoi: 'p ≈ 10.0%',
      meanTti: 'TTI ≈ 640 ms',
      icon: <RotateCw className="w-3.5 h-3.5" />,
    },
    {
      id: 'MDD_WEIGHTED',
      tier: 'Tier 2 Heuristic',
      name: 'MDD-Weighted Priority',
      description: 'Dwell times allocated proportionally to static threat weights in pre-loaded library.',
      formulation: 'Tdwell(s) ∝ w_MDD(s)',
      singleLookPoi: 'p ≈ 18.0%',
      meanTti: 'TTI ≈ 310 ms',
      icon: <Sliders className="w-3.5 h-3.5" />,
    },
    {
      id: 'ADAPTIVE_BANDIT',
      tier: 'Tier 3 SmartScan',
      name: 'Contextual Bandit / RL (SmartScan)',
      description: 'Online reinforcement learning with UCB1 exploration + Bayesian belief re-ranking after every dwell.',
      formulation: 'Q(s) = R̄_s + c√(ln N / n_s) + α·p_threat(s)',
      singleLookPoi: 'p ≈ 32.0%',
      meanTti: 'TTI ≈ 145 ms',
      icon: <Cpu className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="bg-slate-900/90 rounded-md border border-slate-800 p-3">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="font-mono text-xs font-semibold uppercase text-slate-200 tracking-wider flex items-center gap-2">
          <span>RECEIVER SEARCH STRATEGY (RSS) POLICY</span>
        </h3>
        <span className="text-[11px] font-mono text-slate-400">
          Benchmarking 3 Tiers Head-to-Head
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {strategies.map((strat) => {
          const isSelected = activeStrategy === strat.id;

          return (
            <button
              key={strat.id}
              onClick={() => handleStrategyChange(strat.id)}
              className={`text-left rounded border p-2.5 transition-colors cursor-pointer relative ${
                isSelected
                  ? 'border-sky-500/80 bg-sky-950/40 text-white'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-600/50 text-[9px] font-mono font-bold uppercase rounded">
                  ACTIVE
                </div>
              )}

              <div className="flex items-center gap-1.5 mb-1">
                <span className={isSelected ? 'text-sky-400' : 'text-slate-500'}>
                  {strat.icon}
                </span>
                <span className="text-[10px] font-mono font-semibold uppercase text-slate-400">
                  {strat.tier}
                </span>
              </div>

              <h4 className="font-mono text-xs font-semibold text-slate-100 mb-1">
                {strat.name}
              </h4>

              <p className="text-[11px] text-slate-400 leading-snug mb-2 line-clamp-2">
                {strat.description}
              </p>

              <div className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 mb-2 truncate">
                {strat.formulation}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono pt-1.5 border-t border-slate-800/80">
                <span className="text-sky-400">{strat.singleLookPoi}</span>
                <span className="text-emerald-400 font-medium">{strat.meanTti}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
