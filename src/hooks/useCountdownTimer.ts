import { useState, useRef, useCallback } from 'react'

export const useCountdownTimer = (onFinish?: () => void) => {
  const [inputMinutes, setInputMinutes] = useState(25)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    if (running || timeLeft <= 0) return
    setFinished(false)
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          setRunning(false)
          setFinished(true)
          if (onFinish) queueMicrotask(() => onFinish())
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [running, timeLeft])

  const pause = useCallback(() => {
    setRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const reset = useCallback(() => {
    setRunning(false)
    setFinished(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimeLeft(inputMinutes * 60)
  }, [inputMinutes])

  const handleSetMinutes = useCallback((mins: number) => {
    const clamped = Math.max(0.1, Math.min(180, mins))
    const rounded = Math.round(clamped * 10) / 10
    setInputMinutes(rounded)
    setTimeLeft(Math.round(rounded * 60))
    setRunning(false)
    setFinished(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return {
    inputMinutes,
    timeLeft,
    running,
    finished,
    start,
    pause,
    reset,
    handleSetMinutes,
    formatTime,
  }
}
