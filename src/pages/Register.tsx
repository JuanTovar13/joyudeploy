import { useNavigate, Link } from 'react-router-dom'
import '../styles/global.css'
import '../styles/auth.css'
import logo from '../assets/logo.svg'
import { BackgroundHills } from '../components/BackgroundHills'
import React, { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { authService } from '../firebase/firebaseConfig'
import { supabase } from '../lib/supabaseClient'
import { SkipToMain } from '../components/SkipToMain'

export const Register = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [displayName, setDisplayName] = useState<string>('')
  const [role, setRole] = useState<'student' | 'psychologist'>('student')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(authService, email, password)
      if (userCredential) {
        await updateProfile(userCredential.user, { displayName })
        // Save role in Supabase profiles
        await supabase.from('profiles').insert([{
          uid: userCredential.user.uid,
          role,
          display_name: displayName,
          email,
        }])
      }
      navigate(role === 'psychologist' ? '/psychologist' : '/home')
    } catch (error: any) {
      const errorCode = error.code
      const errorMessage = error.message
      console.error('Error registering user:', errorCode, errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <SkipToMain />
    <div id="main-content" className="container">
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
            disabled={loading}
          />
          <input
            placeholder="Name"
            className='input'
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={loading}
          />
          <input
            placeholder="Password"
            className='input'
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          {/* Role selection */}
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn${role === 'student' ? ' role-btn--active' : ''}`}
              onClick={() => setRole('student')}
            >
              🎓 Student
            </button>
            <button
              type="button"
              className={`role-btn${role === 'psychologist' ? ' role-btn--active' : ''}`}
              onClick={() => setRole('psychologist')}
            >
              🩺 Psychologist
            </button>
          </div>

          <div className="remember">
            <input type="checkbox" />
            <label>Remember me</label>
          </div>
          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <Link to="/login" className="link">
          Or Log in
        </Link>
      </div>
    </div>
    </>
  )
}
