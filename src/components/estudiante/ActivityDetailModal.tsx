import { useEffect } from 'react'
import type { JoyuItem, ActivitySchedule } from '../../types'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addScheduleEntry, removeScheduleEntry } from '../../store/slices/calendarSlice'
import { CLASS_SCHEDULE, normalizeDay, timesOverlap } from '../../data/classSchedule'
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

const capitalizeFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  activity:  JoyuItem
  schedules: ActivitySchedule[]
  onClose:   () => void
}

export const ActivityDetailModal = ({ activity, schedules, onClose }: Props) => {
  const dispatch       = useAppDispatch()
  const calendarEntries = useAppSelector(s => s.calendar.entries)

  const actSchedules = schedules.filter(s => s.activity_id === activity.id)

  // Returns names of everything this schedule conflicts with
  const getConflicts = (s: ActivitySchedule): string[] => {
    const dayKey   = normalizeDay(s.day)
    const conflicts: string[] = []

    // Against class schedule
    if (dayKey) {
      for (const cls of CLASS_SCHEDULE[dayKey] ?? []) {
        if (timesOverlap(cls.start, cls.end, s.start_time, s.end_time))
          conflicts.push(cls.subject)
      }
    }

    // Against already-added calendar entries (skip self)
    for (const entry of calendarEntries) {
      if (entry.schedule.id === s.id) continue
      if (normalizeDay(entry.schedule.day) === dayKey) {
        if (timesOverlap(
          entry.schedule.start_time, entry.schedule.end_time,
          s.start_time, s.end_time,
        )) conflicts.push(entry.activityTitle)
      }
    }

    return conflicts
  }

  const isAdded = (s: ActivitySchedule) =>
    calendarEntries.some(e => e.schedule.id === s.id)

  const handleToggle = (s: ActivitySchedule) => {
    if (isAdded(s)) {
      dispatch(removeScheduleEntry(s.id))
    } else {
      dispatch(addScheduleEntry({ schedule: s, activityTitle: activity.title }))
    }
  }

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Lock body scroll
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
              {actSchedules.map(s => {
                const conflicts  = getConflicts(s)
                const added      = isAdded(s)
                const hasConflict = conflicts.length > 0

                return (
                  <li
                    key={s.id}
                    className={`adm-schedule-item${hasConflict ? ' adm-schedule-item--conflict' : ''}`}
                  >
                    <div className="adm-schedule-day">{capitalizeFirst(s.day)}</div>

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

                      {hasConflict && (
                        <span className="adm-conflict-warning">
                          ⚠️ Se superpone con: {conflicts.join(', ')}
                        </span>
                      )}

                      <button
                        className={`adm-add-btn${added ? ' adm-add-btn--added' : ''}${hasConflict && !added ? ' adm-add-btn--conflict' : ''}`}
                        onClick={() => handleToggle(s)}
                      >
                        {added ? '✓ Añadido' : '+ Añadir a horario'}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}
