const focusBySplit = {
  three_split: ['push', 'pull', 'legs'],
  ppl: ['push', 'pull', 'legs'],
  two_split: ['upper', 'lower'],
  full_body: ['full_body'],
};

const upperCategories = ['push', 'pull'];
const lowerCategories = ['legs', 'core', 'cardio'];

const splitLabels = {
  three_split: '3-day split',
  ppl: 'Push / Pull / Legs',
  two_split: 'Upper / Lower',
  full_body: 'Full body',
};

const focusLabels = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs + Core',
  upper: 'Upper',
  lower: 'Lower',
  full_body: 'Full Body',
};

const injuryLabels = {
  knee: 'knee',
  shoulder: 'shoulder',
  back: 'back',
};

function getRecentExerciseIds(workoutHistory, count = 2) {
  return workoutHistory
    .slice(0, count)
    .flatMap((log) => log.exercises || [])
    .map((item) => item.exerciseId);
}

function getLastFocus(workoutHistory) {
  return workoutHistory[0]?.focus || null;
}

function nextFocus(splitType, workoutHistory) {
  const lastFocus = getLastFocus(workoutHistory);

  if (splitType === 'full_body') return 'full_body';

  if (splitType === 'two_split') {
    if (lastFocus === 'upper') return 'lower';
    if (lastFocus === 'lower') return 'upper';
    return 'upper';
  }

  const rotation = focusBySplit[splitType] || focusBySplit.three_split;
  if (!lastFocus || !rotation.includes(lastFocus)) return rotation[0];
  const index = rotation.indexOf(lastFocus);
  return rotation[(index + 1) % rotation.length];
}

function exerciseCountForTime(minutes) {
  if (minutes <= 30) return 4;
  if (minutes <= 45) return 5;
  if (minutes <= 60) return 6;
  return 8;
}

function matchesFocus(exercise, focus) {
  if (focus === 'full_body') return true;
  if (focus === 'upper') return upperCategories.includes(exercise.category);
  if (focus === 'lower') return lowerCategories.includes(exercise.category);
  return exercise.category === focus || (focus === 'legs' && ['legs', 'core', 'cardio'].includes(exercise.category));
}

function goalScore(exercise, goal) {
  if (goal === 'fat_loss') return exercise.category === 'cardio' ? 16 : 8;
  if (goal === 'strength') return ['barbell', 'machine', 'dumbbell'].includes(exercise.equipment) ? 12 : 6;
  if (goal === 'hypertrophy') return exercise.category !== 'cardio' ? 12 : 3;
  return 8;
}

function hasInjuryConflict(exercise, injuries) {
  return exercise.injuryWarnings?.some((warning) => injuries.includes(warning));
}

function injuryPenalty(exercise, injuries) {
  let penalty = 0;
  for (const injury of injuries) {
    if (exercise.injuryWarnings?.includes(injury)) penalty += 140;
  }
  if (injuries.includes('knee') && exercise.kneeFriendly) penalty -= 15;
  return penalty;
}

function scoreExercise(exercise, params) {
  const { focus, goal, injuries, recentExerciseIds, experienceLevel } = params;
  let score = 0;

  if (matchesFocus(exercise, focus)) score += 40;
  score += goalScore(exercise, goal);

  if (!recentExerciseIds.includes(exercise.id)) score += 20;
  if (recentExerciseIds.includes(exercise.id)) score -= 30;

  if (exercise.difficulty === experienceLevel) score += 10;
  if (experienceLevel === 'beginner' && exercise.difficulty === 'advanced') score -= 25;

  score -= injuryPenalty(exercise, injuries);
  return score;
}

function buildFullBodySelection(scored, maxCount) {
  const selected = [];
  const required = ['push', 'pull', 'legs', 'core'];

  for (const category of required) {
    const found = scored.find(
      (item) => item.exercise.category === category && !selected.some((s) => s.exercise.id === item.exercise.id)
    );
    if (found) selected.push(found);
  }

  const rest = scored.filter((item) => !selected.some((s) => s.exercise.id === item.exercise.id));
  return [...selected, ...rest].slice(0, maxCount);
}

