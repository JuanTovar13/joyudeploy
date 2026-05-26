import { useState } from 'react'

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

export function RequestCard({ appointment, scheduled, onAccept }: RequestCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [acceptDate, setAcceptDate] = useState('')
  const [acceptHour, setAcceptHour] = useState('')
  const [saving, setSaving] = useState(false)
  const [conflictError, setConflictError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!acceptDate || !acceptHour) {
      setConflictError('Please select a date and hour before confirming.')
      return
    }

    const conflict = scheduled.find((a) => a.date === acceptDate && a.hour === acceptHour)
    if (conflict) {
      setConflictError(
        `⚠️ You already have an appointment with ${conflict.student_name || 'another student'} at ${acceptHour} on ${acceptDate}. Please choose a different time.`,
      )
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

  function handleCancel() {
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
            onChange={(e) => { setAcceptDate(e.target.value); setConflictError(null) }}
            min={new Date().toISOString().split('T')[0]}
          />
          <select
            className={`accept-hour-select${conflictError ? ' accept-input--error' : ''}`}
            value={acceptHour}
            onChange={(e) => { setAcceptHour(e.target.value); setConflictError(null) }}
          >
            <option value="">Select hour</option>
            {HOURS.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>

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
