/**
 * layout/AppShell.jsx
 *
 * Root layout wrapper used by all pages.
 * Renders: TickerStrip (top) → Navbar → page content → Footer
 */

import { Link, useNavigate, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import useStore from '@/store/index.js'

// ─── Live match ticker strip ──────────────────────────────────────────────────

function TickerStrip({ matches }) {
  const liveOrRecent = matches.filter(
    m => m.status === 'live' || m.status === 'finished'
  )

  if (liveOrRecent.length === 0) return null

  // Duplicate for seamless loop
  const items = [...liveOrRecent, ...liveOrRecent]

  return (
    <div className="bg-night-800 border-b border-white/5 overflow-hidden h-9 flex items-center">
      <div className="flex-shrink-0 px-3 bg-live text-white text-xs font-bold h-full flex items-center">
        🔴 EN DIRECTO
      </div>
      <div className="overflow-hidden flex-1">
        <div className="flex animate-ticker whitespace-nowrap">
          {items.map((match, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-6 text-xs text-white/80">
              <span>{match.homeTeam.flag} {match.homeTeam.code}</span>
              {match.result ? (
                <span className="font-display font-bold text-gold text-sm">
                  {match.result.home} – {match.result.away}
                </span>
              ) : (
                <span className="text-white/40">vs</span>
              )}
              <span>{match.awayTeam.code} {match.awayTeam.flag}</span>
              <span className="text-white/20 mx-2">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function NavLink({ to, children }) {
  const location = useLocation()
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <Link
      to={to}
      className={clsx(
        'px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
        isActive
          ? 'bg-white/10 text-gold'
          : 'text-white/70 hover:text-white hover:bg-white/5'
      )}
    >
      {children}
    </Link>
  )
}

function Navbar({ currentUser, onLogout }) {
  const isAdmin = currentUser?.role === 'admin'

  return (
    <nav className="bg-night border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <span className="text-2xl">🏆</span>
          <div className="leading-tight">
            <span className="block font-display font-bold text-gold text-base tracking-wide">
              POLLA MUNDIALISTA
            </span>
            <span className="block text-[10px] text-white/40 font-body -mt-0.5">
              2026
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-1">
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/leaderboard">Tabla</NavLink>
          {currentUser && <NavLink to="/predictions">Mis Predicciones</NavLink>}
          {currentUser && <NavLink to="/dashboard">Mi Marcador</NavLink>}
          {isAdmin && <NavLink to="/admin">⚙️ Admin</NavLink>}
        </div>

        {/* Auth actions */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              <span className="hidden sm:flex items-center gap-1.5 text-sm text-white/60">
                <span>{currentUser.avatar}</span>
                <span>{currentUser.displayName}</span>
              </span>
              <button
                onClick={onLogout}
                className="text-white/50 hover:text-white text-sm transition-colors px-2 py-1"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white/70 hover:text-white text-sm transition-colors px-3 py-2"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="bg-gold text-night text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gold-light transition-colors"
              >
                Unirse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-night-800 border-t border-white/5 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-white/30 text-xs font-body">
          🏆 Polla Mundialista 2026 · Hecho con ❤️ para la baby shower
        </p>
      </div>
    </footer>
  )
}

// ─── App Shell ────────────────────────────────────────────────────────────────

export default function AppShell({ children }) {
  const { currentUser, logout, matches } = useStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <TickerStrip matches={matches} />
      <Navbar currentUser={currentUser} onLogout={handleLogout} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
