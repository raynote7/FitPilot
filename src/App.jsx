import { useMemo, useState } from 'react';
import { exerciseLibrary } from './data/exerciseLibrary.js';
import {
  calculateCompletionRate,
  generateWorkoutRecommendation,
  getMuscleIntensity,
} from './lib/recommendationEngine.js';
import { loadProfile, loadWorkoutHistory, saveProfile, saveWorkoutLog } from './lib/storage.js';
import { isFirebaseEnabled } from './firebase.js';

const labels = {
  splitType: {
    three_split: '3-day split',
    ppl: 'Push / Pull / Legs',
    two_split: 'Upper / Lower',
    full_body: 'Full body',
  },
  goal: {
    fat_loss: 'Fat loss',
    strength: 'Strength',
    hypertrophy: 'Muscle growth',
    general: 'General fitness',
  },
  focus: {
    push: 'Push',
    pull: 'Pull',
    legs: 'Legs + Core',
    upper: 'Upper',
    lower: 'Lower',
    full_body: 'Full Body',
  },
  injury: {
    knee: 'Knee',
    shoulder: 'Shoulder',
    back: 'Back',
  },
  experience: {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  },
};

const muscleLabels = {
  chest: 'Chest',
  back: 'Back',
  front_shoulder: 'Front shoulder',
  side_shoulder: 'Side shoulder',
  rear_shoulder: 'Rear shoulder',
  biceps: 'Biceps',
  triceps: 'Triceps',
  abs: 'Abs',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  lower_back: 'Lower back',
  traps: 'Traps',
};

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function routineKey(recommendation) {
  return `${recommendation.focus}:${recommendation.exercises.map((exercise) => exercise.exerciseId).join('|')}`;
}

