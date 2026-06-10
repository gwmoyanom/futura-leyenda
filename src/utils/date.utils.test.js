import { describe, expect, it } from 'vitest'
import { formatDateLabel, formatKickoffTimeUtc05, groupMatchesByDate } from './date.utils.js'

describe('date utils', () => {
  it('groups matches by the kickoff calendar date without timezone shifting', () => {
    const grouped = groupMatchesByDate([
      {
        id: 'm008',
        kickoff: '2026-06-14T00:00:00-07:00',
      },
      {
        id: 'm032',
        kickoff: '2026-06-20T00:00:00-07:00',
      },
    ])

    expect(Object.keys(grouped)).toEqual(['2026-06-14', '2026-06-20'])
    expect(grouped['2026-06-14'][0].id).toBe('m008')
  })

  it('formats date keys as calendar dates without UTC backshift', () => {
    expect(formatDateLabel('2026-06-14')).toContain('14 de junio')
  })

  it('formats kickoff times in fixed UTC-05', () => {
    expect(formatKickoffTimeUtc05('2026-06-11T15:00:00-06:00')).toBe('16:00')
    expect(formatKickoffTimeUtc05('2026-06-14T13:00:00-05:00')).toBe('13:00')
  })
})
