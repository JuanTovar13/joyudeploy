import { Routes, Route } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Home } from './pages/Home'
import circularFont from './assets/Circular.ttf'
import { ProtectedRoute } from './utils/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { StudyPlanner } from './pages/StudyPlanner'

import { ScheduleAppointment } from './pages/ScheduleAppointment'
import { AppointmentsList } from './pages/AppointmentsList'


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
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/study-planner"
          element={
            <ProtectedRoute>
              <StudyPlanner />
            </ProtectedRoute>
          }
        />

        {/* --- NUEVAS RUTAS DE CITAS --- */}
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <ScheduleAppointment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute>
              <AppointmentsList />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App