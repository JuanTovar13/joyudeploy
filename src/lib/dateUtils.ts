import { getEmotionConfig } from './emotionConfig'
import type { MoodEntry } from '../store/slices/moodSlice'

const toLocalDateStr = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const getLast7Days = (): string[] => {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(toLocalDateStr(d))
  }
  return days
}

export const getWeekDayLabel = (dateStr: string): string => {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return labels[d.getDay() === 0 ? 6 : d.getDay() - 1]
}

export const getWeeklyProgress = (entries: MoodEntry[]): string => {
  const last7 = getLast7Days()
  const thisWeek = entries.filter((e) => last7.includes(e.date))
  if (thisWeek.length < 2) return ''

  const scores = thisWeek.map((e) => getEmotionConfig(e.emotion).score)
  const first = scores[0]
  const last = scores[scores.length - 1]
  const diff = last - first

  if (diff > 0) return `You've improved ${Math.round((diff / 4) * 100)}% this week 🌟`
  if (diff < 0) return `Tough week — you've got this 💪`
  return `Staying consistent this week 😊`
}
