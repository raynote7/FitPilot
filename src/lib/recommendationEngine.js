const focusBySplit = {
  three_split: ['push', 'pull', 'legs'],
  ppl: ['push', 'pull', 'legs'],
  two_split: ['upper', 'lower'],
  full_body: ['full_body'],
};

const upperCategories = ['push', 'pull'];
const lowerCategories = ['legs', 'core', 'cardio'];

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

function injuryPenalty(exercise, injuries) {
  let penalty = 0;
  for (const injury of injuries) {
    if (exercise.injuryWarnings?.includes(injury)) penalty += 100;
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
    const found = scored.find((item) => item.exercise.category === category && !selected.some((s) => s.exercise.id === item.exercise.id));
    if (found) selected.push(found);
  }

  const rest = scored.filter((item) => !selected.some((s) => s.exercise.id === item.exercise.id));
  return [...selected, ...rest].slice(0, maxCount);
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

  const selected = focus === 'full_body' ? buildFullBodySelection(scored, maxCount) : scored.slice(0, maxCount);

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
  if (matchesFocus(exercise, focus)) parts.push('오늘 포커스에 맞는 운동입니다.');
  if (!recentExerciseIds.includes(exercise.id)) parts.push('최근 운동과 중복을 피했습니다.');
  if (injuries.includes('knee') && exercise.kneeFriendly) parts.push('무릎 부담을 조절하기 쉬운 선택입니다.');
  if (exercise.injuryWarnings?.some((warning) => injuries.includes(warning))) parts.push('주의가 필요해 낮은 점수로 평가됩니다.');
  return parts.join(' ');
}

function buildRecommendationReason(focus, splitType, workoutHistory, injuries) {
  if (!workoutHistory.length) {
    return '첫 운동 기록이 없어 기본 분할 루틴 기준으로 시작합니다.';
  }
  const injuryText = injuries.length ? ` 부상 조건(${injuries.join(', ')})을 반영했습니다.` : '';
  return `최근 운동 기록을 기준으로 ${splitType} 루틴의 다음 포커스인 ${focus} 운동을 추천했습니다.${injuryText}`;
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
