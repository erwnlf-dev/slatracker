// FILE: src/app/dashboard/incidents/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Plus, Search, Trash2, Edit2, X, AlertTriangle } from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  severity: 'critical' | 'major' | 'minor';
  policyId: string;
  status: 'open' | 'investigating' | 'mitigated' | 'resolved' | 'closed';
  statusHistory: { status: string; at: number }[];
  createdAt: number;
  updatedAt: number;
}

export default function IncidentsPage() {
  const { state, dispatch } = useStore();
  const { incidents = [], policies = [] } = state;

  // Search, filter, sort state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [policyFilter, setPolicyFilter] = useState('');
  const [sortField, setSortField] = useState<'title' | 'severity' | 'status' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSeverity, setFormSeverity] = useState<'critical' | 'major' | 'minor'>('minor');
  const [formPolicyId, setFormPolicyId] = useState('');
  const [formStatus, setFormStatus] = useState<'open' | 'investigating' | 'mitigated' | 'resolved' | 'closed'>('open');
  const [errors, setErrors] = useState<{ title?: string; policyId?: string }>({});

  // Filter & Sort logic
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        const matchesSearch = inc.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || inc.status === statusFilter;
        const matchesSeverity = !severityFilter || inc.severity === severityFilter;
        const matchesPolicy = !policyFilter || inc.policyId === policyFilter;
        return matchesSearch && matchesStatus && matchesSeverity && matchesPolicy;
      })
      .sort((a, b) => {
        let aVal: any = a[sortField];
        let bVal: any = b[sortField];
        if (typeof aVal === 'string') {
          return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
  }, [incidents, search, statusFilter, severityFilter, policyFilter, sortField, sortOrder]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredIncidents.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Actions
  const validate = () => {
    const newErrors: { title?: string; policyId?: string } = {};
    if (!formTitle.trim()) newErrors.title = 'Title is required';
    if (!formPolicyId) newErrors.policyId = 'Policy is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const now = Date.now();
    const newIncident: Incident = {
      id: Math.random().toString(36).substring(2, 9),
      title: formTitle,
      severity: formSeverity,
      policyId: formPolicyId,
      status: formStatus,
      statusHistory: [{ status: formStatus, at: now }],
      createdAt: now,
      updatedAt: now,
    };

    dispatch({ type: 'ADD_ENTITY', payload: { type: 'incidents', data: newIncident } });
    dispatch({
      type: 'ADD_ENTITY',
      payload: {
        type: 'activities',
        data: {
          id: Math.random().toString(36).substring(2, 9),
          action: 'created',
          entityType: 'incident',
          entityName: formTitle,
          detail: `Severity: ${formSeverity}`,
          timestamp: now,
        },
      },
    });
    dispatch({ type: 'TOAST', payload: { message: 'Incident created successfully', type: 'success' } });
    closeCreateModal();
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncident || !validate()) return;

    const now = Date.now();
    const statusChanged = editingIncident.status !== formStatus;
    const updatedHistory = statusChanged
      ? [...editingIncident.statusHistory, { status: formStatus, at: now }]
      : editingIncident.statusHistory;

    const updatedIncident: Incident = {
      ...editingIncident,
      title: formTitle,
      severity: formSeverity,
      policyId: formPolicyId,
      status: formStatus,
      statusHistory: updatedHistory,
      updatedAt: now,
    };

    dispatch({ type: 'UPDATE_ENTITY', payload: { type: 'incidents', data: updatedIncident } });
    dispatch({
      type: 'ADD_ENTITY',
      payload: {
        type: 'activities',
        data: {
          id: Math.random().toString(36).substring(2, 9),
          action: statusChanged ? 'status_changed' : 'updated',
          entityType: 'incident',
          entityName: formTitle,
          detail: statusChanged ? `Status changed to ${formStatus}` : 'Details updated',
          timestamp: now,
        },
      },
    });
    dispatch({ type: 'TOAST', payload: { message: 'Incident updated successfully', type: 'success' } });
    closeEditModal();
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm('Are you sure you want to delete this incident?')) return;
    dispatch({ type: 'DELETE_ENTITY', payload: { type: 'incidents', id } });
    dispatch({
      type: 'ADD_ENTITY',
      payload: {
        type: 'activities',
        data: {
          id: Math.random().toString(36).substring(2, 9),
          action: 'deleted',
          entityType: 'incident',
          entityName: title,
          timestamp: Date.now(),
        },
      },
    });
    dispatch({ type: 'TOAST', payload: { message: 'Incident deleted', type: 'success' } });
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleBulkDelete = () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} incidents?`)) return;
    selectedIds.forEach((id) => {
      const inc = incidents.find((i) => i.id === id);
      dispatch({ type: 'DELETE_ENTITY', payload: { type: 'incidents', id } });
      if (inc) {
        dispatch({
          type: 'ADD_ENTITY',
          payload: {
            type: 'activities',
            data: {
              id: Math.random().toString(36).substring(2, 9),
              action: 'deleted',
              entityType: 'incident',
              entityName: inc.title,
              timestamp: Date.now(),
            },
          },
        });
      }
    });
    dispatch({ type: 'TOAST', payload: { message: 'Selected incidents deleted', type: 'success' } });
    setSelectedIds([]);
  };

  const handleBulkStatusChange = (status: Incident['status']) => {
    const now = Date.now();
    selectedIds.forEach((id) => {
      const inc = incidents.find((i) => i.id === id);
      if (inc && inc.status !== status) {
        const updatedIncident: Incident = {
          ...inc,
          status,
          statusHistory: [...inc.statusHistory, { status, at: now }],
          updatedAt: now,
        };
        dispatch({ type: 'UPDATE_ENTITY', payload: { type: 'incidents', data: updatedIncident } });
        dispatch({
          type: 'ADD_ENTITY',
          payload: {
            type: 'activities',
            data: {
              id: Math.random().toString(36).substring(2, 9),
              action: 'status_changed',
              entityType: 'incident',
              entityName: inc.title,
              detail: `Status changed to ${status}`,
              timestamp: now,
            },
          },
        });
      }
    });
    dispatch({ type: 'TOAST', payload: { message: 'Bulk status updated', type: 'success' } });
    setSelectedIds([]);
  };

  const handleInlineStatusChange = (incident: Incident, status: Incident['status']) => {
    const now = Date.now();
    const updatedIncident: Incident = {
      ...incident,
      status,
      statusHistory: [...incident.statusHistory, { status, at: now }],
      updatedAt: now,
    };
    dispatch({ type: 'UPDATE_ENTITY', payload: { type: 'incidents', data: updatedIncident } });
    dispatch({
      type: 'ADD_ENTITY',
      payload: {
        type: 'activities',
        data: {
          id: Math.random().toString(36).substring(2, 9),
          action: 'status_changed',
          entityType: 'incident',
          entityName: incident.title,
          detail: `Status changed to ${status}`,
          timestamp: now,
        },
      },
    });
    dispatch({ type: 'TOAST', payload: { message: `Status updated to ${status}`, type: 'success' } });
  };

  const openCreateModal = () => {
    setFormTitle('');
    setFormSeverity('minor');
    setFormPolicyId(policies[0]?.id || '');
    setFormStatus('open');
    setErrors({});
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => setIsCreateOpen(false);

  const openEditModal = (incident: Incident) => {
    setEditingIncident(incident);
    setFormTitle(incident.title);
    setFormSeverity(incident.severity);
    setFormPolicyId(incident.policyId);
    setFormStatus(incident.status);
    setErrors({});
  };

  const closeEditModal = () => setEditingIncident(null);

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'major':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-500/10 text-red-400';
      case 'investigating':
        return 'bg-amber-500/10 text-amber-400';
      case 'mitigated':
        return 'bg-blue-500/10 text-blue-400';
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-400';
      default:
        return 'bg-zinc-500/10 text-zinc-400';
    }
  };

  // ponytail: Inline status change uses simple select element. Upgrade to custom dropdown when design system requires it.
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#f7f8f8]">Incidents</h1>
          <p className="text-sm text-[#8a8f98]">Track and manage active service disruptions and resolutions.</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 rounded-md bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] transition-colors">
          <Plus className="h-4 w-4" />
          Log Incident
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8a8f98]" />
          <input
            type="text"
            placeholder="Search incidents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] py-2 pl-9 pr-4 text-sm text-[#f7f8f8] placeholder-[#8a8f98] focus:border-[#5e6ad2] focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="mitigated">Mitigated</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>

          <select
            value={policyFilter}
            onChange={(e) => setPolicyFilter(e.target.value)}
            className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
          >
            <option value="">All Policies</option>
            {policies.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-amber-200">{selectedIds.length} incidents selected</span>
          <div className="flex flex-wrap items-center gap-2">
            <select
              onChange={(e) => handleBulkStatusChange(e.target.value as Incident['status'])}
              defaultValue=""
              className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-1.5 text-xs text-[#f7f8f8] focus:outline-none"
            >
              <option value="" disabled>Change Status...</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="mitigated">Mitigated</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 rounded-md bg-[#ef4444] px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Incidents Table */}
      <div className="overflow-hidden rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-[#d0d6e0]">
            <thead className="border-b border-[rgba(255,255,255,0.05)] bg-[#08090a] text-xs uppercase text-[#8a8f98]">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredIncidents.length > 0 && selectedIds.length === filteredIncidents.length}
                    onChange={handleSelectAll}
                    className="rounded border-[rgba(255,255,255,0.2)] bg-[#191a1b] text-[#5e6ad2] focus:ring-0"
                  />
                </th>
                <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('title')}>
                  Incident {sortField === 'title' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('severity')}>
                  Severity {sortField === 'severity' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="p-4">Policy</th>
                <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                  Status {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('createdAt')}>
                  Logged {sortField === 'createdAt' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#8a8f98]">
                    No incidents found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => {
                  const linkedPolicy = policies.find((p) => p.id === incident.policyId);
                  return (
                    <tr key={incident.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(incident.id)}
                          onChange={(e) => handleSelectOne(incident.id, e.target.checked)}
                          className="rounded border-[rgba(255,255,255,0.2)] bg-[#191a1b] text-[#5e6ad2] focus:ring-0"
                        />
                      </td>
                      <td className="p-4 font-medium text-[#f7f8f8]">{incident.title}</td>
                      <td className="p-4">
                        <span className={`rounded-md px-2 py-0.5 text-xs font-medium uppercase ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="p-4 text-[#8a8f98]">{linkedPolicy ? linkedPolicy.name : 'Unknown Policy'}</td>
                      <td className="p-4">
                        <select
                          value={incident.status}
                          onChange={(e) => handleInlineStatusChange(incident, e.target.value as Incident['status'])}
                          className={`rounded px-2 py-1 text-xs font-medium bg-[#191a1b] border border-[rgba(255,255,255,0.08)] focus:outline-none ${getStatusColor(incident.status)}`}
                        >
                          <option value="open">Open</option>
                          <option value="investigating">Investigating</option>
                          <option value="mitigated">Mitigated</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="p-4 text-[#8a8f98]">{new Date(incident.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(incident)}
                            className="rounded p-1 text-[#8a8f98] hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(incident.id, incident.title)}
                            className="rounded p-1 text-[#8a8f98] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#ef4444]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#191a1b] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4">
              <h2 className="text-lg font-semibold text-[#f7f8f8]">Log Incident</h2>
              <button onClick={closeCreateModal} className="text-[#8a8f98] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#8a8f98] mb-1.5">Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. API Gateway Outage"
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                />
                {errors.title && <p className="mt-1 text-xs text-[#ef4444]">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#8a8f98] mb-1.5">Severity</label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as any)}
                    className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  >
                    <option value="critical">Critical</option>
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#8a8f98] mb-1.5">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="mitigated">Mitigated</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#8a8f98] mb-1.5">Linked SLA Policy</label>
                <select
                  value={formPolicyId}
                  onChange={(e) => setFormPolicyId(e.target.value)}
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                >
                  <option value="" disabled>Select a policy...</option>
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.policyId && <p className="mt-1 text-xs text-[#ef4444]">{errors.policyId}</p>}
              </div>

              <div className="flex justify-end gap-3 border-t border-[rgba(255,255,255,0.05)] pt-4">
                <button type="button" onClick={closeCreateModal} className="rounded-md border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-[#d0d6e0] hover:bg-[rgba(255,255,255,0.02)]">
                  Cancel
                </button>
                <button type="submit" className="rounded-md bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff]">
                  Create Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#191a1b] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4">
              <h2 className="text-lg font-semibold text-[#f7f8f8]">Edit Incident</h2>
              <button onClick={closeEditModal} className="text-[#8a8f98] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#8a8f98] mb-1.5">Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                />
                {errors.title && <p className="mt-1 text-xs text-[#ef4444]">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#8a8f98] mb-1.5">Severity</label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as any)}
                    className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  >
                    <option value="critical">Critical</option>
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#8a8f98] mb-1.5">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="mitigated">Mitigated</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#8a8f98] mb-1.5">Linked SLA Policy</label>
                <select
                  value={formPolicyId}
                  onChange={(e) => setFormPolicyId(e.target.value)}
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                >
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.policyId && <p className="mt-1 text-xs text-[#ef4444]">{errors.policyId}</p>}
              </div>

              <div className="flex justify-end gap-3 border-t border-[rgba(255,255,255,0.05)] pt-4">
                <button type="button" onClick={closeEditModal} className="rounded-md border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-[#d0d6e0] hover:bg-[rgba(255,255,255,0.02)]">
                  Cancel
                </button>
                <button type="submit" className="rounded-md bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff]">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
