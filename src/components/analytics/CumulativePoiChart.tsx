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
  LineChart,
  Line,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { Calculator } from 'lucide-react';

export const CumulativePoiChart: React.FC = () => {
  const { data: benchmarkData } = useQuery({
    queryKey: ['poi-benchmarks'],
    queryFn: apiService.getBenchmarks,
  });

  const slide5IllustrationData = [
    { name: 'N = 1 look', RoundRobin: 10, MDDWeighted: 18, SmartScanBandit: 32 },
    { name: 'N = 10 looks', RoundRobin: 65, MDDWeighted: 86, SmartScanBandit: 97.5 },
    { name: 'N = 50 looks', RoundRobin: 99.5, MDDWeighted: 99.9, SmartScanBandit: 100 },
  ];

  return (
    <div className="space-y-3.5">
      {/* Slide 5 Theoretical Context Card */}
      <div className="bg-slate-900/90 rounded-md border border-slate-800 p-3.5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-sky-400" />
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
                Mathematical Model: Cumulative Probability of Intercept (P_cum = 1 - (1 - p)^N)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Detection is cumulative across revisits rather than single-shot. Concentrating dwell time on higher likelihood sub-bands elevates the single-look intercept probability p, drastically accelerating how fast cumulative confidence accrues. Standard military ESM targets P_cum &ge; 90% within one antenna scan period (4–12 s) and &ge; 99% within 30 s.
            </p>
          </div>
        </div>

        {/* Bar Chart comparing looks at 1, 10, 50 */}
        <div className="h-60 w-full mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={slide5IllustrationData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} unit="%" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontFamily: 'monospace', fontSize: '11px', borderRadius: '4px' }}
                formatter={(value: number) => [`${value}%`, '']}
              />
              <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', paddingTop: '6px' }} />
              <Bar dataKey="RoundRobin" name="Tier 1: Fixed Round-Robin (p=10%)" fill="#64748b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="MDDWeighted" name="Tier 2: MDD-Weighted (p=18%)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="SmartScanBandit" name="Tier 3: SmartScan Bandit (p=32%)" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* POI Progression Curve Chart */}
      <div className="bg-slate-900/90 rounded-md border border-slate-800 p-3.5">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
            Empirical Cumulative POI Accrual vs Revisit Looks ($N = 1 \dots 50$)
          </h4>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={benchmarkData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="n_looks" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} unit="%" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontFamily: 'monospace', fontSize: '11px', borderRadius: '4px' }}
                formatter={(value: number) => [`${value}%`, '']}
              />
              <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', paddingTop: '6px' }} />
              <Line type="monotone" dataKey="round_robin_poi" name="Round-Robin" stroke="#64748b" strokeWidth={1.5} dot={{ r: 2.5 }} />
              <Line type="monotone" dataKey="mdd_weighted_poi" name="MDD-Weighted" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 2.5 }} />
              <Line type="monotone" dataKey="smartscan_bandit_poi" name="SmartScan Bandit" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
