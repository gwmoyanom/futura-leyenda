/**
 * MatchCard.jsx
 *
 * Displays a single match. Used in multiple contexts:
 * - Landing page: shows live/finished results
 * - Participant predictions: shows prediction input + lock status
 * - Admin match manager: shows score entry form
 *
 * Controlled by the `mode` prop: 'view' | 'predict' | 'admin'
 */

import { useState } from 'react'
import clsx from 'clsx'
import { Badge } from '@/components/ui/index.jsx'
import Button from '@/components/ui/Button.jsx'
import { formatKickoff, getCountdown, isPredictionLocked } from '@/utils/date.utils.js'

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  if (status === 'live') return <Badge variant="live">🔴 EN VIVO</Badge>
  if (status === 'finished') return <Badge variant="gray">Final</Badge>
  return null
}

// ─── Score display ────────────────────────────────────────────────────────────

function ScoreDisplay({ result, kickoff, status }) {
  const countdown = getCountdown(kickoff)

  if (status === 'live' || status === 'finished') {
    return (
      <div className="flex items-center justify-center gap-3">
        <span className="font-display text-4xl font-bold text-navy">
          {result?.home ?? '?'}
        </span>
        <span className="text-gray-400 font-display text-2xl">–</span>
        <span className="font-display text-4xl font-bold text-navy">
          {result?.away ?? '?'}
        </span>
      </div>
    )
  }

  return (
    <div className="text-center">
      {countdown ? (
        <span className="font-display text-xl font-semibold text-gold">
          {countdown}
        </span>
      ) : (
        <span className="font-body text-sm text-gray-500">
          {formatKickoff(kickoff)}
        </span>
      )}
    </div>
  )
}

// ─── Prediction input ─────────────────────────────────────────────────────────

