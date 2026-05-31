import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchPhotosForProfessionals } from '../lib/randomUserClient'
import { fetchAppointments, cancelAppointment } from '../store/slices/appointmentsSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import logoJoyu from '../assets/home-icons/Logo de Joyu oscuro.svg'
import '../styles/AppointmentsList.css'
import '../styles/ui.css'

import { PendingAppointmentCard }   from '../components/estudiante/PendingAppointmentCard'
import { ScheduledAppointmentCard } from '../components/estudiante/ScheduledAppointmentCard'
import { BackButton }  from '../components/ui/BackButton'
import { FormMessage } from '../components/ui/FormMessage'

export const AppointmentsList = () => {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const navigate  = useNavigate()

  const { items: appointments, status, cancellingId } = useAppSelector(
    (state) => state.appointments,
  )

  // professionalPhotos is UI-only derived state — stays local
  const [professionalPhotos, setProfessionalPhotos] = useState<Record<string, string>>({})
  const [cancelError, setCancelError] = useState<string | null>(null)

  // 1 — Fetch appointments on mount
  useEffect(() => {
    if (user?.uid) void dispatch(fetchAppointments(user.uid))
  }, [dispatch, user?.uid])

  // 2 — Fetch psychologist photos whenever scheduled appointments change
  useEffect(() => {
    const scheduled = appointments.filter(
      (a) => a.status === 'scheduled' && a.professional_name,
    )
    if (scheduled.length === 0) return
    const uniqueNames = [...new Set(scheduled.map((a) => a.professional_name))]
    fetchPhotosForProfessionals(uniqueNames, 'female').then(setProfessionalPhotos)
  }, [appointments])

  // 3 — Cancel appointment via thunk
  const handleCancel = async (appointmentId: string) => {
    setCancelError(null)
    const result = await dispatch(cancelAppointment(appointmentId))
    if (cancelAppointment.rejected.match(result)) {
      setCancelError('Could not cancel the appointment. Please try again.')
    }
  }

  const pendingAppts   = appointments.filter((a) => a.status === 'pending')
  const scheduledAppts = appointments.filter((a) => a.status === 'scheduled')

  return (
    <div className="list-screen-container">
      {/* Header */}
      <div className="list-header-section">
        <BackButton onClick={() => navigate('/home')} />
        <h1 className="list-title">My Appointments</h1>
        <img src={logoJoyu} alt="Joyu" className="list-logo-right" />
      </div>

      {cancelError && (
        <FormMessage type="error" className="appt-list-error">{cancelError}</FormMessage>
      )}

      {status === 'loading' ? (
        <div className="loading-container"><p>Loading appointments…</p></div>
      ) : appointments.length === 0 ? (
        <div className="loading-container"><p>No appointments yet.</p></div>
      ) : (
        <div className="appointments-grid-container">

          {/* ── PENDING ── */}
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

          {/* ── SCHEDULED ── */}
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

    </div>
  )
}
