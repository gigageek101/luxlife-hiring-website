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
          50: '#fdfdf9',
          100: '#faf8f0',
          200: '#f4f0e1',
          300: '#ede6d2',
          400: '#e6dcc3',
          500: '#d4c5a0', // champagne
          600: '#c2b280',
          700: '#a89660',
          800: '#8e7a40',
          900: '#6b5c30',
        },
        luxury: {
          champagne: '#d4c5a0',
          ivory: '#fefdf8',
          gold: '#c9a96e',
          rose: '#e8d5d0',
          charcoal: '#2c2c2c',
          navy: '#1a1f2e',
          warm: '#0f0f0f',
        },
        dark: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'slide-down': 'slideDown 0.8s ease-out',
        'scale-in': 'scaleIn 0.6s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'elegant-glow': 'elegantGlow 3s ease-in-out infinite',
        'letter-spacing': 'letterSpacing 1s ease-out',
        'soft-lift': 'softLift 0.3s ease-out',
        'underline-expand': 'underlineExpand 0.3s ease-out',
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
        elegantGlow: {
          '0%, 100%': { 
            boxShadow: '0 4px 20px rgba(212, 197, 160, 0.1)',
          },
          '50%': { 
            boxShadow: '0 8px 30px rgba(212, 197, 160, 0.2)',
          },
        },
        letterSpacing: {
          '0%': { letterSpacing: '0em', opacity: '0', transform: 'translateY(20px)' },
          '100%': { letterSpacing: '0.02em', opacity: '1', transform: 'translateY(0)' },
        },
        softLift: {
          '0%': { transform: 'translateY(0px)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' },
          '100%': { transform: 'translateY(-8px)', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)' },
        },
        underlineExpand: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
    },
  },
  plugins: [],
}
