# FitPilot Handoff

Date: 2026-06-07

## Current Goal

FitPilot was concepted by GPT and transferred to Codex for implementation review. The immediate goal is to make the project stable enough for specialized agents to improve product quality.

The first recovery pass is complete. The project now has a runnable baseline again, and the next agents can proceed from a compiling app.

## Active Handoff: Workout Start Timer UX

Date: 2026-06-07

Status:

- Planning Agent and UX Agent agree with the direction.
- Do not start broader product work before this scope is completed.
- This handoff is for Development Agent and Validation Agent execution.

### Product Decision

The Today screen currently over-emphasizes `New Routine`. There are too many `new routine` entry points, which weakens the main purpose of the app.

Replace that CTA weight with a workout-session action:

- Primary Today action should become `Start Workout`.
- Starting a workout should start a countdown from the configured workout time.
- `New Routine` should remain available, but only as a secondary navigation path.

### Target User And Problem

Target user:

- A user standing in the gym or about to start a workout.

Problem:

- The app currently makes it too easy to change routines and not clear enough how to start executing today's routine.
- The configured workout time, such as 30/45/60/90 minutes, is visible but not operational.

Expected user workflow:

1. Open FitPilot.
2. Review today's routine.
3. Press `Start Workout`.
4. See remaining time count down.
5. Check off exercises during the workout.
6. Pause/resume or end the workout.
7. Save the workout after progress is made.

### MVP Scope

In scope:

- Remove duplicate `New Routine` CTAs from the Today screen.
- Keep `New Routine` accessible through the tab/navigation only.
- Add workout session state in `src/App.jsx`.
- Add countdown from `profile.availableMinutes`.
- Add `Start Workout`, `Pause`, `Resume`, and `End Workout` controls.
- Show remaining time in a compact, prominent timer block.
- Keep checklist interaction available while timer is running.
- Make `Save Workout` visually secondary before start and more natural after progress/end.
- Save useful session metadata when saving:
  - `startedAt`
  - `endedAt`
  - `plannedMinutes`
  - `elapsedSeconds`
  - `completedExercises`

Out of scope:

- Rest timer per set.
- Exercise-by-exercise timers.
- Push notifications.
- Audio alerts.
- Background timer persistence after closing the browser.
- Firebase sync.
- External AI APIs.
- A new routing system or UI framework.

### UX Requirements

Today screen CTA hierarchy:

1. `Start Workout` / timer controls.
2. Checklist completion.
3. `Save Workout`.
4. `New Routine` only through navigation.

Timer states:

- `idle`: show planned time and primary `Start Workout`.
- `running`: show countdown plus `Pause` and `End Workout`.
- `paused`: show countdown plus `Resume` and `End Workout`.
- `ended`: show elapsed time and make `Save Workout` the natural next action.

Recommended copy:

- `운동 시작`
- `일시정지`
- `재개`
- `운동 종료`
- `남은 시간`
- `운동 저장`

If Korean copy risks mojibake again, use stable English fallback:

- `Start Workout`
- `Pause`
- `Resume`
- `End Workout`
- `Time Left`
- `Save Workout`

### Development Agent Tasks

Primary files:

- `src/App.jsx`
- `src/styles.css`

Likely changes in `src/App.jsx`:

- Add state:
  - `sessionStatus`: `idle | running | paused | ended`
  - `remainingSeconds`
  - `sessionStartedAt`
  - `sessionEndedAt`
- Use `useEffect` for countdown.
- Reset timer when generating a new routine.
- Prevent timer from going below zero.
- When timer reaches zero, set status to `ended`.
- Save session metadata in `saveTodayWorkout`.
- Remove duplicate Today-screen `New Routine` buttons.

Likely changes in `src/styles.css`:

- Add timer card/block styles.
- Add compact control row for pause/resume/end.
- Ensure mobile 390px layout does not overflow.
- Keep the Today checklist visible without excessive vertical push.

Implementation caution:

- Current `src/App.jsx` contains Korean copy. If editing produces mojibake, switch all newly touched user-facing copy in the affected area to English and document it.
- Do not touch deployment workflow for this feature.
- Do not commit runtime log file changes such as `vite-dev.log` or `vite-dev.err.log`.

