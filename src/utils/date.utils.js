/**
 * date.utils.js
 *
 * Helpers for match timing logic — deadlines, countdowns, formatting.
 * Using date-fns for reliable date math.
 */

import {
  format,
  formatDistanceToNow,
  isPast,
  isFuture,
  differenceInMinutes,
} from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formats a kickoff time as a readable date string
 * e.g. "Sábado 14 Jun, 18:00"
 */
export function formatKickoff(isoString) {
  const date = new Date(isoString)
  return format(date, "EEEE d MMM, HH:mm", { locale: es })
}

/**
 * Returns a human-readable distance like "en 3 horas" or "hace 2 días"
 */
export function timeFromNow(isoString) {
  return formatDistanceToNow(new Date(isoString), {
    addSuffix: true,
    locale: es,
  })
}

/**
 * Returns true if the prediction deadline has passed (kickoff time).
 * Predictions lock at kickoff.
 */
export function isPredictionLocked(kickoffIso) {
  return isPast(new Date(kickoffIso))
}

/**
 * Returns true if the match hasn't started yet
 */
export function isUpcoming(kickoffIso) {
  return isFuture(new Date(kickoffIso))
}

/**
 * Returns countdown string for upcoming matches: "2d 4h 30m"
 */
export function getCountdown(kickoffIso) {
  const now = new Date()
  const kickoff = new Date(kickoffIso)
  const totalMinutes = differenceInMinutes(kickoff, now)

  if (totalMinutes <= 0) return null

  const days    = Math.floor(totalMinutes / (60 * 24))
  const hours   = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

/**
 * Groups matches by date for display purposes
 */
export function groupMatchesByDate(matches) {
  return matches.reduce((groups, match) => {
    const dateKey = format(new Date(match.kickoff), 'yyyy-MM-dd')
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(match)
    return groups
  }, {})
}

/**
 * Formats a date key (yyyy-MM-dd) as a display label: "Lunes 14 de Junio"
 */
export function formatDateLabel(dateKey) {
  return format(new Date(dateKey), "EEEE d 'de' MMMM", { locale: es })
}
