import { AddCityForm } from './components/AddCityForm';
import { CityCard } from './components/CityCard';
import { RefreshControls } from './components/RefreshControls';
import { useAppSelector } from './store/hooks';

export default function App() {
  const cities = useAppSelector((s) => s.weather.cities);

  return (
    <div className="app">
      <header>
        <h1>Weather Atlas</h1>
        <p className="subtitle">Multi-city dashboard — a Redux middleware playground.</p>
      </header>

      <section className="controls">
        <AddCityForm />
        <RefreshControls />
      </section>

      <main className="grid">
        {cities.length === 0 && (
          <p className="empty">Add a city to start tracking weather.</p>
        )}
        {cities.map((entry) => (
          <CityCard key={entry.city.id} entry={entry} />
        ))}
      </main>

      <footer>
        <p>
          Open Redux DevTools to watch the scheduler dispatch on an interval and
          the retry middleware react to failed fetches.
        </p>
      </footer>
    </div>
  );
}
