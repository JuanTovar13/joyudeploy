import { useState, useMemo } from 'react'
import { CLASS_SCHEDULE, JS_DAY_TO_KEY, timesOverlap } from '../../data/classSchedule'

const HOURS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
]

export interface PendingAppointment {
  id: string
  user_id: string
  student_name: string
  reason: string
  mode: string
  status: string
}

export interface ScheduledAppointment {
  id: string
  user_id: string
  student_name: string
  reason: string
  mode: string
  date: string
  hour: string
}

interface RequestCardProps {
  appointment: PendingAppointment
  scheduled: ScheduledAppointment[]
  onAccept: (id: string, date: string, hour: string) => Promise<void>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// "08:00 AM" / "02:00 PM" → "8:00" / "14:00"  (24-h string for overlap checks)
const parseHour12 = (raw: string): string => {
  const match = raw.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return raw
  let h = parseInt(match[1], 10)
  const m = match[2]
  const period = match[3].toUpperCase()
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return `${h}:${m}`
}

// Returns a reason string if this 1-h slot conflicts with the student's schedule,
// or null if it is free.
const getConflictReason = (
  date: string,
  hourStr: string,
  studentId: string,
  scheduled: ScheduledAppointment[],
): string | null => {
  if (!date) return null

  const start = parseHour12(hourStr)
  const [h, m] = start.split(':').map(Number)
  const end = `${h + 1}:${m.toString().padStart(2, '0')}`

  // 1 — Student already has an appointment on this date/hour
  const dupAppt = scheduled.find(
    a => a.user_id === studentId && a.date === date && a.hour === hourStr,
  )
  if (dupAppt) return 'cita existente'

  // 2 — Overlaps with the student's class schedule that day
  const jsDay = new Date(date + 'T00:00:00').getDay()
  const dayKey = JS_DAY_TO_KEY[jsDay]
  if (dayKey) {
    const conflictingClass = (CLASS_SCHEDULE[dayKey] ?? []).find(cls =>
      timesOverlap(cls.start, cls.end, start, end),
    )
    if (conflictingClass) return `clase: ${conflictingClass.subject}`
  }

  return null
}

// ── Component ─────────────────────────────────────────────────────────────────
export const RequestCard = ({ appointment, scheduled, onAccept }: RequestCardProps) => {
  const [isExpanded, setIsExpanded]     = useState(false)
  const [acceptDate, setAcceptDate]     = useState('')
  const [acceptHour, setAcceptHour]     = useState('')
  const [saving, setSaving]             = useState(false)
  const [conflictError, setConflictError] = useState<string | null>(null)

  // Recompute which hours are blocked whenever the date changes
  const hourConflicts = useMemo<Record<string, string>>(() => {
    if (!acceptDate) return {}
    const result: Record<string, string> = {}
    for (const h of HOURS) {
      const reason = getConflictReason(acceptDate, h, appointment.user_id, scheduled)
      if (reason) result[h] = reason
    }
    return result
  }, [acceptDate, appointment.user_id, scheduled])

  const handleConfirm = async () => {
    if (!acceptDate || !acceptHour) {
      setConflictError('Please select a date and hour before confirming.')
      return
    }

    // Psychologist-level conflict (same slot already taken by any student)
    const psychConflict = scheduled.find(
      a => a.date === acceptDate && a.hour === acceptHour && a.user_id !== appointment.user_id,
    )
    if (psychConflict) {
      setConflictError(
        `⚠️ You already have an appointment with ${psychConflict.student_name || 'another student'} at ${acceptHour} on ${acceptDate}. Please choose a different time.`,
      )
      return
    }

    // Student schedule conflict (should already be disabled, but guard anyway)
    const studentReason = hourConflicts[acceptHour]
    if (studentReason) {
      setConflictError(`⚠️ This slot conflicts with the student's schedule (${studentReason}).`)
      return
    }

    setConflictError(null)
    setSaving(true)
    try {
      await onAccept(appointment.id, acceptDate, acceptHour)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsExpanded(false)
    setAcceptDate('')
    setAcceptHour('')
    setConflictError(null)
  }

  return (
    <div className="request-card">
      <div className="request-info">
        <h3 className="request-student">{appointment.student_name || 'Student'}</h3>
        <p className="request-reason">📝 {appointment.reason}</p>
        <span className="request-mode-badge">
          {appointment.mode === 'Virtual' ? '💻 Virtual' : '🏢 In person'}
        </span>
      </div>

      {isExpanded ? (
        <div className="accept-form">
          <input
            type="date"
            className={`accept-date-input${conflictError ? ' accept-input--error' : ''}`}
            value={acceptDate}
            onChange={(e) => {
              setAcceptDate(e.target.value)
              setAcceptHour('')          // reset hour when date changes
              setConflictError(null)
            }}
            min={new Date().toISOString().split('T')[0]}
          />
          <select
            className={`accept-hour-select${conflictError ? ' accept-input--error' : ''}`}
            value={acceptHour}
            onChange={(e) => { setAcceptHour(e.target.value); setConflictError(null) }}
            disabled={!acceptDate}
          >
            <option value="">Select hour</option>
            {HOURS.map((h) => {
              const reason = hourConflicts[h]
              return (
                <option key={h} value={h} disabled={!!reason}>
                  {h}{reason ? ` — ${reason}` : ''}
                </option>
              )
            })}
          </select>

          {!acceptDate && (
            <p className="accept-hint">Select a date first to see available hours.</p>
          )}

          {conflictError && (
            <div className="conflict-error">{conflictError}</div>
          )}

          <div className="accept-actions">
            <button className="btn-confirm" onClick={() => void handleConfirm()} disabled={saving}>
              {saving ? 'Saving…' : '✓ Confirm'}
            </button>
            <button className="btn-cancel-form" onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className="btn-accept" onClick={() => setIsExpanded(true)}>
          Accept & Schedule
        </button>
      )}
    </div>
  )
}
