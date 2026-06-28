/** @type {import('tailwindcss').Config} */
// Configuration Tailwind — palette bleu marine + accents verts/rouges, mode sombre par classe
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Bleu marine principal de la charte graphique
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#627d98',
          500: '#486581',
          600: '#334e68',
          700: '#243b53',
          800: '#1e3a5f', // couleur de marque
          900: '#152a45',
          950: '#0d1b2e',
        },
        // Vert pour les gains
        gain: {
          light: '#34d399',
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        // Rouge pour les pertes
        loss: {
          light: '#f87171',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Élévations en couches (premium) — remplacent les ombres plates
      boxShadow: {
        card: '0 1px 2px rgba(13,27,46,0.04), 0 6px 20px -8px rgba(13,27,46,0.10)',
        'card-hover': '0 8px 24px -8px rgba(13,27,46,0.18), 0 2px 6px rgba(13,27,46,0.06)',
        float: '0 24px 48px -16px rgba(13,27,46,0.40), 0 8px 16px -8px rgba(13,27,46,0.30)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        shimmer: 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [],
}
