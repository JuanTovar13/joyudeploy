import { useState, useMemo, useEffect } from 'react'
import { useAppSelector } from '../../store/hooks'
import { useAppDispatch } from '../../store/hooks'
import { resetWorkSkips } from '../../store/slices/studyPlannerSlice'
import { getStudyAnalysis, type StudyAnalysis } from '../../lib/groqClient'
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

  const pomodoroPct = totalGoalPomodoros === 0 ? 0
    : Math.min(Math.round((completedPomodorosToday / totalGoalPomodoros) * 100), 100)

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
      setError('No se pudo generar el análisis. Inténtalo de nuevo.')
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
          label="Tareas"
          value={`${completedTasks} / ${totalTasks}`}
          sub={`${completionPct}% completado`}
        />
        <StatCard
          emoji="🍅"
          label="Pomodoros hoy"
          value={`${completedPomodorosToday} / ${totalGoalPomodoros}`}
          sub={`${pomodoroPct}% del objetivo`}
        />
        <StatCard
          emoji="⏱️"
          label="Minutos enfocado"
          value={totalFocusTimeToday}
          sub={`${todaySessionsCompleted} sesiones`}
        />
        <StatCard
          emoji="📋"
          label="Pendientes"
          value={pendingTasks.length}
          sub={pendingTasks.length === 0 ? '¡Todo listo!' : `${pendingTasks.length} por hacer`}
        />
      </div>

      {/* ── Skip help prompt ── */}
      {consecutiveWorkSkips >= 2 && !helpDismissed && (
        <div className="sc-skip-alert">
          <p className="sc-skip-alert__text">
            ⚠️ Llevas <strong>{consecutiveWorkSkips} skips seguidos</strong>
            {activeTaskTitle ? <> en <em>"{activeTaskTitle}"</em></> : ' en el focus time'}.
            {' '}¿Necesitas ayuda con esta tarea?
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
              Sí, analiza mi situación
            </button>
            <button
              className="sc-skip-btn sc-skip-btn--ok"
              onClick={() => { setHelpDismissed(true); dispatch(resetWorkSkips()) }}
            >
              Estoy bien, continúo
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
            Analizando tu progreso…
          </>
        ) : analysis ? (
          '🔄 Actualizar análisis'
        ) : (
          '✨ Analizar mi estado actual'
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
              <p className="sc-analysis__heading">Estado actual</p>
              <p className="sc-analysis__text">{analysis.diagnosis}</p>
            </div>
          </div>

          <div className="sc-analysis__card sc-analysis__card--highlight">
            <span className="sc-analysis__icon">⭐</span>
            <div>
              <p className="sc-analysis__heading">Lo que estás haciendo bien</p>
              <p className="sc-analysis__text">{analysis.highlight}</p>
            </div>
          </div>

          <div className="sc-analysis__card sc-analysis__card--alert">
            <span className="sc-analysis__icon">⚡</span>
            <div>
              <p className="sc-analysis__heading">Atención</p>
              <p className="sc-analysis__text">{analysis.alert}</p>
            </div>
          </div>

          <div className="sc-analysis__card sc-analysis__card--action">
            <span className="sc-analysis__icon">🎯</span>
            <div>
              <p className="sc-analysis__heading">Siguiente paso</p>
              <p className="sc-analysis__text">{analysis.next_action}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
