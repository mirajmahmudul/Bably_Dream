/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050506',
        ink: '#F2F4F7',
        muted: '#9AA0AA',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'serif'],
        display: ['"Platinum"', 'cursive'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-rise': 'fadeRise 0.8s ease-out both',
        'fade-rise-delay': 'fadeRise 0.8s ease-out 0.2s both',
        'fade-rise-delay-2': 'fadeRise 0.8s ease-out 0.4s both',
      },
    },
  },
  plugins: [],
}
