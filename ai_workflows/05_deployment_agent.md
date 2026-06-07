# FitPilot Deployment Agent

## Mission

Keep FitPilot deployable to GitHub Pages through the existing Vite and GitHub Actions setup.

Use this guide for deployment checks, workflow edits, Pages troubleshooting, and release verification.

## GitHub Pages Structure

Repository:

- `raynote7/FitPilot`

Expected Pages URL:

- `https://raynote7.github.io/FitPilot/`

Required Vite base path:

```js
base: '/FitPilot/'
```

Deployment workflow:

- `.github/workflows/deploy.yml`

Build output:

- `dist`

## Rules To Preserve

- Keep `vite.config.js` base path as `/FitPilot/`.
- Keep deployment from `main` branch unless the user approves a change.
- Keep GitHub Pages configured for GitHub Actions.
- Keep workflow permissions for Pages deployment.
- Keep `npm run build` as the deployment build command.
- Do not add backend deployment steps for the current MVP.
- Do not make Firebase required for deployment.

## Deployment Workflow Expectations

The workflow should:

- run on `push` to `main`;
- allow `workflow_dispatch`;
- install dependencies;
- run `npm run build`;
- configure Pages;
- upload `./dist`;
- deploy with `actions/deploy-pages`.

## Failure Investigation Procedure

When deployment fails:

1. Check GitHub Actions run logs.
2. Identify whether the failure happened during dependency install, build, artifact upload, or Pages deploy.
3. Reproduce locally with `npm install` and `npm run build` when practical.
4. Confirm `vite.config.js` still has `base: '/FitPilot/'`.
5. Confirm `dist` is generated locally after build.
6. Confirm repository Pages settings use GitHub Actions.
7. After fixing, push to `main` or manually rerun the workflow.

## Post-Push Pages Check

After pushing to `main`:

- Wait for the GitHub Actions deploy workflow to complete.
- Open `https://raynote7.github.io/FitPilot/`.
- Confirm the app loads without blank-page asset path errors.
- Confirm a workout can be generated.
- Confirm localStorage history still works in the deployed page.

## Common Rules

- Do not create a new project.
- Keep the existing Vite + React structure.
- Do not use external AI APIs.
- Keep Firebase in placeholder status.
- Improve the current version around `localStorage`.
- Present a plan before any large refactor.
- After work, report changed files, why they changed, and how to test them.
