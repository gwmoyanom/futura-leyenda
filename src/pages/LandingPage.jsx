/**
 * pages/LandingPage.jsx
 *
 * Public homepage. Shows:
 * - Hero with countdown to first match
 * - Live/finished match results grid
 * - CTA buttons (register / login)
 */

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useStore from '@/store/index.js'
import MatchCard from '@/components/participant/MatchCard.jsx'
import Button from '@/components/ui/Button.jsx'
import { Spinner } from '@/components/ui/index.jsx'
import { groupMatchesByDate, formatDateLabel } from '@/utils/date.utils.js'

// ─── Hero section ─────────────────────────────────────────────────────────────

function Hero({ currentUser }) {
  return (
    <section className="bg-night rounded-2xl px-8 py-16 text-center mb-10 relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-gold/5 rounded-full" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-pitch/10 rounded-full" />
      </div>

      <div className="relative z-10">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-3 tracking-wide">
          POLLA MUNDIALISTA
        </h1>
        <p className="text-gold font-display text-xl font-medium mb-2 tracking-widest">
          MUNDIAL 2026
        </p>
        <p className="text-white/50 text-sm font-body mb-8 max-w-md mx-auto">
          Predice los resultados, compite con tus amigos y gana el título de
          mejor pronosticador de la baby shower 🍼⚽
        </p>

        {!currentUser ? (
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/register">
              <Button size="lg">
                ⚽ Registrarme
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                Entrar
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/predictions">
              <Button size="lg">
                📋 Mis Predicciones
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button size="lg" variant="outline">
                📊 Ver Tabla
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── How it works section ─────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    { icon: '📝', title: 'Regístrate', desc: 'Crea tu cuenta y espera la aprobación del organizador' },
    { icon: '⚽', title: 'Predice', desc: 'Ingresa tus marcadores antes de cada partido' },
    { icon: '📊', title: 'Puntúa', desc: 'Resultado exacto = 3pts · Resultado correcto = 1pt' },
    { icon: '🏆', title: '¡Gana!', desc: 'El más acertado se lleva el trofeo el día de la baby shower' },
  ]

  return (
    <section className="mb-10">
      <h2 className="font-display text-2xl font-bold text-night mb-6 text-center tracking-wide">
        ¿CÓMO FUNCIONA?
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <div key={i} className="bg-white rounded-card border border-gray-100 p-5 text-center shadow-card">
            <div className="text-3xl mb-3">{step.icon}</div>
            <h3 className="font-semibold text-night text-sm mb-1">{step.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Match results grid ───────────────────────────────────────────────────────

function MatchGrid({ matches }) {
  const grouped = groupMatchesByDate(matches)
  const dateKeys = Object.keys(grouped).sort()

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        Aún no hay partidos programados
      </div>
    )
  }

  return (
    <section>
      <h2 className="font-display text-2xl font-bold text-night mb-6 tracking-wide">
        PARTIDOS
      </h2>
      <div className="space-y-8">
        {dateKeys.map(dateKey => (
          <div key={dateKey}>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-200 capitalize">
              {formatDateLabel(dateKey)}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped[dateKey].map(match => (
                <MatchCard key={match.id} match={match} mode="view" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { matches, loading, error, loadAll, currentUser } = useStore()

  useEffect(() => {
    loadAll()
  }, [loadAll])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500 text-sm">
        Error cargando datos: {error}
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <Hero currentUser={currentUser} />
      <HowItWorks />
      <MatchGrid matches={matches} />
    </div>
  )
}
