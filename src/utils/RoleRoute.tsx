import { useContext, type PropsWithChildren } from 'react'
import { AuthContext } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

interface RoleRouteProps extends PropsWithChildren {
  allowedRole: 'student' | 'psychologist'
}

export const RoleRoute = ({ children, allowedRole }: RoleRouteProps) => {
  const auth = useContext(AuthContext)

  if (auth === undefined) {
    throw new Error('RoleRoute must be used within an AuthProvider')
  }

  if (auth.isAuthLoading) {
    return (
      <div role="status" aria-live="polite" style={{ padding: '2rem', textAlign: 'center' }}>
        Loading…
      </div>
    )
  }

  if (!auth.user) {
    return <Navigate to="/login" replace />
  }

  if (auth.role !== null && auth.role !== allowedRole) {
    return <Navigate to={auth.role === 'psychologist' ? '/psychologist' : '/home'} replace />
  }

  return children
}
