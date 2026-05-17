# Learning Objectives

By completing **Weather Atlas**, you will understand:

## Conceptual Understanding
- What Redux middleware actually *is*: a function with the signature `store => next => action => any` that wraps every dispatch and can inspect, transform, suppress, or emit new actions.
- How `createAsyncThunk` auto-generates three action types (`pending`, `fulfilled`, `rejected`) and how middleware can hook into them.
- The difference between middleware that **observes** (logger), middleware that **drives** dispatch (scheduler), and middleware that **reacts** to other actions (retry).
- Middleware composition order — why position in the `middleware` array matters and how `next(action)` chains them.

## Practical Skills
- Hand-write a custom middleware from scratch (no library).
- Write a `createAsyncThunk` and handle its three lifecycle actions in `extraReducers`.
- Use `getDefaultMiddleware().concat(...)` to add custom middleware in RTK.
- Use `matcher` functions (e.g., `thunk.rejected.match(action)`) to type-narrow inside middleware.
- Deploy a Vite + React SPA to GitHub Pages via GitHub Actions.

## Targeted Gaps (from notes/redux/GAPS.md)
- **Middleware** → exercised by writing 3 middleware from scratch: `loggerMiddleware` (provided as worked example), `schedulerMiddleware` (you build it — drives interval-based dispatch), and `retryMiddleware` (you build it — listens for `*/rejected` and re-dispatches with exponential backoff).
- **Thunk** → exercised by writing `fetchWeatherForCity` as a `createAsyncThunk`, handling all three lifecycle actions in `weatherSlice.extraReducers`, and watching middleware react to those auto-generated actions in Redux DevTools.

## When to Apply
- Any time you need cross-cutting side effects: logging, analytics, schedulers, retries, throttling, persistence.
- Any time pure reducers aren't enough (network calls, timers, websockets) → reach for thunks first, sagas only if orchestration gets complex.
- When you see the same try/catch + retry boilerplate inside multiple thunks → that's a sign it belongs in middleware.

## Success Criteria
- [ ] All tests pass (`npm test`)
- [ ] App runs locally (`npm run dev`) and you can add/remove cities, see weather, see retries on failure
- [ ] You can explain in your own words: *what each of your three middleware does and why it can't be done inside a reducer*
- [ ] You can explain what `next(action)` does and what happens if you forget to call it
- [ ] You can name the three action types a thunk dispatches and when each fires
- [ ] Deployed live on GitHub Pages and link works
