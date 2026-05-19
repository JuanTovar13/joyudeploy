import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { authService } from '../firebase/firebaseConfig'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import logoJoyu from '../assets/home-icons/Logo de Joyu oscuro.svg'
import '../styles/PsychologistDashboard.css'

interface PendingAppointment {
  id: string
  user_id: string
  student_name: string
  reason: string
  mode: string
  status: string
}

interface ScheduledAppointment {
  id: string
  student_name: string
  reason: string
  mode: string
  date: string
  hour: string
}

const HOURS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
]

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function PsychologistDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'requests' | 'calendar'>('requests')
  const [pending, setPending] = useState<PendingAppointment[]>([])
  const [scheduled, setScheduled] = useState<ScheduledAppointment[]>([])
  const [loading, setLoading] = useState(true)

  // Accept-form state
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [acceptDate, setAcceptDate] = useState('')
  const [acceptHour, setAcceptHour] = useState('')
  const [saving, setSaving] = useState(false)
  const [conflictError, setConflictError] = useState<string | null>(null)

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  useEffect(() => {
    if (!user?.uid) return
    void fetchData()
  }, [user])

  async function fetchData() {
    setLoading(true)
    const [pendingRes, scheduledRes] = await Promise.all([
      supabase
        .from('appointments')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true }),
      supabase
        .from('appointments')
        .select('*')
        .eq('status', 'scheduled')
        .eq('psychologist_id', user!.uid)
        .order('date', { ascending: true }),
    ])
    if (pendingRes.data) setPending(pendingRes.data as PendingAppointment[])
    if (scheduledRes.data) setScheduled(scheduledRes.data as ScheduledAppointment[])
    setLoading(false)
  }

  async function handleAccept(appointmentId: string) {
    if (!acceptDate || !acceptHour) {
      setConflictError('Please select a date and hour before confirming.')
      return
    }

    // Check for scheduling conflict
    const conflict = scheduled.find(
      (a) => a.date === acceptDate && a.hour === acceptHour,
    )
    if (conflict) {
      setConflictError(
        `⚠️ You already have an appointment with ${conflict.student_name || 'another student'} at ${acceptHour} on ${acceptDate}. Please choose a different time.`,
      )
      return
    }

    setConflictError(null)
    setSaving(true)
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          date: acceptDate,
          hour: acceptHour,
          professional_name: user?.displayName ?? 'Psychologist',
          psychologist_id: user?.uid,
          status: 'scheduled',
        })
        .eq('id', appointmentId)

      if (error) throw error

      // Update local state immediately
      const accepted = pending.find((p) => p.id === appointmentId)
      if (accepted) {
        setScheduled((prev) => [
          ...prev,
          { ...accepted, date: acceptDate, hour: acceptHour },
        ])
        setPending((prev) => prev.filter((p) => p.id !== appointmentId))
      }
      setAcceptingId(null)
      setAcceptDate('')
      setAcceptHour('')
    } catch (err: unknown) {
      if (err instanceof Error) setConflictError(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  function cancelAccept() {
    setAcceptingId(null)
    setAcceptDate('')
    setAcceptHour('')
    setConflictError(null)
  }

  async function handleSignOut() {
    await signOut(authService)
    navigate('/login')
  }

  // ── Calendar helpers ──────────────────────────────────────────────────────
  const year = calendarDate.getFullYear()
  const month = calendarDate.getMonth()
  const monthLabel = calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  // Days in the current month view that have appointments
  const appointmentDays = new Set(
    scheduled
      .filter((a) => {
        if (!a.date) return false
        const d = new Date(a.date + 'T00:00:00')
        return d.getFullYear() === year && d.getMonth() === month
      })
      .map((a) => new Date(a.date + 'T00:00:00').getDate()),
  )

  const appointmentsOnSelected = selectedDay
    ? scheduled.filter((a) => {
        if (!a.date) return false
        const d = new Date(a.date + 'T00:00:00')
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay
      })
    : []
      console.log(scheduled)
  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="psych-screen">
      {/* Header */}
      <div className="psych-header">
        <div>
          <h1 className="psych-title">Psychologist Panel</h1>
          <p className="psych-subtitle">Welcome, {user?.displayName ?? 'Doctor'}</p>
        </div>
        <img src={logoJoyu} alt="Joyu" className="psych-logo" />
      </div>

      {/* Tabs */}
      <div className="psych-tabs">
        <button
          className={`psych-tab${activeTab === 'requests' ? ' psych-tab--active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          📋 Requests
          {pending.length > 0 && (
            <span className="psych-badge">{pending.length}</span>
          )}
        </button>
        <button
          className={`psych-tab${activeTab === 'calendar' ? ' psych-tab--active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          📅 My Calendar
        </button>
      </div>

      {loading ? (
        <div className="psych-loading">Loading…</div>
      ) : activeTab === 'requests' ? (
        /* ── REQUESTS TAB ──────────────────────────────────────────────────── */
        <div className="psych-content">
          {pending.length === 0 ? (
            <p className="psych-empty">No pending requests at the moment. ✅</p>
          ) : (
            pending.map((appt) => (
              <div key={appt.id} className="request-card">
                <div className="request-info">
                  <h3 className="request-student">{appt.student_name || 'Student'}</h3>
                  <p className="request-reason">📝 {appt.reason}</p>
                  <span className="request-mode-badge">
                    {appt.mode === 'Virtual' ? '💻 Virtual' : '🏢 In person'}
                  </span>
                </div>

                {acceptingId === appt.id ? (
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
                      <div className="conflict-error">
                        {conflictError}
                      </div>
                    )}

                    <div className="accept-actions">
                      <button
                        className="btn-confirm"
                        onClick={() => void handleAccept(appt.id)}
                        disabled={saving}
                      >
                        {saving ? 'Saving…' : '✓ Confirm'}
                      </button>
                      <button
                        className="btn-cancel-form"
                        onClick={cancelAccept}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn-accept"
                    onClick={() => setAcceptingId(appt.id)}
                  >
                    Accept & Schedule
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* ── CALENDAR TAB ──────────────────────────────────────────────────── */
        <div className="psych-content">
          <div className="calendar-widget">
            {/* Month navigation */}
            <div className="cal-nav">
              <button
                className="cal-nav-btn"
                onClick={() => { setCalendarDate(new Date(year, month - 1, 1)); setSelectedDay(null) }}
              >
                ‹
              </button>
              <span className="cal-month-label">{monthLabel}</span>
              <button
                className="cal-nav-btn"
                onClick={() => { setCalendarDate(new Date(year, month + 1, 1)); setSelectedDay(null) }}
              >
                ›
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="cal-grid">
              {WEEKDAYS.map((d) => (
                <div key={d} className="cal-header-cell">{d}</div>
              ))}

              {/* Empty cells for offset */}
              {Array.from({ length: firstWeekday }).map((_, i) => (
                <div key={`empty-${i}`} className="cal-cell cal-cell--empty" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const isToday =
                  today.getFullYear() === year &&
                  today.getMonth() === month &&
                  today.getDate() === day
                const hasAppt = appointmentDays.has(day)
                const isSelected = selectedDay === day

                return (
                  <div
                    key={day}
                    className={[
                      'cal-cell',
                      isToday ? 'cal-cell--today' : '',
                      hasAppt ? 'cal-cell--has-appt' : '',
                      isSelected ? 'cal-cell--selected' : '',
                    ].join(' ')}
                    onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  >
                    <span className="cal-day-num">{day}</span>
                    {hasAppt && <span className="cal-dot" />}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Appointments for the selected day */}
          {selectedDay && (
            <div className="day-panel">
              <h3 className="day-panel-title">
                {calendarDate.toLocaleString('default', { month: 'long' })} {selectedDay}
              </h3>
              {appointmentsOnSelected.length === 0 ? (
                <p className="psych-empty">No appointments on this day.</p>
              ) : (
                appointmentsOnSelected.map((appt) => (
                  <div key={appt.id} className="day-appt-card">
                    <span className="day-appt-hour">{appt.hour}</span>
                    <div className="day-appt-info">
                      <p className="day-appt-student">{appt.student_name || 'Student'}</p>
                      <p className="day-appt-reason">{appt.reason}</p>
                    </div>
                    <span className="day-appt-mode">
                      {appt.mode === 'Virtual' ? '💻' : '🏢'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Sign out */}
      <button className="psych-signout" onClick={() => void handleSignOut()}>
        Sign out
      </button>
    </div>
  )
}
