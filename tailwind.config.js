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
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a5b8fc',
          400: '#8b93f8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        satin: {
          blue: '#4a5568',
          lightBlue: '#718096',
          darkBlue: '#2d3748',
          accent: '#63b3ed',
          silver: '#e2e8f0',
          pearl: '#f7fafc',
          midnight: '#1a202c',
          charcoal: '#2d3748',
        },
        dark: {
          50: '#f7fafc',
          100: '#edf2f7',
          200: '#e2e8f0',
          300: '#cbd5e0',
          400: '#a0aec0',
          500: '#718096',
          600: '#4a5568',
          700: '#2d3748',
          800: '#1a202c',
          900: '#171923',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'slide-down': 'slideDown 0.8s ease-out',
        'scale-in': 'scaleIn 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'satin-glow': 'satinGlow 4s ease-in-out infinite',
        'smooth-bounce': 'smoothBounce 2s ease-in-out infinite',
        'elegant-slide': 'elegantSlide 0.6s ease-out',
        'button-hover': 'buttonHover 0.3s ease-out',
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
        satinGlow: {
          '0%, 100%': { 
            boxShadow: '0 8px 32px rgba(99, 179, 237, 0.1), 0 0 0 1px rgba(99, 179, 237, 0.05)',
          },
          '50%': { 
            boxShadow: '0 12px 40px rgba(99, 179, 237, 0.2), 0 0 0 1px rgba(99, 179, 237, 0.1)',
          },
        },
        smoothBounce: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        elegantSlide: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0px)', opacity: '1' },
        },
        buttonHover: {
          '0%': { transform: 'translateY(0px) scale(1)', boxShadow: '0 4px 12px rgba(99, 179, 237, 0.2)' },
          '100%': { transform: 'translateY(-2px) scale(1.02)', boxShadow: '0 8px 25px rgba(99, 179, 237, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}
