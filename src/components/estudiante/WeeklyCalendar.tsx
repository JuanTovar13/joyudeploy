interface ClassItem {
  subject: string
  start: string
  end: string
  color: string
}

type DayKey = 'Lun' | 'Mar' | 'Mié' | 'Jue' | 'Vie'

const SUBJECT_COLORS: Record<string, string> = {
  'Ecosistemas':           '#B5EAD7',
  'HCI':                   '#C7CEEA',
  'Programación Web':      '#A7DFFF',
  'Arte y Tecnología':     '#FFDAC1',
  'Investigación en Diseño': '#FFB7B2',
}

const SCHEDULE: Record<DayKey, ClassItem[]> = {
  Lun: [
    { subject: 'Ecosistemas',      start: '7:00',  end: '10:00', color: SUBJECT_COLORS['Ecosistemas'] },
    { subject: 'HCI',              start: '11:00', end: '13:00', color: SUBJECT_COLORS['HCI'] },
    { subject: 'Programación Web', start: '17:00', end: '20:00', color: SUBJECT_COLORS['Programación Web'] },
  ],
  Mar: [
    { subject: 'Arte y Tecnología', start: '10:00', end: '13:00', color: SUBJECT_COLORS['Arte y Tecnología'] },
  ],
  Mié: [
    { subject: 'HCI', start: '9:00', end: '13:00', color: SUBJECT_COLORS['HCI'] },
  ],
  Jue: [
    { subject: 'Programación Web', start: '17:00', end: '19:00', color: SUBJECT_COLORS['Programación Web'] },
  ],
  Vie: [
    { subject: 'Ecosistemas',              start: '7:00',  end: '9:00',  color: SUBJECT_COLORS['Ecosistemas'] },
    { subject: 'Investigación en Diseño',  start: '14:00', end: '17:00', color: SUBJECT_COLORS['Investigación en Diseño'] },
  ],
}

const DAY_KEYS: DayKey[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']

// js getDay(): 0=Sun,1=Mon,...,5=Fri,6=Sat → map to index 0-4
const JS_DAY_TO_INDEX: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 }

const fmt = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour   = h > 12 ? h - 12 : h === 0 ? 12 : h
  return m === 0 ? `${hour}${suffix}` : `${hour}:${m.toString().padStart(2, '0')}${suffix}`
}

export const WeeklyCalendar = () => {
  const todayIndex = JS_DAY_TO_INDEX[new Date().getDay()] ?? -1

  return (
    <section className="weekly-calendar">
      <h2 className="weekly-calendar__title">📅 My Week</h2>

      <div className="weekly-calendar__grid">
        {DAY_KEYS.map((day, i) => {
          const isToday   = i === todayIndex
          const classes   = SCHEDULE[day]
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
