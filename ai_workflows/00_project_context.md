# FitPilot Project Context

## Product Goal

FitPilot is a local-first fitness web app MVP that recommends today's workout routine from user inputs and recent workout history.

The current MVP should help a user:

- choose a split type, available time, fitness goal, injury constraints, and experience level;
- receive a practical workout checklist for today;
- complete exercises and save workout history in the browser;
- review muscle focus through a simple Body Map view.

## Current Tech Stack

- Vite
- React
- React DOM
- Firebase SDK placeholder
- Browser `localStorage`
- GitHub Pages deployment through GitHub Actions

Core files to understand before implementation:

- `src/App.jsx`: main app UI and user flow
- `src/styles.css`: styling and responsive layout
- `src/lib/recommendationEngine.js`: local rule-based and score-based workout recommendation logic
- `src/lib/storage.js`: local browser persistence
- `src/data/exerciseLibrary.js`: starter exercise data
- `src/firebase.js`: Firebase initialization placeholder
- `vite.config.js`: Vite config and GitHub Pages base path
- `.github/workflows/deploy.yml`: Pages deployment workflow

## GitHub Pages Deployment Structure

FitPilot is deployed from the `main` branch through GitHub Actions.

Required deployment assumptions:

- `vite.config.js` must keep `base: '/FitPilot/'`.
- The deploy workflow builds with `npm run build`.
- The workflow uploads `./dist` with `actions/upload-pages-artifact`.
- GitHub Pages should use GitHub Actions as the build and deployment source.
- Expected public URL: `https://raynote7.github.io/FitPilot/`.

## localStorage First Principle

The current version is intentionally local-first.

- Store workout history and MVP user state in browser `localStorage`.
- Keep save/load behavior simple and visible to the user.
- Avoid introducing backend dependencies for current MVP improvements.
- Treat browser data loss, private browsing, and device-specific state as known MVP limitations.

## Firebase Placeholder Principle

Firebase exists only as a future integration placeholder.

- Do not add Firestore, Auth, or backend sync unless a separate plan is approved.
- Do not make current MVP behavior depend on Firebase availability.
- Keep `.env.example` and Firebase config handling compatible with future backend work.
- Prefer local modules that can later be adapted to Firebase without changing the user flow.

## No External AI API Principle

FitPilot must not call external AI APIs in the current MVP.

- Do not use paid LLM APIs or hosted AI recommendation APIs.
- Do not add OpenAI, Anthropic, Gemini, or similar API calls.
- Recommendation improvements should be local, deterministic, explainable, and testable.
- Future local machine learning work may be explored only as a local/offline extension after planning.

## Common Rules

- Do not create a new project.
- Keep the existing Vite + React structure.
- Do not use external AI APIs.
- Keep Firebase in placeholder status.
- Improve the current version around `localStorage`.
- Present a plan before any large refactor.
- After work, report changed files, why they changed, and how to test them.
