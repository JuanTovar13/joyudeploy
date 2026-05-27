import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabaseClient'
import type { JoyuItem, ActivitySchedule } from '../../types'

interface ActivitiesState {
  items: JoyuItem[]
  schedules: ActivitySchedule[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  schedulesStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
}

const initialState: ActivitiesState = {
  items: [],
  schedules: [],
  status: 'idle',
  schedulesStatus: 'idle',
}

export const fetchActivities = createAsyncThunk<JoyuItem[]>(
  'activities/fetchAll',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase.from('activities').select('*')
    if (error) {
      console.error('[activitiesSlice] fetchActivities error:', error.message)
      return rejectWithValue(error.message)
    }
    if (!data || data.length === 0) {
      console.warn('[activitiesSlice] fetchActivities returned empty — check RLS policies on the activities table')
    }
    return data as JoyuItem[]
  },
)

export const fetchActivitySchedules = createAsyncThunk<ActivitySchedule[]>(
  'activities/fetchSchedules',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('activity_schedules')
      .select('*')
      .order('day')
      .order('start_time')
    if (error) {
      console.error('[activitiesSlice] fetchActivitySchedules error:', error.message)
      return rejectWithValue(error.message)
    }
    return data as ActivitySchedule[]
  },
)

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ── fetchActivities ──────────────────────────────────
      .addCase(fetchActivities.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchActivities.rejected, (state) => {
        state.status = 'failed'
      })
      // ── fetchActivitySchedules ───────────────────────────
      .addCase(fetchActivitySchedules.pending, (state) => {
        state.schedulesStatus = 'loading'
      })
      .addCase(fetchActivitySchedules.fulfilled, (state, action) => {
        state.schedulesStatus = 'succeeded'
        state.schedules = action.payload
      })
      .addCase(fetchActivitySchedules.rejected, (state) => {
        state.schedulesStatus = 'failed'
      })
  },
})

export default activitiesSlice.reducer
