# Progress Checklist

Total budget: **3–4 hours**, including deploy.

## Checkpoint 1: Understanding (20 min)
- [ ] Read `LEARNING_OBJECTIVES.md` and `SCAFFOLDING_GUIDE.md`
- [ ] Read `src/store/middleware/logger.ts` line-by-line — this is your reference for middleware shape
- [ ] Skim `src/__tests__/*.test.ts` — these are your spec
- [ ] Open `src/api/openMeteo.ts` and note the two exports: `geocodeCity`, `fetchWeather`
- [ ] Run `npm install` and `npm run dev` — confirm the empty UI loads

## Checkpoint 2: The Thunk (45–60 min)
- [ ] Implement `fetchWeatherForCity` in `src/store/weatherSlice.ts` as a `createAsyncThunk`
- [ ] Wire `extraReducers` to handle `pending`, `fulfilled`, `rejected`
- [ ] Run `npm test -- weatherSlice` — slice tests should pass
- [ ] Manually verify: click "Add city" → "London" → weather appears
- [ ] Open Redux DevTools → see `weather/fetchWeatherForCity/pending` and `.../fulfilled` actions

## Checkpoint 3: Scheduler Middleware (45–60 min)
- [ ] Implement `schedulerMiddleware` in `src/store/middleware/scheduler.ts`
- [ ] Add it to the `middleware` array in `src/store/index.ts`
- [ ] Run `npm test -- scheduler` — scheduler tests should pass
- [ ] Manually verify: add a city, wait 30s, see DevTools dispatch a fresh `fetchWeatherForCity` automatically
- [ ] Change the refresh interval via the UI — confirm scheduler restarts with the new interval

## Checkpoint 4: Retry Middleware (30–45 min)
- [ ] Implement `retryMiddleware` in `src/store/middleware/retry.ts`
- [ ] Add it to the `middleware` array
- [ ] Run `npm test -- retry` — retry tests should pass
- [ ] Manually verify: open DevTools → Network → block `api.open-meteo.com` → trigger a refresh → see retries with backoff in the action log
- [ ] Unblock and verify the next attempt succeeds

## Checkpoint 5: Deploy (20–30 min)
- [ ] Create a GitHub repo named `weather-atlas`
- [ ] Edit `vite.config.ts` if your repo name differs (set `base`)
- [ ] Push to `main`
- [ ] In repo Settings → Pages → Source: **GitHub Actions**
- [ ] Watch the deploy workflow run; visit `https://<your-username>.github.io/weather-atlas/`

## Checkpoint 6: Deep Understanding (15–20 min)
- [ ] Without looking, draw the signature of a Redux middleware on paper
- [ ] Explain to yourself: what happens if `schedulerMiddleware` forgets to call `next(action)`?
- [ ] Explain: why is retry implemented in middleware and not inside the thunk's `try/catch`?
- [ ] Open `MEMORY.md` (in your home `~/.claude/...`) and consider whether you can remove **Middleware** and **Thunk** from `GAPS.md` now.
