import { useState } from 'react'
import '../../styles/checkin.css'

const questions = [
  {
    id: 'emotion',
    text: '¿Cómo te has sentido emocionalmente esta semana?',
    options: ['Muy bien', 'Bien', 'Neutral', 'Estresado/a', 'Agotado/a'],
  },
  {
    id: 'pressure',
    text: '¿Qué te está generando más presión actualmente?',
    options: ['Exámenes', 'Tareas y proyectos', 'Problemas personales', 'Falta de tiempo', 'Problemas económicos'],
  },
  {
    id: 'sleep',
    text: '¿Cuántas horas sueles dormir al día?',
    options: ['Menos de 4', '4–5 horas', '6–7 horas', '8 horas', 'Más de 8 horas'],
  },
  {
    id: 'relax',
    text: '¿Qué actividad disfrutas más para relajarte?',
    options: ['Escuchar música', 'Hacer ejercicio', 'Ver series o videos', 'Hablar con amigos', 'Dibujar o crear arte'],
  },
  {
    id: 'need',
    text: '¿Qué necesitas más en este momento?',
    options: ['Relajarme', 'Organizar mi tiempo', 'Sentirme motivado/a', 'Hablar con alguien', 'Mejorar mi ánimo'],
  },
]

type Answers = Record<string, string>

type Props = {
  onComplete?: (answers: Answers) => void
  onClose?: () => void
}

export const CheckInForm = ({ onComplete, onClose }: Props) => {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [submitted, setSubmitted] = useState(false)

  const current = questions[step]
  const selected = answers[current.id]
  const isLast = step === questions.length - 1

  const handleSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: option }))
  }

  const handleNext = () => {
    if (!selected) return
    if (isLast) {
      setSubmitted(true)
      onComplete?.(answers)
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  if (submitted) {
    return (
      <div className="checkin-overlay">
        <div className="checkin-card">
          <div className="checkin-success">
            <div className="checkin-success-emoji">🌟</div>
            <h2>¡Gracias por tu check-in!</h2>
            <p>Tus respuestas nos ayudan a recomendarte actividades personalizadas para ti.</p>
            <button className="checkin-btn-primary" onClick={onClose}>
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkin-overlay">
      <div className="checkin-card">
        {/* Header */}
        <div className="checkin-header">
          <button className="checkin-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
          <span className="checkin-label">Check-in semanal</span>
        </div>

        {/* Progress bar */}
        <div className="checkin-progress-track">
          <div
            className="checkin-progress-fill"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>
        <p className="checkin-step-count">
          {step + 1} de {questions.length}
        </p>

        {/* Question */}
        <h2 className="checkin-question">{current.text}</h2>

        {/* Options */}
        <div className="checkin-options">
          {current.options.map((option) => (
            <button
              key={option}
              className={`checkin-option ${selected === option ? 'checkin-option--selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              <span className="checkin-option-dot" />
              {option}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="checkin-nav">
          {step > 0 && (
            <button className="checkin-btn-secondary" onClick={handleBack}>
              Atrás
            </button>
          )}
          <button
            className="checkin-btn-primary"
            onClick={handleNext}
            disabled={!selected}
          >
            {isLast ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  )
}
