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
const PLACEHOLDER = { name: '___', code: '---', flag: '', placeholder: true }
const BOX = { width: 112, height: 59 }
const BOARD = { width: 1160, height: 760 }
const X = {
  leftR32: 0,
  leftR16: 128,
  leftQf: 256,
  leftSf: 384,
  center: 508,
  rightSf: 664,
  rightQf: 792,
  rightR16: 920,
  rightR32: 1048,
}
const Y = {
  r32: [70, 155, 240, 325, 410, 495, 580, 665],
  r16: [112, 282, 452, 622],
  qf: [197, 537],
  sf: [367],
}

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

function MatchBox({ match, picks, onPick, className = '', style }) {
  const enabled = Boolean(match.home && match.away)
  const selectedCode = picks[match.id]

  return (
    <div className={clsx('relative w-[112px] space-y-1', className)} style={style}>
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

function CenterPanel({ finalMatch, thirdPlaceMatch, picks, onPick, champion }) {
  return (
    <div className="absolute flex w-[144px] flex-col items-center" style={{ left: X.center, top: 46 }}>
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

function Label({ children, x }) {
  return (
    <div
      className="absolute h-8 rounded border border-gray-200 bg-gray-50 text-center text-xs font-semibold leading-8 text-gray-600"
      style={{ left: x, top: 0, width: BOX.width }}
    >
      {children}
    </div>
  )
}

function Connector({ from, to, side, active }) {
  const fromX = side === 'left' ? from.x + BOX.width : from.x
  const toX = side === 'left' ? to.x : to.x + BOX.width
  const fromY = from.y + BOX.height / 2
  const toY = to.y + BOX.height / 2
  const midX = side === 'left'
    ? fromX + Math.max(12, (toX - fromX) / 2)
    : fromX - Math.max(12, (fromX - toX) / 2)
  const path = `M ${fromX} ${fromY} H ${midX} V ${toY} H ${toX}`

  return (
    <path
      d={path}
      fill="none"
      stroke={active ? '#D4AF37' : '#D5D5D5'}
      strokeWidth={active ? 1.5 : 1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

function MatchAt({ match, picks, onPick, x, y }) {
  return (
    <MatchBox
      match={match}
      picks={picks}
      onPick={onPick}
      className="absolute z-10"
      style={{ left: x, top: y }}
    />
  )
}

function renderRound(matches, picks, onPick, x, yValues) {
  return matches.map((match, index) => (
    <MatchAt
      key={match.id}
      match={match}
      picks={picks}
      onPick={onPick}
      x={x}
      y={yValues[index]}
    />
  ))
}

function renderConnectors(fromMatches, toMatches, fromX, toX, fromY, toY, side, picks) {
  return fromMatches.map((match, index) => {
    const targetIndex = Math.floor(index / 2)
    const target = toMatches[targetIndex]

    return (
      <Connector
        key={`${match.id}-${target?.id ?? targetIndex}`}
        from={{ x: fromX, y: fromY[index] }}
        to={{ x: toX, y: toY[targetIndex] }}
        side={side}
        active={Boolean(getWinner(match, picks))}
      />
    )
  })
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
        <div className="relative" style={{ width: BOARD.width, height: BOARD.height }}>
          <svg
            className="pointer-events-none absolute inset-0 z-0"
            width={BOARD.width}
            height={BOARD.height}
            viewBox={`0 0 ${BOARD.width} ${BOARD.height}`}
            aria-hidden="true"
          >
            {renderConnectors(leftR32, leftR16, X.leftR32, X.leftR16, Y.r32, Y.r16, 'left', picks)}
            {renderConnectors(leftR16, leftQf, X.leftR16, X.leftQf, Y.r16, Y.qf, 'left', picks)}
            {renderConnectors(leftQf, leftSf, X.leftQf, X.leftSf, Y.qf, Y.sf, 'left', picks)}
            {renderConnectors(leftSf, [bracket.finalMatch], X.leftSf, X.center, Y.sf, [247], 'left', picks)}

            {renderConnectors(rightR32, rightR16, X.rightR32, X.rightR16, Y.r32, Y.r16, 'right', picks)}
            {renderConnectors(rightR16, rightQf, X.rightR16, X.rightQf, Y.r16, Y.qf, 'right', picks)}
            {renderConnectors(rightQf, rightSf, X.rightQf, X.rightSf, Y.qf, Y.sf, 'right', picks)}
            {renderConnectors(rightSf, [bracket.finalMatch], X.rightSf, X.center, Y.sf, [247], 'right', picks)}
          </svg>

          <Label x={X.leftR32}>{ROUND_LABELS[0]}</Label>
          <Label x={X.leftR16}>{ROUND_LABELS[1]}</Label>
          <Label x={X.leftQf}>{ROUND_LABELS[2]}</Label>
          <Label x={X.leftSf}>{ROUND_LABELS[3]}</Label>
          <Label x={X.rightSf}>{ROUND_LABELS[3]}</Label>
          <Label x={X.rightQf}>{ROUND_LABELS[2]}</Label>
          <Label x={X.rightR16}>{ROUND_LABELS[1]}</Label>
          <Label x={X.rightR32}>{ROUND_LABELS[0]}</Label>

          {renderRound(leftR32, picks, handlePick, X.leftR32, Y.r32)}
          {renderRound(leftR16, picks, handlePick, X.leftR16, Y.r16)}
          {renderRound(leftQf, picks, handlePick, X.leftQf, Y.qf)}
          {renderRound(leftSf, picks, handlePick, X.leftSf, Y.sf)}

          <CenterPanel
            finalMatch={bracket.finalMatch}
            thirdPlaceMatch={bracket.thirdPlaceMatch}
            picks={picks}
            onPick={handlePick}
            champion={champion}
          />

          {renderRound(rightSf, picks, handlePick, X.rightSf, Y.sf)}
          {renderRound(rightQf, picks, handlePick, X.rightQf, Y.qf)}
          {renderRound(rightR16, picks, handlePick, X.rightR16, Y.r16)}
          {renderRound(rightR32, picks, handlePick, X.rightR32, Y.r32)}
        </div>
      </div>
    </div>
  )
}
