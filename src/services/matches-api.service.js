/**
 * matches-api.service.js
 *
 * Fetches live match results from football-data.org
 * Caches results in localStorage to minimize API calls
 *
 * Note: football-data.org is free but has rate limits. Consider implementing
 * an API key system or a backend proxy for production.
 */

const API_BASE = 'https://api.football-data.org/v4'
const CACHE_KEY = 'polla_matches_api_cache'
const CACHE_EXPIRY = 1000 * 30
const API_TOKEN = import.meta.env.VITE_FOOTBALL_DATA_API_KEY
const API_PROXY_URL = import.meta.env.VITE_FOOTBALL_DATA_PROXY_URL
export const MATCH_SYNC_INTERVAL_MS = Number(import.meta.env.VITE_MATCH_SYNC_INTERVAL_MS || 60000)

/**
 * Get cached matches or fetch fresh data if cache expired
 * @param {string} competitionCode - e.g., 'WC' for World Cup
 * @returns {Promise<Array>} Array of matches
 */
export async function fetchMatchesFromAPI(competitionCode = 'WC', { force = false } = {}) {
  const cached = getCache()
  if (!force && cached && cached.data) {
    return cached.data
  }

  const { url, headers, source } = getRequestConfig(competitionCode)
  const response = await fetch(url, { headers })

  if (!response.ok) {
    const detail = await readErrorDetail(response)
    throw new Error(
      `${source} respondió ${response.status} ${response.statusText}${detail ? `: ${detail}` : ''}`
    )
  }

  const apiData = await response.json()
  const matches = normalizeApiMatches(apiData)

  setCache(matches)

  return matches
}

/**
 * Compare online API data against local matches and return only meaningful
 * changes that should be persisted.
 */
export async function getMatchApiUpdates(localMatches, { competitionCode = 'WC', force = true } = {}) {
  const apiMatches = await fetchMatchesFromAPI(competitionCode, { force })
  const syncedAt = new Date().toISOString()
  const updates = []

  localMatches.forEach(localMatch => {
    const apiMatch = findApiMatch(localMatch, apiMatches)
    if (!apiMatch) return

    const next = {
      lastSyncedAt: syncedAt,
      apiSource: 'football-data.org',
      apiMatchId: String(apiMatch.apiId),
    }
    const changes = []

    if (apiMatch.status && apiMatch.status !== localMatch.status) {
      next.status = apiMatch.status
      changes.push(`estado ${localMatch.status} → ${apiMatch.status}`)
    }

    if (apiMatch.result && !sameResult(apiMatch.result, localMatch.result)) {
      next.result = apiMatch.result
      changes.push(`marcador ${formatResult(localMatch.result)} → ${formatResult(apiMatch.result)}`)
    }

    if (changes.length > 0) {
      updates.push({
        matchId: localMatch.id,
        updates: next,
        apiMatch,
        changes,
      })
    }
  })

  return {
    checked: localMatches.length,
    apiCount: apiMatches.length,
    updates,
    syncedAt,
  }
}

/**
 * Merge API match data with local overrides/cache
 */
export async function getMergedMatches(localMatches, apiMatches) {
  const apiMap = new Map(apiMatches.map(m => [m.id, m]))

  return localMatches.map(localMatch => {
    const apiMatch = apiMap.get(localMatch.id)

    if (!apiMatch) {
      return localMatch
    }

    // Prefer API data for results that have been played
    if (apiMatch.status === 'finished' && apiMatch.result) {
      return {
        ...localMatch,
        result: apiMatch.result,
        status: apiMatch.status,
      }
    }

    // Otherwise use local data
    return localMatch
  })
}

// ─── Private helpers ──────────────────────────────────────────────────────

export function normalizeMatches(apiMatches) {
  return apiMatches.map(match => ({
    apiId: match.id,
    id: `api-${match.id}`,
    phase: determinatePhase(match.stage),
    group: match.group?.charAt(0) || null,
    homeTeam: {
      name: match.homeTeam?.name,
      code: match.homeTeam?.code,
      flag: getFlagEmoji(match.homeTeam?.code),
    },
    awayTeam: {
      name: match.awayTeam?.name,
      code: match.awayTeam?.code,
      flag: getFlagEmoji(match.awayTeam?.code),
    },
    kickoff: match.utcDate,
    venue: match.venue || 'TBD',
    result: extractScore(match),
    status: mapStatus(match.status),
    minute: match.minute,
    lastUpdated: match.lastUpdated,
  }))
}

function normalizeApiMatches(apiData) {
  const matches = Array.isArray(apiData) ? apiData : (apiData.matches || apiData.data || [])
  if (matches.length === 0) return []
  if (matches[0]?.apiId) return matches
  return normalizeMatches(matches)
}

