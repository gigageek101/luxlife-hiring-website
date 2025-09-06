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
        // Design system tokens
        'bg': '#FFFFFF',
        'bg-soft': '#FAFAFD',
        'ink': '#1A1A1A',
        'ink-soft': '#4B5563',
        'border': '#E8E8EF',
        'surface': '#FFFFFF',
        
        // Pastel palette
        'pastel-coral': '#FF9AA2',
        'pastel-peach': '#FFD3B6',
        'pastel-mint': '#B8F2D0',
        'pastel-aqua': '#A2E4F5',
        'pastel-lav': '#DCC9FF',
        
        // Brand colors
        'brand': '#FF9AA2',
        'brand-600': '#F77C86',
        'brand-700': '#DF6C75',
        
        // Legacy support
        primary: {
          500: '#FF9AA2',
          600: '#F77C86',
          700: '#DF6C75',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        'h1-mobile': ['36px', { lineHeight: '1.1', fontWeight: '400' }],
        'h1-desktop': ['64px', { lineHeight: '1.1', fontWeight: '400' }],
        'h2-mobile': ['28px', { lineHeight: '1.2', fontWeight: '600' }],
        'h2-desktop': ['40px', { lineHeight: '1.2', fontWeight: '600' }],
        'h3-mobile': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3-desktop': ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.6' }],
        'body-lg': ['18px', { lineHeight: '1.75' }],
        'small': ['14px', { lineHeight: '1.5' }],
      },
      maxWidth: {
        'prose': '68ch',
        'prose-wide': '74ch',
      },
      boxShadow: {
        'surface': '0 10px 30px rgba(20, 20, 40, 0.06)',
        'button': '0 6px 16px rgba(255, 154, 162, 0.25)',
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

