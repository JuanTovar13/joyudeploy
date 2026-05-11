import '../styles/home.css'

import burbujaChat from '../assets/home-icons/Burbuja de Chat con Carita.svg'
import caraFrase from '../assets/home-icons/Cara sonriente(frase motivadora).svg'
import enojado from '../assets/home-icons/EnojadoMolesto (AmarilloVerde).svg'
import feliz from '../assets/home-icons/FelizRadiante (MoradoLila).svg'
import iconoCalendario from '../assets/home-icons/icono de Calendario.svg'
import logoJoyuOscuro from '../assets/home-icons/Logo de Joyu oscuro.svg'
import neutral from '../assets/home-icons/NeutralCalmado (Verde claro).svg'
import triste from '../assets/home-icons/TristeCansado (Azul).svg'

import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckInForm } from '../components/Form/CheckInForm'
import { supabase } from '../lib/supabaseClient'
import { getRecommendation, type GroqRecommendation } from '../lib/groqClient'
import type { JoyuItem } from '../types'
import { AuthContext } from '../context/AuthContext'
import { authService } from '../firebase/firebaseConfig'
import { signOut } from 'firebase/auth'

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
        // guardado antiguo en formato string plano
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
      const result = await getRecommendation(answers)
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

      {/* Contenedor blanco redondeado al fondo */}
      <div className="home-white-background"></div>

      {/* Header Superior */}
      <header className="home-header">
        <div className="user-greeting">
          <h1 className="title-font">Hi, {context?.user?.displayName || 'User'}</h1>
          <p>How are you feeling today?</p>
        </div>
        <img src={logoJoyuOscuro} alt="Joyu Logo" className="home-logo" />
      </header>

      <main className="home-content">
        {/* Sección Izquierda */}
        <div className="home-left-column">
          <section
            className="check-in-card"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowCheckIn(true)}
          >
            <h2>Ready to check in?</h2>
            <p>Take this quick test</p>
            <div className="emotions-grid">
              <img src={triste}  alt="Triste" />
              <img src={enojado} alt="Enojado" />
              <img src={neutral} alt="Neutral" />
              <img src={feliz}   alt="Feliz" />
            </div>
          </section>

          {/* Quote-card con frase motivadora + actividad recomendada */}
          <section className="quote-card">
            {loadingRec ? (
              <div className="quote-loading">
                <span className="quote-dot" />
                <span className="quote-dot" />
                <span className="quote-dot" />
              </div>
            ) : recError ? (
              <p className="quote-error">
                Could not load your recommendation. Try the check-in again!
              </p>
            ) : (
              <div className="quote-content">
                <p>{rec.message}</p>
                {rec.activity && (
                  <span className="quote-activity-badge">
                    ✦Recommended activity: {rec.activity}
                  </span>
                )}
              </div>
            )}
            <img src={caraFrase} alt="Smiley" />
          </section>
        </div>

        {/* Sección Derecha */}
        <div className="home-right-column">
          <section className="activities-card">
            <div className="activities-header">
              <h2>Next recommended activities</h2>
              <button className="view-all">See all</button>
            </div>
            <div className="activities-grid">
              {joyuItems.map((item) => (
                <div key={item.id} className="activity-item">
                  <img src={item.image} alt={item.title} />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Fila de Acciones Inferior - Aquí conectamos las rutas */}
      <section className="home-actions-row">
        <button 
          className="action-card action-card-schedule"
          onClick={() => navigate('/schedule')}
        >
          <span>Schedule Appointment</span>
          <img src={iconoCalendario} alt="Calendar" />
        </button>

        <button 
          className="action-card action-card-see"
          onClick={() => navigate('/my-appointments')}
        >
          <span>See Appointments</span>
          <img src={burbujaChat} alt="Chat" />
        </button>

        <button
          className="action-card action-card-study"
          onClick={() => navigate('/study-planner')}
          aria-label="Go to Study Planner"
        >
          <span>Study<br />Planner</span>
          <img src={iconoCalendario} alt="" aria-hidden="true" />
        </button>
      </section>

      {/* Decoración inferior (Colinas) */}
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