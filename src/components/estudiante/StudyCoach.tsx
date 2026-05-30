import { useState, useMemo } from 'react'
import { useAppSelector } from '../../store/hooks'
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
  const { tasks, todaySessionsCompleted, totalFocusTimeToday, completedPomodorosToday } =
    useAppSelector(s => s.studyPlanner)

  const [analysis, setAnalysis]   = useState<StudyAnalysis | null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

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
    focusMinutesToday: totalFocusTimeToday,
    sessionsToday:     todaySessionsCompleted,
  }), [tasks, completedPomodorosToday, totalFocusTimeToday, todaySessionsCompleted])

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