### Validation Agent Tasks

Required command:

```bash
npm run build
```

Manual scenarios:

1. Open `http://127.0.0.1:5173/FitPilot/`.
2. Confirm Today screen has only one clear primary action: `Start Workout`.
3. Confirm duplicate `New Routine` buttons are removed from Today.
4. Press `Start Workout`.
5. Confirm timer starts from configured time and counts down.
6. Press `Pause`; confirm countdown stops.
7. Press `Resume`; confirm countdown continues.
8. Press `End Workout`; confirm session ends and save becomes natural.
9. Check at least one exercise and save.
10. Confirm History still loads after refresh.
11. Generate a new routine and confirm timer resets to the selected available time.
12. Check mobile width around 390px for overflow and CTA clarity.

Regression checks:

- No Firebase dependency.
- No external AI API dependency.
- Recommendation generation still works.
- `npm run build` passes.
- GitHub Pages base remains `/FitPilot/`.

### Completion Criteria

- Today screen no longer has excessive `New Routine` CTAs.
- Workout timer supports start, pause, resume, end.
- Timer is based on configured workout time.
- Save log includes session metadata.
- Build passes.
- Manual validation confirms the core flow.

## Active Handoff: Today Date And Routine Date Refresh

Date: 2026-06-07

Status:

- Planning Agent has consolidated the direction.
- This handoff is for Development Agent and Validation Agent execution.
- Do not add a large routine-generation CTA to the Today screen.

### Product Decision

The Today screen should clearly show which date the routine belongs to. The app should also handle the edge case where the browser stays open overnight and the displayed routine is from yesterday.

Do not hard-refresh the whole page. Handle date changes inside React state.

### UX Principle

The product promise is:

- Open FitPilot and immediately see today's routine.

Therefore:

- Do not add a large `Generate today's routine` button to the Today screen.
- Keep routine generation automatic on load.
- Keep routine changes in the `New Routine` tab.
- Add a clear date label to the Today screen.

### Target User And Problem

Target user:

- A user who opens FitPilot before working out, or leaves the app tab open across days.

Problem:

- Without a date label, the user cannot tell whether the displayed routine is actually today's routine.
- If the app remains open overnight, the user may see yesterday's routine on today's date.

### MVP Scope

In scope:

- Add a visible date label to the Today screen.
- Add `routineDate` state to track which date the current recommendation belongs to.
- Set `routineDate` when the initial recommendation is created.
- Set `routineDate` when a new routine is generated.
- Detect date changes while the app is open.
- If date changes and workout session is `idle`, automatically regenerate today's routine.
- If date changes while workout is `running`, `paused`, or unsaved `ended`, do not auto-replace the routine.
- Show a notice when the date changed but the current session should be preserved.
- Include `routineDate` in saved workout logs.

Out of scope:

- Full page reload.
- Background persistence after browser close.
- Server sync.
- Firebase date sync.
- Timezone selector.
- Push notifications.

### Date Policy

Use local browser date via the existing `todayString()` helper unless there is a clear reason to change it.

States:

- `idle`
  - If `routineDate !== todayString()`, generate a fresh recommendation for today.
  - Update `routineDate` to today.
  - Reset session timer to the configured workout time.

- `running` / `paused`
  - Do not replace the routine.
  - Show a notice such as:
    - Korean: `날짜가 바뀌었습니다. 진행 중인 운동을 종료하거나 저장한 뒤 오늘 루틴을 새로 불러올 수 있습니다.`
    - English fallback: `The date changed. Finish or save this workout before loading today's routine.`

- `ended`
  - If unsaved, do not replace the routine.
  - Show the same notice and keep save as the next action.
  - After saving, allow the app to load today's routine if dates differ.

Saved workout date:

- Add `routineDate` to the log.
- Keep existing `date`.
- Recommended `date` policy:
  - If `sessionStartedAt` exists, use the local date from `sessionStartedAt`.
  - Otherwise use `routineDate`.
  - Keep `createdAt` as actual save timestamp.

### Development Agent Tasks

Primary files:

- `src/App.jsx`
- `src/styles.css`

