import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface StudyPlannerState {
  todaySessionsCompleted: number
  totalFocusTimeToday: number
}

const initialState: StudyPlannerState = {
  todaySessionsCompleted: 0,
  totalFocusTimeToday: 0,
}

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
