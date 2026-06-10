/**
 * components/participant/KnockoutBracket.jsx
 *
 * Interactive generated knockout bracket. It starts from simulated group
 * standings and lets the user pick winners round by round until champion.
 */

import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { buildStandingsByGroup, getGroups } from '@/utils/tournamentSimulator.utils.js'

const ROUND_LABELS = ['16avos', '8avos', '4tos', 'Semis']
const ROUND_BY_PREFIX = {
  r32: 0,
  r16: 1,
  qf: 2,
  sf: 3,
  final: 4,
  third: 4,
}
const SPACING = {
  r32: 'gap-2',
  r16: 'gap-11',
  qf: 'gap-28',
  sf: 'gap-64',
}
const PLACEHOLDER = { name: '___', code: '---', flag: '', placeholder: true }

function withMeta(team, group, position) {
  if (!team) return null
  return { ...team, group, groupPosition: position }
}

function sortTeams(a, b) {
  if (b.points !== a.points) return b.points - a.points
  if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
  return a.name.localeCompare(b.name)
}

function buildQualifiedTeams(matches, predictions) {
  const standingsByGroup = buildStandingsByGroup(matches, predictions)
  const groups = getGroups(matches)
  const winners = []
  const runnersUp = []
  const thirds = []

  groups.forEach(group => {
    winners.push(withMeta(standingsByGroup[group]?.[0], group, 1))
    runnersUp.push(withMeta(standingsByGroup[group]?.[1], group, 2))
    thirds.push(withMeta(standingsByGroup[group]?.[2], group, 3))
  })

  const bestThirds = thirds.filter(Boolean).sort(sortTeams).slice(0, 8)
  return [...winners.filter(Boolean), ...runnersUp.filter(Boolean), ...bestThirds]
}

function pairSeeds(teams) {
  const seeded = [...teams].sort(sortTeams)

  return Array.from({ length: 16 }, (_, index) => ({
    id: `r32-${index + 1}`,
    home: seeded[index] ?? null,
    away: seeded[31 - index] ?? null,
  }))
}

function getWinner(match, picks) {
  const code = picks[match.id]
  if (!code) return null
  if (match.home?.code === code) return match.home
  if (match.away?.code === code) return match.away
  return null
}

function getLoser(match, picks) {
  const winner = getWinner(match, picks)
  if (!winner) return null
  return winner.code === match.home?.code ? match.away : match.home
}

function makeNextRound(previousRound, prefix, picks) {
  return Array.from({ length: previousRound.length / 2 }, (_, index) => ({
    id: `${prefix}-${index + 1}`,
    home: getWinner(previousRound[index * 2], picks),
    away: getWinner(previousRound[index * 2 + 1], picks),
  }))
}

function getRoundIndex(matchId) {
  return ROUND_BY_PREFIX[matchId.split('-')[0]] ?? 0
}

function TeamButton({ team, enabled, selected, faded, onClick }) {
  const isPlaceholder = !team || team.placeholder

  return (
    <button
      type="button"
      disabled={!enabled || isPlaceholder}
      onClick={onClick}
      className={clsx(
        'flex h-7 w-full items-center gap-2 rounded-md border px-2 text-xs transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40',
        selected && 'border-gold bg-gold/10 text-navy shadow-gold-sm',
        !selected && !faded && !isPlaceholder && 'border-gray-300 bg-white text-navy hover:border-gold',
        faded && 'border-gray-200 bg-gray-50 text-gray-400 opacity-60',
        isPlaceholder && 'border-gray-200 bg-gray-50 text-gray-400',
        (!enabled || isPlaceholder) && 'cursor-not-allowed'
      )}
    >
      <span className={clsx(
        'h-4 w-4 shrink-0 rounded-full border text-[10px] leading-4 text-center',
        selected ? 'border-gold bg-white' : 'border-gray-300'
      )}>
        {team?.flag || ''}
      </span>
      <span className="min-w-0 flex-1 truncate text-left font-medium">
        {isPlaceholder ? '___' : team.name}
      </span>
      {!isPlaceholder && (
        <span className="shrink-0 text-[10px] font-semibold text-gray-400">
          {team.group ? `${team.group}${team.groupPosition}` : team.code}
        </span>
      )}
    </button>
  )
}

function MatchBox({ match, picks, onPick }) {
  const enabled = Boolean(match.home && match.away)
  const selectedCode = picks[match.id]

  return (
    <div className="relative w-[112px] space-y-1">
      <TeamButton
        team={match.home ?? PLACEHOLDER}
        enabled={enabled}
        selected={selectedCode === match.home?.code}
        faded={Boolean(selectedCode && selectedCode !== match.home?.code)}
        onClick={() => onPick(match, match.home)}
      />
      <TeamButton
        team={match.away ?? PLACEHOLDER}
        enabled={enabled}
        selected={selectedCode === match.away?.code}
        faded={Boolean(selectedCode && selectedCode !== match.away?.code)}
        onClick={() => onPick(match, match.away)}
      />
    </div>
  )
}