Likely changes in `src/App.jsx`:

- Add `routineDate` state initialized to `todayString()`.
- Add a formatted display date helper, for example `formatDisplayDate(routineDate)`.
- Add date label near `오늘의 루틴`.
- Add date-change detection with `useEffect`.
- Use an interval such as 60 seconds to compare `todayString()` with `routineDate`.
- Add `dateNotice` or similar state for the preserved-session warning.
- Clear notice when routine is refreshed or saved.
- Update `generateRoutine` to set `routineDate` to `todayString()`.
- Update save log to include `routineDate`.
- After saving an ended stale routine, optionally refresh today's routine and reset timer.

Likely changes in `src/styles.css`:

- Add compact date label style.
- Add stale-date notice style if existing `notice warning` is not enough.

### Validation Agent Tasks

Required command:

```bash
npm run build
```

Manual scenarios:

1. Open Today screen.
2. Confirm date is visible near the routine title.
3. Confirm routine still appears automatically on load.
4. Confirm no large `Generate today's routine` CTA was added.
5. Generate a new routine from the New Routine tab and confirm the date remains today's date.
6. Start, pause, resume, end, and save workflow still works.
7. Save workout and confirm History still shows saved log.

Date edge-case validation:

- If practical, temporarily simulate a stale `routineDate` in code or local state.
- In `idle`, stale date should regenerate today's routine.
- In `running` or `paused`, stale date should not replace the routine.
- In unsaved `ended`, stale date should not replace the routine before saving.
- Saved logs should contain `routineDate`.

Regression checks:

- No Firebase dependency.
- No external AI API dependency.
- `New Routine` remains a secondary tab flow.
- GitHub Pages base remains `/FitPilot/`.

### Completion Criteria

- Today screen displays a clear date.
- App still auto-displays a routine on load.
- Stale idle routine refreshes internally without full page reload.
- Active/unsaved sessions are not overwritten by date changes.
- Saved logs include `routineDate`.
- Build passes.

## Active Handoff: Workout History Deletion

Date: 2026-06-07

Status:

- Planning Agent, UX Agent, Development Agent, Validation Agent, and Recommendation Agent agree this belongs in the MVP.
- This handoff is for Development Agent and Validation Agent execution.

### Product Decision

Add individual workout history deletion.

Rationale:

- Users can accidentally save test or incorrect workout logs.
- Saved history affects future recommendation rotation.
- A localStorage-first app should give users direct control over local data.

### Target User And Problem

Target user:

- A user reviewing saved workouts in the History tab.

Problem:

- The app currently allows saving workout history but not deleting it.
- Incorrect logs remain in localStorage and can influence future recommendations.

### MVP Scope

In scope:

- Add per-log delete on the History tab.
- Ask for confirmation before deleting.
- Remove the log from localStorage.
- Update React `history` state after deletion.
- Show a delete success message.
- Keep the current Today routine unchanged after deletion.
- Let future routine generation use the updated history.

Out of scope:

- Bulk delete.
- Clear all history.
- Undo / trash recovery.
- Cloud deletion.
- Firebase sync.
- Multi-select history management.

### UX Requirements

- Show a small secondary/danger `삭제` button on each history card.
- Do not expose delete controls on the Today screen.
- Confirm before deletion with text like:
  - `이 운동 기록을 삭제할까요?`
- After deletion, show feedback like:
  - `운동 기록이 삭제되었습니다.`
- Deletion should not visually dominate the History card.

### Development Agent Tasks

Primary files:

- `src/lib/storage.js`
- `src/App.jsx`
- `src/styles.css`

Likely changes:

- Add `deleteWorkoutLog(logId)` to `src/lib/storage.js`.
- Import `deleteWorkoutLog` in `src/App.jsx`.
- Add `historyStatus` state or reuse an appropriate feedback state for History.
- Add `deleteHistoryItem(logId)`:
  - call `window.confirm`
  - if canceled, keep the log
  - if confirmed, call `deleteWorkoutLog`
  - call `setHistory(nextHistory)`
  - show feedback
- Add a delete button to each History card.
- Add compact danger button styling if existing styles are not enough.

