// FILE: src/app/dashboard/policies/page.tsx
'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Plus, Search, Edit2, Trash2, ArrowUpDown, X } from 'lucide-react';

interface SLAPolicy {
  id: string;
  name: string;
  targetUptime: number;
  responseTimeTarget: number;
  resolutionTimeTarget: number;
  status: 'active' | 'paused';
  createdAt: number;
  updatedAt: number;
}

export default function PoliciesPage() {
  const { state, dispatch } = useStore();
  const policies = (state.policies || []) as SLAPolicy[];

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'targetUptime' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<SLAPolicy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetUptime: 99.9,
    responseTimeTarget: 30,
    resolutionTimeTarget: 120,
    status: 'active' as 'active' | 'paused',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      name: '',
      targetUptime: 99.9,
      responseTimeTarget: 30,
      resolutionTimeTarget: 120,
      status: 'active',
    });
    setErrors({});
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (formData.targetUptime < 0 || formData.targetUptime > 100) errs.targetUptime = 'Must be 0-100%';
    if (formData.responseTimeTarget <= 0) errs.responseTimeTarget = 'Must be > 0';
    if (formData.resolutionTimeTarget <= 0) errs.resolutionTimeTarget = 'Must be > 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const now = Date.now();
    if (editingPolicy) {
      const updated = { ...editingPolicy, ...formData, updatedAt: now };
      dispatch({ type: 'UPDATE_ENTITY', entityType: 'policies', entity: updated, payload: { type: 'policies', data: updated } });
      dispatch({ type: 'TOAST', payload: { message: 'Policy updated', type: 'success' } });
    } else {
      const created = { id: Math.random().toString(36).substring(2, 9), ...formData, createdAt: now, updatedAt: now };
      dispatch({ type: 'ADD_ENTITY', entityType: 'policies', entity: created, payload: { type: 'policies', data: created } });
      dispatch({ type: 'TOAST', payload: { message: 'Policy created', type: 'success' } });
    }
    setIsModalOpen(false);
    setEditingPolicy(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this policy?')) {
      dispatch({ type: 'DELETE_ENTITY', entityType: 'policies', id, payload: { type: 'policies', id } });
      dispatch({ type: 'TOAST', payload: { message: 'Policy deleted', type: 'success' } });
      setSelectedIds(selectedIds.filter(x => x !== id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.length} policies?`)) {
      selectedIds.forEach(id => {
        dispatch({ type: 'DELETE_ENTITY', entityType: 'policies', id, payload: { type: 'policies', id } });
      });
      dispatch({ type: 'TOAST', payload: { message: `Deleted ${selectedIds.length} policies`, type: 'success' } });
      setSelectedIds([]);
    }
  };

  const handleBulkStatus = (status: 'active' | 'paused') => {
    selectedIds.forEach(id => {
      const policy = policies.find(p => p.id === id);
      if (policy) {
        const updated = { ...policy, status, updatedAt: Date.now() };
        dispatch({ type: 'UPDATE_ENTITY', entityType: 'policies', entity: updated, payload: { type: 'policies', data: updated } });
      }
    });
    dispatch({ type: 'TOAST', payload: { message: `Updated ${selectedIds.length} policies`, type: 'success' } });
    setSelectedIds([]);
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filtered = policies
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => statusFilter === 'all' || p.status === statusFilter)
    .sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
      }
      return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f7f8f8]">SLA Policies</h1>
          <p className="text-sm text-[#8a8f98]">Define and manage service level agreements.</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingPolicy(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 rounded-md bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff]"
        >
          <Plus className="h-4 w-4" /> Create Policy
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-4">
        <div className="flex flex-1 min-w-[240px] items-center gap-2 rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2">
          <Search className="h-4 w-4 text-[#8a8f98]" />
          <input
            type="text"
            placeholder="Search policies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-[#f7f8f8] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#191a1b] p-3">
          <span className="text-sm text-[#d0d6e0]">{selectedIds.length} selected</span>
          <button
            onClick={() => handleBulkStatus('active')}
            className="rounded border border-[rgba(255,255,255,0.08)] px-3 py-1 text-xs text-[#d0d6e0] hover:bg-white/5"
          >
            Set Active
          </button>
          <button
            onClick={() => handleBulkStatus('paused')}
            className="rounded border border-[rgba(255,255,255,0.08)] px-3 py-1 text-xs text-[#d0d6e0] hover:bg-white/5"
          >
            Set Paused
          </button>
          <button
            onClick={handleBulkDelete}
            className="rounded bg-[#ef4444] px-3 py-1 text-xs font-medium text-white hover:bg-[#ef4444]/90"
          >
            Delete Selected
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011]">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="border-b border-[rgba(255,255,255,0.05)] bg-white/[0.02] text-xs uppercase text-[#8a8f98]">
            <tr>
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={toggleSelectAll}
                  className="rounded border-[rgba(255,255,255,0.2)] bg-[#191a1b]"
                />
              </th>
              <th className="p-4 cursor-pointer" onClick={() => toggleSort('name')}>
                <div className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="p-4 cursor-pointer" onClick={() => toggleSort('targetUptime')}>
                <div className="flex items-center gap-1">Target Uptime <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="p-4">Response Target</th>
              <th className="p-4">Resolution Target</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#8a8f98]">No policies found.</td>
              </tr>
            ) : (
              filtered.map(policy => (
                <tr key={policy.id} className="hover:bg-white/[0.01]">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(policy.id)}
                      onChange={() => toggleSelect(policy.id)}
                      className="rounded border-[rgba(255,255,255,0.2)] bg-[#191a1b]"
                    />
                  </td>
                  <td className="p-4 font-medium text-[#f7f8f8]">{policy.name}</td>
                  <td className="p-4 text-[#d0d6e0]">{policy.targetUptime}%</td>
                  <td className="p-4 text-[#d0d6e0]">{policy.responseTimeTarget}m</td>
                  <td className="p-4 text-[#d0d6e0]">{policy.resolutionTimeTarget}m</td>
                  <td className="p-4">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      policy.status === 'active' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#8a8f98]/10 text-[#8a8f98]'
                    }`}>
                      {policy.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingPolicy(policy);
                          setFormData({
                            name: policy.name,
                            targetUptime: policy.targetUptime,
                            responseTimeTarget: policy.responseTimeTarget,
                            resolutionTimeTarget: policy.resolutionTimeTarget,
                            status: policy.status,
                          });
                          setIsModalOpen(true);
                        }}
                        className="rounded p-1 text-[#8a8f98] hover:bg-white/5 hover:text-[#f7f8f8]"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(policy.id)}
                        className="rounded p-1 text-[#8a8f98] hover:bg-white/5 hover:text-[#ef4444]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#191a1b] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4">
              <h3 className="text-lg font-medium text-[#f7f8f8]">
                {editingPolicy ? 'Edit Policy' : 'Create Policy'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8a8f98] hover:text-[#f7f8f8]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#8a8f98] uppercase mb-1">Policy Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  placeholder="e.g. Enterprise Gold SLA"
                />
                {errors.name && <p className="mt-1 text-xs text-[#ef4444]">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8a8f98] uppercase mb-1">Target Uptime (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.targetUptime}
                    onChange={e => setFormData({ ...formData, targetUptime: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  />
                  {errors.targetUptime && <p className="mt-1 text-xs text-[#ef4444]">{errors.targetUptime}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8a8f98] uppercase mb-1">Response (min)</label>
                  <input
                    type="number"
                    value={formData.responseTimeTarget}
                    onChange={e => setFormData({ ...formData, responseTimeTarget: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  />
                  {errors.responseTimeTarget && <p className="mt-1 text-xs text-[#ef4444]">{errors.responseTimeTarget}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8a8f98] uppercase mb-1">Resolution (min)</label>
                  <input
                    type="number"
                    value={formData.resolutionTimeTarget}
                    onChange={e => setFormData({ ...formData, resolutionTimeTarget: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  />
                  {errors.resolutionTimeTarget && <p className="mt-1 text-xs text-[#ef4444]">{errors.resolutionTimeTarget}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8a8f98] uppercase mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-[rgba(255,255,255,0.05)] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-[#d0d6e0] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff]"
                >
                  {editingPolicy ? 'Save Changes' : 'Create Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
