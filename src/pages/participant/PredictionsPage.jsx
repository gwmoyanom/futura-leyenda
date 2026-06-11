/**
 * pages/participant/PredictionsPage.jsx
 *
 * Two-phase prediction form with multiple views:
 * - Mis Predicciones: predictions for group stage and knockout
 * - Tabla de Posiciones: group standings
 * - Llave Final: knockout bracket visualization
 * - Puntuaciones: earned points and scoring reasons
 */

import { useState, useEffect } from 'react'
import useStore from '@/store/index.js'
import { Spinner } from '@/components/ui/index.jsx'
import { getPredictionsLockCountdown } from '@/utils/date.utils.js'
import clsx from 'clsx'
import GroupStandings from '@/components/participant/GroupStandings.jsx'
import KnockoutBracket from '@/components/participant/KnockoutBracket.jsx'
import PredictionScores from '@/components/participant/PredictionScores.jsx'
import WorldCupSimulator from '@/components/participant/WorldCupSimulator.jsx'

export default function PredictionsPage() {
  const [showView, setShowView] = useState('simulator')
  const [autoGenerating, setAutoGenerating] = useState(false)
  const [autoMessage, setAutoMessage] = useState('')
  const [autoError, setAutoError] = useState('')
  
  const {
    matches,
    config,
    loading,
    error,
    loadAll,
    savePrediction,
    saveBracketResults,
    getMyPredictions,
    getMyBracketResults,
    getMyScore,
    isPredictionLocked,
  } = useStore()

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const myPredictions = getMyPredictions()
  const myBracketResults = getMyBracketResults()
  const { totalPoints, breakdown } = getMyScore()
  const isLocked = isPredictionLocked()
  const lockCountdown = config?.tournament?.inaugurationDate 
    ? getPredictionsLockCountdown(config.tournament.inaugurationDate)
    : null

  function randomGroupScore() {
    return Math.floor(Math.random() * 3) + 1
  }

  async function handleAutoGenerateGroupPredictions() {
    if (isLocked || autoGenerating) return

    const groupMatches = matches.filter(match => match.phase === 'group')
    if (groupMatches.length === 0) {
      setAutoError('No hay partidos de fase de grupos para generar.')
      return
    }

    const confirmed = window.confirm(
      'Esto reemplazará tus predicciones de fase de grupos con marcadores aleatorios entre 1 y 3. ¿Continuar?'
    )
    if (!confirmed) return

    setAutoGenerating(true)
    setAutoMessage('')
    setAutoError('')

    try {
      for (const match of groupMatches) {
        await savePrediction(match.id, {
          home: randomGroupScore(),
          away: randomGroupScore(),
        })
      }
      setAutoMessage(`Se generaron ${groupMatches.length} predicciones de fase de grupos.`)
      setTimeout(() => setAutoMessage(''), 3500)
    } catch (err) {
      setAutoError(err.message || 'No se pudieron generar las predicciones automáticas.')
    } finally {
      setAutoGenerating(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  }

  if (error) {
    return <div className="text-center py-20 text-red-500 text-sm">Error: {error}</div>
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
            Ingresa tus marcadores antes de la inauguración
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

      {!isLocked && (
        <div className="bg-white border border-gold/15 rounded-xl p-4 mb-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-semibold text-navy text-sm">Generador automático</p>
              <p className="text-xs text-gray-500 mt-1">
                Rellena solo fase de grupos con marcadores aleatorios del 1 al 3.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoGenerateGroupPredictions}
              disabled={autoGenerating}
              className="inline-flex items-center justify-center rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy shadow-gold-sm transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {autoGenerating ? 'Generando...' : 'Generar grupos'}
            </button>
          </div>
          {autoMessage && (
            <p className="mt-3 text-xs font-medium text-pitch-dark">{autoMessage}</p>
          )}
          {autoError && (
            <p className="mt-3 text-xs font-medium text-live">{autoError}</p>
          )}
        </div>
      )}

      {/* Main view selector */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'simulator', label: '🏟️ Predicciones' },
          { id: 'standings', label: '📊 Tabla' },
          { id: 'bracket', label: '🏆 Llave' },
          { id: 'scores', label: '⭐ Puntuaciones' },
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

      {/* STANDINGS VIEW */}
      {showView === 'standings' && (
        <div>
          <h2 className="font-display text-2xl font-bold text-navy mb-8">Tabla de Posiciones</h2>
          <div className="space-y-12">
            {Array.from(new Set(matches.filter(m => m.phase === 'group' && m.group).map(m => m.group))).sort().map(group => {
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
            bracketResults={myBracketResults}
            onSave={saveBracketResults}
            isLocked={isLocked}
          />
        </div>
      )}

      {/* SCORES VIEW */}
      {showView === 'scores' && (
        <div>
          <h2 className="font-display text-2xl font-bold text-navy mb-8">Puntuaciones</h2>
          <PredictionScores
            breakdown={breakdown}
            rules={config?.rules}
            bracketResults={myBracketResults}
            isLocked={isLocked}
          />
        </div>
      )}
    </div>
  )
}
