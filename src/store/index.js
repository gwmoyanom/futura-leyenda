/**
 * store/index.js
 *
 * Global state managed with Zustand.
 * Each slice is a logical group: auth, matches, predictions, leaderboard.
 *
 * Components call useStore() to read state and call actions.
 */

import { create } from 'zustand'
import { getSession, clearSession, login as authLogin, register as authRegister } from '@/services/auth.service.js'
import { getMatches, getUsers, getPredictions, getConfig, savePrediction as storageSavePrediction, updateMatch as storageUpdateMatch, updateUser as storageUpdateUser } from '@/services/storage.service.js'
import { buildLeaderboard, calculateUserScore } from '@/utils/scoring.utils.js'

const useStore = create((set, get) => ({
  // ─── Auth slice ───────────────────────────────────────────────────────────
  currentUser: getSession(),   // Rehydrate from localStorage on startup

  login: async (username, password) => {
    const user = await authLogin(username, password)
    set({ currentUser: user })
    return user
  },

  logout: () => {
    clearSession()
    set({ currentUser: null })
  },

  register: async (userData) => {
    return authRegister(userData)
  },

  // ─── Data slice ───────────────────────────────────────────────────────────
  matches:     [],
  users:       [],
  predictions: [],
  config:      null,
  loading:     false,
  error:       null,

  /** Load everything needed for the app in one go */
  loadAll: async () => {
    set({ loading: true, error: null })
    try {
      const [matches, users, predictions, config] = await Promise.all([
        getMatches(),
        getUsers(),
        getPredictions(),
        getConfig(),
      ])
      set({ matches, users, predictions, config, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  /** Reload just matches (after admin updates a score) */
  reloadMatches: async () => {
    const matches = await getMatches()
    set({ matches })
  },

  // ─── Predictions slice ────────────────────────────────────────────────────

  /** Check if predictions are currently locked (after inauguration) */
  isPredictionLocked: () => {
    const { config } = get()
    if (!config?.tournament?.inaugurationDate) return false

    const inaugDate = new Date(config.tournament.inaugurationDate)
    return new Date() > inaugDate
  },

  /** Get matched filtered by phase */
  getMatchesByPhase: (phase) => {
    const { matches } = get()
    if (!phase) return matches
    return matches.filter(m => m.phase === phase)
  },

  /** Get predictions filtered by phase */
  getPredictionsByPhase: (phase) => {
    const { currentUser, predictions, matches } = get()
    if (!currentUser) return []

    const userPredictions = predictions.filter(p => p.userId === currentUser.id)
    if (!phase) return userPredictions

    const matchIds = matches
      .filter(m => m.phase === phase)
      .map(m => m.id)

    return userPredictions.filter(p => matchIds.includes(p.matchId))
  },

  /** Save a prediction for the current user */
  savePrediction: async (matchId, prediction) => {
    const { currentUser, isPredictionLocked } = get()
    if (!currentUser) return

    // Check if predictions are locked
    if (isPredictionLocked()) {
      console.warn('Predictions are locked after tournament inauguration')
      return null
    }

    const updated = await storageSavePrediction(currentUser.id, matchId, prediction)
    const { predictions } = get()

    // Update local state after the database confirms the write.
    const existingIndex = predictions.findIndex(
      p => p.userId === currentUser.id && p.matchId === matchId
    )

    const newPredictions = [...predictions]
    if (existingIndex >= 0) {
      newPredictions[existingIndex] = updated
    } else {
      newPredictions.push(updated)
    }

    set({ predictions: newPredictions })
    return updated
  },

  /** Returns predictions for the current logged-in user */
  getMyPredictions: () => {
    const { currentUser, predictions } = get()
    if (!currentUser) return []
    return predictions.filter(p => p.userId === currentUser.id)
  },

  // ─── Leaderboard slice ────────────────────────────────────────────────────

  /** Computes the current leaderboard from latest data */
  getLeaderboard: () => {
    const { users, predictions, matches, config } = get()
    if (!config) return []
    return buildLeaderboard(users, predictions, matches, config.rules)
  },

  /** Computes score breakdown for the current user */
  getMyScore: () => {
    const { currentUser, predictions, matches, config } = get()
    if (!currentUser || !config) return { totalPoints: 0, breakdown: [] }
    return calculateUserScore(currentUser.id, predictions, matches, config.rules)
  },

  /** Get score breakdown by phase */
  getMyScoreByPhase: (phase) => {
    const { currentUser, predictions, matches, config } = get()
    if (!currentUser || !config) return { totalPoints: 0, breakdown: [] }

    const phaseMatches = matches.filter(m => m.phase === phase)
    const phaseMatchIds = phaseMatches.map(m => m.id)
    const phasePredictions = predictions.filter(
      p => p.userId === currentUser.id && phaseMatchIds.includes(p.matchId)
    )

    // Simplified scoring for phase
    let totalPoints = 0
    const breakdown = []

    phasePredictions.forEach(pred => {
      const match = phaseMatches.find(m => m.id === pred.matchId)
      if (match?.result && pred.prediction) {
        const { home: predHome, away: predAway } = pred.prediction
        const { home: realHome, away: realAway } = match.result

        if (predHome === realHome && predAway === realAway) {
          totalPoints += config.rules.exactScore.points
          breakdown.push({ matchId: pred.matchId, points: config.rules.exactScore.points })
        } else if (
          (predHome > predAway && realHome > realAway) ||
          (predHome < predAway && realHome < realAway) ||
          (predHome === predAway && realHome === realAway)
        ) {
          totalPoints += config.rules.correctResult.points
          breakdown.push({ matchId: pred.matchId, points: config.rules.correctResult.points })
        }
      }
    })

    return { totalPoints, breakdown }
  },

  // ─── Admin slice ──────────────────────────────────────────────────────────

  /** Admin: update a match result */
  adminUpdateMatch: async (matchId, updates) => {
    storageUpdateMatch(matchId, updates)
    await get().reloadMatches()
  },

  /** Admin: approve or ban a user */
  adminUpdateUser: async (userId, updates) => {
    await storageUpdateUser(userId, updates)
    const users = await getUsers()
    set({ users })
  },
}))

export default useStore
