import type { ScheduledAppointment } from './RequestCard'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface CalendarWidgetProps {
  scheduled: ScheduledAppointment[]
  calendarDate: Date
  selectedDay: number | null
  onPrevMonth: () => void
  onNextMonth: () => void
  onSelectDay: (day: number | null) => void
}

export function CalendarWidget({
  scheduled,
  calendarDate,
  selectedDay,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
}: CalendarWidgetProps) {
  const year = calendarDate.getFullYear()
  const month = calendarDate.getMonth()
  const monthLabel = calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const appointmentDays = new Set(
    scheduled
      .filter((a) => {
        if (!a.date) return false
        const d = new Date(a.date + 'T00:00:00')
        return d.getFullYear() === year && d.getMonth() === month
      })
      .map((a) => new Date(a.date + 'T00:00:00').getDate()),
  )

  return (
    <div className="calendar-widget">
      {/* Month navigation */}
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={onPrevMonth}>‹</button>
        <span className="cal-month-label">{monthLabel}</span>
        <button className="cal-nav-btn" onClick={onNextMonth}>›</button>
      </div>

      {/* Day-of-week headers + day cells */}
      <div className="cal-grid">
        {WEEKDAYS.map((d) => (
          <div key={d} className="cal-header-cell">{d}</div>
        ))}

        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`empty-${i}`} className="cal-cell cal-cell--empty" />
        ))}

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
              onClick={() => onSelectDay(day === selectedDay ? null : day)}
            >
              <span className="cal-day-num">{day}</span>
              {hasAppt && <span className="cal-dot" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
