import { describe, it, expect } from 'vitest';
import { AppState, Action } from '/src/lib/types';

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SEED':
      return { ...state, ...action.payload, loaded: true };
    case 'ADD_ENTITY':
      if (action.payload.type === 'policy') {
        return { ...state, policies: [...state.policies, action.payload.data] };
      }
      return state;
    case 'TOAST':
      return { ...state, toast: action.payload };
    case 'DISMISS_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

describe('AppState and Action Types', () => {
  const initialState: AppState = {
    policies: [],
    incidents: [],
    activities: [],
    profile: { name: '', email: '', notifications: false },
    loaded: false,
    toast: null,
  };

  it('should handle SEED action', () => {
    const payload = {
      policies: [{ id: '1', name: 'SLA 1', targetUptime: 99.9, responseTimeTarget: 10, resolutionTimeTarget: 60, status: 'active'
