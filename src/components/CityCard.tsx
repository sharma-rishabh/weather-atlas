import { weatherCodeToLabel } from '../api/openMeteo';
import { useAppDispatch } from '../store/hooks';
import { cityRemoved, fetchWeatherForCity } from '../store/weatherSlice';
import type { CityWeatherEntry } from '../types';

function tempBucket(temperatureC: number): 'cold' | 'pleasant' | 'hot' {
  if (temperatureC < 10) return 'cold';
  if (temperatureC > 35) return 'hot';
  return 'pleasant';
}

function conditionBucket(
  code: number,
): 'clear' | 'partly' | 'foggy' | 'rainy' | 'snowy' | 'stormy' {
  if (code === 0) return 'clear';
  if (code <= 3) return 'partly';
  if (code === 45 || code === 48) return 'foggy';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rainy';
  if (code >= 71 && code <= 77) return 'snowy';
  return 'stormy';
}

function timeBucket(observedAt: string): 'morning' | 'day' | 'evening' | 'night' {
  const hour = new Date(observedAt).getHours();
  if (hour >= 5 && hour < 10) return 'morning';
  if (hour < 17) return 'day';
  if (hour < 20) return 'evening';
  return 'night';
}

export function CityCard({ entry }: { entry: CityWeatherEntry }) {
  const dispatch = useAppDispatch();
  const { city, status, data, error, lastUpdatedAt } = entry;
  const themeClass =
    status === 'success' && data
      ? `temp-${tempBucket(data.temperatureC)} weather-${conditionBucket(
          data.weatherCode,
        )} time-${timeBucket(data.observedAt)}`
      : '';

  return (
    <article className={`card status-${status} ${themeClass}`}>
      <header>
        <h2>
          {city.name}
          {city.country && <span className="country"> · {city.country}</span>}
        </h2>
        <button
          className="remove"
          onClick={() => dispatch(cityRemoved(city.id))}
          aria-label={`Remove ${city.name}`}
        >
          ×
        </button>
      </header>

      {status === 'loading' && <p className="loading">Loading…</p>}
      {status === 'error' && <p className="error">Error: {error}</p>}
      {status === 'idle' && <p className="muted">Waiting for first fetch</p>}
      {status === 'success' && data && (
        <>
          <dl className="data">
            <div>
              <dt>Temp</dt>
              <dd>{data.temperatureC.toFixed(1)}°C</dd>
            </div>
            <div>
              <dt>Conditions</dt>
              <dd>{weatherCodeToLabel(data.weatherCode)}</dd>
            </div>
            <div>
              <dt>Wind</dt>
              <dd>{data.windKph.toFixed(0)} km/h</dd>
            </div>
          </dl>
          <p className="observed">
            Observed {new Date(data.observedAt).toLocaleString([], {
              hour: '2-digit',
              minute: '2-digit',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </>
      )}

      <footer>
        {lastUpdatedAt && (
          <span className="updated">
            Updated {new Date(lastUpdatedAt).toLocaleTimeString()}
          </span>
        )}
        <button
          className="refresh"
          onClick={() => dispatch(fetchWeatherForCity(city.id))}
          disabled={status === 'loading'}
        >
          Refresh
        </button>
      </footer>
    </article>
  );
}
