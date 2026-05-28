import '../styles/home.css'

import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckInForm } from '../components/estudiante/Form/CheckInForm'
import { AuthContext } from '../context/AuthContext'
import { authService } from '../firebase/firebaseConfig'
import { signOut } from 'firebase/auth'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchActivities, fetchActivitySchedules } from '../store/slices/activitiesSlice'
import { fetchRecommendation, loadPersistedRecommendation } from '../store/slices/recommendationSlice'

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
  message:  'Listen to your emotions, take care of your mind, and bloom.',
  activity: '',
}

export const Home = () => {
  const dispatch = useAppDispatch()

  const {
    items: joyuItems,
    schedules: activitySchedules,
    status: activitiesStatus,
    schedulesStatus,
  } = useAppSelector((state) => state.activities)
  const { data: rec, status: recStatus } = useAppSelector(
    (state) => state.recommendation,
  )

  const [showCheckIn, setShowCheckIn] = useState(false)

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
      <button
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 10,
          padding: '8px 15px',
          borderRadius: '20px',
          border: 'none',
          backgroundColor: '#ff4d4d',
          color: 'white',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
        onClick={() => signOut(authService)}
      >
        Sign Out
      </button>

      <div className="home-white-background"></div>

      <HomeHeader displayName={context?.user?.displayName} />

      <main className="home-content">
        <div className="home-left-column">
          <CheckInCard onClick={() => setShowCheckIn(true)} />
          <QuoteCard loadingRec={loadingRec} recError={recError} rec={recData} />
        </div>

        <div className="home-right-column">
          <ActivitiesBanner items={joyuItems} schedules={activitySchedules} />
        </div>
      </main>

      <WeeklyCalendar />

      <ActionsRow
        onSchedule={() => navigate('/schedule')}
        onAppointments={() => navigate('/my-appointments')}
        onStudyPlanner={() => navigate('/study-planner')}
      />

      {showCheckIn && (
        <CheckInForm
          onClose={() => handleCheckInDone()}
          onComplete={(answers) => handleCheckInDone(answers)}
        />
      )}
    </div>
  )
}
