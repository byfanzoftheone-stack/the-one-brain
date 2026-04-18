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
        cream: {
          50: '#fdf8f0',
          100: '#faf0dc',
          200: '#f5deb3',
          300: '#e8c97a',
        },
        warm: {
          brown: '#5c3d2e',
          gold: '#c9973a',
          rose: '#c47c6a',
          sage: '#7a8c6e',
        },
        carol: {
          primary: '#2d1b0e',
          secondary: '#5c3d2e',
          accent: '#c9973a',
          soft: '#f5deb3',
          muted: '#9b8a7a',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        display: ['Georgia', 'serif'],
        body: ['system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'paper': "url('/paper-texture.svg')",
        'warm-gradient': 'linear-gradient(135deg, #fdf8f0 0%, #faf0dc 50%, #f5deb3 100%)',
      },
      boxShadow: {
        'card': '0 2px 20px rgba(93, 61, 46, 0.12)',
        'card-hover': '0 8px 40px rgba(93, 61, 46, 0.2)',
        'golden': '0 4px 24px rgba(201, 151, 58, 0.3)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
