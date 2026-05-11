export interface JoyuItem {
  id: number | string;
  title: string;
  description: string;
  image: string;
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
  id: string;
  user_id: string;
  reason: string;
  date: string;
  hour: string;
  mode: 'In person' | 'Virtual';
  professional_name?: string;
  professional_image?: string;
  status: 'scheduled' | 'cancelled' | 'rescheduled';
}