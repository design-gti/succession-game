/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1D6FF2',
          dark: '#1558CC',
          light: '#4D8FF5',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px 2px rgba(239,68,68,0.4)' },
          '50%': { boxShadow: '0 0 20px 6px rgba(239,68,68,0.7)' },
        },
      },
    },
  },
  plugins: [],
}
