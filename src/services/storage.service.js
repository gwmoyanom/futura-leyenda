/**
 * storage.service.js
 *
 * Data persistence abstraction.
 * - Uses Supabase/PostgREST when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY exist.
 * - Falls back to static JSON + localStorage for local demos and GitHub Pages previews.
 */

const BASE_URL = import.meta.env.BASE_URL
const STORAGE_PREFIX = 'polla_'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

// ─── Private helpers ────────────────────────────────────────────────────────

async function fetchJson(filename) {
  const url = `${BASE_URL}data/${filename}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load ${filename}: ${res.status}`)
  return res.json()
}

function readLocal(key) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeLocal(key, value) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
}

async function supabaseRequest(path, { method = 'GET', body, prefer } = {}) {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  }

  if (prefer) headers.Prefer = prefer

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(`Supabase ${method} ${path} failed: ${message || res.status}`)
  }

  if (res.status === 204) return null

  const text = await res.text()
  return text ? JSON.parse(text) : null
}

function mapMatch(row) {
  return {
    id: row.id,
    phase: row.phase,
    group: row.group_name,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    kickoff: row.kickoff,
    venue: row.venue,
    result: row.result,
    status: row.status,
    insightLinks: row.insight_links || [],
    apiSource: row.api_source,
    apiMatchId: row.api_match_id,
    lastSyncedAt: row.last_synced_at,
    resultUpdatedAt: row.result_updated_at,
    updatedAt: row.updated_at,
  }
}

function toMatchRow(matchId, updates) {
  const row = { id: matchId }
  if ('phase' in updates) row.phase = updates.phase
  if ('group' in updates) row.group_name = updates.group
  if ('homeTeam' in updates) row.home_team = updates.homeTeam
  if ('awayTeam' in updates) row.away_team = updates.awayTeam
  if ('kickoff' in updates) row.kickoff = updates.kickoff
  if ('venue' in updates) row.venue = updates.venue
  if ('result' in updates) row.result = updates.result
  if ('status' in updates) row.status = updates.status
  if ('insightLinks' in updates) row.insight_links = updates.insightLinks
  if ('apiSource' in updates) row.api_source = updates.apiSource
  if ('apiMatchId' in updates) row.api_match_id = updates.apiMatchId
  if ('lastSyncedAt' in updates) row.last_synced_at = updates.lastSyncedAt
  if ('resultUpdatedAt' in updates) row.result_updated_at = updates.resultUpdatedAt
  if ('updatedAt' in updates) row.updated_at = updates.updatedAt
  return row
}

function mapUser(row) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    email: row.email,
    role: row.role,
    passwordHash: row.password_hash,
    avatar: row.avatar,
    approved: row.approved,
    createdAt: row.created_at,
  }
}

function toUserRow(user) {
  return {
    id: user.id,
    username: user.username,
    display_name: user.displayName,
    email: user.email,
    role: user.role,
    password_hash: user.passwordHash,
    avatar: user.avatar,
    approved: user.approved,
    created_at: user.createdAt,
  }
}

function mapPrediction(row) {
  return {
    id: row.id,
    userId: row.user_id,
    matchId: row.match_id,
    prediction: row.prediction,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    pointsEarned: row.points_earned,
  }
}

function toPredictionRow(prediction) {
  return {
    id: prediction.id,
    user_id: prediction.userId,
    match_id: prediction.matchId,
    prediction: prediction.prediction,
    submitted_at: prediction.submittedAt,
    created_at: prediction.createdAt,
    updated_at: prediction.updatedAt,
    points_earned: prediction.pointsEarned,
  }
}

