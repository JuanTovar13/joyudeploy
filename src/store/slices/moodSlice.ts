import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabaseClient'

export interface MoodEntry {
  date: string
  emotion: string
}

interface MoodState {
  entries: MoodEntry[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}

const initialState: MoodState = {
  entries: [],
  status: 'idle',
}

export const fetchMoodEntries = createAsyncThunk<MoodEntry[], string>(
  'mood/fetchEntries',
  async (userId, { rejectWithValue }) => {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const fromDate = thirtyDaysAgo.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('mood_entries')
        .select('date, emotion')
        .eq('user_id', userId)
        .gte('date', fromDate)
        .order('date', { ascending: true })

      if (error) return rejectWithValue(error.message)
      return (data ?? []) as MoodEntry[]
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error')
    }
  }
)

const moodSlice = createSlice({
  name: 'mood',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMoodEntries.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchMoodEntries.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.entries = action.payload
      })
      .addCase(fetchMoodEntries.rejected, (state) => {
        state.status = 'failed'
      })
  },
})

export default moodSlice.reducer