Implementation policy:

- Do not regenerate the current Today routine immediately after deletion.
- Do not change recommendation engine logic.
- Do not touch deployment workflow.
- Do not include runtime log file changes in the feature commit.

### Validation Agent Tasks

Required command:

```bash
npm run build
```

Manual scenarios:

1. Save a workout.
2. Open History.
3. Confirm the saved log appears.
4. Click delete.
5. Cancel confirmation and confirm the log remains.
6. Click delete again.
7. Confirm deletion and confirm the log disappears.
8. Refresh and confirm the deleted log does not return.
9. Generate a new routine and confirm no errors occur.

Regression checks:

- Empty History state still works.
- Today routine remains unchanged immediately after deletion.
- Future routine generation uses updated history.
- No Firebase dependency.
- No external AI API dependency.

### Completion Criteria

- Each History card has a delete action.
- Deletion requires confirmation.
- Confirmed deletion updates localStorage and UI.
- Deletion feedback is visible.
- Build passes.

## Completed Workout History Deletion Pass

Date: 2026-06-07

Changed files:

- `src/lib/storage.js`
- `src/App.jsx`
- `src/styles.css`
- `HANDOFF.md`

Development completed:

- Added `deleteWorkoutLog(logId)` to localStorage storage utilities.
- Added per-history-item delete action in the History tab.
- Added confirmation via `window.confirm`.
- Confirmed deletion updates localStorage and React `history` state.
- Added History-specific success feedback after deletion.
- Kept the current Today routine unchanged after deletion.
- Added compact danger styling for the delete button.

Validation completed:

```bash
npm run build
```

Result:

- Passed.
- Vite still reports the existing chunk-size warning around 500 kB; this remains non-blocking for the MVP.

Additional checks:

- Local URL `http://127.0.0.1:5173/FitPilot/` returned HTTP 200.
- Code check confirmed `deleteWorkoutLog`, `deleteHistoryItem`, `historyStatus`, `history-card-head`, and `delete-button` are present.

Remaining manual validation:

- Save a workout, open History, cancel delete and confirm the log remains.
- Confirm delete and verify the log disappears.
- Refresh and confirm deleted log does not return.

## Active Handoff: Workout Timer Reset

Date: 2026-06-07

Status:

- Planning Agent, UX Agent, Development Agent, Validation Agent, and Recommendation Agent agree this belongs in the MVP.
- This handoff is for Development Agent and Validation Agent execution.

### Product Decision

Add a timer-only reset action for the workout session timer.

Rationale:

- Users can accidentally press `Start Workout`.
- `End Workout` can feel like a completed workout, not an error recovery action.
- The user needs a low-risk way to reset timing without losing checklist progress.

### MVP Scope

In scope:

- Add `Timer Reset` / `타이머 리셋` control.
- Show it only after a timer session has started:
  - `running`
  - `paused`
  - `ended`
- Hide it in `idle`.
- Ask for confirmation before reset.
- Reset only timer/session fields:
  - `sessionStatus` -> `idle`
  - `remainingSeconds` -> configured workout time
  - `sessionStartedAt` -> empty
  - `sessionEndedAt` -> empty
  - timer-related save status cleared
- Preserve:
  - current routine
  - checked exercises
  - entered weights
  - `routineDate`
  - history

Out of scope:

- Reset entire routine.
- Clear checklist completion.
- Clear weights.
- Regenerate recommendations.
- Delete saved history.

### UX Requirements

- Reset should be secondary, not primary.
- Use copy:
  - Korean: `타이머 리셋`
  - Confirmation: `타이머를 초기화할까요? 체크한 운동과 입력한 중량은 유지됩니다.`
  - English fallback: `Reset Timer`
- Recommended state controls:
  - `idle`: `운동 시작`, `운동 저장`
  - `running`: `일시정지`, `운동 종료`, `타이머 리셋`
  - `paused`: `재개`, `운동 종료`, `타이머 리셋`
  - `ended`: `운동 저장`, `타이머 리셋`

### Development Agent Tasks

Primary files:

- `src/App.jsx`
- `src/styles.css`

Implementation notes:

