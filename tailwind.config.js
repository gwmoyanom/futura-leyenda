/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Futura Leyenda brand palette
        navy: {
          DEFAULT: '#0B1F3A',
          800: '#0E2647',
          700: '#122E54',
          600: '#163660',
          400: '#1E4A80',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E8CC6A',
          dark: '#A8891E',
          pale: '#F5ECC4',
        },
        pitch: {
          DEFAULT: '#1F7A3D',
          light: '#27A350',
          dark: '#145228',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft:    '#F8F6F0',   // warm off-white
          dark:    '#0E2040',   // deep navy surface
        },
        live: '#E63946',
      },

      fontFamily: {
        display: ['Oswald', 'Impact', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },

      animation: {
        'ticker':        'ticker 30s linear infinite',
        'pulse-slow':    'pulse 3s ease-in-out infinite',
        'fade-in':       'fadeIn 0.4s ease-out',
        'slide-up':      'slideUp 0.4s ease-out',
        'slide-down':    'slideDown 0.4s ease-out',
        'zoom-in':       'zoomIn 0.5s ease-out',
        'float':         'float 4s ease-in-out infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'count-up':      'countUp 0.6s ease-out',
        'intro-fade':    'introFade 1s ease-out forwards',
      },

      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        zoomIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        introFade: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },

      borderRadius: {
        card: '14px',
        xl2: '20px',
      },

      boxShadow: {
        'card':      '0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover':'0 8px 24px rgba(0,0,0,0.12)',
        'gold':      '0 0 24px rgba(212,175,55,0.35)',
        'gold-sm':   '0 0 12px rgba(212,175,55,0.25)',
        'navy':      '0 4px 20px rgba(11,31,58,0.3)',
        'inner-gold':'inset 0 1px 0 rgba(212,175,55,0.3)',
      },
    },
  },
  plugins: [],
}
