/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        lab: {
          bg: '#0a0f1e',
          panel: '#111827',
          card: '#1f2937',
          border: '#374151',
          text: '#f9fafb',
          muted: '#6b7280',
          blue: '#3b82f6',
          cold: '#06b6d4',
          hot: '#ef4444',
          green: '#22c55e',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        panel: '0 10px 40px -10px rgba(0,0,0,0.6)',
        glow: '0 0 24px -4px rgba(59,130,246,0.55)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.35)', opacity: '0' },
          '100%': { transform: 'scale(1.35)', opacity: '0' },
        },
        'flash': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
        'rise': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite',
        flash: 'flash 1s ease-in-out infinite',
        rise: 'rise 0.35s ease-out both',
      },
    },
  },
  plugins: [],
}
