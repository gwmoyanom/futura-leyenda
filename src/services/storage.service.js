/**
 * storage.service.js
 *
 * Abstracts all data persistence. In Phase 1 (GitHub Pages),
 * reads come from static JSON files and writes go to localStorage
 * (since GitHub Pages can't mutate files at runtime).
 *
 * In Phase 2, swap the fetch calls for Supabase queries — all
 * callers stay the same.
 */

const BASE_URL = import.meta.env.BASE_URL   // Vite injects the base path
const STORAGE_PREFIX = 'polla_'             // Namespace localStorage keys

// ─── Private helpers ────────────────────────────────────────────────────────

/** Fetch a static JSON file from /public/data/ */
async function fetchJson(filename) {
  const url = `${BASE_URL}data/${filename}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load ${filename}: ${res.status}`)
  return res.json()
}

/** Read from localStorage, falling back to null */
function readLocal(key) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** Write to localStorage */
function writeLocal(key, value) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
}

// ─── Matches ────────────────────────────────────────────────────────────────

/** Returns all matches. Admin overrides (score updates) are merged on top. */
export async function getMatches() {
  const base = await fetchJson('matches.json')
  const overrides = readLocal('matches_overrides') || {}

  return base.map(match => ({
    ...match,
    ...overrides[match.id],
  }))
}

/** Admin: update a match result and status */
export function updateMatch(matchId, updates) {
  const overrides = readLocal('matches_overrides') || {}
  overrides[matchId] = { ...overrides[matchId], ...updates }
  writeLocal('matches_overrides', overrides)
}

// ─── Users ──────────────────────────────────────────────────────────────────

/** Returns all users (merged with any locally-registered new users) */
export async function getUsers() {
  const base = await fetchJson('users.json')
  const localUsers = readLocal('users_local') || []
  const overrides = readLocal('users_overrides') || {}

  const merged = [...base, ...localUsers].map(user => ({
    ...user,
    ...overrides[user.id],
  }))

  return merged
}

/** Register a new participant */
export function registerUser(userData) {
  const users = readLocal('users_local') || []
  const newUser = {
    id: `u${Date.now()}`,
    role: 'participant',
    approved: false,           // Admin must approve
    createdAt: new Date().toISOString(),
    avatar: '⚽',
    ...userData,
  }
  users.push(newUser)
  writeLocal('users_local', users)
  return newUser
}

/** Admin: update a user (approve, ban, change role) */
export function updateUser(userId, updates) {
  const overrides = readLocal('users_overrides') || {}
  overrides[userId] = { ...overrides[userId], ...updates }
  writeLocal('users_overrides', overrides)
}

// ─── Predictions ─────────────────────────────────────────────────────────────

/** Returns all predictions for all users */
export async function getPredictions() {
  const base = await fetchJson('predictions.json')
  const local = readLocal('predictions_local') || []

  // Local predictions replace base predictions for the same userId+matchId
  const localKeys = new Set(local.map(p => `${p.userId}_${p.matchId}`))
  const filtered = base.filter(p => !localKeys.has(`${p.userId}_${p.matchId}`))

  return [...filtered, ...local]
}

/** Returns predictions for a specific user */
export async function getPredictionsByUser(userId) {
  const all = await getPredictions()
  return all.filter(p => p.userId === userId)
}

/** Save or update a prediction for a user+match */
export function savePrediction(userId, matchId, prediction) {
  const predictions = readLocal('predictions_local') || []
  const existingIndex = predictions.findIndex(
    p => p.userId === userId && p.matchId === matchId
  )

  const record = {
    id: `p${userId}_${matchId}`,
    userId,
    matchId,
    prediction,
    submittedAt: new Date().toISOString(),
    pointsEarned: null,   // Recalculated by scoring engine
  }

  if (existingIndex >= 0) {
    predictions[existingIndex] = record
  } else {
    predictions.push(record)
  }

  writeLocal('predictions_local', predictions)
  return record
}

// ─── Config ──────────────────────────────────────────────────────────────────

/** Returns scoring rules and prize config */
export async function getConfig() {
  const base = await fetchJson('config.json')
  const overrides = readLocal('config_overrides') || {}
  return { ...base, ...overrides }
}

/** Admin: update scoring config */
export function updateConfig(updates) {
  const overrides = readLocal('config_overrides') || {}
  writeLocal('config_overrides', { ...overrides, ...updates })
}
