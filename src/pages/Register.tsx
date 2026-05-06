import { useNavigate } from 'react-router-dom' // 1. Importamos el salto
import '../styles/global.css'
import '../styles/auth.css'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { BackgroundHills } from '../components/BackgroundHills'
import React, { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { authService } from '../firebase/firebaseConfig'

export const Register = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [displayName, setDisplayName] = useState<string>('')
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
    const userCredential = await createUserWithEmailAndPassword(authService, email, password)
    if (userCredential) {
      await updateProfile(userCredential.user, {
        displayName,
      })
    }
      navigate('/home')
      } catch(error: any)  {
        const errorCode = error.code
        const errorMessage = error.message
        console.error('Error registering user:', errorCode, errorMessage)
        // ..
      }
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
        <form onSubmit={handleRegister}>
          <input
            placeholder="Email Address"
            className='input'
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Name"
            className='input'
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <input
            placeholder="Password"
            className='input'
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="remember">
            <input type="checkbox" />
            <label>Remember me</label>
          </div>
          {/* 4. Activamos el botón de registro */}
          <button className="button" type="submit">
            Signup
          </button>
        </form>

        <Link to="/login" className="link">
          Or Log in
        </Link>
      </div>
    </div>
  )
}

