/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'syn-bg': '#0a0a0f',
        'syn-surface': '#12121a',
        'syn-card': '#1a1a2e',
        'syn-border': '#2a2a3e',
        'syn-accent': '#6c63ff',
        'syn-accent2': '#a855f7',
        'syn-accent3': '#06b6d4',
        'syn-green': '#1db954',
        'syn-text': '#e2e8f0',
        'syn-muted': '#8892a4',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-syn': 'linear-gradient(135deg, #6c63ff 0%, #a855f7 50%, #06b6d4 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'equalizer': 'equalizer 1.2s steps(1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        equalizer: {
          '0%':   { height: '4px' },
          '14%':  { height: '16px' },
          '28%':  { height: '8px' },
          '42%':  { height: '24px' },
          '57%':  { height: '12px' },
          '71%':  { height: '20px' },
          '85%':  { height: '6px' },
          '100%': { height: '4px' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