- Add `resetTimerOnly()`.
- Pass it into `WorkoutTimer`.
- Add a reset button for `running`, `paused`, and `ended`.
- Keep checklist state untouched.
- Keep `routineDate` untouched.
- Do not change storage or recommendation logic for this feature.

### Validation Agent Tasks

Required command:

```bash
npm run build
```

Manual scenarios:

1. Idle state: confirm reset button is hidden.
2. Start workout: confirm reset button appears.
3. Click reset and cancel: confirm timer continues or remains unchanged.
4. Click reset and confirm: timer returns to configured workout time and state returns to idle.
5. Check one exercise and enter weight, then reset timer: confirm check and weight remain.
6. Pause/resume/end flows still work.
7. Save still works after reset.

### Completion Criteria

- Timer reset exists for active/paused/ended sessions.
- Reset requires confirmation.
- Reset affects only timer/session fields.
- Checklist and weights remain intact.
- Build passes.

## Completed Workout Timer Reset Pass

Date: 2026-06-07

Changed files:

- `src/App.jsx`
- `src/styles.css`
- `HANDOFF.md`

Development completed:

- Added `resetTimerOnly()`.
- Added confirmation before timer reset.
- Added `타이머 리셋` button for:
  - `running`
  - `paused`
  - `ended`
- Kept reset hidden in `idle`.
- Reset now affects only timer/session fields:
  - `sessionStatus`
  - `remainingSeconds`
  - `sessionStartedAt`
  - `sessionEndedAt`
  - `saveStatus`
- Checklist completion, weights, current routine, `routineDate`, and history are preserved.
- Updated timer action layout to support three controls without crowding.
- Added low-emphasis reset button styling.

Validation completed:

```bash
npm run build
```

Result:

- Passed.
- Existing Vite chunk-size warning remains non-blocking.

Additional checks:

- Local URL `http://127.0.0.1:5173/FitPilot/` returned HTTP 200.
- Code check confirmed reset handler, state wiring, and timer reset buttons are present.

Remaining manual validation:

- Start workout and confirm reset appears.
- Cancel reset and confirm timer state remains.
- Confirm reset and verify timer returns to configured time.
- Confirm checked exercises and weights remain after reset.

## Active Handoff: Firebase Auth And Firestore Expansion

Date: 2026-06-07

Status:

- User approved implementation after Planning Agent analysis.
- Firebase Web App registration is already complete.
- Firebase MCP must not be used.
- External AI APIs must not be used.

### Product Decision

Extend FitPilot from localStorage-only persistence to optional Firebase Authentication + Firestore persistence.

The app must remain usable without Firebase config and without login.

### Target User And Problem

Target user:

- A user who wants workout history and profile settings available beyond one browser/device.

Problem:

- Current localStorage data is device/browser-specific.
- Firebase is already prepared as a future placeholder but not wired to Auth/Firestore.

### MVP Scope

In scope:

- Keep existing Vite + React project.
- Keep localStorage fallback.
- Use Firebase config from `VITE_FIREBASE_*` environment variables.
- Add Google sign-in and sign-out UI.
- Show auth/storage state in the top UI.
- Save/load workout logs from Firestore when logged in.
- Save/load profile settings from Firestore when logged in.
- Keep localStorage behavior when logged out or Firebase config is missing.
- Update README with Firebase setup and GitHub Pages env guidance.

Out of scope:

- Firebase MCP.
- External AI API.
- Automatic migration of existing localStorage history into Firestore.
- Email/password login.
- Account deletion.
- Offline Firestore persistence.
- Firestore security rule authoring beyond README guidance.

### Firestore Paths

- Workout logs:
  - `users/{uid}/workoutLogs/{logId}`
- Profile settings:
  - `users/{uid}/profile/settings`

### Development Agent Tasks

Primary files:

- `src/firebase.js`
- `src/lib/firebaseWorkoutStore.js`
- `src/App.jsx`
- `README.md`

Likely changes:

- Update `src/firebase.js` exports:
  - `initializeApp`
  - `getAuth`
  - `getFirestore`
  - `GoogleAuthProvider`
  - `signInWithPopup`
  - `signOut`
  - `onAuthStateChanged`
  - `googleProvider`
  - `auth`
  - `db`
  - `isFirebaseEnabled`