function mapMaxiMessage(row) {
  return {
    id: row.id,
    userId: row.user_id,
    author: row.author,
    avatar: row.avatar,
    text: row.text,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toMaxiMessageRow(message) {
  return {
    id: message.id,
    user_id: message.userId,
    author: message.author,
    avatar: message.avatar,
    text: message.text,
    created_at: message.createdAt,
    updated_at: message.updatedAt,
  }
}

// ─── Matches ────────────────────────────────────────────────────────────────

export async function getMatches() {
  if (hasSupabase) {
    const rows = await supabaseRequest('matches?select=*&order=kickoff.asc')
    return rows.map(mapMatch)
  }

  const base = await fetchJson('matches.json')
  const overrides = readLocal('matches_overrides') || {}

  return base.map(match => ({
    ...match,
    ...overrides[match.id],
  }))
}

export async function updateMatch(matchId, updates) {
  const now = new Date().toISOString()

  if (hasSupabase) {
    const row = toMatchRow(matchId, updates)
    if ('result' in updates) row.result_updated_at = now
    if ('result' in updates || 'status' in updates) row.updated_at = now

    const rows = await supabaseRequest(`matches?id=eq.${encodeURIComponent(matchId)}`, {
      method: 'PATCH',
      body: row,
      prefer: 'return=representation',
    })
    return rows?.[0] ? mapMatch(rows[0]) : null
  }

  const overrides = readLocal('matches_overrides') || {}
  overrides[matchId] = {
    ...overrides[matchId],
    ...updates,
    ...('result' in updates ? { resultUpdatedAt: now } : {}),
    ...('result' in updates || 'status' in updates ? { updatedAt: now } : {}),
  }
  writeLocal('matches_overrides', overrides)

  const matches = await getMatches()
  return matches.find(match => match.id === matchId) || null
}

// ─── Users ──────────────────────────────────────────────────────────────────

export async function getUsers() {
  if (hasSupabase) {
    const rows = await supabaseRequest('users?select=*&order=created_at.asc')
    return rows.map(mapUser)
  }

  const base = await fetchJson('users.json')
  const localUsers = readLocal('users_local') || []
  const overrides = readLocal('users_overrides') || {}
  const deleted = new Set(readLocal('users_deleted') || [])

  return [...base, ...localUsers]
    .filter(user => !deleted.has(user.id))
    .map(user => ({
      ...user,
      ...overrides[user.id],
    }))
}

export async function registerUser(userData) {
  const newUser = {
    id: `u${Date.now()}`,
    role: 'participant',
    approved: false,
    createdAt: new Date().toISOString(),
    avatar: '⚽',
    ...userData,
  }

  if (hasSupabase) {
    const rows = await supabaseRequest('users', {
      method: 'POST',
      body: toUserRow(newUser),
      prefer: 'return=representation',
    })
    return mapUser(rows[0])
  }

  const users = readLocal('users_local') || []
  users.push(newUser)
  writeLocal('users_local', users)
  return newUser
}

export async function updateUser(userId, updates) {
  if (hasSupabase) {
    await supabaseRequest(`users?id=eq.${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      body: toUserRow({ id: userId, ...updates }),
      prefer: 'return=minimal',
    })
    return
  }

  const overrides = readLocal('users_overrides') || {}
  overrides[userId] = { ...overrides[userId], ...updates }
  writeLocal('users_overrides', overrides)
}

export async function deleteUser(userId) {
  if (hasSupabase) {
    await supabaseRequest(`users?id=eq.${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      prefer: 'return=minimal',
    })
    return
  }

  const localUsers = readLocal('users_local') || []
  const nextLocalUsers = localUsers.filter(user => user.id !== userId)
  writeLocal('users_local', nextLocalUsers)

  const overrides = readLocal('users_overrides') || {}
  delete overrides[userId]
  writeLocal('users_overrides', overrides)

  const deleted = new Set(readLocal('users_deleted') || [])
  deleted.add(userId)
  writeLocal('users_deleted', Array.from(deleted))
}

// ─── Predictions ─────────────────────────────────────────────────────────────

export async function getPredictions() {
  if (hasSupabase) {
    const rows = await supabaseRequest('predictions?select=*&order=created_at.asc')
    return rows.map(mapPrediction)
  }

  const base = await fetchJson('predictions.json')
  const local = readLocal('predictions_local') || []
  const localKeys = new Set(local.map(p => `${p.userId}_${p.matchId}`))
  const filtered = base.filter(p => !localKeys.has(`${p.userId}_${p.matchId}`))

  return [...filtered, ...local]
}

export async function getPredictionsByUser(userId) {
  const all = await getPredictions()
  return all.filter(p => p.userId === userId)
}

export async function savePrediction(userId, matchId, prediction) {
  const now = new Date().toISOString()
  const record = {
    id: `p${userId}_${matchId}`,
    userId,
    matchId,
    prediction,
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
    pointsEarned: null,
  }

  if (hasSupabase) {
    const existing = await supabaseRequest(
      `predictions?user_id=eq.${encodeURIComponent(userId)}&match_id=eq.${encodeURIComponent(matchId)}&select=*`
    )
    const createdAt = existing[0]?.created_at ?? now
    const rows = await supabaseRequest('predictions?on_conflict=user_id,match_id', {
      method: 'POST',
      body: toPredictionRow({ ...record, createdAt }),
      prefer: 'resolution=merge-duplicates,return=representation',
    })
    return mapPrediction(rows[0])
  }

  const predictions = readLocal('predictions_local') || []
  const existingIndex = predictions.findIndex(
    p => p.userId === userId && p.matchId === matchId
  )
  const existing = predictions[existingIndex]
  const localRecord = {
    ...record,
    createdAt: existing?.createdAt || now,
  }

  if (existingIndex >= 0) {
    predictions[existingIndex] = localRecord
  } else {
    predictions.push(localRecord)
  }

  writeLocal('predictions_local', predictions)
  return localRecord
}

// ─── Maxi Messages ──────────────────────────────────────────────────────────

function sortMessages(messages) {
  return [...messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function getMaxiMessages() {
  if (hasSupabase) {
    const rows = await supabaseRequest('maxi_messages?select=*&order=created_at.desc')
    return rows.map(mapMaxiMessage)
  }

  const base = await fetchJson('messages.json')
  const local = readLocal('maxi_messages_local') || []
  const localUserIds = new Set(local.map(message => message.userId).filter(Boolean))
  const filteredBase = base.filter(message => !message.userId || !localUserIds.has(message.userId))

  return sortMessages([...filteredBase, ...local])
}

export async function saveMaxiMessage(user, text) {
  if (!user) return null

  const now = new Date().toISOString()
  const record = {
    id: `maxi_${user.id}`,
    userId: user.id,
    author: user.displayName,
    avatar: user.avatar || '⚽',
    text,
    createdAt: now,
    updatedAt: now,
  }

  if (hasSupabase) {
    const existing = await supabaseRequest(
      `maxi_messages?user_id=eq.${encodeURIComponent(user.id)}&select=*`
    )
    const current = existing[0] ? mapMaxiMessage(existing[0]) : null
    const rows = await supabaseRequest('maxi_messages?on_conflict=user_id', {
      method: 'POST',
      body: toMaxiMessageRow({
        ...record,
        id: current?.id || record.id,
        createdAt: current?.createdAt || now,
      }),
      prefer: 'resolution=merge-duplicates,return=representation',
    })
    return mapMaxiMessage(rows[0])
  }

  const messages = readLocal('maxi_messages_local') || []
  const existingIndex = messages.findIndex(message => message.userId === user.id)
  const current = messages[existingIndex]
  const localRecord = {
    ...record,
    createdAt: current?.createdAt || now,
  }

  if (existingIndex >= 0) {
    messages[existingIndex] = localRecord
  } else {
    messages.push(localRecord)
  }

  writeLocal('maxi_messages_local', messages)
  return localRecord
}

// ─── Config ──────────────────────────────────────────────────────────────────

export async function getConfig() {
  if (hasSupabase) {
    const rows = await supabaseRequest('app_config?key=eq.main&select=value')
    if (!rows[0]) throw new Error('Supabase app_config row "main" not found')
    return rows[0].value
  }

  const base = await fetchJson('config.json')
  const overrides = readLocal('config_overrides') || {}
  return { ...base, ...overrides }
}

export async function updateConfig(updates) {
  if (hasSupabase) {
    const current = await getConfig()
    await supabaseRequest('app_config?on_conflict=key', {
      method: 'POST',
      body: { key: 'main', value: { ...current, ...updates } },
      prefer: 'resolution=merge-duplicates,return=minimal',
    })
    return
  }

  const overrides = readLocal('config_overrides') || {}
  writeLocal('config_overrides', { ...overrides, ...updates })
}

// ─── Bracket Results ─────────────────────────────────────────────────────────

function getBracketKey(userId) {
  return `bracket_results_${userId}`
}

function emptyBracketResults(userId) {
  return {
    schemaVersion: 1,
    userId,
    source: 'simulated_group_standings',
    status: 'draft',
    picks: {},
    champion: null,
    snapshot: null,
    scoring: {
      status: 'pending',
      points: 0,
      details: [],
    },
    submittedAt: null,
    updatedAt: null,
  }
}

function normalizeBracketResults(userId, value) {
  return {
    ...emptyBracketResults(userId),
    ...(value || {}),
    userId,
    picks: value?.picks || {},
    scoring: {
      ...emptyBracketResults(userId).scoring,
      ...(value?.scoring || {}),
    },
  }
}

export async function getBracketResults(userId) {
  if (!userId) return null

  if (hasSupabase) {
    const rows = await supabaseRequest(
      `app_config?key=eq.${encodeURIComponent(getBracketKey(userId))}&select=value`
    )
    return normalizeBracketResults(userId, rows[0]?.value)
  }

  const base = await fetchJson('bracket-results.json')
  const local = readLocal('bracket_results') || {}
  return normalizeBracketResults(userId, local[userId] ?? base[userId])
}

export async function saveBracketResults(userId, results) {
  if (!userId) return null

  const now = new Date().toISOString()
  const current = await getBracketResults(userId)
  const record = {
    ...emptyBracketResults(userId),
    ...current,
    ...results,
    schemaVersion: 1,
    userId,
    source: 'simulated_group_standings',
    status: results?.status || current?.status || 'draft',
    scoring: {
      ...emptyBracketResults(userId).scoring,
      ...(current?.scoring || {}),
      ...(results?.scoring || {}),
    },
    submittedAt: current?.submittedAt || now,
    updatedAt: now,
  }

  if (hasSupabase) {
    await supabaseRequest('app_config?on_conflict=key', {
      method: 'POST',
      body: { key: getBracketKey(userId), value: record },
      prefer: 'resolution=merge-duplicates,return=minimal',
    })
    return record
  }

  const local = readLocal('bracket_results') || {}
  local[userId] = record
  writeLocal('bracket_results', local)
  return record
}
