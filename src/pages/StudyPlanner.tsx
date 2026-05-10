import '../styles/StudyPlanner.css'
import { usePomodoro } from '../hooks/usePomodoro'
import PomodoroTimer from '../components/PomodoroTimer'
import TaskList from '../components/TaskList'

/**
 * StudyPlanner - main page combining Pomodoro timer and study task list
 *
 * Performance strategy:
 * - PomodoroTimer wrapped in React.memo → only re-renders when timer props change
 * - TaskList wrapped in React.memo → only re-renders when tasks change
 * - useCallback in usePomodoro → handler references stay stable across renders
 * - Result: timer ticking every second does NOT cause TaskList to re-render,
 *   and adding or deleting tasks does NOT cause PomodoroTimer to re-render
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
