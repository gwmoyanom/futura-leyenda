/**
 * pages/LandingPage.jsx — Futura Leyenda
 *
 * Sections:
 * 1. Hero — "Futura Leyenda" with tagline and CTAs
 * 2. Baby profile — Maximiliano's card
 * 3. Countdown — live timer to birth
 * 4. How it works
 * 5. Live matches
 * 6. Messages for Maximiliano
 */

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useStore from '@/store/index.js'
import MatchCard from '@/components/participant/MatchCard.jsx'
import BirthCountdown from '@/components/participant/BirthCountdown.jsx'
import MessagesSection from '@/components/participant/MessagesSection.jsx'
import Button from '@/components/ui/Button.jsx'
import { Spinner } from '@/components/ui/index.jsx'
import { groupMatchesByDate, formatDateLabel } from '@/utils/date.utils.js'

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ currentUser }) {
  return (
    <section className="bg-hero-pattern rounded-2xl px-6 sm:px-12 py-20 text-center mb-16 relative overflow-hidden">
      {/* Decorative pitch lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-white" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
      </div>

      <div className="relative z-10 animate-slide-up">
        {/* Eyebrow */}
        <p className="font-body text-gold/60 text-xs tracking-[0.4em] uppercase mb-6">
          La Predicción del Mundial 2026
        </p>

        {/* Trophy */}
        <div className="text-7xl mb-6 trophy-glow inline-block animate-float">🏆</div>

        {/* Title */}
        <h1 className="font-display text-5xl sm:text-7xl font-bold text-gold-shimmer mb-4 tracking-wide leading-none">
          FUTURA<br />LEYENDA
        </h1>

        {/* Tagline */}
        <p className="text-white/60 font-body text-base sm:text-lg mb-2 max-w-xl mx-auto leading-relaxed">
          Mientras el mundo busca un campeón,
        </p>
        <p className="text-white font-body text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed font-medium">
          nosotros celebramos el nacimiento de una futura leyenda.
        </p>

        {/* CTAs */}
        {!currentUser ? (
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/register">
              <Button size="lg" className="shadow-gold">
                ⚽ Participar en la predicción
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button size="lg" variant="outline">
                📊 Ver la tabla
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/predictions">
              <Button size="lg" className="shadow-gold">
                📋 Mis predicciones
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button size="lg" variant="outline">
                📊 Tabla de posiciones
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Baby profile card ────────────────────────────────────────────────────────

function BabyProfile() {
  return (
    <section className="mb-16">
      <div className="bg-navy rounded-2xl overflow-hidden shadow-navy">
        <div className="grid sm:grid-cols-2">
          {/* Left: info */}
          <div className="p-8 sm:p-10">
            <p className="font-body text-gold/50 text-xs tracking-[0.3em] uppercase mb-4">
              La futura leyenda
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gold mb-6 tracking-wide">
              MAXIMILIANO
            </h2>
            <div className="space-y-3">
              {[
                { icon: '⭐', label: 'Nombre',              value: 'Maximiliano Moyano Rojas' },
                { icon: '📅', label: 'Fecha estimada',      value: '10 de Julio, 2026' },
                { icon: '🌍', label: 'Primer Mundial',       value: 'FIFA World Cup 2026' },
                { icon: '⚽', label: 'Equipo favorito',      value: 'Mi Ecuador del alma' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xl w-7 flex-shrink-0">{icon}</span>
                  <div>
                    <span className="text-white/40 text-xs font-body">{label}: </span>
                    <span className="text-white text-sm font-medium">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: countdown */}
          <div className="bg-navy-700 p-8 sm:p-10 flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-gold/10">
            <BirthCountdown />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── How it works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    { icon: '📝', title: 'Regístrate',  desc: 'Crea tu cuenta y espera la aprobación del organizador' },
    { icon: '⚽', title: 'Predice',      desc: 'Ingresa tus marcadores antes del pitazo inicial' },
    { icon: '📊', title: 'Puntúa',       desc: 'Resultado exacto = 3pts · Resultado correcto = 1pt' },
    { icon: '🏆', title: '¡Celebra!',   desc: 'El más acertado gana — y todos celebramos a Maximiliano' },
  ]

  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <p className="font-body text-gold text-xs tracking-[0.3em] uppercase mb-2">Simple y divertido</p>
        <h2 className="font-display text-3xl font-bold text-navy tracking-wide">¿CÓMO FUNCIONA?</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <div
            key={i}
            className="bg-white rounded-card border border-gray-100 p-6 text-center shadow-card card-hover animate-slide-up"
            style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}
          >
            <div className="text-4xl mb-3">{step.icon}</div>
            <h3 className="font-semibold text-navy text-sm mb-2">{step.title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Matches section ──────────────────────────────────────────────────────────

function MatchesSection({ matches }) {
  const grouped = groupMatchesByDate(matches)
  const dateKeys = Object.keys(grouped).sort()

  return (
    <section className="mb-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-body text-gold text-xs tracking-[0.3em] uppercase mb-1">En cancha</p>
          <h2 className="font-display text-3xl font-bold text-navy tracking-wide">PARTIDOS</h2>
        </div>
        <Link to="/predictions">
          <Button variant="outline" size="sm">Ver todos →</Button>
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Pronto se publicarán los partidos del torneo
        </div>
      ) : (
        <div className="space-y-8">
          {dateKeys.map(dateKey => (
            <div key={dateKey}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-100 capitalize">
                {formatDateLabel(dateKey)}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {grouped[dateKey].map(match => (
                  <MatchCard key={match.id} match={match} mode="view" compact />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { matches, loading, error, loadAll, currentUser } = useStore()

  useEffect(() => { loadAll() }, [loadAll])

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  }
  if (error) {
    return <div className="text-center py-20 text-red-500 text-sm">Error: {error}</div>
  }

  return (
    <div className="animate-fade-in">
      <Hero currentUser={currentUser} />
      <BabyProfile />
      <HowItWorks />
      <MatchesSection matches={matches} />
      <MessagesSection />
    </div>
  )
}
