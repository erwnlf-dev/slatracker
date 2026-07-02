// FILE: src/app/dashboard/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { SLAPolicy, Incident } from '@/lib/types';
import { 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity as ActivityIcon, 
  ShieldAlert, 
  X 
} from 'lucide-react';

export default function DashboardPage() {
  const { state, dispatch } = useStore();
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  // Form states
  const [incidentForm, setIncidentForm] = useState({ title: '', severity: 'major' as Incident['severity'], policyId: '' });
  const [policyForm, setPolicyForm] = useState({ name: '', targetUptime: 99.9, responseTimeTarget: 30, resolutionTimeTarget: 120 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculations
  const activePolicies = useMemo(() => state.policies.filter(p => p.status === 'active'), [state.policies]);
  const activeIncidents = useMemo(() => state.incidents.filter(i => i.status !== 'resolved' && i.status !== 'closed'), [state.incidents]);
  
  const policyComplianceMap = useMemo(() => {
    const map: Record<string, number> = {};
    state.policies.forEach(p => {
      const policyIncidents = state.incidents.filter(i => i.policyId === p.id);
      let deduction = 0;
      policyIncidents.forEach(inc => {
        if (inc.status !== 'resolved' && inc.status !== 'closed') {
          if (inc.severity === 'critical') deduction += 1.5;
          if (inc.severity === 'major') deduction += 0.5;
          if (inc.severity === 'minor') deduction += 0.1;
        }
      });
      map[p.id] = Math.max(0, Math.min(100, Number((100 - deduction).toFixed(2))));
    });
    return map;
  }, [state.policies, state.incidents]);

  const overallCompliance = useMemo(() => {
    if (activePolicies.length === 0) return 100;
    const sum = activePolicies.reduce((acc, p) => acc + (policyComplianceMap[p.id] ?? 100), 0);
    return Number((sum / activePolicies.length).toFixed(2));
  }, [activePolicies, policyComplianceMap]);

  const avgResolutionTime = useMemo(() => {
    const resolved = state.incidents.filter(i => i.status === 'resolved' || i.status === 'closed');
    if (!resolved.length) return 0;
    const total = resolved.reduce((acc, curr) => {
      const end = curr.statusHistory.find(h => h.status === 'resolved' || h.status === 'closed')?.at || curr.updatedAt;
      return acc + (end - curr.createdAt);
    }, 0);
    return Math.round(total / resolved.length / 60000); // minutes
  }, [state.incidents]);

  const severityCounts = useMemo(() => {
    const counts = { critical: 0, major: 0, minor: 0 };
    activeIncidents.forEach(i => {
      if (i.severity in counts) counts[i.severity]++;
    });
    return counts;
  }, [activeIncidents]);

  const recentActivities = useMemo(() => {
    return [...state.activities].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  }, [state.activities]);

  // Actions
  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentForm.title.trim()) return setErrors({ title: 'Title is required' });
    if (!incidentForm.policyId) return setErrors({ policyId: 'Policy is required' });

    const newIncident: Incident = {
      id: crypto.randomUUID(),
      title: incidentForm.title,
      severity: incidentForm.severity,
      policyId: incidentForm.policyId,
      status: 'open',
      statusHistory: [{ status: 'open', at: Date.now() }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    dispatch({ type: 'ADD_ENTITY', payload: { type: 'incidents', data: newIncident } });
    dispatch({
      type: 'TOAST',
      payload: { message: `Incident "${newIncident.title}" logged successfully`, type: 'success' }
    });
    
    setIsIncidentModalOpen(false);
    setIncidentForm({ title: '', severity: 'major', policyId: '' });
    setErrors({});
  };

  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyForm.name.trim()) return setErrors({ name: 'Name is required' });

    const newPolicy: SLAPolicy = {
      id: crypto.randomUUID(),
      name: policyForm.name,
      targetUptime: Number(policyForm.targetUptime),
      responseTimeTarget: Number(policyForm.responseTimeTarget),
      resolutionTimeTarget: Number(policyForm.resolutionTimeTarget),
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    dispatch({ type: 'ADD_ENTITY', payload: { type: 'policies', data: newPolicy } });
    dispatch({
      type: 'TOAST',
      payload: { message: `SLA Policy "${newPolicy.name}" created`, type: 'success' }
    });

    setIsPolicyModalOpen(false);
    setPolicyForm({ name: '', targetUptime: 99.9, responseTimeTarget: 30, resolutionTimeTarget: 120 });
    setErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f7f8f8]">Dashboard</h1>
          <p className="text-sm text-[#8a8f98]">Real-time SLA compliance and incident tracking.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsPolicyModalOpen(true)}
            className="rounded-md border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-[#d0d6e0] hover:bg-[#191a1b]"
          >
            New Policy
          </button>
          <button 
            onClick={() => setIsIncidentModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff]"
          >
            <Plus className="h-4 w-4" /> Log Incident
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#8a8f98]">Overall Compliance</span>
            <CheckCircle className={`h-5 w-5 ${overallCompliance >= 99.9 ? 'text-[#10b981]' : 'text-[#f59e0b]'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-[#f7f8f8]">{overallCompliance}%</span>
          </div>
          <p className="mt-1 text-xs text-[#62666d]">Target: 99.9% average</p>
        </div>

        <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#8a8f98]">Active Incidents</span>
            <ShieldAlert className={`h-5 w-5 ${activeIncidents.length > 0 ? 'text-[#ef4444]' : 'text-[#8a8f98]'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-[#f7f8f8]">{activeIncidents.length}</span>
          </div>
          <p className="mt-1 text-xs text-[#62666d]">Requires immediate attention</p>
        </div>

        <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#8a8f98]">Active Policies</span>
            <Clock className="h-5 w-5 text-[#3b82f6]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-[#f7f8f8]">{activePolicies.length}</span>
          </div>
          <p className="mt-1 text-xs text-[#62666d]">Monitored SLA targets</p>
        </div>

        <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#8a8f98]">Avg Resolution Time</span>
            <Clock className="h-5 w-5 text-[#10b981]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-[#f7f8f8]">{avgResolutionTime}m</span>
          </div>
          <p className="mt-1 text-xs text-[#62666d]">Based on resolved incidents</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Compliance Bar Chart */}
        <div className="lg:col-span-2 rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-5">
          <h3 className="text-lg font-medium text-[#f7f8f8] mb-4">Policy Compliance</h3>
          <div className="space-y-4">
            {state.policies.length === 0 ? (
              <p className="text-sm text-[#8a8f98] py-4 text-center">No policies defined yet.</p>
            ) : (
              state.policies.map(policy => {
                const compliance = policyComplianceMap[policy.id] ?? 100;
                const isViolated = compliance < policy.targetUptime;
                return (
                  <div key={policy.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-[#d0d6e0]">{policy.name}</span>
                      <span className={`font-semibold ${isViolated ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                        {compliance}% <span className="text-xs text-[#8a8f98] font-normal">/ {policy.targetUptime}%</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#191a1b] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isViolated ? 'bg-[#ef4444]' : 'bg-[#10b981]'}`}
                        style={{ width: `${compliance}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium text-[#f7f8f8] mb-4">Active Incidents by Severity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded bg-[#191a1b]/50">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
                  <span className="text-sm text-[#d0d6e0]">Critical</span>
                </div>
                <span className="text-sm font-semibold text-[#f7f8f8]">{severityCounts.critical}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#191a1b]/50">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#f59e0b]" />
                  <span className="text-sm text-[#d0d6e0]">Major</span>
                </div>
                <span className="text-sm font-semibold text-[#f7f8f8]">{severityCounts.major}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#191a1b]/50">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#3b82f6]" />
                  <span className="text-sm text-[#d0d6e0]">Minor</span>
                </div>
                <span className="text-sm font-semibold text-[#f7f8f8]">{severityCounts.minor}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.05)] text-xs text-[#8a8f98] flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 text-[#f59e0b]" />
            Unresolved incidents degrade compliance metrics.
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-5">
        <div className="flex items-center gap-2 mb-4">
          <ActivityIcon className="h-5 w-5 text-[#5e6ad2]" />
          <h3 className="text-lg font-medium text-[#f7f8f8]">Recent Activity</h3>
        </div>
        <div className="flow-root">
          <ul className="-mb-8">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-[#8a8f98] py-4 text-center">No recent activity recorded.</p>
            ) : (
              recentActivities.map((activity, idx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {idx !== recentActivities.length - 1 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-[rgba(255,255,255,0.05)]" aria-hidden="true" />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-[#191a1b] flex items-center justify-center ring-8 ring-[#0f1011]">
                          <ActivityIcon className="h-4 w-4 text-[#8a8f98]" />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-[#d0d6e0]">
                            {activity.entityType === 'incident' ? 'Incident' : 'Policy'}{' '}
                            <span className="font-medium text-[#f7f8f8]">"{activity.entityName}"</span>{' '}
                            {activity.action.replace('_', ' ')}
                            {activity.detail && <span className="text-[#8a8f98]"> ({activity.detail})</span>}
                          </p>
                        </div>
                        <div className="text-right text-xs whitespace-nowrap text-[#62666d]">
                          {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Log Incident Modal */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#191a1b] p-6 relative">
            <button 
              onClick={() => setIsIncidentModalOpen(false)}
              className="absolute top-4 right-4 text-[#8a8f98] hover:text-[#f7f8f8]"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-[#f7f8f8] mb-4">Log New Incident</h2>
            <form onSubmit={handleCreateIncident} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#8a8f98] uppercase mb-1">Incident Title</label>
                <input 
                  type="text"
                  value={incidentForm.title}
                  onChange={e => setIncidentForm({ ...incidentForm, title: e.target.value })}
                  placeholder="e.g. API Gateway Timeout"
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                />
                {errors.title && <p className="mt-1 text-xs text-[#ef4444]">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8a8f98] uppercase mb-1">Severity</label>
                <select
                  value={incidentForm.severity}
                  onChange={e => setIncidentForm({ ...incidentForm, severity: e.target.value as Incident['severity'] })}
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                >
                  <option value="critical">Critical (Complete Outage)</option>
                  <option value="major">Major (Performance Degradation)</option>
                  <option value="minor">Minor (Partial Issue)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8a8f98] uppercase mb-1">Linked SLA Policy</label>
                <select
                  value={incidentForm.policyId}
                  onChange={e => setIncidentForm({ ...incidentForm, policyId: e.target.value })}
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                >
                  <option value="">Select a policy...</option>
                  {state.policies.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {errors.policyId && <p className="mt-1 text-xs text-[#ef4444]">{errors.policyId}</p>}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsIncidentModalOpen(false)}
                  className="rounded-md border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-[#d0d6e0] hover:bg-[#191a1b]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-md bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff]"
                >
                  Log Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Policy Modal */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#191a1b] p-6 relative">
            <button 
              onClick={() => setIsPolicyModalOpen(false)}
              className="absolute top-4 right-4 text-[#8a8f98] hover:text-[#f7f8f8]"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-[#f7f8f8] mb-4">Create SLA Policy</h2>
            <form onSubmit={handleCreatePolicy} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#8a8f98] uppercase mb-1">Policy Name</label>
                <input 
                  type="text"
                  value={policyForm.name}
                  onChange={e => setPolicyForm({ ...policyForm, name: e.target.value })}
                  placeholder="e.g. Core API Uptime"
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                />
                {errors.name && <p className="mt-1 text-xs text-[#ef4444]">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8a8f98] uppercase mb-1">Target Uptime (%)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={policyForm.targetUptime}
                    onChange={e => setPolicyForm({ ...policyForm, targetUptime: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8a8f98] uppercase mb-1">Response (min)</label>
                  <input 
                    type="number"
                    min="1"
                    value={policyForm.responseTimeTarget}
                    onChange={e => setPolicyForm({ ...policyForm, responseTimeTarget: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8a8f98] uppercase mb-1">Resolution (min)</label>
                  <input 
                    type="number"
                    min="1"
                    value={policyForm.resolutionTimeTarget}
                    onChange={e => setPolicyForm({ ...policyForm, resolutionTimeTarget: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsPolicyModalOpen(false)}
                  className="rounded-md border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-[#d0d6e0] hover:bg-[#191a1b]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-md bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff]"
                >
                  Create Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
