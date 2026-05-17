import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import weatherReducer, {
  cityAdded,
  cityRemoved,
  fetchWeatherForCity,
} from '../store/weatherSlice';
import type { City } from '../types';

const tokyo: City = {
  id: 'tokyo:35.69,139.69',
  name: 'Tokyo',
  country: 'Japan',
  latitude: 35.69,
  longitude: 139.69,
  timezone: 'Asia/Tokyo',
};

function makeStore() {
  return configureStore({ reducer: { weather: weatherReducer } });
}

describe('weatherSlice — basic reducers (already implemented)', () => {
  it('cityAdded inserts a new city in idle state', () => {
    const store = makeStore();
    store.dispatch(cityAdded(tokyo));
    const cities = store.getState().weather.cities;
    expect(cities).toHaveLength(1);
    expect(cities[0]).toMatchObject({
      city: tokyo,
      status: 'idle',
      data: null,
      error: null,
    });
  });

  it('cityAdded is idempotent — adding twice does not duplicate', () => {
    const store = makeStore();
    store.dispatch(cityAdded(tokyo));
    store.dispatch(cityAdded(tokyo));
    expect(store.getState().weather.cities).toHaveLength(1);
  });

  it('cityRemoved removes the matching city', () => {
    const store = makeStore();
    store.dispatch(cityAdded(tokyo));
    store.dispatch(cityRemoved(tokyo.id));
    expect(store.getState().weather.cities).toHaveLength(0);
  });
});

describe('fetchWeatherForCity — TODO 1 + TODO 2', () => {
  beforeEach(() => {
    // Mock global fetch — the thunk calls fetchWeather which calls fetch
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('api.open-meteo.com/v1/forecast')) {
          return new Response(
            JSON.stringify({
              current: {
                temperature_2m: 21.3,
                wind_speed_10m: 12,
                weather_code: 3,
                time: '2026-05-17T12:00',
              },
            }),
          );
        }
        return new Response('not found', { status: 404 });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('dispatches pending → fulfilled and writes data into state', async () => {
    const store = makeStore();
    store.dispatch(cityAdded(tokyo));

    const promise = store.dispatch(fetchWeatherForCity(tokyo.id));

    // While pending, status should be 'loading'
    expect(store.getState().weather.cities[0].status).toBe('loading');

    await promise;

    const entry = store.getState().weather.cities[0];
    expect(entry.status).toBe('success');
    expect(entry.data).toEqual({
      temperatureC: 21.3,
      windKph: 12,
      weatherCode: 3,
      observedAt: '2026-05-17T12:00',
    });
    expect(entry.error).toBeNull();
  });

  it('on failure, sets status to error and stores the error message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('boom', { status: 500 })),
    );

    const store = makeStore();
    store.dispatch(cityAdded(tokyo));
    await store.dispatch(fetchWeatherForCity(tokyo.id));

    const entry = store.getState().weather.cities[0];
    expect(entry.status).toBe('error');
    expect(entry.error).toBeTruthy();
    expect(entry.data).toBeNull();
  });

  it('rejected when cityId is unknown', async () => {
    const store = makeStore();
    const result = await store.dispatch(fetchWeatherForCity('does-not-exist'));
    expect(fetchWeatherForCity.rejected.match(result)).toBe(true);
  });
});
