import { useRef, useEffect } from 'react'
import { CLASS_SCHEDULE, JS_DAY_TO_KEY, type WeekDayKey } from '../../data/classSchedule'

// ── Time constants ────────────────────────────────────────────────────────────
const START_HOUR   = 7          // 7 am
const END_HOUR     = 22         // 10 pm
const TOTAL_HOURS  = END_HOUR - START_HOUR   // 15
const PX_PER_HOUR  = 56
const TOTAL_HEIGHT = TOTAL_HOURS * PX_PER_HOUR  // 840 px

// Hour ticks: 7 … 22 (inclusive — 22 is the bottom boundary label)
const HOURS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i)

const DAY_KEYS: WeekDayKey[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']

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

// ── Component ─────────────────────────────────────────────────────────────────
export const WeeklyCalendar = () => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const todayKey   = JS_DAY_TO_KEY[new Date().getDay()]
  const todayIndex = todayKey ? DAY_KEYS.indexOf(todayKey) : -1

  // On mount, scroll so the current hour is near the top of the visible area
  useEffect(() => {
    if (!scrollRef.current) return
    const now = new Date()
    const currentH = now.getHours() + now.getMinutes() / 60
    if (currentH >= START_HOUR && currentH <= END_HOUR) {
      const scrollPos = (currentH - START_HOUR) * PX_PER_HOUR - 80
      scrollRef.current.scrollTop = Math.max(0, scrollPos)
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
          {DAY_KEYS.map((day, i) => (
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
