import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { authService } from '../firebase/firebaseConfig'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import logoJoyu from '../assets/home-icons/Logo de Joyu oscuro.svg'
import '../styles/PsychologistDashboard.css'

import { RequestCard }    from '../components/psicologo/RequestCard'
import { CalendarWidget } from '../components/psicologo/CalendarWidget'
import { DayPanel }       from '../components/psicologo/DayPanel'
import type { PendingAppointment, ScheduledAppointment } from '../components/psicologo/RequestCard'

export const PsychologistDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'requests' | 'calendar'>('requests')
  const [pending, setPending]     = useState<PendingAppointment[]>([])
  const [scheduled, setScheduled] = useState<ScheduledAppointment[]>([])
  const [loading, setLoading]     = useState(true)

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [selectedDay, setSelectedDay]   = useState<number | null>(null)

  useEffect(() => {
    if (!user?.uid) return
    void fetchData()
  }, [user])

  const fetchData = async () => {
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

  const handleAccept = async (appointmentId: string, date: string, hour: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({
        date,
        hour,
        professional_name: user?.displayName ?? 'Psychologist',
        psychologist_id: user?.uid,
        status: 'scheduled',
      })
      .eq('id', appointmentId)

    if (error) throw new Error(error.message)

    const accepted = pending.find((p) => p.id === appointmentId)
    if (accepted) {
      setScheduled((prev) => [...prev, { ...accepted, date, hour }])
      setPending((prev) => prev.filter((p) => p.id !== appointmentId))
    }
  }

  const handleSignOut = async () => {
    await signOut(authService)
    navigate('/login')
  }

  // Calendar helpers
  const year = calendarDate.getFullYear()
  const month = calendarDate.getMonth()
  const monthLabel = calendarDate.toLocaleString('default', { month: 'long' })

  const appointmentsOnSelected = selectedDay
    ? scheduled.filter((a) => {
        if (!a.date) return false
        const d = new Date(a.date + 'T00:00:00')
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay
      })
    : []

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

        /* ── REQUESTS TAB ── */
        <div className="psych-content">
          {pending.length === 0 ? (
            <p className="psych-empty">No pending requests at the moment. ✅</p>
          ) : (
            pending.map((appt) => (
              <RequestCard
                key={appt.id}
                appointment={appt}
                scheduled={scheduled}
                onAccept={handleAccept}
              />
            ))
          )}
        </div>

      ) : (

        /* ── CALENDAR TAB ── */
        <div className="psych-content">
          <CalendarWidget
            scheduled={scheduled}
            calendarDate={calendarDate}
            selectedDay={selectedDay}
            onPrevMonth={() => { setCalendarDate(new Date(year, month - 1, 1)); setSelectedDay(null) }}
            onNextMonth={() => { setCalendarDate(new Date(year, month + 1, 1)); setSelectedDay(null) }}
            onSelectDay={setSelectedDay}
          />

          {selectedDay && (
            <DayPanel
              appointments={appointmentsOnSelected}
              day={selectedDay}
              monthLabel={monthLabel}
            />
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
