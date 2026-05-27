interface Appointment {
  id: string
  reason: string
  date: string | null
  hour: string | null
  mode: string
  professional_name: string
}

interface ScheduledAppointmentCardProps {
  appointment: Appointment
  photoUrl: string | undefined
  isCancelling: boolean
  onCancel: (id: string) => void
}

export const ScheduledAppointmentCard = ({
  appointment,
  photoUrl,
  isCancelling,
  onCancel,
}: ScheduledAppointmentCardProps) => {
  return (
    <div className="appointment-card-v2">
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
            alt={appointment.professional_name}
            className="prof-photo"
          />
        ) : (
          <div className="prof-photo-skeleton" aria-hidden="true" />
        )}
      </div>

      {/* Content */}
      <div className="card-content-overlay">
        <div className="left-info">
          <h3 className="prof-name">{appointment.professional_name}</h3>
          <div className="details-text">
            <p><strong>Date:</strong> {appointment.date ?? '—'}</p>
            <p><strong>Time:</strong> {appointment.hour ?? '—'}</p>
            <p><strong>Mode:</strong> {appointment.mode}</p>
          </div>
        </div>

        <div className="right-actions">
          <button className="btn-reschedule" disabled>Reschedule</button>
          <button
            className="btn-cancel"
            onClick={() => onCancel(appointment.id)}
            disabled={isCancelling}
          >
            {isCancelling ? 'Cancelling…' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}
