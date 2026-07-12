/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          base: '#040404',
          deep: '#09110A',
        },
        accent: {
          DEFAULT: '#023020',
          soft: '#145A32',
          hover: '#1B4332',
          light: '#2D6A4F',
          glow: '#52B788',
        },
        mist: '#A8B3A2',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backdropBlur: {
        glass: '20px',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        glow: '0 0 40px rgba(82,183,136,0.18)',
        'glow-lg': '0 0 80px rgba(82,183,136,0.28)',
        'inner-glass': 'inset 0 1px 0 rgba(255,255,255,0.08)',
        card: '0 8px 32px rgba(0,0,0,0.5)',
        border: '0 0 0 1px rgba(2,48,32,0.45)',
      },
      keyframes: {
        'float-slow': {
          '0%,100%': { transform: 'translateY(0) translateX(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-18px) translateX(8px) rotate(6deg)' },
        },
        'float-soft': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        twinkle: {
          '0%,100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%,100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'drift-left': {
          '0%': { transform: 'translateX(0) rotate(0)', opacity: '0' },
          '10%': { opacity: '0.8' },
          '90%': { opacity: '0.8' },
          '100%': { transform: 'translateX(-120vw) rotate(360deg)', opacity: '0' },
        },
      },
      animation: {
        'float-slow': 'float-slow 9s ease-in-out infinite',
        'float-soft': 'float-soft 6s ease-in-out infinite',
        twinkle: 'twinkle 4s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 40s linear infinite',
        'drift-left': 'drift-left 22s linear infinite',
      },
    },
  },
  plugins: [],
};
