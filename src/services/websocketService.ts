import ReconnectingWebSocket from 'reconnecting-websocket';
import { ewEngine } from './ewPhysicsEngine';
import { PulseDescriptorWord, DeinterleavedTrack, DwellWindow, MissionTelemetry } from '../types/ew.types';

export interface LiveEwStreamPacket {
  type: 'PDW_STREAM' | 'DWELL_UPDATE' | 'TRACK_UPDATE' | 'TELEMETRY_TICK';
  timestamp: number;
  pdws: PulseDescriptorWord[];
  tracks: DeinterleavedTrack[];
  dwells: DwellWindow[];
  telemetry: MissionTelemetry;
  newTrackIntercepted: boolean;
}

type PacketCallback = (packet: LiveEwStreamPacket) => void;

class WebSocketStreamService {
  private rws: ReconnectingWebSocket | null = null;
  private isConnected: boolean = false;
  private subscribers: Set<PacketCallback> = new Set();
  private mockTimer: number | null = null;
  private simulationIntervalMs: number = 80; // ~12 updates per second

  constructor() {
    this.initMockEngine();
  }

  public connect(url: string = 'ws://localhost:8000/ws/live-stream') {
    try {
      this.rws = new ReconnectingWebSocket(url, [], {
        maxReconnectionDelay: 4000,
        minReconnectionDelay: 1000,
        reconnectionDelayGrowFactor: 1.3,
        connectionTimeout: 2000,
        maxRetries: 3,
      });

      this.rws.onopen = () => {
        this.isConnected = true;
        this.stopMockEngine();
      };

      this.rws.onmessage = (event) => {
        try {
          const packet: LiveEwStreamPacket = JSON.parse(event.data);
          this.notify(packet);
        } catch {
          // parse error ignored
        }
      };

      this.rws.onclose = () => {
        this.isConnected = false;
        this.startMockEngine();
      };

      this.rws.onerror = () => {
        this.isConnected = false;
        this.startMockEngine();
      };
    } catch {
      this.startMockEngine();
    }
  }

  public subscribe(callback: PacketCallback): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify(packet: LiveEwStreamPacket) {
    this.subscribers.forEach((cb) => cb(packet));
  }

  public isLiveConnected(): boolean {
    return this.isConnected;
  }

  public startMockEngine() {
    if (this.mockTimer) return;
    this.mockTimer = window.setInterval(() => {
      // Execute engine step
      const stepResult = ewEngine.step(this.simulationIntervalMs, {
        priJitterPct: 8,
        pulseDropoutPct: 5,
        snrDb: 18,
        agileHopRateHz: 250,
      });

      const packet: LiveEwStreamPacket = {
        type: 'TELEMETRY_TICK',
        timestamp: Date.now(),
        pdws: stepResult.pdws,
        tracks: stepResult.tracks,
        dwells: stepResult.dwells,
        telemetry: stepResult.telemetry,
        newTrackIntercepted: stepResult.newTrackIntercepted,
      };

      this.notify(packet);
    }, this.simulationIntervalMs);
  }

  public stopMockEngine() {
    if (this.mockTimer) {
      clearInterval(this.mockTimer);
      this.mockTimer = null;
    }
  }

  private initMockEngine() {
    if (typeof window !== 'undefined') {
      this.startMockEngine();
    }
  }

  public setSpeedMultiplier(multiplier: number) {
    const base = 80;
    this.simulationIntervalMs = Math.max(15, Math.floor(base / multiplier));
    if (this.mockTimer) {
      this.stopMockEngine();
      this.startMockEngine();
    }
  }
}

export const wsStreamService = new WebSocketStreamService();
