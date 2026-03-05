/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        akari: '#FF6B9D',
        mina: '#7B68EE',
        sophie: '#D4AF37',
        carlos: '#00CED1',
        surface: {
          DEFAULT: '#0A0A14',
          light: '#1E1B35',
          glass: 'rgba(255,255,255,0.07)',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Noto Serif CJK SC', 'Noto Serif', 'serif'],
        handwriting: ['Caveat', 'Klee One', 'cursive'],
      },
      backgroundImage: {
        'deep-space': 'linear-gradient(180deg, #0F0B1E 0%, #1E1B4B 100%)',
      },
    },
  },
  plugins: [],
};
