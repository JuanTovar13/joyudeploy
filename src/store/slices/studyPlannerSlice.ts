import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface StudyPlannerState {
  todaySessionsCompleted: number
  totalFocusTimeToday: number
}

const defaultStudyPlannerState: StudyPlannerState = {
  todaySessionsCompleted: 0,
  totalFocusTimeToday: 0,
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
        return { todaySessionsCompleted, totalFocusTimeToday }
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
  },
})

export const { incrementSessions, addFocusTime } = studyPlannerSlice.actions
export default studyPlannerSlice.reducer
