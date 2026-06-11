/**
 * match-insights.service.js
 *
 * Builds useful live-match links. Curated match links are preferred, optional
 * Google Custom Search results are added when configured, and safe search links
 * are always available as a fallback for static GitHub Pages deployments.
 */

const GOOGLE_SEARCH_API_KEY = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY
const GOOGLE_SEARCH_CX = import.meta.env.VITE_GOOGLE_SEARCH_CX
const CACHE_PREFIX = 'polla_match_insights_'
const CACHE_TTL_MS = 10 * 60 * 1000

function normalizeText(value) {
  return String(value || '').trim()
}

function buildMatchLabel(match) {
  return `${match.homeTeam?.name || match.homeTeam?.code} vs ${match.awayTeam?.name || match.awayTeam?.code}`
}

function buildInsightQuery(match) {
  const home = normalizeText(match.homeTeam?.name || match.homeTeam?.code)
  const away = normalizeText(match.awayTeam?.name || match.awayTeam?.code)
  return `${home} ${away} Mundial 2026 resumen analisis highlights`
}

function buildDirectvQuery(match) {
  const home = normalizeText(match.homeTeam?.name || match.homeTeam?.code)
  const away = normalizeText(match.awayTeam?.name || match.awayTeam?.code)
  return `site:stories.directvsports.com/games ${home} ${away}`
}

function toSafeUrl(url) {
  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return parsed.toString()
  } catch {
    return null
  }
  return null
}

function normalizeCuratedLinks(match) {
  const links = Array.isArray(match?.insightLinks) ? match.insightLinks : []

  return links
    .map((link, index) => {
      const url = toSafeUrl(link.url)
      if (!url) return null

      return {
        id: link.id || `${match.id}_curated_${index}`,
        title: link.title || 'Insight del partido',
        description: link.description || 'Link recomendado por la organizacion.',
        url,
        source: link.source || 'Curado',
        priority: 0,
      }
    })
    .filter(Boolean)
}

export function buildFallbackInsightLinks(match) {
  const query = buildInsightQuery(match)
  const encodedQuery = encodeURIComponent(query)
  const encodedDirectvQuery = encodeURIComponent(buildDirectvQuery(match))
  const label = buildMatchLabel(match)

  return [
    ...normalizeCuratedLinks(match),
    {
      id: `${match.id}_youtube`,
      title: 'Analisis y videos',
      description: `Buscar videos recientes de ${label}.`,
      url: `https://www.youtube.com/results?search_query=${encodedQuery}`,
      source: 'YouTube',
      priority: 2,
    },
    {
      id: `${match.id}_directv`,
      title: 'Historias DIRECTV',
      description: 'Buscar stories e insights relacionados al partido.',
      url: `https://www.google.com/search?q=${encodedDirectvQuery}`,
      source: 'DIRECTV Sports',
      priority: 3,
    },
    {
      id: `${match.id}_google`,
      title: 'Noticias e insights',
      description: 'Buscar cobertura y contexto del partido.',
      url: `https://www.google.com/search?q=${encodedQuery}`,
      source: 'Google',
      priority: 4,
    },
  ]
}

function getCached(matchId) {
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${matchId}`)
    if (!raw) return null
    const cached = JSON.parse(raw)
    if (Date.now() - cached.savedAt > CACHE_TTL_MS) return null
    return cached.links
  } catch {
    return null
  }
}

function setCached(matchId, links) {
  try {
    sessionStorage.setItem(`${CACHE_PREFIX}${matchId}`, JSON.stringify({
      savedAt: Date.now(),
      links,
    }))
  } catch {
    // Cache is only an optimization.
  }
}

export async function fetchGoogleInsightLinks(match) {
  if (!GOOGLE_SEARCH_API_KEY || !GOOGLE_SEARCH_CX) return []

  const cached = getCached(match.id)
  if (cached) return cached

  const params = new URLSearchParams({
    key: GOOGLE_SEARCH_API_KEY,
    cx: GOOGLE_SEARCH_CX,
    q: buildInsightQuery(match),
    num: '4',
    safe: 'active',
  })

  try {
    const res = await fetch(`https://www.googleapis.com/customsearch/v1?${params.toString()}`)
    if (!res.ok) return []

    const data = await res.json()
    const links = (data.items || [])
      .map((item, index) => {
        const url = toSafeUrl(item.link)
        if (!url) return null

        return {
          id: `${match.id}_google_result_${index}`,
          title: item.title || 'Resultado relacionado',
          description: item.snippet || 'Resultado encontrado para este partido.',
          url,
          source: item.displayLink || 'Google',
          priority: 1,
        }
      })
      .filter(Boolean)

    setCached(match.id, links)
    return links
  } catch {
    return []
  }
}

export function mergeInsightLinks(...groups) {
  const seen = new Set()

  return groups
    .flat()
    .filter(link => {
      if (!link?.url || seen.has(link.url)) return false
      seen.add(link.url)
      return true
    })
    .sort((a, b) => (a.priority ?? 9) - (b.priority ?? 9))
}
