/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7f7',
          100: '#fef2f2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        pastel: {
          coral: '#FF9AA2',
          peach: '#FFDAC1',
          mint: '#C7FFD8',
          lavender: '#E0BBE4',
          aqua: '#A2E4F5',
          white: '#FDFDFD',
          ivory: '#FAF8F5',
          lilac: '#F8F7FC',
          charcoal: '#1a1a1a',
          darkText: '#2d2d2d',
          mediumText: '#4a4a4a',
          lightText: '#666666',
        },
        background: {
          primary: '#FDFDFD',
          secondary: '#FAF8F5',
          tertiary: '#F8F7FC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'float': 'float 8s ease-in-out infinite',
        'gentle-bounce': 'gentleBounce 2s ease-in-out infinite',
        'pastel-glow': 'pastelGlow 3s ease-in-out infinite',
        'soft-lift': 'softLift 0.3s ease-out',
        'pastel-hover': 'pastelHover 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
        gentleBounce: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pastelGlow: {
          '0%, 100%': { 
            boxShadow: '0 4px 20px rgba(255, 154, 162, 0.15)',
          },
          '50%': { 
            boxShadow: '0 8px 30px rgba(255, 154, 162, 0.25)',
          },
        },
        softLift: {
          '0%': { transform: 'translateY(0px)', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' },
          '100%': { transform: 'translateY(-4px)', boxShadow: '0 8px 25px rgba(255, 154, 162, 0.2)' },
        },
        pastelHover: {
          '0%': { transform: 'scale(1)', backgroundColor: '#FF9AA2' },
          '100%': { transform: 'scale(1.02)', backgroundColor: '#FFDAC1' },
        },
      },
    },
  },
  plugins: [],
}

