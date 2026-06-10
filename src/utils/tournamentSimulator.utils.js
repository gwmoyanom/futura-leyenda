export const KNOCKOUT_PHASES = ['round16', 'quarterfinal', 'semifinal', 'final']

const placeholderPattern = /^(W|L)_([A-Z])([1-4])$/

export function getPredictionScore(predictionMap, matchId) {
  const score = predictionMap[matchId]?.prediction
  if (Number.isFinite(score?.home) && Number.isFinite(score?.away)) return score
  return null
}

export function getScenarioScore(match, predictionMap) {
  return getPredictionScore(predictionMap, match.id) ?? match.result ?? null
}

export function getGroupTeams(matches, group) {
  const teamsByCode = new Map()

  matches
    .filter(match => match.phase === 'group' && match.group === group)
    .forEach(match => {
      teamsByCode.set(match.homeTeam.code, match.homeTeam)
      teamsByCode.set(match.awayTeam.code, match.awayTeam)
    })

  return Array.from(teamsByCode.values())
}

export function getGroups(matches) {
  return Array.from(
    new Set(matches.filter(match => match.phase === 'group' && match.group).map(match => match.group))
  ).sort()
}

export function calculateGroupStandings(matches, predictionMap, group) {
  const groupMatches = matches.filter(match => match.phase === 'group' && match.group === group)
  const standings = getGroupTeams(matches, group).map(team => ({
    ...team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  }))

  const byCode = new Map(standings.map(team => [team.code, team]))

  groupMatches.forEach(match => {
    const score = getScenarioScore(match, predictionMap)
    if (!score) return

    const home = byCode.get(match.homeTeam.code)
    const away = byCode.get(match.awayTeam.code)
    if (!home || !away) return

    home.played += 1
    away.played += 1
    home.goalsFor += score.home
    home.goalsAgainst += score.away
    away.goalsFor += score.away
    away.goalsAgainst += score.home

    if (score.home > score.away) {
      home.won += 1
      away.lost += 1
      home.points += 3
    } else if (score.home < score.away) {
      away.won += 1
      home.lost += 1
      away.points += 3
    } else {
      home.drawn += 1
      away.drawn += 1
      home.points += 1
      away.points += 1
    }
  })

  standings.forEach(team => {
    team.goalDifference = team.goalsFor - team.goalsAgainst
  })

  return standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
    return a.name.localeCompare(b.name)
  })
}

export function buildStandingsByGroup(matches, predictions) {
  const predictionMap = Object.fromEntries(predictions.map(prediction => [prediction.matchId, prediction]))

  return Object.fromEntries(
    getGroups(matches).map(group => [
      group,
      calculateGroupStandings(matches, predictionMap, group),
    ])
  )
}

export function resolveTeam(team, standingsByGroup) {
  const placeholder = team.code.match(placeholderPattern)

  if (!placeholder) return team

  const [, , group, rank] = placeholder
  const resolved = standingsByGroup[group]?.[Number(rank) - 1]

  return resolved ?? {
    ...team,
    name: `${rank}.${group}`,
    flag: '⚽',
    unresolved: true,
  }
}

export function getMatchWinner(match, predictionMap, standingsByGroup) {
  const score = getScenarioScore(match, predictionMap)
  if (!score || score.home === score.away) return null

  return score.home > score.away
    ? resolveTeam(match.homeTeam, standingsByGroup)
    : resolveTeam(match.awayTeam, standingsByGroup)
}

export function getSimulatorProgress(matches, predictions) {
  const predictionMap = Object.fromEntries(predictions.map(prediction => [prediction.matchId, prediction]))
  const playable = matches.filter(match => match.phase === 'group' || KNOCKOUT_PHASES.includes(match.phase))
  const completed = playable.filter(match => getScenarioScore(match, predictionMap)).length

  return {
    completed,
    total: playable.length,
    percent: playable.length ? Math.round((completed / playable.length) * 100) : 0,
  }
}
