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

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useStore from '@/store/index.js'
import MatchCard from '@/components/participant/MatchCard.jsx'
import BirthCountdown from '@/components/participant/BirthCountdown.jsx'
import Button from '@/components/ui/Button.jsx'
import { Spinner } from '@/components/ui/index.jsx'
import { groupMatchesByDate, formatDateLabel, formatKickoffTimeUtc05 } from '@/utils/date.utils.js'

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

const KNOCKOUT_SCHEDULE = [
  {
    phase: 'Dieciseisavos de final',
    detail: 'Ronda de 32',
    dates: '28 de junio al 3 de julio',
    local: '16:00 y 19:00',
    ecuador: '16:00 y 19:00 / 20:00 / 21:00',
  },
  {
    phase: 'Octavos de final',
    dates: '4 de julio al 7 de julio',
    local: '16:00 y 19:00',
    ecuador: '16:00 y 19:00 / 20:00 / 21:00',
  },
  {
    phase: 'Cuartos de final',
    dates: '9 de julio al 11 de julio',
    local: '16:00 y 19:00',
    ecuador: '16:00 y 19:00 / 20:00 / 21:00',
  },
  {
    phase: 'Semifinales',
    dates: '14 y 15 de julio',
    local: '18:00',
    ecuador: '18:00 o 19:00',
    note: 'según sede en EE.UU.',
  },
  {
    phase: 'Tercer Puesto',
    dates: '18 de julio',
    local: '16:00',
    ecuador: '15:00 o 16:00',
    note: 'según huso de la sede',
  },
  {
    phase: 'Gran Final',
    dates: 'Domingo 19 de julio',
    local: '14:00',
    localNote: 'Sede Nueva York',
    ecuador: '13:00',
    note: 'Hora de Ecuador',
  },
]

function ViewToggle({ value, onChange }) {
  const options = [
    { id: 'cards', label: 'Tarjetas', icon: '▦' },
    { id: 'waterfall', label: 'Cascada', icon: '≋' },
  ]

  return (
    <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-card">
      {options.map(option => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={[
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
            value === option.id
              ? 'bg-navy text-gold'
              : 'text-gray-500 hover:bg-gray-50 hover:text-navy',
          ].join(' ')}
        >
          <span aria-hidden="true">{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
  )
}

function WaterfallMatchItem({ match }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-card">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-gray-400">
          Grupo {match.group}
        </span>
        <span className="font-display text-lg font-semibold text-gold leading-none">
          {formatKickoffTimeUtc05(match.kickoff)}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">{match.homeTeam.flag}</span>
          <span className="truncate text-xs font-semibold text-navy">{match.homeTeam.code}</span>
        </div>
        <span className="text-[10px] font-semibold uppercase text-gray-300">vs</span>
        <div className="flex items-center justify-end gap-2 min-w-0">
          <span className="truncate text-right text-xs font-semibold text-navy">{match.awayTeam.code}</span>
          <span className="text-lg">{match.awayTeam.flag}</span>
        </div>
      </div>
      <p className="mt-2 truncate text-[11px] text-gray-400">
        {match.venue}
      </p>
    </div>
  )
}

function WaterfallMatches({ grouped, dateKeys }) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
      {dateKeys.map(dateKey => (
        <div
          key={dateKey}
          className="mb-4 break-inside-avoid rounded-card border border-gold/10 bg-surface-soft p-3 shadow-card"
        >
          <h3 className="mb-3 border-b border-gold/10 pb-2 text-xs font-semibold uppercase tracking-widest text-navy">
            {formatDateLabel(dateKey)}
          </h3>
          <div className="space-y-2">
            {grouped[dateKey].map(match => (
              <WaterfallMatchItem key={match.id} match={match} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function KnockoutSchedule() {
  return (
    <section className="mt-10 rounded-card border border-gray-100 bg-white shadow-card overflow-hidden">
      <div className="px-4 py-4 sm:px-5 border-b border-gray-100">
        <p className="font-body text-gold text-xs tracking-[0.3em] uppercase mb-1">
          Siguientes fases
        </p>
        <h3 className="font-display text-2xl font-bold text-navy tracking-wide">
          HORARIOS DE ELIMINACIÓN
        </h3>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 text-sm text-navy">
              <th className="px-5 py-3 font-semibold">Fase del Mundial</th>
              <th className="px-5 py-3 font-semibold">Fechas del Calendario</th>
              <th className="px-5 py-3 font-semibold">Horarios en Sede Local</th>
              <th className="px-5 py-3 font-semibold">Equivalencia aproximada en Ecuador</th>
            </tr>
          </thead>
          <tbody>
            {KNOCKOUT_SCHEDULE.map(row => (
              <tr key={row.phase} className="border-b border-gray-100 last:border-0 align-top">
                <td className="px-5 py-4">
                  <div className="font-semibold text-navy">{row.phase}</div>
                  {row.detail && <div className="text-sm text-gray-500">({row.detail})</div>}
                </td>
                <td className="px-5 py-4 text-sm text-gray-700">{row.dates}</td>
                <td className="px-5 py-4 text-sm text-gray-700">
                  {row.local}
                  {row.localNote && <span className="text-gray-500"> ({row.localNote})</span>}
                </td>
                <td className="px-5 py-4 text-sm text-gray-700">
                  <span className="font-bold text-navy">{row.ecuador}</span>
                  {row.note && <span className="text-gray-500"> ({row.note})</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-gray-100">
        {KNOCKOUT_SCHEDULE.map(row => (
          <div key={row.phase} className="p-4">
            <div className="mb-3">
              <div className="font-semibold text-navy">{row.phase}</div>
              {row.detail && <div className="text-sm text-gray-500">({row.detail})</div>}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Fechas</div>
                <div className="text-gray-700">{row.dates}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Sede local</div>
                <div className="text-gray-700">
                  {row.local}
                  {row.localNote && <span className="text-gray-500"> ({row.localNote})</span>}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Ecuador</div>
                <div>
                  <span className="font-bold text-navy">{row.ecuador}</span>
                  {row.note && <span className="text-gray-500"> ({row.note})</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function MatchesSection({ matches }) {
  const [view, setView] = useState('cards')
  const grouped = groupMatchesByDate(matches)
  const dateKeys = Object.keys(grouped).sort()

  return (
    <section className="mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="font-body text-gold text-xs tracking-[0.3em] uppercase mb-1">En cancha</p>
          <h2 className="font-display text-3xl font-bold text-navy tracking-wide">PARTIDOS</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ViewToggle value={view} onChange={setView} />
          <Link to="/predictions">
            <Button variant="outline" size="sm">Ver todos →</Button>
          </Link>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Pronto se publicarán los partidos del torneo
        </div>
      ) : (
        <>
          {view === 'cards' ? (
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
          ) : (
            <WaterfallMatches grouped={grouped} dateKeys={dateKeys} />
          )}

          <KnockoutSchedule />
        </>
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
    </div>
  )
}
