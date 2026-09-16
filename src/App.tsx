import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEwStore } from './store/useEwStore';
import { wsStreamService, LiveEwStreamPacket } from './services/websocketService';
import { PulseDescriptorWord, DeinterleavedTrack, DwellWindow, MissionTelemetry } from './types/ew.types';

// Layout
import { TacticalHeader } from './components/layout/TacticalHeader';
import { TacticalNav } from './components/layout/TacticalNav';
import { SystemStatusFooter } from './components/layout/SystemStatusFooter';

// HUD Controls
import { ClosedLoopPipeline } from './components/hud/ClosedLoopPipeline';
import { StrategySelector } from './components/hud/StrategySelector';

// Visualizers
import { WaterfallSpectrogram } from './components/visualizers/WaterfallSpectrogram';
import { PolarRadarScope } from './components/visualizers/PolarRadarScope';
import { LivePulseStream } from './components/visualizers/LivePulseStream';

// Tables
import { EmitterTracksTable } from './components/tables/EmitterTracksTable';
import { DwellScheduleTable } from './components/tables/DwellScheduleTable';

// Analytics & Harness
import { CumulativePoiChart } from './components/analytics/CumulativePoiChart';
import { TtiBenchmarkChart } from './components/analytics/TtiBenchmarkChart';
import { BandOccupancyChart } from './components/analytics/BandOccupancyChart';
import { MonteCarloHarness } from './components/montecarlo/MonteCarloHarness';
import { MddLibraryEditor } from './components/mdd/MddLibraryEditor';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

export const AppContent: React.FC = () => {
  const { activeTab, simulationSpeed } = useEwStore();

  const [livePdws, setLivePdws] = useState<PulseDescriptorWord[]>([]);
  const [liveTracks, setLiveTracks] = useState<DeinterleavedTrack[]>([]);
  const [liveDwells, setLiveDwells] = useState<DwellWindow[]>([]);
  const [liveTelemetry, setLiveTelemetry] = useState<MissionTelemetry | null>(null);

  // Subscribe to live streaming engine (WebSocket or Standalone Digital Twin)
  useEffect(() => {
    wsStreamService.setSpeedMultiplier(simulationSpeed);
  }, [simulationSpeed]);

  useEffect(() => {
    const unsubscribe = wsStreamService.subscribe((packet: LiveEwStreamPacket) => {
      setLivePdws(packet.pdws);
      setLiveTracks(packet.tracks);
      setLiveDwells(packet.dwells);
      setLiveTelemetry(packet.telemetry);
    });
    return () => unsubscribe();
  }, []);

  const currentDwell = liveDwells.find((dw) => dw.state === 'CURRENT_DWELL');

  return (
    <div className="min-h-screen bg-ew-bg text-ew-text flex flex-col font-sans selection:bg-ew-cyan selection:text-black">
      {/* Header */}
      <TacticalHeader
        currentSubBandGhz={currentDwell?.rf_start_ghz ?? 2.0}
        totalPulses={liveTelemetry?.total_pulses_intercepted ?? 0}
        threatCountDetected={liveTelemetry?.threat_count_detected ?? 0}
        threatCountTotal={liveTelemetry?.threat_count_total ?? 8}
      />

      {/* Navigation Tabs */}
      <TacticalNav />

      {/* Main Dashboard Workspace */}
      <main className="flex-1 p-4 max-w-[1920px] w-full mx-auto space-y-4">
        {/* Tab 1: Live Mission Ops Dashboard */}
        {activeTab === 'live-ops' && (
          <div className="space-y-4 animate-fade-in">
            {/* Top Closed-Loop Cycle HUD */}
            <ClosedLoopPipeline currentPhase={liveTelemetry?.closed_loop_phase ?? 'SENSE'} />

            {/* Strategy Selector Hot Switcher */}
            <StrategySelector />

            {/* Main Visualizer Grid (Waterfall Spectrogram + 360 AoA Scope) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <WaterfallSpectrogram recentPdws={livePdws} currentDwell={currentDwell} />
              </div>
              <div>
                <PolarRadarScope tracks={liveTracks} />
              </div>
            </div>

            {/* Live Pulse Stream Oscilloscope */}
            <LivePulseStream recentPdws={livePdws} />

            {/* Active Emitter Contacts & Dwell List */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <EmitterTracksTable tracks={liveTracks} />
              <DwellScheduleTable dwells={liveDwells} />
            </div>
          </div>
        )}

        {/* Tab 2: RF Spectrogram & Spectral Stream */}
        {activeTab === 'waterfall' && (
          <div className="space-y-4 animate-fade-in">
            <WaterfallSpectrogram recentPdws={livePdws} currentDwell={currentDwell} />
            <LivePulseStream recentPdws={livePdws} />
            <DwellScheduleTable dwells={liveDwells} />
          </div>
        )}

        {/* Tab 3: De-Interleaved Emitter Tracks & Dwell List */}
        {activeTab === 'tracks-dwell' && (
          <div className="space-y-4 animate-fade-in">
            <EmitterTracksTable tracks={liveTracks} />
            <DwellScheduleTable dwells={liveDwells} />
          </div>
        )}

        {/* Tab 4: Strategy POI / TTI Benchmarks */}
        {activeTab === 'benchmarks' && (
          <div className="space-y-4 animate-fade-in">
            <StrategySelector />
            <CumulativePoiChart />
            <TtiBenchmarkChart />
            <BandOccupancyChart />
          </div>
        )}

        {/* Tab 5: Monte-Carlo Validation Harness */}
        {activeTab === 'monte-carlo' && (
          <div className="space-y-4 animate-fade-in">
            <MonteCarloHarness />
          </div>
        )}

        {/* Tab 6: MDD Threat Library Editor */}
        {activeTab === 'mdd-editor' && (
          <div className="space-y-4 animate-fade-in">
            <MddLibraryEditor />
          </div>
        )}
      </main>

      {/* System Status Footer */}
      <SystemStatusFooter />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
};

export default App;
