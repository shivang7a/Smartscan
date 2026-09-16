import axios from 'axios';
import { EmitterDefinition, MonteCarloScenarioConfig, MonteCarloResult, ReceiverHardwareProfile, StrategyBenchmarkPoint } from '../types/ew.types';
import { ewEngine, HARDWARE_PROFILE } from './ewPhysicsEngine';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 5000,
});

// MDD Library REST Service
export const apiService = {
  getMddLibrary: async (): Promise<EmitterDefinition[]> => {
    try {
      const res = await apiClient.get<EmitterDefinition[]>('/mdd-library');
      return res.data;
    } catch {
      // Fallback to local in-memory MDD store
      return ewEngine.getMddLibrary();
    }
  },

  createMddEmitter: async (emitter: Omit<EmitterDefinition, 'id'>): Promise<EmitterDefinition> => {
    const newEmitter: EmitterDefinition = {
      ...emitter,
      id: `em-custom-${Date.now()}`,
    };
    try {
      const res = await apiClient.post<EmitterDefinition>('/mdd-library', newEmitter);
      return res.data;
    } catch {
      const current = ewEngine.getMddLibrary();
      ewEngine.setMddLibrary([newEmitter, ...current]);
      return newEmitter;
    }
  },

  updateMddEmitter: async (emitter: EmitterDefinition): Promise<EmitterDefinition> => {
    try {
      const res = await apiClient.put<EmitterDefinition>(`/mdd-library/${emitter.id}`, emitter);
      return res.data;
    } catch {
      const current = ewEngine.getMddLibrary();
      const updated = current.map((e) => (e.id === emitter.id ? emitter : e));
      ewEngine.setMddLibrary(updated);
      return emitter;
    }
  },

  deleteMddEmitter: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/mdd-library/${id}`);
      return true;
    } catch {
      const current = ewEngine.getMddLibrary();
      ewEngine.setMddLibrary(current.filter((e) => e.id !== id));
      return true;
    }
  },

  getHardwareProfile: async (): Promise<ReceiverHardwareProfile> => {
    try {
      const res = await apiClient.get<ReceiverHardwareProfile>('/hardware-profile');
      return res.data;
    } catch {
      return HARDWARE_PROFILE;
    }
  },

  runMonteCarlo: async (config: MonteCarloScenarioConfig): Promise<MonteCarloResult> => {
    try {
      const res = await apiClient.post<MonteCarloResult>('/monte-carlo/run', config);
      return res.data;
    } catch {
      // Execute directly in high-speed local engine
      return ewEngine.runMonteCarloSimulation(config);
    }
  },

  getBenchmarks: async (): Promise<StrategyBenchmarkPoint[]> => {
    try {
      const res = await apiClient.get<StrategyBenchmarkPoint[]>('/benchmarks/poi-comparison');
      return res.data;
    } catch {
      // Slide 5 "Impact and Benefits" Cumulative POI Benchmark: P = 1 - (1 - p)^N
      return [
        { n_looks: 1, round_robin_poi: 10, mdd_weighted_poi: 18, smartscan_bandit_poi: 32 },
        { n_looks: 5, round_robin_poi: 41, mdd_weighted_poi: 63, smartscan_bandit_poi: 85 },
        { n_looks: 10, round_robin_poi: 65, mdd_weighted_poi: 86, smartscan_bandit_poi: 97.5 },
        { n_looks: 20, round_robin_poi: 88, mdd_weighted_poi: 98, smartscan_bandit_poi: 99.8 },
        { n_looks: 30, round_robin_poi: 95.8, mdd_weighted_poi: 99.7, smartscan_bandit_poi: 99.9 },
        { n_looks: 50, round_robin_poi: 99.5, mdd_weighted_poi: 99.9, smartscan_bandit_poi: 100 },
      ];
    }
  },
};
