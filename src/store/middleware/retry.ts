import { current, type Middleware } from "@reduxjs/toolkit";
import { fetchWeatherForCity } from "../weatherSlice";

export const MAX_ATTEMPTS = 3;
export const BASE_DELAY_MS = 500;

export const retryMiddleware: Middleware = (_storeAPI) => (next) => {
  const attemptCount: { [id: number]: number } = {};
  return (action) => {
    const result = next(action);
    if (fetchWeatherForCity.fulfilled.match(action)) {
      const cityId = (action as any).meta.arg;
      attemptCount[cityId] = 0;
    }

    if (fetchWeatherForCity.rejected.match(action)) {
      const cityId = (action as any).meta.arg;
      const currentAttempt = (attemptCount[cityId] ?? 0) + 1;
      if (currentAttempt >= MAX_ATTEMPTS) return result;

      const delay = BASE_DELAY_MS * Math.pow(2, currentAttempt - 1);

      setTimeout(() => {
        _storeAPI.dispatch(fetchWeatherForCity(cityId) as any);
      }, delay);

      attemptCount[cityId] = currentAttempt;
    }

    return result;
  };
};
