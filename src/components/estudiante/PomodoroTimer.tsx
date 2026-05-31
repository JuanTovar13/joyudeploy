import React from 'react'
import type { TimerStatus, SessionType } from '../../types'
import '../../styles/PomodoroTimer.css'

interface PomodoroTimerProps {
  timeLeft: number
  status: TimerStatus
  sessionType: SessionType
  currentSession: number
  totalDuration: number
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * PomodoroTimer - muestra el temporizador y controles
 * React.memo evita renderizados innecesarios
 */

// El temporizador cambia cada segundo.
// React.memo evita que TaskList se actualice constantemente.

const PomodoroTimer = React.memo(
  ({
    timeLeft,
    status,
    sessionType,
    currentSession,
    totalDuration,
    onStart,
    onPause,
    onReset,
    onSkip,
  }: PomodoroTimerProps) => {
    const circumference = 2 * Math.PI * 80
    const safeTotal = totalDuration > 0 ? totalDuration : 1
    const strokeDashoffset = circumference - (timeLeft / safeTotal) * circumference
    const strokeColor =
      sessionType === 'work'
        ? '#3B28CC'
        : sessionType === 'short-break'
          ? '#4CAF50'
          : '#FF9800'

    const sessionLabel =
      sessionType === 'work'
        ? 'Focus Time'
        : sessionType === 'short-break'
          ? 'Short Break'
          : 'Long Break'

    return (
      <section aria-label="Pomodoro Timer">
        <div
          role="timer"
          aria-live="assertive"
          aria-label={`${formatTime(timeLeft)} remaining`}
          className="sr-only"
        >
          {formatTime(timeLeft)} remaining - {sessionType}
        </div>

        <div className="pomodoro-container">
          <div className="pomodoro-ring-wrapper">
            <svg viewBox="0 0 200 200" width="200" height="200">
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="#E5E7EB"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke={strokeColor}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center',
                  transition: 'stroke-dashoffset 0.5s ease',
                }}
              />
            </svg>
            <span className="pomodoro-time-text">{formatTime(timeLeft)}</span>
          </div>

          <p className="pomodoro-session-label">{sessionLabel}</p>
          <p className="pomodoro-session-counter">Session {currentSession}</p>

          <div className="pomodoro-buttons">
            {status === 'running' ? (
              <button
                type="button"
                className="pomodoro-btn-primary"
                onClick={onPause}
                aria-label="Pause timer"
              >
                Pause
              </button>
            ) : (
              <button
                type="button"
                className="pomodoro-btn-primary"
                onClick={onStart}
                aria-label="Start focus session"
              >
                Start
              </button>
            )}
            <button
              type="button"
              className="pomodoro-btn-secondary"
              onClick={onReset}
              aria-label="Reset timer"
            >
              Reset
            </button>
            <button
              type="button"
              className="pomodoro-btn-secondary"
              onClick={onSkip}
              aria-label="Skip to next session"
            >
              Skip
            </button>
          </div>
        </div>
      </section>
    )
  }
)

export default PomodoroTimer
