// FILE: src/lib/store.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface SLAPolicy {
  id: string;
  name: string;
  targetUptime: number;
  responseTimeTarget: number;
  resolutionTimeTarget: number;
  status: 'active' | 'paused';
  createdAt: number;
  updatedAt: number;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'critical' | 'major' | 'minor';
  policyId: string;
  status: 'open' | 'investigating' | 'mitigated' | 'resolved' | 'closed';
  statusHistory: { status: string; at: number }[];
  createdAt: number;
  updatedAt: number;
}

export interface Activity {
  id: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  entityType: 'policy' | 'incident';
  entityName: string;
  detail?: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  email: string;
  notifications: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface AppState {
  policies: SLAPolicy[];
  incidents: Incident[];
  activities: Activity[];
  profile: UserProfile;
  loaded: boolean;
  toasts: Toast[];
}

type Action =
  | { type: 'LOAD'; payload: Omit<AppState, 'loaded' | 'toasts'> }
  | { type: 'SEED' }
  | { type: 'ADD_ENTITY'; payload: { type: string; data: any }; [key: string]: any }
  | { type: 'UPDATE_ENTITY'; payload: { type: string; id?: string; data: any }; [key: string]: any }
  | { type: 'DELETE_ENTITY'; payload: { type: string; id: string }; [key: string]: any }
  | { type: 'BULK_DELETE'; payload: { type: string; ids: string[] } }
  | { type: 'BULK_UPDATE'; payload: { type: string; ids: string[]; data: any } }
  | { type: 'UPDATE_PROFILE'; payload: UserProfile }
  | { type: 'TOAST'; payload: { message: string; type: 'success' | 'error' | 'info' } }
  | { type: 'DISMISS_TOAST'; payload: string }
  | { type: 'RESET' };

const KEYS = {
  policies: 'slatracker_policies',
  incidents: 'slatracker_incidents',
  activities: 'slatracker_activities',
  profile: 'slatracker_profile',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Admin User',
  email: 'admin@slatracker.io',
  notifications: true,
};

const SEED_POLICIES: SLAPolicy[] = [
  { id: 'p1', name: 'Core API Gateway', targetUptime: 99.9, responseTimeTarget: 15, resolutionTimeTarget: 60, status: 'active', createdAt: Date.now() - 30 * 86400000, updatedAt: Date.now() - 30 * 86400000 },
  { id: 'p2', name: 'Auth Service', targetUptime: 99.99, responseTimeTarget: 5, resolutionTimeTarget: 30, status: 'active', createdAt: Date.now() - 25 * 86400000, updatedAt: Date.now() - 25 * 86400000 },
  { id: 'p3', name: 'Billing System', targetUptime: 99.5, responseTimeTarget: 60, resolutionTimeTarget: 240, status: 'active', createdAt: Date.now() - 20 * 86400000, updatedAt: Date.now() - 20 * 86400000 },
  { id: 'p4', name: 'Search Indexer', targetUptime: 99.0, responseTimeTarget: 120, resolutionTimeTarget: 480, status: 'paused', createdAt: Date.now() - 15 * 86400000, updatedAt: Date.now() - 15 * 86400000 },
  { id: 'p5', name: 'Notification Delivery', targetUptime: 99.9, responseTimeTarget: 10, resolutionTimeTarget: 45, status: 'active', createdAt: Date.now() - 10 * 86400000, updatedAt: Date.now() - 10 * 86400000 },
  { id: 'p6', name: 'Static Assets CDN', targetUptime: 99.999, responseTimeTarget: 2, resolutionTimeTarget: 15, status: 'active', createdAt: Date.now() - 5 * 86400000, updatedAt: Date.now() - 5 * 86400000 },
  { id: 'p7', name: 'Reporting Engine', targetUptime: 98.0, responseTimeTarget: 240, resolutionTimeTarget: 1440, status: 'active', createdAt: Date.now() - 2 * 86400000, updatedAt: Date.now() - 2 * 86400000 },
  { id: 'p8', name: 'Webhooks Dispatcher', targetUptime: 99.5, responseTimeTarget: 30, resolutionTimeTarget: 120, status: 'active', createdAt: Date.now() - 1 * 86400000, updatedAt: Date.now() - 1 * 86400000 },
];

const SEED_INCIDENTS: Incident[] = [
  { id: 'i1', title: 'API Gateway latency spike', severity: 'critical', policyId: 'p1', status: 'closed', statusHistory: [{ status: 'open', at: Date.now() - 28 * 86400000 }, { status: 'closed', at: Date.now() - 28 * 86400000 + 1800000 }], createdAt: Date.now() - 28 * 86400000, updatedAt: Date.now() - 28 * 86400000 + 1800000 },
  { id: 'i2', title: 'Auth DB connection pool exhausted', severity: 'critical', policyId: 'p2', status: 'resolved', statusHistory: [{ status: 'open', at: Date.now() - 24 * 86400000 }, { status: 'resolved', at: Date.now() - 24 * 86400000 + 900000 }], createdAt: Date.now() - 24 * 86400000, updatedAt: Date.now() - 24 * 86400000 + 900000 },
  { id: 'i3', title: 'Stripe webhook delivery delay', severity: 'major', policyId: 'p3', status: 'mitigated', statusHistory: [{ status: 'open', at: Date.now() - 18 * 86400000 }, { status: 'mitigated', at: Date.now() - 18 * 86400000 + 7200000 }], createdAt: Date.now() - 18 * 86400000, updatedAt: Date.now() - 18 * 86400000 + 7200000 },
  { id: 'i4', title: 'Elasticsearch cluster yellow status', severity: 'minor', policyId: 'p4', status: 'investigating', statusHistory: [{ status: 'open', at: Date.now() - 14 * 86400000 }, { status: 'investigating', at: Date.now() - 14 * 86400000 + 600000 }], createdAt: Date.now() - 14 * 86400000, updatedAt: Date.now() - 14 * 86400000 + 600000 },
  { id: 'i5', title: 'SMS gateway provider outage', severity: 'major', policyId: 'p5', status: 'open', statusHistory: [{ status: 'open', at: Date.now() - 8 * 86400000 }], createdAt: Date.now() - 8 * 86400000, updatedAt: Date.now() - 8 * 86400000 },
  { id: 'i6', title: 'CDN edge cache purge failure', severity: 'minor', policyId: 'p6', status: 'closed', statusHistory: [{ status: 'open', at: Date.now() - 4 * 86400000 }, { status: 'closed', at: Date.now() - 4 * 86400000 + 600000 }], createdAt: Date.now() - 4 * 86400000, updatedAt: Date.now() - 4 * 86400000 + 600000 },
  { id: 'i7', title: 'Monthly PDF generation timeout', severity: 'minor', policyId: 'p7', status: 'resolved', statusHistory: [{ status: 'open', at: Date.now() - 1 * 86400000 }, { status: 'resolved', at: Date.now() - 1 * 86400000 + 3600000 }], createdAt: Date.now() - 1 * 86400000, updatedAt: Date.now() - 1 * 86400000 + 3600000 },
  { id: 'i8', title: 'Webhook retries failing', severity: 'major', policyId: 'p8', status: 'open', statusHistory: [{ status: 'open', at: Date.now() - 3600000 }], createdAt: Date.now() - 3600000, updatedAt: Date.now() - 3600000 },
];

const SEED_ACTIVITIES: Activity[] = [
  { id: 'a1', action: 'created', entityType: 'policy', entityName: 'Core API Gateway', timestamp: Date.now() - 30 * 86400000 },
  { id: 'a2', action: 'created', entityType: 'incident', entityName: 'API Gateway latency spike', timestamp: Date.now() - 28 * 86400000 },
  { id: 'a3', action: 'status_changed', entityType: 'incident', entityName: 'API Gateway latency spike', detail: 'closed', timestamp: Date.now() - 28 * 86400000 + 1800000 },
  { id: 'a4', action: 'created', entityType: 'policy', entityName: 'Auth Service', timestamp: Date.now() - 25 * 86400000 },
  { id: 'a5', action: 'created', entityType: 'incident', entityName: 'Auth DB connection pool exhausted', timestamp: Date.now() - 24 * 86400000 },
  { id: 'a6', action: 'status_changed', entityType: 'incident', entityName: 'Auth DB connection pool exhausted', detail: 'resolved', timestamp: Date.now() - 24 * 86400000 + 900000 },
  { id: 'a7', action: 'created', entityType: 'policy', entityName: 'Billing System', timestamp: Date.now() - 20 * 86400000 },
  { id: 'a8', action: 'created', entityType: 'incident', entityName: 'Stripe webhook delivery delay', timestamp: Date.now() - 18 * 86400000 },
];

const initialState: AppState = {
  policies: [],
  incidents: [],
  activities: [],
  profile: DEFAULT_PROFILE,
  loaded: false,
  toasts: [],
};

function save(state: Omit<AppState, 'loaded' | 'toasts'>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.policies, JSON.stringify(state.policies));
  localStorage.setItem(KEYS.incidents, JSON.stringify(state.incidents));
  localStorage.setItem(KEYS.activities, JSON.stringify(state.activities));
  localStorage.setItem(KEYS.profile, JSON.stringify(state.profile));
}

