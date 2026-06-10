/**
 * pages/participant/PredictionsPage.jsx
 *
 * Two-phase prediction form with multiple views:
 * - Mis Predicciones: predictions for group stage and knockout
 * - Tabla de Posiciones: group standings
 * - Llave Final: knockout bracket visualization
 * - Historial: prediction history and results
 */

import { useState, useEffect } from 'react'
import useStore from '@/store/index.js'
import MatchCard from '@/components/participant/MatchCard.jsx'
import { Spinner } from '@/components/ui/index.jsx'
import { groupMatchesByDate, formatDateLabel, getPredictionsLockCountdown } from '@/utils/date.utils.js'
import clsx from 'clsx'
import GroupStandings from '@/components/participant/GroupStandings.jsx'
import KnockoutBracket from '@/components/participant/KnockoutBracket.jsx'
import PredictionHistory from '@/components/participant/PredictionHistory.jsx'
import WorldCupSimulator from '@/components/participant/WorldCupSimulator.jsx'

export default function PredictionsPage() {
  const [activePhase, setActivePhase] = useState('group')
  const [showView, setShowView] = useState('simulator')
  
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

  const predictionMap = Object.fromEntries(
    myPredictions.map(p => [p.matchId, p])
  )

  const phaseMatches = getMatchesByPhase(activePhase)
  const phaseScore = getMyScoreByPhase(activePhase)
  const grouped = groupMatchesByDate(phaseMatches)
  const dateKeys = Object.keys(grouped).sort()

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  }

  if (error) {
    return <div className="text-center py-20 text-red-500 text-sm">Error: {error}</div>
  }

  const phaseLabels = {
    group: { label: 'FASE DE GRUPOS', description: 'Predice los resultados de la fase de grupos' },
    round16: { label: 'OCTAVOS DE FINAL', description: 'Predice los resultados de la llave final' },
    quarterfinal: { label: 'CUARTOS DE FINAL', description: 'Predice los resultados de los cuartos' },
    semifinal: { label: 'SEMIFINALES', description: 'Predice los finalistas' },
    final: { label: 'FINAL', description: 'Predice el campeón' },
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
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

      {/* Lock warning */}
      {isLocked && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="font-semibold text-red-900">Predicciones Cerradas</p>
            <p className="text-sm text-red-700 mt-1">
              Las predicciones se cerraron al inicio del torneo. Ahora puedes ver resultados.
            </p>
          </div>
        </div>
      )}

      {/* Countdown */}
      {!isLocked && lockCountdown && (
        <div className="bg-gold/10 border border-gold/20 rounded-lg p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">⏰</span>
          <div>
            <p className="font-semibold text-gold-dark">{lockCountdown}</p>
          </div>
        </div>
      )}

      {/* Main view selector */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'simulator', label: '🏟️ Simulador' },
          { id: 'predictions', label: '📝 Predicciones' },
          { id: 'standings', label: '📊 Tabla' },
          { id: 'bracket', label: '🏆 Llave' },
          { id: 'history', label: '📋 Historial' },
        ].map(view => (
          <button
            key={view.id}
            onClick={() => setShowView(view.id)}
            className={clsx(
              'px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap',
              showView === view.id
                ? 'bg-gold text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* SIMULATOR VIEW */}
      {showView === 'simulator' && (
        <WorldCupSimulator
          matches={matches}
          predictions={myPredictions}
          onSave={savePrediction}
          isLocked={isLocked}
        />
      )}

      {/* PREDICTIONS VIEW */}
      {showView === 'predictions' && (
        <div>
          {/* Phase selector */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {['group', 'round16', 'quarterfinal', 'semifinal', 'final'].map(phase => {
              const phases = getMatchesByPhase(phase)
              if (phases.length === 0) return null
              return (
                <button
                  key={phase}
                  onClick={() => setActivePhase(phase)}
                  className={clsx(
                    'px-3 py-2 border-b-2 font-semibold text-sm uppercase transition-colors whitespace-nowrap',
                    activePhase === phase
                      ? 'border-gold text-gold'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  {phaseLabels[phase].label}
                </button>
              )
            })}
          </div>

          <div className="mb-6">
            <h2 className="font-display text-xl font-bold text-navy mb-2">
              {phaseLabels[activePhase]?.label}
            </h2>
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm">{phaseLabels[activePhase]?.description}</p>
              <div className="text-right">
                <div className="font-display text-2xl font-bold text-gold">{phaseScore.totalPoints}</div>
                <div className="text-xs text-gray-400">pts. fase</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6 text-xs text-gray-500">
            <span>🎯 Exacto = <strong>3 pts</strong></span>
            <span>✅ Correcto = <strong>1 pt</strong></span>
          </div>

          <div className="space-y-8">
            {dateKeys.length > 0 ? (
              dateKeys.map(dateKey => (
                <div key={dateKey}>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3 pb-2 border-b">
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
                Sin partidos para esta fase
              </div>
            )}
          </div>
        </div>
      )}

      {/* STANDINGS VIEW */}
      {showView === 'standings' && (
        <div>
          <h2 className="font-display text-2xl font-bold text-navy mb-8">Tabla de Posiciones</h2>
          <div className="space-y-12">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(group => {
              const gMatches = matches.filter(m => m.phase === 'group' && m.group === group)
              if (gMatches.length === 0) return null
              return (
                <div key={group}>
                  <h3 className="font-display text-lg font-bold text-navy mb-4">Grupo {group}</h3>
                  <GroupStandings group={group} matches={matches} predictions={myPredictions} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* BRACKET VIEW */}
      {showView === 'bracket' && (
        <div>
          <h2 className="font-display text-2xl font-bold text-navy mb-8">Llave Final</h2>
          <KnockoutBracket
            matches={matches}
            predictions={myPredictions}
            onMatchSelect={(match) => {
              setShowView('predictions')
              setActivePhase(match.phase)
            }}
            isLocked={isLocked}
          />
        </div>
      )}

      {/* HISTORY VIEW */}
      {showView === 'history' && (
        <div>
          <h2 className="font-display text-2xl font-bold text-navy mb-8">Historial de Predicciones</h2>
          <PredictionHistory predictions={myPredictions} matches={matches} />
        </div>
      )}
    </div>
  )
}
