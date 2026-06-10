/**
 * components/participant/PredictionHistory.jsx
 *
 * Shows history of predictions made, timestamps, and versions
 */

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import clsx from 'clsx'

export default function PredictionHistory({ predictions, matches }) {
  // Group predictions by match
  const predictionsWithDetails = predictions
    .map(pred => {
      const match = matches.find(m => m.id === pred.matchId)
      return { ...pred, match }
    })
    .filter(p => p.match)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

  if (predictionsWithDetails.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-sm">Aún no has hecho ninguna predicción</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-navy">
          📋 Tu Historial de Predicciones
        </h3>
        <span className="text-xs bg-gold/10 text-gold-dark px-3 py-1 rounded-full font-semibold">
          {predictionsWithDetails.length} predicción{predictionsWithDetails.length > 1 ? 'es' : ''}
        </span>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {predictionsWithDetails.map((pred, idx) => {
          const match = pred.match
          const prediction = pred.prediction
          const result = match.result
          const isCorrect = result && prediction.home === result.home && prediction.away === result.away
          const isPartialCorrect = result && 
            ((prediction.home > prediction.away && result.home > result.away) ||
             (prediction.home < prediction.away && result.home < result.away) ||
             (prediction.home === prediction.away && result.home === result.away))

          return (
            <div
              key={pred.matchId}
              className={clsx(
                'border rounded-lg p-3 transition-all',
                isCorrect && 'bg-pitch/5 border-pitch/20',
                isPartialCorrect && !isCorrect && 'bg-gold/5 border-gold/20',
                !result && 'bg-gray-50 border-gray-200',
                result && !isPartialCorrect && 'bg-red-50 border-red-200'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Match info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{match.homeTeam.flag}</span>
                    <span className="text-sm font-medium text-navy truncate">
                      {match.homeTeam.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{match.awayTeam.flag}</span>
                    <span className="text-sm font-medium text-navy truncate">
                      {match.awayTeam.name}
                    </span>
                  </div>
                </div>

                {/* Predictions comparison */}
                <div className="text-right">
                  {/* Your prediction */}
                  <div className="text-sm mb-1">
                    <span className="text-gray-500 text-xs">Tu predicción:</span>
                    <div className="font-bold text-navy">
                      {prediction.home} – {prediction.away}
                    </div>
                  </div>

                  {/* Actual result if match is finished */}
                  {result && (
                    <div className="text-sm pt-1 border-t border-gray-200">
                      <span className="text-gray-500 text-xs">Resultado:</span>
                      <div className={clsx(
                        'font-bold',
                        isCorrect ? 'text-pitch-dark' : isPartialCorrect ? 'text-gold-dark' : 'text-red-600'
                      )}>
                        {result.home} – {result.away}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <div className="flex flex-col items-center gap-2">
                  {isCorrect && (
                    <div className="bg-pitch text-white px-2 py-1 rounded text-xs font-bold">
                      ✓ +3
                    </div>
                  )}
                  {isPartialCorrect && !isCorrect && (
                    <div className="bg-gold text-white px-2 py-1 rounded text-xs font-bold">
                      ✓ +1
                    </div>
                  )}
                  {result && !isPartialCorrect && (
                    <div className="bg-gray-400 text-white px-2 py-1 rounded text-xs font-bold">
                      ✗ 0
                    </div>
                  )}
                  {!result && (
                    <div className="bg-gray-300 text-white px-2 py-1 rounded text-xs">
                      Pendiente
                    </div>
                  )}

                  {/* Date */}
                  {pred.createdAt && (
                    <div className="text-xs text-gray-500 text-center">
                      {format(new Date(pred.createdAt), 'dd MMM', { locale: es })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>💡 Tip:</strong> El historial se actualiza automáticamente a medida que se juegan los partidos.
          Verifica tus predicciones después de cada jornada.
        </p>
      </div>
    </div>
  )
}
