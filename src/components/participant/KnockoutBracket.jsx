/**
 * components/participant/KnockoutBracket.jsx
 *
 * Visual bracket for knockout stages (16avos through Final)
 * Shows matchups and allows predictions
 */

import clsx from 'clsx'
import { Badge } from '@/components/ui/index.jsx'

function MatchNode({ match, userPrediction, onSelect, isSelectable, isLocked }) {
  const homeScore = userPrediction?.prediction?.home
  const awayScore = userPrediction?.prediction?.away
  const hasScore = homeScore !== undefined && awayScore !== undefined

  const getTeamDisplay = (team) => {
    if (team.code === 'W_A1' || team.code === 'W_A2' || team.code === 'W_B1' || team.code === 'W_B2' ||
        team.code === 'W_C1' || team.code === 'W_C2' || team.code === 'SF1' || team.code === 'SF2' || 
        team.code === 'SF3' || team.code === 'SF4') {
      return <span className="text-xs text-gray-400 italic">Por definir</span>
    }
    return (
      <div className="flex items-center gap-1">
        <span>{team.flag}</span>
        <span className="text-sm font-medium">{team.name}</span>
      </div>
    )
  }

  return (
    <div
      onClick={() => isSelectable && !isLocked && onSelect?.(match)}
      className={clsx(
        'border border-gray-200 rounded-lg p-2 bg-white',
        'transition-all duration-200',
        isSelectable && !isLocked && 'cursor-pointer hover:shadow-md hover:border-gold',
        !isSelectable && !isLocked && 'cursor-not-allowed',
        hasScore && 'ring-2 ring-gold/30 bg-gold/5'
      )}
    >
      {/* Match header */}
      <div className="text-xs text-gray-500 mb-2 pb-1 border-b border-gray-100">
        {match.phase.toUpperCase()}
      </div>

      {/* Teams */}
      <div className="space-y-1">
        {/* Home team */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            {getTeamDisplay(match.homeTeam)}
          </div>
          {match.result || hasScore ? (
            <span className="font-bold text-navy text-sm">
              {hasScore ? homeScore : match.result?.home}
            </span>
          ) : null}
        </div>

        {/* Separator */}
        <div className="border-t border-gray-100"></div>

        {/* Away team */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            {getTeamDisplay(match.awayTeam)}
          </div>
          {match.result || hasScore ? (
            <span className="font-bold text-navy text-sm">
              {hasScore ? awayScore : match.result?.away}
            </span>
          ) : null}
        </div>
      </div>

      {/* Points indicator */}
      {userPrediction?.pointsEarned !== undefined && userPrediction?.pointsEarned > 0 && (
        <div className="mt-2 pt-2 border-t border-gold/20 text-center text-xs font-semibold text-gold">
          +{userPrediction.pointsEarned} pts
        </div>
      )}
    </div>
  )
}

export default function KnockoutBracket({ matches, predictions, onMatchSelect, isLocked }) {
  // Group matches by phase
  const phases = ['round16', 'quarterfinal', 'semifinal', 'final']
  const predictionMap = Object.fromEntries(
    predictions.map(p => [p.matchId, p])
  )

  const matchesByPhase = {}
  phases.forEach(phase => {
    matchesByPhase[phase] = matches
      .filter(m => m.phase === phase)
      .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))
  })

  const phaseLabels = {
    round16: { label: 'OCTAVOS DE FINAL', rounds: 8 },
    quarterfinal: { label: 'CUARTOS DE FINAL', rounds: 4 },
    semifinal: { label: 'SEMIFINALES', rounds: 2 },
    final: { label: 'FINAL', rounds: 1 },
  }

  return (
    <div className="space-y-12">
      {phases.map(phase => {
        const phaseMatches = matchesByPhase[phase]
        if (phaseMatches.length === 0) return null

        const { label, rounds } = phaseLabels[phase]

        return (
          <div key={phase}>
            {/* Phase header */}
            <div className="mb-6">
              <h3 className="font-display text-lg font-bold text-navy mb-1">
                {label}
              </h3>
              <p className="text-xs text-gray-500">
                {rounds} partido{rounds > 1 ? 's' : ''}
              </p>
            </div>

            {/* Matches grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {phaseMatches.map(match => (
                <MatchNode
                  key={match.id}
                  match={match}
                  userPrediction={predictionMap[match.id]}
                  onSelect={onMatchSelect}
                  isSelectable={!isLocked && match.status === 'upcoming'}
                  isLocked={isLocked}
                />
              ))}
            </div>

            {/* Phase separator */}
            {phase !== 'final' && (
              <div className="my-8 border-b-2 border-dashed border-gold/20"></div>
            )}
          </div>
        )
      })}

      {/* Final champion section */}
      {matchesByPhase.final.length > 0 && (
        <div className="mt-12 p-6 bg-gradient-to-r from-gold/5 to-gold/10 border-2 border-gold/20 rounded-xl text-center">
          <span className="text-4xl mb-2 block">🏆</span>
          <h3 className="font-display text-xl font-bold text-gold-dark mb-2">
            CAMPEÓN DEL MUNDO
          </h3>
          <p className="text-sm text-gray-600">
            Completa todas tus predicciones para ver el resultado final
          </p>
        </div>
      )}
    </div>
  )
}
