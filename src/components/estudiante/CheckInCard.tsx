import enojado from '../../assets/home-icons/EnojadoMolesto (AmarilloVerde).svg'
import feliz from '../../assets/home-icons/FelizRadiante (MoradoLila).svg'
import neutral from '../../assets/home-icons/NeutralCalmado (Verde claro).svg'
import triste from '../../assets/home-icons/TristeCansado (Azul).svg'

interface CheckInCardProps {
  onClick: () => void
}

export const CheckInCard = ({ onClick }: CheckInCardProps) => {
  return (
    <section className="check-in-card" style={{ cursor: 'pointer' }} onClick={onClick}>
      <h2>Ready to check in?</h2>
      <p>Take this quick test</p>
      <div className="emotions-grid">
        <img src={triste}  alt="Sad" />
        <img src={enojado} alt="Angry" />
        <img src={neutral} alt="Neutral" />
        <img src={feliz}   alt="Happy" />
      </div>
    </section>
  )
}