function BracketColumn({ title, matches, picks, onPick, spacing, align = 'left' }) {
  return (
    <div className="flex w-[118px] shrink-0 flex-col">
      <div className="mb-7 h-8 rounded border border-gray-200 bg-gray-50 text-center text-xs font-semibold leading-8 text-gray-600">
        {title}
      </div>
      <div className={clsx('flex flex-1 flex-col', spacing, align === 'right' && 'items-end')}>
        {matches.map(match => (
          <MatchBox key={match.id} match={match} picks={picks} onPick={onPick} />
        ))}
      </div>
    </div>
  )
}

function CenterPanel({ finalMatch, thirdPlaceMatch, picks, onPick, champion }) {
  return (
    <div className="flex w-[140px] shrink-0 flex-col items-center pt-8">
      <div className="mb-8 h-32 text-center">
        {champion ? (
          <div>
            <div className="text-2xl">{champion.flag}</div>
            <div className="text-sm text-navy">{champion.name}</div>
            <div className="font-display text-lg font-bold text-navy">CAMPEÓN</div>
            <div className="mt-3 text-5xl">🏆</div>
          </div>
        ) : (
          <div className="pt-10 text-xs font-semibold uppercase text-gray-400">Campeón por definir</div>
        )}
      </div>

      <div className="rounded-3xl bg-gold/10 px-3 py-4">
        <div className="rounded-xl border border-gray-300 bg-white p-3 shadow-card">
          <h3 className="mb-3 text-center font-display text-lg font-bold text-navy">Final</h3>
          <MatchBox match={finalMatch} picks={picks} onPick={onPick} />
        </div>

        <div className="mt-24 rounded-xl border border-gray-300 bg-white p-3 shadow-card">
          <h3 className="mb-3 text-center font-display text-base font-bold leading-5 text-navy">3er<br />Puesto</h3>
          <MatchBox match={thirdPlaceMatch} picks={picks} onPick={onPick} />
        </div>
      </div>
    </div>
  )
}

export default function KnockoutBracket({ matches, predictions }) {
  const [picks, setPicks] = useState({})
  const qualified = useMemo(() => buildQualifiedTeams(matches, predictions), [matches, predictions])

  const bracket = useMemo(() => {
    const r32 = pairSeeds(qualified)
    const r16 = makeNextRound(r32, 'r16', picks)
    const qf = makeNextRound(r16, 'qf', picks)
    const sf = makeNextRound(qf, 'sf', picks)
    const finalMatch = {
      id: 'final-1',
      home: getWinner(sf[0], picks),
      away: getWinner(sf[1], picks),
    }
    const thirdPlaceMatch = {
      id: 'third-1',
      home: getLoser(sf[0], picks),
      away: getLoser(sf[1], picks),
    }

    return { r32, r16, qf, sf, finalMatch, thirdPlaceMatch }
  }, [qualified, picks])

  function handlePick(match, team) {
    if (!team || !match.home || !match.away) return
    const roundIndex = getRoundIndex(match.id)

    setPicks(current => {
      const next = {}
      Object.entries(current).forEach(([matchId, code]) => {
        if (getRoundIndex(matchId) <= roundIndex && matchId !== match.id) {
          next[matchId] = code
        }
      })
      next[match.id] = team.code
      return next
    })
  }

  const champion = getWinner(bracket.finalMatch, picks)
  const leftR32 = bracket.r32.slice(0, 8)
  const rightR32 = bracket.r32.slice(8).reverse()
  const leftR16 = bracket.r16.slice(0, 4)
  const rightR16 = bracket.r16.slice(4).reverse()
  const leftQf = bracket.qf.slice(0, 2)
  const rightQf = bracket.qf.slice(2).reverse()
  const leftSf = bracket.sf.slice(0, 1)
  const rightSf = bracket.sf.slice(1)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          La llave se llena con tus tablas simuladas. Elige cada ganador para avanzar hasta el campeón.
        </p>
        <div className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600">
          {qualified.length}/32 equipos
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white p-4 shadow-card">
        <div className="flex min-h-[760px] min-w-[1160px] justify-between gap-5">
          <BracketColumn title={ROUND_LABELS[0]} matches={leftR32} picks={picks} onPick={handlePick} spacing={SPACING.r32} />
          <BracketColumn title={ROUND_LABELS[1]} matches={leftR16} picks={picks} onPick={handlePick} spacing={SPACING.r16} />
          <BracketColumn title={ROUND_LABELS[2]} matches={leftQf} picks={picks} onPick={handlePick} spacing={SPACING.qf} />
          <BracketColumn title={ROUND_LABELS[3]} matches={leftSf} picks={picks} onPick={handlePick} spacing={SPACING.sf} />
          <CenterPanel
            finalMatch={bracket.finalMatch}
            thirdPlaceMatch={bracket.thirdPlaceMatch}
            picks={picks}
            onPick={handlePick}
            champion={champion}
          />
          <BracketColumn title={ROUND_LABELS[3]} matches={rightSf} picks={picks} onPick={handlePick} spacing={SPACING.sf} align="right" />
          <BracketColumn title={ROUND_LABELS[2]} matches={rightQf} picks={picks} onPick={handlePick} spacing={SPACING.qf} align="right" />
          <BracketColumn title={ROUND_LABELS[1]} matches={rightR16} picks={picks} onPick={handlePick} spacing={SPACING.r16} align="right" />
          <BracketColumn title={ROUND_LABELS[0]} matches={rightR32} picks={picks} onPick={handlePick} spacing={SPACING.r32} align="right" />
        </div>
      </div>
    </div>
  )
}
