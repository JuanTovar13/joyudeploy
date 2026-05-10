import '../styles/StudyPlanner.css'
import { usePomodoro } from '../hooks/usePomodoro'
import PomodoroTimer from '../components/PomodoroTimer'
import TaskList from '../components/TaskList'

/**
 * StudyPlanner - página principal con temporizador Pomodoro y tareas
 *
 * Optimización:
 * - PomodoroTimer solo se actualiza cuando cambia el temporizador
 * - TaskList solo se actualiza cuando cambian las tareas
 * - useCallback mantiene referencias estables
 */

export function StudyPlanner() {
  const {
    timeLeft,
    status,
    sessionType,
    currentSession,
    totalDuration,
    start,
    pause,
    reset,
    skip,
  } = usePomodoro()

  return (
    <>
      <a
        href="#main-content"
        className="sr-only"
        style={{ position: 'absolute' }}
        onFocus={(e) => {
          e.currentTarget.style.clip = 'auto'
        }}
      >
        Skip to main content
      </a>
      <main
        id="main-content"
        role="main"
        className="studyplanner-screen"
      >
        <h1 className="studyplanner-title">Study Planner</h1>
        <div className="studyplanner-content">
          <PomodoroTimer
            timeLeft={timeLeft}
            status={status}
            sessionType={sessionType}
            currentSession={currentSession}
            totalDuration={totalDuration}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onSkip={skip}
          />
          <TaskList />
        </div>
      </main>
    </>
  )
}
