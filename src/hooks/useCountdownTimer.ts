import { useState, useRef, useCallback, useEffect } from 'react'

export const useCountdownTimer = (onFinish?: () => void) => {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onFinishRef = useRef(onFinish)

  useEffect(() => {
    onFinishRef.current = onFinish
  }, [onFinish])

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
          if (onFinishRef.current) setTimeout(() => onFinishRef.current!(), 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [running, timeLeft])

  const pause = useCallback(() => {
    setRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    setRunning(false)
    setFinished(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setTimeLeft(totalSeconds)
  }, [totalSeconds])

  const handleSetSeconds = useCallback((secs: number) => {
    const clamped = Math.max(1, Math.min(10800, secs))
    setTotalSeconds(clamped)
    setTimeLeft(clamped)
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

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return {
    totalSeconds,
    timeLeft,
    running,
    finished,
    start,
    pause,
    reset,
    handleSetSeconds,
    formatTime,
  }
}
