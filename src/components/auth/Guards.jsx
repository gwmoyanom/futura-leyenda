/**
 * auth/Guards.jsx
 *
 * Route protection components.
 * Wrap any route element with these to enforce access control.
 *
 * Usage in router:
 *   <Route path="/predictions" element={<RequireAuth><PredictionsPage /></RequireAuth>} />
 *   <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
 */

import { Navigate, useLocation } from 'react-router-dom'
import useStore from '@/store/index.js'

/**
 * Requires the user to be logged in.
 * Redirects to /login and preserves the intended destination.
 */
export function RequireAuth({ children }) {
  const currentUser = useStore(s => s.currentUser)
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

/**
 * Requires the user to have admin role.
 * Redirects non-admins to the homepage.
 */
export function RequireAdmin({ children }) {
  const currentUser = useStore(s => s.currentUser)
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (currentUser.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

/**
 * Redirects already-logged-in users away from login/register pages.
 */
export function RedirectIfAuth({ children }) {
  const currentUser = useStore(s => s.currentUser)

  if (currentUser) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