function PredictionInput({ matchId, existingPrediction, isLocked, onSave }) {
  const [home, setHome] = useState(existingPrediction?.home ?? '')
  const [away, setAway] = useState(existingPrediction?.away ?? '')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    const h = parseInt(home)
    const a = parseInt(away)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      setError('Ingresa un marcador válido')
      return
    }

    setSaving(true)
    setError('')

    try {
      await onSave(matchId, { home: h, away: a })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err.message || 'No se pudo guardar la predicción')
    } finally {
      setSaving(false)
    }
  }

  if (isLocked) {
    return (
      <div className="text-center">
        {existingPrediction ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-500">Tu predicción:</span>
            <span className="font-display text-lg font-semibold text-navy">
              {existingPrediction.home} – {existingPrediction.away}
            </span>
            <span className="text-xs text-gray-400">🔒</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Sin predicción 🔒</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          max="20"
          value={home}
          onChange={e => setHome(e.target.value)}
          className="w-14 h-12 text-center font-display text-xl font-bold
                     border-2 border-gold/30 rounded-xl focus:outline-none
                     focus:border-gold bg-gold/5 text-navy"
          placeholder="0"
        />
        <span className="text-gray-400 font-display text-xl">–</span>
        <input
          type="number"
          min="0"
          max="20"
          value={away}
          onChange={e => setAway(e.target.value)}
          className="w-14 h-12 text-center font-display text-xl font-bold
                     border-2 border-gold/30 rounded-xl focus:outline-none
                     focus:border-gold bg-gold/5 text-navy"
          placeholder="0"
        />
      </div>
      <Button size="sm" variant={saved ? 'secondary' : 'primary'} loading={saving} onClick={handleSave}>
        {saved ? '✓ Guardado' : 'Guardar'}
      </Button>
      {error && <p className="text-xs font-medium text-live">{error}</p>}
    </div>
  )
}

// ─── Team display ─────────────────────────────────────────────────────────────

function Team({ team, align = 'left' }) {
  return (
    <div className={clsx('flex flex-col items-center', align === 'right' && 'items-center')}>
      <span className="text-3xl">{team.flag}</span>
      <span className="text-xs font-medium text-gray-600 mt-1 font-body">{team.code}</span>
    </div>
  )
}

// ─── Main MatchCard ───────────────────────────────────────────────────────────

/**
 * @param {object}   match             - match data object
 * @param {'view'|'predict'|'admin'} mode
 * @param {object}   [userPrediction]  - prediction for this user (predict mode)
 * @param {number}   [pointsEarned]    - points awarded (predict mode)
 * @param {function} [onSave]          - callback when prediction is saved
 * @param {function} [onAdminSave]     - callback when admin updates score
 */
export default function MatchCard({
  match,
  mode = 'view',
  userPrediction = null,
  pointsEarned = null,
  onSave,
  onAdminSave,
}) {
  const isLocked = isPredictionLocked(match.kickoff)

  return (
    <div
      className={clsx(
        'bg-white rounded-card border shadow-card',
        'transition-all duration-200 hover:shadow-card-hover',
        match.status === 'live' && 'border-live/30 ring-1 ring-live/20'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/50 rounded-t-card">
        <span className="text-xs text-gray-400 font-body">
          Grupo {match.group} · {match.venue?.split(',')[1]?.trim() ?? match.venue}
        </span>
        <StatusBadge status={match.status} />
      </div>

      {/* Match */}
      <div className="px-4 py-4 grid grid-cols-3 items-center gap-2">
        <Team team={match.homeTeam} />

        <div className="flex flex-col items-center gap-2">
          <ScoreDisplay
            result={match.result}
            kickoff={match.kickoff}
            status={match.status}
          />
          {!isLocked && mode !== 'view' && (
            <span className="text-xs text-gray-400 font-body">
              {formatKickoff(match.kickoff)}
            </span>
          )}
        </div>

        <Team team={match.awayTeam} align="right" />
      </div>

      {/* Points earned indicator */}
      {pointsEarned !== null && mode === 'predict' && (
        <div className={clsx(
          'mx-4 mb-3 py-2 px-3 rounded-lg text-center text-sm font-medium',
          pointsEarned === 3 ? 'bg-pitch/10 text-pitch-dark' :
          pointsEarned === 1 ? 'bg-gold/20 text-gold-dark' :
          'bg-gray-100 text-gray-500'
        )}>
          {pointsEarned === 3 ? '🎯 +3 pts — Resultado exacto' :
           pointsEarned === 1 ? '✅ +1 pt — Resultado correcto' :
           '❌ 0 pts'}
        </div>
      )}

      {/* Prediction area */}
      {mode === 'predict' && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <PredictionInput
            matchId={match.id}
            existingPrediction={userPrediction?.prediction ?? null}
            isLocked={isLocked}
            onSave={onSave}
          />
        </div>
      )}

      {/* Admin score entry */}
      {mode === 'admin' && (
        <AdminScoreEntry match={match} onSave={onAdminSave} />
      )}
    </div>
  )
}

// ─── Admin score entry (inline) ───────────────────────────────────────────────

function AdminScoreEntry({ match, onSave }) {
  const [home, setHome] = useState(match.result?.home ?? '')
  const [away, setAway] = useState(match.result?.away ?? '')
  const [status, setStatus] = useState(match.status)

  function handleSave() {
    onSave(match.id, {
      result: home !== '' && away !== '' ? { home: +home, away: +away } : null,
      status,
    })
  }

  return (
    <div className="px-4 pb-4 pt-3 border-t border-gray-100 space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="number" min="0" value={home}
          onChange={e => setHome(e.target.value)}
          className="w-12 h-10 text-center border border-gray-200 rounded-lg text-sm"
          placeholder="–"
        />
        <span className="text-gray-400">–</span>
        <input
          type="number" min="0" value={away}
          onChange={e => setAway(e.target.value)}
          className="w-12 h-10 text-center border border-gray-200 rounded-lg text-sm"
          placeholder="–"
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="flex-1 h-10 px-2 text-sm border border-gray-200 rounded-lg"
        >
          <option value="upcoming">Próximo</option>
          <option value="live">En vivo</option>
          <option value="finished">Final</option>
        </select>
        <Button size="sm" onClick={handleSave}>Guardar</Button>
      </div>
    </div>
  )
}
