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
    three_split: '3분할',
    ppl: 'PPL',
    two_split: '상/하체',
    full_body: '전신',
  },
  goal: {
    fat_loss: '체지방',
    strength: '근력',
    hypertrophy: '근비대',
    general: '체력',
  },
  focus: {
    push: 'Push',
    pull: 'Pull',
    legs: 'Legs',
    upper: 'Upper',
    lower: 'Lower',
    full_body: 'Full Body',
  },
  injury: {
    knee: '무릎',
    shoulder: '어깨',
    back: '허리',
  },
  experience: {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급',
  },
};

const muscleLabels = {
  chest: '가슴',
  back: '등/광배',
  front_shoulder: '전면 어깨',
  side_shoulder: '측면 어깨',
  rear_shoulder: '후면 어깨',
  biceps: '이두',
  triceps: '삼두',
  abs: '복부',
  quads: '대퇴사두',
  hamstrings: '햄스트링',
  glutes: '둔근',
  calves: '종아리',
  lower_back: '허리',
  traps: '승모',
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
  const completedCount = recommendation.exercises.filter((exercise) => exercise.completed).length;
  const muscleIntensity = useMemo(() => getMuscleIntensity(recommendation.exercises), [recommendation.exercises]);
  const currentRoutineKey = routineKey(recommendation);
  const hasSavedCurrentRoutine = savedRoutineKey === currentRoutineKey;
  const cautionText = profile.injuries.length
    ? profile.injuries.map((injury) => labels.injury[injury] || injury).join(', ')
    : '없음';

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
      setSaveStatus('이미 저장된 루틴입니다.');
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
    setSaveStatus('저장되었습니다. 같은 루틴은 한 번 더 저장되지 않습니다.');
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
      <header className="app-header">
        <div>
          <h1>FitPilot</h1>
          <p>기록 기반 오늘 운동 추천</p>
        </div>
        <span className="mode-pill">{isFirebaseEnabled ? 'Firebase ready' : 'Local only'}</span>
      </header>

      <nav className="tabs" aria-label="FitPilot sections">
        {[
          ['today', '오늘'],
          ['generate', '새 루틴'],
          ['body', '신체'],
          ['library', 'DB'],
          ['history', '기록'],
        ].map(([key, label]) => (
          <button key={key} className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}>
            {label}
          </button>
        ))}
      </nav>

      {activeTab === 'today' && (
        <main className="dashboard-grid">
          <section className="routine-panel">
            <div className="routine-head">
              <div>
                <h2>오늘의 루틴: {labels.focus[recommendation.focus] || recommendation.focus}</h2>
                <p>{recommendation.recommendationReason}</p>
              </div>
              <button className="ghost-button desktop-only" onClick={() => setActiveTab('generate')}>
                새 루틴
              </button>
            </div>

            <div className="metrics-row">
              <MetricCard label="예상 칼로리" value={`${recommendation.totalEstimatedCalories}kcal`} />
              <MetricCard label="완료율" value={`${completionRate}%`} />
              <MetricCard label="주의 부위" value={cautionText} />
            </div>

            <div className="action-row">
              <button className="primary-button" onClick={saveTodayWorkout}>
                {hasSavedCurrentRoutine ? '저장됨' : '운동 저장'}
              </button>
              <button className="ghost-button" onClick={() => setActiveTab('generate')}>
                새 루틴
              </button>
            </div>

            {profile.injuries.length > 0 && (
              <div className="notice warning">주의 부위: {cautionText} 선택됨. 충돌 운동은 가능한 경우 제외됩니다.</div>
            )}
            {saveStatus && <div className="notice success">{saveStatus}</div>}

            <div className="checklist-title">
              <h3>체크리스트</h3>
              <span>
                {completedCount}/{recommendation.exercises.length} 완료
              </span>
            </div>

            <div className="exercise-list">
              {recommendation.exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.exerciseId}
                  exercise={exercise}
                  onToggle={() => toggleExercise(exercise.exerciseId)}
                  onWeightChange={(value) => updateWeight(exercise.exerciseId, value)}
                />
              ))}
            </div>
          </section>

          <aside className="support-column">
            <BodyMapPanel muscleIntensity={muscleIntensity} compact />
            <section className="mini-panel">
              <h3>오늘 조건</h3>
              <div className="condition-list">
                <span>{labels.splitType[profile.splitType]}</span>
                <span>{profile.availableMinutes}분</span>
                <span>{labels.goal[profile.goal]}</span>
                <span>{labels.experience[profile.experienceLevel]}</span>
              </div>
            </section>
          </aside>
        </main>
      )}

      {activeTab === 'generate' && (
        <main className="form-screen">
          <section className="routine-panel">
            <h2>새 루틴 만들기</h2>
            <p className="screen-copy">
              기록 기반 추천이 마음에 들지 않을 때 사용합니다. 아래 조건으로 오늘 루틴을 새로 시작합니다.
            </p>

            <div className="reset-banner">
              <strong>기록 무시 모드</strong>
              <span>최근 운동 기록을 참고하지 않고 조건만으로 새 루틴을 만듭니다.</span>
            </div>

            <OptionGroup
              title="운동 시간"
              value={String(profile.availableMinutes)}
              options={{ 30: '30분', 45: '45분', 60: '60분', 90: '90분' }}
              onChange={(value) => updateProfile({ ...profile, availableMinutes: Number(value) })}
            />
            <OptionGroup
              title="목표"
              value={profile.goal}
              options={labels.goal}
              onChange={(value) => updateProfile({ ...profile, goal: value })}
            />
            <OptionGroup
              title="주의 부위"
              value={profile.injuries}
              options={labels.injury}
              multi
              onChange={(value) => updateProfile({ ...profile, injuries: value })}
            />
            <OptionGroup
              title="운동 수준"
              value={profile.experienceLevel}
              options={labels.experience}
              onChange={(value) => updateProfile({ ...profile, experienceLevel: value })}
            />
            <OptionGroup
              title="분할 방식"
              value={profile.splitType}
              options={labels.splitType}
              onChange={(value) => updateProfile({ ...profile, splitType: value })}
            />

            <button className="primary-button full" onClick={() => generateRoutine({ ignoreHistory: true })}>
              기록 무시하고 새 루틴 생성
            </button>
            <button className="ghost-button full" onClick={() => generateRoutine()}>
              기록 기반 추천으로 돌아가기
            </button>
          </section>
        </main>
      )}

      {activeTab === 'body' && (
        <main className="dashboard-grid">
          <BodyMapPanel muscleIntensity={muscleIntensity} />
          <section className="routine-panel">
            <h2>오늘 자극 부위</h2>
            <div className="muscle-list">
              {Object.entries(muscleIntensity).length === 0 && <p className="muted">선택된 루틴이 없습니다.</p>}
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
        <main className="routine-panel">
          <div className="section-row">
            <h2>운동 DB</h2>
            <input
              className="search"
              value={libraryQuery}
              onChange={(event) => setLibraryQuery(event.target.value)}
              placeholder="운동명, 부위, 카테고리 검색"
            />
          </div>
          <div className="library-grid">
            {filteredLibrary.map((exercise) => (
              <article className="library-card" key={exercise.id}>
                <h3>{exercise.name}</h3>
                <div className="chip-row tight">
                  <span className="tag">{exercise.category}</span>
                  <span className="tag muted-tag">{exercise.equipment}</span>
                </div>
                <p>{exercise.primaryMuscles.map((m) => muscleLabels[m] || m).join(', ')}</p>
                <p className="muted">
                  {exercise.defaultSets}세트 x {exercise.defaultReps} - {exercise.estimatedMinutes}분
                </p>
                <p>{exercise.description}</p>
              </article>
            ))}
          </div>
        </main>
      )}

      {activeTab === 'history' && (
        <main className="routine-panel">
          <h2>운동 기록</h2>
          {history.length === 0 && <p className="muted">아직 저장된 운동 기록이 없습니다.</p>}
          <div className="history-list">
            {history.map((log) => (
              <article className="history-card" key={log.id}>
                <h3>
                  {log.date} - {labels.focus[log.focus] || log.focus}
                </h3>
                <p className="muted">
                  완료율 {log.completionRate}% - 예상 {log.totalEstimatedCalories}kcal
                </p>
                <p>{log.exercises.map((exercise) => exercise.name).join(', ')}</p>
              </article>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ExerciseCard({ exercise, onToggle, onWeightChange }) {
  return (
    <article className={`exercise-card ${exercise.completed ? 'done' : ''}`}>
      <div className="exercise-content">
        <input
          type="checkbox"
          checked={exercise.completed}
          onChange={onToggle}
          aria-label={`${exercise.name} 완료`}
        />
        <div>
          <h3>{exercise.name}</h3>
          <p>
            {exercise.sets}세트 x {exercise.reps} - {exercise.estimatedMinutes}분 - {exercise.estimatedCalories}kcal
          </p>
          <div className="chip-row tight">
            {exercise.primaryMuscles.slice(0, 2).map((muscle) => (
              <span className="tag muted-tag" key={muscle}>
                {muscleLabels[muscle] || muscle}
              </span>
            ))}
            {exercise.reason && <span className="tag active-tag">추천 이유</span>}
          </div>
        </div>
      </div>
      <label className="weight-input">
        중량
        <input value={exercise.weight || ''} onChange={(event) => onWeightChange(event.target.value)} placeholder="kg" />
      </label>
    </article>
  );
}

function OptionGroup({ title, value, options, onChange, multi = false }) {
  function toggleOption(key) {
    if (!multi) {
      onChange(key);
      return;
    }
    const current = Array.isArray(value) ? value : [];
    onChange(current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  }

  return (
    <section className="option-card">
      <h3>{title}</h3>
      <div className="chip-row">
        {Object.entries(options).map(([key, label]) => {
          const selected = multi ? value.includes(key) : value === key;
          return (
            <button
              className={selected ? 'option-chip selected' : 'option-chip'}
              key={key}
              onClick={() => toggleOption(key)}
              type="button"
            >
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function BodyMapPanel({ muscleIntensity, compact = false }) {
  const active = (muscle) => (muscleIntensity[muscle] ? 'body-part active' : 'body-part');

  return (
    <section className={compact ? 'mini-panel body-panel' : 'routine-panel body-panel'}>
      <h2>신체 부위 맵</h2>
      <p className="muted">오늘 루틴의 주요 자극 부위를 표시합니다.</p>
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
