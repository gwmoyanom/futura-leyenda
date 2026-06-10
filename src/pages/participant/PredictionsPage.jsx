/**
 * pages/participant/PredictionsPage.jsx
 *
 * The main prediction form. Shows all matches grouped by date,
 * with score input for each upcoming match and locked results for past ones.
 */

import { useEffect } from 'react'
import useStore from '@/store/index.js'
import MatchCard from '@/components/participant/MatchCard.jsx'
import { Spinner } from '@/components/ui/index.jsx'
import { groupMatchesByDate, formatDateLabel } from '@/utils/date.utils.js'

export default function PredictionsPage() {
  const {
    matches,
    loading,
    error,
    loadAll,
    savePrediction,
    getMyPredictions,
    getMyScore,
  } = useStore()

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const myPredictions = getMyPredictions()
  const { totalPoints } = getMyScore()

  // Build a lookup map: matchId → prediction
  const predictionMap = Object.fromEntries(
    myPredictions.map(p => [p.matchId, p])
  )

  const grouped = groupMatchesByDate(matches)
  const dateKeys = Object.keys(grouped).sort()

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  }

  if (error) {
    return <div className="text-center py-20 text-red-500 text-sm">Error: {error}</div>
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
          <div className="text-xs text-gray-400 uppercase tracking-wider">puntos</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs text-gray-500">
        <span>🎯 Resultado exacto = <strong>3 pts</strong></span>
        <span>✅ Resultado correcto = <strong>1 pt</strong></span>
        <span>🔒 Cerrado al inicio del partido</span>
      </div>

      {/* Matches by date */}
      <div className="space-y-8">
        {dateKeys.map(dateKey => (
          <div key={dateKey}>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-200 capitalize">
              {formatDateLabel(dateKey)}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped[dateKey].map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  mode="predict"
                  userPrediction={predictionMap[match.id] ?? null}
                  pointsEarned={predictionMap[match.id]?.pointsEarned ?? null}
                  onSave={savePrediction}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          No hay partidos disponibles todavía
        </div>
      )}
    </div>
  )
}
