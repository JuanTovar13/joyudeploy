import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabaseClient'
import type { Appointment } from '../../types'

interface AppointmentsState {
  items: Appointment[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  cancellingId: string | null
}

const initialState: AppointmentsState = {
  items: [],
  status: 'idle',
  error: null,
  cancellingId: null,
}

export const fetchAppointments = createAsyncThunk<Appointment[], string>(
  'appointments/fetchAll',
  async (userId, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) return rejectWithValue(error.message)
    return data as Appointment[]
  },
)

export const cancelAppointment = createAsyncThunk<string, string>(
  'appointments/cancel',
  async (appointmentId, { rejectWithValue }) => {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId)

    if (error) return rejectWithValue(error.message)
    return appointmentId
  },
)

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearAppointments(state) {
      state.items = []
      state.status = 'idle'
      state.error = null
      state.cancellingId = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      .addCase(cancelAppointment.pending, (state, action) => {
        state.cancellingId = action.meta.arg
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.cancellingId = null
        state.items = state.items.filter((a) => a.id !== action.payload)
      })
      .addCase(cancelAppointment.rejected, (state) => {
        state.cancellingId = null
      })
  },
})

export const { clearAppointments } = appointmentsSlice.actions
export default appointmentsSlice.reducer
