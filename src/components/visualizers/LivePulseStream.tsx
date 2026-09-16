import React, { useRef, useEffect } from 'react';
import { PulseDescriptorWord } from '../../types/ew.types';
import { Activity, BarChart2 } from 'lucide-react';

interface LivePulseStreamProps {
  recentPdws: PulseDescriptorWord[];
}

export const LivePulseStream: React.FC<LivePulseStreamProps> = ({ recentPdws }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const priCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render Time-Domain Oscilloscope
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Waveform
      if (recentPdws.length > 1) {
        const slice = recentPdws.slice(-50);
        const stepX = width / Math.max(1, slice.length - 1);

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        slice.forEach((pdw, idx) => {
          const x = idx * stepX;
          const normAmp = Math.max(0, Math.min(1, (pdw.amplitude_dbm + 95) / 65));
          const y = height - (normAmp * (height - 20) + 10);

          if (idx === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevX = (idx - 1) * stepX;
            ctx.lineTo(prevX + stepX * 0.4, y);
            ctx.lineTo(x, y);
          }
        });

        ctx.stroke();

        // Dots
        slice.forEach((pdw, idx) => {
          const x = idx * stepX;
          const normAmp = Math.max(0, Math.min(1, (pdw.amplitude_dbm + 95) / 65));
          const y = height - (normAmp * (height - 20) + 10);

          ctx.fillStyle = pdw.is_agile_hop ? '#10b981' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
          ctx.fill();
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [recentPdws]);

  // Render PRI Distribution Histogram (De-interleaving Autocorrelation)
  useEffect(() => {
    const canvas = priCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Compute PRI bins from recent pulses (0 to 600 μs)
    const numBins = 30;
    const maxPri = 600;
    const bins = new Array(numBins).fill(0);

    recentPdws.forEach((pdw) => {
      const binIdx = Math.min(numBins - 1, Math.floor((pdw.pri_us / maxPri) * numBins));
      bins[binIdx]++;
    });

    const maxBinCount = Math.max(1, ...bins);
    const barWidth = width / numBins;

    bins.forEach((count, idx) => {
      if (count === 0) return;
      const barHeight = (count / maxBinCount) * (height - 20);
      const x = idx * barWidth;
      const y = height - barHeight - 4;

      ctx.fillStyle = idx > 15 ? '#f59e0b' : '#38bdf8';
      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
    });

    // PRI Scale label
    ctx.fillStyle = '#64748b';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('0 μs', 4, height - 2);
    ctx.fillText('300 μs', width / 2 - 15, height - 2);
    ctx.fillText('600 μs', width - 38, height - 2);
  }, [recentPdws]);

  const latestPdw = recentPdws[recentPdws.length - 1];

  return (
    <div className="bg-slate-900/90 rounded-md border border-slate-800 p-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-mono text-xs font-semibold uppercase text-slate-200 tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
            Live PDW Digitizer &amp; PRI De-Interleaving Analyzer
          </h3>
        </div>

        {latestPdw && (
          <div className="flex items-center gap-3 font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            <span>RF: <span className="text-sky-400 font-semibold">{latestPdw.carrier_freq_ghz.toFixed(2)} GHz</span></span>
            <span>PRI: <span className="text-emerald-400 font-semibold">{latestPdw.pri_us.toFixed(1)} μs</span></span>
            <span>PW: <span className="text-amber-400">{latestPdw.pulse_width_us.toFixed(2)} μs</span></span>
            <span>AoA: <span className="text-slate-100">{latestPdw.aoa_deg.toFixed(1)}°</span></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Oscilloscope View */}
        <div className="lg:col-span-2 relative rounded border border-slate-800 overflow-hidden bg-slate-950 h-[120px]">
          <div className="absolute top-1.5 left-2 text-[9px] font-mono text-slate-500 uppercase">
            Time-Domain Pulse Envelope (Amplitude vs Time)
          </div>
          <canvas ref={canvasRef} width={800} height={120} className="w-full h-full block" />
        </div>

        {/* PRI Histogram View */}
        <div className="relative rounded border border-slate-800 overflow-hidden bg-slate-950 h-[120px]">
          <div className="absolute top-1.5 left-2 text-[9px] font-mono text-slate-500 uppercase">
            ΔTOA PRI Autocorrelation Histogram
          </div>
          <canvas ref={priCanvasRef} width={400} height={120} className="w-full h-full block" />
        </div>
      </div>
    </div>
  );
};
