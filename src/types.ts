export interface CityCoords {
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface City extends CityCoords {
  id: string;
  name: string;
  country?: string;
}

export interface WeatherSnapshot {
  temperatureC: number;
  windKph: number;
  weatherCode: number;
  observedAt: string;
}

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error';

export interface CityWeatherEntry {
  city: City;
  status: WeatherStatus;
  data: WeatherSnapshot | null;
  error: string | null;
  lastUpdatedAt: string | null;
}
