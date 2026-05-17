# Hints (Read When Stuck!)

## General Approach
Build in the order tests are listed in `PROGRESS_CHECKLIST.md`: thunk → scheduler → retry. Each step's tests should be passing before you move on. The thunk's auto-generated action types (`weather/fetchWeatherForCity/{pending,fulfilled,rejected}`) are inputs to the middleware you write later — so the thunk must work first.

If you ever feel stuck on "how do I wire X into Redux", re-read `src/store/middleware/logger.ts`. It is a complete, minimal middleware — every middleware you write follows the same skeleton.

---

## For Each Component

### Implementing `fetchWeatherForCity` (the thunk)

**Where:** `src/store/weatherSlice.ts`

**If confused about:**
- **Signature** → `createAsyncThunk` takes `(typePrefix, payloadCreator)`. The payload creator is `async (arg, thunkAPI) => ...`. Your `arg` is the city id (string). Inside, geocode the city if you don't have coords, then call `fetchWeather`.
- **Where the payload goes** → whatever you `return` from the payload creator becomes `action.payload` in the `fulfilled` handler.
- **Errors** → if you `throw`, RTK auto-dispatches `rejected` with `action.error.message`. You don't need a try/catch unless you want to use `thunkAPI.rejectWithValue`.

**What often goes wrong:**
- Importing the slice's actions into the thunk and creating a circular import — keep the thunk in the same file as the slice (which is why `weatherSlice.ts` declares both).
- Trying to update state inside the thunk — *don't*. The thunk's job is to fetch; the reducer's job is to update state. The fulfilled action carries the data over.

**Wiring `extraReducers`:**
```ts
extraReducers: (builder) => {
  builder
    .addCase(fetchWeatherForCity.pending, (state, action) => { /* set loading */ })
    .addCase(fetchWeatherForCity.fulfilled, (state, action) => { /* set data */ })
    .addCase(fetchWeatherForCity.rejected, (state, action) => { /* set error */ });
}
```
The `cityId` is in `action.meta.arg` — use it to find the right city in state.

---

### Implementing `schedulerMiddleware`

**Where:** `src/store/middleware/scheduler.ts`

**Mental model:** Middleware can hold state across dispatches via closure variables. Use a closure-scoped `intervalId` variable.

**Skeleton:**
```ts
export const schedulerMiddleware: Middleware = (storeAPI) => {
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const restart = () => {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
    const state = storeAPI.getState();
    const cities = state.weather.cities;
    const ms = state.config.refreshIntervalMs;
    if (cities.length === 0 || ms <= 0) return;
    intervalId = setInterval(() => {
      const latest = storeAPI.getState();
      for (const c of latest.weather.cities) {
        storeAPI.dispatch(fetchWeatherForCity(c.id) as any);
      }
    }, ms);
  };

  return (next) => (action) => {
    const result = next(action);
    // After the reducer has run, decide if the schedule needs to change
    if (/* action types that affect schedule */) {
      restart();
    }
    return result;
  };
};
```

**Action types that should trigger a restart:**
- `weather/cityAdded`, `weather/cityRemoved`
- `config/refreshIntervalChanged`

**What often goes wrong:**
- Forgetting `next(action)` — the action never reaches reducers, so state never changes, so the scheduler's `getState()` is stale. **Always call `next` first, then read state.**
- Calling `restart()` on *every* action — wasteful but not wrong. The tests don't enforce this; the principle does.
- Dispatching the thunk before the slice has been registered — circular import risk. Keep `schedulerMiddleware` importing the thunk from `weatherSlice`, not the other way around.

---

### Implementing `retryMiddleware`

**Where:** `src/store/middleware/retry.ts`

**Mental model:** This middleware sits in the dispatch pipeline and *watches* for one specific action type — `fetchWeatherForCity.rejected`. When it sees one, it schedules a future `dispatch` of the same thunk.

**Why it can't live in the thunk:** A thunk that retries itself recursively works but couples concerns. Putting it in middleware lets you apply the same retry behavior to *any* thunk by adding it to the matcher.

**Skeleton:**
```ts
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;

export const retryMiddleware: Middleware = (storeAPI) => {
  const attempts = new Map<string, number>(); // cityId -> attempt count

  return (next) => (action) => {
    const result = next(action);

    if (fetchWeatherForCity.fulfilled.match(action)) {
      attempts.delete(action.meta.arg); // reset on success
    }

    if (fetchWeatherForCity.rejected.match(action)) {
      const cityId = action.meta.arg;
      const current = attempts.get(cityId) ?? 1;
      if (current < MAX_ATTEMPTS) {
        attempts.set(cityId, current + 1);
        const delay = BASE_DELAY_MS * Math.pow(2, current - 1); // 500, 1000, 2000
        setTimeout(() => {
          storeAPI.dispatch(fetchWeatherForCity(cityId) as any);
        }, delay);
      } else {
        attempts.delete(cityId);
      }
    }

    return result;
  };
};
```

**Tests will check:**
- After a `rejected` action, a new `pending` is dispatched (eventually).
- After `MAX_ATTEMPTS` failures, no further dispatches happen.
- After a `fulfilled`, the attempt counter resets.

**What often goes wrong:**
- Using `action.type === 'weather/fetchWeatherForCity/rejected'` as a string — works but loses TypeScript narrowing. Prefer `fetchWeatherForCity.rejected.match(action)`.
- Tracking attempts in module-level state instead of inside the middleware factory — works for one store, breaks if you create multiple stores in tests.

---

## Common Mistakes

| Mistake | What it looks like | Why it fails | Fix |
|---------|-------------------|--------------|-----|
| Forgot `next(action)` | Reducers never run; UI never updates | The action is swallowed by your middleware | Always `return next(action)` (or call it first and return its result) |
| Calling `getState()` before `next()` | Scheduler uses stale state | Reducer hasn't applied the action yet | Call `next(action)` first, then `getState()` |
| Adding middleware in wrong order | Logger doesn't log retry attempts | Order matters — middleware to the left sees actions first | Put `logger` last so it sees actions after other middleware has run |
| Calling `storeAPI.dispatch` synchronously from within middleware | Infinite loop | Your dispatch is intercepted by your own middleware again | Use `setTimeout(() => dispatch(...), 0)` or guard by action type |
| Using `useAppDispatch` outside of components | `Cannot read property 'dispatch'` | Hooks only work in React components | Inside middleware use `storeAPI.dispatch` |

## When you're truly stuck
- Re-read `src/store/middleware/logger.ts` — it's the canonical shape.
- Open Redux DevTools and watch action order. If you see an action you didn't dispatch, that's a middleware.
- Read the failing test — it tells you exactly what behavior is expected.
