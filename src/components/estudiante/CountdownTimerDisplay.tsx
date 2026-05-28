import React, { useState } from 'react'

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
  const [inputValue, setInputValue] = useState(String(inputMinutes))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputBlur = () => {
    const parsed = parseFloat(inputValue)
    if (!isNaN(parsed) && parsed > 0) {
      onSetMinutes(parsed)
      setInputValue(String(parsed))
    } else {
      setInputValue(String(inputMinutes))
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parsed = parseFloat(inputValue)
      if (!isNaN(parsed) && parsed > 0) {
        onSetMinutes(parsed)
        setInputValue(String(parsed))
      } else {
        setInputValue(String(inputMinutes))
      }
    }
  }

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
        <div className="countdown-input-row">
          <label htmlFor="timer-minutes" className="countdown-input-label">
            Minutes:
          </label>
          <input
            id="timer-minutes"
            type="number"
            className="countdown-input"
            value={inputValue}
            min={0.1}
            max={180}
            step={0.5}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            aria-label="Set timer duration in minutes"
          />
          <span className="countdown-input-hint">e.g. 0.5 = 30s, 4.5 = 4m30s</span>
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
