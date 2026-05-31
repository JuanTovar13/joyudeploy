import { getEmotionConfig } from '../../lib/emotionConfig'
import type { MoodEntry } from '../../store/slices/moodSlice'
import '../../styles/MonthlyMoodChart.css'

interface MonthlyMoodChartProps {
  entries: MoodEntry[]
  onClose: () => void
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export const MonthlyMoodChart = ({ entries, onClose }: MonthlyMoodChartProps) => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  const entryMap = new Map(entries.map((e) => [e.date, e.emotion]))

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOffset = new Date(year, month, 1).getDay() === 0
    ? 6
    : new Date(year, month, 1).getDay() - 1

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1)
    const dateStr = d.toISOString().split('T')[0]
    const emotion = entryMap.get(dateStr)
    const config = emotion ? getEmotionConfig(emotion) : null
    return { day: i + 1, dateStr, emotion, config }
  })

  return (
    <div className="monthly-mood-overlay" role="dialog" aria-label="Monthly mood chart">
      <div className="monthly-mood-modal">
        <div className="monthly-mood-header">
          <h2 className="monthly-mood-title">
            {MONTH_NAMES[month]} {year} Mood
          </h2>
          <button
            type="button"
            className="monthly-mood-close"
            onClick={onClose}
            aria-label="Close monthly view"
          >
            ✕
          </button>
        </div>
        <div className="monthly-mood-legend">
          {['Muy bien', 'Bien', 'Neutral', 'Estresado/a', 'Agotado/a'].map((em) => {
            const cfg = getEmotionConfig(em)
            return (
              <div key={em} className="monthly-mood-legend-item">
                <img src={cfg.icon} alt={cfg.label} className="monthly-mood-legend-icon" />
                <span>{cfg.label}</span>
              </div>
            )
          })}
        </div>
        <div className="monthly-mood-day-headers">
          {DAY_LABELS.map((d) => (
            <span key={d} className="monthly-mood-day-header">{d}</span>
          ))}
        </div>

        <div className="monthly-mood-grid">
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="monthly-mood-cell empty" />
          ))}
          {days.map(({ day, dateStr, config }) => (
            <div
              key={dateStr}
              className="monthly-mood-cell"
              style={{ backgroundColor: config ? config.color + '55' : '#F5F6F8' }}
              aria-label={config ? `Day ${day}: ${config.label}` : `Day ${day}: no entry`}
              title={config ? config.label : 'No entry'}
            >
              {config ? (
                <img src={config.icon} alt={config.label} className="monthly-mood-cell-icon" />
              ) : (
                <span className="monthly-mood-cell-day">{day}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
