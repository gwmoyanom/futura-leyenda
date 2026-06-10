/**
 * components/participant/GroupStandings.jsx
 *
 * Displays group standings table with points, wins, draws, losses
 * Calculates qualified teams to knockout stage
 */

import clsx from 'clsx'
import { calculateGroupStandings } from '@/utils/tournamentSimulator.utils.js'

export default function GroupStandings({ group, matches, predictions }) {
  const predictionMap = Object.fromEntries(predictions.map(prediction => [prediction.matchId, prediction]))
  const standings = calculateGroupStandings(matches, predictionMap, group)
  const qualified = standings.slice(0, 2)

  return (
    <div className="space-y-6">
      {/* Standings table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-navy/5 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">Pos</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">Equipo</th>
              <th className="px-3 py-2 text-center font-semibold text-gray-700">PJ</th>
              <th className="px-3 py-2 text-center font-semibold text-gray-700">G</th>
              <th className="px-3 py-2 text-center font-semibold text-gray-700">E</th>
              <th className="px-3 py-2 text-center font-semibold text-gray-700">P</th>
              <th className="px-3 py-2 text-center font-semibold text-gray-700">GF</th>
              <th className="px-3 py-2 text-center font-semibold text-gray-700">GC</th>
              <th className="px-3 py-2 text-center font-semibold text-gray-700">DG</th>
              <th className="px-3 py-2 text-center font-semibold text-gold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, idx) => {
              const isQualified = idx < 2
              return (
                <tr
                  key={team.code}
                  className={clsx(
                    'border-b border-gray-100 transition-colors',
                    isQualified && 'bg-pitch/5'
                  )}
                >
                  <td className={clsx(
                    'px-3 py-2 font-semibold',
                    isQualified ? 'text-pitch-dark' : 'text-gray-500'
                  )}>
                    {idx + 1}
                  </td>
                  <td className="px-3 py-2 font-medium text-navy">
                    <span className="mr-2">{team.flag}</span>
                    {team.name}
                  </td>
                  <td className="px-3 py-2 text-center text-gray-600">{team.played}</td>
                  <td className="px-3 py-2 text-center text-gray-600">{team.won}</td>
                  <td className="px-3 py-2 text-center text-gray-600">{team.drawn}</td>
                  <td className="px-3 py-2 text-center text-gray-600">{team.lost}</td>
                  <td className="px-3 py-2 text-center text-gray-600">{team.goalsFor}</td>
                  <td className="px-3 py-2 text-center text-gray-600">{team.goalsAgainst}</td>
                  <td className={clsx(
                    'px-3 py-2 text-center font-medium',
                    team.goalDifference > 0 ? 'text-pitch-dark' : team.goalDifference < 0 ? 'text-red-600' : 'text-gray-600'
                  )}>
                    {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                  </td>
                  <td className={clsx(
                    'px-3 py-2 text-center font-bold text-lg',
                    isQualified ? 'text-gold bg-gold/10 rounded-lg' : 'text-gray-700'
                  )}>
                    {team.points}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pitch/20"></div>
          <span>Clasificados a 16avos</span>
        </div>
        <div className="text-gray-300">•</div>
        <span>PJ=Partidos | G=Ganados | E=Empatados | P=Perdidos | GF=Goles a Favor | GC=Goles en Contra | DG=Diferencia de Goles</span>
      </div>

      {/* Qualified teams highlight */}
      <div className="bg-pitch/10 border border-pitch/20 rounded-lg p-4">
        <h4 className="font-semibold text-pitch-dark mb-2 text-sm">✅ Clasificados a 16avos:</h4>
        <div className="flex flex-wrap gap-3">
          {qualified.map((team, idx) => (
            <div key={team.code} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-pitch/20">
              <span className="text-sm font-bold text-pitch-dark">{idx + 1}</span>
              <span className="text-2xl">{team.flag}</span>
              <span className="font-semibold text-navy">{team.name}</span>
              <span className="text-gold font-bold ml-2">{team.points}pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
