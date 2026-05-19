import { Routes, Route } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Home } from './pages/Home'
import circularFont from './assets/Circular.ttf'
import { ProtectedRoute } from './utils/ProtectedRoute'
import { RoleRoute } from './utils/RoleRoute'
import { AuthProvider } from './context/AuthContext'
import { StudyPlanner } from './pages/StudyPlanner'
import { ScheduleAppointment } from './pages/ScheduleAppointment'
import { AppointmentsList } from './pages/AppointmentsList'
import { PsychologistDashboard } from './pages/PsychologistDashboard'


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

        {/* ── Student routes ── */}
        <Route
          path="/home"
          element={
            <RoleRoute allowedRole="student">
              <Home />
            </RoleRoute>
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

        <Route
          path="/schedule"
          element={
            <RoleRoute allowedRole="student">
              <ScheduleAppointment />
            </RoleRoute>
          }
        />

        <Route
          path="/my-appointments"
          element={
            <RoleRoute allowedRole="student">
              <AppointmentsList />
            </RoleRoute>
          }
        />

        {/* ── Psychologist routes ── */}
        <Route
          path="/psychologist"
          element={
            <RoleRoute allowedRole="psychologist">
              <PsychologistDashboard />
            </RoleRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
