import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { configureStore, type Middleware } from '@reduxjs/toolkit';
import weatherReducer, {
  cityAdded,
  cityRemoved,
  fetchWeatherForCity,
} from '../store/weatherSlice';
import configReducer, { refreshIntervalChanged } from '../store/configSlice';
import { schedulerMiddleware } from '../store/middleware/scheduler';
import type { City } from '../types';

const tokyo: City = {
  id: 'tokyo:35.69,139.69',
  name: 'Tokyo',
  country: 'Japan',
  latitude: 35.69,
  longitude: 139.69,
  timezone: 'Asia/Tokyo',
};

const paris: City = {
  id: 'paris:48.85,2.35',
  name: 'Paris',
  country: 'France',
  latitude: 48.85,
  longitude: 2.35,
  timezone: 'Europe/Paris',
};

// Records every action that passes through, for assertions.
function makeRecordingStore() {
  const actions: Array<{ type: string }> = [];
  const recorder: Middleware = () => (next) => (action) => {
    actions.push(action as { type: string });
    return next(action);
  };
  const store = configureStore({
    reducer: { weather: weatherReducer, config: configReducer },
    middleware: (gdm) =>
      gdm({ thunk: { extraArgument: undefined } }).concat(schedulerMiddleware, recorder),
  });
  return { store, actions };
}

describe('schedulerMiddleware — TODO 3', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Prevent the thunk from actually running fetch — we only care that the
    // scheduler dispatched the thunk, not that the network call succeeds.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ current: {} }), { status: 200 })),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('does not schedule anything when there are no cities', () => {
    const { actions } = makeRecordingStore();
    actions.length = 0;
    vi.advanceTimersByTime(60_000);
    const pendings = actions.filter((a) => a.type === 'weather/fetchWeatherForCity/pending');
    expect(pendings).toHaveLength(0);
  });

  it('dispatches fetchWeatherForCity.pending on each tick after a city is added', () => {
    const { store, actions } = makeRecordingStore();
    store.dispatch(cityAdded(tokyo));
    actions.length = 0; // reset, ignore setup actions

    vi.advanceTimersByTime(30_000); // one tick at default 30s interval

    const pendings = actions.filter(
      (a) => a.type === 'weather/fetchWeatherForCity/pending',
    );
    expect(pendings.length).toBeGreaterThanOrEqual(1);
  });

  it('fires the thunk for every tracked city on each tick', () => {
    const { store, actions } = makeRecordingStore();
    store.dispatch(cityAdded(tokyo));
    store.dispatch(cityAdded(paris));
    actions.length = 0;

    vi.advanceTimersByTime(30_000);

    const pendings = actions.filter(
      (a) => a.type === 'weather/fetchWeatherForCity/pending',
    );
    expect(pendings.length).toBeGreaterThanOrEqual(2);
  });

  it('stops scheduling after the last city is removed', () => {
    const { store, actions } = makeRecordingStore();
    store.dispatch(cityAdded(tokyo));
    store.dispatch(cityRemoved(tokyo.id));
    actions.length = 0;

    vi.advanceTimersByTime(120_000);

    const pendings = actions.filter(
      (a) => a.type === 'weather/fetchWeatherForCity/pending',
    );
    expect(pendings).toHaveLength(0);
  });

  it('restarts on interval change with the new period', () => {
    const { store, actions } = makeRecordingStore();
    store.dispatch(cityAdded(tokyo));
    store.dispatch(refreshIntervalChanged(10_000));
    actions.length = 0;

    vi.advanceTimersByTime(10_000);

    const pendings = actions.filter(
      (a) => a.type === 'weather/fetchWeatherForCity/pending',
    );
    expect(pendings.length).toBeGreaterThanOrEqual(1);
  });

  it('an interval of 0 (Off) means no scheduled dispatches', () => {
    const { store, actions } = makeRecordingStore();
    store.dispatch(cityAdded(tokyo));
    store.dispatch(refreshIntervalChanged(0));
    actions.length = 0;

    vi.advanceTimersByTime(120_000);

    const pendings = actions.filter(
      (a) => a.type === 'weather/fetchWeatherForCity/pending',
    );
    expect(pendings).toHaveLength(0);
  });

  // Reference: keep imports honest
  void fetchWeatherForCity;
});
