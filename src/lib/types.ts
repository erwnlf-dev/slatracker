// FILE: src/lib/types.ts

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
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface AppState {
  policies: SLAPolicy[];
  incidents: Incident[];
  activities: Activity[];
  profile: UserProfile;
  loaded: boolean;
  toast: Toast | null;
}

export type Action =
  | { type: 'SEED'; payload: { policies: SLAPolicy[]; incidents: Incident[]; activities: Activity[]; profile: UserProfile } }
  | { type: 'ADD_ENTITY'; payload: { type: 'policy' | 'incident' | 'activity'; data: any } }
  | { type: 'UPDATE_ENTITY'; payload: { type: 'policy' | 'incident' | 'profile'; data: any } }
  | { type: 'DELETE_ENTITY'; payload: { type: 'policy' | 'incident'; id: string } }
  | { type: 'DELETE_ENTITIES'; payload: { type: 'policy' | 'incident'; ids: string[] } }
  | { type: 'TOAST'; payload: Toast }
  | { type: 'DISMISS_TOAST' };