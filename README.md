# FitPilot

FitPilot is a fitness web app MVP that recommends today's workout routine from local rules and saves workout history with Firebase.

Current production URL:

```text
https://fitpilot-7d44e.web.app
```

## Current Architecture

- Frontend: Vite + React
- Hosting: Firebase Hosting
- Auth: Firebase Authentication with Google sign-in
- Database: Cloud Firestore
- Fallback: browser localStorage
- AI/API: no external AI API is used

The app still has a GitHub Pages workflow, but Firebase Hosting is the primary working deployment because Firebase Authentication already authorizes `fitpilot-7d44e.web.app`.

## Core Features

- Today's workout routine
- Workout checklist
- Start/pause/resume/end workout timer
- Workout history save/delete
- Exercise library
- Body map visualization
- Google login
- Firestore sync for logged-in users
- localStorage fallback when logged out or Firestore is unavailable

## Data Model

Firestore paths:

```text
users/{uid}/workoutLogs/{logId}
users/{uid}/profile/settings
```

Local fallback keys:

```text
fitpilot.workoutHistory
fitpilot.profile
```

## Firebase Setup

Required Firebase products:

1. Authentication
2. Cloud Firestore
3. Firebase Hosting

Authentication:

- Enable Google provider.
- Authorized domains should include:
  - `localhost`
  - `fitpilot-7d44e.firebaseapp.com`
  - `fitpilot-7d44e.web.app`

Firestore:

- Create a Cloud Firestore database.
- Use rules compatible with `users/{uid}` ownership. The repo includes [firestore.rules](./firestore.rules).

Hosting:

- Firebase project id: `fitpilot-7d44e`
- Hosting config: [firebase.json](./firebase.json)

## Environment Variables

Create `.env.local` in the project root. Do not commit it.

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

`.env.example` must stay as placeholders only.

## Local Development

```bash
npm install
npm run dev
```

After changing `.env.local`, restart the Vite dev server.

## Build

GitHub Pages build, legacy path `/FitPilot/`:

```bash
npm run build
```

Firebase Hosting build, root path `/`:

```bash
npm run build:firebase
```

## Deploy

Primary deploy target:

```bash
npm run deploy:firebase
```

This runs:

```bash
npm run build:firebase
npx firebase-tools deploy --only hosting --project fitpilot-7d44e
```

If Firebase CLI is not logged in:

```bash
npx --yes firebase-tools login
```

## Expected Modes

- No Firebase config: `Local Mode`
- Firebase config present, logged out: `Firebase Ready`
- Logged in and Firestore available: Firestore save/load/delete
- Logged in but Firestore unavailable: localStorage save/delete remains available

The app is intentionally local-first for workout history updates. Save/delete updates the UI and localStorage first, then attempts Firestore sync.

## Verification Checklist

Run:

```bash
npm run build
npm run build:firebase
```

Manual checks on `https://fitpilot-7d44e.web.app`:

1. App loads with `Firebase Ready`.
2. Google login succeeds.
3. Saving a workout creates a Firestore document under `users/{uid}/workoutLogs`.
4. The saved workout appears in the History tab.
5. Deleting a workout removes the Firestore document.
6. Logged-out save/delete still works through localStorage.

## Recommendation Engine

Core logic:

```text
src/lib/recommendationEngine.js
```

The engine uses split rotation, recent exercise penalties, injury constraints, goal matching, difficulty matching, and available workout time.
