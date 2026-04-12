/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F6F3EC',
        surface: '#FFFFFF',
        'border-subtle': '#E3DDD2',
        accent: '#4338CA',
        success: '#166534',
      },
      fontFamily: {
        sans: ['"Bricolage Grotesque"', 'sans-serif'],
        display: ['"Fraunces"', 'serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
