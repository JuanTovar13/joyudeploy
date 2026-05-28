// Student's academic class schedule — mocked data.
// The `day` keys here ('Lun' | 'Mar' | 'Mié' | 'Jue' | 'Vie') must match
// the values stored in the `activity_schedules.day` column in Supabase.

export interface ClassSlot {
  subject: string
  start: string  // "H:MM"  24-hour
  end: string    // "H:MM"
  color: string
}

export type WeekDayKey = 'Lun' | 'Mar' | 'Mié' | 'Jue' | 'Vie'

export const SUBJECT_COLORS: Record<string, string> = {
  'Ecosistemas':              '#B5EAD7',
  'HCI':                      '#C7CEEA',
  'Programación Web':         '#A7DFFF',
  'Arte y Tecnología':        '#FFDAC1',
  'Investigación en Diseño':  '#FFB7B2',
}

export const CLASS_SCHEDULE: Record<WeekDayKey, ClassSlot[]> = {
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
    { subject: 'Ecosistemas',             start: '7:00',  end: '9:00',  color: SUBJECT_COLORS['Ecosistemas'] },
    { subject: 'Investigación en Diseño', start: '14:00', end: '17:00', color: SUBJECT_COLORS['Investigación en Diseño'] },
  ],
}

// JS Date.getDay() → WeekDayKey (undefined on weekends)
export const JS_DAY_TO_KEY: Partial<Record<number, WeekDayKey>> = {
  1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie',
}

export const getTodayKey = (): WeekDayKey | undefined =>
  JS_DAY_TO_KEY[new Date().getDay()]

// Returns true if two time intervals overlap.
// Accepts "H:MM", "HH:MM", or "HH:MM:SS" strings.
export const timesOverlap = (
  aStart: string, aEnd: string,
  bStart: string, bEnd: string,
): boolean => {
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  return toMin(aStart) < toMin(bEnd) && toMin(bStart) < toMin(aEnd)
}
