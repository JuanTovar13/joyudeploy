import '../styles/StudyPlanner.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { usePomodoro } from '../hooks/usePomodoro'
import PomodoroTimer from '../components/estudiante/PomodoroTimer'
import TaskList from '../components/estudiante/TaskList'
import StopwatchDisplay from '../components/estudiante/StopwatchDisplay'
import CountdownTimerDisplay from '../components/estudiante/CountdownTimerDisplay'
import MiniJournal from '../components/estudiante/MiniJournal'
import MusicPlayer from '../components/estudiante/MusicPlayer'
import { useStopwatch } from '../hooks/useStopwatch'
import { useCountdownTimer } from '../hooks/useCountdownTimer'
import { useAlarmSound } from '../hooks/useAlarmSound'
import type { RootState, AppDispatch } from '../store'
import { incrementSessions, addFocusTime, clearActiveTask, incrementCompletedPomodoros, resetConcentration } from '../store/slices/studyPlannerSlice'
import { supabase } from '../lib/supabaseClient'

/**
 * StudyPlanner - página principal con temporizador Pomodoro y tareas
 *
 * Optimización:
 * - PomodoroTimer solo se actualiza cuando cambia el temporizador
 * - TaskList solo se actualiza cuando cambian las tareas
 * - useCallback mantiene referencias estables
 */

//Luego cambiar el emoji por el clima por imagenes de la mascota de la app

