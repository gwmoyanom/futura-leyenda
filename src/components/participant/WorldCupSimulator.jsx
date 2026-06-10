import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import Button from '@/components/ui/Button.jsx'
import { Badge } from '@/components/ui/index.jsx'
import { formatKickoff } from '@/utils/date.utils.js'
import {
  KNOCKOUT_PHASES,
  buildStandingsByGroup,
  getGroups,
  getPredictionScore,
  getScenarioScore,
  getSimulatorProgress,
  resolveTeam,
} from '@/utils/tournamentSimulator.utils.js'

const phaseLabels = {
  round16: 'Octavos',
  quarterfinal: 'Cuartos',
  semifinal: 'Semifinales',
  final: 'Final',
}

function TeamLabel({ team, align = 'left' }) {
  return (
    <div className={clsx('flex items-center gap-2 min-w-0', align === 'right' && 'justify-end')}>
      <span className="text-xl shrink-0">{team.flag}</span>
      <div className={clsx('min-w-0', align === 'right' && 'text-right')}>
        <div className="font-semibold text-navy text-sm truncate">{team.name}</div>
        <div className="text-[11px] uppercase text-gray-400 font-semibold">{team.code}</div>
      </div>
    </div>
  )
}

function ScoreInput({ value, onChange, disabled }) {
  return (
    <input
      type="number"
      min="0"
      max="20"
      value={value}
      disabled={disabled}
      onChange={event => onChange(event.target.value)}
      className="h-10 w-12 rounded-lg border border-gold/30 bg-gold/5 text-center font-display text-lg font-bold text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 disabled:bg-gray-100 disabled:text-gray-400"
      placeholder="0"
    />
  )
}

