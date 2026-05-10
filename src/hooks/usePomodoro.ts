import { useCallback, useEffect, useState } from 'react'
import {
  type TimerStatus,
  type SessionType,
  type PomodoroConfig,
  DEFAULT_CONFIG,
} from '../types'

/**
 * usePomodoro - hook personalizado que maneja el estado y lógica del temporizador Pomodoro
 * Flujo de sesiones: trabajo → descanso corto → trabajo → ... → descanso largo cada 4 sesiones
 * Todos los handlers usan useCallback para mantener referencias estables
 * @param config - configuración opcional para cambiar las duraciones por defecto
 */
export function usePomodoro(config: Partial<PomodoroConfig> = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }

  const [timeLeft, setTimeLeft] = useState(mergedConfig.workDuration)
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [sessionType, setSessionType] = useState<SessionType>('work')
  const [currentSession, setCurrentSession] = useState(1)
  const [totalDuration, setTotalDuration] = useState(mergedConfig.workDuration)

  const handleSessionEnd = useCallback(() => {
    if (sessionType === 'work') {
      if (currentSession % mergedConfig.sessionsBeforeLongBreak === 0) {
        setSessionType('long-break')
        setTimeLeft(mergedConfig.longBreakDuration)
        setTotalDuration(mergedConfig.longBreakDuration)
      } else {
        setSessionType('short-break')
        setTimeLeft(mergedConfig.shortBreakDuration)
        setTotalDuration(mergedConfig.shortBreakDuration)
      }
      setCurrentSession((prev) => prev + 1)
      setStatus('idle')
    } else if (sessionType === 'short-break' || sessionType === 'long-break') {
      setSessionType('work')
      setTimeLeft(mergedConfig.workDuration)
      setTotalDuration(mergedConfig.workDuration)
      setStatus('idle')
    }
  }, [
    sessionType,
    currentSession,
    mergedConfig.sessionsBeforeLongBreak,
    mergedConfig.longBreakDuration,
    mergedConfig.shortBreakDuration,
    mergedConfig.workDuration,
  ])

  useEffect(() => {
    if (status !== 'running') return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return prev
        const next = prev - 1
        if (next <= 0) {
          queueMicrotask(() => handleSessionEnd())
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [status, handleSessionEnd])

  // useCallback: stable reference so PomodoroTimer wrapped in React.memo
  // does not re-render when parent state changes unrelated to timer
  const start = useCallback(() => setStatus('running'), [])
  const pause = useCallback(() => setStatus('paused'), [])
  const reset = useCallback(() => {
    setStatus('idle')
    setTimeLeft(mergedConfig.workDuration)
    setSessionType('work')
    setCurrentSession(1)
    setTotalDuration(mergedConfig.workDuration)
  }, [mergedConfig.workDuration])

  const skip = useCallback(() => handleSessionEnd(), [handleSessionEnd])

  return {
    timeLeft,
    status,
    sessionType,
    currentSession,
    totalDuration,
    start,
    pause,
    reset,
    skip,
  }
}