- Create `src/lib/firebaseWorkoutStore.js`:
  - `saveWorkoutLogToFirestore(userId, log)`
  - `loadWorkoutLogsFromFirestore(userId)`
  - `saveUserProfileToFirestore(userId, profile)`
  - `loadUserProfileFromFirestore(userId)`
- Update `App.jsx`:
  - Track auth user state.
  - Add Google login/logout controls.
  - Display storage/auth mode.
  - If logged in and Firebase is enabled, use Firestore for save/load.
  - Otherwise use localStorage.
  - Preserve localStorage fallback.
- Update `README.md`:
  - Firebase Console setup.
  - `.env.local` setup.
  - Google Auth provider enablement.
  - Firestore Database creation.
  - localStorage fallback.
  - GitHub Pages environment variables / secrets guidance.

### Validation Agent Tasks

Required command:

```bash
npm run build
```

Manual scenarios:

1. With no `.env.local`, app builds and runs in Local Mode.
2. Before login, saving workout still writes to localStorage.
3. With Firebase config, top UI shows Firebase-ready state.
4. Google login button opens sign-in flow.
5. After login, user email/name is shown.
6. Logged-in workout save writes to Firestore.
7. Logged-in app load reads Firestore logs.
8. Logged-in profile updates save to Firestore.
9. Logout returns to localStorage fallback behavior.

Regression checks:

- `npm run build` passes.
- Existing recommendation behavior still works.
- Existing timer behavior still works.
- Existing History delete still works in localStorage mode.
- GitHub Pages base remains `/FitPilot/`.

### Completion Criteria

- Firebase config remains env-based and not hardcoded.
- App works with Firebase disabled.
- App works while logged out.
- Google auth UI exists.
- Logged-in Firestore save/load functions exist and are wired.
- README documents required Firebase and deployment setup.

## Completed Firebase Auth And Firestore Expansion Pass

Date: 2026-06-07

Changed files:

- `src/firebase.js`
- `src/lib/firebaseWorkoutStore.js`
- `src/App.jsx`
- `src/styles.css`
- `README.md`
- `HANDOFF.md`

Development completed:

- Updated `src/firebase.js` to export Auth and Google sign-in helpers:
  - `auth`
  - `db`
  - `googleProvider`
  - `isFirebaseEnabled`
  - `GoogleAuthProvider`
  - `onAuthStateChanged`
  - `signInWithPopup`
  - `signOut`
- Added `src/lib/firebaseWorkoutStore.js`.
- Added Firestore functions:
  - `saveWorkoutLogToFirestore(userId, log)`
  - `loadWorkoutLogsFromFirestore(userId)`
  - `saveUserProfileToFirestore(userId, profile)`
  - `loadUserProfileFromFirestore(userId)`
- Added `deleteWorkoutLogFromFirestore(userId, logId)` to preserve existing History delete behavior for logged-in users.
- Wired `App.jsx` auth state with `onAuthStateChanged`.
- Added Google login and logout controls.
- Added top UI status:
  - `Local Mode`
  - `Firebase Ready`
  - `Logged in as ...`
- When logged in and Firebase is configured, workout saves go to Firestore.
- When logged out or Firebase config is missing, workout saves continue to use localStorage.
- When logged in, profile changes save to Firestore.
- When logged out or Firebase config is missing, profile changes continue to use localStorage.
- On login, app attempts to load Firestore profile and workout logs.
- On logout, app returns to local localStorage profile/history.
- README now documents Firebase Console setup, `.env.local`, Google Provider, Firestore Database, fallback behavior, and GitHub Pages build-time env requirements.

Validation completed:

```bash
npm run build
```

Result:

- Passed.
- Bundle size warning increased after Firebase SDK code was wired. This is expected and non-blocking for the current MVP.

Additional checks:

- Local URL `http://127.0.0.1:5173/FitPilot/` returned HTTP 200.
- Code check confirmed Firebase exports, Firestore store functions, Auth wiring, Google login UI, and README Firebase docs are present.

Remaining manual validation:

