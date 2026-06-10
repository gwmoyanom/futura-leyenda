/**
 * date.utils.js
 *
 * Helpers for match timing logic — deadlines, countdowns, formatting.
 * Using date-fns for reliable date math.
 */

import {
  format,
  parse,
  formatDistanceToNow,
  isPast,
  isFuture,
  differenceInMinutes,
  differenceInHours,
} from 'date-fns'
import { es } from 'date-fns/locale'

function getIsoDateKey(isoString) {
  return isoString?.slice(0, 10)
}

/**
 * Formats a kickoff time as a readable date string
 * e.g. "Sábado 14 Jun, 18:00"
 */
export function formatKickoff(isoString) {
  const date = new Date(isoString)
  return format(date, "EEEE d MMM, HH:mm", { locale: es })
}

/**
 * Formats a kickoff time in a fixed UTC-05:00 offset.
 */
export function formatKickoffTimeUtc05(isoString) {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''

  const utc05 = new Date(date.getTime() - 5 * 60 * 60 * 1000)
  const hours = String(utc05.getUTCHours()).padStart(2, '0')
  const minutes = String(utc05.getUTCMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
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
    const dateKey = getIsoDateKey(match.kickoff)
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(match)
    return groups
  }, {})
}

/**
 * Formats a date key (yyyy-MM-dd) as a display label: "Lunes 14 de Junio"
 */
export function formatDateLabel(dateKey) {
  return format(parse(dateKey, 'yyyy-MM-dd', new Date()), "EEEE d 'de' MMMM", { locale: es })
}

/**
 * Returns true if all predictions have been locked (tournament has started)
 * @param {string} inaugurationDateIso - ISO string of tournament start
 */
export function isAllPredictionsLocked(inaugurationDateIso) {
  if (!inaugurationDateIso) return false
  return isPast(new Date(inaugurationDateIso))
}

/**
 * Returns countdown until predictions lock (tournament inauguration)
 * @param {string} inaugurationDateIso - ISO string of tournament start
 */
export function getPredictionsLockCountdown(inaugurationDateIso) {
  if (!inaugurationDateIso) return null

  const now = new Date()
  const lockDate = new Date(inaugurationDateIso)
  const totalMinutes = differenceInMinutes(lockDate, now)

  if (totalMinutes <= 0) return null

  const days    = Math.floor(totalMinutes / (60 * 24))
  const hours   = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  if (days > 7) return `Falta ${days} días para que se cierren las predicciones`
  if (days > 0) return `${days}d ${hours}h para cierre`
  if (hours > 0) return `${hours}h ${minutes}m para cierre`
  return `${minutes}m para cierre`
}

/**
 * Returns true if a specific phase is currently locked (all matches finished)
 */
export function isPhaseCompleted(phaseMatches) {
  if (!phaseMatches || phaseMatches.length === 0) return false
  return phaseMatches.every(match => match.status === 'finished')
}

/**
 * Get time remaining until match kickoff in hours (for display purposes)
 */
export function getHoursUntilKickoff(kickoffIso) {
  const now = new Date()
  const kickoff = new Date(kickoffIso)
  const hours = differenceInHours(kickoff, now)
  return Math.max(0, hours)
}
