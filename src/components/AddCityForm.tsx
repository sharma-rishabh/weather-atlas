import { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { addCityByName } from '../store/weatherSlice';

export function AddCityForm() {
  const dispatch = useAppDispatch();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setPending(true);
    setError(null);
    const result = await dispatch(addCityByName(value.trim()));
    if (addCityByName.rejected.match(result)) {
      setError(result.error.message ?? 'Failed to add city');
    } else {
      setValue('');
    }
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="add-city">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a city (e.g. Tokyo)"
        disabled={pending}
      />
      <button type="submit" disabled={pending || !value.trim()}>
        {pending ? 'Adding…' : 'Add'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
