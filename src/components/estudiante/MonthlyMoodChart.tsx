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
        <p>Grid placeholder</p>
      </div>
    </div>
  )
}
