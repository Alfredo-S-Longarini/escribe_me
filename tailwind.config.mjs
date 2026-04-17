import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        warm: {
          950: '#0a0806',
          900: '#0d0b08',
          800: '#13100d',
          700: '#1a1510',
          600: '#2e261c',
          500: '#3a2f20',
          400: '#6e5e4a',
          300: '#9e8c76',
          200: '#c9a96e',
          100: '#e8d5b0',
          50:  '#f0e6d3',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', ...defaultTheme.fontFamily.serif],
        sans:  ['DM Sans', ...defaultTheme.fontFamily.sans],
        body:  ['Lora', 'Georgia', ...defaultTheme.fontFamily.serif],
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'fade-up':    'fadeUp 0.6s ease-out',
        'fade-out':   'fadeOut 0.4s ease-in',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeOut:   { from: { opacity: '1' }, to: { opacity: '0' } },
        fadeUp:    { from: { opacity: '0', transform: 'translateY(18px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%, 100%': { opacity: '0.3' }, '50%': { opacity: '0.85' } },
      },
      borderRadius: { 'xl': '1rem', '2xl': '1.25rem' },
    },
  },
  plugins: [],
}
