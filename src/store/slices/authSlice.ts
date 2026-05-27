import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  role: 'student' | 'psychologist' | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  role: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload
      state.isAuthenticated = true
    },
    setRole(state, action: PayloadAction<'student' | 'psychologist' | null>) {
      state.role = action.payload
    },
    clearUser(state) {
      state.user = null
      state.isAuthenticated = false
      state.role = null
    },
  },
})

export const { setUser, setRole, clearUser } = authSlice.actions
export default authSlice.reducer
