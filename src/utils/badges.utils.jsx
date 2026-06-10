/**
 * badges.utils.js + BadgesDisplay.jsx
 *
 * Achievement badges earned by participants based on their activity.
 * Badges are computed from existing data — no extra storage needed.
 */

// ─── Badge definitions ────────────────────────────────────────────────────────

export const BADGES = {
  first_prediction: {
    id: 'first_prediction',
    emoji: '🎯',
    name: 'Primer Disparo',
    description: 'Hiciste tu primera predicción',
    condition: ({ predictionsCount }) => predictionsCount >= 1,
  },
  sharpshooter: {
    id: 'sharpshooter',
    emoji: '🔫',
    name: 'Francotirador',
    description: '3 resultados exactos',
    condition: ({ exactScores }) => exactScores >= 3,
  },
  perfect_group: {
    id: 'perfect_group',
    emoji: '💫',
    name: 'Grupo Perfecto',
    description: 'Acertaste todos los partidos de un grupo',
    condition: ({ exactScores }) => exactScores >= 4,
  },
  top_scorer: {
    id: 'top_scorer',
    emoji: '👑',
    name: 'Líder',
    description: 'Estás en el primer lugar de la tabla',
    condition: ({ rank }) => rank === 1,
  },
  podium: {
    id: 'podium',
    emoji: '🏅',
    name: 'En el Podio',
    description: 'Estás en el top 3',
    condition: ({ rank }) => rank <= 3 && rank > 0,
  },
  early_bird: {
    id: 'early_bird',
    emoji: '🌅',
    name: 'Madrugador',
    description: 'Te registraste en los primeros días',
    condition: ({ userId }) => userId <= 'u010',
  },
  hat_trick: {
    id: 'hat_trick',
    emoji: '⚽',
    name: 'Hat-Trick',
    description: 'Acertaste 3 partidos seguidos',
    condition: ({ exactScores }) => exactScores >= 3,
  },
  legend_supporter: {
    id: 'legend_supporter',
    emoji: '🍼',
    name: 'Seguidor de la Leyenda',
    description: 'Dejaste un mensaje para Maximiliano',
    condition: ({ hasMessage }) => hasMessage,
  },
}

/**
 * Returns the list of earned badges for a leaderboard entry.
 *
 * @param {object} entry      - leaderboard entry (user, totalPoints, exactScores, etc.)
 * @param {number} rank       - the user's current rank
 * @param {boolean} hasMessage - whether they left a message for Maxi
 */
export function getEarnedBadges(entry, rank, hasMessage = false) {
  const ctx = {
    predictionsCount: entry.predictionsCount,
    exactScores:      entry.exactScores,
    correctResults:   entry.correctResults,
    totalPoints:      entry.totalPoints,
    userId:           entry.user.id,
    rank,
    hasMessage,
  }

  return Object.values(BADGES).filter(badge => {
    try { return badge.condition(ctx) } catch { return false }
  })
}

// ─── Badge pill component ─────────────────────────────────────────────────────

export function BadgePill({ badge, size = 'md' }) {
  const sizes = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-xs gap-1.5',
    lg: 'px-4 py-2 text-sm gap-2',
  }

  return (
    <div
      title={badge.description}
      className={`
        inline-flex items-center rounded-full font-medium
        bg-navy text-gold border border-gold/20
        badge-shine cursor-default select-none
        ${sizes[size]}
      `}
    >
      <span>{badge.emoji}</span>
      <span>{badge.name}</span>
    </div>
  )
}

// ─── Full badge showcase ──────────────────────────────────────────────────────

import { clsx } from 'clsx'

export function BadgeShowcase({ earnedBadges }) {
  const allBadges = Object.values(BADGES)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {allBadges.map(badge => {
        const earned = earnedBadges.some(b => b.id === badge.id)
        return (
          <div
            key={badge.id}
            title={badge.description}
            className={clsx(
              'rounded-card p-4 text-center border transition-all',
              earned
                ? 'bg-navy border-gold/30 shadow-gold-sm'
                : 'bg-gray-50 border-gray-100 opacity-40 grayscale'
            )}
          >
            <div className={clsx('text-3xl mb-2', earned && 'animate-float')}>
              {badge.emoji}
            </div>
            <p className={clsx('text-xs font-semibold', earned ? 'text-gold' : 'text-gray-400')}>
              {badge.name}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
              {badge.description}
            </p>
          </div>
        )
      })}
    </div>
  )
}
