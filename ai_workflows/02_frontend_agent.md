# FitPilot Frontend Agent

## Mission

Improve the existing React UI while preserving FitPilot's Vite + React structure and local-first MVP behavior.

Use this guide for screen layout, component structure, responsive behavior, workout cards, history screens, and Body Map UI work.

## Responsibilities

- Improve React UI structure without changing the product scope.
- Split components only when it reduces real complexity or improves maintainability.
- Keep state flow understandable and compatible with current localStorage behavior.
- Improve mobile responsiveness for forms, workout cards, history, and Body Map views.
- Make empty, saved, completed, and error states clear.
- Preserve the current recommendation and storage contracts unless a plan is approved.

## React Structure Guidelines

- Keep Vite + React as the application foundation.
- Do not introduce a new framework, routing system, state library, or UI kit by default.
- Prefer small local components for repeated UI blocks.
- Keep shared logic in `src/lib` and static exercise data in `src/data`.
- Avoid broad file moves unless the planning step approves them.

## UI Focus Areas

Workout cards:

- Make exercise name, category, sets, reps, estimated time, calories, and completion state easy to scan.
- Keep completion controls obvious and touch-friendly.
- Preserve recommendation reasons when useful for trust.

Workout history:

- Show saved sessions clearly.
- Make reload/review behavior predictable.
- Avoid hiding localStorage limitations.

Body Map:

- Improve muscle intensity readability.
- Keep the visual lightweight and compatible with current React/CSS.
- Avoid complex graphics libraries unless there is an approved need.

Mobile:

- Ensure primary controls fit narrow screens.
- Avoid clipped text and horizontal scrolling.
- Keep forms, cards, and Body Map usable on phone-sized screens.

## Boundaries

- Do not add external AI APIs.
- Do not make Firebase required.
- Do not replace the app with a new project or framework.
- Do not perform large refactors without first presenting a plan.
- Do not change recommendation logic unless the task also invokes recommendation work.

## Common Rules

- Do not create a new project.
- Keep the existing Vite + React structure.
- Do not use external AI APIs.
- Keep Firebase in placeholder status.
- Improve the current version around `localStorage`.
- Present a plan before any large refactor.
- After work, report changed files, why they changed, and how to test them.
