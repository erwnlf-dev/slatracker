import { describe, it, expect } from 'vitest';
import { reducer, AppState } from '/src/lib/store';

const initialState: AppState = {
  policies: [],
  incidents: [],
  activities: [],
  profile: { name: 'Test', email: 'test@test.com', notifications: true },
  loaded: false,
  toasts: [],
};

describe('reducer', () => {
  it('adds entity', () => {
    const policy = { id: 'p1', name: 'Policy 1' };
    const state = reducer(initialState, {
      type: 'ADD_ENTITY',
      payload: { type: 'policies', data: policy },
    });
    expect(state.policies).toContainEqual(policy);
  });

  it('updates entity', () => {
    const stateWithPolicy = {
      ...initialState,
