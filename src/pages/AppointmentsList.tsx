import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { fetchPhotosForProfessionals } from '../lib/randomUserClient'
import logoJoyu from '../assets/home-icons/Logo de Joyu oscuro.svg'
import hillsBottom from '../assets/hills.svg'
import '../styles/AppointmentsList.css'

interface Appointment {
  id: string
  reason: string
  date: string
  hour: string
  mode: string
  status: string
  professional_name: string
  professional_image: string
}

export function AppointmentsList() {
  const [appointments, setAppointments]             = useState<Appointment[]>([])
  const [loading, setLoading]                       = useState(true)
  const [professionalPhotos, setProfessionalPhotos] = useState<Record<string, string>>({})
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const { user } = useAuth()
  const navigate  = useNavigate()

  // 1 — Load appointments from Supabase
  useEffect(() => {
    async function fetchAppointments() {
      if (!user?.uid) return
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', user.uid)
          .order('created_at', { ascending: false })

        if (error) throw error
        if (data) setAppointments(data as Appointment[])
      } catch (err: unknown) {
        if (err instanceof Error) console.error('Error fetching appointments:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [user])

  // 2 — Fetch psychologist photos for scheduled appointments
  useEffect(() => {
    const scheduled = appointments.filter(
      (a) => a.status === 'scheduled' && a.professional_name,
    )
    if (scheduled.length === 0) return
    const uniqueNames = [...new Set(scheduled.map((a) => a.professional_name))]
    fetchPhotosForProfessionals(uniqueNames, 'female').then(setProfessionalPhotos)
  }, [appointments])

  // 3 — Cancel / delete appointment
  const handleCancel = async (appointmentId: string) => {
    const confirmed = window.confirm('Are you sure you want to cancel this appointment?')
    if (!confirmed) return

    setCancellingId(appointmentId)
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId)

      if (error) throw error
      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId))
    } catch (err: unknown) {
      if (err instanceof Error) console.error('Error cancelling appointment:', err.message)
      alert('Could not cancel the appointment. Please try again.')
    } finally {
      setCancellingId(null)
    }
  }

  const pendingAppts   = appointments.filter((a) => a.status === 'pending')
  const scheduledAppts = appointments.filter((a) => a.status === 'scheduled')

  return (
    <div className="list-screen-container">
      {/* Header */}
      <div className="list-header-section">
        <button className="back-button-top" onClick={() => navigate('/home')}>
          <span>‹</span>
        </button>
        <h1 className="list-title">My Appointments</h1>
        <img src={logoJoyu} alt="Joyu" className="list-logo-right" />
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Loading appointments…</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="loading-container">
          <p>No appointments yet.</p>
        </div>
      ) : (
        <div className="appointments-grid-container">

          {/* ── PENDING SECTION ─────────────────────────────────────────────── */}
          {pendingAppts.length > 0 && (
            <>
              <h2 className="section-label">⏳ Awaiting Confirmation</h2>
              {pendingAppts.map((app) => {
                const isCancelling = cancellingId === app.id
                return (
                  <div key={app.id} className="pending-card">
                    <div className="pending-card-body">
                      <div className="pending-icon">🗓️</div>
                      <div className="pending-info">
                        <p className="pending-reason">{app.reason}</p>
                        <p className="pending-mode">
                          {app.mode === 'Virtual' ? '💻 Virtual' : '🏢 In person'}
                        </p>
                        <span className="pending-status-badge">
                          Waiting for psychologist to confirm date &amp; time
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn-cancel pending-cancel"
                      onClick={() => handleCancel(app.id)}
                      disabled={isCancelling}
                    >
                      {isCancelling ? 'Cancelling…' : 'Cancel request'}
                    </button>
                  </div>
                )
              })}
            </>
          )}

          {/* ── SCHEDULED SECTION ───────────────────────────────────────────── */}
          {scheduledAppts.length > 0 && (
            <>
              <h2 className="section-label">✅ Confirmed</h2>
              {scheduledAppts.map((app) => {
                const photoUrl     = professionalPhotos[app.professional_name]
                const isCancelling = cancellingId === app.id

                return (
                  <div key={app.id} className="appointment-card-v2">
                    {/* Background image */}
                    <img
                      src="https://www.icesi.edu.co/wp-content/uploads/2025/06/redes-institucionales-dk.jpg"
                      alt=""
                      className="card-background-svg"
                    />

                    {/* Dark overlay */}
                    <div className="card-dark-overlay" />

                    {/* Psychologist photo */}
                    <div className="prof-photo-wrapper">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={app.professional_name}
                          className="prof-photo"
                        />
                      ) : (
                        <div className="prof-photo-skeleton" aria-hidden="true" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="card-content-overlay">
                      <div className="left-info">
                        <h3 className="prof-name">{app.professional_name}</h3>
                        <div className="details-text">
                          <p><strong>Date:</strong> {app.date ?? '—'}</p>
                          <p><strong>Time:</strong> {app.hour ?? '—'}</p>
                          <p><strong>Mode:</strong> {app.mode}</p>
                        </div>
                      </div>

                      <div className="right-actions">
                        <button className="btn-reschedule" disabled>Reschedule</button>
                        <button
                          className="btn-cancel"
                          onClick={() => handleCancel(app.id)}
                          disabled={isCancelling}
                        >
                          {isCancelling ? 'Cancelling…' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}

          <Link to="/schedule" className="btn-new-appointment-v2">
            + New Request
          </Link>
        </div>
      )}

      <div className="decor-hills-bottom">
        <img src={hillsBottom} alt="" className="hills-svg-image" />
      </div>
    </div>
  )
}
