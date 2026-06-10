/**
 * App.jsx
 *
 * Root component. Defines all routes and wraps them in AppShell.
 *
 * Route structure:
 *   /               → Landing (public)
 *   /login          → Login (public, redirects if already authed)
 *   /register       → Register (public, redirects if already authed)
 *   /leaderboard    → Leaderboard (public)
 *   /predictions    → My Predictions (requires auth)
 *   /dashboard      → My Dashboard (requires auth)
 *   /admin          → Admin Panel (requires admin role)
 *   *               → 404
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell.jsx'
import { RequireAuth, RequireAdmin, RedirectIfAuth } from '@/components/auth/Guards.jsx'

import LandingPage       from '@/pages/LandingPage.jsx'
import { LoginPage, RegisterPage } from '@/pages/AuthPages.jsx'
import LeaderboardPage   from '@/pages/LeaderboardPage.jsx'
import PredictionsPage   from '@/pages/participant/PredictionsPage.jsx'
import DashboardPage     from '@/pages/participant/DashboardPage.jsx'
import AdminPage         from '@/pages/admin/AdminPage.jsx'

// ─── 404 page ─────────────────────────────────────────────────────────────────

function NotFound() {
  return (
    <div className="text-center py-24">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="font-display text-4xl font-bold text-night mb-3 tracking-wide">
        PÁGINA NO ENCONTRADA
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        El árbitro expulsó esta página del campo
      </p>
      <a
        href="/"
        className="bg-gold text-night font-semibold px-6 py-3 rounded-xl hover:bg-gold-light transition-colors"
      >
        Volver al inicio
      </a>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AppShell>
      <Routes>
        {/* Public routes */}
        <Route path="/"            element={<LandingPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />

        {/* Auth routes — redirect away if already logged in */}
        <Route path="/login"    element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
        <Route path="/register" element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>} />

        {/* Protected participant routes */}
        <Route path="/predictions" element={<RequireAuth><PredictionsPage /></RequireAuth>} />
        <Route path="/dashboard"   element={<RequireAuth><DashboardPage /></RequireAuth>} />

        {/* Protected admin routes */}
        <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        <Route path="/admin/*" element={<RequireAdmin><AdminPage /></RequireAdmin>} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  )
}
