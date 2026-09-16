import React from 'react';
import { ClosedLoopPhase } from '../../types/ew.types';
import { Radio, FileText, Target, RefreshCw, ArrowRight } from 'lucide-react';

interface ClosedLoopPipelineProps {
  currentPhase: ClosedLoopPhase;
}

export const ClosedLoopPipeline: React.FC<ClosedLoopPipelineProps> = ({ currentPhase }) => {
  const steps: Array<{
    id: ClosedLoopPhase;
    num: string;
    title: string;
    subtitle: string;
    detail: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'SENSE',
      num: '1',
      title: 'SENSE',
      subtitle: 'RF Front-End',
      detail: 'Tune LO to sub-band fc (IBW=2GHz), capture pulse energy',
      icon: <Radio className="w-3.5 h-3.5" />,
    },
    {
      id: 'EXTRACT_PDW',
      num: '2',
      title: 'EXTRACT PDW',
      subtitle: 'FPGA Digitizer',
      detail: 'Measure RF, PW (τ), PRI, AoA (θ), and Amplitude (dBm)',
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    {
      id: 'SCORE',
      num: '3',
      title: 'SCORE & CLUSTER',
      subtitle: 'De-Interleaver',
      detail: 'Cluster pulse trains, update Bayesian threat belief vector p(s)',
      icon: <Target className="w-3.5 h-3.5" />,
    },
    {
      id: 'RE_PLAN',
      num: '4',
      title: 'RE-PLAN',
      subtitle: 'Bandit RSS Engine',
      detail: 'Compute dwell order & duration list {sub-band, Tdwell, Trevisit}',
      icon: <RefreshCw className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="bg-slate-900/90 rounded-md border border-slate-800 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold uppercase text-slate-200 tracking-wider">
            SMARTSCAN Closed-Loop Receiver Search Pipeline
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            (Mission-Dependent Data Seeds Step 3 Priors &amp; Step 4 Constraints)
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <span>Active Phase:</span>
          <span className="text-sky-400 font-semibold">{currentPhase}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {steps.map((step, idx) => {
          const isActive = currentPhase === step.id;
          return (
            <div key={step.id} className="relative flex items-center">
              <div
                className={`w-full rounded border p-2 transition-colors flex items-start gap-2.5 ${
                  isActive
                    ? 'border-sky-500/80 bg-sky-950/30'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    isActive
                      ? 'bg-sky-500 text-slate-950'
                      : 'bg-slate-800 border border-slate-700 text-slate-400'
                  }`}
                >
                  {step.num}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-mono text-xs font-semibold tracking-wide ${
                        isActive ? 'text-sky-400' : 'text-slate-200'
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">[{step.subtitle}]</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{step.detail}</p>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 z-10 text-slate-600 pointer-events-none">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
