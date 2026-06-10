/**
 * components/participant/KnockoutBracket.jsx
 *
 * Generated knockout bracket from simulated group standings.
 * The current dataset only has group-stage matches, so this view derives the
 * 32-team bracket from first/second places plus the 8 best third-place teams.
 */

import clsx from 'clsx'
import { buildStandingsByGroup, getGroups } from '@/utils/tournamentSimulator.utils.js'

const ROUND_LABELS = ['16avos', '8avos', '4tos', 'Semis']
const SPACING = {
  r32: 'gap-2',
  r16: 'gap-11',
  qf: 'gap-28',
  sf: 'gap-64',
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
  const pairs = []

  for (let index = 0; index < 16; index += 1) {
    pairs.push({
      id: `r32-${index + 1}`,
      home: seeded[index] ?? null,
      away: seeded[31 - index] ?? null,
    })
  }

  return pairs
}

function placeholderMatch(id, label) {
  return {
    id,
    home: { name: label, code: '---', flag: '' },
    away: { name: label, code: '---', flag: '' },
    pending: true,
  }
}

function buildEmptyRound(prefix, count, label) {
  return Array.from({ length: count }, (_, index) => placeholderMatch(`${prefix}-${index + 1}`, label))
}

function TeamLine({ team, pending }) {
  return (
    <div className={clsx(
      'flex h-7 items-center gap-2 rounded-md border px-2 text-xs',
      pending ? 'border-gray-200 bg-gray-50 text-gray-400' : 'border-gray-200 bg-white text-navy'
    )}>
      <span className={clsx(
        'h-4 w-4 rounded-full border text-[10px] leading-4 text-center',
        pending ? 'border-gray-300' : 'border-gold/50 bg-gold/10'
      )}>
        {team?.flag || ''}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">
        {pending ? '___' : team?.name}
      </span>
      {!pending && (
        <span className="shrink-0 text-[10px] font-semibold text-gray-400">
          {team.group}{team.groupPosition}
        </span>
      )}
    </div>
  )
}

function MatchBox({ match }) {
  const pending = match.pending

  return (
    <div className="relative w-[106px] space-y-1">
      <TeamLine team={match.home} pending={pending} />
      <TeamLine team={match.away} pending={pending} />
    </div>
  )
}

function BracketColumn({ title, matches, spacing, align = 'left' }) {
  return (
    <div className="flex w-[112px] shrink-0 flex-col">
      <div className="mb-7 h-8 rounded border border-gray-200 bg-gray-50 text-center text-xs font-semibold leading-8 text-gray-600">
        {title}
      </div>
      <div className={clsx('flex flex-1 flex-col', spacing, align === 'right' && 'items-end')}>
        {matches.map(match => (
          <MatchBox key={match.id} match={match} />
        ))}
      </div>
    </div>
  )
}

function CenterPanel() {
  return (
    <div className="flex w-[132px] shrink-0 flex-col items-center pt-[220px]">
      <div className="rounded-3xl bg-gold/10 px-3 py-4">
        <div className="rounded-xl border border-gray-300 bg-white p-3 shadow-card">
          <h3 className="mb-3 text-center font-display text-lg font-bold text-navy">Final</h3>
          <div className="space-y-1">
            <TeamLine team={{ name: 'Finalista', code: '---' }} pending />
            <TeamLine team={{ name: 'Finalista', code: '---' }} pending />
          </div>
        </div>

        <div className="mt-24 rounded-xl border border-gray-300 bg-white p-3 shadow-card">
          <h3 className="mb-3 text-center font-display text-base font-bold leading-5 text-navy">3er<br />Puesto</h3>
          <div className="space-y-1">
            <TeamLine team={{ name: 'Semifinalista', code: '---' }} pending />
            <TeamLine team={{ name: 'Semifinalista', code: '---' }} pending />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function KnockoutBracket({ matches, predictions }) {
  const qualified = buildQualifiedTeams(matches, predictions)
  const round32 = pairSeeds(qualified)
  const leftR32 = round32.slice(0, 8)
  const rightR32 = round32.slice(8).reverse()

  const leftR16 = buildEmptyRound('left-r16', 4, 'Ganador 16avos')
  const rightR16 = buildEmptyRound('right-r16', 4, 'Ganador 16avos')
  const leftQf = buildEmptyRound('left-qf', 2, 'Ganador 8avos')
  const rightQf = buildEmptyRound('right-qf', 2, 'Ganador 8avos')
  const leftSf = buildEmptyRound('left-sf', 1, 'Ganador 4tos')
  const rightSf = buildEmptyRound('right-sf', 1, 'Ganador 4tos')

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Clasificados generados desde tus marcadores: líderes, segundos y mejores terceros.
        </p>
        <div className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600">
          {qualified.length}/32 equipos
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white p-4 shadow-card">
        <div className="flex min-h-[740px] min-w-[1120px] justify-between gap-5">
          <BracketColumn title={ROUND_LABELS[0]} matches={leftR32} spacing={SPACING.r32} />
          <BracketColumn title={ROUND_LABELS[1]} matches={leftR16} spacing={SPACING.r16} />
          <BracketColumn title={ROUND_LABELS[2]} matches={leftQf} spacing={SPACING.qf} />
          <BracketColumn title={ROUND_LABELS[3]} matches={leftSf} spacing={SPACING.sf} />
          <CenterPanel />
          <BracketColumn title={ROUND_LABELS[3]} matches={rightSf} spacing={SPACING.sf} align="right" />
          <BracketColumn title={ROUND_LABELS[2]} matches={rightQf} spacing={SPACING.qf} align="right" />
          <BracketColumn title={ROUND_LABELS[1]} matches={rightR16} spacing={SPACING.r16} align="right" />
          <BracketColumn title={ROUND_LABELS[0]} matches={rightR32} spacing={SPACING.r32} align="right" />
        </div>
      </div>
    </div>
  )
}
