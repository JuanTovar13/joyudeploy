import '../styles/home.css'

import { supabase } from '../lib/supabaseClient'
import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckInForm } from '../components/estudiante/Form/CheckInForm'
import { AuthContext } from '../context/AuthContext'
import { authService } from '../firebase/firebaseConfig'
import { signOut } from 'firebase/auth'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchActivities, fetchActivitySchedules } from '../store/slices/activitiesSlice'
import { fetchRecommendation, loadPersistedRecommendation } from '../store/slices/recommendationSlice'
import { fetchAppointments } from '../store/slices/appointmentsSlice'

import type { GroqRecommendation } from '../lib/groqClient'

import { HomeHeader }     from '../components/estudiante/HomeHeader'
import { CheckInCard }    from '../components/estudiante/CheckInCard'
import { QuoteCard }      from '../components/estudiante/QuoteCard'
import { ActionsRow }        from '../components/estudiante/ActionsRow'
import { WeeklyCalendar }    from '../components/estudiante/WeeklyCalendar'
import { ActivitiesBanner }  from '../components/estudiante/ActivitiesBanner'
import '../styles/WeeklyCalendar.css'
import '../styles/ActivitiesBanner.css'

const checkinKey   = (uid: string) => `joyu_checkin_done_${uid}`
const recommendKey = (uid: string) => `joyu_recommendation_${uid}`

const DEFAULT_REC: GroqRecommendation = {
  message:    'Listen to your emotions, take care of your mind, and bloom.',
  activities: [],
}

export const Home = () => {
  const dispatch = useAppDispatch()

  const {
    items: joyuItems,
    schedules: activitySchedules,
    status: activitiesStatus,
    schedulesStatus,
  } = useAppSelector((state) => state.activities)

  const { status: appointmentsStatus } = useAppSelector((state) => state.appointments)
  const { data: rec, status: recStatus } = useAppSelector(
    (state) => state.recommendation,
  )

  const [showCheckIn, setShowCheckIn] = useState(false)
  const [showMonthly, setShowMonthly] = useState(false)

  const context = useContext(AuthContext)
  const uid = context?.user?.uid
  const navigate = useNavigate()

  // Fetch activities + schedules once on mount
  useEffect(() => {
    if (activitiesStatus === 'idle') void dispatch(fetchActivities())
  }, [dispatch, activitiesStatus])

  useEffect(() => {
    if (schedulesStatus === 'idle') void dispatch(fetchActivitySchedules())
  }, [dispatch, schedulesStatus])

  useEffect(() => {
    if (uid && appointmentsStatus === 'idle') void dispatch(fetchAppointments(uid))
  }, [dispatch, uid, appointmentsStatus])

  // Load persisted recommendation and decide whether to show check-in
  useEffect(() => {
    if (!uid) return

    const saved = localStorage.getItem(recommendKey(uid))
    if (saved) {
      try {
        dispatch(loadPersistedRecommendation(JSON.parse(saved)))
      } catch {
        // ignore malformed cache
      }
    }

    const alreadyDone = localStorage.getItem(checkinKey(uid))
    if (!alreadyDone) setShowCheckIn(true)
  }, [uid, dispatch])

  const handleCheckInDone = async (answers?: Record<string, string>) => {
    if (uid) localStorage.setItem(checkinKey(uid), 'true')
    setShowCheckIn(false)

    if (!answers || !uid) return

    const today = new Date().toISOString().split('T')[0]
    const emotion = answers.emotion ?? 'Neutral'

    await supabase
      .from('mood_entries')
      .upsert(
        { user_id: uid, date: today, emotion },
        { onConflict: 'user_id,date' }
      )

    const activityTitles = joyuItems.map((item) => item.title)
    void dispatch(fetchRecommendation({ answers, activities: activityTitles, uid }))
  }

  if (activitiesStatus === 'loading' || activitiesStatus === 'idle') {
    return <div className="home-screen">Loading activities...</div>
  }

  const loadingRec = recStatus === 'loading'
  const recError   = recStatus === 'failed'
  const recData    = rec ?? DEFAULT_REC

  return (
    <div className="home-screen">
      

      <div className="home-white-background"></div>

      <HomeHeader displayName={context?.user?.displayName} />

      <ActivitiesBanner items={joyuItems} schedules={activitySchedules} />

      <div className="home-cards-row">
        <CheckInCard onClick={() => setShowCheckIn(true)} />
        <QuoteCard loadingRec={loadingRec} recError={recError} rec={recData} />
      </div>

      <WeeklyCalendar />

      <ActionsRow
        onSchedule={() => navigate('/schedule')}
        onAppointments={() => navigate('/my-appointments')}
        onStudyPlanner={() => navigate('/study-planner')}
      />

      <button className="home-signout-btn" onClick={() => signOut(authService)}>
        Sign Out
      </button>

      {showCheckIn && (
        <CheckInForm
          onClose={() => handleCheckInDone()}
          onComplete={(answers) => handleCheckInDone(answers)}
        />
      )}
    </div>
  )
}
