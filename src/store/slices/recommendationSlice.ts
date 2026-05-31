import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { getRecommendation, type GroqRecommendation } from '../../lib/groqRecommendations'

interface RecommendationState {
  data: GroqRecommendation | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}

const initialState: RecommendationState = {
  data: null,
  status: 'idle',
}

interface FetchRecommendationArgs {
  answers: Record<string, string>
  activities: string[]
  uid: string
}

export const fetchRecommendation = createAsyncThunk<GroqRecommendation, FetchRecommendationArgs>(
  'recommendation/fetch',
  async ({ answers, activities, uid }, { rejectWithValue }) => {
    try {
      const result = await getRecommendation(answers, activities)
      localStorage.setItem(`joyu_recommendation_${uid}`, JSON.stringify(result))
      return result
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error')
    }
  },
)

const recommendationSlice = createSlice({
  name: 'recommendation',
  initialState,
  reducers: {
    loadPersistedRecommendation(state, action: PayloadAction<GroqRecommendation>) {
      state.data = action.payload
      state.status = 'succeeded'
    },
    clearRecommendation(state) {
      state.data = null
      state.status = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendation.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchRecommendation.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload
      })
      .addCase(fetchRecommendation.rejected, (state) => {
        state.status = 'failed'
      })
  },
})

export const { loadPersistedRecommendation, clearRecommendation } = recommendationSlice.actions
export default recommendationSlice.reducer
