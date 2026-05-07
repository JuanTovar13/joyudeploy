import { useNavigate } from 'react-router-dom' // 1. Importamos el salto
import '../styles/global.css'
import '../styles/auth.css'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { BackgroundHills } from '../components/BackgroundHills'
import { authService } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

import { useState } from "react";

export const Login = () => {
  const navigate = useNavigate() 
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Login submitted");
    signInWithEmailAndPassword(authService, email, password)
  .then(() => {
    navigate("/home");
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Error logging in:", errorCode, errorMessage);
  });
    

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
        />
        <input
          className='input'
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="remember">
          <input type="checkbox" />
          <label>Remember me</label>
        </div>

        {/* 4. Le ponemos el onClick a su botón */}
        <button className='button' onClick={(e) => e.preventDefault}>
          Log in
        </button>
        </form>
        <Link to="/register" className="link">
          Or Sign up
        </Link>
      </div>
    </div>
  )
}