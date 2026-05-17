import { useAppDispatch, useAppSelector } from '../store/hooks';
import { refreshIntervalChanged } from '../store/configSlice';

const OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '10 s', value: 10_000 },
  { label: '30 s', value: 30_000 },
  { label: '1 min', value: 60_000 },
];

export function RefreshControls() {
  const dispatch = useAppDispatch();
  const interval = useAppSelector((s) => s.config.refreshIntervalMs);

  return (
    <fieldset className="refresh-controls">
      <legend>Auto refresh</legend>
      {OPTIONS.map((opt) => (
        <label key={opt.value}>
          <input
            type="radio"
            name="refresh-interval"
            checked={interval === opt.value}
            onChange={() => dispatch(refreshIntervalChanged(opt.value))}
          />
          {opt.label}
        </label>
      ))}
    </fieldset>
  );
}