function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [profile, setProfile] = useState(loadProfile);
  const [history, setHistory] = useState(loadWorkoutHistory);
  const [recommendation, setRecommendation] = useState(() =>
    generateWorkoutRecommendation({ ...loadProfile(), workoutHistory: loadWorkoutHistory(), exerciseLibrary })
  );
  const [libraryQuery, setLibraryQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [savedRoutineKey, setSavedRoutineKey] = useState('');

  const completionRate = calculateCompletionRate(recommendation.exercises);
  const muscleIntensity = useMemo(() => getMuscleIntensity(recommendation.exercises), [recommendation.exercises]);
  const currentRoutineKey = routineKey(recommendation);
  const hasSavedCurrentRoutine = savedRoutineKey === currentRoutineKey;

  function updateProfile(nextProfile) {
    setProfile(nextProfile);
    saveProfile(nextProfile);
  }

  function generateRoutine({ ignoreHistory = false } = {}) {
    const next = generateWorkoutRecommendation({
      ...profile,
      workoutHistory: ignoreHistory ? [] : history,
      exerciseLibrary,
    });
    setRecommendation(next);
    setSavedRoutineKey('');
    setSaveStatus('');
    setActiveTab('today');
  }

  function toggleExercise(exerciseId) {
    setRecommendation((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) =>
        exercise.exerciseId === exerciseId ? { ...exercise, completed: !exercise.completed } : exercise
      ),
    }));
    setSaveStatus('');
    setSavedRoutineKey('');
  }

  function updateWeight(exerciseId, value) {
    setRecommendation((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) =>
        exercise.exerciseId === exerciseId ? { ...exercise, weight: value } : exercise
      ),
    }));
    setSaveStatus('');
    setSavedRoutineKey('');
  }

  function saveTodayWorkout() {
    if (hasSavedCurrentRoutine) {
      setSaveStatus('This routine is already saved.');
      return;
    }

    const log = {
      id: createId(),
      date: todayString(),
      focus: recommendation.focus,
      exercises: recommendation.exercises,
      totalEstimatedCalories: recommendation.totalEstimatedCalories,
      completionRate,
      memo: recommendation.recommendationReason,
      createdAt: new Date().toISOString(),
    };
    const nextHistory = saveWorkoutLog(log);
    setHistory(nextHistory);
    setSavedRoutineKey(currentRoutineKey);
    setSaveStatus('Saved to this browser.');
  }

  const filteredLibrary = exerciseLibrary.filter((exercise) => {
    const q = libraryQuery.toLowerCase();
    return (
      exercise.name.toLowerCase().includes(q) ||
      exercise.category.toLowerCase().includes(q) ||
      exercise.primaryMuscles.join(' ').toLowerCase().includes(q)
    );
  });

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Local-first fitness MVP</p>
          <h1>FitPilot</h1>
          <p className="hero-text">
            Get a practical workout for today, check off each exercise, and keep your history on this device.
          </p>
        </div>
        <div className="status-card">
          <span>Storage mode</span>
          <strong>{isFirebaseEnabled ? 'Firebase ready' : 'Local only'}</strong>
          <small>{isFirebaseEnabled ? 'Firebase config is available.' : 'The MVP works without a backend.'}</small>
        </div>
      </header>

      <nav className="tabs" aria-label="FitPilot sections">
        {[
          ['today', 'Today'],
          ['generate', 'New Routine'],
          ['body', 'Body Map'],
          ['library', 'Exercise DB'],
          ['history', 'History'],
        ].map(([key, label]) => (
          <button key={key} className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}>
            {label}
          </button>
        ))}
      </nav>

      {activeTab === 'today' && (
        <main className="grid two-columns">
          <section className="panel wide">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">{todayString()}</p>
                <h2>Today: {labels.focus[recommendation.focus] || recommendation.focus}</h2>
              </div>
              <button className="primary" onClick={saveTodayWorkout}>
                {hasSavedCurrentRoutine ? 'Saved' : 'Save workout'}
              </button>
            </div>
            <p className="muted">{recommendation.recommendationReason}</p>
            {saveStatus && <p className="success-message">{saveStatus}</p>}

            <div className="summary-row">
              <SummaryCard label="Estimated calories" value={`${recommendation.totalEstimatedCalories} kcal`} />
              <SummaryCard label="Completion" value={`${completionRate}%`} />
              <SummaryCard label="Exercises" value={String(recommendation.exercises.length)} />
            </div>

            <div className="exercise-list">
              {recommendation.exercises.map((exercise) => (
                <article className={`exercise-card ${exercise.completed ? 'done' : ''}`} key={exercise.exerciseId}>
                  <div className="exercise-main">
                    <input
                      type="checkbox"
                      checked={exercise.completed}
                      onChange={() => toggleExercise(exercise.exerciseId)}
                      aria-label={`Mark ${exercise.name} complete`}
                    />
                    <div>
                      <h3>{exercise.name}</h3>
                      <p>
                        {exercise.sets} sets x {exercise.reps} - {exercise.estimatedMinutes} min -{' '}
                        {exercise.estimatedCalories} kcal
                      </p>
                      <p className="muted">
                        Main muscles: {exercise.primaryMuscles.map((m) => muscleLabels[m] || m).join(', ')}
                      </p>
                      {exercise.reason && <p className="reason">{exercise.reason}</p>}
                    </div>
                  </div>
                  <label className="weight-input">
                    Weight
                    <input
                      value={exercise.weight || ''}
                      onChange={(event) => updateWeight(exercise.exerciseId, event.target.value)}
                      placeholder="kg"
                    />
                  </label>
                </article>
              ))}
            </div>
          </section>
          <BodyMapPanel muscleIntensity={muscleIntensity} />
        </main>
      )}

      {activeTab === 'generate' && (
        <main className="grid two-columns">
          <section className="panel">
            <h2>New Routine</h2>
            <p className="muted">Choose conditions, then generate a routine. Reset mode ignores workout history.</p>
            <FormSelect
              label="Split type"
              value={profile.splitType}
              onChange={(value) => updateProfile({ ...profile, splitType: value })}
              options={labels.splitType}
            />
            <FormSelect
              label="Available time"
              value={String(profile.availableMinutes)}
              onChange={(value) => updateProfile({ ...profile, availableMinutes: Number(value) })}
              options={{ 30: '30 min', 45: '45 min', 60: '60 min', 90: '90 min' }}
            />
            <FormSelect
              label="Goal"
              value={profile.goal}
              onChange={(value) => updateProfile({ ...profile, goal: value })}
              options={labels.goal}
            />
            <FormSelect
              label="Experience"
              value={profile.experienceLevel}
              onChange={(value) => updateProfile({ ...profile, experienceLevel: value })}
              options={labels.experience}
            />
            <div className="form-block">
              <label>Caution areas</label>
              <div className="chip-row">
                {Object.entries(labels.injury).map(([key, label]) => {
                  const checked = profile.injuries.includes(key);
                  return (
                    <button
                      key={key}
                      className={checked ? 'chip active' : 'chip'}
                      onClick={() =>
                        updateProfile({
                          ...profile,
                          injuries: checked
                            ? profile.injuries.filter((item) => item !== key)
                            : [...profile.injuries, key],
                        })
                      }
                      type="button"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <button className="primary full" onClick={() => generateRoutine()}>
              Generate from history
            </button>
            <button className="secondary full" onClick={() => generateRoutine({ ignoreHistory: true })}>
              Reset and ignore history
            </button>
          </section>

          <section className="panel">
            <h2>How it works</h2>
            <ul className="plain-list">
              <li>3-day and PPL routines rotate through Push, Pull, and Legs.</li>
              <li>Upper / Lower routines rotate from the most recent saved focus.</li>
              <li>Recent exercises are penalized to reduce repetition.</li>
              <li>Caution areas strongly reduce risky exercises.</li>
              <li>Workout time controls the number of exercises.</li>
              <li>No paid AI API or backend is required.</li>
            </ul>
          </section>
        </main>
      )}

      {activeTab === 'body' && (
        <main className="grid two-columns">
          <BodyMapPanel muscleIntensity={muscleIntensity} />
          <section className="panel">
            <h2>Muscle Focus</h2>
            <div className="muscle-list">
              {Object.entries(muscleIntensity).length === 0 && (
                <p className="muted">No selected workout yet.</p>
              )}
              {Object.entries(muscleIntensity).map(([muscle, value]) => (
                <div className="muscle-row" key={muscle}>
                  <span>{muscleLabels[muscle] || muscle}</span>
                  <meter min="0" max="6" value={value}></meter>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {activeTab === 'library' && (
        <main className="panel">
          <div className="section-title-row">
            <h2>Exercise Library</h2>
            <input
              className="search"
              value={libraryQuery}
              onChange={(event) => setLibraryQuery(event.target.value)}
              placeholder="Search name, category, or muscle"
            />
          </div>
          <div className="library-grid">
            {filteredLibrary.map((exercise) => (
              <article className="library-card" key={exercise.id}>
                <h3>{exercise.name}</h3>
                <p className="tag">{exercise.category}</p>
                <p>Main muscles: {exercise.primaryMuscles.map((m) => muscleLabels[m] || m).join(', ')}</p>
                <p className="muted">
                  {exercise.defaultSets} sets x {exercise.defaultReps} - {exercise.equipment}
                </p>
                <p>{exercise.description}</p>
              </article>
            ))}
          </div>
        </main>
      )}

      {activeTab === 'history' && (
        <main className="panel">
          <h2>Workout History</h2>
          {history.length === 0 && (
            <p className="muted">No saved workouts yet. Save today's workout to build local history.</p>
          )}
          <div className="history-list">
            {history.map((log) => (
              <article className="history-card" key={log.id}>
                <div className="section-title-row">
                  <div>
                    <h3>
                      {log.date} - {labels.focus[log.focus] || log.focus}
                    </h3>
                    <p className="muted">
                      Completion {log.completionRate}% - Estimated {log.totalEstimatedCalories} kcal
                    </p>
                  </div>
                </div>
                <p>{log.exercises.map((exercise) => exercise.name).join(', ')}</p>
              </article>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <label className="form-block">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {Object.entries(options).map(([key, text]) => (
          <option value={key} key={key}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

function BodyMapPanel({ muscleIntensity }) {
  const active = (muscle) => (muscleIntensity[muscle] ? 'body-part active' : 'body-part');

  return (
    <section className="panel body-panel">
      <h2>Body Map</h2>
      <p className="muted">Highlighted areas show today's primary and secondary muscle focus.</p>
      <div className="body-map-wrap">
        <svg className="body-map" viewBox="0 0 360 360" role="img" aria-label="front and back body map">
          <text x="70" y="24">Front</text>
          <text x="245" y="24">Back</text>
          <circle className="body-outline" cx="90" cy="50" r="20" />
          <rect className={active('chest')} x="60" y="78" width="60" height="45" rx="18" />
          <rect className={active('abs')} x="70" y="124" width="40" height="55" rx="12" />
          <rect className={active('front_shoulder')} x="42" y="80" width="18" height="38" rx="8" />
          <rect className={active('front_shoulder')} x="120" y="80" width="18" height="38" rx="8" />
          <rect className={active('biceps')} x="32" y="120" width="18" height="48" rx="8" />
          <rect className={active('triceps')} x="130" y="120" width="18" height="48" rx="8" />
          <rect className={active('quads')} x="62" y="182" width="25" height="78" rx="10" />
          <rect className={active('quads')} x="93" y="182" width="25" height="78" rx="10" />
          <rect className={active('calves')} x="63" y="265" width="22" height="60" rx="8" />
          <rect className={active('calves')} x="95" y="265" width="22" height="60" rx="8" />

          <circle className="body-outline" cx="270" cy="50" r="20" />
          <rect className={active('back')} x="238" y="78" width="64" height="70" rx="18" />
          <rect className={active('traps')} x="252" y="70" width="36" height="22" rx="8" />
          <rect className={active('rear_shoulder')} x="220" y="82" width="18" height="38" rx="8" />
          <rect className={active('rear_shoulder')} x="302" y="82" width="18" height="38" rx="8" />
          <rect className={active('lower_back')} x="250" y="150" width="40" height="32" rx="10" />
          <rect className={active('glutes')} x="238" y="184" width="64" height="38" rx="16" />
          <rect className={active('hamstrings')} x="242" y="226" width="24" height="72" rx="9" />
          <rect className={active('hamstrings')} x="274" y="226" width="24" height="72" rx="9" />
          <rect className={active('calves')} x="243" y="302" width="22" height="42" rx="8" />
          <rect className={active('calves')} x="276" y="302" width="22" height="42" rx="8" />
        </svg>
      </div>
    </section>
  );
}

export default App;
