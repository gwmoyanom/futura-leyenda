/**
 * components/participant/KnockoutBracket.jsx
 *
 * Interactive generated knockout bracket. The layout is grid-based: every
 * round occupies row spans that mirror the bracket structure, so winners stay
 * visually tied to the branch that produced them.
 */

import { useEffect, useMemo, useState } from 'react'
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
const COL_W = 94
const COL_GAP = 18
const ROW_H = 70
const HEADER_H = 34
const BOARD_W = COL_W * 9 + COL_GAP * 8
const BOARD_H = HEADER_H + ROW_H * 8

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

function buildBracketFromPicks(qualified, picks) {
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
}

function pruneAndSetPick(current, match, team) {
  const roundIndex = getRoundIndex(match.id)
  const next = {}

  Object.entries(current).forEach(([matchId, code]) => {
    if (getRoundIndex(matchId) <= roundIndex && matchId !== match.id) {
      next[matchId] = code
    }
  })

  next[match.id] = team.code
  return next
}

function TeamButton({ team, enabled, selected, faded, onClick }) {
  const isPlaceholder = !team || team.placeholder

  return (
    <button
      type="button"
      disabled={!enabled || isPlaceholder}
      onClick={onClick}
      className={clsx(
        'flex h-6 w-full items-center gap-1.5 rounded-md border px-2 text-xs transition-colors',
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
      <span className="min-w-0 flex-1 truncate text-left font-medium" title={isPlaceholder ? '' : team.name}>
        {isPlaceholder ? '___' : team.code}
      </span>
    </button>
  )
}

function MatchBox({ match, picks, onPick }) {
  const enabled = Boolean(match.home && match.away)
  const selectedCode = picks[match.id]

  return (
    <div className="relative w-full space-y-1">
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

function GridSlot({ col, row, span, children }) {
  return (
    <div
      className="relative z-10 flex items-center"
      style={{
        gridColumn: col + 1,
        gridRow: `${row + 2} / span ${span}`,
      }}
    >
      {children}
    </div>
  )
}

function Label({ col, children }) {
  return (
    <div
      className="h-8 rounded border border-gray-200 bg-gray-50 text-center text-xs font-semibold leading-8 text-gray-600"
      style={{ gridColumn: col + 1, gridRow: 1 }}
    >
      {children}
    </div>
  )
}

function CenterPanel({ finalMatch, thirdPlaceMatch, picks, onPick, champion }) {
  return (
    <div className="relative z-10 flex h-full flex-col items-center justify-center">
      <div className="mb-3 h-24 text-center">
        {champion ? (
          <div>
            <div className="text-2xl">{champion.flag}</div>
            <div className="text-sm text-navy">{champion.name}</div>
            <div className="font-display text-lg font-bold text-navy">CAMPEÓN</div>
            <div className="mt-2 text-4xl">🏆</div>
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

        <div className="mt-14 rounded-xl border border-gray-300 bg-white p-3 shadow-card">
          <h3 className="mb-3 text-center font-display text-base font-bold leading-5 text-navy">3er<br />Puesto</h3>
          <MatchBox match={thirdPlaceMatch} picks={picks} onPick={onPick} />
        </div>
      </div>
    </div>
  )
}

function colLeft(col) {
  return col * (COL_W + COL_GAP)
}

function colRight(col) {
  return colLeft(col) + COL_W
}

function rowCenter(row, span) {
  return HEADER_H + row * ROW_H + span * ROW_H / 2
}

function connectorPath(from, to, side) {
  const startX = side === 'left' ? colRight(from.col) : colLeft(from.col)
  const endX = side === 'left' ? colLeft(to.col) : colRight(to.col)
  const startY = rowCenter(from.row, from.span)
  const endY = rowCenter(to.row, to.span)
  const middleX = side === 'left'
    ? startX + (endX - startX) / 2
    : startX - (startX - endX) / 2

  return `M ${startX} ${startY} H ${middleX} V ${endY} H ${endX}`
}

function Connector({ from, to, side, active }) {
  return (
    <path
      d={connectorPath(from, to, side)}
      fill="none"
      stroke={active ? '#D4AF37' : '#D5D5D5'}
      strokeWidth={active ? 1.5 : 1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

function roundSlots(matches, col, rowSpan) {
  return matches.map((match, index) => ({
    match,
    col,
    row: index * rowSpan,
    span: rowSpan,
  }))
}

function renderSlots(slots, picks, onPick) {
  return slots.map(slot => (
    <GridSlot key={slot.match.id} col={slot.col} row={slot.row} span={slot.span}>
      <MatchBox match={slot.match} picks={picks} onPick={onPick} />
    </GridSlot>
  ))
}

function renderConnectors(fromSlots, toSlots, side, picks) {
  return fromSlots.map((slot, index) => {
    const target = toSlots[Math.floor(index / 2)]

    return (
      <Connector
        key={`${slot.match.id}-${target.match.id}`}
        from={slot}
        to={target}
        side={side}
        active={Boolean(getWinner(slot.match, picks))}
      />
    )
  })
}

export default function KnockoutBracket({ matches, predictions, bracketResults, onSave }) {
  const [picks, setPicks] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const qualified = useMemo(() => buildQualifiedTeams(matches, predictions), [matches, predictions])

  useEffect(() => {
    setPicks(bracketResults?.picks ?? {})
  }, [bracketResults?.updatedAt])

  const bracket = useMemo(() => buildBracketFromPicks(qualified, picks), [qualified, picks])

  function handlePick(match, team) {
    if (!team || !match.home || !match.away) return
    const next = pruneAndSetPick(picks, match, team)
    const nextBracket = buildBracketFromPicks(qualified, next)
    const nextChampion = getWinner(nextBracket.finalMatch, next)

    setPicks(next)
    setSaving(true)
    setSaveError('')

    Promise.resolve(onSave?.({
      picks: next,
      champion: nextChampion
        ? { code: nextChampion.code, name: nextChampion.name, flag: nextChampion.flag }
        : null,
    })).catch(err => {
      setSaveError(err.message || 'No se pudo guardar la llave')
    }).finally(() => {
      setSaving(false)
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

  const slots = {
    leftR32: roundSlots(leftR32, 0, 1),
    leftR16: roundSlots(leftR16, 1, 2),
    leftQf: roundSlots(leftQf, 2, 4),
    leftSf: roundSlots(leftSf, 3, 8),
    rightSf: roundSlots(rightSf, 5, 8),
    rightQf: roundSlots(rightQf, 6, 4),
    rightR16: roundSlots(rightR16, 7, 2),
    rightR32: roundSlots(rightR32, 8, 1),
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          La llave se llena con tus tablas simuladas. Elige cada ganador para avanzar hasta el campeón.
        </p>
        <div className="flex items-center gap-2">
          {saveError && <span className="text-xs font-semibold text-live">{saveError}</span>}
          <div className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600">
            {saving ? 'Guardando...' : `${qualified.length}/32 equipos`}
          </div>
        </div>
      </div>

      <div className="overflow-auto rounded-xl border border-gray-100 bg-white p-4 shadow-card">
        <div
          className="relative grid"
          style={{
            width: BOARD_W,
            height: BOARD_H,
            gridTemplateColumns: `repeat(9, ${COL_W}px)`,
            gridTemplateRows: `${HEADER_H}px repeat(8, ${ROW_H}px)`,
            columnGap: COL_GAP,
          }}
        >
          <svg
            className="pointer-events-none absolute inset-0 z-0"
            width={BOARD_W}
            height={BOARD_H}
            viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
            aria-hidden="true"
          >
            {renderConnectors(slots.leftR32, slots.leftR16, 'left', picks)}
            {renderConnectors(slots.leftR16, slots.leftQf, 'left', picks)}
            {renderConnectors(slots.leftQf, slots.leftSf, 'left', picks)}
            {renderConnectors(slots.rightR32, slots.rightR16, 'right', picks)}
            {renderConnectors(slots.rightR16, slots.rightQf, 'right', picks)}
            {renderConnectors(slots.rightQf, slots.rightSf, 'right', picks)}
          </svg>

          <Label col={0}>{ROUND_LABELS[0]}</Label>
          <Label col={1}>{ROUND_LABELS[1]}</Label>
          <Label col={2}>{ROUND_LABELS[2]}</Label>
          <Label col={3}>{ROUND_LABELS[3]}</Label>
          <Label col={5}>{ROUND_LABELS[3]}</Label>
          <Label col={6}>{ROUND_LABELS[2]}</Label>
          <Label col={7}>{ROUND_LABELS[1]}</Label>
          <Label col={8}>{ROUND_LABELS[0]}</Label>

          {renderSlots(slots.leftR32, picks, handlePick)}
          {renderSlots(slots.leftR16, picks, handlePick)}
          {renderSlots(slots.leftQf, picks, handlePick)}
          {renderSlots(slots.leftSf, picks, handlePick)}

          <div className="z-10" style={{ gridColumn: 5, gridRow: '2 / span 8' }}>
            <CenterPanel
              finalMatch={bracket.finalMatch}
              thirdPlaceMatch={bracket.thirdPlaceMatch}
              picks={picks}
              onPick={handlePick}
              champion={champion}
            />
          </div>

          {renderSlots(slots.rightSf, picks, handlePick)}
          {renderSlots(slots.rightQf, picks, handlePick)}
          {renderSlots(slots.rightR16, picks, handlePick)}
          {renderSlots(slots.rightR32, picks, handlePick)}
        </div>
      </div>
    </div>
  )
}
