import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabaseClient'
import type { JoyuItem } from '../../types'

interface ActivitiesState {
  items: JoyuItem[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}

const initialState: ActivitiesState = {
  items: [],
  status: 'idle',
}

export const fetchActivities = createAsyncThunk<JoyuItem[]>(
  'activities/fetchAll',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase.from('activities').select('*')
    if (error) return rejectWithValue(error.message)
    return data as JoyuItem[]
  },
)

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
  },
})

export default activitiesSlice.reducer
