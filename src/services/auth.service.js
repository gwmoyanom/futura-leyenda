/**
 * auth.service.js
 *
 * Manages user sessions using localStorage.
 * In Phase 1 we do a simple username+password check against the JSON data.
 * In Phase 2, replace login() with a Supabase auth call.
 *
 * Note: This is client-side "auth" suitable for a friendly baby shower pool.
 * Not intended for secure production use with sensitive data.
 */

import { getUsers, registerUser } from './storage.service.js'

const SESSION_KEY = 'polla_session'

// ─── Session ────────────────────────────────────────────────────────────────

/** Returns the currently logged-in user, or null */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** Persists a user session */
function saveSession(user) {
  // Never store the passwordHash in the session object
  const { passwordHash: _, ...safeUser } = user
  localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
  return safeUser
}

/** Clears the session (logout) */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

// ─── Authentication ──────────────────────────────────────────────────────────

/**
 * Attempts to log in with username + password.
 * Returns the user object on success, throws on failure.
 */
export async function login(username, password) {
  const users = await getUsers()
  const user = users.find(
    u => u.username.toLowerCase() === username.toLowerCase()
  )

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  // Phase 1: plain-text password comparison
  // Phase 2: replace with bcrypt or Supabase auth
  if (user.passwordHash !== password) {
    throw new Error('Contraseña incorrecta')
  }

  if (!user.approved) {
    throw new Error('Tu cuenta está pendiente de aprobación por el administrador')
  }

  return saveSession(user)
}

/**
 * Registers a new participant account.
 * Account starts as unapproved — admin must activate it.
 */
export async function register({ username, displayName, email, password }) {
  const users = await getUsers()

  // Check username is not already taken
  const exists = users.find(
    u => u.username.toLowerCase() === username.toLowerCase()
  )
  if (exists) {
    throw new Error('Ese nombre de usuario ya está en uso')
  }

  const newUser = await registerUser({
    username,
    displayName,
    email,
    passwordHash: password,   // Phase 2: hash before storing
  })

  return newUser
}

// ─── Guards ──────────────────────────────────────────────────────────────────

/** Returns true if any user is logged in */
export function isAuthenticated() {
  return getSession() !== null
}

/** Returns true if the current user is an admin */
export function isAdmin() {
  const session = getSession()
  return session?.role === 'admin'
}
