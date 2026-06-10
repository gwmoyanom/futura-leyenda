/**
 * BirthCountdown.jsx
 *
 * Live countdown to Maximiliano's estimated birth date.
 * Updates every second. Shows days, hours, minutes, seconds.
 * When the date passes, switches to a celebration message.
 *
 * The target date is set to July 9, 2026 as a placeholder.
 * Admin can update it in public/data/config.json → birthDate.
 */

import { useState, useEffect } from 'react'

// Default estimated date — update in config.json to the real one
const DEFAULT_BIRTH_DATE = '2026-07-09T00:00:00'

function pad(n) {
  return String(n).padStart(2, '0')
}

function getTimeLeft(targetDate) {
  const diff = new Date(targetDate) - new Date()
  if (diff <= 0) return null

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds }
}

// ─── Single digit block ───────────────────────────────────────────────────────

function TimeBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-navy rounded-xl px-3 py-2 sm:px-5 sm:py-3 min-w-[56px] sm:min-w-[72px] text-center shadow-navy">
        <span className="font-display text-3xl sm:text-4xl font-bold text-gold leading-none">
          {pad(value)}
        </span>
      </div>
      <span className="text-gold/50 text-[10px] sm:text-xs font-body uppercase tracking-widest mt-2">
        {label}
      </span>
    </div>
  )
}

// ─── Separator ────────────────────────────────────────────────────────────────

function Sep() {
  return (
    <span className="font-display text-2xl font-bold text-gold/40 mb-5 select-none">:</span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BirthCountdown({ targetDate = DEFAULT_BIRTH_DATE }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  // He's arrived! 🎉
  if (!timeLeft) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4 animate-float">🍼</div>
        <h3 className="font-display text-3xl font-bold text-gold mb-2">
          ¡MAXIMILIANO HA LLEGADO!
        </h3>
        <p className="text-white/60 font-body text-sm">
          La futura leyenda ya está con nosotros 🌟
        </p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <p className="font-body text-gold/60 text-xs tracking-[0.3em] uppercase mb-4">
        Faltan para conocer a la futura leyenda
      </p>
      <div className="flex items-end justify-center gap-2 sm:gap-3">
        <TimeBlock value={timeLeft.days}    label="días" />
        <Sep />
        <TimeBlock value={timeLeft.hours}   label="horas" />
        <Sep />
        <TimeBlock value={timeLeft.minutes} label="min" />
        <Sep />
        <TimeBlock value={timeLeft.seconds} label="seg" />
      </div>
    </div>
  )
}
