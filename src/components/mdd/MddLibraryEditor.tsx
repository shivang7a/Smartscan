import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mddEmitterSchema, MddEmitterFormData } from '../../types/mdd.types';
import { EmitterDefinition } from '../../types/ew.types';
import { apiService } from '../../services/api';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Plus, Edit2, Trash2, Download, Database, Check } from 'lucide-react';

export const MddLibraryEditor: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmitter, setEditingEmitter] = useState<EmitterDefinition | null>(null);

  const { data: emitters = [], isLoading } = useQuery({
    queryKey: ['mdd-library'],
    queryFn: apiService.getMddLibrary,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MddEmitterFormData>({
    resolver: zodResolver(mddEmitterSchema),
    defaultValues: {
      name: '',
      nato_codename: '',
      platform: 'GROUND_SAM',
      threat_level: 'HIGH',
      rf_min_ghz: 8.5,
      rf_max_ghz: 10.5,
      pri_type: 'AGILE',
      pri_min_us: 100.0,
      pri_max_us: 200.0,
      pw_min_us: 1.0,
      pw_max_us: 5.0,
      scan_period_s: 4.0,
      beamwidth_deg: 1.5,
      modulation: 'CHIRP',
      priority_weight: 8,
      is_active: true,
      notes: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: MddEmitterFormData) => apiService.createMddEmitter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mdd-library'] });
      setIsModalOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: EmitterDefinition) => apiService.updateMddEmitter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mdd-library'] });
      setIsModalOpen(false);
      setEditingEmitter(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteMddEmitter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mdd-library'] });
    },
  });

  const openAddModal = () => {
    setEditingEmitter(null);
    reset({
      name: '',
      nato_codename: '',
      platform: 'AIRBORNE_FIGHTER',
      threat_level: 'HIGH',
      rf_min_ghz: 9.0,
      rf_max_ghz: 11.0,
      pri_type: 'AGILE',
      pri_min_us: 50.0,
      pri_max_us: 120.0,
      pw_min_us: 0.5,
      pw_max_us: 3.0,
      scan_period_s: 3.0,
      beamwidth_deg: 1.8,
      modulation: 'FREQ_HOPPING',
      priority_weight: 9,
      is_active: true,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emitter: EmitterDefinition) => {
    setEditingEmitter(emitter);
    reset({
      name: emitter.name,
      nato_codename: emitter.nato_codename,
      platform: emitter.platform,
      threat_level: emitter.threat_level,
      rf_min_ghz: emitter.rf_min_ghz,
      rf_max_ghz: emitter.rf_max_ghz,
      pri_type: emitter.pri_type,
      pri_min_us: emitter.pri_min_us,
      pri_max_us: emitter.pri_max_us,
      pw_min_us: emitter.pw_min_us,
      pw_max_us: emitter.pw_max_us,
      scan_period_s: emitter.scan_period_s,
      beamwidth_deg: emitter.beamwidth_deg,
      modulation: emitter.modulation,
      priority_weight: emitter.priority_weight,
      is_active: emitter.is_active,
      notes: emitter.notes || '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = (formData: MddEmitterFormData) => {
    if (editingEmitter) {
      updateMutation.mutate({ ...formData, id: editingEmitter.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleActiveStatus = (emitter: EmitterDefinition) => {
    updateMutation.mutate({ ...emitter, is_active: !emitter.is_active });
  };

  const exportMddJson = () => {
    const blob = new Blob([JSON.stringify(emitters, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drdo_mdd_threat_library.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-md border border-slate-800 p-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
                Mission-Dependent Data (MDD) Radar Threat Library
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Pre-mission electronic intelligence database. Active threat signatures directly seed the Bayesian threat priors and dwell optimization constraints in the SMARTSCAN closed loop.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button variant="primary" size="md" onClick={openAddModal} icon={<Plus className="w-3.5 h-3.5" />}>
              Add Threat Signature
            </Button>
            <Button variant="secondary" size="md" onClick={exportMddJson} icon={<Download className="w-3.5 h-3.5" />}>
              Export JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Database Table */}
      <div className="bg-slate-900/90 rounded-md border border-slate-800 p-3.5">
        <div className="overflow-x-auto rounded border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[10px] uppercase">
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2">Codename / Name</th>
                <th className="px-3 py-2">Platform</th>
                <th className="px-3 py-2">Threat</th>
                <th className="px-3 py-2">RF Band (GHz)</th>
                <th className="px-3 py-2">PRI (μs)</th>
                <th className="px-3 py-2">PW (μs)</th>
                <th className="px-3 py-2">Scan Period</th>
                <th className="px-3 py-2">Modulation</th>
                <th className="px-3 py-2">Priority</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="px-3 py-6 text-center text-slate-500">
                    Loading MDD Emitter Database...
                  </td>
                </tr>
              ) : (
                emitters.map((em) => (
                  <tr
                    key={em.id}
                    className={`border-b border-slate-800/40 transition-colors ${
                      em.is_active ? 'hover:bg-slate-800/40' : 'opacity-40 hover:opacity-75'
                    }`}
                  >
                    <td className="px-3 py-2">
                      <button
                        onClick={() => toggleActiveStatus(em)}
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          em.is_active
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                            : 'bg-slate-900 border-slate-700 text-slate-600'
                        }`}
                        title={em.is_active ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {em.is_active && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-semibold text-slate-100">{em.nato_codename}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{em.name}</div>
                    </td>
                    <td className="px-3 py-2 text-slate-400 text-[11px]">{em.platform}</td>
                    <td className="px-3 py-2">
                      <Badge threat={em.threat_level} size="sm" />
                    </td>
                    <td className="px-3 py-2 text-sky-400 font-semibold tabular-nums">
                      {em.rf_min_ghz.toFixed(1)} – {em.rf_max_ghz.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-slate-200 tabular-nums">
                      {em.pri_min_us.toFixed(0)}–{em.pri_max_us.toFixed(0)} <span className="text-[9px] text-slate-500">({em.pri_type})</span>
                    </td>
                    <td className="px-3 py-2 text-slate-400 tabular-nums">
                      {em.pw_min_us.toFixed(1)}–{em.pw_max_us.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-slate-300 tabular-nums">{em.scan_period_s.toFixed(1)} s</td>
                    <td className="px-3 py-2 text-emerald-400">{em.modulation}</td>
                    <td className="px-3 py-2 font-semibold text-amber-400">{em.priority_weight}/10</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(em)}
                          className="p-1 rounded text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(em.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmitter(null);
        }}
        title={editingEmitter ? `EDIT SIGNATURE: ${editingEmitter.nato_codename}` : 'NEW RADAR THREAT SIGNATURE'}
        subtitle="Validate and register signature to MDD database"
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">SYSTEM NAME *</label>
              <input
                {...register('name')}
                placeholder="e.g. 91N6E Panoramic Radar"
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
              />
              {errors.name && <p className="text-rose-400 text-[10px] mt-0.5">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">NATO CODENAME *</label>
              <input
                {...register('nato_codename')}
                placeholder="e.g. BIG BIRD"
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500 uppercase font-semibold"
              />
              {errors.nato_codename && (
                <p className="text-rose-400 text-[10px] mt-0.5">{errors.nato_codename.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">PLATFORM</label>
              <select
                {...register('platform')}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="GROUND_SAM">GROUND SAM</option>
                <option value="AIRBORNE_FIGHTER">AIRBORNE FIGHTER</option>
                <option value="EARLY_WARNING_AWACS">EARLY WARNING AWACS</option>
                <option value="NAVAL_VESSEL">NAVAL VESSEL</option>
                <option value="MISSILE_SEEKER">MISSILE SEEKER</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">THREAT SEVERITY</label>
              <select
                {...register('threat_level')}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">PRIORITY (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                {...register('priority_weight', { valueAsNumber: true })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-amber-400 font-semibold focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">MIN RF (GHz) *</label>
              <input
                type="number"
                step="0.1"
                {...register('rf_min_ghz', { valueAsNumber: true })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-sky-400 font-semibold focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">MAX RF (GHz) *</label>
              <input
                type="number"
                step="0.1"
                {...register('rf_max_ghz', { valueAsNumber: true })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-sky-400 font-semibold focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">MODULATION</label>
              <select
                {...register('modulation')}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="CHIRP">CHIRP (Linear FM)</option>
                <option value="PULSED">PULSED</option>
                <option value="FREQ_HOPPING">FREQ HOPPING</option>
                <option value="BARKER">BARKER</option>
                <option value="POLYPHASE">POLYPHASE</option>
                <option value="CW">CW</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">PRI AGILITY</label>
              <select
                {...register('pri_type')}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="AGILE">AGILE</option>
                <option value="AESA_ADAPTIVE">AESA ADAPTIVE</option>
                <option value="STAGGERED">STAGGERED</option>
                <option value="JITTERED">JITTERED</option>
                <option value="FIXED">FIXED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">MIN PRI (μs)</label>
              <input
                type="number"
                step="0.5"
                {...register('pri_min_us', { valueAsNumber: true })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">MAX PRI (μs)</label>
              <input
                type="number"
                step="0.5"
                {...register('pri_max_us', { valueAsNumber: true })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">MIN PW (μs)</label>
              <input
                type="number"
                step="0.1"
                {...register('pw_min_us', { valueAsNumber: true })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">MAX PW (μs)</label>
              <input
                type="number"
                step="0.1"
                {...register('pw_max_us', { valueAsNumber: true })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1">INTELLIGENCE NOTES</label>
            <textarea
              rows={2}
              {...register('notes')}
              placeholder="Operational deployment details, missile system associations..."
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingEmitter(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingEmitter ? 'Save' : 'Add Signature'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
