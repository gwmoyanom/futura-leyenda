/**
 * pages/participant/DashboardPage.jsx — Futura Leyenda branding + badges
 */

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useStore from '@/store/index.js'
import { Card, CardHeader, CardBody, Spinner } from '@/components/ui/index.jsx'
import { BadgePill, BadgeShowcase, getEarnedBadges } from '@/utils/badges.utils.jsx'
import Button from '@/components/ui/Button.jsx'
import clsx from 'clsx'

function StatCard({ value, label, icon, accent = false }) {
  return (
    <div className={clsx(
      'rounded-card p-5 text-center shadow-card',
      accent ? 'bg-navy text-white shadow-navy' : 'bg-white border border-gray-100'
    )}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className={clsx('font-display text-3xl font-bold', accent ? 'text-gold' : 'text-navy')}>
        {value}
      </div>
      <div className={clsx('text-xs mt-1', accent ? 'text-white/40' : 'text-gray-400')}>
        {label}
      </div>
    </div>
  )
}

function BreakdownRow({ item }) {
  const { match, prediction, result, points } = item
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xl">{match.homeTeam.flag}</span>
        <span className="text-xs font-medium text-gray-500 truncate">
          {match.homeTeam.code} vs {match.awayTeam.code}
        </span>
        <span className="text-xl">{match.awayTeam.flag}</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <div className="text-center">
          <div className="text-gray-400 mb-0.5">Mi pred.</div>
          <div className="font-display font-bold text-navy">{prediction.home}–{prediction.away}</div>
        </div>
        {result && (
          <>
            <span className="text-gray-200">→</span>
            <div className="text-center">
              <div className="text-gray-400 mb-0.5">Real</div>
              <div className="font-display font-bold text-navy">{result.home}–{result.away}</div>
            </div>
          </>
        )}
      </div>
      <div className={clsx(
        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
        points === 3 ? 'bg-pitch/20 text-pitch-dark' :
        points === 1 ? 'bg-gold/20 text-gold-dark' :
        result ? 'bg-red-50 text-red-400' : 'bg-gray-100 text-gray-400'
      )}>
        {result ? (points > 0 ? `+${points}` : '0') : '–'}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { loadAll, loading, getMyScore, getLeaderboard, currentUser } = useStore()

  useEffect(() => { loadAll() }, [loadAll])

  const { totalPoints, breakdown } = getMyScore()
  const leaderboard  = getLeaderboard()
  const myEntry      = leaderboard.find(e => e.user.id === currentUser?.id)
  const myRank       = leaderboard.findIndex(e => e.user.id === currentUser?.id) + 1
  const earnedBadges = myEntry ? getEarnedBadges(myEntry, myRank) : []

  const exactScores    = breakdown.filter(b => b.points === 3).length
  const correctResults = breakdown.filter(b => b.points === 1).length
  const finishedGames  = breakdown.filter(b => b.result).length
  const pending        = breakdown.filter(b => !b.result).length

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="font-body text-gold text-xs tracking-[0.3em] uppercase mb-1">Mi rendimiento</p>
        <h1 className="font-display text-3xl font-bold text-navy tracking-wide">MI MARCADOR</h1>
        <p className="text-gray-400 text-sm mt-1">
          Hola, {currentUser?.displayName} {currentUser?.avatar} — así vas en la Futura Leyenda
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard value={totalPoints} label="Puntos totales" icon="⭐" accent />
        <StatCard value={myRank > 0 ? `#${myRank}` : '–'} label="Posición" icon="🏆" />
        <StatCard value={exactScores}    label="Resultados exactos"   icon="🎯" />
        <StatCard value={correctResults} label="Resultados correctos" icon="✅" />
      </div>

      {/* Earned badges */}
      {earnedBadges.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-navy tracking-wide mb-3">MIS LOGROS</h2>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map(badge => <BadgePill key={badge.id} badge={badge} />)}
          </div>
        </div>
      )}

      {/* All badges showcase */}
      <div className="mb-8">
        <h2 className="font-display text-xl font-bold text-navy tracking-wide mb-3">TODOS LOS LOGROS</h2>
        <BadgeShowcase earnedBadges={earnedBadges} />
      </div>

      {/* Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-navy">Detalle de partidos</h2>
            <div className="flex gap-2 text-xs text-gray-400">
              <span>{finishedGames} jugados</span>
              {pending > 0 && <span>· {pending} pendientes</span>}
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {breakdown.length > 0 ? (
            <div className="px-5">
              {breakdown.map((item, i) => <BreakdownRow key={i} item={item} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm">Aún no tienes predicciones guardadas</p>
              <Link to="/predictions" className="mt-4 inline-block">
                <Button size="sm">Ir a la predicción</Button>
              </Link>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
