import { z } from 'zod';

export const mddEmitterSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Emitter name must be at least 2 characters'),
  nato_codename: z.string().min(2, 'NATO Codename is required (e.g. FLAP LID, BIG BIRD)'),
  platform: z.enum(['GROUND_SAM', 'AIRBORNE_FIGHTER', 'EARLY_WARNING_AWACS', 'NAVAL_VESSEL', 'MISSILE_SEEKER'], {
    errorMap: () => ({ message: 'Please select a valid platform type' }),
  }),
  threat_level: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], {
    errorMap: () => ({ message: 'Select threat severity level' }),
  }),
  rf_min_ghz: z.coerce.number().min(0.1, 'Min RF must be >= 0.1 GHz').max(40.0, 'Max RF must be <= 40.0 GHz'),
  rf_max_ghz: z.coerce.number().min(0.1, 'Max RF must be >= 0.1 GHz').max(40.0, 'Max RF must be <= 40.0 GHz'),
  pri_type: z.enum(['FIXED', 'STAGGERED', 'JITTERED', 'AGILE', 'AESA_ADAPTIVE']),
  pri_min_us: z.coerce.number().min(0.5, 'PRI Min must be >= 0.5 μs').max(50000, 'PRI must be <= 50,000 μs'),
  pri_max_us: z.coerce.number().min(0.5, 'PRI Max must be >= 0.5 μs').max(50000, 'PRI must be <= 50,000 μs'),
  pw_min_us: z.coerce.number().min(0.05, 'PW Min must be >= 0.05 μs').max(1000, 'PW must be <= 1,000 μs'),
  pw_max_us: z.coerce.number().min(0.05, 'PW Max must be >= 0.05 μs').max(1000, 'PW must be <= 1,000 μs'),
  scan_period_s: z.coerce.number().min(0.1, 'Scan period must be >= 0.1 s').max(120.0, 'Scan period <= 120 s'),
  beamwidth_deg: z.coerce.number().min(0.5, 'Beamwidth must be >= 0.5°').max(180.0, 'Beamwidth <= 180°'),
  modulation: z.enum(['CW', 'PULSED', 'CHIRP', 'BARKER', 'POLYPHASE', 'FREQ_HOPPING']),
  priority_weight: z.coerce.number().int().min(1, 'Priority weight 1-10').max(10, 'Priority weight 1-10'),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
}).refine((data) => data.rf_max_ghz >= data.rf_min_ghz, {
  message: 'Max RF (GHz) must be greater than or equal to Min RF (GHz)',
  path: ['rf_max_ghz'],
}).refine((data) => data.pri_max_us >= data.pri_min_us, {
  message: 'PRI Max (μs) must be greater than or equal to PRI Min (μs)',
  path: ['pri_max_us'],
}).refine((data) => data.pw_max_us >= data.pw_min_us, {
  message: 'PW Max (μs) must be greater than or equal to PW Min (μs)',
  path: ['pw_max_us'],
});

export type MddEmitterFormData = z.infer<typeof mddEmitterSchema>;
