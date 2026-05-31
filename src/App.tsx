import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import circularFont from './assets/Circular.ttf'
import { ProtectedRoute } from './utils/ProtectedRoute'
import { RoleRoute } from './utils/RoleRoute'
import { AuthProvider } from './context/AuthContext'

const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })))
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })))
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })))
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })))
const StudyPlanner = lazy(() => import('./pages/StudyPlanner').then(m => ({ default: m.StudyPlanner })))
const ScheduleAppointment = lazy(() => import('./pages/ScheduleAppointment').then(m => ({ default: m.ScheduleAppointment })))
const AppointmentsList = lazy(() => import('./pages/AppointmentsList').then(m => ({ default: m.AppointmentsList })))
const PsychologistDashboard = lazy(() => import('./pages/PsychologistDashboard').then(m => ({ default: m.PsychologistDashboard })))
const ActivitiesPage = lazy(() => import('./pages/ActivitiesPage').then(m => ({ default: m.ActivitiesPage })))

const App = () => {
  const miFuente = new FontFace('title', `url(${circularFont}) format("truetype")`)
  miFuente.load().then((loadedFont) => {
    document.fonts.add(loadedFont)
  }).catch((error) => {
    console.error('Error al cargar la fuente:', error)
  })

  return (
    <AuthProvider>
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'Fredoka, sans-serif', fontSize: 24, color: '#262688' }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<RoleRoute allowedRole="student"><Home /></RoleRoute>} />
          <Route path="/study-planner" element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
          <Route path="/schedule" element={<RoleRoute allowedRole="student"><ScheduleAppointment /></RoleRoute>} />
          <Route path="/my-appointments" element={<RoleRoute allowedRole="student"><AppointmentsList /></RoleRoute>} />
          <Route path="/activities" element={<RoleRoute allowedRole="student"><ActivitiesPage /></RoleRoute>} />
          <Route path="/psychologist" element={<RoleRoute allowedRole="psychologist"><PsychologistDashboard /></RoleRoute>} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}

export default App
