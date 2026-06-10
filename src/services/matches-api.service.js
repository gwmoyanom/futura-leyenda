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
const CACHE_EXPIRY = 1000 * 60 * 5  // 5 minutes

/**
 * Get cached matches or fetch fresh data if cache expired
 * @param {string} competitionCode - e.g., 'WC' for World Cup
 * @returns {Promise<Array>} Array of matches
 */
export async function fetchMatchesFromAPI(competitionCode = 'WC') {
  const cached = getCache()
  if (cached && cached.data) {
    return cached.data
  }

  try {
    const url = `${API_BASE}/competitions/${competitionCode}/matches`
    const response = await fetch(url, {
      headers: {
        // Note: football-data.org works without an API key for basic requests
        // For production, add: 'X-Auth-Token': import.meta.env.VITE_FOOTBALL_DATA_API_KEY
      }
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const apiData = await response.json()
    const matches = normalizeMatches(apiData.matches || [])

    // Cache the results
    setCache(matches)

    return matches
  } catch (error) {
    console.error('Failed to fetch matches from API:', error)
    // Return empty array if API fails - fall back to local data
    return []
  }
}

/**
 * Update a single match result when admin scores it
 * For now this is local-only. Could be extended to sync with backend.
 */
export function updateMatchResult(matchId, homeScore, awayScore) {
  const matches = getCache()?.data || []
  const match = matches.find(m => m.id === matchId)

  if (match) {
    match.result = { home: homeScore, away: awayScore }
    match.status = 'finished'
    setCache(matches)
  }

  return match
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

function normalizeMatches(apiMatches) {
  return apiMatches.map(match => ({
    id: `m${match.id}`,
    phase: determinatePhase(match.stage),
    group: match.group?.charAt(0) || null,
    homeTeam: {
      name: match.homeTeam.name,
      code: match.homeTeam.code,
      flag: getFlagEmoji(match.homeTeam.code),
    },
    awayTeam: {
      name: match.awayTeam.name,
      code: match.awayTeam.code,
      flag: getFlagEmoji(match.awayTeam.code),
    },
    kickoff: match.utcDate,
    venue: match.venue || 'TBD',
    result: match.score.fullTime?.home !== null
      ? {
          home: match.score.fullTime.home,
          away: match.score.fullTime.away,
        }
      : null,
    status: mapStatus(match.status),
  }))
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
  const status = apiStatus.toUpperCase()
  if (status === 'FINISHED') return 'finished'
  if (status === 'LIVE' || status === 'IN_PLAY') return 'live'
  if (status === 'PAUSED') return 'paused'
  return 'upcoming'
}

function getFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt())

  return String.fromCodePoint(...codePoints)
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
