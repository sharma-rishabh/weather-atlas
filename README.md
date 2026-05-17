# Weather Atlas

A multi-city weather dashboard built to teach **Redux middleware** and **createAsyncThunk** through implementation.

## Learning Objectives
See [`LEARNING_OBJECTIVES.md`](./LEARNING_OBJECTIVES.md).

## Getting Started

```bash
npm install
npm run dev        # local dev server
npm test           # vitest in watch mode
npm run test:once  # single run
npm run build      # production build
```

## What You're Building

You implement four pieces. Everything else (UI, HTTP client, store config) is scaffolded.

1. **`fetchWeatherForCity` thunk** + slice `extraReducers` → `src/store/weatherSlice.ts`
2. **`schedulerMiddleware`** → `src/store/middleware/scheduler.ts`
3. **`retryMiddleware`** → `src/store/middleware/retry.ts`
4. **Compose them** in `src/store/index.ts`

Tests in `src/__tests__/` are your spec. Hints in [`HINTS.md`](./HINTS.md).

## Project Structure

```
src/
├── api/openMeteo.ts          # Provided — geocode + weather fetch
├── components/               # Provided — wired UI
├── store/
│   ├── index.ts              # Provided shell — you add middleware to the array
│   ├── hooks.ts              # Provided — typed useAppDispatch / useAppSelector
│   ├── weatherSlice.ts       # You implement: thunk + extraReducers
│   ├── configSlice.ts        # Provided — refresh interval state
│   └── middleware/
│       ├── logger.ts         # Provided — worked example, read this first
│       ├── scheduler.ts      # You implement
│       └── retry.ts          # You implement
└── __tests__/                # Tests guide your implementation
```

## Deploying to GitHub Pages

1. Create a public GitHub repo named `weather-atlas`.
2. Push this project to `main`.
3. Repo Settings → Pages → **Source: GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` builds and publishes on every push to `main`.
5. Visit `https://<your-username>.github.io/weather-atlas/`.

If your repo has a different name, update the `base` value in `vite.config.ts` to `'/<repo-name>/'`.

## Success Criteria

- [ ] All tests pass
- [ ] App runs locally and you can add cities, see live weather
- [ ] Refresh interval can be changed and scheduler restarts accordingly
- [ ] Disconnecting the network triggers visible retries in DevTools, then recovery
- [ ] Deployed live on GitHub Pages

## Next After Completing

- Add a fourth middleware: **debounce** the add-city action so rapid clicks don't fire multiple geocoding calls
- Swap the in-memory retry tracking for a small **persistence middleware** that survives reloads
- Replace `createAsyncThunk` with **RTK Query** for the weather fetch and compare the two approaches
