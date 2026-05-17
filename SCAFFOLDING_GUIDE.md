# What We Provide vs What You Build

## We Provide
- Vite + React + TypeScript project setup (no config wrangling)
- Open-Meteo API client (`src/api/openMeteo.ts`) — boring HTTP boilerplate so you can focus on Redux
- All UI components (`CityCard`, `AddCityForm`, `RefreshControls`) — wired to the store via hooks
- `configureStore` shell with TypeScript types (`RootState`, `AppDispatch`) and typed hooks
- **Logger middleware fully implemented** as a worked example you can read line-by-line
- Empty stubs for `schedulerMiddleware`, `retryMiddleware`, `fetchWeatherForCity`, and `weatherSlice.extraReducers`
- Vitest test suites that act as the spec
- GitHub Actions workflow for one-click deploy to GitHub Pages

## You Build
- `fetchWeatherForCity` — a `createAsyncThunk` that calls the API client
- `weatherSlice.extraReducers` — handle `pending`, `fulfilled`, `rejected` of the thunk
- `schedulerMiddleware` — starts/stops a `setInterval` based on app state; on each tick, dispatches the thunk for every city
- `retryMiddleware` — listens for `fetchWeatherForCity.rejected` and re-dispatches with exponential backoff (cap at 3 attempts)

## Why This Approach
The whole point is middleware + thunks. We provide everything *around* those so you don't waste hours on JSX, styling, or HTTP plumbing. The four files you write are the entire lesson:

| File | What it teaches |
|------|----------------|
| `weatherSlice.ts` (thunk + extraReducers) | The thunk lifecycle — what `createAsyncThunk` actually generates |
| `middleware/scheduler.ts` | Middleware as a **dispatcher** — using `storeAPI.dispatch` from inside middleware |
| `middleware/retry.ts` | Middleware as a **reactor** — using `.match()` on thunk-generated action types |
| `store/index.ts` (middleware composition) | How middleware order affects behavior |

If you find yourself writing complex logic inside a UI component or inside a reducer — stop. That logic almost certainly belongs in middleware or a thunk.
