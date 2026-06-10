/**
 * ui/index.jsx
 *
 * Small primitive components: Card, Input, Badge, Alert, Spinner.
 * Grouped here to avoid one-file-per-tiny-component clutter.
 */

import clsx from 'clsx'

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-card border border-gray-100 shadow-card',
        'transition-shadow duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={clsx('px-5 py-4 border-b border-gray-100', className)}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={clsx('px-5 py-4', className)}>
      {children}
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

export function Input({
  label,
  error,
  hint,
  className = '',
  ...props
}) {
  const id = props.id || props.name
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-navy/80">
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(
          'w-full px-4 py-2.5 rounded-xl text-sm',
          'border bg-white text-navy placeholder-gray-400',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold',
          error
            ? 'border-live focus:ring-live/30 focus:border-live'
            : 'border-gray-200',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-live">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

const badgeVariants = {
  gold:    'bg-gold/20 text-gold-dark border border-gold/30',
  green:   'bg-pitch/10 text-pitch-dark border border-pitch/20',
  red:     'bg-live/10 text-live border border-live/20',
  gray:    'bg-gray-100 text-gray-600 border border-gray-200',
  live:    'bg-live text-white animate-pulse-slow',
}

export function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-0.5',
        'text-xs font-medium rounded-full',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// ─── Alert ────────────────────────────────────────────────────────────────────

const alertVariants = {
  info:    'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error:   'bg-red-50 border-red-200 text-red-800',
}

export function Alert({ children, variant = 'info', className = '' }) {
  return (
    <div
      role="alert"
      className={clsx(
        'px-4 py-3 rounded-xl border text-sm',
        alertVariants[variant],
        className
      )}
    >
      {children}
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }
  return (
    <svg
      className={clsx('animate-spin text-gold', sizes[size], className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Cargando..."
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

export function LoadingScreen({ message = 'Cargando...' }) {
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-gold/70 text-sm font-body">{message}</p>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-navy mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm mb-6">{description}</p>}
      {action}
    </div>
  )
}
