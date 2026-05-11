import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient' 
import { useAuth } from '../context/AuthContext'
import '../styles/ScheduleAppointment.css'

// Importamos el logo
import logoJoyu from '../assets/home-icons/Logo de Joyu oscuro.svg'

export function ScheduleAppointment() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [reason, setReason] = useState('')
  const [date, setDate] = useState('')
  const [hour, setHour] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSchedule = async () => {
    if (!reason || !date || !hour) {
      alert('Por favor, completa todos los campos')
      return
    }

    if (!user?.uid) {
      alert('Error: No se encontró sesión de usuario.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('appointments').insert([
        {
          user_id: user.uid, 
          reason: reason,
          date: date,
          hour: hour,
          mode: 'In person',
          status: 'scheduled',
          professional_name: 'Maria Elvira Rosa',
          professional_image: 'https://cdn-icons-png.flaticon.com/512/387/387561.png'
        }
      ])

      if (error) throw error

      alert('¡Cita agendada con éxito!')
      navigate('/my-appointments')
    } catch (err: unknown) {
      // CORRECCIÓN AQUÍ: Manejo de error tipo 'unknown' en lugar de 'any'
      if (err instanceof Error) {
        console.error('Error detallado:', err.message)
        alert(`Error al guardar: ${err.message}`)
      } else {
        console.error('Error inesperado:', err)
        alert('Ocurrió un error inesperado al guardar la cita.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="schedule-screen">
      <div className="hero-section">
        <img src={logoJoyu} alt="Joyu Logo" className="hero-logo-large" />
      </div>

      <div className="schedule-container">
        <button className="back-button-solo" onClick={() => navigate(-1)}>
          <span>‹</span>
        </button>
        
        <h1 className="schedule-header">Appointments Available</h1>

        <div className="schedule-card">
          <input 
            type="text" 
            placeholder="Reason for the consultation" 
            className="input-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
          />

          <div className="calendar-section">
            <label>Select a Date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
          </div>

          <select 
            className="time-select" 
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            disabled={loading}
          >
            <option value="">Select an Hour</option>
            <option value="09:00 AM">09:00 AM</option>
            <option value="10:00 AM">10:00 AM</option>
            <option value="11:00 AM">11:00 AM</option>
            <option value="03:00 PM">03:00 PM</option>
            <option value="04:00 PM">04:00 PM</option>
          </select>

          <button 
            className="btn-schedule" 
            onClick={handleSchedule}
            disabled={loading}
          >
            {loading ? 'Scheduling...' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  )
}