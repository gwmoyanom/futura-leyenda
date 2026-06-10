/**
 * pages/participant/PredictionsPage.jsx
 *
 * Two-phase prediction form with tabs:
 * - FASE DE GRUPOS: predictions for group stage matches
 * - LLAVE FINAL: predictions for knockout stage matches (Round 16 onwards)
 *
 * Predictions lock after tournament inauguration date.
 */

import { useState, useEffect } from 'react'
import useStore from '@/store/index.js'
import MatchCard from '@/components/participant/MatchCard.jsx'
import { Spinner } from '@/components/ui/index.jsx'
import Button from '@/components/ui/Button.jsx'
import { groupMatchesByDate, formatDateLabel, isAllPredictionsLocked, getPredictionsLockCountdown } from '@/utils/date.utils.js'
import clsx from 'clsx'

export default function PredictionsPage() {
  const [activePhase, setActivePhase] = useState('group')
  const {
    matches,
    config,
    loading,
    error,
    loadAll,
    savePrediction,
    getMyPredictions,
    getMyScore,
    getMatchesByPhase,
    getPredictionsByPhase,
    getMyScoreByPhase,
    isPredictionLocked,
  } = useStore()

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const myPredictions = getMyPredictions()
  const { totalPoints } = getMyScore()
  const isLocked = isPredictionLocked()
  const lockCountdown = config?.tournament?.inaugurationDate 
    ? getPredictionsLockCountdown(config.tournament.inaugurationDate)
    : null

  // Build a lookup map: matchId → prediction
  const predictionMap = Object.fromEntries(
    myPredictions.map(p => [p.matchId, p])
  )

  // Get matches for current phase
  const phaseMatches = getMatchesByPhase(activePhase)
  const phasePredictions = getPredictionsByPhase(activePhase)
  const phaseScore = getMyScoreByPhase(activePhase)

  const grouped = groupMatchesByDate(phaseMatches)
  const dateKeys = Object.keys(grouped).sort()

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  }

  if (error) {
    return <div className="text-center py-20 text-red-500 text-sm">Error: {error}</div>
  }

  // Phase labels
  const phaseLabels = {
    group: { label: 'FASE DE GRUPOS', description: 'Predice los resultados de la fase de grupos' },
    round16: { label: 'OCTAVOS DE FINAL', description: 'Predice los resultados de la llave final' },
    quarterfinal: { label: 'CUARTOS DE FINAL', description: 'Predice los resultados de los cuartos' },
    semifinal: { label: 'SEMIFINALES', description: 'Predice los finalistas' },
    final: { label: 'FINAL', description: 'Predice el campeón' },
  }

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy tracking-wide">
            MIS PREDICCIONES
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Ingresa tus marcadores antes del saque inicial de cada partido
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl font-bold text-gold">{totalPoints}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">puntos totales</div>
        </div>
      </div>

      {/* Prediction lock warning */}
      {isLocked && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="font-semibold text-red-900">Predicciones Cerradas</p>
            <p className="text-sm text-red-700 mt-1">
              Las predicciones se cerraron al inicio del torneo. Ahora puedes ver los resultados y tu puntuación.
            </p>
          </div>
        </div>
      )}

      {/* Countdown warning */}
      {!isLocked && lockCountdown && (
        <div className="bg-gold/10 border border-gold/20 rounded-lg p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">⏰</span>
          <div>
            <p className="font-semibold text-gold-dark">{lockCountdown}</p>
            <p className="text-sm text-gold-dark/70 mt-1">
              Después de la inauguración del torneo no podrás modificar tus predicciones
            </p>
          </div>
        </div>
      )}

      {/* Tabs for phases */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
        {['group', 'round16', 'quarterfinal', 'semifinal', 'final'].map(phase => {
          const phaseData = phaseLabels[phase]
          const phaseMatches = getMatchesByPhase(phase)
          if (phaseMatches.length === 0) return null

          return (
            <button
              key={phase}
              onClick={() => setActivePhase(phase)}
              className={clsx(
                'px-4 py-3 border-b-2 font-semibold text-sm uppercase tracking-wider transition-colors whitespace-nowrap',
                activePhase === phase
                  ? 'border-gold text-gold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {phaseData.label}
            </button>
          )
        })}
      </div>

      {/* Phase info */}
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold text-navy mb-2">
          {phaseLabels[activePhase]?.label}
        </h2>
        <div className="flex justify-between items-center">
          <p className="text-gray-600 text-sm">
            {phaseLabels[activePhase]?.description}
          </p>
          <div className="text-right">
            <div className="font-display text-2xl font-bold text-gold">{phaseScore.totalPoints}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">pts. esta fase</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs text-gray-500">
        <span>🎯 Resultado exacto = <strong>3 pts</strong></span>
        <span>✅ Resultado correcto = <strong>1 pt</strong></span>
        <span>🔒 {isLocked ? 'Predicciones cerradas' : 'Se cierra al inicio de cada partido'}</span>
      </div>

      {/* Matches by date */}
      <div className="space-y-8">
        {dateKeys.length > 0 ? (
          dateKeys.map(dateKey => (
            <div key={dateKey}>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-200 capitalize">
                {formatDateLabel(dateKey)}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[dateKey].map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    mode={isLocked ? 'view' : 'predict'}
                    userPrediction={predictionMap[match.id] ?? null}
                    pointsEarned={predictionMap[match.id]?.pointsEarned ?? null}
                    onSave={isLocked ? null : savePrediction}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-gray-400">
            No hay partidos disponibles para esta fase todavía
          </div>
        )}
      </div>
    </div>
  )
}
