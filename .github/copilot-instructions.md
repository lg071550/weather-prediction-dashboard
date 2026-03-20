# Copilot instructions for `prediction-weather-terminal`

## Build, test, and lint commands

This repository's application code lives in `weather-dashboard`, so run app scripts from that directory.

From repository root:

- Install dependencies: `cd .\weather-dashboard && npm install`
- Start dev server: `cd .\weather-dashboard && npm run dev`
- Build production bundle: `cd .\weather-dashboard && npm run build`
- Lint: `cd .\weather-dashboard && npm run lint`
- Preview production build: `cd .\weather-dashboard && npm run preview`

From `weather-dashboard` directly:

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

Tests: no test project/runner is currently configured in this repository (`npm test` script is not defined).

Single-test command: not available until a test framework is added.

## High-level architecture

- The active project is a frontend-only weather intelligence dashboard built with React + TypeScript + Vite.
- Styling uses Tailwind CSS v4 with custom dark-theme tokens in `src/index.css`.
- App bootstrap is in `src/main.tsx`, which creates a shared TanStack Query client and wraps `<App />` in `QueryClientProvider`.
- City-level UI state (selected city tab) is handled with Zustand in `src/store/uiStore.ts`.
- City metadata and polling intervals are centralized in `src/config/cities.ts`.
- Data-fetch flow:
  - `src/services/apiClient.ts`: shared HTTP helper (`fetchJson`), API URL builders, and dev/prod aviation endpoint behavior.
  - `src/services/*Service.ts`: fetch + parse external responses with Zod and normalize to app domain types.
  - `src/hooks/use*Query.ts`: feed-specific React Query hooks with polling and retry policy.
  - `src/hooks/useCityWeatherData.ts`: composes feed hooks and derives ensemble, primary station summary, alerts, and feed status.
- Domain types are defined in `src/types/weather.ts`.
- Derived calculations and time helpers live in `src/lib/math.ts` and `src/lib/time.ts`.
- Dashboard UI is composed from reusable panel components in `src/components/panels` and shared wrappers in `src/components/common`.

## Key conventions

- Treat `weather-dashboard` as the implementation root; avoid adding app code at repository root.
- Add or update city support through `src/config/cities.ts` first (coordinates, timezone, stations, model slugs, refresh settings).
- Keep runtime validation in service modules with Zod; do not bypass schemas when integrating external API payloads.
- Preserve query key stability and include city-specific discriminators to avoid cache collisions in React Query.
- Keep cross-feed business logic in `useCityWeatherData` and `src/lib/*`, not inside presentational components.
- Reuse shared UI primitives (`Panel`, `ErrorBanner`, `LoadingSkeleton`) to keep loading/error UX consistent.
- Preserve aviation API wiring:
  - dev proxy in `vite.config.ts` (`/api/aviation` -> `https://aviationweather.gov/api/data`)
  - production fallback proxy behavior in `src/services/apiClient.ts`.
- Keep TypeScript strictness aligned with existing `tsconfig` settings; avoid weakening compiler checks unless explicitly required.
