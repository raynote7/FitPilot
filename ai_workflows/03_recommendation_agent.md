# FitPilot Recommendation Agent

## Mission

Improve FitPilot's local workout recommendation engine so it remains deterministic, explainable, injury-aware, and useful without external AI APIs.

Core file:

- `src/lib/recommendationEngine.js`

Supporting file:

- `src/data/exerciseLibrary.js`

## Current Recommendation Principles

The current engine is local, rule-based, and score-based.

It considers:

- split type;
- available workout minutes;
- user goal;
- injury constraints;
- recent workout history;
- exercise difficulty;
- exercise category and muscles;
- estimated calories.

## Responsibilities

- Improve split routine logic for `three_split`, `ppl`, `two_split`, and `full_body`.
- Avoid recommending the same recent exercises too often.
- Filter or strongly penalize exercises that conflict with injury conditions.
- Keep scoring rules clear enough to explain in UI copy or comments.
- Preserve deterministic output for the same inputs.
- Maintain compatibility with `localStorage` workout history.
- Propose regression cases before changing recommendation behavior.

## Score-Based Logic Guidelines

Recommendation changes should prefer transparent scoring over opaque behavior.

Useful scoring dimensions:

- focus match score;
- goal match score;
- recent exercise duplication penalty;
- injury warning penalty;
- injury-friendly bonus when applicable;
- experience-level match score;
- time-fit and routine-size constraints;
- full-body category coverage.

When adding or changing weights:

- document the intent in code only where it is not self-explanatory;
- avoid magic behavior that cannot be tested;
- keep thresholds simple;
- verify that short workouts still produce practical routines.

## Injury Filtering Guidelines

- Exercises that directly conflict with selected injuries should be excluded or heavily penalized.
- Injury-friendly alternatives may receive a small bonus.
- Never present injury scoring as medical advice.
- Keep labels conservative and user-facing explanations simple.

## Recent Workout Avoidance

- Use recent workout history to reduce repeated exercises.
- Preserve split rotation behavior based on the most recent focus.
- Avoid over-penalizing when the exercise library is too small for a category.
- Confirm behavior with at least two saved sessions when testing.

## Future Local Machine Learning

Local ML may be considered later, but only after planning.

Allowed direction:

- local/offline model or heuristic learning from history;
- no paid hosted AI APIs;
- no required backend;
- explainable fallback to the rule-based engine;
- deterministic tests for recommendation regressions.

## Common Rules

- Do not create a new project.
- Keep the existing Vite + React structure.
- Do not use external AI APIs.
- Keep Firebase in placeholder status.
- Improve the current version around `localStorage`.
- Present a plan before any large refactor.
- After work, report changed files, why they changed, and how to test them.
