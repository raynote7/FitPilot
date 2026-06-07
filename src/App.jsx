import { useMemo, useState } from 'react';
import { exerciseLibrary } from './data/exerciseLibrary.js';
import { calculateCompletionRate, generateWorkoutRecommendation, getMuscleIntensity } from './lib/recommendationEngine.js';
import { loadProfile, loadWorkoutHistory, saveProfile, saveWorkoutLog } from './lib/storage.js';
import { isFirebaseEnabled } from './firebase.js';

const labels = {
  splitType: {
    three_split: '3분할',
    ppl: 'Push / Pull / Legs',
    two_split: '2분할',
    full_body: '전신',
  },
  goal: {
    fat_loss: '체지방 감량',
    strength: '근력',
    hypertrophy: '근비대',
    general: '일반 체력',
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
    knee: '무릎',
    shoulder: '어깨',
    back: '허리',
  },
};

const muscleKorean = {
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
  lower_back: '허리/척추기립근',
  traps: '승모',
};

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [profile, setProfile] = useState(loadProfile);
  const [history, setHistory] = useState(loadWorkoutHistory);
  const [recommendation, setRecommendation] = useState(() =>
    generateWorkoutRecommendation({ ...loadProfile(), workoutHistory: loadWorkoutHistory(), exerciseLibrary })
  );
  const [libraryQuery, setLibraryQuery] = useState('');

  const completionRate = calculateCompletionRate(recommendation.exercises);
  const muscleIntensity = useMemo(() => getMuscleIntensity(recommendation.exercises), [recommendation.exercises]);

  function updateProfile(nextProfile) {
    setProfile(nextProfile);
    saveProfile(nextProfile);
  }

  function generateRoutine() {
    const next = generateWorkoutRecommendation({ ...profile, workoutHistory: history, exerciseLibrary });
    setRecommendation(next);
    setActiveTab('today');
  }

  function toggleExercise(exerciseId) {
    setRecommendation((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) =>
        exercise.exerciseId === exerciseId ? { ...exercise, completed: !exercise.completed } : exercise
      ),
    }));
  }

  function updateWeight(exerciseId, value) {
    setRecommendation((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) =>
        exercise.exerciseId === exerciseId ? { ...exercise, weight: value } : exercise
      ),
    }));
  }

  function saveTodayWorkout() {
    const log = {
      id: crypto.randomUUID(),
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
          <p className="eyebrow">Local Recommendation Fitness MVP</p>
          <h1>FitPilot</h1>
          <p className="hero-text">오늘 할 운동을 추천하고, 세트/횟수 체크와 자극 부위 맵을 보여주는 웹앱입니다.</p>
        </div>
        <div className="status-card">
          <span>Firebase</span>
          <strong>{isFirebaseEnabled ? 'Enabled' : 'Local Mode'}</strong>
          <small>초기 MVP는 브라우저 저장소로 동작합니다.</small>
        </div>
      </header>

      <nav className="tabs">
        {[
          ['today', '오늘 운동'],
          ['generate', '자동 생성'],
          ['body', '신체 부위'],
          ['library', '운동 DB'],
          ['history', '기록'],
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
                <h2>오늘 운동: {labels.focus[recommendation.focus] || recommendation.focus}</h2>
              </div>
              <button className="primary" onClick={saveTodayWorkout}>오늘 기록 저장</button>
            </div>
            <p className="muted">{recommendation.recommendationReason}</p>
            <div className="summary-row">
              <SummaryCard label="예상 칼로리" value={`${recommendation.totalEstimatedCalories} kcal`} />
              <SummaryCard label="완료율" value={`${completionRate}%`} />
              <SummaryCard label="종목 수" value={`${recommendation.exercises.length}개`} />
            </div>
            <div className="exercise-list">
              {recommendation.exercises.map((exercise) => (
                <article className={`exercise-card ${exercise.completed ? 'done' : ''}`} key={exercise.exerciseId}>
                  <div className="exercise-main">
                    <input type="checkbox" checked={exercise.completed} onChange={() => toggleExercise(exercise.exerciseId)} />
                    <div>
                      <h3>{exercise.name}</h3>
                      <p>{exercise.sets}세트 × {exercise.reps} · {exercise.estimatedCalories} kcal</p>
                      <p className="muted">주 타겟: {exercise.primaryMuscles.map((m) => muscleKorean[m] || m).join(', ')}</p>
                      <p className="reason">{exercise.reason}</p>
                    </div>
                  </div>
                  <label className="weight-input">
                    중량
                    <input value={exercise.weight || ''} onChange={(e) => updateWeight(exercise.exerciseId, e.target.value)} placeholder="kg" />
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
            <h2>자동 루틴 생성</h2>
            <FormSelect label="분할 방식" value={profile.splitType} onChange={(value) => updateProfile({ ...profile, splitType: value })} options={labels.splitType} />
            <FormSelect label="운동 시간" value={String(profile.availableMinutes)} onChange={(value) => updateProfile({ ...profile, availableMinutes: Number(value) })} options={{ 30: '30분', 45: '45분', 60: '60분', 90: '90분' }} />
            <FormSelect label="목표" value={profile.goal} onChange={(value) => updateProfile({ ...profile, goal: value })} options={labels.goal} />
            <FormSelect label="운동 수준" value={profile.experienceLevel} onChange={(value) => updateProfile({ ...profile, experienceLevel: value })} options={{ beginner: '초급', intermediate: '중급', advanced: '고급' }} />
            <div className="form-block">
              <label>부상 조건</label>
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
                          injuries: checked ? profile.injuries.filter((item) => item !== key) : [...profile.injuries, key],
                        })
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <button className="primary full" onClick={generateRoutine}>루틴 생성</button>
          </section>
          <section className="panel">
            <h2>추천 로직</h2>
            <ul className="plain-list">
              <li>3분할: Push → Pull → Legs + Core 순환</li>
              <li>2분할: Upper ↔ Lower 순환</li>
              <li>최근 1~2회 수행한 운동은 감점</li>
              <li>부상 조건과 충돌하는 운동은 큰 감점</li>
              <li>운동 시간에 맞춰 종목 수 자동 조절</li>
              <li>외부 AI API 없이 로컬 점수 기반 추천</li>
            </ul>
          </section>
        </main>
      )}

      {activeTab === 'body' && (
        <main className="grid two-columns">
          <BodyMapPanel muscleIntensity={muscleIntensity} />
          <section className="panel">
            <h2>오늘 자극 부위</h2>
            <div className="muscle-list">
              {Object.entries(muscleIntensity).length === 0 && <p className="muted">아직 선택된 운동이 없습니다.</p>}
              {Object.entries(muscleIntensity).map(([muscle, value]) => (
                <div className="muscle-row" key={muscle}>
                  <span>{muscleKorean[muscle] || muscle}</span>
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
            <h2>운동 라이브러리</h2>
            <input className="search" value={libraryQuery} onChange={(e) => setLibraryQuery(e.target.value)} placeholder="운동명, 부위, 카테고리 검색" />
          </div>
          <div className="library-grid">
            {filteredLibrary.map((exercise) => (
              <article className="library-card" key={exercise.id}>
                <h3>{exercise.name}</h3>
                <p className="tag">{exercise.category}</p>
                <p>주 타겟: {exercise.primaryMuscles.map((m) => muscleKorean[m] || m).join(', ')}</p>
                <p className="muted">{exercise.defaultSets}세트 × {exercise.defaultReps} · {exercise.equipment}</p>
                <p>{exercise.description}</p>
              </article>
            ))}
          </div>
        </main>
      )}

      {activeTab === 'history' && (
        <main className="panel">
          <h2>운동 기록</h2>
          {history.length === 0 && <p className="muted">아직 저장된 운동 기록이 없습니다. 오늘 운동을 저장해보세요.</p>}
          <div className="history-list">
            {history.map((log) => (
              <article className="history-card" key={log.id}>
                <div className="section-title-row">
                  <div>
                    <h3>{log.date} · {labels.focus[log.focus] || log.focus}</h3>
                    <p className="muted">완료율 {log.completionRate}% · 예상 {log.totalEstimatedCalories} kcal</p>
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
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {Object.entries(options).map(([key, text]) => (
          <option value={key} key={key}>{text}</option>
        ))}
      </select>
    </label>
  );
}

function BodyMapPanel({ muscleIntensity }) {
  const active = (muscle) => muscleIntensity[muscle] ? 'body-part active' : 'body-part';
  return (
    <section className="panel body-panel">
      <h2>신체 부위 맵</h2>
      <p className="muted">주 타겟과 보조 타겟을 단순 SVG로 표시합니다.</p>
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
