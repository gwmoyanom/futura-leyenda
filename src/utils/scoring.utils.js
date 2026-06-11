/**
 * scoring.utils.js
 *
 * Pure scoring engine. Takes match results and predictions,
 * returns points. No side effects — easy to unit-test.
 *
 * Point rules (from config.json):
 *   - Exact score: 3 points
 *   - Correct result (W/D/L): 1 point
 *   - Wrong: 0 points
 */

// ─── Core scoring logic ──────────────────────────────────────────────────────

/**
 * Returns the match result category: 'home', 'away', or 'draw'
 */
export function getMatchOutcome(homeGoals, awayGoals) {
  if (homeGoals > awayGoals) return 'home'
  if (awayGoals > homeGoals) return 'away'
  return 'draw'
}

function outcomeLabel(outcome) {
  if (outcome === 'home') return 'victoria del local'
  if (outcome === 'away') return 'victoria del visitante'
  return 'empate'
}

/**
 * Calculates points for a single prediction against a real result.
 *
 * @param {object} prediction  - { home: number, away: number }
 * @param {object} result      - { home: number, away: number }
 * @param {object} rules       - scoring rules from config.json
 * @returns {{ points: number, reason: string }}
 */
export function scoreOnePrediction(prediction, result, rules) {
  if (!result || result.home === null || result.away === null) {
    return { points: 0, reason: 'Pendiente: el partido todavía no tiene resultado cargado.' }
  }

  const isExact =
    prediction.home === result.home &&
    prediction.away === result.away

  if (isExact) {
    return {
      points: rules.exactScore.points,
      reason: `Marcador exacto: predijiste ${prediction.home}-${prediction.away} y terminó ${result.home}-${result.away}.`,
    }
  }

  const predictedOutcome = getMatchOutcome(prediction.home, prediction.away)
  const actualOutcome    = getMatchOutcome(result.home, result.away)

  if (predictedOutcome === actualOutcome) {
    return {
      points: rules.correctResult.points,
      reason: `Acertaste el signo (${outcomeLabel(actualOutcome)}), pero no el marcador exacto.`,
    }
  }

  return {
    points: 0,
    reason: `Sin puntos: predijiste ${outcomeLabel(predictedOutcome)} y el resultado fue ${outcomeLabel(actualOutcome)}.`,
  }
}

/**
 * Calculates the total score for one user across all matches.
 *
 * @param {string}   userId      - the user's ID
 * @param {Array}    predictions - all predictions in the system
 * @param {Array}    matches     - all matches with results
 * @param {object}   rules       - scoring rules
 * @returns {{ totalPoints: number, breakdown: Array }}
 */
export function calculateUserScore(userId, predictions, matches, rules) {
  const userPredictions = predictions.filter(p => p.userId === userId)

  const breakdown = userPredictions.map(pred => {
    const match = matches.find(m => m.id === pred.matchId)
    if (!match) return null

    const { points, reason } = scoreOnePrediction(
      pred.prediction,
      match.result,
      rules
    )

    return {
      matchId:    pred.matchId,
      match,
      prediction: pred.prediction,
      result:     match.result,
      points,
      reason,
    }
  }).filter(Boolean)

  const totalPoints = breakdown.reduce((sum, b) => sum + b.points, 0)

  return { totalPoints, breakdown }
}

/**
 * Builds the full leaderboard — sorted by total points, then by
 * number of exact scores as a tiebreaker.
 *
 * @param {Array} users       - all approved participants
 * @param {Array} predictions - all predictions
 * @param {Array} matches     - all matches
 * @param {object} rules      - scoring rules
 * @returns {Array} sorted leaderboard entries
 */
export function buildLeaderboard(users, predictions, matches, rules) {
  const participants = users.filter(u => u.role === 'participant' && u.approved)

  const entries = participants.map(user => {
    const { totalPoints, breakdown } = calculateUserScore(
      user.id, predictions, matches, rules
    )

    const exactScores = breakdown.filter(b => b.points === rules.exactScore.points).length
    const correctResults = breakdown.filter(
      b => b.points === rules.correctResult.points
    ).length

    return {
      user,
      totalPoints,
      exactScores,
      correctResults,
      predictionsCount: breakdown.length,
      breakdown,
    }
  })

  // Sort: total points desc, then exact scores desc as tiebreaker
  return entries.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
    return b.exactScores - a.exactScores
  })
}
