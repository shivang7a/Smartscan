import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { DeinterleavedTrack } from '../../types/ew.types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Search, Eye, Download, Shield, Target } from 'lucide-react';

interface EmitterTracksTableProps {
  tracks: DeinterleavedTrack[];
}

export const EmitterTracksTable: React.FC<EmitterTracksTableProps> = ({ tracks }) => {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'confidence', desc: true }]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<DeinterleavedTrack | null>(null);

  const exportCsv = () => {
    const headers = ['Track ID', 'NATO Codename', 'Emitter Name', 'RF (GHz)', 'PRI (us)', 'PW (us)', 'AoA (deg)', 'Threat Level', 'Confidence', 'TTI (ms)', 'Status'];
    const rows = tracks.map((t) => [
      t.track_id,
      t.nato_codename,
      t.emitter_name,
      t.carrier_freq_ghz.toFixed(3),
      t.pri_us.toFixed(1),
      t.pw_us.toFixed(2),
      t.aoa_deg.toFixed(1),
      t.threat_level,
      `${(t.confidence * 100).toFixed(0)}%`,
      t.tti_ms.toFixed(1),
      t.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emitter_tracks_${new Date().toISOString().substring(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = useMemo<ColumnDef<DeinterleavedTrack>[]>(
    () => [
      {
        accessorKey: 'nato_codename',
        header: 'Target / Codename',
        cell: (info) => {
          const track = info.row.original;
          return (
            <div>
              <div className="font-mono text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                {track.nato_codename}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">{track.emitter_name}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'threat_level',
        header: 'Threat Tier',
        cell: (info) => <Badge threat={info.getValue() as DeinterleavedTrack['threat_level']} size="sm" />,
      },
      {
        accessorKey: 'carrier_freq_ghz',
        header: 'RF (GHz)',
        cell: (info) => (
          <span className="font-mono text-xs text-sky-400 font-medium tabular-nums">
            {(info.getValue() as number).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: 'pri_us',
        header: 'PRI (μs)',
        cell: (info) => (
          <span className="font-mono text-xs text-slate-200 tabular-nums">
            {(info.getValue() as number).toFixed(1)}
          </span>
        ),
      },
      {
        accessorKey: 'pw_us',
        header: 'PW (μs)',
        cell: (info) => (
          <span className="font-mono text-xs text-slate-400 tabular-nums">
            {(info.getValue() as number).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: 'aoa_deg',
        header: 'AoA (θ)',
        cell: (info) => (
          <span className="font-mono text-xs text-amber-400 font-medium tabular-nums">
            {(info.getValue() as number).toFixed(1)}°
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Track State',
        cell: (info) => <Badge status={info.getValue() as DeinterleavedTrack['status']} size="sm" />,
      },
      {
        accessorKey: 'confidence',
        header: 'Confidence',
        cell: (info) => {
          const val = info.getValue() as number;
          const pct = Math.round(val * 100);
          return (
            <div className="w-20">
              <div className="flex justify-between text-[10px] font-mono mb-0.5">
                <span className="text-slate-400">{pct}%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded overflow-hidden">
                <div
                  className={`h-full ${
                    pct > 80 ? 'bg-emerald-400' : pct > 50 ? 'bg-sky-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'tti_ms',
        header: 'TTI (ms)',
        cell: (info) => {
          const tti = info.getValue() as number;
          return (
            <span
              className={`font-mono text-xs tabular-nums ${
                tti > 0 ? (tti < 200 ? 'text-emerald-400 font-semibold' : 'text-amber-400') : 'text-slate-500'
              }`}
            >
              {tti > 0 ? `${tti.toFixed(0)} ms` : '—'}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: (info) => (
          <button
            onClick={() => setSelectedTrack(info.row.original)}
            className="p-1 rounded text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
            title="Inspect Track Telemetry"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: tracks,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="bg-slate-900/90 rounded-md border border-slate-800 p-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <h3 className="font-mono text-xs font-semibold uppercase text-slate-200 tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            De-Interleaved Emitter Tracks
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-400">
            {tracks.length} active tracks
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Filter by Codename, RF..."
              className="bg-slate-950 border border-slate-800 rounded pl-8 pr-2.5 py-1 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 w-full sm:w-48"
            />
          </div>

          <Button size="sm" variant="secondary" onClick={exportCsv} title="Export Tracks CSV">
            <Download className="w-3.5 h-3.5 mr-1" />
            CSV
          </Button>
        </div>
      </div>

      {/* TanStack Table */}
      <div className="overflow-x-auto rounded border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-800 bg-slate-900/80">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' ↑',
                        desc: ' ↓',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-6 text-center text-xs font-mono text-slate-500">
                  Listening for emitter pulse captures across tuned sub-bands...
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-800/40 hover:bg-slate-800/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 text-xs">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Inspection Modal */}
      <Modal
        isOpen={!!selectedTrack}
        onClose={() => setSelectedTrack(null)}
        title={`EMITTER TRACK TELEMETRY: ${selectedTrack?.nato_codename || ''}`}
        subtitle={`System Track ID: ${selectedTrack?.track_id || ''}`}
        maxWidth="lg"
      >
        {selectedTrack && (
          <div className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">CARRIER RF</span>
                <span className="text-sky-400 font-bold text-sm">{selectedTrack.carrier_freq_ghz.toFixed(3)} GHz</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">PRI INTERVAL</span>
                <span className="text-slate-200 font-bold text-sm">{selectedTrack.pri_us.toFixed(1)} μs</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">PULSE WIDTH</span>
                <span className="text-amber-400 font-bold text-sm">{selectedTrack.pw_us.toFixed(2)} μs</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">AoA BEARING</span>
                <span className="text-emerald-400 font-bold text-sm">{selectedTrack.aoa_deg.toFixed(1)}°</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-sky-400 font-semibold text-xs">
                  <Shield className="w-3.5 h-3.5" />
                  <span>EMITTER SIGNATURE DETAILS</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-[11px]">
                  <span className="text-slate-400">Target Name:</span>
                  <span className="text-slate-200">{selectedTrack.emitter_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-[11px]">
                  <span className="text-slate-400">Modulation:</span>
                  <span className="text-sky-400">{selectedTrack.modulation}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-[11px]">
                  <span className="text-slate-400">PRI Agility:</span>
                  <span className="text-emerald-400">{selectedTrack.pri_type}</span>
                </div>
                <div className="flex justify-between py-1 text-[11px]">
                  <span className="text-slate-400">Threat Level:</span>
                  <Badge threat={selectedTrack.threat_level} size="sm" />
                </div>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                  <Target className="w-3.5 h-3.5" />
                  <span>INTERCEPT PERFORMANCE</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-[11px]">
                  <span className="text-slate-400">Total Pulses Intercepted:</span>
                  <span className="text-slate-200 font-bold">{selectedTrack.pulse_count}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-[11px]">
                  <span className="text-slate-400">Time-To-Intercept (TTI):</span>
                  <span className="text-emerald-400 font-semibold">{selectedTrack.tti_ms.toFixed(1)} ms</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-[11px]">
                  <span className="text-slate-400">Signal Power:</span>
                  <span className="text-amber-400">{selectedTrack.amplitude_dbm.toFixed(1)} dBm</span>
                </div>
                <div className="flex justify-between py-1 text-[11px]">
                  <span className="text-slate-400">Sub-Band:</span>
                  <span className="text-sky-400">Sub-band 0{selectedTrack.sub_band_id + 1}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedTrack(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
