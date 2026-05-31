interface Appointment {
  id: string
  reason: string
  mode: string
}

interface PendingAppointmentCardProps {
  appointment: Appointment
  isCancelling: boolean
  onCancel: (id: string) => void
}

export const PendingAppointmentCard = ({ appointment, isCancelling, onCancel }: PendingAppointmentCardProps) => {
  const isVirtual = appointment.mode === 'Virtual'

  return (
    <div className="appt-card appt-card--pending">
      {/* Header strip */}
      <div className="appt-card__header appt-card__header--pending">
        <div className="appt-card__avatar appt-card__avatar--pending">
          <span style={{ fontSize: 22 }}>🗓️</span>
        </div>
        <div className="appt-card__header-info">
          <span className="appt-card__label">Appointment request</span>
          <h3 className="appt-card__name appt-card__name--pending">Pending confirmation</h3>
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
        <div className="appt-card__pending-notice">
          <span className="appt-card__pending-dot" />
          Waiting for psychologist to confirm date &amp; time
        </div>
      </div>

      {/* Footer */}
      <div className="appt-card__footer">
        <button
          className="appt-card__cancel-btn"
          onClick={() => onCancel(appointment.id)}
          disabled={isCancelling}
        >
          {isCancelling ? 'Cancelling…' : 'Cancel request'}
        </button>
      </div>
    </div>
  )
}
