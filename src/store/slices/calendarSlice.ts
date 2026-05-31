import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ActivitySchedule } from '../../types'

const PALETTE = [
  '#FFB7B2', '#FFDAC1', '#E2F0CB',
  '#B5EAD7', '#C7CEEA', '#D4A5E4', '#A8D8EA',
]

export interface CalendarEntry {
  schedule:      ActivitySchedule
  activityTitle: string
  color:         string
}

interface CalendarState {
  entries: CalendarEntry[]
}

const initialState: CalendarState = { entries: [] }

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    addScheduleEntry(
      state,
      action: PayloadAction<{ schedule: ActivitySchedule; activityTitle: string }>,
    ) {
      // Avoid duplicate entries
      if (state.entries.some(e => e.schedule.id === action.payload.schedule.id)) return
      const color = PALETTE[state.entries.length % PALETTE.length]
      state.entries.push({ ...action.payload, color })
    },
    removeScheduleEntry(state, action: PayloadAction<string>) {
      state.entries = state.entries.filter(e => e.schedule.id !== action.payload)
    },
    clearCalendarEntries(state) {
      state.entries = []
    },
  },
})

export const { addScheduleEntry, removeScheduleEntry, clearCalendarEntries } =
  calendarSlice.actions
export default calendarSlice.reducer
