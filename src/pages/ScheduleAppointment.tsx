import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { authService } from '../firebase/firebaseConfig'
import '../styles/ScheduleAppointment.css'
import logoJoyu from '../assets/home-icons/Logo de Joyu oscuro.svg'

export function ScheduleAppointment() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [reason, setReason] = useState('')
  const [mode, setMode] = useState<'In person' | 'Virtual'>('In person')
  const [loading, setLoading] = useState(false)

  const handleSchedule = async () => {
    if (!reason.trim()) {
      alert('Please enter a reason for the consultation')
      return
    }
    if (!user?.uid) {
      alert('Error: No user session found.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('appointments').insert([{
        user_id: user.uid,
        student_name: authService.currentUser?.displayName ?? user.displayName ?? user.email ?? 'Student',
        reason: reason.trim(),
        mode,
        status: 'pending',
        date: null,
        hour: null,
        professional_name: null,
        professional_image: null,
      }])

      if (error) throw error

      alert('Your request has been sent! A psychologist will confirm the date and time soon.')
      navigate('/my-appointments')
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error saving appointment:', err.message)
        alert(`Error saving: ${err.message}`)
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

        <h1 className="schedule-header">Request an Appointment</h1>

        <div className="schedule-card">
          <input
            type="text"
            placeholder="Reason for the consultation"
            className="input-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
          />

          {/* Mode selector */}
          <div className="mode-selector">
            <button
              type="button"
              className={`mode-btn${mode === 'In person' ? ' mode-btn--active' : ''}`}
              onClick={() => setMode('In person')}
              disabled={loading}
            >
              🏢 In person
            </button>
            <button
              type="button"
              className={`mode-btn${mode === 'Virtual' ? ' mode-btn--active' : ''}`}
              onClick={() => setMode('Virtual')}
              disabled={loading}
            >
              💻 Virtual
            </button>
          </div>

          <p className="schedule-note">
            📅 A psychologist will review your request and confirm a date and time.
          </p>

          <button
            className="btn-schedule"
            onClick={handleSchedule}
            disabled={loading}
          >
            {loading ? 'Sending request...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  )
}
