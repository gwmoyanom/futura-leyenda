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

  /** Save a prediction for the current user */
  savePrediction: (matchId, prediction) => {
    const { currentUser, predictions } = get()
    if (!currentUser) return

    const updated = storageSavePrediction(currentUser.id, matchId, prediction)

    // Update local state immediately (optimistic update)
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

  // ─── Admin slice ──────────────────────────────────────────────────────────

  /** Admin: update a match result */
  adminUpdateMatch: async (matchId, updates) => {
    storageUpdateMatch(matchId, updates)
    await get().reloadMatches()
  },

  /** Admin: approve or ban a user */
  adminUpdateUser: (userId, updates) => {
    storageUpdateUser(userId, updates)
    // Refresh users list
    getUsers().then(users => set({ users }))
  },
}))

export default useStore
