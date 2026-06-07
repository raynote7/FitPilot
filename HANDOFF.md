# FitPilot Handoff

Date: 2026-06-07

## Current Goal

FitPilot was concepted by GPT and transferred to Codex for implementation review. The immediate goal is to make the project stable enough for specialized agents to improve product quality.

The first recovery pass is complete. The project now has a runnable baseline again, and the next agents can proceed from a compiling app.

## Project Summary

FitPilot is a local-first fitness web app MVP.

- Stack: Vite, React, Firebase SDK placeholder, browser localStorage.
- Current recommendation approach: local deterministic rule/scoring engine.
- No external AI API should be added in the current MVP.
- Firebase must remain optional placeholder behavior.
- GitHub Pages deployment should keep Vite base path `/FitPilot/`.

Important files:

- `src/App.jsx`: main UI and user flow.
- `src/styles.css`: styling and responsive layout.
- `src/lib/recommendationEngine.js`: workout recommendation logic.
- `src/lib/storage.js`: localStorage persistence.
- `src/data/exerciseLibrary.js`: starter exercise database.
- `src/firebase.js`: Firebase placeholder initialization.
- `.github/workflows/deploy.yml`: GitHub Pages workflow.
- `ai_workflows/*.md`: agent-specific instructions.

## Current State

The repo already contains agent guide files:

- `ai_workflows/00_project_context.md`
- `ai_workflows/01_planning_agent.md`
- `ai_workflows/02_frontend_agent.md`
- `ai_workflows/03_recommendation_agent.md`
- `ai_workflows/04_validation_agent.md`
- `ai_workflows/05_deployment_agent.md`

There was also an existing `HANDOFF.md`, but its Korean text was corrupted, so it was replaced with this readable handoff.

## Completed Recovery Work

### Development Agent

Changed files:

- `src/App.jsx`
- `src/lib/recommendationEngine.js`
- `src/styles.css`

Work completed:

- Rebuilt `src/App.jsx` into valid React/JSX.
- Replaced corrupted user-facing copy with stable English copy.
- Kept the existing Vite + React + localStorage architecture.
- Kept Firebase optional.
- Added save feedback for the current workout.
- Added duplicate-save prevention for the same current routine during the active session.
- Added a reset generation path that ignores history.
- Replaced corrupted recommendation reason strings with readable English.
- Strengthened injury/caution handling so direct conflicts are avoided when safer alternatives exist.
- Added CSS support for secondary buttons and save-success feedback.
- Removed newly introduced non-ASCII separators from edited source files.

### Validation Agent

Commands/checks completed:

```bash
npm run build
```

Result:

- Passed after running with approved elevated permissions.
- Sandbox-only run still fails with `spawn EPERM`, but the elevated build succeeds.

Recommendation regression check completed with Node:

- First 3-day split routine generated `push`.
- Saved-history simulation rotated the next routine to `pull`.
- Knee caution produced no direct knee-warning exercises in the first routine.
- Completion rate returned `0` for empty exercises and `50` for one of two completed.

Local HTTP check:

- `http://127.0.0.1:5173/FitPilot/` returned HTTP 200 from the local Vite server.

Browser automation note:

- Playwright is not installed in this project, so a full automated browser interaction was not run.
- Manual browser validation is still recommended before deployment.

## Completed UX Pass 2

Date: 2026-06-07

Goal:

- Reflect the UX Agent Figma direction in the actual React UI.
- Make today's routine the primary app experience.
- Keep new routine creation as a secondary reset flow that can ignore history.

Changed files:

- `src/App.jsx`
- `src/styles.css`

Work completed:

- Reworked the app shell into a compact Figma-style header with `Local only` status.
- Made the Today screen the main dashboard.
- Added Figma-style summary cards for calories, completion, and caution areas.
- Added primary and secondary actions near the top of the Today screen.
- Reworked workout cards into denser checklist cards with selected/done styling.
- Added a visible completion badge like `1/6 complete`.
- Added notice blocks for caution areas and saved-state feedback.
- Reworked New Routine into a reset flow with a visible ignore-history banner.
- Replaced select inputs with pill-style option controls for time, goal, caution areas, experience, and split type.
- Kept Body Map as supporting information instead of a dominant first-screen panel.
- Preserved localStorage, Firebase-placeholder, and no-external-AI constraints.
- Converted the `recommendation reason` pill from a dead visual badge into a clickable toggle that expands the reason text.

Validation completed:

```bash
npm run build
```

Result:

- Passed.

Local checks:

- `http://127.0.0.1:5173/FitPilot/` returned HTTP 200.
- Recommendation smoke test still rotated first `push` routine to second `pull` routine with saved-history simulation.

Remaining UX validation:

- User should visually inspect the in-app browser at mobile-ish width and desktop width.
- Confirm Korean text renders correctly on GitHub Pages after deployment.
- Confirm Today, New Routine, Body Map, Exercise DB, and History tabs are comfortable enough before the next push.

