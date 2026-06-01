import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { authService } from '../firebase/firebaseConfig'
import { BackButton } from '../components/ui/BackButton'
import { FormMessage } from '../components/ui/FormMessage'
import '../styles/ScheduleAppointment.css'
import '../styles/ui.css'
import logoJoyu from '../assets/home-icons/Logo de Joyu oscuro.svg'

export const ScheduleAppointment = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [reason, setReason] = useState('')
  const [mode, setMode] = useState<'In person' | 'Virtual'>('In person')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState(false)

  const handleSchedule = async () => {
    setFormError(null)
    if (!reason.trim()) {
      setFormError('Please enter a reason for the consultation.')
      return
    }
    if (!user?.uid) {
      setFormError('Error: No user session found.')
      return
    }
    //INSERT la razon y modo de la cita y queda en pending
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

      setFormSuccess(true)
      setTimeout(() => navigate('/my-appointments'), 2000)
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error saving appointment:', err.message)
        setFormError(`Could not send request: ${err.message}`)
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
        <BackButton onClick={() => navigate(-1)} className="back-button-solo" />

        <h1 className="schedule-header">Request an Appointment</h1>

        <div className="schedule-card">
          <label htmlFor="schedule-reason" className="sr-only">Reason for the consultation</label>
          <input
            id="schedule-reason"
            type="text"
            placeholder="Reason for the consultation"
            className="input-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
            aria-label="Reason for the consultation"
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

          {formError   && <FormMessage type="error">  {formError}</FormMessage>}
          {formSuccess && <FormMessage type="success">✅ Your request has been sent! Redirecting…</FormMessage>}

          <button
            className="btn-schedule"
            onClick={handleSchedule}
            disabled={loading || formSuccess}
          >
            {loading ? 'Sending request...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  )
}
