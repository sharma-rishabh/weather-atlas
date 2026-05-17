import type { Middleware } from '@reduxjs/toolkit';

/**
 * Worked example — READ THIS FIRST.
 *
 * A Redux middleware is a triple-curried function:
 *
 *     storeAPI -> next -> action -> result
 *
 * - `storeAPI` exposes `dispatch` and `getState`
 * - `next` forwards the action to the *next* middleware (or to the reducers if you're last)
 * - `action` is the action being dispatched
 *
 * The pattern:
 *   1. Do something BEFORE the action reaches reducers (e.g. log it)
 *   2. Call `next(action)` to let it through
 *   3. Do something AFTER the reducers have run (e.g. read updated state)
 *   4. Return whatever `next(action)` returned
 *
 * If you forget step 2, the action is silently swallowed — a common bug.
 */
export const loggerMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  const prevState = storeAPI.getState();
  // eslint-disable-next-line no-console
  console.groupCollapsed(`%c${(action as { type: string }).type}`, 'color: #888');
  // eslint-disable-next-line no-console
  console.log('prev state', prevState);
  // eslint-disable-next-line no-console
  console.log('action', action);

  const result = next(action);

  // eslint-disable-next-line no-console
  console.log('next state', storeAPI.getState());
  // eslint-disable-next-line no-console
  console.groupEnd();

  return result;
};
