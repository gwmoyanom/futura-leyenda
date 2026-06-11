import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchMatchesFromAPI, normalizeMatches } from './matches-api.service.js'

function apiMatch(overrides = {}) {
  return {
    id: 100,
    stage: 'GROUP_STAGE',
    group: 'GROUP_A',
    utcDate: '2026-06-11T21:00:00Z',
    venue: 'Estadio Ciudad de Mexico',
    status: 'IN_PLAY',
    minute: 34,
    lastUpdated: '2026-06-11T21:34:00Z',
    homeTeam: { name: 'Mexico', code: 'MEX' },
    awayTeam: { name: 'South Africa', code: 'RSA' },
    score: {
      fullTime: { home: null, away: null },
      halfTime: { home: null, away: null },
    },
    goals: [],
    ...overrides,
  }
}

describe('matches api service', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('normalizes football-data scores with homeTeam/awayTeam keys', () => {
    const [match] = normalizeMatches([
      apiMatch({
        status: 'FINISHED',
        score: {
          fullTime: { homeTeam: 3, awayTeam: 1 },
          halfTime: { homeTeam: 0, awayTeam: 0 },
        },
      }),
    ])

    expect(match.status).toBe('finished')
    expect(match.result).toEqual({ home: 3, away: 1 })
  })

  it('keeps a live result null when the API has no score yet', () => {
    const [match] = normalizeMatches([apiMatch()])

    expect(match.status).toBe('live')
    expect(match.result).toBeNull()
  })

  it('infers a live score from goals when score fields are empty', () => {
    const [match] = normalizeMatches([
      apiMatch({
        goals: [
          { team: { name: 'Mexico', code: 'MEX' } },
          { team: { name: 'South Africa', code: 'RSA' } },
          { team: { name: 'Mexico', code: 'MEX' } },
        ],
      }),
    ])

    expect(match.result).toEqual({ home: 2, away: 1 })
  })

  it('throws API errors instead of returning an empty match list', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      text: async () => JSON.stringify({ message: 'Token invalid' }),
    })))

    await expect(fetchMatchesFromAPI('WC', { force: true }))
      .rejects.toThrow('football-data.org respondió 403 Forbidden: Token invalid')
  })
})
