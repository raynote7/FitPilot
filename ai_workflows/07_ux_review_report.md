# FitPilot UX Review Report

Date: 2026-06-07

Reviewer: FitPilot UX Agent

## Tested Flow

- Opened the local app at `http://127.0.0.1:5173/FitPilot/`.
- Reviewed desktop first-open state at the default browser viewport.
- Opened the `자동 생성` tab and reviewed setup controls.
- Generated a routine.
- Checked one exercise and confirmed completion rate changed.
- Saved today's workout twice and reviewed `기록`.
- Reviewed mobile behavior at 390 x 844.

## Current User Journey

1. User opens FitPilot.
2. User sees a large product header, Firebase/local mode status, tab navigation, then today's routine.
3. User can switch to `자동 생성` to change split, time, goal, experience, and injury conditions.
4. User presses `루틴 생성` and returns to the `오늘 운동` tab.
5. User checks exercises, optionally enters weight, and presses `오늘 기록 저장`.
6. User opens `기록` to see saved sessions.

## Top UX Problems

### 1. The first useful action is buried on mobile

At 390 x 844, the first workout card starts around 1198px from the top. The `자동 생성` screen's primary CTA starts around 1061px from the top.

Impact:

- The app feels slow and heavy even though it is technically simple.
- A gym user must scroll before seeing the actual routine or action.
- The hero and Firebase status consume too much attention for a utility app.

Recommended direction:

- Compress the header.
- Move Firebase/local mode into a small secondary status line.
- Put today's routine summary and primary action near the first viewport.
- Consider making `오늘 운동` the work surface, not a landing-style page.

### 2. Save behavior has no success feedback and allows duplicates

Pressing `오늘 기록 저장` gives no visible confirmation. Pressing it again immediately creates another identical history entry.

Impact:

- User cannot tell whether save succeeded.
- Duplicate records pollute history and affect future recommendations.
- Trust in local storage behavior drops.

Recommended direction:

- Show a saved confirmation state such as `저장됨`.
- Disable or change the save button after saving the same routine.
- Upsert by date + routine identity, or ask whether to overwrite today's saved workout.

### 3. Setup controls do not explain when changes apply

The `자동 생성` tab lets the user change profile settings, but it is unclear whether changes immediately update today's routine or require `루틴 생성`.

Impact:

- User may assume changing a select already changed the routine.
- The profile/routine relationship feels opaque.

Recommended direction:

- Add concise copy near the CTA: `설정을 바꾼 뒤 루틴 생성을 누르면 오늘 운동에 반영됩니다.`
- After generation, show `방금 생성한 루틴` or a timestamp/status.

### 4. Injury selection is semantically ambiguous

Buttons say `무릎`, `어깨`, `허리`, but not whether these mean target muscles, pain areas, or areas to avoid.

Impact:

- A user with an injury may not trust the recommendation.
- The app currently says risky exercises receive a large penalty, not that they are excluded.

Recommended direction:

- Rename label to `주의 부위`.
- Add short helper copy: `불편하거나 피해야 하는 부위를 선택하세요.`
- Recommendation Agent should exclude direct injury conflicts for MVP safety.

### 5. Recommendation explanation is too technical and uses internal values

Example observed copy:

`최근 운동 기록을 기준으로 three_split 루틴의 다음 포커스인 pull 운동을 추천했습니다. 부상 조건(knee)을 반영했습니다.`

Impact:

- `three_split`, `pull`, `knee` are implementation labels.
- The explanation reads like debug output rather than user-facing coaching.

Recommended direction:

- Map internal values to Korean labels in recommendation reasons.
- Use plain language: `최근 Push 운동을 저장해서 오늘은 등/이두 중심으로 구성했습니다. 무릎 부담이 큰 운동은 제외했습니다.`

### 6. Workout cards are too tall and repetitive

Desktop card height was about 212px. Mobile card height was about 232px. Each card repeats a long reason.

Impact:

- Six exercises become a long scroll.
- The user cannot scan the workout quickly.
- Repeated reason text adds bulk without new information.

Recommended direction:

- Make cards denser.
- Put sets/reps/time/calories in compact chips or a single metadata row.
- Move repeated reasons into a smaller expandable detail or show only when non-obvious, such as injury-safe or recently rotated.

### 7. Body Map is visually secondary but takes equal height on desktop

