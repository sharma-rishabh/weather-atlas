import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { configureStore, type Middleware } from '@reduxjs/toolkit';
import weatherReducer, {
  cityAdded,
  fetchWeatherForCity,
} from '../store/weatherSlice';
import configReducer from '../store/configSlice';
import { retryMiddleware, MAX_ATTEMPTS } from '../store/middleware/retry';
import type { City } from '../types';

const tokyo: City = {
  id: 'tokyo:35.69,139.69',
  name: 'Tokyo',
  country: 'Japan',
  latitude: 35.69,
  longitude: 139.69,
  timezone: 'Asia/Tokyo',
};

function makeStore(fetchImpl: typeof fetch) {
  const actions: Array<{ type: string }> = [];
  const recorder: Middleware = () => (next) => (action) => {
    actions.push(action as { type: string });
    return next(action);
  };
  const store = configureStore({
    reducer: { weather: weatherReducer, config: configReducer },
    middleware: (gdm) => gdm().concat(retryMiddleware, recorder),
  });
  vi.stubGlobal('fetch', fetchImpl);
  return { store, actions };
}

async function flushMicrotasks() {
  // Allow pending promises (the thunk body) to resolve before advancing timers
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe('retryMiddleware — TODO 4', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('re-dispatches the thunk after a rejected action with backoff', async () => {
    const failingFetch = vi.fn(async () => new Response('boom', { status: 500 }));
    const { store, actions } = makeStore(failingFetch as unknown as typeof fetch);
    store.dispatch(cityAdded(tokyo));
    actions.length = 0;

    await store.dispatch(fetchWeatherForCity(tokyo.id));

    // First attempt rejected
    const firstRejected = actions.filter(
      (a) => a.type === 'weather/fetchWeatherForCity/rejected',
    );
    expect(firstRejected.length).toBeGreaterThanOrEqual(1);

    // Before the backoff elapses, no new pending yet
    actions.length = 0;
    await flushMicrotasks();
    expect(
      actions.filter((a) => a.type === 'weather/fetchWeatherForCity/pending'),
    ).toHaveLength(0);

    // Advance past first backoff (500ms)
    vi.advanceTimersByTime(600);
    await flushMicrotasks();
    expect(
      actions.filter((a) => a.type === 'weather/fetchWeatherForCity/pending').length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('stops retrying after MAX_ATTEMPTS', async () => {
    const failingFetch = vi.fn(async () => new Response('boom', { status: 500 }));
    const { store, actions } = makeStore(failingFetch as unknown as typeof fetch);
    store.dispatch(cityAdded(tokyo));

    await store.dispatch(fetchWeatherForCity(tokyo.id));
    // Run timers long enough for all backoffs (500 + 1000 + 2000 + slack)
    for (let i = 0; i < 10; i++) {
      vi.advanceTimersByTime(5000);
      await flushMicrotasks();
    }

    const pendings = actions.filter(
      (a) => a.type === 'weather/fetchWeatherForCity/pending',
    );
    // Includes the original + retries, capped
    expect(pendings.length).toBeLessThanOrEqual(MAX_ATTEMPTS);
    expect(pendings.length).toBeGreaterThanOrEqual(1);
  });

  it('does not retry actions for OTHER thunks', async () => {
    const { store, actions } = makeStore(
      vi.fn(async () => new Response('boom', { status: 500 })) as unknown as typeof fetch,
    );
    actions.length = 0;
    store.dispatch({ type: 'some/other/rejected', error: { message: 'x' } });
    vi.advanceTimersByTime(10_000);
    await flushMicrotasks();

    const pendings = actions.filter(
      (a) => a.type === 'weather/fetchWeatherForCity/pending',
    );
    expect(pendings).toHaveLength(0);
  });
});
