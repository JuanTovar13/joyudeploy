import { getEmotionConfig } from '../../lib/emotionConfig'
import { getLast7Days, getWeekDayLabel, getWeeklyProgress } from '../../lib/dateUtils'
import type { MoodEntry } from '../../store/slices/moodSlice'
import '../../styles/WeeklyMoodChart.css'

interface WeeklyMoodChartProps {
  entries: MoodEntry[]
  onViewMonthly: () => void
}

export const WeeklyMoodChart = ({ entries, onViewMonthly }: WeeklyMoodChartProps) => {
  const last7Days = getLast7Days()
  const progressMessage = getWeeklyProgress(entries)
  const entryMap = new Map(entries.map((e) => [e.date, e.emotion]))

  return (
    <section className="weekly-mood-container" aria-label="Weekly mood chart">
      <p>WeeklyMoodChart placeholder</p>
    </section>
  )
}
