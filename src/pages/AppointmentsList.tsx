import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import logoJoyu from '../assets/home-icons/Logo de Joyu oscuro.svg'
import '../styles/AppointmentsList.css'

// SVGs
import mujerCard from '../assets/MUJER.svg'
import hillsBottom from '../assets/hills.svg'

interface Appointment {
  id: string
  reason: string
  date: string
  hour: string
  mode: string
  status: string
  professional_name: string
  professional_image: string
}

export function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchAppointments() {
      if (!user?.uid) return

      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', user.uid)
          .order('created_at', { ascending: false })

        if (error) throw error
        if (data) setAppointments(data as Appointment[])
      } catch (err: unknown) {
        // Corrección para el error de TypeScript
        if (err instanceof Error) {
          console.error('Error fetching appointments:', err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user])

  return (
    <div className="list-screen-container">
      <div className="list-header-section">
        <button className="back-button-top" onClick={() => navigate('/home')}>
          <span>‹</span>
        </button>
        <h1 className="list-title">Appointments Available</h1>
        <img src={logoJoyu} alt="Joyu" className="list-logo-right" />
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Loading appointments...</p>
        </div>
      ) : (
        <div className="appointments-grid-container">
          {appointments.map((app) => (
            <div key={app.id} className="appointment-card-v2">
              <img src={mujerCard} alt="" className="card-background-svg" />
              
              <div className="card-content-overlay">
                <div className="left-info">
                  <h3 className="prof-name">{app.professional_name}</h3>
                  <div className="details-text">
                    <p><strong>Time:</strong> {app.hour}</p>
                    <p><strong>Mode:</strong> {app.mode}</p>
                  </div>
                </div>
                
                <div className="right-actions">
                  <button className="btn-reschedule">Reschedule</button>
                  <button className="btn-cancel">Cancel appointment</button>
                </div>
              </div>
            </div>
          ))}
          
          <Link to="/schedule" className="btn-new-appointment-v2">
            Schedule New
          </Link>
        </div>
      )}

      <div className="decor-hills-bottom">
        <img src={hillsBottom} alt="" className="hills-svg-image" />
      </div>
    </div>
  )
}