import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface StudyPlannerState {
  todaySessionsCompleted: number
  totalFocusTimeToday: number
  activeTaskId: string | null
  activeTaskTitle: string | null
}

const defaultStudyPlannerState: StudyPlannerState = {
  todaySessionsCompleted: 0,
  totalFocusTimeToday: 0,
  activeTaskId: null,
  activeTaskTitle: null,
}

function readPersistedStudyPlannerState(): StudyPlannerState {
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
  },
})

export const { incrementSessions, addFocusTime, setActiveTask, clearActiveTask } =
  studyPlannerSlice.actions
export default studyPlannerSlice.reducer
