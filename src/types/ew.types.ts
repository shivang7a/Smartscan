// TypeScript Interfaces mirroring FastAPI Pydantic Models for DRDO SMARTSCAN Electronic Warfare Engine

export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ModulationType = 'CW' | 'PULSED' | 'CHIRP' | 'BARKER' | 'POLYPHASE' | 'FREQ_HOPPING';

export type PriModulationType = 'FIXED' | 'STAGGERED' | 'JITTERED' | 'AGILE' | 'AESA_ADAPTIVE';

export type StrategyTier = 'ROUND_ROBIN' | 'MDD_WEIGHTED' | 'ADAPTIVE_BANDIT';

export type ClosedLoopPhase = 'SENSE' | 'EXTRACT_PDW' | 'SCORE' | 'RE_PLAN';

export type TrackStatus = 'DETECTING' | 'TRACKING' | 'INTERCEPTED' | 'LOST';

export interface PulseDescriptorWord {
  pdw_id: string;
  toa_ns: number;               // Time of Arrival (nanoseconds)
  carrier_freq_ghz: number;     // Carrier RF (GHz)
  pulse_width_us: number;       // Pulse Width (microseconds)
  pri_us: number;               // Pulse Repetition Interval (microseconds)
  amplitude_dbm: number;        // Amplitude (dBm)
  aoa_deg: number;              // Angle of Arrival (degrees, 0-360)
  snr_db: number;               // Signal-to-Noise Ratio
  phase_deg: number;            // Pulse Phase
  sub_band_id: number;          // Sub-band in which pulse was captured
  emitter_id?: string;          // Ground truth / de-interleaved tag
  is_agile_hop?: boolean;
}

export interface EmitterDefinition {
  id: string;
  name: string;
  nato_codename: string;
  platform: 'GROUND_SAM' | 'AIRBORNE_FIGHTER' | 'EARLY_WARNING_AWACS' | 'NAVAL_VESSEL' | 'MISSILE_SEEKER';
  threat_level: ThreatLevel;
  rf_min_ghz: number;
  rf_max_ghz: number;
  pri_type: PriModulationType;
  pri_min_us: number;
  pri_max_us: number;
  pw_min_us: number;
  pw_max_us: number;
  scan_period_s: number;
  beamwidth_deg: number;
  modulation: ModulationType;
  priority_weight: number;      // 1 to 10
  is_active: boolean;
  notes?: string;
}

export interface DeinterleavedTrack {
  track_id: string;
  emitter_name: string;
  nato_codename: string;
  carrier_freq_ghz: number;
  pri_us: number;
  pw_us: number;
  aoa_deg: number;
  amplitude_dbm: number;
  pulse_count: number;
  threat_level: ThreatLevel;
  status: TrackStatus;
  confidence: number;           // 0.0 - 1.0 (Percentage 0-100%)
  first_intercept_ms: number;
  last_seen_ms: number;
  tti_ms: number;               // Time-To-Intercept
  modulation: ModulationType;
  pri_type: PriModulationType;
  sub_band_id: number;
}

export interface DwellWindow {
  dwell_index: number;
  sub_band_id: number;
  rf_start_ghz: number;
  rf_end_ghz: number;
  center_freq_ghz: number;
  ibw_ghz: number;
  dwell_time_ms: number;
  revisit_period_ms: number;
  priority_score: number;
  bandit_q_value: number;
  threat_belief: number;
  pulse_hit_count: number;
  state: 'CURRENT_DWELL' | 'QUEUED' | 'RECENT';
}

export interface ReceiverHardwareProfile {
  receiver_name: string;
  total_rf_min_ghz: number;
  total_rf_max_ghz: number;
  ibw_ghz: number;
  num_subbands: number;
  retune_latency_us: number;
  sensitivity_dbm: number;
  dynamic_range_db: number;
  sample_rate_msps: number;
}

export interface MissionTelemetry {
  mission_time_s: number;
  total_pulses_intercepted: number;
  current_sub_band: number;
  current_rf_center_ghz: number;
  active_strategy: StrategyTier;
  closed_loop_phase: ClosedLoopPhase;
  instantaneous_poi: number;
  cumulative_poi: number;
  mean_tti_ms: number;
  retune_overhead_pct: number;
  threat_count_detected: number;
  threat_count_total: number;
}

export interface MonteCarloScenarioConfig {
  num_runs: number;             // e.g. 1000
  strategy: StrategyTier;
  num_emitters: number;
  pri_jitter_pct: number;
  pulse_dropout_pct: number;
  agile_hop_rate_hz: number;
  snr_db: number;
  receiver_ibw_ghz: number;
}

export interface StrategyBenchmarkPoint {
  n_looks: number;
  round_robin_poi: number;
  mdd_weighted_poi: number;
  smartscan_bandit_poi: number;
}

export interface MonteCarloResult {
  strategy: StrategyTier;
  num_runs: number;
  mean_tti_ms: number;
  p50_tti_ms: number;
  p90_tti_ms: number;
  p99_tti_ms: number;
  confidence_interval_95: [number, number];
  cumulative_poi_1_look: number;
  cumulative_poi_10_looks: number;
  cumulative_poi_50_looks: number;
  missed_emitter_rate_pct: number;
  band_coverage_pct: number;
  dwell_efficiency_score: number;
  run_distribution: Array<{
    run_idx: number;
    tti_ms: number;
    poi: number;
    intercepted: boolean;
  }>;
}
