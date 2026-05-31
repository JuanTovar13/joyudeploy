import { useCallback } from 'react'

/**
 * useAlarmSound - generates a short alarm beep using Web Audio API
 * No external audio files needed — works in all modern browsers
 */
export const useAlarmSound = () => {
  const playAlarm = useCallback(() => {
    try {
      const AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof window.AudioContext })
          .webkitAudioContext
      const ctx = new AudioContext()

      const beepCount = 3
      const beepDuration = 0.18
      const beepGap = 0.10

      for (let i = 0; i < beepCount; i++) {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(880, ctx.currentTime)

        const start = ctx.currentTime + i * (beepDuration + beepGap)
        const end = start + beepDuration

        gainNode.gain.setValueAtTime(0, start)
        gainNode.gain.linearRampToValueAtTime(0.4, start + 0.01)
        gainNode.gain.linearRampToValueAtTime(0, end)

        oscillator.start(start)
        oscillator.stop(end)
      }
    } catch {
      // Web Audio API not available, fail silently
    }
  }, [])

  return { playAlarm }
}
