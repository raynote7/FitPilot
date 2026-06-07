# FitPilot

FitPilot is a local-first fitness web app MVP.

It recommends today's workout routine based on split type, available time, goal, injury constraints, and previous workout history. The first version does **not** use paid AI APIs. Recommendation is handled by a local rule-based and score-based engine.

## Core Features

- Today's workout checklist
- Auto routine generator
- Exercise library with 45+ starter exercises
- Simple body map visualization
- Estimated calorie calculation
- Workout history saved in browser localStorage when logged out
- Optional Firebase Authentication with Google sign-in
- Optional Firestore workout log and profile sync when logged in
- GitHub Pages deployment workflow

## Tech Stack

- Vite
- React
- Firebase SDK
- GitHub Pages via GitHub Actions

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages

This repository is configured for GitHub Pages with Vite base path:

```js
base: '/FitPilot/'
```

Expected public URL after Pages is enabled:

```text
https://raynote7.github.io/FitPilot/
```

To enable Pages:

1. Open repository Settings.
2. Go to Pages.
3. Under Build and deployment, select GitHub Actions.
4. Push to main or manually run the deploy workflow.

## Firebase Authentication and Firestore

FitPilot works without Firebase. If Firebase config is missing or the user is logged out, the app falls back to browser `localStorage`.

When Firebase config is available and the user signs in with Google, FitPilot stores:

- workout logs in `users/{uid}/workoutLogs/{logId}`
- profile settings in `users/{uid}/profile/settings`

### Firebase Console Setup

1. Create or open a Firebase project.
2. Register a Web App.
3. Copy the Web App config values.
4. Go to Authentication.
5. Enable the Google sign-in provider.
6. Go to Firestore Database.
7. Create a Firestore database.
8. Configure Firestore security rules so each user can read/write only their own `users/{uid}` documents.

### Local Environment

Create `.env.local` in the project root. Do not commit this file.

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Then run:

```bash
npm run dev
```

Expected behavior:

- No `.env.local`: Local Mode, localStorage only.
- Firebase config present but logged out: Firebase Ready, localStorage fallback.
- Logged in with Google: Firestore workout logs and profile settings.

### GitHub Pages Environment Variables

Vite reads `VITE_FIREBASE_*` values at build time. For GitHub Pages deployments, add the same values as GitHub repository secrets or workflow variables and expose them to the build step.

If these values are not provided during the GitHub Actions build, the deployed app still works in Local Mode.

## Recommendation Engine

Core logic is in:

```text
src/lib/recommendationEngine.js
```

The engine uses:

- Split rotation
- Recent exercise penalty
- Injury risk penalty
- Goal matching
- Difficulty matching
- Time-based exercise count

No external LLM or paid AI API is required.

## Future Improvements

- Firebase Authentication
- Firestore workout logs
- User profile sync
- Local ML recommendation module
- Better SVG body map
- Progressive overload tracking
- Weekly workout summary
