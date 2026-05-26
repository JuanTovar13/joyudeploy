import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { fetchPhotosForProfessionals } from '../lib/randomUserClient'
import logoJoyu from '../assets/home-icons/Logo de Joyu oscuro.svg'
import hillsBottom from '../assets/hills.svg'
import '../styles/AppointmentsList.css'

import { PendingAppointmentCard }   from '../components/estudiante/PendingAppointmentCard'
import { ScheduledAppointmentCard } from '../components/estudiante/ScheduledAppointmentCard'

interface Appointment {
  id: string
  reason: string
  date: string | null
  hour: string | null
  mode: string
  status: string
  professional_name: string
  professional_image: string
}

export const AppointmentsList = () => {
  const [appointments, setAppointments]             = useState<Appointment[]>([])
  const [loading, setLoading]                       = useState(true)
  const [professionalPhotos, setProfessionalPhotos] = useState<Record<string, string>>({})
  const [cancellingId, setCancellingId]             = useState<string | null>(null)

  const { user } = useAuth()
  const navigate  = useNavigate()

  // 1 — Load appointments from Supabase
  useEffect(() => {
    const fetchAppointments = async () => {
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

          {/* ── PENDING SECTION ── */}
          {pendingAppts.length > 0 && (
            <>
              <h2 className="section-label">⏳ Awaiting Confirmation</h2>
              {pendingAppts.map((app) => (
                <PendingAppointmentCard
                  key={app.id}
                  appointment={app}
                  isCancelling={cancellingId === app.id}
                  onCancel={handleCancel}
                />
              ))}
            </>
          )}

          {/* ── SCHEDULED SECTION ── */}
          {scheduledAppts.length > 0 && (
            <>
              <h2 className="section-label">✅ Confirmed</h2>
              {scheduledAppts.map((app) => (
                <ScheduledAppointmentCard
                  key={app.id}
                  appointment={app}
                  photoUrl={professionalPhotos[app.professional_name]}
                  isCancelling={cancellingId === app.id}
                  onCancel={handleCancel}
                />
              ))}
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
