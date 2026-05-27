import '../styles/StudyPlanner.css'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { usePomodoro } from '../hooks/usePomodoro'
import PomodoroTimer from '../components/PomodoroTimer'
import TaskList from '../components/TaskList'
import type { RootState, AppDispatch } from '../store'
import { incrementSessions, addFocusTime } from '../store/slices/studyPlannerSlice'
import { supabase } from '../lib/supabaseClient'

/**
 * StudyPlanner - página principal con temporizador Pomodoro y tareas
 *
 * Optimización:
 * - PomodoroTimer solo se actualiza cuando cambia el temporizador
 * - TaskList solo se actualiza cuando cambian las tareas
 * - useCallback mantiene referencias estables
 */

export const StudyPlanner = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { todaySessionsCompleted, totalFocusTimeToday } = useSelector(
    (state: RootState) => state.studyPlanner,
  )
  const activeTaskTitle = useSelector(
    (state: RootState) => state.studyPlanner.activeTaskTitle,
  )
  const activeTaskId = useSelector(
    (state: RootState) => state.studyPlanner.activeTaskId,
  )

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

  useEffect(() => {
    if (currentSession > 1 && activeTaskId) {
      dispatch(incrementSessions())
      dispatch(addFocusTime(25))
      void (async () => {
        const { data } = await supabase
          .from('study_tasks')
          .select('completed_pomodoros')
          .eq('id', activeTaskId)
          .single()
        const completedRaw =
          (data as { completed_pomodoros?: unknown } | null)?.completed_pomodoros
        if (typeof completedRaw === 'number') {
          await supabase
            .from('study_tasks')
            .update({ completed_pomodoros: completedRaw + 1 })
            .eq('id', activeTaskId)
        }
      })()
    } else if (currentSession > 1) {
      dispatch(incrementSessions())
      dispatch(addFocusTime(25))
    }
  }, [currentSession, dispatch, activeTaskId])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(
      `joyu_study_sessions_${today}`,
      JSON.stringify({ todaySessionsCompleted, totalFocusTimeToday }),
    )
  }, [todaySessionsCompleted, totalFocusTimeToday])

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
        <button className="studyplanner-back-btn" onClick={() => navigate(-1)}>
          ‹
        </button>
        <h1 className="studyplanner-title">Study Planner</h1>
        {activeTaskTitle && (
          <p className="studyplanner-active-task">
            Trabajando en: {activeTaskTitle}
          </p>
        )}
        <p className="studyplanner-stats">
          Hoy: {todaySessionsCompleted} sesiones · {totalFocusTimeToday} min
          concentrado
        </p>
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
