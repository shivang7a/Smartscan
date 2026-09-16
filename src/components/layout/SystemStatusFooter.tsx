import React from 'react';
import { Wifi, Cpu, Layers, HardDrive, CheckCircle2 } from 'lucide-react';
import { useEwStore } from '../../store/useEwStore';
import { wsStreamService } from '../../services/websocketService';

export const SystemStatusFooter: React.FC = () => {
  const { isStreaming, activeStrategy } = useEwStore();
  const isWsConnected = wsStreamService.isLiveConnected();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 py-1.5 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Left: Receiver Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Wifi className={`w-3.5 h-3.5 ${isWsConnected ? 'text-emerald-400' : 'text-sky-400'}`} />
          <span className="text-slate-500">ENGINE LINK:</span>
          <span className={isWsConnected ? 'text-emerald-400 font-medium' : 'text-sky-400'}>
            {isWsConnected ? 'FASTAPI REST/WS (ONLINE)' : 'EMBEDDED RF DIGITAL-TWIN'}
          </span>
        </div>

        <div className="h-3 w-px bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-500">HARDWARE:</span>
          <span className="text-slate-300">SH-ESM Mk-IV (2.0–18.0 GHz • 8 Sub-Bands)</span>
        </div>
      </div>

      {/* Center: Retune & Latency Telemetry */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-slate-500">LO SETTLING LATENCY:</span>
          <span className="text-amber-400 font-medium tabular-nums">15.0 μs</span>
        </div>

        <div className="h-3 w-px bg-slate-800 hidden md:block" />

        <div className="flex items-center gap-1.5 hidden md:flex">
          <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-slate-500">FPGA PRESELECTOR:</span>
          <span className="text-emerald-400 font-medium tabular-nums">2.4 GSPS • 0% DROPS</span>
        </div>
      </div>

      {/* Right: Active Strategy */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-500">ACTIVE RSS POLICY:</span>
          <span className="text-sky-400 font-semibold tracking-wide">{activeStrategy}</span>
        </div>
        <span
          className={`w-2 h-2 rounded-full ${
            isStreaming ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        />
      </div>
    </footer>
  );
};
