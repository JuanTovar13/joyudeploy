import '../styles/StudyPlanner.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { usePomodoro } from '../hooks/usePomodoro'
import PomodoroTimer from '../components/estudiante/PomodoroTimer'
import TaskList from '../components/estudiante/TaskList'
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

const getWeatherEmoji = (code: number): string => {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 49) return '🌫️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌦️'
  if (code <= 99) return '⛈️'
  return '🌡️'
}

export const StudyPlanner = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { todaySessionsCompleted, totalFocusTimeToday } = useSelector(
    (state: RootState) => state.studyPlanner
  )
  const activeTaskTitle = useSelector(
    (state: RootState) => state.studyPlanner.activeTaskTitle
  )
  const activeTaskId = useSelector((state: RootState) => state.studyPlanner.activeTaskId)

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

  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  })
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null)
  const [weatherError, setWeatherError] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      setWeatherError(true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          )
          const data = await res.json()
          setWeather({
            temp: Math.round(data.current_weather.temperature),
            code: data.current_weather.weathercode,
          })
        } catch {
          setWeatherError(true)
        }
      },
      () => setWeatherError(true)
    )
  }, [])

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
        const completedRaw = (data as { completed_pomodoros?: unknown } | null)
          ?.completed_pomodoros
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
      JSON.stringify({ todaySessionsCompleted, totalFocusTimeToday })
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
      <main id="main-content" role="main" className="studyplanner-screen">
        <button className="studyplanner-back-btn" onClick={() => navigate(-1)}>
          ‹
        </button>
        <h1 className="studyplanner-title">Study Planner</h1>
        <div className="studyplanner-info-row">
          <div className="studyplanner-clock" aria-label={`Current time: ${currentTime}`}>
            🕐 {currentTime}
          </div>
        </div>
        {activeTaskTitle && (
          <p className="studyplanner-active-task">Trabajando en: {activeTaskTitle}</p>
        )}
        <p className="studyplanner-stats">
          Hoy: {todaySessionsCompleted} sesiones · {totalFocusTimeToday} min concentrado
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
