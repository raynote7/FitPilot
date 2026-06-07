# FitPilot

FitPilot is a local-first fitness web app MVP.

It recommends today's workout routine based on split type, available time, goal, injury constraints, and previous workout history. The first version does **not** use paid AI APIs. Recommendation is handled by a local rule-based and score-based engine.

## Core Features

- Today's workout checklist
- Auto routine generator
- Exercise library with 45+ starter exercises
- Simple body map visualization
- Estimated calorie calculation
- Workout history saved in browser localStorage
- Firebase initialization placeholder for future backend integration
- GitHub Pages deployment workflow

## Tech Stack

- Vite
- React
- Firebase SDK placeholder
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

## Firebase

The first MVP works without Firebase. It uses browser localStorage.

To connect Firebase later:

1. Create a Firebase project.
2. Register a Web App.
3. Copy Firebase config values.
4. Create `.env.local` using `.env.example`.
5. Add Firestore/Auth logic in future backend integration modules.

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
