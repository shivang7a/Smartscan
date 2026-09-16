import { create } from 'zustand';
import { StrategyTier, ClosedLoopPhase } from '../types/ew.types';

export type ActiveTab = 'live-ops' | 'waterfall' | 'tracks-dwell' | 'benchmarks' | 'monte-carlo' | 'mdd-editor';

interface EwState {
  // Tactical Operational State
  activeStrategy: StrategyTier;
  closedLoopPhase: ClosedLoopPhase;
  selectedSubBandId: number;
  selectedTrackId: string | null;
  isStreaming: boolean;
  simulationSpeed: number;
  activeTab: ActiveTab;
  
  // Tactical Audio & Alerts
  audioEnabled: boolean;
  audioVolume: number;
  alertAlarmActive: boolean;

  // Simulation Parameters & Presets
  activeScenario: string;
  priJitterPct: number;
  pulseDropoutPct: number;
  snrDb: number;
  agileHopRateHz: number;

  // Selected Dwell
  highlightedDwellIdx: number;

  // Actions
  setActiveStrategy: (strategy: StrategyTier) => void;
  setClosedLoopPhase: (phase: ClosedLoopPhase) => void;
  setSelectedSubBandId: (subBandId: number) => void;
  setSelectedTrackId: (trackId: string | null) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  toggleStreaming: () => void;
  setSimulationSpeed: (speed: number) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setAudioEnabled: (enabled: boolean) => void;
  toggleAudio: () => void;
  setAudioVolume: (volume: number) => void;
  setAlertAlarmActive: (active: boolean) => void;
  setActiveScenario: (scenario: string) => void;
  setPriJitterPct: (jitter: number) => void;
  setPulseDropoutPct: (dropout: number) => void;
  setSnrDb: (snr: number) => void;
  setAgileHopRateHz: (hopRate: number) => void;
  setHighlightedDwellIdx: (idx: number) => void;
}

export const useEwStore = create<EwState>((set) => ({
  activeStrategy: 'ADAPTIVE_BANDIT',
  closedLoopPhase: 'SENSE',
  selectedSubBandId: 0,
  selectedTrackId: null,
  isStreaming: true,
  simulationSpeed: 1.0,
  activeTab: 'live-ops',

  audioEnabled: false,
  audioVolume: 0.35,
  alertAlarmActive: false,

  activeScenario: 'dense_agile',
  priJitterPct: 8,
  pulseDropoutPct: 5,
  snrDb: 18,
  agileHopRateHz: 250,

  highlightedDwellIdx: 0,

  setActiveStrategy: (strategy) => set({ activeStrategy: strategy }),
  setClosedLoopPhase: (phase) => set({ closedLoopPhase: phase }),
  setSelectedSubBandId: (subBandId) => set({ selectedSubBandId: subBandId }),
  setSelectedTrackId: (trackId) => set({ selectedTrackId: trackId }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  toggleStreaming: () => set((state) => ({ isStreaming: !state.isStreaming })),
  setSimulationSpeed: (simulationSpeed) => set({ simulationSpeed }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
  setAudioVolume: (audioVolume) => set({ audioVolume }),
  setAlertAlarmActive: (alertAlarmActive) => set({ alertAlarmActive }),
  setActiveScenario: (activeScenario) => set({ activeScenario }),
  setPriJitterPct: (priJitterPct) => set({ priJitterPct }),
  setPulseDropoutPct: (pulseDropoutPct) => set({ pulseDropoutPct }),
  setSnrDb: (snrDb) => set({ snrDb }),
  setAgileHopRateHz: (agileHopRateHz) => set({ agileHopRateHz }),
  setHighlightedDwellIdx: (highlightedDwellIdx) => set({ highlightedDwellIdx }),
}));
