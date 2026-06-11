/**
 * store/index.js
 *
 * Global state managed with Zustand.
 * Each slice is a logical group: auth, matches, predictions, leaderboard.
 *
 * Components call useStore() to read state and call actions.
 */

import { create } from 'zustand'
import { getSession, saveSession, clearSession, login as authLogin, register as authRegister } from '@/services/auth.service.js'
import {
  deleteUser as storageDeleteUser,
  getMatches,
  getMaxiMessages,
  getUsers,
  getPredictions,
  getConfig,
  getBracketResults,
  saveBracketResults as storageSaveBracketResults,
  saveMaxiMessage as storageSaveMaxiMessage,
  savePrediction as storageSavePrediction,
  updateMatch as storageUpdateMatch,
  updateUser as storageUpdateUser,
} from '@/services/storage.service.js'
import { buildLeaderboard, calculateUserScore } from '@/utils/scoring.utils.js'
import { getMatchApiUpdates } from '@/services/matches-api.service.js'

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

  updateCurrentUser: async (updates) => {
    const { currentUser, users } = get()
    if (!currentUser) return null

    await storageUpdateUser(currentUser.id, updates)
    const updatedUser = saveSession({ ...currentUser, ...updates })

    set({
      currentUser: updatedUser,
      users: users.map(user => user.id === currentUser.id ? { ...user, ...updates } : user),
    })

    return updatedUser
  },

  // ─── Data slice ───────────────────────────────────────────────────────────
  matches:     [],
  users:       [],
  predictions: [],
  maxiMessages: [],
  bracketResults: null,
  config:      null,
  loading:     false,
  error:       null,

  /** Load everything needed for the app in one go */
  loadAll: async () => {
    set({ loading: true, error: null })
    try {
      const [matches, users, predictions, config, maxiMessages] = await Promise.all([
        getMatches(),
        getUsers(),
        getPredictions(),
        getConfig(),
        getMaxiMessages(),
      ])
      const { currentUser } = get()
      const bracketResults = currentUser ? await getBracketResults(currentUser.id) : null
      set({ matches, users, predictions, config, maxiMessages, bracketResults, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  /** Reload just matches (after admin updates a score) */
  reloadMatches: async () => {
    const matches = await getMatches()
    set({ matches })
  },

  /** Reload just users (after admin updates approval/status) */
  reloadUsers: async () => {
    const users = await getUsers()
    set({ users })
  },

  /** Reload messages for Maximiliano */
  reloadMaxiMessages: async () => {
    const maxiMessages = await getMaxiMessages()
    set({ maxiMessages })
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

  /** Returns persisted bracket picks for the current user */
  getMyBracketResults: () => {
    return get().bracketResults
  },

  /** Save generated knockout-bracket picks for the current user */
  saveBracketResults: async (results) => {
    const { currentUser } = get()
    if (!currentUser) return null

    const updated = await storageSaveBracketResults(currentUser.id, results)
    set({ bracketResults: updated })
    return updated
  },

  /** Save or update the current user's message for Maximiliano */
  saveMaxiMessage: async (text) => {
    const { currentUser, maxiMessages } = get()
    if (!currentUser) return null

    const updated = await storageSaveMaxiMessage(currentUser, text)
    const nextMessages = maxiMessages.filter(message => message.userId !== currentUser.id)
    set({
      maxiMessages: [updated, ...nextMessages].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    })
    return updated
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
    const updated = await storageUpdateMatch(matchId, updates)

    if (updated) {
      const { matches } = get()
      set({
        matches: matches.map(match => match.id === matchId ? updated : match),
      })
      return updated
    }

    await get().reloadMatches()
    return null
  },

  /** Admin: sync match status/results from the configured online API */
  adminSyncMatchesFromApi: async () => {
    const { matches, config } = get()
    const competitionCode = config?.api?.competitionCode || import.meta.env.VITE_FOOTBALL_DATA_COMPETITION || 'WC'
    const sync = await getMatchApiUpdates(matches, { competitionCode, force: true })
    const updatedMatches = []

    for (const change of sync.updates) {
      const updated = await storageUpdateMatch(change.matchId, change.updates)
      if (updated) updatedMatches.push({ ...change, updated })
    }

    if (updatedMatches.length > 0) {
      const latestById = new Map(updatedMatches.map(item => [item.matchId, item.updated]))
      set({
        matches: get().matches.map(match => latestById.get(match.id) || match),
      })
    }

    return {
      ...sync,
      updated: updatedMatches,
    }
  },

  /** Admin: approve or ban a user */
  adminUpdateUser: async (userId, updates) => {
    await storageUpdateUser(userId, updates)
    await get().reloadUsers()
  },

  /** Admin: delete a participant */
  adminDeleteUser: async (userId) => {
    await storageDeleteUser(userId)
    await get().reloadUsers()
  },
}))

export default useStore
