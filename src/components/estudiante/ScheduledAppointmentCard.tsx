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
  const isVirtual = appointment.mode === 'Virtual'

  return (
    <div className="appt-card">
      {/* Header strip */}
      <div className="appt-card__header">
        <div className="appt-card__avatar">
          {photoUrl ? (
            <img src={photoUrl} alt={appointment.professional_name} className="appt-card__photo" />
          ) : (
            <div className="appt-card__photo-placeholder">
              {appointment.professional_name.charAt(0)}
            </div>
          )}
        </div>
        <div className="appt-card__header-info">
          <span className="appt-card__label">Scheduled appointment</span>
          <h3 className="appt-card__name">{appointment.professional_name}</h3>
        </div>
        <span className={`appt-card__mode-badge appt-card__mode-badge--${isVirtual ? 'virtual' : 'presencial'}`}>
          {isVirtual ? '💻 Virtual' : '🏢 In person'}
        </span>
      </div>

      {/* Body */}
      <div className="appt-card__body">
        <div className="appt-card__detail">
          <span className="appt-card__detail-icon">📋</span>
          <div>
            <span className="appt-card__detail-label">Reason</span>
            <span className="appt-card__detail-value">{appointment.reason}</span>
          </div>
        </div>
        <div className="appt-card__details-row">
          <div className="appt-card__detail">
            <span className="appt-card__detail-icon">📅</span>
            <div>
              <span className="appt-card__detail-label">Date</span>
              <span className="appt-card__detail-value">{appointment.date ?? '—'}</span>
            </div>
          </div>
          <div className="appt-card__detail">
            <span className="appt-card__detail-icon">🕐</span>
            <div>
              <span className="appt-card__detail-label">Time</span>
              <span className="appt-card__detail-value">{appointment.hour ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="appt-card__footer">
        <button
          className="appt-card__cancel-btn"
          onClick={() => onCancel(appointment.id)}
          disabled={isCancelling}
        >
          {isCancelling ? 'Cancelling…' : 'Cancel appointment'}
        </button>
      </div>
    </div>
  )
}
