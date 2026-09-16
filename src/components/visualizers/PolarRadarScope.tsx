import React, { useRef, useEffect } from 'react';
import { DeinterleavedTrack } from '../../types/ew.types';
import { useEwStore } from '../../store/useEwStore';

interface PolarRadarScopeProps {
  tracks: DeinterleavedTrack[];
}

export const PolarRadarScope: React.FC<PolarRadarScopeProps> = ({ tracks }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { selectedTrackId, setSelectedTrackId } = useEwStore();
  const sweepAngleRef = useRef<number>(0);

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = Math.min(canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = size / 2 - 20;

      // 1. Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Concentric Amplitude / Sensitivity Rings
      const rings = [-80, -60, -40, -20];
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;

      rings.forEach((dbm, idx) => {
        const r = (maxRadius / rings.length) * (idx + 1);
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`${dbm} dBm`, centerX + 4, centerY - r + 9);
      });

      // 3. Azimuth Degree Ticks (Every 10 deg, major labels every 30 deg)
      for (let deg = 0; deg < 360; deg += 10) {
        const isMajor = deg % 30 === 0;
        const rad = (deg - 90) * (Math.PI / 180);
        const tickLen = isMajor ? 8 : 4;

        ctx.strokeStyle = isMajor ? '#334155' : '#1e293b';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(rad) * (maxRadius - tickLen), centerY + Math.sin(rad) * (maxRadius - tickLen));
        ctx.lineTo(centerX + Math.cos(rad) * maxRadius, centerY + Math.sin(rad) * maxRadius);
        ctx.stroke();

        if (isMajor) {
          const textX = centerX + Math.cos(rad) * (maxRadius + 12);
          const textY = centerY + Math.sin(rad) * (maxRadius + 12);

          ctx.fillStyle = deg % 90 === 0 ? '#94a3b8' : '#475569';
          ctx.font = deg % 90 === 0 ? 'bold 9px "JetBrains Mono", monospace' : '8px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          let label = `${deg}°`;
          if (deg === 0) label = '000° N';
          else if (deg === 90) label = '090° E';
          else if (deg === 180) label = '180° S';
          else if (deg === 270) label = '270° W';

          ctx.fillText(label, textX, textY);
        }
      }

      // 4. Rotating Azimuth Sweep Line
      sweepAngleRef.current = (sweepAngleRef.current + 0.6) % 360;
      const sweepRad = (sweepAngleRef.current - 90) * (Math.PI / 180);

      // Subtle Sweep Vector
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(sweepRad) * maxRadius, centerY + Math.sin(sweepRad) * maxRadius);
      ctx.stroke();

      // 5. Active Emitter Contacts
      tracks.forEach((track) => {
        if (track.status === 'LOST') return;

        const aoaRad = (track.aoa_deg - 90) * (Math.PI / 180);
        // Distance mapped from amplitude (-95 to -20 dBm)
        const normalizedAmp = Math.max(0, Math.min(1, (track.amplitude_dbm + 95) / 75));
        const dist = maxRadius * (0.2 + normalizedAmp * 0.75);

        const x = centerX + Math.cos(aoaRad) * dist;
        const y = centerY + Math.sin(aoaRad) * dist;
        const isSelected = selectedTrackId === track.track_id;

        // Bearing Strobe Line
        ctx.strokeStyle = track.threat_level === 'CRITICAL' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(56, 189, 248, 0.25)';
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(aoaRad) * maxRadius, centerY + Math.sin(aoaRad) * maxRadius);
        ctx.stroke();
        ctx.setLineDash([]);

        // Emitter Color
        let targetColor = '#38bdf8';
        if (track.threat_level === 'CRITICAL') targetColor = '#f43f5e';
        else if (track.threat_level === 'HIGH') targetColor = '#f59e0b';
        else if (track.threat_level === 'LOW') targetColor = '#10b981';

        // Target Mark
        ctx.fillStyle = targetColor;
        ctx.strokeStyle = isSelected ? '#ffffff' : targetColor;
        ctx.lineWidth = isSelected ? 2 : 1;

        ctx.beginPath();
        if (track.threat_level === 'CRITICAL') {
          // Diamond symbol for critical threats
          ctx.moveTo(x, y - 5);
          ctx.lineTo(x + 5, y);
          ctx.lineTo(x, y + 5);
          ctx.lineTo(x - 5, y);
          ctx.closePath();
        } else {
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
        }
        ctx.fill();
        ctx.stroke();

        // Label Callout
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(track.nato_codename, x + 7, y - 2);

        ctx.fillStyle = targetColor;
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillText(`${track.carrier_freq_ghz.toFixed(2)}G • ${(track.confidence * 100).toFixed(0)}%`, x + 7, y + 8);
      });

      // 6. Center Receiver Origin Marker
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [tracks, selectedTrackId]);

  return (
    <div className="bg-slate-900/90 rounded-md border border-slate-800 p-3.5 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <h3 className="font-mono text-xs font-semibold uppercase text-slate-200 tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          360° Tactical Angle-of-Arrival (AoA) Scope
        </h3>
        <span className="text-[10px] font-mono text-slate-500">Azimuth Bearing PPI</span>
      </div>

      <div className="relative w-full max-w-[320px] aspect-square">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="w-full h-full block rounded-full border border-slate-800 bg-slate-950 cursor-crosshair"
          onClick={() => {
            if (tracks.length > 0) {
              const curIdx = tracks.findIndex((t) => t.track_id === selectedTrackId);
              const nextTrack = tracks[(curIdx + 1) % tracks.length];
              setSelectedTrackId(nextTrack.track_id);
            }
          }}
        />
      </div>

      <div className="w-full grid grid-cols-3 gap-1.5 text-center mt-2.5 text-[10px] font-mono">
        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
          <span className="text-slate-500 block">TOTAL TRACKS</span>
          <span className="text-slate-200 font-semibold">{tracks.filter((t) => t.status !== 'LOST').length}</span>
        </div>
        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
          <span className="text-slate-500 block">INTERCEPTED</span>
          <span className="text-emerald-400 font-semibold">{tracks.filter((t) => t.status === 'INTERCEPTED').length}</span>
        </div>
        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
          <span className="text-slate-500 block">CRITICAL</span>
          <span className="text-rose-400 font-semibold">{tracks.filter((t) => t.threat_level === 'CRITICAL').length}</span>
        </div>
      </div>
    </div>
  );
};
