import { configureStore } from '@reduxjs/toolkit';
import weatherReducer from './weatherSlice';
import configReducer from './configSlice';
import { loggerMiddleware } from './middleware/logger';
import { schedulerMiddleware } from './middleware/scheduler';
import { retryMiddleware } from './middleware/retry';

export const store = configureStore({
  reducer: {
    weather: weatherReducer,
    config: configReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(retryMiddleware, schedulerMiddleware, loggerMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
