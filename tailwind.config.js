/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#6366F1',
        accent: '#FDF2F8',
        cardHighlight: '#EFF6FF',
      },
      boxShadow: {
        'card': '0 8px 28px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 0 3px rgba(59, 130, 246, 0.3)',
        'glow-soft': '0 0 50px rgba(59, 130, 246, 0.2)',
        'glow-pulse': '0 0 80px rgba(59, 130, 246, 0.3)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 50px rgba(59, 130, 246, 0.2)' },
          '50%': { boxShadow: '0 0 80px rgba(59, 130, 246, 0.3)' },
        },
      },
    },
  },
  plugins: [],
};
