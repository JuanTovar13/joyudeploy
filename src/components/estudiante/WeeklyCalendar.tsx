import {
  CLASS_SCHEDULE,
  JS_DAY_TO_KEY,
  type WeekDayKey,
} from '../../data/classSchedule'

const DAY_KEYS: WeekDayKey[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']

const fmt = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour   = h > 12 ? h - 12 : h === 0 ? 12 : h
  return m === 0 ? `${hour}${suffix}` : `${hour}:${m.toString().padStart(2, '0')}${suffix}`
}

export const WeeklyCalendar = () => {
  const todayIndex = (() => {
    const key = JS_DAY_TO_KEY[new Date().getDay()]
    return key ? DAY_KEYS.indexOf(key) : -1
  })()

  return (
    <section className="weekly-calendar">
      <h2 className="weekly-calendar__title">📅 My Week</h2>

      <div className="weekly-calendar__grid">
        {DAY_KEYS.map((day, i) => {
          const isToday    = i === todayIndex
          const classes    = CLASS_SCHEDULE[day]
          const hasClasses = classes.length > 0

          return (
            <div
              key={day}
              className={`wc-day ${isToday ? 'wc-day--today' : ''} ${!hasClasses ? 'wc-day--free' : ''}`}
            >
              <span className="wc-day__name">{day}</span>

              {hasClasses ? (
                <ul className="wc-classes">
                  {classes.map((cls) => (
                    <li
                      key={cls.subject + cls.start}
                      className="wc-class"
                      style={{ backgroundColor: cls.color }}
                    >
                      <span className="wc-class__subject">{cls.subject}</span>
                      <span className="wc-class__time">
                        {fmt(cls.start)} – {fmt(cls.end)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="wc-day__free-label">Libre 🎉</span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