function logActivity(state: AppState, action: Activity['action'], type: Activity['entityType'], name: string, detail?: string): Activity[] {
  const act: Activity = {
    id: Math.random().toString(36).substring(2, 9),
    action,
    entityType: type,
    entityName: name,
    detail,
    timestamp: Date.now(),
  };
  return [act, ...state.activities];
}

function reducer(state: AppState, action: Action): AppState {
  let next: AppState;

  switch (action.type) {
    case 'LOAD':
      return { ...state, ...action.payload, loaded: true };

    case 'SEED':
      next = {
        ...state,
        policies: SEED_POLICIES,
        incidents: SEED_INCIDENTS,
        activities: SEED_ACTIVITIES,
        profile: DEFAULT_PROFILE,
      };
      save(next);
      return next;

    case 'ADD_ENTITY': {
      const { type, data } = action.payload;
      const id = Math.random().toString(36).substring(2, 9);
      const now = Date.now();
      if (type === 'policy') {
        const item: SLAPolicy = { ...data, id, createdAt: now, updatedAt: now };
        next = {
          ...state,
          policies: [item, ...state.policies],
          activities: logActivity(state, 'created', 'policy', item.name),
        };
      } else {
        const item: Incident = { ...data, id, statusHistory: [{ status: data.status || 'open', at: now }], createdAt: now, updatedAt: now };
        next = {
          ...state,
          incidents: [item, ...state.incidents],
          activities: logActivity(state, 'created', 'incident', item.title),
        };
      }
      save(next);
      return next;
    }

    case 'UPDATE_ENTITY': {
      const { type, id, data } = action.payload;
      const now = Date.now();
      if (type === 'policy') {
        const prev = state.policies.find(p => p.id === id);
        if (!prev) return state;
        const updated = { ...prev, ...data, updatedAt: now };
        next = {
          ...state,
          policies: state.policies.map(p => p.id === id ? updated : p),
          activities: logActivity(state, 'updated', 'policy', updated.name),
        };
      } else {
        const prev = state.incidents.find(i => i.id === id);
        if (!prev) return state;
        const statusChanged = data.status && data.status !== prev.status;
        const statusHistory = statusChanged 
          ? [...prev.statusHistory, { status: data.status, at: now }]
          : prev.statusHistory;
        const updated = { ...prev, ...data, statusHistory, updatedAt: now };
        let acts = state.activities;
        if (statusChanged) {
          acts = logActivity(state, 'status_changed', 'incident', updated.title, data.status);
        } else {
          acts = logActivity(state, 'updated', 'incident', updated.title);
        }
        next = {
          ...state,
          incidents: state.incidents.map(i => i.id === id ? updated : i),
          activities: acts,
        };
      }
      save(next);
      return next;
    }

    case 'DELETE_ENTITY': {
      const { type, id } = action.payload;
      if (type === 'policy') {
        const prev = state.policies.find(p => p.id === id);
        if (!prev) return state;
        next = {
          ...state,
          policies: state.policies.filter(p => p.id !== id),
          activities: logActivity(state, 'deleted', 'policy', prev.name),
        };
      } else {
        const prev = state.incidents.find(i => i.id === id);
        if (!prev) return state;
        next = {
          ...state,
          incidents: state.incidents.filter(i => i.id !== id),
          activities: logActivity(state, 'deleted', 'incident', prev.title),
        };
      }
      save(next);
      return next;
    }

    case 'BULK_DELETE': {
      const { type, ids } = action.payload;
      if (type === 'policy') {
        const targets = state.policies.filter(p => ids.includes(p.id));
        let acts = state.activities;
        targets.forEach(t => {
          acts = [
            { id: Math.random().toString(36).substring(2, 9), action: 'deleted', entityType: 'policy', entityName: t.name, timestamp: Date.now() },
            ...acts
          ];
        });
        next = {
          ...state,
          policies: state.policies.filter(p => !ids.includes(p.id)),
          activities: acts,
        };
      } else {
        const targets = state.incidents.filter(i => ids.includes(i.id));
        let acts = state.activities;
        targets.forEach(t => {
          acts = [
            { id: Math.random().toString(36).substring(2, 9), action: 'deleted', entityType: 'incident', entityName: t.title, timestamp: Date.now() },
            ...acts
          ];
        });
        next = {
          ...state,
          incidents: state.incidents.filter(i => !ids.includes(i.id)),
          activities: acts,
        };
      }
      save(next);
      return next;
    }

    case 'BULK_UPDATE': {
      const { type, ids, data } = action.payload;
      const now = Date.now();
      if (type === 'policy') {
        let acts = state.activities;
        const updatedPolicies = state.policies.map(p => {
          if (ids.includes(p.id)) {
            acts = [
              { id: Math.random().toString(36).substring(2, 9), action: 'updated', entityType: 'policy', entityName: p.name, timestamp: now },
              ...acts
            ];
            return { ...p, ...data, updatedAt: now };
          }
          return p;
        });
        next = { ...state, policies: updatedPolicies, activities: acts };
      } else {
        let acts = state.activities;
        const updatedIncidents = state.incidents.map(i => {
          if (ids.includes(i.id)) {
            const statusChanged = data.status && data.status !== i.status;
            const statusHistory = statusChanged 
              ? [...i.statusHistory, { status: data.status, at: now }]
              : i.statusHistory;
            if (statusChanged) {
              acts = [
                { id: Math.random().toString(36).substring(2, 9), action: 'status_changed', entityType: 'incident', entityName: i.title, detail: data.status, timestamp: now },
                ...acts
              ];
            } else {
              acts = [
                { id: Math.random().toString(36).substring(2, 9), action: 'updated', entityType: 'incident', entityName: i.title, timestamp: now },
                ...acts
              ];
            }
            return { ...i, ...data, statusHistory, updatedAt: now };
          }
          return i;
        });
        next = { ...state, incidents: updatedIncidents, activities: acts };
      }
      save(next);
      return next;
    }

    case 'UPDATE_PROFILE':
      next = { ...state, profile: action.payload };
      save(next);
      return next;

    case 'TOAST': {
      const newToast: Toast = {
        id: Math.random().toString(36).substring(2, 9),
        message: action.payload.message,
        type: action.payload.type,
      };
      return { ...state, toasts: [...state.toasts, newToast] };
    }

    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };

    case 'RESET':
      if (typeof window !== 'undefined') {
        localStorage.removeItem(KEYS.policies);
        localStorage.removeItem(KEYS.incidents);
        localStorage.removeItem(KEYS.activities);
        localStorage.removeItem(KEYS.profile);
      }
      return {
        ...initialState,
        policies: SEED_POLICIES,
        incidents: SEED_INCIDENTS,
        activities: SEED_ACTIVITIES,
        loaded: true,
      };

    default:
      return state;
  }
}

const StoreContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<any>;
} | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const policies = localStorage.getItem(KEYS.policies);
    const incidents = localStorage.getItem(KEYS.incidents);
    const activities = localStorage.getItem(KEYS.activities);
    const profile = localStorage.getItem(KEYS.profile);

    if (policies || incidents || activities || profile) {
      dispatch({
        type: 'LOAD',
        payload: {
          policies: policies ? JSON.parse(policies) : [],
          incidents: incidents ? JSON.parse(incidents) : [],
          activities: activities ? JSON.parse(activities) : [],
          profile: profile ? JSON.parse(profile) : DEFAULT_PROFILE,
        },
      });
    } else {
      dispatch({ type: 'SEED' });
    }
  }, []);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {state.toasts.map(t => (
          <div
            key={t.id}
            onClick={() => dispatch({ type: 'DISMISS_TOAST', payload: t.id })}
            className={`cursor-pointer rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg transition-all border ${
              t.type === 'success' ? 'bg-[#10b981] border-[#10b981]/20' :
              t.type === 'error' ? 'bg-[#ef4444] border-[#ef4444]/20' :
              'bg-[#3b82f6] border-[#3b82f6]/20'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
