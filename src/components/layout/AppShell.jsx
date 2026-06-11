/**
 * layout/AppShell.jsx — Futura Leyenda branded shell
 */

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import useStore from '@/store/index.js'

const AVATAR_OPTIONS = ['⚽', '🏆', '🎯', '⭐', '🌟', '🔥', '🥅', '🧤', '💛', '👶', '🎉', '🚀', '🇪🇨', '🇦🇷', '🇧🇷', '🇲🇽']

function TickerStrip({ matches = [], messages = [] }) {
  const liveOrRecent = matches.filter(m => m.status === 'live' || m.status === 'finished')
  const messageItems = messages.slice(0, 8)
  if (liveOrRecent.length === 0 && messageItems.length === 0) return null

  const items = [
    ...liveOrRecent.map(match => ({ type: 'match', match })),
    ...messageItems.map(message => ({ type: 'message', message })),
  ]
  const tickerItems = [...items, ...items]
  const hasLive = liveOrRecent.some(match => match.status === 'live')

  return (
    <div className="bg-navy-800 border-b border-gold/10 overflow-hidden h-9 flex items-center">
      <div className={clsx(
        'flex-shrink-0 px-3 text-white text-xs font-bold h-full flex items-center gap-1.5',
        hasLive ? 'bg-live' : 'bg-gold text-navy'
      )}>
        <span className={clsx(
          'w-1.5 h-1.5 rounded-full',
          hasLive ? 'bg-white animate-pulse-slow' : 'bg-navy'
        )} />
        {hasLive ? 'EN VIVO' : 'MAXI'}
      </div>
      <div className="overflow-hidden flex-1">
        <div className="flex animate-ticker whitespace-nowrap">
          {tickerItems.map((item, i) => {
            if (item.type === 'message') {
              const rawText = item.message.text || ''
              const text = rawText.length > 96
                ? `${rawText.slice(0, 96)}...`
                : rawText

              return (
                <span key={`${item.message.id}-${i}`} className="inline-flex items-center gap-2 px-6 text-xs text-white/70">
                  <span className="text-gold">Mensaje a Maxi</span>
                  <span className="text-white/80">"{text}"</span>
                  <span className="text-white/40">— {item.message.author}</span>
                  <span className="text-white/10 mx-2">·</span>
                </span>
              )
            }

            const match = item.match
            return (
              <span key={`${match.id}-${i}`} className="inline-flex items-center gap-2 px-6 text-xs text-white/70">
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
            )
          })}
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

function UserMenu({ currentUser, onLogout, onUpdateUser }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleAvatarSelect(avatar) {
    if (avatar === currentUser.avatar || saving) return

    setSaving(true)
    setError('')
    try {
      await onUpdateUser({ avatar })
    } catch (err) {
      setError(err.message || 'No se pudo guardar el avatar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        aria-expanded={open}
      >
        <span className="text-lg leading-none">{currentUser.avatar || '⚽'}</span>
        <span className="hidden max-w-28 truncate font-medium sm:inline">{currentUser.displayName}</span>
        <span className="text-white/35">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-gray-100 bg-white p-4 text-navy shadow-card-hover">
          <div className="mb-3">
            <p className="text-sm font-semibold">{currentUser.displayName}</p>
            <p className="text-xs text-gray-400">@{currentUser.username}</p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Avatar
            </p>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_OPTIONS.map(avatar => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => handleAvatarSelect(avatar)}
                  disabled={saving}
                  className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded-lg border text-lg transition-colors',
                    avatar === currentUser.avatar
                      ? 'border-gold bg-gold/15 shadow-gold-sm'
                      : 'border-gray-200 bg-white hover:border-gold hover:bg-gold/5',
                    saving && 'cursor-wait opacity-70'
                  )}
                  aria-label={`Usar avatar ${avatar}`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {saving && <p className="mt-3 text-xs font-medium text-gold-dark">Guardando...</p>}
          {error && <p className="mt-3 text-xs font-medium text-live">{error}</p>}

          <div className="mt-4 border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={onLogout}
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-50 hover:text-live"
            >
              Salir
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Navbar({ currentUser, onLogout, onUpdateUser }) {
  const isAdmin = currentUser?.role === 'admin'
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = () => setMobileOpen(false)

  return (
    <nav className="bg-navy border-b border-white/8 shadow-navy">
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
            <UserMenu
              currentUser={currentUser}
              onLogout={onLogout}
              onUpdateUser={onUpdateUser}
            />
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
  const { currentUser, logout, matches, maxiMessages, updateCurrentUser } = useStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <header className="sticky top-0 z-50">
        <TickerStrip matches={matches} messages={maxiMessages} />
        <Navbar currentUser={currentUser} onLogout={handleLogout} onUpdateUser={updateCurrentUser} />
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