function getRequestConfig(competitionCode) {
  if (API_PROXY_URL) {
    const url = new URL(API_PROXY_URL)
    url.searchParams.set('competition', competitionCode)
    return {
      url: url.toString(),
      headers: {},
      source: 'Proxy football-data',
    }
  }

  if (!canUseDirectFootballData()) {
    throw new Error(
      'La sincronización automática necesita VITE_FOOTBALL_DATA_PROXY_URL en producción. football-data.org bloquea llamadas directas desde GitHub Pages por CORS.'
    )
  }

  return {
    url: `${API_BASE}/competitions/${competitionCode}/matches`,
    headers: API_TOKEN ? { 'X-Auth-Token': API_TOKEN } : {},
    source: 'football-data.org',
  }
}

function canUseDirectFootballData() {
  if (import.meta.env.DEV) return true
  if (typeof window === 'undefined') return true

  const hostname = window.location?.hostname
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

function determinatePhase(stage) {
  const stageUpper = stage.toUpperCase()
  if (stageUpper.includes('GROUP')) return 'group'
  if (stageUpper.includes('ROUND OF 16')) return 'round16'
  if (stageUpper.includes('QUARTER')) return 'quarterfinal'
  if (stageUpper.includes('SEMI')) return 'semifinal'
  if (stageUpper.includes('FINAL')) return 'final'
  if (stageUpper.includes('THIRD')) return 'third_place'
  return 'group'
}

function mapStatus(apiStatus) {
  const status = String(apiStatus || '').toUpperCase()
  if (status === 'FINISHED') return 'finished'
  if (status === 'LIVE' || status === 'IN_PLAY' || status === 'PAUSED') return 'live'
  return 'upcoming'
}

function extractScore(match) {
  const scoreCandidates = [
    match.score?.current,
    match.score?.live,
    match.score?.fullTime,
    match.score?.regularTime,
    match.score?.halfTime,
  ]
  const score = scoreCandidates.map(normalizeScore).find(Boolean)
  if (score) return score

  const goalScore = inferScoreFromGoals(match.goals, match.homeTeam, match.awayTeam)
  if (goalScore) return goalScore

  return null
}

function normalizeScore(score) {
  const home = toScoreNumber(score?.home ?? score?.homeTeam)
  const away = toScoreNumber(score?.away ?? score?.awayTeam)
  if (home === null || away === null) return null
  return { home, away }
}

function toScoreNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function inferScoreFromGoals(goals = [], homeTeam, awayTeam) {
  if (!Array.isArray(goals) || goals.length === 0) return null

  return goals.reduce((score, goal) => {
    const goalTeam = goal.team || {}
    if (sameTeam(homeTeam, goalTeam)) return { ...score, home: score.home + 1 }
    if (sameTeam(awayTeam, goalTeam)) return { ...score, away: score.away + 1 }
    return score
  }, { home: 0, away: 0 })
}

function sameResult(a, b) {
  if (!a && !b) return true
  if (!a || !b) return false
  return a.home === b.home && a.away === b.away
}

function formatResult(result) {
  if (!result) return '--'
  return `${result.home}-${result.away}`
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function sameTeam(localTeam, apiTeam) {
  if (!localTeam || !apiTeam) return false
  if (localTeam.code && apiTeam.code && localTeam.code === apiTeam.code) return true
  return normalizeText(localTeam.name) === normalizeText(apiTeam.name)
}

function sameMatchDay(localKickoff, apiKickoff) {
  const localDate = new Date(localKickoff)
  const apiDate = new Date(apiKickoff)
  if (Number.isNaN(localDate.getTime()) || Number.isNaN(apiDate.getTime())) return false

  const hours = Math.abs(localDate.getTime() - apiDate.getTime()) / (1000 * 60 * 60)
  return hours <= 18
}

function findApiMatch(localMatch, apiMatches) {
  return apiMatches.find(apiMatch =>
    sameMatchDay(localMatch.kickoff, apiMatch.kickoff) &&
    sameTeam(localMatch.homeTeam, apiMatch.homeTeam) &&
    sameTeam(localMatch.awayTeam, apiMatch.awayTeam)
  )
}

function getFlagEmoji(countryCode) {
  if (!countryCode || String(countryCode).length !== 2) return '🏳️'

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt())

  return String.fromCodePoint(...codePoints)
}

async function readErrorDetail(response) {
  try {
    const text = await response.text()
    if (!text) return ''
    const parsed = JSON.parse(text)
    return parsed.message || parsed.error || text.slice(0, 240)
  } catch {
    return ''
  }
}

// ─── Cache management ────────────────────────────────────────────────────

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null

    const cached = JSON.parse(raw)
    const now = Date.now()

    if (now - cached.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    return cached
  } catch {
    return null
  }
}

function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }))
  } catch (error) {
    console.warn('Failed to cache matches:', error)
  }
}

export function clearMatchesCache() {
  localStorage.removeItem(CACHE_KEY)
}
