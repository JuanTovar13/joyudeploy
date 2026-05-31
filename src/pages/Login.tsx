import { useNavigate, Link } from 'react-router-dom'
import '../styles/global.css'
import '../styles/auth.css'
import logo from '../assets/logo.svg'
import { BackgroundHills } from '../components/BackgroundHills'
import { authService } from '../firebase/firebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { supabase } from '../lib/supabaseClient'
import React, { useState } from 'react'
import { SkipToMain } from '../components/SkipToMain'
import { FormMessage } from '../components/ui/FormMessage'

export const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoginError(null)
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
      console.error('Error logging in:', error.code, error.message)
      setLoginError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <SkipToMain />
    <div id="main-content" className="container">
      <img src={logo} className="auth-logo" alt="JoyU logo" />
      <BackgroundHills />
      <div className="content">
        <h2 className="title">
          Log in with your
          <br />
          institutional account
        </h2>
        <form onSubmit={handleLogin}>
          <label htmlFor="login-email" className="sr-only">Email Address</label>
          <input
            id="login-email"
            className='input'
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            aria-label="Email Address"
          />
          <label htmlFor="login-password" className="sr-only">Password</label>
          <input
            id="login-password"
            className='input'
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            aria-label="Password"
          />
          <div className="remember">
            <input type="checkbox" id="login-remember" />
            <label htmlFor="login-remember">Remember me</label>
          </div>
          {loginError && <FormMessage type="error">{loginError}</FormMessage>}
          <button className='button' type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <Link to="/register" className="link">
          Or Sign up
        </Link>
      </div>
    </div>
    </>
  )
}
