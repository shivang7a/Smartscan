import React from 'react';
import { DwellWindow } from '../../types/ew.types';
import { useEwStore } from '../../store/useEwStore';
import { Radio } from 'lucide-react';

interface DwellScheduleTableProps {
  dwells: DwellWindow[];
}

export const DwellScheduleTable: React.FC<DwellScheduleTableProps> = ({ dwells }) => {
  const { selectedSubBandId, setSelectedSubBandId, activeStrategy } = useEwStore();

  return (
    <div className="bg-slate-900/90 rounded-md border border-slate-800 p-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <h3 className="font-mono text-xs font-semibold uppercase text-slate-200 tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
            Computed Dwell Schedule &amp; Bandit Q-Values
          </h3>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-slate-500">SCHEDULER POLICY:</span>
          <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-semibold border border-sky-800/60">
            {activeStrategy}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[10px] uppercase tracking-wider">
              <th className="px-3 py-2">Band</th>
              <th className="px-3 py-2">RF Range (GHz)</th>
              <th className="px-3 py-2">Dwell (Tdwell)</th>
              <th className="px-3 py-2">Revisit (Trevisit)</th>
              <th className="px-3 py-2">Threat Prior</th>
              <th className="px-3 py-2">Bandit Q(s)</th>
              <th className="px-3 py-2">Pulse Hits</th>
              <th className="px-3 py-2">State</th>
            </tr>
          </thead>
          <tbody>
            {dwells.map((dw) => {
              const isCurrent = dw.state === 'CURRENT_DWELL';
              const isSelected = selectedSubBandId === dw.sub_band_id;

              return (
                <tr
                  key={dw.sub_band_id}
                  onClick={() => setSelectedSubBandId(dw.sub_band_id)}
                  className={`border-b border-slate-800/40 transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-sky-950/40 border-l-2 border-l-sky-400 font-medium'
                      : isSelected
                      ? 'bg-slate-800/70'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="px-3 py-2 text-slate-200 flex items-center gap-1.5">
                    {isCurrent && <Radio className="w-3.5 h-3.5 text-sky-400" />}
                    <span>SB-0{dw.sub_band_id + 1}</span>
                  </td>
                  <td className="px-3 py-2 text-sky-400 font-semibold">
                    {dw.rf_start_ghz.toFixed(1)} – {dw.rf_end_ghz.toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-slate-200">
                    <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                      {dw.dwell_time_ms.toFixed(1)} ms
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-400">{dw.revisit_period_ms.toFixed(0)} ms</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-1 bg-slate-800 rounded overflow-hidden">
                        <div
                          className="h-full bg-amber-400"
                          style={{ width: `${Math.min(100, dw.threat_belief * 100 * 3)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-amber-400 tabular-nums">
                        {(dw.threat_belief * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-emerald-400 font-semibold tabular-nums">
                    {dw.bandit_q_value.toFixed(3)}
                  </td>
                  <td className="px-3 py-2 text-purple-400 tabular-nums">{dw.pulse_hit_count}</td>
                  <td className="px-3 py-2">
                    {isCurrent ? (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-sky-950 text-sky-400 border border-sky-700 font-bold uppercase">
                        TUNED
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-900 text-slate-500 border border-slate-800 uppercase">
                        QUEUED
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
