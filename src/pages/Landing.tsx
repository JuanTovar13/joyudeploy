import '../styles/global.css'
import '../styles/landing.css'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { BackgroundDecor } from '../components/BackgroundDecor'

export const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="landing">
      <BackgroundDecor />
      <div className="landing-content">
        <img src={logo} className="landing-logo" />
        <div className="landing-text">
          <h1>
            Begin your journey towards
            <br />
            better well-being
          </h1>

          <button className="landing-button button" onClick={() => navigate('/login')}>
            Start
          </button>
        </div>
      </div>
    </div>
  )
}
