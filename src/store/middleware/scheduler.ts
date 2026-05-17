import type { Middleware } from '@reduxjs/toolkit';
import { CityWeatherEntry } from '../../types';
import { fetchWeatherForCity } from '../weatherSlice';

export const schedulerMiddleware: Middleware = (_storeAPI) => {
  let intervalId: ReturnType<typeof setInterval> | null = null
  return (next) => (action) => {
    const result = next(action);
    
    const weatherEntries = (_storeAPI.getState() as { weather: { cities: CityWeatherEntry[] } }).weather.cities
    const cityIds = weatherEntries.map((entry) => entry.city.id)
    if (!cityIds) return
    
  
    const isUpdateRequiredForAction = (
      (action as any).type === "weather/cityAdded"
      || (action as any).type === "weather/cityRemoved"
      || (action as any).type === "config/refreshIntervalChanged"
    )


    if (isUpdateRequiredForAction) {
      if (intervalId) clearInterval(intervalId)
        
      const refreshIntervalMs = _storeAPI.getState().config.refreshIntervalMs
      intervalId = setInterval(() => {
        cityIds.forEach(
        (cityId) => _storeAPI.dispatch(fetchWeatherForCity(cityId) as any)
      )}, refreshIntervalMs)
    }
    return result
  }
};
