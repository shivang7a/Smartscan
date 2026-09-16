import React, { useState, useEffect } from 'react';
import {
  Radio,
  Volume2,
  VolumeX,
  Shield,
  Activity,
  Play,
  Pause,
  RotateCcw,
  SlidersHorizontal,
  Clock,
} from 'lucide-react';
import { useEwStore } from '../../store/useEwStore';
import { Button } from '../ui/Button';
import { tacticalAudio } from '../../services/audioService';

interface TacticalHeaderProps {
  currentSubBandGhz?: number;
  totalPulses?: number;
  threatCountDetected?: number;
  threatCountTotal?: number;
}

export const TacticalHeader: React.FC<TacticalHeaderProps> = ({
  currentSubBandGhz = 2.0,
  totalPulses = 0,
  threatCountDetected = 0,
  threatCountTotal = 8,
}) => {
  const {
    activeStrategy,
    isStreaming,
    toggleStreaming,
    simulationSpeed,
    setSimulationSpeed,
    audioEnabled,
    toggleAudio,
    activeScenario,
    setActiveScenario,
  } = useEwStore();

  const [utcTime, setUtcTime] = useState<string>('');
  const [istTime, setIstTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + 'Z');
      setIstTime(now.toLocaleTimeString('en-GB', { hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 250);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAudio = () => {
    toggleAudio();
    tacticalAudio.setMuted(audioEnabled);
  };

  const nextSpeed = () => {
    const speeds = [0.5, 1.0, 2.0, 5.0];
    const nextIdx = (speeds.indexOf(simulationSpeed) + 1) % speeds.length;
    setSimulationSpeed(speeds[nextIdx]);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-40 px-4 py-2">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* Left: Program Branding & System Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-900 border border-slate-700 text-sky-400">
            <Radio className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-semibold text-sky-400 tracking-wider">
                DRDO • SIH26055
              </span>
              <span className="text-[10px] text-slate-500">|</span>
              <span className="text-[10px] font-mono text-slate-400">
                SH-ESM RECEIVER SEARCH ENGINE
              </span>
            </div>
            <div className="font-mono text-sm font-semibold text-slate-100 flex items-center gap-2">
              SMARTSCAN WORKSTATION
              <span className="text-[11px] font-normal text-slate-400 font-sans">
                v2.4 (Adaptive Closed-Loop)
              </span>
            </div>
          </div>
        </div>

        {/* Center: Real RF Telemetry & Clock Badges */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/80 px-3 py-1 rounded border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">RF TUNER:</span>
            <span className="text-sky-400 font-semibold">
              {currentSubBandGhz.toFixed(1)}–{(currentSubBandGhz + 2.0).toFixed(1)} GHz
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-1 py-0.2 rounded border border-slate-700">
              IBW 2.0 GHz
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">THREATS:</span>
            <span className="text-slate-200">
              <span className="text-emerald-400 font-semibold">{threatCountDetected}</span>
              <span className="text-slate-500">/{threatCountTotal}</span>
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">PDW COUNT:</span>
            <span className="text-slate-200 font-medium tabular-nums">{totalPulses.toLocaleString()}</span>
          </div>

          <div className="h-3 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>UTC: <span className="text-slate-200">{utcTime}</span></span>
            <span className="text-slate-600">/</span>
            <span>IST: <span className="text-slate-200">{istTime}</span></span>
          </div>
        </div>

        {/* Right: Operational Controls */}
        <div className="flex items-center gap-2 self-end lg:self-center">
          {/* Mission Scenario Selector */}
          <select
            value={activeScenario}
            onChange={(e) => setActiveScenario(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="dense_agile">Scenario 1: Agile Multi-Emitter (AESA)</option>
            <option value="lpi_aesa">Scenario 2: LPI Low-Power Hopping</option>
            <option value="coastal_sam">Scenario 3: Strategic SAM Air-Defence</option>
            <option value="full_spectrum">Scenario 4: Full Spectrum 0.5-18 GHz</option>
          </select>

          {/* Speed Multiplier */}
          <Button
            size="sm"
            variant="secondary"
            onClick={nextSpeed}
            title="Adjust Engine Simulation Speed"
            className="text-xs"
          >
            {simulationSpeed}x
          </Button>

          {/* Play/Pause */}
          <Button
            size="sm"
            variant={isStreaming ? 'tactical-active' : 'secondary'}
            onClick={toggleStreaming}
            title={isStreaming ? 'Pause Stream' : 'Resume Stream'}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </Button>

          {/* Audio Synthesizer Toggle */}
          <Button
            size="sm"
            variant={audioEnabled ? 'tactical-active' : 'secondary'}
            onClick={handleToggleAudio}
            title={audioEnabled ? 'Mute Radar Audio' : 'Unmute Radar Audio Synthesizer'}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </Button>
        </div>
      </div>
    </header>
  );
};
