import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Home } from './pages/Home'
import circularFont from './assets/Circular.ttf'

function App() {
  const miFuente = new FontFace('title', `url(${circularFont}) format("truetype")`)
  miFuente
    .load()
    .then(function (loadedFont) {
      document.fonts.add(loadedFont)
    })
    .catch(function (error) {
      console.error('Error al cargar la fuente:', error)
    })

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
