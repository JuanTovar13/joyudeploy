import React from 'react'

interface CountdownTimerDisplayProps {
  inputMinutes: number
  timeLeft: number
  running: boolean
  finished: boolean
  formatTime: (s: number) => string
  totalSeconds: number
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSetMinutes: (mins: number) => void
}

const CountdownTimerDisplay = React.memo(({
  inputMinutes,
  timeLeft,
  running,
  finished,
  formatTime,
  totalSeconds,
  onStart,
  onPause,
  onReset,
  onSetMinutes,
}: CountdownTimerDisplayProps) => {
  const circumference = 2 * Math.PI * 80
  const safeTotal = totalSeconds > 0 ? totalSeconds : 1
  const strokeDashoffset = circumference - (timeLeft / safeTotal) * circumference

  return (
    <section aria-label="Countdown Timer" className="pomodoro-container">
      <div role="timer" aria-live="assertive" aria-label={`${formatTime(timeLeft)} remaining`} className="sr-only">
        {formatTime(timeLeft)} remaining
      </div>
      <div className="pomodoro-ring-wrapper">
        <svg viewBox="0 0 200 200" width="200" height="200">
          <circle cx="100" cy="100" r="80" stroke="#E5E7EB" strokeWidth="8" fill="none" />
          <circle
            cx="100" cy="100" r="80"
            stroke={finished ? '#4CAF50' : '#FF9800'}
            strokeWidth="8" fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <span className="pomodoro-time-text">{formatTime(timeLeft)}</span>
      </div>
      <p className="pomodoro-session-label">{finished ? '🎉 Done!' : 'Timer'}</p>
      {!running && !finished && (
        <div className="pomodoro-buttons">
          <button type="button" className="pomodoro-btn-secondary" onClick={() => onSetMinutes(inputMinutes - 5)} aria-label="Decrease 5 minutes">−5</button>
          <span style={{ fontFamily: 'Fredoka', fontSize: 18, color: '#262688' }}>{inputMinutes} min</span>
          <button type="button" className="pomodoro-btn-secondary" onClick={() => onSetMinutes(inputMinutes + 5)} aria-label="Increase 5 minutes">+5</button>
        </div>
      )}
      <div className="pomodoro-buttons">
        {running ? (
          <button type="button" className="pomodoro-btn-primary" onClick={onPause} aria-label="Pause timer">Pause</button>
        ) : (
          <button type="button" className="pomodoro-btn-primary" onClick={onStart} aria-label="Start timer" disabled={finished}>Start</button>
        )}
        <button type="button" className="pomodoro-btn-secondary" onClick={onReset} aria-label="Reset timer">Reset</button>
      </div>
    </section>
  )
})

export default CountdownTimerDisplay