## Previous Critical Findings

### 1. `src/App.jsx` is currently broken

The file contains corrupted Korean text and several syntax-breaking string/JSX issues.

Examples observed:

- `muscleKorean` has unterminated strings around muscle labels.
- Some JSX tags are malformed, such as button and heading closing tags appearing inside text.
- Several props have broken quotes, especially `SummaryCard` labels and `FormSelect` options.
- User-facing copy is unreadable because Korean text is mojibake.

Status:

- Resolved in the first recovery pass.

### 2. Build was attempted but could not complete in the sandbox

Command attempted:

```bash
npm run build
```

Observed result:

- Build failed before normal source compilation because Vite/Rolldown hit `spawn EPERM` while loading config.
- This appears sandbox-related.
- A permission escalation retry was requested but aborted by the user/session.

Status:

- Elevated `npm run build` now passes.
- Sandbox `spawn EPERM` remains an environment limitation, not an app source failure.

### 3. Existing architecture is suitable for MVP continuation

The overall project direction is coherent:

- Vite + React structure is simple.
- Recommendation logic is isolated in `src/lib/recommendationEngine.js`.
- Exercise data is isolated in `src/data/exerciseLibrary.js`.
- Storage is isolated in `src/lib/storage.js`.
- Firebase is optional and not required for current app behavior.
- Deployment workflow is conventional for GitHub Pages.

No full rewrite is recommended.

## Recommended Next Agent Work Order

### 1. Frontend Agent

Primary goal: polish the Figma-inspired UI after visual review.

Files:

- `src/App.jsx`
- `src/styles.css` if layout needs adjustment

Tasks:

- Tune spacing, card density, and copy based on visual review.
- Confirm Korean localization renders correctly end-to-end.
- Keep current component structure unless a small split clearly improves readability.
- Keep the app local-first and do not introduce routing, UI kits, backend calls, or external AI APIs.
- Make the first screen feel like a workout checklist app, not a landing page.

Suggested UX direction:

- Default tab: today's workout.
- Primary views: Today, New Routine, Body Map, Exercise DB, History.
- Use clear, readable labels. If Korean copy is used, verify it renders correctly in the browser. Safe English fallback labels:
  - Today
  - New Routine
  - Body Map
  - Exercise DB
  - History
- Make save feedback visible after saving.
- Prevent duplicate saves for the same current workout if possible.

### 2. Recommendation Agent

Primary goal: expand recommendation quality and test coverage.

Files:

- `src/lib/recommendationEngine.js`
- `src/data/exerciseLibrary.js` if exercise metadata must change

Tasks:

- Confirm injury conflicts are excluded or strongly avoided when safer alternatives exist.
- Keep scoring deterministic and explainable.
- Replace corrupted Korean reason strings with readable copy.
- Avoid exposing raw internal values such as `three_split`, `knee`, or `pull` in user-facing explanations.
- Add or document regression cases for:
  - first routine with no history;
  - second routine after a saved workout;
  - knee, shoulder, and back caution selections;
  - 30, 45, 60, and 90 minute routines.

### 3. Validation Agent

Primary goal: run full browser/manual validation.

Required command:

```bash
npm run build
```

Manual checks:

- Open app locally with `npm run dev`.
- Generate a routine.
- Complete at least one exercise.
- Save today's workout.
- Refresh and confirm localStorage history loads.
- Generate a second routine and confirm focus rotation or recent duplication reduction.
- Test at least one injury/caution setting.
- Check mobile width around 390px.
- Confirm no Firebase or external AI API is required.

### 4. Deployment Agent

Primary goal: confirm GitHub Pages readiness after build passes.

Files:

- `vite.config.js`
- `.github/workflows/deploy.yml`

Checks:

- `vite.config.js` keeps `base: '/FitPilot/'`.
- Workflow installs dependencies and runs `npm run build`.
- Workflow uploads `./dist`.
- Pages source is GitHub Actions.
- Expected URL remains `https://raynote7.github.io/FitPilot/`.

## Implementation Cautions

- Do not create a new project.
- Do not move the app to another framework.
- Do not add paid or hosted AI APIs.
- Do not make Firebase required.
- Preserve localStorage history shape where possible.
- Avoid broad refactors until the app compiles.
- Treat Korean copy corruption as a source repair task, not merely a cosmetic issue.

## Suggested Immediate Next Command

For manual validation:

```bash
npm run dev
```

Then open:

```text
http://127.0.0.1:5173/FitPilot/
```

## Completion Criteria For Next Pass

- Manual browser test covers Today, New Routine, Body Map, Exercise DB, and History.
- Today's routine can be generated, checked, and saved.
- History persists after refresh.
- Duplicate-save behavior is acceptable for the MVP.
- Mobile layout is checked around 390px width.
- Deployment workflow remains unchanged and `npm run build` passes before push.
