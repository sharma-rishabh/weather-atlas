import { weatherCodeToLabel } from '../api/openMeteo';
import { useAppDispatch } from '../store/hooks';
import { cityRemoved, fetchWeatherForCity } from '../store/weatherSlice';
import type { CityWeatherEntry } from '../types';

export function CityCard({ entry }: { entry: CityWeatherEntry }) {
  const dispatch = useAppDispatch();
  const { city, status, data, error, lastUpdatedAt } = entry;

  return (
    <article className={`card status-${status}`}>
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
