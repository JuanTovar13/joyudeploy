import React, { useState, useRef } from 'react'

interface CountdownTimerDisplayProps {
  timeLeft: number
  running: boolean
  finished: boolean
  formatTime: (s: number) => string
  totalSeconds: number
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSetSeconds: (secs: number) => void
}

const CountdownTimerDisplay = React.memo(({
  timeLeft,
  running,
  finished,
  formatTime,
  totalSeconds,
  onStart,
  onPause,
  onReset,
  onSetSeconds,
}: CountdownTimerDisplayProps) => {
  const circumference = 2 * Math.PI * 80
  const safeTotal = totalSeconds > 0 ? totalSeconds : 1
  const strokeDashoffset = circumference - (timeLeft / safeTotal) * circumference

  const [minsInput, setMinsInput] = useState('00')
  const [secsInput, setSecsInput] = useState('00')
  const secsRef = useRef<HTMLInputElement>(null)

  const applyTime = () => {
    const mins = Math.max(0, parseInt(minsInput || '0', 10))
    const secs = Math.max(0, Math.min(59, parseInt(secsInput || '0', 10)))
    const total = mins * 60 + secs
    if (total > 0) {
      onSetSeconds(total)
      setMinsInput(String(mins).padStart(2, '0'))
      setSecsInput(String(secs).padStart(2, '0'))
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
      <p className="pomodoro-session-label">Timer</p>
      {!running && (
        <div className="countdown-timeinput-row">
          <input
            className="countdown-timeinput"
            type="number"
            min={0}
            max={99}
            value={minsInput}
            onChange={(e) => setMinsInput(e.target.value)}
            onBlur={applyTime}
            onKeyDown={(e) => { if (e.key === 'Enter') { applyTime(); secsRef.current?.focus() } if (e.key === 'Tab') { e.preventDefault(); secsRef.current?.focus() } }}
            aria-label="Minutes"
          />
          <span className="countdown-timeinput-sep">:</span>
          <input
            ref={secsRef}
            className="countdown-timeinput"
            type="number"
            min={0}
            max={59}
            value={secsInput}
            onChange={(e) => setSecsInput(e.target.value)}
            onBlur={applyTime}
            onKeyDown={(e) => { if (e.key === 'Enter') applyTime() }}
            aria-label="Seconds"
          />
          <span className="countdown-input-hint">mm : ss</span>
        </div>
      )}
      <div className="pomodoro-buttons">
        {running ? (
          <button type="button" className="pomodoro-btn-primary" onClick={onPause} aria-label="Pause timer">Pause</button>
        ) : (
          <button type="button" className="pomodoro-btn-primary" onClick={onStart} aria-label="Start timer">Start</button>
        )}
        <button type="button" className="pomodoro-btn-secondary" onClick={onReset} aria-label="Reset timer">Reset</button>
      </div>
    </section>
  )
})

export default CountdownTimerDisplay