function SimulatorMatchRow({ match, score, onScoreChange, disabled, compact = false, teams }) {
  const [draft, setDraft] = useState({
    home: score?.home ?? '',
    away: score?.away ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setDraft({
      home: score?.home ?? '',
      away: score?.away ?? '',
    })
  }, [score?.home, score?.away])

  async function saveScore(nextScore) {
    setSaving(true)
    setError('')

    try {
      await onScoreChange(match.id, nextScore)
    } catch (err) {
      setError(err.message || 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  function commit(nextDraft = draft) {
    const home = Number.parseInt(nextDraft.home, 10)
    const away = Number.parseInt(nextDraft.away, 10)
    if (!Number.isFinite(home) || !Number.isFinite(away) || home < 0 || away < 0) return
    saveScore({ home, away })
  }

  function update(side, value) {
    const nextDraft = { ...draft, [side]: value }
    setDraft(nextDraft)

    const home = Number.parseInt(nextDraft.home, 10)
    const away = Number.parseInt(nextDraft.away, 10)
    if (Number.isFinite(home) && Number.isFinite(away) && home >= 0 && away >= 0) {
      saveScore({ home, away })
    }
  }

  const homeTeam = teams?.home ?? match.homeTeam
  const awayTeam = teams?.away ?? match.awayTeam
  const hasPrediction = score !== null

  return (
    <div className={clsx(
      'grid items-center gap-3 rounded-xl border bg-white p-3 shadow-card',
      compact ? 'grid-cols-[1fr_auto_1fr]' : 'grid-cols-1 sm:grid-cols-[1fr_auto_1fr]',
      hasPrediction ? 'border-gold/30' : 'border-gray-100'
    )}>
      <TeamLabel team={homeTeam} />

      <div className="flex items-center justify-center gap-2">
        <ScoreInput value={draft.home} disabled={disabled} onChange={value => update('home', value)} />
        <span className="font-display text-lg text-gray-300">-</span>
        <ScoreInput value={draft.away} disabled={disabled} onChange={value => update('away', value)} />
        {!disabled && (
          <Button size="sm" variant="ghost" className="hidden lg:inline-flex px-2" loading={saving} onClick={() => commit()}>
            {saving ? '' : 'OK'}
          </Button>
        )}
      </div>

      <TeamLabel team={awayTeam} align="right" />

      {!compact && (
        <div className="sm:col-span-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2 text-xs text-gray-400">
          <span>{formatKickoff(match.kickoff)}</span>
          <span className={clsx('truncate', error && 'text-live')}>{error || match.venue}</span>
        </div>
      )}
    </div>
  )
}

function StandingsTable({ group, standings }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card">
      <div className="flex items-center justify-between bg-navy px-4 py-3 text-white">
        <h3 className="font-display text-lg font-bold tracking-wide">Grupo {group}</h3>
        <Badge variant="gold">Top 2</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-[11px] uppercase text-gray-400">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Equipo</th>
              <th className="px-2 py-2 text-center">PJ</th>
              <th className="px-2 py-2 text-center">DG</th>
              <th className="px-2 py-2 text-center text-gold-dark">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, index) => (
              <tr key={team.code} className={clsx('border-t border-gray-100', index < 2 && 'bg-pitch/5')}>
                <td className={clsx('px-3 py-2 font-bold', index < 2 ? 'text-pitch-dark' : 'text-gray-400')}>
                  {index + 1}
                </td>
                <td className="px-3 py-2">
                  <TeamLabel team={team} />
                </td>
                <td className="px-2 py-2 text-center text-gray-600">{team.played}</td>
                <td className={clsx(
                  'px-2 py-2 text-center font-semibold',
                  team.goalDifference > 0 ? 'text-pitch-dark' : team.goalDifference < 0 ? 'text-live' : 'text-gray-500'
                )}>
                  {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                </td>
                <td className="px-2 py-2 text-center font-display text-lg font-bold text-gold-dark">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function GroupSimulator({ group, matches, standings, predictionMap, onScoreChange, disabled }) {
  const groupMatches = matches
    .filter(match => match.phase === 'group' && match.group === group)
    .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
      <div className="space-y-3">
        {groupMatches.map(match => (
          <SimulatorMatchRow
            key={match.id}
            match={match}
            score={getPredictionScore(predictionMap, match.id)}
            onScoreChange={onScoreChange}
            disabled={disabled}
          />
        ))}
      </div>
      <StandingsTable group={group} standings={standings} />
    </section>
  )
}

function KnockoutCard({ match, predictionMap, standingsByGroup, onScoreChange, disabled }) {
  const [savingWinner, setSavingWinner] = useState('')
  const [error, setError] = useState('')
  const homeTeam = resolveTeam(match.homeTeam, standingsByGroup)
  const awayTeam = resolveTeam(match.awayTeam, standingsByGroup)
  const score = getScenarioScore(match, predictionMap)
  const winner =
    score?.home > score?.away ? homeTeam :
    score?.away > score?.home ? awayTeam :
    null

  async function chooseWinner(side) {
    if (disabled) return
    setSavingWinner(side)
    setError('')

    try {
      await onScoreChange(match.id, side === 'home' ? { home: 1, away: 0 } : { home: 0, away: 1 })
    } catch (err) {
      setError(err.message || 'No se pudo guardar')
    } finally {
      setSavingWinner('')
    }
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
        <span className="text-xs font-semibold uppercase text-gray-400">{phaseLabels[match.phase]}</span>
        {winner && <Badge variant="green">{winner.code}</Badge>}
      </div>

      <SimulatorMatchRow
        match={match}
        score={getPredictionScore(predictionMap, match.id)}
        onScoreChange={onScoreChange}
        disabled={disabled}
        compact
        teams={{ home: homeTeam, away: awayTeam }}
      />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button size="sm" variant={winner?.code === homeTeam.code ? 'primary' : 'secondary'} loading={savingWinner === 'home'} onClick={() => chooseWinner('home')} disabled={disabled}>
          {homeTeam.code}
        </Button>
        <Button size="sm" variant={winner?.code === awayTeam.code ? 'primary' : 'secondary'} loading={savingWinner === 'away'} onClick={() => chooseWinner('away')} disabled={disabled}>
          {awayTeam.code}
        </Button>
      </div>
      {error && <p className="mt-2 text-center text-xs font-medium text-live">{error}</p>}
    </div>
  )
}

function KnockoutSimulator({ matches, predictions, standingsByGroup, onScoreChange, disabled }) {
  const predictionMap = useMemo(
    () => Object.fromEntries(predictions.map(prediction => [prediction.matchId, prediction])),
    [predictions]
  )

  return (
    <section className="space-y-6">
      {KNOCKOUT_PHASES.map(phase => {
        const phaseMatches = matches
          .filter(match => match.phase === phase)
          .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))

        if (phaseMatches.length === 0) return null

        return (
          <div key={phase}>
            <h3 className="mb-3 font-display text-lg font-bold text-navy">{phaseLabels[phase]}</h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {phaseMatches.map(match => (
                <KnockoutCard
                  key={match.id}
                  match={match}
                  predictionMap={predictionMap}
                  standingsByGroup={standingsByGroup}
                  onScoreChange={onScoreChange}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}

export default function WorldCupSimulator({ matches, predictions, onSave, isLocked }) {
  const [activeGroup, setActiveGroup] = useState('A')
  const groups = useMemo(() => getGroups(matches), [matches])
  const predictionMap = useMemo(
    () => Object.fromEntries(predictions.map(prediction => [prediction.matchId, prediction])),
    [predictions]
  )
  const standingsByGroup = useMemo(
    () => buildStandingsByGroup(matches, predictions),
    [matches, predictions]
  )
  const progress = useMemo(
    () => getSimulatorProgress(matches, predictions),
    [matches, predictions]
  )
  const champion = useMemo(() => {
    const final = matches.find(match => match.phase === 'final')
    if (!final) return null
    const score = getScenarioScore(final, predictionMap)
    if (!score || score.home === score.away) return null
    return score.home > score.away
      ? resolveTeam(final.homeTeam, standingsByGroup)
      : resolveTeam(final.awayTeam, standingsByGroup)
  }, [matches, predictionMap, standingsByGroup])

  const currentGroup = groups.includes(activeGroup) ? activeGroup : groups[0]

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-navy p-5 text-white shadow-navy">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Simulador Mundial 2026</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-wide">Realiza tu predicción</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 px-4 py-3">
              <div className="font-display text-2xl font-bold text-gold">{progress.completed}/{progress.total}</div>
              <div className="text-xs uppercase text-white/60">Marcadores</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3">
              <div className="font-display text-2xl font-bold text-gold">{progress.percent}%</div>
              <div className="text-xs uppercase text-white/60">Completo</div>
            </div>
            <div className="col-span-2 rounded-xl bg-white/10 px-4 py-3 sm:col-span-1">
              <div className="font-display text-2xl font-bold text-gold">{champion?.code ?? '---'}</div>
              <div className="text-xs uppercase text-white/60">Campeón</div>
            </div>
          </div>
        </div>
      </section>

      {isLocked && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          Predicciones cerradas
        </div>
      )}

      <div>
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {groups.map(group => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={clsx(
                'h-10 min-w-12 rounded-lg px-4 text-sm font-bold transition-colors',
                currentGroup === group
                  ? 'bg-gold text-navy shadow-gold-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-navy'
              )}
            >
              {group}
            </button>
          ))}
        </div>

        {currentGroup && (
          <GroupSimulator
            group={currentGroup}
            matches={matches}
            standings={standingsByGroup[currentGroup] ?? []}
            predictionMap={predictionMap}
            onScoreChange={onSave}
            disabled={isLocked}
          />
        )}
      </div>

      <KnockoutSimulator
        matches={matches}
        predictions={predictions}
        standingsByGroup={standingsByGroup}
        onScoreChange={onSave}
        disabled={isLocked}
      />
    </div>
  )
}
