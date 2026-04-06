import { useNavigate } from 'react-router-dom' // 1. Importamos el salto
import { Input } from '../components/Input'
import '../styles/global.css'
import '../styles/auth.css'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { BackgroundHills } from '../components/BackgroundHills'

export const Register = () => {
  const navigate = useNavigate() 

  
  const handleRegister = () => {
    
    navigate('/home')
  }

  return (
    <div className="container">
      <img src={logo} className="auth-logo" />
      <BackgroundHills />
      <div className="content">
        <h2 className="title">
          Sign up with your
          <br />
          institutional account
        </h2>

        <Input placeholder="Email Address" />
        <Input placeholder="Name" />
        <Input placeholder="Password" type="password" />

        <div className="remember">
          <input type="checkbox" />
          <label>Remember me</label>
        </div>

        {/* 4. Activamos el botón de registro */}
        <button className="button" onClick={handleRegister}>
          Signup
        </button>

        <Link to="/login" className="link">
          Or Log in
        </Link>
      </div>
    </div>
  )
}