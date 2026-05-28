import { useEffect } from 'react'
import type { JoyuItem, ActivitySchedule } from '../../types'
import '../../styles/ActivityDetailModal.css'

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtTime = (t: string): string => {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour   = h > 12 ? h - 12 : h === 0 ? 12 : h
  return m === 0
    ? `${hour} ${suffix}`
    : `${hour}:${m.toString().padStart(2, '0')} ${suffix}`
}

const capitalizeFirst = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1)

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  activity:  JoyuItem
  schedules: ActivitySchedule[]
  onClose:   () => void
}

export const ActivityDetailModal = ({ activity, schedules, onClose }: Props) => {
  const actSchedules = schedules.filter(s => s.activity_id === activity.id)

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-card" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="adm-header">
          {activity.image
            ? <img src={activity.image} alt={activity.title} className="adm-header__img" />
            : <div className="adm-header__placeholder">🌟</div>
          }
          <div className="adm-header__info">
            <h2 className="adm-header__title">{activity.title}</h2>
            <span className="adm-header__category">{activity.category}</span>
          </div>
          <button className="adm-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <hr className="adm-divider" />

        {/* ── Schedule list ── */}
        <div className="adm-body">
          <h3 className="adm-section-title">Horarios disponibles</h3>

          {actSchedules.length === 0 ? (
            <p className="adm-empty">No hay horarios registrados para esta actividad.</p>
          ) : (
            <ul className="adm-schedule-list">
              {actSchedules.map(s => (
                <li key={s.id} className="adm-schedule-item">
                  <div className="adm-schedule-day">
                    {capitalizeFirst(s.day)}
                  </div>
                  <div className="adm-schedule-details">
                    <span className="adm-schedule-time">
                      🕐 {fmtTime(s.start_time)} – {fmtTime(s.end_time)}
                    </span>
                    {s.location && (
                      <span className="adm-schedule-location">📍 {s.location}</span>
                    )}
                    {s.teacher && (
                      <span className="adm-schedule-teacher">👤 {s.teacher}</span>
                    )}
                    {s.level && (
                      <span className="adm-schedule-level">⭐ {s.level}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}
