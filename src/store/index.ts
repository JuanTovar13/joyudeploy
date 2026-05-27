import { configureStore } from '@reduxjs/toolkit'
import authReducer          from './slices/authSlice'
import studyPlannerReducer  from './slices/studyPlannerSlice'
import appointmentsReducer  from './slices/appointmentsSlice'
import activitiesReducer    from './slices/activitiesSlice'
import recommendationReducer from './slices/recommendationSlice'

export const store = configureStore({
  reducer: {
    auth:           authReducer,
    studyPlanner:   studyPlannerReducer,
    appointments:   appointmentsReducer,
    activities:     activitiesReducer,
    recommendation: recommendationReducer,
  },
})

export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
