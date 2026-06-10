/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — "World Cup trophy night"
        night: {
          DEFAULT: '#0A1628',
          800: '#0D1E38',
          700: '#112548',
          600: '#162E58',
        },
        gold: {
          DEFAULT: '#F5C518',
          light: '#FADA60',
          dark: '#C49A0A',
        },
        pitch: {
          // Football pitch green
          DEFAULT: '#1A7A4A',
          light: '#22A05E',
          dark: '#0F5233',
        },
        surface: {
          DEFAULT: '#F0EDE8', // warm off-white for cards
          dark: '#1C2D47',   // dark mode card surface
        },
        live: '#E63946',      // red for live/danger states
      },

      fontFamily: {
        // Display: used for scores and big numbers
        display: ['Oswald', 'Impact', 'sans-serif'],
        // Body: clean readable sans
        body: ['Inter', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'score': ['3.5rem', { lineHeight: '1', fontWeight: '700' }],
        'hero':  ['4rem',   { lineHeight: '1.05', fontWeight: '700' }],
      },

      animation: {
        'ticker': 'ticker 30s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
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
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },

      borderRadius: {
        card: '12px',
      },

      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.12)',
        'gold': '0 0 20px rgba(245,197,24,0.3)',
      },
    },
  },
  plugins: [],
}
