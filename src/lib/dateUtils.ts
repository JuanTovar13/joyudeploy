import { getEmotionConfig } from './emotionConfig'
import type { MoodEntry } from '../store/slices/moodSlice'

export const getLast7Days = (): string[] => {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export const getWeekDayLabel = (dateStr: string): string => {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const day = new Date(dateStr).getDay()
  return labels[day === 0 ? 6 : day - 1]
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
