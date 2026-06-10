/**
 * pages/LeaderboardPage.jsx
 *
 * Public leaderboard — anyone can see the rankings.
 * Highlights the current user's row.
 */

import { useEffect } from 'react'
import useStore from '@/store/index.js'
import { Spinner, EmptyState } from '@/components/ui/index.jsx'
import clsx from 'clsx'

// ─── Position badge ───────────────────────────────────────────────────────────

function PositionBadge({ rank }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>
  if (rank === 2) return <span className="text-2xl">🥈</span>
  if (rank === 3) return <span className="text-2xl">🥉</span>
  return <span className="font-display font-bold text-gray-400 text-lg">#{rank}</span>
}

// ─── Leaderboard row ──────────────────────────────────────────────────────────

function LeaderboardRow({ entry, rank, isCurrentUser }) {
  const { user, totalPoints, exactScores, correctResults, predictionsCount } = entry

  return (
    <tr className={clsx(
      'transition-colors',
      isCurrentUser ? 'bg-gold/5' : 'hover:bg-gray-50',
      rank <= 3 && !isCurrentUser && 'bg-gray-50/50'
    )}>
      <td className="py-4 pl-5 pr-3 w-12">
        <div className="flex items-center justify-center">
          <PositionBadge rank={rank} />
        </div>
      </td>
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">{user.avatar}</span>
          <div>
            <div className={clsx(
              'font-medium text-sm',
              isCurrentUser ? 'text-gold-dark font-semibold' : 'text-navy'
            )}>
              {user.displayName}
              {isCurrentUser && <span className="ml-2 text-xs text-gold">(tú)</span>}
            </div>
            <div className="text-xs text-gray-400">@{user.username}</div>
          </div>
        </div>
      </td>
      <td className="py-4 text-center">
        <span className="font-display text-2xl font-bold text-gold">{totalPoints}</span>
      </td>
      <td className="py-4 text-center hidden sm:table-cell">
        <span className="text-sm text-navy font-medium">{exactScores}</span>
        <span className="text-xs text-gray-400 ml-1">🎯</span>
      </td>
      <td className="py-4 text-center hidden sm:table-cell">
        <span className="text-sm text-navy font-medium">{correctResults}</span>
        <span className="text-xs text-gray-400 ml-1">✅</span>
      </td>
      <td className="py-4 pr-5 text-center hidden md:table-cell">
        <span className="text-sm text-gray-400">{predictionsCount}</span>
      </td>
    </tr>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const { loadAll, loading, getLeaderboard, currentUser } = useStore()

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const leaderboard = getLeaderboard()

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-navy tracking-wide">
          TABLA DE POSICIONES
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {leaderboard.length} participantes · Actualizado en tiempo real
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <EmptyState
          icon="🏆"
          title="Aún no hay participantes"
          description="Cuando los jugadores empiecen a registrar predicciones, aparecerán aquí"
        />
      ) : (
        <div className="bg-white rounded-card border border-gray-100 shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 pl-5 pr-3 text-left text-xs text-gray-400 uppercase tracking-wider w-12">#</th>
                <th className="py-3 pr-4 text-left text-xs text-gray-400 uppercase tracking-wider">Jugador</th>
                <th className="py-3 text-center text-xs text-gray-400 uppercase tracking-wider">Puntos</th>
                <th className="py-3 text-center text-xs text-gray-400 uppercase tracking-wider hidden sm:table-cell">Exactos</th>
                <th className="py-3 text-center text-xs text-gray-400 uppercase tracking-wider hidden sm:table-cell">Correctos</th>
                <th className="py-3 pr-5 text-center text-xs text-gray-400 uppercase tracking-wider hidden md:table-cell">Pred.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaderboard.map((entry, i) => (
                <LeaderboardRow
                  key={entry.user.id}
                  entry={entry}
                  rank={i + 1}
                  isCurrentUser={currentUser?.id === entry.user.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
