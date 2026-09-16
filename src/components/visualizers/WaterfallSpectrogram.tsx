import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PulseDescriptorWord, DwellWindow } from '../../types/ew.types';
import { SUB_BANDS } from '../../services/ewPhysicsEngine';
import { useEwStore } from '../../store/useEwStore';
import { SlidersHorizontal, Crosshair, Palette } from 'lucide-react';

interface WaterfallSpectrogramProps {
  recentPdws: PulseDescriptorWord[];
  currentDwell?: DwellWindow;
}

type ColorMap = 'VIRIDIS' | 'INFERNO' | 'ESM_TACTICAL' | 'MONOCHROME';

export const WaterfallSpectrogram: React.FC<WaterfallSpectrogramProps> = ({
  recentPdws,
  currentDwell,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bufferCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const { setSelectedSubBandId, selectedSubBandId } = useEwStore();

  const [colorMap, setColorMap] = useState<ColorMap>('ESM_TACTICAL');
  const [hoverFreq, setHoverFreq] = useState<{ freqGhz: number; x: number; y: number } | null>(null);

  const minFreq = 2.0;
  const maxFreq = 18.0;

  useEffect(() => {
    const buffer = document.createElement('canvas');
    buffer.width = 1200;
    buffer.height = 360;
    const bCtx = buffer.getContext('2d');
    if (bCtx) {
      bCtx.fillStyle = '#090d16';
      bCtx.fillRect(0, 0, buffer.width, buffer.height);
    }
    bufferCanvasRef.current = buffer;
  }, []);

  const getHeatmapColor = useCallback((normalizedAmp: number, isAgile: boolean, cmap: ColorMap) => {
    // normalizedAmp: 0.0 (-95 dBm) to 1.0 (-30 dBm)
    if (cmap === 'VIRIDIS') {
      const r = Math.floor(normalizedAmp * 253);
      const g = Math.floor(231 - normalizedAmp * 100);
      const b = Math.floor(37 + normalizedAmp * 200);
      return `rgb(${r}, ${g}, ${b})`;
    } else if (cmap === 'INFERNO') {
      const r = Math.floor(normalizedAmp * 252);
      const g = Math.floor(Math.pow(normalizedAmp, 2) * 200);
      const b = Math.floor(Math.pow(normalizedAmp, 4) * 150);
      return `rgb(${r}, ${g}, ${b})`;
    } else if (cmap === 'MONOCHROME') {
      const val = Math.floor(normalizedAmp * 240);
      return `rgb(${val}, ${val}, ${val})`;
    } else {
      // ESM_TACTICAL (Precision Cyan -> Emerald -> Amber -> Crimson)
      if (isAgile) return 'rgba(16, 185, 129, 0.95)'; // Emerald for agile hoppers
      if (normalizedAmp > 0.7) return 'rgba(244, 63, 94, 0.95)'; // High power
      if (normalizedAmp > 0.4) return 'rgba(245, 158, 11, 0.9)'; // Mid power
      return 'rgba(56, 189, 248, 0.85)'; // Low power
    }
  }, []);

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const buffer = bufferCanvasRef.current;
    if (!canvas || !buffer) return;

    const ctx = canvas.getContext('2d');
    const bCtx = buffer.getContext('2d');
    if (!ctx || !bCtx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Scroll buffer down
    const scrollSpeed = 2;
    bCtx.drawImage(buffer, 0, 0, width, height - scrollSpeed, 0, scrollSpeed, width, height - scrollSpeed);

    // 2. Clear top row of buffer with baseline noise floor
    bCtx.fillStyle = '#090d16';
    bCtx.fillRect(0, 0, width, scrollSpeed);

    // 3. Draw newly received PDWs onto top row
    recentPdws.slice(-15).forEach((pdw) => {
      const xRatio = (pdw.carrier_freq_ghz - minFreq) / (maxFreq - minFreq);
      const x = Math.floor(xRatio * width);
      const normAmp = Math.max(0, Math.min(1, (pdw.amplitude_dbm + 95) / 65));

      bCtx.fillStyle = getHeatmapColor(normAmp, !!pdw.is_agile_hop, colorMap);
      bCtx.fillRect(Math.max(0, x - 2), 0, 4, scrollSpeed);
    });

    // 4. Render buffer to canvas
    ctx.drawImage(buffer, 0, 0);

    // 5. Draw RF Frequency Grid & Sub-Band Boundaries
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    SUB_BANDS.forEach((sb) => {
      const xRatio = (sb.start_ghz - minFreq) / (maxFreq - minFreq);
      const x = Math.floor(xRatio * width);

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`${sb.start_ghz.toFixed(0)} GHz`, x + 4, height - 6);
    });
    ctx.setLineDash([]);

    // 6. Draw Receiver Instantaneous Bandwidth (IBW = 2 GHz) Window
    if (currentDwell) {
      const ibwStartRatio = (currentDwell.rf_start_ghz - minFreq) / (maxFreq - minFreq);
      const ibwEndRatio = (currentDwell.rf_end_ghz - minFreq) / (maxFreq - minFreq);
      const ibwX = Math.floor(ibwStartRatio * width);
      const ibwW = Math.floor((ibwEndRatio - ibwStartRatio) * width);

      // Subtle highlight box
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.fillRect(ibwX, 0, ibwW, height);

      // Border and LO Center marker
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ibwX, 0, ibwW, height);

      // LO Center Marker line
      const loX = ibwX + ibwW / 2;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(loX, 0);
      ctx.lineTo(loX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top LO Tag
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ibwX + 2, 2, 104, 16);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.strokeRect(ibwX + 2, 2, 104, 16);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`LO fc: ${currentDwell.center_freq_ghz.toFixed(1)} GHz`, ibwX + 6, 13);
    }

    // 7. Render Hover Crosshair if user mouse is over canvas
    if (hoverFreq) {
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

      // Vertical cursor
      ctx.beginPath();
      ctx.moveTo(hoverFreq.x, 0);
      ctx.lineTo(hoverFreq.x, height);
      ctx.stroke();

      // Horizontal cursor
      ctx.beginPath();
      ctx.moveTo(0, hoverFreq.y);
      ctx.lineTo(width, hoverFreq.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tooltip tag
      ctx.fillStyle = '#090d16';
      ctx.fillRect(hoverFreq.x + 8, hoverFreq.y - 18, 90, 16);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(hoverFreq.x + 8, hoverFreq.y - 18, 90, 16);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`${hoverFreq.freqGhz.toFixed(3)} GHz`, hoverFreq.x + 12, hoverFreq.y - 6);
    }

    animationFrameId.current = requestAnimationFrame(renderFrame);
  }, [recentPdws, currentDwell, minFreq, maxFreq, colorMap, hoverFreq, getHeatmapColor]);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [renderFrame]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;

    const freqGhz = minFreq + (canvasX / canvas.width) * (maxFreq - minFreq);
    setHoverFreq({ freqGhz, x: canvasX, y: canvasY });
  };

  const handleMouseLeave = () => {
    setHoverFreq(null);
  };

  return (
    <div className="bg-slate-900/90 rounded-md border border-slate-800 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-mono text-xs font-semibold uppercase text-slate-200 tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
            RF Spectrogram Waterfall (2.0 – 18.0 GHz)
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            [Continuous Time-Frequency Energy Cascade]
          </span>
        </div>

        {/* Color Palette & Legend Controls */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Palette className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px]">LUT:</span>
            <select
              value={colorMap}
              onChange={(e) => setColorMap(e.target.value as ColorMap)}
              className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="ESM_TACTICAL">ESM Tactical</option>
              <option value="VIRIDIS">Viridis (Standard)</option>
              <option value="INFERNO">Inferno (Thermal)</option>
              <option value="MONOCHROME">Monochrome</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-sky-400 inline-block" /> Fixed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block" /> Agile
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-rose-400 inline-block" /> High dBm
            </span>
          </div>
        </div>
      </div>

      {/* Waterfall Canvas */}
      <div className="relative rounded border border-slate-800 overflow-hidden bg-slate-950 h-[260px]">
        <canvas
          ref={canvasRef}
          width={1200}
          height={260}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full block cursor-crosshair"
        />
      </div>

      {/* Sub-Band Filter Buttons */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mt-2">
        {SUB_BANDS.map((sb) => {
          const isTuned = currentDwell?.sub_band_id === sb.id;
          const isSelected = selectedSubBandId === sb.id;

          return (
            <button
              key={sb.id}
              onClick={() => setSelectedSubBandId(sb.id)}
              className={`px-1.5 py-1 rounded text-center font-mono text-[10px] transition-colors border ${
                isTuned
                  ? 'border-sky-500/80 bg-sky-950/40 text-sky-400 font-semibold'
                  : isSelected
                  ? 'border-slate-600 bg-slate-800 text-slate-200'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="font-semibold">SB-0{sb.id + 1}</div>
              <div className="text-[9px] text-slate-500">{sb.start_ghz}-{sb.end_ghz} GHz</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
