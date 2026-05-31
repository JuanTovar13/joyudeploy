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
      <div className="weekly-mood-header">
        <h2 className="weekly-mood-title">This Week's Mood 🌈</h2>
        <button
          type="button"
          className="weekly-mood-view-btn"
          onClick={onViewMonthly}
          aria-label="View monthly mood chart"
        >
          View month
        </button>
      </div>
      {progressMessage && (
        <p className="weekly-mood-progress" aria-live="polite">
          {progressMessage}
        </p>
      )}
      <div className="weekly-mood-grid" role="list">
        {last7Days.map((date) => {
          const emotion = entryMap.get(date)
          const config = emotion ? getEmotionConfig(emotion) : null
          const dayLabel = getWeekDayLabel(date)

          return (
            <div
              key={date}
              className="weekly-mood-day"
              role="listitem"
              aria-label={emotion ? `${dayLabel}: ${emotion}` : `${dayLabel}: no entry`}
            >
              <span className="weekly-mood-day-label">{dayLabel}</span>
              <div
                className="weekly-mood-icon-wrapper"
                style={{ backgroundColor: config ? config.color + '33' : '#F5F6F8' }}
              >
                {config ? (
                  <img
                    src={config.icon}
                    alt={config.label}
                    className="weekly-mood-icon"
                  />
                ) : (
                  <span className="weekly-mood-empty">·</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
