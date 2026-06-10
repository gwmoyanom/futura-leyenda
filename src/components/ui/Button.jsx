import clsx from 'clsx'

const variants = {
  primary:   'bg-gold text-navy font-bold hover:bg-gold-light active:scale-95 shadow-gold-sm',
  secondary: 'bg-surface-soft text-navy border border-gray-200 hover:bg-gray-100 active:scale-95',
  danger:    'bg-live text-white hover:bg-red-600 active:scale-95',
  ghost:     'bg-transparent text-gold hover:bg-gold/10 active:scale-95',
  outline:   'bg-transparent border border-gold/40 text-gold hover:bg-gold/10 active:scale-95',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
}

export default function Button({
  children, variant = 'primary', size = 'md',
  className = '', disabled = false, loading = false,
  type = 'button', onClick, ...props
}) {
  return (
    <button
      type={type} onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-body font-semibold',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      )}
      {children}
    </button>
  )
}
