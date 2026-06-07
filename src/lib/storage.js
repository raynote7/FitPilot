const HISTORY_KEY = 'fitpilot.workoutHistory';
const PROFILE_KEY = 'fitpilot.profile';

export function loadWorkoutHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Failed to load workout history', error);
    return [];
  }
}

export function saveWorkoutLog(log) {
  const history = loadWorkoutHistory();
  const nextHistory = [log, ...history].slice(0, 100);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
  return nextHistory;
}

export function saveWorkoutHistory(history) {
  const nextHistory = history.slice(0, 100);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
  return nextHistory;
}

export function deleteWorkoutLog(logId) {
  const history = loadWorkoutHistory();
  const nextHistory = history.filter((log) => log.id !== logId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
  return nextHistory;
}

export function clearWorkoutHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw
      ? JSON.parse(raw)
      : {
          splitType: 'three_split',
          availableMinutes: 60,
          goal: 'fat_loss',
          injuries: ['knee'],
          experienceLevel: 'beginner',
        };
  } catch (error) {
    console.warn('Failed to load profile', error);
    return {
      splitType: 'three_split',
      availableMinutes: 60,
      goal: 'fat_loss',
      injuries: ['knee'],
      experienceLevel: 'beginner',
    };
  }
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
