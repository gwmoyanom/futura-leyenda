/**
 * App.jsx — Futura Leyenda
 *
 * Root component. Handles the intro animation on first visit,
 * then renders the main router.
 */

import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell.jsx'
import IntroAnimation from '@/components/layout/IntroAnimation.jsx'
import { RequireAuth, RequireAdmin, RedirectIfAuth } from '@/components/auth/Guards.jsx'

import LandingPage               from '@/pages/LandingPage.jsx'
import { LoginPage, RegisterPage } from '@/pages/AuthPages.jsx'
import LeaderboardPage           from '@/pages/LeaderboardPage.jsx'
import PredictionsPage           from '@/pages/participant/PredictionsPage.jsx'
import DashboardPage             from '@/pages/participant/DashboardPage.jsx'
import AdminPage                 from '@/pages/admin/AdminPage.jsx'

function NotFound() {
  return (
    <div className="text-center py-24">
      <div className="text-6xl mb-4 animate-float">🔍</div>
      <h1 className="font-display text-4xl font-bold text-navy mb-3 tracking-wide">
        PÁGINA NO ENCONTRADA
      </h1>
      <p className="text-gray-400 text-sm mb-8">El árbitro expulsó esta página del campo</p>
      <a href="/" className="bg-gold text-navy font-bold px-6 py-3 rounded-xl hover:bg-gold-light transition-colors">
        Volver al inicio
      </a>
    </div>
  )
}

export default function App() {
  // Show intro only once per browser session
  const [showIntro, setShowIntro] = useState(
    () => !sessionStorage.getItem('intro_seen')
  )

  if (showIntro) {
    return <IntroAnimation onComplete={() => setShowIntro(false)} />
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/"            element={<LandingPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/login"    element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
        <Route path="/register" element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>} />
        <Route path="/predictions" element={<RequireAuth><PredictionsPage /></RequireAuth>} />
        <Route path="/dashboard"   element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/admin"       element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        <Route path="/admin/*"     element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        <Route path="*"            element={<NotFound />} />
      </Routes>
    </AppShell>
  )
}
