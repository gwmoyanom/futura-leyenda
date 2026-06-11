import { describe, expect, it } from 'vitest'
import {
  formatDateLabel,
  formatKickoffTimeUtc05,
  groupMatchesByDate,
  isMatchPredictionLocked,
} from './date.utils.js'

describe('date utils', () => {
  it('groups matches by the UTC-05 kickoff calendar date', () => {
    const grouped = groupMatchesByDate([
      {
        id: 'late-thursday-in-ecuador',
        kickoff: '2026-06-12T02:00:00Z',
      },
      {
        id: 'early-friday-in-ecuador',
        kickoff: '2026-06-12T08:00:00-04:00',
      },
    ])

    expect(Object.keys(grouped)).toEqual(['2026-06-11', '2026-06-12'])
    expect(grouped['2026-06-11'][0].id).toBe('late-thursday-in-ecuador')
  })

  it('formats date keys as calendar dates without UTC backshift', () => {
    expect(formatDateLabel('2026-06-14')).toContain('14 de junio')
  })

  it('formats kickoff times in fixed UTC-05', () => {
    expect(formatKickoffTimeUtc05('2026-06-11T15:00:00-06:00')).toBe('16:00')
    expect(formatKickoffTimeUtc05('2026-06-14T13:00:00-05:00')).toBe('13:00')
  })

  it('locks an individual match once it is live or finished', () => {
    const futureKickoff = '2099-06-11T15:00:00Z'

    expect(isMatchPredictionLocked({ status: 'upcoming', kickoff: futureKickoff })).toBe(false)
    expect(isMatchPredictionLocked({ status: 'live', kickoff: futureKickoff })).toBe(true)
    expect(isMatchPredictionLocked({ status: 'finished', kickoff: futureKickoff })).toBe(true)
  })
})
