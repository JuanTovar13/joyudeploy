import '../styles/home.css'

import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckInForm } from '../components/Form/CheckInForm'
import { supabase } from '../lib/supabaseClient'
import { getRecommendation, type GroqRecommendation } from '../lib/groqClient'
import type { JoyuItem } from '../types'
import { AuthContext } from '../context/AuthContext'
import { authService } from '../firebase/firebaseConfig'
import { signOut } from 'firebase/auth'

import { HomeHeader }     from '../components/estudiante/HomeHeader'
import { CheckInCard }    from '../components/estudiante/CheckInCard'
import { QuoteCard }      from '../components/estudiante/QuoteCard'
import { ActivitiesCard } from '../components/estudiante/ActivitiesCard'
import { ActionsRow }     from '../components/estudiante/ActionsRow'

const checkinKey   = (uid: string) => `joyu_checkin_done_${uid}`
const recommendKey = (uid: string) => `joyu_recommendation_${uid}`

const DEFAULT_REC: GroqRecommendation = {
  message:  'Listen to your emotions, take care of your mind, and bloom.',
  activity: '',
}

export const Home = () => {
  const [joyuItems, setJoyuItems]     = useState<JoyuItem[]>([])
  const [loading, setLoading]         = useState(true)
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [rec, setRec]                 = useState<GroqRecommendation>(DEFAULT_REC)
  const [loadingRec, setLoadingRec]   = useState(false)
  const [recError, setRecError]       = useState(false)

  const context = useContext(AuthContext)
  const uid = context?.user?.uid
  const navigate = useNavigate()

  // Cargar recomendación guardada y decidir si mostrar el check-in
  useEffect(() => {
    if (!uid) return

    const saved = localStorage.getItem(recommendKey(uid))
    if (saved) {
      try {
        setRec(JSON.parse(saved))
      } catch {
        setRec({ message: saved, activity: '' })
      }
    }

    const alreadyDone = localStorage.getItem(checkinKey(uid))
    if (!alreadyDone) setShowCheckIn(true)
  }, [uid])

  useEffect(() => {
    async function fetchActivities() {
      const { data, error } = await supabase.from('activities').select('*')
      if (error) {
        console.error('Error fetching activities:', error)
      } else {
        setJoyuItems(data || [])
      }
      setLoading(false)
    }
    fetchActivities()
  }, [])

  // Llamar a Groq, guardar y mostrar la recomendación
  const handleCheckInDone = async (answers?: Record<string, string>) => {
    if (uid) localStorage.setItem(checkinKey(uid), 'true')
    setShowCheckIn(false)

    if (!answers) return

    setRecError(false)
    setLoadingRec(true)
    try {
      const activityTitles = joyuItems.map((item) => item.title)
      const result = await getRecommendation(answers, activityTitles)
      setRec(result)
      if (uid) localStorage.setItem(recommendKey(uid), JSON.stringify(result))
    } catch (err) {
      console.error('[Home] Groq recommendation failed:', err)
      setRecError(true)
    } finally {
      setLoadingRec(false)
    }
  }

  if (loading) {
    return <div className="home-screen">Loading activities...</div>
  }

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
          <QuoteCard loadingRec={loadingRec} recError={recError} rec={rec} />
        </div>

        <div className="home-right-column">
          <ActivitiesCard items={joyuItems} />
        </div>
      </main>

      <ActionsRow
        onSchedule={() => navigate('/schedule')}
        onAppointments={() => navigate('/my-appointments')}
        onStudyPlanner={() => navigate('/study-planner')}
      />

      <div className="decor-hills"></div>

      {showCheckIn && (
        <CheckInForm
          onClose={() => handleCheckInDone()}
          onComplete={(answers) => handleCheckInDone(answers)}
        />
      )}
    </div>
  )
}
