import type { ScheduledAppointment } from './RequestCard'

interface DayPanelProps {
  appointments: ScheduledAppointment[]
  day: number
  monthLabel: string
}

export function DayPanel({ appointments, day, monthLabel }: DayPanelProps) {
  return (
    <div className="day-panel">
      <h3 className="day-panel-title">
        {monthLabel} {day}
      </h3>

      {appointments.length === 0 ? (
        <p className="psych-empty">No appointments on this day.</p>
      ) : (
        appointments.map((appt) => (
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
  )
}
