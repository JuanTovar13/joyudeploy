import iconoCalendario from '../../assets/home-icons/icono de Calendario.svg'
import burbujaChat from '../../assets/home-icons/Burbuja de Chat con Carita.svg'

interface ActionsRowProps {
  onSchedule: () => void
  onAppointments: () => void
  onStudyPlanner: () => void
}

export function ActionsRow({ onSchedule, onAppointments, onStudyPlanner }: ActionsRowProps) {
  return (
    <section className="home-actions-row">
      <button className="action-card action-card-schedule" onClick={onSchedule}>
        <span>Schedule Appointment</span>
        <img src={iconoCalendario} alt="Calendar" />
      </button>

      <button className="action-card action-card-see" onClick={onAppointments}>
        <span>See Appointments</span>
        <img src={burbujaChat} alt="Chat" />
      </button>

      <button className="action-card action-card-study" onClick={onStudyPlanner}>
        <span>Study Planner</span>
        <img src={iconoCalendario} alt="Study" />
      </button>
    </section>
  )
}
