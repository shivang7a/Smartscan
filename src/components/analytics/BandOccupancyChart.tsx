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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { SUB_BANDS } from '../../services/ewPhysicsEngine';
import { Layers } from 'lucide-react';

export const BandOccupancyChart: React.FC = () => {
  const occupancyData = SUB_BANDS.map((sb) => {
    const isHighThreatBand = sb.id === 3 || sb.id === 4 || sb.id === 7;
    const threatDensity = isHighThreatBand ? (sb.id === 3 ? 35 : sb.id === 4 ? 40 : 20) : 5;
    const smartScanOccupancy = isHighThreatBand ? (sb.id === 3 ? 32 : sb.id === 4 ? 38 : 18) : 4;
    const roundRobinOccupancy = 12.5;

    return {
      band: `SB-0${sb.id + 1}`,
      rf: `${sb.start_ghz}-${sb.end_ghz}G`,
      'Threat Density %': threatDensity,
      'SmartScan Dwell %': smartScanOccupancy,
      'Round-Robin %': roundRobinOccupancy,
    };
  });

  const pieData = [
    { name: 'X-Band (8-12 GHz)', value: 70, color: '#10b981' },
    { name: 'Ka-Band (16-18 GHz)', value: 18, color: '#f59e0b' },
    { name: 'S/C-Band (2-6 GHz)', value: 8, color: '#38bdf8' },
    { name: 'Other (6-8 / 12-16 GHz)', value: 4, color: '#64748b' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
      {/* Sub-band Dwell Occupancy Bar Chart */}
      <div className="lg:col-span-2 bg-slate-900/90 rounded-md border border-slate-800 p-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
              Sub-Band Dwell Time Allocation vs Real Threat Density (%)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Spectral Utilization</span>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          Fixed round-robin wastes 75% of receiver time sweeping unpopulated RF bands. SmartScan dynamically concentrates dwell energy on active threat sectors.
        </p>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={occupancyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="band" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontFamily: 'monospace', fontSize: '11px', borderRadius: '4px' }}
                formatter={(value: number) => [`${value}%`, '']}
              />
              <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', paddingTop: '6px' }} />
              <Bar dataKey="Round-Robin %" fill="#64748b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="SmartScan Dwell %" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Threat Density %" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Threat Distribution Pie */}
      <div className="bg-slate-900/90 rounded-md border border-slate-800 p-3.5 flex flex-col justify-between">
        <div>
          <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1">
            Band Threat Concentration
          </h4>
          <p className="text-[11px] text-slate-400 mb-2">Threat presence across RF spectrum</p>
        </div>

        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#090d16" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontFamily: 'monospace', fontSize: '11px', borderRadius: '4px' }}
                formatter={(value: number) => [`${value}% energy`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-1 text-[11px] font-mono border-t border-slate-800 pt-2">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: item.color }} />
                {item.name}:
              </span>
              <span className="text-slate-200 font-semibold">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