- Create `.env.local` with real `VITE_FIREBASE_*` values.
- Enable Google Authentication provider in Firebase Console.
- Create Firestore Database.
- Confirm Google sign-in popup works locally.
- Confirm logged-in workout save writes to `users/{uid}/workoutLogs/{logId}`.
- Confirm logged-in profile changes write to `users/{uid}/profile/settings`.
- Confirm Firestore logs load after refresh while logged in.
- Confirm GitHub Pages build receives `VITE_FIREBASE_*` values if Firebase should work in production.

## Completed Date/Routine Refresh Pass

Date: 2026-06-07

Changed files:

- `src/App.jsx`
- `src/styles.css`
- `HANDOFF.md`

Development completed:

- Added `routineDate` state initialized from `todayString()`.
- Added formatted date display near the Today routine title.
- Added date-change detection with a 60-second interval.
- If `routineDate` becomes stale while session is `idle`, the app internally regenerates today's routine without a full page reload.
- If the date changes during `running`, `paused`, or unsaved `ended`, the app preserves the current routine and shows a warning notice.
- New routine generation now updates `routineDate` to today.
- Workout save logs now include `routineDate`.
- Workout save `date` now uses the session start date when available, otherwise the routine date.
- Added compact date label styling.

Validation completed:

```bash
npm run build
```

Result:

- Passed.
- Vite still reports the existing chunk-size warning around 500 kB; this is not a functional failure for the MVP.

Additional checks:

- Local URL `http://127.0.0.1:5173/FitPilot/` returned HTTP 200.
- Recommendation smoke test still passed: first routine `push`, second routine after saved-history simulation `pull`.
- Code check confirmed `routineDate`, date label, date notice, and saved log metadata are present.

Remaining manual validation:

- Visually confirm the date label on Today screen.
- Manually confirm start/pause/resume/end/save still works in the browser.
- If practical, simulate a stale `routineDate` to confirm idle auto-refresh and active-session preservation.

Note:

- `vite-dev.log` and `vite-dev.err.log` may be touched by the local Vite server. They are runtime logs and should not be included in a feature commit unless intentionally tracking runtime logs.

## Completed Timer Implementation Pass

Date: 2026-06-07

Changed files:

- `src/App.jsx`
- `src/styles.css`
- `HANDOFF.md`

Development completed:

- Removed duplicate `New Routine` CTA buttons from the Today screen.
- Kept `New Routine` available through the navigation tab and the dedicated New Routine screen.
- Added workout session state in `src/App.jsx`:
  - `sessionStatus`
  - `remainingSeconds`
  - `sessionStartedAt`
  - `sessionEndedAt`
- Added countdown behavior with `useEffect`.
- Added timer states:
  - `idle`
  - `running`
  - `paused`
  - `ended`
- Added controls:
  - `운동 시작`
  - `일시정지`
  - `재개`
  - `운동 종료`
  - `운동 저장`
- Reset the workout timer when a new routine is generated.
- Saved session metadata in workout logs:
  - `startedAt`
  - `endedAt`
  - `plannedMinutes`
  - `elapsedSeconds`
  - `completedExercises`
- Added timer card styles and state-specific visual treatment.

Validation completed:

```bash
npm run build
```

Result:

- Passed.
- Vite reported a chunk-size warning slightly above 500 kB. This is acceptable for the current MVP and is not a functional failure.

Additional checks:

- Local URL `http://127.0.0.1:5173/FitPilot/` returned HTTP 200.
- Recommendation smoke test still passed: first routine `push`, second routine after saved-history simulation `pull`.
- Code check confirmed Today-screen `New Routine` buttons were removed; remaining `New Routine` references are the navigation tab and New Routine screen.

Remaining validation:

- Manual browser click-through should confirm:
  - `운동 시작` starts countdown.
  - `일시정지` stops countdown.
  - `재개` resumes countdown.
  - `운동 종료` ends the session.
  - `운동 저장` records the workout and history still persists after refresh.

Note:

- `vite-dev.log` and `vite-dev.err.log` may be touched by the local Vite server. They are runtime logs and should not be included in the feature commit unless intentionally tracking runtime logs.

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
