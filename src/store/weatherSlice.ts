import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchWeather, geocodeCity } from '../api/openMeteo';
import type { City, CityWeatherEntry } from '../types';

interface WeatherState {
  cities: CityWeatherEntry[];
}

const initialState: WeatherState = {
  cities: [],
};

export const fetchWeatherForCity = createAsyncThunk(
  'weather/fetchWeatherForCity',
  async (city_id: string, thunkAPI) => {
    const weatherEntries: WeatherState = (thunkAPI.getState() as { weather: WeatherState }).weather
    const city = weatherEntries.cities.find((city) => city.city.id == city_id)?.city

    if (!city) {
      throw new Error(`City with ID ${city_id} not found`)
    }

    if (!(city?.latitude || city?.longitude || city?.timezone)) {
      throw new Error(`Data required to fetch weather not present for this city ${city?.name}`)
    }
    return await fetchWeather({...city})
  },
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    cityAdded: {
      reducer(state, action: PayloadAction<City>) {
        if (state.cities.some((c) => c.city.id === action.payload.id)) return;
        state.cities.push({
          city: action.payload,
          status: 'idle',
          data: null,
          error: null,
          lastUpdatedAt: null,
        });
      },
      prepare(city: City) {
        return { payload: city };
      },
    },
    cityRemoved(state, action: PayloadAction<string>) {
      state.cities = state.cities.filter((c) => c.city.id !== action.payload);
    },
  },
  extraReducers: (_builder) => {
    _builder.addCase(fetchWeatherForCity.rejected, (state, action) => {
      const city_id = action.meta.arg
      const city = state.cities.find((city) => city.city.id == city_id)
      if (!city) return
      city.error = action.error.message ?? "UNKNOWN ERROR"
      city.status = 'error'
    });
    _builder.addCase(fetchWeatherForCity.pending, (state, action) => { 
      const city_id = action.meta.arg
      const city = state.cities.find((city) => city.city.id == city_id)
      if (!city) return
      city.status = 'loading'
    });
    _builder.addCase(fetchWeatherForCity.fulfilled, (state, action) => { 
      const city_id = action.meta.arg
      const city = state.cities.find((city) => city.city.id == city_id)
      if (!city) return
      city.status = 'success'
      city.data = action.payload
    });
  },
});

// Helper: create a stable city id from coords + name
export function makeCityId(name: string, latitude: number, longitude: number): string {
  return `${name.toLowerCase()}:${latitude.toFixed(2)},${longitude.toFixed(2)}`;
}

// Provided convenience thunk: geocode then add a city to state.
// (You don't need to modify this — it shows how thunks compose.)
export const addCityByName = createAsyncThunk(
  'weather/addCityByName',
  async (query: string, thunkAPI) => {
    const geo = await geocodeCity(query);
    const city: City = {
      id: makeCityId(geo.name, geo.latitude, geo.longitude),
      name: geo.name,
      country: geo.country,
      latitude: geo.latitude,
      longitude: geo.longitude,
      timezone: geo.timezone,
    };
    thunkAPI.dispatch(weatherSlice.actions.cityAdded(city));
    thunkAPI.dispatch(fetchWeatherForCity(city.id));
    return city;
  },
);

export const { cityAdded, cityRemoved } = weatherSlice.actions;
export default weatherSlice.reducer;
