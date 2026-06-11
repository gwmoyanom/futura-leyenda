/**
 * components/participant/PredictionScores.jsx
 *
 * Shows earned points per prediction once match results are available.
 */

import clsx from 'clsx'
import { formatKickoffTimeUtc05 } from '@/utils/date.utils.js'

function phaseLabel(match) {
  if (match.phase === 'group') return `Grupo ${match.group}`
  if (match.phase === 'round32') return '16avos'
  if (match.phase === 'round16') return '8avos'
  if (match.phase === 'quarter') return '4tos'
  if (match.phase === 'semi') return 'Semis'
  if (match.phase === 'third') return '3er puesto'
  if (match.phase === 'final') return 'Final'
  return match.phase
}

function scoreVariant(item, exactPoints, correctPoints) {
  if (!item.result) {
    return {
      label: 'Pendiente',
      title: 'Sin resultado',
      classes: 'bg-gray-100 text-gray-500 border-gray-200',
      row: 'bg-white border-gray-100',
    }
  }

  if (item.points === exactPoints) {
    return {
      label: `+${item.points}`,
      title: 'Marcador exacto',
      classes: 'bg-pitch/10 text-pitch-dark border-pitch/20',
      row: 'bg-pitch/5 border-pitch/20',
    }
  }

  if (item.points === correctPoints) {
    return {
      label: `+${item.points}`,
      title: 'Signo correcto',
      classes: 'bg-gold/15 text-gold-dark border-gold/30',
      row: 'bg-gold/5 border-gold/20',
    }
  }

  return {
    label: '0',
    title: 'Sin puntos',
    classes: 'bg-red-50 text-live border-live/20',
    row: 'bg-red-50/60 border-red-100',
  }
}

function StatBox({ label, value, tone = 'default' }) {
  return (
    <div className={clsx(
      'rounded-card border p-4 shadow-card',
      tone === 'gold' ? 'bg-navy border-navy text-white shadow-navy' : 'bg-white border-gray-100'
    )}>
      <div className={clsx(
        'font-display text-3xl font-bold',
        tone === 'gold' ? 'text-gold' : 'text-navy'
      )}>
        {value}
      </div>
      <div className={clsx('text-xs mt-1', tone === 'gold' ? 'text-white/45' : 'text-gray-400')}>
        {label}
      </div>
    </div>
  )
}

function TeamLine({ team }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-xl">{team.flag}</span>
      <span className="text-sm font-semibold text-navy truncate">{team.name}</span>
      <span className="text-xs text-gray-400">{team.code}</span>
    </div>
  )
}

function ScorePair({ label, score, muted = false }) {
  return (
    <div className="text-center">
      <div className="text-[11px] text-gray-400 mb-1">{label}</div>
      <div className={clsx(
        'font-display text-xl font-bold',
        muted ? 'text-gray-300' : 'text-navy'
      )}>
        {score}
      </div>
    </div>
  )
}

function PredictionScoreRow({ item, exactPoints, correctPoints }) {
  const match = item.match
  const variant = scoreVariant(item, exactPoints, correctPoints)

  return (
    <article className={clsx('rounded-card border p-4 shadow-card', variant.row)}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded-full bg-white/80 border border-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">
              {phaseLabel(match)}
            </span>
            <span className="text-xs text-gray-400">
              {formatKickoffTimeUtc05(match.kickoff)} UTC-05
            </span>
          </div>
          <div className="space-y-2">
            <TeamLine team={match.homeTeam} />
            <TeamLine team={match.awayTeam} />
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 lg:w-64">
          <ScorePair label="Tu predicción" score={`${item.prediction.home} - ${item.prediction.away}`} />
          <span className="text-xs font-semibold uppercase text-gray-300">vs</span>
          <ScorePair
            label="Resultado"
            score={item.result ? `${item.result.home} - ${item.result.away}` : '--'}
            muted={!item.result}
          />
        </div>

        <div className="lg:w-72">
          <div className="flex items-center gap-2 mb-2">
            <span className={clsx(
              'inline-flex min-w-[3rem] items-center justify-center rounded-full border px-3 py-1 text-sm font-bold',
              variant.classes
            )}>
              {variant.label}
            </span>
            <span className="text-sm font-semibold text-navy">{variant.title}</span>
          </div>
          <p className="text-xs leading-relaxed text-gray-500">
            {item.reason}
          </p>
        </div>
      </div>
    </article>
  )
}

export default function PredictionScores({ breakdown = [], rules }) {
  const exactPoints = rules?.exactScore?.points ?? 3
  const correctPoints = rules?.correctResult?.points ?? 1
  const finished = breakdown.filter(item => item.result)
  const pending = breakdown.filter(item => !item.result)
  const exact = finished.filter(item => item.points === exactPoints)
  const correct = finished.filter(item => item.points === correctPoints)
  const missed = finished.filter(item => item.points === 0)
  const total = breakdown.reduce((sum, item) => sum + item.points, 0)
  const sorted = [...breakdown].sort((a, b) => {
    const aFinished = Boolean(a.result)
    const bFinished = Boolean(b.result)
    if (aFinished !== bFinished) return aFinished ? -1 : 1
    return new Date(a.match.kickoff || 0) - new Date(b.match.kickoff || 0)
  })

  if (breakdown.length === 0) {
    return (
      <div className="text-center py-14 rounded-card border border-gray-100 bg-white text-gray-400 shadow-card">
        <p className="text-sm">Aún no tienes predicciones guardadas para puntuar.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatBox label="Puntos totales" value={total} tone="gold" />
        <StatBox label="Marcadores exactos" value={exact.length} />
        <StatBox label="Signos correctos" value={correct.length} />
        <StatBox label="Sin puntos" value={missed.length} />
        <StatBox label="Pendientes" value={pending.length} />
      </div>

      <div className="rounded-card border border-gray-100 bg-white p-4 shadow-card">
        <h3 className="font-display text-xl font-bold text-navy tracking-wide">
          DETALLE DE PUNTUACIÓN
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Cada partido muestra tu predicción, el resultado cargado y el motivo de los puntos asignados.
        </p>
      </div>

      <div className="space-y-3">
        {sorted.map(item => (
          <PredictionScoreRow
            key={item.matchId}
            item={item}
            exactPoints={exactPoints}
            correctPoints={correctPoints}
          />
        ))}
      </div>
    </div>
  )
}
