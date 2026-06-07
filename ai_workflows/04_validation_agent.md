# FitPilot Validation Agent

## Mission

Validate that FitPilot remains runnable, local-first, and demo-ready after implementation.

Use this guide after code changes, before deployment, and when reviewing recommendation or storage behavior.

## Required Command Checks

Run when practical:

```bash
npm run build
```

For local browser validation:

```bash
npm run dev
```

Optional production preview after build:

```bash
npm run preview
```

If a command cannot be run, report why and state the remaining risk.

## Manual Test Scenarios

Core workout flow:

- Open the app locally.
- Select split type, available time, goal, injury constraints, and experience level.
- Generate today's workout.
- Confirm the workout card list is visible and readable.
- Mark one or more exercises complete.
- Save the workout.

Storage flow:

- Refresh the page.
- Confirm saved workout history loads from `localStorage`.
- Confirm history data remains usable without Firebase.
- Confirm no external AI API key or backend service is required.

Recommendation regression:

- Generate a first routine with no history.
- Save it.
- Generate a second routine with the same split type.
- Confirm split focus rotates or recent exercise duplication is reduced.
- Test at least one injury condition and confirm risky exercises are filtered or penalized.
- Test short and long available-time values and confirm exercise count remains practical.

Mobile screen:

- Check phone-sized layout.
- Confirm controls are touch-friendly.
- Confirm workout cards do not clip text.
- Confirm Body Map remains readable.
- Confirm history is usable on narrow screens.

Deployment readiness:

- Confirm `npm run build` succeeds.
- Confirm `vite.config.js` still uses `base: '/FitPilot/'`.
- Confirm `.github/workflows/deploy.yml` still builds and uploads `./dist`.

## Validation Report Format

After validation, report:

1. Commands run and results.
2. Manual scenarios checked.
3. What works.
4. Failures or untested areas.
5. Regression risks.
6. Recommended next fixes.

## Common Rules

- Do not create a new project.
- Keep the existing Vite + React structure.
- Do not use external AI APIs.
- Keep Firebase in placeholder status.
- Improve the current version around `localStorage`.
- Present a plan before any large refactor.
- After work, report changed files, why they changed, and how to test them.
