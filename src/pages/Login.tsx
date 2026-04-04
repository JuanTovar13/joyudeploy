import { useNavigate } from 'react-router-dom' // 1. Importamos el salto
import { Input } from '../components/Input'
import '../styles/global.css'
import '../styles/auth.css'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { BackgroundHills } from '../components/BackgroundHills'

export const Login = () => {
  const navigate = useNavigate() // 2. Inicializamos el navegador

  // 3. Esta función es la que hace la magia
  const handleLogin = () => {
    // Aquí iría la lógica de validar correo/password, 
    // pero por ahora, ¡directo al Home!
    navigate('/home')
  }

  return (
    <div className="container">
      <img src={logo} className="auth-logo" />
      <BackgroundHills />
      <div className="content">
        <h2 className="title">
          Log in with your
          <br />
          institutional account
        </h2>

        <Input placeholder="Email Address" />
        <Input placeholder="Password" type="password" />

        <div className="remember">
          <input type="checkbox" />
          <label>Remember me</label>
        </div>

        {/* 4. Le ponemos el onClick a su botón */}
        <button className="button" onClick={handleLogin}>
          Log in
        </button>

        <Link to="/register" className="link">
          Or Sign up
        </Link>
      </div>
    </div>
  )
}