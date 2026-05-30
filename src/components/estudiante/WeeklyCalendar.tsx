import { useRef, useEffect, useMemo } from 'react'
import { CLASS_SCHEDULE, JS_DAY_TO_KEY, normalizeDay, type WeekDayKey } from '../../data/classSchedule'
import { useAppSelector } from '../../store/hooks'
import type { Appointment } from '../../types'

// ── Time constants ────────────────────────────────────────────────────────────
const START_HOUR   = 6
const END_HOUR     = 22
const TOTAL_HOURS  = END_HOUR - START_HOUR
const PX_PER_HOUR  = 56
const TOTAL_HEIGHT = TOTAL_HOURS * PX_PER_HOUR

const HOURS    = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i)
const DAY_KEYS: WeekDayKey[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtHour = (h: number) => {
  if (h === 12) return '12pm'
  if (h > 12)   return `${h - 12}pm`
  return `${h}am`
}

const fmtTime = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour   = h > 12 ? h - 12 : h === 0 ? 12 : h
  return m === 0 ? `${hour}${suffix}` : `${hour}:${m.toString().padStart(2, '0')}${suffix}`
}

const timeToY = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return (h - START_HOUR + m / 60) * PX_PER_HOUR
}

const spanToPx = (start: string, end: string) => {
  const toH = (t: string) => { const [h, m] = t.split(':').map(Number); return h + m / 60 }
  return (toH(end) - toH(start)) * PX_PER_HOUR
}

// Parse "08:00 AM" / "02:00 PM" → "8:00" / "14:00"
const parseApptHour = (raw: string): string => {
  const match = raw.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return raw   // fallback: return as-is
  let h = parseInt(match[1], 10)
  const m = match[2]
  const period = match[3].toUpperCase()
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return `${h}:${m}`
}

// Return the Monday of the week that contains `date`
const getWeekMonday = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()                        // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day        // shift to Monday
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Map an appointment that falls this week to the DAY_KEYS index (0=Lun … 5=Sáb)
// Returns -1 if it falls on Sunday or outside the current week
const apptDayIndex = (appt: Appointment, weekMonday: Date): number => {
  if (!appt.date || !appt.hour || appt.status !== 'scheduled') return -1
  const d = new Date(appt.date + 'T00:00:00')
  const weekDay = d.getDay()   // 1=Mon … 6=Sat (0=Sun → skip)
  if (weekDay < 1 || weekDay > 6) return -1
  // Check same week: Saturday shares the Monday anchor of its week
  const apptMonday = getWeekMonday(d)
  if (apptMonday.getTime() !== weekMonday.getTime()) return -1
  return weekDay - 1           // Mon→0, Tue→1, Wed→2, Thu→3, Fri→4, Sat→5
}

// ── Component ─────────────────────────────────────────────────────────────────
export const WeeklyCalendar = () => {
  const scrollRef       = useRef<HTMLDivElement>(null)
  const calendarEntries = useAppSelector(s => s.calendar.entries)
  const appointments    = useAppSelector(s => s.appointments.items)

  const todayKey   = JS_DAY_TO_KEY[new Date().getDay()]
  const todayIndex = todayKey ? DAY_KEYS.indexOf(todayKey) : -1

  // Compute once per render (stable across the same day)
  const weekMonday = useMemo(() => getWeekMonday(new Date()), [])

  // Pre-bucket scheduled appointments by day index for O(1) column lookup
  const apptsByDay = useMemo(() => {
    const map: Record<number, Appointment[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] }
    for (const appt of appointments) {
      const idx = apptDayIndex(appt, weekMonday)
      if (idx >= 0) map[idx].push(appt)
    }
    return map
  }, [appointments, weekMonday])

  useEffect(() => {
    if (!scrollRef.current) return
    const now = new Date()
    const currentH = now.getHours() + now.getMinutes() / 60
    if (currentH >= START_HOUR && currentH <= END_HOUR) {
      scrollRef.current.scrollTop = Math.max(0, (currentH - START_HOUR) * PX_PER_HOUR - 80)
    }
  }, [])

  return (
    <section className="weekly-calendar">
      <h2 className="weekly-calendar__title">📅 My Week</h2>

      <div className="wc-scroll-area" ref={scrollRef}>

        {/* ── Sticky day-name header ── */}
        <div className="wc-header-row">
          <div className="wc-gutter-stub" />
          {DAY_KEYS.map((day, i) => (
            <div
              key={day}
              className={`wc-day-header${i === todayIndex ? ' wc-day-header--today' : ''}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* ── Time grid body ── */}
        <div className="wc-body" style={{ height: TOTAL_HEIGHT }}>

          {/* Hour labels */}
          <div className="wc-gutter">
            {HOURS.map((h) => (
              <span
                key={h}
                className="wc-hour-label"
                style={{ top: (h - START_HOUR) * PX_PER_HOUR }}
              >
                {fmtHour(h)}
              </span>
            ))}
          </div>

          {/* Day columns */}
          {DAY_KEYS.map((day, i) => {
            const dayEntries  = calendarEntries.filter(
              e => normalizeDay(e.schedule.day) === day
            )
            const dayAppts    = apptsByDay[i] ?? [] 

            return (
              <div
                key={day}
                className={`wc-col${i === todayIndex ? ' wc-col--today' : ''}`}
              >
                {/* Hour grid lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="wc-hour-line"
                    style={{ top: (h - START_HOUR) * PX_PER_HOUR }}
                  />
                ))}

                {/* Class blocks */}
                {CLASS_SCHEDULE[day].map((cls) => (
                  <div
                    key={cls.subject + cls.start}
                    className="wc-class-block"
                    style={{
                      top:             timeToY(cls.start),
                      height:          spanToPx(cls.start, cls.end),
                      backgroundColor: cls.color,
                    }}
                  >
                    <span className="wc-class-block__name">{cls.subject}</span>
                    <span className="wc-class-block__time">
                      {fmtTime(cls.start)} – {fmtTime(cls.end)}
                    </span>
                  </div>
                ))}

                {/* Added activity blocks */}
                {dayEntries.map(entry => (
                  <div
                    key={entry.schedule.id}
                    className="wc-class-block wc-class-block--activity"
                    style={{
                      top:             timeToY(entry.schedule.start_time),
                      height:          spanToPx(entry.schedule.start_time, entry.schedule.end_time),
                      backgroundColor: entry.color,
                    }}
                  >
                    <span className="wc-class-block__name">{entry.activityTitle}</span>
                    <span className="wc-class-block__time">
                      {fmtTime(entry.schedule.start_time)} – {fmtTime(entry.schedule.end_time)}
                    </span>
                  </div>
                ))}

                {/* Appointment blocks (scheduled by psychologist) */}
                {dayAppts.map(appt => {
                  const start = parseApptHour(appt.hour!)
                  const [h, m] = start.split(':').map(Number)
                  const endH = h + 1
                  const end  = `${endH}:${m.toString().padStart(2, '0')}`
                  return (
                    <div
                      key={appt.id}
                      className="wc-class-block wc-class-block--appointment"
                      style={{
                        top:    timeToY(start),
                        height: spanToPx(start, end),
                      }}
                    >
                      <span className="wc-class-block__name">Cita de psicología</span>
                      <span className="wc-class-block__time">
                        {fmtTime(start)} – {fmtTime(end)}
                      </span>
                      {appt.professional_name && (
                        <span className="wc-class-block__detail">
                          {appt.professional_name}
                        </span>
                      )}
                      {appt.mode && (
                        <span className="wc-class-block__detail">
                          {appt.mode === 'Virtual' ? '💻 Virtual' : '🏢 Presencial'}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
