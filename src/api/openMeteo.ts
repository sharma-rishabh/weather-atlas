import type { CityCoords, WeatherSnapshot } from '../types';

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export interface GeocodeResult extends CityCoords {
  name: string;
  country?: string;
}

export async function geocodeCity(query: string): Promise<GeocodeResult> {
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocode failed: HTTP ${res.status}`);
  const json = (await res.json()) as {
    results?: Array<{
      name: string;
      country?: string;
      latitude: number;
      longitude: number;
      timezone?: string;
    }>;
  };
  const first = json.results?.[0];
  if (!first) throw new Error(`No location found for "${query}"`);
  return {
    name: first.name,
    country: first.country,
    latitude: first.latitude,
    longitude: first.longitude,
    timezone: first.timezone,
  };
}

export async function fetchWeather(coords: CityCoords): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    current: 'temperature_2m,weather_code,wind_speed_10m',
    wind_speed_unit: 'kmh',
    timezone: coords.timezone ?? 'auto',
  });
  const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Forecast failed: HTTP ${res.status}`);
  const json = (await res.json()) as {
    current: {
      temperature_2m: number;
      wind_speed_10m: number;
      weather_code: number;
      time: string;
    };
  };
  return {
    temperatureC: json.current.temperature_2m,
    windKph: json.current.wind_speed_10m,
    weatherCode: json.current.weather_code,
    observedAt: json.current.time,
  };
}

export function weatherCodeToLabel(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}
