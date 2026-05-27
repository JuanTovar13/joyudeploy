import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Task } from '../../types'

interface StudyPlannerState {
  todaySessionsCompleted: number
  totalFocusTimeToday: number
  activeTaskId: string | null
  activeTaskTitle: string | null
  tasks: Task[]
}

const defaultStudyPlannerState: StudyPlannerState = {
  todaySessionsCompleted: 0,
  totalFocusTimeToday: 0,
  activeTaskId: null,
  activeTaskTitle: null,
  tasks: [],
}

const readPersistedStudyPlannerState = (): StudyPlannerState => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const raw = localStorage.getItem(`joyu_study_sessions_${today}`)
    if (!raw) return defaultStudyPlannerState
    const parsed: unknown = JSON.parse(raw)
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'todaySessionsCompleted' in parsed &&
      'totalFocusTimeToday' in parsed
    ) {
      const rec = parsed as Record<string, unknown>
      const todaySessionsCompleted = Number(rec.todaySessionsCompleted)
      const totalFocusTimeToday = Number(rec.totalFocusTimeToday)
      if (
        Number.isFinite(todaySessionsCompleted) &&
        Number.isFinite(totalFocusTimeToday)
      ) {
        return {
          todaySessionsCompleted,
          totalFocusTimeToday,
          activeTaskId: null,
          activeTaskTitle: null,
          tasks: [],
        }
      }
    }
  } catch {
    /* ignore corrupt or missing storage */
  }
  return defaultStudyPlannerState
}

const initialState: StudyPlannerState = readPersistedStudyPlannerState()

const studyPlannerSlice = createSlice({
  name: 'studyPlanner',
  initialState,
  reducers: {
    incrementSessions(state) {
      state.todaySessionsCompleted += 1
    },
    //Acumula el tiempo total de enfoque del día en la unidad que el llamador defina
    addFocusTime(state, action: PayloadAction<number>) {
      state.totalFocusTimeToday += action.payload
    },
    setActiveTask(
      state,
      action: PayloadAction<{ id: string; title: string }>,
    ) {
      state.activeTaskId = action.payload.id
      state.activeTaskTitle = action.payload.title
    },
    clearActiveTask(state) {
      state.activeTaskId = null
      state.activeTaskTitle = null
    },
    setTasks(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload
    },
  },
})

export const { incrementSessions, addFocusTime, setActiveTask, clearActiveTask, setTasks } =
  studyPlannerSlice.actions
export default studyPlannerSlice.reducer
