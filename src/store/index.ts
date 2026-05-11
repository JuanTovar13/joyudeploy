import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import studyPlannerReducer from './slices/studyPlannerSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    studyPlanner: studyPlannerReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
