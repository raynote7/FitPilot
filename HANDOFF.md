# FitPilot Handoff

Date: 2026-06-07

## Current Status

FitPilot is now running as a Firebase-backed web app.

Primary production URL:

```text
https://fitpilot-7d44e.web.app
```

Current stack:

- Vite + React frontend
- Firebase Hosting
- Firebase Authentication with Google login
- Cloud Firestore workout/profile storage
- localStorage fallback
- No external AI API

GitHub Pages exists as a legacy/secondary deployment path, but Firebase Hosting is the current operating target because Google Auth works cleanly on the Firebase-authorized domain.

## Resolved Issues

The Firebase integration originally failed for multiple setup reasons:

1. Real Firebase values were placed in `.env.example` instead of `.env.local`.
2. GitHub Pages builds initially missed `VITE_FIREBASE_*` build-time variables.
3. Firebase Auth was configured before Cloud Firestore was ready.
4. Firestore rules needed to match the app's `users/{uid}` data model.
5. GitHub Pages auth domain handling was awkward, so the primary deployment moved to Firebase Hosting.

Current confirmed state:

- Firebase config is loaded.
- Google login works on Firebase Hosting.
- Cloud Firestore database exists.
- Firestore rules are applied for user-owned data.
- Workout save creates Firestore documents.
- Workout delete removes Firestore documents.
- localStorage fallback remains active.

## Important Files

- `src/App.jsx`: main app state, auth handling, workout save/delete flow
- `src/firebase.js`: Firebase initialization from `import.meta.env.VITE_FIREBASE_*`
- `src/lib/firebaseWorkoutStore.js`: Firestore read/write/delete helpers
- `src/lib/storage.js`: localStorage fallback helpers
- `firebase.json`: Firebase Hosting config
- `.firebaserc`: Firebase project id
- `firestore.rules`: Firestore ownership rules
- `.env.example`: placeholder env format only
- `.env.local`: local real Firebase values, never commit

## Data Model

Firestore:

```text
users/{uid}/workoutLogs/{logId}
users/{uid}/profile/settings
```

localStorage:

```text
fitpilot.workoutHistory
fitpilot.profile
```

## Current Save/Delete Behavior

Workout history is local-first:

1. Save/delete updates React state and localStorage first.
2. If logged in and Firestore is available, the app attempts Firestore sync.
3. If Firestore fails, the local update remains.
4. The UI shows a Firestore fallback status when sync fails.

This prevents user actions from being lost when Firestore rules, network, or database setup are temporarily broken.

## Commands

Local dev:

```bash
npm install
npm run dev
```

GitHub Pages style build:

```bash
npm run build
```

Firebase Hosting build:

```bash
npm run build:firebase
```

Firebase Hosting deploy:

```bash
npm run deploy:firebase
```

If Firebase CLI is not authenticated:

```bash
npx --yes firebase-tools login
```

## Verification

Required automated checks:

```bash
npm run build
npm run build:firebase
```

Manual production checks:

1. Open `https://fitpilot-7d44e.web.app`.
2. Confirm `Firebase Ready`.
3. Sign in with Google.
4. Confirm logged-in state.
5. Save a workout.
6. Confirm the record appears in the History tab.
7. Confirm Firestore has `users/{uid}/workoutLogs/{logId}`.
8. Delete the workout.
9. Confirm it disappears from History and Firestore.
10. Log out and confirm localStorage save/delete still works.

## Firebase Console Requirements

Authentication:

- Google provider enabled.
- Authorized domains include:
  - `localhost`
  - `fitpilot-7d44e.firebaseapp.com`
  - `fitpilot-7d44e.web.app`

Firestore:

- Cloud Firestore database created.
- Rules allow only authenticated users to read/write their own `users/{uid}` subtree.
- Realtime Database is not used.

Hosting:

- Firebase Hosting site `fitpilot-7d44e` is connected.
- Deployed app should resolve at `https://fitpilot-7d44e.web.app`.

## Next Work

Recommended next steps:

1. Improve UI copy consistency and fix any remaining mojibake text in `src/App.jsx`.
2. Add visible sync status that distinguishes `Saved locally`, `Synced to Firestore`, and `Sync failed`.
3. Add a small automated test layer for storage helpers and recommendation logic.
4. Consider adding a one-click manual "sync local records to Firestore" action for logged-in users.
5. Keep Firebase Hosting as the main deployment path unless a custom domain is added.