type TimerMode = 'pomodoro' | 'timer' | 'stopwatch'

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
  const tasks = useSelector((state: RootState) => state.studyPlanner.tasks)
  const completedPomodorosToday = useSelector(
    (state: RootState) => state.studyPlanner.completedPomodorosToday
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

  const { playAlarm } = useAlarmSound()

  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro')

  const stopwatch = useStopwatch()
  const countdown = useCountdownTimer(playAlarm)

  const totalGoalPomodoros = tasks.reduce(
    (sum, t) => sum + (t.estimated_pomodoros ?? 0),
    0
  )
  const concentrationPercentage =
    tasks.length === 0 || totalGoalPomodoros === 0
      ? 0
      : Math.min(Math.round((completedPomodorosToday / totalGoalPomodoros) * 100), 100)

  const getConcentrationColor = (pct: number): string => {
    if (pct <= 33) return '#FF9800'
    if (pct <= 66) return '#3B28CC'
    return '#4CAF50'
  }

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
          if (!res.ok) throw new Error('Weather fetch failed')
          const data = await res.json()
          const current = data?.current_weather
          if (typeof current?.temperature === 'number' && typeof current?.weathercode === 'number') {
            setWeather({
              temp: Math.round(current.temperature),
              code: current.weathercode,
            })
          } else {
            setWeatherError(true)
          }
        } catch {
          setWeatherError(true)
        }
      },
      () => setWeatherError(true)
    )
  }, [])

  useEffect(() => {
    if (currentSession > 1) {
      playAlarm()
    }
    if (currentSession > 1 && activeTaskId) {
      dispatch(incrementSessions())
      dispatch(addFocusTime(25))
      dispatch(incrementCompletedPomodoros())
      void (async () => {
        const { data } = await supabase
          .from('study_tasks')
          .select('completed_pomodoros')
          .eq('id', activeTaskId)
          .single()
        const completedRaw = (data as { completed_pomodoros?: unknown } | null)
          ?.completed_pomodoros
        if (typeof completedRaw === 'number') {
          const newCompleted = completedRaw + 1
          await supabase
            .from('study_tasks')
            .update({ completed_pomodoros: newCompleted })
            .eq('id', activeTaskId)
          const activeTask = tasks.find((t) => t.id === activeTaskId)
          if (activeTask && newCompleted >= activeTask.estimated_pomodoros) {
            dispatch(clearActiveTask())
          }
        }
      })()
    } else if (currentSession > 1) {
      dispatch(incrementSessions())
      dispatch(addFocusTime(25))
      dispatch(incrementCompletedPomodoros())
    }
  }, [currentSession, dispatch, activeTaskId, playAlarm])

  useEffect(() => {
    if (sessionType === 'work' && status === 'idle') {
      playAlarm()
    }
  }, [sessionType])

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
        <button className="studyplanner-back-btn" onClick={() => navigate('/home')}>
          ‹
        </button>
        <h1 className="studyplanner-title">Study Planner</h1>
        <div className="studyplanner-info-row">
          <div className="studyplanner-clock" aria-label={`Current time: ${currentTime}`}>
            🕐 {currentTime}
          </div>
          {weather && (
            <div
              className="studyplanner-weather"
              aria-label={`Current temperature: ${weather.temp} degrees`}
            >
              {getWeatherEmoji(weather.code)} {weather.temp}°C
            </div>
          )}
          {weatherError && (
            <div className="studyplanner-weather" aria-label="Weather unavailable">
              🌡️ Weather unavailable
            </div>
          )}
        </div>
        <div className="studyplanner-concentration">
          <div className="studyplanner-concentration-header">
            <span>Concentration Level</span>
            <span>{concentrationPercentage}%</span>
          </div>
          <div
            className="studyplanner-concentration-bar-bg"
            role="progressbar"
            aria-valuenow={concentrationPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Concentration level progress"
          >
            <div
              className="studyplanner-concentration-bar-fill"
              style={{
                width: `${concentrationPercentage}%`,
                backgroundColor: getConcentrationColor(concentrationPercentage),
              }}
            />
          </div>
        </div>
        {activeTaskTitle && (
          <p className="studyplanner-active-task">Trabajando en: {activeTaskTitle}</p>
        )}
        <p className="studyplanner-stats">
          Hoy: {todaySessionsCompleted} sesiones · {totalFocusTimeToday} min concentrado
        </p>
        <div className="studyplanner-timer-tabs">
          <button
            type="button"
            className={`studyplanner-tab-btn${timerMode === 'pomodoro' ? ' active' : ''}`}
            onClick={() => setTimerMode('pomodoro')}
            aria-label="Pomodoro mode"
          >
            Pomodoro
          </button>
          <button
            type="button"
            className={`studyplanner-tab-btn${timerMode === 'timer' ? ' active' : ''}`}
            onClick={() => setTimerMode('timer')}
            aria-label="Timer mode"
          >
            Timer
          </button>
          <button
            type="button"
            className={`studyplanner-tab-btn${timerMode === 'stopwatch' ? ' active' : ''}`}
            onClick={() => setTimerMode('stopwatch')}
            aria-label="Stopwatch mode"
          >
            Stopwatch
          </button>
        </div>
        <div className="studyplanner-content">
          {timerMode === 'pomodoro' && (
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
          )}
          {timerMode === 'stopwatch' && (
            <StopwatchDisplay
              elapsed={stopwatch.elapsed}
              running={stopwatch.running}
              formatTime={stopwatch.formatTime}
              onStart={stopwatch.start}
              onPause={stopwatch.pause}
              onReset={stopwatch.reset}
            />
          )}
          {timerMode === 'timer' && (
            <CountdownTimerDisplay
              inputMinutes={countdown.inputMinutes}
              timeLeft={countdown.timeLeft}
              running={countdown.running}
              finished={countdown.finished}
              formatTime={countdown.formatTime}
              totalSeconds={countdown.inputMinutes * 60}
              onStart={countdown.start}
              onPause={countdown.pause}
              onReset={countdown.reset}
              onSetMinutes={countdown.handleSetMinutes}
            />
          )}
          <TaskList onStartPomodoro={() => {
            setTimerMode('pomodoro')
            start()
          }} />
        </div>
        <div className="studyplanner-bottom-row">
          <MiniJournal />
          <MusicPlayer />
        </div>
      </main>
    </>
  )
}
