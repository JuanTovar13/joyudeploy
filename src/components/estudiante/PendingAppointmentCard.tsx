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

export function PendingAppointmentCard({ appointment, isCancelling, onCancel }: PendingAppointmentCardProps) {
  return (
    <div className="pending-card">
      <div className="pending-card-body">
        <div className="pending-icon">🗓️</div>
        <div className="pending-info">
          <p className="pending-reason">{appointment.reason}</p>
          <p className="pending-mode">
            {appointment.mode === 'Virtual' ? '💻 Virtual' : '🏢 In person'}
          </p>
          <span className="pending-status-badge">
            Waiting for psychologist to confirm date &amp; time
          </span>
        </div>
      </div>
      <button
        className="btn-cancel pending-cancel"
        onClick={() => onCancel(appointment.id)}
        disabled={isCancelling}
      >
        {isCancelling ? 'Cancelling…' : 'Cancel request'}
      </button>
    </div>
  )
}
