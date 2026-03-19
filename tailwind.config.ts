import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFFDE7',
        charcoal: '#1A237E',
        'sky-blue': '#87CEEB',
        'cloud-white': '#F0F8FF',
        'tokyo-red': '#C62828',
        'tokyo-red-dark': '#B71C1C',
        'tokyo-red-light': '#EF9A9A',
        'warm-gray': '#F3E5AB',
        'mid-gray': '#78909C',
        'soft-border': '#2C1A0E',
        'woody-yellow': '#FFB300',
        'woody-brown': '#8B4513',
        'buzz-purple': '#7B1FA2',
        'cowboy-red': '#C62828',
        'star-gold': '#FFD700',
        'toy-outline': '#2C1A0E',
      },
      fontFamily: {
        sans: ['Nunito', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Bangers', 'cursive'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'drift': 'drift 8s ease-in-out infinite alternate',
        'drift-slow': 'drift 14s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drift: {
          '0%': { transform: 'translateX(-10px)' },
          '100%': { transform: 'translateX(10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
