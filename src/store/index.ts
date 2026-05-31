import { configureStore } from '@reduxjs/toolkit'
import authReducer          from './slices/authSlice'
import studyPlannerReducer  from './slices/studyPlannerSlice'
import appointmentsReducer  from './slices/appointmentsSlice'
import activitiesReducer    from './slices/activitiesSlice'
import recommendationReducer from './slices/recommendationSlice'
import calendarReducer       from './slices/calendarSlice'
import moodReducer           from './slices/moodSlice'

export const store = configureStore({
  reducer: {
    auth:           authReducer,
    studyPlanner:   studyPlannerReducer,
    appointments:   appointmentsReducer,
    activities:     activitiesReducer,
    recommendation: recommendationReducer,
    calendar:       calendarReducer,
    mood:           moodReducer,
  },
})

export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
