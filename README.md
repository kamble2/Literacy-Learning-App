# Literacy Learning App

A literacy learning app for early readers, with a student dashboard, letter tracing, and audio feedback. This repo contains two apps:

- **[`web/`](web/)** — the active app. A React + Vite web app (student/parent/teacher dashboards, letter tracing, login).
- **[`MyApp/`](MyApp/)** — an Expo/React Native mobile scaffold (login/register screens), for a future native version of the app.

Both apps use Firebase (Auth + Firestore) and read their config from environment variables — no credentials are committed to the repo.

## Prerequisites

- Node.js 18+ and npm
- A Firebase project (Authentication + Firestore enabled) — get its config from the Firebase console under Project Settings > General > Your apps
- For `MyApp/`: the [Expo Go](https://expo.dev/go) app on your phone, or an iOS/Android simulator, if you want to run on a device/simulator instead of the web

## Running the web app (`web/`)

```bash
cd web
npm install
cp .env.example .env   # then fill in your Firebase config values
npm run dev
```

This starts a Vite dev server (prints the local URL, typically http://localhost:5173).

Other scripts:

```bash
npm run build     # production build to web/dist
npm run preview   # preview the production build locally
```

> **macOS troubleshooting:** if `npm install` or `npm run dev` fails with a missing `@rollup/rollup-darwin-*` binding, run `node scripts/install-rollup-x64.js` after installing — this is a known npm issue with optional native dependencies on macOS universal Node builds.

## Running the mobile app (`MyApp/`)

```bash
cd MyApp
npm install
cp .env.example .env   # then fill in your Firebase config values
npx expo start
```

This opens the Expo dev tools in your terminal/browser. From there you can open the app in Expo Go on your phone, an iOS/Android simulator, or in a browser tab:

```bash
npm run ios       # open in iOS simulator
npm run android   # open in Android simulator
npm run web       # open in a browser
```

## Environment variables

Neither app commits a real `.env` file — copy the provided `.env.example` in each app directory and fill in values from your Firebase project config:

- `web/.env.example` → `VITE_FIREBASE_*` (read by Vite via `import.meta.env`)
- `MyApp/.env.example` → `EXPO_PUBLIC_FIREBASE_*` (read by Expo via `process.env`)

Both apps point at the same kind of Firebase project, so the same Firebase config values work in both `.env` files (just under the different variable name prefixes above).
