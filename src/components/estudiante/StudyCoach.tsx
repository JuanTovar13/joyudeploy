import { useState, useMemo, useEffect } from 'react'
import { useAppSelector } from '../../store/hooks'
import { useAppDispatch } from '../../store/hooks'
import { resetWorkSkips } from '../../store/slices/studyPlannerSlice'
import { getStudyAnalysis, type StudyAnalysis } from '../../lib/groqCoach'
import '../../styles/StudyCoach.css'

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ emoji, label, value, sub }: {
  emoji: string
  label: string
  value: string | number
  sub?: string
}) => (
  <div className="sc-stat">
    <span className="sc-stat__emoji">{emoji}</span>
    <div className="sc-stat__body">
      <span className="sc-stat__value">{value}</span>
      <span className="sc-stat__label">{label}</span>
      {sub && <span className="sc-stat__sub">{sub}</span>}
    </div>
  </div>
)

// ── Main component ────────────────────────────────────────────────────────────
export const StudyCoach = () => {
  const dispatch = useAppDispatch()
  const {
    tasks,
    todaySessionsCompleted,
    totalFocusTimeToday,
    completedPomodorosToday,
    consecutiveWorkSkips,
    activeTaskTitle,
  } = useAppSelector(s => s.studyPlanner)

  const [analysis, setAnalysis]   = useState<StudyAnalysis | null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [helpDismissed, setHelpDismissed] = useState(false)

  // Re-show the prompt when a new skip cycle begins (counter reset to 0 then rises again)
  useEffect(() => {
    if (consecutiveWorkSkips === 0) setHelpDismissed(false)
  }, [consecutiveWorkSkips])

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalTasks        = tasks.length
  const completedTasks    = tasks.filter(t => t.completed).length
  const pendingTasks      = tasks.filter(t => !t.completed)
  const totalGoalPomodoros = tasks.reduce((sum, t) => sum + (t.estimated_pomodoros ?? 0), 0)

  const completionPct = totalTasks === 0 ? 0
    : Math.round((completedTasks / totalTasks) * 100)

  // Context object sent to Groq
  const studyContext = useMemo(() => ({
    totalTasks,
    completedTasks,
    pendingTasks: pendingTasks.map(t => ({
      title:                t.title,
      estimated_pomodoros:  t.estimated_pomodoros,
      completed_pomodoros:  t.completed_pomodoros,
    })),
    totalGoalPomodoros,
    completedPomodorosToday,
    focusMinutesToday:    totalFocusTimeToday,
    sessionsToday:        todaySessionsCompleted,
    consecutiveWorkSkips,
    skippedTaskTitle:     activeTaskTitle,
  }), [tasks, completedPomodorosToday, totalFocusTimeToday, todaySessionsCompleted,
       consecutiveWorkSkips, activeTaskTitle])

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getStudyAnalysis(studyContext)
      setAnalysis(result)
    } catch {
      setError('Could not generate the analysis. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="study-coach">
      <h2 className="sc-title">🤖 AI Coach</h2>

      {/* ── Stats grid ── */}
      <div className="sc-stats-grid">
        <StatCard
          emoji="✅"
          label="Tasks"
          value={`${completedTasks} / ${totalTasks}`}
          sub={`${completionPct}% complete`}
        />
        <StatCard
          emoji="🍅"
          label="Pomodoros today"
          value={completedPomodorosToday}
          sub="sessions today"
        />
        <StatCard
          emoji="⏱️"
          label="Focus minutes"
          value={totalFocusTimeToday}
          sub={`${todaySessionsCompleted} sessions`}
        />
        <StatCard
          emoji="📋"
          label="Pending"
          value={pendingTasks.length}
          sub={pendingTasks.length === 0 ? 'All done!' : `${pendingTasks.length} remaining`}
        />
      </div>

      {/* ── Skip help prompt ── */}
      {consecutiveWorkSkips >= 2 && !helpDismissed && (
        <div className="sc-skip-alert">
          <p className="sc-skip-alert__text">
            ⚠️ You've skipped <strong>{consecutiveWorkSkips} times in a row</strong>
            {activeTaskTitle ? <> on <em>"{activeTaskTitle}"</em></> : ' during focus time'}.
            {' '}Do you need help with this task?
          </p>
          <div className="sc-skip-alert__actions">
            <button
              className="sc-skip-btn sc-skip-btn--help"
              onClick={() => {
                setHelpDismissed(true)
                dispatch(resetWorkSkips())
                void handleAnalyze()
              }}
            >
              Yes, analyze my situation
            </button>
            <button
              className="sc-skip-btn sc-skip-btn--ok"
              onClick={() => { setHelpDismissed(true); dispatch(resetWorkSkips()) }}
            >
              I'm fine, keep going
            </button>
          </div>
        </div>
      )}

      {/* ── Analyze button ── */}
      <button
        className={`sc-analyze-btn${loading ? ' sc-analyze-btn--loading' : ''}`}
        onClick={() => void handleAnalyze()}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="sc-spinner" />
            Analyzing your progress…
          </>
        ) : analysis ? (
          '🔄 Refresh analysis'
        ) : (
          '✨ Analyze my current state'
        )}
      </button>

      {/* ── Error ── */}
      {error && <p className="sc-error">{error}</p>}

      {/* ── Analysis result ── */}
      {analysis && !loading && (
        <div className="sc-analysis">
          <div className="sc-analysis__card sc-analysis__card--diagnosis">
            <span className="sc-analysis__icon">🧠</span>
            <div>
              <p className="sc-analysis__heading">Current state</p>
              <p className="sc-analysis__text">{analysis.diagnosis}</p>
            </div>
          </div>

          <div className="sc-analysis__card sc-analysis__card--highlight">
            <span className="sc-analysis__icon">⭐</span>
            <div>
              <p className="sc-analysis__heading">What you're doing well</p>
              <p className="sc-analysis__text">{analysis.highlight}</p>
            </div>
          </div>

          <div className="sc-analysis__card sc-analysis__card--alert">
            <span className="sc-analysis__icon">⚡</span>
            <div>
              <p className="sc-analysis__heading">Watch out</p>
              <p className="sc-analysis__text">{analysis.alert}</p>
            </div>
          </div>

          <div className="sc-analysis__card sc-analysis__card--action">
            <span className="sc-analysis__icon">🎯</span>
            <div>
              <p className="sc-analysis__heading">Next step</p>
              <p className="sc-analysis__text">{analysis.next_action}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
