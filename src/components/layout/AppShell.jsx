/**
 * layout/AppShell.jsx — Futura Leyenda branded shell
 */

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import useStore from '@/store/index.js'

function TickerStrip({ matches }) {
  const liveOrRecent = matches.filter(m => m.status === 'live' || m.status === 'finished')
  if (liveOrRecent.length === 0) return null
  const items = [...liveOrRecent, ...liveOrRecent]
  return (
    <div className="bg-navy-800 border-b border-gold/10 overflow-hidden h-9 flex items-center">
      <div className="flex-shrink-0 px-3 bg-live text-white text-xs font-bold h-full flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-slow" />
        EN VIVO
      </div>
      <div className="overflow-hidden flex-1">
        <div className="flex animate-ticker whitespace-nowrap">
          {items.map((match, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-6 text-xs text-white/70">
              <span>{match.homeTeam.flag} {match.homeTeam.code}</span>
              {match.result ? (
                <span className="font-display font-bold text-gold text-sm">
                  {match.result.home} – {match.result.away}
                </span>
              ) : (
                <span className="text-white/30">vs</span>
              )}
              <span>{match.awayTeam.code} {match.awayTeam.flag}</span>
              <span className="text-white/10 mx-2">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function NavLink({ to, children, onClick, mobile = false }) {
  const location = useLocation()
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/')
  return (
    <Link
      to={to}
      onClick={onClick}
      className={clsx(
        'rounded-lg font-medium transition-all duration-150',
        mobile ? 'block px-4 py-3 text-sm' : 'px-3 py-2 text-sm',
        isActive
          ? 'text-gold bg-gold/10'
          : 'text-white/60 hover:text-white hover:bg-white/5'
      )}
    >
      {children}
    </Link>
  )
}

function Navbar({ currentUser, onLogout }) {
  const isAdmin = currentUser?.role === 'admin'
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = () => setMobileOpen(false)

  return (
    <nav className="bg-navy border-b border-white/8 sticky top-0 z-50 shadow-navy">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
          <span className="text-2xl group-hover:animate-float transition-all">🏆</span>
          <div className="leading-tight">
            <span className="block font-display font-bold text-gold text-base tracking-widest">
              FUTURA LEYENDA
            </span>
            <span className="block text-[9px] text-white/30 font-body tracking-[0.25em] uppercase -mt-0.5">
              Mundial 2026 · Maximiliano
            </span>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/leaderboard">Tabla</NavLink>
          <NavLink to="/messages">Mensaje a Maxi</NavLink>
          {currentUser && <NavLink to="/predictions">Predicción</NavLink>}
          {currentUser && <NavLink to="/dashboard">Mi Marcador</NavLink>}
          {isAdmin && <NavLink to="/admin">⚙️ Admin</NavLink>}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(open => !open)}
            className="sm:hidden w-10 h-10 rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
          >
            <span className="text-xl leading-none">{mobileOpen ? '×' : '☰'}</span>
          </button>
          {currentUser ? (
            <>
              <span className="hidden sm:flex items-center gap-1.5 text-sm text-white/50">
                <span>{currentUser.avatar}</span>
                <span className="font-medium text-white/70">{currentUser.displayName}</span>
              </span>
              <button
                onClick={onLogout}
                className="text-white/40 hover:text-white/80 text-sm transition-colors px-2 py-1"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white/60 hover:text-white text-sm transition-colors px-3 py-2">
                Entrar
              </Link>
              <Link
                to="/register"
                className="bg-gold text-navy text-sm font-bold px-4 py-2 rounded-xl hover:bg-gold-light transition-colors shadow-gold-sm"
              >
                Unirse
              </Link>
            </>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="sm:hidden border-t border-white/8 bg-navy-800">
          <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">
            <NavLink to="/" mobile onClick={closeMobile}>Inicio</NavLink>
            <NavLink to="/leaderboard" mobile onClick={closeMobile}>Tabla</NavLink>
            <NavLink to="/messages" mobile onClick={closeMobile}>Mensaje a Maxi</NavLink>
            {currentUser && <NavLink to="/predictions" mobile onClick={closeMobile}>Predicción</NavLink>}
            {currentUser && <NavLink to="/dashboard" mobile onClick={closeMobile}>Mi Marcador</NavLink>}
            {isAdmin && <NavLink to="/admin" mobile onClick={closeMobile}>⚙️ Admin</NavLink>}
          </div>
        </div>
      )}
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-navy border-t border-gold/10 py-10 mt-20">
      <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
        <div className="text-3xl mb-3">🏆</div>
        <p className="font-display text-gold/80 text-sm tracking-wider">
          FUTURA LEYENDA · MUNDIAL 2026
        </p>
        <p className="text-white/30 text-xs font-body max-w-md mx-auto leading-relaxed">
          Hoy jugamos por una copa. Pero la verdadera victoria será conocer a Maximiliano.
        </p>
      </div>
    </footer>
  )
}

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
