export interface JoyuItem {
  id: string
  title: string
  category: string
  image: string | null
}

export interface ActivitySchedule {
  id: string
  activity_id: string
  level: string | null
  day: string
  start_time: string   // "HH:MM:SS" — time without time zone
  end_time: string
  location: string | null
  teacher: string | null
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type TimerStatus = 'idle' | 'running' | 'paused' | 'break'

export type SessionType = 'work' | 'short-break' | 'long-break'

export interface Task {
  id: string
  title: string
  completed: boolean
  estimated_pomodoros: number
  completed_pomodoros: number
  created_at: string
  user_id: string
}

export interface PomodoroConfig {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsBeforeLongBreak: number
}

export const DEFAULT_CONFIG: PomodoroConfig = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  sessionsBeforeLongBreak: 4,
}
export interface Appointment {
  id: string
  user_id: string
  student_name: string | null
  psychologist_id: string | null
  reason: string
  date: string | null
  hour: string | null
  mode: 'In person' | 'Virtual'
  professional_name: string
  professional_image: string
  status: 'pending' | 'scheduled' | 'cancelled' | 'rescheduled'
  created_at: string
}