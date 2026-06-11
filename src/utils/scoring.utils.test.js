/**
 * scoring.utils.test.js
 *
 * Tests for the scoring engine.
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest'
import {
  getMatchOutcome,
  scoreOnePrediction,
  calculateUserScore,
  buildLeaderboard,
} from './scoring.utils.js'

const rules = {
  exactScore:     { points: 3 },
  correctResult:  { points: 1 },
}

// ─── getMatchOutcome ──────────────────────────────────────────────────────────

describe('getMatchOutcome', () => {
  it('returns "home" when home team wins', () => {
    expect(getMatchOutcome(2, 0)).toBe('home')
    expect(getMatchOutcome(1, 0)).toBe('home')
  })

  it('returns "away" when away team wins', () => {
    expect(getMatchOutcome(0, 1)).toBe('away')
    expect(getMatchOutcome(2, 3)).toBe('away')
  })

  it('returns "draw" on equal scores', () => {
    expect(getMatchOutcome(0, 0)).toBe('draw')
    expect(getMatchOutcome(2, 2)).toBe('draw')
  })
})

// ─── scoreOnePrediction ───────────────────────────────────────────────────────

describe('scoreOnePrediction', () => {
  it('awards 3 points for an exact score', () => {
    const { points, reason } = scoreOnePrediction({ home: 2, away: 1 }, { home: 2, away: 1 }, rules)
    expect(points).toBe(3)
    expect(reason).toContain('Marcador exacto')
  })

  it('awards 1 point for correct result but wrong score', () => {
    const { points, reason } = scoreOnePrediction({ home: 3, away: 1 }, { home: 2, away: 1 }, rules)
    expect(points).toBe(1)
    expect(reason).toContain('Acertaste el signo')
  })

  it('awards 1 point for correct draw (different score)', () => {
    const { points } = scoreOnePrediction({ home: 1, away: 1 }, { home: 0, away: 0 }, rules)
    expect(points).toBe(1)
  })

  it('awards 3 points for exact 0-0 draw', () => {
    const { points } = scoreOnePrediction({ home: 0, away: 0 }, { home: 0, away: 0 }, rules)
    expect(points).toBe(3)
  })

  it('awards 0 points for wrong result', () => {
    const { points, reason } = scoreOnePrediction({ home: 2, away: 0 }, { home: 0, away: 1 }, rules)
    expect(points).toBe(0)
    expect(reason).toContain('Sin puntos')
  })

  it('awards 0 points when result is null', () => {
    const { points, reason } = scoreOnePrediction({ home: 2, away: 0 }, null, rules)
    expect(points).toBe(0)
    expect(reason).toContain('Pendiente')
  })
})

// ─── calculateUserScore ───────────────────────────────────────────────────────

describe('calculateUserScore', () => {
  const matches = [
    { id: 'm1', result: { home: 2, away: 1 }, status: 'finished' },
    { id: 'm2', result: { home: 0, away: 0 }, status: 'finished' },
    { id: 'm3', result: null, status: 'upcoming' },
  ]

  const predictions = [
    { userId: 'u1', matchId: 'm1', prediction: { home: 2, away: 1 } },  // exact → 3
    { userId: 'u1', matchId: 'm2', prediction: { home: 1, away: 1 } },  // correct result → 1
    { userId: 'u1', matchId: 'm3', prediction: { home: 1, away: 0 } },  // no result yet → 0
  ]

  it('sums points correctly', () => {
    const { totalPoints } = calculateUserScore('u1', predictions, matches, rules)
    expect(totalPoints).toBe(4)
  })

  it('returns correct breakdown length', () => {
    const { breakdown } = calculateUserScore('u1', predictions, matches, rules)
    expect(breakdown).toHaveLength(3)
  })
})

// ─── buildLeaderboard ─────────────────────────────────────────────────────────

describe('buildLeaderboard', () => {
  const users = [
    { id: 'u1', role: 'participant', approved: true, displayName: 'Ana' },
    { id: 'u2', role: 'participant', approved: true, displayName: 'Bob' },
    { id: 'u3', role: 'admin',       approved: true, displayName: 'Admin' },
  ]

  const matches = [
    { id: 'm1', result: { home: 2, away: 1 }, status: 'finished' },
  ]

  const predictions = [
    { userId: 'u1', matchId: 'm1', prediction: { home: 2, away: 1 } },  // exact → 3
    { userId: 'u2', matchId: 'm1', prediction: { home: 3, away: 2 } },  // correct → 1
  ]

  it('excludes admin users from the leaderboard', () => {
    const board = buildLeaderboard(users, predictions, matches, rules)
    expect(board.every(e => e.user.role !== 'admin')).toBe(true)
  })

  it('sorts by total points descending', () => {
    const board = buildLeaderboard(users, predictions, matches, rules)
    expect(board[0].user.id).toBe('u1')
    expect(board[1].user.id).toBe('u2')
  })

  it('uses prediction count before exact scores as tiebreaker', () => {
    const tiedPredictions = [
      { userId: 'u1', matchId: 'm1', prediction: { home: 1, away: 0 } },
      { userId: 'u1', matchId: 'm2', prediction: { home: 1, away: 1 } },
      { userId: 'u2', matchId: 'm1', prediction: { home: 1, away: 0 } },
    ]
    const tiedMatches = [
      { id: 'm1', result: { home: 2, away: 1 }, status: 'finished' },
      { id: 'm2', result: null, status: 'upcoming' },
    ]
    const board = buildLeaderboard(users, tiedPredictions, tiedMatches, rules)
    expect(board[0].user.id).toBe('u1')
  })
})
