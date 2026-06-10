/**
 * IntroAnimation.jsx
 *
 * Cinematic intro sequence shown once per session:
 *   "¿Quién será campeón?" → Trophy → "Nosotros ya conocemos nuestra futura leyenda" → "Maximiliano"
 *
 * Skipped automatically after first view (sessionStorage flag).
 * User can also skip it by clicking/tapping anywhere.
 */

import { useState, useEffect } from 'react'

const STEPS = [
  { id: 'question', duration: 2000 },
  { id: 'trophy',   duration: 2200 },
  { id: 'bridge',   duration: 2200 },
  { id: 'name',     duration: 2600 },
]

export default function IntroAnimation({ onComplete }) {
  const [step, setStep]     = useState(0)
  const [exiting, setExiting] = useState(false)
  const [visible, setVisible] = useState(false)

  // Fade in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  // Auto-advance through steps
  useEffect(() => {
    if (step >= STEPS.length) return
    const timer = setTimeout(() => {
      if (step === STEPS.length - 1) {
        handleFinish()
      } else {
        setStep(s => s + 1)
      }
    }, STEPS[step].duration)
    return () => clearTimeout(timer)
  }, [step])

  function handleFinish() {
    setExiting(true)
    setTimeout(() => {
      sessionStorage.setItem('intro_seen', '1')
      onComplete()
    }, 700)
  }

  return (
    <div
      onClick={handleFinish}
      className={`
        fixed inset-0 z-50 flex items-center justify-center cursor-pointer
        bg-navy transition-opacity duration-700
        ${visible ? 'opacity-100' : 'opacity-0'}
        ${exiting ? 'opacity-0' : ''}
      `}
      style={{ background: 'linear-gradient(135deg, #0B1F3A 0%, #0E2647 60%, #163660 100%)' }}
    >
      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #1F7A3D, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />
      </div>

      {/* Step content */}
      <div className="relative z-10 text-center px-8 max-w-2xl">

        {/* Step 0 — Question */}
        {step === 0 && (
          <div className="intro-enter">
            <p className="font-display text-gold/60 text-lg tracking-[0.3em] uppercase mb-4">
              Mundial 2026
            </p>
            <h1 className="font-display text-4xl sm:text-6xl font-bold text-white leading-tight">
              ¿Quién será<br />
              <span className="text-gold-shimmer">campeón?</span>
            </h1>
          </div>
        )}

        {/* Step 1 — Trophy */}
        {step === 1 && (
          <div className="intro-enter">
            <div className="text-9xl mb-6 trophy-glow inline-block animate-float">🏆</div>
            <p className="font-display text-2xl sm:text-3xl text-white/80 tracking-wider">
              El mundo entero lo busca.
            </p>
          </div>
        )}

        {/* Step 2 — Bridge */}
        {step === 2 && (
          <div className="intro-enter">
            <p className="font-display text-gold/60 text-lg tracking-[0.3em] uppercase mb-5">
              Pero nosotros...
            </p>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-white leading-snug">
              Ya conocemos a nuestra
              <br />
              <span className="text-gold">futura leyenda.</span>
            </h2>
          </div>
        )}

        {/* Step 3 — The name */}
        {step === 3 && (
          <div className="intro-enter">
            <p className="font-body text-white/40 text-sm tracking-[0.4em] uppercase mb-6">
              Bienvenido al mundo
            </p>
            <h1 className="font-display text-5xl sm:text-7xl font-bold text-gold-shimmer leading-none mb-4">
              MAXIMILIANO
            </h1>
            <div className="flex justify-center gap-2 mt-6">
              <span className="text-3xl">⚽</span>
              <span className="text-3xl animate-float" style={{ animationDelay: '0.3s' }}>🍼</span>
              <span className="text-3xl" style={{ animationDelay: '0.6s' }}>🌟</span>
            </div>
          </div>
        )}
      </div>

      {/* Skip hint */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-white/20 text-xs font-body tracking-widest">
          Toca para continuar
        </p>
        <div className="flex justify-center gap-1.5 mt-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === step ? 'w-6 bg-gold' : i < step ? 'w-2 bg-gold/40' : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
