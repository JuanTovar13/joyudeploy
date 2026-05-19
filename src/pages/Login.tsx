import { useNavigate, Link } from 'react-router-dom'
import '../styles/global.css'
import '../styles/auth.css'
import logo from '../assets/logo.svg'
import { BackgroundHills } from '../components/BackgroundHills'
import { authService } from '../firebase/firebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { supabase } from '../lib/supabaseClient'
import React, { useState } from 'react'

export const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const credential = await signInWithEmailAndPassword(authService, email, password)
      // Fetch role from Supabase and redirect accordingly
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('uid', credential.user.uid)
        .maybeSingle()
      const role = data?.role ?? 'student'
      navigate(role === 'psychologist' ? '/psychologist' : '/home')
    } catch (error: any) {
      const errorCode = error.code
      const errorMessage = error.message
      console.error('Error logging in:', errorCode, errorMessage)
      alert('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
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
        <form onSubmit={handleLogin}>
          <input
            className='input'
            placeholder="Email Address"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <input
            className='input'
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <div className="remember">
            <input type="checkbox" />
            <label>Remember me</label>
          </div>
          <button className='button' type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <Link to="/register" className="link">
          Or Sign up
        </Link>
      </div>
    </div>
  )
}