The right Body Map panel stretches to match the long workout list, creating a tall empty-looking secondary column.

Impact:

- Desktop layout feels unbalanced.
- The Body Map competes with the checklist without adding equivalent utility.

Recommended direction:

- Let the Body Map fit its own content instead of stretching with the workout list.
- Move it below the summary or make it a compact `오늘 자극 부위` strip.

### 8. History is readable but not actionable

History shows sessions, completion rate, calories, and exercise names. It does not support reviewing details, loading a previous routine, deleting duplicates, or clearing accidental saves.

Impact:

- Duplicate save problem has no recovery path.
- History cannot support user trust or recommendation debugging.

Recommended direction:

- Add delete for a history entry.
- Group or replace duplicate same-day saves.
- Show local-only storage note in history, not in the main hero.

### 9. Navigation labels are acceptable, but the information architecture is fragmented

The core loop is split across `오늘 운동`, `자동 생성`, `신체 부위`, and `기록`.

Impact:

- User must understand tabs before understanding the workflow.
- `신체 부위` duplicates the Body Map already shown on today's workout page.

Recommended direction:

- Treat `오늘 운동` as the main dashboard.
- Keep settings close to the generated routine, possibly as a collapsible section.
- Remove or de-emphasize standalone `신체 부위` unless it adds unique value.

## Proposed MVP User Journey

1. User opens FitPilot and immediately sees today's routine summary and the first exercise.
2. User can tap a compact `설정 변경` area to adjust time, goal, split, level, and caution areas.
3. User taps `오늘 루틴 생성`.
4. The routine shows plain-language reasoning and safety notes.
5. User checks exercises during workout.
6. User saves once, receives visible confirmation, and cannot accidentally duplicate the same log.
7. User reviews history and can delete accidental records.

## In-Scope UX Changes

- Compact hero/header.
- Clarify setup labels and helper text.
- Add save success and duplicate prevention.
- Compress workout cards.
- Improve recommendation reason labels.
- Move local-only/Firebase detail out of the primary hero.
- Improve mobile first viewport.
- Add delete or duplicate handling for history.

## Out-of-Scope Changes

- Firebase Auth or Firestore sync.
- External AI APIs.
- Full design system replacement.
- New framework, router, or UI kit.
- Advanced analytics dashboard.
- Medical advice claims.

## Agent Discussion Summary

### UX Agent

The largest user-experience issue is not visual polish; it is that the workout loop is hidden behind too much structure. FitPilot should feel like a workout checklist first and a configuration app second.

### Frontend Agent

Recommended implementation should stay small:

- Rework `src/App.jsx` layout around a compact header and denser cards.
- Add a saved status state.
- Add duplicate-save guard.
- Adjust CSS spacing, card density, and mobile order in `src/styles.css`.
- Avoid introducing a component library.

### Recommendation Agent

UX trust depends on safer recommendation behavior:

- Exclude direct injury conflicts rather than merely penalizing them.
- Convert internal values to user-facing labels in reasons.
- Only show per-exercise reason text when it provides distinct value.

### Validation Agent

Regression checks should include:

- Mobile 390 x 844 first viewport shows routine summary and primary action.
- Changing settings requires pressing `루틴 생성` and this is clear.
- Saving once shows confirmation.
- Saving twice does not create a duplicate.
- History remains usable after refresh.
- Injury condition does not recommend direct conflict exercises.

### Deployment Agent

No deployment architecture changes are needed for UX work. Keep `base: '/FitPilot/'` and verify `npm run build` after changes.

## UX Acceptance Criteria

- On mobile, the user can see the app purpose, today's routine summary, and at least the start of the workout flow without excessive scrolling.
- `루틴 생성` clearly applies changed settings.
- `오늘 기록 저장` gives visible feedback.
- Saving the same current workout twice does not create two identical history entries.
- Injury options read as caution areas, not target body parts.
- Recommendation reasons use user-facing labels.
- Workout cards are scannable and less repetitive.
- History provides a recovery path for accidental saves.

## Recommended Implementation Order

1. Fix storage/save UX: confirmation state, duplicate prevention, optional delete.
2. Clarify copy: caution areas, setting application, recommendation reason labels.
3. Compact today's screen and workout cards.
4. Improve mobile layout and reduce hero height.
5. Adjust Body Map placement or height behavior.
6. Validate desktop, mobile, save/history, and injury scenarios.
