/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'hero': ['4.5rem', { lineHeight: '1.1', fontWeight: '500' }],     // 72px
        'h1': ['3rem', { lineHeight: '1.1', fontWeight: '500' }],         // 48px
        'h2': ['2rem', { lineHeight: '1.2', fontWeight: '500' }],         // 32px
        'h3': ['1.5rem', { lineHeight: '1.3', fontWeight: '500' }],       // 24px
        'body': ['1.125rem', { lineHeight: '1.6', fontWeight: '300' }],   // 18px
        'caption': ['0.875rem', { lineHeight: '1.5', fontWeight: '300' }], // 14px
      },
      colors: {
        primary: {
          bg: '#FFFFFF',
          text: '#000000',
        },
        secondary: {
          text: '#666666',
        },
        tertiary: {
          text: '#999999',
        },
        border: {
          gray: '#E5E5E5',
        },
        hover: {
          gray: '#F5F5F5',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'lift': '0 12px 24px rgba(0,0,0,0.1)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.5)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'count-up': 'countUp 1s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        countUp: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      spacing: {
        'section': '10rem',      // 160px
        'section-sm': '7.5rem',  // 120px
        'content': '6.25rem',    // 100px
      },
      maxWidth: {
        'container': '1400px',
        'reading': '800px',
        'content': '65ch',
      },
      gridTemplateColumns: {
        '12': 'repeat(12, minmax(0, 1fr))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};