function chooseCandidatePool(scored, injuries, maxCount) {
  const saferScored = scored.filter((item) => !hasInjuryConflict(item.exercise, injuries));
  const minimumUsefulRoutineSize = Math.min(maxCount, 3);
  return saferScored.length >= minimumUsefulRoutineSize ? saferScored : scored;
}

export function generateWorkoutRecommendation({
  splitType = 'three_split',
  availableMinutes = 60,
  goal = 'general',
  injuries = [],
  workoutHistory = [],
  exerciseLibrary = [],
  experienceLevel = 'beginner',
}) {
  const focus = nextFocus(splitType, workoutHistory);
  const recentExerciseIds = getRecentExerciseIds(workoutHistory, 2);
  const maxCount = exerciseCountForTime(Number(availableMinutes));

  const scored = exerciseLibrary
    .map((exercise) => ({
      exercise,
      score: scoreExercise(exercise, { focus, goal, injuries, recentExerciseIds, experienceLevel }),
    }))
    .filter((item) => item.score > -20)
    .sort((a, b) => b.score - a.score);

  const candidatePool = chooseCandidatePool(scored, injuries, maxCount);
  const selected =
    focus === 'full_body' ? buildFullBodySelection(candidatePool, maxCount) : candidatePool.slice(0, maxCount);

  const exercises = selected.map(({ exercise }) => {
    const estimatedCalories = exercise.estimatedMinutes * exercise.caloriesPerMinute;
    return {
      exerciseId: exercise.id,
      name: exercise.name,
      category: exercise.category,
      sets: exercise.defaultSets,
      reps: exercise.defaultReps,
      estimatedMinutes: exercise.estimatedMinutes,
      estimatedCalories,
      primaryMuscles: exercise.primaryMuscles,
      secondaryMuscles: exercise.secondaryMuscles,
      completed: false,
      reason: buildReason(exercise, focus, recentExerciseIds, injuries),
    };
  });

  const totalEstimatedCalories = exercises.reduce((sum, exercise) => sum + exercise.estimatedCalories, 0);

  return {
    focus,
    exercises,
    totalEstimatedCalories,
    recommendationReason: buildRecommendationReason(focus, splitType, workoutHistory, injuries),
  };
}

function buildReason(exercise, focus, recentExerciseIds, injuries) {
  const parts = [];
  if (matchesFocus(exercise, focus)) parts.push(`Matches today's ${focusLabels[focus] || focus} focus.`);
  if (!recentExerciseIds.includes(exercise.id)) parts.push('Avoids repeating the most recent workouts.');
  if (injuries.includes('knee') && exercise.kneeFriendly) parts.push('Good option when knee caution is selected.');
  if (hasInjuryConflict(exercise, injuries)) parts.push('Included only because safer alternatives were limited.');
  return parts.join(' ');
}

function buildRecommendationReason(focus, splitType, workoutHistory, injuries) {
  if (!workoutHistory.length) {
    return `No saved workout history yet, so FitPilot starts with the first ${focusLabels[focus] || focus} day in your ${
      splitLabels[splitType] || splitType
    } plan.`;
  }

  const injuryText = injuries.length
    ? ` Caution areas considered: ${injuries.map((injury) => injuryLabels[injury] || injury).join(', ')}.`
    : '';

  return `Based on your recent history, FitPilot recommends the next ${focusLabels[focus] || focus} workout in your ${
    splitLabels[splitType] || splitType
  } plan.${injuryText}`;
}

export function calculateCompletionRate(exercises) {
  if (!exercises.length) return 0;
  const completed = exercises.filter((exercise) => exercise.completed).length;
  return Math.round((completed / exercises.length) * 100);
}

export function getMuscleIntensity(exercises) {
  const intensity = {};
  for (const exercise of exercises) {
    for (const muscle of exercise.primaryMuscles || []) {
      intensity[muscle] = Math.min((intensity[muscle] || 0) + 2, 6);
    }
    for (const muscle of exercise.secondaryMuscles || []) {
      intensity[muscle] = Math.min((intensity[muscle] || 0) + 1, 6);
    }
  }
  return intensity;
}
