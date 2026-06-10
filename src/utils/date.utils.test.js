import { describe, expect, it } from 'vitest'
import { formatDateLabel, groupMatchesByDate } from './date.utils.js'

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
})
