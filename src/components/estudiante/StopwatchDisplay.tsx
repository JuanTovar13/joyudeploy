import React from 'react'

interface StopwatchDisplayProps {
  elapsed: number
  running: boolean
  formatTime: (s: number) => string
  onStart: () => void
  onPause: () => void
  onReset: () => void
}

const StopwatchDisplay = React.memo(({
  elapsed,
  running,
  formatTime,
  onStart,
  onPause,
  onReset,
}: StopwatchDisplayProps) => {
  return (
    <section aria-label="Stopwatch" className="pomodoro-container">
      <div
        role="timer"
        aria-live="polite"
        aria-label={`Elapsed time: ${formatTime(elapsed)}`}
        className="sr-only"
      >
        {formatTime(elapsed)}
      </div>
      <div className="pomodoro-ring-wrapper">
        <svg viewBox="0 0 200 200" width="200" height="200">
          <circle cx="100" cy="100" r="80" stroke="#E5E7EB" strokeWidth="8" fill="none" />
          <circle
            cx="100" cy="100" r="80"
            stroke="#3B28CC" strokeWidth="8" fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 80}
            strokeDashoffset={running ? 0 : 2 * Math.PI * 80}
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <span className="pomodoro-time-text">{formatTime(elapsed)}</span>
      </div>
      <p className="pomodoro-session-label">Stopwatch</p>
      <div className="pomodoro-buttons">
        {running ? (
          <button type="button" className="pomodoro-btn-primary" onClick={onPause} aria-label="Pause stopwatch">Pause</button>
        ) : (
          <button type="button" className="pomodoro-btn-primary" onClick={onStart} aria-label="Start stopwatch">Start</button>
        )}
        <button type="button" className="pomodoro-btn-secondary" onClick={onReset} aria-label="Reset stopwatch">Reset</button>
      </div>
    </section>
  )
})

export default StopwatchDisplay
