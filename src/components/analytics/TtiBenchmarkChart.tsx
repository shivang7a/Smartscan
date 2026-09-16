import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Clock, ShieldAlert } from 'lucide-react';

export const TtiBenchmarkChart: React.FC = () => {
  const ttiData = [
    {
      metric: 'Mean TTI (ms)',
      'Round-Robin': 640,
      'MDD-Weighted': 310,
      SmartScan: 145,
    },
    {
      metric: 'P90 TTI (ms)',
      'Round-Robin': 980,
      'MDD-Weighted': 490,
      SmartScan: 210,
    },
    {
      metric: 'P99 TTI (ms)',
      'Round-Robin': 1420,
      'MDD-Weighted': 720,
      SmartScan: 295,
    },
  ];

  const missedRateData = [
    {
      strategy: 'Round-Robin',
      missed_rate: 22.4,
      fill: '#64748b',
    },
    {
      strategy: 'MDD-Weighted',
      missed_rate: 8.5,
      fill: '#f59e0b',
    },
    {
      strategy: 'SmartScan',
      missed_rate: 1.2,
      fill: '#10b981',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
      {/* Time-To-Intercept Latency Chart */}
      <div className="bg-slate-900/90 rounded-md border border-slate-800 p-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
              Time-To-Intercept (TTI) Latency
            </h4>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-semibold">
            -77% TTI with SmartScan
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          Latency required to de-interleave and confirm threat track with &ge;90% confidence.
        </p>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ttiData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="metric" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} unit=" ms" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontFamily: 'monospace', fontSize: '11px', borderRadius: '4px' }}
                formatter={(value: number) => [`${value} ms`, '']}
              />
              <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', paddingTop: '6px' }} />
              <Bar dataKey="Round-Robin" fill="#64748b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="MDD-Weighted" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="SmartScan" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Missed Emitter Rate in Agile Scenarios */}
      <div className="bg-slate-900/90 rounded-md border border-slate-800 p-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
              Missed-Emitter Rate (%) Across Agile Radar Scenarios
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Robustness</span>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          Frequency-agile emitters hop unpredictably, defeating periodic sweeps and causing high miss rates.
        </p>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={missedRateData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="strategy" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} unit="%" domain={[0, 25]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontFamily: 'monospace', fontSize: '11px', borderRadius: '4px' }}
                formatter={(value: number) => [`${value}% missed`, 'Miss Rate']}
              />
              <Bar dataKey="missed_rate" name="Missed Emitter Rate (%)" fill="#f43f5e" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
