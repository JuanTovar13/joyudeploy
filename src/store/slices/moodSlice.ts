import { createSlice } from '@reduxjs/toolkit'

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

const moodSlice = createSlice({
  name: 'mood',
  initialState,
  reducers: {},
})

export default moodSlice.reducer
