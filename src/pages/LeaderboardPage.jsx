/**
 * pages/LeaderboardPage.jsx
 *
 * Public leaderboard — anyone can see the rankings.
 * Highlights the current user's row.
 */

import { useEffect, useMemo, useState } from 'react'
import useStore from '@/store/index.js'
import { Spinner, EmptyState } from '@/components/ui/index.jsx'
import Avatar from '@/components/ui/Avatar.jsx'
import { calculateGroupStandings, getGroups } from '@/utils/tournamentSimulator.utils.js'
import clsx from 'clsx'

// ─── Position badge ───────────────────────────────────────────────────────────

function PositionBadge({ rank }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>
  if (rank === 2) return <span className="text-2xl">🥈</span>
  if (rank === 3) return <span className="text-2xl">🥉</span>
  return <span className="font-display font-bold text-gray-400 text-lg">#{rank}</span>
}

// ─── Leaderboard row ──────────────────────────────────────────────────────────

function LeaderboardRow({ entry, rank, isCurrentUser, onOpen }) {
  const { user, totalPoints, exactScores, correctResults, predictionsCount } = entry

  return (
    <tr
      onClick={() => onOpen(entry)}
      className={clsx(
      'transition-colors',
      'cursor-pointer',
      isCurrentUser ? 'bg-gold/5 hover:bg-gold/10' : 'hover:bg-gray-50',
      rank <= 3 && !isCurrentUser && 'bg-gray-50/50'
    )}
    >
      <td className="py-4 pl-5 pr-3 w-12">
        <div className="flex items-center justify-center">
          <PositionBadge rank={rank} />
        </div>
      </td>
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <Avatar
            avatar={user.avatar}
            label={user.displayName}
            className="text-xl"
            imageClassName="h-7 w-7"
          />
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

// ─── Predictions drawer ─────────────────────────────────────────────────────

function CompactGroupTable({ group, standings }) {
  return (
    <div className="rounded-card border border-gray-100 bg-white shadow-card overflow-hidden">
      <div className="bg-navy px-4 py-2">
        <h3 className="font-display text-sm font-bold text-gold tracking-wide">Grupo {group}</h3>
      </div>
      <table className="w-full text-sm">
        <thead className="border-b border-gray-100 bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Pos</th>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Equipo</th>
            <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gold">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {standings.map((team, index) => (
            <tr key={team.code} className={index < 2 ? 'bg-pitch/5' : undefined}>
              <td className={clsx(
                'px-3 py-2 font-semibold',
                index < 2 ? 'text-pitch-dark' : 'text-gray-500'
              )}>
                {index + 1}
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span>{team.flag}</span>
                  <span className="truncate font-medium text-navy">{team.name}</span>
                </div>
              </td>
              <td className="px-3 py-2 text-right font-display text-lg font-bold text-gold">
                {team.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PlayerPredictionsDrawer({ entry, matches, predictions, onClose }) {
  const userPredictions = useMemo(
    () => entry ? predictions.filter(prediction => prediction.userId === entry.user.id) : [],
    [entry, predictions]
  )
  const predictionMap = useMemo(
    () => Object.fromEntries(userPredictions.map(prediction => [prediction.matchId, prediction])),
    [userPredictions]
  )
  const groups = useMemo(() => getGroups(matches), [matches])

  if (!entry) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        className="absolute inset-0 bg-navy/45"
        onClick={onClose}
        aria-label="Cerrar predicciones"
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-surface shadow-navy">
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-body text-gold text-xs tracking-[0.3em] uppercase mb-1">
                Predicción parcial
              </p>
              <div className="flex items-center gap-2">
                <Avatar
                  avatar={entry.user.avatar}
                  label={entry.user.displayName}
                  className="text-2xl"
                  imageClassName="h-8 w-8"
                />
                <h2 className="font-display text-2xl font-bold text-navy tracking-wide truncate">
                  {entry.user.displayName}
                </h2>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Tabla proyectada por grupos: posición, equipo y puntos.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 rounded-lg border border-gray-200 bg-white text-xl leading-none text-gray-500 transition-colors hover:border-gold hover:text-navy"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-card bg-navy p-4 text-center shadow-navy">
              <div className="font-display text-2xl font-bold text-gold">{entry.totalPoints}</div>
              <div className="text-xs text-white/40">puntos reales</div>
            </div>
            <div className="rounded-card border border-gray-100 bg-white p-4 text-center shadow-card">
              <div className="font-display text-2xl font-bold text-navy">{entry.predictionsCount}</div>
              <div className="text-xs text-gray-400">predicciones</div>
            </div>
            <div className="rounded-card border border-gray-100 bg-white p-4 text-center shadow-card">
              <div className="font-display text-2xl font-bold text-navy">{groups.length}</div>
              <div className="text-xs text-gray-400">grupos</div>
            </div>
          </div>

          {userPredictions.length === 0 ? (
            <div className="rounded-card border border-gray-100 bg-white py-14 text-center text-sm text-gray-400 shadow-card">
              Este jugador todavía no tiene predicciones para mostrar.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {groups.map(group => (
                <CompactGroupTable
                  key={group}
                  group={group}
                  standings={calculateGroupStandings(matches, predictionMap, group)}
                />
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const { loadAll, loading, getLeaderboard, currentUser, matches, predictions } = useStore()
  const [selectedEntry, setSelectedEntry] = useState(null)

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
        {leaderboard.length > 0 && (
          <p className="text-gray-400 text-xs mt-2">
            Toca un jugador para ver su predicción parcial de tablas de grupos.
          </p>
        )}
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
                  onOpen={setSelectedEntry}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PlayerPredictionsDrawer
        entry={selectedEntry}
        matches={matches}
        predictions={predictions}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  )
}
